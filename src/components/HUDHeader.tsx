import React, { useEffect, useState } from 'react';
import { Camera, Volume2, VolumeX, Trash2, Smartphone, Monitor, Radio, Settings, HelpCircle, BookOpen } from 'lucide-react';
import { playClickSound } from '../utils/audioSynthesizer';

interface HUDHeaderProps {
  deviceType: 'mobile' | 'desktop';
  isMuted: boolean;
  voiceEngine: 'gemini' | 'browser';
  onToggleMute: () => void;
  onToggleVoiceEngine: () => void;
  onClearChat: () => void;
  onOpenScanner: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  deviceType,
  isMuted,
  voiceEngine,
  onToggleMute,
  onToggleVoiceEngine,
  onClearChat,
  onOpenScanner,
  onOpenGuide,
  onOpenSettings,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 bg-black/80 border-b border-cyan-500/40 backdrop-blur-md">
      {/* Stark / Jarvis Brand */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/90 border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute opacity-50" />
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-orbitron font-extrabold text-base sm:text-lg tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]">
              J.A.R.V.I.S.
            </h1>
            <span className="text-[10px] sm:text-xs font-mono-tech px-2 py-0.5 rounded-md bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 font-bold">
              MK-85
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
            STARK INDUSTRIES NEURAL TERMINAL
          </p>
        </div>
      </div>

      {/* Center Clock / Telemetry */}
      <div className="hidden lg:flex items-center space-x-3 font-mono-tech text-xs">
        <div className="flex items-center space-x-2 text-cyan-300 bg-black/60 px-3 py-1.5 rounded-lg border border-cyan-500/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider">SYS.TIME: {timeStr}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-700">
          {deviceType === 'mobile' ? (
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="uppercase text-[11px] font-semibold">{deviceType} NODE</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Full Settings Button */}
        <button
          onClick={() => {
            playClickSound();
            onOpenSettings();
          }}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-200 hover:text-white hover:bg-cyan-900/60 text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.25)]"
          title="Open Settings (ترتیبات)"
        >
          <Settings className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>SETTINGS</span>
        </button>

        {/* PC Guide & Key Info Button */}
        <button
          onClick={() => {
            playClickSound();
            onOpenGuide();
          }}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-400/80 hover:border-amber-300 text-amber-300 text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          title="PC Install & Key Guide (اردو)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">GUIDE (رہنمائی)</span>
        </button>

        {/* Optical Scanner Button */}
        <button
          onClick={() => {
            playClickSound();
            onOpenScanner();
          }}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-900/60 text-cyan-300 text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          title="Open Camera Optical Scanner"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">SCAN</span>
        </button>

        {/* Mute Toggle */}
        <button
          onClick={() => {
            playClickSound();
            onToggleMute();
          }}
          className={`p-2 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-rose-950/70 border-rose-500 text-rose-300'
              : 'bg-black/60 border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Clear Chat */}
        <button
          onClick={() => {
            playClickSound();
            onClearChat();
          }}
          className="p-2 rounded-xl bg-black/60 border border-slate-700 hover:border-rose-400/80 text-slate-400 hover:text-rose-300 transition-colors"
          title="Clear Conversation Stream"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
