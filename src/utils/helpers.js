const prisma = require('../config/db');

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parsePagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginatedData = (items, total, page, limit) => ({
  items,
  total,
  page,
  limit,
  pages: Math.ceil(total / limit) || 1,
});

const logActivity = async (userId, action, entity, entityId, meta = {}) => {
  await prisma.activityLog.create({
    data: {
      userId: userId || null,
      action,
      entity,
      entityId: entityId || null,
      meta,
    },
  });
};

const padNumber = (value, size = 4) => String(value).padStart(size, '0');

const generatePurchaseOrderNumber = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const prefix = `PO-${year}${month}`;
  const count = await prisma.purchaseOrder.count({
    where: {
      poNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}-${padNumber(count + 1)}`;
};

const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const prefix = `INV-${year}`;
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}-${padNumber(count + 1)}`;
};

const toPublicFileUrl = (req, filePath) => {
  if (!filePath) {
    return null;
  }

  const normalized = String(filePath).replace(/\\/g, '/').replace(/^\/+/, '');
  return `${req.protocol}://${req.get('host')}/${normalized}`;
};

const escapeCsv = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const normalizedValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  const stringValue = normalizedValue.replace(/"/g, '""');
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
};

const jsonToCsv = (rows = []) => {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
  }

  return lines.join('\n');
};

module.exports = {
  buildPaginatedData,
  createHttpError,
  generateInvoiceNumber,
  generatePurchaseOrderNumber,
  jsonToCsv,
  logActivity,
  parsePagination,
  toPublicFileUrl,
};
