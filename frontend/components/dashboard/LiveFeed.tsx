import type { Transaction } from "@/lib/types";

// This is an extended type matching the specific transaction signature from the old code if needed.
// However `DashboardData` might just use `Transaction` base type. 

export function LiveFeed({ transactions, isLoading }: { transactions: any[]; isLoading?: boolean }) {
  return (
    <aside className="flex-[2] bg-surface flex flex-col h-full border-l border-[#1C1F2B]">
      <div className="p-6 border-b border-[#1C1F2B] flex justify-between items-center bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <h3 className="text-text-main font-bold text-lg">Live Feed</h3>
        <button className="size-8 rounded border border-[#1C1F2B] hover:bg-surface-hover flex items-center justify-center text-muted hover:text-text-main transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">filter_list</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative">
        {isLoading && <p className="text-muted absolute inset-0 flex items-center justify-center">Loading transactions...</p>}
        {!isLoading && transactions.length === 0 && (
          <p className="text-muted absolute inset-0 flex items-center justify-center">No transactions yet.</p>
        )}

        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          const Icon = tx.category?.name?.toLowerCase().includes("food") ? "local_cafe" :
                       tx.category?.name?.toLowerCase().includes("travel") ? "flight" :
                       tx.category?.name?.toLowerCase().includes("transportation") ? "directions_car" :
                       isIncome ? "arrow_downward" : "shopping_bag";

          return (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-md hover:bg-surface-hover transition-colors group cursor-default">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-full border flex items-center justify-center overflow-hidden shrink-0 ${isIncome ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-[#0A0C13] border-[#1C1F2B] text-text-main'}`}>
                  <span className="material-symbols-outlined text-lg">{Icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-text-main truncate pr-2">{tx.category?.name || "Uncategorized"}</span>
                  <span className="text-xs text-muted truncate">{tx.date} • {tx.modality}</span>
                </div>
              </div>
              <div className={`font-mono text-sm font-medium transition-colors shrink-0 ${isIncome ? 'text-primary' : 'text-text-main group-hover:text-danger'}`}>
                {isIncome ? "+" : "-"}${Number(tx.amount).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#1C1F2B] bg-surface">
        <button className="w-full py-2 text-sm text-muted hover:text-text-main transition-colors font-medium border border-transparent hover:border-[#1C1F2B] rounded cursor-pointer">
          View Complete Ledger
        </button>
      </div>
    </aside>
  );
}
