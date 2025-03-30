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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternType = insight.id.includes('win') || insight.id.includes('profit') ? 'gradient' : 
                      insight.id.includes('time') ? 'bars' : 'stairs';
  
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationId: number;
    let time = 0;

    // Color scheme based on insight color
    const colorScheme = getColorScheme(insight.color);

    const drawPattern = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (patternType === 'gradient') {
        drawGradientPattern(ctx, canvas.width, canvas.height, time, colorScheme);
      } else if (patternType === 'stairs') {
        drawStairsPattern(ctx, canvas.width, canvas.height, time, colorScheme);
      } else if (patternType === 'bars') {
        drawBarsPattern(ctx, canvas.width, canvas.height, time, colorScheme);
      }

      animationId = requestAnimationFrame(drawPattern);
    };

    drawPattern();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [insight.color, patternType]);
  
  return (
    <Card className="overflow-hidden h-full">
      <div className="absolute inset-0 z-0 opacity-50">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full" 
        />
      </div>
      
      <CardHeader className={cn("py-6 relative z-10", insight.color)}>
        <div className="flex justify-between items-center text-white">
          <h3 className="text-xl font-bold">{month} {year}</h3>
          <div className="text-sm">Mental Wrapped</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col items-center text-center space-y-6 relative z-10">
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

// Helper functions for background patterns

function getColorScheme(color: string): string[] {
  // Extract colors from Tailwind classes like "bg-green-500"
  if (color.includes('green')) {
    return ['#10B981', '#059669', '#047857', '#065F46'];
  } else if (color.includes('blue')) {
    return ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'];
  } else if (color.includes('purple')) {
    return ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'];
  } else if (color.includes('orange')) {
    return ['#F97316', '#EA580C', '#C2410C', '#9A3412'];
  } else if (color.includes('yellow')) {
    return ['#FBBF24', '#F59E0B', '#D97706', '#B45309'];
  } else if (color.includes('indigo')) {
    return ['#6366F1', '#4F46E5', '#4338CA', '#3730A3'];
  } else if (color.includes('red')) {
    return ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'];
  } else if (color.includes('gray')) {
    return ['#6B7280', '#4B5563', '#374151', '#1F2937'];
  } else {
    return ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6']; // Default purple
  }
}

function drawGradientPattern(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  time: number, 
  colors: string[]
) {
  // Create moving gradient bands
  for (let i = 0; i < 12; i++) {
    const y = (height * 0.1) * i + (time * 100) % height;
    const gradient = ctx.createLinearGradient(0, y, width, y);
    
    const colorIndex = i % colors.length;
    gradient.addColorStop(0, colors[colorIndex]);
    gradient.addColorStop(1, colors[(colorIndex + 1) % colors.length]);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, y - 30);
    ctx.lineTo(width, y);
    ctx.lineTo(width, y + height * 0.1);
    ctx.lineTo(0, y + height * 0.1 - 30);
    ctx.closePath();
    ctx.fill();
  }
}

function drawStairsPattern(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  time: number, 
  colors: string[]
) {
  // Create moving stair pattern like in the image
  const steps = 15;
  const stepHeight = height / steps;
  
  for (let i = 0; i < steps; i++) {
    const offset = (time * 100) % (stepHeight * 2);
    const y = i * stepHeight - offset;
    
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width - i * (width / steps), y);
    ctx.lineTo(width - i * (width / steps), y + stepHeight);
    ctx.lineTo(0, y + stepHeight);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBarsPattern(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  time: number, 
  colors: string[]
) {
  // Create vertical moving bars
  const barCount = 10;
  const barWidth = width / barCount;
  
  for (let i = 0; i < barCount * 2; i++) {
    const x = (i * barWidth) + (time * 50) % (barWidth * 2) - barWidth;
    const barHeight = Math.sin(time + i * 0.5) * (height * 0.15) + (height * 0.3);
    const y = height - barHeight;
    
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.rect(x, y, barWidth - 5, barHeight);
    ctx.fill();
  }
}
