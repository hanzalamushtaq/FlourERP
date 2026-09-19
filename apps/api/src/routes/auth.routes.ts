import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { comparePassword, comparePin, signToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const VerifyPinSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const { username, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase().trim() },
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
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password.',
      },
    });
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password.',
      },
    });
  }

  const permissions = user.role.permissions.map((rp) => rp.permission.code);
  const token = signToken({
    userId: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role.name,
  });

  // Log login activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: JSON.stringify({ username: user.username, role: user.role.name }),
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role.name,
        permissions,
        hasPin: Boolean(user.pinHash),
      },
    },
  });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.roleName,
        permissions: user.permissions,
        hasPin: Boolean(user.pinHash),
      },
    },
  });
});

// POST /api/auth/verify-pin
authRouter.post('/verify-pin', requireAuth, async (req: Request, res: Response) => {
  const result = VerifyPinSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const { pin } = result.data;
  const user = req.user!;

  if (!user.pinHash) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_PIN_CONFIGURED',
        message: 'No security PIN has been set for this account.',
      },
    });
  }

  const isPinValid = await comparePin(pin, user.pinHash);
  if (!isPinValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_PIN',
        message: 'Incorrect 4-digit PIN.',
      },
    });
  }

  // Log PIN unlock activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'PIN_UNLOCKED',
      entityType: 'AUTH',
      entityId: user.id,
      details: JSON.stringify({ action: 'idle_lock_unlocked' }),
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    data: {
      unlocked: true,
      message: 'Terminal unlocked successfully.',
    },
  });
});

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGOUT',
      entityType: 'AUTH',
      entityId: user.id,
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    data: {
      message: 'Logged out successfully.',
    },
  });
});
