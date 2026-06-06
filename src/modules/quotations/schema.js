const { z } = require('zod');

const quotationItemSchema = z.object({
  name: z.string().trim().min(1).max(150),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
});

const createQuotationSchema = z.object({
  rfqId: z.string().uuid(),
  vendorId: z.string().uuid().optional(),
  deliveryDays: z.number().int().positive(),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  items: z.array(quotationItemSchema).min(1),
  totalAmount: z.number().positive(),
});

const updateQuotationSchema = z.object({
  deliveryDays: z.number().int().positive().optional(),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  items: z.array(quotationItemSchema).min(1).optional(),
  totalAmount: z.number().positive().optional(),
});

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
};
