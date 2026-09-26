import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { isDayClosed, getLocalDateString } from './closing.routes.js';
import { recordActivityLog } from '../utils/audit.js';

export const pisaiRouter = Router();

const CreatePisaiTicketSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  serviceType: z.enum(['SAFAI_PISAI', 'PISAI_ONLY']).default('SAFAI_PISAI'),
  weightKg: z.number().positive('Wheat weight must be greater than 0'),
  ratePerKg: z.number().nonnegative().optional(),
  feeAmount: z.number().positive('Fee amount must be greater than 0'),
  discount: z.number().nonnegative().default(0),
  receivedAmount: z.number().nonnegative(),
  paymentMethod: z.enum(['CASH', 'CREDIT']).default('CASH'),
});

/**
 * Generate large-format ESC/POS thermal ticket emphasizing token number (PISAI-04)
 */
function generateLargeFormatPisaiTicket(params: {
  tokenFormatted: string;
  timestamp: Date;
  billerName: string;
  customerName?: string;
  customerPhone?: string;
  serviceType: string;
  weightKg: number;
  ratePerKg: number;
  feeAmount: number;
  discount: number;
  netTotal: number;
  receivedAmount: number;
  changeReturned: number;
  paymentMethod: string;
}): { formattedText: string; rawCommandsHex: string } {
  const line = '------------------------------------------';
  const doubleLine = '==========================================';
  const starBorder = '******************************************';

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

  const serviceLabelEn =
    params.serviceType === 'SAFAI_PISAI' ? 'Safai + Pisai (Clean & Grind)' : 'Pisai Only (Grind Only)';
  const serviceLabelUr =
    params.serviceType === 'SAFAI_PISAI' ? 'صفائی و پسائی' : 'صرف پسائی';

  const header = [
    '             AL-MADINA CHAKKI             ',
    '       Wheat Grinding & Flour Mill        ',
    '       Main Bazar, Commercial Area        ',
    '             Ph: 0300-1234567             ',
    doubleLine,
    starBorder,
    '*                                        *',
    '*         CUSTOMER TOKEN NUMBER          *',
    '*                                        *',
    `*               [ ${params.tokenFormatted} ]               *`,
    '*                                        *',
    starBorder,
    '',
    `Service:    ${serviceLabelEn}`,
    `            (${serviceLabelUr})`,
    `Weight:     ${params.weightKg.toFixed(2)} KG (گندم)`,
    `Fee Rate:   Rs. ${Math.round(params.ratePerKg)} / KG`,
    line,
    `Gross Fee:                        Rs. ${Math.round(params.feeAmount)}`,
    params.discount > 0
      ? `Discount:                        -Rs. ${Math.round(params.discount)}`
      : null,
    doubleLine,
    `NET CHARGE:                       Rs. ${Math.round(params.netTotal)}`,
    `Payment Mode:                     ${params.paymentMethod}`,
    `Cash Received:                    Rs. ${Math.round(params.receivedAmount)}`,
    params.changeReturned > 0
      ? `Change Returned:                  Rs. ${Math.round(params.changeReturned)}`
      : null,
    line,
    params.customerName ? `Customer:   ${params.customerName}` : null,
    params.customerPhone ? `Phone:      ${params.customerPhone}` : null,
    `Date/Time:  ${dateStr} ${timeStr}`,
    `Biller:     ${params.billerName}`,
    doubleLine,
    '    Please keep this ticket for pickup!   ',
    '         چکی سے آٹا وصولی کے وقت یہ       ',
    '         ٹوکن پرچی ساتھ لانا لازمی ہے۔    ',
    '\n\n\n',
  ]
    .filter((line) => line !== null)
    .join('\n');

  // ESC/POS commands with double-size token enhancement
  const rawCommandsHex = Buffer.from(
    `\x1B\x40${header}\x1D\x56\x41\x10`,
    'utf-8'
  ).toString('hex');

  return { formattedText: header, rawCommandsHex };
}

/**
 * POST /api/pisai
 * Create grinding ticket with 4-digit monotonic token and RBAC guards (PISAI-01 to PISAI-05)
 */
pisaiRouter.post(
  '/',
  requireAuth,
  requirePermission('can_pisai'),
  async (req: Request, res: Response) => {
    try {
      // Day-Lock Guard (CLOSE-01)
      const todayStr = getLocalDateString();
      if (await isDayClosed(todayStr)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DAY_CLOSED',
            message: 'Cannot create grinding tickets: Current business day is already closed and locked.',
          },
        });
      }

      const parsed = CreatePisaiTicketSchema.parse(req.body);
      const user = req.user!;

      // 1. Enforce Discount RBAC Guard (PISAI-05)
      if (parsed.discount > 0 && !user.permissions.includes('can_discount')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to apply discretionary discounts on grinding fees.',
          },
        });
      }

      // 2. Enforce Credit RBAC Guard (PISAI-05)
      if (parsed.paymentMethod === 'CREDIT' && !user.permissions.includes('can_issue_credit')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to issue grinding tickets on credit.',
          },
        });
      }

      const discount = Math.min(parsed.feeAmount, parsed.discount);
      const netTotal = Math.max(0, parsed.feeAmount - discount);
      const receivedAmount = Math.max(0, parsed.receivedAmount || 0);
      const actualReceivedForTicket = Math.min(netTotal, receivedAmount);
      const debtAmount = parsed.paymentMethod === 'CREDIT' ? Math.max(0, netTotal - actualReceivedForTicket) : 0;
      const changeReturned =
        parsed.paymentMethod === 'CREDIT' ? 0 : Math.max(0, receivedAmount - netTotal);
      const calculatedRate = parsed.ratePerKg || Math.round(parsed.feeAmount / parsed.weightKg);

      // 3. Customer Profile Link / Creation
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

      // 4. Atomic Transaction for 4-Digit Monotonic Sequential Token (PISAI-03)
      const ticket = await prisma.$transaction(async (tx) => {
        // Atomic row lock and increment on PISAI_TOKEN sequence
        const seq = await tx.billSequence.upsert({
          where: { name: 'PISAI_TOKEN' },
          update: {
            lastNumber: { increment: 1 },
          },
          create: {
            name: 'PISAI_TOKEN',
            lastNumber: 101,
          },
        });

        const tokenNumber = seq.lastNumber;
        const tokenFormatted = String(tokenNumber).padStart(4, '0');

        // Generate Large-Format Thermal Ticket Payload (PISAI-04)
        const printPayloadObj = generateLargeFormatPisaiTicket({
          tokenFormatted,
          timestamp: new Date(),
          billerName: user.fullName,
          customerName: parsed.customerName,
          customerPhone: parsed.customerPhone,
          serviceType: parsed.serviceType,
          weightKg: parsed.weightKg,
          ratePerKg: calculatedRate,
          feeAmount: parsed.feeAmount,
          discount,
          netTotal,
          receivedAmount,
          changeReturned,
          paymentMethod: parsed.paymentMethod,
        });

        // Insert PisaiRecord
        const record = await tx.pisaiRecord.create({
          data: {
            tokenNumber,
            tokenFormatted,
            customerId,
            customerName: parsed.customerName || null,
            customerPhone: parsed.customerPhone || null,
            billerId: user.id,
            serviceType: parsed.serviceType,
            weightKg: parsed.weightKg,
            ratePerKg: calculatedRate,
            feeAmount: parsed.feeAmount,
            discount,
            netTotal,
            receivedAmount: actualReceivedForTicket,
            changeReturned,
            paymentMethod: parsed.paymentMethod,
            status: parsed.paymentMethod === 'CREDIT' ? 'CREDIT' : 'PAID',
            printPayload: JSON.stringify(printPayloadObj),
          },
          include: {
            biller: { select: { id: true, fullName: true, username: true } },
            customer: true,
          },
        });

        // Record Ledger Entry if Credit Pisai Ticket (LEDGER-01, CRED-01)
        if (parsed.paymentMethod === 'CREDIT' && customerId) {
          const currentCust = await tx.customer.findUnique({ where: { id: customerId } });
          const prevBalance = currentCust?.currentBalance || 0;
          const debtAmount = Math.max(0, netTotal - actualReceivedForTicket);
          const newBalance = prevBalance + debtAmount;

          await tx.customer.update({
            where: { id: customerId },
            data: { currentBalance: newBalance },
          });

          const sName = parsed.serviceType === 'SAFAI_PISAI' ? 'صفائی و پسائی' : 'صرف پسائی';

          await tx.ledgerEntry.create({
            data: {
              customerId,
              pisaiId: record.id,
              type: 'DEBIT_PURCHASE',
              amount: debtAmount,
              description: `پسائی ٹوکن #${tokenFormatted} - ${parsed.weightKg} KG ${sName}`,
              balanceAfter: newBalance,
              recordedById: user.id,
            },
          });
        }

        // Audit log
        await tx.activityLog.create({
          data: {
            userId: user.id,
            action: 'CREATE_PISAI_TICKET',
            entityType: 'PisaiRecord',
            entityId: record.id,
            details: JSON.stringify({
              tokenNumber,
              tokenFormatted,
              weightKg: parsed.weightKg,
              netTotal,
              serviceType: parsed.serviceType,
            }),
            ipAddress: req.ip,
          },
        });

        return {
          ...record,
          printPayloadParsed: printPayloadObj,
        };
      });

      return res.status(201).json({
        success: true,
        data: {
          ticket,
          message: `Grinding Ticket #${ticket.tokenFormatted} generated successfully`,
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
 * GET /api/pisai
 * Retrieve recent grinding tickets with pagination and filtering
 */
pisaiRouter.get('/', requireAuth, async (req: Request, res: Response) => {
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

    const [tickets, total] = await Promise.all([
      prisma.pisaiRecord.findMany({
        where,
        include: {
          biller: { select: { id: true, fullName: true, username: true } },
          customer: true,
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pisaiRecord.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        tickets,
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
 * GET /api/pisai/queue
 * Returns milling tokens for queue dashboard with filter option (ALL, IN_QUEUE, DELIVERED)
 */
pisaiRouter.get('/queue', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 50;

    const where: any = {
      status: { not: 'VOIDED' },
    };

    if (status && status !== 'ALL') {
      where.deliveryStatus = status;
    }

    const records = await prisma.pisaiRecord.findMany({
      where,
      include: {
        biller: { select: { id: true, fullName: true, username: true } },
        customer: true,
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: {
        records,
        count: records.length,
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
 * GET /api/pisai/token/:token
 * Lookup single grinding ticket by token number (e.g. 1001, "T-1001", "0101") or ID
 */
pisaiRouter.get('/token/:token', requireAuth, async (req: Request, res: Response) => {
  try {
    const rawToken = req.params.token.trim();
    const digitsOnly = rawToken.replace(/\D/g, '');
    const numToken = digitsOnly ? parseInt(digitsOnly, 10) : NaN;

    const ticket = await prisma.pisaiRecord.findFirst({
      where: {
        OR: [
          ...(!isNaN(numToken) ? [{ tokenNumber: numToken }] : []),
          { tokenFormatted: rawToken },
          { tokenFormatted: digitsOnly },
          { id: rawToken },
        ],
      },
      include: {
        biller: { select: { id: true, fullName: true, username: true } },
        customer: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Token #${rawToken} not found` },
      });
    }

    let printPayload = null;
    if (ticket.printPayload) {
      try {
        printPayload = JSON.parse(ticket.printPayload);
      } catch {
        printPayload = { formattedText: ticket.printPayload };
      }
    }

    return res.json({
      success: true,
      data: {
        ...ticket,
        printPayloadParsed: printPayload,
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
 * PATCH /api/pisai/:id/delivery-status
 * Toggle/set delivery status between IN_QUEUE and DELIVERED
 */
pisaiRouter.patch('/:id/delivery-status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    if (!['IN_QUEUE', 'DELIVERED'].includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'deliveryStatus must be IN_QUEUE or DELIVERED' },
      });
    }

    const isNum = !isNaN(Number(id));
    const ticket = await prisma.pisaiRecord.findFirst({
      where: isNum ? { tokenNumber: Number(id) } : { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Grinding ticket not found' },
      });
    }

    const deliveredAt = deliveryStatus === 'DELIVERED' ? new Date() : null;

    const updated = await prisma.pisaiRecord.update({
      where: { id: ticket.id },
      data: {
        deliveryStatus,
        deliveredAt,
      },
      include: {
        biller: { select: { id: true, fullName: true, username: true } },
        customer: true,
      },
    });

    await recordActivityLog({
      userId: req.user!.id,
      action: 'UPDATE_PISAI_DELIVERY_STATUS',
      entityType: 'PisaiRecord',
      entityId: ticket.id,
      details: {
        tokenNumber: ticket.tokenNumber,
        deliveryStatus,
      },
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      data: updated,
      message: `Token #${ticket.tokenFormatted} status updated to ${deliveryStatus === 'DELIVERED' ? 'Delivered' : 'In Queue'}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * PATCH /api/pisai/:id
 * Edit grinding ticket customer details or weight
 */
pisaiRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerName, customerPhone, weightKg } = req.body;

    const isNum = !isNaN(Number(id));
    const ticket = await prisma.pisaiRecord.findFirst({
      where: isNum ? { tokenNumber: Number(id) } : { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Grinding ticket not found' },
      });
    }

    const updated = await prisma.pisaiRecord.update({
      where: { id: ticket.id },
      data: {
        ...(customerName !== undefined ? { customerName: customerName.trim() } : {}),
        ...(customerPhone !== undefined ? { customerPhone: customerPhone.trim() } : {}),
        ...(weightKg !== undefined && Number(weightKg) > 0 ? { weightKg: Number(weightKg) } : {}),
      },
      include: {
        biller: { select: { id: true, fullName: true, username: true } },
        customer: true,
      },
    });

    await recordActivityLog({
      userId: req.user!.id,
      action: 'UPDATE_PISAI_TICKET',
      entityType: 'PisaiRecord',
      entityId: ticket.id,
      details: {
        tokenNumber: ticket.tokenNumber,
        customerName,
        customerPhone,
      },
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Grinding ticket updated successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * GET /api/pisai/:id/reprint
 * Thermal reprint: returns identical large-format print payload without altering token sequence (PRINT-02)
 */
pisaiRouter.get('/:id/reprint', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Lookup by UUID or token number
    const isNum = !isNaN(Number(id));
    const ticket = await prisma.pisaiRecord.findFirst({
      where: isNum ? { tokenNumber: Number(id) } : { id },
      include: {
        biller: { select: { id: true, fullName: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Grinding ticket not found for reprint' },
      });
    }

    let printPayload = null;
    if (ticket.printPayload) {
      try {
        printPayload = JSON.parse(ticket.printPayload);
      } catch {
        printPayload = { formattedText: ticket.printPayload };
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'REPRINT_PISAI_TICKET',
        entityType: 'PisaiRecord',
        entityId: ticket.id,
        details: JSON.stringify({ tokenNumber: ticket.tokenNumber, reprintTime: new Date() }),
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      data: {
        tokenNumber: ticket.tokenNumber,
        tokenFormatted: ticket.tokenFormatted,
        timestamp: ticket.createdAt,
        billerName: ticket.biller.fullName,
        customerName: ticket.customerName,
        serviceType: ticket.serviceType,
        weightKg: ticket.weightKg,
        ratePerKg: ticket.ratePerKg,
        feeAmount: ticket.feeAmount,
        discount: ticket.discount,
        netTotal: ticket.netTotal,
        receivedAmount: ticket.receivedAmount,
        changeReturned: ticket.changeReturned,
        paymentMethod: ticket.paymentMethod,
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
 * POST /api/pisai/:id/void
 * Admin void endpoint for Pisai grinding tickets (VOID-01)
 */
pisaiRouter.post(
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
      const ticket = await prisma.pisaiRecord.findFirst({
        where: isNum ? { tokenNumber: Number(id) } : { id },
        include: { customer: true },
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Pisai ticket not found' },
        });
      }

      if (ticket.status === 'VOIDED') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VOIDED', message: 'Pisai ticket is already voided' },
        });
      }

      // Check day-lock
      const ticketDate = getLocalDateString(ticket.createdAt);
      if (await isDayClosed(ticketDate)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DAY_CLOSED',
            message: `Cannot void Pisai tickets from closed business day ${ticketDate}.`,
          },
        });
      }

      const voidedTicket = await prisma.$transaction(async (tx) => {
        const updated = await tx.pisaiRecord.update({
          where: { id: ticket.id },
          data: {
            status: 'VOIDED',
            voidReason: reason.trim(),
            voidedById: req.user!.id,
            voidedAt: new Date(),
          },
        });

        // If CREDIT, reverse ledger balance
        if (ticket.paymentMethod === 'CREDIT' && ticket.customerId) {
          const customer = await tx.customer.findUnique({
            where: { id: ticket.customerId },
          });

          if (customer) {
            const newBalance = customer.currentBalance - ticket.netTotal;
            await tx.customer.update({
              where: { id: customer.id },
              data: { currentBalance: newBalance },
            });

            await tx.ledgerEntry.create({
              data: {
                customerId: customer.id,
                pisaiId: ticket.id,
                type: 'ADJUSTMENT',
                amount: ticket.netTotal,
                description: `منسوخی پسائی ٹوکن #${ticket.tokenFormatted}: ${reason.trim()} (Void Grinding Ticket)`,
                balanceAfter: newBalance,
                recordedById: req.user!.id,
              },
            });
          }
        }

        return updated;
      });

      // Synchronously write activity log (AUDIT-01)
      await recordActivityLog({
        userId: req.user!.id,
        action: 'VOID_PISAI',
        entityType: 'PisaiRecord',
        entityId: ticket.id,
        details: {
          tokenFormatted: ticket.tokenFormatted,
          reason: reason.trim(),
          amount: ticket.netTotal,
          paymentMethod: ticket.paymentMethod,
          customerId: ticket.customerId,
        },
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        data: {
          ticket: voidedTicket,
          message: `Pisai ticket #${ticket.tokenFormatted} successfully voided`,
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

