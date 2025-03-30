
import React, { useEffect, useRef } from 'react';
import { WrappedInsight } from '@/utils/wrappedUtils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: WrappedInsight;
  month: string;
  year: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
  insight,
  month,
  year
}) => {
  const valueRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Apply animation when the card appears
    const element = valueRef.current;
    if (element) {
      element.classList.add('animate-enter');
      
      return () => {
        element.classList.remove('animate-enter');
      };
    }
  }, [insight.id]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("py-6", insight.color)}>
        <div className="flex justify-between items-center text-white">
          <h3 className="text-xl font-bold">{month} {year}</h3>
          <div className="text-sm">Mental Wrapped</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col items-center text-center space-y-6">
        <div className="text-5xl my-4">{insight.icon}</div>
        
        <h2 className="text-2xl font-bold">{insight.title}</h2>
        
        <div 
          ref={valueRef}
          className={cn(
            "text-5xl md:text-6xl font-bold my-6",
            `animate-${insight.animation}`
          )}
        >
          {insight.value}
        </div>
        
        <p className="text-muted-foreground text-lg max-w-md">
          {insight.description}
        </p>
      </CardContent>
    </Card>
  );
};
