import React from 'react';
import { Bus, ShieldAlert, Sparkles, Sliders, Download, Calendar, CloudRain, Clock } from 'lucide-react';

interface HeaderProps {
  festivalDate: string;
  expectedAttendance: number;
  finalEventEndTime: string;
  rainProbability: number;
  onOpenWhatIf: () => void;
  onOpenExport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Headline */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  FestivalFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-950/80 text-orange-300 border border-orange-700/50">
                  7-Day Advance Predictor
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  Proactive Dispatch Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crowd Demand Forecasting & Proactive Bus Redeployment Engine for Temple Festivals
              </p>
            </div>
          </div>

          {/* Quick Scenario Status Pills & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                {festivalDate}
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                End: {finalEventEndTime}
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Rain: {Math.round(rainProbability * 100)}%
              </span>
            </div>

            <button
              onClick={onOpenWhatIf}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              What-If Simulator
            </button>

            <button
              onClick={onOpenExport}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Briefing
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar text-xs">
          {[
            { id: 'dashboard', label: 'Command Dashboard' },
            { id: 'peak-prediction', label: 'Peak Crowd Prediction' },
            { id: 'map', label: 'Interactive Route Map' },
            { id: 'allocation', label: 'Bus Redeployment Plan' },
            { id: 'gemini', label: 'Gemini AI Briefing' },
            { id: 'schedule', label: 'Festival Schedule & 7-Day Timeline' },
            { id: 'comparison', label: 'Reactive vs Proactive' },
            { id: 'data', label: 'Weather & Historical Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
