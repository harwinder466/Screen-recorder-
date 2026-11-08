import React, { useState } from 'react';
import { Camera, Download, Trash2, Eye, X, ZoomIn } from 'lucide-react';
import { ScreenshotItem } from '../types/recorder';
import { formatDate, formatBytes, exportImageToLocalStorage } from '../utils/exporter';

interface ScreenshotsTabProps {
  screenshots: ScreenshotItem[];
  onDeleteScreenshot: (id: string) => void;
  onQuickScreenshot: () => void;
}

export const ScreenshotsTab: React.FC<ScreenshotsTabProps> = ({
  screenshots,
  onDeleteScreenshot,
  onQuickScreenshot,
}) => {
  const [selectedItem, setSelectedItem] = useState<ScreenshotItem | null>(null);

  const handleDownload = (item: ScreenshotItem, e: React.MouseEvent) => {
    e.stopPropagation();
    exportImageToLocalStorage(item.dataUrl, item.title);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Screen Capture Photos</h2>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
            <span>{screenshots.length} {screenshots.length === 1 ? 'photo' : 'photos'}</span>
            <span aria-hidden="true">·</span>
            <span>High-Res PNG Export</span>
          </div>
        </div>

        <button
          onClick={onQuickScreenshot}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Capture Screen Now</span>
        </button>
      </div>

      {screenshots.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No screenshots yet</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Take instant screen snapshots while recording or using the quick capture button.
          </p>
          <button
            onClick={onQuickScreenshot}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Take Screen Snapshot</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {screenshots.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={item.dataUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {item.width}×{item.height}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mt-1">
                    <span>{formatDate(item.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatBytes(item.sizeBytes)}</span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0B57D0] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PNG</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScreenshot(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Screenshot Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 text-white border-b border-slate-800">
              <span className="text-xs font-bold truncate">{selectedItem.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(selectedItem, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B57D0] text-white rounded-xl text-xs font-bold hover:bg-[#0842A0]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center overflow-auto flex-1">
              <img
                src={selectedItem.dataUrl}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
