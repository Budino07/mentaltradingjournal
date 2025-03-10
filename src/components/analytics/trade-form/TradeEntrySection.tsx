
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

export const TradeEntrySection = () => {
  const [forecastUrl, setForecastUrl] = useState("");
  
  const openImageInNewTab = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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
          
          {forecastUrl && (
            <div className="mt-2">
              <div 
                onClick={() => openImageInNewTab(forecastUrl)} 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group"
              >
                <img 
                  src={forecastUrl} 
                  alt="Trade forecast" 
                  className="rounded-md border max-h-64 object-contain w-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
