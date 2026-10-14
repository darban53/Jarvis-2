import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  Mic,
  Globe,
  User,
  Palette,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Check,
  Bell,
  Play,
  Laptop,
  Smartphone,
  Shield,
  Zap,
} from 'lucide-react';
import {
  playClickSound,
  playActivationSound,
  playAlarmSound,
  playListeningSound,
  speakBrowserSpeech,
} from '../utils/audioSynthesizer';

export interface AppSettings {
  userTitle: string;
  preferredLanguage: 'roman_urdu' | 'urdu' | 'english' | 'auto';
  voiceEngine: 'gemini' | 'browser';
  voicePersona: 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';
  speechRate: number;
  speechPitch: number;
  hudTheme: 'cyan' | 'gold' | 'emerald' | 'stealth';
  soundFxEnabled: boolean;
  hapticEnabled: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
  onOpenScanner: () => void;
  onAddTimer: (label: string, minutes: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
  onOpenScanner,
  onAddTimer,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'voice' | 'actions' | 'theme'>('general');
  const [isSavedToast, setIsSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    playClickSound();
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 1500);
  };

  const handleTestVoice = () => {
    playClickSound();
    const sampleText =
      settings.preferredLanguage === 'roman_urdu'
        ? `Salam ${settings.userTitle}! Main aapka Stark assistant Jarvis hoon. Sabhi systems bilkul theek chal rahe hain.`
        : `Greetings, ${settings.userTitle}. All Stark Mark-85 systems are online and operational. At your service.`;

    speakBrowserSpeech(sampleText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-950 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.35)] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-cyan-500/30 bg-cyan-950/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center">
              <Settings className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-cyan-300 tracking-wider">
                J.A.R.V.I.S. SYSTEM SETTINGS (ترتیبات)
              </h2>
              <p className="text-[11px] text-slate-400">Mark-LXXXV Master Configuration &amp; Real Actions</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/20 bg-black/50 text-xs sm:text-sm font-orbitron overflow-x-auto">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('general');
            }}
            className={`flex-1 min-w-[100px] py-2.5 px-3 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>GENERAL</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('voice');
            }}
            className={`flex-1 min-w-[100px] py-2.5 px-3 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'voice'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>VOICE &amp; AUDIO</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('actions');
            }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'actions'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>REAL ACTIONS</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('theme');
            }}
            className={`flex-1 min-w-[100px] py-2.5 px-3 text-center border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'theme'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>THEMES</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-sm">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* User Title */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <label className="block text-xs sm:text-sm font-orbitron font-semibold text-cyan-300">
                  Aapka Naam / Title (User Title)
                </label>
                <p className="text-xs text-slate-400">
                  Jarvis baat karte waqt aapko is naam se mukhatib karega:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Sir', 'Boss', 'Commander', 'Doctor', 'Tony', 'Chief'].map((title) => (
                    <button
                      key={title}
                      onClick={() => handleChange('userTitle', title)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-orbitron transition-all border ${
                        settings.userTitle === title
                          ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                          : 'bg-black/60 text-slate-300 border-slate-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <input
                    type="text"
                    value={settings.userTitle}
                    onChange={(e) => handleChange('userTitle', e.target.value)}
                    placeholder="Custom Title / Aapka Naam"
                    className="w-full px-3 py-2 text-sm bg-black/60 border border-slate-700 rounded-lg text-cyan-200 focus:outline-none focus:border-cyan-400 font-mono-tech"
                  />
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <label className="block text-xs sm:text-sm font-orbitron font-semibold text-cyan-300">
                  Zuban Ka Intikhab (Preferred Language)
                </label>
                <p className="text-xs text-slate-400">
                  Jarvis aapke sath kis zuban mein bol kar aur likh kar baat kare:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'roman_urdu', label: 'Roman Urdu (e.g. "Kaisay ho")', sub: 'اردو رومن انگلش' },
                    { id: 'english', label: 'English (Stark AI)', sub: 'Crisp British / US' },
                    { id: 'urdu', label: 'Urdu Script (اردو)', sub: 'خالص اردو رسم الخط' },
                    { id: 'auto', label: 'Auto Detect (خودکار)', sub: 'Aap jo bolenge wahi samjhega' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleChange('preferredLanguage', lang.id as any)}
                      className={`p-2.5 rounded-xl text-left transition-all border ${
                        settings.preferredLanguage === lang.id
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                          : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-xs text-cyan-300">{lang.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{lang.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound FX & Haptic Feedback */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-cyan-300">Sci-Fi Sound FX (صوتی اثرات)</div>
                  <div className="text-xs text-slate-400">Stark startup chime, repulsor beep, aur alerts</div>
                </div>
                <button
                  onClick={() => handleChange('soundFxEnabled', !settings.soundFxEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.soundFxEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      settings.soundFxEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE & AUDIO */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Voice Persona Selector */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-orbitron font-semibold text-cyan-300">
                    Jarvis AI Voice Persona
                  </label>
                  <button
                    onClick={handleTestVoice}
                    className="px-3 py-1 bg-cyan-600/40 border border-cyan-400 rounded-lg text-cyan-200 text-xs font-orbitron hover:bg-cyan-600/60 flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3 fill-cyan-300" />
                    <span>Test Voice</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Gemini Neural TTS aur Browser Speech ke liye pasandeeda lehja:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Fenrir', label: 'Fenrir', desc: 'British Jarvis' },
                    { id: 'Puck', label: 'Puck', desc: 'Energetic' },
                    { id: 'Kore', label: 'Kore', desc: 'Sophisticated' },
                    { id: 'Zephyr', label: 'Zephyr', desc: 'Tactical' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleChange('voicePersona', v.id as any)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        settings.voicePersona === v.id
                          ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                          : 'bg-black/60 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xs font-orbitron">{v.label}</div>
                      <div className="text-[10px] opacity-80">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech Speed & Pitch Sliders */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-orbitron text-slate-300 mb-1">
                    <span>Bolne Ki Raftaar (Speed: {settings.speechRate}x)</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={settings.speechRate}
                    onChange={(e) => handleChange('speechRate', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-orbitron text-slate-300 mb-1">
                    <span>Aawaz Ki Pitch (Deep/Sharp: {settings.speechPitch}x)</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={settings.speechPitch}
                    onChange={(e) => handleChange('speechPitch', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sound Effects Test Panel */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-orbitron text-cyan-300 font-bold">
                  Sound Effects Live Test:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={playActivationSound}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs font-orbitron hover:bg-slate-700 border border-slate-600"
                  >
                    🎵 Startup Chime
                  </button>
                  <button
                    onClick={playListeningSound}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 text-xs font-orbitron hover:bg-slate-700 border border-slate-600"
                  >
                    🔊 Repulsor Ping
                  </button>
                  <button
                    onClick={playAlarmSound}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-rose-300 text-xs font-orbitron hover:bg-slate-700 border border-slate-600"
                  >
                    🚨 Tactical Alarm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REAL ACTIONS (NOT DEMO!) */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-400/40 text-xs text-cyan-200">
                ⚡ <strong>100% Real Working Controls:</strong> Yeh koi demo nahi hai! Kisi bhi button par click karein, woh foran aapke PC ya mobile par live open hoga:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 hover:bg-red-900/50 flex items-center justify-between text-red-200 transition-all group shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                      ▶️
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">YouTube Launch</div>
                      <div className="text-[11px] text-red-300">Open in New Tab</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>

                {/* Google Search */}
                <a
                  href="https://www.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/50 hover:bg-blue-900/50 flex items-center justify-between text-blue-200 transition-all group shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      🔍
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">Google Search</div>
                      <div className="text-[11px] text-blue-300">Live Web Search</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>

                {/* WhatsApp Web */}
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/50 flex items-center justify-between text-emerald-200 transition-all group shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                      💬
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">WhatsApp Web</div>
                      <div className="text-[11px] text-emerald-300">Launch Chats</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>

                {/* Gmail */}
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/50 flex items-center justify-between text-amber-200 transition-all group shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
                      📧
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">Gmail Mailbox</div>
                      <div className="text-[11px] text-amber-300">Open Inboxes</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>

                {/* Camera Scanner Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenScanner();
                  }}
                  className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 hover:bg-cyan-900/50 flex items-center justify-between text-cyan-200 transition-all shadow-md text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                      📷
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">Optical Camera</div>
                      <div className="text-[11px] text-cyan-300">Start Vision Scanner</div>
                    </div>
                  </div>
                  <span className="text-xs font-orbitron font-bold text-cyan-400">OPEN</span>
                </button>

                {/* 5-Min Timer Quick Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    playActivationSound();
                    onAddTimer('Quick 5m Timer', 5);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 hover:bg-purple-900/50 flex items-center justify-between text-purple-200 transition-all shadow-md text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      ⏱️
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white">Set 5-Min Timer</div>
                      <div className="text-[11px] text-purple-300">Audible Alarm Countdown</div>
                    </div>
                  </div>
                  <span className="text-xs font-orbitron font-bold text-purple-400">START</span>
                </button>
              </div>

              {/* Reset Data Danger Zone */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (confirm('Kya aap tamam chat aur saved notes clear karna chahte hain?')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/60 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-orbitron flex items-center justify-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RESET ALL SAVED DATA &amp; CONVERSATIONS</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: THEMES */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Stark Industries HUD ka colour theme choose karein:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'cyan', label: 'Mark 85 Cyan', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-400' },
                  { id: 'gold', label: 'Iron Man Gold & Crimson', color: 'from-amber-400 to-rose-600', border: 'border-amber-400' },
                  { id: 'emerald', label: 'Stealth Tactical Emerald', color: 'from-emerald-400 to-teal-600', border: 'border-emerald-400' },
                  { id: 'stealth', label: 'Shadow Carbon Monochrome', color: 'from-slate-400 to-slate-700', border: 'border-slate-400' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => handleChange('hudTheme', th.id as any)}
                    className={`p-3.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      settings.hudTheme === th.id
                        ? `${th.border} bg-black/80 shadow-[0_0_15px_rgba(0,229,255,0.3)]`
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-orbitron font-bold text-white">{th.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Active HUD Palette</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${th.color} shadow-md`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-cyan-500/30 bg-black/70 flex items-center justify-between">
          <div className="text-xs font-mono-tech text-cyan-400 flex items-center space-x-1.5">
            {isSavedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="text-emerald-300 font-bold">Auto-Saved in Memory!</span>
              </>
            ) : (
              <span>STARK OS v3.8.4 ACTIVE</span>
            )}
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            BAND KAREIN / CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
