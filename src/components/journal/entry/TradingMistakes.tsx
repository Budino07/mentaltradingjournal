
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface TradingMistakesProps {
  mistakes: string[];
}

export const TradingMistakes = ({ mistakes }: TradingMistakesProps) => {
  // Function to format mistake text: capitalize first letter of each word and remove underscores
  const formatMistakeText = (mistake: string) => {
    return mistake
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Trading Mistakes:</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {mistakes.map((mistake, index) => (
          <Badge 
            key={index} 
            variant="destructive" 
            className="bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 font-medium"
          >
            {formatMistakeText(mistake)}
          </Badge>
        ))}
      </div>
    </div>
  );
};
