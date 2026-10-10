import React from 'react';
import { AllocationPlan, FestivalSchedule, TransitStop } from '../types/festival';
import {
  Bus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BusAllocationViewProps {
  plan: AllocationPlan;
  schedule: FestivalSchedule;
  stops: TransitStop[];
}

export const BusAllocationView: React.FC<BusAllocationViewProps> = ({ plan, schedule, stops }) => {
  const primaryTransfer = plan.transfers[0];

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-emerald-400" />
              Module 5: Smart Bus Redeployment & Physics Allocation Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Optimized proactive redeployment ensuring arrival prior to the {schedule.finalEventEndTime} closing ceremony conclusion
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Total Buses in Town: </span>
              <span className="text-white font-bold">{plan.summary.totalScheduledBuses}</span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Peak Demand Fleet: </span>
              <span className="text-rose-400 font-bold">{plan.summary.totalBusesRequired} Buses</span>
            </div>
            <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg font-bold">
              +{plan.summary.totalTransfersRecommended} Buses Transferred
            </div>
          </div>
        </div>

        {/* Stop by Stop Roster Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Stop Identifier</th>
                <th className="py-2.5 px-3">Scheduled Buses</th>
                <th className="py-2.5 px-3">Required Fleet</th>
                <th className="py-2.5 px-3">Balance Status</th>
                <th className="py-2.5 px-3">Utilization %</th>
                <th className="py-2.5 px-3">Engine Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {plan.stops.map((item) => {
                const stop = stops.find((s) => s.id === item.stopId);
                const isDonor = item.stopId === 'stop_b';
                const isRecipient = item.stopId === 'stop_a';

                return (
                  <tr key={item.stopId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isRecipient ? 'bg-rose-500' : isDonor ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      />
                      {item.stopName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.scheduledBuses} scheduled</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{item.busesRequired} required</td>
                    <td className="py-3 px-3">
                      {item.netDeficit > 0 ? (
                        <span className="text-rose-400 font-bold">Deficit: -{item.netDeficit} buses</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Surplus: +{item.surplusAvailable} buses</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-medium ${
                          item.capacityUtilizationPct > 120
                            ? 'text-rose-400'
                            : item.capacityUtilizationPct < 40
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {item.capacityUtilizationPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isRecipient && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-rose-950 text-rose-300 border border-rose-800">
                          Receive +{plan.summary.totalTransfersRecommended} Buses
                        </span>
                      )}
                      {isDonor && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Donate {plan.summary.totalTransfersRecommended} Buses (Keep 1)
                        </span>
                      )}
                      {!isRecipient && !isDonor && (
                        <span className="text-slate-400 text-[11px]">Maintain Scheduled Service</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Dispatch Command Directive Card */}
      {primaryTransfer && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 tracking-wider">
                  DISPATCH ORDER: {primaryTransfer.transferId}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Physics & Timing Verified
                </span>
              </div>

              <h4 className="text-lg font-bold text-white">
                Redeploy {primaryTransfer.busesCount} Buses from {primaryTransfer.fromStopName} to{' '}
                {primaryTransfer.toStopName}
              </h4>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {primaryTransfer.operationalRationale}
              </p>
            </div>

            {/* Timing Milestones Box */}
            <div className="flex flex-wrap lg:flex-col gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Mandatory Dispatch</span>
                  <span className="font-bold text-amber-300 text-sm">{primaryTransfer.dispatchTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Guaranteed Docking</span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {primaryTransfer.arrivalTime} (Pre-rush)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Constraint Validation Checklist */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <b>Route Distance:</b> {primaryTransfer.distanceKm} km ({primaryTransfer.transitMinutes} min transit)
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <b>Donor Protection:</b> 1 bus permanently retained at East Stop
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <b>Timeliness:</b> Arrives 15 min before crowd leaves temple
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
