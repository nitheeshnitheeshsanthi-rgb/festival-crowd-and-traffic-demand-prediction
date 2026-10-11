import React from 'react';
import {
  FestivalSchedule,
  AllocationPlan,
  CrowdRiskAssessment,
  TransitStop,
} from '../types/festival';
import {
  Bus,
  TrendingUp,
  MapPin,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  Sliders,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  schedule: FestivalSchedule;
  plan: AllocationPlan;
  risks: CrowdRiskAssessment[];
  stops: TransitStop[];
  onNavigate: (tabId: string) => void;
  onOpenWhatIf: () => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedule,
  plan,
  risks,
  stops,
  onNavigate,
  onOpenWhatIf,
  onOpenExport,
}) => {
  const peakTime = schedule.finalEventEndTime;
  const totalFleet = plan.summary.totalFleetSize;
  const recommendedTransfers = plan.summary.totalTransfersRecommended;
  const highRiskStop = risks.find((r) => r.riskLevel === 'High' || r.riskLevel === 'Critical');

  // Quick navigation cards configuration
  const quickNavCards = [
    {
      id: 'camera',
      title: 'Live Camera Monitoring',
      description: 'CCTV video streams, automated computer vision crowd counting, and sector density heatmaps.',
      icon: Camera,
      badge: 'Live Feed',
      accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      actionLabel: 'Open Camera Feed',
    },
    {
      id: 'prediction',
      title: 'Peak Crowd Prediction',
      description: '24-hour crowd surge demand curves, arrival-departure forecasting, and weather sensitivity models.',
      icon: TrendingUp,
      badge: 'ML Demand Curve',
      accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      actionLabel: 'View Crowd Curve',
    },
    {
      id: 'allocation',
      title: 'Bus Allocation & Redeployment',
      description: 'Zero-sum 18-bus reallocation engine, dispatch schedules, and peripheral route trade-off matrix.',
      icon: Bus,
      badge: '18 Buses Fixed',
      accentColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      actionLabel: 'Inspect Fleet Plan',
    },
    {
      id: 'map',
      title: 'Live Crowd Map',
      description: 'Geographic GIS overview of transit stops, congestion zones, and dedicated emergency bus corridors.',
      icon: MapPin,
      badge: 'Interactive GIS',
      accentColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      actionLabel: 'Explore Map',
    },
    {
      id: 'analytics',
      title: 'Reports & Analytics',
      description: 'Compare reactive vs proactive transit strategies, calculate cost avoidance, and generate PDF briefs.',
      icon: FileText,
      badge: 'Safety Benchmarks',
      accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      actionLabel: 'View Reports',
    },
    {
      id: 'assistant',
      title: 'Gemini AI Assistant',
      description: 'Tactical transit directives, crowd control checklists, and real-time situational guidance powered by Gemini.',
      icon: Sparkles,
      badge: 'AI Strategist',
      accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      actionLabel: 'Launch Assistant',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Clean Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-orange-400">
              <Shield className="w-4 h-4" />
              <span>Festival Crowd Safety & Smart Transit Planning</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">7-Day Advance Horizon</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to FestivalFlow Operations Console
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Predict high-density crowd departures, detect platform crush hazards, and execute proactive bus redeployments under a strictly capped <strong className="text-white">18-bus zero-sum invariant</strong> for the festival closing night.
            </p>

            {/* Quiet metadata strip (anti-pill unboxed text) */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Festival Date: <strong className="text-slate-200">{schedule.festivalDate}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Expected Attendance: <strong className="text-slate-200">{schedule.expectedAttendance.toLocaleString()} Devotees</strong></span>
              <span aria-hidden="true">·</span>
              <span>Finale Event: <strong className="text-slate-200">{peakTime} IST</strong></span>
              <span aria-hidden="true">·</span>
              <span>Rain Probability: <strong className="text-slate-200">{Math.round(schedule.weather.rainProbability * 100)}%</strong></span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 flex-shrink-0">
            <button
              onClick={onOpenWhatIf}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>What-If Simulator</span>
            </button>
            <button
              onClick={onOpenExport}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Operational Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Expected Attendance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expected Attendance</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {schedule.expectedAttendance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            ~{Math.round(schedule.expectedAttendance * 0.88).toLocaleString()} transit commuters
          </div>
        </div>

        {/* Card 2: Peak Surge Demand */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Surge Demand</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-orange-400 tabular-nums">
            4,200 <span className="text-xs text-slate-400 font-normal">pax/hr</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Surge starts at {peakTime} (Sanctum exit)
          </div>
        </div>

        {/* Card 3: Total Fixed Fleet */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fixed Fleet Invariant</span>
            <Bus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {totalFleet} Buses <span className="text-xs text-emerald-400 font-semibold">(Δ = 0)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Zero outside vehicles required
          </div>
        </div>

        {/* Card 4: Proactive Reallocation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Proactive Reallocation</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-sky-400 tabular-nums">
            +{recommendedTransfers} Buses Transferred
          </div>
          <div className="text-[11px] text-slate-400">
            Dispatched 21:37 (23m before finale)
          </div>
        </div>
      </div>

      {/* 3. Small Crowd-Risk Summary Widget */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Terminal Crowd Risk & Capacity Summary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current safety risk levels across all transit terminals for closing night operations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('prediction')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Demand Curve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Stop Overview Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stops.map((stop) => {
            const risk = risks.find((r) => r.stopId === stop.id);
            const isHigh = risk?.riskLevel === 'High' || risk?.riskLevel === 'Critical';
            const isDonor = stop.id === 'stop_b';

            return (
              <div
                key={stop.id}
                className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white text-xs">
                      {stop.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {stop.distanceFromTempleKm} km from sanctum
                    </div>
                  </div>
                  
                  {isHigh ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                      High Load (Mitigated)
                    </span>
                  ) : isDonor ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      Donor Route
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                      Normal Flow
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Safe Capacity:</span>
                    <span className="text-slate-200 font-mono tabular-nums">{stop.safeCapacity.toLocaleString()} pax</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Fleet:</span>
                    <span className="text-slate-200 font-mono tabular-nums">
                      {isHigh ? `${stop.scheduledBuses} + 3 = 15 buses` : isDonor ? `${stop.scheduledBuses} - 3 = 1 bus` : `${stop.scheduledBuses} buses`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Operational Status:</span>
                    <span className={isHigh ? 'text-emerald-400 font-medium' : isDonor ? 'text-amber-400 font-medium' : 'text-slate-300'}>
                      {isHigh ? 'Crush Averted (78% Load)' : isDonor ? '60m Headway (1 Bus)' : 'Steady Clearance'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Invariant Confirmation Banner */}
        <div className="flex items-center justify-between bg-slate-950/40 rounded-lg p-3 border border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Zero-Sum Outcome:</strong> Reallocating 3 buses eliminates the 190% platform crush hazard at North Gate while strictly guaranteeing 1 local feeder bus at East Bypass.
            </span>
          </div>
          <button
            onClick={() => onNavigate('allocation')}
            className="whitespace-nowrap px-3 py-1 text-xs font-semibold text-orange-400 hover:text-white transition-colors cursor-pointer"
          >
            Inspect Trade-off →
          </button>
        </div>
      </div>

      {/* 4. Quick Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Quick Navigation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Jump directly to specific tools, models, and operations views.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-black/40 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${card.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-orange-400 transition-colors">
                  <span>{card.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
