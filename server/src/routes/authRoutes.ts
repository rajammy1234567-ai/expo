import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(authRateLimiter);

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/demo-login', AuthController.demoLogin);
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
