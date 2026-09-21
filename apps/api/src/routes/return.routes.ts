import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

export const returnRouter = Router();

const ReturnItemSchema = z.object({
  productId: z.string().optional(),
  quantityKg: z.number().positive().optional(),
  returnRate: z.number().positive().optional(),
  refundAmount: z.number().positive().optional(),
});

const ReturnSchema = z.object({
  billId: z.string().optional(),
  pisaiId: z.string().optional(),
  customerId: z.string().optional(),
  amount: z.number().positive('Return amount must be greater than 0').optional(),
  items: z.array(ReturnItemSchema).optional(),
  reason: z.string().min(2, 'Return reason is required'),
  refundMethod: z.enum(['CASH', 'CREDIT_OFFSET']).default('CASH'),
}).refine((data) => data.amount !== undefined || (data.items && data.items.length > 0), {
  message: 'Return amount or items must be provided',
});

/**
 * POST /api/returns
 * Process a product or Pisai return with financial/ledger offsets (RET-01)
 */
returnRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const parsed = ReturnSchema.parse(req.body);
    const returnAmount = parsed.amount ?? (parsed.items ? parsed.items.reduce((sum, item) => sum + (item.refundAmount || 0), 0) : 0);
    if (returnAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Return amount must be greater than 0' },
      });
    }

    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;

    const result = await prisma.$transaction(async (tx) => {
      let resolvedCustomerId = parsed.customerId || null;

      // If billId provided, resolve bill and customer
      if (parsed.billId) {
        const bill = await tx.bill.findUnique({ where: { id: parsed.billId } });
        if (bill && bill.customerId && !resolvedCustomerId) {
          resolvedCustomerId = bill.customerId;
        }
      }

      // If pisaiId provided, resolve customer
      if (parsed.pisaiId) {
        const pisai = await tx.pisaiRecord.findUnique({ where: { id: parsed.pisaiId } });
        if (pisai && pisai.customerId && !resolvedCustomerId) {
          resolvedCustomerId = pisai.customerId;
        }
      }

      // If credit offset, update customer balance and add ledger entry
      if (parsed.refundMethod === 'CREDIT_OFFSET' && resolvedCustomerId) {
        const customer = await tx.customer.findUnique({ where: { id: resolvedCustomerId } });
        if (customer) {
          const newBalance = customer.currentBalance - returnAmount;
          await tx.customer.update({
            where: { id: resolvedCustomerId },
            data: { currentBalance: newBalance },
          });

          await tx.ledgerEntry.create({
            data: {
              customerId: resolvedCustomerId,
              billId: parsed.billId || null,
              pisaiId: parsed.pisaiId || null,
              type: 'CREDIT_PAYMENT',
              amount: returnAmount,
              description: `واپسی مال کھاتہ ایڈجسٹمنٹ (${returnNumber}): ${parsed.reason}`,
              balanceAfter: newBalance,
              recordedById: user.id,
            },
          });
        }
      }

      // Create BillReturn record
      const billReturn = await tx.billReturn.create({
        data: {
          returnNumber,
          billId: parsed.billId || null,
          pisaiId: parsed.pisaiId || null,
          customerId: resolvedCustomerId,
          amount: returnAmount,
          reason: parsed.reason.trim(),
          refundMethod: parsed.refundMethod,
          recordedById: user.id,
        },
        include: {
          customer: true,
          bill: true,
          pisaiRecord: true,
          recordedBy: { select: { id: true, fullName: true, username: true } },
        },
      });

      // Audit Log
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'PROCESS_RETURN',
          entityType: 'BillReturn',
          entityId: billReturn.id,
          details: JSON.stringify({
            returnNumber,
            amount: returnAmount,
            refundMethod: parsed.refundMethod,
            reason: parsed.reason,
          }),
          ipAddress: req.ip,
        },
      });

      return billReturn;
    });

    return res.status(201).json({
      success: true,
      data: { billReturn: result },
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
 * GET /api/returns
 * List returns
 */
returnRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const returns = await prisma.billReturn.findMany({
      include: {
        customer: true,
        bill: true,
        pisaiRecord: true,
        recordedBy: { select: { id: true, fullName: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = returns.reduce((sum, r) => sum + r.amount, 0);

    return res.json({
      success: true,
      data: {
        returns,
        totalAmount,
        count: returns.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});
