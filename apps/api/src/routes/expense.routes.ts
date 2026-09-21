import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { isDayClosed, getLocalDateString } from './closing.routes.js';

export const expenseRouter = Router();

const ExpenseSchema = z.object({
  category: z.enum(['ELECTRICITY', 'LABOR', 'TEA_FOOD', 'MAINTENANCE', 'TRANSPORT', 'MISC']).default('MISC'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  amount: z.number().positive('Expense amount must be greater than 0'),
});

/**
 * POST /api/expenses
 * Record a categorized shop expense with server-assigned timestamp (EXP-01)
 */
expenseRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const todayStr = getLocalDateString();
    if (await isDayClosed(todayStr)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'DAY_CLOSED',
          message: 'Cannot record expenses: Current business day is already closed and locked.',
        },
      });
    }

    const user = (req as any).user;
    const parsed = ExpenseSchema.parse(req.body);

    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          category: parsed.category,
          description: parsed.description.trim(),
          amount: parsed.amount,
          recordedById: user.id,
        },
        include: {
          recordedBy: {
            select: { id: true, fullName: true, username: true },
          },
        },
      });

      // Synchronous activity audit log
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'RECORD_EXPENSE',
          entityType: 'Expense',
          entityId: created.id,
          details: JSON.stringify({
            category: created.category,
            amount: created.amount,
            description: created.description,
          }),
          ipAddress: req.ip,
        },
      });

      return created;
    });

    return res.status(201).json({
      success: true,
      data: { expense },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * GET /api/expenses
 * List expenses with category and date filtering
 */
expenseRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, startDate, endDate } = req.query;

    const whereClause: any = {};
    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        recordedBy: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return res.json({
      success: true,
      data: {
        expenses,
        totalAmount,
        count: expenses.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});
