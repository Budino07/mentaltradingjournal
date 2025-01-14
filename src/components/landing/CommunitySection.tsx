import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NetworkNode = ({ className = "", delay = "0", symbol = "?" }: { className?: string; delay?: string; symbol?: string }) => (
  <div 
    className={`absolute w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
    animate-pulse ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className="relative w-full h-full">
      <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-primary/30 to-accent/30" />
      <div className="absolute inset-1 rounded-full bg-[#1A1F2C]/80" />
      <div className="absolute inset-0 flex items-center justify-center text-primary-light font-bold text-sm">
        {symbol}
      </div>
    </div>
  </div>
);

const NetworkLine = ({ className = "", from = "", to = "" }: { className?: string; from?: string; to?: string }) => (
  <div 
    className={`absolute h-px bg-gradient-to-r from-primary/20 via-accent/20 to-transparent ${className}`}
    style={{
      width: '120px',
      transformOrigin: 'left center',
      transform: `rotate(${Math.random() * 360}deg)`
    }}
  />
);

export const CommunitySection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join Our Global Trading Community
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with traders worldwide who are mastering their psychology and improving their performance
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Global Reach</h3>
              <p className="text-muted-foreground">
                Join traders from over 50 countries sharing insights and experiences
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Active Community</h3>
              <p className="text-muted-foreground">
                Engage with thousands of traders focused on psychological growth
              </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/login")} 
            size="lg"
            className="w-full md:w-auto"
          >
            Join the Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-[#1A1F2C]/50 backdrop-blur-sm border border-white/10">
          {/* Network Visualization */}
          <div className="absolute inset-0">
            {/* Nodes with Trading Symbols */}
            <NetworkNode className="top-10 left-10" delay="0s" symbol="📈" />
            <NetworkNode className="top-20 right-20" delay="0.2s" symbol="💭" />
            <NetworkNode className="bottom-20 left-1/4" delay="0.4s" symbol="📊" />
            <NetworkNode className="top-1/3 right-1/4" delay="0.6s" symbol="🎯" />
            <NetworkNode className="bottom-10 right-10" delay="0.8s" symbol="📝" />
            <NetworkNode className="top-1/2 left-20" delay="1s" symbol="⚡" />
            <NetworkNode className="bottom-1/3 right-1/3" delay="1.2s" symbol="💡" />
            
            {/* Center Node - Mental Logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/40" />
              <div className="absolute inset-0 flex items-center justify-center text-primary-light font-bold text-xl">
                M
              </div>
            </div>

            {/* Connection Lines - Creating a network effect */}
            <div className="absolute inset-0">
              {/* Connecting lines from center to nodes */}
              <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2">
                {/* Radial connecting lines */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div
                    key={angle}
                    className="absolute h-px bg-gradient-to-r from-primary/30 via-accent/30 to-transparent"
                    style={{
                      width: '150px',
                      transformOrigin: 'left center',
                      transform: `rotate(${angle}deg)`,
                      left: '50%',
                      top: '50%'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Animated Particles */}
            <div className="absolute inset-0">
              <div className="absolute w-2 h-2 rounded-full bg-primary/50 animate-ping" style={{ top: '20%', left: '30%' }} />
              <div className="absolute w-2 h-2 rounded-full bg-accent/50 animate-ping" style={{ top: '70%', right: '25%', animationDelay: '1s' }} />
              <div className="absolute w-2 h-2 rounded-full bg-primary-light/50 animate-ping" style={{ top: '40%', right: '40%', animationDelay: '2s' }} />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#1A1F2C]/50" />
          </div>
        </div>
      </div>
    </section>
  );
};