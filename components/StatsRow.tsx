/**
 * StatsRow — 4 live KPI cards showing key results
 */
'use client';

import { SWPResult, SWPInputs } from '@/types/swp';
import { formatINR } from '@/lib/swpCalc';

interface StatsRowProps {
  result: SWPResult;
  inputs: SWPInputs;
}

interface KPICardProps {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  icon: React.ReactNode;
  warning?: boolean;
}

function KPICard({ id, label, value, sublabel, color, icon, warning }: KPICardProps) {
  return (
    <div
      id={id}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-5 group hover:shadow-xl transition-all duration-300 ${
        warning ? 'border-[#da3832]/30' : ''
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-800 tracking-tight" aria-live="polite">
        {value}
      </p>
      {sublabel && (
        <p className={`text-xs mt-1 font-medium ${warning ? 'text-[#da3832]' : 'text-slate-400'}`}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

export default function StatsRow({ result, inputs }: StatsRowProps) {
  const isDepleted = result.depletionMonth !== null;
  const durationYears = isDepleted
    ? Math.floor(result.depletionMonth! / 12)
    : 40;
  const durationMonths = isDepleted
    ? result.depletionMonth! % 12
    : 0;

  const durationText = isDepleted
    ? `${durationYears}y ${durationMonths}m`
    : '40+ years';

  const durationSublabel = isDepleted
    ? `Corpus depletes at month ${result.depletionMonth}`
    : 'Corpus sustains for full horizon';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key statistics">
      {/* Duration / Target Balance */}
      {inputs.mode === 'DURATION' ? (
        <KPICard
          id="kpi-duration"
          label="Corpus Lasts"
          value={durationText}
          sublabel={durationSublabel}
          color="bg-[#224c87]"
          warning={isDepleted}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#224c87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      ) : (
        <KPICard
          id="kpi-target-balance"
          label={`Balance at Year ${inputs.specYears}`}
          value={`₹${formatINR(result.balanceAtTargetYear)}`}
          sublabel={result.balanceAtTargetYear === 0 ? 'Corpus depleted before target' : 'Estimated remaining corpus'}
          color="bg-[#224c87]"
          warning={result.balanceAtTargetYear === 0}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#224c87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" />
            </svg>
          }
        />
      )}

      {/* Final Balance */}
      <KPICard
        id="kpi-final-balance"
        label="Final Balance"
        value={`₹${formatINR(result.finalBalance)}`}
        sublabel="At end of simulation"
        color="bg-emerald-500"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      />

      {/* Total Withdrawn */}
      <KPICard
        id="kpi-total-withdrawn"
        label="Total Withdrawn"
        value={`₹${formatINR(result.totalWithdrawn)}`}
        sublabel="Cumulative withdrawals"
        color="bg-amber-500"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12l10 10 10-10" />
          </svg>
        }
      />

      {/* Total Returns */}
      <KPICard
        id="kpi-total-returns"
        label="Total Returns"
        value={`₹${formatINR(result.totalReturnsEarned)}`}
        sublabel="Interest/returns earned"
        color="bg-violet-500"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
        }
      />
    </div>
  );
}
