const { z } = require('zod');

const createApprovalSchema = z.object({
  quotationId: z.string().uuid(),
  approverId: z.string().uuid(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

const approveApprovalSchema = z.object({
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

const rejectApprovalSchema = z.object({
  remarks: z.string().trim().min(3).max(500),
});

module.exports = {
  approveApprovalSchema,
  createApprovalSchema,
  rejectApprovalSchema,
};
