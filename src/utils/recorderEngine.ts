import { RecorderConfig } from '../types/recorder';

export interface RecorderCallbacks {
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (finalBlob: Blob, durationSec: number, thumbnail: string) => void;
  onError?: (err: Error) => void;
  onAudioLevel?: (level: number) => void; // 0 to 100
}

export class ScreenRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private cameraStream: MediaStream | null = null;
  private mixedStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private totalPausedTime: number = 0;
  private pauseStartTime: number = 0;
  private isPaused: boolean = false;
  private callbacks: RecorderCallbacks = {};
  private config: RecorderConfig;
  private hiddenVideo: HTMLVideoElement | null = null;
  private mimeTypeUsed: string = 'video/mp4';

  constructor(config: RecorderConfig, callbacks: RecorderCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  public updateConfig(newConfig: RecorderConfig) {
    this.config = newConfig;
  }

  // Get best supported video MIME type with MP4 priority
  public static getSupportedMimeType(): string {
    const candidates = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  }

  // Calculate resolution dimensions based on configuration
  private getTargetDimensions(): { width: number; height: number } {
    const isPortrait = this.config.orientation === 'portrait';
    switch (this.config.resolution) {
      case '2K':
        return isPortrait ? { width: 1440, height: 2560 } : { width: 2560, height: 1440 };
      case '1080p':
      default:
        return isPortrait ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
      case '720p':
        return isPortrait ? { width: 720, height: 1280 } : { width: 1280, height: 720 };
      case '480p':
        return isPortrait ? { width: 480, height: 854 } : { width: 854, height: 480 };
    }
  }

  // Starts the recording process
  public async start(): Promise<MediaStream> {
    this.chunks = [];
    this.isPaused = false;
    this.totalPausedTime = 0;

    const dims = this.getTargetDimensions();
    const fps = this.config.fps || 60;

    // 1. Capture Display Media (Screen / Mobile Window)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        this.displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            width: { ideal: dims.width, max: dims.width },
            height: { ideal: dims.height, max: dims.height },
            frameRate: { ideal: fps, max: fps },
          },
          audio: this.config.audioSource === 'system' || this.config.audioSource === 'mixed',
        });
      } else {
        throw new Error('Screen capture API is not supported in this browser.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      // Handle user cancellation
      if (errorObj.name === 'NotAllowedError' || errorObj.message?.includes('Permission denied')) {
        throw new Error('Screen recording permission was cancelled.');
      }
      throw errorObj;
    }

    // 2. Setup Audio tracks (Mic + System)
    const audioTracks: MediaStreamTrack[] = [];

    // System audio from display stream if present
    const systemAudioTracks = this.displayStream.getAudioTracks();

    // Microphone audio if requested
    if (this.config.audioSource === 'mic' || this.config.audioSource === 'mixed') {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (e) {
        console.warn('Microphone permission not granted or unavailable:', e);
      }
    }

    // Mix audio if both or mic is active
    if (this.micStream || systemAudioTracks.length > 0) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const destination = this.audioContext.createMediaStreamDestination();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;

        if (this.micStream && this.micStream.getAudioTracks().length > 0) {
          const micSource = this.audioContext.createMediaStreamSource(this.micStream);
          micSource.connect(destination);
          micSource.connect(this.analyser);
        }

        if (systemAudioTracks.length > 0) {
          const sysStream = new MediaStream([systemAudioTracks[0]]);
          const sysSource = this.audioContext.createMediaStreamSource(sysStream);
          sysSource.connect(destination);
          sysSource.connect(this.analyser);
        }

        const combinedAudioTracks = destination.stream.getAudioTracks();
        if (combinedAudioTracks.length > 0) {
          audioTracks.push(combinedAudioTracks[0]);
        }

        this.startAudioMeter();
      } catch (e) {
        console.warn('Audio mixing error, using raw tracks:', e);
        if (this.micStream) {
          audioTracks.push(...this.micStream.getAudioTracks());
        } else if (systemAudioTracks.length > 0) {
          audioTracks.push(...systemAudioTracks);
        }
      }
    }

    // 3. Assemble mixed stream
    const videoTracks = this.displayStream.getVideoTracks();
    this.mixedStream = new MediaStream([...videoTracks, ...audioTracks]);

    // Handle track ended (e.g. user clicks "Stop Sharing" in browser chrome banner)
    if (videoTracks.length > 0) {
      videoTracks[0].onended = () => {
        this.stop();
      };
    }

    // 4. Setup hidden video element to capture snapshots / thumbnails
    this.hiddenVideo = document.createElement('video');
    this.hiddenVideo.srcObject = this.mixedStream;
    this.hiddenVideo.muted = true;
    this.hiddenVideo.playsInline = true;
    await this.hiddenVideo.play().catch(() => {});

    // 5. Initialize MediaRecorder
    this.mimeTypeUsed = ScreenRecorderService.getSupportedMimeType();
    const bps = (this.config.bitrate || 16) * 1000 * 1000;

    try {
      this.mediaRecorder = new MediaRecorder(this.mixedStream, {
        mimeType: this.mimeTypeUsed,
        videoBitsPerSecond: bps,
      });
    } catch {
      // Fallback without bitrate constraint
      this.mediaRecorder = new MediaRecorder(this.mixedStream);
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        if (this.callbacks.onDataAvailable) {
          this.callbacks.onDataAvailable(event.data);
        }
      }
    };

    this.mediaRecorder.onstop = async () => {
      const finalBlob = new Blob(this.chunks, { type: this.mimeTypeUsed.includes('mp4') ? 'video/mp4' : 'video/webm' });
      const durationSec = Math.max(1, Math.round((Date.now() - this.startTime - this.totalPausedTime) / 1000));
      const thumb = this.captureCurrentThumbnail();

      // Clean up tracks
      this.cleanupStreams();

      if (this.callbacks.onStop) {
        this.callbacks.onStop(finalBlob, durationSec, thumb);
      }
    };

    this.mediaRecorder.onerror = (e) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(new Error(`Recording error: ${e}`));
      }
    };

    // Start recording with 1-second timeslices
    this.startTime = Date.now();
    this.mediaRecorder.start(1000);

    return this.mixedStream;
  }

  // Audio level monitoring loop
  private startAudioMeter() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedLevel = Math.min(100, Math.round((avg / 255) * 100 * 1.5));

      if (this.callbacks.onAudioLevel) {
        this.callbacks.onAudioLevel(normalizedLevel);
      }

      this.animFrameId = requestAnimationFrame(updateLevel);
    };

    this.animFrameId = requestAnimationFrame(updateLevel);
  }

  // Capture instant screenshot thumbnail
  public captureCurrentThumbnail(): string {
    if (!this.hiddenVideo || this.hiddenVideo.videoWidth === 0) {
      return '';
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = Math.round(480 * (this.hiddenVideo.videoHeight / this.hiddenVideo.videoWidth));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(this.hiddenVideo, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.warn('Could not generate thumbnail:', e);
    }
    return '';
  }

  // Take high resolution full screenshot
  public takeFullScreenshot(): { dataUrl: string; width: number; height: number; size: number } | null {
    if (!this.hiddenVideo || this.hiddenVideo.videoWidth === 0) {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.hiddenVideo.videoWidth;
    canvas.height = this.hiddenVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(this.hiddenVideo, 0, 0);
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const approximateSize = Math.round((dataUrl.length * 3) / 4);

    return {
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      size: approximateSize,
    };
  }

  public pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  public resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.totalPausedTime += Date.now() - this.pauseStartTime;
    }
  }

  public stop() {
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    } else {
      this.cleanupStreams();
    }
  }

  private cleanupStreams() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.displayStream) {
      this.displayStream.getTracks().forEach((t) => t.stop());
      this.displayStream = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((t) => t.stop());
      this.cameraStream = null;
    }
    if (this.hiddenVideo) {
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo = null;
    }
  }

  public getLiveStream(): MediaStream | null {
    return this.mixedStream;
  }

  public getElapsedTimeSec(): number {
    if (!this.startTime) return 0;
    const currentPauseOffset = this.isPaused ? Date.now() - this.pauseStartTime : 0;
    return Math.max(0, Math.floor((Date.now() - this.startTime - this.totalPausedTime - currentPauseOffset) / 1000));
  }
}
