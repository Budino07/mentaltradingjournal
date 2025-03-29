
import { Badge } from "@/components/ui/badge";

interface EmotionBadgeProps {
  emotion: string;
  detail: string;
}

export const EmotionBadge = ({ emotion, detail }: EmotionBadgeProps) => {
  const getEmotionStyles = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'positive':
        return 'border-green-500/50 text-green-600 bg-green-500/5 hover:bg-green-500/10';
      case 'neutral':
        return 'border-gray-400 text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600';
      case 'negative':
        return 'border-red-500/50 text-red-500 bg-red-500/5 hover:bg-red-500/10';
      default:
        return '';
    }
  };

  const displayText = emotion.toLowerCase() === detail.toLowerCase() 
    ? emotion 
    : `${emotion} - ${detail}`;

  return (
    <Badge 
      variant="outline" 
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${getEmotionStyles(emotion)}`}
    >
      {displayText.charAt(0).toUpperCase() + displayText.slice(1)}
    </Badge>
  );
};
