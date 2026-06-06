const prisma = require('../../config/db');
const { jsonToCsv } = require('../../utils/helpers');

const getDashboard = async () => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [pendingApprovals, activeRFQs, recentPOs, recentInvoices, monthlyPOs, topVendorRows] = await Promise.all([
    prisma.approval.count({ where: { status: 'PENDING' } }),
    prisma.rfq.count({ where: { status: 'PUBLISHED' } }),
    prisma.purchaseOrder.count(),
    prisma.invoice.count(),
    prisma.purchaseOrder.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { grandTotal: true },
    }),
    prisma.vendor.findMany({
      include: {
        purchaseOrders: {
          select: { grandTotal: true },
        },
      },
    }),
  ]);

  const totalSpendThisMonth = monthlyPOs.reduce((sum, po) => sum + po.grandTotal, 0);
  const topVendors = topVendorRows
    .map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      rating: vendor.rating,
      totalSpend: vendor.purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0),
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  return {
    pendingApprovals,
    activeRFQs,
    recentPOs,
    recentInvoices,
    totalSpendThisMonth,
    topVendors,
  };
};

const getSpending = async () => {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: {
        select: { id: true, name: true, category: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = new Map();
  for (const po of purchaseOrders) {
    const month = po.createdAt.toISOString().slice(0, 7);
    const key = `${month}:${po.vendorId}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        month,
        vendorId: po.vendor.id,
        vendorName: po.vendor.name,
        category: po.vendor.category || 'Uncategorized',
        totalSpend: 0,
        purchaseOrderCount: 0,
      });
    }
    const row = grouped.get(key);
    row.totalSpend += po.grandTotal;
    row.purchaseOrderCount += 1;
  }

  return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
};

const getVendorPerformance = async () => {
  const vendors = await prisma.vendor.findMany({
    include: {
      quotations: {
        select: { status: true },
      },
      purchaseOrders: {
        select: { status: true },
      },
    },
  });

  return vendors.map((vendor) => {
    const totalQuotations = vendor.quotations.length;
    const acceptedQuotations = vendor.quotations.filter((q) => q.status === 'ACCEPTED').length;
    const totalPurchaseOrders = vendor.purchaseOrders.length;
    const deliveredPOs = vendor.purchaseOrders.filter((po) => po.status === 'DELIVERED').length;

    return {
      id: vendor.id,
      name: vendor.name,
      rating: vendor.rating || 0,
      totalQuotations,
      acceptedQuotations,
      winRate: totalQuotations ? Number(((acceptedQuotations / totalQuotations) * 100).toFixed(2)) : 0,
      totalPurchaseOrders,
      deliveredPOs,
      onTimeDeliveryRate: totalPurchaseOrders
        ? Number(((deliveredPOs / totalPurchaseOrders) * 100).toFixed(2))
        : 0,
    };
  });
};

const getProcurementTrend = async () => {
  const rfqs = await prisma.rfq.findMany({
    include: {
      quotations: {
        include: {
          purchaseOrder: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = new Map();
  for (const rfq of rfqs) {
    const month = rfq.createdAt.toISOString().slice(0, 7);
    if (!grouped.has(month)) {
      grouped.set(month, { month, rfqCount: 0, convertedToPO: 0, conversionRate: 0 });
    }
    const row = grouped.get(month);
    row.rfqCount += 1;
    const converted = rfq.quotations.some((quotation) => quotation.purchaseOrder);
    if (converted) {
      row.convertedToPO += 1;
    }
  }

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    conversionRate: row.rfqCount ? Number(((row.convertedToPO / row.rfqCount) * 100).toFixed(2)) : 0,
  }));
};

const exportCsv = async () => {
  const [dashboard, spending, vendorPerformance, procurementTrend] = await Promise.all([
    getDashboard(),
    getSpending(),
    getVendorPerformance(),
    getProcurementTrend(),
  ]);

  const sections = [];
  sections.push('DASHBOARD');
  sections.push(jsonToCsv([dashboard]));
  sections.push('');
  sections.push('SPENDING');
  sections.push(jsonToCsv(spending));
  sections.push('');
  sections.push('VENDOR_PERFORMANCE');
  sections.push(jsonToCsv(vendorPerformance));
  sections.push('');
  sections.push('PROCUREMENT_TREND');
  sections.push(jsonToCsv(procurementTrend));

  return sections.join('\n');
};

module.exports = {
  exportCsv,
  getDashboard,
  getProcurementTrend,
  getSpending,
  getVendorPerformance,
};
