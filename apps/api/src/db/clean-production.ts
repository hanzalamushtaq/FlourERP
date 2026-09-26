import 'dotenv/config';
import { prisma } from '../config/db.js';

async function cleanForProduction() {
  console.log('--- Cleaning database for fresh client delivery ---');

  console.log('1. Deleting returns...');
  await prisma.billReturn.deleteMany({});

  console.log('2. Deleting ledger entries...');
  await prisma.ledgerEntry.deleteMany({});

  console.log('3. Deleting bill items...');
  await prisma.billItem.deleteMany({});

  console.log('4. Deleting product bills...');
  await prisma.bill.deleteMany({});

  console.log('5. Deleting grinding / pisai records...');
  await prisma.pisaiRecord.deleteMany({});

  console.log('6. Deleting customers...');
  await prisma.customer.deleteMany({});

  console.log('7. Deleting expenses...');
  await prisma.expense.deleteMany({});

  console.log('8. Deleting daily closing records...');
  await prisma.dailyClosingRecord.deleteMany({});

  console.log('9. Deleting activity logs...');
  await prisma.activityLog.deleteMany({});

  console.log('10. Resetting bill sequences...');
  await prisma.billSequence.upsert({
    where: { name: 'STANDARD_BILL' },
    update: { lastNumber: 1000 },
    create: { name: 'STANDARD_BILL', lastNumber: 1000 },
  });

  await prisma.billSequence.upsert({
    where: { name: 'PISAI_TOKEN' },
    update: { lastNumber: 100 },
    create: { name: 'PISAI_TOKEN', lastNumber: 100 },
  });

  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();
  const roleCount = await prisma.role.count();
  const customerCount = await prisma.customer.count();
  const ledgerCount = await prisma.ledgerEntry.count();
  const billCount = await prisma.bill.count();
  const pisaiCount = await prisma.pisaiRecord.count();
  const closingCount = await prisma.dailyClosingRecord.count();

  console.log('\n--- Production Database Verification Summary ---');
  console.log(`✓ Products preserved: ${productCount}`);
  console.log(`✓ Users preserved (Admin & Biller): ${userCount}`);
  console.log(`✓ Roles preserved: ${roleCount}`);
  console.log(`✓ Customers remaining: ${customerCount} (clean)`);
  console.log(`✓ Ledger entries remaining: ${ledgerCount} (clean)`);
  console.log(`✓ Bills remaining: ${billCount} (clean)`);
  console.log(`✓ Grinding records remaining: ${pisaiCount} (clean)`);
  console.log(`✓ Daily closings remaining: ${closingCount} (clean)`);
  console.log('------------------------------------------------');
}

cleanForProduction()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
