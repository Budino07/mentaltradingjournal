
import { useState } from "react";
import { DayPicker, SelectSingleEventHandler } from "react-day-picker";
import { CalendarDay } from "./calendar/CalendarDay";
import { Trade } from "@/types/trade";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarNavigation } from "./calendar/CalendarNavigation";
import { WeeklySummary } from "./calendar/WeeklySummary";

interface JournalCalendarProps {
  date?: Date;
  onDateSelect: (date: Date) => void;
  entries: Array<{
    date: Date;
    emotion: string;
    trades?: Trade[];
  }>;
}

export const JournalCalendar = ({
  date,
  onDateSelect,
  entries,
}: JournalCalendarProps) => {
  const [month, setMonth] = useState<Date>(date || new Date());

  const handleDaySelect: SelectSingleEventHandler = (day) => {
    if (day) {
      onDateSelect(day);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setMonth(newMonth);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="calendar-container bg-card/30 backdrop-blur-xl p-4 rounded-lg border border-primary/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CalendarNavigation
              month={month}
              onPrevious={handlePreviousMonth}
              onNext={handleNextMonth}
            />
          </div>
          <DayPicker
            mode="single"
            showOutsideDays
            defaultMonth={month}
            month={month}
            onMonthChange={handleMonthChange}
            selected={date}
            onSelect={handleDaySelect}
            components={{
              Day: (props) => (
                <CalendarDay
                  {...props}
                  entries={entries}
                  onSelect={onDateSelect}
                />
              ),
            }}
            className="custom-calendar text-foreground"
          />

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="flex items-center"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-80">
        <WeeklySummary entries={entries} currentDate={month} />
      </div>
    </div>
  );
};
