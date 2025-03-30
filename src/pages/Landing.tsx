
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { Footer } from "@/components/landing/Footer";
import { User, ArrowRightCircle, BarChart3, Brain, Lightbulb, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

        {/* Analytics Features Section - NEW DESIGN based on provided image */}
        <section className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            {/* Main layout grid for the analytics features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-12">
                {/* Moving Average Analysis Card */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">50 Day Moving Average Analysis</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Chart for Win/Against */}
                    <div>
                      <div className="h-40 flex items-end space-x-6">
                        <div className="w-1/2 h-full flex flex-col justify-end">
                          <div className="h-[80%] w-full bg-gradient-to-t from-primary-light/80 to-primary-light rounded-t-md"></div>
                          <p className="text-sm text-white/70 mt-2 text-center">With</p>
                        </div>
                        <div className="w-1/2 h-full flex flex-col justify-end">
                          <div className="h-[50%] w-full bg-gradient-to-t from-blue-400/80 to-blue-400 rounded-t-md"></div>
                          <p className="text-sm text-white/70 mt-2 text-center">Against</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 mt-2">
                        <div className="text-center text-white/80">
                          <p className="text-sm">Win Rate</p>
                          <p className="text-xl font-bold text-white">80%</p>
                        </div>
                        <div className="text-center text-white/80">
                          <p className="text-sm">Win Rate</p>
                          <p className="text-xl font-bold text-white">50%</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trading Stats */}
                    <div className="flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="text-white/60 text-sm">Biggest Win</p>
                        <p className="text-white text-2xl font-bold">$1750</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Biggest Loss</p>
                        <p className="text-red-400 text-2xl font-bold">-$250</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Automatic Trade Tagging */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Automatic Trade Tagging</h3>
                  <p className="text-gray-300 mb-8">
                    We automatically tag your trades based on technical and fundamental analysis, 
                    helping you identify patterns and improve your strategy effortlessly.
                  </p>
                  
                  {/* Example tagged trade */}
                  <div className="flex items-center space-x-4 bg-[#0A101F] p-4 rounded-lg border border-white/5">
                    <div className="bg-[#121C36] px-4 py-3 rounded-lg">
                      <p className="text-blue-300">Inverse Iron</p>
                      <p className="text-blue-300">Condor</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">META</p>
                    </div>
                    <div>
                      <p className="text-white/60">Feb</p>
                      <p className="text-white font-medium">07</p>
                    </div>
                    <div className="bg-[#121C36] px-4 py-2 rounded-lg ml-auto">
                      <p className="text-white font-bold">$625-</p>
                      <p className="text-white font-bold">$675</p>
                    </div>
                  </div>
                </div>
                
                {/* Smart Option Strategy Detection */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Smart Option Strategy Detection</h3>
                  <p className="text-gray-300">
                    Automatically identifies and groups complex option strategies like Iron Condors and Spreads, 
                    making it easier to track and analyze your options trading performance.
                  </p>
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-8">
                {/* Cumulative Return Chart */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/60 text-sm">Cumulative Return</p>
                      <p className="text-white text-2xl font-bold">$2500</p>
                    </div>
                    <div className="h-16 w-40 relative">
                      {/* Simplified line chart visualization */}
                      <div className="absolute inset-0 overflow-hidden">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <path
                            d="M0,35 Q10,30 20,25 T40,20 T60,15 T80,25 T100,20"
                            fill="none"
                            stroke="url(#purpleGradient)"
                            strokeWidth="2"
                            className="drop-shadow-glow"
                          />
                          <defs>
                            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#9b87f5" />
                              <stop offset="100%" stopColor="#6E59A5" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actionable Tip Card */}
                <div className="bg-gradient-to-br from-primary/50 to-primary-dark/70 rounded-xl overflow-hidden border border-primary/30 p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Actionable Tip</h3>
                  <p className="text-white/90 font-medium mb-2">
                    Reversal Trades are showing promise
                  </p>
                  <p className="text-white/80 text-sm">
                    Trading against the VWAP direction, while having a lower win rate, boasts a 
                    significantly better profit factor of 1.9 and higher profit returns. This suggests that 
                    you're letting your winners run and cutting your losers short.
                  </p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Win Rate Card */}
                  <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Win Rate</p>
                        <p className="text-white text-3xl font-bold">72%</p>
                      </div>
                      <div className="h-16 w-16 relative">
                        <svg viewBox="0 0 36 36" className="h-full w-full">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="2"></circle>
                          <circle 
                            cx="18" cy="18" r="16" 
                            fill="none" 
                            stroke="url(#circleGradient)" 
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="100"
                            strokeDashoffset="28"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <defs>
                            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#9b87f5" />
                              <stop offset="100%" stopColor="#6E59A5" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Average Win Card */}
                  <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-5">
                    <p className="text-white/60 text-sm mb-1">Average Win</p>
                    <p className="text-white text-3xl font-bold">$420</p>
                  </div>
                </div>
                
                {/* Profit Factor By Side */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Profit factor by side</h3>
                  <div className="flex justify-around items-center">
                    <div className="flex flex-col items-center">
                      <div className="relative h-24 w-24 mb-2">
                        <svg viewBox="0 0 36 36" className="h-full w-full">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#222" strokeWidth="3"></circle>
                          <circle 
                            cx="18" cy="18" r="15" 
                            fill="none" 
                            stroke="url(#longGradient)" 
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="94.2"
                            strokeDashoffset="25"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <defs>
                            <linearGradient id="longGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#9b87f5" />
                              <stop offset="100%" stopColor="#6E59A5" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-primary-light mr-2"></div>
                        <span className="text-white/70 text-sm">Long</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative h-24 w-24 mb-2">
                        <svg viewBox="0 0 36 36" className="h-full w-full">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#222" strokeWidth="3"></circle>
                          <circle 
                            cx="18" cy="18" r="15" 
                            fill="none" 
                            stroke="url(#shortGradient)" 
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="94.2"
                            strokeDashoffset="35"
                            transform="rotate(-90 18 18)"
                          ></circle>
                          <defs>
                            <linearGradient id="shortGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#38BDF8" />
                              <stop offset="100%" stopColor="#0EA5E9" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-secondary mr-2"></div>
                        <span className="text-white/70 text-sm">Short</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI-Generated Insights */}
                <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">AI-Generated Insights</h3>
                  <p className="text-gray-300">
                    Get personalized AI-generated insights to improve your trading performance.
                    Our blazing fast analysis engine processes your data in seconds, providing
                    you with actionable intelligence.
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center mt-16">
              <Button
                size="lg"
                className="px-8 py-6 bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-white font-medium border border-white/10 shadow-lg shadow-primary/20"
                onClick={() => navigate("/features")}
              >
                <Target className="mr-2 h-5 w-5" />
                Discover all features
              </Button>
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
