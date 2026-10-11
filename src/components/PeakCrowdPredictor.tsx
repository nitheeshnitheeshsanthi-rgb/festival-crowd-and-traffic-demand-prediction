import React, { useState, useEffect } from 'react';
import {
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
import {
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  RefreshCw,
  Info,
  Calendar,
  CloudRain,
  Thermometer,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { PeakPredictionResponse, HourlyStopForecast } from '../types/festival';
import { predictPeakCrowd } from '../services/api';

interface PeakCrowdPredictorProps {
  initialAttendance?: number;
  initialEndTime?: string;
  initialRainProb?: number;
  initialTemp?: number;
}

export const PeakCrowdPredictor: React.FC<PeakCrowdPredictorProps> = ({
  initialAttendance = 40000,
  initialEndTime = '22:00',
  initialRainProb = 0.35,
  initialTemp = 29.0,
}) => {
  const [attendance, setAttendance] = useState<number>(initialAttendance);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [rainProb, setRainProb] = useState<number>(initialRainProb);
  const [tempCelsius, setTempCelsius] = useState<number>(initialTemp);
  const [selectedStop, setSelectedStop] = useState<string>('all');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<PeakPredictionResponse | null>(null);

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictPeakCrowd({
        expectedAttendance: attendance,
        finalEventEndTime: endTime,
        rainProbability: rainProb,
        tempCelsius: tempCelsius,
        selectedStop: selectedStop,
      });
      setPredictionData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate peak crowd prediction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, []);

  // Format Recharts data across 24 hours
  const chartData = (predictionData?.hourly_forecast || []).map((slot) => {
    const item: any = { hour: slot.hour, totalDemand: slot.total_demand };
    slot.stops.forEach((s) => {
      item[s.stop_id] = s.predicted_demand;
      item[`${s.stop_id}_cap`] = s.safe_capacity;
    });
    return item;
  });

  // Extract flat list of records for the table
  const tableRows: HourlyStopForecast[] = [];
  (predictionData?.hourly_forecast || []).forEach((slot) => {
    slot.stops.forEach((s) => {
      if (selectedStop === 'all' || s.stop_id === selectedStop) {
        tableRows.push(s);
      }
    });
  });

  const handleDownloadCsv = () => {
    if (!predictionData) return;
    const header = 'Hour,Stop_ID,Stop_Name,Predicted_Demand_Pax_Hr,Safe_Capacity,Utilization_Ratio,Utilization_Pct,Risk_Level\n';
    const rows = tableRows
      .map(
        (r) =>
          `"${r.hour}","${r.stop_id}","${r.stop_name}",${r.predicted_demand},${r.safe_capacity},${r.capacity_utilization_ratio},${r.capacity_utilization_pct}%,"${r.risk_level}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FestivalFlow_Peak_Crowd_Prediction_${predictionData.parameters.final_event_end_time.replace(':', '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const peakRiskLevel = predictionData?.peak_risk_level || 'HIGH';
  const riskBadgeClass =
    peakRiskLevel === 'HIGH'
      ? 'bg-rose-950 text-rose-300 border-rose-800'
      : peakRiskLevel === 'MEDIUM'
      ? 'bg-amber-950 text-amber-300 border-amber-800'
      : 'bg-emerald-950 text-emerald-300 border-emerald-800';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header and Model Label */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Peak Crowd Time Prediction Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24-hour full-day hourly arrival forecasting with Scikit-learn Random Forest model & safe capacity risk classification
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Label Requirement: "Model forecast based on synthetic dataset" */}
          <span className="text-[11px] px-3 py-1 rounded-full bg-slate-950 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Model forecast based on synthetic dataset
          </span>

          {predictionData && (
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Forecast CSV
            </button>
          )}
        </div>
      </div>

      {/* Input Parameters Controls */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-4">
        <span className="text-xs font-semibold text-slate-200 block">Scenario Input Parameters</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Attendance */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              Attendance
            </label>
            <input
              type="number"
              step="1000"
              value={attendance}
              onChange={(e) => setAttendance(Math.max(1000, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
            />
          </div>

          {/* Finale end time */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Finale End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
            />
          </div>

          {/* Rain probability */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              Rain Prob: {Math.round(rainProb * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainProb}
              onChange={(e) => setRainProb(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer mt-1"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Temperature (°C)
            </label>
            <input
              type="number"
              value={tempCelsius}
              onChange={(e) => setTempCelsius(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
            />
          </div>

          {/* Stop Selector */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Filter Stop
            </label>
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium cursor-pointer"
            >
              <option value="all">All Bus Terminals</option>
              <option value="stop_a">Main Bus Stand (North Gate)</option>
              <option value="stop_b">East Bypass Stop (Ring Road)</option>
              <option value="stop_c">South Rail Feeder Stand</option>
            </select>
          </div>
        </div>

        {/* Action Button & Error State */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">
            Model features: [minutes_since_event_end, attendance, rain_prob, temp_celsius, distance_km, stop_share]
          </span>
          <button
            onClick={runPrediction}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-orange-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Evaluating Model...' : 'Predict Peak'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* KPI Cards for Peak Results */}
      {predictionData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Predicted Peak Time */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Predicted Peak Time</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-300 tracking-tight font-mono tabular-nums">
                {predictionData.peak_hour}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono tabular-nums">
                (Finale @ {predictionData.parameters.final_event_end_time})
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Highest crowd convergence hour across the 24-hour cycle.
            </p>
          </div>

          {/* Card 2: Highest Demand Bus Stop */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Highest Demand Stop</span>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base font-bold text-white tracking-tight line-clamp-1">
                {predictionData.peak_stop}
              </span>
              <span className="text-xs text-orange-400 font-medium">
                Captures ~82% of unguided foot traffic
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Critical focal point requiring priority bus redeployment.
            </p>
          </div>

          {/* Card 3: Predicted Passengers vs Safe Capacity */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Peak Demand vs Capacity</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
                {predictionData.peak_demand.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono tabular-nums">
                / {predictionData.peak_capacity.toLocaleString()} cap
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Utilization:{' '}
              <span className="font-semibold text-rose-300">
                {Math.round(predictionData.peak_capacity_ratio * 100)}% of safe capacity
              </span>
            </div>
          </div>

          {/* Card 4: LOW / MEDIUM / HIGH Risk Indicator */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Risk Assessment</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  peakRiskLevel === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400'
                    : peakRiskLevel === 'MEDIUM'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xl font-bold tracking-tight px-2.5 py-0.5 rounded-lg border ${riskBadgeClass}`}>
                {peakRiskLevel} RISK
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {peakRiskLevel === 'HIGH'
                ? '>= 100% capacity: Immediate bus redeployment mandated.'
                : peakRiskLevel === 'MEDIUM'
                ? '75%-99% capacity: Moderate queue control needed.'
                : '< 75% capacity: Normal safe operations.'}
            </div>
          </div>
        </div>
      )}

      {/* Per-Stop Peaks Summary Cards */}
      {predictionData?.per_stop_peaks && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Per-Stop Peak Breakdown
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {Object.values(predictionData.per_stop_peaks).map((s) => (
              <div
                key={s.stop_id}
                className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>{s.stop_name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      s.risk_level === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : s.risk_level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {s.risk_level}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Peak Time: <strong className="text-cyan-300">{s.peak_hour}</strong></span>
                  <span>Demand: <strong className="text-white">{s.peak_demand.toLocaleString()} pax/hr</strong></span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Safe Capacity: <strong>{s.safe_capacity} pax</strong></span>
                  <span>Load: <strong className="text-amber-300">{Math.round(s.capacity_utilization_ratio * 100)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Line Chart */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">
              24-Hour Passenger Demand Curve (00:00 to 23:00)
            </h4>
            <p className="text-[11px] text-slate-400">
              Hourly departure volume predicted for each bus terminal
            </p>
          </div>

          {predictionData?.peak_hour && (
            <span className="text-[11px] bg-slate-900 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-md font-mono">
              Peak: {predictionData.peak_hour} ({predictionData.peak_demand.toLocaleString()} pax)
            </span>
          )}
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
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
              {predictionData?.peak_hour && (
                <ReferenceLine
                  x={predictionData.peak_hour}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{
                    value: `Overall Peak (${predictionData.peak_hour})`,
                    fill: '#f43f5e',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}
              {selectedStop === 'all' || selectedStop === 'stop_a' ? (
                <Line
                  type="monotone"
                  dataKey="stop_a"
                  name="Main Bus Stand (North Gate)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              ) : null}
              {selectedStop === 'all' || selectedStop === 'stop_b' ? (
                <Line
                  type="monotone"
                  dataKey="stop_b"
                  name="East Bypass Stop (Ring Road)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ) : null}
              {selectedStop === 'all' || selectedStop === 'stop_c' ? (
                <Line
                  type="monotone"
                  dataKey="stop_c"
                  name="South Rail Feeder Stand"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Data Table */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-200">
            Hourly Prediction Schedule & Risk Audit Table (00:00 - 23:00)
          </h4>
          <span className="text-[11px] text-slate-400">
            Showing {tableRows.length} hourly entries
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Hour</th>
                <th className="py-2 px-3">Bus Stop Name</th>
                <th className="py-2 px-3">Predicted Demand</th>
                <th className="py-2 px-3">Safe Capacity</th>
                <th className="py-2 px-3">Utilization</th>
                <th className="py-2 px-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tableRows.map((row, idx) => {
                const isPeak = row.hour === predictionData?.peak_hour && row.stop_id === predictionData?.peak_stop_id;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isPeak
                        ? 'bg-rose-950/30 font-semibold'
                        : idx % 2 === 0
                        ? 'bg-slate-950/30'
                        : 'bg-transparent'
                    } hover:bg-slate-800/40`}
                  >
                    <td className="py-2 px-3 font-mono text-cyan-300 flex items-center gap-1.5">
                      {row.hour}
                      {isPeak && (
                        <span className="text-[9px] bg-rose-900 text-rose-200 px-1 py-0.2 rounded font-sans">
                          PEAK
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">{row.stop_name}</td>
                    <td className="py-2 px-3 font-medium text-white">
                      {row.predicted_demand.toLocaleString()} pax/hr
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {row.safe_capacity.toLocaleString()} pax
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={
                          row.risk_level === 'HIGH'
                            ? 'text-rose-400 font-semibold'
                            : row.risk_level === 'MEDIUM'
                            ? 'text-amber-400 font-semibold'
                            : 'text-emerald-400'
                        }
                      >
                        {row.capacity_utilization_pct}%
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          row.risk_level === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : row.risk_level === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {row.risk_level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
