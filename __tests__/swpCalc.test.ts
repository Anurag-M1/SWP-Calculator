/**
 * ============================================================
 * swpCalc.test.ts
 * Jest Unit Tests — SWP Calculator Financial Logic
 * FinCal Innovation Hackathon · Technex '26
 * ============================================================
 *
 * Tests verify:
 *  1. Core SWP formula accuracy
 *  2. Corpus depletion detection
 *  3. Inflation step-up (enhancement)
 *  4. Both calculation modes (DURATION + BALANCE)
 *  5. Edge cases and boundary conditions
 *  6. Indian number formatting utility
 *  7. Yearly aggregation accuracy
 * ============================================================
 */

import {
  calculateSWP,
  formatINR,
  getMonthlyRate,
} from '@/lib/swpCalc';
import { SWPInputs } from '@/types/swp';

// ─── Test Precision Helper ───────────────────────────────────
// Financial calcs — allow ±1 rupee tolerance for rounding
const RUPEE_TOLERANCE = 1;
const expectNear = (received: number, expected: number, tolerance = RUPEE_TOLERANCE) => {
  expect(Math.abs(received - expected)).toBeLessThanOrEqual(tolerance);
};

// ─── Default test inputs ─────────────────────────────────────
const BASE_INPUTS: SWPInputs = {
  corpus: 2500000,        // ₹25 Lakh
  withdrawal: 15000,      // ₹15,000/month
  annualReturn: 8,        // 8% p.a.
  inflationAdjusted: false,
  inflationRate: 5,
  mode: 'DURATION',
  specYears: 10,
};

// ─────────────────────────────────────────────────────────────
// SUITE 1: Monthly Rate Calculation
// ─────────────────────────────────────────────────────────────
describe('getMonthlyRate()', () => {
  test('converts 12% annual to 1% monthly', () => {
    expect(getMonthlyRate(12)).toBeCloseTo(0.01, 6);
  });

  test('converts 8% annual correctly', () => {
    expect(getMonthlyRate(8)).toBeCloseTo(0.006667, 5);
  });

  test('converts 0% annual to 0 monthly', () => {
    expect(getMonthlyRate(0)).toBe(0);
  });

  test('handles fractional rates (8.5%)', () => {
    expect(getMonthlyRate(8.5)).toBeCloseTo(0.007083, 5);
  });
});

// ─────────────────────────────────────────────────────────────
// SUITE 2: Core SWP Formula Verification
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Core Formula', () => {

  test('month 1: corpus grows by interest then reduces by withdrawal', () => {
    const result = calculateSWP(BASE_INPUTS);
    const r = 8 / 100 / 12;
    const expectedMonth1Balance = 2500000 * (1 + r) - 15000;
    expectNear(result.monthlyRows[0].balance, expectedMonth1Balance, 2);
  });

  test('month 1: interest earned equals corpus × monthly rate', () => {
    const result = calculateSWP(BASE_INPUTS);
    const r = 8 / 100 / 12;
    const expectedInterest = 2500000 * r;
    expectNear(result.monthlyRows[0].interestEarned, expectedInterest, 2);
  });

  test('month 2: balance compounds from month 1 balance', () => {
    const result = calculateSWP(BASE_INPUTS);
    const r = 8 / 100 / 12;
    const m1Balance = result.monthlyRows[0].balance;
    const expectedM2Balance = m1Balance * (1 + r) - 15000;
    expectNear(result.monthlyRows[1].balance, expectedM2Balance, 2);
  });

  test('all monthly balances are non-negative', () => {
    const result = calculateSWP(BASE_INPUTS);
    result.monthlyRows.forEach(row => {
      expect(row.balance).toBeGreaterThanOrEqual(0);
    });
  });

  test('withdrawal amount stays constant when inflation toggle is OFF', () => {
    const result = calculateSWP({ ...BASE_INPUTS, inflationAdjusted: false });
    result.monthlyRows.forEach(row => {
      expect(row.withdrawal).toBe(15000);
    });
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 3: Corpus Depletion Detection
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Depletion Logic', () => {

  test('detects depletion when withdrawal far exceeds returns', () => {
    const aggressiveInputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 500000,      // ₹5 Lakh corpus
      withdrawal: 50000,   // ₹50K/month — will deplete fast
      annualReturn: 6,
    };
    const result = calculateSWP(aggressiveInputs);
    expect(result.depletionMonth).not.toBeNull();
    expect(result.depletionMonth).toBeLessThan(24); // depletes within 2 years
  });

  test('depletionMonth is null when corpus sustains full 40 years', () => {
    const conservativeInputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 10000000,    // ₹1 Cr
      withdrawal: 10000,   // ₹10K/month — minimal draw
      annualReturn: 10,
    };
    const result = calculateSWP(conservativeInputs);
    expect(result.depletionMonth).toBeNull();
  });

  test('balance is exactly 0 (not negative) at depletion month', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 300000,
      withdrawal: 30000,
      annualReturn: 4,
    };
    const result = calculateSWP(inputs);
    if (result.depletionMonth !== null) {
      const lastRow = result.monthlyRows[result.monthlyRows.length - 1];
      expect(lastRow.balance).toBe(0);
    }
  });

  test('no rows generated after depletion month', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 200000,
      withdrawal: 25000,
      annualReturn: 4,
    };
    const result = calculateSWP(inputs);
    if (result.depletionMonth !== null) {
      expect(result.monthlyRows.length).toBe(result.depletionMonth);
    }
  });

  test('corpus exactly sustaining (withdrawal = monthly return) never depletes', () => {
    // If W = PV × r exactly, corpus stays flat forever
    const corpus = 1800000;
    const r = 8 / 100 / 12;
    const breakEvenW = Math.floor(corpus * r); // floor to be slightly under
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus,
      withdrawal: breakEvenW,
      annualReturn: 8,
    };
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 4: Inflation-Adjusted Withdrawals (Enhancement)
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Inflation Step-Up Enhancement', () => {

  const inflationInputs: SWPInputs = {
    ...BASE_INPUTS,
    inflationAdjusted: true,
    inflationRate: 5,      // 5% annual step-up
  };

  test('withdrawal stays same in months 1–12 (year 1)', () => {
    const result = calculateSWP(inflationInputs);
    const year1Rows = result.monthlyRows.filter(r => r.month <= 12);
    year1Rows.forEach(row => {
      expectNear(row.withdrawal, 15000, 1);
    });
  });

  test('withdrawal increases at month 13 (start of year 2)', () => {
    const result = calculateSWP(inflationInputs);
    const month12W = result.monthlyRows[11].withdrawal;
    const month13W = result.monthlyRows[12].withdrawal;
    const expectedM13W = month12W * (1 + 5 / 100);
    expectNear(month13W, expectedM13W, 1);
  });

  test('withdrawal increases again at month 25 (start of year 3)', () => {
    const result = calculateSWP(inflationInputs);
    const month24W = result.monthlyRows[23].withdrawal;
    const month25W = result.monthlyRows[24].withdrawal;
    const expectedM25W = month24W * (1 + 5 / 100);
    expectNear(month25W, expectedM25W, 1);
  });

  test('year 3 withdrawal is year 1 × (1.05)^2', () => {
    const result = calculateSWP(inflationInputs);
    if (result.monthlyRows.length >= 25) {
      const year3W = result.monthlyRows[24].withdrawal;
      const expectedY3W = 15000 * Math.pow(1.05, 2);
      expectNear(year3W, expectedY3W, 2);
    }
  });

  test('inflation-adjusted corpus depletes faster than non-adjusted', () => {
    const noInflation = calculateSWP({ ...inflationInputs, inflationAdjusted: false });
    const withInflation = calculateSWP(inflationInputs);

    const noInflDepletion = noInflation.depletionMonth ?? 480;
    const withInflDepletion = withInflation.depletionMonth ?? 480;

    expect(withInflDepletion).toBeLessThanOrEqual(noInflDepletion);
  });

  test('inflation step-up of 0% equals no step-up', () => {
    const zeroStepUp = calculateSWP({ ...inflationInputs, inflationRate: 0 });
    const noStepUp = calculateSWP({ ...BASE_INPUTS, inflationAdjusted: false });

    expectNear(
      zeroStepUp.finalBalance,
      noStepUp.finalBalance,
      10 // allow small floating point drift
    );
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 5: BALANCE Mode (Corpus after N years)
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — BALANCE Mode', () => {

  test('returns correct balance at year 1 (month 12)', () => {
    const inputs: SWPInputs = { ...BASE_INPUTS, mode: 'BALANCE', specYears: 1 };
    const result = calculateSWP(inputs);
    const month12Balance = result.monthlyRows[11]?.balance ?? 0;
    expectNear(result.balanceAtTargetYear, month12Balance, 1);
  });

  test('returns correct balance at year 5 (month 60)', () => {
    const inputs: SWPInputs = { ...BASE_INPUTS, mode: 'BALANCE', specYears: 5 };
    const result = calculateSWP(inputs);
    const month60Balance = result.monthlyRows[59]?.balance ?? 0;
    expectNear(result.balanceAtTargetYear, month60Balance, 1);
  });

  test('returns 0 when corpus depletes before target year', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 200000,
      withdrawal: 30000,
      annualReturn: 4,
      mode: 'BALANCE',
      specYears: 20,
    };
    const result = calculateSWP(inputs);
    expect(result.balanceAtTargetYear).toBe(0);
  });

  test('balance decreases over time when withdrawal exceeds returns', () => {
    const yr5 = calculateSWP({ ...BASE_INPUTS, mode: 'BALANCE', specYears: 5 });
    const yr10 = calculateSWP({ ...BASE_INPUTS, mode: 'BALANCE', specYears: 10 });
    // With ₹25L corpus at 8% and ₹15K/month, corpus slowly grows
    // but for a case where withdrawal > returns, it should decline
    const decliningInputs = { ...BASE_INPUTS, annualReturn: 4 };
    const d5 = calculateSWP({ ...decliningInputs, mode: 'BALANCE', specYears: 5 });
    const d10 = calculateSWP({ ...decliningInputs, mode: 'BALANCE', specYears: 10 });
    expect(d10.balanceAtTargetYear).toBeLessThan(d5.balanceAtTargetYear);
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 6: Totals Accuracy
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Totals', () => {

  test('totalWithdrawn = sum of all monthly withdrawals', () => {
    const result = calculateSWP(BASE_INPUTS);
    const sumWithdrawn = result.monthlyRows.reduce((s, r) => s + r.withdrawal, 0);
    expectNear(result.totalWithdrawn, sumWithdrawn, 5);
  });

  test('totalReturnsEarned = sum of all monthly interest', () => {
    const result = calculateSWP(BASE_INPUTS);
    const sumReturns = result.monthlyRows.reduce((s, r) => s + r.interestEarned, 0);
    expectNear(result.totalReturnsEarned, sumReturns, 5);
  });

  test('financial identity: corpus + totalWithdrawn - totalReturns ≈ initial corpus', () => {
    // Conservation: finalBalance = initialCorpus + totalReturns - totalWithdrawn
    const result = calculateSWP(BASE_INPUTS);
    const reconstructed = BASE_INPUTS.corpus + result.totalReturnsEarned - result.totalWithdrawn;
    expectNear(result.finalBalance, reconstructed, 10);
  });

  test('totalWithdrawn > 0 when at least 1 withdrawal occurs', () => {
    const result = calculateSWP(BASE_INPUTS);
    expect(result.totalWithdrawn).toBeGreaterThan(0);
  });

  test('totalReturnsEarned > 0 when corpus > 0 and return > 0', () => {
    const result = calculateSWP(BASE_INPUTS);
    expect(result.totalReturnsEarned).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 7: Yearly Aggregation
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Yearly Rows', () => {

  test('year 1 annualWithdrawal = 12 × monthly withdrawal', () => {
    const result = calculateSWP(BASE_INPUTS);
    const yr1 = result.yearlyRows[0];
    expectNear(yr1.annualWithdrawal, 15000 * 12, 5);
  });

  test('year 1 annualReturns = sum of months 1–12 interest', () => {
    const result = calculateSWP(BASE_INPUTS);
    const yr1Returns = result.monthlyRows
      .slice(0, 12)
      .reduce((s, r) => s + r.interestEarned, 0);
    expectNear(result.yearlyRows[0].annualReturns, yr1Returns, 5);
  });

  test('year 1 endBalance = month 12 balance', () => {
    const result = calculateSWP(BASE_INPUTS);
    const month12Balance = result.monthlyRows[11].balance;
    expectNear(result.yearlyRows[0].endBalance, month12Balance, 1);
  });

  test('year N startBalance = year N-1 endBalance', () => {
    const result = calculateSWP(BASE_INPUTS);
    for (let i = 1; i < result.yearlyRows.length; i++) {
      expectNear(
        result.yearlyRows[i].startBalance,
        result.yearlyRows[i - 1].endBalance,
        2
      );
    }
  });

  test('cumulative withdrawn increases each year', () => {
    const result = calculateSWP(BASE_INPUTS);
    for (let i = 1; i < result.yearlyRows.length; i++) {
      expect(result.yearlyRows[i].cumulativeWithdrawn)
        .toBeGreaterThan(result.yearlyRows[i - 1].cumulativeWithdrawn);
    }
  });

  test('isDepleted flag set correctly on depletion year', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 300000,
      withdrawal: 20000,
      annualReturn: 4,
    };
    const result = calculateSWP(inputs);
    const depletedYears = result.yearlyRows.filter(r => r.isDepleted);
    if (result.depletionMonth !== null) {
      expect(depletedYears.length).toBeGreaterThanOrEqual(1);
      // Only the last year should be marked depleted
      expect(result.yearlyRows[result.yearlyRows.length - 1].isDepleted).toBe(true);
    }
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 8: Edge Cases & Boundary Conditions
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Edge Cases', () => {

  test('0% return: pure drawdown, no interest earned', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 360000,    // ₹3.6L
      withdrawal: 10000, // ₹10K/month
      annualReturn: 0,
    };
    const result = calculateSWP(inputs);
    // At 0% return, depletion = corpus / withdrawal = 36 months
    expect(result.depletionMonth).toBe(36);
    // Total interest should be near 0
    expectNear(result.totalReturnsEarned, 0, 1);
  });

  test('very high return rate keeps corpus alive indefinitely', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 2500000,
      withdrawal: 5000,   // tiny withdrawal
      annualReturn: 20,   // 20% return
    };
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBeNull();
    // Final balance should be >> initial corpus
    expect(result.finalBalance).toBeGreaterThan(inputs.corpus);
  });

  test('withdrawal equals exactly 1 rupee: corpus grows', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 1000000,
      withdrawal: 1,
      annualReturn: 8,
    };
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBeNull();
    expect(result.finalBalance).toBeGreaterThan(inputs.corpus);
  });

  test('maximum corpus (₹1 Cr) with minimum withdrawal (₹1000)', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 10000000,
      withdrawal: 1000,
      annualReturn: 8,
    };
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBeNull();
    expect(result.yearlyRows.length).toBe(40); // full 40-year model
  });

  test('specYears = 0 returns initial corpus (no withdrawals)', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      mode: 'BALANCE',
      specYears: 0,
    };
    const result = calculateSWP(inputs);
    // 0 years = no months passed = original corpus
    expect(result.balanceAtTargetYear).toBe(inputs.corpus);
  });

  test('handles very small corpus gracefully', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 1000,
      withdrawal: 15000,
    };
    // withdrawal >> corpus → depletion in month 1
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBe(1);
    expect(result.finalBalance).toBe(0);
  });

  test('produces no NaN or Infinity values in any row', () => {
    const result = calculateSWP(BASE_INPUTS);
    result.monthlyRows.forEach(row => {
      expect(isFinite(row.balance)).toBe(true);
      expect(isFinite(row.interestEarned)).toBe(true);
      expect(isNaN(row.balance)).toBe(false);
      expect(isNaN(row.interestEarned)).toBe(false);
    });
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 9: Known Reference Values
// (Cross-verified against manual calculation)
// ─────────────────────────────────────────────────────────────
describe('calculateSWP() — Known Reference Values', () => {

  /**
   * Reference: ₹10L corpus, ₹8K/month, 8% p.a.
   * Monthly rate r = 0.08/12 = 0.006667
   * Month 1 interest = 10,00,000 × 0.006667 = ₹6,667
   * Month 1 balance = 10,00,000 + 6,667 - 8,000 = ₹9,98,667
   */
  test('Reference A — Month 1 balance: ₹10L corpus, ₹8K/month, 8%', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 1000000,
      withdrawal: 8000,
      annualReturn: 8,
    };
    const result = calculateSWP(inputs);
    const expectedM1Balance = 1000000 * (1 + 8/100/12) - 8000;
    expectNear(result.monthlyRows[0].balance, expectedM1Balance, 1);
  });

  /**
   * Reference B: ₹5L corpus, ₹10K/month, 0% return
   * Should deplete in exactly 50 months
   */
  test('Reference B — Depletion at exactly 50 months: ₹5L, ₹10K, 0%', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 500000,
      withdrawal: 10000,
      annualReturn: 0,
    };
    const result = calculateSWP(inputs);
    expect(result.depletionMonth).toBe(50);
  });

  /**
   * Reference C: Break-even check
   * Corpus ₹12L, return 12% p.a. → monthly interest = 12,00,000 × 0.01 = ₹12,000
   * Withdrawal = ₹12,000 → corpus stays flat at ₹12L forever
   */
  test('Reference C — Break-even: withdrawal equals monthly return', () => {
    const corpus = 1200000;
    const r = 12 / 100 / 12; // = 0.01
    const breakEvenW = corpus * r; // = 12,000 exactly
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus,
      withdrawal: breakEvenW,
      annualReturn: 12,
    };
    const result = calculateSWP(inputs);
    // Corpus should remain near ₹12L throughout
    expect(result.depletionMonth).toBeNull();
    expectNear(result.finalBalance, corpus, 100); // within ₹100 of original
  });

  /**
   * Reference D: Inflation step-up verification
   * ₹10K/month, 5% step-up
   * Year 2 monthly withdrawal = 10000 × 1.05 = ₹10,500
   * Year 3 monthly withdrawal = 10500 × 1.05 = ₹11,025
   */
  test('Reference D — Inflation step-up: ₹10K at 5% step-up', () => {
    const inputs: SWPInputs = {
      ...BASE_INPUTS,
      corpus: 5000000,
      withdrawal: 10000,
      annualReturn: 8,
      inflationAdjusted: true,
      inflationRate: 5,
    };
    const result = calculateSWP(inputs);
    expectNear(result.monthlyRows[12].withdrawal, 10500, 1);  // month 13 = year 2
    expectNear(result.monthlyRows[24].withdrawal, 11025, 1);  // month 25 = year 3
  });

});

// ─────────────────────────────────────────────────────────────
// SUITE 10: formatINR() Utility
// ─────────────────────────────────────────────────────────────
describe('formatINR()', () => {

  test('formats crores correctly', () => {
    expect(formatINR(10000000)).toBe('1.00 Cr');
    expect(formatINR(25000000)).toBe('2.50 Cr');
    expect(formatINR(100000000)).toBe('10.00 Cr');
  });

  test('formats lakhs correctly', () => {
    expect(formatINR(100000)).toBe('1.00 L');
    expect(formatINR(2500000)).toBe('25.00 L');
    expect(formatINR(9900000)).toBe('99.00 L');
  });

  test('formats thousands correctly', () => {
    expect(formatINR(15000)).toBe('15.0 K');
    expect(formatINR(1000)).toBe('1.0 K');
  });

  test('formats sub-thousand amounts', () => {
    expect(formatINR(500)).toBe('500');
    expect(formatINR(0)).toBe('0');
  });

  test('returns — for NaN', () => {
    expect(formatINR(NaN)).toBe('—');
  });

  test('returns — for Infinity', () => {
    expect(formatINR(Infinity)).toBe('—');
    expect(formatINR(-Infinity)).toBe('—');
  });

  test('rounds sub-thousand to nearest integer', () => {
    expect(formatINR(999.9)).toBe('1,000');
  });

});
