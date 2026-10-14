import React from 'react';
import { Activity, Battery, Cpu, Shield, Wifi, Zap } from 'lucide-react';
import { SystemTelemetry } from '../types';
import { playClickSound } from '../utils/audioSynthesizer';

interface TelemetryPanelProps {
  telemetry: SystemTelemetry;
  onToggleOverdrive: () => void;
  onToggleStealth: () => void;
  onRunDiagnostics: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetry,
  onToggleOverdrive,
  onToggleStealth,
  onRunDiagnostics,
}) => {
  return (
    <div className="flex flex-col space-y-3 p-3.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl backdrop-blur-md shadow-lg">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron text-xs font-bold tracking-wider text-cyan-300">
            SYSTEM TELEMETRY
          </span>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
          MARK-85 HUD
        </span>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
        {/* Core Reactor */}
        <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>ARC POWER</span>
            </span>
            <span className="text-cyan-400 font-bold">{telemetry.arcReactorCore}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                telemetry.overdrive ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-cyan-400'
              }`}
              style={{ width: `${telemetry.arcReactorCore}%` }}
            />
          </div>
        </div>

        {/* Neural Sync Latency */}
        <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>NEURAL SYNC</span>
            </span>
            <span className="text-sky-300 font-bold">{telemetry.neuralSync}ms</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-sky-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (telemetry.neuralSync / 300) * 100)}%` }}
            />
          </div>
        </div>

        {/* SatCom Uplink Ping */}
        <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-teal-400" />
              <span>SATCOM PING</span>
            </span>
            <span className="text-teal-300 font-bold">{telemetry.networkPing}ms</span>
          </div>
          <div className="flex items-center space-x-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-[10px] text-teal-400/80">ORBITAL RELAY OK</span>
          </div>
        </div>

        {/* Battery or Terminal Power */}
        <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center space-x-1">
              <Battery className="w-3 h-3 text-emerald-400" />
              <span>DEVICE PWR</span>
            </span>
            <span className="text-emerald-300 font-bold">
              {telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : 'ONLINE'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 capitalize truncate">
            {telemetry.deviceType} Station
          </div>
        </div>
      </div>

      {/* Protocol Control Buttons */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          onClick={() => {
            playClickSound();
            onToggleOverdrive();
          }}
          className={`px-2 py-1.5 rounded text-[10px] font-orbitron font-semibold tracking-wider transition-all border ${
            telemetry.overdrive
              ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-black/60 text-slate-400 border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-300'
          }`}
          title="Boost Reactor output and speed"
        >
          {telemetry.overdrive ? '⚡ OVERDRIVE' : 'OVERDRIVE'}
        </button>

        <button
          onClick={() => {
            playClickSound();
            onToggleStealth();
          }}
          className={`px-2 py-1.5 rounded text-[10px] font-orbitron font-semibold tracking-wider transition-all border ${
            telemetry.stealthMode
              ? 'bg-slate-700/60 text-slate-200 border-slate-400'
              : 'bg-black/60 text-slate-400 border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-300'
          }`}
          title="Dim lights for low-light stealth operations"
        >
          {telemetry.stealthMode ? '🛡️ STEALTH' : 'STEALTH'}
        </button>

        <button
          onClick={() => {
            playClickSound();
            onRunDiagnostics();
          }}
          className="px-2 py-1.5 rounded text-[10px] font-orbitron font-semibold tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-800/40 hover:text-cyan-200 transition-all"
          title="Trigger full Jarvis verbal diagnostics"
        >
          DIAGNOSTIC
        </button>
      </div>
    </div>
  );
};
