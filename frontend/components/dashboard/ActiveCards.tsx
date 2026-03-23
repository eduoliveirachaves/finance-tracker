export function ActiveCards() {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-text-main font-bold text-lg">Active Cards</h3>
        <button className="text-muted hover:text-primary text-sm font-medium transition-colors cursor-pointer">View All</button>
      </div>

      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 pt-4 -mx-4 px-4">
        {/* Metal Card */}
        <div className="credit-card relative shrink-0 w-[320px] h-[200px] rounded-lg border border-[#2A2E3D] bg-gradient-to-br from-[#1A1D27] to-[#0A0C13] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden cursor-pointer group">
          <div className="absolute inset-0 bg-card-noise opacity-20 mix-blend-overlay"></div>
          <div className="card-glare"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="w-10 h-8 rounded bg-gradient-to-br from-[#D4AF37] via-[#FFF8DC] to-[#AA7C11] opacity-90 border border-[#FFF8DC]/30 relative overflow-hidden">
                <div className="absolute inset-0 border-[0.5px] border-[#000]/20 m-[2px] rounded-[2px]" />
                <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-[#000]/20" />
                <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-[#000]/20" />
              </div>
              <span className="material-symbols-outlined text-text-main/50">contactless</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted font-mono text-xs tracking-widest">**** **** **** 4092</div>
              <div className="flex justify-between items-end">
                <div className="text-text-main font-bold tracking-wider">A. REYNOLDS</div>
                <div className="text-xl font-bold italic tracking-tighter text-text-main/80">VISA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Virtual Card */}
        <div className="credit-card relative shrink-0 w-[320px] h-[200px] rounded-lg border border-accent/30 bg-gradient-to-br from-[#1F1235] to-[#0D0814] shadow-[0_20px_40px_-10px_rgba(176,38,255,0.1)] overflow-hidden cursor-pointer group">
          <div className="absolute inset-0 bg-card-noise opacity-10 mix-blend-overlay"></div>
          <div className="card-glare"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 rounded bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">Virtual</div>
              <span className="material-symbols-outlined text-text-main/50">language</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted font-mono text-xs tracking-widest">**** **** **** 8819</div>
              <div className="flex justify-between items-end">
                <div className="text-text-main font-bold tracking-wider">ONLINE SPEND</div>
                <div className="flex gap-1 relative">
                  <div className="w-4 h-4 rounded-full bg-[#EB001B] mix-blend-screen opacity-80 z-10"></div>
                  <div className="w-4 h-4 rounded-full bg-[#F79E1B] mix-blend-screen opacity-80 -ml-2 z-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Card */}
        <div className="shrink-0 w-[200px] h-[200px] rounded-lg border border-dashed border-[#1C1F2B] hover:border-primary/50 bg-surface/50 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
          <div className="size-10 rounded-full bg-surface border border-[#1C1F2B] flex items-center justify-center group-hover:shadow-glow-primary group-hover:border-primary transition-all">
            <span className="material-symbols-outlined text-muted group-hover:text-primary transition-colors">add</span>
          </div>
          <span className="text-sm font-medium text-muted group-hover:text-text-main transition-colors">New Card</span>
        </div>
      </div>
    </div>
  );
}
