import 'dotenv/config';
import fs from 'fs';
import { createApp } from './app.js';
import { prisma } from './config/db.js';
import { signToken } from './utils/auth.js';
import { createDatabaseBackup } from './utils/backup.js';

const app = createApp();
const TEST_PORT = 5005;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runPhase8Verification() {
  console.log('====================================================');
  console.log('  PHASE 8 AUTOMATED VERIFICATION SUITE');
  console.log('  Daily Closing, Backup, Bill Void, Audit Log');
  console.log('====================================================\n');

  // Start in-process Express server on TEST_PORT
  const server = await new Promise<any>((resolve) => {
    const s = app.listen(TEST_PORT, () => {
      console.log(`✓ Test API server listening on ${BASE_URL}`);
      resolve(s);
    });
  });

  try {
    // 1. Fetch Admin and Biller users from database
    const adminUser = await prisma.user.findUnique({
      where: { username: 'hanzala' },
      include: { role: true },
    });
    if (!adminUser) throw new Error('SuperAdmin user "hanzala" not found');

    const billerUser = await prisma.user.findUnique({
      where: { username: 'asif' },
      include: { role: true },
    });
    if (!billerUser) throw new Error('Biller user "asif" not found');

    const adminToken = signToken({
      userId: adminUser.id,
      username: adminUser.username,
      roleId: adminUser.roleId,
      roleName: adminUser.role.name,
    });

    const billerToken = signToken({
      userId: billerUser.id,
      username: billerUser.username,
      roleId: billerUser.roleId,
      roleName: billerUser.role.name,
    });

    let testCustomer = await prisma.customer.findFirst({
      where: { name: 'حاجی رشید' },
    });
    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          name: 'حاجی رشید',
          phone: '0300-1112233',
          currentBalance: 0,
        },
      });
    }

    let product = await prisma.product.findFirst({ where: { isActive: true } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          nameEn: 'Chakki Special Atta',
          nameUr: 'چکی اسپیشل آٹا',
          unit: 'KG',
          currentRate: 140,
          isActive: true,
        },
      });
    }

    // ---------------------------------------------------------
    // TEST 1: [BACKUP-01] Automated Database Backup Engine
    // ---------------------------------------------------------
    console.log('\n[TEST 1] BACKUP-01: Testing Database Backup Utility...');
    const backupResult = await createDatabaseBackup();
    if (!backupResult.success || !fs.existsSync(backupResult.backupPath) || backupResult.sizeBytes <= 0) {
      throw new Error(`Backup creation failed: ${JSON.stringify(backupResult)}`);
    }
    console.log(`  ✓ Backup file created on disk: ${backupResult.filename}`);
    console.log(`  ✓ Size: ${(backupResult.sizeBytes / 1024).toFixed(2)} KB, verified exists and non-empty`);

    // ---------------------------------------------------------
    // TEST 2: [CLOSE-01] Daily Closing Preview & Snapshot Freezing
    // ---------------------------------------------------------
    console.log('\n[TEST 2] CLOSE-01: Testing Daily Closing Preview & Execution...');
    const testClosingDate = '2026-09-21';

    // Clean up any existing closing record for this date to start fresh
    await prisma.dailyClosingRecord.deleteMany({
      where: { closingDate: testClosingDate },
    });

    // 2a. Fetch preview
    const previewRes = await fetch(`${BASE_URL}/api/closing/preview?date=${testClosingDate}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const previewJson = await previewRes.json();
    if (!previewJson.success) throw new Error(`Preview failed: ${JSON.stringify(previewJson)}`);
    console.log(`  ✓ Preview retrieved for ${testClosingDate}:`);
    console.log(`    Expected Drawer Cash: Rs ${previewJson.data.expectedCashInDrawer}`);
    console.log(`    Total Sales: Rs ${previewJson.data.totalSales}, Bills: ${previewJson.data.billCount}`);
    console.log(`    Total Pisai: Rs ${previewJson.data.totalPisai}, Tokens: ${previewJson.data.pisaiCount}`);

    // 2b. Execute Closing with physical cash entered by Admin
    const actualCashCounted = (previewJson.data.expectedCashInDrawer || 0) + 200; // Rs 200 surplus
    const closeRes = await fetch(`${BASE_URL}/api/closing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        date: testClosingDate,
        actualCashInDrawer: actualCashCounted,
        notes: 'End of shift test closing with verified cash count',
      }),
    });

    const closeJson = await closeRes.json();
    if (!closeJson.success) throw new Error(`Closing failed: ${JSON.stringify(closeJson)}`);
    const closingRecord = closeJson.data.closingRecord;
    console.log(`  ✓ Day closed and frozen: ID = ${closingRecord.id}`);
    console.log(`  ✓ Status = ${closingRecord.status}, Expected = Rs ${closingRecord.expectedCashInDrawer}, Actual = Rs ${closingRecord.actualCashInDrawer}, Diff = Rs ${closingRecord.cashDifference}`);
    console.log(`  ✓ Backup linked: ${closingRecord.backupPath}`);
    console.log(`  ✓ Z-Report print payload generated (${closeJson.data.zReport.formattedText.length} bytes formatted text)`);

    // 2c. Verify repeat closing attempt is rejected with 409
    const repeatRes = await fetch(`${BASE_URL}/api/closing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        date: testClosingDate,
        actualCashInDrawer: actualCashCounted,
      }),
    });
    if (repeatRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for repeat closing, got ${repeatRes.status}`);
    }
    console.log('  ✓ Repeat closing attempt correctly rejected with 409 ALREADY_CLOSED');

    // 2d. Verify Day-Lock: attempting to create a bill on closed day is blocked (403)
    const blockedBillRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        calculationMode: 'WEIGHT_TO_AMOUNT',
        items: [{ productId: product.id, quantityKg: 10, totalAmount: 1400 }],
        receivedAmount: 1400,
        paymentMethod: 'CASH',
      }),
    });
    const blockedBillJson = await blockedBillRes.json();
    if (blockedBillRes.status !== 403 || blockedBillJson.error?.code !== 'DAY_CLOSED') {
      throw new Error(`Expected 403 DAY_CLOSED on bill creation, got ${blockedBillRes.status}: ${JSON.stringify(blockedBillJson)}`);
    }
    console.log('  ✓ Day-Lock verified: New bills blocked on closed business day with 403 DAY_CLOSED');

    // 2e. Verify Day-Lock: attempting to log expenses on closed day is blocked (403)
    const blockedExpRes = await fetch(`${BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        category: 'MISC',
        description: 'Test blocked expense',
        amount: 300,
      }),
    });
    const blockedExpJson = await blockedExpRes.json();
    if (blockedExpRes.status !== 403 || blockedExpJson.error?.code !== 'DAY_CLOSED') {
      throw new Error(`Expected 403 DAY_CLOSED on expense creation, got ${blockedExpRes.status}`);
    }
    console.log('  ✓ Day-Lock verified: Expenses blocked on closed business day with 403 DAY_CLOSED');

    // Unlock day for testing voiding of active bills
    await prisma.dailyClosingRecord.deleteMany({
      where: { closingDate: testClosingDate },
    });

    // ---------------------------------------------------------
    // TEST 3: [VOID-01] Voiding Bills & Pisai with Reversal Ledgers
    // ---------------------------------------------------------
    console.log('\n[TEST 3] VOID-01: Testing Bill & Pisai Voiding with Reversal Ledgers...');

    // 3a. Create a credit bill
    const initialCust = await prisma.customer.findUnique({ where: { id: testCustomer.id } });
    const initialBalance = initialCust?.currentBalance || 0;

    const createBillRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        items: [{ productId: product.id, quantityKg: 20, totalAmount: 2800 }],
        receivedAmount: 0,
        paymentMethod: 'CREDIT',
      }),
    });

    const createBillJson = await createBillRes.json();
    if (!createBillJson.success) throw new Error(`Bill creation failed: ${JSON.stringify(createBillJson)}`);
    const bill = createBillJson.data.bill;
    console.log(`  ✓ Credit Bill #${bill.billNumber} created for Rs ${bill.netTotal}`);

    // Verify balance increased
    const afterCreditCust = await prisma.customer.findUnique({ where: { id: testCustomer.id } });
    if (afterCreditCust!.currentBalance !== initialBalance + bill.netTotal) {
      throw new Error(`Customer balance mismatch: ${afterCreditCust!.currentBalance} vs ${initialBalance + bill.netTotal}`);
    }
    console.log(`  ✓ Customer balance increased to Rs ${afterCreditCust!.currentBalance}`);

    // 3b. Verify non-admin (Biller) receives 403 Forbidden on void endpoint
    const unauthVoidRes = await fetch(`${BASE_URL}/api/bills/${bill.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({ reason: 'Biller attempted void without authority' }),
    });
    if (unauthVoidRes.status !== 403) {
      throw new Error(`Expected 403 FORBIDDEN for unauthorized bill void, got: ${unauthVoidRes.status}`);
    }
    console.log('  ✓ RBAC Guard: Non-admin cashier received 403 FORBIDDEN on void endpoint');

    // 3c. Authorized Admin void
    const authVoidRes = await fetch(`${BASE_URL}/api/bills/${bill.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'غلط ریٹ لگ گیا تھا (Incorrect rate applied)' }),
    });
    const authVoidJson = await authVoidRes.json();
    if (!authVoidJson.success) throw new Error(`Void failed: ${JSON.stringify(authVoidJson)}`);
    console.log(`  ✓ Bill #${bill.billNumber} successfully marked as VOIDED`);

    // Verify customer balance was reversed atomically
    const postVoidCust = await prisma.customer.findUnique({ where: { id: testCustomer.id } });
    if (postVoidCust!.currentBalance !== initialBalance) {
      throw new Error(`Balance not restored after void: expected ${initialBalance}, got ${postVoidCust!.currentBalance}`);
    }
    console.log(`  ✓ Atomic ledger reversal verified: Customer balance restored to Rs ${postVoidCust!.currentBalance}`);

    // Verify reversing LedgerEntry row exists
    const revEntry = await prisma.ledgerEntry.findFirst({
      where: { billId: bill.id, type: 'ADJUSTMENT' },
    });
    if (!revEntry) throw new Error('Reversing ledger entry not found');
    console.log(`  ✓ Linked reversal LedgerEntry verified: ID = ${revEntry.id}, Type = ${revEntry.type}, Amount = Rs ${revEntry.amount}`);

    // 3d. Void Pisai Ticket
    const pisaiRes = await fetch(`${BASE_URL}/api/pisai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerName: testCustomer.name,
        customerPhone: testCustomer.phone,
        serviceType: 'SAFAI_PISAI',
        weightKg: 50,
        feeAmount: 350,
        receivedAmount: 0,
        paymentMethod: 'CREDIT',
      }),
    });
    const pisaiJson = await pisaiRes.json();
    if (!pisaiJson.success) throw new Error(`Pisai ticket creation failed: ${JSON.stringify(pisaiJson)}`);
    const ticket = pisaiJson.data.ticket;
    console.log(`  ✓ Credit Pisai Ticket #${ticket.tokenFormatted} created for Rs ${ticket.netTotal}`);

    const voidPisaiRes = await fetch(`${BASE_URL}/api/pisai/${ticket.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'کسٹمر نے آرڈر منسوخ کر دیا (Customer cancelled order)' }),
    });
    const voidPisaiJson = await voidPisaiRes.json();
    if (!voidPisaiJson.success) throw new Error(`Pisai void failed: ${JSON.stringify(voidPisaiJson)}`);
    console.log(`  ✓ Pisai Ticket #${ticket.tokenFormatted} marked as VOIDED`);

    // ---------------------------------------------------------
    // TEST 4: [AUDIT-01] Synchronous Activity Logging Verification
    // ---------------------------------------------------------
    console.log('\n[TEST 4] AUDIT-01: Testing Activity Audit Logs Stream...');
    const auditRes = await fetch(`${BASE_URL}/api/audit-logs?limit=50`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditJson = await auditRes.json();
    if (!auditJson.success) throw new Error(`Failed to fetch audit logs: ${JSON.stringify(auditJson)}`);
    const logs = auditJson.data.logs;
    const actions = logs.map((l: any) => l.action);
    console.log(`  ✓ Total audit log entries retrieved: ${logs.length}`);
    console.log(`  ✓ Recent sensitive actions recorded: ${actions.slice(0, 8).join(', ')}`);

    if (!actions.includes('VOID_BILL')) throw new Error('Missing VOID_BILL in audit logs');
    if (!actions.includes('VOID_PISAI')) throw new Error('Missing VOID_PISAI in audit logs');
    if (!actions.includes('DAILY_CLOSING_EXECUTED')) throw new Error('Missing DAILY_CLOSING_EXECUTED in audit logs');

    console.log('  ✓ Confirmed VOID_BILL, VOID_PISAI, and DAILY_CLOSING_EXECUTED synchronously logged in audit trail');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 8 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runPhase8Verification().catch((err) => {
  console.error('Phase 8 Verification Failed:', err);
  process.exit(1);
});
