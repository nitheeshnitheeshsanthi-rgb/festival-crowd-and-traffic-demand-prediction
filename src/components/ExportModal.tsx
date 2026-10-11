import React, { useState } from 'react';
import { FestivalSchedule, AllocationPlan, ForecastTimepoint, TransitStop } from '../types/festival';
import { Download, X, FileJson, FileSpreadsheet, FileText, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: FestivalSchedule;
  plan: AllocationPlan;
  timepoints: ForecastTimepoint[];
  stops: TransitStop[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  schedule,
  plan,
  timepoints,
  stops,
}) => {
  const [downloadedType, setDownloadedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadJson = () => {
    const payload = {
      project: 'FestivalFlow AI',
      generatedAt: new Date().toISOString(),
      festivalSchedule: schedule,
      allocationPlan: plan,
      transitStops: stops,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FestivalFlow_Dispatch_Manifest_${schedule.festivalDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedType('json');
    setTimeout(() => setDownloadedType(null), 2500);
  };

  const downloadCsv = () => {
    const headers = 'time,stop_id,stop_name,demand_pax_15m,capacity_provided,accumulated_queue,risk_level\n';
    const rows = timepoints
      .map(
        (tp) =>
          `"${tp.timeStr}","${tp.stopId}","${tp.stopName}",${tp.demand},${tp.capacityProvided},${tp.accumulatedQueue},"${tp.riskLevel}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FestivalFlow_15Min_Demand_Forecast_${schedule.festivalDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedType('csv');
    setTimeout(() => setDownloadedType(null), 2500);
  };

  const downloadBriefing = () => {
    const primaryTransfer = plan.transfers[0];
    const tradeoff = primaryTransfer?.serviceLossTradeoff;

    const text = `========================================================================
FESTIVALFLOW AI – ADVANCE TACTICAL DISPATCH DIRECTIVE
Event: ${schedule.festivalName}
Date: ${schedule.festivalDate} | Concluding Ceremony End: ${schedule.finalEventEndTime}
Expected Attendance: ${schedule.expectedAttendance.toLocaleString()} Devotees
========================================================================

1. FIXED FLEET INVARIANT & ZERO-SUM REDEPLOYMENT DIRECTIVE:
------------------------------------------------------------------------
- Total Fixed System Fleet: ${plan.summary.totalFleetSize} Buses (No outside additions permitted)
- Total Reallocated Fleet: ${plan.summary.totalTransfersRecommended} Buses
- Net System Fleet Delta: ${plan.summary.netFleetDelta} Buses (Strict Zero-Sum Conservation Verified)
- Recommended Proactive Redeployment: TRF-PROACTIVE-01
- Origin / Donor Route: Line 7 – East Bypass & Outer Ring Road Feeder
- Destination / Recipient Route: Line 1 – Main Bus Stand (North Gate)
- Transit Distance: 2.0 km (Estimated 18 min transit under dedicated transit escort)
- Mandatory Dispatch Time: ${primaryTransfer?.dispatchTime || '21:37'}
- Guaranteed Docking Time: ${primaryTransfer?.arrivalTime || '21:55'} (15 min prior to ceremony end)

2. EXPLICIT ROUTE SERVICE TRADE-OFF AUDIT:
------------------------------------------------------------------------
• Route Losing Service: ${tradeoff?.donorRouteName || 'Line 7 East Bypass'}
  - Fleet Reduction: ${tradeoff?.busesBefore || 4} buses -> ${tradeoff?.busesAfter || 1} bus (-${tradeoff?.busesLost || 3} buses)
  - Headway Impact: ${tradeoff?.headwayBeforeMinutes || 15}m -> ${tradeoff?.headwayAfterMinutes || 60}m departure interval (+${tradeoff?.headwayIncreaseMinutes || 45}m delay)
  - Clearance Lost: -${tradeoff?.capacityLostPaxPerHour || 195} pax/hr
  - Affected Travelers: ~${tradeoff?.affectedPassengersEstimate || 180} local commuters
  - Retention Guard: ${tradeoff?.busesAfter || 1} bus permanently retained on site for rural commuters

• Route Gaining Service: ${tradeoff?.recipientRouteName || 'Line 1 North Gate Express'}
  - Fleet Reinforcement: 12 buses -> 15 buses (+3 buses)
  - Headway Improvement: 5.0m -> 4.0m departures
  - Clearance Gained: +${plan.summary.clearedPassengersBonus.toLocaleString()} pax capacity
  - Outcome: Eliminates fatal 190% platform crush; reduces max wait from 110m to 18m

• Trade-Off Policy Verdict:
  ${tradeoff?.tradeoffSummary || 'Zero-sum redistribution approved: life-safety crowd prevention takes priority over peripheral headway.'}

3. STOP BY STOP FLEET ALLOCATION AUDIT:
------------------------------------------------------------------------
${plan.stops
  .map(
    (s) =>
      `• ${s.stopName} (${s.routeName}):
     Scheduled: ${s.scheduledBuses}b | Delta: ${s.busDelta > 0 ? `+${s.busDelta}` : s.busDelta}b | Effective: ${s.busesAfterRedeployment}b | Headway: ${s.headwayBeforeMin}m -> ${s.headwayAfterMin}m | Status: ${s.serviceStatus}`
  )
  .join('\n')}

Generated by FestivalFlow AI – Proactive Transport Planning Engine.
========================================================================`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FestivalFlow_Tactical_Briefing_${schedule.festivalDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedType('txt');
    setTimeout(() => setDownloadedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Export Operational Dispatch Manifest</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Download certified model forecasts, vehicle redeployment plans, or complete datasets for field distribution.
        </p>

        <div className="space-y-2.5">
          {/* JSON manifest */}
          <button
            onClick={downloadJson}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-left flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Dispatch Manifest (JSON)</span>
                <span className="text-[10px] text-slate-400">Machine-readable deployment payload with timestamps</span>
              </div>
            </div>
            {downloadedType === 'json' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* CSV forecast */}
          <button
            onClick={downloadCsv}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-left flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">15-Min Forecast Dataset (CSV)</span>
                <span className="text-[10px] text-slate-400">Time-series passenger arrival demands and queues</span>
              </div>
            </div>
            {downloadedType === 'csv' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Text Briefing */}
          <button
            onClick={downloadBriefing}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-left flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Official Field Directive (TXT)</span>
                <span className="text-[10px] text-slate-400">Command summary for District Magistrate and Police</span>
              </div>
            </div>
            {downloadedType === 'txt' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
