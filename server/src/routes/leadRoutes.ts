import { Router } from 'express';
import { LeadController } from '../controllers/leadController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, authorizeRole('INVESTOR'), LeadController.createLead);
router.get('/brand/:brandId', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), LeadController.getBrandLeads);
router.put('/:leadId/stage', authenticateJWT, authorizeRole('BRAND_ADMIN'), LeadController.updateLeadStage);
router.get('/my-deals', authenticateJWT, authorizeRole('INVESTOR'), LeadController.getInvestorDeals);

export default router;
