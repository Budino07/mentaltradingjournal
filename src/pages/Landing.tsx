import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { User, ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-hidden">
      <div className="fixed inset-0">
        {/* Dark base layer */}
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30" />
        
        {/* Animated glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 -right-40 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        
        {/* Glass effect base */}
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/5 backdrop-blur-md border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Mental
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5"
                asChild
              >
                <Link to="/features">Features</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5"
                asChild
              >
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5"
                onClick={() => navigate("/login")}
              >
                <User className="h-4 w-4" />
                Sign In
              </Button>
              <Button
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/20 backdrop-blur-sm"
                onClick={() => navigate("/login")}
              >
                <span>Get Started</span>
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-40 min-h-[90vh] flex items-center">
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-8 md:pr-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
                You've never seen a{" "}
                <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  trading journal
                </span>
                {" "}like this before
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                Find your breakthrough with a data-driven journal that utilizes both technicals AND psychology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 backdrop-blur-lg shadow-lg shadow-primary/20"
                  onClick={() => navigate("/login")}
                >
                  Sign up with email
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-gray-700 hover:bg-gray-800/50 backdrop-blur-lg"
                  onClick={() => navigate("/features")}
                >
                  Features
                </Button>
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div className="flex-1 relative w-full max-w-2xl">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 backdrop-blur-2xl" />
                <img
                  src="/lovable-uploads/fe65c6a8-f463-4074-9175-5c9c2204e46a.png"
                  alt="Trading Calendar Preview"
                  className="w-full h-full object-cover rounded-lg transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Enhanced glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl -z-10" />
            </div>
          </div>
        </section>

        <section className="relative min-h-screen flex items-center py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col-reverse md:flex-row items-center gap-12">
              {/* Left Side - App Preview */}
              <div className="flex-1 relative w-full max-w-2xl">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="p-6 relative z-10">
                    {/* Mock Trading Journal Interface */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white/90">Emotional State Tracker</h3>
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-sm">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {['Calm', 'Focused', 'Patient', 'Disciplined'].map((emotion) => (
                          <div key={emotion} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                            <p className="text-white/80">{emotion}</p>
                          </div>
                        ))}
                      </div>
                      <div className="h-32 rounded-lg bg-white/5 border border-white/10 p-4">
                        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Enhanced glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl -z-10" />
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 space-y-8 md:pl-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  You've been focused on the
                  <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent"> wrong thing </span>
                  all this time.
                </h2>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Technicals alone is not enough to create breakthroughs, you must understand how your emotional states directly impact how you interpret market movement.
                  </p>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Our journal shows you exactly how your emotions can make or break your trading performance in a way no other trading journal has ever done.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/10 transition-all duration-300"
                  onClick={() => navigate("/login")}
                >
                  Focus on what matters →
                </Button>
              </div>
            </div>
          </div>
        </section>

        <AnalyticsSection />
      </div>
    </div>
  );
};

export default Landing;
