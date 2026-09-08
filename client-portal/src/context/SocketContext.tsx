import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationApi, chatApi } from '../services/api';

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: string[];
  isUserOnline: (userId: string) => boolean;
  notifications: any[];
  unreadNotifsCount: number;
  unreadMessagesCount: number;
  refreshNotifications: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('⚡ Socket connected:', s.id);
      if (user?._id) {
        s.emit('user:online', user._id);
      }
    });

    s.on('presence:update', (data: { userId: string; status: string; onlineUserIds: string[] }) => {
      if (data.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Update user presence when auth state changes
  useEffect(() => {
    if (socket && socket.connected && user?._id) {
      socket.emit('user:online', user._id);
    }
  }, [socket, user]);

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await notificationApi.getNotifications(user._id);
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail in background
    }
  }, [user]);

  // Fetch conversations unread total
  const refreshConversations = useCallback(async () => {
    const uid = user?._id || user?.id;
    if (!uid) return;
    try {
      const res = await chatApi.getConversations(uid);
      if (res.data.success && res.data.conversations) {
        let count = 0;
        res.data.conversations.forEach((c: any) => {
          if (c.unreadCount) {
            const myCount = c.unreadCount[uid] || (typeof c.unreadCount.get === 'function' ? c.unreadCount.get(uid) : 0);
            count += Number(myCount) || 0;
          }
        });
        setUnreadMessagesCount(count);
      }
    } catch (err) {
      // Quiet fail
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      refreshNotifications();
      refreshConversations();
    } else {
      setNotifications([]);
      setUnreadNotifsCount(0);
      setUnreadMessagesCount(0);
    }
  }, [user, refreshNotifications, refreshConversations]);

  // Realtime listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotifsCount((prev) => prev + 1);
    };

    const handleReceiveMessage = (msg: any) => {
      if (msg.receiverId === user?._id) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('message:receive', handleReceiveMessage);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('message:receive', handleReceiveMessage);
    };
  }, [socket, user]);

  const isUserOnline = (userId: string) => {
    return onlineUserIds.includes(userId);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user?._id) return;
    try {
      await notificationApi.markAllAsRead(user._id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifsCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUserIds,
        isUserOnline,
        notifications,
        unreadNotifsCount,
        unreadMessagesCount,
        refreshNotifications,
        refreshConversations,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
