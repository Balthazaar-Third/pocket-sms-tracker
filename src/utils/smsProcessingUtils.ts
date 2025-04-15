
// Generate a simple hash for SMS message to avoid duplicates
export const generateSMSHash = (message: string): string => {
  return message.trim().replace(/\s+/g, ' ').toLowerCase();
};

// Helper function to extract amount from SMS
export const extractAmount = (message: string): { amount: number; amountStr: string } | null => {
  // Pattern 1: Amount with Rs/INR/₹
  const amountPattern = /(rs\.?|inr|₹)\s*([0-9,.]+)/i;
  
  // Pattern 2: Numbers followed by rs.
  const reverseAmountPattern = /([0-9,.]+)\s*(rs\.?|rupees|inr|₹)/i;
  
  let amountMatch = message.match(amountPattern) || message.match(reverseAmountPattern);
  
  // Simple numbers like "150 rs" without context
  if (!amountMatch) {
    const simpleAmount = /\b(\d+(?:\.\d+)?)\b/;
    const simpleMatch = message.match(simpleAmount);
    if (simpleMatch) {
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
      return null;
    }
    
    return { amount, amountStr };
  }
  
  return null;
};

// Helper function to determine transaction type from message
export const determineTransactionType = (message: string): 'income' | 'expense' | null => {
  const creditTerms = /(credited|received|added|deposited|sent to you|paid to you|transferred to you)/i;
  const debitTerms = /(debited|paid|sent|deducted|withdrawn|spent)/i;
  
  const isCredit = creditTerms.test(message);
  const isDebit = debitTerms.test(message);
  
  // If it's neither clearly credit nor debit but mentions UPI, try to infer
  if (!isCredit && !isDebit) {
    const upiPattern = /(?:upi|paytm|phonepe|googlepay|gpay)/i;
    const upiRefPattern = /(?:upi ref|upi id|txn id|ref no|upi-p2p)/i;
    const isUpiRelated = upiPattern.test(message);
    const hasUpiRef = upiRefPattern.test(message);
    
    if (isUpiRelated || hasUpiRef) {
      // Check for patterns like "received", "from", "to", "paid"
      const isInferred_Credit = /(?:received|from|credited to|added to)/i.test(message);
      const isInferred_Debit = /(?:paid to|sent to|payment to|spent at)/i.test(message);
      
      if (isInferred_Credit) return 'income';
      if (isInferred_Debit) return 'expense';
      
      // If still ambiguous, default based on common UPI message structures
      if (/^payment/i.test(message.trim())) {
        return 'expense';
      } else if (/received|credited/i.test(message)) {
        return 'income';
      }
    }
  }
  
  if (isCredit) return 'income';
  if (isDebit) return 'expense';
  
  return null;
};

// Helper function to extract entity name from message
export const extractEntityName = (message: string, type: 'income' | 'expense'): string => {
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
  
  if (!entityName) {
    return type === 'income' ? "UPI Income" : "UPI Expense";
  }
  
  return type === 'income' ? `From ${entityName}` : `To ${entityName}`;
};
