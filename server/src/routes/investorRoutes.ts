import { Router } from 'express';
import { InvestorController } from '../controllers/investorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.put('/profile', authenticateJWT, InvestorController.updateProfile);
router.get('/matches', authenticateJWT, InvestorController.getAIMatches);
router.post('/save-brand', authenticateJWT, InvestorController.toggleSaveBrand);
router.post('/compare', authenticateJWT, InvestorController.compareBrands);

export default router;
