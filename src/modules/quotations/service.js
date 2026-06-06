const prisma = require('../../config/db');
const {
  buildPaginatedData,
  createHttpError,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');

const quotationInclude = {
  items: true,
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      rating: true,
      status: true,
    },
  },
  rfq: {
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      deadline: true,
      status: true,
    },
  },
  approval: true,
  purchaseOrder: {
    select: {
      id: true,
      poNumber: true,
      status: true,
      grandTotal: true,
    },
  },
};

const resolveVendorId = async (user, vendorId) => {
  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { email: user.email } });
    if (!vendor) {
      throw createHttpError('No vendor profile found for this account', 403);
    }
    return vendor.id;
  }

  if (!vendorId) {
    throw createHttpError('vendorId is required', 400);
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    throw createHttpError('Vendor not found', 404);
  }

  return vendor.id;
};

const ensureQuotationOwnership = async (quotationId, user) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: quotationInclude,
  });

  if (!quotation) {
    throw createHttpError('Quotation not found', 404);
  }

  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { email: user.email } });
    if (!vendor || vendor.id !== quotation.vendorId) {
      throw createHttpError('Forbidden', 403);
    }
  }

  return quotation;
};

const validateRfqForSubmission = async (rfqId, vendorId) => {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId }, include: { vendors: true } });
  if (!rfq) {
    throw createHttpError('RFQ not found', 404);
  }
  if (rfq.status !== 'PUBLISHED') {
    throw createHttpError('Quotations can only be submitted for published RFQs', 400);
  }
  if (new Date(rfq.deadline) < new Date()) {
    throw createHttpError('RFQ deadline has passed', 400);
  }
  const isAssigned = rfq.vendors.some((item) => item.vendorId === vendorId);
  if (!isAssigned) {
    throw createHttpError('Vendor is not assigned to this RFQ', 403);
  }
  return rfq;
};

const getAll = async (query, user) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    ...(query.rfqId ? { rfqId: query.rfqId } : {}),
    ...(query.vendorId ? { vendorId: query.vendorId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { email: user.email } });
    if (!vendor) {
      throw createHttpError('No vendor profile found for this account', 403);
    }
    where.vendorId = vendor.id;
  }

  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: quotationInclude,
    }),
    prisma.quotation.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const create = async (user, payload) => {
  const vendorId = await resolveVendorId(user, payload.vendorId);
  await validateRfqForSubmission(payload.rfqId, vendorId);

  const existing = await prisma.quotation.findFirst({
    where: {
      rfqId: payload.rfqId,
      vendorId,
    },
  });
  if (existing) {
    throw createHttpError('Quotation already submitted for this RFQ by this vendor', 409);
  }

  const calculatedTotal = payload.items.reduce((sum, item) => sum + item.totalPrice, 0);
  if (Math.abs(calculatedTotal - payload.totalAmount) > 0.01) {
    throw createHttpError('totalAmount must match the sum of item totalPrice values', 400);
  }

  const quotation = await prisma.quotation.create({
    data: {
      rfqId: payload.rfqId,
      vendorId,
      deliveryDays: payload.deliveryDays,
      notes: payload.notes || null,
      totalAmount: payload.totalAmount,
      items: {
        create: payload.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
    },
    include: quotationInclude,
  });

  await logActivity(user.id, 'QUOTATION_SUBMITTED', 'QUOTATION', quotation.id, {
    quotationNumber: quotation.quotationNumber,
    rfqId: quotation.rfqId,
  });

  return quotation;
};

const getById = async (id, user) => ensureQuotationOwnership(id, user);

const update = async (user, id, payload) => {
  const existing = await ensureQuotationOwnership(id, user);
  if (existing.status !== 'SUBMITTED') {
    throw createHttpError('Only SUBMITTED quotations can be edited', 400);
  }

  const nextTotal = payload.items
    ? payload.items.reduce((sum, item) => sum + item.totalPrice, 0)
    : payload.totalAmount ?? existing.totalAmount;

  if (payload.totalAmount !== undefined && payload.items && Math.abs(nextTotal - payload.totalAmount) > 0.01) {
    throw createHttpError('totalAmount must match the sum of item totalPrice values', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id },
      data: {
        deliveryDays: payload.deliveryDays ?? existing.deliveryDays,
        notes: payload.notes !== undefined ? payload.notes || null : existing.notes,
        totalAmount: payload.totalAmount ?? nextTotal,
      },
    });

    if (payload.items) {
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      await tx.quotationItem.createMany({
        data: payload.items.map((item) => ({
          quotationId: id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      });
    }
  });

  const quotation = await ensureQuotationOwnership(id, user);
  await logActivity(user.id, 'QUOTATION_UPDATED', 'QUOTATION', id, { updatedFields: Object.keys(payload) });
  return quotation;
};

const compareByRFQ = async (rfqId) => {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    throw createHttpError('RFQ not found', 404);
  }

  const quotations = await prisma.quotation.findMany({
    where: { rfqId },
    orderBy: { totalAmount: 'asc' },
    include: {
      items: true,
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          category: true,
        },
      },
    },
  });

  const lowestAmount = quotations.length ? quotations[0].totalAmount : null;
  return quotations.map((quotation) => ({
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    totalAmount: quotation.totalAmount,
    deliveryDays: quotation.deliveryDays,
    status: quotation.status,
    notes: quotation.notes,
    vendor: quotation.vendor,
    items: quotation.items,
    isLowestPrice: lowestAmount !== null && quotation.totalAmount === lowestAmount,
  }));
};

module.exports = {
  compareByRFQ,
  create,
  getAll,
  getById,
  update,
};
