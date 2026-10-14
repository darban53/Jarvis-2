import React, { useEffect, useRef, useState } from 'react';
import { Camera, ExternalLink, Mic, MicOff, Send, Square, Volume2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ChatMessage, JarvisStatus } from '../types';
import { playClickSound } from '../utils/audioSynthesizer';

interface CommandTerminalProps {
  messages: ChatMessage[];
  status: JarvisStatus;
  isListening: boolean;
  transcript: string;
  onSendMessage: (text: string, imageBase64?: string) => void;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onReplayAudio: (message: ChatMessage) => void;
  onOpenScanner: () => void;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  messages,
  status,
  isListening,
  transcript,
  onSendMessage,
  onToggleListening,
  onStopSpeaking,
  onReplayAudio,
  onOpenScanner,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputText.trim();
    if (!prompt && !selectedImage) return;

    playClickSound();
    onSendMessage(prompt || 'Jarvis, analyze this input.', selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-cyan-500/30 rounded-xl backdrop-blur-md shadow-2xl overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-black/40">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-orbitron text-xs font-bold tracking-wider text-cyan-300">
            TACTICAL COMMUNICATIONS LOG
          </span>
        </div>
        <div className="text-[10px] font-mono-tech text-slate-400">
          STREAM ID: #JARVIS-85
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[180px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Badge */}
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono-tech text-slate-400">
              <span className={msg.role === 'user' ? 'text-amber-400' : 'text-cyan-400'}>
                {msg.role === 'user' ? 'COMMANDER' : 'J.A.R.V.I.S.'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm font-mono-tech leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-950/30 border border-amber-500/40 text-amber-100 rounded-tr-none shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-cyan-950/30 border border-cyan-500/40 text-cyan-100 rounded-tl-none shadow-[0_0_15px_rgba(0,229,255,0.15)]'
              }`}
            >
              {/* Attached Image Preview if available */}
              {msg.imagePreview && (
                <div className="relative mb-2 rounded-lg overflow-hidden border border-cyan-400/50 max-h-48">
                  <img
                    src={msg.imagePreview}
                    alt="Scan Target"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono-tech text-cyan-300">
                    OPTICAL SCAN
                  </div>
                </div>
              )}

              {/* Message text with preserved linebreaks */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Interactive Action Card if an action was triggered by Jarvis */}
              {msg.action && (
                <div className="mt-2.5 p-2 rounded-lg bg-black/70 border border-cyan-400/40">
                  <div className="text-[10px] text-cyan-400 font-orbitron mb-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>JARVIS PC/PHONE ACTION:</span>
                  </div>
                  {msg.action.type === 'open_url' && msg.action.url && (
                    <a
                      href={msg.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-400 text-emerald-200 hover:bg-emerald-900 font-orbitron text-xs transition-colors"
                    >
                      <span>🚀 Launch {msg.action.label || 'Target'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {msg.action.type === 'search_web' && (
                    <a
                      href={msg.action.url || `https://www.google.com/search?q=${encodeURIComponent(msg.action.query || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-400 text-cyan-200 hover:bg-cyan-900 font-orbitron text-xs transition-colors"
                    >
                      <span>🔍 View Search: "{msg.action.query}"</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {msg.action.type === 'open_camera' && (
                    <button
                      onClick={onOpenScanner}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-400 text-cyan-200 hover:bg-cyan-900 font-orbitron text-xs transition-colors"
                    >
                      <span>📷 Open Optical Scanner</span>
                    </button>
                  )}
                  {msg.action.type === 'set_timer' && (
                    <div className="text-xs text-amber-300 font-mono-tech flex items-center space-x-1">
                      <span>⏱️ Timer Engaged: {msg.action.minutes} min ({msg.action.label || 'Timer'})</span>
                    </div>
                  )}
                  {msg.action.type === 'add_note' && (
                    <div className="text-xs text-sky-300 font-mono-tech flex items-center space-x-1">
                      <span>📝 Directive Saved: "{msg.action.text}"</span>
                    </div>
                  )}
                  {msg.action.type === 'toggle_overdrive' && (
                    <div className="text-xs text-amber-400 font-orbitron">
                      ⚡ Overdrive Protocol Toggled
                    </div>
                  )}
                  {msg.action.type === 'toggle_stealth' && (
                    <div className="text-xs text-slate-300 font-orbitron">
                      🛡️ Stealth Mode Toggled
                    </div>
                  )}
                </div>
              )}

              {/* Web Search Sources Citations if grounded */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-cyan-500/20">
                  <div className="text-[10px] text-cyan-400 font-orbitron mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>VERIFIED WEB SOURCES:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[10px] text-cyan-300 hover:text-cyan-100 hover:border-cyan-300 transition-colors"
                      >
                        <span className="truncate max-w-[140px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Replay Voice button for Jarvis responses */}
              {msg.role === 'assistant' && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onReplayAudio(msg)}
                    className="p-1 rounded text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-900/30 transition-colors flex items-center space-x-1 text-[10px]"
                    title="Vocalize response"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Repeat Audio</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live speech transcription badge */}
        {isListening && transcript && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono-tech text-amber-400 mb-0.5">LISTENING...</span>
            <div className="max-w-[85%] rounded-2xl rounded-tr-none p-2.5 bg-amber-950/40 border border-dashed border-amber-400 text-amber-200 text-xs font-mono-tech italic animate-pulse">
              "{transcript}"
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {status === 'thinking' && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono-tech p-2 bg-cyan-950/20 rounded-lg border border-cyan-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Jarvis is computing response & consulting Stark neural satellites...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Thumbnail preview */}
      {selectedImage && (
        <div className="px-3 py-1.5 bg-black/60 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={selectedImage}
              alt="Attached"
              className="w-10 h-10 object-cover rounded border border-cyan-400"
            />
            <span className="text-xs text-cyan-300 font-mono-tech">Image attached for scan</span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-rose-400 hover:underline font-mono-tech"
          >
            Remove
          </button>
        </div>
      )}

      {/* Bottom Command Input Controls */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-3 bg-black/80 border-t border-cyan-500/30 flex items-center gap-1.5 sm:gap-2"
      >
        {/* Optical Scanner Button */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 hover:text-cyan-100 transition-all"
          title="Open Camera Scanner"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Attach File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 sm:p-2.5 rounded-xl bg-black/60 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all"
          title="Attach Photo / Document"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />

        {/* Text Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Jarvis is listening to your voice...'
                : 'Enter command or question for Jarvis...'
            }
            className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-950 border border-cyan-500/40 focus:border-cyan-300 rounded-xl text-cyan-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono-tech"
          />
        </div>

        {/* Stop Speaking Button (Visible when Jarvis is speaking) */}
        {status === 'speaking' && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="p-2 sm:p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 hover:bg-rose-900 transition-all animate-pulse"
            title="Stop Vocalization"
          >
            <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-300" />
          </button>
        )}

        {/* Voice Mic Toggle Button */}
        <button
          type="button"
          onClick={onToggleListening}
          className={`p-2 sm:p-2.5 rounded-xl font-orbitron transition-all flex items-center justify-center ${
            isListening
              ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse'
              : 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]'
          }`}
          title={isListening ? 'Stop Listening' : 'Click or Hold to Speak'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !selectedImage}
          className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
          title="Transmit Command"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};
