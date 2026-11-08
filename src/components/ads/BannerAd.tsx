import React, { useState } from 'react';
import { ExternalLink, Info, X, Sparkles } from 'lucide-react';
import { ADMOB_IDS } from '../../types/ads';

interface BannerAdProps {
  onRewardClick?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({ onRewardClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#F1F5F9] border-t border-[#E2E8F0] px-3 py-2 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Ad badge & Advertiser info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold tracking-wider text-slate-700 bg-white border border-slate-300 px-1 py-0.2 rounded uppercase">
                Ad · Test Ad
              </span>
              <span className="text-xs font-bold text-[#0F172A] truncate">
                Google Play Games — High FPS Gaming Suite
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#64748B] truncate">
              <span className="truncate">Unit: {ADMOB_IDS.BANNER}</span>
              <span aria-hidden="true">·</span>
              <span>Install free</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (onRewardClick) onRewardClick();
            }}
            className="hidden xs:flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-[#0B57D0] border border-slate-200 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-2xl"
          >
            <span>Install</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
            title="Hide Banner Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
