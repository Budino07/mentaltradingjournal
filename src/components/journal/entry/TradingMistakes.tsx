
import { Badge } from "@/components/ui/badge";

interface TradingMistakesProps {
  mistakes: string[];
}

export const TradingMistakes = ({ mistakes }: TradingMistakesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {mistakes.map((mistake, index) => (
        <Badge 
          key={index} 
          variant="destructive" 
          className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
        >
          {mistake}
        </Badge>
      ))}
    </div>
  );
};
