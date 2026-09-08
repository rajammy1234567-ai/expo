import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { inMemoryStore } from '../store/inMemoryStore';

// Helper to create and broadcast notification
export const sendNotification = async (
  io: any,
  data: {
    userId: string;
    type: 'MESSAGE' | 'DEAL' | 'MEETING' | 'LEAD' | 'VERIFICATION' | 'SYSTEM';
    title: string;
    body: string;
    relatedId?: string;
    deepLink?: string;
  }
) => {
  try {
    let savedNotification: any;
    if (mongoose.connection.readyState === 1) {
      savedNotification = await Notification.create({
        userId: new mongoose.Types.ObjectId(data.userId),
        type: data.type,
        title: data.title,
        body: data.body,
        relatedId: data.relatedId ? new mongoose.Types.ObjectId(data.relatedId) : undefined,
        deepLink: data.deepLink,
        isRead: false,
      });
    } else {
      savedNotification = {
        _id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        relatedId: data.relatedId,
        deepLink: data.deepLink,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      inMemoryStore.notifications.unshift(savedNotification);
    }

    if (io) {
      io.to(`user_${data.userId}`).emit('notification:new', savedNotification);
    }

    return savedNotification;
  } catch (err) {
    console.error('Failed to create/send notification:', err);
    return null;
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.query.userId as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let notifications: any[] = [];
    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } else {
      notifications = inMemoryStore.notifications
        .filter((n) => n.userId === userId || n.userId?._id === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      const n = inMemoryStore.notifications.find((item) => item._id === id);
      if (n) n.isRead = true;
    }

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    } else {
      inMemoryStore.notifications.forEach((n) => {
        if (n.userId === userId || n.userId?._id === userId) {
          n.isRead = true;
        }
      });
    }

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
