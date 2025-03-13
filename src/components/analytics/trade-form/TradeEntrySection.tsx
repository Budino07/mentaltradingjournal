
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trade } from "@/types/trade";
import { useEffect, useState } from "react";

interface TradeEntrySectionProps {
  formValues?: Partial<Trade>;
}

export const TradeEntrySection = ({ formValues }: TradeEntrySectionProps) => {
  const [forecastUrl, setForecastUrl] = useState(formValues?.forecastScreenshot || "");
  
  // Update state when formValues changes
  useEffect(() => {
    if (formValues?.forecastScreenshot) {
      setForecastUrl(formValues.forecastScreenshot);
    }
  }, [formValues]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">Trade Entry</h3>
      <div className="space-y-3">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="entryPrice">Entry Price *</Label>
          <Input
            type="number"
            id="entryPrice"
            name="entryPrice"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.entryPrice || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Enter lot size or contracts"
            step="0.000001"
            defaultValue={formValues?.quantity || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="stopLoss">Stop Loss</Label>
          <Input
            type="number"
            id="stopLoss"
            name="stopLoss"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.stopLoss || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="takeProfit">Take Profit</Label>
          <Input
            type="number"
            id="takeProfit"
            name="takeProfit"
            placeholder="0.000000"
            step="0.000001"
            defaultValue={formValues?.takeProfit || ""}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="forecastScreenshot">Forecast</Label>
          <Input
            type="url"
            id="forecastScreenshot"
            name="forecastScreenshot"
            placeholder="Enter screenshot URL"
            value={forecastUrl}
            onChange={(e) => setForecastUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
