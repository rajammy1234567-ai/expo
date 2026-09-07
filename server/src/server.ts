import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { runSeed } from './seed/seedData';
import { Brand } from './models/Brand';

// Import Routes
import authRoutes from './routes/authRoutes';
import brandRoutes from './routes/brandRoutes';
import investorRoutes from './routes/investorRoutes';
import leadRoutes from './routes/leadRoutes';
import meetingRoutes from './routes/meetingRoutes';
import dealRoutes from './routes/dealRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io for Realtime Lead Alerts, Chat & Live Expo Broadcasts
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    version: '1.0.0',
    capabilities: ['Auth', 'Brands', 'Investor Matrix', 'Grounded AI RAG', 'Leads Kanban', 'Meetings', '3% Deals & Commission'],
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
app.use('/api/ai', aiRoutes);

// Socket.io Realtime Event Handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', (data: { roomId: string; message: any }) => {
    io.to(data.roomId).emit('receive_message', data.message);
  });

  socket.on('new_lead_alert', (leadData: any) => {
    io.emit('lead_notification', leadData);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Server Initialization
async function startServer() {
  const isConnected = await connectDB();
  
  if (isConnected) {
    console.log('⚡ Connected to database.');
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
