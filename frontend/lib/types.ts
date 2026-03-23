export interface User {
  id: string;
  email: string;
}

export interface Card {
  id: string;
  bank_account_id: string;
  name: string;
  type: "credit" | "debit";
  created_at: string;
}

export interface BankAccount {
  id: string;
  name: string;
  cards: Card[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  archived_at: string | null;
  created_at: string;
}

export type TransactionType = "expense" | "income";
export type Modality = "dinheiro" | "debito" | "credito" | "pix" | "transferencia";

export interface Transaction {
  id: string;
  date: string;
  amount: string;
  type: TransactionType;
  category: Pick<Category, "id" | "name">;
  modality: Modality;
  bank_account: Pick<BankAccount, "id" | "name"> | null;
  card: Pick<Card, "id" | "name"> | null;
  recurring_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: string;
  type: TransactionType;
  category: Pick<Category, "id" | "name">;
  modality: Modality;
  bank_account: Pick<BankAccount, "id" | "name"> | null;
  card: Pick<Card, "id" | "name"> | null;
  due_day: number;
  active: boolean;
  created_at: string;
}

export interface MonthlyEstimate {
  id: string;
  category: Pick<Category, "id" | "name">;
  type: TransactionType;
  amount: string;
  year: number;
  month: number;
}

export interface BudgetAlert {
  category: Pick<Category, "id" | "name">;
  estimated: string;
  actual: string;
  over_budget: boolean;
}

export interface DashboardData {
  year: number;
  month: number;
  total_income: string;
  total_expenses: string;
  net_balance: string;
  recent_transactions: Pick<Transaction, "id" | "date" | "amount" | "type" | "category" | "modality">[];
  budget_alerts: BudgetAlert[];
}

export interface ReportRow {
  category: Pick<Category, "id" | "name">;
  estimated: string;
  actual: string;
  difference: string;
  over_budget: boolean;
}

export interface MonthlyReport {
  year: number;
  month: number;
  expenses: ReportRow[];
  income: ReportRow[];
  summary: {
    total_estimated_expenses: string;
    total_actual_expenses: string;
    total_estimated_income: string;
    total_actual_income: string;
  };
}
