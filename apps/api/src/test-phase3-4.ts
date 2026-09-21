import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { createApp } from './app.js';
import { prisma } from './config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'flour-erp-jwt-secret-key-counter-shift-2026';

async function runTests() {
  console.log('=== Starting Phase 3 & Phase 4 Automated Test Suite ===\n');

  // 1. Get Admin & Biller Users
  const adminUser = await prisma.user.findUnique({
    where: { username: 'hanzala' },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  const billerUser = await prisma.user.findUnique({
    where: { username: 'asif' },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  if (!adminUser || !billerUser) {
    throw new Error('Admin or Biller user not found in database. Run seed first.');
  }

  const adminToken = jwt.sign(
    { userId: adminUser.id, username: adminUser.username, roleId: adminUser.roleId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const billerToken = jwt.sign(
    { userId: billerUser.id, username: billerUser.username, roleId: billerUser.roleId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const app = createApp();
  const server = app.listen(5099);
  const BASE_URL = 'http://127.0.0.1:5099';

  try {
    // ----------------------------------------------------
    // TEST 1: CAT-01 Product Catalog Listing & Creation
    // ----------------------------------------------------
    console.log('[TEST 1] CAT-01: Product Catalog Listing & Creation');
    const listRes = await fetch(`${BASE_URL}/api/products`);
    const listData = await listRes.json();
    console.log(`  ✓ Products fetched: ${listData.data.products.length} products`);
    if (listData.data.products.length < 6) throw new Error('Expected at least 6 products');

    // Admin creates new product
    const createProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nameEn: 'Barley Flour / Jau Atta',
        nameUr: 'جو کا آٹا',
        unit: 'KG',
        currentRate: 180,
      }),
    });
    const createProdData = await createProdRes.json();
    if (!createProdData.success) throw new Error(`Create product failed: ${JSON.stringify(createProdData)}`);
    console.log(`  ✓ Created new product: ${createProdData.data.product.nameEn} (Rate: ${createProdData.data.product.currentRate})`);
    const barleyId = createProdData.data.product.id;

    // ----------------------------------------------------
    // TEST 2: PRICE-01 Rate Update & Price History Tracking
    // ----------------------------------------------------
    console.log('\n[TEST 2] PRICE-01: Rate Update & Price History Tracking');
    const updateRateRes = await fetch(`${BASE_URL}/api/products/${barleyId}/rate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        newRate: 195,
        reason: 'Market price increase',
      }),
    });
    const updateRateData = await updateRateRes.json();
    if (!updateRateData.success || updateRateData.data.product.currentRate !== 195) {
      throw new Error('Rate update failed');
    }
    console.log(`  ✓ Rate updated to 195. Price history ID: ${updateRateData.data.history.id}`);

    const historyRes = await fetch(`${BASE_URL}/api/products/${barleyId}/history`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const historyData = await historyRes.json();
    console.log(`  ✓ History entries found: ${historyData.data.history.length}`);
    if (historyData.data.history.length < 2) throw new Error('Expected price history entries');

    // ----------------------------------------------------
    // TEST 3: PRICE-02 Daily Price Confirmation Workflow
    // ----------------------------------------------------
    console.log('\n[TEST 3] PRICE-02: Daily Price Confirmation Workflow');
    const statusRes = await fetch(`${BASE_URL}/api/prices/daily-status`, {
      headers: { Authorization: `Bearer ${billerToken}` },
    });
    const statusData = await statusRes.json();
    console.log(`  ✓ Daily status check for ${statusData.data.date}: Confirmed = ${statusData.data.isConfirmedToday}`);

    const confirmRes = await fetch(`${BASE_URL}/api/prices/daily-confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        notes: 'Confirmed by morning shift supervisor',
        updates: [{ productId: barleyId, rate: 200 }],
      }),
    });
    const confirmData = await confirmRes.json();
    if (!confirmData.success) throw new Error(`Daily confirm failed: ${JSON.stringify(confirmData)}`);
    console.log(`  ✓ Daily confirmation saved for date: ${confirmData.data.confirmation.confirmationDate}`);

    // ----------------------------------------------------
    // TEST 4: PRICE-03 Biller Price Request & Admin Review
    // ----------------------------------------------------
    console.log('\n[TEST 4] PRICE-03: Biller Price Request & Admin Review');
    const reqChangeRes = await fetch(`${BASE_URL}/api/prices/request-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({
        productId: barleyId,
        requestedRate: 205,
        holdBillData: { tempCustomer: 'Walk-in' },
      }),
    });
    const reqChangeData = await reqChangeRes.json();
    if (!reqChangeData.success) throw new Error('Biller price request failed');
    console.log(`  ✓ Biller submitted price request #${reqChangeData.data.request.id.slice(0, 8)}`);

    const approveRes = await fetch(`${BASE_URL}/api/prices/requests/${reqChangeData.data.request.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    const approveData = await approveRes.json();
    if (!approveData.success || approveData.data.request.status !== 'APPROVED') {
      throw new Error('Approval failed');
    }
    console.log('  ✓ Admin approved price request');

    // ----------------------------------------------------
    // TEST 5: BILL-04 Rate Guard (Rate Not Set Warning & Block)
    // ----------------------------------------------------
    console.log('\n[TEST 5] BILL-04: Rate Guard (Rate Not Set Warning & Block)');
    const zeroRateProduct = await prisma.product.create({
      data: {
        nameEn: 'Unpriced Special Atta',
        nameUr: 'بغیر ریٹ آٹا',
        unit: 'KG',
        currentRate: 0,
      },
    });

    const billZeroRateRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({
        calculationMode: 'WEIGHT_TO_AMOUNT',
        customerName: 'Rate Guard Test Customer',
        items: [{ productId: zeroRateProduct.id, quantityKg: 10, totalAmount: 0 }],
        receivedAmount: 1000,
      }),
    });
    const billZeroRateData = await billZeroRateRes.json();
    if (billZeroRateRes.status === 400 && billZeroRateData.error.code === 'RATE_NOT_SET') {
      console.log(`  ✓ Correctly blocked unpriced item with RATE_NOT_SET: "${billZeroRateData.error.message}"`);
    } else {
      throw new Error(`Expected RATE_NOT_SET error but got: ${JSON.stringify(billZeroRateData)}`);
    }

    // ----------------------------------------------------
    // TEST 6: BILL-02 Discount RBAC Guard (can_discount required)
    // ----------------------------------------------------
    console.log('\n[TEST 6] BILL-02: Discount RBAC Guard');
    const chakkiProd = listData.data.products[0];

    // Biller attempts discount without can_discount permission
    const billBillerDiscountRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({
        calculationMode: 'WEIGHT_TO_AMOUNT',
        customerName: 'Discount Guard Customer',
        items: [{ productId: chakkiProd.id, quantityKg: 10, totalAmount: chakkiProd.currentRate * 10 }],
        discount: 50,
        receivedAmount: 1350,
      }),
    });
    const billBillerDiscountData = await billBillerDiscountRes.json();
    if (billBillerDiscountRes.status === 403 && billBillerDiscountData.error.code === 'PERMISSION_DENIED') {
      console.log('  ✓ Biller unauthorized discount blocked with 403 PERMISSION_DENIED');
    } else {
      throw new Error(`Expected 403 for unauthorized discount but got: ${billBillerDiscountRes.status}`);
    }

    // Admin attempts discount with can_discount -> succeeds
    const billAdminDiscountRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        calculationMode: 'WEIGHT_TO_AMOUNT',
        customerName: 'Discount Allowed Customer',
        items: [{ productId: chakkiProd.id, quantityKg: 10, totalAmount: chakkiProd.currentRate * 10 }],
        discount: 50,
        receivedAmount: 1400,
      }),
    });
    const billAdminDiscountData = await billAdminDiscountRes.json();
    if (billAdminDiscountRes.status === 201 && billAdminDiscountData.data.bill.discount === 50) {
      console.log(`  ✓ Admin discount succeeded! Bill #${billAdminDiscountData.data.bill.billNumber}, Net: ${billAdminDiscountData.data.bill.netTotal}`);
    } else {
      throw new Error(`Expected 201 for admin discount: ${JSON.stringify(billAdminDiscountData)}`);
    }

    // ----------------------------------------------------
    // TEST 7: BILL-03 Strictly Monotonic Sequential Numbers with DB Locks
    // ----------------------------------------------------
    console.log('\n[TEST 7] BILL-03: Sequential Atomic Bill Numbers (Concurrency Test)');
    const concurrentCount = 5;
    const promises = Array.from({ length: concurrentCount }).map((_, i) =>
      fetch(`${BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${billerToken}`,
        },
        body: JSON.stringify({
          calculationMode: 'WEIGHT_TO_AMOUNT',
          customerName: `Concurrent Test User ${i + 1}`,
          items: [{ productId: chakkiProd.id, quantityKg: 5, totalAmount: chakkiProd.currentRate * 5 }],
          discount: 0,
          receivedAmount: chakkiProd.currentRate * 5,
        }),
      }).then((r) => r.json())
    );

    const concurrentResults = await Promise.all(promises);
    const billNumbers = concurrentResults.map((r) => r.data.bill.billNumber);
    console.log(`  ✓ Generated Bill Numbers: ${billNumbers.join(', ')}`);

    // Verify all unique and sequential
    const uniqueNumbers = new Set(billNumbers);
    if (uniqueNumbers.size !== concurrentCount) {
      throw new Error(`Duplicate bill numbers detected! Got ${uniqueNumbers.size} unique out of ${concurrentCount}`);
    }
    const sorted = [...billNumbers].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        throw new Error(`Sequence gap detected: ${sorted[i - 1]} -> ${sorted[i]}`);
      }
    }
    console.log('  ✓ Zero duplicates and zero sequence gaps verified under concurrent checkout taps');

    // ----------------------------------------------------
    // TEST 8: PRINT-01 & PRINT-02 Thermal ESC/POS Payload & Identical Reprint
    // ----------------------------------------------------
    console.log('\n[TEST 8] PRINT-01 & PRINT-02: ESC/POS Thermal Receipt Payload & Reprint');
    const lastBillNumber = sorted[sorted.length - 1];
    const reprintRes = await fetch(`${BASE_URL}/api/bills/${lastBillNumber}/reprint`, {
      headers: { Authorization: `Bearer ${billerToken}` },
    });
    const reprintData = await reprintRes.json();
    if (!reprintData.success) throw new Error('Reprint endpoint failed');
    if (!reprintData.data.printPayload || !reprintData.data.printPayload.formattedText) {
      throw new Error('Missing thermal formatted text in reprint payload');
    }
    console.log(`  ✓ Bill #${reprintData.data.billNumber} retrieved for reprint`);
    console.log('  --- ESC/POS Receipt Formatted Snippet ---');
    console.log(reprintData.data.printPayload.formattedText.split('\n').slice(0, 8).join('\n'));
    console.log('  -----------------------------------------');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 3 & PHASE 4 AUTOMATED TESTS PASSED CLEANLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((e) => {
  console.error('\n❌ Test failure:', e);
  process.exit(1);
});
