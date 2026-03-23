"use client";

import { CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Card } from "@/lib/types";

interface Props {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

export function CardBadge({ card, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        {card.type === "credit" ? <CreditCard className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
        {card.name}
      </Badge>
      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs" onClick={() => onEdit(card)}>Edit</Button>
      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs text-red-500" onClick={() => onDelete(card)}>Del</Button>
    </div>
  );
}
