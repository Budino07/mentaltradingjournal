
import { DayProps } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateDayStats, formatCurrency } from "./calendarUtils";
import { Trade } from "@/types/trade";
import { Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { WeeklyReviewDialog } from "../weekly/WeeklyReviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  
  const isToday = dayDate.toDateString() === new Date().toDateString();
  const hasEntries = stats !== null;
  const isSaturday = dayDate.getDay() === 6;

  useEffect(() => {
    // Check if weekly review exists for this day
    const checkWeeklyReview = async () => {
      if (!user || !isSaturday) return;
      
      try {
        const weekDate = dayDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('weekly_reviews')
          .select('id, strength, weakness, improvement')
          .eq('week_start_date', weekDate)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // Check if review exists and has at least one field filled
        const hasContent = data && (
          (data.strength && data.strength.trim() !== '') || 
          (data.weakness && data.weakness.trim() !== '') || 
          (data.improvement && data.improvement.trim() !== '')
        );
        
        setHasWeeklyReview(!!hasContent);
      } catch (error) {
        console.error('Error checking weekly review:', error);
      }
    };
    
    if (user && isSaturday) {
      checkWeeklyReview();
    }
  }, [user, dayDate, isSaturday]);

  const getPnLColor = (amount: number) => {
    if (amount === 0) return 'text-gray-500 dark:text-gray-400';
    return amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
  };

  const getBorderColor = (amount: number | null) => {
    if (!amount) return 'border-gray-200 dark:border-gray-700';
    if (amount > 0) return 'border-emerald-500 dark:border-emerald-500';
    if (amount < 0) return 'border-red-500 dark:border-red-500';
    return 'border-gray-200 dark:border-gray-700';
  };

  const dayButton = (
    <button 
      onClick={() => onSelect(dayDate)}
      className={`
        ${className || ''} 
        relative flex flex-col h-full w-full
        border-2 ${getBorderColor(stats?.totalPL || null)}
        rounded-lg
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
              {hasWeeklyReview ? (
                <Circle 
                  className="h-4 w-4 text-primary cursor-pointer hover:text-primary-dark transition-colors fill-primary"
                  onClick={() => {
                    setIsWeeklyReviewOpen(true);
                  }}
                />
              ) : (
                <Circle 
                  className="h-4 w-4 text-primary cursor-pointer hover:text-primary-dark transition-colors"
                  onClick={() => {
                    setIsWeeklyReviewOpen(true);
                  }}
                />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasWeeklyReview ? "View Weekly Review" : "Weekly Review"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <WeeklyReviewDialog 
        open={isWeeklyReviewOpen}
        onOpenChange={(open) => {
          setIsWeeklyReviewOpen(open);
          // Refresh the weekly review status when dialog is closed
          if (!open) {
            const checkWeeklyReview = async () => {
              if (!user || !isSaturday) return;
              
              try {
                const weekDate = dayDate.toISOString().split('T')[0];
                
                const { data, error } = await supabase
                  .from('weekly_reviews')
                  .select('id, strength, weakness, improvement')
                  .eq('week_start_date', weekDate)
                  .eq('user_id', user.id)
                  .maybeSingle();
                  
                if (error) throw error;
                
                const hasContent = data && (
                  (data.strength && data.strength.trim() !== '') || 
                  (data.weakness && data.weakness.trim() !== '') || 
                  (data.improvement && data.improvement.trim() !== '')
                );
                
                setHasWeeklyReview(!!hasContent);
              } catch (error) {
                console.error('Error checking weekly review:', error);
              }
            };
            
            checkWeeklyReview();
          }
        }}
        weekNumber={Math.ceil(dayDate.getDate() / 7)}
        selectedDate={dayDate}
        onReviewSaved={() => setHasWeeklyReview(true)}
      />
    </div>
  );
};
