import React, { useState } from 'react';
import {
  Settings,
  Bus,
  ShieldAlert,
  Clock,
  RotateCcw,
  Save,
  CheckCircle2,
  Sliders,
  Bell,
  Cpu,
  Info,
} from 'lucide-react';
import { FestivalSchedule, TransitStop } from '../types/festival';

interface SettingsViewProps {
  schedule: FestivalSchedule;
  stops: TransitStop[];
  onTriggerToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
  onResetDefaults?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schedule,
  stops,
  onTriggerToast,
  onResetDefaults,
}) => {
  const [fleetSize, setFleetSize] = useState<number>(18);
  const [busCapacity, setBusCapacity] = useState<number>(65);
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(85);
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState<number>(60);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(45);
  const [enableToasts, setEnableToasts] = useState<boolean>(true);
  const [telemetryInterval, setTelemetryInterval] = useState<number>(3);

  const handleSave = () => {
    onTriggerToast?.(
      'success',
      'Settings Successfully Saved',
      'Municipal operational parameters have been updated for festival deployment.'
    );
  };

  const handleReset = () => {
    setFleetSize(18);
    setBusCapacity(65);
    setHighRiskThreshold(85);
    setMediumRiskThreshold(60);
    setLeadTimeMinutes(45);
    setEnableToasts(true);
    setTelemetryInterval(3);
    onResetDefaults?.();
    onTriggerToast?.(
      'info',
      'Default Parameters Restored',
      'Municipal baseline fixed fleet (18 buses) and standard thresholds restored.'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 flex-shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">
                Operational Parameters & System Settings
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Municipal Console
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure fleet bounds, safety overload limits, dispatch timing, and runtime environments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Group 1: Fixed Fleet Bounds */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Bus className="w-4 h-4 text-orange-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Fixed Fleet Bounds & Capacity</h3>
            <p className="text-xs text-slate-400">Total municipal vehicles assigned across the 3 festival routes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Total Fixed Fleet Size (Buses)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={50}
                value={fleetSize}
                onChange={(e) => setFleetSize(parseInt(e.target.value, 10) || 18)}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
              />
              <span className="text-xs text-emerald-400 font-semibold">
                Strict Zero-Sum Invariant Enforced
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Redeployments must balance out: Sum(Buses After) == Sum(Buses Before) == {fleetSize}.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Standard Bus Clearance Capacity (Pax/Trip)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={40}
                max={100}
                value={busCapacity}
                onChange={(e) => setBusCapacity(parseInt(e.target.value, 10) || 65)}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
              />
              <span className="text-xs text-slate-400">
                Seated (45) + Safe Standing (20)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to calculate queue drain speed and headway throughput.
            </p>
          </div>
        </div>
      </div>

      {/* Group 2: Safety Overload Thresholds */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Crowd Safety & Risk Thresholds</h3>
            <p className="text-xs text-slate-400">Triggers for High, Medium, and Low risk classifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300">High / Critical Risk Limit</span>
              <span className="font-mono text-red-400 font-bold">{highRiskThreshold}% Load</span>
            </div>
            <input
              type="range"
              min={70}
              max={150}
              value={highRiskThreshold}
              onChange={(e) => setHighRiskThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Above this structural platform limit, urgent bus transfer is mandated.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300">Medium Risk Threshold</span>
              <span className="font-mono text-orange-400 font-bold">{mediumRiskThreshold}% Load</span>
            </div>
            <input
              type="range"
              min={40}
              max={70}
              value={mediumRiskThreshold}
              onChange={(e) => setMediumRiskThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Between {mediumRiskThreshold}% and {highRiskThreshold}% load, elevated monitoring is active.
            </p>
          </div>
        </div>
      </div>

      {/* Group 3: Dispatch & Lead Time */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Advance Dispatch Timing</h3>
            <p className="text-xs text-slate-400">Lead time before predicted peak surge to issue redeployment orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Advance Lead Time: <span className="text-amber-400 font-bold">{leadTimeMinutes} minutes</span>
            </label>
            <input
              type="range"
              min={15}
              max={90}
              step={5}
              value={leadTimeMinutes}
              onChange={(e) => setLeadTimeMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              If peak is 22:30, buses are dispatched at {22 - Math.floor((60 - (30 - leadTimeMinutes + 60) % 60) / 60)}:
              {String((30 - leadTimeMinutes + 60) % 60).padStart(2, '0')}.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Live Telemetry Stream Speed (seconds)
            </label>
            <select
              value={telemetryInterval}
              onChange={(e) => setTelemetryInterval(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value={1}>1 second (Fast Simulation)</option>
              <option value={3}>3 seconds (Standard Demo)</option>
              <option value={5}>5 seconds (Relaxed Feed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group 4: Runtime System Information */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">System Architecture & Environment</h3>
            <p className="text-xs text-slate-400">Deployed runtime configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">Client Frontend</span>
            <span className="font-semibold text-white font-mono">React 19 / Vite 8</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">Application Server</span>
            <span className="font-semibold text-white font-mono">Node.js Express (Port 3000)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">GIS Geospatial</span>
            <span className="font-semibold text-white font-mono">Leaflet 1.9.4</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">AI Reasoning</span>
            <span className="font-semibold text-orange-400 font-mono">Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
