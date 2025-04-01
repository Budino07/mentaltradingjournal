
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
    <div className="flex flex-wrap gap-2">
      {mistakes.map((mistake, index) => (
        <Badge 
          key={index} 
          variant="destructive" 
          className="bg-destructive/20 hover:bg-destructive/30 text-red-500 border border-red-500/30 font-medium"
        >
          {formatMistakeText(mistake)}
        </Badge>
      ))}
    </div>
  );
};
