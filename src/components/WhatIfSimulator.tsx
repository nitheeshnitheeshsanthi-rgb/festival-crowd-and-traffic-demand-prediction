import React from 'react';
import { FestivalSchedule, TransitStop } from '../types/festival';
import { Sliders, X, RotateCcw, Sparkles, CloudRain, Users, Clock, Bus } from 'lucide-react';

interface WhatIfSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: FestivalSchedule;
  stops: TransitStop[];
  onUpdateSchedule: (updated: Partial<FestivalSchedule>) => void;
  onUpdateStops: (updatedStops: TransitStop[]) => void;
  onResetDefaults: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  isOpen,
  onClose,
  schedule,
  stops,
  onUpdateSchedule,
  onUpdateStops,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const handlePreset = (preset: 'default' | 'rainy' | 'moderate' | 'mega') => {
    if (preset === 'default') {
      onResetDefaults();
    } else if (preset === 'rainy') {
      onUpdateSchedule({
        expectedAttendance: 50000,
        finalEventEndTime: '21:30',
        weather: {
          ...schedule.weather,
          condition: 'Heavy Thunderstorm',
          rainProbability: 0.85,
        },
      });
    } else if (preset === 'moderate') {
      onUpdateSchedule({
        expectedAttendance: 25000,
        finalEventEndTime: '22:30',
        weather: {
          ...schedule.weather,
          condition: 'Clear',
          rainProbability: 0.05,
        },
      });
    } else if (preset === 'mega') {
      onUpdateSchedule({
        expectedAttendance: 65000,
        finalEventEndTime: '22:00',
        weather: {
          ...schedule.weather,
          condition: 'Light Rain',
          rainProbability: 0.45,
        },
      });
    }
  };

  const handleStopBusesChange = (stopId: string, count: number) => {
    const updated = stops.map((s) => (s.id === stopId ? { ...s, scheduledBuses: count } : s));
    onUpdateStops(updated);
  };

  const mainStop = stops.find((s) => s.id === 'stop_a');
  const eastStop = stops.find((s) => s.id === 'stop_b');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive What-If Scenario Simulator</h3>
              <p className="text-[11px] text-slate-400">
                Stress-test the ML forecast & bus allocation engine across dynamic variables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset buttons */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">Instant Scenario Presets</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => handlePreset('default')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-orange-400">Standard</span>
              <span className="text-[10px] text-slate-400">40k · 22:00 · 35% rain</span>
            </button>
            <button
              onClick={() => handlePreset('rainy')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-blue-400">Downpour</span>
              <span className="text-[10px] text-slate-400">50k · 21:30 · 85% rain</span>
            </button>
            <button
              onClick={() => handlePreset('moderate')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-emerald-400">Moderate</span>
              <span className="text-[10px] text-slate-400">25k · 22:30 · Clear</span>
            </button>
            <button
              onClick={() => handlePreset('mega')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-rose-400">Mega Crowd</span>
              <span className="text-[10px] text-slate-400">65k · 22:00 · 45% rain</span>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Fixed fleet size badge */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Total Baseline Fleet Across All Stops:</span>
            <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {stops.reduce((acc, s) => acc + s.scheduledBuses, 0)} Buses (Fixed Pool)
            </span>
          </div>

          {/* Attendance */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                Total Expected Attendees
              </span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {schedule.expectedAttendance.toLocaleString()} pax
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="70000"
              step="2500"
              value={schedule.expectedAttendance}
              onChange={(e) => onUpdateSchedule({ expectedAttendance: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Ending time */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Final Event Conclusion Time
              </span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {schedule.finalEventEndTime}
              </span>
            </div>
            <input
              type="time"
              value={schedule.finalEventEndTime}
              onChange={(e) => onUpdateSchedule({ finalEventEndTime: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
          </div>

          {/* Rain probability */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Rain Probability (Early Egress Accelerant)
              </span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {Math.round(schedule.weather.rainProbability * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={schedule.weather.rainProbability}
              onChange={(e) =>
                onUpdateSchedule({
                  weather: { ...schedule.weather, rainProbability: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Fleet at Main Stand */}
          {mainStop && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-rose-400" />
                  Scheduled Buses at Main Bus Stand
                </span>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {mainStop.scheduledBuses} buses
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="1"
                value={mainStop.scheduledBuses}
                onChange={(e) => handleStopBusesChange('stop_a', parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          )}

          {/* Fleet at East Stand */}
          {eastStop && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-emerald-400" />
                  Scheduled Buses at East Bypass Stand (Donor)
                </span>
                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {eastStop.scheduledBuses} buses
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={eastStop.scheduledBuses}
                onChange={(e) => handleStopBusesChange('stop_b', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={onResetDefaults}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Initial Hackathon Parameters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer"
          >
            Apply & Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
