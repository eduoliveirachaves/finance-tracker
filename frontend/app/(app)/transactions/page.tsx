"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get } from "@/lib/api";
import type { Category, Transaction } from "@/lib/types";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const now = new Date();

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", year, month, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year), month: String(month) });
      if (categoryFilter && categoryFilter !== "all") params.set("category_id", categoryFilter);
      return get<Transaction[]>(`/transactions?${params}`);
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => get<Category[]>("/categories"),
  });

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(t: Transaction) { setEditing(t); setDialogOpen(true); }

  async function handleDelete(t: Transaction) {
    if (!confirm("Delete this transaction?")) return;
    await del(`/transactions/${t.id}`);
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  function onSuccess() {
    setDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
          <Button onClick={openAdd}>+ Add</Button>
        </div>
      </div>

      {isLoading ? <p className="text-slate-400">Loading…</p> : (
        <TransactionList transactions={transactions} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Transaction" : "New Transaction"}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            initial={editing}
            onSuccess={onSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
