import React from 'react';
import {
  Menu,
  Bus,
  Sliders,
  Download,
  Calendar,
  CloudRain,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { MENU_ITEMS } from './Sidebar';

interface HeaderProps {
  festivalDate: string;
  expectedAttendance: number;
  finalEventEndTime: string;
  rainProbability: number;
  onOpenWhatIf: () => void;
  onOpenExport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  festivalDate,
  expectedAttendance,
  finalEventEndTime,
  rainProbability,
  onOpenWhatIf,
  onOpenExport,
  activeTab,
  setActiveTab,
  onOpenMenu,
}) => {
  const currentMenuItem = MENU_ITEMS.find((item) => item.id === activeTab) || MENU_ITEMS[0];
  const CurrentIcon = currentMenuItem.icon;

  return (
    <header className="border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Hamburger, Brand, Telemetry, and Primary Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 gap-3">
          {/* Top Left: Hamburger Button (☰) & Brand */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (☰) */}
            <button
              onClick={onOpenMenu}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu (☰)"
            >
              <Menu className="w-5 h-5 text-orange-400" />
            </button>

            {/* Brand Logo & Name */}
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 flex-shrink-0">
              <Bus className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold tracking-tight text-white">
                  FestivalFlow <span className="text-orange-400 font-semibold">AI</span>
                </span>
                <span className="text-slate-600 hidden sm:inline" aria-hidden="true">/</span>
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                  <CurrentIcon className="w-3.5 h-3.5 text-orange-400" />
                  {currentMenuItem.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>7-Day Advance Horizon</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  18 Buses Fixed (Δ = 0)
                </span>
              </div>
            </div>
          </div>

          {/* Environmental Summary & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Environmental Summary Bar */}
            <div className="hidden sm:flex items-center space-x-3 text-xs bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {festivalDate}
              </span>
              <span className="text-slate-700" aria-hidden="true">|</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Finale: {finalEventEndTime}
              </span>
              <span className="text-slate-700" aria-hidden="true">|</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                Rain: {Math.round(rainProbability * 100)}%
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onOpenWhatIf}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              What-If Simulator
            </button>

            <button
              onClick={onOpenExport}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/25 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Briefing
            </button>
          </div>
        </div>

        {/* Horizontal Quick-Scroll Tabs for Direct Access */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2.5 pt-1 border-t border-slate-800/60 no-scrollbar">
          {MENU_ITEMS.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-300 font-semibold border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
