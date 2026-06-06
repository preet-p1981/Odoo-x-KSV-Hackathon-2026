const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');

router.get('/', verifyToken, requireRole('ADMIN', 'MANAGER'), controller.getAll);
router.get('/mine', verifyToken, controller.getMine);
router.get('/entity/:entity/:id', verifyToken, controller.getByEntity);

module.exports = router;
