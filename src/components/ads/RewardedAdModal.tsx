import React, { useState, useEffect } from 'react';
import { X, Gift, CheckCircle2, Play, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { ADMOB_IDS } from '../../types/ads';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  rewardTitle?: string;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
  rewardTitle = 'VIP 2K Ultra HD & 60FPS Export Unlocked',
}) => {
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [rewardGranted, setRewardGranted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setSecondsRemaining(5);
      setRewardGranted(false);
      return;
    }

    setProgress(0);
    setSecondsRemaining(5);
    setRewardGranted(false);

    const totalDuration = 5; // 5 seconds ad
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      const remaining = Math.max(0, Math.ceil(totalDuration - elapsed));

      setProgress(pct);
      setSecondsRemaining(remaining);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setRewardGranted(true);
        onRewardEarned();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onRewardEarned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        {/* AdMob Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
              AdMob Rewarded Video
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
              {ADMOB_IDS.REWARDED}
            </span>
          </div>

          <div>
            {rewardGranted ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Claim & Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" />
                Reward in {secondsRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative aspect-video bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated decorative waves */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0,_transparent_70%)] animate-pulse" />

          {rewardGranted ? (
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">Reward Granted!</h4>
              <p className="text-xs text-emerald-300 font-semibold mt-1">
                {rewardTitle}
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                <Play className="w-7 h-7 fill-white text-white ml-0.5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Watching Sponsored Video
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                Keep watching to unlock VIP 2K High Definition recording & priority export.
              </p>
            </div>
          )}

          {/* Video bottom progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100"
            />
          </div>
        </div>

        {/* Ad Reward Details */}
        <div className="p-6 bg-slate-900 flex flex-col items-center text-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Reward: Free VIP Pass for 2K Ultra HD & 60FPS</span>
          </div>

          <p className="text-xs text-slate-400">
            Ad Unit ID: <span className="font-mono text-slate-300">{ADMOB_IDS.REWARDED}</span>
          </p>

          <div className="w-full pt-2">
            {rewardGranted ? (
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Claim Reward & Enjoy VIP</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-400 rounded-2xl text-sm font-semibold cursor-not-allowed"
              >
                Please wait {secondsRemaining}s to receive reward...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
