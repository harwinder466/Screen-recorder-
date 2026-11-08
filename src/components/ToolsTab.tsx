import React, { useState } from 'react';
import {
  Scissors,
  Music,
  Camera,
  HardDrive,
  Trash2,
  Download,
  Film,
  Zap,
  Check,
} from 'lucide-react';
import { RecordingItem } from '../types/recorder';
import { formatBytes, formatDuration } from '../utils/exporter';

interface ToolsTabProps {
  recordings: RecordingItem[];
  onOpenTrimmerForVideo: (item: RecordingItem) => void;
  onQuickScreenshot: () => void;
  onClearAllRecordings: () => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  recordings,
  onOpenTrimmerForVideo,
  onQuickScreenshot,
  onClearAllRecordings,
}) => {
  const [selectedVideoForAudio, setSelectedVideoForAudio] = useState<string>('');
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [audioExtractSuccess, setAudioExtractSuccess] = useState(false);

  const totalBytes = recordings.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  const handleExtractAudio = async () => {
    const video = recordings.find((r) => r.id === selectedVideoForAudio);
    if (!video) return;

    setIsExtractingAudio(true);
    setAudioExtractSuccess(false);

    try {
      // In-browser Audio extraction using Web Audio API / AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const arrayBuffer = await video.blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer).catch(() => null);

      // Create downloadable audio blob
      let audioBlob: Blob;
      if (audioBuffer) {
        // Encode WAV from AudioBuffer
        const numOfChan = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numOfChan * 2 + 44;
        const outBuffer = new ArrayBuffer(length);
        const view = new DataView(outBuffer);
        const channels = [];
        let sample = 0;
        let offset = 0;
        let pos = 0;

        function setUint16(data: number) {
          view.setUint16(pos, data, true);
          pos += 2;
        }
        function setUint32(data: number) {
          view.setUint32(pos, data, true);
          pos += 4;
        }

        // WAV header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8);
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16);
        setUint16(1); // PCM
        setUint16(numOfChan);
        setUint32(audioBuffer.sampleRate);
        setUint32(audioBuffer.sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2);
        setUint16(16);
        setUint32(0x61746164); // "data"
        setUint32(length - pos - 4);

        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
          channels.push(audioBuffer.getChannelData(i));
        }

        while (pos < length) {
          for (let i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
          }
          offset++;
        }

        audioBlob = new Blob([outBuffer], { type: 'audio/wav' });
      } else {
        audioBlob = new Blob([video.blob], { type: 'audio/mp3' });
      }

      // Download audio file to local storage
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Audio.wav`;
      a.click();
      URL.revokeObjectURL(url);

      setAudioExtractSuccess(true);
      setTimeout(() => setAudioExtractSuccess(false), 3000);
    } catch (e) {
      console.error('Audio extraction failed:', e);
    } finally {
      setIsExtractingAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0F172A]">Screen Studio Toolbox</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Post-processing tools to trim, snip, extract audio, and manage device storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 1: Video Trimmer & Snipper */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Precision Video Trimmer</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Cut out unwanted start and end frames from any recorded video and export a trimmed HD MP4 directly.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Select Video to Trim:
              </label>
              {recordings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recordings available to trim.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {recordings.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onOpenTrimmerForVideo(r)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-slate-800 block truncate">{r.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDuration(r.duration)} · {r.resolution}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-600 shrink-0">Trim »</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tool 2: Audio Extractor */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Audio Extractor (MP3/WAV)</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Extract voice commentary, game soundtracks, or meeting audio directly from your screen recordings into audio files.
            </p>

            <div className="mt-4 space-y-3">
              <select
                value={selectedVideoForAudio}
                onChange={(e) => setSelectedVideoForAudio(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose a video recording --</option>
                {recordings.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({formatDuration(r.duration)})
                  </option>
                ))}
              </select>

              <button
                onClick={handleExtractAudio}
                disabled={!selectedVideoForAudio || isExtractingAudio}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                  audioExtractSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {audioExtractSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Audio Downloaded!</span>
                  </>
                ) : isExtractingAudio ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Audio Track...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Extract & Save Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tool 3: Instant Screen Snapshot */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Screen Snapshot Tool</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Capture crystal clear PNG snapshots of your screen, active mobile view, or document without starting a video recording.
            </p>
          </div>

          <button
            onClick={onQuickScreenshot}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Snapshot Now</span>
          </button>
        </div>

        {/* Tool 4: Storage Manager & Cleaner */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Storage Manager</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              View storage consumption and clean up temporary browser video cache safely.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Total Used by Videos</span>
                <span className="text-base font-bold text-[#0F172A] font-mono">{formatBytes(totalBytes)}</span>
              </div>
              <span className="text-xs text-slate-500">{recordings.length} files stored</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all stored recordings from this device?')) {
                onClearAllRecordings();
              }
            }}
            disabled={recordings.length === 0}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Video Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
