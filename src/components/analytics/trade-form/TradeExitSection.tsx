
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trade } from "@/types/trade";
import { useEffect, useState } from "react";

interface TradeExitSectionProps {
  formValues?: Partial<Trade>;
}

export const TradeExitSection = ({ formValues }: TradeExitSectionProps) => {
  const [resultUrl, setResultUrl] = useState(formValues?.resultUrl || "");
  
  // Update state when formValues changes
  useEffect(() => {
    if (formValues?.resultUrl) {
      setResultUrl(formValues.resultUrl);
    }
  }, [formValues]);
  
  const setTodayDate = (inputId: string) => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = localDateTime;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">Trade Exit</h3>
      <div className="space-y-3">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="exitDate">Exit Date</Label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              id="exitDate"
              name="exitDate"
              className="w-full"
              defaultValue={formValues?.exitDate || ""}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setTodayDate('exitDate')}
            >
              Today
            </Button>
          </div>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="exitPrice">Exit Price</Label>
          <Input
            type="number"
            id="exitPrice"
            name="exitPrice"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.exitPrice || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="pnl">Profit & Loss</Label>
          <Input
            type="number"
            id="pnl"
            name="pnl"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.pnl || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="highestPrice">Highest Price</Label>
          <Input
            type="number"
            id="highestPrice"
            name="highestPrice"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.highestPrice || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="lowestPrice">Lowest Price</Label>
          <Input
            type="number"
            id="lowestPrice"
            name="lowestPrice"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.lowestPrice || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="resultUrl">Result</Label>
          <Input
            type="url"
            id="resultUrl"
            name="resultUrl"
            placeholder="Enter result screenshot URL"
            value={resultUrl}
            onChange={(e) => setResultUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
