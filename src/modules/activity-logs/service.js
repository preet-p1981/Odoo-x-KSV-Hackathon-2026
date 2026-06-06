const prisma = require('../../config/db');
const { buildPaginatedData, parsePagination } = require('../../utils/helpers');

const baseInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
    },
  },
};

const getAll = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.entity ? { entity: query.entity } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: baseInclude,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return buildPaginatedData(items, total, page, limit);
};

const getMine = async (userId, query) => {
  return getAll({ ...query, userId });
};

const getByEntity = async (entity, id, query) => {
  return getAll({ ...query, entity, entityId: id });
};

module.exports = {
  getAll,
  getByEntity,
  getMine,
};
