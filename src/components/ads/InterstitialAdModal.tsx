import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Star, Sparkles } from 'lucide-react';
import { ADMOB_IDS } from '../../types/ads';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasonText?: string;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  onClose,
  reasonText = 'Screen Recording Saved Successfully!',
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    setCountdown(5);
    setCanSkip(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        {/* AdMob Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
              AdMob Test Ad
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
              {ADMOB_IDS.INTERSTITIAL}
            </span>
          </div>

          <div>
            {canSkip ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono font-semibold">
                Skip in {countdown}s
              </span>
            )}
          </div>
        </div>

        {/* Reason banner */}
        {reasonText && (
          <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-4 py-2 text-center text-xs text-emerald-400 font-medium">
            {reasonText}
          </div>
        )}

        {/* Ad Content Creative */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-xl shadow-purple-500/20 my-2">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Pixel Gaming Studio HD
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Next-generation screen rendering engine with zero-latency 120 FPS game recording and cloud backup.
            </p>
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold py-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-slate-300 ml-1">4.9 · 50M+ Downloads</span>
          </div>

          <div className="w-full pt-3">
            <button
              onClick={() => {
                alert('Test Ad clicked: Opening Google Play Store link (simulated for test ad).');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <span>Install Free on Play Store</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {canSkip && (
              <button
                onClick={onClose}
                className="mt-3 text-xs text-slate-400 hover:text-white underline transition-colors"
              >
                Return to Stitch Recorder
              </button>
            )}
          </div>
        </div>

        {/* Footer Ad ID verification notice */}
        <div className="px-4 py-2.5 bg-slate-950 text-center text-[10px] text-slate-500 border-t border-slate-800">
          Official Google AdMob Interstitial Unit ID: {ADMOB_IDS.INTERSTITIAL}
        </div>
      </div>
    </div>
  );
};
