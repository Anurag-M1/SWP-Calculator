/**
 * ============================================================
 * swpCalc.ts
 * Pure SWP Calculation Logic (no React — fully testable)
 * FinCal Innovation Hackathon · Technex '26
 * ============================================================
 *
 * Formula per hackathon spec:
 *   Monthly rate:       r  = annualReturn / 100 / 12
 *   Corpus at month n:  FV = PV × (1 + r)^n − W × [((1 + r)^n − 1) / r]
 *
 * Enhancement: inflation-adjusted withdrawals step up annually.
 * Implementation uses month-by-month iteration for accuracy.
 * ============================================================
 */

import {
  SWPInputs,
  SWPResult,
  MonthlyRow,
  YearlyRow,
} from '@/types/swp';

// Maximum simulation horizon: 40 years = 480 months
const MAX_MONTHS = 480;

/**
 * Convert annual return percentage to monthly decimal rate.
 * e.g. 12% annual → 0.01 monthly
 */
export function getMonthlyRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

/**
 * Core SWP calculation — runs a month-by-month simulation.
 *
 * Supports:
 *  - DURATION mode: finds how many months corpus lasts (up to 40 years)
 *  - BALANCE mode: shows remaining corpus after `specYears` years
 *  - Inflation step-up: annual increase in withdrawal at months 13, 25, 37…
 *  - Depletion detection: stops simulation when balance hits 0
 */
export function calculateSWP(inputs: SWPInputs): SWPResult {
  const { corpus, withdrawal, annualReturn, inflationAdjusted, inflationRate, mode, specYears } = inputs;

  const r = getMonthlyRate(annualReturn);

  // Handle special case: 0 years in BALANCE mode
  if (mode === 'BALANCE' && specYears === 0) {
    return {
      monthlyRows: [],
      yearlyRows: [],
      depletionMonth: null,
      finalBalance: corpus,
      totalWithdrawn: 0,
      totalReturnsEarned: 0,
      balanceAtTargetYear: corpus,
    };
  }

  const monthlyRows: MonthlyRow[] = [];
  let balance = corpus;
  let currentWithdrawal = withdrawal;
  let depletionMonth: number | null = null;
  let totalWithdrawn = 0;
  let totalReturnsEarned = 0;

  for (let month = 1; month <= MAX_MONTHS; month++) {
    // Inflation step-up: increase withdrawal at start of each new year (month 13, 25, 37…)
    if (inflationAdjusted && month > 1 && (month - 1) % 12 === 0) {
      currentWithdrawal = currentWithdrawal * (1 + inflationRate / 100);
    }

    // Calculate interest earned this month
    let interestEarned: number;
    if (r === 0) {
      interestEarned = 0;
    } else {
      interestEarned = balance * r;
    }

    // Apply interest
    balance = balance + interestEarned;

    // Determine actual withdrawal (may be less if balance insufficient)
    let actualWithdrawal = currentWithdrawal;
    if (balance <= currentWithdrawal) {
      // Corpus depleted this month
      actualWithdrawal = balance;
      balance = 0;
      depletionMonth = month;
    } else {
      balance = balance - currentWithdrawal;
    }

    totalWithdrawn += actualWithdrawal;
    totalReturnsEarned += interestEarned;

    monthlyRows.push({
      month,
      balance,
      withdrawal: actualWithdrawal > 0 ? currentWithdrawal : actualWithdrawal, // Record intended withdrawal for non-depleted months
      interestEarned,
    });

    // If depleted for the first time, record and stop
    if (depletionMonth !== null) {
      // Fix the last row's withdrawal to be the actual withdrawal
      monthlyRows[monthlyRows.length - 1].withdrawal = actualWithdrawal;
      break;
    }
  }

  // Build yearly aggregation
  const yearlyRows: YearlyRow[] = [];
  let cumulativeWithdrawn = 0;
  const totalYears = Math.ceil(monthlyRows.length / 12);

  for (let year = 1; year <= totalYears; year++) {
    const startIdx = (year - 1) * 12;
    const endIdx = Math.min(year * 12, monthlyRows.length);
    const yearMonths = monthlyRows.slice(startIdx, endIdx);

    if (yearMonths.length === 0) break;

    const startBalance = year === 1 ? corpus : yearlyRows[year - 2].endBalance;
    const endBalance = yearMonths[yearMonths.length - 1].balance;
    const annualWithdrawal = yearMonths.reduce((sum, row) => sum + row.withdrawal, 0);
    const annualReturns = yearMonths.reduce((sum, row) => sum + row.interestEarned, 0);
    cumulativeWithdrawn += annualWithdrawal;

    const isDepleted = depletionMonth !== null && depletionMonth <= year * 12 && depletionMonth > (year - 1) * 12;

    yearlyRows.push({
      year,
      startBalance,
      endBalance,
      annualWithdrawal,
      annualReturns,
      cumulativeWithdrawn,
      isDepleted,
    });
  }

  // Final balance
  const finalBalance = monthlyRows.length > 0 ? monthlyRows[monthlyRows.length - 1].balance : corpus;

  // Balance at target year (for BALANCE mode)
  let balanceAtTargetYear = 0;
  if (mode === 'BALANCE') {
    const targetMonth = specYears * 12;
    if (targetMonth <= monthlyRows.length) {
      balanceAtTargetYear = monthlyRows[targetMonth - 1].balance;
    } else {
      // Corpus depleted before target year
      balanceAtTargetYear = 0;
    }
  }

  return {
    monthlyRows,
    yearlyRows,
    depletionMonth,
    finalBalance,
    totalWithdrawn,
    totalReturnsEarned,
    balanceAtTargetYear,
  };
}

/**
 * Format a number using Indian convention.
 * ≥ 1 Cr → "X.XX Cr"
 * ≥ 1 L  → "X.XX L"
 * ≥ 1 K  → "X.X K"
 * < 1 K  → "X"
 * NaN/Infinity → "—"
 */
export function formatINR(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '—';

  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} K`;
  }

  // Sub-thousand: round to nearest integer
  const rounded = Math.round(value);
  if (rounded >= 1000) {
    // Edge case: 999.9 rounds to 1000
    return rounded.toLocaleString('en-IN');
  }
  return `${rounded}`;
}
