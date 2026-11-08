import React from 'react';
import {
  Video,
  Mic,
  Sliders,
  Shield,
  Clock,
  Layers,
  FileVideo,
  Sparkles,
  Info,
} from 'lucide-react';
import { RecorderConfig, ResolutionType, FpsType, BitrateType, AudioSourceType, OrientationType } from '../types/recorder';

interface SettingsTabProps {
  config: RecorderConfig;
  onUpdateConfig: (newConfig: Partial<RecorderConfig>) => void;
  onTestInterstitial?: () => void;
  onWatchRewardedAd?: () => void;
  isVipUnlocked?: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  onUpdateConfig,
  onTestInterstitial,
  onWatchRewardedAd,
  isVipUnlocked,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0F172A]">Screen Recorder Settings</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Customize video resolution, audio capture source, frame rates, and export preferences.
        </p>
      </div>

      {/* Section 1: Video Output Configuration */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Video Settings</h3>
            <span className="text-[11px] text-[#64748B]">Resolution, Bitrate, and FPS options</span>
          </div>
        </div>

        {/* Resolution */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Resolution</span>
            <span className="text-[11px] text-[#64748B]">Higher resolution provides sharper screen text & details</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            {(['1080p', '2K', '720p', '480p'] as ResolutionType[]).map((res) => (
              <button
                key={res}
                onClick={() => onUpdateConfig({ resolution: res })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  config.resolution === res
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Video Bitrate</span>
            <span className="text-[11px] text-[#64748B]">Higher bitrate ensures crystal-clear gaming & motion</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            {([16, 8, 4] as BitrateType[]).map((bps) => (
              <button
                key={bps}
                onClick={() => onUpdateConfig({ bitrate: bps })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  config.bitrate === bps
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bps} Mbps {bps === 16 ? '(HD)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Frame Rate (FPS)</span>
            <span className="text-[11px] text-[#64748B]">60 FPS recommended for smooth mobile gaming</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            {([60, 30, 24] as FpsType[]).map((fps) => (
              <button
                key={fps}
                onClick={() => onUpdateConfig({ fps })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  config.fps === fps
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Screen Orientation</span>
            <span className="text-[11px] text-[#64748B]">Mobile full screen (vertical) or Desktop (landscape)</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            {(['portrait', 'landscape', 'auto'] as OrientationType[]).map((o) => (
              <button
                key={o}
                onClick={() => onUpdateConfig({ orientation: o })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  config.orientation === o
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Audio & Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Audio & Controls</h3>
            <span className="text-[11px] text-[#64748B]">Microphone, countdown, and overlay toggles</span>
          </div>
        </div>

        {/* Audio Source */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Audio Source</span>
            <span className="text-[11px] text-[#64748B]">Mix voice with system audio or mute</span>
          </div>
          <select
            value={config.audioSource}
            onChange={(e) => onUpdateConfig({ audioSource: e.target.value as AudioSourceType })}
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="mixed">Microphone + System Audio</option>
            <option value="mic">Microphone Commentary Only</option>
            <option value="system">System / Device Audio Only</option>
            <option value="none">Mute (No Audio)</option>
          </select>
        </div>

        {/* Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Countdown Timer</span>
            <span className="text-[11px] text-[#64748B]">Preparation delay before recording starts</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            {[0, 3, 5, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateConfig({ countdownSeconds: sec })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  config.countdownSeconds === sec
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec === 0 ? 'Off' : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Bubble */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Floating Quick Bubble</span>
            <span className="text-[11px] text-[#64748B]">Show on-screen draggable bubble during recording</span>
          </div>
          <button
            onClick={() => onUpdateConfig({ floatingWidget: !config.floatingWidget })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              config.floatingWidget ? 'bg-rose-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.floatingWidget ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section 3: Watermark & Output format */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <FileVideo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Format & Watermark</h3>
            <span className="text-[11px] text-[#64748B]">Output container format and custom watermark</span>
          </div>
        </div>

        {/* Output Format */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Output Video Format</span>
            <span className="text-[11px] text-[#64748B]">MP4 is universal for YouTube, TikTok, WhatsApp, and Android</span>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
            MP4 (High Definition)
          </span>
        </div>

        {/* Watermark toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">Add Watermark</span>
            <span className="text-[11px] text-[#64748B]">Burn custom text or channel name into corner</span>
          </div>
          <button
            onClick={() => onUpdateConfig({ enableWatermark: !config.enableWatermark })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              config.enableWatermark ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.enableWatermark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {config.enableWatermark && (
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Watermark Text:
            </label>
            <input
              type="text"
              value={config.watermarkText}
              onChange={(e) => onUpdateConfig({ watermarkText: e.target.value })}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Captured with Stitch Recorder"
            />
          </div>
        )}
      </div>

      {/* Section 4: Google AdMob Integration */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Google AdMob Ad Units</h3>
            <span className="text-[11px] text-[#64748B]">Configured AdMob unit IDs for Banner, Interstitial, and Rewarded ads</span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Banner */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="font-bold text-[#1E293B] block">Banner Ad Unit (Active at bottom)</span>
              <span className="font-mono text-[11px] text-[#0284C7] select-all">
                ca-app-pub-3940256099942544/6300978111
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start sm:self-auto">
              Live Bottom Banner
            </span>
          </div>

          {/* Interstitial */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="font-bold text-[#1E293B] block">Interstitial Ad Unit (Triggered on record stop & trim)</span>
              <span className="font-mono text-[11px] text-[#0284C7] select-all">
                ca-app-pub-3940256099942544/1033173712
              </span>
            </div>
            {onTestInterstitial && (
              <button
                onClick={onTestInterstitial}
                className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                Test Interstitial Ad
              </button>
            )}
          </div>

          {/* Rewarded */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="font-bold text-[#1E293B] block">Rewarded Video Ad Unit (Unlocks 2K Ultra HD VIP)</span>
              <span className="font-mono text-[11px] text-[#0284C7] select-all">
                ca-app-pub-3940256099942544/5224354917
              </span>
            </div>
            {onWatchRewardedAd && (
              <button
                onClick={onWatchRewardedAd}
                className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                {isVipUnlocked ? 'Watch Video Ad Again' : 'Watch & Unlock VIP'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* App Info & About */}
      <div className="text-center text-xs text-[#94A3B8] pt-4 pb-8 space-y-1">
        <p className="font-semibold text-slate-600">Stitch Screen Recorder HD · v2.4.0</p>
        <p>Built with Google Stitch light aesthetic for Play Store mobile and desktop screen recording.</p>
      </div>
    </div>
  );
};
