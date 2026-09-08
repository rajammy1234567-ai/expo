import { Router } from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markAsRead,
} from '../controllers/chatController';

const router = Router();

router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.put('/:conversationId/read', markAsRead);

export default router;
