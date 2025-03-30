
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Calendar } from "lucide-react";

interface EmotionalHeatmapInsightProps {
  data: WrappedMonthData;
}

export const EmotionalHeatmapInsight: React.FC<EmotionalHeatmapInsightProps> = ({ data }) => {
  const weekdays = [
    { day: 'monday', label: 'Mon' },
    { day: 'tuesday', label: 'Tue' },
    { day: 'wednesday', label: 'Wed' },
    { day: 'thursday', label: 'Thur' },
    { day: 'friday', label: 'Fri' }
  ];
  
  const getEmotionColorClass = (emotion: string) => {
    switch (emotion) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getEmotionName = (emotion: string) => {
    switch (emotion) {
      case 'positive': return 'Positive';
      case 'negative': return 'Negative';
      default: return 'Neutral';
    }
  };
  
  // Find the most common emotion
  const emotionCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  Object.values(data.emotionalHeatmap).forEach(emotion => {
    if (emotion === 'positive') emotionCounts.positive++;
    else if (emotion === 'negative') emotionCounts.negative++;
    else emotionCounts.neutral++;
  });
  
  const mostCommonEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-violet-500/10 p-6 rounded-full">
        <Calendar className="h-12 w-12 text-violet-500 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Emotional Heatmap</h2>
        <p className="text-lg text-muted-foreground">Your emotional patterns throughout the week</p>
      </div>
      
      <div className="w-full max-w-md mt-4">
        <div className="grid grid-cols-5 gap-2">
          {weekdays.map(({ day, label }) => (
            <div key={day} className="flex flex-col items-center">
              <div className="text-sm font-medium mb-2">{label}</div>
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center opacity-80 ${getEmotionColorClass(data.emotionalHeatmap[day])}`}
              >
                <span className="text-white font-medium text-xs">
                  {getEmotionName(data.emotionalHeatmap[day]).substring(0, 3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 max-w-xs">
        <p className="text-lg">
          {mostCommonEmotion === 'positive' 
            ? "You're generally in a positive mood during trading days!" 
            : mostCommonEmotion === 'negative'
              ? "You tend to feel negative during trading days. Consider some pre-trading meditation."
              : "You maintain a balanced emotional state throughout most trading days."}
        </p>
      </div>
    </div>
  );
};
