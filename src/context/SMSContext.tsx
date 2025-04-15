
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
    // In a real mobile app, this would use the device's permission API
    // For our web demo, we'll simulate permission being granted

    try {
      // Simulate permission request with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
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
      // In a real app, this would access the device's SMS API
      // For our demo, we'll simulate finding some messages
      
      toast({
        title: "Scanning SMS Messages",
        description: "Looking for transaction messages...",
      });
      
      // Simulate a delay for scanning
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Simulate no transactions found
      toast({
        title: "Scan Complete",
        description: "No new transactions found.",
      });
    } catch (error) {
      toast({
        title: "Error Reading SMS",
        description: "Failed to read SMS messages.",
        variant: "destructive",
      });
    }
  };

  // Function to simulate receiving an SMS for testing
  const mockReceiveSMS = (message: string): void => {
    const success = processSMS(message);
    
    if (!success) {
      toast({
        title: "Not a Transaction",
        description: "The message doesn't appear to be a transaction.",
        variant: "destructive",
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
