import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

const origTransaction = basePrisma.$transaction.bind(basePrisma);
(basePrisma as any).$transaction = (arg: any, options?: any) => {
  if (typeof arg === 'function') {
    return origTransaction(arg, {
      maxWait: 15000,
      timeout: 30000,
      ...options,
    });
  }
  return origTransaction(arg, options);
};

export const prisma = basePrisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;
