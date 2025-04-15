
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSMS } from "@/context/SMSContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SMSSimulatorPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const { mockReceiveSMS, isPermissionGranted, requestPermission } = useSMS();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter an SMS message",
        variant: "destructive"
      });
      return;
    }
    
    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    mockReceiveSMS(message);
    setMessage("");
  };
  
  const handleLoadSample = (sample: string) => {
    setMessage(sample);
  };
  
  const sampleMessages = [
    "UPI: Payment of Rs. 500.00 to CAFE COFFEE DAY successful. UPI Ref: 123456789.",
    "You have received Rs. 1000.00 from JOHN DOE to your account via UPI. Reference: UPI987654321.",
    "Your account has been debited for Rs. 350.50 towards UPI transfer to GROCERY MART.",
    "UPI: Rs. 750.00 credited to your account from ALICE SMITH. UPI Ref: 246813579.",
    "Dear ABC User, your A/c X6161-credited by Rs.150 on 15Apr25 transfer from John Doe R Ref No 12345678900 -ABC"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-white hover:bg-white/20"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">SMS Simulator</h1>
        </div>
        <p className="text-white/80 text-sm">
          Test the SMS transaction detection by simulating incoming messages
        </p>
      </div>
      
      {/* Info box */}
      <div className="bg-blue-50 p-4 mx-6 my-4 rounded-md border border-blue-200">
        <div className="flex items-start">
          <Info size={20} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-700">How it works</h3>
            <p className="text-sm text-blue-600 mt-1">
              The app detects transaction information from SMS messages. Each message is processed only once to avoid duplicates.
              Include amount (like "Rs. 150") and transaction type (debit/credit) for best results.
            </p>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Enter SMS Message
            </label>
            <Textarea
              placeholder="Type or paste an SMS message..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Simulate SMS Received
          </Button>
        </form>
        
        <div className="mt-8">
          <h3 className="font-medium mb-3 text-gray-700">Sample Messages</h3>
          <div className="space-y-2">
            {sampleMessages.map((sample, index) => (
              <div
                key={index}
                className="p-3 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleLoadSample(sample)}
              >
                {sample}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSSimulatorPage;
