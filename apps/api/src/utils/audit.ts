import { prisma } from '../config/db.js';

export interface ActivityLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
}

/**
 * Synchronously records an immutable activity_log row for sensitive operations (AUDIT-01)
 */
export async function recordActivityLog(params: ActivityLogParams) {
  try {
    const detailsStr = params.details
      ? typeof params.details === 'string'
        ? params.details
        : JSON.stringify(params.details)
      : null;

    return await prisma.activityLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: detailsStr,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
    // Don't crash caller but ensure error is surfaced in logs
    return null;
  }
}
