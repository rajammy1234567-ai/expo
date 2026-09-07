import React, { useState, useRef } from 'react';
import { IBrand } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Heart,
  GitCompare,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Building,
} from 'lucide-react';

interface BrandReelCardProps {
  brand: IBrand;
  matchScore?: number;
  onOpenAI: (brand: IBrand) => void;
  onOpenMeeting: (brand: IBrand) => void;
  onOpenDetails: (brand: IBrand) => void;
}

export const BrandReelCard: React.FC<BrandReelCardProps> = ({
  brand,
  matchScore,
  onOpenAI,
  onOpenMeeting,
  onOpenDetails,
}) => {
  const { savedBrandIds, toggleSavedBrand, compareBrandIds, toggleCompareBrand } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSaved = savedBrandIds.includes(brand._id);
  const isCompared = compareBrandIds.includes(brand._id);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/40 transition-all duration-300 flex flex-col"
    >
      {/* Media / Video Header */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onOpenDetails(brand)}>
        {/* Video or Banner */}
        {brand.pitchVideoUrl ? (
          <video
            ref={videoRef}
            src={brand.pitchVideoUrl}
            poster={brand.bannerUrl || brand.logoUrl}
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={brand.bannerUrl || brand.logoUrl}
            alt={brand.brandName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
              {brand.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              {brand.businessModel}
            </span>
          </div>

          {matchScore && (
            <div className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/90 text-white flex items-center gap-1 shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Hover Controls (Mute & Compare & Save) */}
        <div className="absolute top-12 right-3 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavedBrand(brand._id);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Save Brand"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompareBrand(brand._id);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isCompared
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Compare Brand"
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>

          {brand.pitchVideoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-slate-950/70 text-slate-300 border border-slate-700 hover:text-white backdrop-blur-md transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          )}
        </div>

        {/* Brand Logo & Name overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
          <img
            src={brand.logoUrl}
            alt={brand.brandName}
            className="w-11 h-11 rounded-xl object-cover border-2 border-slate-700 shadow-md bg-slate-900"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-blue-400 transition-colors">
                {brand.brandName}
              </h3>
              {brand.verificationStatus === 'VERIFIED' && (
                <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-500/20 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-300 truncate">{brand.tagline || brand.category + ' Franchise'}</p>
          </div>
        </div>
      </div>

      {/* Financial & Space Specs Grid */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Investment</span>
            <span className="text-xs font-bold text-emerald-400">{brand.investmentRange.displayString}</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Space</span>
            <span className="text-xs font-bold text-slate-200">{brand.requiredAreaSqFt.displayString}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payback</span>
            <span className="text-xs font-bold text-amber-400">
              {brand.estimatedROIHistoricalMonths.min}–{brand.estimatedROIHistoricalMonths.max} Mo*
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {brand.description}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onOpenAI(brand)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-800/60 hover:to-indigo-800/60 border border-blue-600/40 text-blue-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Ask AI Bot</span>
          </button>

          <button
            onClick={() => onOpenMeeting(brand)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
};
