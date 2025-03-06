
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getInitialCapital, setInitialCapital, formatCurrency } from "@/utils/capitalUtils";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export const CapitalSettingsDialog = ({ onSave }: { onSave?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [capital, setCapital] = useState(() => getInitialCapital());
  const [inputValue, setInputValue] = useState(capital.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const newCapital = parseFloat(inputValue);
      if (isNaN(newCapital) || newCapital <= 0) {
        setError("Please enter a valid positive number");
        return;
      }
      
      setInitialCapital(newCapital);
      setCapital(newCapital);
      setError(null);
      setOpen(false);
      toast.success("Initial capital updated");
      
      if (onSave) {
        onSave();
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>Initial Capital: {formatCurrency(capital)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Initial Capital</DialogTitle>
          <DialogDescription>
            Set your initial trading capital for accurate performance calculations
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="capital">Initial Trading Capital</Label>
            <Input
              id="capital"
              type="number"
              min="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your initial capital"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <p className="text-sm text-muted-foreground">
            This amount is used as the base for calculating performance percentages.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
