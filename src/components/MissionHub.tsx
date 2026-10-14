import React, { useState } from 'react';
import { Bell, CheckSquare, Clock, CloudSun, Plus, Trash2, Volume2, Sparkles } from 'lucide-react';
import { JarvisTimer, MissionNote } from '../types';
import { playClickSound, playAlarmSound } from '../utils/audioSynthesizer';

interface MissionHubProps {
  timers: JarvisTimer[];
  notes: MissionNote[];
  onAddTimer: (label: string, minutes: number) => void;
  onDeleteTimer: (id: string) => void;
  onAddNote: (text: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const MissionHub: React.FC<MissionHubProps> = ({
  timers,
  notes,
  onAddTimer,
  onDeleteTimer,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  onSelectPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'timers' | 'notes'>('prompts');
  const [timerMinutes, setTimerMinutes] = useState<number>(5);
  const [timerLabel, setTimerLabel] = useState<string>('Protocol Timer');
  const [newNoteText, setNewNoteText] = useState<string>('');

  const quickPrompts = [
    { label: '▶️ YouTube Kholo', text: 'Jarvis, YouTube open karo mere liye.' },
    { label: '🔍 Google Search', text: 'Jarvis, Google par search karo: AI latest updates.' },
    { label: '💬 WhatsApp Web', text: 'Jarvis, WhatsApp open karo.' },
    { label: '📷 Camera Scan', text: 'Jarvis, optical scanner camera on karo aur dekho.' },
    { label: '⏱️ 5 Min Timer', text: 'Jarvis, 5 minute ka timer laga do.' },
    { label: '🗣️ Urdu / Hindi', text: 'Jarvis, kaisay ho aap? Roman Urdu me baat karo.' },
    { label: '⚡ Overdrive Mode', text: 'Jarvis, Overdrive protocol activate karo.' },
    { label: '📊 System Diagnostics', text: 'Jarvis, run a full system diagnostic and report.' },
  ];

  const handleCreateTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (timerMinutes > 0) {
      playClickSound();
      onAddTimer(timerLabel || 'Timer', timerMinutes);
      setTimerLabel('Protocol Timer');
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      playClickSound();
      onAddNote(newNoteText.trim());
      setNewNoteText('');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col bg-slate-950/80 border border-cyan-500/30 rounded-xl backdrop-blur-md shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-cyan-500/20 bg-black/40 text-xs font-orbitron">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('prompts');
          }}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'prompts'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30 font-bold'
              : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>COMMANDS</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('timers');
          }}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'timers'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30 font-bold'
              : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>TIMERS {timers.length > 0 && `(${timers.length})`}</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('notes');
          }}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
            activeTab === 'notes'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30 font-bold'
              : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>DIRECTIVES {notes.length > 0 && `(${notes.length})`}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3 max-h-64 overflow-y-auto">
        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-mono-tech">
              Voice or click any prompt to transmit to Jarvis:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playClickSound();
                    onSelectPrompt(q.text);
                  }}
                  className="p-2 rounded-lg bg-black/60 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group"
                >
                  <div className="text-xs font-orbitron font-semibold text-cyan-300 group-hover:text-cyan-200">
                    {q.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-tech truncate mt-0.5">
                    "{q.text}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timers Tab */}
        {activeTab === 'timers' && (
          <div className="space-y-3">
            {/* Create Timer Form */}
            <form onSubmit={handleCreateTimer} className="flex gap-2">
              <input
                type="text"
                placeholder="Timer label"
                value={timerLabel}
                onChange={(e) => setTimerLabel(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-black/60 border border-cyan-500/30 rounded text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-tech"
              />
              <input
                type="number"
                min="1"
                max="180"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1.5 text-xs bg-black/60 border border-cyan-500/30 rounded text-cyan-200 text-center font-mono-tech"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-cyan-600/40 border border-cyan-400 rounded text-cyan-200 text-xs font-orbitron hover:bg-cyan-600/60 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set</span>
              </button>
            </form>

            {/* Active Timers List */}
            {timers.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono-tech text-center py-4">
                No active timers. Or tell Jarvis: "Set a 5 minute timer".
              </p>
            ) : (
              <div className="space-y-1.5">
                {timers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded bg-black/60 border border-cyan-500/25"
                  >
                    <div>
                      <div className="text-xs font-orbitron text-cyan-300">{t.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono-tech">
                        Total {Math.round(t.durationSeconds / 60)} min
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono-tech text-base font-bold text-amber-300">
                        {formatSeconds(t.remainingSeconds)}
                      </span>
                      <button
                        onClick={() => {
                          playClickSound();
                          onDeleteTimer(t.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            {/* Create Note Form */}
            <form onSubmit={handleCreateNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add directive or mission note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-black/60 border border-cyan-500/30 rounded text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-tech"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-cyan-600/40 border border-cyan-400 rounded text-cyan-200 text-xs font-orbitron hover:bg-cyan-600/60 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono-tech text-center py-4">
                No directives stored. Or say: "Jarvis, save note: review blueprints".
              </p>
            ) : (
              <div className="space-y-1.5">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-2 rounded bg-black/60 border border-cyan-500/20"
                  >
                    <button
                      onClick={() => {
                        playClickSound();
                        onToggleNote(note.id);
                      }}
                      className="flex items-center space-x-2 text-left flex-1 mr-2"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          note.completed
                            ? 'bg-cyan-500 border-cyan-400'
                            : 'border-slate-500 bg-transparent'
                        }`}
                      >
                        {note.completed && <div className="w-1.5 h-1.5 bg-black rounded-sm" />}
                      </div>
                      <span
                        className={`text-xs font-mono-tech ${
                          note.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {note.text}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteNote(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
