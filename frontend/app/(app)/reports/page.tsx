"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { MonthlyReport } from "@/lib/types";
import { MonthlyReportTable } from "@/components/reports/MonthlyReportTable";
import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const now = new Date();

export default function ReportsPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, error } = useQuery<MonthlyReport>({
    queryKey: ["reports", year, month],
    queryFn: () => get<MonthlyReport>(`/reports/monthly?year=${year}&month=${month}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Report</h1>
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      {error && <p className="text-red-500">Failed to load report</p>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm text-slate-500">Expenses</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated</span>
                  <AmountDisplay amount={data.summary.total_estimated_expenses} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual</span>
                  <AmountDisplay amount={data.summary.total_actual_expenses} className="font-semibold" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-slate-500">Income</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated</span>
                  <AmountDisplay amount={data.summary.total_estimated_income} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual</span>
                  <AmountDisplay amount={data.summary.total_actual_income} className="font-semibold" />
                </div>
              </CardContent>
            </Card>
          </div>

          <MonthlyReportTable rows={data.expenses} title="Expense Breakdown" />
          <MonthlyReportTable rows={data.income} title="Income Breakdown" />
        </>
      )}

      {!isLoading && !error && !data && (
        <p className="text-sm text-slate-400">No data available for this period.</p>
      )}
    </div>
  );
}
