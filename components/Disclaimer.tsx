/**
 * Disclaimer — Mandatory HDFC compliance notice
 */
export default function Disclaimer() {
  return (
    <footer
      role="contentinfo"
      className="bg-slate-50 border-t border-slate-200/60 py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#da3832]/10 flex items-center justify-center mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#da3832" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#da3832] mb-2">Important Disclaimer</h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
          FinCal Innovation Hackathon · Technex &apos;26 · Investor Education &amp; Awareness Initiative
        </p>
      </div>
    </footer>
  );
}
