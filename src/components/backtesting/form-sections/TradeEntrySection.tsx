
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TradeEntrySectionProps {
  formData: {
    entryPrice: number;
    quantity: number;
    stopLoss: number;
    takeProfit: number;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TradeEntrySection({ formData, onInputChange }: TradeEntrySectionProps) {
  return (
    <div className="space-y-4 p-6 bg-background/50 border rounded-lg">
      <h3 className="text-lg font-semibold">Trade Entry</h3>
      
      <div className="space-y-2">
        <Label htmlFor="entryPrice">Entry Price *</Label>
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
          placeholder="Enter lot size or contracts"
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
