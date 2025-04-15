
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Welcome to PocketTrack",
      description: "Your personal expense tracker that helps you manage your finances with ease.",
      image: "👋",
    },
    {
      title: "Track Expenses",
      description: "Add your income and expenses manually or automatically from SMS notifications.",
      image: "📊",
    },
    {
      title: "SMS Detection",
      description: "We can automatically detect UPI transactions from your SMS messages.",
      image: "📱",
    },
    {
      title: "Visualize Your Money",
      description: "See how your money flows with beautiful charts and summaries.",
      image: "💰",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark user as onboarded and navigate to home
      localStorage.setItem("user_onboarded", "true");
      navigate("/");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("user_onboarded", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <div className="text-7xl mb-6">{steps[currentStep].image}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600 max-w-xs mx-auto">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border-t">
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button onClick={handleNext} className="px-6">
            {currentStep < steps.length - 1 ? "Next" : "Get Started"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
