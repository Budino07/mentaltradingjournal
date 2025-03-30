
import React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type MonthSelectorProps = {
  months: { value: string; label: string }[];
  onSelectMonth: (month: string) => void;
  isLoading: boolean;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({ 
  months, 
  onSelectMonth,
  isLoading 
}) => {
  if (months.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          No completed months available yet. Keep trading and check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {months.map((month) => (
        <Button
          key={month.value}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          onClick={() => onSelectMonth(month.value)}
          disabled={isLoading}
        >
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="font-medium">{month.label}</span>
        </Button>
      ))}
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse bg-primary/20" />
            <p className="text-sm text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      )}
    </div>
  );
};
