
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

interface TradeExitSectionProps {
  formData: {
    exitDate: string;
    exitPrice: number;
    pnl: number;
    highestPrice: number;
    lowestPrice: number;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TradeExitSection({ formData, onInputChange }: TradeExitSectionProps) {
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
        id: 'exitDate',
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-4 p-6 bg-background/50 border rounded-lg">
      <h3 className="text-lg font-semibold">Trade Exit</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="exitDate">Exit Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.exitDate ? new Date(formData.exitDate) : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Input
          type="datetime-local"
          id="exitDate"
          value={formData.exitDate}
          onChange={onInputChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exitPrice">Exit Price</Label>
        <Input
          type="number"
          id="exitPrice"
          value={formData.exitPrice || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pnl">Profit & Loss</Label>
        <Input
          type="number"
          id="pnl"
          value={formData.pnl || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highestPrice">Highest Price</Label>
        <Input
          type="number"
          id="highestPrice"
          value={formData.highestPrice || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowestPrice">Lowest Price</Label>
        <Input
          type="number"
          id="lowestPrice"
          value={formData.lowestPrice || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>
    </div>
  );
}
