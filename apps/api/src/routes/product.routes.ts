import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

export const productRouter = Router();

// Validation Schemas
const CreateProductSchema = z.object({
  nameEn: z.string().min(2, 'English name must be at least 2 characters'),
  nameUr: z.string().min(2, 'Urdu name must be at least 2 characters'),
  unit: z.string().default('KG'),
  currentRate: z.number().nonnegative('Rate must be non-negative').default(0),
  isActive: z.boolean().default(true),
});

const UpdateProductSchema = z.object({
  nameEn: z.string().min(2).optional(),
  nameUr: z.string().min(2).optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

const UpdateRateSchema = z.object({
  newRate: z.number().positive('Rate must be greater than 0'),
  reason: z.string().optional(),
});

/**
 * GET /api/products
 * Public / Authenticated: Returns product catalog list
 */
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    const whereClause: { isActive?: boolean } = {};

    if (active === 'true') {
      whereClause.isActive = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * POST /api/products
 * Admin only: Create a new product (CAT-01)
 */
productRouter.post(
  '/',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const parsed = CreateProductSchema.parse(req.body);

      const product = await prisma.product.create({
        data: {
          nameEn: parsed.nameEn,
          nameUr: parsed.nameUr,
          unit: parsed.unit,
          currentRate: parsed.currentRate,
          isActive: parsed.isActive,
        },
      });

      // Record initial price history if rate > 0
      if (parsed.currentRate > 0) {
        await prisma.priceHistory.create({
          data: {
            productId: product.id,
            oldRate: 0,
            newRate: parsed.currentRate,
            changedById: req.user!.id,
            reason: 'Product creation initial rate',
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          action: 'CREATE_PRODUCT',
          entityType: 'Product',
          entityId: product.id,
          details: JSON.stringify({ nameEn: product.nameEn, rate: product.currentRate }),
          ipAddress: req.ip,
        },
      });

      return res.status(201).json({
        success: true,
        data: { product },
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
 * PUT /api/products/:id
 * Admin only: Update product details or activate/deactivate (CAT-01)
 */
productRouter.put(
  '/:id',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = UpdateProductSchema.parse(req.body);

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: parsed,
      });

      await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_PRODUCT',
          entityType: 'Product',
          entityId: updated.id,
          details: JSON.stringify(parsed),
          ipAddress: req.ip,
        },
      });

      return res.json({
        success: true,
        data: { product: updated },
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
 * PATCH /api/products/:id/rate
 * Admin only: Update per-KG rate with price_history tracking (PRICE-01)
 */
productRouter.patch(
  '/:id/rate',
  requireAuth,
  requirePermission('can_manage_prices'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = UpdateRateSchema.parse(req.body);

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
      }

      const oldRate = existing.currentRate;
      const newRate = parsed.newRate;

      // Update product rate and write to price_history atomically
      const [updatedProduct, historyEntry] = await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: { currentRate: newRate },
        }),
        prisma.priceHistory.create({
          data: {
            productId: id,
            oldRate,
            newRate,
            changedById: req.user!.id,
            reason: parsed.reason || 'Manual rate adjustment',
          },
        }),
        prisma.activityLog.create({
          data: {
            userId: req.user!.id,
            action: 'UPDATE_RATE',
            entityType: 'Product',
            entityId: id,
            details: JSON.stringify({ oldRate, newRate, reason: parsed.reason }),
            ipAddress: req.ip,
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          product: updatedProduct,
          history: historyEntry,
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
 * GET /api/products/:id/history
 * Fetch historical price adjustments for a product
 */
productRouter.get(
  '/:id/history',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const history = await prisma.priceHistory.findMany({
        where: { productId: id },
        include: {
          changedBy: {
            select: { id: true, fullName: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: { history },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }
);
