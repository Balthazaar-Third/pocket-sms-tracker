
import React from "react";

interface CircularProgressGraphProps {
  totalIncome: number;
  totalExpense: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressGraph: React.FC<CircularProgressGraphProps> = ({
  totalIncome,
  totalExpense,
  size = 220,
  strokeWidth = 15,
}) => {
  const balance = totalIncome - totalExpense;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentages for the graph
  let incomePercentage = 0;
  let expensePercentage = 0;
  
  if (totalIncome > 0 || totalExpense > 0) {
    const total = totalIncome + totalExpense;
    incomePercentage = (totalIncome / total) * 100;
    expensePercentage = (totalExpense / total) * 100;
  }
  
  // Calculate stroke-dasharray and stroke-dashoffset for the circular progress
  const incomeOffset = circumference - (circumference * incomePercentage) / 100;
  const expenseOffset = circumference - (circumference * expensePercentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
        />
        
        {/* Income arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#4CAF50"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={incomeOffset}
          strokeLinecap="round"
        />
        
        {/* Expense arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FF5252"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={expenseOffset}
          strokeLinecap="round"
          className="transform rotate-180"
          style={{ transformOrigin: "center" }}
        />
      </svg>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-sm font-medium text-gray-500">Balance</p>
        <p className="text-2xl font-bold text-primary">₹{balance.toFixed(2)}</p>
      </div>
      
      <div className="mt-6 flex w-full justify-around">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-success mr-2"></div>
          <div>
            <p className="text-xs text-gray-500">Income</p>
            <p className="text-sm font-semibold">₹{totalIncome.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-destructive mr-2"></div>
          <div>
            <p className="text-xs text-gray-500">Expense</p>
            <p className="text-sm font-semibold">₹{totalExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularProgressGraph;
