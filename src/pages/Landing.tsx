import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { Footer } from "@/components/landing/Footer";
import { User, ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-x-hidden">
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
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                asChild
              >
                <Link to="/features">Features</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                asChild
              >
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 sm:gap-2 text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                onClick={() => navigate("/login")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                className="flex items-center gap-1 sm:gap-2 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/20 backdrop-blur-sm px-2 sm:px-4"
                onClick={() => navigate("/login")}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* New Hero Section */}
        <section className="relative pt-24 sm:pt-32 md:pt-40 min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="container mx-auto px-4">
            {/* Subtle badge */}
            <div className="inline-block px-4 py-1.5 mb-5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
              Elevate Your Trading
            </div>
            
            {/* Main headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto">
              Take your trading to the next level with personalized{" "}
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                AI Insights
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Use our AI-powered platform to analyze your trades and make better decisions. 
              We will analyze your data and find your edge for you. Track your progress with intuitive, fast analytics.
            </p>
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="px-6 py-6 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20"
                onClick={() => navigate("/login")}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-6 border-gray-700 hover:bg-gray-800/50 text-white"
                onClick={() => navigate("/features")}
              >
                View Features
              </Button>
            </div>
            
            {/* Dashboard preview image - UPDATED */}
            <div className="relative mt-16 max-w-5xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur-sm opacity-70"></div>
              <div className="relative bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="/lovable-uploads/2d5aff3d-084a-4b65-958f-3fa50c7b0c39.png"
                  alt="Mental Trading Dashboard"
                  className="w-full h-auto rounded-lg transform hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Second section - Improved for mobile */}
        <section className="relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 px-4">
          <div className="container mx-auto px-0 md:px-6">
            <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
              {/* Left Side - App Preview */}
              <div className="flex-1 relative w-full max-w-xs sm:max-w-sm md:max-w-2xl mt-8 md:mt-0">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="p-4 sm:p-6 relative z-10">
                    {/* Mock Trading Journal Interface */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold text-white/90">Emotional State Tracker</h3>
                        <span className="px-2 sm:px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs sm:text-sm">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        {['Calm', 'Focused', 'Patient', 'Disciplined'].map((emotion) => (
                          <div key={emotion} className="p-2 sm:p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                            <p className="text-sm sm:text-base text-white/80">{emotion}</p>
                          </div>
                        ))}
                      </div>
                      <div className="h-20 sm:h-32 rounded-lg bg-white/5 border border-white/10 p-2 sm:p-4">
                        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Enhanced glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl -z-10" />
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 space-y-6 md:space-y-8 md:pl-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  You've been focused on the
                  <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent"> wrong thing </span>
                  all this time.
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                    Technicals alone is not enough to create breakthroughs, you must understand how your emotional states directly impact how you interpret market movement.
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                    Our journal shows you exactly how your emotions can make or break your trading performance in a way no other trading journal has ever done.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/10 transition-all duration-300"
                  onClick={() => navigate("/features")}
                >
                  Focus on what matters →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <AnalyticsSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
