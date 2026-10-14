import React from 'react';
import { JarvisStatus } from '../types';

interface ArcReactorProps {
  status: JarvisStatus;
  onClick: () => void;
  size?: 'normal' | 'compact';
}

export const ArcReactor: React.FC<ArcReactorProps> = ({ status, onClick, size = 'normal' }) => {
  const isCompact = size === 'compact';
  const dimension = isCompact ? 'w-40 h-40 md:w-52 md:h-52' : 'w-56 h-56 md:w-72 md:h-72 lg:w-84 lg:h-84';

  // Status colors & ring animations
  const getColors = () => {
    switch (status) {
      case 'listening':
        return {
          core: 'from-amber-400 via-amber-300 to-cyan-400',
          glow: 'shadow-[0_0_50px_rgba(245,158,11,0.6)]',
          border: 'border-amber-400',
          ring1: 'border-amber-400/60',
          ring2: 'border-cyan-400/80',
          label: 'LISTENING...',
          textColor: 'text-amber-400',
        };
      case 'thinking':
        return {
          core: 'from-cyan-400 via-sky-300 to-indigo-500',
          glow: 'shadow-[0_0_50px_rgba(56,189,248,0.7)]',
          border: 'border-cyan-400',
          ring1: 'border-cyan-400/80',
          ring2: 'border-blue-500/80',
          label: 'PROCESSING...',
          textColor: 'text-cyan-400',
        };
      case 'speaking':
        return {
          core: 'from-cyan-300 via-teal-300 to-emerald-400',
          glow: 'shadow-[0_0_60px_rgba(0,229,255,0.8)]',
          border: 'border-cyan-300',
          ring1: 'border-teal-400/80',
          ring2: 'border-cyan-400',
          label: 'VOCALIZING',
          textColor: 'text-cyan-300',
        };
      case 'scanning':
        return {
          core: 'from-rose-500 via-red-400 to-amber-500',
          glow: 'shadow-[0_0_50px_rgba(244,63,94,0.7)]',
          border: 'border-rose-500',
          ring1: 'border-red-400/70',
          ring2: 'border-rose-400/90',
          label: 'OPTICAL SCAN',
          textColor: 'text-rose-400',
        };
      case 'error':
        return {
          core: 'from-red-600 to-red-900',
          glow: 'shadow-[0_0_40px_rgba(239,68,68,0.5)]',
          border: 'border-red-500',
          ring1: 'border-red-500/50',
          ring2: 'border-red-700/50',
          label: 'ANOMALY',
          textColor: 'text-red-400',
        };
      default: // idle
        return {
          core: 'from-cyan-400 via-sky-400 to-blue-600',
          glow: 'shadow-[0_0_35px_rgba(0,229,255,0.45)]',
          border: 'border-cyan-500/60',
          ring1: 'border-cyan-500/40',
          ring2: 'border-cyan-400/50',
          label: 'JARVIS ONLINE',
          textColor: 'text-cyan-400',
        };
    }
  };

  const style = getColors();

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Holographic Ambient Aura */}
      <div
        onClick={onClick}
        className={`relative ${dimension} rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${style.glow} group hover:scale-[1.02] active:scale-95`}
        title="Tap to speak with Jarvis"
      >
        {/* Layer 0: Tick Mark Calibration Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 p-2 pointer-events-none">
          <div className="w-full h-full rounded-full border border-dashed border-cyan-400/30 animate-spin-slow" />
        </div>

        {/* Layer 1: Segmented Outer Ring */}
        <div
          className={`absolute inset-3 rounded-full border-2 ${style.ring1} border-t-transparent border-b-transparent animate-spin-slow-reverse transition-colors duration-500`}
        />

        {/* Layer 2: Fast Counter Gyro (Speeds up when processing) */}
        <div
          className={`absolute inset-7 rounded-full border ${style.ring2} border-l-transparent border-r-transparent ${
            status === 'thinking' ? 'animate-spin-medium' : 'animate-spin-slow'
          } transition-all duration-300`}
        />

        {/* Layer 3: Concentric Tech Notches */}
        <div className="absolute inset-10 rounded-full border border-dashed border-cyan-400/40 pointer-events-none animate-spin-medium-reverse" />

        {/* Layer 4: Floating Equalizer Ring / Speaking Waveform */}
        {status === 'speaking' && (
          <div className="absolute inset-1 rounded-full border-2 border-cyan-300 animate-ping opacity-30 pointer-events-none" />
        )}

        {/* Layer 5: Stark Arc Reactor Glass Capsule */}
        <div
          className={`relative w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-slate-950 via-cyan-950/60 to-black border-2 ${style.border} flex flex-col items-center justify-center p-3 shadow-inner overflow-hidden transition-colors duration-500`}
        >
          {/* Subtle Scanline inside reactor core */}
          <div className="absolute inset-0 scanline-overlay opacity-60" />

          {/* Triangular Core Structure (Iron Man Mark 50 / 85 inspired) */}
          <svg
            viewBox="0 0 100 100"
            className={`w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_12px_rgba(0,229,255,0.8)] ${
              status === 'thinking' ? 'animate-spin-medium' : status === 'speaking' ? 'animate-arc-speaking' : 'animate-arc-pulse'
            }`}
          >
            {/* Outer Triangle Frame */}
            <polygon
              points="50,15 88,80 12,80"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="3"
              strokeLinejoin="round"
              className="opacity-80"
            />
            {/* Inverted Inner Triangle */}
            <polygon
              points="50,75 75,32 25,32"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4,2"
              className="opacity-70"
            />
            {/* Center Core Nucleus */}
            <circle cx="50" cy="50" r="10" fill="#ffffff" className="opacity-90 shadow-white" />
            <circle cx="50" cy="50" r="5" fill="#00e5ff" />
          </svg>

          {/* Real-time State Label */}
          <div className={`mt-2 font-orbitron text-[10px] md:text-xs tracking-widest font-bold ${style.textColor} transition-colors`}>
            {style.label}
          </div>
        </div>

        {/* Repulsor Charge Ripple on Hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-cyan-400/5 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Voice Prompt Status Hint */}
      <div className="mt-3 text-center">
        <p className="font-orbitron text-xs md:text-sm text-cyan-400/90 tracking-wider">
          {status === 'listening' ? 'SPEAK NOW, SIR' : 'TAP REACTOR OR MIC TO SPEAK'}
        </p>
        <p className="text-[11px] text-slate-400 font-mono-tech mt-0.5">
          Urdu • English • Hindi • Roman Urdu
        </p>
      </div>
    </div>
  );
};
