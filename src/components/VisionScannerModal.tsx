import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Zap, Upload, Image as ImageIcon } from 'lucide-react';
import { playClickSound, playActivationSound } from '../utils/audioSynthesizer';

interface VisionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, promptText: string) => void;
}

export const VisionScannerModal: React.FC<VisionScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPreviewImage(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('Camera API not accessible on this device or permission restricted.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setHasCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access warning:', err);
      setCameraError('Camera access denied or device busy. You can still upload images.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const flipCamera = () => {
    playClickSound();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture current video frame
  const captureFrame = () => {
    playActivationSound();
    if (previewImage) {
      onCapture(previewImage, customPrompt || 'Jarvis, analyze this image in detail and brief me.');
      onClose();
      return;
    }

    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 0.85);
      onCapture(base64Data, customPrompt || 'Jarvis, analyze this visual scene from my camera and give me a full tactical breakdown.');
      onClose();
    }
  };

  // File upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-cyan-500/70 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.3)] overflow-hidden flex flex-col">
        {/* Holographic Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-orbitron font-bold text-sm tracking-wider text-cyan-300">
              MARK-85 OPTICAL SCANNER
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img src={previewImage} alt="Scan Preview" className="w-full h-full object-contain" />
          ) : hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-2 text-cyan-500/60" />
              <p className="text-sm font-orbitron text-cyan-300">{cameraError || 'Camera unavailable'}</p>
              <p className="text-xs text-slate-400 mt-1">
                You can select an image or photo directly from your phone or PC storage:
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-200 text-xs font-orbitron hover:bg-cyan-600/50 inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo / File</span>
              </button>
            </div>
          )}

          {/* Futuristic HUD targeting overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* Top HUD Markers */}
            <div className="flex justify-between items-center text-[10px] font-mono-tech text-cyan-400/80">
              <span className="bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                LAT/LON: SYNCHRONIZED
              </span>
              <span className="bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                ZOOM: 1.0X [OPTICAL]
              </span>
            </div>

            {/* Center Reticle & Corner Brackets */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

              {/* Center Crosshair */}
              <div className="w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
              </div>

              {/* Vertical Laser Scanline */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00e5ff] animate-bounce opacity-75" />
            </div>

            {/* Bottom HUD info */}
            <div className="text-[10px] font-mono-tech text-cyan-400/90 text-right">
              TARGET LOCK: READY
            </div>
          </div>
        </div>

        {/* Input prompt / custom instruction */}
        <div className="p-3 bg-slate-900/90 border-t border-cyan-500/30 space-y-3">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Jarvis question (optional): e.g., 'What is this?', 'Read this text', 'Solve this problem'..."
            className="w-full px-3 py-2 text-xs md:text-sm bg-black/60 border border-cyan-500/40 rounded-lg text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-300 font-mono-tech"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              {/* Flip camera button (useful on mobile) */}
              {hasCamera && !previewImage && (
                <button
                  type="button"
                  onClick={flipCamera}
                  className="px-3 py-1.5 text-xs font-orbitron rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 flex items-center space-x-1"
                  title="Switch Front / Rear Camera"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip Cam</span>
                </button>
              )}

              {/* Upload image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-orbitron rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center space-x-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Choose File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    startCamera();
                  }}
                  className="px-2 py-1 text-xs text-rose-400 hover:underline"
                >
                  Clear Image
                </button>
              )}
            </div>

            {/* Scan Action Button */}
            <button
              type="button"
              onClick={captureFrame}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center space-x-2 transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>SCAN WITH JARVIS</span>
            </button>
          </div>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
