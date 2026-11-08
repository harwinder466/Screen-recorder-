import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Scissors,
  Share2,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { RecordingItem } from '../types/recorder';
import {
  formatDuration,
  formatBytes,
  formatDate,
  exportVideoToLocalStorage,
  shareRecording,
  trimVideo,
} from '../utils/exporter';

interface VideoPlayerModalProps {
  item: RecordingItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSaveTrimmed: (newItem: RecordingItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  onClose,
  onDelete,
  onSaveTrimmed,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item?.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Trim mode state
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(item?.duration || 0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (!item) return;
    const url = URL.createObjectURL(item.blob);
    setVideoUrl(url);
    setDuration(item.duration);
    setTrimEnd(item.duration);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item]);

  if (!item) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // If in trim mode and reaches trimEnd, loop back to trimStart
    if (isTrimMode && videoRef.current.currentTime >= trimEnd) {
      videoRef.current.currentTime = trimStart;
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration || item.duration;
    setDuration(d);
    if (!isTrimMode) setTrimEnd(d);
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleExportMP4 = async () => {
    const fileName = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${item.resolution.replace(/\s+/g, '')}.mp4`;
    await exportVideoToLocalStorage(item.blob, fileName);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const handleExecuteTrim = async () => {
    if (trimEnd <= trimStart) return;
    setIsTrimming(true);
    setTrimProgress(0);

    try {
      const trimmedBlob = await trimVideo(item.blob, trimStart, trimEnd, (pct) => {
        setTrimProgress(pct);
      });

      const newItem: RecordingItem = {
        id: `trimmed-${Date.now()}`,
        title: `${item.title} (Trimmed)`,
        blob: trimmedBlob,
        thumbnailUrl: item.thumbnailUrl,
        duration: Math.round(trimEnd - trimStart),
        sizeBytes: trimmedBlob.size,
        resolution: item.resolution,
        fps: item.fps,
        hasAudio: item.hasAudio,
        audioSource: item.audioSource,
        createdAt: Date.now(),
        isFavorite: false,
        format: 'mp4',
      };

      onSaveTrimmed(newItem);
      setIsTrimMode(false);
      onClose();
    } catch (e) {
      console.error('Trimming error:', e);
    } finally {
      setIsTrimming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-[#0F172A] truncate max-w-md">
              {item.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMP4}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportSuccess ? 'Saved!' : 'Export MP4'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[55vh] overflow-hidden group">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            playsInline
            className="max-h-[55vh] w-auto max-w-full cursor-pointer"
          />

          {/* Big Center Play Icon when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute w-16 h-16 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xl transform hover:scale-110 active:scale-95 transition-all"
            >
              <Play className="w-7 h-7 fill-current ml-1" />
            </button>
          )}

          {/* Resolution Watermark in Corner */}
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md">
            {item.resolution} · {item.fps} FPS
          </span>
        </div>

        {/* Controls Bar */}
        <div className="p-4 md:p-6 bg-white space-y-4">
          {/* Progress Seek Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B57D0]"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
              </div>

              {/* Speed pills */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl ml-2 text-xs">
                {[0.5, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Trim toggle */}
              <button
                onClick={() => setIsTrimMode(!isTrimMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isTrimMode
                    ? 'bg-sky-50 border-sky-300 text-sky-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-sky-600" />
                <span>{isTrimMode ? 'Close Trimmer' : 'Trim Video'}</span>
              </button>

              <button
                onClick={() => shareRecording(item.blob, item.title)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200"
                title="Share video"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                className="p-2 text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-50 border border-rose-200"
                title="Delete recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Integrated Video Trimmer Interface */}
          {isTrimMode && (
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-sky-700" />
                  Video Trimmer & Cutter
                </span>
                <span className="text-xs font-mono text-sky-800">
                  Cut Duration: {formatDuration(trimEnd - trimStart)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Start Time: {formatDuration(trimStart)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < trimEnd) {
                        setTrimStart(val);
                        handleSeek(val);
                      }
                    }}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    End Time: {formatDuration(trimEnd)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > trimStart) {
                        setTrimEnd(val);
                        handleSeek(val);
                      }
                    }}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setTrimStart(0);
                    setTrimEnd(duration);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Reset
                </button>

                <button
                  onClick={handleExecuteTrim}
                  disabled={isTrimming || trimEnd <= trimStart}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isTrimming ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Trimming ({trimProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Trimmed MP4 Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Clean Unboxed Metadata Specs Footer with · */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span>{formatDate(item.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatBytes(item.sizeBytes)}</span>
              <span aria-hidden="true">·</span>
              <span>{item.resolution} ({item.fps} FPS)</span>
              <span aria-hidden="true">·</span>
              <span className="uppercase">{item.format} High Definition</span>
            </div>

            <button
              onClick={handleExportMP4}
              className="text-xs font-bold text-[#0B57D0] hover:underline flex items-center gap-1 ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Direct Local Storage Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
