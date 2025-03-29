
import { Badge } from "@/components/ui/badge";
import { useCalendarMode } from "@/contexts/CalendarModeContext";

interface EmotionBadgeProps {
  emotion: string;
  detail: string;
}

export const EmotionBadge = ({ emotion, detail }: EmotionBadgeProps) => {
  const { mode } = useCalendarMode();

  const getEmotionStyles = (emotion: string) => {
    // Performance mode always uses the same styling regardless of emotion
    if (mode === 'performance') {
      return 'border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/40';
    }

    // Emotion mode styling
    switch (emotion.toLowerCase()) {
      case 'positive':
        return 'border-green-500/50 text-green-600 bg-green-500/5 hover:bg-green-500/10';
      case 'neutral':
        return 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800/40';
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
