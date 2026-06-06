const prisma = require('../../config/db');
const {
  buildPaginatedData,
  createHttpError,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');

const vendorInclude = {
  rfqVendors: {
    include: {
      rfq: {
        select: {
          id: true,
          rfqNumber: true,
          title: true,
          deadline: true,
          status: true,
        },
      },
    },
  },
  quotations: {
    select: {
      id: true,
      quotationNumber: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      rfq: {
        select: {
          id: true,
          rfqNumber: true,
          title: true,
        },
      },
    },
  },
  purchaseOrders: {
    select: {
      id: true,
      poNumber: true,
      status: true,
      grandTotal: true,
      createdAt: true,
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const search = query.search?.trim();
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const sortBy = ['name', 'email', 'createdAt', 'updatedAt', 'rating'].includes(query.sortBy)
    ? query.sortBy
    : 'createdAt';
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        category: true,
        gstNumber: true,
        status: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const create = async (userId, payload) => {
  const existing = await prisma.vendor.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw createHttpError('Vendor already exists with this email', 409);
  }

  const vendor = await prisma.vendor.create({
    data: {
      ...payload,
      phone: payload.phone || null,
      address: payload.address || null,
      category: payload.category || null,
      gstNumber: payload.gstNumber || null,
    },
  });

  await logActivity(userId, 'VENDOR_CREATED', 'VENDOR', vendor.id, { email: vendor.email });
  return vendor;
};

const getById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: vendorInclude,
  });

  if (!vendor) {
    throw createHttpError('Vendor not found', 404);
  }

  return vendor;
};

const update = async (userId, id, payload) => {
  await getById(id);

  if (payload.email) {
    const existing = await prisma.vendor.findFirst({
      where: {
        email: payload.email,
        NOT: { id },
      },
    });

    if (existing) {
      throw createHttpError('Another vendor already uses this email', 409);
    }
  }

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      ...payload,
      phone: payload.phone === '' ? null : payload.phone,
      address: payload.address === '' ? null : payload.address,
      category: payload.category === '' ? null : payload.category,
      gstNumber: payload.gstNumber === '' ? null : payload.gstNumber,
    },
  });

  await logActivity(userId, 'VENDOR_UPDATED', 'VENDOR', vendor.id, { updatedFields: Object.keys(payload) });
  return vendor;
};

const changeStatus = async (userId, id, status) => {
  await getById(id);
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status },
  });

  await logActivity(userId, 'VENDOR_STATUS_CHANGED', 'VENDOR', vendor.id, { status });
  return vendor;
};

const remove = async (userId, id) => {
  await getById(id);

  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status: 'INACTIVE' },
  });

  await logActivity(userId, 'VENDOR_SOFT_DELETED', 'VENDOR', vendor.id, { status: 'INACTIVE' });
  return { id: vendor.id, status: vendor.status };
};

const getVendorRFQs = async (id) => {
  await getById(id);

  return prisma.rfqVendor.findMany({
    where: { vendorId: id },
    orderBy: { invitedAt: 'desc' },
    include: {
      rfq: {
        include: {
          items: true,
          attachments: true,
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });
};

const getVendorQuotations = async (id) => {
  await getById(id);

  return prisma.quotation.findMany({
    where: { vendorId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
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
    },
  });
};

module.exports = {
  changeStatus,
  create,
  getAll,
  getById,
  getVendorQuotations,
  getVendorRFQs,
  remove,
  update,
};
