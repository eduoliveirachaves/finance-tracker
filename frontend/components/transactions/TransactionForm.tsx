"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { get, post, put } from "@/lib/api";
import type { BankAccount, Category, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MODALITIES = ["dinheiro", "debito", "credito", "pix", "transferencia"] as const;

interface Props {
  initial?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ initial, onSuccess, onCancel }: Props) {
  const isEdit = !!initial;
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [type, setType] = useState<"expense" | "income">(initial?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initial?.category?.id ?? "");
  const [modality, setModality] = useState<string>(initial?.modality ?? "pix");
  const [accountOrCard, setAccountOrCard] = useState<string>(
    initial?.card ? `card:${initial.card.id}` : initial?.bank_account ? `account:${initial.bank_account.id}` : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => get<Category[]>("/categories") });
  const { data: accounts = [] } = useQuery<BankAccount[]>({ queryKey: ["accounts"], queryFn: () => get<BankAccount[]>("/accounts") });

  // Build flat list of account + cards
  const options: { label: string; value: string }[] = [];
  for (const acc of accounts) {
    options.push({ label: `🏦 ${acc.name}`, value: `account:${acc.id}` });
    for (const c of acc.cards) {
      options.push({ label: `  💳 ${c.name} (${c.type})`, value: `card:${c.id}` });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const [kind, id] = accountOrCard.split(":");
      const body = {
        date,
        amount,
        type,
        category_id: categoryId,
        modality,
        bank_account_id: kind === "account" ? id : null,
        card_id: kind === "card" ? id : null,
        notes: notes || null,
      };
      if (isEdit) await put(`/transactions/${initial!.id}`, body);
      else await post("/transactions", body);
      onSuccess();
    } catch (err: any) {
      setError(err.body?.detail ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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

      <div className="space-y-1">
        <Label>Notes (optional)</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !categoryId || !accountOrCard}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
