
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

interface PricingPlan {
  title: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  showPricingPlans?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    title: "Monthly Plan",
    price: "$19",
    period: "/month",
    features: [
      "Advanced Analytics Dashboard",
      "Unlimited Trade Journaling",
      "Performance Metrics",
      "Trading Pattern Analysis",
      "Risk Management Tools"
    ],
    ctaText: "Start Monthly Plan"
  },
  {
    title: "Yearly Plan",
    price: "$190",
    period: "/year",
    features: [
      "Everything in Monthly",
      "2 Months Free",
      "Priority Support",
      "Early Access to New Features",
      "Advanced Backtesting Tools"
    ],
    ctaText: "Start Yearly Plan"
  }
];

export const SubscriptionDialog = ({ open, onClose, showPricingPlans = false }: SubscriptionDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  if (showPricingPlans) {
    return (
      <AlertDialog open={open} onOpenChange={onClose}>
        <AlertDialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:max-w-[800px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center">Start Your Trading Journey</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Choose the plan that best fits your trading needs
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid md:grid-cols-2 gap-6 my-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.title}
                className="flex flex-col p-6 bg-card rounded-lg border border-primary/10 shadow-lg"
              >
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="mt-8"
                  onClick={handleUpgrade}
                >
                  {plan.ctaText}
                </Button>
              </div>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Maybe Later</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <AlertDialogHeader>
          <AlertDialogTitle>Premium Feature</AlertDialogTitle>
          <AlertDialogDescription>
            This feature requires a subscription. Upgrade to our premium plan to access all features including analytics, backtesting, and advanced journaling tools.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col space-y-2 sm:space-y-0">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgrade}
            className="bg-primary hover:bg-primary/90"
          >
            Subscribe to Access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
