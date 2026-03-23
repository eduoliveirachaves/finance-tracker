"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put } from "@/lib/api";
import type { MonthlyEstimate } from "@/lib/types";
import { EstimateForm } from "@/components/estimates/EstimateForm";
import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const now = new Date();

export default function EstimatesPage() {
  const qc = useQueryClient();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const { data: estimates = [], isLoading } = useQuery<MonthlyEstimate[]>({
    queryKey: ["estimates", year, month],
    queryFn: () => get<MonthlyEstimate[]>(`/estimates?year=${year}&month=${month}`),
  });

  const expenses = estimates.filter((e) => e.type === "expense");
  const income = estimates.filter((e) => e.type === "income");

  async function handleCreate(data: Record<string, unknown>) {
    await post("/estimates", data);
    qc.invalidateQueries({ queryKey: ["estimates"] });
    setAddOpen(false);
  }

  async function handleUpdate(id: string) {
    await put(`/estimates/${id}`, { amount: editAmount });
    qc.invalidateQueries({ queryKey: ["estimates"] });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this estimate?")) return;
    await del(`/estimates/${id}`);
    qc.invalidateQueries({ queryKey: ["estimates"] });
  }

  function EstimateRows({ rows }: { rows: MonthlyEstimate[] }) {
    if (rows.length === 0) return <TableRow><TableCell colSpan={3} className="text-center text-slate-400">None</TableCell></TableRow>;
    return (
      <>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.category.name}</TableCell>
            <TableCell>
              {editingId === e.id ? (
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.01" min="0" value={editAmount} onChange={(ev) => setEditAmount(ev.target.value)} className="w-28" />
                  <Button size="sm" onClick={() => handleUpdate(e.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <AmountDisplay amount={e.amount} />
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(e.id); setEditAmount(e.amount); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(e.id)}>Del</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Estimates</h1>
        <div className="flex items-center gap-3">
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
          <Button onClick={() => setAddOpen(true)}>Add Estimate</Button>
        </div>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      <section>
        <h2 className="mb-2 font-semibold">Expense Estimates</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody><EstimateRows rows={expenses} /></TableBody>
        </Table>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Income Estimates</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody><EstimateRows rows={income} /></TableBody>
        </Table>
      </section>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Estimate</DialogTitle></DialogHeader>
          <EstimateForm year={year} month={month} onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
