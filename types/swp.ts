/**
 * TypeScript Interfaces — SWP Calculator
 * FinCal Innovation Hackathon · Technex '26
 */

/** Calculation mode */
export type SWPMode = 'DURATION' | 'BALANCE';

/** Inputs for the SWP calculation */
export interface SWPInputs {
  /** Initial investment corpus (₹) */
  corpus: number;
  /** Monthly withdrawal amount (₹) */
  withdrawal: number;
  /** Expected annual rate of return (%) */
  annualReturn: number;
  /** Whether to apply inflation step-up on withdrawals */
  inflationAdjusted: boolean;
  /** Annual inflation rate for step-up (%) */
  inflationRate: number;
  /** Calculation mode: DURATION finds how long corpus lasts; BALANCE shows remaining corpus after N years */
  mode: SWPMode;
  /** Number of years for BALANCE mode */
  specYears: number;
}

/** One month of SWP simulation data */
export interface MonthlyRow {
  /** Month number (1-indexed) */
  month: number;
  /** Remaining corpus at end of this month */
  balance: number;
  /** Withdrawal amount this month */
  withdrawal: number;
  /** Interest earned this month */
  interestEarned: number;
}

/** One year of aggregated SWP data */
export interface YearlyRow {
  /** Year number (1-indexed) */
  year: number;
  /** Corpus at start of this year */
  startBalance: number;
  /** Corpus at end of this year */
  endBalance: number;
  /** Total withdrawn during this year */
  annualWithdrawal: number;
  /** Total interest earned during this year */
  annualReturns: number;
  /** Cumulative amount withdrawn up to end of this year */
  cumulativeWithdrawn: number;
  /** Whether corpus was depleted during this year */
  isDepleted: boolean;
}

/** Full result set from calculateSWP */
export interface SWPResult {
  /** Month-by-month simulation rows */
  monthlyRows: MonthlyRow[];
  /** Year-by-year aggregated rows */
  yearlyRows: YearlyRow[];
  /** Month number at which corpus depleted (null if never) */
  depletionMonth: number | null;
  /** Remaining corpus at end of simulation */
  finalBalance: number;
  /** Total amount withdrawn over entire simulation */
  totalWithdrawn: number;
  /** Total interest/returns earned over entire simulation */
  totalReturnsEarned: number;
  /** Remaining corpus at end of specYears (BALANCE mode) */
  balanceAtTargetYear: number;
}
