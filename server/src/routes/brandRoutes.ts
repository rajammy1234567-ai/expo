import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { authenticateJWT, authorizeRole, optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Public / Investor view with optional JWT to permit Admin bypass
router.get('/', optionalAuthenticateJWT, BrandController.getBrands);
router.post('/', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.createBrand);
router.post('/create', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.createBrand);
router.get('/my-listings', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), BrandController.getMyListings);
router.get('/:id', BrandController.getBrandById);

// Strictly franchisor Brand Partner only — Platform Admins cannot edit booth
router.put('/:brandId/booth', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.updateBrandBooth);
router.put('/:brandId/update', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.updateBrandBooth);
router.post('/:brandId/kb', authenticateJWT, authorizeRole('BRAND_ADMIN'), BrandController.addKBChunk);

export default router;
