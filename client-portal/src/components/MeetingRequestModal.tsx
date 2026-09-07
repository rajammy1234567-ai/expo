import React, { useState } from 'react';
import { IBrand } from '../types';
import { meetingApi, leadApi } from '../services/api';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Building,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

interface MeetingRequestModalProps {
  brand: IBrand;
  onClose: () => void;
  onSuccess: () => void;
}

export const MeetingRequestModal: React.FC<MeetingRequestModalProps> = ({
  brand,
  onClose,
  onSuccess,
}) => {
  const [meetingType, setMeetingType] = useState<'VIDEO_CALL' | 'AUDIO_CALL' | 'PHYSICAL_MEETING'>('VIDEO_CALL');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [notes, setNotes] = useState('Interested in exploring exclusive franchise rights for my territory.');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

      await meetingApi.requestMeeting({
        brandId: brand._id,
        scheduledStartTime: startDateTime.toISOString(),
        meetingType,
        notesFromInvestor: notes,
      });

      // Also create/update lead in pipeline
      await leadApi.createLead(brand._id, 'DIRECT_MEETING_REQUEST', notes);

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Error booking meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brand.logoUrl}
              alt={brand.brandName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-white text-base">Schedule Meeting with {brand.brandName}</h3>
              <p className="text-xs text-slate-400">Direct Brand Franchisor Discovery Call</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white">Meeting Request Sent! 🔔</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              <strong>{brand.brandName}</strong> leadership team has been notified. You will receive a calendar invite and WebRTC meeting link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Meeting Type Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Meeting Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMeetingType('VIDEO_CALL')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    meetingType === 'VIDEO_CALL'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-xs font-bold block">1-on-1 Video</span>
                  <span className="text-[10px] text-slate-400">HD WebRTC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeetingType('AUDIO_CALL')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    meetingType === 'AUDIO_CALL'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold block">Audio Call</span>
                  <span className="text-[10px] text-slate-400">Direct phone</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeetingType('PHYSICAL_MEETING')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    meetingType === 'PHYSICAL_MEETING'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-xs font-bold block">In-Person</span>
                  <span className="text-[10px] text-slate-400">HQ or Outlet</span>
                </button>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Custom Notes / Specific Questions */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Your Requirement / Location Note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Mention your city, available space sq.ft., or specific agenda..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>{loading ? 'Confirming with Brand...' : 'Confirm Meeting Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
