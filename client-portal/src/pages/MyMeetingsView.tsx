import React, { useState, useEffect } from 'react';
import { meetingApi } from '../services/api';
import { IMeeting } from '../types';
import {
  Calendar,
  Video,
  Clock,
  CheckCircle2,
  Phone,
  Building,
  ExternalLink,
  XCircle,
} from 'lucide-react';

export const MyMeetingsView: React.FC = () => {
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await meetingApi.getMeetings();
      if (res.data.success) {
        setMeetings(res.data.meetings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleJoinCall = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Generating secure 1-on-1 WebRTC video discovery room...');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit'] flex items-center gap-2">
          <span>📅 My Scheduled Discovery Meetings</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {meetings.length} Calls
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct video/audio consultations with verified franchisor leadership teams.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your meeting schedule...</div>
      ) : meetings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No scheduled meetings.</p>
          <p className="text-xs text-slate-500">
            Click "Book Meeting" on any brand card to schedule a direct discovery consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <img
                  src={meeting.brandId?.logoUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100'}
                  alt="Brand"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {meeting.brandId?.brandName || 'Franchise Partner'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {meeting.meetingType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {meeting.notesFromInvestor || 'Territory and unit economics discussion'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {new Date(meeting.scheduledStartTime).toLocaleString()}
                    </span>
                    <span>Status: <strong className="text-emerald-400 font-bold">{meeting.status}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleJoinCall(meeting.meetingRoomUrl)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Call Room</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
