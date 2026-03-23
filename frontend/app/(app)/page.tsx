"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { NetWorthOverview } from "@/components/dashboard/NetWorthOverview";
import { ActiveCards } from "@/components/dashboard/ActiveCards";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { MonthPicker } from "@/components/shared/MonthPicker";

const now = new Date();

export default function DashboardPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", year, month],
    queryFn: () => get<DashboardData>(`/dashboard?year=${year}&month=${month}`),
  });

  const totalBalance = data 
    ? parseFloat(data.net_balance) 
    : 1284092.45;

  return (
    <>
      <section className="flex-[3] flex flex-col h-full overflow-y-auto border-r border-[#1C1F2B] bg-background-dark p-8 gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-text-main">Dashboard Overview</h2>
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </div>
        
        <NetWorthOverview totalBalance={totalBalance} />
        <ActiveCards />
      </section>

      <LiveFeed transactions={data?.recent_transactions || []} isLoading={isLoading} />
    </>
  );
}
