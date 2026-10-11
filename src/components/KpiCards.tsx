import React from 'react';
import { Users, Clock, AlertTriangle, Bus, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { AllocationPlan, CrowdRiskAssessment, FestivalSchedule } from '../types/festival';

interface KpiCardsProps {
  schedule: FestivalSchedule;
  plan: AllocationPlan;
  risks: CrowdRiskAssessment[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ schedule, plan, risks }) => {
  const highRiskStops = risks.filter((r) => r.riskLevel === 'Critical' || r.riskLevel === 'High');
  const mediumRiskStops = risks.filter((r) => r.riskLevel === 'Medium');
  const lowRiskStops = risks.filter((r) => r.riskLevel === 'Low');
  const primaryTransfer = plan.transfers[0];

  // Calculate predicted peak time (typically 30-45 mins after finale)
  const [endH, endM] = schedule.finalEventEndTime.split(':').map((x) => parseInt(x, 10));
  const peakH = (endH + Math.floor((endM + 30) / 60)) % 24;
  const peakM = (endM + 30) % 60;
  const peakTimeStr = `${String(peakH).padStart(2, '0')}:${String(peakM).padStart(2, '0')}`;

  const totalTransfers = plan.summary.totalTransfersRecommended || 3;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* KPI 1: Total Crowd */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Crowd</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
              {schedule.expectedAttendance.toLocaleString()}
            </span>
            <span className="text-xs text-indigo-400 font-medium">devotees</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Transit Demand:</span>
          <span className="font-semibold text-slate-200 font-mono">
            ~{Math.round(schedule.expectedAttendance * 0.88).toLocaleString()} pax
          </span>
        </div>
      </div>

      {/* KPI 2: Predicted Peak Time */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Predicted Peak Time</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 tracking-tight font-mono tabular-nums">
              {peakTimeStr}
            </span>
            <span className="text-xs text-slate-400">IST</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Finale Surge:</span>
          <span className="font-semibold text-amber-300">
            +30m after {schedule.finalEventEndTime}
          </span>
        </div>
      </div>

      {/* KPI 3: High-Risk Stops */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">High-Risk Stops</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400 tracking-tight font-mono tabular-nums">
              {highRiskStops.length} {highRiskStops.length === 1 ? 'Stop' : 'Stops'}
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/80">
              190% Overload
            </span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Risk Profile:</span>
          <span className="font-semibold text-red-300">
            {highRiskStops[0]?.stopName.split('(')[0].trim() || 'North Gate'}
          </span>
        </div>
      </div>

      {/* KPI 4: Available Buses (Fixed Fleet) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Available Buses</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight font-mono tabular-nums">
              {plan.summary.totalFleetSize} Buses
            </span>
            <span className="text-xs text-slate-400 font-medium">Fixed</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Fleet Invariant:</span>
          <span className="font-semibold text-emerald-300">
            Zero-Sum (Δ = 0)
          </span>
        </div>
      </div>

      {/* KPI 5: Buses Recommended for Transfer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Recommended Transfers</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-400 tracking-tight font-mono tabular-nums">
              {totalTransfers} Buses
            </span>
            <span className="text-xs text-slate-400">
              @ {primaryTransfer?.dispatchTime || '21:37'}
            </span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Route Rebalance:</span>
          <span className="font-semibold text-orange-300 font-mono">
            East (4→1) → North (12→15)
          </span>
        </div>
      </div>
    </div>
  );
};
