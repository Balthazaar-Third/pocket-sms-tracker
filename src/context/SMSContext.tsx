
import React, { createContext, useState, useContext, useEffect } from "react";
import { useTransactions } from "./TransactionContext";
import { useToast } from "@/hooks/use-toast";

interface SMSContextType {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  readSMS: () => Promise<void>;
  mockReceiveSMS: (message: string) => void;
  lastScanTime: Date | null;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const SMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const { processSMS } = useTransactions();
  const { toast } = useToast();

  // Load last scan time from localStorage on mount
  useEffect(() => {
    const storedLastScanTime = localStorage.getItem("lastScanTime");
    if (storedLastScanTime) {
      setLastScanTime(new Date(storedLastScanTime));
    }
  }, []);

  // Function to request SMS read permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      // Simulate permission request with a timeout
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      
      // Grant permission
      setIsPermissionGranted(true);
      
      toast({
        title: "Permission Granted",
        description: "SMS detection is now enabled.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: "Unable to access SMS messages.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Calculate the start date for scanning based on last scan time
  const calculateScanTimeframe = (): Date => {
    if (!lastScanTime) {
      // If never scanned before, default to 30 days
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() - 30);
      return defaultDate;
    }

    const now = new Date();
    const elapsedMs = now.getTime() - lastScanTime.getTime();
    
    // Convert elapsed time to hours
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // If more than 24 hours, use the exact elapsed time
    // If less than 24 hours, minimum scan period is 6 hours
    const scanPeriodHours = elapsedHours > 24 ? elapsedHours : Math.max(6, elapsedHours);
    
    const scanStartDate = new Date();
    scanStartDate.setHours(scanStartDate.getHours() - scanPeriodHours);
    
    return scanStartDate;
  };

  // Function to read SMS messages
  const readSMS = async (): Promise<void> => {
    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    try {
      const scanStartDate = calculateScanTimeframe();
      const formattedDate = scanStartDate.toLocaleString();
      
      toast({
        title: "Scanning SMS Messages",
        description: `Looking for messages since ${formattedDate}...`,
      });
      
      console.log(`Scanning SMS messages since: ${formattedDate}`);
      
      // Simulate a delay for scanning
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      
      // Updated sample SMS messages with UPI transaction patterns
      const sampleSMS = [
        "UPI: Payment of Rs.320.75 to GROCERY STORE successful. UPI Ref: UPI123456789.",
        "You have received Rs.1500.00 from JOHN SMITH to your account via UPI. Reference: UPI987654321.",
        "Money has landed! Rs.750 received via UPI from PhonePe. UPI Ref: 246813579P2P.",
        "UPI Alert: You've paid Rs.599.00 to AMAZON.IN. UPI Ref No.123XYZ. Balance: Rs.2504.24",
        "Rs.150 transferred to COFFEE SHOP. UPI ID: coffee@paytm. Txn ID: TXN123456789.",
        "Alert: Rs.2000.00 credited to your account from RAVI KUMAR via UPI-P2P."
      ];
      
      // Randomly pick 1-3 sample SMS messages for simulation
      const numMessages = Math.floor(Math.random() * 3) + 1;
      const selectedIndices = new Set<number>();
      
      while (selectedIndices.size < numMessages) {
        selectedIndices.add(Math.floor(Math.random() * sampleSMS.length));
      }
      
      let transactionsFound = 0;
      
      // Process the selected messages
      for (const index of selectedIndices) {
        const selectedSMS = sampleSMS[index];
        console.log("Processing sample SMS:", selectedSMS);
        
        const foundTransaction = processSMS(selectedSMS);
        if (foundTransaction) {
          transactionsFound++;
        }
      }
      
      // Update last scan time
      const now = new Date();
      setLastScanTime(now);
      localStorage.setItem("lastScanTime", now.toISOString());
      
      if (transactionsFound === 0) {
        toast({
          title: "Scan Complete",
          description: "No new transactions found.",
        });
      } else {
        toast({
          title: "Scan Complete",
          description: `Found ${transactionsFound} new transaction(s).`,
        });
      }
    } catch (error) {
      console.error("Error reading SMS:", error);
      toast({
        title: "Error Reading SMS",
        description: "Failed to read SMS messages.",
        variant: "destructive",
      });
    }
  };

  // Function to simulate receiving an SMS for testing
  const mockReceiveSMS = (message: string): void => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter an SMS message to process.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Processing mock SMS:", message);
    const transactionFound = processSMS(message);
    
    // Show toast only if no transaction was found (processSMS shows its own toast on success)
    if (!transactionFound) {
      toast({
        title: "No Transaction Found",
        description: "The SMS doesn't contain recognizable transaction information.",
      });
    }
  };

  return (
    <SMSContext.Provider
      value={{
        isPermissionGranted,
        requestPermission,
        readSMS,
        mockReceiveSMS,
        lastScanTime,
      }}
    >
      {children}
    </SMSContext.Provider>
  );
};

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error("useSMS must be used within an SMSProvider");
  }
  return context;
};
