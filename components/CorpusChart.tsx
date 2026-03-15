/**
 * CorpusChart — Chart.js area chart showing corpus over time
 */
'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { YearlyRow } from '@/types/swp';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface CorpusChartProps {
  yearlyRows: YearlyRow[];
  depletionMonth: number | null;
  initialCorpus: number;
}

export default function CorpusChart({ yearlyRows, depletionMonth, initialCorpus }: CorpusChartProps) {
  const chartData = useMemo(() => {
    const labels = ['Start', ...yearlyRows.map(r => `Year ${r.year}`)];
    const balances = [initialCorpus, ...yearlyRows.map(r => r.endBalance)];
    const withdrawals = [0, ...yearlyRows.map(r => r.cumulativeWithdrawn)];

    return {
      labels,
      datasets: [
        {
          label: 'Corpus Balance',
          data: balances,
          borderColor: '#224c87',
          backgroundColor: 'rgba(34, 76, 135, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#224c87',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Cumulative Withdrawn',
          data: withdrawals,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#f59e0b',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderDash: [6, 3],
        },
      ],
    };
  }, [yearlyRows, initialCorpus]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { family: 'Montserrat, system-ui, sans-serif', size: 12, weight: 600 as const },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Montserrat, system-ui, sans-serif', size: 13, weight: 600 as const },
        bodyFont: { family: 'Montserrat, system-ui, sans-serif', size: 12 },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: ₹${(value / 100000).toFixed(2)} L`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Montserrat, system-ui, sans-serif', size: 11 },
          color: '#94a3b8',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawTicks: false,
        },
        ticks: {
          font: { family: 'Montserrat, system-ui, sans-serif', size: 11 },
          color: '#94a3b8',
          padding: 8,
          callback: function(value: number | string) {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(0)} L`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)} K`;
            return `₹${num}`;
          },
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  }), []);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6"
      role="img"
      aria-label={`Corpus balance chart over ${yearlyRows.length} years${depletionMonth ? `, depleting at month ${depletionMonth}` : ''}`}
    >
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-[#224c87]" />
        Corpus Over Time
      </h3>
      <div className="h-[320px] sm:h-[380px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
