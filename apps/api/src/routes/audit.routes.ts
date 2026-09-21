import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

export const auditRouter = Router();

/**
 * GET /api/audit-logs
 * Chronological immutable activity log feed with filtering (AUDIT-01)
 */
auditRouter.get(
  '/',
  requireAuth,
  requirePermission('can_view_reports'),
  async (req: Request, res: Response) => {
    try {
      const {
        action,
        entityType,
        userId,
        startDate,
        endDate,
        page = '1',
        limit = '50',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (action && typeof action === 'string') {
        where.action = action;
      }

      if (entityType && typeof entityType === 'string') {
        where.entityType = entityType;
      }

      if (userId && typeof userId === 'string') {
        where.userId = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate && typeof startDate === 'string') {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.activityLog.count({ where }),
      ]);

      const formatted = logs.map((log) => {
        let detailsObj = null;
        if (log.details) {
          try {
            detailsObj = JSON.parse(log.details);
          } catch {
            detailsObj = log.details;
          }
        }
        return {
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          details: detailsObj,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
          user: log.user
            ? {
                id: log.user.id,
                fullName: log.user.fullName,
                username: log.user.username,
                roleName: log.user.role?.name,
              }
            : null,
        };
      });

      return res.json({
        success: true,
        data: {
          logs: formatted,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }
);
