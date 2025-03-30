
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Pause, Play } from "lucide-react";
import { ThreeDBackground } from "../ThreeDBackground";

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
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Setup auto-advancing
  useEffect(() => {
    if (isAutoPlay) {
      const newTimer = setTimeout(() => {
        onNext();
      }, 5000); // Advance every 5 seconds
      setTimer(newTimer);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isAutoPlay, currentIndex, onNext]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (timer) clearTimeout(timer);
        onNext();
      } else if (e.key === 'ArrowLeft') {
        if (timer) clearTimeout(timer);
        onPrevious();
      } else if (e.key === ' ') {
        // Space bar toggles play/pause
        setIsAutoPlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrevious, timer]);

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  return (
    <Card className="min-h-[500px] md:min-h-[600px] border-primary/20 animate-scale-in transition-all duration-300 relative overflow-hidden">
      {/* 3D Background */}
      <ThreeDBackground />
      
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

      <CardContent className="p-6 flex flex-col h-full relative z-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary">{insight.title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAutoPlay}
              className="rounded-full h-8 w-8 hover:bg-primary/10"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="text-sm text-muted-foreground">{currentIndex + 1}/{totalInsights}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-6 overflow-hidden">
          {insight.component}
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onPrevious}
            className="rounded-full hover:bg-primary/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onNext}
            className="rounded-full hover:bg-primary/10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
