
import React from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WrappedSelectorProps {
  availableMonths: string[];
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

export const WrappedSelector: React.FC<WrappedSelectorProps> = ({
  availableMonths,
  selectedMonth,
  onSelectMonth,
}) => {
  const formatMonthForDisplay = (monthKey: string) => {
    // Parse the yyyy-MM format to a date and format it
    const date = parse(monthKey, 'yyyy-MM', new Date());
    return format(date, 'MMMM yyyy');
  };

  const handlePrevious = () => {
    if (!selectedMonth) return;
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (currentIndex < availableMonths.length - 1) {
      onSelectMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (!selectedMonth) return;
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (currentIndex > 0) {
      onSelectMonth(availableMonths[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePrevious}
              disabled={!selectedMonth || availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-center">
                {selectedMonth ? formatMonthForDisplay(selectedMonth) : 'Select a month'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedMonth && `${availableMonths.indexOf(selectedMonth) + 1} of ${availableMonths.length}`}
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleNext}
              disabled={!selectedMonth || availableMonths.indexOf(selectedMonth) === 0}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
