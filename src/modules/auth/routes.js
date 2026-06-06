const router = require('express').Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateMeSchema,
} = require('./schema');

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.get('/me', verifyToken, controller.me);
router.put('/me', verifyToken, validate(updateMeSchema), controller.updateMe);

module.exports = router;
