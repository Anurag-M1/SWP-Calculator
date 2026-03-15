/**
 * InputPanel — Sliders, toggles, and inflation controls
 */
'use client';

import { SWPInputs, SWPMode } from '@/types/swp';
import { formatINR } from '@/lib/swpCalc';

interface InputPanelProps {
  inputs: SWPInputs;
  onCorpusChange: (v: number) => void;
  onWithdrawalChange: (v: number) => void;
  onAnnualReturnChange: (v: number) => void;
  onInflationAdjustedChange: (v: boolean) => void;
  onInflationRateChange: (v: number) => void;
  onSpecYearsChange: (v: number) => void;
}

function SliderInput({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  displayValue,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-sm font-bold text-[#224c87] bg-[#224c87]/5 px-3 py-1 rounded-lg" aria-live="polite">
          {displayValue}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="slider w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#224c87]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#224c87]
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#224c87]/30
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-[#224c87]/40 focus:ring-offset-2 rounded-lg"
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>{min}{unit === '%' ? '%' : ''}</span>
        <span>{max}{unit === '%' ? '%' : ''}</span>
      </div>
    </div>
  );
}

export default function InputPanel({
  inputs,
  onCorpusChange,
  onWithdrawalChange,
  onAnnualReturnChange,
  onInflationAdjustedChange,
  onInflationRateChange,
  onSpecYearsChange,
}: InputPanelProps) {
  return (
    <aside
      role="region"
      aria-label="Calculator inputs"
      className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 space-y-6"
    >
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-[#224c87]" />
        Inputs
      </h3>

      <SliderInput
        id="corpus-slider"
        label="Initial Corpus"
        value={inputs.corpus}
        min={100000}
        max={10000000}
        step={50000}
        displayValue={`₹${formatINR(inputs.corpus)}`}
        onChange={onCorpusChange}
      />

      <SliderInput
        id="withdrawal-slider"
        label="Monthly Withdrawal"
        value={inputs.withdrawal}
        min={1000}
        max={200000}
        step={1000}
        displayValue={`₹${formatINR(inputs.withdrawal)}`}
        onChange={onWithdrawalChange}
      />

      <SliderInput
        id="return-slider"
        label="Expected Annual Return"
        value={inputs.annualReturn}
        min={0}
        max={20}
        step={0.5}
        unit="%"
        displayValue={`${inputs.annualReturn}`}
        onChange={onAnnualReturnChange}
      />

      {inputs.mode === 'BALANCE' && (
        <SliderInput
          id="years-slider"
          label="Investment Period"
          value={inputs.specYears}
          min={1}
          max={40}
          step={1}
          unit="yrs"
          displayValue={`${inputs.specYears}`}
          onChange={onSpecYearsChange}
        />
      )}

      {/* Inflation Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label htmlFor="inflation-toggle" className="text-sm font-semibold text-slate-700">
            Inflation Step-Up
          </label>
          <button
            id="inflation-toggle"
            role="switch"
            aria-checked={inputs.inflationAdjusted}
            onClick={() => onInflationAdjustedChange(!inputs.inflationAdjusted)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#224c87]/40 focus:ring-offset-2 ${
              inputs.inflationAdjusted ? 'bg-[#224c87]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                inputs.inflationAdjusted ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {inputs.inflationAdjusted && (
          <div className="mt-4 animate-fadeIn">
            <SliderInput
              id="inflation-rate-slider"
              label="Annual Inflation Rate"
              value={inputs.inflationRate}
              min={0}
              max={15}
              step={0.5}
              unit="%"
              displayValue={`${inputs.inflationRate}`}
              onChange={onInflationRateChange}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
