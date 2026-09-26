import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { createDatabaseBackup } from '../utils/backup.js';
import { recordActivityLog } from '../utils/audit.js';

export const closingRouter = Router();

/**
 * Check if a calendar date (YYYY-MM-DD) is closed and locked (CLOSE-01)
 */
export async function isDayClosed(dateStr: string): Promise<boolean> {
  const existing = await prisma.dailyClosingRecord.findUnique({
    where: { closingDate: dateStr },
  });
  return !!existing;
}

/**
 * Helper to get local date string YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Helper to get Date range (startOfDay, endOfDay) for a YYYY-MM-DD string
 */
function getDateRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

/**
 * Generate formatted ESC/POS Z-Report text payload
 */
function generateZReportEscPos(data: {
  closingDate: string;
  closedAt: Date;
  closedByName: string;
  totalSales: number;
  cashSales: number;
  creditSales: number;
  billCount: number;
  totalPisai: number;
  cashPisai: number;
  creditPisai: number;
  pisaiCount: number;
  totalExpenses: number;
  totalUdhaarCollected: number;
  totalReturns: number;
  cashReturns: number;
  expectedCashInDrawer: number;
  actualCashInDrawer: number;
  cashDifference: number;
  backupFilename?: string;
}): { formattedText: string } {
  const doubleLine = '==========================================';
  const singleLine = '------------------------------------------';

  const padR = (str: string, len: number) => (str + ' '.repeat(len)).slice(0, len);
  const padL = (str: string, len: number) => (' '.repeat(len) + str).slice(-len);

  const lines = [
    '             AL-MADINA CHAKKI             ',
    '       DAILY CLOSING Z-REPORT (روزانہ اختتام)',
    '       Main Bazar, Commercial Area       ',
    doubleLine,
    `Date: ${data.closingDate}    Time: ${data.closedAt.toLocaleTimeString('en-PK')}`,
    `Closed By: ${data.closedByName}`,
    `Status: CLOSED & LOCKED (مکمل محفوظ)`,
    doubleLine,
    '--- 1. STANDARD BILLING (پراڈکٹ سیلز) ---',
    `Total Bills: ${data.billCount}`,
    `${padR('Gross Product Sales:', 28)}${padL('Rs ' + Math.round(data.totalSales), 14)}`,
    `${padR('  - Cash Received:', 28)}${padL('Rs ' + Math.round(data.cashSales), 14)}`,
    `${padR('  - Credit (Udhaar):', 28)}${padL('Rs ' + Math.round(data.creditSales), 14)}`,
    singleLine,
    '--- 2. GUNDAM PISAI (گندم پسائی اجرت) ---',
    `Total Tokens: ${data.pisaiCount}`,
    `${padR('Gross Grinding Fees:', 28)}${padL('Rs ' + Math.round(data.totalPisai), 14)}`,
    `${padR('  - Cash Received:', 28)}${padL('Rs ' + Math.round(data.cashPisai), 14)}`,
    `${padR('  - Credit (Udhaar):', 28)}${padL('Rs ' + Math.round(data.creditPisai), 14)}`,
    singleLine,
    '--- 3. UDHAAR RECOVERIES (ادھار وصولی) ---',
    `${padR('Cash Udhaar Collected:', 28)}${padL('Rs ' + Math.round(data.totalUdhaarCollected), 14)}`,
    singleLine,
    '--- 4. EXPENSES & RETURNS (اخراجات و واپسی) ---',
    `${padR('Shop Expenses Paid:', 28)}${padL('-Rs ' + Math.round(data.totalExpenses), 14)}`,
    `${padR('Cash Returns Refunded:', 28)}${padL('-Rs ' + Math.round(data.cashReturns), 14)}`,
    doubleLine,
    '--- 5. DRAWER RECONCILIATION (کیش دراز پڑتال) ---',
    `${padR('Expected Drawer Cash:', 28)}${padL('Rs ' + Math.round(data.expectedCashInDrawer), 14)}`,
    `${padR('Actual Counted Cash:', 28)}${padL('Rs ' + Math.round(data.actualCashInDrawer), 14)}`,
    `${padR('Difference (فرق):', 28)}${padL((data.cashDifference >= 0 ? '+' : '') + 'Rs ' + Math.round(data.cashDifference), 14)}`,
    doubleLine,
    data.backupFilename ? `Backup: ${data.backupFilename}` : 'Backup: Auto-Generated',
    'IMMUTABLE SNAPSHOT - BACKDATING LOCKED',
    doubleLine,
  ];

  return { formattedText: lines.join('\n') };
}

/**
 * Compute aggregated figures for a specific business date
 */
async function computeDayMetrics(dateStr: string) {
  const { start, end } = getDateRange(dateStr);

  const [
    bills,
    pisaiList,
    expenses,
    repayments,
    returnsList,
  ] = await Promise.all([
    // Active bills (exclude VOIDED)
    prisma.bill.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'VOIDED' },
      },
    }),
    // Active pisai tokens (exclude VOIDED)
    prisma.pisaiRecord.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'VOIDED' },
      },
    }),
    // Expenses
    prisma.expense.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    }),
    // Repayments (CREDIT_PAYMENT entries in ledger)
    prisma.ledgerEntry.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        type: 'CREDIT_PAYMENT',
      },
    }),
    // Returns
    prisma.billReturn.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    }),
  ]);

  const billCount = bills.length;
  let totalSales = 0;
  let cashSales = 0;
  let creditSales = 0;

  for (const b of bills) {
    totalSales += b.netTotal;
    if (b.paymentMethod === 'CASH') {
      // In cash mode, received cash is netTotal (or receivedAmount minus change)
      cashSales += b.netTotal;
    } else {
      creditSales += b.netTotal;
    }
  }

  const pisaiCount = pisaiList.length;
  let totalPisai = 0;
  let cashPisai = 0;
  let creditPisai = 0;

  for (const p of pisaiList) {
    totalPisai += p.netTotal;
    if (p.paymentMethod === 'CASH') {
      cashPisai += p.netTotal;
    } else {
      creditPisai += p.netTotal;
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalUdhaarCollected = repayments.reduce((sum, r) => sum + r.amount, 0);

  let totalReturns = 0;
  let cashReturns = 0;
  for (const ret of returnsList) {
    totalReturns += ret.amount;
    if (ret.refundMethod === 'CASH') {
      cashReturns += ret.amount;
    }
  }

  const expectedCashInDrawer =
    cashSales + cashPisai + totalUdhaarCollected - totalExpenses - cashReturns;

  return {
    closingDate: dateStr,
    billCount,
    totalSales,
    cashSales,
    creditSales,
    pisaiCount,
    totalPisai,
    cashPisai,
    creditPisai,
    totalExpenses,
    totalUdhaarCollected,
    totalReturns,
    cashReturns,
    expectedCashInDrawer,
  };
}

/**
 * GET /api/closing/preview
 * Fetches real-time closing figures for today or a specific date (CLOSE-01)
 */
closingRouter.get('/preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || getLocalDateString();
    const existingRecord = await prisma.dailyClosingRecord.findUnique({
      where: { closingDate: dateStr },
      include: {
        closedBy: { select: { id: true, fullName: true, username: true } },
      },
    });

    const metrics = await computeDayMetrics(dateStr);

    return res.json({
      success: true,
      data: {
        ...metrics,
        isClosed: !!existingRecord,
        closingRecord: existingRecord,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

const CloseDayInputSchema = z.object({
  date: z.string().optional(),
  actualCashInDrawer: z.number().nonnegative('Counted cash must be non-negative'),
  notes: z.string().optional(),
});

/**
 * POST /api/closing
 * Executes end-of-day daily closing: freezes snapshot, triggers backup, generates Z-Report (CLOSE-01, BACKUP-01)
 */
closingRouter.post(
  '/',
  requireAuth,
  requirePermission('can_close_day'),
  async (req: Request, res: Response) => {
    try {
      const parsed = CloseDayInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message || 'Invalid input',
          },
        });
      }

      const dateStr = parsed.data.date || getLocalDateString();

      // Check if already closed
      const alreadyClosed = await isDayClosed(dateStr);
      if (alreadyClosed) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_CLOSED',
            message: `Business day ${dateStr} is already closed and locked against backdated modifications.`,
          },
        });
      }

      // 1. Calculate live metrics snapshot
      const metrics = await computeDayMetrics(dateStr);
      const actualCash = parsed.data.actualCashInDrawer;
      const difference = actualCash - metrics.expectedCashInDrawer;

      // 2. Trigger automated database backup (BACKUP-01)
      let backupResult;
      try {
        backupResult = await createDatabaseBackup();
      } catch (backupErr: any) {
        console.error('Automated backup error during closing:', backupErr);
      }

      // 3. Generate ESC/POS Z-Report Payload
      const zReport = generateZReportEscPos({
        closingDate: dateStr,
        closedAt: new Date(),
        closedByName: req.user!.fullName,
        totalSales: metrics.totalSales,
        cashSales: metrics.cashSales,
        creditSales: metrics.creditSales,
        billCount: metrics.billCount,
        totalPisai: metrics.totalPisai,
        cashPisai: metrics.cashPisai,
        creditPisai: metrics.creditPisai,
        pisaiCount: metrics.pisaiCount,
        totalExpenses: metrics.totalExpenses,
        totalUdhaarCollected: metrics.totalUdhaarCollected,
        totalReturns: metrics.totalReturns,
        cashReturns: metrics.cashReturns,
        expectedCashInDrawer: metrics.expectedCashInDrawer,
        actualCashInDrawer: actualCash,
        cashDifference: difference,
        backupFilename: backupResult?.filename,
      });

      // 4. Save immutable daily closing snapshot
      const closingRecord = await prisma.dailyClosingRecord.create({
        data: {
          closingDate: dateStr,
          totalSales: metrics.totalSales,
          cashSales: metrics.cashSales,
          creditSales: metrics.creditSales,
          totalPisai: metrics.totalPisai,
          cashPisai: metrics.cashPisai,
          creditPisai: metrics.creditPisai,
          totalExpenses: metrics.totalExpenses,
          totalUdhaarCollected: metrics.totalUdhaarCollected,
          totalReturns: metrics.totalReturns,
          cashReturns: metrics.cashReturns,
          expectedCashInDrawer: metrics.expectedCashInDrawer,
          actualCashInDrawer: actualCash,
          cashDifference: difference,
          billCount: metrics.billCount,
          pisaiCount: metrics.pisaiCount,
          notes: parsed.data.notes || null,
          backupPath: backupResult?.backupPath || null,
          backupSizeBytes: backupResult?.sizeBytes || null,
          zReportPayload: JSON.stringify(zReport),
          closedById: req.user!.id,
          status: 'CLOSED',
        },
        include: {
          closedBy: { select: { id: true, fullName: true, username: true } },
        },
      });

      // 5. Synchronously record activity log (AUDIT-01)
      await recordActivityLog({
        userId: req.user!.id,
        action: 'DAILY_CLOSING_EXECUTED',
        entityType: 'DailyClosingRecord',
        entityId: closingRecord.id,
        details: {
          closingDate: dateStr,
          expectedCash: metrics.expectedCashInDrawer,
          actualCash,
          difference,
          backupFile: backupResult?.filename,
          backupSize: backupResult?.sizeBytes,
        },
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        data: {
          closingRecord,
          zReport,
          backup: backupResult,
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

/**
 * GET /api/closing/records
 * Returns historical daily closing records
 */
closingRouter.get('/records', requireAuth, async (_req: Request, res: Response) => {
  try {
    const records = await prisma.dailyClosingRecord.findMany({
      orderBy: { closingDate: 'desc' },
      include: {
        closedBy: { select: { id: true, fullName: true, username: true } },
      },
    });

    return res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * POST /api/closing/unlock
 * Allows Admin/SuperAdmin to unlock a closed day so billing can resume
 */
closingRouter.post(
  '/unlock',
  requireAuth,
  requirePermission('can_close_day'),
  async (req: Request, res: Response) => {
    try {
      const dateStr = (req.body && req.body.date) || getLocalDateString();
      const existing = await prisma.dailyClosingRecord.findUnique({
        where: { closingDate: dateStr },
      });

      if (!existing) {
        return res.json({
          success: true,
          message: 'Business day is already open and unlocked.',
        });
      }

      await prisma.dailyClosingRecord.delete({
        where: { closingDate: dateStr },
      });

      await recordActivityLog({
        userId: req.user!.id,
        action: 'DAILY_CLOSING_REOPENED',
        entityType: 'DailyClosingRecord',
        entityId: existing.id,
        details: { closingDate: dateStr, reason: req.body?.reason || 'Reopened by Admin' },
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        message: `Business day ${dateStr} has been successfully unlocked. Billing and grinding tokens can now be created.`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  }
);
