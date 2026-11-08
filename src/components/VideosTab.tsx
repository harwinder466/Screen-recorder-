import React, { useState } from 'react';
import {
  Play,
  Download,
  Scissors,
  Star,
  Trash2,
  Share2,
  Film,
  Search,
  Edit2,
  Check,
  Video,
} from 'lucide-react';
import { RecordingItem } from '../types/recorder';
import { formatDuration, formatBytes, formatDate, exportVideoToLocalStorage, shareRecording } from '../utils/exporter';

interface VideosTabProps {
  recordings: RecordingItem[];
  onPlayRecording: (item: RecordingItem) => void;
  onTrimRecording: (item: RecordingItem) => void;
  onDeleteRecording: (id: string) => void;
  onToggleFavorite: (item: RecordingItem) => void;
  onRenameRecording: (id: string, newTitle: string) => void;
  onNavigateToRecord: () => void;
}

export const VideosTab: React.FC<VideosTabProps> = ({
  recordings,
  onPlayRecording,
  onTrimRecording,
  onDeleteRecording,
  onToggleFavorite,
  onRenameRecording,
  onNavigateToRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportSuccessId, setExportSuccessId] = useState<string | null>(null);

  const filteredRecordings = recordings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === 'all' || (filterMode === 'favorites' && item.isFavorite);
    return matchesSearch && matchesFilter;
  });

  const handleExportMP4 = async (item: RecordingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setExportingId(item.id);
    try {
      const fileName = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${item.resolution.replace(/\s+/g, '')}.mp4`;
      await exportVideoToLocalStorage(item.blob, fileName);
      setExportSuccessId(item.id);
      setTimeout(() => setExportSuccessId(null), 2500);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingId(null);
    }
  };

  const handleShare = async (item: RecordingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await shareRecording(item.blob, item.title);
  };

  const startEditing = (item: RecordingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitleValue(item.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      onRenameRecording(id, editTitleValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Search & Filter Tabs */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Recorded Videos Gallery</h2>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
            <span>{recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}</span>
            <span aria-hidden="true">·</span>
            <span>Export in High Definition MP4</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recordings..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                filterMode === 'favorites'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recordings Grid / List */}
      {filteredRecordings.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No recordings found</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No recordings matched your search keywords. Try a different query.'
              : 'You have not recorded any screen videos yet. Start recording now to capture full screen in high definition MP4!'}
          </p>
          <button
            onClick={onNavigateToRecord}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA4335] hover:bg-[#D93025] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>Record Your First Screen Video</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((item) => {
            const isEditing = editingId === item.id;
            const isExporting = exportingId === item.id;
            const isSuccess = exportSuccessId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Thumbnail & Duration overlay */}
                <div
                  onClick={() => onPlayRecording(item)}
                  className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden group/thumb"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <Film className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 group-hover/thumb:scale-110 text-slate-900 flex items-center justify-center shadow-lg transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {formatDuration(item.duration)}
                  </span>

                  {/* Format & Resolution Badge */}
                  <span className="absolute top-2.5 left-2.5 bg-sky-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {item.resolution}
                  </span>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title with edit capability */}
                    {isEditing ? (
                      <div className="flex items-center gap-1 mb-2">
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs font-bold border border-sky-300 rounded-lg focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => saveEditing(item.id, e)}
                          className="p-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4
                          onClick={() => onPlayRecording(item)}
                          className="text-sm font-bold text-[#0F172A] hover:text-sky-700 cursor-pointer line-clamp-1"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <button
                          onClick={(e) => startEditing(item, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-opacity"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Clean unboxed metadata with · */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mb-3">
                      <span>{formatDate(item.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatBytes(item.sizeBytes)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700 uppercase">MP4</span>
                    </div>
                  </div>

                  {/* Primary Export to Local Storage & Action Strip */}
                  <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
                    {/* High Definition MP4 Download Button */}
                    <button
                      onClick={(e) => handleExportMP4(item, e)}
                      disabled={isExporting}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                        isSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#0B57D0] hover:bg-[#0842A0] text-white shadow-blue-500/10'
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Saved to Device!</span>
                        </>
                      ) : isExporting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Exporting HD MP4...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Export HD MP4 to Local Storage</span>
                        </>
                      )}
                    </button>

                    {/* Secondary tools: Trim, Share, Delete */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => onTrimRecording(item)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg text-[11px] font-semibold transition-colors"
                        title="Trim video"
                      >
                        <Scissors className="w-3 h-3 text-sky-600" />
                        <span>Trim</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg text-[11px] font-semibold transition-colors"
                        title="Share video"
                      >
                        <Share2 className="w-3 h-3 text-indigo-600" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => onDeleteRecording(item.id)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
