import React from 'react';
import { CrowdRiskAssessment, TransitStop } from '../types/festival';
import { AlertTriangle, ShieldCheck, ShieldAlert, Clock, Users, ArrowUpRight } from 'lucide-react';

interface CrowdRiskPanelProps {
  risks: CrowdRiskAssessment[];
  stops: TransitStop[];
  onSelectStop: (id: string) => void;
}

export const CrowdRiskPanel: React.FC<CrowdRiskPanelProps> = ({ risks, stops, onSelectStop }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Module 4: Multi-Stop Crowd Risk & Structural Safety Audit
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational capacity evaluation against forecasted peak queue accumulation
          </p>
        </div>
        <span className="text-xs font-medium text-slate-400">Safe Limit vs Burst Limit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {risks.map((risk) => {
          const stop = stops.find((s) => s.id === risk.stopId);
          const isCritical = risk.riskLevel === 'Critical';
          const isHigh = risk.riskLevel === 'High';
          const isLow = risk.riskLevel === 'Low';

          const badgeClasses = isCritical
            ? 'bg-rose-950 text-rose-300 border-rose-800'
            : isHigh
            ? 'bg-amber-950 text-amber-300 border-amber-800'
            : 'bg-emerald-950 text-emerald-300 border-emerald-800';

          const borderCard = isCritical
            ? 'border-rose-900/60 bg-rose-950/10'
            : isHigh
            ? 'border-amber-900/60 bg-amber-950/10'
            : 'border-slate-800 bg-slate-950/40';

          return (
            <div
              key={risk.stopId}
              onClick={() => onSelectStop(risk.stopId)}
              className={`p-4 rounded-xl border ${borderCard} hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between space-y-3`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{risk.stopName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                    {risk.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Distance: <span className="text-slate-200 font-medium">{stop?.distanceFromTempleKm} km</span> from temple exit
                </div>
              </div>

              {/* Overload progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Capacity Load Ratio</span>
                  <span className={isCritical ? 'text-rose-400 font-bold' : 'text-slate-200 font-semibold'}>
                    {risk.capacityOverloadRatio}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (risk.capacityOverloadRatio / 180) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">Peak Demand Rate</span>
                  <span className="font-semibold text-slate-200">{risk.peakPassengerDemand.toLocaleString()} /15m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Peak Queue Queue</span>
                  <span className={`font-semibold ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>
                    {risk.peakAccumulatedQueue.toLocaleString()} pax
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Safe Platform Cap</span>
                  <span className="text-slate-300">{risk.safeCapacity.toLocaleString()} pax</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Hazard Window</span>
                  <span className="text-amber-400 font-medium">{risk.peakHazardWindow}</span>
                </div>
              </div>

              {/* Qualitative assessment note */}
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-800/60 pt-2">
                "{risk.description}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
