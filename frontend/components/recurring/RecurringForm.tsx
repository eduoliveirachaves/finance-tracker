"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { BankAccount, Category, RecurringTransaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MODALITIES = ["dinheiro", "debito", "credito", "pix", "transferencia"] as const;

interface Props {
  initial?: RecurringTransaction;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function RecurringForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [type, setType] = useState<"expense" | "income">(initial?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initial?.category?.id ?? "");
  const [modality, setModality] = useState<string>(initial?.modality ?? "pix");
  const [dueDay, setDueDay] = useState(String(initial?.due_day ?? "1"));
  const [accountOrCard, setAccountOrCard] = useState<string>(
    initial?.card ? `card:${initial.card.id}` : initial?.bank_account ? `account:${initial.bank_account.id}` : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => get<Category[]>("/categories") });
  const { data: accounts = [] } = useQuery<BankAccount[]>({ queryKey: ["accounts"], queryFn: () => get<BankAccount[]>("/accounts") });

  const options: { label: string; value: string }[] = [];
  for (const acc of accounts) {
    options.push({ label: `🏦 ${acc.name}`, value: `account:${acc.id}` });
    for (const c of acc.cards) options.push({ label: `  💳 ${c.name}`, value: `card:${c.id}` });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const [kind, id] = accountOrCard.split(":");
      await onSubmit({
        name, amount, type, category_id: categoryId, modality, due_day: Number(dueDay),
        bank_account_id: kind === "account" ? id : null,
        card_id: kind === "card" ? id : null,
      });
    } catch (err: any) {
      setError(err.body?.detail ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Due Day (1–31)</Label>
          <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Modality</Label>
        <Select value={modality} onValueChange={setModality}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {MODALITIES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Account / Card</Label>
        <Select value={accountOrCard} onValueChange={setAccountOrCard}>
          <SelectTrigger><SelectValue placeholder="Select account or card" /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !categoryId || !accountOrCard}>Save</Button>
      </div>
    </form>
  );
}
