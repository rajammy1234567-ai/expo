import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { authenticateJWT, authorizeRole, optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Public / Investor view with optional JWT to permit Admin bypass
router.get('/', optionalAuthenticateJWT, BrandController.getBrands);
router.post('/', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.createBrand);
router.get('/:id', BrandController.getBrandById);

// Strictly franchisor Brand Partner only — Platform Admins cannot edit booth or KB
router.put('/:brandId/booth', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.updateBrandBooth);
router.post('/:brandId/kb', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.addKBChunk);

export default router;
