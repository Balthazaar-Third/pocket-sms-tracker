
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  category?: string;
  date: string;
  fromSMS: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
