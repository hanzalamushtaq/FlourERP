import { prisma } from './config/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-flour-erp-1234';

async function runTests() {
  console.log('=== Starting Phase 7 Expenses, Returns, Reports Automated Test Suite ===\n');

  // 1. Get Admin Token
  const adminUser = await prisma.user.findUnique({
    where: { username: 'hanzala' },
  });
  if (!adminUser) throw new Error('Admin user not found');

  const adminToken = jwt.sign(
    {
      userId: adminUser.id,
      username: adminUser.username,
      role: 'SuperAdmin',
      permissions: ['can_issue_credit', 'can_discount'],
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  // 2. [TEST 1] EXP-01: Log Categorized Shop Expenses
  console.log('[TEST 1] EXP-01: Logging Categorized Shop Expenses with Server Timestamps...');
  const expRes1 = await fetch('http://localhost:5000/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      category: 'ELECTRICITY',
      description: 'Chakki Motor Grid Bill Advance',
      amount: 2500,
    }),
  });

  const expJson1 = await expRes1.json();
  if (!expJson1.success) throw new Error(`Expense 1 failed: ${JSON.stringify(expJson1)}`);
  console.log(`  ✓ Recorded Expense: ${expJson1.data.expense.category} - Rs ${expJson1.data.expense.amount} (Timestamp: ${expJson1.data.expense.createdAt})`);

  const expRes2 = await fetch('http://localhost:5000/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      category: 'TEA_FOOD',
      description: 'Worker Daily Tea & Snacks',
      amount: 350,
    }),
  });
  const expJson2 = await expRes2.json();
  if (!expJson2.success) throw new Error(`Expense 2 failed: ${JSON.stringify(expJson2)}`);
  console.log(`  ✓ Recorded Expense: ${expJson2.data.expense.category} - Rs ${expJson2.data.expense.amount}`);

  // Query expenses
  const expListRes = await fetch('http://localhost:5000/api/expenses', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const expListJson = await expListRes.json();
  console.log(`  ✓ Total Expenses in DB: ${expListJson.data.count}, Total Sum: Rs ${expListJson.data.totalAmount}`);

  // 3. [TEST 2] RET-01: Returns with Financial & Customer Ledger Offsets
  console.log('\n[TEST 2] RET-01: Processing Returns with Offsetting Ledger Entries...');
  // Find a credit customer
  const creditCustomer = await prisma.customer.findFirst({
    where: { currentBalance: { gt: 1000 } },
  });
  if (!creditCustomer) throw new Error('No credit customer found for return test');

  const prevCustomerBal = creditCustomer.currentBalance;

  // Process a credit offset return (e.g. damaged bag returned)
  const retRes = await fetch('http://localhost:5000/api/returns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      customerId: creditCustomer.id,
      amount: 700,
      reason: 'خراب سلائی شدہ بوری واپسی (Damaged Bag Return)',
      refundMethod: 'CREDIT_OFFSET',
    }),
  });

  const retJson = await retRes.json();
  if (!retJson.success) throw new Error(`Return failed: ${JSON.stringify(retJson)}`);
  console.log(`  ✓ Processed Return #${retJson.data.billReturn.returnNumber} for Rs ${retJson.data.billReturn.amount}`);

  // Check customer balance deduction
  const updatedCustomer = await prisma.customer.findUnique({ where: { id: creditCustomer.id } });
  const expectedNewBal = prevCustomerBal - 700;
  if (updatedCustomer?.currentBalance !== expectedNewBal) {
    throw new Error(`Customer balance not offset! Expected ${expectedNewBal}, got ${updatedCustomer?.currentBalance}`);
  }
  console.log(`  ✓ Customer balance successfully offset: Rs ${prevCustomerBal} -> Rs ${updatedCustomer.currentBalance}`);

  // Also process a Cash return
  const cashRetRes = await fetch('http://localhost:5000/api/returns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      amount: 200,
      reason: 'Walk-in cash customer weight refund (وزن کٹوتی)',
      refundMethod: 'CASH',
    }),
  });
  const cashRetJson = await cashRetRes.json();
  if (!cashRetJson.success) throw new Error(`Cash return failed: ${JSON.stringify(cashRetJson)}`);
  console.log(`  ✓ Processed Cash Return #${cashRetJson.data.billReturn.returnNumber} for Rs ${cashRetJson.data.billReturn.amount}`);

  // 4. [TEST 3] REP-01: Pre-Aggregated Dashboard KPIs
  console.log('\n[TEST 3] REP-01: Querying Pre-Aggregated Owner Dashboard KPIs...');
  const kpiRes = await fetch('http://localhost:5000/api/reports/dashboard-kpis?range=today', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const kpiJson = await kpiRes.json();
  if (!kpiJson.success) throw new Error(`KPI query failed: ${JSON.stringify(kpiJson)}`);

  const kpis = kpiJson.data;
  console.log('  ✓ KPI Metrics Loaded:');
  console.log(`    - Sales Revenue: Rs ${kpis.sales.totalAmount.toLocaleString()} (${kpis.sales.billsCount} bills)`);
  console.log(`    - Pisai Milling: Rs ${kpis.pisai.totalRevenue.toLocaleString()} (${kpis.pisai.tokensCount} tokens, ${kpis.pisai.weightKg} KG)`);
  console.log(`    - Shop Expenses: Rs ${kpis.expenses.totalAmount.toLocaleString()} (${kpis.expenses.count} entries)`);
  console.log(`    - Total Customer Udhaar: Rs ${kpis.udhaar.totalOutstanding.toLocaleString()} (${kpis.udhaar.debtorsCount} debtors)`);
  console.log(`    - Net Drawer Cash: Rs ${kpis.cash.netCashInHand.toLocaleString()} (Inflows: Rs ${kpis.cash.inflows}, Outflows: Rs ${kpis.cash.outflows})`);

  // 5. [TEST 4] REP-02: Unified Ledger Stream & CSV Export
  console.log('\n[TEST 4] REP-02: Unified Chronological Ledger Stream & CSV Export...');
  const streamRes = await fetch('http://localhost:5000/api/reports/ledger-stream?range=today', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const streamJson = await streamRes.json();
  if (!streamJson.success) throw new Error(`Ledger stream failed: ${JSON.stringify(streamJson)}`);

  console.log(`  ✓ Stream contains ${streamJson.data.count} chronological transactions:`);
  for (const item of streamJson.data.items.slice(0, 5)) {
    console.log(`    [${item.timestamp}] [${item.category.padEnd(7)}] ${item.reference.padEnd(12)} | Rs ${item.amount.toLocaleString().padEnd(6)} | ${item.description.slice(0, 40)}`);
  }

  // Test CSV export
  const csvRes = await fetch('http://localhost:5000/api/reports/export-csv?range=today', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (csvRes.status !== 200 || !csvRes.headers.get('content-type')?.includes('text/csv')) {
    throw new Error(`CSV export invalid: Status ${csvRes.status}`);
  }
  const csvText = await csvRes.text();
  const csvLines = csvText.split('\n').filter((l) => l.trim().length > 0);
  console.log(`  ✓ CSV export generated successfully (${csvLines.length} rows, header: "${csvLines[0]}")`);

  console.log('\n======================================================');
  console.log('🎉 ALL PHASE 7 EXPENSES, RETURNS & REPORTS TESTS PASSED!');
  console.log('======================================================\n');
}

runTests()
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
