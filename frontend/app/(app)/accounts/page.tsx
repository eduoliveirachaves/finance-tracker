"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { BankAccount, Card } from "@/lib/types";
import { AccountCard } from "@/components/accounts/AccountCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Mode = { type: "account_create" } | { type: "account_edit"; account: BankAccount } | { type: "card_create"; account: BankAccount } | { type: "card_edit"; card: Card } | null;

export default function AccountsPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>(null);
  const [name, setName] = useState("");
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");

  const { data: accounts = [], isLoading } = useQuery<BankAccount[]>({
    queryKey: ["accounts"],
    queryFn: () => get<BankAccount[]>("/accounts"),
  });

  function openDialog(m: Mode, defaultName = "", defaultType: "credit" | "debit" = "credit") {
    setMode(m);
    setName(defaultName);
    setCardType(defaultType);
  }

  const accountMutation = useMutation({
    mutationFn: async () => {
      if (!mode) return;
      if (mode.type === "account_create") return post("/accounts", { name });
      if (mode.type === "account_edit") return put(`/accounts/${mode.account.id}`, { name });
      if (mode.type === "card_create") return post(`/accounts/${mode.account.id}/cards`, { name, type: cardType });
      if (mode.type === "card_edit") return put(`/cards/${mode.card.id}`, { name, type: cardType });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); setMode(null); },
  });

  async function handleDelete(account: BankAccount) {
    if (!confirm(`Delete account "${account.name}"?`)) return;
    await del(`/accounts/${account.id}`);
    qc.invalidateQueries({ queryKey: ["accounts"] });
  }

  async function handleDeleteCard(card: Card) {
    if (!confirm(`Delete card "${card.name}"?`)) return;
    await del(`/cards/${card.id}`);
    qc.invalidateQueries({ queryKey: ["accounts"] });
  }

  const isCardMode = mode?.type === "card_create" || mode?.type === "card_edit";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bank Accounts</h1>
        <Button onClick={() => openDialog({ type: "account_create" })}>Add Account</Button>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <AccountCard
            key={a.id}
            account={a}
            onEdit={(acc) => openDialog({ type: "account_edit", account: acc }, acc.name)}
            onDelete={handleDelete}
            onAddCard={(acc) => openDialog({ type: "card_create", account: acc })}
            onEditCard={(c) => openDialog({ type: "card_edit", card: c }, c.name, c.type as "credit" | "debit")}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode?.type === "account_create" && "New Account"}
              {mode?.type === "account_edit" && "Edit Account"}
              {mode?.type === "card_create" && "New Card"}
              {mode?.type === "card_edit" && "Edit Card"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); accountMutation.mutate(); }}
          >
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            {isCardMode && (
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={cardType} onValueChange={(v) => setCardType(v as "credit" | "debit")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMode(null)}>Cancel</Button>
              <Button type="submit" disabled={accountMutation.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
