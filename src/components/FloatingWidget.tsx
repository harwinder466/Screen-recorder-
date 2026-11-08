import React, { useState } from 'react';
import { Square, Pause, Play, Pen, Camera, User, MoreVertical, X } from 'lucide-react';
import { formatDuration } from '../utils/exporter';

interface FloatingWidgetProps {
  isRecording: boolean;
  isPaused: boolean;
  durationSec: number;
  onStop: () => void;
  onTogglePause: () => void;
  onOpenBrush: () => void;
  onTakeScreenshot: () => void;
  onToggleFacecam: () => void;
  audioLevel: number; // 0 to 100
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  isRecording,
  isPaused,
  durationSec,
  onStop,
  onTogglePause,
  onOpenBrush,
  onTakeScreenshot,
  onToggleFacecam,
  audioLevel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 90, e.clientX - dragOffset.x));
    const newY = Math.max(50, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    // Snap to nearest edge (left or right) for mobile feel
    const midX = window.innerWidth / 2;
    if (position.x > midX) {
      setPosition((prev) => ({ ...prev, x: window.innerWidth - 75 }));
    } else {
      setPosition((prev) => ({ ...prev, x: 15 }));
    }
  };

  if (!isRecording) return null;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 select-none touch-none"
    >
      {/* Expanded action wheel / bar */}
      {isExpanded ? (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl shadow-black/40 flex items-center gap-2 text-white animate-in fade-in zoom-in-95 duration-150">
          {/* Timer & Pause */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-xs font-bold tabular-nums">
              {formatDuration(durationSec)}
            </span>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => onTogglePause()}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-amber-400 transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Stop */}
          <button
            onClick={() => {
              setIsExpanded(false);
              onStop();
            }}
            className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white transition-colors shadow-md shadow-rose-600/30"
            title="Stop & Save"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Brush / Pen */}
          <button
            onClick={() => {
              setIsExpanded(false);
              onOpenBrush();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sky-400 transition-colors"
            title="Screen Brush Annotation"
          >
            <Pen className="w-4 h-4" />
          </button>

          {/* Screenshot */}
          <button
            onClick={() => {
              onTakeScreenshot();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 transition-colors"
            title="Take Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Facecam */}
          <button
            onClick={() => {
              onToggleFacecam();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-indigo-400 transition-colors"
            title="Toggle Facecam"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Collapse */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Collapsed Floating Recorder Bubble */
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setIsExpanded(true)}
          className="relative cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-xl shadow-rose-600/40 border-2 border-white flex flex-col items-center justify-center text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute top-2 right-2" />
            <span className="font-mono text-[10px] font-bold tracking-tight">
              {formatDuration(durationSec)}
            </span>
            <div className="flex items-center gap-0.5 mt-0.5">
              {/* Audio level meter bars */}
              <div
                style={{ height: `${Math.max(3, Math.min(10, (audioLevel / 100) * 10))}px` }}
                className="w-1 bg-white/90 rounded-full transition-all"
              />
              <div
                style={{ height: `${Math.max(4, Math.min(12, (audioLevel / 100) * 12))}px` }}
                className="w-1 bg-white/90 rounded-full transition-all"
              />
              <div
                style={{ height: `${Math.max(3, Math.min(8, (audioLevel / 100) * 8))}px` }}
                className="w-1 bg-white/90 rounded-full transition-all"
              />
            </div>
          </div>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-white text-white flex items-center justify-center">
            <MoreVertical className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};
