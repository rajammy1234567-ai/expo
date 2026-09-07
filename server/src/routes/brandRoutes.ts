import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', BrandController.getBrands);
router.post('/', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), BrandController.createBrand);
router.get('/:id', BrandController.getBrandById);
router.put('/:brandId/booth', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), BrandController.updateBrandBooth);
router.post('/:brandId/kb', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), BrandController.addKBChunk);

export default router;
