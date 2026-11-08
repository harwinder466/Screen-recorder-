import React from 'react';
import {
  Video,
  Mic,
  Volume2,
  Sliders,
  Sparkles,
  Camera,
  Pen,
  Clock,
  Layers,
  CheckCircle2,
  Info,
  ShieldCheck,
  Zap,
  Gift,
} from 'lucide-react';
import { RecorderConfig, ResolutionType, FpsType, AudioSourceType, OrientationType } from '../types/recorder';

interface RecordTabProps {
  config: RecorderConfig;
  onUpdateConfig: (newConfig: Partial<RecorderConfig>) => void;
  onStartRecording: () => void;
  isRecording: boolean;
  onQuickScreenshot: () => void;
  onToggleFacecam: () => void;
  onOpenBrush: () => void;
  onWatchRewardedAd: () => void;
  isVipUnlocked: boolean;
}

export const RecordTab: React.FC<RecordTabProps> = ({
  config,
  onUpdateConfig,
  onStartRecording,
  isRecording,
  onQuickScreenshot,
  onToggleFacecam,
  onOpenBrush,
  onWatchRewardedAd,
  isVipUnlocked,
}) => {
  const resolutions: Array<{ id: ResolutionType; label: string; desc: string }> = [
    { id: '1080p', label: '1080p FHD', desc: '1920×1080 · High Definition' },
    { id: '2K', label: '2K QHD', desc: '2560×1440 · Ultra Crisp' },
    { id: '720p', label: '720p HD', desc: '1280×720 · Compact File' },
  ];

  const audioOptions: Array<{ id: AudioSourceType; label: string; icon: typeof Mic; desc: string }> = [
    { id: 'mixed', label: 'Mic + System', icon: Volume2, desc: 'Record commentary & device sound' },
    { id: 'mic', label: 'Microphone Only', icon: Mic, desc: 'Voice commentary only' },
    { id: 'system', label: 'Device Sound', icon: Volume2, desc: 'Internal app & game audio' },
    { id: 'none', label: 'Muted', icon: Volume2, desc: 'Silent video recording' },
  ];

  const fpsOptions: FpsType[] = [60, 30, 24];

  return (
    <div className="space-y-6">
      {/* Hero Record Studio Card - Google Stitch aesthetic */}
      <div className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Subtle decorative mesh gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-rose-100/60 via-amber-50/40 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-gradient-to-tr from-sky-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
          {/* Main Record Trigger Button */}
          <div className="relative my-4">
            {/* Pulsing ring when idle */}
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-60 pointer-events-none" />

            <button
              onClick={onStartRecording}
              disabled={isRecording}
              className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#EA4335] via-[#E11D48] to-[#F43F5E] text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-600/40 transition-all transform active:scale-90 hover:scale-105 group disabled:opacity-50 disabled:pointer-events-none`}
              aria-label="Start Screen Recording"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 stroke-[2.4]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {isRecording ? 'Recording' : 'Record'}
              </span>
            </button>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0F172A] mt-2">
            Full Screen HD Recorder
          </h2>
          <p className="text-xs md:text-sm text-[#64748B] mt-1 max-w-md">
            Record mobile or desktop screen in pristine high-definition MP4 format with audio mixing, zero lag, and instant local export.
          </p>

          {/* Clean unboxed status markers */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#475569] mt-4 font-medium">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full HD 1080p MP4</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-sky-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Storage Save</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-indigo-700">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero Watermark</span>
            </span>
          </div>

          {/* Quick tool shortcuts */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={onQuickScreenshot}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Screenshot</span>
            </button>
            <button
              onClick={onToggleFacecam}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                config.enableFacecam
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-[#F1F5F9] border-transparent text-[#334155] hover:bg-[#E2E8F0]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>{config.enableFacecam ? 'Facecam Active' : 'Enable Facecam'}</span>
            </button>
            <button
              onClick={onOpenBrush}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <Pen className="w-3.5 h-3.5 text-sky-600" />
              <span>Screen Brush</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rewarded Video Ad Unit Integration Card */}
      <div className={`p-4 md:p-5 rounded-3xl border transition-all ${
        isVipUnlocked
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 border-amber-300'
          : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 border-indigo-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isVipUnlocked ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            }`}>
              {isVipUnlocked ? <Sparkles className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  {isVipUnlocked ? 'VIP Active: 2K QHD & 60FPS Unlocked' : 'Unlock Free VIP: 2K QHD Ultra High Definition'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                  Rewarded Ad
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {isVipUnlocked
                  ? 'Rewarded ad claimed! Enjoy ultra crisp 2K video and maximum bitrate export.'
                  : 'Watch a short sponsored video to unlock 2K QHD recording & priority MP4 export free.'}
              </p>
            </div>
          </div>

          <button
            onClick={onWatchRewardedAd}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 ${
              isVipUnlocked
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{isVipUnlocked ? 'Watch Again (+1 Pass)' : 'Watch Video Ad (5s)'}</span>
          </button>
        </div>
      </div>

      {/* Recording Parameters Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Resolution & Frame Rate */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Video Resolution</h3>
            </div>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              MP4 Output
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {resolutions.map((res) => {
              const isSelected = config.resolution === res.id;
              return (
                <button
                  key={res.id}
                  onClick={() => onUpdateConfig({ resolution: res.id })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-300 shadow-sm'
                      : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-sky-900' : 'text-[#1E293B]'
                      }`}
                    >
                      {res.label}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                  </div>
                  <span className="text-[10px] text-[#64748B] block mt-1 leading-tight">
                    {res.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Frame Rate (FPS) Selector */}
          <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-[#334155]">Frame Rate (FPS)</span>
              <span className="text-xs text-[#64748B] font-mono">{config.fps} FPS</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
              {fpsOptions.map((fps) => {
                const isSelected = config.fps === fps;
                return (
                  <button
                    key={fps}
                    onClick={() => onUpdateConfig({ fps })}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-white text-sky-700 shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {fps} FPS {fps === 60 ? '⚡' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation switch */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#334155]">Capture Orientation</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'portrait' as OrientationType, label: '📱 Mobile (9:16 Vertical)' },
                { id: 'landscape' as OrientationType, label: '🖥 Desktop (16:9 Wide)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateConfig({ orientation: opt.id })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                    config.orientation === opt.id
                      ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                      : 'bg-white border-[#E2E8F0] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Audio Source & Features */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Audio Recording Source</h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              AAC 48kHz
            </span>
          </div>

          <div className="space-y-2">
            {audioOptions.map((opt) => {
              const isSelected = config.audioSource === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateConfig({ audioSource: opt.id })}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-left border transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                      : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold block ${
                          isSelected ? 'text-rose-900' : 'text-[#1E293B]'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-[#64748B] block">{opt.desc}</span>
                    </div>
                  </div>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1" />}
                </button>
              );
            })}
          </div>

          {/* Quick Recorder Helper Toggles */}
          <div className="mt-5 pt-5 border-t border-[#F1F5F9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-[#334155]">Countdown Timer</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {[0, 3, 5].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onUpdateConfig({ countdownSeconds: sec })}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                      config.countdownSeconds === sec
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {sec === 0 ? 'Off' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-[#334155]">Floating Quick Bubble</span>
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
        </div>
      </div>

      {/* Guide & Mobile Screen Capture Tips Card */}
      <div className="bg-[#F1F5F9]/80 border border-[#E2E8F0] rounded-3xl p-5 flex items-start gap-3.5 text-xs text-[#475569]">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#0F172A] block">
            How to Record Mobile Full Screen:
          </span>
          <p className="leading-relaxed">
            When you tap <strong>Record</strong>, your browser asks you to select your screen, app window, or browser tab. Select <strong>"Entire Screen"</strong> to record full screen mobile games, apps, or browser views. Your recording will be encoded in high-definition MP4 format and saved directly to your local storage.
          </p>
        </div>
      </div>
    </div>
  );
};
