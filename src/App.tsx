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
} from 'lucide-react';

export default function App() {
  const [schedule, setSchedule] = useState<FestivalSchedule>(DEFAULT_SCHEDULE);
  const [stops, setStops] = useState<TransitStop[]>(DEFAULT_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string>('stop_a');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Compute forecasts and allocation dynamically
  const timepoints = useMemo(() => calculateDemandCurve(schedule, stops), [schedule, stops]);
  const risks = useMemo(() => evaluateCrowdRisks(timepoints, stops), [timepoints, stops]);
  const plan = useMemo(() => computeBusAllocation(schedule, stops), [schedule, stops]);

  const handleUpdateSchedule = (updated: Partial<FestivalSchedule>) => {
    setSchedule((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateWeather = (weather: WeatherForecast) => {
    setSchedule((prev) => ({ ...prev, weather }));
  };

  const handleResetDefaults = () => {
    setSchedule(DEFAULT_SCHEDULE);
    setStops(DEFAULT_STOPS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Scenario Context Notice */}
        <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-indigo-950/40 border border-orange-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
              !
            </span>
            <div>
              <span className="font-bold text-white">Target Scenario: </span>
              <span className="text-slate-300">
                On festival closing night, <strong>~40,000 devotees</strong> need to depart within 2 hours.
                Main Bus Stand (North Gate) has only 12 buses and faces severe crush risk, while East Bypass Stop (2 km away)
                has 4 buses waiting empty. FestivalFlow AI predicts this 7 days in advance and dispatches 3 buses at 21:37!
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('allocation')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-auto shadow-sm"
          >
            Inspect Redeployment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Executive KPI Bar (Always Visible) */}
        <KpiCards schedule={schedule} plan={plan} risks={risks} />

        {/* Tab 1: Command Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
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

            {/* Crowd Risk Audit Panel */}
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

        {/* Tab 2: Dedicated Peak Crowd Prediction */}
        {activeTab === 'peak-prediction' && (
          <div className="space-y-6">
            <PeakCrowdPredictor
              initialAttendance={schedule.expectedAttendance}
              initialEndTime={schedule.finalEventEndTime}
              initialRainProb={schedule.weather.rainProbability}
              initialTemp={schedule.weather.tempCelsius}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Interactive Map */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <InteractiveMap
              stops={stops}
              plan={plan}
              risks={risks}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
            />
            <BusAllocationView plan={plan} schedule={schedule} stops={stops} />
          </div>
        )}

        {/* Tab 3: Bus Redeployment Engine */}
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

        {/* Tab 4: Gemini AI Briefing */}
        {activeTab === 'gemini' && (
          <div className="space-y-6">
            <GeminiAssistant schedule={schedule} plan={plan} />
          </div>
        )}

        {/* Tab 5: Festival Schedule & 7-Day Timeline */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <ScheduleManager schedule={schedule} onUpdateSchedule={handleUpdateSchedule} />
          </div>
        )}

        {/* Tab 6: Reactive vs Proactive Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <ReactiveVsProactive schedule={schedule} />
          </div>
        )}

        {/* Tab 7: Weather & Historical Data */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <WeatherAndHistory schedule={schedule} onUpdateWeather={handleUpdateWeather} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-300">FestivalFlow AI</span> – Advance Crowd Prediction & Smart Bus Planning.
            <span className="block sm:inline text-slate-400 sm:ml-2">
              Built for temple festival crowd safety & proactive transit optimization.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              FastAPI + Scikit-Learn
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              Gemini 3.8 Flash
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              Leaflet + OSM
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              Recharts
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              React 19 + Tailwind CSS
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
