export type AudioSourceType = 'mic' | 'system' | 'mixed' | 'none';
export type ResolutionType = '1080p' | '720p' | '2K' | '480p';
export type FpsType = 60 | 30 | 24;
export type BitrateType = 16 | 8 | 4;
export type OrientationType = 'portrait' | 'landscape' | 'auto';

export interface RecorderConfig {
  resolution: ResolutionType;
  fps: FpsType;
  bitrate: BitrateType;
  orientation: OrientationType;
  audioSource: AudioSourceType;
  countdownSeconds: number;
  enableFacecam: boolean;
  facecamShape: 'circle' | 'square';
  enableWatermark: boolean;
  watermarkText: string;
  enableBrush: boolean;
  floatingWidget: boolean;
  showTouches: boolean;
  outputFormat: 'mp4' | 'webm';
}

export interface RecordingItem {
  id: string;
  title: string;
  blob: Blob;
  thumbnailUrl: string;
  duration: number; // in seconds
  sizeBytes: number;
  resolution: string;
  fps: number;
  hasAudio: boolean;
  audioSource: AudioSourceType;
  createdAt: number;
  isFavorite: boolean;
  format: 'mp4' | 'webm';
}

export interface ScreenshotItem {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: number;
  width: number;
  height: number;
  sizeBytes: number;
}
