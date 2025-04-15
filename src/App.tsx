
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { SMSProvider } from "@/context/SMSContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import HomePage from "@/pages/HomePage";
import TransactionsPage from "@/pages/TransactionsPage";
import AddTransactionPage from "@/pages/AddTransactionPage";
import SMSSimulatorPage from "@/pages/SMSSimulatorPage";
import NotFound from "@/pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Main App component
const App = () => {
  console.log("Rendering main App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <TransactionProvider>
              <SMSProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <TransactionsPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/add-income"
                    element={
                      <ProtectedRoute>
                        <AddTransactionPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/add-expense"
                    element={
                      <ProtectedRoute>
                        <AddTransactionPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/sms-simulator"
                    element={
                      <ProtectedRoute>
                        <SMSSimulatorPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SMSProvider>
            </TransactionProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
