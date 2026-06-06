const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const { createHttpError, logActivity } = require('../../utils/helpers');
const { sendPasswordResetEmail } = require('../../utils/emailSender');

const createAuthToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (payload) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw createHttpError('User already exists with this email', 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || 'PROCUREMENT_OFFICER',
    },
  });

  await logActivity(user.id, 'USER_REGISTERED', 'USER', user.id, { email: user.email, role: user.role });

  return {
    token: createAuthToken(user),
    user: sanitizeUser(user),
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createHttpError('Invalid email or password', 401);
  }

  return {
    token: createAuthToken(user),
    user: sanitizeUser(user),
  };
};

const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, purpose: 'reset-password' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  await logActivity(user.id, 'PASSWORD_RESET_REQUESTED', 'USER', user.id, { email: user.email });

  return { message: 'If the email exists, a password reset link has been sent' };
};

const resetPassword = async ({ token, password }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw createHttpError('Invalid or expired reset token', 401);
  }

  if (decoded.purpose !== 'reset-password') {
    throw createHttpError('Invalid reset token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw createHttpError('User not found', 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await logActivity(user.id, 'PASSWORD_RESET_COMPLETED', 'USER', user.id, { email: user.email });

  return { message: 'Password reset successful' };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createHttpError('User not found', 404);
  }

  return sanitizeUser(user);
};

const updateMe = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createHttpError('User not found', 404);
  }

  const updateData = {};
  if (payload.name) {
    updateData.name = payload.name;
  }

  if (payload.newPassword) {
    const passwordMatches = await bcrypt.compare(payload.currentPassword, user.password);
    if (!passwordMatches) {
      throw createHttpError('Current password is incorrect', 400);
    }

    updateData.password = await bcrypt.hash(payload.newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  await logActivity(userId, 'PROFILE_UPDATED', 'USER', userId, {
    changedName: Boolean(payload.name),
    changedPassword: Boolean(payload.newPassword),
  });

  return sanitizeUser(updatedUser);
};

module.exports = {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  updateMe,
};
