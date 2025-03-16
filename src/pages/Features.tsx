import React, { useEffect } from "react";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, CheckCircle2, LayoutDashboard, NotebookPen, Rocket, Search, Sparkles, UserCog2 } from "lucide-react";

const Features = () => {
  // Add useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();

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
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Unlock Your Trading Potential
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore the powerful features designed to elevate your trading performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <LayoutDashboard className="h-8 w-8 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Trading Journal</h3>
              <p className="text-gray-300">
                Real-time tracking of your trades with detailed insights into your performance.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <Search className="h-8 w-8 text-accent-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Backtesting Journal</h3>
              <p className="text-gray-300">
                Simulate trades and test strategies with historical data to refine your approach.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-secondary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <Sparkles className="h-8 w-8 text-secondary-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Detailed Emotion Analysis</h3>
              <p className="text-gray-300">
                Understand how your emotions impact your trading decisions with comprehensive analysis.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <CalendarDays className="h-8 w-8 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unlimited Trades</h3>
              <p className="text-gray-300">
                Track as many trades as you need without any limitations.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <UserCog2 className="h-8 w-8 text-accent-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Psychological Pattern Diagnosis</h3>
              <p className="text-gray-300">
                Identify recurring psychological patterns in your trading behavior.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-secondary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <Rocket className="h-8 w-8 text-secondary-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">MFE / MAE</h3>
              <p className="text-gray-300">
                Analyze Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE) to optimize trade management.
              </p>
            </div>

            {/* Feature Card 7 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <NotebookPen className="h-8 w-8 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analytics</h3>
              <p className="text-gray-300">
                Leverage artificial intelligence to gain deeper insights into your trading data.
              </p>
            </div>

            {/* Feature Card 8 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 shadow-[0_0_25px_rgba(110,89,165,0.1)]">
              <div className="mb-4">
                <CheckCircle2 className="h-8 w-8 text-accent-light" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Best Price In the Market (By Far)</h3>
              <p className="text-gray-300">
                Enjoy premium features at an unbeatable price.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">
              Ready to take your trading to the next level?
            </p>
            <Button size="lg" onClick={() => navigate("/pricing")}>
              Explore Pricing Plans
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
