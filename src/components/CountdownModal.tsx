import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';

interface CountdownModalProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({
  seconds,
  onComplete,
  onCancel,
}) => {
  const [currentCount, setCurrentCount] = useState(seconds);

  useEffect(() => {
    if (currentCount <= 0) {
      onComplete();
      return;
    }

    // Play subtle audio beep
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = currentCount === 1 ? 880 : 440;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay restrictions or unsupported
    }

    const timer = setTimeout(() => {
      setCurrentCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentCount, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="text-center p-8 flex flex-col items-center">
        <span className="text-sm font-semibold tracking-wider uppercase text-rose-300 mb-4">
          Recording starts in
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentCount}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-36 h-36 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center text-7xl font-extrabold shadow-2xl shadow-rose-600/50"
          >
            {currentCount > 0 ? currentCount : <Play className="w-16 h-16 fill-white" />}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-sm text-slate-300 font-medium">
          Get ready! Full screen capture is launching...
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onComplete}
            className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-transform active:scale-95"
          >
            Start Now
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
