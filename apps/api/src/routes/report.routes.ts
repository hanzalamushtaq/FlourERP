import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

export const reportRouter = Router();

function getDateRange(filter?: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (filter) {
    case 'yesterday': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      break;
    }
    case '7days': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'today':
    default: {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
  }

  return { startDate, endDate };
}

/**
 * GET /api/reports/dashboard-kpis
 * Pre-aggregated owner dashboard cards (REP-01)
 */
const kpiCache = new Map<string, { data: any; expiresAt: number }>();

reportRouter.get('/dashboard-kpis', requireAuth, async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const rangeKey = typeof range === 'string' ? range : 'today';

    const cached = kpiCache.get(rangeKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ success: true, data: cached.data });
    }

    const { startDate, endDate } = getDateRange(rangeKey);

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Execute aggregate queries in parallel to minimize cross-region network round-trips
    const [bills, pisaiTickets, expenses, repayments, returns, customers, creditEntries] = await Promise.all([
      // 1. Product Sales
      prisma.bill.findMany({
        where: dateFilter,
        select: { netTotal: true, receivedAmount: true, paymentMethod: true },
      }),
      // 2. Pisai Milling Revenue
      prisma.pisaiRecord.findMany({
        where: dateFilter,
        select: { netTotal: true, receivedAmount: true, weightKg: true, paymentMethod: true },
      }),
      // 3. Shop Expenses
      prisma.expense.findMany({
        where: dateFilter,
        select: { amount: true },
      }),
      // 4. Cash Repayments received during period
      prisma.ledgerEntry.findMany({
        where: {
          ...dateFilter,
          type: 'CREDIT_PAYMENT',
        },
        select: { amount: true },
      }),
      // 5. Cash Returns processed during period
      prisma.billReturn.findMany({
        where: {
          ...dateFilter,
          refundMethod: 'CASH',
        },
        select: { amount: true },
      }),
      // 6. Outstanding Customer Udhaar
      prisma.customer.findMany({
        select: { currentBalance: true },
      }),
      // 7. Credit purchases / debit charges during period
      prisma.ledgerEntry.findMany({
        where: {
          ...dateFilter,
          type: 'DEBIT_PURCHASE',
        },
        select: { amount: true },
      }),
    ]);

    const totalSalesAmount = bills.reduce((sum, b) => sum + b.netTotal, 0);
    const cashFromSales = bills.reduce((sum, b) => sum + b.receivedAmount, 0);
    const totalBillsCount = bills.length;

    const totalPisaiRevenue = pisaiTickets.reduce((sum, p) => sum + p.netTotal, 0);
    const cashFromPisai = pisaiTickets.reduce((sum, p) => sum + p.receivedAmount, 0);
    const totalPisaiWeightKg = pisaiTickets.reduce((sum, p) => sum + p.weightKg, 0);
    const totalPisaiTokensCount = pisaiTickets.length;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRepaymentsCash = repayments.reduce((sum, r) => sum + r.amount, 0);
    const totalCashRefunds = returns.reduce((sum, r) => sum + r.amount, 0);

    // Credit calculation for the period (Today's Credit / Udhaar)
    const billCredit = bills.reduce(
      (sum, b) => (b.paymentMethod === 'CREDIT' ? sum + Math.max(0, b.netTotal - b.receivedAmount) : sum),
      0
    );
    const pisaiCredit = pisaiTickets.reduce(
      (sum, p) => (p.paymentMethod === 'CREDIT' ? sum + Math.max(0, p.netTotal - p.receivedAmount) : sum),
      0
    );
    const totalCreditFromLedger = creditEntries.reduce((sum, c) => sum + c.amount, 0);
    const totalCreditIssued = Math.max(totalCreditFromLedger, billCredit + pisaiCredit);

    const totalCustomerUdhaar = customers.reduce(
      (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
      0
    );
    const activeDebtorsCount = customers.filter((c) => c.currentBalance > 0).length;

    // Accurate Cash Drawer Formula:
    // Cash drawer = total sales (atta etc) + milling revenue - credit (+ repayments - cash refunds)
    const cashDrawerBalance = Math.max(
      0,
      totalSalesAmount + totalPisaiRevenue - totalCreditIssued + totalRepaymentsCash - totalCashRefunds
    );

    const totalInflows = cashFromSales + cashFromPisai + totalRepaymentsCash;
    const totalOutflows = totalExpenses + totalCashRefunds;

    const netCashInHand = cashDrawerBalance;

    const resultData = {
      sales: {
        totalAmount: totalSalesAmount,
        billsCount: totalBillsCount,
        cashCollected: cashFromSales,
      },
      pisai: {
        totalRevenue: totalPisaiRevenue,
        tokensCount: totalPisaiTokensCount,
        weightKg: totalPisaiWeightKg,
        cashCollected: cashFromPisai,
      },
      expenses: {
        totalAmount: totalExpenses,
        count: expenses.length,
      },
      udhaar: {
        totalOutstanding: totalCustomerUdhaar,
        debtorsCount: activeDebtorsCount,
        totalRecovered: totalRepaymentsCash,
        recoveredToday: totalRepaymentsCash,
        creditIssued: totalCreditIssued,
        creditToday: totalCreditIssued,
      },
      cash: {
        netCashInHand,
        cashDrawerBalance,
        cashFromSales,
        cashFromPisai,
        cashFromRepayments: totalRepaymentsCash,
        cashPaidExpenses: totalExpenses,
        cashPaidRefunds: totalCashRefunds,
        inflows: totalInflows,
        outflows: totalOutflows,
      },
      dateRange: {
        startDate,
        endDate,
        range: rangeKey,
      },
    };

    kpiCache.set(rangeKey, {
      data: resultData,
      expiresAt: Date.now() + 5000, // 5s cache
    });

    return res.json({
      success: true,
      data: resultData,
    });


  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

/**
 * GET /api/reports/ledger-stream
 * Unified chronological financial feed with date & category filters (REP-02)
 */
reportRouter.get('/ledger-stream', requireAuth, async (req: Request, res: Response) => {
  try {
    const { range, category } = req.query;
    const { startDate, endDate } = getDateRange(typeof range === 'string' ? range : 'today');

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const items: Array<{
      id: string;
      timestamp: Date;
      category: 'SALE' | 'PISAI' | 'CREDIT' | 'PAYMENT' | 'EXPENSE' | 'RETURN';
      description: string;
      descriptionUr: string;
      reference: string;
      amount: number;
      type: 'inflow' | 'outflow' | 'neutral';
    }> = [];

    // Fetch Bills
    if (!category || category === 'SALE' || category === 'CREDIT') {
      const bills = await prisma.bill.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
      });
      for (const b of bills) {
        const isCredit = b.paymentMethod === 'CREDIT';
        if (category && isCredit && category !== 'CREDIT') continue;
        if (category && !isCredit && category !== 'SALE') continue;

        items.push({
          id: `bill_${b.id}`,
          timestamp: b.createdAt,
          category: isCredit ? 'CREDIT' : 'SALE',
          description: isCredit
            ? `Credit Sale Bill #${b.billNumber} (${b.customerName || 'Customer'})`
            : `Cash Sale Bill #${b.billNumber} (${b.customerName || 'Walk-in'})`,
          descriptionUr: isCredit
            ? `ادھار سیل بل #${b.billNumber} (${b.customerName || 'گاہک'})`
            : `نقد سیل بل #${b.billNumber}`,
          reference: `BILL-${String(b.billNumber).padStart(6, '0')}`,
          amount: b.netTotal,
          type: isCredit ? 'neutral' : 'inflow',
        });
      }
    }

    // Fetch Pisai Tickets
    if (!category || category === 'PISAI') {
      const pisaiRecords = await prisma.pisaiRecord.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
      });
      for (const p of pisaiRecords) {
        const sName = p.serviceType === 'SAFAI_PISAI' ? 'Safai+Pisai' : 'Pisai Only';
        items.push({
          id: `pisai_${p.id}`,
          timestamp: p.createdAt,
          category: 'PISAI',
          description: `Token #${p.tokenFormatted} - ${p.weightKg} KG ${sName}`,
          descriptionUr: `پسائی ٹوکن #${p.tokenFormatted} - ${p.weightKg} کلو`,
          reference: `PISAI-${p.tokenFormatted}`,
          amount: p.netTotal,
          type: p.paymentMethod === 'CREDIT' ? 'neutral' : 'inflow',
        });
      }
    }

    // Fetch Expenses
    if (!category || category === 'EXPENSE') {
      const expenses = await prisma.expense.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
      });
      for (const e of expenses) {
        items.push({
          id: `exp_${e.id}`,
          timestamp: e.createdAt,
          category: 'EXPENSE',
          description: `${e.category}: ${e.description}`,
          descriptionUr: `خرچہ: ${e.description}`,
          reference: `EXP-${e.id.slice(0, 6).toUpperCase()}`,
          amount: e.amount,
          type: 'outflow',
        });
      }
    }

    // Fetch Repayments
    if (!category || category === 'PAYMENT') {
      const repayments = await prisma.ledgerEntry.findMany({
        where: {
          ...dateFilter,
          type: 'CREDIT_PAYMENT',
        },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });
      for (const r of repayments) {
        items.push({
          id: `repay_${r.id}`,
          timestamp: r.createdAt,
          category: 'PAYMENT',
          description: `${r.customer.name}: ${r.description}`,
          descriptionUr: `${r.customer.name} ادھار وصولی`,
          reference: `PAY-${r.id.slice(0, 6).toUpperCase()}`,
          amount: r.amount,
          type: 'inflow',
        });
      }
    }

    // Fetch Returns
    if (!category || category === 'RETURN') {
      const returns = await prisma.billReturn.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
      });
      for (const ret of returns) {
        items.push({
          id: `ret_${ret.id}`,
          timestamp: ret.createdAt,
          category: 'RETURN',
          description: `Return ${ret.returnNumber}: ${ret.reason}`,
          descriptionUr: `واپسی مال (${ret.returnNumber})`,
          reference: ret.returnNumber,
          amount: ret.amount,
          type: 'outflow',
        });
      }
    }

    // Sort all chronological items descending
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const formatted = items.map((item) => ({
      ...item,
      timestamp: item.timestamp.toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }));

    return res.json({
      success: true,
      data: {
        items: formatted,
        count: formatted.length,
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
 * GET /api/reports/product-sales
 * Product-wise sales breakdown ranked by quantity sold and revenue
 */
reportRouter.get('/product-sales', requireAuth, async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(typeof range === 'string' ? range : 'today');

    const billItems = await prisma.billItem.findMany({
      where: {
        bill: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        product: true,
      },
    });

    const productMap = new Map<string, {
      id: string;
      nameEn: string;
      nameUr: string;
      unit: string;
      totalQuantityKg: number;
      totalAmount: number;
      ordersCount: number;
      averageRate: number;
    }>();

    for (const item of billItems) {
      const pid = item.productId;
      if (!productMap.has(pid)) {
        productMap.set(pid, {
          id: pid,
          nameEn: item.product?.nameEn || item.productName || 'Item',
          nameUr: item.product?.nameUr || item.productName || 'آئٹم',
          unit: item.product?.unit || 'KG',
          totalQuantityKg: 0,
          totalAmount: 0,
          ordersCount: 0,
          averageRate: item.ratePerKg,
        });
      }
      const p = productMap.get(pid)!;
      p.totalQuantityKg += Number(item.quantityKg) || 0;
      p.totalAmount += Number(item.totalAmount) || 0;
      p.ordersCount += 1;
    }

    // Rank descending by quantity sold (most sold on top)
    const products = Array.from(productMap.values()).map((p) => ({
      ...p,
      averageRate: p.totalQuantityKg > 0 ? Math.round((p.totalAmount / p.totalQuantityKg) * 100) / 100 : p.averageRate,
    })).sort((a, b) => b.totalQuantityKg - a.totalQuantityKg);

    const totalSoldKg = products.reduce((acc, p) => acc + p.totalQuantityKg, 0);
    const totalRevenue = products.reduce((acc, p) => acc + p.totalAmount, 0);

    return res.json({
      success: true,
      data: {
        products,
        totalSoldKg,
        totalRevenue,
        range: typeof range === 'string' ? range : 'today',
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
 * GET /api/reports/export-csv
 * CSV export for reports & financial audits (REP-02)
 */
reportRouter.get('/export-csv', requireAuth, async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const { startDate, endDate } = getDateRange(typeof range === 'string' ? range : 'month');

    const bills = await prisma.bill.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      orderBy: { createdAt: 'desc' },
    });

    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      orderBy: { createdAt: 'desc' },
    });

    const rows: string[] = [];
    rows.push('Date,Type,Reference,Customer/Details,Amount,PaymentMethod');

    for (const b of bills) {
      const dateStr = b.createdAt.toISOString().slice(0, 10);
      rows.push(`${dateStr},SALE,BILL-${b.billNumber},"${b.customerName || 'Cash'}",${b.netTotal},${b.paymentMethod}`);
    }

    for (const e of expenses) {
      const dateStr = e.createdAt.toISOString().slice(0, 10);
      rows.push(`${dateStr},EXPENSE,EXP-${e.id.slice(0, 6)},"${e.category}: ${e.description}",${e.amount},CASH_OUT`);
    }

    const csvContent = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="flour-erp-report.csv"');
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});
