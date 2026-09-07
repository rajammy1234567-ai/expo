import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

// Strictly protect all admin endpoints for VIZ_ADMIN only
router.get('/overview', authenticateJWT, authorizeRole('VIZ_ADMIN'), AdminController.getAdminOverview);
router.put('/brand/:brandId/verify', authenticateJWT, authorizeRole('VIZ_ADMIN'), AdminController.verifyBrand);
router.put('/deal/:dealId/commission', authenticateJWT, authorizeRole('VIZ_ADMIN'), AdminController.updateCommissionStatus);

export default router;
