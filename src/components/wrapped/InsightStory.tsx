
import React, { useState, useEffect } from 'react';
import { WrappedInsight } from '@/utils/wrappedUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { Progress } from '@/components/ui/progress';
import confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface InsightStoryProps {
  insights: WrappedInsight[];
  month: string;
  year: number;
}

export const InsightStory: React.FC<InsightStoryProps> = ({ 
  insights,
  month,
  year
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const totalInsights = insights.length;
  const progress = ((currentIndex + 1) / totalInsights) * 100;

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
    <div className="relative">
      {showConfetti && <confetti width={width} height={height} recycle={false} />}
      
      <div className="mb-2 relative">
        <div className="flex gap-1 absolute top-0 left-0 right-0 z-10">
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
      
      <div className="relative min-h-[400px] md:min-h-[500px]">
        {insights.map((insight, index) => (
          <div 
            key={insight.id}
            className={`absolute top-0 left-0 right-0 transition-all duration-500 ${
              index === currentIndex 
                ? 'opacity-100 transform translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 transform -translate-x-full' 
                  : 'opacity-0 transform translate-x-full'
            }`}
            style={{ zIndex: index === currentIndex ? 1 : 0 }}
          >
            <InsightCard 
              insight={insight} 
              month={month}
              year={year}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-6 items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalInsights}
          </p>
        </div>
        
        {currentIndex < totalInsights - 1 ? (
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={restartStory}
            size="sm"
          >
            Restart
          </Button>
        )}
      </div>
    </div>
  );
};
