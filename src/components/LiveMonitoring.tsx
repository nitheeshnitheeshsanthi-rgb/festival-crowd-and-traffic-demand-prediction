import React, { useState, useEffect } from 'react';
import { FestivalSchedule, TransitStop, AllocationPlan, CrowdRiskAssessment } from '../types/festival';
import {
  Activity,
  Radio,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Bus,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Volume2,
  ChevronRight,
  Zap,
  Camera,
} from 'lucide-react';

interface LiveMonitoringProps {
  schedule: FestivalSchedule;
  stops: TransitStop[];
  plan: AllocationPlan;
  risks: CrowdRiskAssessment[];
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'alert' | 'dispatch' | 'sensor' | 'normal';
  title: string;
  description: string;
  stopName?: string;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  schedule,
  stops,
  plan,
  risks,
  onTriggerToast,
  onNavigateTab,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('21:35:00');
  const [simulatedSurge, setSimulatedSurge] = useState<number>(0); // extra %
  const [rainShock, setRainShock] = useState<boolean>(false);
  const [activeBusesInTransit, setActiveBusesInTransit] = useState<number>(3);
  const [clearedDevotees, setClearedDevotees] = useState<number>(14200);

  const [events, setEvents] = useState<TelemetryEvent[]>([
    {
      id: 'evt-1',
      timestamp: '21:30:15',
      type: 'normal',
      title: 'Finale Deeparadhana Ceremony Commenced',
      description: 'Crowd density inside inner sanctum reached peak capacity of 40,000 devotees.',
    },
    {
      id: 'evt-2',
      timestamp: '21:35:00',
      type: 'sensor',
      title: 'Gate A Turnstile Surge Influx Detected',
      description: 'Main Bus Stand platform sensors report inflow jumping to 420 devotees/min.',
      stopName: 'Main Bus Stand (North Gate)',
    },
    {
      id: 'evt-3',
      timestamp: '21:37:00',
      type: 'dispatch',
      title: 'AI Redeployment Directive Issued',
      description: 'FestivalFlow AI recommended transferring 3 buses from East Bypass to North Gate to avert crush overload.',
      stopName: 'East Bypass Stop',
    },
  ]);

  // Telemetry sensor tick loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Advance seconds
      setCurrentTime((prev) => {
        const [h, m, s] = prev.split(':').map((x) => parseInt(x, 10));
        let newS = s + 5;
        let newM = m;
        let newH = h;
        if (newS >= 60) {
          newS = 0;
          newM += 1;
        }
        if (newM >= 60) {
          newM = 0;
          newH = (newH + 1) % 24;
        }
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')}`;
      });

      // Slowly increment cleared devotees
      setClearedDevotees((prev) => prev + Math.floor(Math.random() * 25 + 15));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSimulateSurge = () => {
    setSimulatedSurge((prev) => prev + 25);
    const newEvt: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      timestamp: currentTime,
      type: 'alert',
      title: 'Emergency Surge Shock Applied (+25%)',
      description: 'Sanctum exit rush accelerated. Platform queue at North Gate expanded by ~1,200 devotees.',
      stopName: 'Main Bus Stand (North Gate)',
    };
    setEvents((prev) => [newEvt, ...prev.slice(0, 7)]);
    onTriggerToast?.(
      'warning',
      'Crowd Surge Influx Simulated',
      '+25% rapid crowd exit registered at North Gate turnstiles.'
    );
  };

  const handleSimulateRain = () => {
    setRainShock((prev) => !prev);
    const state = !rainShock;
    const newEvt: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      timestamp: currentTime,
      type: state ? 'alert' : 'normal',
      title: state ? 'Heavy Rainfall Downpour Commenced' : 'Rain Intensity Subsided',
      description: state
        ? 'Pedestrian walking speeds dropped 35%. Devotees rushing for covered bus shelters.'
        : 'Walking conditions stabilized back to dry baseline.',
    };
    setEvents((prev) => [newEvt, ...prev.slice(0, 7)]);
    onTriggerToast?.(
      state ? 'warning' : 'info',
      state ? 'Downpour Triggered' : 'Weather Normalized',
      state ? 'Walking velocity reduced, shelter demand surged.' : 'Rainfall shock cleared.'
    );
  };

  const handleResetSimulation = () => {
    setSimulatedSurge(0);
    setRainShock(false);
    setCurrentTime('21:35:00');
    setClearedDevotees(14200);
    onTriggerToast?.('info', 'Telemetry Reset', 'Live monitoring simulation reset to closing night baseline.');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0 animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">
                Live Crowd & Station Monitoring Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                Simulated Sensor Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time turnstile counts, CCTV platform density optical gauges, and bus transponder positioning.
            </p>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('camera')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-600/25"
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera Count Feed
            </button>
          )}

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
                : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause Feed' : 'Resume Feed'}
          </button>

          <button
            onClick={handleSimulateSurge}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            +25% Surge Rush
          </button>

          <button
            onClick={handleSimulateRain}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              rainShock
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-sky-600/20 text-sky-300 border-sky-500/40 hover:bg-sky-600/30'
            }`}
          >
            🌧️ Rain Shock
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Current Telemetry Time</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 font-mono text-xl font-bold text-white tracking-wider">
            {currentTime} <span className="text-xs text-slate-500 font-normal">IST</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Finale Target: <span className="text-amber-400 font-semibold">{schedule.finalEventEndTime}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Cleared Devotees</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">
            {clearedDevotees.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target: ~{Math.round(schedule.expectedAttendance * 0.88).toLocaleString()} transit
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Redeployment Convoy</span>
            <Bus className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-1.5 font-mono text-xl font-bold text-orange-400">
            {activeBusesInTransit} Buses En Route
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            East Bypass → North Gate (ETA 11m)
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fleet Conservation</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1.5 font-mono text-xl font-bold text-white">
            18 / 18 <span className="text-xs text-emerald-400">Fixed</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero-Sum Policy Maintained
          </div>
        </div>
      </div>

      {/* Main Grid: Stop Telemetry Gauges + Live Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Stop Influx and Capacity Gauges */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Real-Time Platform Density Gauges
            </h3>
            <span className="text-xs text-slate-400">
              Updated every 3s via sensor polling
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Stop 1: Main Bus Stand (North Gate) */}
            <div className="bg-slate-900/85 border border-red-800/60 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      Main Bus Stand (North Gate)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-700/80">
                      HIGH RISK (CRITICAL)
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Line 1 – Temple Central & Sanctum Express · 0.4 km from sanctum
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-red-400">
                    {Math.min(220, 190 + simulatedSurge)}% Load
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Safe Cap: 2,500 pax
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((190 + simulatedSurge) / 200) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Turnstile Influx: 420+ pax/min</span>
                  <span className="text-red-300 font-semibold">Crush threshold exceeded without redeployment</span>
                </div>
              </div>

              {/* Bus Status */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Scheduled: <strong className="text-white">12 buses</strong> → Redeployment: <strong className="text-emerald-400">15 buses (+3 from East Bypass)</strong>
                </span>
                <span className="text-emerald-400 font-medium">Headway: 5.0m</span>
              </div>
            </div>

            {/* Stop 2: East Bypass Stop (Donor) */}
            <div className="bg-slate-900/85 border border-emerald-800/60 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      East Bypass Stop (Ring Road)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
                      LOW RISK (DONOR)
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Line 2 – Bypass Feeder & Rural Connector · 2.1 km from sanctum
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    24% Load
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Safe Cap: 1,800 pax
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: '24%' }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Turnstile Influx: 35 pax/min</span>
                  <span className="text-slate-400">Idle capacity donated to North Gate</span>
                </div>
              </div>

              {/* Bus Status & Trade-Off */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Scheduled: <strong className="text-white">4 buses</strong> → Redeployment: <strong className="text-amber-400">1 bus (-3 transferred)</strong>
                </span>
                <span className="text-amber-400 font-medium">Headway: 15m → 60m (+45m trade-off)</span>
              </div>
            </div>

            {/* Stop 3: South Feeder Terminus */}
            <div className="bg-slate-900/85 border border-orange-800/60 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      South Feeder Terminus (Railway Link)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950/80 text-orange-300 border border-orange-700/80">
                      MEDIUM RISK
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Line 3 – South Station Link · 1.5 km from sanctum
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-orange-400">
                    58% Load
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Safe Cap: 2,000 pax
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: '58%' }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Turnstile Influx: 110 pax/min</span>
                  <span className="text-emerald-400 font-semibold">Self-sufficient allocation</span>
                </div>
              </div>

              {/* Bus Status */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Scheduled: <strong className="text-white">2 buses</strong> → Redeployment: <strong className="text-white">2 buses (Δ = 0)</strong>
                </span>
                <span className="text-slate-300 font-medium">Headway: 30.0m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Event & Incident Ticker */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Live Incident & Dispatch Feed
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                LIVE
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 no-scrollbar">
              {events.map((evt) => {
                const isAlert = evt.type === 'alert';
                const isDispatch = evt.type === 'dispatch';
                const isSensor = evt.type === 'sensor';

                const badgeColor = isAlert
                  ? 'text-red-400 bg-red-950/60 border-red-800/80'
                  : isDispatch
                  ? 'text-orange-400 bg-orange-950/60 border-orange-800/80'
                  : isSensor
                  ? 'text-amber-400 bg-amber-950/60 border-amber-800/80'
                  : 'text-slate-400 bg-slate-800 border-slate-700';

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{evt.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                        {evt.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">{evt.title}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      {evt.description}
                    </div>
                    {evt.stopName && (
                      <div className="text-[10px] text-slate-500 font-medium">
                        Location: {evt.stopName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Operator Note: </span>
            Buses 104, 107, and 109 from East Bypass Stop were ordered at 21:37 to stage at North Gate platform 2. Police barricades deployed along West Chariot Street.
          </div>
        </div>
      </div>
    </div>
  );
};
