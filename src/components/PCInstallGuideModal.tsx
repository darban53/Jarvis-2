import React from 'react';
import { X, Laptop, Smartphone, Key, Terminal, ExternalLink, Check, Copy, QrCode, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/audioSynthesizer';

interface PCInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PCInstallGuideModal: React.FC<PCInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=030712&color=00e5ff&margin=1`;

  const copyToClipboard = (text: string, id: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-950 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-cyan-500/30 bg-cyan-950/30">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-orbitron font-bold text-sm sm:text-base tracking-wider text-cyan-300">
              PHONE &amp; PC INSTALLATION GUIDE (اردو رہنمائی)
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200 text-xs sm:text-sm font-mono-tech leading-relaxed">
          {/* SECTION 1: HOW TO INSTALL ON PHONE (MAIN USER QUESTION) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/50 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <div className="flex items-center space-x-2 text-cyan-300 font-orbitron font-bold text-sm sm:text-base mb-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span>📱 PHONE PAR INSTALL KARNE KA TAREEQA</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-400 text-emerald-200 text-xs mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-white text-sm">📦 ANDROID APK TAYYAR HAI!</span>
                <p className="text-[11px] text-emerald-300">build-outputs/app-debug.apk (181 KB)</p>
              </div>
              <a
                href="/download-apk"
                download="JARVIS-Mark85.apk"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-orbitron font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 transition-all flex items-center space-x-1.5"
              >
                <span>📥 DOWNLOAD APK FILE</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Instructions */}
              <div className="md:col-span-8 space-y-2 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Apne phone ke <strong>Google Chrome</strong> (Android) ya <strong>Safari</strong> (iPhone) mein yeh link open karein:
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 p-1.5 bg-black/80 rounded-lg border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">
                  <span className="truncate flex-1">{currentUrl}</span>
                  <button
                    onClick={() => copyToClipboard(currentUrl, 'url')}
                    className="px-2 py-1 bg-cyan-500 text-black rounded font-orbitron font-bold text-[10px] hover:bg-cyan-400 flex items-center space-x-1 shrink-0"
                  >
                    {copiedStep === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 'url' ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Chrome ke upar right <strong>3 Dots (⋮)</strong> par tap karein aur <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> dabayein.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Aapke phone par WhatsApp aur YouTube ki tarah <strong>J.A.R.V.I.S.</strong> ka icon ban jayega!
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-black/70 border border-cyan-500/40">
                <span className="text-[10px] font-orbitron text-cyan-300 font-bold mb-1 flex items-center space-x-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>PHONE SCAN QR</span>
                </span>
                <img
                  src={qrCodeUrl}
                  alt="Scan with Phone Camera"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border border-cyan-400/50 shadow-md"
                />
                <span className="text-[9px] text-slate-400 mt-1 text-center">
                  Phone camera se scan karein
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: INSTALL ON PC */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 font-orbitron font-bold text-xs sm:text-sm">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>💻 PC / LAPTOP PAR INSTALL KARNA (Desktop App)</span>
            </div>
            <p className="text-xs text-slate-300">
              1. Apne PC par Chrome ya Edge browser mein is app ko open karein.<br />
              2. Address bar ke bilkul right side par <strong>Install App icon (کمپیوٹر ڈاؤنلوڈ نشان)</strong> par click karein.<br />
              3. "Install" par click karte hi yeh aapke Windows PC par software ki tarah install ho kar desktop par icon bana dega!
            </p>
          </div>

          {/* SECTION 3: PC & PHONE VOICE COMMANDS */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 font-orbitron font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>🗣️ KUCH BHI BOL KAR KAAM KARWANA</span>
            </div>
            <p className="text-xs text-slate-300">
              Mic daba kar jo bhi bolenge, Jarvis aapke PC aur Phone par foran open karega:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"YouTube kholo"</strong>
                <p className="text-[10px] text-slate-400">YouTube launch karega</p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"Google search karo"</strong>
                <p className="text-[10px] text-slate-400">Search results open karega</p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"WhatsApp open karo"</strong>
                <p className="text-[10px] text-slate-400">WhatsApp Web kholega</p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"Camera scan karo"</strong>
                <p className="text-[10px] text-slate-400">Optical scanner on karega</p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"5 minute timer"</strong>
                <p className="text-[10px] text-slate-400">Alarm countdown lagayega</p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/20 text-cyan-200">
                <strong>"Settings open karo"</strong>
                <p className="text-[10px] text-slate-400">Sari settings kholega</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-cyan-500/30 bg-black/70 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            THEEK HAI / UNDERSTOOD
          </button>
        </div>
      </div>
    </div>
  );
};
