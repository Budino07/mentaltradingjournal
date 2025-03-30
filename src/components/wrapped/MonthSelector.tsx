
import React from 'react';
import { WrappedMonth } from '@/utils/wrappedUtils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  months: WrappedMonth[];
  selectedMonth: WrappedMonth | null;
  onChange: (month: WrappedMonth) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ 
  months, 
  selectedMonth, 
  onChange 
}) => {
  const groupedByYear: Record<number, WrappedMonth[]> = {};
  
  // Group months by year
  months.forEach(month => {
    if (!groupedByYear[month.year]) {
      groupedByYear[month.year] = [];
    }
    groupedByYear[month.year].push(month);
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Select Month</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedByYear).map(([year, yearMonths]) => (
          <div key={year} className="space-y-2">
            <h3 className="text-lg font-medium text-muted-foreground">{year}</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {yearMonths.map(month => (
                <button
                  key={`${month.year}-${month.month}`}
                  onClick={() => month.hasData && onChange(month)}
                  disabled={!month.hasData}
                  className={cn(
                    "p-3 flex items-center justify-between rounded-md transition-colors",
                    month.hasData ? "hover:bg-accent/50 cursor-pointer" : "opacity-50 cursor-not-allowed",
                    selectedMonth?.month === month.month && selectedMonth?.year === month.year ? "bg-accent/50" : "bg-card"
                  )}
                >
                  <span>{month.month}</span>
                  {month.hasData ? (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 text-xs">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 text-xs">No data</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
