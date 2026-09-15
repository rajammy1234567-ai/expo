import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { runSeed } from './seed/seedData';
import { Brand } from './models/Brand';

import path from 'path';

// Import Routes
import authRoutes from './routes/authRoutes';
import brandRoutes from './routes/brandRoutes';
import investorRoutes from './routes/investorRoutes';
import leadRoutes from './routes/leadRoutes';
import meetingRoutes from './routes/meetingRoutes';
import dealRoutes from './routes/dealRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io for Realtime Lead Alerts, 1-on-1 Direct Chat & Live Presence
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for media/images
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Attach Socket.io to request
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Health check & root info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'VIZ India Digital Expo Backend API',
    version: '2.0.0',
    capabilities: ['Auth', 'Brands', 'Investor Matrix', 'Direct 1-on-1 Realtime Chat', 'Notifications', 'Leads Kanban', 'Meetings', '3% Deals & Commission'],
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Deprecate AI Bot route with 410 Gone as specified
app.use('/api/ai', (req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    message: 'Grounded AI Bot has been deprecated. Please use real-time direct 1-on-1 messaging at /api/chats to communicate with brand leadership directly.',
  });
});

// Real-Time Socket.io Presence & Messaging
const onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // User online registration
  socket.on('user:online', (userId: string) => {
    if (!userId) return;
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);
    socket.join(`user_${userId}`);
    // Broadcast online status to all
    io.emit('presence:update', {
      userId,
      status: 'ONLINE',
      onlineUserIds: Array.from(onlineUsers.keys()),
    });
    console.log(`User ${userId} is ONLINE (${onlineUsers.get(userId)!.size} sockets)`);
  });

  // Query online status list
  socket.on('presence:query', (callback: Function) => {
    if (typeof callback === 'function') {
      callback(Array.from(onlineUsers.keys()));
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conv_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation: conv_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Realtime typing indicator
  socket.on('message:typing', (data: { conversationId: string; userId: string; userName: string }) => {
    socket.to(`conv_${data.conversationId}`).emit('message:typing', data);
  });

  socket.on('message:stop-typing', (data: { conversationId: string; userId: string }) => {
    socket.to(`conv_${data.conversationId}`).emit('message:stop-typing', data);
  });

  // Read receipt broadcast
  socket.on('message:read', (data: { conversationId: string; userId: string }) => {
    socket.to(`conv_${data.conversationId}`).emit('message:read', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Remove socket from onlineUsers map
    for (const [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', {
            userId,
            status: 'OFFLINE',
            onlineUserIds: Array.from(onlineUsers.keys()),
          });
          console.log(`User ${userId} is now OFFLINE`);
        }
        break;
      }
    }
  });
});

async function startServer() {
  const isConnected = await connectDB();
  
  if (isConnected) {
    console.log('⚡ Connected to database.');
    try {
      const brandCount = await Brand.countDocuments();
      if (brandCount === 0) {
        console.log('🌱 MongoDB is empty. Seeding initial brands, users, and deals...');
        await runSeed();
        console.log('✅ Initial database seed completed successfully!');
      } else {
        console.log(`📊 Found ${brandCount} existing brands in MongoDB.`);
      }
    } catch (e: any) {
      console.warn('⚠️ Auto-seed check warning:', e.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 VIZ INDIA DIGITAL EXPO — BACKEND API SERVER RUNNING`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Engine: Strict Brand Grounding RAG Active`);
    console.log(`💰 Commission Engine: 3% Deal Reconciliation Active`);
    console.log(`======================================================\n`);
  });
}

startServer();
