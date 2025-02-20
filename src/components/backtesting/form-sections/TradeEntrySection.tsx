
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

interface TradeEntrySectionProps {
  formData: {
    entryDate: string;
    entryPrice: number;
    quantity: number;
    stopLoss: number;
    takeProfit: number;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TradeEntrySection({ formData, onInputChange }: TradeEntrySectionProps) {
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
      <h3 className="text-lg font-semibold">Trade Entry</h3>
      
      <div className="space-y-2">
        <Label htmlFor="entryDate">Entry Date & Time</Label>
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
        <Label htmlFor="entryPrice">Entry Price</Label>
        <Input
          type="number"
          id="entryPrice"
          value={formData.entryPrice || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          type="number"
          id="quantity"
          value={formData.quantity || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stopLoss">Stop Loss</Label>
        <Input
          type="number"
          id="stopLoss"
          value={formData.stopLoss || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="takeProfit">Take Profit</Label>
        <Input
          type="number"
          id="takeProfit"
          value={formData.takeProfit || ''}
          onChange={onInputChange}
          placeholder="0.00"
          step="0.01"
        />
      </div>
    </div>
  );
}
