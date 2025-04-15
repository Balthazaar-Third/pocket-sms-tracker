
import React, { createContext, useState, useContext, useEffect } from "react";
import { Transaction, TransactionSummary, TransactionType } from "@/types/transaction";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

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
  const processSMS = (message: string): boolean => {
    console.log("Processing SMS:", message);
    
    // Check for bank credit/debit patterns - more comprehensive patterns
    // Pattern 1: Standard banking SMS with Rs/INR followed by amount
    const standardPattern = /(credited|debited|received|paid|sent|transfer|payment)(?:.*?)(Rs\.?|INR|₹)\s*([0-9,.]+)/i;
    
    // Pattern 2: Your A/c X6161-credited by Rs.150 format
    const accountPattern = /(?:A\/c|account)[\s\-]*[A-Z0-9]+[\s\-]*(credited|debited)(?:.*?)(Rs\.?|INR|₹)\s*([0-9,.]+)/i;
    
    // Try both patterns
    let match = message.match(standardPattern) || message.match(accountPattern);
    
    if (match) {
      // The amount could be in the third group of standardPattern or fourth group of accountPattern
      let amount = 0;
      let amountStr = match[3] ? match[3] : (match[3] ? match[3] : "0");
      // Remove commas and convert to number
      amount = parseFloat(amountStr.replace(/,/g, ''));
      
      if (isNaN(amount) || amount <= 0) {
        console.log("Invalid amount detected:", amountStr);
        return false;
      }
      
      // Determine if this is income or expense
      let type: TransactionType = "expense";
      const actionWord = match[1].toLowerCase();
      if (actionWord.includes("credit") || 
          actionWord.includes("receiv") || 
          actionWord.includes("transfer from")) {
        type = "income";
      }
      
      // Extract possible sender/receiver name
      let description = type === "income" ? "Income via SMS" : "Expense via SMS";
      
      // Look for sender/receiver name patterns
      const fromPattern = /(?:from|by|transfer from|received from)\s+([A-Za-z0-9\s]+)/i;
      const toPattern = /(?:to|towards|paid to|sent to)\s+([A-Za-z0-9\s]+)/i;
      
      const fromMatch = message.match(fromPattern);
      const toMatch = message.match(toPattern);
      
      if (type === "income" && fromMatch) {
        description = `From ${fromMatch[1].trim()}`;
      } else if (type === "expense" && toMatch) {
        description = `To ${toMatch[1].trim()}`;
      }
      
      // Extract reference number if present
      const refPattern = /(?:ref|reference|txn|transaction)(?:.*?)([A-Za-z0-9]+)/i;
      const refMatch = message.match(refPattern);
      
      if (refMatch) {
        description += ` (Ref: ${refMatch[1]})`;
      }
      
      console.log(`Detected transaction: ${type}, amount: ${amount}, description: ${description}`);
      
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
    
    console.log("No transaction pattern detected in SMS");
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
