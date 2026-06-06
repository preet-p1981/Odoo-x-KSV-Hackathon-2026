const fs = require('fs/promises');
const path = require('path');
const prisma = require('../../config/db');
const {
  buildPaginatedData,
  createHttpError,
  logActivity,
  parsePagination,
} = require('../../utils/helpers');
const { sendRFQInvitationEmail } = require('../../utils/emailSender');

const rfqInclude = {
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  items: true,
  attachments: true,
  vendors: {
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          category: true,
          status: true,
          rating: true,
        },
      },
    },
  },
  quotations: {
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
        },
      },
      items: true,
      approval: true,
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const search = query.search?.trim();
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.createdById ? { createdById: query.createdById } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { rfqNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.rfq.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: true,
        vendors: {
          include: {
            vendor: {
              select: { id: true, name: true, email: true, status: true },
            },
          },
        },
      },
    }),
    prisma.rfq.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const getById = async (id) => {
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: rfqInclude,
  });

  if (!rfq) {
    throw createHttpError('RFQ not found', 404);
  }

  return rfq;
};

const validateVendors = async (vendorIds) => {
  const vendors = await prisma.vendor.findMany({
    where: {
      id: { in: vendorIds },
    },
  });

  if (vendors.length !== vendorIds.length) {
    throw createHttpError('One or more vendors were not found', 404);
  }

  return vendors;
};

const create = async (userId, payload) => {
  if (payload.deadline <= new Date()) {
    throw createHttpError('Deadline must be in the future', 400);
  }

  await validateVendors(payload.vendorIds);

  const rfq = await prisma.rfq.create({
    data: {
      title: payload.title,
      description: payload.description || null,
      deadline: payload.deadline,
      createdById: userId,
      items: {
        create: payload.items.map((item) => ({
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit || null,
        })),
      },
      vendors: {
        create: payload.vendorIds.map((vendorId) => ({ vendorId })),
      },
    },
    include: rfqInclude,
  });

  await logActivity(userId, 'RFQ_CREATED', 'RFQ', rfq.id, {
    rfqNumber: rfq.rfqNumber,
    vendorCount: payload.vendorIds.length,
  });

  return rfq;
};

const update = async (userId, id, payload) => {
  const existing = await getById(id);
  if (existing.status !== 'DRAFT') {
    throw createHttpError('Only DRAFT RFQs can be updated', 400);
  }

  if (payload.deadline && payload.deadline <= new Date()) {
    throw createHttpError('Deadline must be in the future', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.rFQ.update({
      where: { id },
      data: {
        title: payload.title ?? existing.title,
        description:
          payload.description !== undefined
            ? payload.description || null
            : existing.description,
        deadline: payload.deadline ?? existing.deadline,
      },
    });

    if (payload.items) {
      await tx.rFQItem.deleteMany({ where: { rfqId: id } });
      await tx.rFQItem.createMany({
        data: payload.items.map((item) => ({
          rfqId: id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit || null,
        })),
      });
    }
  });

  const rfq = await getById(id);
  await logActivity(userId, 'RFQ_UPDATED', 'RFQ', id, { updatedFields: Object.keys(payload) });
  return rfq;
};

const publish = async (userId, id) => {
  const rfq = await getById(id);
  if (rfq.status !== 'DRAFT') {
    throw createHttpError('Only DRAFT RFQs can be published', 400);
  }
  if (!rfq.vendors.length) {
    throw createHttpError('At least one vendor must be assigned before publishing', 400);
  }

  const updated = await prisma.rfq.update({
    where: { id },
    data: { status: 'PUBLISHED' },
    include: rfqInclude,
  });

  await Promise.all(
    updated.vendors.map(({ vendor }) =>
      sendRFQInvitationEmail({
        to: vendor.email,
        vendorName: vendor.name,
        rfqTitle: updated.title,
        rfqNumber: updated.rfqNumber,
        deadline: updated.deadline,
      })
    )
  );

  await logActivity(userId, 'RFQ_PUBLISHED', 'RFQ', id, {
    rfqNumber: updated.rfqNumber,
    invitedVendors: updated.vendors.length,
  });

  return updated;
};

const close = async (userId, id) => {
  const rfq = await getById(id);
  if (rfq.status !== 'PUBLISHED') {
    throw createHttpError('Only PUBLISHED RFQs can be closed', 400);
  }

  const updated = await prisma.rfq.update({
    where: { id },
    data: { status: 'CLOSED' },
    include: rfqInclude,
  });

  await logActivity(userId, 'RFQ_CLOSED', 'RFQ', id, { rfqNumber: updated.rfqNumber });
  return updated;
};

const cancel = async (userId, id) => {
  const rfq = await getById(id);
  if (rfq.status !== 'DRAFT') {
    throw createHttpError('Only DRAFT RFQs can be cancelled', 400);
  }

  const updated = await prisma.rfq.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: rfqInclude,
  });

  await logActivity(userId, 'RFQ_CANCELLED', 'RFQ', id, { rfqNumber: updated.rfqNumber });
  return updated;
};

const assignVendors = async (userId, id, vendorIds) => {
  await getById(id);
  await validateVendors(vendorIds);

  await prisma.rFQVendor.createMany({
    data: vendorIds.map((vendorId) => ({ rfqId: id, vendorId })),
    skipDuplicates: true,
  });

  const rfq = await getById(id);
  await logActivity(userId, 'RFQ_VENDORS_ASSIGNED', 'RFQ', id, { vendorIds });
  return rfq;
};

const addAttachment = async (userId, rfqId, file) => {
  await getById(rfqId);
  if (!file) {
    throw createHttpError('File is required', 400);
  }

  const attachment = await prisma.attachment.create({
    data: {
      rfqId,
      fileName: file.originalname,
      fileUrl: `/uploads/rfqs/${file.filename}`,
      fileSize: file.size,
    },
  });

  await logActivity(userId, 'RFQ_ATTACHMENT_ADDED', 'RFQ', rfqId, {
    attachmentId: attachment.id,
    fileName: attachment.fileName,
  });

  return attachment;
};

const removeAttachment = async (userId, rfqId, attachmentId) => {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      rfqId,
    },
  });

  if (!attachment) {
    throw createHttpError('Attachment not found', 404);
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });

  const filePath = path.join(process.cwd(), attachment.fileUrl.replace(/^\//, ''));
  await fs.unlink(filePath).catch(() => {});

  await logActivity(userId, 'RFQ_ATTACHMENT_REMOVED', 'RFQ', rfqId, {
    attachmentId,
    fileName: attachment.fileName,
  });

  return { id: attachmentId };
};

module.exports = {
  addAttachment,
  assignVendors,
  cancel,
  close,
  create,
  getAll,
  getById,
  publish,
  removeAttachment,
  update,
};
