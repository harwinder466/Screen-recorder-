import React from 'react';
import { Video, Film, Camera, Wrench, Settings } from 'lucide-react';

export type TabId = 'record' | 'videos' | 'screenshots' | 'tools' | 'settings';

interface BottomNavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  videoCount: number;
  screenshotCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  videoCount,
  screenshotCount,
}) => {
  const tabs = [
    {
      id: 'record' as TabId,
      label: 'Record',
      icon: Video,
      badge: null,
    },
    {
      id: 'videos' as TabId,
      label: 'Videos',
      icon: Film,
      badge: videoCount > 0 ? videoCount : null,
    },
    {
      id: 'screenshots' as TabId,
      label: 'Photos',
      icon: Camera,
      badge: screenshotCount > 0 ? screenshotCount : null,
    },
    {
      id: 'tools' as TabId,
      label: 'Tools',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'settings' as TabId,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E2E8F0] shadow-lg shadow-slate-900/5">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[44px] py-1 transition-all rounded-xl ${
                isActive ? 'text-[#0B57D0]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-full transition-transform ${
                    isActive ? 'scale-110 bg-[#E8F0FE]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                {tab.badge !== null && (
                  <span className="absolute -top-1 -right-2 bg-[#EA4335] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#0B57D0]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
