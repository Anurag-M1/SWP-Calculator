/**
 * Hero — Intro banner with educational messaging
 */
'use client';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#224c87] via-[#2d5a9e] to-[#3a6dba] text-white py-12 sm:py-16">
      {/* Abstract decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Investor Education &amp; Awareness
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          Systematic Withdrawal Plan
          <span className="block text-white/80 text-xl sm:text-2xl lg:text-3xl font-semibold mt-2">
            Calculator
          </span>
        </h2>
        <p className="max-w-2xl mx-auto text-white/70 text-base sm:text-lg leading-relaxed">
          Understand how long your investment corpus may last under regular monthly withdrawals.
          Adjust assumptions, explore scenarios, and plan with confidence.
        </p>
      </div>
    </section>
  );
}
