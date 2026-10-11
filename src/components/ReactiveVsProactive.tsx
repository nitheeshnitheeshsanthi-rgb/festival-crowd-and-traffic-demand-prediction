import React from 'react';
import { FestivalSchedule } from '../types/festival';
import { compareReactiveVsProactive } from '../services/simulationEngine';
import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ReactiveVsProactiveProps {
  schedule: FestivalSchedule;
}

export const ReactiveVsProactive: React.FC<ReactiveVsProactiveProps> = ({ schedule }) => {
  const comparison = compareReactiveVsProactive(schedule);
  const { reactive, proactive, metricDiff } = comparison;

  return (
    <div className="space-y-6">
      {/* Executive Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Paradigm Shift: Reactive Scramble vs Advance Proactive Deployment
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Why waiting until overcrowding begins fails every year, and how predicting demand 7 days ahead eliminates platform crushes completely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[10px]">Wait Time Reduction</span>
              <span className="text-base font-bold text-emerald-400">-{metricDiff.waitTimeReductionPercent}%</span>
            </div>
            <div className="text-center px-2 border-l border-slate-800">
              <span className="text-slate-400 block text-[10px]">Clearance Speedup</span>
              <span className="text-base font-bold text-cyan-400">+{metricDiff.clearingSpeedupPercent}%</span>
            </div>
            <div className="text-center px-2 border-l border-slate-800">
              <span className="text-slate-400 block text-[10px]">Queue Cut</span>
              <span className="text-base font-bold text-amber-400">-{metricDiff.platformQueueReduction.toLocaleString()} pax</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reactive Status Quo Card */}
        <div className="bg-slate-900 border border-rose-950/80 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h4 className="font-bold text-sm text-rose-300">{reactive.strategyName}</h4>
              </div>
              <span className="text-[10px] bg-rose-950 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-800">
                CRUSH HAZARD
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Town officials wait until 22:30 when Main Bus Stand becomes flooded with 4,000+ desperate pilgrims before requesting help from the secondary depot.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Buses at Main Terminal:</span>
                <span className="font-bold text-rose-400">{reactive.busesAtMainStand} scheduled only</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Peak Platform Queue:</span>
                <span className="font-bold text-rose-400">{reactive.peakPlatformQueue.toLocaleString()} passengers (Packed)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Max Passenger Wait Time:</span>
                <span className="font-bold text-rose-400">{reactive.maxPassengerWaitTimeMin} minutes (Near 2 hours)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Stranded Commuters:</span>
                <span className="font-bold text-rose-400">{reactive.passengerStrandedCount.toLocaleString()} stranded</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Total Clearance Duration:</span>
                <span className="font-bold text-rose-400">{reactive.clearingDurationMin} minutes (3.25 hrs)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-lg text-xs text-rose-300 leading-relaxed">
            <span className="font-bold block mb-1">Fatal Operational Bottleneck:</span>
            {reactive.keyFlaw}
          </div>
        </div>

        {/* Proactive FestivalFlow AI Card */}
        <div className="bg-slate-900 border border-emerald-950/80 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-950/60 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-emerald-300">{proactive.strategyName}</h4>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                OPTIMIZED FLOW
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              FestivalFlow AI recognizes 7 days ahead that 40,000 pilgrims leave at {schedule.finalEventEndTime}. It issues a dispatch order at 21:37, pre-docking 3 buses from East Stop 15 min before the final ritual concludes.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Buses at Main Terminal:</span>
                <span className="font-bold text-emerald-400">{proactive.busesAtMainStand} buses ready (12 + 3 transferred)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Peak Platform Queue:</span>
                <span className="font-bold text-emerald-400">{proactive.peakPlatformQueue.toLocaleString()} passengers (Safe)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Max Passenger Wait Time:</span>
                <span className="font-bold text-emerald-400">{proactive.maxPassengerWaitTimeMin} minutes (Continuous flow)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Stranded Commuters:</span>
                <span className="font-bold text-emerald-400">0 stranded passengers</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Total Clearance Duration:</span>
                <span className="font-bold text-emerald-400">{proactive.clearingDurationMin} minutes (Under 1.5 hrs)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-lg text-xs text-emerald-300 leading-relaxed space-y-1.5">
            <div>
              <span className="font-bold">Key Innovation: </span>
              {proactive.keyAdvantage}
            </div>
            <div className="pt-1 border-t border-emerald-900/40 text-[11px] text-amber-300">
              <b>Strict Fixed Fleet Trade-Off:</b> East Bypass Route 7 drops from 4 buses to 1 bus (headway expands from 15m to 60m) to provide these 3 buses without calling outside fleets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
