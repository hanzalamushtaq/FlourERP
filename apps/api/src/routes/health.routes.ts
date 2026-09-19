import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'FlourERP Backend API',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      service: 'FlourERP Backend API',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database error',
      timestamp: new Date().toISOString(),
    });
  }
});
