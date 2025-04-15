
import React from "react";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { ChevronRight, Trash2 } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";

interface TransactionItemProps {
  transaction: Transaction;
  showDelete?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction,
  showDelete = false
}) => {
  const { deleteTransaction } = useTransactions();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTransaction(transaction.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex flex-1 items-center">
        <div 
          className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
            transaction.type === "income" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <span
            className={`text-xl ${
              transaction.type === "income" ? "text-success" : "text-destructive"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 truncate max-w-[180px]">
            {transaction.description}
          </h3>
          <p className="text-xs text-gray-500">
            {format(new Date(transaction.date), "MMM d, yyyy • h:mm a")}
            {transaction.fromSMS && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100">
                SMS
              </span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        <span
          className={`font-medium ${
            transaction.type === "income" ? "text-success" : "text-destructive"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
        </span>
        
        {showDelete ? (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-gray-400 hover:text-red-500"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
        ) : (
          <ChevronRight size={16} className="ml-2 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
