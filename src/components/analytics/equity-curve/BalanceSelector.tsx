
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export interface BalanceSelectorProps {
  selectedBalance: number;
  onBalanceChange: (value: number) => void;
}

export const BalanceSelector = ({ 
  selectedBalance,
  onBalanceChange
}: BalanceSelectorProps) => {
  const balanceOptions = [1000, 5000, 10000, 25000, 50000, 100000];
  
  const handleBalanceChange = (value: string) => {
    onBalanceChange(parseInt(value, 10));
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Initial Balance:</span>
      <Select
        value={selectedBalance.toString()}
        onValueChange={handleBalanceChange}
      >
        <SelectTrigger className="h-8 w-28">
          <SelectValue placeholder="Select balance" />
        </SelectTrigger>
        <SelectContent>
          {balanceOptions.map((amount) => (
            <SelectItem key={amount} value={amount.toString()}>
              ${amount.toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
