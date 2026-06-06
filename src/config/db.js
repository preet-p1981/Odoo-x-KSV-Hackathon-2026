const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

if (!prisma.rfq && prisma.rFQ) {
  prisma.rfq = prisma.rFQ;
}
if (!prisma.rfqItem && prisma.rFQItem) {
  prisma.rfqItem = prisma.rFQItem;
}
if (!prisma.rfqVendor && prisma.rFQVendor) {
  prisma.rfqVendor = prisma.rFQVendor;
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
