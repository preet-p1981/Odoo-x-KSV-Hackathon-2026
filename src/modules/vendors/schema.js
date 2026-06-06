const { z } = require('zod');

const vendorStatus = ['ACTIVE', 'INACTIVE', 'BLACKLISTED'];

const baseVendorSchema = {
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5).max(30).optional().or(z.literal('')),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  category: z.string().trim().max(100).optional().or(z.literal('')),
  gstNumber: z.string().trim().max(100).optional().or(z.literal('')),
  rating: z.number().min(0).max(5).optional(),
};

const createVendorSchema = z.object(baseVendorSchema);

const updateVendorSchema = z.object({
  name: baseVendorSchema.name.optional(),
  email: baseVendorSchema.email.optional(),
  phone: baseVendorSchema.phone.optional(),
  address: baseVendorSchema.address.optional(),
  category: baseVendorSchema.category.optional(),
  gstNumber: baseVendorSchema.gstNumber.optional(),
  rating: baseVendorSchema.rating.optional(),
});

const changeVendorStatusSchema = z.object({
  status: z.enum(vendorStatus),
});

module.exports = {
  changeVendorStatusSchema,
  createVendorSchema,
  updateVendorSchema,
};
