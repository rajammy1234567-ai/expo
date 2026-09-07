import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';
import { AuthRequest, getActiveUserBrandId } from '../middlewares/authMiddleware';

export class MeetingController {
  /**
   * Request a new 1-on-1 Discovery meeting (strictly for INVESTOR role)
   */
  static async requestMeeting(req: AuthRequest, res: Response) {
    const investorId = req.user?.userId;
    if (!investorId) {
      return res.status(401).json({ success: false, message: 'Authentication required to request meetings.' });
    }

    const { brandId, scheduledStartTime, meetingType = 'VIDEO_CALL', notesFromInvestor } = req.body;
    const brand = inMemoryStore.brands.find((b) => b._id === brandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || {
      _id: investorId,
      name: req.user?.name || 'Investor User',
      phone: '',
      email: req.user?.email || '',
    };

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

  /**
   * Update status of meeting with strict ownership check
   */
  static async updateMeetingStatus(req: AuthRequest, res: Response) {
    const { meetingId } = req.params;
    const { status } = req.body;

    const meeting = inMemoryStore.meetings.find((m) => m._id === meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const callerRole = req.user?.role;
    const callerId = req.user?.userId;

    // Ownership verification
    if (callerRole === 'INVESTOR') {
      const isOwner =
        meeting.investorId?._id === callerId ||
        meeting.investorId === callerId ||
        meeting.investorId?.email === req.user?.email;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own meetings.',
        });
      }
    } else if (callerRole === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      const isOwner = meeting.brandId?._id === userBrandId || meeting.brandId === userBrandId;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update meetings for your own brand.',
        });
      }
    }

    meeting.status = status;
    return res.json({ success: true, message: `Meeting updated to ${status}`, meeting });
  }

  /**
   * Get meetings strictly scoped to the requesting role:
   * - INVESTOR: only their own requested meetings
   * - BRAND_ADMIN: only meetings scheduled with their brand
   * - VIZ_ADMIN: all platform meetings
   */
  static async getMeetings(req: AuthRequest, res: Response) {
    const callerRole = req.user?.role;
    const callerId = req.user?.userId;

    let meetings = inMemoryStore.meetings;

    if (callerRole === 'INVESTOR') {
      meetings = meetings.filter(
        (m) =>
          m.investorId?._id === callerId ||
          m.investorId === callerId ||
          (req.user?.email && m.investorId?.email === req.user.email)
      );
    } else if (callerRole === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      meetings = meetings.filter(
        (m) => m.brandId?._id === userBrandId || m.brandId === userBrandId
      );
    }

    return res.json({
      success: true,
      count: meetings.length,
      meetings,
    });
  }
}
