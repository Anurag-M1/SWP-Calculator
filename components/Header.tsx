/**
 * Header — Sticky header with HDFC branding & mode toggle
 */
'use client';

import { SWPMode } from '@/types/swp';

interface HeaderProps {
  mode: SWPMode;
  onModeChange: (mode: SWPMode) => void;
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#224c87] focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#224c87]"
      >
        Skip to main content
      </a>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#224c87] to-[#3a6dba] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20M5.5 5.5l13 13M18.5 5.5l-13 13" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#224c87] leading-tight tracking-tight">
                SWP Calculator
              </h1>
              <p className="text-[10px] text-[#919090] font-medium tracking-wider uppercase">
                FinCal Innovation · Technex &apos;26
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1" role="group" aria-label="Calculation mode">
            <button
              onClick={() => onModeChange('DURATION')}
              aria-pressed={mode === 'DURATION'}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'DURATION'
                  ? 'bg-[#224c87] text-white shadow-md shadow-[#224c87]/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              id="mode-duration-btn"
            >
              Duration
            </button>
            <button
              onClick={() => onModeChange('BALANCE')}
              aria-pressed={mode === 'BALANCE'}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'BALANCE'
                  ? 'bg-[#224c87] text-white shadow-md shadow-[#224c87]/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              id="mode-balance-btn"
            >
              Balance
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
