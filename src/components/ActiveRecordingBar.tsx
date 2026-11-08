import React from 'react';
import { Square, Pause, Play, Pen, Camera, User, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../utils/exporter';

interface ActiveRecordingBarProps {
  durationSec: number;
  isPaused: boolean;
  audioLevel: number;
  hasAudio: boolean;
  resolution: string;
  fps: number;
  onPauseToggle: () => void;
  onStop: () => void;
  onTakeScreenshot: () => void;
  onOpenBrush: () => void;
  onToggleFacecam: () => void;
  isFacecamActive: boolean;
}

export const ActiveRecordingBar: React.FC<ActiveRecordingBarProps> = ({
  durationSec,
  isPaused,
  audioLevel,
  hasAudio,
  resolution,
  fps,
  onPauseToggle,
  onStop,
  onTakeScreenshot,
  onOpenBrush,
  onToggleFacecam,
  isFacecamActive,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-rose-50 via-white to-amber-50 border border-rose-200/80 rounded-3xl p-4 md:p-6 shadow-xl shadow-rose-500/10 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Live status, timer, audio level */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
            <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping absolute" />
            <span className="w-3.5 h-3.5 rounded-full bg-white relative z-10" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-[#0F172A] tabular-nums">
                {formatDuration(durationSec)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                {isPaused ? 'PAUSED' : 'RECORDING'}
              </span>
            </div>

            {/* Clean unboxed metadata with · */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
              <span>{resolution}</span>
              <span aria-hidden="true">·</span>
              <span>{fps} FPS</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                {hasAudio ? (
                  <>
                    <Volume2 className="w-3 h-3 text-emerald-600" />
                    <span>Audio Active</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3 text-slate-400" />
                    <span>Muted</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Live Audio Frequency Meter */}
        {hasAudio && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-rose-100">
            <span className="text-[11px] font-medium text-slate-500">Mic:</span>
            <div className="flex items-end gap-0.5 h-5 w-24">
              {[15, 30, 45, 60, 75, 90, 100].map((threshold, i) => {
                const isActive = audioLevel >= threshold;
                return (
                  <div
                    key={i}
                    style={{ height: `${(i + 1) * 3}px` }}
                    className={`flex-1 rounded-full transition-colors ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Primary Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Pause / Resume */}
          <button
            onClick={onPauseToggle}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              isPaused
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Screen Brush Annotation */}
          <button
            onClick={onOpenBrush}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
            title="Draw on screen"
          >
            <Pen className="w-4 h-4" />
            <span className="hidden sm:inline">Brush</span>
          </button>

          {/* Screenshot */}
          <button
            onClick={onTakeScreenshot}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
            title="Take snapshot"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          {/* Facecam Toggle */}
          <button
            onClick={onToggleFacecam}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              isFacecamActive
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle PIP Facecam"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Facecam</span>
          </button>

          {/* Stop and Save HD MP4 */}
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 active:scale-95 ml-auto md:ml-0"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
