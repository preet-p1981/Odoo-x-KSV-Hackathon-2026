require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const prisma = require('./config/db');

const authRoutes = require('./modules/auth/routes');
const vendorRoutes = require('./modules/vendors/routes');
const rfqRoutes = require('./modules/rfq/routes');
const quotationRoutes = require('./modules/quotations/routes');
const approvalRoutes = require('./modules/approvals/routes');
const purchaseOrderRoutes = require('./modules/purchase-orders/routes');
const invoiceRoutes = require('./modules/invoices/routes');
const activityLogRoutes = require('./modules/activity-logs/routes');
const reportRoutes = require('./modules/reports/routes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

app.get('/health', (_req, res) => {
  return res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({ error: message || 'Request failed' });
});

let server;

const shutdown = async (signal) => {
  console.info(`${signal} received. Shutting down VendorBridge API...`);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(async () => {
      await prisma.$disconnect();
      process.exit(1);
    }, 10000).unref();
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

const start = async () => {
  try {
    await prisma.$connect();
    server = app.listen(PORT, () => console.log('VendorBridge API running'));
  } catch (error) {
    console.error('Failed to start VendorBridge API', error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error('Graceful shutdown failed', error);
      process.exit(1);
    });
  });
});

start();

module.exports = app;
