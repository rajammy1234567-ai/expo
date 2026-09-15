import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(authRateLimiter);

router.post('/check-identifier', AuthController.checkIdentifier);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/demo-login', AuthController.demoLogin);
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/update-role', authenticateJWT, AuthController.updateRole);
router.get('/me', authenticateJWT, AuthController.getMe);
router.get('/stats', AuthController.getStats);

export default router;
