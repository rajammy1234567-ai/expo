import { Router } from 'express';
import { MeetingController } from '../controllers/meetingController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.post('/request', authenticateJWT, authorizeRole('INVESTOR'), MeetingController.requestMeeting);
router.get('/', authenticateJWT, MeetingController.getMeetings);
router.put('/:meetingId/status', authenticateJWT, authorizeRole('BRAND_ADMIN', 'VIZ_ADMIN'), MeetingController.updateMeetingStatus);

export default router;
