import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

export const priceRouter = Router();

const DailyConfirmSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: z.string(),
        rate: z.number().positive(),
      })
    )
    .optional(),
  notes: z.string().optional(),
});

const PriceChangeRequestSchema = z.object({
  productId: z.string(),
  requestedRate: z.number().positive('Requested rate must be greater than 0'),
  holdBillData: z.any().optional(),
});

const ReviewRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

/**
 * Helper to get today's date string in YYYY-MM-DD
 */
function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/prices/daily-status
 * Check if today's daily prices have been confirmed (PRICE-02)
 */
priceRouter.get('/daily-status', requireAuth, async (_req: Request, res: Response) => {
  try {
    const today = getTodayDateString();

    const confirmation = await prisma.dailyPriceConfirmation.findUnique({
      where: { confirmationDate: today },
      include: {
        confirmedBy: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        nameUr: true,
        unit: true,
        currentRate: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: {
        date: today,
        isConfirmedToday: !!confirmation,
        confirmation: confirmation || null,
        products,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * POST /api/prices/daily-confirm
 * Admin confirms today's prices (PRICE-02)
 */
priceRouter.post(
  '/daily-confirm',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const parsed = DailyConfirmSchema.parse(req.body);
      const today = getTodayDateString();
      const userId = req.user!.id;

      const result = await prisma.$transaction(async (tx) => {
        // Apply any price updates requested during confirmation
        if (parsed.updates && parsed.updates.length > 0) {
          for (const item of parsed.updates) {
            const current = await tx.product.findUnique({ where: { id: item.productId } });
            if (current && current.currentRate !== item.rate) {
              await tx.product.update({
                where: { id: item.productId },
                data: { currentRate: item.rate },
              });

              await tx.priceHistory.create({
                data: {
                  productId: item.productId,
                  oldRate: current.currentRate,
                  newRate: item.rate,
                  changedById: userId,
                  reason: 'Daily price confirmation update',
                },
              });
            }
          }
        }

        // Upsert daily confirmation record
        const confirmation = await tx.dailyPriceConfirmation.upsert({
          where: { confirmationDate: today },
          update: {
            confirmedById: userId,
            notes: parsed.notes || 'Confirmed via daily price check',
            createdAt: new Date(),
          },
          create: {
            confirmationDate: today,
            confirmedById: userId,
            notes: parsed.notes || 'Confirmed via daily price check',
          },
        });

        await tx.activityLog.create({
          data: {
            userId,
            action: 'CONFIRM_DAILY_PRICES',
            entityType: 'DailyPriceConfirmation',
            entityId: confirmation.id,
            details: JSON.stringify({ date: today, updatesCount: parsed.updates?.length || 0 }),
            ipAddress: req.ip,
          },
        });

        return confirmation;
      });

      return res.json({
        success: true,
        data: {
          confirmation: result,
          message: 'Daily rates confirmed successfully',
        },
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
  }
);

/**
 * POST /api/prices/request-change
 * Counter Biller requests a price change (holds pending bill or notifies admin) (PRICE-03)
 */
priceRouter.post('/request-change', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = PriceChangeRequestSchema.parse(req.body);
    const billerId = req.user!.id;

    const product = await prisma.product.findUnique({ where: { id: parsed.productId } });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const request = await prisma.priceChangeRequest.create({
      data: {
        productId: parsed.productId,
        requestedRate: parsed.requestedRate,
        billerId,
        status: 'PENDING',
        holdBillData: parsed.holdBillData ? JSON.stringify(parsed.holdBillData) : null,
      },
      include: {
        product: { select: { id: true, nameEn: true, nameUr: true, currentRate: true } },
        biller: { select: { id: true, fullName: true, username: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: billerId,
        action: 'REQUEST_PRICE_CHANGE',
        entityType: 'PriceChangeRequest',
        entityId: request.id,
        details: JSON.stringify({
          productId: parsed.productId,
          currentRate: product.currentRate,
          requestedRate: parsed.requestedRate,
          hasHoldBill: !!parsed.holdBillData,
        }),
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        request,
        message: 'Price change request submitted to Administrator',
      },
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
 * GET /api/prices/requests
 * Admin lists price change requests (PRICE-03)
 */
priceRouter.get(
  '/requests',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const whereClause: { status?: string } = {};
      if (typeof status === 'string') {
        whereClause.status = status;
      }

      const requests = await prisma.priceChangeRequest.findMany({
        where: whereClause,
        include: {
          product: { select: { id: true, nameEn: true, nameUr: true, currentRate: true } },
          biller: { select: { id: true, fullName: true, username: true } },
          reviewedBy: { select: { id: true, fullName: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: { requests },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }
);

/**
 * PATCH /api/prices/requests/:id
 * Admin approves or rejects a price change request (PRICE-03)
 */
priceRouter.patch(
  '/requests/:id',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = ReviewRequestSchema.parse(req.body);
      const adminId = req.user!.id;

      const request = await prisma.priceChangeRequest.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Price change request not found' },
        });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_REVIEWED', message: `Request is already ${request.status}` },
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        if (parsed.status === 'APPROVED') {
          // Update product rate and write to price_history
          await tx.product.update({
            where: { id: request.productId },
            data: { currentRate: request.requestedRate },
          });

          await tx.priceHistory.create({
            data: {
              productId: request.productId,
              oldRate: request.product.currentRate,
              newRate: request.requestedRate,
              changedById: adminId,
              reason: `Approved biller price request #${request.id.slice(0, 8)}`,
            },
          });
        }

        const updatedRequest = await tx.priceChangeRequest.update({
          where: { id },
          data: {
            status: parsed.status,
            reviewedById: adminId,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: adminId,
            action: parsed.status === 'APPROVED' ? 'APPROVE_PRICE_REQUEST' : 'REJECT_PRICE_REQUEST',
            entityType: 'PriceChangeRequest',
            entityId: id,
            details: JSON.stringify({ status: parsed.status, productId: request.productId }),
            ipAddress: req.ip,
          },
        });

        return updatedRequest;
      });

      return res.json({
        success: true,
        data: {
          request: result,
          message: `Price request ${parsed.status.toLowerCase()} successfully`,
        },
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
  }
);
