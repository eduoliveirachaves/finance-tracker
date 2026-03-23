import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportRow } from "@/lib/types";

interface Props {
  rows: ReportRow[];
  title: string;
}

export function MonthlyReportTable({ rows, title }: Props) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-sm text-slate-400">No data for this period.</p>
      </div>
    );
  }

  const totalEstimated = rows.reduce((sum, r) => sum + Number(r.estimated), 0);
  const totalActual = rows.reduce((sum, r) => sum + Number(r.actual), 0);
  const totalDiff = totalEstimated - totalActual;

  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Estimated</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.category.id}>
              <TableCell>{r.category.name}</TableCell>
              <TableCell className="text-right"><AmountDisplay amount={r.estimated} /></TableCell>
              <TableCell className="text-right"><AmountDisplay amount={r.actual} /></TableCell>
              <TableCell className={`text-right font-medium ${r.over_budget ? "bg-red-50 text-red-600" : "text-green-600"}`}>
                <AmountDisplay amount={r.difference} />
              </TableCell>
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow className="border-t-2 font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right"><AmountDisplay amount={totalEstimated} /></TableCell>
            <TableCell className="text-right"><AmountDisplay amount={totalActual} /></TableCell>
            <TableCell className={`text-right ${totalDiff < 0 ? "text-red-600" : "text-green-600"}`}>
              <AmountDisplay amount={totalDiff} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
