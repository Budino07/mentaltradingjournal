
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BalanceSelectorProps {
  initialBalance: number;
  onBalanceChange: (balance: number) => void;
}

export const BalanceSelector = ({ initialBalance, onBalanceChange }: BalanceSelectorProps) => {
  const [balance, setBalance] = useState(initialBalance.toString());

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBalance(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onBalanceChange(numValue);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <Label htmlFor="initialBalance" className="text-sm whitespace-nowrap">
        Initial Balance:
      </Label>
      <Input
        id="initialBalance"
        type="number"
        value={balance}
        onChange={handleBalanceChange}
        className="w-28 h-8 text-sm"
        min="1"
      />
    </div>
  );
};
