const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createQuotationSchema, updateQuotationSchema } = require('./schema');

router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, requireRole('VENDOR'), validate(createQuotationSchema), controller.create);
router.get('/:id', verifyToken, controller.getById);
router.put('/:id', verifyToken, requireRole('VENDOR'), validate(updateQuotationSchema), controller.update);

module.exports = router;
