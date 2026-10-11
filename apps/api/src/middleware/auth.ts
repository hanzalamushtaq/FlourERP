import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { prisma } from '../config/db.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
  fullName: string;
  roleId: string;
  roleName: string;
  pinHash: string | null;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const userCache = new Map<string, { user: AuthenticatedUser; expiresAt: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

export const invalidateUserCache = (userId?: string) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  let payload: any;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session token.',
      },
    });
  }

  // Fast-path: Check memory cache first to avoid ~300ms remote database round-trip
  const cached = userCache.get(payload.userId);
  if (cached && cached.expiresAt > Date.now()) {
    req.user = cached.user;
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      userCache.delete(payload.userId);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account is invalid or deactivated.',
        },
      });
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      pinHash: user.pinHash,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    };

    userCache.set(payload.userId, {
      user: authUser,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    req.user = authUser;
    next();
  } catch (dbError) {
    // Database connection error must never be masked as 401 INVALID_TOKEN
    console.error('Database connection error in requireAuth:', dbError);
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database temporarily unavailable. Please retry.',
      },
    });
  }
};
