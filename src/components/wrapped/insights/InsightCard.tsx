
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InsightCardProps {
  insight: {
    id: string;
    title: string;
    component: React.ReactNode;
  };
  totalInsights: number;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  totalInsights,
  currentIndex,
  onNext,
  onPrevious
}) => {
  // Track if autoplay should be enabled
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  
  // Auto-play functionality that can be disabled
  useEffect(() => {
    if (!autoplayEnabled) return;
    
    const autoPlayInterval = setInterval(() => {
      onNext();
    }, 5000); // 5 seconds transition

    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [onNext, autoplayEnabled]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setAutoplayEnabled(false); // Disable autoplay on keyboard navigation
        onNext();
      } else if (e.key === 'ArrowLeft') {
        setAutoplayEnabled(false); // Disable autoplay on keyboard navigation
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrevious]);

  // Custom handlers to disable autoplay when buttons are clicked
  const handleNextClick = () => {
    setAutoplayEnabled(false);
    onNext();
  };

  const handlePreviousClick = () => {
    setAutoplayEnabled(false);
    onPrevious();
  };

  return (
    <Card className="h-[600px] border-primary/20 animate-scale-in transition-all duration-300 relative overflow-hidden">
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {Array.from({ length: totalInsights }).map((_, index) => (
          <div 
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary' : 
              index < currentIndex ? 'bg-primary/50' : 'bg-primary/20'
            }`}
          />
        ))}
      </div>

      {/* Dynamic animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Animated floating circles */}
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className="absolute rounded-full mix-blend-multiply animate-float"
              style={{
                width: `${40 + Math.random() * 100}px`,
                height: `${40 + Math.random() * 100}px`,
                background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${6 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                filter: 'blur(8px)'
              }}
            />
          ))}
        </div>
        
        {/* Primary gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-red-500/30 opacity-30"
          style={{ 
            transform: 'rotate(-10deg) scale(1.5)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <CardContent className="p-6 flex flex-col h-full relative z-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-primary">{insight.title}</h3>
          <div className="text-sm text-muted-foreground">{currentIndex + 1}/{totalInsights}</div>
        </div>

        <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden px-2 w-full scrollbar-thin">
            {insight.component}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousClick}
            className="rounded-full hover:bg-primary/10 backdrop-blur-md bg-white/10 border border-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextClick}
            className="rounded-full hover:bg-primary/10 backdrop-blur-md bg-white/10 border border-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
