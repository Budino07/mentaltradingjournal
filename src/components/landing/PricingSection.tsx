
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const navigate = useNavigate();
  
  return (
    <section className="relative py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#1A1F2C]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/20 via-accent/5 to-transparent opacity-30" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 mb-5 bg-black/30 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
            Subscription Plans
          </div>
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Discover the Trader Sage
          </h2>
          
          {/* Subheading */}
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            Analyze your trades systematically with our intuitive platform and automated tools. Start improving your trading today.
          </p>
          
          {/* Billing cycle toggle */}
          <div className="inline-flex items-center bg-black/30 backdrop-blur-sm rounded-full p-1 border border-white/10 mb-10">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-primary text-white"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </button>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative p-6 md:p-8 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                <p className="text-gray-400">Get started with basic trading analytics</p>
              </div>
              
              <div className="flex items-end mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400 ml-2 pb-1">forever</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                  <span className="text-gray-300">5 journal entries per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                  <span className="text-gray-300">Basic analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                  <span className="text-gray-300">Emotion tracking</span>
                </li>
              </ul>
              
              <Button
                variant="outline"
                className="w-full py-6 border-gray-700 text-white"
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="relative p-6 md:p-8 bg-black/40 backdrop-blur-md border border-primary/20 rounded-xl glow-effect">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-sm opacity-50"></div>
              <div className="relative">
                <Badge variant="default" className="absolute -top-3 -right-3 bg-primary">
                  Best Value
                </Badge>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Premium Plan</h3>
                  <p className="text-gray-400">Advanced analytics for serious traders</p>
                </div>
                
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${billingCycle === "monthly" ? "29" : "19"}
                  </span>
                  <span className="text-gray-400 ml-2 pb-1">
                    /{billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                    <span className="text-gray-300">Unlimited journal entries</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                    <span className="text-gray-300">Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                    <span className="text-gray-300">AI-powered insights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                    <span className="text-gray-300">Psychological pattern detection</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5" />
                    <span className="text-gray-300">Export data in various formats</span>
                  </li>
                </ul>
                
                <Button
                  className="w-full py-6 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => navigate("/pricing")}
                >
                  <DollarSign className="h-5 w-5 mr-1" />
                  Get Premium
                </Button>
              </div>
            </div>
          </div>
          
          {/* Money-back guarantee */}
          <p className="mt-8 text-sm text-gray-400">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};
