import React from 'react';
import { CrowdRiskAssessment, TransitStop } from '../types/festival';
import { ShieldAlert, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CrowdRiskPanelProps {
  risks: CrowdRiskAssessment[];
  stops: TransitStop[];
  onSelectStop: (id: string) => void;
}

export const CrowdRiskPanel: React.FC<CrowdRiskPanelProps> = ({ risks, stops, onSelectStop }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Multi-Stop Crowd Safety & Structural Capacity Audit
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform safety thresholds evaluated against forecasted peak queue accumulation
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Threshold: Safe Platform Limit (100% Structural Safe Rating)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {risks.map((risk) => {
          const stop = stops.find((s) => s.id === risk.stopId);
          const isHighRisk = risk.riskLevel === 'Critical' || risk.riskLevel === 'High';
          const isMediumRisk = risk.riskLevel === 'Medium';
          const isLowRisk = risk.riskLevel === 'Low';

          const badgeClasses = isHighRisk
            ? 'bg-red-950/80 text-red-300 border-red-700/80'
            : isMediumRisk
            ? 'bg-orange-950/80 text-orange-300 border-orange-700/80'
            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';

          const borderCard = isHighRisk
            ? 'border-red-800/60 bg-red-950/15'
            : isMediumRisk
            ? 'border-orange-800/60 bg-orange-950/15'
            : 'border-slate-800 bg-slate-950/40';

          return (
            <div
              key={risk.stopId}
              onClick={() => onSelectStop(risk.stopId)}
              className={`p-4 rounded-xl border ${borderCard} hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between space-y-3.5`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{risk.stopName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClasses}`}>
                    {isHighRisk ? 'HIGH RISK' : isMediumRisk ? 'MEDIUM RISK' : 'LOW RISK'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  <span>{stop?.distanceFromTempleKm} km</span> walking radius from sanctum exit
                </div>
              </div>

              {/* Overload progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Structural Load Ratio</span>
                  <span className={`font-mono tabular-nums font-bold ${isHighRisk ? 'text-red-400' : isMediumRisk ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {risk.capacityOverloadRatio}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (risk.capacityOverloadRatio / 180) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 font-mono tabular-nums">
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Peak Inflow</span>
                  <span className="font-semibold text-slate-200">{risk.peakPassengerDemand.toLocaleString()} /15m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Accumulated Queue</span>
                  <span className={`font-semibold ${isHighRisk ? 'text-red-400' : 'text-slate-200'}`}>
                    {risk.peakAccumulatedQueue.toLocaleString()} pax
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Safe Platform Limit</span>
                  <span className="text-slate-300">{risk.safeCapacity.toLocaleString()} pax</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Hazard Window</span>
                  <span className="text-orange-400 font-medium font-sans">{risk.peakHazardWindow}</span>
                </div>
              </div>

              {/* Qualitative assessment note */}
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                {risk.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
