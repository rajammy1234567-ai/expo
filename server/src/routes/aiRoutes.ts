import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.post('/ask-brand', AIController.askBrandAI);
router.post('/match-investor', AIController.matchInvestorPreferences);

export default router;
