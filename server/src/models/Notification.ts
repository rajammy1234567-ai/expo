import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'MESSAGE' | 'DEAL' | 'MEETING' | 'LEAD' | 'VERIFICATION' | 'SYSTEM';
  title: string;
  body: string;
  relatedId?: mongoose.Types.ObjectId;
  deepLink?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['MESSAGE', 'DEAL', 'MEETING', 'LEAD', 'VERIFICATION', 'SYSTEM'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    deepLink: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
