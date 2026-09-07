import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  leadId?: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  timeZone: string;
  meetingType: 'VIDEO_CALL' | 'AUDIO_CALL' | 'CHAT_SESSION' | 'PHYSICAL_MEETING';
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  meetingRoomUrl?: string;
  cancellationReason?: string;
  notesFromInvestor?: string;
  brandFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    scheduledStartTime: { type: Date, required: true },
    scheduledEndTime: { type: Date, required: true },
    timeZone: { type: String, default: 'Asia/Kolkata' },
    meetingType: {
      type: String,
      enum: ['VIDEO_CALL', 'AUDIO_CALL', 'CHAT_SESSION', 'PHYSICAL_MEETING'],
      default: 'VIDEO_CALL',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    meetingRoomUrl: { type: String, default: '' },
    cancellationReason: { type: String },
    notesFromInvestor: { type: String, default: 'Interested in exploring franchise opportunity for my city.' },
    brandFeedback: { type: String },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
