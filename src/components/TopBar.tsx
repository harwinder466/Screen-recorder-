import React from 'react';
import { Video, Camera, HardDrive, Smartphone, Monitor, Sparkles, Gift } from 'lucide-react';

interface TopBarProps {
  freeStorageText: string;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onQuickScreenshot: () => void;
  isRecording: boolean;
  isVipUnlocked?: boolean;
  onWatchRewardedAd?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  freeStorageText,
  isMobileFrame,
  onToggleMobileFrame,
  onQuickScreenshot,
  isRecording,
  isVipUnlocked,
  onWatchRewardedAd,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#EA4335] via-[#E11D48] to-[#9333EA] flex items-center justify-center shadow-md shadow-rose-500/20 text-white">
            <Video className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
                Stitch Recorder
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded-md">
                HD MP4
              </span>
              {isVipUnlocked ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-amber-500" />
                  VIP
                </span>
              ) : (
                onWatchRewardedAd && (
                  <button
                    onClick={onWatchRewardedAd}
                    className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors"
                    title="Watch short ad to get VIP Pass"
                  >
                    <Gift className="w-2.5 h-2.5 text-indigo-600" />
                    Free VIP
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Zone 2: Storage indicator & View Switcher */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
            <HardDrive className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span className="font-medium text-[#334155]">{freeStorageText} Available</span>
          </div>

          <button
            onClick={onToggleMobileFrame}
            className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-xl border border-[#E2E8F0] transition-colors"
            title="Toggle between Mobile Phone simulator view and Expanded Studio view"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#6366F1]" />
                <span className="font-medium whitespace-nowrap">Expanded Studio</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#0EA5E9]" />
                <span className="font-medium whitespace-nowrap">Play Store Mobile View</span>
              </>
            )}
          </button>
        </div>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickScreenshot}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#334155] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-all active:scale-95 whitespace-nowrap"
            title="Take instant screen snapshot"
          >
            <Camera className="w-4 h-4 text-[#475569]" />
            <span className="hidden xs:inline">Snapshot</span>
          </button>

          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>LIVE REC</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
