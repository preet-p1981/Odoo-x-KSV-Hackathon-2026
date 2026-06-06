const prisma = require('../../config/db');
const {
  buildPaginatedData,
  createHttpError,
  generatePurchaseOrderNumber,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');

const approvalInclude = {
  approver: {
    select: { id: true, name: true, email: true, role: true },
  },
  quotation: {
    include: {
      items: true,
      vendor: {
        select: { id: true, name: true, email: true, rating: true },
      },
      rfq: {
        select: { id: true, rfqNumber: true, title: true, status: true },
      },
      purchaseOrder: {
        select: { id: true, poNumber: true, status: true, grandTotal: true },
      },
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = query.status ? { status: query.status } : {};

  const [items, total] = await Promise.all([
    prisma.approval.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: approvalInclude,
    }),
    prisma.approval.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const getById = async (id) => {
  const approval = await prisma.approval.findUnique({
    where: { id },
    include: approvalInclude,
  });

  if (!approval) {
    throw createHttpError('Approval not found', 404);
  }

  return {
    ...approval,
    timeline: [
      { event: 'REQUESTED', at: approval.createdAt, remarks: approval.remarks || null },
      ...(approval.updatedAt.getTime() !== approval.createdAt.getTime()
        ? [{ event: approval.status, at: approval.updatedAt, remarks: approval.remarks || null }]
        : []),
    ],
  };
};

const create = async (userId, payload) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: payload.quotationId },
    include: {
      approval: true,
      vendor: { select: { id: true, name: true, email: true } },
      rfq: { select: { id: true, rfqNumber: true, title: true } },
    },
  });

  if (!quotation) {
    throw createHttpError('Quotation not found', 404);
  }
  if (quotation.approval) {
    throw createHttpError('Approval request already exists for this quotation', 409);
  }

  const approver = await prisma.user.findUnique({ where: { id: payload.approverId } });
  if (!approver) {
    throw createHttpError('Approver not found', 404);
  }
  if (!['MANAGER', 'ADMIN'].includes(approver.role)) {
    throw createHttpError('Approver must have MANAGER or ADMIN role', 400);
  }

  const approval = await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: 'UNDER_REVIEW' },
    });

    return tx.approval.create({
      data: {
        quotationId: payload.quotationId,
        approverId: payload.approverId,
        remarks: payload.remarks || null,
      },
      include: approvalInclude,
    });
  });

  await logActivity(userId, 'APPROVAL_REQUEST_CREATED', 'APPROVAL', approval.id, {
    quotationId: quotation.id,
    approverId: payload.approverId,
  });

  return approval;
};

const approve = async (userId, id, remarks) => {
  const approval = await prisma.approval.findUnique({
    where: { id },
    include: approvalInclude,
  });

  if (!approval) {
    throw createHttpError('Approval not found', 404);
  }
  if (approval.status !== 'PENDING') {
    throw createHttpError('Approval request has already been processed', 400);
  }

  const poNumber = await generatePurchaseOrderNumber();
  const taxAmount = approval.quotation.totalAmount * 0.18;
  const grandTotal = approval.quotation.totalAmount + taxAmount;

  const { updatedApproval, createdPurchaseOrder } = await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id },
      data: {
        status: 'APPROVED',
        remarks: remarks || approval.remarks || null,
      },
    });

    await tx.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'ACCEPTED' },
    });

    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        poNumber,
        quotationId: approval.quotationId,
        vendorId: approval.quotation.vendor.id,
        totalAmount: approval.quotation.totalAmount,
        taxAmount,
        grandTotal,
        status: 'ISSUED',
      },
    });

    const refreshedApproval = await tx.approval.findUnique({
      where: { id },
      include: approvalInclude,
    });

    return {
      updatedApproval: refreshedApproval,
      createdPurchaseOrder: purchaseOrder,
    };
  });

  await logActivity(userId, 'APPROVAL_APPROVED', 'APPROVAL', id, {
    quotationId: approval.quotationId,
    poNumber,
    taxAmount,
    grandTotal,
  });
  await logActivity(userId, 'PURCHASE_ORDER_CREATED', 'PURCHASE_ORDER', createdPurchaseOrder.id, {
    poNumber,
    quotationId: approval.quotationId,
    vendorId: approval.quotation.vendor.id,
  });

  return updatedApproval;
};

const reject = async (userId, id, remarks) => {
  const approval = await prisma.approval.findUnique({ where: { id } });
  if (!approval) {
    throw createHttpError('Approval not found', 404);
  }
  if (approval.status !== 'PENDING') {
    throw createHttpError('Approval request has already been processed', 400);
  }

  const updatedApproval = await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id },
      data: { status: 'REJECTED', remarks },
    });

    await tx.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'REJECTED' },
    });

    return tx.approval.findUnique({
      where: { id },
      include: approvalInclude,
    });
  });

  await logActivity(userId, 'APPROVAL_REJECTED', 'APPROVAL', id, {
    quotationId: approval.quotationId,
    remarks,
  });

  return updatedApproval;
};

const getPending = async () => {
  return prisma.approval.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: approvalInclude,
  });
};

module.exports = {
  approve,
  create,
  getAll,
  getById,
  getPending,
  reject,
};
