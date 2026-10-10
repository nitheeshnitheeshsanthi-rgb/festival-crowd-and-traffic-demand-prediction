import React, { useState } from 'react';
import { FestivalSchedule, TimelineMilestone } from '../types/festival';
import { SEVEN_DAY_TIMELINE } from '../services/simulationEngine';
import { Calendar, Clock, Users, MapPin, CheckCircle, Plus, Trash2, Edit3, Save } from 'lucide-react';

interface ScheduleManagerProps {
  schedule: FestivalSchedule;
  onUpdateSchedule: (updated: Partial<FestivalSchedule>) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ schedule, onUpdateSchedule }) => {
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [tempAttendance, setTempAttendance] = useState(schedule.expectedAttendance);
  const [tempEndTime, setTempEndTime] = useState(schedule.finalEventEndTime);
  const [tempDate, setTempDate] = useState(schedule.festivalDate);

  const handleSave = () => {
    onUpdateSchedule({
      expectedAttendance: Number(tempAttendance),
      finalEventEndTime: tempEndTime,
      festivalDate: tempDate,
    });
    setIsEditingEvent(false);
  };

  return (
    <div className="space-y-6">
      {/* Module 1: Schedule Configuration Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              Module 1: Festival Programme & Advance Schedule Manager
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Input published ceremony dates, expected attendee count, and final ritual closing time
            </p>
          </div>

          <button
            onClick={() => {
              if (isEditingEvent) handleSave();
              else setIsEditingEvent(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-600/30"
          >
            {isEditingEvent ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {isEditingEvent ? 'Save Changes & Recalculate' : 'Edit Festival Parameters'}
          </button>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Festival Date
            </label>
            <input
              type="date"
              disabled={!isEditingEvent}
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 disabled:border-slate-800 disabled:bg-slate-900/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Final Ceremony Ending Time
            </label>
            <input
              type="time"
              disabled={!isEditingEvent}
              value={tempEndTime}
              onChange={(e) => setTempEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 disabled:border-slate-800 disabled:bg-slate-900/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Expected Total Attendance
            </label>
            <input
              type="number"
              step="1000"
              disabled={!isEditingEvent}
              value={tempAttendance}
              onChange={(e) => setTempAttendance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 disabled:border-slate-800 disabled:bg-slate-900/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>
        </div>

        {/* Key Ritual Chronology */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
            Closing Night Ceremonial Programme (Sequence of Events)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {schedule.keyEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400">{ev.time}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    Event #{idx + 1}
                  </span>
                </div>
                <div className="font-semibold text-slate-200">{ev.title}</div>
                <div className="text-[11px] text-slate-400">{ev.location}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-1.5">
                  {ev.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Advance Preparation Timeline (D-7 to D-0) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            7-Day Advance Transport Governance & Dispatch Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Phased operational milestone sequence showing why advance crowd information enables flawless proactive redeployment
          </p>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {SEVEN_DAY_TIMELINE.map((item, idx) => {
            const isDone = item.status === 'Completed';
            const isInProg = item.status === 'In Progress';

            return (
              <div key={idx} className="relative group">
                {/* Node pin on vertical line */}
                <div
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                    isDone
                      ? 'bg-emerald-500 border-slate-900'
                      : isInProg
                      ? 'bg-amber-400 border-slate-900 animate-ping'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-orange-400 px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800/50">
                        {item.dayLabel}
                      </span>
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-400">{item.hoursFromEvent}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isInProg
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="pt-1.5 border-t border-slate-800/60 text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <span className="font-bold text-slate-400">Action Step:</span>
                    <span>{item.actionableStep}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
