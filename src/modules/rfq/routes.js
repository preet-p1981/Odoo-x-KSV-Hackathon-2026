const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { assignVendorsSchema, createRFQSchema, updateRFQSchema } = require('./schema');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'rfqs'));
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', verifyToken, controller.getAll);
router.post(
  '/',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(createRFQSchema),
  controller.create
);
router.get('/:id', verifyToken, controller.getById);
router.put(
  '/:id',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(updateRFQSchema),
  controller.update
);
router.patch('/:id/publish', verifyToken, requireRole('PROCUREMENT_OFFICER', 'ADMIN'), controller.publish);
router.patch('/:id/close', verifyToken, requireRole('PROCUREMENT_OFFICER', 'ADMIN'), controller.close);
router.delete('/:id', verifyToken, requireRole('PROCUREMENT_OFFICER', 'ADMIN'), controller.cancel);
router.post(
  '/:id/vendors',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  validate(assignVendorsSchema),
  controller.assignVendors
);
router.post(
  '/:id/attachments',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  upload.single('file'),
  controller.addAttachment
);
router.delete(
  '/:id/attachments/:attachmentId',
  verifyToken,
  requireRole('PROCUREMENT_OFFICER', 'ADMIN'),
  controller.removeAttachment
);
router.get('/:rfqId/quotations/compare', verifyToken, controller.compareQuotations);

module.exports = router;
