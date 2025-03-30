
import React from "react";
import { Progress } from "@/components/ui/progress";

export const PlatformFeatures = () => {
  return (
    <section className="relative py-20 md:py-24 bg-[#111520]/90">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="mb-12 md:mb-16">
          <p className="text-white/70 mb-3">Why traders choose our platform</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Trade. Learn. Evolve.</h2>
          <p className="text-lg text-white/80 max-w-xl">
            Use AI-powered insights, automatic trade tagging, and fast analysis to improve your strategies and work toward consistent profitability.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-12">
            {/* Moving Average Analysis Card */}
            <div className="bg-[#111520]/70 rounded-xl overflow-hidden border border-white/5 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">50 Day Moving Average Analysis</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Chart for Win/Against */}
                <div>
                  <div className="h-32 flex items-end space-x-6">
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
                      <p className="text-xs">Win Rate</p>
                      <p className="text-lg font-bold text-white">80%</p>
                    </div>
                    <div className="text-center text-white/80">
                      <p className="text-xs">Win Rate</p>
                      <p className="text-lg font-bold text-white">50%</p>
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
              <p className="text-gray-300 mb-6">
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/60 text-sm">Cumulative Return</p>
                  <p className="text-white text-2xl font-bold">$2500</p>
                </div>
                <div className="h-16 w-40 relative">
                  {/* Simplified line chart visualization */}
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
            
            {/* Actionable Tip Card */}
            <div className="bg-primary/40 rounded-xl overflow-hidden border border-primary/30 p-6">
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
                  <div className="relative h-16 w-16">
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
              <h3 className="text-xl font-bold text-white mb-4">Profit factor by side</h3>
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center">
                  <div className="relative h-20 w-20 mb-2">
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
                  <div className="relative h-20 w-20 mb-2">
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
      </div>
    </section>
  );
};
