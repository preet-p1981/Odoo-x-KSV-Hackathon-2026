const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  approveApprovalSchema,
  createApprovalSchema,
  rejectApprovalSchema,
} = require('./schema');

router.get('/', verifyToken, requireRole('MANAGER', 'ADMIN'), controller.getAll);
router.post('/', verifyToken, requireRole('PROCUREMENT_OFFICER'), validate(createApprovalSchema), controller.create);
router.get('/pending', verifyToken, requireRole('MANAGER', 'ADMIN'), controller.getPending);
router.get('/:id', verifyToken, controller.getById);
router.patch(
  '/:id/approve',
  verifyToken,
  requireRole('MANAGER', 'ADMIN'),
  validate(approveApprovalSchema),
  controller.approve
);
router.patch(
  '/:id/reject',
  verifyToken,
  requireRole('MANAGER', 'ADMIN'),
  validate(rejectApprovalSchema),
  controller.reject
);

module.exports = router;
