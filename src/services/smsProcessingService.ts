
import { Transaction, TransactionType } from "@/types/transaction";
import { v4 as uuidv4 } from "uuid";
import { 
  generateSMSHash, 
  extractAmount, 
  determineTransactionType, 
  extractEntityName 
} from "@/utils/smsProcessingUtils";

interface ProcessSMSResult {
  transaction: Transaction | null;
  smsHash: string;
}

export const processSMSMessage = (message: string): ProcessSMSResult => {
  console.log("Processing SMS:", message);
  
  if (!message || typeof message !== 'string') {
    console.error("Invalid SMS message:", message);
    return { transaction: null, smsHash: '' };
  }
  
  // Generate hash for duplicate checking
  const smsHash = generateSMSHash(message);
  
  try {
    // ====== Pattern detection for transactions ======
    
    // UPI-specific patterns
    const upiPattern = /(?:upi|paytm|phonepe|googlepay|gpay)/i;
    const isUpiRelated = upiPattern.test(message);
    
    // Pattern for UPI references
    const upiRefPattern = /(?:upi ref|upi id|txn id|ref no|upi-p2p)/i;
    const hasUpiRef = upiRefPattern.test(message);
    
    // If not related to UPI or financial transaction, skip further processing
    if (!isUpiRelated && !hasUpiRef && !/(?:credited|debited|paid|received|transferred|payment)/i.test(message)) {
      console.log("Message doesn't appear to be a financial transaction");
      return { transaction: null, smsHash };
    }
    
    // Extract amount
    const amountInfo = extractAmount(message);
    if (!amountInfo) {
      console.log("No valid amount detected in SMS");
      return { transaction: null, smsHash };
    }
    
    // Determine transaction type
    const type = determineTransactionType(message);
    if (!type) {
      console.log("Couldn't determine transaction type");
      return { transaction: null, smsHash };
    }
    
    // Extract description
    let description = extractEntityName(message, type);
    
    // Add UPI tag
    description += " (UPI)";
    
    console.log(`Detected transaction: ${type}, amount: ${amountInfo.amount}, description: ${description}`);
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      amount: amountInfo.amount,
      description,
      type,
      date: new Date().toISOString(),
      fromSMS: true,
    };
    
    return { transaction: newTransaction, smsHash };
  } catch (error) {
    console.error("Error processing SMS:", error);
    return { transaction: null, smsHash };
  }
};
