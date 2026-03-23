"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  year: number;
  month: number;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function EstimateForm({ year, month, onSubmit, onCancel }: Props) {
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => get<Category[]>("/categories"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ category_id: categoryId, type, amount, year, month });
    } catch (err: any) {
      setError(err.body?.detail ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label>Amount</Label>
        <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !categoryId || !amount}>Save</Button>
      </div>
    </form>
  );
}
