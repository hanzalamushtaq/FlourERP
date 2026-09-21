import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

export const PERMISSIONS = [
  { code: 'can_bill', description: 'Create and print standard product bills', category: 'billing' },
  { code: 'can_pisai', description: 'Create and print grinding tokens', category: 'pisai' },
  { code: 'can_discount', description: 'Apply manual discretionary discounts', category: 'billing' },
  { code: 'can_manage_prices', description: 'Modify daily flour and grinding rates', category: 'prices' },
  { code: 'can_issue_credit', description: 'Issue bills on credit (udhaar) to customers', category: 'credit' },
  { code: 'can_view_reports', description: 'Access financial summaries and ledger reports', category: 'reports' },
  { code: 'can_void_bills', description: 'Void completed bills with reversal entries', category: 'admin' },
  { code: 'can_close_day', description: 'Execute daily closing and Z-Report', category: 'closing' },
  { code: 'can_manage_users', description: 'Create and manage user accounts and roles', category: 'admin' },
];

async function seed() {
  console.log('Seeding database permissions and roles...');

  // 1. Seed Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description, category: perm.category },
      create: perm,
    });
  }
  console.log(`✓ Seeded ${PERMISSIONS.length} permissions`);

  const allPerms = await prisma.permission.findMany();

  // 2. Seed SuperAdmin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: { description: 'Full system access and administrative authority', isSystem: true },
    create: {
      name: 'SuperAdmin',
      description: 'Full system access and administrative authority',
      isSystem: true,
    },
  });

  // Assign all permissions to SuperAdmin
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('✓ SuperAdmin role configured with full permissions');

  // 3. Seed Biller Role
  const billerRole = await prisma.role.upsert({
    where: { name: 'Biller' },
    update: { description: 'Counter staff for product and grinding billing', isSystem: true },
    create: {
      name: 'Biller',
      description: 'Counter staff for product and grinding billing',
      isSystem: true,
    },
  });

  // Assign standard billing permissions to Biller
  const billerPermCodes = ['can_bill', 'can_pisai'];
  const billerPerms = allPerms.filter((p) => billerPermCodes.includes(p.code));

  for (const perm of billerPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: billerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: billerRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('✓ Biller role configured with counter permissions');

  // 4. Seed Initial Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminPinHash = await bcrypt.hash('1234', 10);

  await prisma.user.upsert({
    where: { username: 'hanzala' },
    update: {
      roleId: adminRole.id,
      fullName: 'Hanzala Mushtaq (Owner)',
      passwordHash: adminPasswordHash,
      pinHash: adminPinHash,
      isActive: true,
    },
    create: {
      username: 'hanzala',
      fullName: 'Hanzala Mushtaq (Owner)',
      passwordHash: adminPasswordHash,
      pinHash: adminPinHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log('✓ Seeded owner user: hanzala (PIN: 1234)');

  const billerPasswordHash = await bcrypt.hash('biller123', 10);
  const billerPinHash = await bcrypt.hash('0001', 10);

  await prisma.user.upsert({
    where: { username: 'asif' },
    update: {
      roleId: billerRole.id,
      fullName: 'محمد عاصف (کاؤنٹر 01)',
      passwordHash: billerPasswordHash,
      pinHash: billerPinHash,
      isActive: true,
    },
    create: {
      username: 'asif',
      fullName: 'محمد عاصف (کاؤنٹر 01)',
      passwordHash: billerPasswordHash,
      pinHash: billerPinHash,
      roleId: billerRole.id,
      isActive: true,
    },
  });
  console.log('✓ Seeded counter biller: asif (PIN: 0001)');

  // 5. Seed Products & Initial Price History
  const defaultProducts = [
    { nameEn: 'Chakki Atta', nameUr: 'چکی آٹا', currentRate: 140 },
    { nameEn: 'Fine Atta', nameUr: 'فائن آٹا', currentRate: 148 },
    { nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', currentRate: 155 },
    { nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', currentRate: 160 },
    { nameEn: 'Chokar / Bran', nameUr: 'چوکر', currentRate: 95 },
    { nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', currentRate: 145 },
  ];

  const adminUser = await prisma.user.findUnique({ where: { username: 'hanzala' } });

  for (const prod of defaultProducts) {
    const existing = await prisma.product.findFirst({ where: { nameEn: prod.nameEn } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          nameEn: prod.nameEn,
          nameUr: prod.nameUr,
          unit: 'KG',
          currentRate: prod.currentRate,
          isActive: true,
        },
      });
      if (adminUser) {
        await prisma.priceHistory.create({
          data: {
            productId: created.id,
            oldRate: 0,
            newRate: prod.currentRate,
            changedById: adminUser.id,
            reason: 'Initial setup rate',
          },
        });
      }
    }
  }
  console.log('✓ Seeded 6 default flour products with price history');

  // 6. Seed Bill Sequences
  await prisma.billSequence.upsert({
    where: { name: 'STANDARD_BILL' },
    update: {},
    create: {
      name: 'STANDARD_BILL',
      lastNumber: 1000,
    },
  });
  console.log('✓ Seeded STANDARD_BILL sequence starting at 1000');

  await prisma.billSequence.upsert({
    where: { name: 'PISAI_TOKEN' },
    update: {},
    create: {
      name: 'PISAI_TOKEN',
      lastNumber: 100,
    },
  });
  console.log('✓ Seeded PISAI_TOKEN sequence starting at 100');

  // 7. Seed Sample Customers & Historical Ledger Entries
  const sampleCustomers = [
    {
      name: 'حاجی رشید',
      phone: '0300-8765432',
      address: 'Main Bazar, Shop #12',
      currentBalance: 14500,
      entries: [
        { type: 'DEBIT_PURCHASE', amount: 5600, description: '40 KG چکی آٹا (بوری)', balanceAfter: 5600 },
        { type: 'CREDIT_PAYMENT', amount: 3000, description: 'کاؤنٹر نقد وصولی', balanceAfter: 2600 },
        { type: 'DEBIT_PURCHASE', amount: 11900, description: '50 KG گندم پسائی + 20 KG میدہ', balanceAfter: 14500 },
      ],
    },
    {
      name: 'طارق نان بائی',
      phone: '0321-9876543',
      address: 'Railway Road Tandoor',
      currentBalance: 38200,
      entries: [
        { type: 'DEBIT_PURCHASE', amount: 23680, description: '4 بوری فائن آٹا (160 KG)', balanceAfter: 23680 },
        { type: 'CREDIT_PAYMENT', amount: 15000, description: 'بینک وصولی ٹرانسفر', balanceAfter: 8680 },
        { type: 'DEBIT_PURCHASE', amount: 29520, description: '5 بوری چکی آٹا (200 KG)', balanceAfter: 38200 },
      ],
    },
    {
      name: 'میاں اسلم',
      phone: '0333-1122334',
      address: 'Chak 45, Landowner',
      currentBalance: 8400,
      entries: [
        { type: 'DEBIT_PURCHASE', amount: 6600, description: 'چوکر 2 بوری', balanceAfter: 6600 },
        { type: 'DEBIT_PURCHASE', amount: 1800, description: 'گندم صفائی + پسائی (120 KG)', balanceAfter: 8400 },
      ],
    },
    { name: 'حاجی الطاف', phone: '0301-7654321', currentBalance: 0, entries: [] },
    { name: 'Haji Mushtaq', phone: '0302-3344556', currentBalance: 0, entries: [] },
    { name: 'Babar Hotel', phone: '0345-5566778', currentBalance: 0, entries: [] },
    { name: 'حاجی آصف', phone: '0300-9988776', currentBalance: 0, entries: [] },
  ];

  for (const cust of sampleCustomers) {
    let customer = await prisma.customer.findFirst({ where: { name: cust.name } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: cust.name,
          phone: cust.phone,
          address: cust.address,
          currentBalance: cust.currentBalance || 0,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          currentBalance: cust.currentBalance || customer.currentBalance,
          address: cust.address || customer.address,
        },
      });
    }

    if (adminUser && cust.entries && cust.entries.length > 0) {
      const entryCount = await prisma.ledgerEntry.count({ where: { customerId: customer.id } });
      if (entryCount === 0) {
        for (const entry of cust.entries) {
          await prisma.ledgerEntry.create({
            data: {
              customerId: customer.id,
              type: entry.type,
              amount: entry.amount,
              description: entry.description,
              balanceAfter: entry.balanceAfter,
              recordedById: adminUser.id,
            },
          });
        }
      }
    }
  }
  console.log('✓ Seeded customer profiles & initial ledger entries');

  console.log('\nSeed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
