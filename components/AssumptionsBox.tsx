/**
 * AssumptionsBox — Live editable assumptions chips
 */
'use client';

import { SWPInputs } from '@/types/swp';

interface AssumptionsBoxProps {
  inputs: SWPInputs;
}

export default function AssumptionsBox({ inputs }: AssumptionsBoxProps) {
  const assumptions = [
    {
      id: 'assumption-return',
      label: 'Expected Return',
      value: `${inputs.annualReturn}% p.a.`,
      icon: '📈',
    },
    {
      id: 'assumption-compounding',
      label: 'Compounding',
      value: 'Monthly',
      icon: '🔄',
    },
    {
      id: 'assumption-tax',
      label: 'Tax',
      value: 'Not adjusted',
      icon: '🧾',
    },
    {
      id: 'assumption-costs',
      label: 'Transaction Costs',
      value: 'Not assumed',
      icon: '💳',
    },
    ...(inputs.inflationAdjusted
      ? [
          {
            id: 'assumption-inflation',
            label: 'Inflation Step-Up',
            value: `${inputs.inflationRate}% annual`,
            icon: '📊',
          },
        ]
      : []),
    {
      id: 'assumption-illustrative',
      label: 'Purpose',
      value: 'Illustrative only',
      icon: 'ℹ️',
    },
  ];

  return (
    <aside
      role="region"
      aria-label="Assumptions and disclosures"
      className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6"
    >
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-amber-500" />
        Assumptions
      </h3>
      <div className="flex flex-wrap gap-2">
        {assumptions.map((a) => (
          <div
            key={a.id}
            id={a.id}
            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100 hover:border-slate-300"
            aria-live="polite"
          >
            <span className="text-sm">{a.icon}</span>
            <span className="text-slate-400">{a.label}:</span>
            <span className="font-bold text-slate-700">{a.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
