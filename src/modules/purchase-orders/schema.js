const { z } = require('zod');

const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['ISSUED', 'DELIVERED', 'CANCELLED']),
});

module.exports = {
  updatePurchaseOrderStatusSchema,
};
