import React from 'react';

interface VizLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export const VizLogo: React.FC<VizLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  animate = false,
}) => {
  // Dimensions and text styling based on size
  const sizeConfig = {
    sm: {
      emblem: 'w-7 h-7 text-xs',
      title: 'text-sm font-extrabold',
      badge: 'text-[9px] px-1 py-0.2',
      subtitle: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      emblem: 'w-10 h-10 text-base',
      title: 'text-lg font-extrabold',
      badge: 'text-[10px] px-1.5 py-0.5',
      subtitle: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      emblem: 'w-12 h-12 text-xl',
      title: 'text-2xl font-black',
      badge: 'text-xs px-2 py-0.5',
      subtitle: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      emblem: 'w-16 h-16 text-2xl',
      title: 'text-3xl font-black',
      badge: 'text-xs px-2.5 py-1',
      subtitle: 'text-sm',
      gap: 'gap-4',
    },
    hero: {
      emblem: 'w-20 h-20 text-3xl sm:w-24 sm:h-24 sm:text-4xl',
      title: 'text-3xl sm:text-4xl font-black',
      badge: 'text-xs sm:text-sm px-3 py-1',
      subtitle: 'text-sm sm:text-base',
      gap: 'gap-4 sm:gap-5',
    },
  }[size];

  return (
    <div className={`flex items-center ${sizeConfig.gap} ${className}`}>
      {/* 3D Modern Logo Emblem */}
      <div className="relative group">
        {/* Ambient Glow Aura */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-60 blur-md transition duration-500 group-hover:opacity-100 ${
            animate ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer Faceted Prism Container */}
        <div
          className={`relative ${sizeConfig.emblem} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-blue-400/40 shadow-xl flex items-center justify-center overflow-hidden`}
        >
          {/* Internal Geometric SVG Shards */}
          <svg
            className="w-full h-full p-1.5"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="vizGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="vizGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="vizGradGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Faceted Base Shapes */}
            <path
              d="M12 14L32 54L52 14H42L32 38L22 14H12Z"
              fill="url(#vizGrad1)"
            />
            {/* Top Accent Prisms */}
            <path
              d="M32 54L38 42L32 38L26 42L32 54Z"
              fill="url(#vizGrad2)"
            />
            {/* Upper Crystal Node */}
            <circle cx="32" cy="18" r="4" fill="#67e8f9" />
            <path
              d="M22 14L32 18L42 14L32 10L22 14Z"
              fill="url(#vizGradGlow)"
            />
          </svg>

          {/* Corner Light Reflection */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`${sizeConfig.title} tracking-tight font-['Outfit'] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-sm`}
          >
            VIZ INDIA
          </span>
          <span
            className={`${sizeConfig.badge} font-bold tracking-wider uppercase rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10`}
          >
            EXPO 24/7
          </span>
        </div>
        {showSubtitle && (
          <p className={`${sizeConfig.subtitle} text-slate-400 font-medium tracking-wide`}>
            Digital B2B Franchise Marketplace
          </p>
        )}
      </div>
    </div>
  );
};
