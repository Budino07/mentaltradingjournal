import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GeneralSectionProps {
  formData: {
    entryDate: string;
    instrument: string;
    setup: string;
  };
  direction: 'buy' | 'sell' | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDirectionSelect: (direction: 'buy' | 'sell') => void;
}

export function GeneralSection({ formData, direction, onInputChange, onDirectionSelect }: GeneralSectionProps) {
  const [date, setDate] = useState<Date | undefined>(
    formData.entryDate ? new Date(formData.entryDate) : undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Preserve the time if there was a previous date selected
    if (date) {
      selectedDate.setHours(date.getHours(), date.getMinutes());
    } else {
      // Default to current time if no previous time
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes());
    }
    
    setDate(selectedDate);
    updateFormDate(selectedDate);
  };

  const updateFormDate = (selectedDate: Date) => {
    // Format the date to ISO string format but keep only the local part
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Create a synthetic event to match the expected type
    const syntheticEvent = {
      target: {
        id: 'entryDate',
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!date) {
      // If no date is selected, use today
      const newDate = new Date();
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes);
      setDate(newDate);
      updateFormDate(newDate);
    } else {
      // Update the time part of the existing date
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setDate(newDate);
      updateFormDate(newDate);
    }
  };

  const setToday = () => {
    const today = new Date();
    setDate(today);
    updateFormDate(today);
  };

  // Extract time from current date
  const timeValue = date ? 
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : 
    '';

  return (
    <div className="space-y-4 p-6 bg-background/50 border rounded-lg">
      <h3 className="text-lg font-semibold">General</h3>
      
      <div className="space-y-2">
        <Label htmlFor="entryDateTime">Entry Date & Time</Label>
        <div className="flex flex-col space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
                <div className="p-3 border-t border-border flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setToday()}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDate(undefined)}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="relative flex items-center">
              <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="pl-9"
              />
            </div>
          </div>

          <Input
            type="datetime-local"
            id="entryDate"
            value={formData.entryDate}
            onChange={onInputChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instrument">Instrument *</Label>
        <Input
          id="instrument"
          value={formData.instrument}
          onChange={onInputChange}
          placeholder="e.g., EUR/USD, AAPL"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="setup">Setup</Label>
        <Input
          id="setup"
          value={formData.setup}
          onChange={onInputChange}
          placeholder="Enter your trading setup"
        />
      </div>

      <div className="space-y-2">
        <Label>Direction *</Label>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={direction === 'buy' ? 'default' : 'outline'}
            onClick={() => onDirectionSelect('buy')}
            className={`w-full ${direction === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-green-500/10'}`}
          >
            Buy
          </Button>
          <Button
            type="button"
            variant={direction === 'sell' ? 'default' : 'outline'}
            onClick={() => onDirectionSelect('sell')}
            className={`w-full ${direction === 'sell' ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-red-500/10'}`}
          >
            Sell
          </Button>
        </div>
      </div>
    </div>
  );
}
