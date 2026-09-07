import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: string;
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'MEETING_CARD' | 'AI_SUGGESTION';
  content: string;
  mediaUrl?: string;
  metadata?: Record<string, any>;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'ChatConversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, default: 'INVESTOR' },
    messageType: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'DOCUMENT', 'MEETING_CARD', 'AI_SUGGESTION'],
      default: 'TEXT',
    },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export interface IChatConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  brandId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  lastMessage?: {
    text: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    lastMessage: {
      text: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const ChatConversation = mongoose.model<IChatConversation>(
  'ChatConversation',
  ChatConversationSchema
);
