
import React, { createContext, useState, useContext } from "react";
import { useTransactions } from "./TransactionContext";
import { useToast } from "@/hooks/use-toast";

interface SMSContextType {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  readSMS: () => Promise<void>;
  mockReceiveSMS: (message: string) => void;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const SMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const { processSMS } = useTransactions();
  const { toast } = useToast();

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

  // Function to read SMS messages
  const readSMS = async (): Promise<void> => {
    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    try {
      toast({
        title: "Scanning SMS Messages",
        description: "Looking for transaction messages...",
      });
      
      // Simulate a delay for scanning
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      
      // Sample SMS messages for simulation
      const sampleSMS = [
        "Dear ABC User, your A/c X6161-credited by Rs.150 on 30Mar25 transfer from John Doe R Ref No 12345678900 -ABC",
        "Rs.300.00 is debited from your account for purchase at CAFE COFFEE DAY on 25-03-25. Avl Bal: Rs.1250.20",
        "Your account has been credited with Rs.1000 via UPI transfer from JAMES SMITH. Ref: UPI123456789"
      ];
      
      // Randomly pick one of the sample SMS messages for simulation
      const randomIndex = Math.floor(Math.random() * sampleSMS.length);
      const selectedSMS = sampleSMS[randomIndex];
      
      console.log("Processing sample SMS:", selectedSMS);
      const foundTransaction = processSMS(selectedSMS);
      
      if (!foundTransaction) {
        toast({
          title: "Scan Complete",
          description: "No new transactions found.",
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
