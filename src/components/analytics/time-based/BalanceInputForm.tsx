
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BalanceInputFormProps {
  defaultValue: number;
  onSave: (balance: number) => void;
  isLoading: boolean;
}

export const BalanceInputForm = ({
  defaultValue,
  onSave,
  isLoading,
}: BalanceInputFormProps) => {
  const [value, setValue] = useState(defaultValue.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    
    onSave(numValue);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Trading Balance: ${defaultValue.toLocaleString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="trading-balance" className="text-sm">
        Trading Balance
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="trading-balance"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-7"
            placeholder="Enter your trading balance"
            min="1"
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          size="sm"
          className="whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
              Saving...
            </>
          ) : (
            "Save Balance"
          )}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
