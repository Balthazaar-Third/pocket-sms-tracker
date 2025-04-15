
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionContext";
import { useSMS } from "@/context/SMSContext";
import CircularProgressGraph from "@/components/CircularProgressGraph";
import TransactionItem from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, LogOut, MessageSquare, Plus } from "lucide-react";

const HomePage: React.FC = () => {
  const { logout } = useAuth();
  const { transactions, summary } = useTransactions();
  const { readSMS, isPermissionGranted, requestPermission } = useSMS();
  const navigate = useNavigate();
  
  // Get only the latest 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleSMSButtonClick = async () => {
    if (!isPermissionGranted) {
      await requestPermission();
    } else {
      await readSMS();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">PocketTrack</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary/80"
            onClick={logout}
          >
            <LogOut size={20} />
          </Button>
        </div>
        
        <CircularProgressGraph
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
        />
      </div>
      
      {/* Main content */}
      <div className="p-6 bg-white -mt-6 rounded-t-3xl">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            className="h-14 bg-success hover:bg-success/90"
            onClick={() => navigate("/add-income")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Income
          </Button>
          
          <Button
            className="h-14 bg-destructive hover:bg-destructive/90"
            onClick={() => navigate("/add-expense")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Expense
          </Button>
        </div>
        
        {/* SMS module button */}
        <Button 
          variant="outline" 
          className="w-full h-14 mb-6 border-dashed"
          onClick={handleSMSButtonClick}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          {isPermissionGranted 
            ? "Scan SMS for Transactions" 
            : "Enable SMS Transaction Detection"}
        </Button>
        
        {/* Recent transactions */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => navigate("/transactions")}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <ScrollArea className="h-[300px]">
            {recentTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No transactions yet.</p>
            <p className="text-sm">Add your first income or expense!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
