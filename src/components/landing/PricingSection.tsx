
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, BarChart3, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#1A1F2C]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-accent/5 to-transparent opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#7E69AB]/20 via-background/80 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 mb-5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
            Subscription Plans
          </div>
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Discover the Trader's Edge
          </h2>
          
          {/* Subheading */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unlock your trading potential with our powerful mental analytics and emotional insights. Start your journey today.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="relative p-8 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-2">Monthly</h3>
            <p className="text-center text-gray-400 mb-6">$9/month</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Live Trading Journal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Backtesting Journal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Detailed Emotion Analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Unlimited Trades</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Psychological Pattern Diagnosis</span>
              </li>
            </ul>
            
            <Button 
              onClick={() => navigate("/pricing")}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Get Started
            </Button>
          </div>
          
          {/* Yearly Plan - Highlighted */}
          <div className="relative p-8 rounded-xl backdrop-blur-sm bg-primary/10 border-2 border-primary hover:border-primary-light transition-all duration-300 shadow-[0_0_35px_rgba(110,89,165,0.3)]">
            <div className="absolute -top-4 right-4 bg-gradient-to-r from-primary to-accent/80 px-4 py-1 rounded-full text-sm font-medium text-white shadow-lg">
              Save 20%
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="w-8 h-8 text-primary-light" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-2">Yearly</h3>
            <p className="text-center text-gray-400 mb-6">$90/year</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Live Trading Journal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Backtesting Journal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Detailed Emotion Analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Unlimited Trades</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Psychological Pattern Diagnosis</span>
              </li>
            </ul>
            
            <Button 
              onClick={() => navigate("/pricing")}
              className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 text-white shadow-lg"
            >
              Get Best Value
            </Button>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={() => navigate("/pricing")}
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-white font-medium border border-white/10 shadow-lg shadow-primary/20"
          >
            View Full Pricing Details
          </Button>
        </div>
      </div>
    </section>
  );
};
