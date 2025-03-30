
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrevious]);

  return (
    <Card className="min-h-[500px] md:min-h-[600px] border-primary/20 animate-scale-in transition-all duration-300 relative overflow-hidden">
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

      {/* Gradient background effect inspired by the image */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-red-500/30 opacity-30"
        style={{ 
          transform: 'rotate(-10deg) scale(1.5)',
          filter: 'blur(60px)'
        }}
      />

      <CardContent className="p-6 flex flex-col h-full relative z-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary">{insight.title}</h3>
          <div className="text-sm text-muted-foreground">{currentIndex + 1}/{totalInsights}</div>
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
