const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { updatePurchaseOrderStatusSchema } = require('./schema');

router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getById);
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(updatePurchaseOrderStatusSchema),
  controller.updateStatus
);
router.get('/:id/pdf', verifyToken, controller.downloadPdf);

module.exports = router;
