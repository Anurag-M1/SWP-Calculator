/**
 * Main Calculator Page — Composes all components
 */
'use client';

import { useSWP } from '@/hooks/useSWP';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import InputPanel from '@/components/InputPanel';
import StatsRow from '@/components/StatsRow';
import CorpusChart from '@/components/CorpusChart';
import BreakdownTable from '@/components/BreakdownTable';
import AssumptionsBox from '@/components/AssumptionsBox';
import Disclaimer from '@/components/Disclaimer';

export default function Home() {
  const {
    inputs,
    result,
    setCorpus,
    setWithdrawal,
    setAnnualReturn,
    setInflationAdjusted,
    setInflationRate,
    setMode,
    setSpecYears,
  } = useSWP();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f9]">
      <Header mode={inputs.mode} onModeChange={setMode} />
      <Hero />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Depletion Warning Banner */}
        {result.depletionMonth !== null && (
          <div
            className="bg-[#da3832]/5 border border-[#da3832]/20 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#da3832]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#da3832" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#da3832]">Corpus Depletes!</p>
              <p className="text-xs text-[#da3832]/70">
                Your corpus may be fully withdrawn by month {result.depletionMonth} ({Math.floor(result.depletionMonth / 12)}y {result.depletionMonth % 12}m). Consider adjusting your withdrawal amount or expected returns.
              </p>
            </div>
          </div>
        )}

        {/* Input + Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel — Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <InputPanel
                inputs={inputs}
                onCorpusChange={setCorpus}
                onWithdrawalChange={setWithdrawal}
                onAnnualReturnChange={setAnnualReturn}
                onInflationAdjustedChange={setInflationAdjusted}
                onInflationRateChange={setInflationRate}
                onSpecYearsChange={setSpecYears}
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8 space-y-8">
            <StatsRow result={result} inputs={inputs} />
            <CorpusChart
              yearlyRows={result.yearlyRows}
              depletionMonth={result.depletionMonth}
              initialCorpus={inputs.corpus}
            />
            <BreakdownTable yearlyRows={result.yearlyRows} />
            <AssumptionsBox inputs={inputs} />
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
