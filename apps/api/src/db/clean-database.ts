import 'dotenv/config';
import { prisma } from '../config/db.js';

async function cleanDatabase() {
  console.log('--- Database Cleanup Started ---');

  // 1. Check existing counts
  const initialCounts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    bills: await prisma.bill.count(),
    billItems: await prisma.billItem.count(),
    pisaiRecords: await prisma.pisaiRecord.count(),
    ledgerEntries: await prisma.ledgerEntry.count(),
    expenses: await prisma.expense.count(),
    dailyClosings: await prisma.dailyClosingRecord.count(),
    returns: await prisma.billReturn.count(),
    activityLogs: await prisma.activityLog.count(),
  };

  console.log('Current Database Counts:', initialCounts);

  // 2. Remove all transactional / dummy operational data
  console.log('Deleting transactional & dummy data...');

  const deletedBillItems = await prisma.billItem.deleteMany({});
  console.log(`Deleted ${deletedBillItems.count} BillItems`);

  const deletedReturns = await prisma.billReturn.deleteMany({});
  console.log(`Deleted ${deletedReturns.count} BillReturns`);

  const deletedBills = await prisma.bill.deleteMany({});
  console.log(`Deleted ${deletedBills.count} Bills`);

  const deletedPisai = await prisma.pisaiRecord.deleteMany({});
  console.log(`Deleted ${deletedPisai.count} PisaiRecords`);

  const deletedLedger = await prisma.ledgerEntry.deleteMany({});
  console.log(`Deleted ${deletedLedger.count} LedgerEntries`);

  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`Deleted ${deletedExpenses.count} Expenses`);

  const deletedClosings = await prisma.dailyClosingRecord.deleteMany({});
  console.log(`Deleted ${deletedClosings.count} DailyClosingRecords`);

  const deletedPriceRequests = await prisma.priceChangeRequest.deleteMany({});
  console.log(`Deleted ${deletedPriceRequests.count} PriceChangeRequests`);

  const deletedConfirmations = await prisma.dailyPriceConfirmation.deleteMany({});
  console.log(`Deleted ${deletedConfirmations.count} DailyPriceConfirmations`);

  const deletedCustomers = await prisma.customer.deleteMany({});
  console.log(`Deleted ${deletedCustomers.count} Customers`);

  const deletedLogs = await prisma.activityLog.deleteMany({});
  console.log(`Deleted ${deletedLogs.count} ActivityLogs`);

  // Delete any users that are not 'hanzala' (Admin) or 'asif' (Biller)
  const deletedExtraUsers = await prisma.user.deleteMany({
    where: {
      username: {
        notIn: ['hanzala', 'asif'],
      },
    },
  });
  console.log(`Deleted ${deletedExtraUsers.count} non-system users`);

  // Delete duplicate/test products
  await prisma.priceHistory.deleteMany({});
  await prisma.product.deleteMany({
    where: {
      nameEn: {
        in: ['Barley Flour / Jau Atta', 'Unpriced Special Atta'],
      },
    },
  });
  console.log('Removed test products');

  // Reset bill sequences
  await prisma.billSequence.upsert({
    where: { name: 'STANDARD_BILL' },
    update: { lastNumber: 1000 },
    create: { name: 'STANDARD_BILL', lastNumber: 1000 },
  });
  console.log('Reset STANDARD_BILL sequence to 1000');

  await prisma.billSequence.upsert({
    where: { name: 'PISAI_TOKEN' },
    update: { lastNumber: 100 },
    create: { name: 'PISAI_TOKEN', lastNumber: 100 },
  });
  console.log('Reset PISAI_TOKEN sequence to 100');

  // Verify remaining counts
  const finalCounts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    bills: await prisma.bill.count(),
    pisaiRecords: await prisma.pisaiRecord.count(),
    ledgerEntries: await prisma.ledgerEntry.count(),
    expenses: await prisma.expense.count(),
  };

  const remainingUsers = await prisma.user.findMany({
    select: { username: true, fullName: true, role: { select: { name: true } } },
  });
  const remainingProducts = await prisma.product.findMany({
    select: { nameUr: true, nameEn: true, currentRate: true },
  });

  console.log('--- Final Database State ---');
  console.log('Counts:', finalCounts);
  console.log('Remaining Users:', remainingUsers);
  console.log('Remaining Products:', remainingProducts);
  console.log('--- Database Cleaned Successfully ---');
}

cleanDatabase()
  .catch((e) => {
    console.error('Clean Database error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
