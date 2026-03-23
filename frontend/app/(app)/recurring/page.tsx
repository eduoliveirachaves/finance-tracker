"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put } from "@/lib/api";
import type { RecurringTransaction } from "@/lib/types";
import { RecurringForm } from "@/components/recurring/RecurringForm";
import { AmountDisplay } from "@/components/shared/AmountDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function RecurringPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | undefined>();

  const { data: items = [], isLoading } = useQuery<RecurringTransaction[]>({
    queryKey: ["recurring"],
    queryFn: () => get<RecurringTransaction[]>("/recurring"),
  });

  const active = items.filter((r) => r.active);
  const inactive = items.filter((r) => !r.active);

  async function handleSubmit(data: Record<string, unknown>) {
    if (editing) await put(`/recurring/${editing.id}`, data);
    else await post("/recurring", data);
    qc.invalidateQueries({ queryKey: ["recurring"] });
    setDialogOpen(false);
  }

  async function handleToggle(r: RecurringTransaction) {
    await put(`/recurring/${r.id}`, { active: !r.active });
    qc.invalidateQueries({ queryKey: ["recurring"] });
  }

  async function handleDelete(r: RecurringTransaction) {
    if (!confirm(`Delete recurring "${r.name}"? Generated transactions are kept.`)) return;
    await del(`/recurring/${r.id}`);
    qc.invalidateQueries({ queryKey: ["recurring"] });
  }

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(r: RecurringTransaction) { setEditing(r); setDialogOpen(true); }

  function RecurringRow({ r }: { r: RecurringTransaction }) {
    return (
      <li className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-2">
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-slate-500">
            {r.category.name} · {r.modality} · day {r.due_day} ·{" "}
            <span className={r.type === "income" ? "text-green-600" : "text-red-500"}>
              <AmountDisplay amount={r.amount} />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={r.active ? "success" : "secondary"}>{r.active ? "Active" : "Inactive"}</Badge>
          <Button variant="ghost" size="sm" onClick={() => handleToggle(r)}>
            {r.active ? "Disable" : "Enable"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(r)}>Delete</Button>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <Button onClick={openAdd}>New Recurring</Button>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      <section>
        <h2 className="mb-3 font-semibold">Active</h2>
        {active.length === 0 && <p className="text-sm text-slate-400">No active recurring transactions.</p>}
        <ul className="space-y-2">{active.map((r) => <RecurringRow key={r.id} r={r} />)}</ul>
      </section>

      {inactive.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="mb-3 font-semibold text-slate-500">Inactive</h2>
            <ul className="space-y-2">{inactive.map((r) => <RecurringRow key={r.id} r={r} />)}</ul>
          </section>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Recurring" : "New Recurring Transaction"}</DialogTitle>
          </DialogHeader>
          <RecurringForm initial={editing} onSubmit={handleSubmit} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
