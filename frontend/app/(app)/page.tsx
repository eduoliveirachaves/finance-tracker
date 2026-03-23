"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { BudgetAlertList } from "@/components/dashboard/BudgetAlertList";
import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { MonthPicker } from "@/components/shared/MonthPicker";

const now = new Date();

export default function DashboardPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard", year, month],
    queryFn: () => get<DashboardData>(`/dashboard?year=${year}&month=${month}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      {error && <p className="text-red-500">Failed to load dashboard</p>}
      {data && (
        <>
          <DashboardSummary data={data} />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Recent Transactions</h2>
            {data.recent_transactions.length === 0 ? (
              <p className="text-sm text-slate-400">No transactions yet. Add your first transaction to get started.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Category</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Modality</th>
                      <th className="px-4 py-2 text-right font-medium text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100">
                        <td className="px-4 py-2">{t.date}</td>
                        <td className="px-4 py-2">{t.category.name}</td>
                        <td className="px-4 py-2 capitalize">{t.modality}</td>
                        <td className={`px-4 py-2 text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "-"}<AmountDisplay amount={t.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Budget Alerts</h2>
            <BudgetAlertList alerts={data.budget_alerts} />
          </section>
        </>
      )}
    </div>
  );
}
