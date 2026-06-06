const router = require('express').Router();
const controller = require('./controller');
const { verifyToken, requireRole } = require('../../middleware/auth');

router.get('/dashboard', verifyToken, controller.dashboard);
router.get('/spending', verifyToken, requireRole('ADMIN', 'MANAGER'), controller.spending);
router.get('/vendor-performance', verifyToken, requireRole('ADMIN', 'MANAGER'), controller.vendorPerformance);
router.get('/procurement-trend', verifyToken, requireRole('ADMIN', 'MANAGER'), controller.procurementTrend);
router.get('/export', verifyToken, requireRole('ADMIN', 'MANAGER'), controller.exportCsv);

module.exports = router;
