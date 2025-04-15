
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { TransactionType } from "@/types/transaction";

const AddTransactionPage: React.FC = () => {
  const location = useLocation();
  const isIncome = location.pathname === "/add-income";
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    
    addTransaction({
      amount: parsedAmount,
      description,
      category,
      type: isIncome ? "income" : "expense" as TransactionType,
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div 
        className={`p-6 ${
          isIncome ? "bg-success" : "bg-destructive"
        } text-white`}
      >
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-white hover:bg-white/20"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">
            {isIncome ? "Add Income" : "Add Expense"}
          </h1>
        </div>
      </div>
      
      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder={`What's this ${isIncome ? "income" : "expense"} for?`}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>
          
          <Button
            type="submit"
            className={`w-full ${
              isIncome ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
            }`}
          >
            Save {isIncome ? "Income" : "Expense"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionPage;
