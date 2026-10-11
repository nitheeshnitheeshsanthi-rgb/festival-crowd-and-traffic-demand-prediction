import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Bus,
  Calendar,
  Activity,
  FileText,
  Sparkles,
  Database,
  CheckSquare,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Camera,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  fixedFleetCount: number;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'camera', label: 'Live Camera Monitoring', icon: Camera, badge: 'YOLO CV', badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  { id: 'prediction', label: 'Crowd Prediction', icon: TrendingUp },
  { id: 'map', label: 'Live Crowd Map', icon: MapPin },
  { id: 'allocation', label: 'Bus Allocation', icon: Bus, badge: 'Fixed Fleet' },
  { id: 'planner', label: 'Festival Planner', icon: Calendar },
  { id: 'monitoring', label: 'Live Monitoring', icon: Activity, badge: 'Simulated' },
  { id: 'analytics', label: 'Reports & Analytics', icon: FileText },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Gemini' },
  { id: 'dataset', label: 'Dataset Management', icon: Database },
  { id: 'tests', label: 'System Tests', icon: CheckSquare, badge: 'Automated' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  fixedFleetCount,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Drawer Container: Fixed on mobile, static/collapsible on desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsedDesktop ? 'lg:w-18' : 'lg:w-64'}
        `}
      >
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 flex-shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="truncate">
                <span className="font-bold text-base tracking-tight text-white block truncate">
                  FestivalFlow <span className="text-orange-400 font-semibold">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Crowd & Transit Console
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors lg:hidden cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle button */}
          <button
            onClick={onToggleCollapseDesktop}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title={isCollapsedDesktop ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsedDesktop ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showText = !isCollapsedDesktop || isOpenMobile;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={!showText ? `${index + 1}. ${item.label}` : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left group relative ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-300 font-semibold border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                } ${!showText ? 'justify-center' : ''}`}
              >
                {/* Active Accent Pillar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-orange-500" />
                )}

                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {showText && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">
                      <span className="text-slate-500 mr-1.5 font-mono text-[11px]">
                        {index + 1}.
                      </span>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          isActive
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-800/80'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Information */}
        {(!isCollapsedDesktop || isOpenMobile) && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span>Fleet Constraint:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                {fixedFleetCount} Buses Fixed
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>Zero-Sum Policy</span>
              <span className="text-slate-400">Δ = 0 Vehicles</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
