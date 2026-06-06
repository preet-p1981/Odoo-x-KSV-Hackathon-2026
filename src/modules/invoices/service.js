const prisma = require('../../config/db');
const { sendInvoiceEmail } = require('../../utils/emailSender');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const {
  buildPaginatedData,
  createHttpError,
  generateInvoiceNumber,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');

const invoiceInclude = {
  purchaseOrder: {
    select: {
      id: true,
      poNumber: true,
      status: true,
      totalAmount: true,
      taxAmount: true,
      grandTotal: true,
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
          items: true,
        },
      },
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = query.status ? { status: query.status } : {};

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: invoiceInclude,
    }),
    prisma.invoice.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const getById = async (id) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });

  if (!invoice) {
    throw createHttpError('Invoice not found', 404);
  }

  return invoice;
};

const create = async (userId, payload) => {
  if (payload.dueDate <= new Date()) {
    throw createHttpError('dueDate must be in the future', 400);
  }

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: payload.purchaseOrderId },
    include: { invoice: true },
  });
  if (!purchaseOrder) {
    throw createHttpError('Purchase order not found', 404);
  }
  if (purchaseOrder.invoice) {
    throw createHttpError('Invoice already exists for this purchase order', 409);
  }

  const invoiceNumber = await generateInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      purchaseOrderId: payload.purchaseOrderId,
      dueDate: payload.dueDate,
    },
    include: invoiceInclude,
  });

  await logActivity(userId, 'INVOICE_CREATED', 'INVOICE', invoice.id, {
    invoiceNumber,
    purchaseOrderId: payload.purchaseOrderId,
  });

  return invoice;
};

const updateStatus = async (userId, id, status) => {
  await getById(id);
  const updateData = { status };

  if (status === 'PAID') {
    updateData.paidAt = new Date();
  }
  if (status === 'SENT') {
    updateData.sentAt = new Date();
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: invoiceInclude,
  });

  await logActivity(userId, 'INVOICE_STATUS_UPDATED', 'INVOICE', id, { status });
  return invoice;
};

const getPdfData = async (id) => {
  const invoice = await getById(id);
  const pdfBuffer = await generateInvoicePDF(
    invoice,
    invoice.purchaseOrder,
    invoice.purchaseOrder.vendor,
    invoice.purchaseOrder.quotation.items
  );

  return {
    fileName: `${invoice.invoiceNumber}.pdf`,
    buffer: pdfBuffer,
    invoice,
  };
};

const sendEmail = async (userId, id, payload) => {
  const { buffer, fileName, invoice } = await getPdfData(id);

  await sendInvoiceEmail({
    to: payload.recipientEmail,
    subject: `Invoice ${invoice.invoiceNumber}`,
    message: payload.message,
    pdfBuffer: buffer,
    fileName,
  });

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
    include: invoiceInclude,
  });

  await logActivity(userId, 'INVOICE_EMAIL_SENT', 'INVOICE', id, {
    recipientEmail: payload.recipientEmail,
  });

  return updatedInvoice;
};

module.exports = {
  create,
  getAll,
  getById,
  getPdfData,
  sendEmail,
  updateStatus,
};
