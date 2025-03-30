
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Trophy, TrendingUp } from "lucide-react";

interface WinRateInsightProps {
  data: WrappedMonthData;
}

export const WinRateInsight: React.FC<WinRateInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      {/* Trophy icon with glowing effect */}
      <div className="bg-primary/20 p-6 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30 rounded-full animate-pulse-slow"></div>
        <Trophy className="h-12 w-12 text-primary relative z-10" />
      </div>
      
      {/* Win rate percentage */}
      <div className="space-y-2 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl -z-10"></div>
        <h2 className="text-4xl font-bold">{data.winRate.toFixed(1)}%</h2>
        <p className="text-2xl text-muted-foreground">Win Rate</p>
      </div>
      
      {/* Strategy tip */}
      <div className="mt-4 text-lg backdrop-blur-sm rounded-lg p-4 bg-primary/5 border border-primary/10">
        <p className="flex items-center justify-center gap-2">
          <TrendingUp className={data.winRate >= 50 ? "text-green-500" : "text-primary"} />
          <span>
            {data.winRate >= 50 
              ? "You're winning more trades than you're losing!" 
              : "Keep refining your strategy to improve your win rate."}
          </span>
        </p>
      </div>
      
      {/* 3D geometric background elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Large blurry circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full mix-blend-lighten animate-float"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              background: `rgba(155, 135, 245, ${0.05 + Math.random() * 0.1})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(30px)',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
        
        {/* Small sharp geometric shapes */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute mix-blend-lighten animate-float"
            style={{
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              background: `rgba(155, 135, 245, ${0.1 + Math.random() * 0.3})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 5}s`,
              borderRadius: Math.random() > 0.7 ? '50%' : '0',
              transform: `rotate(${Math.random() * 45}deg) scale(${0.8 + Math.random() * 0.5})`,
              opacity: 0.6 + Math.random() * 0.4
            }}
          />
        ))}
      </div>
    </div>
  );
};
