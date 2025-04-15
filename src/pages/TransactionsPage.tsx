
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/context/TransactionContext";
import TransactionItem from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Search,
  Filter,
  X
} from "lucide-react";

const TransactionsPage: React.FC = () => {
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  
  // Filter transactions based on search query and type filter
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filter === "all" ||
      (filter === "income" && transaction.type === "income") ||
      (filter === "expense" && transaction.type === "expense");
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 border-b">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search transactions"
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1.5 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        
        {/* Filter buttons */}
        <div className="flex space-x-2 mt-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("income")}
            className={`flex-1 ${
              filter === "income" ? "bg-success hover:bg-success/90" : ""
            }`}
          >
            Income
          </Button>
          <Button
            variant={filter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("expense")}
            className={`flex-1 ${
              filter === "expense" ? "bg-destructive hover:bg-destructive/90" : ""
            }`}
          >
            Expense
          </Button>
        </div>
      </div>
      
      {/* Transaction list */}
      {filteredTransactions.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-180px)]">
          {filteredTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              showDelete={true}
            />
          ))}
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-180px)] text-gray-500">
          <Filter size={40} className="text-gray-300 mb-2" />
          <p className="font-medium">No transactions found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
