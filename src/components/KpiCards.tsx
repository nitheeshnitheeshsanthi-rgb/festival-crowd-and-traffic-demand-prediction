import React from 'react';
import { Users, AlertTriangle, Bus, Clock, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { AllocationPlan, CrowdRiskAssessment, FestivalSchedule } from '../types/festival';

interface KpiCardsProps {
  schedule: FestivalSchedule;
  plan: AllocationPlan;
  risks: CrowdRiskAssessment[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ schedule, plan, risks }) => {
  const mainStopRisk = risks.find((r) => r.stopId === 'stop_a');
  const eastStopRisk = risks.find((r) => r.stopId === 'stop_b');
  const mainStopAlloc = plan.stops.find((s) => s.stopId === 'stop_a');
  const primaryTransfer = plan.transfers[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Crowd Surge */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Expected Crowd</span>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {schedule.expectedAttendance.toLocaleString()}
          </span>
          <span className="text-xs text-orange-400 font-medium">~35,200 via transit</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-400">
          <span>Surge Window: </span>
          <span className="ml-1 text-slate-200 font-medium">
            {schedule.finalEventEndTime} - {parseInt(schedule.finalEventEndTime.split(':')[0], 10) + 2}:00
          </span>
        </div>
      </div>

      {/* KPI 2: Crowd Risk & Bottleneck */}
      <div className="bg-slate-900/80 border border-rose-950/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Main Stand Risk Status</span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">
            {mainStopRisk?.riskLevel.toUpperCase() || 'CRITICAL'}
          </span>
          <span className="text-xs text-rose-300 font-semibold px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">
            {mainStopRisk?.capacityOverloadRatio || 190}% Load
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-400">
          <span>Safe Cap: {mainStopRisk?.safeCapacity.toLocaleString()} pax</span>
          <span className="mx-1.5 text-slate-600">|</span>
          <span className="text-rose-300">Peak: {mainStopRisk?.peakHazardWindow}</span>
        </div>
      </div>

      {/* KPI 3: Fleet Deficit vs Scheduled */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Main Terminal Bus Balance</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {mainStopAlloc?.scheduledBuses || 12} / {mainStopAlloc?.busesRequired || 19}
          </span>
          <span className="text-xs text-rose-400 font-medium">
            Deficit: -{mainStopAlloc?.netDeficit || 7} buses
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-400">
          <span>East Bypass Stop: </span>
          <span className="ml-1 text-emerald-400 font-medium">
            4 scheduled (+{plan.summary.totalTransfersRecommended} surplus)
          </span>
        </div>
      </div>

      {/* KPI 4: Proactive Transfer Solution */}
      <div className="bg-slate-900/80 border border-emerald-950/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Proactive Redeployment</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            {plan.summary.totalTransfersRecommended} Buses
          </span>
          <span className="text-xs text-emerald-300 font-semibold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
            Dispatch @ {primaryTransfer?.dispatchTime || '21:37'}
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          <span>Arrives {primaryTransfer?.arrivalTime || '21:55'} before crowd exits</span>
        </div>
      </div>
    </div>
  );
};
