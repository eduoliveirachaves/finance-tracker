"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "house" },
  { href: "/transactions", label: "Transactions", icon: "list_alt" },
  { href: "/accounts", label: "Accounts", icon: "credit_card" },
  { href: "/categories", label: "Categories", icon: "label" },
  { href: "/recurring", label: "Recurring", icon: "autorenew" },
  { href: "/estimates", label: "Estimates", icon: "today" },
  { href: "/reports", label: "Reports", icon: "bar_chart" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  return (
    <aside className="w-[250px] border-r border-[#1C1F2B] bg-background-dark hidden lg:flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-[#1C1F2B]">
        <div className="size-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shadow-glow-primary">
          <span className="material-symbols-outlined text-primary text-xl">terminal</span>
        </div>
        <h1 className="text-text-main text-xl font-bold tracking-tight">Finance</h1>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 mt-4 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          
          if (active) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-md bg-surface-hover border border-[#1C1F2B] text-primary shadow-inner-surface transition-colors group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md shadow-glow-primary"></div>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-muted hover:text-text-main hover:bg-surface border border-transparent hover:border-[#1C1F2B] transition-all group"
            >
              <span className="material-symbols-outlined group-hover:text-text-main transition-colors">{icon}</span>
              <span className="font-medium text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[#1C1F2B]">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-muted hover:text-danger hover:bg-surface border border-transparent hover:border-[#1C1F2B] transition-all group cursor-pointer"
        >
          <span className="material-symbols-outlined group-hover:text-danger transition-colors">logout</span>
          <span className="font-medium text-sm">Sign Out</span>
        </button>
        
        {user && (
          <Link href="/profile" className="mt-4 p-4 rounded-md bg-surface border border-[#1C1F2B] flex items-center gap-3 hover:border-primary/50 transition-colors group">
            <div className="w-10 h-10 rounded-full border border-[#1C1F2B] bg-surface-hover flex items-center justify-center text-primary font-bold shrink-0 group-hover:shadow-glow-primary transition-shadow">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-text-main truncate group-hover:text-primary transition-colors">{user.email?.split('@')[0]}</span>
              <span className="text-xs text-muted font-mono truncate">{user.email}</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
