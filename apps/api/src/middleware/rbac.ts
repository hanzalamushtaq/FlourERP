import { Request, Response, NextFunction } from 'express';

export const requirePermission = (permissionCode: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const hasPermission = req.user.permissions.includes(permissionCode);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Access denied. Required permission: '${permissionCode}'`,
          requiredPermission: permissionCode,
        },
      });
    }

    next();
  };
};
