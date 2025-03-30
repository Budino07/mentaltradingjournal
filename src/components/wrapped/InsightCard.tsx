
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, Flame, TrendingDown, Clock, Target, 
  Hourglass, Smile, Activity, Calendar, ChevronLeft, ChevronRight 
} from "lucide-react";
import { InsightData } from "@/types/wrapped";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type InsightProps = {
  insight: {
    type: string;
    data: InsightData;
  };
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalInsights: number;
};

export const InsightCard: React.FC<InsightProps> = ({ 
  insight, 
  onNext, 
  onPrevious,
  currentIndex,
  totalInsights
}) => {
  const { type, data } = insight;

  // Background animations based on insight type
  const getBackgroundClass = () => {
    switch (type) {
      case "winRate":
        return "bg-gradient-to-br from-green-500/20 to-blue-500/20";
      case "streak":
        return "bg-gradient-to-br from-yellow-500/20 to-red-500/20";
      case "losingStreak":
        return "bg-gradient-to-br from-red-500/20 to-purple-500/20";
      case "activeTime":
        return "bg-gradient-to-br from-blue-500/20 to-indigo-500/20";
      case "favoriteSetup":
        return "bg-gradient-to-br from-indigo-500/20 to-pink-500/20";
      case "holdingTime":
        return "bg-gradient-to-br from-pink-500/20 to-orange-500/20";
      case "moodPerformance":
        return "bg-gradient-to-br from-primary/20 to-green-500/20";
      case "overtrading":
        return "bg-gradient-to-br from-orange-500/20 to-red-500/20";
      case "emotionalHeatmap":
        return "bg-gradient-to-br from-purple-500/20 to-primary/20";
      default:
        return "bg-gradient-to-br from-gray-500/20 to-blue-500/20";
    }
  };

  // Animated dots background
  const BackgroundAnimation = () => (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div className="absolute top-0 left-0 w-full h-full flex flex-wrap gap-3 animate-pulse">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>
    </div>
  );

  // Icon selector based on insight type
  const getIcon = () => {
    switch (type) {
      case "winRate":
        return <Trophy className="h-8 w-8 text-green-500" />;
      case "streak":
        return <Flame className="h-8 w-8 text-yellow-500" />;
      case "losingStreak":
        return <TrendingDown className="h-8 w-8 text-red-500" />;
      case "activeTime":
        return <Clock className="h-8 w-8 text-blue-500" />;
      case "favoriteSetup":
        return <Target className="h-8 w-8 text-indigo-500" />;
      case "holdingTime":
        return <Hourglass className="h-8 w-8 text-pink-500" />;
      case "moodPerformance":
        return <Smile className="h-8 w-8 text-primary" />;
      case "overtrading":
        return <Activity className="h-8 w-8 text-orange-500" />;
      case "emotionalHeatmap":
        return <Calendar className="h-8 w-8 text-purple-500" />;
      default:
        return <Trophy className="h-8 w-8 text-primary" />;
    }
  };

  // Generate title based on insight type
  const getTitle = () => {
    switch (type) {
      case "winRate":
        return "Win Rate";
      case "streak":
        return "Winning Streak";
      case "losingStreak":
        return "Challenges Faced";
      case "activeTime":
        return "Prime Trading Hours";
      case "favoriteSetup":
        return "Your Go-To Strategy";
      case "holdingTime":
        return "Trade Duration";
      case "moodPerformance":
        return "Mood Impact";
      case "overtrading":
        return "Trading Frequency";
      case "emotionalHeatmap":
        return "Emotional Patterns";
      default:
        return "Trading Insight";
    }
  };

  // Navigation buttons are now directly on the insight card
  const NavigationButtons = () => (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        disabled={currentIndex === totalInsights - 1}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <Card className={cn(
      "border-0 shadow-lg relative overflow-hidden transition-all duration-500 animate-fade-in",
      getBackgroundClass()
    )}>
      <BackgroundAnimation />
      <NavigationButtons />
      
      <CardContent className="p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="mb-2 p-3 bg-background rounded-full shadow-lg">
          {getIcon()}
        </div>
        
        <h3 className="text-2xl font-bold mt-4 mb-3">
          {getTitle()}
        </h3>
        
        <div className="text-4xl font-extrabold mb-4 text-primary animate-scale-in">
          {data.value}
        </div>
        
        <p className="text-lg max-w-md">
          {data.description}
        </p>
        
        {data.additionalInfo && (
          <div className="mt-4 text-sm text-muted-foreground max-w-md">
            {data.additionalInfo}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
