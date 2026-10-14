export type JarvisStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'scanning' | 'error';

export interface SearchSource {
  title: string;
  uri: string;
}

export interface ExecutedAction {
  type: 'open_url' | 'search_web' | 'open_camera' | 'set_timer' | 'add_note' | 'toggle_overdrive' | 'toggle_stealth';
  url?: string;
  label?: string;
  query?: string;
  minutes?: number;
  text?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: SearchSource[];
  imagePreview?: string;
  isAudioPlaying?: boolean;
  action?: ExecutedAction;
}

export interface JarvisTimer {
  id: string;
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  createdAt: string;
}

export interface MissionNote {
  id: string;
  text: string;
  timestamp: string;
  completed: boolean;
}

export interface SystemTelemetry {
  arcReactorCore: number; // percentage
  neuralSync: number; // ms
  memoryLoad: number; // percentage
  networkPing: number; // ms
  batteryLevel: number | null;
  deviceType: 'mobile' | 'desktop';
  stealthMode: boolean;
  overdrive: boolean;
}
