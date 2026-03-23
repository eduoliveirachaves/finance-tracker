export function NetWorthOverview({ totalBalance }: { totalBalance: number }) {
  const formattedWhole = Math.floor(totalBalance).toLocaleString("en-US");
  const formattedFraction = (totalBalance % 1).toFixed(2).substring(1); // .xx

  return (
    <>
      <header className="flex flex-col gap-6 relative">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-muted text-sm uppercase tracking-widest font-bold mb-2">Total Net Worth</p>
            <h2 className="text-5xl font-mono text-text-main flex items-baseline gap-2">
              <span className="text-muted">$</span>{formattedWhole}<span className="text-primary text-2xl">{formattedFraction}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 border border-primary/20 text-primary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="font-mono text-sm font-medium">+12.4%</span>
          </div>
        </div>

        <div className="h-24 w-full relative -mx-2">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-xl"></div>
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100" xmlns="http://www.w3.org/2000/svg">
            <path className="sparkline-path" d="M0 80 Q 50 70, 100 85 T 200 60 T 300 75 T 400 40 T 500 55 T 600 20 T 700 45 T 800 10 T 900 30 T 1000 5" stroke="#00FF94" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M0 80 Q 50 70, 100 85 T 200 60 T 300 75 T 400 40 T 500 55 T 600 20 T 700 45 T 800 10 T 900 30 T 1000 5 L 1000 100 L 0 100 Z" fill="url(#sparkline-gradient)" opacity="0.2"></path>
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00FF94" stopOpacity="0.5"></stop>
                <stop offset="100%" stopColor="#00FF94" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>

      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-surface border border-[#1C1F2B] hover:border-primary/50 hover:bg-surface-hover hover:shadow-glow-primary transition-all text-text-main font-medium group cursor-pointer">
          <span className="material-symbols-outlined text-primary shadow-[0_0_10px_#00FF94] group-hover:scale-110 transition-transform">arrow_upward</span>
          Send
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-surface border border-[#1C1F2B] hover:border-primary/50 hover:bg-surface-hover hover:shadow-glow-primary transition-all text-text-main font-medium group cursor-pointer">
          <span className="material-symbols-outlined text-primary shadow-[0_0_10px_#00FF94] group-hover:scale-110 transition-transform">arrow_downward</span>
          Receive
        </button>
        <button className="flex-[1.5] flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-primary text-[#090A0F] border border-primary hover:bg-[#00e685] hover:shadow-glow-primary transition-all font-bold cursor-pointer">
          <span className="material-symbols-outlined">add</span>
          Add Funds
        </button>
      </div>
    </>
  );
}
