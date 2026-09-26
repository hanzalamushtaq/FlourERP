import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { isDayClosed, getLocalDateString } from './closing.routes.js';
import { recordActivityLog } from '../utils/audit.js';

export const billingRouter = Router();

// Validation Schemas
const BillItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityKg: z.number().positive('Quantity must be greater than 0'),
  ratePerKg: z.number().optional(), // Can be validated against DB rate
  totalAmount: z.number().nonnegative(),
});

const CreateBillSchema = z.object({
  calculationMode: z.enum(['WEIGHT_TO_AMOUNT', 'AMOUNT_TO_WEIGHT']).default('WEIGHT_TO_AMOUNT'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(BillItemInputSchema).min(1, 'At least one product item is required'),
  discount: z.number().nonnegative().default(0),
  receivedAmount: z.number().nonnegative(),
  paymentMethod: z.enum(['CASH', 'CREDIT']).default('CASH'),
});

/**
 * Generate formatted ESC/POS thermal printer text & command payload (PRINT-01)
 */
function generateEscPosPayload(params: {
  billNumber: number;
  timestamp: Date;
  billerName: string;
  customerName?: string;
  items: Array<{
    nameEn: string;
    nameUr: string;
    quantityKg: number;
    ratePerKg: number;
    totalAmount: number;
  }>;
  subtotal: number;
  discount: number;
  shortDiscount?: number;
  netTotal: number;
  receivedAmount: number;
  changeReturned: number;
  paymentMethod: string;
  prevBalance?: number;
  creditAdded?: number;
  newBalance?: number;
}): { formattedText: string; rawCommandsHex: string } {
  const line = '------------------------------------------';
  const doubleLine = '==========================================';

  const dateStr = params.timestamp.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = params.timestamp.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const header = [
    '             AL-MADINA CHAKKI             ',
    '        Flour Mill & Grinding Service     ',
    '        Main Bazar, Commercial Area       ',
    '              Ph: 0300-1234567            ',
    doubleLine,
    `Bill #: ${String(params.billNumber).padStart(6, '0')}    Date: ${dateStr}`,
    `Time:   ${timeStr}   Biller: ${params.billerName}`,
    params.customerName ? `Cust:   ${params.customerName}` : null,
    line,
    'Item Name           Qty(KG)  Rate    Total',
    line,
  ]
    .filter(Boolean)
    .join('\n');

  const itemLines = params.items.map((item) => {
    const name = (item.nameEn + '                ').slice(0, 17);
    const qty = (item.quantityKg.toFixed(2) + '     ').slice(0, 7);
    const rate = (Math.round(item.ratePerKg) + '     ').slice(0, 6);
    const tot = String(Math.round(item.totalAmount)).padStart(7, ' ');
    return `${name} ${qty} ${rate} ${tot}`;
  });

  const totalDiscount = Math.max(0, Math.round((params.subtotal || 0) - (params.netTotal || 0)));

  const totals = [
    line,
    `Total Bill (کل رقم):              Rs. ${Math.round(params.subtotal)}`,
    (totalDiscount > 0 || (params.paymentMethod === 'CREDIT' && (params.creditAdded || 0) > 0))
      ? `Discount / Credit (رعایت/ادھار): -Rs. ${Math.round(totalDiscount > 0 ? totalDiscount : (params.creditAdded || 0))}`
      : null,
    doubleLine,
    `Cash Received (وصول شدہ نقد):     Rs. ${Math.round(params.receivedAmount)}`,
    params.changeReturned > 0
      ? `Change Returned (بقایا واپسی):    Rs. ${Math.round(params.changeReturned)}`
      : null,
    (params.paymentMethod === 'CREDIT' || (params.newBalance !== undefined && params.newBalance > 0))
      ? [
          line,
          '     * CUSTOMER UDHAAR LEDGER (ادھار کھاتہ) *   ',
          `Current Bill Credit (موجودہ ادھار): Rs. ${Math.round(params.creditAdded ?? (params.netTotal - params.receivedAmount))}`,
          `Previous Balance (سابقہ ادھار):    Rs. ${Math.round(params.prevBalance || 0)}`,
          doubleLine,
          `TOTAL OUTSTANDING (کل ادھار):    Rs. ${Math.round(params.newBalance ?? ((params.prevBalance || 0) + (params.creditAdded ?? (params.netTotal - params.receivedAmount))))}`,
        ].join('\n')
      : null,
    doubleLine,
    '       Thank you for your patronage!      ',
    '   Malik Hanzala Mushtaq & Sons Chakki    ',
    '\n\n\n',
  ]
    .filter(Boolean)
    .join('\n');

  const formattedText = `${header}\n${itemLines.join('\n')}\n${totals}`;

  // ESC/POS control codes:
  // \x1B\x40: Initialize printer
  // \x1B\x61\x01: Center justification
  // \x1D\x56\x41\x10: Cut paper feed
  const rawCommandsHex = Buffer.from(
    `\x1B\x40${formattedText}\x1D\x56\x41\x10`,
    'utf-8'
  ).toString('hex');

  return { formattedText, rawCommandsHex };
}

/**
 * POST /api/bills
 * Create a new bill with atomic sequence locking, rate check, discount RBAC (BILL-01, BILL-02, BILL-03, BILL-04, PRINT-01)
 */
billingRouter.post(
  '/',
  requireAuth,
  requirePermission('can_bill'),
  async (req: Request, res: Response) => {
    try {
      // Day-Lock Guard (CLOSE-01)
      const todayStr = getLocalDateString();
      if (await isDayClosed(todayStr)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DAY_CLOSED',
            message: 'Cannot create bills: Current business day is already closed and locked.',
          },
        });
      }

      const parsed = CreateBillSchema.parse(req.body);
      const user = req.user!;

      // 1. Enforce Discount RBAC Guard (BILL-02)
      if (parsed.discount > 0 && !user.permissions.includes('can_discount')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to apply discretionary discounts (can_discount required).',
          },
        });
      }

      // 2. Enforce Credit RBAC Guard (CRED-01)
      if (parsed.paymentMethod === 'CREDIT' && !user.permissions.includes('can_issue_credit')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to issue bills on credit (can_issue_credit required).',
          },
        });
      }

      // 3. Enforce Rate Guard (BILL-04): Verify all products have rate > 0
      const productIds = parsed.items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      for (const item of parsed.items) {
        let prod = productMap.get(item.productId);
        if (!prod) {
          // Fallback: check if item.productId is a 1-based index (e.g. '1', '2', etc.)
          const allActive = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          });
          const idx = parseInt(item.productId, 10);
          if (!isNaN(idx) && idx >= 1 && idx <= allActive.length) {
            prod = allActive[idx - 1];
            item.productId = prod.id;
            productMap.set(prod.id, prod);
          }
        }
        if (!prod) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: `Product with ID ${item.productId} was not found.`,
            },
          });
        }
        if (!prod.currentRate || prod.currentRate <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'RATE_NOT_SET',
              message: `Rate not set for ${prod.nameEn} (${prod.nameUr}). Cannot create bill.`,
              productId: prod.id,
              productName: prod.nameEn,
            },
          });
        }
      }

      // 4. Calculate Subtotal and Verify Net Totals
      const calculatedItems = parsed.items.map((item) => {
        const prod = productMap.get(item.productId)!;
        const rate = prod.currentRate;
        const total = Math.round(item.quantityKg * rate);
        return {
          productId: prod.id,
          productName: `${prod.nameEn} (${prod.nameUr})`,
          nameEn: prod.nameEn,
          nameUr: prod.nameUr,
          quantityKg: item.quantityKg,
          ratePerKg: rate,
          totalAmount: total,
        };
      });

      const subtotal = calculatedItems.reduce((acc, curr) => acc + curr.totalAmount, 0);
      let discount = Math.min(subtotal, parsed.discount);
      let netTotal = Math.max(0, subtotal - discount);

      // If CASH sale and customer pays less: treat short difference as discount / concession / paid-less
      let shortDiscount = 0;
      if (parsed.paymentMethod === 'CASH' && parsed.receivedAmount > 0 && parsed.receivedAmount < netTotal) {
        shortDiscount = netTotal - parsed.receivedAmount;
        discount += shortDiscount;
        netTotal = parsed.receivedAmount;
      }

      // If CREDIT sale: customer may pay partial cash now (receivedAmount), and the remaining balance is added to credit ledger
      const receivedAmount = Math.max(0, parsed.receivedAmount || 0);
      const actualReceivedForBill = Math.min(netTotal, receivedAmount);
      const debtAmount = parsed.paymentMethod === 'CREDIT' ? Math.max(0, netTotal - actualReceivedForBill) : 0;
      const changeReturned =
        parsed.paymentMethod === 'CREDIT' ? 0 : Math.max(0, receivedAmount - netTotal);

      // 5. Customer Profile Link / Creation (if customer info provided)
      let customerId: string | null = null;
      if (parsed.customerName && parsed.customerName.trim().length > 0) {
        const trimmedName = parsed.customerName.trim();
        let customer = await prisma.customer.findFirst({
          where: { name: trimmedName },
        });
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: trimmedName,
              phone: parsed.customerPhone || null,
            },
          });
        }
        customerId = customer.id;
      }

      // 6. Atomic Transaction for Sequential Bill Number & Bill Creation (BILL-03)
      const newBill = await prisma.$transaction(async (tx) => {
        // Atomic increment of sequence row with exclusive row lock
        const seq = await tx.billSequence.upsert({
          where: { name: 'STANDARD_BILL' },
          update: {
            lastNumber: { increment: 1 },
          },
          create: {
            name: 'STANDARD_BILL',
            lastNumber: 1001,
          },
        });

        const billNumber = seq.lastNumber;

        let prevBalance = 0;
        let debtAmount = 0;
        let newBalance = 0;

        if (parsed.paymentMethod === 'CREDIT' && customerId) {
          const currentCust = await tx.customer.findUnique({ where: { id: customerId } });
          prevBalance = currentCust?.currentBalance || 0;
          debtAmount = Math.max(0, netTotal - actualReceivedForBill);
          newBalance = prevBalance + debtAmount;
        }

        // Generate ESC/POS Payload (PRINT-01) with ledger breakdown and discount
        const printPayloadObj = generateEscPosPayload({
          billNumber,
          timestamp: new Date(),
          billerName: user.fullName,
          customerName: parsed.customerName,
          items: calculatedItems,
          subtotal,
          discount: parsed.discount,
          shortDiscount,
          netTotal,
          receivedAmount: actualReceivedForBill,
          changeReturned,
          paymentMethod: parsed.paymentMethod,
          prevBalance,
          creditAdded: debtAmount,
          newBalance,
        });

        // Insert Bill
        const bill = await tx.bill.create({
          data: {
            billNumber,
            customerId,
            customerName: parsed.customerName || null,
            customerPhone: parsed.customerPhone || null,
            billerId: user.id,
            calculationMode: parsed.calculationMode,
            subtotal,
            discount,
            netTotal,
            receivedAmount: actualReceivedForBill,
            changeReturned,
            paymentMethod: parsed.paymentMethod,
            status: parsed.paymentMethod === 'CREDIT' ? 'CREDIT' : 'PAID',
            printPayload: JSON.stringify(printPayloadObj),
            items: {
              create: calculatedItems.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantityKg: item.quantityKg,
                ratePerKg: item.ratePerKg,
                totalAmount: item.totalAmount,
              })),
            },
          },
          include: {
            items: true,
            biller: { select: { id: true, fullName: true, username: true } },
          },
        });

        // Record Ledger Entry if Credit Bill (LEDGER-01, CRED-01)
        if (parsed.paymentMethod === 'CREDIT' && customerId) {
          await tx.customer.update({
            where: { id: customerId },
            data: { currentBalance: newBalance },
          });

          const itemSummary = calculatedItems.map((i) => `${i.quantityKg} KG ${i.nameUr || i.nameEn}`).join(', ');

          await tx.ledgerEntry.create({
            data: {
              customerId,
              billId: bill.id,
              type: 'DEBIT_PURCHASE',
              amount: debtAmount,
              description: `بل #${billNumber} - ${itemSummary}`,
              balanceAfter: newBalance,
              recordedById: user.id,
            },
          });
        }

        // Record Audit Log
        await tx.activityLog.create({
          data: {
            userId: user.id,
            action: 'CREATE_BILL',
            entityType: 'Bill',
            entityId: bill.id,
            details: JSON.stringify({
              billNumber,
              netTotal,
              discount,
              shortDiscount,
              paymentMethod: parsed.paymentMethod,
              itemsCount: calculatedItems.length,
            }),
            ipAddress: req.ip,
          },
        });

        if (discount > 0) {
          await tx.activityLog.create({
            data: {
              userId: user.id,
              action: 'DISCOUNT_APPLIED',
              entityType: 'Bill',
              entityId: bill.id,
              details: JSON.stringify({
                billNumber: bill.billNumber,
                discount,
                shortDiscount,
                netTotal,
              }),
              ipAddress: req.ip,
            },
          });
        }

        return {
          ...bill,
          printPayloadParsed: printPayloadObj,
          customerLedger: parsed.paymentMethod === 'CREDIT' ? {
            prevBalance,
            creditAdded: debtAmount,
            newTotalBalance: newBalance,
          } : null,
          shortDiscount,
        };
      });

      return res.status(201).json({
        success: true,
        data: {
          bill: newBill,
          customerLedger: newBill.customerLedger,
          shortDiscount: newBill.shortDiscount,
          message: `Bill #${newBill.billNumber} generated successfully`,
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
 * GET /api/bills
 * Retrieve recent bills with pagination and filtering
 */
billingRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', customerId, date } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    const where: any = {};
    if (customerId) where.customerId = customerId as string;
    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          items: true,
          biller: { select: { id: true, fullName: true, username: true } },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bill.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        bills,
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
});

/**
 * GET /api/bills/:id/reprint
 * Thermal reprint: returns identical stored print payload without altering records (PRINT-02)
 */
billingRouter.get('/:id/reprint', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Search by UUID or by billNumber
    const isNum = !isNaN(Number(id));
    const bill = await prisma.bill.findFirst({
      where: isNum ? { billNumber: Number(id) } : { id },
      include: {
        items: true,
        biller: { select: { id: true, fullName: true } },
      },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Bill not found for reprint' },
      });
    }

    let printPayload = null;
    if (bill.printPayload) {
      try {
        printPayload = JSON.parse(bill.printPayload);
      } catch {
        printPayload = { formattedText: bill.printPayload };
      }
    }

    // Log reprint event in audit activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'REPRINT_BILL',
        entityType: 'Bill',
        entityId: bill.id,
        details: JSON.stringify({ billNumber: bill.billNumber, reprintTime: new Date() }),
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      data: {
        billNumber: bill.billNumber,
        timestamp: bill.createdAt,
        billerName: bill.biller.fullName,
        customerName: bill.customerName,
        subtotal: bill.subtotal,
        discount: bill.discount,
        netTotal: bill.netTotal,
        receivedAmount: bill.receivedAmount,
        changeReturned: bill.changeReturned,
        items: bill.items,
        printPayload,
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
 * GET /api/bills/:id
 * Retrieve single bill by UUID or billNumber
 */
billingRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));
    const bill = await prisma.bill.findFirst({
      where: isNum ? { billNumber: Number(id) } : { id },
      include: {
        items: true,
        biller: { select: { id: true, fullName: true, username: true } },
        customer: true,
      },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Bill not found' },
      });
    }

    return res.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * PATCH /api/bills/:id
 * Update bill customer details
 */
billingRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerName, customerPhone } = req.body;

    const isNum = !isNaN(Number(id));
    const bill = await prisma.bill.findFirst({
      where: isNum ? { billNumber: Number(id) } : { id },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Bill not found' },
      });
    }

    const updated = await prisma.bill.update({
      where: { id: bill.id },
      data: {
        ...(customerName !== undefined ? { customerName: customerName.trim() } : {}),
        ...(customerPhone !== undefined ? { customerPhone: customerPhone.trim() } : {}),
      },
      include: {
        items: true,
        biller: { select: { id: true, fullName: true, username: true } },
      },
    });

    await recordActivityLog({
      userId: req.user!.id,
      action: 'UPDATE_BILL',
      entityType: 'Bill',
      entityId: bill.id,
      details: {
        billNumber: bill.billNumber,
        customerName,
        customerPhone,
      },
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Bill updated successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * POST /api/bills/:id/void
 * Admin void endpoint for standard bills (VOID-01)
 */
billingRouter.post(
  '/:id/void',
  requireAuth,
  requirePermission('can_void_bills'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Void reason is required' },
        });
      }

      const isNum = !isNaN(Number(id));
      const bill = await prisma.bill.findFirst({
        where: isNum ? { billNumber: Number(id) } : { id },
        include: { customer: true },
      });

      if (!bill) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bill not found' },
        });
      }

      if (bill.status === 'VOIDED') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VOIDED', message: 'Bill is already voided' },
        });
      }

      // Check day-lock: cannot void bills from a closed business day
      const billDate = getLocalDateString(bill.createdAt);
      if (await isDayClosed(billDate)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DAY_CLOSED',
            message: `Cannot void bills from closed business day ${billDate}.`,
          },
        });
      }

      const voidedBill = await prisma.$transaction(async (tx) => {
        // 1. Mark bill as VOIDED
        const updated = await tx.bill.update({
          where: { id: bill.id },
          data: {
            status: 'VOIDED',
            voidReason: reason.trim(),
            voidedById: req.user!.id,
            voidedAt: new Date(),
          },
        });

        // 2. If this was a CREDIT bill and has a customer, reverse the ledger balance
        if (bill.paymentMethod === 'CREDIT' && bill.customerId) {
          const customer = await tx.customer.findUnique({
            where: { id: bill.customerId },
          });

          if (customer) {
            const debtToReverse = Math.max(0, bill.netTotal - bill.receivedAmount);
            const newBalance = customer.currentBalance - debtToReverse;
            await tx.customer.update({
              where: { id: customer.id },
              data: { currentBalance: newBalance },
            });

            await tx.ledgerEntry.create({
              data: {
                customerId: customer.id,
                billId: bill.id,
                type: 'ADJUSTMENT',
                amount: debtToReverse,
                description: `منسوخی بل #${bill.billNumber}: ${reason.trim()} (Void Bill)`,
                balanceAfter: newBalance,
                recordedById: req.user!.id,
              },
            });
          }
        }

        return updated;
      });

      // Synchronously record activity log (AUDIT-01)
      await recordActivityLog({
        userId: req.user!.id,
        action: 'VOID_BILL',
        entityType: 'Bill',
        entityId: bill.id,
        details: {
          billNumber: bill.billNumber,
          reason: reason.trim(),
          amount: bill.netTotal,
          paymentMethod: bill.paymentMethod,
          customerId: bill.customerId,
        },
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        data: {
          bill: voidedBill,
          message: `Bill #${bill.billNumber} successfully voided`,
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

