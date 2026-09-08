import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation, Message } from '../models/Chat';
import { inMemoryStore } from '../store/inMemoryStore';
import { sendNotification } from './notificationController';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req.query.userId as string);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let conversations: any[] = [];

    if (mongoose.connection.readyState === 1) {
      conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name email role phone')
        .populate('relatedBrandId', 'brandName logoUrl slug')
        .sort({ lastMessageAt: -1 })
        .lean();
    } else {
      // In-Memory store fallback
      conversations = inMemoryStore.conversations.filter((c) =>
        c.participants.includes(userId)
      ).map((c) => {
        // Populate participants
        const populatedParticipants = c.participants.map((pId: string) => {
          const u = inMemoryStore.users.find((user) => user._id === pId);
          return u ? { _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone } : { _id: pId, name: 'User' };
        });

        const brand = inMemoryStore.brands.find((b) => b._id === c.relatedBrandId);

        return {
          ...c,
          participants: populatedParticipants,
          relatedBrandId: brand ? { _id: brand._id, brandName: brand.brandName, logoUrl: brand.logoUrl } : undefined,
        };
      }).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
    }

    return res.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;
    const { targetUserId, relatedBrandId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ success: false, message: 'Both user IDs required' });
    }

    let conversation: any = null;

    if (mongoose.connection.readyState === 1) {
      // Check existing conversation between these participants
      conversation = await Conversation.findOne({
        participants: { $all: [userId, targetUserId] },
      })
        .populate('participants', 'name email role phone')
        .populate('relatedBrandId', 'brandName logoUrl slug');

      if (!conversation) {
        const newConv = await Conversation.create({
          participants: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(targetUserId)],
          relatedBrandId: relatedBrandId ? new mongoose.Types.ObjectId(relatedBrandId) : undefined,
          lastMessage: '',
          lastMessageAt: new Date(),
          unreadCount: new Map([
            [userId, 0],
            [targetUserId, 0],
          ]),
        });

        conversation = await Conversation.findById(newConv._id)
          .populate('participants', 'name email role phone')
          .populate('relatedBrandId', 'brandName logoUrl slug');
      }
    } else {
      // In-Memory store
      conversation = inMemoryStore.conversations.find((c) =>
        c.participants.includes(userId) && c.participants.includes(targetUserId)
      );

      if (!conversation) {
        const newId = 'conv_' + Date.now();
        conversation = {
          _id: newId,
          participants: [userId, targetUserId],
          relatedBrandId,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: { [userId]: 0, [targetUserId]: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryStore.conversations.unshift(conversation);
      }

      // Populate
      const populatedParticipants = conversation.participants.map((pId: string) => {
        const u = inMemoryStore.users.find((user) => user._id === pId);
        return u ? { _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone } : { _id: pId, name: 'User' };
      });
      const brand = inMemoryStore.brands.find((b) => b._id === conversation.relatedBrandId);
      conversation = {
        ...conversation,
        participants: populatedParticipants,
        relatedBrandId: brand ? { _id: brand._id, brandName: brand.brandName, logoUrl: brand.logoUrl } : undefined,
      };
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID required' });
    }

    let messages: any[] = [];

    if (mongoose.connection.readyState === 1) {
      messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();
    } else {
      messages = inMemoryStore.messages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return res.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.senderId;
    const { conversationId } = req.params;
    const { receiverId, text, imageUrl } = req.body;

    if (!conversationId || !userId || !receiverId) {
      return res.status(400).json({ success: false, message: 'Missing conversation or participant identifiers' });
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Message must contain text or an image' });
    }

    let savedMessage: any = null;

    if (mongoose.connection.readyState === 1) {
      savedMessage = await Message.create({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: new mongoose.Types.ObjectId(userId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        text: text || '',
        imageUrl: imageUrl || undefined,
        status: 'SENT',
      });

      // Update conversation
      const snippet = text || '📷 Photo shared';
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: snippet,
        lastMessageAt: new Date(),
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      });
    } else {
      savedMessage = {
        _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        conversationId,
        senderId: userId,
        receiverId,
        text: text || '',
        imageUrl: imageUrl || undefined,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      };
      inMemoryStore.messages.push(savedMessage);

      // Update conversation
      const conv = inMemoryStore.conversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.lastMessage = text || '📷 Photo shared';
        conv.lastMessageAt = new Date().toISOString();
        if (!conv.unreadCount) conv.unreadCount = {};
        conv.unreadCount[receiverId] = (conv.unreadCount[receiverId] || 0) + 1;
      }
    }

    // Realtime Socket.io Broadcast
    const io = (req as any).io;
    if (io) {
      // Room for this conversation
      io.to(`conv_${conversationId}`).emit('message:receive', savedMessage);
      // Direct recipient room
      io.to(`user_${receiverId}`).emit('message:receive', savedMessage);
    }

    // Trigger Notification for recipient
    const sender = inMemoryStore.users.find((u) => u._id === userId);
    const senderName = sender?.name || 'Someone';

    await sendNotification(io, {
      userId: receiverId,
      type: 'MESSAGE',
      title: `New Message from ${senderName}`,
      body: text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : 'Sent you a photo',
      relatedId: conversationId,
      deepLink: `/chats/${conversationId}`,
    });

    return res.json({
      success: true,
      message: savedMessage,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;
    const { conversationId } = req.params;

    if (!conversationId || !userId) {
      return res.status(400).json({ success: false, message: 'Missing conversation or user ID' });
    }

    if (mongoose.connection.readyState === 1) {
      await Message.updateMany(
        { conversationId, receiverId: userId, status: { $ne: 'SEEN' } },
        { status: 'SEEN' }
      );

      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId}`]: 0,
      });
    } else {
      inMemoryStore.messages.forEach((m) => {
        if (m.conversationId === conversationId && m.receiverId === userId) {
          m.status = 'SEEN';
        }
      });

      const conv = inMemoryStore.conversations.find((c) => c._id === conversationId);
      if (conv && conv.unreadCount) {
        conv.unreadCount[userId] = 0;
      }
    }

    // Socket notify read status
    const io = (req as any).io;
    if (io) {
      io.to(`conv_${conversationId}`).emit('message:read', {
        conversationId,
        readByUserId: userId,
      });
    }

    return res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error: any) {
    console.error('Error marking as read:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
