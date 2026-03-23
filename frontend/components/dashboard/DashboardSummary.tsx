import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmountDisplay } from "@/components/shared/AmountDisplay";
import type { DashboardData } from "@/lib/types";

interface Props {
  data: Pick<DashboardData, "total_income" | "total_expenses" | "net_balance">;
}

export function DashboardSummary({ data }: Props) {
  const netPositive = Number(data.net_balance) >= 0;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <AmountDisplay amount={data.total_income} className="text-2xl font-bold text-green-600" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <AmountDisplay amount={data.total_expenses} className="text-2xl font-bold text-red-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Net Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <AmountDisplay
            amount={data.net_balance}
            className={`text-2xl font-bold ${netPositive ? "text-blue-600" : "text-red-500"}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
