
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ThumbsUp, Equal, ThumbsDown, XCircle, Activity } from "lucide-react";

interface TradingOutcomeSectionProps {
  selectedOutcome: string;
  setSelectedOutcome: (outcome: string) => void;
}

export const TradingOutcomeSection = ({
  selectedOutcome,
  setSelectedOutcome,
}: TradingOutcomeSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Trading Outcome</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select the outcome of your trading session
      </p>
      <RadioGroup
        value={selectedOutcome}
        onValueChange={setSelectedOutcome}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div>
          <RadioGroupItem value="win" id="win" className="peer sr-only" />
          <Label
            htmlFor="win"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-primary/5 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors duration-200"
          >
            <ThumbsUp className="mb-2 h-5 w-5 text-green-500" />
            <span>Win</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="breakeven" id="breakeven" className="peer sr-only" />
          <Label
            htmlFor="breakeven"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-primary/5 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors duration-200"
          >
            <Equal className="mb-2 h-5 w-5 text-gray-500" />
            <span>Breakeven</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="loss" id="loss" className="peer sr-only" />
          <Label
            htmlFor="loss"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-primary/5 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors duration-200"
          >
            <ThumbsDown className="mb-2 h-5 w-5 text-red-500" />
            <span>Loss</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="open_trade" id="open_trade" className="peer sr-only" />
          <Label
            htmlFor="open_trade"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-primary/5 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors duration-200"
          >
            <Activity className="mb-2 h-5 w-5 text-yellow-500" />
            <span>Open Trade</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="no_trades" id="no_trades" className="peer sr-only" />
          <Label
            htmlFor="no_trades"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-primary/5 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors duration-200"
          >
            <XCircle className="mb-2 h-5 w-5 text-blue-500" />
            <span>No Trades</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
