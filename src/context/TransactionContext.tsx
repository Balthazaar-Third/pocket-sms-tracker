
import React, { createContext, useState, useContext, useEffect } from "react";
import { Transaction, TransactionSummary, TransactionType } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";
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

  // Generate a simple hash for SMS message to avoid duplicates
  const generateSMSHash = (message: string): string => {
    return message.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  // Process SMS messages to extract transaction information
  const processSMS = (message: string): boolean => {
    console.log("Processing SMS:", message);
    
    if (!message || typeof message !== 'string') {
      console.error("Invalid SMS message:", message);
      return false;
    }
    
    try {
      // Check if this SMS has already been processed
      const smsHash = generateSMSHash(message);
      if (processedSMSHashes.has(smsHash)) {
        console.log("SMS already processed, skipping:", smsHash);
        toast({
          title: "Already Processed",
          description: "This SMS has already been processed",
        });
        return false;
      }

      // ====== Pattern detection for transactions ======
      
      // UPI-specific patterns
      const upiPattern = /(?:upi|paytm|phonepe|googlepay|gpay)/i;
      const isUpiRelated = upiPattern.test(message);
      
      // Direct amount patterns with stronger UPI emphasis
      
      // Pattern for UPI references
      const upiRefPattern = /(?:upi ref|upi id|txn id|ref no|upi-p2p)/i;
      const hasUpiRef = upiRefPattern.test(message);
      
      // Pattern 1: Amount with Rs/INR/₹
      const amountPattern = /(rs\.?|inr|₹)\s*([0-9,.]+)/i;
      
      // Pattern 2: Numbers followed by rs.
      const reverseAmountPattern = /([0-9,.]+)\s*(rs\.?|rupees|inr|₹)/i;
      
      // Transaction type indicators
      const creditTerms = /(credited|received|added|deposited|sent to you|paid to you|transferred to you)/i;
      const debitTerms = /(debited|paid|sent|deducted|withdrawn|spent)/i;
      
      let amountMatch = message.match(amountPattern) || message.match(reverseAmountPattern);
      let isCredit = creditTerms.test(message);
      let isDebit = debitTerms.test(message);
      
      // If it's neither clearly credit nor debit but mentions UPI, try to infer
      if (!isCredit && !isDebit && (isUpiRelated || hasUpiRef)) {
        // Check for patterns like "received", "from", "to", "paid"
        isCredit = /(?:received|from|credited to|added to)/i.test(message);
        isDebit = /(?:paid to|sent to|payment to|spent at)/i.test(message);
        
        // If still ambiguous, default based on common UPI message structures
        if (!isCredit && !isDebit) {
          // Messages that start with "Payment" are usually debits
          if (/^payment/i.test(message.trim())) {
            isDebit = true;
          }
          // Messages with "received" or "credited" are typically credits
          else if (/received|credited/i.test(message)) {
            isCredit = true;
          }
        }
      }
      
      // Simple numbers like "150 rs" without context
      if (!amountMatch) {
        const simpleAmount = /\b(\d+(?:\.\d+)?)\b/;
        const simpleMatch = message.match(simpleAmount);
        if (simpleMatch && (isUpiRelated || hasUpiRef)) {
          amountMatch = simpleMatch;
        }
      }
      
      if (amountMatch) {
        let amountStr;
        if (amountMatch === message.match(amountPattern)) {
          amountStr = amountMatch[2]; // Rs.150 format
        } else if (amountMatch === message.match(reverseAmountPattern)) {
          amountStr = amountMatch[1]; // 150 Rs format
        } else {
          amountStr = amountMatch[1]; // Simple number
        }
        
        // Clean and parse the amount
        const cleanAmount = amountStr.replace(/,/g, '');
        const amount = parseFloat(cleanAmount);
        
        if (isNaN(amount) || amount <= 0) {
          console.log("Invalid amount detected:", amountStr);
          return false;
        }
        
        // Determine the transaction type
        let type: TransactionType = "expense";
        if (isCredit) {
          type = "income";
        }
        
        // Extract description from the message
        let description = type === "income" ? "UPI Income" : "UPI Expense";
        
        // Look for entity names
        const entityPatterns = [
          /(?:from|by|received from)\s+([A-Za-z0-9\s&.]+?)(?:\s+via|\s+through|\s+using|\s+to|\s+on|$|\.|,)/i,
          /(?:to|at|for)\s+([A-Za-z0-9\s&.]+?)(?:\s+via|\s+through|\s+using|\s+from|\s+on|$|\.|,)/i,
          /(?:UPI ID:)\s+([a-zA-Z0-9@.]+)/i
        ];
        
        let entityName = "";
        
        for (const pattern of entityPatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            entityName = match[1].trim();
            break;
          }
        }
        
        // Fallback to UPI reference if no entity found
        if (!entityName) {
          const refMatch = message.match(/(?:ref|reference|txn|transaction|upi ref)(?:.*?)([A-Za-z0-9]+)/i);
          if (refMatch) {
            entityName = `Ref: ${refMatch[1]}`;
          }
        }
        
        if (entityName) {
          description = type === "income" 
            ? `From ${entityName}` 
            : `To ${entityName}`;
        }
        
        // Add UPI tag
        description += " (UPI)";
        
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
        
        // Mark this SMS as processed
        setProcessedSMSHashes((prev) => new Set([...prev, smsHash]));
        
        toast({
          title: "UPI Transaction Detected",
          description: `${description}: ₹${amount}`,
        });
        
        return true;
      }
      
      console.log("No transaction pattern detected in SMS");
      return false;
    } catch (error) {
      console.error("Error processing SMS:", error);
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
