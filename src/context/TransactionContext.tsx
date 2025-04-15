
import React, { createContext, useState, useContext, useEffect } from "react";
import { Transaction, TransactionSummary, TransactionType } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { processSMSMessage } from "@/services/smsProcessingService";

interface TransactionContextType {
  transactions: Transaction[];
  summary: TransactionSummary;
  addTransaction: (transaction: Omit<Transaction, "id" | "date" | "fromSMS">) => void;
  deleteTransaction: (id: string) => void;
  processSMS: (message: string) => boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [processedSMSHashes, setProcessedSMSHashes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load transactions from localStorage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    
    // Load processed SMS hashes
    const storedHashes = localStorage.getItem("processedSMSHashes");
    if (storedHashes) {
      setProcessedSMSHashes(new Set(JSON.parse(storedHashes)));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);
  
  // Save processed SMS hashes whenever they change
  useEffect(() => {
    localStorage.setItem("processedSMSHashes", JSON.stringify([...processedSMSHashes]));
  }, [processedSMSHashes]);

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
  const processSMS = (message: string): boolean => {
    // Ensure the message is not empty
    if (!message.trim()) {
      console.log("Empty message, skipping processing");
      return false;
    }
    
    console.log("Processing SMS in TransactionContext:", message);
    const { transaction, smsHash } = processSMSMessage(message);
    
    // Check if this SMS has already been processed
    if (processedSMSHashes.has(smsHash)) {
      console.log("SMS already processed, skipping:", smsHash);
      toast({
        title: "Already Processed",
        description: "This SMS has already been processed",
      });
      return false;
    }
    
    if (transaction) {
      setTransactions((prev) => [transaction, ...prev]);
      
      // Mark this SMS as processed
      setProcessedSMSHashes((prev) => new Set([...prev, smsHash]));
      
      toast({
        title: "Transaction Detected",
        description: `${transaction.description}: ₹${transaction.amount}`,
      });
      
      return true;
    } else {
      console.log("No transaction detected in SMS");
      return false;
    }
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
