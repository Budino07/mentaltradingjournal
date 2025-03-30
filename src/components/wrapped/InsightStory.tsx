
import React, { useState, useEffect } from 'react';
import { WrappedInsight } from '@/utils/wrappedUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { InsightCard } from './InsightCard';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface InsightStoryProps {
  insights: WrappedInsight[];
  month: string;
  year: number;
  onClose?: () => void;
}

export const InsightStory: React.FC<InsightStoryProps> = ({ 
  insights,
  month,
  year,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const totalInsights = insights.length;

  // Show confetti when the story begins
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [month, year]);

  const goToNext = () => {
    if (currentIndex < totalInsights - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const restartStory = () => {
    setCurrentIndex(0);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="relative bg-background rounded-lg overflow-visible max-h-[90vh]">
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} />}
      
      {/* Header with close button */}
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">
          {month} {year} Wrapped
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-4 pt-2">
        <div className="mb-2 relative">
          <div className="flex gap-1">
            {insights.map((_, index) => (
              <div 
                key={index} 
                className="h-1 flex-1 rounded-full overflow-hidden bg-muted"
              >
                <div 
                  className={`h-full bg-primary transition-all duration-300 ${index <= currentIndex ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative min-h-[500px] md:min-h-[600px]">
          {insights.map((insight, index) => (
            <div 
              key={insight.id}
              className={`absolute top-0 left-0 right-0 transition-all duration-500 ${
                index === currentIndex 
                  ? 'opacity-100 transform translate-y-0' 
                  : index < currentIndex 
                    ? 'opacity-0 transform -translate-y-full' 
                    : 'opacity-0 transform translate-y-full'
              }`}
              style={{ zIndex: index === currentIndex ? 1 : 0 }}
            >
              <InsightCard 
                insight={insight} 
                month={month}
                year={year}
                onPrevious={currentIndex > 0 ? goToPrevious : undefined}
                onNext={currentIndex < totalInsights - 1 ? goToNext : undefined}
                onRestart={currentIndex === totalInsights - 1 ? restartStory : undefined}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalInsights}
          </p>
        </div>
      </div>
    </div>
  );
};
