
import { DayProps } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateDayStats, formatCurrency, getEmotionStyle } from "./calendarUtils";
import { Trade } from "@/types/trade";
import { Circle } from "lucide-react";
import { useState } from "react";
import { WeeklyReviewDialog } from "../weekly/WeeklyReviewDialog";

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
  const stats = calculateDayStats(
    entries.filter(entry => {
      const hasClosedTradesOnThisDay = entry.trades?.some(trade => {
        const exitDate = trade.exitDate ? new Date(trade.exitDate) : null;
        return exitDate?.toDateString() === dayDate.toDateString();
      });
      
      return hasClosedTradesOnThisDay || 
             new Date(entry.date).toDateString() === dayDate.toDateString();
    })
  );
  
  const style = getEmotionStyle(stats);
  const isToday = dayDate.toDateString() === new Date().toDateString();
  const hasEntries = stats !== null;
  const isSaturday = dayDate.getDay() === 6;

  const getPnLColor = (amount: number) => {
    if (amount === 0) return 'text-gray-500 dark:text-gray-400';
    return amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
  };

  const dayButton = (
    <button 
      onClick={() => onSelect(dayDate)}
      className={`
        ${className || ''} 
        ${style?.bg || 'hover:bg-gray-50 dark:hover:bg-gray-800'}
        ${style?.border || ''}
        ${style?.shadow || ''}
        relative flex flex-col h-full w-full
        border-2 border-gray-200 dark:border-gray-700 rounded-lg
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
      
      {stats && (
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
                className="h-4 w-4 text-primary cursor-pointer hover:text-primary-dark transition-colors"
                onClick={() => {
                  setIsWeeklyReviewOpen(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Weekly Review</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <WeeklyReviewDialog 
        open={isWeeklyReviewOpen}
        onOpenChange={setIsWeeklyReviewOpen}
        weekNumber={Math.ceil(dayDate.getDate() / 7)}
        selectedDate={dayDate}
      />
    </div>
  );
};
