const { z } = require('zod');

const rfqItemSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(255).optional().or(z.literal('')),
  quantity: z.number().int().positive(),
  unit: z.string().trim().max(50).optional().or(z.literal('')),
});

const createRFQSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  deadline: z.coerce.date(),
  vendorIds: z.array(z.string().uuid()).min(1),
  items: z.array(rfqItemSchema).min(1),
});

const updateRFQSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  deadline: z.coerce.date().optional(),
  items: z.array(rfqItemSchema).min(1).optional(),
});

const assignVendorsSchema = z.object({
  vendorIds: z.array(z.string().uuid()).min(1),
});

module.exports = {
  assignVendorsSchema,
  createRFQSchema,
  updateRFQSchema,
};
