
import { DayProps } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateDayStats, formatCurrency } from "./calendarUtils";
import { Trade } from "@/types/trade";
import { Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { WeeklyReviewDialog } from "../weekly/WeeklyReviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CalendarDayProps extends Omit<DayProps, 'displayMonth'> {
  entries: Array<{
    date: Date;
    emotion: string;
    trades?: Trade[];
  }>;
  onSelect: (date: Date) => void;
  className?: string;
}

export const CalendarDay = ({ 
  date: dayDate,
  entries,
  onSelect,
  className,
  ...props 
}: CalendarDayProps) => {
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [hasWeeklyReview, setHasWeeklyReview] = useState(false);
  const { user } = useAuth();
  
  const stats = calculateDayStats(
    entries.filter(entry => {
      const hasTradesOnThisDay = entry.trades?.some(trade => {
        const entryDate = trade.entryDate ? new Date(trade.entryDate) : null;
        return entryDate?.toDateString() === dayDate.toDateString();
      });
      
      return hasTradesOnThisDay || 
             new Date(entry.date).toDateString() === dayDate.toDateString();
    })
  );
  
  // Find the predominant emotion for this day
  const dayEntries = entries.filter(entry => 
    new Date(entry.date).toDateString() === dayDate.toDateString()
  );
  
  // Prioritize pre-session emotions if available
  const preSessionEntry = dayEntries.find(entry => entry.emotion);
  const predominantEmotion = preSessionEntry?.emotion || null;
  
  const isToday = dayDate.toDateString() === new Date().toDateString();
  const hasEntries = stats !== null;
  const isSaturday = dayDate.getDay() === 6;

  // Check if weekly review exists for this date
  useEffect(() => {
    const checkWeeklyReview = async () => {
      if (!user || !isSaturday) return;
      
      try {
        const weekDate = format(dayDate, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('weekly_reviews')
          .select('strength, weakness, improvement')
          .eq('week_start_date', weekDate)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking weekly review:', error);
          return;
        }

        // Check if any content exists
        const hasContent = data && (
          (data.strength && data.strength.trim() !== '') || 
          (data.weakness && data.weakness.trim() !== '') || 
          (data.improvement && data.improvement.trim() !== '')
        );
        
        console.log('Weekly review check for', weekDate, ':', data, 'Has content:', hasContent);
        
        setHasWeeklyReview(!!hasContent);
      } catch (error) {
        console.error('Error in checkWeeklyReview:', error);
      }
    };

    checkWeeklyReview();
  }, [user, dayDate, isSaturday]);

  const getEmotionColor = (emotion: string | null) => {
    if (!emotion) return 'border-gray-200 dark:border-gray-700';
    
    switch (emotion.toLowerCase()) {
      case 'positive':
        return 'border-accent dark:border-accent';
      case 'negative':
        return 'border-primary dark:border-primary';
      case 'neutral':
        return 'border-secondary dark:border-secondary';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getEmotionBackground = (emotion: string | null) => {
    if (!emotion) return '';
    
    switch (emotion.toLowerCase()) {
      case 'positive':
        return 'bg-accent/10';
      case 'negative':
        return 'bg-primary/10';
      case 'neutral':
        return 'bg-secondary/10';
      default:
        return '';
    }
  };

  const getPnLColor = (amount: number) => {
    if (amount === 0) return 'text-gray-500 dark:text-gray-400';
    return amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
  };

  const dayButton = (
    <button 
      onClick={() => onSelect(dayDate)}
      className={`
        ${className || ''} 
        relative flex flex-col h-full w-full
        border-2 ${getEmotionColor(predominantEmotion)}
        rounded-lg
        ${getEmotionBackground(predominantEmotion)}
        hover:border-primary hover:shadow-lg
        transition-all duration-200 ease-in-out
        overflow-hidden
        ${isToday ? 'border-primary-light dark:border-primary-light' : ''}
      `}
      {...props}
    >
      <div className="absolute top-2 right-2">
        <span className={`
          text-sm font-medium
          ${isToday ? 'bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent' : 'text-gray-500 dark:text-gray-400'}
        `}>
          {dayDate.getDate()}
        </span>
      </div>
      
      {stats && (stats.totalPL !== 0 || stats.numTrades > 0) && (
        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-900/90">
          <div className="space-y-1 text-center w-full">
            <p className={`text-lg font-semibold ${getPnLColor(stats.totalPL)}`}>
              {formatCurrency(stats.totalPL)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {stats.numTrades} trade{stats.numTrades !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </button>
  );

  return (
    <div className="w-full h-full p-0.5 relative">
      {hasEntries ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {dayButton}
          </TooltipTrigger>
          <TooltipContent>
            <p>Review your performance</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        dayButton
      )}
      {isSaturday && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Circle 
                className={`h-4 w-4 cursor-pointer transition-colors
                  ${hasWeeklyReview 
                    ? "fill-primary text-primary hover:text-primary-dark" 
                    : "text-primary hover:text-primary-dark"
                  }`}
                onClick={() => {
                  setIsWeeklyReviewOpen(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasWeeklyReview ? "View Weekly Review" : "Weekly Review"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <WeeklyReviewDialog 
        open={isWeeklyReviewOpen}
        onOpenChange={setIsWeeklyReviewOpen}
        weekNumber={Math.ceil(dayDate.getDate() / 7)}
        selectedDate={dayDate}
        onReviewSaved={() => setHasWeeklyReview(true)}
      />
    </div>
  );
};
