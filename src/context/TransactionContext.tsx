
import React, { createContext, useState, useContext, useEffect } from "react";
import { Transaction, TransactionSummary, TransactionType } from "@/types/transaction";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

interface TransactionContextType {
  transactions: Transaction[];
  summary: TransactionSummary;
  addTransaction: (transaction: Omit<Transaction, "id" | "date" | "fromSMS">) => void;
  deleteTransaction: (id: string) => void;
  processSMS: (message: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  // Load transactions from localStorage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Calculate summary
  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  const addTransaction = (
    transactionData: Omit<Transaction, "id" | "date" | "fromSMS">
  ) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: uuidv4(),
      date: new Date().toISOString(),
      fromSMS: false,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    
    toast({
      title: `${transactionData.type === "income" ? "Income" : "Expense"} Added`,
      description: `${transactionData.description}: ₹${transactionData.amount}`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed",
    });
  };

  // Process SMS messages to extract transaction information
  const processSMS = (message: string) => {
    // Check if this is a UPI transaction message
    const upiRegex = /(?:paid|received|debited|credited).*(Rs\.|INR|₹)\s*(\d+(\.\d+)?)/i;
    const match = message.match(upiRegex);

    if (match) {
      const amount = parseFloat(match[2]);
      
      // Determine if this is income or expense
      let type: TransactionType = "expense";
      if (message.toLowerCase().includes("received") || 
          message.toLowerCase().includes("credited")) {
        type = "income";
      }
      
      // Extract possible merchant/sender name
      let description = "UPI Transaction";
      const fromRegex = /from\s+([A-Za-z0-9\s]+)/i;
      const toRegex = /to\s+([A-Za-z0-9\s]+)/i;
      
      const fromMatch = message.match(fromRegex);
      const toMatch = message.match(toRegex);
      
      if (type === "income" && fromMatch) {
        description = `From ${fromMatch[1].trim()}`;
      } else if (type === "expense" && toMatch) {
        description = `To ${toMatch[1].trim()}`;
      }
      
      const newTransaction: Transaction = {
        id: uuidv4(),
        amount,
        description,
        type,
        date: new Date().toISOString(),
        fromSMS: true,
      };
      
      setTransactions((prev) => [newTransaction, ...prev]);
      
      toast({
        title: "SMS Transaction Detected",
        description: `${description}: ₹${amount}`,
      });
      
      return true;
    }
    
    return false;
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        summary,
        addTransaction,
        deleteTransaction,
        processSMS,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
