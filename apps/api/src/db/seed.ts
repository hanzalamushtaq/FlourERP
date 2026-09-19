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
