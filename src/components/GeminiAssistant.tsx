import React, { useState, useEffect } from 'react';
import { GeminiBriefing, FestivalSchedule, AllocationPlan } from '../types/festival';
import { getGeminiBriefing } from '../services/api';
import {
  Sparkles,
  ClipboardList,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Sliders,
  FileText,
  BadgeCheck,
  Scale,
} from 'lucide-react';

interface GeminiAssistantProps {
  schedule: FestivalSchedule;
  plan: AllocationPlan;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ schedule, plan }) => {
  const [briefing, setBriefing] = useState<GeminiBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBriefing = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getGeminiBriefing(schedule, plan);
      setBriefing(data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error communicating with server briefing engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [schedule.finalEventEndTime, schedule.expectedAttendance, schedule.weather.rainProbability]);

  const handleCopyChecklist = () => {
    if (!briefing) return;
    const text = briefing.transportOfficialsChecklist.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">
                Tactical Operations Assistant & Gemini Strategy Briefing
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Grounded synthesis translating mathematical demand forecasts into actionable police and transit directives
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zero Hallucination Constraint Active
            </span>

            <button
              onClick={fetchBriefing}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Synthesizing...' : 'Re-Generate Briefing'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Content Box */}
        {isLoading && !briefing ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-xs text-slate-400">
              Generating tactical directives with Gemini 3.8 Flash based on {schedule.expectedAttendance.toLocaleString()} attendees...
            </p>
          </div>
        ) : briefing ? (
          <div className="mt-5 space-y-5">
            {/* Directive Title & Exec Summary */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-orange-400 tracking-wider uppercase">
                  Executive Operations Directive
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {briefing.isAiGenerated ? 'Gemini 3.8 Flash Live' : 'Deterministic Operations Policy'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{briefing.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{briefing.executiveSummary}</p>
            </div>

            {/* Service Trade-Off Callout */}
            {briefing.serviceTradeOffSummary && (
              <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Scale className="w-4 h-4" />
                  Route Service Trade-Off & Service Loss Audit
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{briefing.serviceTradeOffSummary}</p>
              </div>
            )}

            {/* Why Main Stop Is At Risk */}
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4" />
                Root Cause Analysis: Why Stop A Overwhelms While Stop B Idles
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{briefing.whyStopAtRisk}</p>
            </div>

            {/* Transport Officials Action Checklist */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  Tactical Preparation Checklist for Transport Commissioners
                </div>
                <button
                  onClick={handleCopyChecklist}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy All'}
                </button>
              </div>

              <div className="space-y-2">
                {briefing.transportOfficialsChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Sliders className="w-4 h-4" />
                Environmental & Schedule Sensitivity Analysis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{briefing.sensitivityImpact}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
