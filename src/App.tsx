import React, { useState, useMemo } from 'react';
import {
  DEFAULT_SCHEDULE,
  DEFAULT_STOPS,
  calculateDemandCurve,
  evaluateCrowdRisks,
  computeBusAllocation,
} from './services/simulationEngine';
import { FestivalSchedule, TransitStop, WeatherForecast } from './types/festival';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { KpiCards } from './components/KpiCards';
import { InteractiveMap } from './components/InteractiveMap';
import { DemandForecastChart } from './components/DemandForecastChart';
import { CrowdRiskPanel } from './components/CrowdRiskPanel';
import { BusAllocationView } from './components/BusAllocationView';
import { GeminiAssistant } from './components/GeminiAssistant';
import { ScheduleManager } from './components/ScheduleManager';
import { ReactiveVsProactive } from './components/ReactiveVsProactive';
import { WeatherAndHistory } from './components/WeatherAndHistory';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ExportModal } from './components/ExportModal';
import { PeakCrowdPredictor } from './components/PeakCrowdPredictor';
import { LiveMonitoring } from './components/LiveMonitoring';
import { SystemTests } from './components/SystemTests';
import { SettingsView } from './components/SettingsView';
import {
  Bus,
  Sparkles,
  Sliders,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  FileText,
  MapPin,
  Calendar,
  Activity,
  Database,
  CheckSquare,
  Settings,
} from 'lucide-react';

export default function App() {
  const [schedule, setSchedule] = useState<FestivalSchedule>(DEFAULT_SCHEDULE);
  const [stops, setStops] = useState<TransitStop[]>(DEFAULT_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string>('stop_a');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Responsive Drawer Navigation State
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState<boolean>(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute forecasts and allocation dynamically
  const timepoints = useMemo(() => calculateDemandCurve(schedule, stops), [schedule, stops]);
  const risks = useMemo(() => evaluateCrowdRisks(timepoints, stops), [timepoints, stops]);
  const plan = useMemo(() => computeBusAllocation(schedule, stops), [schedule, stops]);

  const handleUpdateSchedule = (updated: Partial<FestivalSchedule>) => {
    setSchedule((prev) => ({ ...prev, ...updated }));
    addToast('info', 'Schedule Updated', 'Demand models and crowd surge intervals recalculated.');
  };

  const handleUpdateWeather = (weather: WeatherForecast) => {
    setSchedule((prev) => ({ ...prev, weather }));
    addToast('info', 'Weather Forecast Updated', `Rain probability set to ${Math.round(weather.rainProbability * 100)}%.`);
  };

  const handleResetDefaults = () => {
    setSchedule(DEFAULT_SCHEDULE);
    setStops(DEFAULT_STOPS);
    addToast('info', 'Reset Completed', 'All festival parameters reset to standard baseline.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* 1. Left Navigation Drawer (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        isCollapsedDesktop={isSidebarCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop)}
        fixedFleetCount={plan.summary.totalFleetSize}
      />

      {/* Main Content Area (Offset for Desktop Drawer) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsedDesktop ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Header Bar */}
        <Header
          festivalDate={schedule.festivalDate}
          expectedAttendance={schedule.expectedAttendance}
          finalEventEndTime={schedule.finalEventEndTime}
          rainProbability={schedule.weather.rainProbability}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMenu={() => {
            // On mobile open mobile drawer, on desktop toggle collapse
            if (window.innerWidth < 1024) {
              setIsSidebarOpenMobile(true);
            } else {
              setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop);
            }
          }}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Core Scenario Context Notice (Zero-Sum Invariant Banner) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bus className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>Fixed Fleet Zero-Sum Invariant</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                    18 Buses Fixed (Δ = 0)
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed max-w-3xl">
                  The municipal fleet is strictly capped at <strong className="text-white">{plan.summary.totalFleetSize} buses</strong>.
                  To avert a fatal 190% platform crush at North Terminal, 3 buses are reallocated from East Bypass at 21:37.
                  <span className="text-orange-400 font-medium"> Trade-off:</span> East Bypass departure headway expands from 15m to 60m (+45m delay for ~180 local travelers), while retaining 1 feeder bus.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('allocation')}
              className="whitespace-nowrap px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
            >
              Inspect Trade-Off Audit
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: Dashboard (Default Command View) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Executive KPI Bar (5 Cards specified in prompt) */}
              <KpiCards schedule={schedule} plan={plan} risks={risks} />

              {/* Split Grid: Leaflet Map & Recharts Demand Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InteractiveMap
                  stops={stops}
                  plan={plan}
                  risks={risks}
                  selectedStopId={selectedStopId}
                  onSelectStop={setSelectedStopId}
                />
                <DemandForecastChart
                  timepoints={timepoints}
                  stops={stops}
                  finalEventEndTime={schedule.finalEventEndTime}
                  selectedStopId={selectedStopId}
                  onSelectStop={setSelectedStopId}
                />
              </div>

              {/* Crowd Risk Audit Panel (with red for high, orange for med, green for low) */}
              <CrowdRiskPanel
                risks={risks}
                stops={stops}
                onSelectStop={(id) => {
                  setSelectedStopId(id);
                }}
              />

              {/* Peak Crowd Prediction Section */}
              <PeakCrowdPredictor
                initialAttendance={schedule.expectedAttendance}
                initialEndTime={schedule.finalEventEndTime}
                initialRainProb={schedule.weather.rainProbability}
                initialTemp={schedule.weather.tempCelsius}
              />

              {/* Bus Allocation Engine Preview */}
              <BusAllocationView plan={plan} schedule={schedule} stops={stops} />

              {/* Gemini Assistant Summary */}
              <GeminiAssistant schedule={schedule} plan={plan} />
            </div>
          )}

          {/* Section 2: Crowd Prediction */}
          {activeTab === 'prediction' && (
            <div className="space-y-6">
              <PeakCrowdPredictor
                initialAttendance={schedule.expectedAttendance}
                initialEndTime={schedule.finalEventEndTime}
                initialRainProb={schedule.weather.rainProbability}
                initialTemp={schedule.weather.tempCelsius}
              />
              <DemandForecastChart
                timepoints={timepoints}
                stops={stops}
                finalEventEndTime={schedule.finalEventEndTime}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
              />
              <CrowdRiskPanel
                risks={risks}
                stops={stops}
                onSelectStop={setSelectedStopId}
              />
            </div>
          )}

          {/* Section 3: Live Crowd Map */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    Interactive Geographic Route & Crowd Density Map
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any transit stop marker to inspect platform load ratios and route feeder details.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('allocation')}
                  className="px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-300 border border-orange-500/40 text-xs font-semibold hover:bg-orange-600/30 transition-colors cursor-pointer"
                >
                  View Bus Transfers
                </button>
              </div>

              <InteractiveMap
                stops={stops}
                plan={plan}
                risks={risks}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
              />

              <CrowdRiskPanel
                risks={risks}
                stops={stops}
                onSelectStop={setSelectedStopId}
              />
            </div>
          )}

          {/* Section 4: Bus Allocation */}
          {activeTab === 'allocation' && (
            <div className="space-y-6">
              <BusAllocationView plan={plan} schedule={schedule} stops={stops} />
              <InteractiveMap
                stops={stops}
                plan={plan}
                risks={risks}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
              />
            </div>
          )}

          {/* Section 5: Festival Planner */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              <ScheduleManager schedule={schedule} onUpdateSchedule={handleUpdateSchedule} />
            </div>
          )}

          {/* Section 6: Live Monitoring (Simulated Telemetry) */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <LiveMonitoring
                schedule={schedule}
                stops={stops}
                plan={plan}
                risks={risks}
                onTriggerToast={addToast}
              />
            </div>
          )}

          {/* Section 7: Reports & Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    Operational Briefing & Comparative Impact Analytics
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Quantified safety index, clearance duration, and emergency cost avoidance.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Export PDF / JSON Report
                </button>
              </div>

              <ReactiveVsProactive schedule={schedule} />
              <BusAllocationView plan={plan} schedule={schedule} stops={stops} />
            </div>
          )}

          {/* Section 8: AI Assistant (Gemini) */}
          {activeTab === 'assistant' && (
            <div className="space-y-6">
              <GeminiAssistant schedule={schedule} plan={plan} />
            </div>
          )}

          {/* Section 9: Dataset Management */}
          {activeTab === 'dataset' && (
            <div className="space-y-6">
              <WeatherAndHistory schedule={schedule} onUpdateWeather={handleUpdateWeather} />
            </div>
          )}

          {/* Section 10: System Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <SystemTests
                schedule={schedule}
                stops={stops}
                onTriggerToast={addToast}
              />
            </div>
          )}

          {/* Section 11: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <SettingsView
                schedule={schedule}
                stops={stops}
                onTriggerToast={addToast}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-semibold text-slate-300">FestivalFlow AI</span> – Advance Crowd Prediction & Fixed Fleet Operations Console.
              <span className="block sm:inline text-slate-400 sm:ml-2">
                Engineered for temple festival crowd safety & proactive transit optimization.
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span>React 19</span>
              <span aria-hidden="true">·</span>
              <span>Leaflet GIS</span>
              <span aria-hidden="true">·</span>
              <span>Recharts</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Interactive Modal Dialogs */}
      <WhatIfSimulator
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        schedule={schedule}
        stops={stops}
        onUpdateSchedule={handleUpdateSchedule}
        onUpdateStops={setStops}
        onResetDefaults={handleResetDefaults}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        schedule={schedule}
        plan={plan}
        timepoints={timepoints}
        stops={stops}
      />
    </div>
  );
}
