import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNavBar, TabId } from './components/BottomNavBar';
import { RecordTab } from './components/RecordTab';
import { VideosTab } from './components/VideosTab';
import { ScreenshotsTab } from './components/ScreenshotsTab';
import { ToolsTab } from './components/ToolsTab';
import { SettingsTab } from './components/SettingsTab';
import { ActiveRecordingBar } from './components/ActiveRecordingBar';
import { FloatingWidget } from './components/FloatingWidget';
import { FacecamBubble } from './components/FacecamBubble';
import { ScreenCanvasBrush } from './components/ScreenCanvasBrush';
import { CountdownModal } from './components/CountdownModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { BannerAd } from './components/ads/BannerAd';
import { InterstitialAdModal } from './components/ads/InterstitialAdModal';
import { RewardedAdModal } from './components/ads/RewardedAdModal';
import {
  RecorderConfig,
  RecordingItem,
  ScreenshotItem,
} from './types/recorder';
import {
  getAllRecordings,
  saveRecording,
  deleteRecording,
  updateRecording,
  getAllScreenshots,
  saveScreenshot,
  deleteScreenshot,
} from './utils/storage';
import { ScreenRecorderService } from './utils/recorderEngine';
import { formatBytes, exportImageToLocalStorage } from './utils/exporter';
import { CheckCircle, AlertCircle } from 'lucide-react';

const DEFAULT_CONFIG: RecorderConfig = {
  resolution: '1080p',
  fps: 60,
  bitrate: 16,
  orientation: 'portrait',
  audioSource: 'mixed',
  countdownSeconds: 3,
  enableFacecam: false,
  facecamShape: 'circle',
  enableWatermark: false,
  watermarkText: 'Captured with Stitch Recorder',
  enableBrush: false,
  floatingWidget: true,
  showTouches: true,
  outputFormat: 'mp4',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('record');
  const [config, setConfig] = useState<RecorderConfig>(() => {
    try {
      const saved = localStorage.getItem('stitch_recorder_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showBrush, setShowBrush] = useState(false);
  const [showFacecam, setShowFacecam] = useState(false);
  const [activePlayingVideo, setActivePlayingVideo] = useState<RecordingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AdMob states
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialReason, setInterstitialReason] = useState('Screen Recording Saved · High Definition MP4 Ready');
  const [showRewardedModal, setShowRewardedModal] = useState(false);
  const [isVipUnlocked, setIsVipUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('stitch_vip_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const recorderServiceRef = useRef<ScreenRecorderService | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync config to localStorage
  const handleUpdateConfig = (newConfig: Partial<RecorderConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('stitch_recorder_config', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save config to local storage', e);
      }
      return updated;
    });
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load recordings and screenshots on mount
  const refreshStorage = useCallback(async () => {
    try {
      const [recs, shots] = await Promise.all([getAllRecordings(), getAllScreenshots()]);
      setRecordings(recs);
      setScreenshots(shots);
    } catch (e) {
      console.error('Storage load error:', e);
    }
  }, []);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  // Actual start recording execution
  const executeStartRecording = async () => {
    setShowCountdown(false);

    try {
      const service = new ScreenRecorderService(config, {
        onAudioLevel: (level) => {
          setAudioLevel(level);
        },
        onStop: async (finalBlob, duration, thumbnail) => {
          setIsRecording(false);
          setIsPaused(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }

          const now = new Date();
          const timestampStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

          const newItem: RecordingItem = {
            id: `rec-${Date.now()}`,
            title: `Screen_Record_${timestampStr}`,
            blob: finalBlob,
            thumbnailUrl: thumbnail,
            duration: duration,
            sizeBytes: finalBlob.size,
            resolution: `${config.resolution} ${config.orientation === 'portrait' ? 'Mobile' : 'FHD'}`,
            fps: config.fps,
            hasAudio: config.audioSource !== 'none',
            audioSource: config.audioSource,
            createdAt: Date.now(),
            isFavorite: false,
            format: 'mp4',
          };

          await saveRecording(newItem);
          await refreshStorage();
          showToast('Recording saved! Ready for high-definition MP4 export.');
          setInterstitialReason('Screen Recording Saved · High Definition MP4 Ready');
          setShowInterstitial(true);
        },
        onError: (err) => {
          console.error('Recorder error:', err);
          showToast(err.message || 'Recording stopped unexpectedly.', 'error');
          setIsRecording(false);
          setIsPaused(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        },
      });

      recorderServiceRef.current = service;
      await service.start();

      setIsRecording(true);
      setIsPaused(false);
      setDurationSec(0);

      if (config.enableFacecam) {
        setShowFacecam(true);
      }

      // Start duration clock
      timerIntervalRef.current = window.setInterval(() => {
        if (recorderServiceRef.current) {
          setDurationSec(recorderServiceRef.current.getElapsedTimeSec());
        }
      }, 500);

      showToast('Recording started. Screen & audio are being captured.');
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.warn('Start recording failed:', errorObj);
      showToast(errorObj.message || 'Screen capture was cancelled or denied.', 'error');
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleStartRecording = () => {
    if (config.countdownSeconds > 0) {
      setShowCountdown(true);
    } else {
      executeStartRecording();
    }
  };

  const handleTogglePause = () => {
    if (!recorderServiceRef.current) return;
    if (isPaused) {
      recorderServiceRef.current.resume();
      setIsPaused(false);
    } else {
      recorderServiceRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStopRecording = () => {
    if (recorderServiceRef.current) {
      recorderServiceRef.current.stop();
    }
  };

  // Quick Snapshot handler
  const handleQuickScreenshot = async () => {
    // If recording is active, capture from hidden video element
    if (isRecording && recorderServiceRef.current) {
      const shot = recorderServiceRef.current.takeFullScreenshot();
      if (shot) {
        const item: ScreenshotItem = {
          id: `shot-${Date.now()}`,
          title: `Snapshot_${Date.now()}`,
          dataUrl: shot.dataUrl,
          createdAt: Date.now(),
          width: shot.width,
          height: shot.height,
          sizeBytes: shot.size,
        };
        await saveScreenshot(item);
        await refreshStorage();
        exportImageToLocalStorage(shot.dataUrl, item.title);
        showToast('Screen snapshot captured and saved to device!');
        return;
      }
    }

    // If not recording, open instant screen capture stream to snapshot
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);

        const item: ScreenshotItem = {
          id: `shot-${Date.now()}`,
          title: `Snapshot_${Date.now()}`,
          dataUrl,
          createdAt: Date.now(),
          width: canvas.width,
          height: canvas.height,
          sizeBytes,
        };

        await saveScreenshot(item);
        await refreshStorage();
        exportImageToLocalStorage(dataUrl, item.title);
        showToast('Snapshot captured and saved to Local Storage!');
      }

      // Stop tracks
      stream.getTracks().forEach((t) => t.stop());
    } catch (e: unknown) {
      const err = e as Error;
      if (err.name !== 'NotAllowedError') {
        showToast('Could not capture screenshot: ' + err.message, 'error');
      }
    }
  };

  // Video management handlers
  const handleDeleteRecording = async (id: string) => {
    await deleteRecording(id);
    await refreshStorage();
    showToast('Recording deleted.');
  };

  const handleToggleFavorite = async (item: RecordingItem) => {
    await updateRecording({ id: item.id, isFavorite: !item.isFavorite });
    await refreshStorage();
  };

  const handleRenameRecording = async (id: string, newTitle: string) => {
    await updateRecording({ id, title: newTitle });
    await refreshStorage();
    showToast('Recording renamed.');
  };

  const handleSaveTrimmed = async (newItem: RecordingItem) => {
    await saveRecording(newItem);
    await refreshStorage();
    showToast('Trimmed MP4 video saved to library!');
    setInterstitialReason('Trimmed Video Saved to Device');
    setShowInterstitial(true);
  };

  const handleDeleteScreenshot = async (id: string) => {
    await deleteScreenshot(id);
    await refreshStorage();
    showToast('Screenshot deleted.');
  };

  const handleClearAllRecordings = async () => {
    for (const r of recordings) {
      await deleteRecording(r.id);
    }
    await refreshStorage();
    showToast('All stored video recordings cleared.');
  };

  // Calculate free space approximation
  const totalUsedBytes = recordings.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const freeSpaceText = `${formatBytes(Math.max(0, 1024 * 1024 * 1024 * 2 - totalUsedBytes))}`;

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#1F2328] flex flex-col font-sans pb-36 md:pb-32">
      {/* Top Header */}
      <TopBar
        freeStorageText={freeSpaceText}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame((prev) => !prev)}
        onQuickScreenshot={handleQuickScreenshot}
        isRecording={isRecording}
        isVipUnlocked={isVipUnlocked}
        onWatchRewardedAd={() => setShowRewardedModal(true)}
      />

      {/* Main Container - Responsive or Mobile Simulator Frame */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* If Mobile Simulator Frame is active, wrap in a sleek phone bezel */}
        <div
          className={
            isMobileFrame
              ? 'max-w-[420px] mx-auto bg-white border-[10px] border-slate-900 rounded-[48px] shadow-2xl p-4 min-h-[780px] overflow-hidden relative'
              : 'w-full'
          }
        >
          {isMobileFrame && (
            <div className="flex items-center justify-between px-4 pb-3 pt-1 border-b border-slate-100 text-xs font-bold text-slate-800">
              <span>09:41</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full" />
              <span>5G · 100%</span>
            </div>
          )}

          {/* Active Recording Sticky Controller Bar */}
          {isRecording && (
            <ActiveRecordingBar
              durationSec={durationSec}
              isPaused={isPaused}
              audioLevel={audioLevel}
              hasAudio={config.audioSource !== 'none'}
              resolution={config.resolution}
              fps={config.fps}
              onPauseToggle={handleTogglePause}
              onStop={handleStopRecording}
              onTakeScreenshot={handleQuickScreenshot}
              onOpenBrush={() => setShowBrush(true)}
              onToggleFacecam={() => setShowFacecam((prev) => !prev)}
              isFacecamActive={showFacecam}
            />
          )}

          {/* Tab Views */}
          {activeTab === 'record' && (
            <RecordTab
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onStartRecording={handleStartRecording}
              isRecording={isRecording}
              onQuickScreenshot={handleQuickScreenshot}
              onToggleFacecam={() => setShowFacecam((prev) => !prev)}
              onOpenBrush={() => setShowBrush(true)}
              onWatchRewardedAd={() => setShowRewardedModal(true)}
              isVipUnlocked={isVipUnlocked}
            />
          )}

          {activeTab === 'videos' && (
            <VideosTab
              recordings={recordings}
              onPlayRecording={(item) => setActivePlayingVideo(item)}
              onTrimRecording={(item) => setActivePlayingVideo(item)}
              onDeleteRecording={handleDeleteRecording}
              onToggleFavorite={handleToggleFavorite}
              onRenameRecording={handleRenameRecording}
              onNavigateToRecord={() => setActiveTab('record')}
            />
          )}

          {activeTab === 'screenshots' && (
            <ScreenshotsTab
              screenshots={screenshots}
              onDeleteScreenshot={handleDeleteScreenshot}
              onQuickScreenshot={handleQuickScreenshot}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsTab
              recordings={recordings}
              onOpenTrimmerForVideo={(item) => setActivePlayingVideo(item)}
              onQuickScreenshot={handleQuickScreenshot}
              onClearAllRecordings={handleClearAllRecordings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onTestInterstitial={() => {
                setInterstitialReason('AdMob Interstitial Ad Test Preview');
                setShowInterstitial(true);
              }}
              onWatchRewardedAd={() => setShowRewardedModal(true)}
              isVipUnlocked={isVipUnlocked}
            />
          )}
        </div>
      </main>

      {/* Floating Action Bubble Widget (Play Store style) */}
      {config.floatingWidget && isRecording && (
        <FloatingWidget
          isRecording={isRecording}
          isPaused={isPaused}
          durationSec={durationSec}
          onStop={handleStopRecording}
          onTogglePause={handleTogglePause}
          onOpenBrush={() => setShowBrush(true)}
          onTakeScreenshot={handleQuickScreenshot}
          onToggleFacecam={() => setShowFacecam((prev) => !prev)}
          audioLevel={audioLevel}
        />
      )}

      {/* Facecam Floating PIP Camera Preview */}
      {showFacecam && (
        <FacecamBubble
          onClose={() => setShowFacecam(false)}
          shape={config.facecamShape}
        />
      )}

      {/* Fullscreen Screen Drawing / Brush Annotation Overlay */}
      {showBrush && (
        <ScreenCanvasBrush onClose={() => setShowBrush(false)} />
      )}

      {/* 3... 2... 1... Countdown Modal */}
      {showCountdown && (
        <CountdownModal
          seconds={config.countdownSeconds}
          onComplete={executeStartRecording}
          onCancel={() => setShowCountdown(false)}
        />
      )}

      {/* Video Player & Trimmer Modal */}
      {activePlayingVideo && (
        <VideoPlayerModal
          item={activePlayingVideo}
          onClose={() => setActivePlayingVideo(null)}
          onDelete={handleDeleteRecording}
          onSaveTrimmed={handleSaveTrimmed}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Google AdMob Interstitial Ad Modal (ca-app-pub-3940256099942544/1033173712) */}
      <InterstitialAdModal
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        reasonText={interstitialReason}
      />

      {/* Google AdMob Rewarded Video Ad Modal (ca-app-pub-3940256099942544/5224354917) */}
      <RewardedAdModal
        isOpen={showRewardedModal}
        onClose={() => setShowRewardedModal(false)}
        onRewardEarned={() => {
          setIsVipUnlocked(true);
          try {
            localStorage.setItem('stitch_vip_unlocked', 'true');
          } catch {}
          handleUpdateConfig({ resolution: '2K', fps: 60 });
          showToast('VIP Granted! 2K Ultra HD & 60FPS are now unlocked!');
        }}
        rewardTitle="VIP 2K Ultra HD & 60FPS Recording Unlocked"
      />

      {/* Google AdMob Banner Ad (ca-app-pub-3940256099942544/6300978111) */}
      <div className="fixed bottom-16 left-0 right-0 z-30">
        <BannerAd onRewardClick={() => setShowRewardedModal(true)} />
      </div>

      {/* Bottom Tab Bar (Play Store navigation) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        videoCount={recordings.length}
        screenshotCount={screenshots.length}
      />
    </div>
  );
}
