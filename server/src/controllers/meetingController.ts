import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';

export class MeetingController {
  static async requestMeeting(req: any, res: Response) {
    const investorId = req.user?.userId || inMemoryStore.users[0]?._id || 'guest_investor';
    const { brandId, scheduledStartTime, meetingType = 'VIDEO_CALL', notesFromInvestor } = req.body;
    const brand = inMemoryStore.brands.find((b) => b._id === brandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || inMemoryStore.users[0] || { name: 'Investor User', phone: '', email: '' };

    const meeting = {
      _id: `65e4000000000000000000${inMemoryStore.meetings.length + 10}`,
      investorId: user,
      brandId: brand,
      scheduledStartTime: scheduledStartTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      scheduledEndTime: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
      meetingType,
      status: 'ACCEPTED',
      meetingRoomUrl: `https://meet.vizexpo.in/room-${Math.random().toString(36).substring(2, 9)}`,
      notesFromInvestor: notesFromInvestor || 'Territory & FOFO franchise model discussion.',
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.meetings.push(meeting);
    return res.json({
      success: true,
      message: 'Meeting requested & confirmed! Brand leadership notified 🔔',
      meeting,
    });
  }

  static async updateMeetingStatus(req: any, res: Response) {
    const { meetingId } = req.params;
    const { status } = req.body;
    const meeting = inMemoryStore.meetings.find((m) => m._id === meetingId);
    if (meeting) {
      meeting.status = status;
      return res.json({ success: true, message: `Meeting updated to ${status}`, meeting });
    }
    return res.status(404).json({ success: false, message: 'Meeting not found' });
  }

  static async getMeetings(req: any, res: Response) {
    return res.json({
      success: true,
      count: inMemoryStore.meetings.length,
      meetings: inMemoryStore.meetings,
    });
  }
}
