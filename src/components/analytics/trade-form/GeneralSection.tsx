import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trade } from "@/types/trade";
import { SetupSelector } from "./SetupSelector";
import { useEffect, useState } from "react";

interface GeneralSectionProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
  formValues?: Partial<Trade>;
  onSetupChange?: (setup: string) => void;
}

export const GeneralSection = ({ 
  direction, 
  setDirection, 
  formValues, 
  onSetupChange 
}: GeneralSectionProps) => {
  const [setupValue, setSetupValue] = useState(formValues?.setup || "");

  // Ensure setup value is synchronized
  useEffect(() => {
    if (formValues?.setup !== undefined) {
      setSetupValue(formValues.setup || "");
      
      // Ensure hidden input is updated
      setTimeout(() => {
        const setupInput = document.querySelector('input[name="setup"]') as HTMLInputElement;
        if (setupInput) {
          setupInput.value = formValues.setup || "";
        }
      }, 50);
    }
  }, [formValues?.setup]);

  const handleSetupChange = (setup: string) => {
    setSetupValue(setup);
    
    if (onSetupChange) {
      onSetupChange(setup);
    }
    
    // Update hidden input
    const setupInput = document.querySelector('input[name="setup"]') as HTMLInputElement;
    if (setupInput) {
      setupInput.value = setup;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">General</h3>
      <div className="space-y-3">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="entryDate">Entry Date</Label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              id="entryDate"
              name="entryDate"
              className="w-full"
              defaultValue={formValues?.entryDate || ""}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setTodayDate('entryDate')}
            >
              Today
            </Button>
          </div>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="instrument">Instrument *</Label>
          <Input
            type="text"
            id="instrument"
            name="instrument"
            placeholder="e.g., EUR/USD, AAPL"
            defaultValue={formValues?.instrument || ""}
          />
        </div>
        
        <SetupSelector 
          value={setupValue}
          onChange={handleSetupChange}
        />
        
        <input 
          type="hidden" 
          name="setup" 
          value={setupValue || ""} 
          id="setup-hidden-input"
        />
        
        <div className="grid w-full gap-1.5">
          <Label>Direction *</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={direction === 'buy' ? 'default' : 'outline'}
              className={direction === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setDirection('buy')}
            >
              Buy
            </Button>
            <Button
              type="button"
              size="sm"
              variant={direction === 'sell' ? 'default' : 'outline'}
              className={direction === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setDirection('sell')}
            >
              Sell
            </Button>
          </div>
          {/* Hidden input to store the direction value for form submission */}
          <input 
            type="hidden" 
            name="direction" 
            value={direction || ''} 
          />
        </div>
      </div>
    </div>
  );
};
