import { AmountDisplay } from "@/components/shared/AmountDisplay";
import type { BudgetAlert } from "@/lib/types";

interface Props {
  alerts: BudgetAlert[];
}

export function BudgetAlertList({ alerts }: Props) {
  if (alerts.length === 0) {
    return <p className="text-sm text-slate-400">No over-budget categories this month.</p>;
  }
  return (
    <ul className="space-y-2">
      {alerts.map((a) => (
        <li key={a.category.id} className="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-4 py-2">
          <span className="font-medium">{a.category.name}</span>
          <span className="text-sm text-slate-600">
            Estimated <AmountDisplay amount={a.estimated} /> · Actual{" "}
            <AmountDisplay amount={a.actual} className="font-semibold text-red-600" />
          </span>
        </li>
      ))}
    </ul>
  );
}
