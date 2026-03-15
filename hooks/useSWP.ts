/**
 * useSWP — Custom React hook for SWP Calculator
 * Manages all input state and memoized calculation results.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { SWPInputs, SWPMode, SWPResult } from '@/types/swp';
import { calculateSWP } from '@/lib/swpCalc';

/** Default input values */
const DEFAULT_INPUTS: SWPInputs = {
  corpus: 2500000,       // ₹25 Lakh
  withdrawal: 15000,     // ₹15,000/month
  annualReturn: 8,       // 8% p.a.
  inflationAdjusted: false,
  inflationRate: 5,      // 5% default step-up
  mode: 'DURATION',
  specYears: 10,
};

export function useSWP() {
  const [inputs, setInputs] = useState<SWPInputs>(DEFAULT_INPUTS);

  // Memoized calculation — only recomputes when inputs change
  const result: SWPResult = useMemo(() => calculateSWP(inputs), [inputs]);

  // Individual setters for convenience
  const setCorpus = useCallback((corpus: number) => {
    setInputs(prev => ({ ...prev, corpus }));
  }, []);

  const setWithdrawal = useCallback((withdrawal: number) => {
    setInputs(prev => ({ ...prev, withdrawal }));
  }, []);

  const setAnnualReturn = useCallback((annualReturn: number) => {
    setInputs(prev => ({ ...prev, annualReturn }));
  }, []);

  const setInflationAdjusted = useCallback((inflationAdjusted: boolean) => {
    setInputs(prev => ({ ...prev, inflationAdjusted }));
  }, []);

  const setInflationRate = useCallback((inflationRate: number) => {
    setInputs(prev => ({ ...prev, inflationRate }));
  }, []);

  const setMode = useCallback((mode: SWPMode) => {
    setInputs(prev => ({ ...prev, mode }));
  }, []);

  const setSpecYears = useCallback((specYears: number) => {
    setInputs(prev => ({ ...prev, specYears }));
  }, []);

  return {
    inputs,
    result,
    setCorpus,
    setWithdrawal,
    setAnnualReturn,
    setInflationAdjusted,
    setInflationRate,
    setMode,
    setSpecYears,
  };
}
