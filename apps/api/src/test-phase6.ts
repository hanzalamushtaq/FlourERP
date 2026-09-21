import { prisma } from './config/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-flour-erp-1234';

async function runTests() {
  console.log('=== Starting Phase 6 Credit (Udhaar) & Ledger Module Automated Test Suite ===\n');

  // 1. Get Test Users & Tokens
  const adminUser = await prisma.user.findUnique({
    where: { username: 'hanzala' },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!adminUser) throw new Error('Admin user not found');

  const billerUser = await prisma.user.findUnique({
    where: { username: 'asif' },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!billerUser) throw new Error('Biller user not found');

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

  const billerToken = jwt.sign(
    {
      userId: billerUser.id,
      username: billerUser.username,
      role: 'Biller',
      permissions: [], // No can_issue_credit
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  // 2. [TEST 1] Create a New Customer Profile
  console.log('[TEST 1] Creating a New Customer Profile...');
  let testCustomer = await prisma.customer.findFirst({ where: { name: 'Test UAT Customer' } });
  if (testCustomer) {
    await prisma.ledgerEntry.deleteMany({ where: { customerId: testCustomer.id } });
    await prisma.customer.delete({ where: { id: testCustomer.id } });
  }

  const createCustRes = await fetch('http://localhost:5000/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Test UAT Customer',
      phone: '0300-1112233',
      address: 'Shop 5, Grain Market',
      initialBalance: 5000,
    }),
  });

  const createCustJson = await createCustRes.json();
  if (!createCustJson.success) {
    throw new Error(`Failed to create customer: ${JSON.stringify(createCustJson)}`);
  }
  const customerId = createCustJson.data.customer.id;
  console.log(`  ✓ Customer created: ${createCustJson.data.customer.name}, Initial Balance: Rs ${createCustJson.data.customer.currentBalance}`);

  // 3. [TEST 2] Issue Credit Sales Bill & Automatic Ledger Entry
  console.log('\n[TEST 2] CRED-01 & LEDGER-01: Issuing Credit Sales Bill...');
  const activeProd = await prisma.product.findFirst({ where: { isActive: true, currentRate: { gt: 0 } } });
  if (!activeProd) throw new Error('No active product found');

  const billRes = await fetch('http://localhost:5000/api/bills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      customerId,
      customerName: 'Test UAT Customer',
      customerPhone: '0300-1112233',
      calculationMode: 'WEIGHT_TO_AMOUNT',
      discount: 0,
      receivedAmount: 0,
      paymentMethod: 'CREDIT',
      items: [
        {
          productId: activeProd.id,
          quantityKg: 10,
          ratePerKg: activeProd.currentRate,
          totalAmount: 10 * activeProd.currentRate,
        },
      ],
    }),
  });

  const billJson = await billRes.json();
  if (!billJson.success) {
    throw new Error(`Credit bill failed: ${JSON.stringify(billJson)}`);
  }
  const billDebt = billJson.data.bill.netTotal;
  console.log(`  ✓ Credit bill created: Bill #${billJson.data.bill.billNumber}, Amount: Rs ${billDebt}`);

  // Check customer balance and ledger entry
  const custAfterBill = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { ledgerEntries: { orderBy: { createdAt: 'desc' } } },
  });
  const expectedBal1 = 5000 + billDebt;
  if (custAfterBill?.currentBalance !== expectedBal1) {
    throw new Error(`Balance mismatch after credit bill! Expected ${expectedBal1}, got ${custAfterBill?.currentBalance}`);
  }
  console.log(`  ✓ Customer balance automatically incremented to Rs ${custAfterBill.currentBalance}`);
  console.log(`  ✓ Ledger entry recorded: "${custAfterBill.ledgerEntries[0].description}" (Balance: Rs ${custAfterBill.ledgerEntries[0].balanceAfter})`);

  // 4. [TEST 3] Issue Credit Pisai Grinding Ticket & Automatic Ledger Entry
  console.log('\n[TEST 3] CRED-01 & LEDGER-01: Issuing Credit Pisai Grinding Ticket...');
  const pisaiRes = await fetch('http://localhost:5000/api/pisai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      customerId,
      customerName: 'Test UAT Customer',
      serviceType: 'SAFAI_PISAI',
      weightKg: 50,
      feeAmount: 300,
      discount: 0,
      receivedAmount: 0,
      paymentMethod: 'CREDIT',
    }),
  });

  const pisaiJson = await pisaiRes.json();
  if (!pisaiJson.success) {
    throw new Error(`Credit Pisai ticket failed: ${JSON.stringify(pisaiJson)}`);
  }
  const pisaiDebt = pisaiJson.data.ticket.netTotal;
  console.log(`  ✓ Credit Pisai ticket created: Token #${pisaiJson.data.ticket.tokenFormatted}, Amount: Rs ${pisaiDebt}`);

  const custAfterPisai = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { ledgerEntries: { orderBy: { createdAt: 'desc' } } },
  });
  const expectedBal2 = expectedBal1 + pisaiDebt;
  if (custAfterPisai?.currentBalance !== expectedBal2) {
    throw new Error(`Balance mismatch after Pisai! Expected ${expectedBal2}, got ${custAfterPisai?.currentBalance}`);
  }
  console.log(`  ✓ Customer balance automatically incremented to Rs ${custAfterPisai.currentBalance}`);
  console.log(`  ✓ Ledger entry recorded: "${custAfterPisai.ledgerEntries[0].description}"`);

  // 5. [TEST 4] CRED-03: Cash Repayment & RBAC Check
  console.log('\n[TEST 4] CRED-03: Cash Repayment & RBAC Guard...');
  // Biller without can_issue_credit should be blocked
  const unauthRepayRes = await fetch(`http://localhost:5000/api/customers/${customerId}/repayments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${billerToken}`,
    },
    body: JSON.stringify({
      amount: 2000,
      paymentMethod: 'CASH',
    }),
  });

  if (unauthRepayRes.status !== 403) {
    throw new Error(`Expected 403 for unauthorized repayment, got ${unauthRepayRes.status}`);
  }
  console.log('  ✓ Biller without credit permission was blocked from collecting repayment (403 PERMISSION_DENIED)');

  // Admin with permission should succeed
  const authRepayRes = await fetch(`http://localhost:5000/api/customers/${customerId}/repayments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      amount: 2500,
      paymentMethod: 'CASH',
      notes: 'کاؤنٹر نقد ادائیگی بذریعہ حاجی صاحب',
    }),
  });

  const authRepayJson = await authRepayRes.json();
  if (!authRepayJson.success) {
    throw new Error(`Repayment failed: ${JSON.stringify(authRepayJson)}`);
  }
  const expectedBal3 = expectedBal2 - 2500;
  console.log(`  ✓ Cash repayment of Rs 2,500 recorded! New Customer Balance: Rs ${authRepayJson.data.customer.currentBalance}`);
  if (authRepayJson.data.customer.currentBalance !== expectedBal3) {
    throw new Error(`Balance mismatch after repayment! Expected ${expectedBal3}, got ${authRepayJson.data.customer.currentBalance}`);
  }
  console.log(`  ✓ Thermal payment slip generated: Receipt #${authRepayJson.data.slip.text.split('\n')[4]}`);

  // 6. [TEST 5] CRED-02 & LEDGER-01: Profile Query & Mathematical Ledger Integrity
  console.log('\n[TEST 5] CRED-02 & LEDGER-01: Ledger History & Mathematical Integrity Verification...');
  const profileRes = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const profileJson = await profileRes.json();
  if (!profileJson.success) throw new Error('Failed to fetch profile');

  const txs = profileJson.data.customer.transactions;
  console.log(`  ✓ Fetched customer profile with ${txs.length} ledger transactions:`);
  for (const t of txs) {
    const sign = t.type === 'purchase' ? '+' : '-';
    console.log(`    [${t.date}] ${sign}Rs ${t.amount.toLocaleString().padEnd(6)} | ${t.description.padEnd(45)} | Balance: Rs ${t.runningBalance}`);
  }

  // Mathematical integrity: Sum(Debits) - Sum(Credits) == Final Balance
  const totalDebits = txs.filter((t: any) => t.type === 'purchase').reduce((acc: number, t: any) => acc + t.amount, 0);
  const totalCredits = txs.filter((t: any) => t.type === 'payment').reduce((acc: number, t: any) => acc + t.amount, 0);
  const computedBalance = totalDebits - totalCredits;

  console.log(`  ✓ Mathematical Audit: Total Debits (Rs ${totalDebits}) - Total Payments (Rs ${totalCredits}) = Rs ${computedBalance}`);
  if (computedBalance !== profileJson.data.customer.balance) {
    throw new Error(`Ledger integrity check failed! Computed: ${computedBalance}, Stored: ${profileJson.data.customer.balance}`);
  }
  console.log(`  ✓ Double-entry ledger integrity verified 100% gapless and accurate!`);

  console.log('\n======================================================');
  console.log('🎉 ALL PHASE 6 CREDIT & LEDGER TESTS PASSED CLEANLY!');
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
