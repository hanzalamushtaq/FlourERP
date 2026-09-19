import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

export const permissionRouter = Router();

// GET /api/permissions - List all system permissions
permissionRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ category: 'asc' }, { code: 'asc' }],
  });

  res.json({
    success: true,
    data: permissions,
  });
});
