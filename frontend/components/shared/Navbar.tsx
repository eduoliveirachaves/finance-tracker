"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  List,
  RefreshCw,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/accounts", label: "Accounts", icon: CreditCard },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/estimates", label: "Estimates", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: BarChart2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="p-4">
        <p className="text-sm font-semibold text-slate-800">Finance Manager</p>
      </div>

      <ul className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-slate-200 p-4">
        {user && <p className="mb-2 truncate text-xs text-slate-500">{user.email}</p>}
        <Button variant="outline" size="sm" className="w-full" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </nav>
  );
}
