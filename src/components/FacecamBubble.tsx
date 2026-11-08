import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Square, Circle } from 'lucide-react';

interface FacecamBubbleProps {
  onClose: () => void;
  shape?: 'circle' | 'square';
}

export const FacecamBubble: React.FC<FacecamBubbleProps> = ({
  onClose,
  shape: initialShape = 'circle',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [shape, setShape] = useState<'circle' | 'square'>(initialShape);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function startCamera() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err: unknown) {
        console.warn('Camera access error:', err);
        setCameraError('Camera unavailable');
      }
    }

    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle drag
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
    const newX = Math.max(10, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 180, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 select-none group touch-none cursor-move transition-shadow"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`relative overflow-hidden border-2 border-white/90 shadow-2xl shadow-black/30 bg-slate-900 ${
          shape === 'circle' ? 'w-36 h-36 rounded-full' : 'w-44 h-32 rounded-2xl'
        }`}
      >
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-800 text-slate-300">
            <Camera className="w-6 h-6 mb-1 text-slate-400" />
            <span className="text-[10px] leading-tight">{cameraError}</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover pointer-events-none ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
          />
        )}

        {/* Hover / tap mini controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMirrored((prev) => !prev);
            }}
            title="Mirror camera"
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShape((prev) => (prev === 'circle' ? 'square' : 'circle'));
            }}
            title="Toggle shape"
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow"
          >
            {shape === 'circle' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close facecam"
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
