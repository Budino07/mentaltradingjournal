import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Check, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createCheckoutSession } from "@/lib/stripe";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, signOut, updateUsername } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");

  const handleSubscribe = async (priceId: string) => {
    try {
      if (!user) {
        navigate(`/login?returnTo=${encodeURIComponent('/pricing')}`);
        return;
      }
      await createCheckoutSession(priceId);
    } catch (error) {
      toast("Failed to start checkout process. Please try again.");
    }
  };

  const handleUpdateUsername = async () => {
    try {
      await updateUsername(username);
      setIsEditing(false);
      toast("Username updated successfully");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update username");
    }
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;

  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        
        <div className="absolute -left-20 top-1/4 w-96 h-[800px] bg-primary-light/30 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute -left-40 top-2/3 w-80 h-96 bg-primary/40 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse delay-1000" />
        
        <div className="absolute -right-20 top-1/3 w-96 h-[700px] bg-accent/30 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute -right-40 bottom-1/4 w-80 h-96 bg-primary-light/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse delay-700" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-96 bg-secondary-light/10 rounded-full mix-blend-screen filter blur-[150px] opacity-20" />
        
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1F2C]/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            Mental
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{userEmail}</span>
                    <span className="inline-block sm:hidden">{displayName}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter new username"
                          />
                          <Button onClick={handleUpdateUsername}>Save</Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setUsername(displayName);
                            setIsEditing(true);
                          }}
                        >
                          Edit Username
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the plan that's right for you and start improving your trading journey today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="relative p-8 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Monthly Plan</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">$9</span>
                  <span className="text-gray-300 text-sm">/month</span>
                </div>
              </div>
              <p className="text-gray-300 mb-6">Get all the exclusive benefits of a yearly plan—without any long-term commitment or hidden fees</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Live Trading Journal",
                  "Backtesting Journal",
                  "Detailed Emotion Analysis",
                  "Unlimited Trades",
                  "Psychological Pattern Diagnosis",
                  "MFE / MAE",
                  "AI-Powered Analytics",
                  "Best Price In the Market (By Far)",
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => handleSubscribe("price_1Qs2QGI2A6O6E8LHv6mgd8nT")}
              >
                Get Monthly Plan
              </Button>
            </div>

            <div className="relative p-8 rounded-xl backdrop-blur-sm bg-primary/10 border-2 border-[#8B5CF6] hover:border-[#D946EF] transition-all duration-300 shadow-[0_0_35px_rgba(110,89,165,0.3)]">
              <div className="absolute -top-4 right-4 bg-gradient-to-r from-primary to-accent/80 px-4 py-1 rounded-full text-sm font-medium text-white shadow-lg">
                Save 20%
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Yearly Plan</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">$90</span>
                  <span className="text-gray-300 text-sm">/year</span>
                </div>
              </div>
              <p className="text-gray-300 mb-6">The premiere trading journal that focuses on essential features and eliminates the rest</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Live Trading Journal",
                  "Backtesting Journal",
                  "Detailed Emotion Analysis",
                  "Unlimited Trades",
                  "Psychological Pattern Diagnosis",
                  "MFE / MAE",
                  "AI-Powered Analytics",
                  "Best Price In the Market (By Far)",
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 text-white shadow-lg"
                onClick={() => handleSubscribe("price_1Qs2QaI2A6O6E8LH8YdwlxiE")}
              >
                Get Yearly Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
