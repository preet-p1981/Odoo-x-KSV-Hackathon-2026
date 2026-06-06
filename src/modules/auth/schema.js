const { z } = require('zod');

const roles = ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'];

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  role: z.enum(roles).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    currentPassword: z.string().min(8).max(100).optional(),
    newPassword: z.string().min(8).max(100).optional(),
  })
  .refine((data) => !(data.newPassword && !data.currentPassword), {
    message: 'currentPassword is required when changing password',
    path: ['currentPassword'],
  });

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateMeSchema,
};
