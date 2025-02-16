
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

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
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Preserve the local date by using the local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T00:00`;
    
    // Create a synthetic event to match the expected type
    const syntheticEvent = {
      target: {
        id: 'entryDate',
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-4 p-6 bg-background/50 border rounded-lg">
      <h3 className="text-lg font-semibold">General</h3>
      
      <div className="space-y-2">
        <Label htmlFor="entryDate">Entry Date & Time *</Label>
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            id="entryDate"
            value={formData.entryDate}
            onChange={onInputChange}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={formData.entryDate ? new Date(formData.entryDate) : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
