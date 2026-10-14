import React, { useEffect, useRef, useState } from 'react';
import { HUDHeader } from './components/HUDHeader';
import { ArcReactor } from './components/ArcReactor';
import { TelemetryPanel } from './components/TelemetryPanel';
import { MissionHub } from './components/MissionHub';
import { CommandTerminal } from './components/CommandTerminal';
import { VisionScannerModal } from './components/VisionScannerModal';
import { PCInstallGuideModal } from './components/PCInstallGuideModal';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { ChatMessage, ExecutedAction, JarvisStatus, JarvisTimer, MissionNote, SystemTelemetry } from './types';
import {
  playActivationSound,
  playListeningSound,
  playThinkingSound,
  playAlarmSound,
  playClickSound,
  playBase64WavAudio,
  speakBrowserSpeech,
  stopCurrentAudio,
} from './utils/audioSynthesizer';
import { Radio, Eye, Terminal, Cpu, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation / Mobile view mode
  const [mobileTab, setMobileTab] = useState<'hud' | 'terminal' | 'tools'>('hud');

  // Core status
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [voiceEngine, setVoiceEngine] = useState<'gemini' | 'browser'>('gemini');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // App settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('jarvis_app_settings');
      return saved
        ? JSON.parse(saved)
        : {
            userTitle: 'Sir',
            preferredLanguage: 'roman_urdu',
            voiceEngine: 'gemini',
            voicePersona: 'Fenrir',
            speechRate: 1.05,
            speechPitch: 0.95,
            hudTheme: 'cyan',
            soundFxEnabled: true,
            hapticEnabled: true,
          };
    } catch {
      return {
        userTitle: 'Sir',
        preferredLanguage: 'roman_urdu',
        voiceEngine: 'gemini',
        voicePersona: 'Fenrir',
        speechRate: 1.05,
        speechPitch: 0.95,
        hudTheme: 'cyan',
        soundFxEnabled: true,
        hapticEnabled: true,
      };
    }
  });

  // Messages log
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Salam Sir! J.A.R.V.I.S. Mark-LXXXV systems online hain. Main aapke phone aur PC ka poora kaam karne ke liye fully ready hoon.\n\nAap bol kar ya likh kar YouTube, Google, Camera, Timer, Notes, ya Settings open kar sakte hain!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Timers and Mission Notes
  const [timers, setTimers] = useState<JarvisTimer[]>([]);
  const [notes, setNotes] = useState<MissionNote[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_directives');
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', text: 'Calibrate Arc Reactor resonance frequency', timestamp: 'Today', completed: false },
            { id: '2', text: 'Verify Stark satellite orbital relay telemetry', timestamp: 'Today', completed: true },
          ];
    } catch {
      return [];
    }
  });

  // Telemetry
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    arcReactorCore: 99.4,
    neuralSync: 24,
    memoryLoad: 38,
    networkPing: 18,
    batteryLevel: null,
    deviceType: 'desktop',
    stealthMode: false,
    overdrive: false,
  });

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Device detection & Battery sync
  useEffect(() => {
    const checkDevice = () => {
      const isMob = window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
      setTelemetry((prev) => ({
        ...prev,
        deviceType: isMob ? 'mobile' : 'desktop',
      }));
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Battery API if supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setTelemetry((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
        }));
        battery.addEventListener('levelchange', () => {
          setTelemetry((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
          }));
        });
      }).catch(() => {});
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jarvis_directives', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save directives:', e);
    }
  }, [notes]);

  // Timer countdown loop
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimers((prev) =>
        prev
          .map((t) => {
            if (!t.isRunning) return t;
            if (t.remainingSeconds <= 1) {
              playAlarmSound();
              // Add alert to messages
              const alertMsg: ChatMessage = {
                id: `timer-alert-${Date.now()}`,
                role: 'assistant',
                content: `Sir, your timer alert for "${t.label}" has elapsed.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setMessages((msgs) => [...msgs, alertMsg]);
              vocalizeResponse(alertMsg.content);
              return { ...t, remainingSeconds: 0, isRunning: false };
            }
            return { ...t, remainingSeconds: t.remainingSeconds - 1 };
          })
          .filter((t) => t.remainingSeconds > 0 || t.isRunning)
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isMuted, voiceEngine]);

  // Periodic subtle telemetry jitter to feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const jitterCore = Number((98.5 + (Math.random() * 1.5 - 0.75)).toFixed(1));
        const jitterPing = Math.floor(15 + Math.random() * 8);
        const jitterNeural = Math.floor(22 + Math.random() * 12);
        return {
          ...prev,
          arcReactorCore: prev.overdrive ? 100 : jitterCore,
          networkPing: jitterPing,
          neuralSync: jitterNeural,
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognizer = new SpeechRecognitionClass();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US'; // Works well with English, and phonetically with Roman Urdu / Hindi

      recognizer.onstart = () => {
        setIsListening(true);
        setStatus('listening');
        playListeningSound();
      };

      recognizer.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // Check if final
        if (event.results[0].isFinal) {
          const finalPrompt = currentTranscript.trim();
          if (finalPrompt) {
            handleSendMessage(finalPrompt);
            setTranscript('');
          }
        }
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setStatus('idle');
      };

      recognizer.onend = () => {
        setIsListening(false);
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  // Keyboard shortcut: Spacebar to toggle listening (when not focused on text input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (e.code === 'Space' && activeTag !== 'input' && activeTag !== 'textarea') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  // Toggle Voice Listening
  const toggleListening = () => {
    if (status === 'speaking') {
      stopSpeaking();
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setStatus('idle');
    } else {
      if (!recognitionRef.current) {
        alert(
          'Speech Recognition is not supported directly in this browser engine. Please use Chrome, Safari, Edge, or mobile Chrome, or type in the terminal.'
        );
        return;
      }
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  // Vocalize Jarvis Response
  const vocalizeResponse = async (text: string) => {
    if (isMuted) return;

    setStatus('speaking');

    const voiceToUse = settings.voicePersona || 'Fenrir';

    if (voiceEngine === 'gemini') {
      try {
        const res = await fetch('/api/jarvis/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceName: voiceToUse }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audio) {
            await playBase64WavAudio(data.audio, () => {
              setStatus('idle');
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Server TTS failed, switching to native speech:', err);
      }
    }

    // Native browser speech fallback with customized rate & pitch
    const spoken = speakBrowserSpeech(
      text,
      () => {
        setStatus('idle');
      },
      settings.speechRate || 1.05,
      settings.speechPitch || 0.95
    );

    if (!spoken) {
      setStatus('idle');
    }
  };

  const stopSpeaking = () => {
    stopCurrentAudio();
    setStatus('idle');
  };

  // Main message pipeline
  const handleSendMessage = async (text: string, imageBase64?: string) => {
    if (!text && !imageBase64) return;

    // Haptic feedback on phone if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imagePreview: imageBase64,
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus('thinking');
    playThinkingSound();

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          imageBase64: imageBase64,
          userContext: {
            device: telemetry.deviceType,
            time: new Date().toLocaleTimeString(),
            battery: telemetry.batteryLevel ? `${telemetry.batteryLevel}%` : 'Nominal',
            userTitle: settings.userTitle,
            language: settings.preferredLanguage,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Cognitive subroutines encountered a delay.');
      }

      const data = await response.json();
      let replyText = data.reply || 'At your command, Sir.';
      let detectedAction: ExecutedAction | undefined = undefined;

      // Extract and execute automated PC/phone actions
      const actionMatch = replyText.match(/\[\[ACTION:(\{.*?\})\]\]/);
      if (actionMatch && actionMatch[1]) {
        try {
          detectedAction = JSON.parse(actionMatch[1]);
          replyText = replyText.replace(actionMatch[0], '').trim();
        } catch (e) {
          console.warn('Action parse error:', e);
        }
      }

      // Execute detected action automatically on user device
      if (detectedAction) {
        if (detectedAction.type === 'open_url' && detectedAction.url) {
          window.open(detectedAction.url, '_blank');
        } else if (detectedAction.type === 'search_web') {
          const searchUrl =
            detectedAction.url ||
            `https://www.google.com/search?q=${encodeURIComponent(detectedAction.query || '')}`;
          window.open(searchUrl, '_blank');
        } else if (detectedAction.type === 'open_camera') {
          setIsScannerOpen(true);
        } else if (detectedAction.type === 'set_timer') {
          handleAddTimer(detectedAction.label || 'Timer', detectedAction.minutes || 5);
        } else if (detectedAction.type === 'add_note' && detectedAction.text) {
          handleAddNote(detectedAction.text);
        } else if (detectedAction.type === 'toggle_overdrive') {
          handleToggleOverdrive();
        } else if (detectedAction.type === 'toggle_stealth') {
          handleToggleStealth();
        }
      }

      // Assistant message
      const assistantMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.searchSources,
        action: detectedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Vocalize response without raw JSON tags
      vocalizeResponse(replyText);
    } catch (error: any) {
      console.error('Chat processing error:', error);
      setStatus('error');
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sir, an anomaly occurred in our communication relays: ${error?.message || 'Unknown network error'}. All defensive protocols remain intact.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      vocalizeResponse(errorMsg.content);
    }
  };

  // Protocols & Telemetry Handlers
  const handleToggleOverdrive = () => {
    setTelemetry((prev) => ({
      ...prev,
      overdrive: !prev.overdrive,
      arcReactorCore: !prev.overdrive ? 100 : 99.4,
    }));
    playActivationSound();
  };

  const handleToggleStealth = () => {
    setTelemetry((prev) => ({
      ...prev,
      stealthMode: !prev.stealthMode,
    }));
  };

  const handleRunDiagnostics = () => {
    handleSendMessage('Jarvis, execute a comprehensive diagnostic check of the Mark LXXXV architecture and report readiness.');
  };

  // Timers & Directives Handlers
  const handleAddTimer = (label: string, minutes: number) => {
    const newTimer: JarvisTimer = {
      id: `timer-${Date.now()}`,
      label,
      durationSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
      createdAt: new Date().toLocaleTimeString(),
    };
    setTimers((prev) => [...prev, newTimer]);
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddNote = (text: string) => {
    const newNote: MissionNote = {
      id: `note-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleDateString(),
      completed: false,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleToggleNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div
      className={`min-h-screen h-[100dvh] flex flex-col transition-colors duration-700 overflow-hidden ${
        telemetry.stealthMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-950 text-cyan-100'
      }`}
    >
      {/* Scanline and Grid Background */}
      <div className="fixed inset-0 scanline-overlay pointer-events-none z-10 opacity-70" />

      {/* Top HUD Header */}
      <HUDHeader
        deviceType={telemetry.deviceType}
        isMuted={isMuted}
        voiceEngine={voiceEngine}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleVoiceEngine={() =>
          setVoiceEngine((prev) => (prev === 'gemini' ? 'browser' : 'gemini'))
        }
        onClearChat={() => {
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: 'Communications stream cleared. Standing by for instructions, Sir.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Navigation Tabs (visible only on mobile screens) */}
      <div className="flex md:hidden border-b border-cyan-500/20 bg-black/60 z-20 text-xs font-orbitron">
        <button
          onClick={() => {
            playClickSound();
            setMobileTab('hud');
          }}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors ${
            mobileTab === 'hud'
              ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>ARC CORE</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setMobileTab('terminal');
          }}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors ${
            mobileTab === 'terminal'
              ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>COMMS ({messages.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setMobileTab('tools');
          }}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors ${
            mobileTab === 'tools'
              ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>SYSTEM</span>
        </button>
      </div>

      {/* Main Responsive Grid Layout */}
      <main className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 p-2.5 sm:p-4 overflow-hidden">
        {/* Left Column (Desktop): Telemetry & Mission Hub */}
        <div
          className={`md:col-span-4 lg:col-span-3 flex-col space-y-3 overflow-y-auto ${
            mobileTab === 'tools' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <TelemetryPanel
            telemetry={telemetry}
            onToggleOverdrive={handleToggleOverdrive}
            onToggleStealth={handleToggleStealth}
            onRunDiagnostics={handleRunDiagnostics}
          />
          <MissionHub
            timers={timers}
            notes={notes}
            onAddTimer={handleAddTimer}
            onDeleteTimer={handleDeleteTimer}
            onAddNote={handleAddNote}
            onToggleNote={handleToggleNote}
            onDeleteNote={handleDeleteNote}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          />
        </div>

        {/* Center Column: The Holographic Arc Reactor */}
        <div
          className={`md:col-span-8 lg:col-span-4 flex-col items-center justify-center ${
            mobileTab === 'hud' ? 'flex' : 'hidden md:flex'
          } relative p-2`}
        >
          {/* Central Arc Reactor */}
          <div className="my-auto flex flex-col items-center justify-center w-full">
            <ArcReactor
              status={status}
              onClick={toggleListening}
              size={telemetry.deviceType === 'mobile' ? 'compact' : 'normal'}
            />

            {/* Real Working Actions Grid (100% Functional Buttons - NOT Demo!) */}
            <div className="w-full max-w-md mt-5 p-3 rounded-2xl bg-black/60 border border-cyan-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-orbitron font-bold text-cyan-300 mb-2 border-b border-cyan-500/20 pb-1">
                <span>STARK QUICK ACTIONS (PC &amp; PHONE)</span>
                <span className="text-emerald-400">● REAL BUTTONS</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* YouTube */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.open('https://www.youtube.com', '_blank');
                  }}
                  className="p-2 rounded-xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 text-white flex flex-col items-center text-center transition-all group"
                  title="Open YouTube in New Tab"
                >
                  <span className="text-base">▶️</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-red-300">
                    YouTube
                  </span>
                </button>

                {/* Google Search */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.open('https://www.google.com', '_blank');
                  }}
                  className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/40 hover:bg-blue-900/60 text-white flex flex-col items-center text-center transition-all group"
                  title="Open Google Search"
                >
                  <span className="text-base">🔍</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-blue-300">
                    Google
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.open('https://web.whatsapp.com', '_blank');
                  }}
                  className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 text-white flex flex-col items-center text-center transition-all group"
                  title="Open WhatsApp Web"
                >
                  <span className="text-base">💬</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-emerald-300">
                    WhatsApp
                  </span>
                </button>

                {/* Camera Scan */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsScannerOpen(true);
                  }}
                  className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-400/50 hover:bg-cyan-900/60 text-white flex flex-col items-center text-center transition-all group"
                  title="Launch Camera Vision Scanner"
                >
                  <span className="text-base">📷</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-cyan-300">
                    Camera
                  </span>
                </button>

                {/* 5m Timer */}
                <button
                  type="button"
                  onClick={() => {
                    playActivationSound();
                    handleAddTimer('5-Min Timer', 5);
                  }}
                  className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/60 text-white flex flex-col items-center text-center transition-all group"
                  title="Start 5 Minute Timer"
                >
                  <span className="text-base">⏱️</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-purple-300">
                    5m Timer
                  </span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-800/80 border border-slate-600 hover:bg-slate-700 text-white flex flex-col items-center text-center transition-all group"
                  title="Open System Settings"
                >
                  <span className="text-base">⚙️</span>
                  <span className="font-orbitron font-bold text-[10px] mt-0.5 group-hover:text-cyan-300">
                    Settings
                  </span>
                </button>
              </div>

              {/* Quick Talk Button */}
              <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Jarvis, kaisay ho aap? Roman Urdu me haal chaal batao.')}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/60 hover:bg-amber-500/40 text-amber-200 text-xs font-orbitron font-semibold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Urdu / Hindi Voice Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Communications Terminal */}
        <div
          className={`md:col-span-12 lg:col-span-5 h-full ${
            mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'
          } flex-col`}
        >
          <CommandTerminal
            messages={messages}
            status={status}
            isListening={isListening}
            transcript={transcript}
            onSendMessage={handleSendMessage}
            onToggleListening={toggleListening}
            onStopSpeaking={stopSpeaking}
            onReplayAudio={(msg) => vocalizeResponse(msg.content)}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        </div>
      </main>

      {/* Optical Vision Scanner Modal */}
      <VisionScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={(base64Img, prompt) => handleSendMessage(prompt, base64Img)}
      />

      {/* PC & Phone Setup Guide Modal */}
      <PCInstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          try {
            localStorage.setItem('jarvis_app_settings', JSON.stringify(newSettings));
          } catch (e) {
            console.warn(e);
          }
        }}
        onClearAllData={() => {
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: `Salam ${settings.userTitle}! J.A.R.V.I.S. Mark-85 online hai. Tamam logs reset ho chukay hain. Aap hukum karein!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setNotes([]);
          setTimers([]);
          try {
            localStorage.removeItem('jarvis_directives');
          } catch {}
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onAddTimer={handleAddTimer}
      />
    </div>
  );
}
