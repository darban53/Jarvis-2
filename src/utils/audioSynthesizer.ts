/**
 * J.A.R.V.I.S. Audio Synthesis & Sound Effects Subsystem
 * Uses Web Audio API for zero-latency, reliable holographic sci-fi sound effects.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Stark HUD Startup Chime (Dual harmonic ascending chord)
 */
export function playActivationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  } catch (e) {
    console.warn('Audio synthesis muted or unsupported:', e);
  }
}

/**
 * Repulsor Listening Ping (High-tech frequency beep)
 */
export function playListeningSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {
    // Ignore autoplay restriction
  }
}

/**
 * Processing / Thinking Tech Chirp
 */
export function playThinkingSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch (e) {
    // Ignore
  }
}

/**
 * Tactical Alarm Tone for Timers
 */
export function playAlarmSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.18;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(987.77, start); // B5
      osc.frequency.exponentialRampToValueAtTime(493.88, start + 0.12);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.15);
    }
  } catch (e) {
    // Ignore
  }
}

/**
 * HUD Tactical Click
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore
  }
}

/**
 * Play Base64 Audio (from Gemini 3.8 Flash Lite TTS)
 */
let currentAudioElement: HTMLAudioElement | null = null;

export function stopCurrentAudio() {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function playBase64WavAudio(base64Data: string, onEnded?: () => void): Promise<void> {
  stopCurrentAudio();
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        if (onEnded) onEnded();
        resolve();
      };

      audio.onerror = (err) => {
        console.error('Audio playback error:', err);
        currentAudioElement = null;
        if (onEnded) onEnded();
        reject(err);
      };

      audio.play().catch((err) => {
        console.warn('Autoplay prevented or audio error:', err);
        currentAudioElement = null;
        if (onEnded) onEnded();
        resolve();
      });
    } catch (err) {
      if (onEnded) onEnded();
      reject(err);
    }
  });
}

export function speakBrowserSpeech(
  text: string,
  onEnded?: () => void,
  rate: number = 1.05,
  pitch: number = 0.95
): boolean {
  if (!('speechSynthesis' in window)) return false;

  stopCurrentAudio();
  const clean = text.replace(/[*_#`~]/g, '').trim();
  if (!clean) return false;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = rate;
  utterance.pitch = pitch; // Configurable refined Jarvis timbre

  // Select British English or preferred voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith('en-GB') ||
      v.name.includes('Daniel') ||
      v.name.includes('Oliver') ||
      v.name.includes('George') ||
      v.name.includes('Google UK English Male')
  ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    if (onEnded) onEnded();
  };

  utterance.onerror = () => {
    if (onEnded) onEnded();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
