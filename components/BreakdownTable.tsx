/**
 * BreakdownTable — Scrollable year-by-year SWP table
 */
'use client';

import { YearlyRow } from '@/types/swp';
import { formatINR } from '@/lib/swpCalc';

interface BreakdownTableProps {
  yearlyRows: YearlyRow[];
}

export default function BreakdownTable({ yearlyRows }: BreakdownTableProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6"
      role="region"
      aria-label="Year-by-year breakdown table"
    >
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-[#224c87]" />
        Year-by-Year Breakdown
      </h3>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm" id="breakdown-table">
          <caption className="sr-only">Yearly SWP breakdown showing balance, withdrawals, and returns</caption>
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Year</th>
              <th scope="col" className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Bal.</th>
              <th scope="col" className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Withdrawn</th>
              <th scope="col" className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Returns</th>
              <th scope="col" className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">End Bal.</th>
              <th scope="col" className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cum. Drawn</th>
            </tr>
          </thead>
          <tbody>
            {yearlyRows.map((row) => (
              <tr
                key={row.year}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  row.isDepleted ? 'bg-red-50/50' : ''
                }`}
              >
                <td scope="row" className="py-3 px-3 font-semibold text-slate-700">
                  {row.year}
                  {row.isDepleted && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#da3832]/10 text-[#da3832]">
                      DEPLETED
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-600">₹{formatINR(row.startBalance)}</td>
                <td className="py-3 px-3 text-right font-mono text-amber-600">₹{formatINR(row.annualWithdrawal)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-600">₹{formatINR(row.annualReturns)}</td>
                <td className={`py-3 px-3 text-right font-mono font-semibold ${row.isDepleted ? 'text-[#da3832]' : 'text-slate-700'}`}>
                  ₹{formatINR(row.endBalance)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">₹{formatINR(row.cumulativeWithdrawn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {yearlyRows.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">No data to display. Adjust inputs above.</p>
        )}
      </div>
    </div>
  );
}
