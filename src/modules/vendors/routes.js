const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  changeVendorStatusSchema,
  createVendorSchema,
  updateVendorSchema,
} = require('./schema');

router.get('/', verifyToken, controller.getAll);
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'PROCUREMENT_OFFICER'),
  validate(createVendorSchema),
  controller.create
);
router.get('/:id', verifyToken, controller.getById);
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'PROCUREMENT_OFFICER'),
  validate(updateVendorSchema),
  controller.update
);
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('ADMIN'),
  validate(changeVendorStatusSchema),
  controller.changeStatus
);
router.delete('/:id', verifyToken, requireRole('ADMIN'), controller.remove);
router.get('/:id/rfqs', verifyToken, controller.getVendorRFQs);
router.get('/:id/quotations', verifyToken, controller.getVendorQuotations);

module.exports = router;
