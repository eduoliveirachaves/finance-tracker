interface AmountDisplayProps {
  amount: string | number;
  className?: string;
}

export function AmountDisplay({ amount, className }: AmountDisplayProps) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(amount));
  return <span className={className}>{formatted}</span>;
}
