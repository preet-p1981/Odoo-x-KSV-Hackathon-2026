const prisma = require('../../config/db');
const { generatePurchaseOrderPDF } = require('../../utils/pdfGenerator');
const {
  buildPaginatedData,
  createHttpError,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');

const poInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      category: true,
      gstNumber: true,
      rating: true,
    },
  },
  quotation: {
    include: {
      items: true,
      rfq: {
        select: {
          id: true,
          rfqNumber: true,
          title: true,
          deadline: true,
        },
      },
    },
  },
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      dueDate: true,
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.vendorId ? { vendorId: query.vendorId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: poInclude,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const getById = async (id) => {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: poInclude,
  });

  if (!purchaseOrder) {
    throw createHttpError('Purchase order not found', 404);
  }

  return purchaseOrder;
};

const updateStatus = async (userId, id, status) => {
  await getById(id);
  const purchaseOrder = await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
    include: poInclude,
  });

  await logActivity(userId, 'PURCHASE_ORDER_STATUS_UPDATED', 'PURCHASE_ORDER', id, { status });
  return purchaseOrder;
};

const getPdfData = async (id) => {
  const purchaseOrder = await getById(id);
  const pdfBuffer = await generatePurchaseOrderPDF(
    purchaseOrder,
    purchaseOrder.vendor,
    purchaseOrder.quotation,
    purchaseOrder.quotation.items
  );

  return {
    fileName: `${purchaseOrder.poNumber}.pdf`,
    buffer: pdfBuffer,
    purchaseOrder,
  };
};

module.exports = {
  getAll,
  getById,
  getPdfData,
  updateStatus,
};
