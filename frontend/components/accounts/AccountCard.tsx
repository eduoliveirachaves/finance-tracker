"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardBadge } from "./CardBadge";
import type { BankAccount, Card as CardType } from "@/lib/types";

interface Props {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onAddCard: (account: BankAccount) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (card: CardType) => void;
}

export function AccountCard({ account, onEdit, onDelete, onAddCard, onEditCard, onDeleteCard }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle>{account.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(account)}>Edit</Button>
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(account)}>Delete</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {account.cards.map((c) => (
          <CardBadge key={c.id} card={c} onEdit={onEditCard} onDelete={onDeleteCard} />
        ))}
        <Button variant="outline" size="sm" className="mt-2" onClick={() => onAddCard(account)}>
          <Plus className="mr-1 h-3 w-3" /> Add card
        </Button>
      </CardContent>
    </Card>
  );
}
