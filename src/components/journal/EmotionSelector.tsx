
import { Button } from "@/components/ui/button";
import { SmilePlus, Meh, Frown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmotionSelectorProps {
  selectedEmotion: string;
  onEmotionSelect: (value: string) => void;
}

export const EmotionSelector = ({
  selectedEmotion,
  onEmotionSelect,
}: EmotionSelectorProps) => {
  const emotions = [
    { icon: SmilePlus, label: "Positive", value: "positive" },
    { icon: Meh, label: "Neutral", value: "neutral" },
    { icon: Frown, label: "Negative", value: "negative" },
  ];
  
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {emotions.map(({ icon: Icon, label, value }) => (
        <Button
          key={value}
          variant={selectedEmotion === value ? "default" : "outline"}
          className={`${isMobile ? 'h-20' : 'h-24'} group transition-all duration-300 ${
            selectedEmotion === value 
              ? "bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/20" 
              : "hover:bg-gradient-to-br hover:from-primary-hover hover:to-primary-light/30 hover:border-primary/50"
          }`}
          onClick={() => onEmotionSelect(value)}
        >
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <Icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} transition-transform duration-300 group-hover:scale-110 ${
              selectedEmotion === value ? "" : "text-primary group-hover:text-primary-dark"
            }`} />
            <span className={`font-medium ${
              selectedEmotion === value 
                ? "" 
                : "text-primary-dark group-hover:text-primary-dark"
            }`}>
              {label}
            </span>
          </div>
        </Button>
      ))}
    </div>
  );
};
