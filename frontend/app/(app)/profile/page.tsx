"use client";

import { useCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/auth";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div className="p-8 text-muted text-center h-full flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark p-8">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <header className="flex items-center gap-6 pb-8 border-b border-[#1C1F2B]">
          <div className="size-24 rounded-full bg-surface-hover border-2 border-primary/30 shadow-glow-primary flex items-center justify-center text-primary font-display text-4xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-text-main capitalize">
              {user?.email?.split('@')[0] || "User"}
            </h1>
            <p className="text-muted font-mono text-sm mt-1">Establishing wealth since {new Date().getFullYear()}.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-[#1C1F2B] rounded-lg p-6 space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">Email Address</span>
            <div className="text-lg text-text-main font-medium">{user?.email || "N/A"}</div>
          </div>
          <div className="bg-surface border border-[#1C1F2B] rounded-lg p-6 space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">Phone</span>
            <div className="text-lg text-text-main font-medium">+1 555 019 2834</div>
          </div>
          <div className="bg-surface border border-[#1C1F2B] rounded-lg p-6 space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">Tier</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="size-3 rounded-full bg-[#1C1F2B] border border-muted"></span>
              <span className="text-lg text-text-main font-medium">Black</span>
            </div>
          </div>
          <div className="bg-surface border border-[#1C1F2B] rounded-lg p-6 space-y-1">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">Primary Currency</span>
            <div className="text-lg text-text-main font-medium flex items-center gap-2">
              <span className="text-primary font-mono">$</span> USD
            </div>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[#1C1F2B] mt-8">
          <button className="flex-1 py-3 px-4 rounded-md bg-surface border border-[#1C1F2B] hover:border-primary/50 hover:bg-surface-hover hover:text-primary transition-all text-text-main font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-xl">edit</span>
            Edit Details
          </button>
          <button className="flex-1 py-3 px-4 rounded-md bg-surface border border-[#1C1F2B] hover:border-accent/50 hover:bg-surface-hover hover:text-accent hover:shadow-glow-accent transition-all text-text-main font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-xl">shield_person</span>
            Security
          </button>
          <button 
            onClick={() => logout()}
            className="flex-1 py-3 px-4 rounded-md bg-danger/10 border border-danger/30 hover:bg-danger/20 hover:text-danger hover:border-danger transition-all text-danger font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Log Out
          </button>
        </section>
      </div>
    </div>
  );
}
