import { Router } from 'express';
import { DealController } from '../controllers/dealController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, DealController.getDeals);
router.post('/record', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), DealController.recordDeal);
router.post('/create', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), DealController.recordDeal);
router.get('/brand/:brandId', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), DealController.getBrandDeals);

export default router;
