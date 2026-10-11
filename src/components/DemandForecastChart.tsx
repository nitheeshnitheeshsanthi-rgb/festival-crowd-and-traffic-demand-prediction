import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ForecastTimepoint, TransitStop } from '../types/festival';
import { TrendingUp, AlertCircle, Info, Layers, ShieldCheck } from 'lucide-react';

interface DemandForecastChartProps {
  timepoints: ForecastTimepoint[];
  stops: TransitStop[];
  finalEventEndTime: string;
  selectedStopId: string;
  onSelectStop: (id: string) => void;
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({
  timepoints,
  stops,
  finalEventEndTime,
  selectedStopId,
  onSelectStop,
}) => {
  const [viewMode, setViewMode] = useState<'demandVsCapacity' | 'stopComparison'>('demandVsCapacity');

  // Filter timepoints for selected stop
  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0];
  const activeStopPoints = timepoints.filter((tp) => tp.stopId === activeStop.id);

  // Group data by timeStr for multi-stop comparison view
  const timeLabels = Array.from(new Set(timepoints.map((tp) => tp.timeStr)));
  const comparisonData = timeLabels.map((time) => {
    const ptA = timepoints.find((tp) => tp.timeStr === time && tp.stopId === 'stop_a');
    const ptB = timepoints.find((tp) => tp.timeStr === time && tp.stopId === 'stop_b');
    const ptC = timepoints.find((tp) => tp.timeStr === time && tp.stopId === 'stop_c');

    return {
      time,
      mainStandDemand: ptA?.demand || 0,
      mainStandCapacity: ptA?.capacityProvided || 0,
      eastBypassDemand: ptB?.demand || 0,
      southFeederDemand: ptC?.demand || 0,
    };
  });

  // Data for single-stop in-depth view
  const singleStopData = activeStopPoints.map((pt) => {
    // Proactive capacity adds transferred buses clearance (+480 pax/15m)
    const augmentedCapacity =
      pt.stopId === 'stop_a' ? pt.capacityProvided + 195 : pt.capacityProvided;

    return {
      time: pt.timeStr,
      demand: pt.demand,
      scheduledCapacity: pt.capacityProvided,
      proactiveCapacity: augmentedCapacity,
      accumulatedQueue: pt.accumulatedQueue,
      safeLimit: activeStop.safeCapacity,
    };
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">
              15-Minute Passenger Demand Forecasting (ML Baseline)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Predictive surge curve modeled against closing ceremony ending at {finalEventEndTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs">
            <button
              onClick={() => setViewMode('demandVsCapacity')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'demandVsCapacity'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demand vs Capacity
            </button>
            <button
              onClick={() => setViewMode('stopComparison')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'stopComparison'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Stops Comparison
            </button>
          </div>

          {/* Stop selector if in single stop view */}
          {viewMode === 'demandVsCapacity' && (
            <select
              value={selectedStopId}
              onChange={(e) => onSelectStop(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name} ({stop.scheduledBuses} Buses)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'demandVsCapacity' ? (
            <AreaChart data={singleStopData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine
                x={finalEventEndTime}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                label={{
                  value: 'Event Ends',
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <ReferenceLine
                y={activeStop.safeCapacity}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                label={{
                  value: `Safe Cap (${activeStop.safeCapacity})`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="demand"
                name="Passenger Arrival Demand (pax/15m)"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorDemand)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="scheduledCapacity"
                name="Scheduled Bus Clearance Rate"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="proactiveCapacity"
                name="Proactive Augmented Clearance (+3 Buses)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="accumulatedQueue"
                name="Accumulated Platform Queue (Deficit)"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine
                x={finalEventEndTime}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                label={{
                  value: 'Event Ends',
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <Line
                type="monotone"
                dataKey="mainStandDemand"
                name="Main Bus Stand (82% Crowd Surge)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="eastBypassDemand"
                name="East Bypass Stand (12% Low Demand)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="southFeederDemand"
                name="South Feeder Stand (6% Minor)"
                stroke="#38bdf8"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Model Limitations & Scientific Disclosure Notice */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">ML Model Baseline Disclosure: </span>
          <span>
            Demand curves are calibrated using a Scikit-learn Random Forest model trained on multi-year temple festival distribution curves and synthetic crowd egress dynamics.
            Because live IoT crowd turnstile telemetry is absent 7 days ahead, the forecast incorporates ±12% confidence bounds. Extreme tropical precipitation or unscheduled procession delays can shift peak egress forward or backward by 15-25 minutes.
          </span>
        </div>
      </div>
    </div>
  );
};
