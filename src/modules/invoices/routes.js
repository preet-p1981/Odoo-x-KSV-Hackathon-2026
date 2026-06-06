const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  createInvoiceSchema,
  sendInvoiceEmailSchema,
  updateInvoiceStatusSchema,
} = require('./schema');

router.get('/', verifyToken, controller.getAll);
router.post(
  '/',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(createInvoiceSchema),
  controller.create
);
router.get('/:id', verifyToken, controller.getById);
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('ADMIN'),
  validate(updateInvoiceStatusSchema),
  controller.updateStatus
);
router.get('/:id/pdf', verifyToken, controller.downloadPdf);
router.post(
  '/:id/send-email',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(sendInvoiceEmailSchema),
  controller.sendEmail
);

module.exports = router;
