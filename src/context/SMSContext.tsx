
import React, { createContext, useState, useContext, useEffect } from "react";
import { useTransactions } from "./TransactionContext";
import { useToast } from "@/components/ui/use-toast";

interface SMSContextType {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  readSMS: () => Promise<void>;
  mockReceiveSMS: (message: string) => void;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

// Mock SMS messages for testing
const mockSMSMessages = [
  "UPI: Payment of Rs. 500.00 to CAFE COFFEE DAY successful. UPI Ref: 123456789.",
  "You have received Rs. 1000.00 from JOHN DOE to your account via UPI. Reference: UPI987654321.",
  "Your account has been debited for Rs. 350.50 towards UPI transfer to GROCERY MART.",
  "UPI: Rs. 750.00 credited to your account from ALICE SMITH. UPI Ref: 246813579."
];

export const SMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const { processSMS } = useTransactions();
  const { toast } = useToast();

  // Check if permission is already granted
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // In a real app, this would check actual SMS permissions
        // Here we just check if the user has "granted" our mock permission
        const permission = localStorage.getItem("sms_permission") === "granted";
        setIsPermissionGranted(permission);
      } catch (error) {
        console.error("Error checking SMS permission:", error);
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      // In a real app, this would request actual SMS permissions
      // For this demo, we'll simulate a permission request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Assume permission is granted
      setIsPermissionGranted(true);
      localStorage.setItem("sms_permission", "granted");
      
      toast({
        title: "SMS Permission Granted",
        description: "The app can now read SMS messages to detect transactions.",
      });
      
      return true;
    } catch (error) {
      console.error("Error requesting SMS permission:", error);
      toast({
        title: "Permission Denied",
        description: "SMS reading permission was denied.",
        variant: "destructive",
      });
      return false;
    }
  };

  const readSMS = async (): Promise<void> => {
    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      // In a real app, this would read actual SMS messages
      // For this demo, we'll process our mock messages
      let transactionsFound = 0;
      
      for (const message of mockSMSMessages) {
        const processed = processSMS(message);
        if (processed) {
          transactionsFound++;
        }
      }
      
      toast({
        title: "SMS Scan Complete",
        description: `Found ${transactionsFound} new transactions.`,
      });
    } catch (error) {
      console.error("Error reading SMS:", error);
      toast({
        title: "SMS Reading Failed",
        description: "Could not read SMS messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  const mockReceiveSMS = (message: string) => {
    if (!isPermissionGranted) {
      toast({
        title: "Permission Required",
        description: "SMS permission is needed to process messages.",
        variant: "destructive",
      });
      return;
    }

    const processed = processSMS(message);
    if (!processed) {
      toast({
        title: "Not a Transaction",
        description: "The message does not appear to be a transaction.",
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
