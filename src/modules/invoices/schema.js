const { z } = require('zod');

const createInvoiceSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  dueDate: z.coerce.date(),
});

const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
});

const sendInvoiceEmailSchema = z.object({
  recipientEmail: z.string().trim().email(),
  message: z.string().trim().min(3).max(1000),
});

module.exports = {
  createInvoiceSchema,
  sendInvoiceEmailSchema,
  updateInvoiceStatusSchema,
};
