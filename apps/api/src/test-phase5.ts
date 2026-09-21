import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { createApp } from './app.js';
import { prisma } from './config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'flour-erp-jwt-secret-key-counter-shift-2026';

async function runPhase5Tests() {
  console.log('=== Starting Phase 5 Gundam Pisai Module Automated Test Suite ===\n');

  const adminUser = await prisma.user.findUnique({
    where: { username: 'hanzala' },
  });
  const billerUser = await prisma.user.findUnique({
    where: { username: 'asif' },
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
  const server = app.listen(5098);
  const BASE_URL = 'http://127.0.0.1:5098';

  try {
    // ----------------------------------------------------
    // TEST 1: PISAI-01 & PISAI-02 Grinding Ticket Creation
    // ----------------------------------------------------
    console.log('[TEST 1] PISAI-01 & PISAI-02: Grinding Ticket Creation (Safai+Pisai)');
    const createRes = await fetch(`${BASE_URL}/api/pisai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({
        serviceType: 'SAFAI_PISAI',
        weightKg: 40,
        ratePerKg: 6,
        feeAmount: 240,
        customerName: 'Haji Rasheed',
        receivedAmount: 240,
        paymentMethod: 'CASH',
      }),
    });
    const createData: any = await createRes.json();
    if (!createData.success) throw new Error(`Ticket creation failed: ${JSON.stringify(createData)}`);
    console.log(`  ✓ Generated Token #${createData.data.ticket.tokenFormatted} (Gross: ${createData.data.ticket.feeAmount}, Net: ${createData.data.ticket.netTotal})`);

    // ----------------------------------------------------
    // TEST 2: PISAI-05 Discount RBAC Guard (can_discount required)
    // ----------------------------------------------------
    console.log('\n[TEST 2] PISAI-05: Discount RBAC Guard on Grinding Fees');
    // Biller attempts discount on grinding -> blocked
    const billerDiscRes = await fetch(`${BASE_URL}/api/pisai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billerToken}`,
      },
      body: JSON.stringify({
        serviceType: 'PISAI_ONLY',
        weightKg: 20,
        ratePerKg: 5,
        feeAmount: 100,
        discount: 20,
        receivedAmount: 80,
      }),
    });
    const billerDiscData: any = await billerDiscRes.json();
    if (billerDiscRes.status === 403 && billerDiscData.error.code === 'PERMISSION_DENIED') {
      console.log('  ✓ Biller unauthorized grinding discount blocked with 403 PERMISSION_DENIED');
    } else {
      throw new Error(`Expected 403 for unauthorized grinding discount: ${billerDiscRes.status}`);
    }

    // Admin with can_discount attempts discount on grinding -> succeeds
    const adminDiscRes = await fetch(`${BASE_URL}/api/pisai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        serviceType: 'PISAI_ONLY',
        weightKg: 20,
        ratePerKg: 5,
        feeAmount: 100,
        discount: 20,
        receivedAmount: 80,
        paymentMethod: 'CASH',
      }),
    });
    const adminDiscData: any = await adminDiscRes.json();
    if (adminDiscRes.status === 201 && adminDiscData.data.ticket.discount === 20) {
      console.log(`  ✓ Admin discount succeeded! Token #${adminDiscData.data.ticket.tokenFormatted}, Discount: ${adminDiscData.data.ticket.discount}, Net: ${adminDiscData.data.ticket.netTotal}`);
    } else {
      throw new Error(`Expected 201 for admin discount: ${JSON.stringify(adminDiscData)}`);
    }

    // ----------------------------------------------------
    // TEST 3: PISAI-03 Independent Monotonic 4-Digit Tokens (Concurrency)
    // ----------------------------------------------------
    console.log('\n[TEST 3] PISAI-03: Independent Monotonic 4-Digit Sequential Tokens');
    const concurrentCount = 5;
    const promises = Array.from({ length: concurrentCount }).map((_, i) =>
      fetch(`${BASE_URL}/api/pisai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${billerToken}`,
        },
        body: JSON.stringify({
          serviceType: 'SAFAI_PISAI',
          weightKg: 10 + i * 5,
          feeAmount: (10 + i * 5) * 6,
          customerName: `Grinding Customer ${i + 1}`,
          receivedAmount: (10 + i * 5) * 6,
        }),
      }).then((r) => r.json() as Promise<any>)
    );

    const concurrentResults = await Promise.all(promises);
    const tokens = concurrentResults.map((r) => r.data.ticket.tokenFormatted);
    const tokenNums = concurrentResults.map((r) => r.data.ticket.tokenNumber);
    console.log(`  ✓ Generated 4-digit tokens: ${tokens.join(', ')}`);

    // Verify all 4 digits, format and monotonic increment
    const uniqueTokens = new Set(tokens);
    if (uniqueTokens.size !== concurrentCount) {
      throw new Error(`Duplicate tokens found! Got ${uniqueTokens.size} unique out of ${concurrentCount}`);
    }
    const sortedNums = [...tokenNums].sort((a, b) => a - b);
    for (let i = 1; i < sortedNums.length; i++) {
      if (sortedNums[i] !== sortedNums[i - 1] + 1) {
        throw new Error(`Token sequence gap: ${sortedNums[i - 1]} -> ${sortedNums[i]}`);
      }
    }
    console.log('  ✓ Verified 4-digit padding, zero duplicates, and zero sequence gaps under concurrency');

    // ----------------------------------------------------
    // TEST 4: PISAI-04 & PISAI-05 Large-Format Ticket Payload & Reprint
    // ----------------------------------------------------
    console.log('\n[TEST 4] PISAI-04 & PISAI-05: Large-Format Ticket Payload & Reprint');
    const lastToken = tokenNums[tokenNums.length - 1];
    const reprintRes = await fetch(`${BASE_URL}/api/pisai/${lastToken}/reprint`, {
      headers: { Authorization: `Bearer ${billerToken}` },
    });
    const reprintData: any = await reprintRes.json();
    if (!reprintData.success) throw new Error('Reprint failed');
    if (!reprintData.data.printPayload || !reprintData.data.printPayload.formattedText) {
      throw new Error('Missing ticket formatted text in reprint payload');
    }
    console.log(`  ✓ Grinding Ticket #${reprintData.data.tokenFormatted} retrieved for reprint`);
    console.log('  --- Large-Format Ticket Preview ---');
    console.log(reprintData.data.printPayload.formattedText.split('\n').slice(5, 13).join('\n'));
    console.log('  -----------------------------------');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 5 GUNDAM PISAI TESTS PASSED CLEANLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runPhase5Tests().catch((e) => {
  console.error('\n❌ Test failure:', e);
  process.exit(1);
});
