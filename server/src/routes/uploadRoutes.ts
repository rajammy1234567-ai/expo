import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';

const router = Router();

router.post('/image', uploadImage);

export default router;
