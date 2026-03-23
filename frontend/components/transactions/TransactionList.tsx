"use client";

import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No transactions for this period.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Modality</TableHead>
          <TableHead>Account / Card</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{t.date}</TableCell>
            <TableCell>{t.notes || t.category.name}</TableCell>
            <TableCell className="capitalize">{t.type}</TableCell>
            <TableCell className="capitalize">{t.modality}</TableCell>
            <TableCell>{t.card?.name ?? t.bank_account?.name ?? "—"}</TableCell>
            <TableCell className={`text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
              {t.type === "income" ? "+" : "-"}
              <AmountDisplay amount={t.amount} />
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(t)}>Del</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
