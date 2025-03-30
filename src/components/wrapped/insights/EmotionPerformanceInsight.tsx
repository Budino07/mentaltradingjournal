
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Smile, Meh, Frown } from "lucide-react";

interface EmotionPerformanceInsightProps {
  data: WrappedMonthData;
}

export const EmotionPerformanceInsight: React.FC<EmotionPerformanceInsightProps> = ({ data }) => {
  const emotions = [
    { type: "positive", icon: Smile, label: "Positive", value: data.emotionPerformance.positive, color: "green" },
    { type: "neutral", icon: Meh, label: "Neutral", value: data.emotionPerformance.neutral, color: "blue" },
    { type: "negative", icon: Frown, label: "Negative", value: data.emotionPerformance.negative, color: "red" }
  ];
  
  // Find best performing emotion
  const bestEmotion = [...emotions].sort((a, b) => b.value - a.value)[0];
  
  // Find if there's a clear correlation
  const totalPerformance = Math.abs(data.emotionPerformance.positive) + 
    Math.abs(data.emotionPerformance.neutral) + 
    Math.abs(data.emotionPerformance.negative);
    
  const hasStrongCorrelation = totalPerformance > 0 && 
    (Math.abs(bestEmotion.value) / totalPerformance > 0.5);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-3">
      <h2 className="text-2xl font-bold mb-4">Mood vs. Performance</h2>
      
      <div className="w-full grid grid-cols-3 gap-3">
        {emotions.map((emotion) => (
          <div 
            key={emotion.type} 
            className={`flex flex-col items-center bg-${emotion.color}-500/10 p-3 rounded-lg`}
          >
            <emotion.icon className={`h-7 w-7 text-${emotion.color}-500 mb-1`} />
            <div className="text-base font-medium">{emotion.label}</div>
            <div className={`text-lg font-bold ${emotion.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {emotion.value.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="max-w-sm mt-4">
        <p className="text-lg">
          {hasStrongCorrelation 
            ? `Your trades performed best when you felt ${bestEmotion.label.toLowerCase()}!` 
            : "There's no strong correlation between your emotions and trading performance yet."}
        </p>
        
        <p className="mt-2 text-primary text-base">
          {data.emotionPerformance.positive > data.emotionPerformance.negative
            ? "Trading while positive seems to work for you!"
            : data.emotionPerformance.negative > 0
              ? "Interestingly, you perform better when you feel negative."
              : "Consider not trading when feeling negative."}
        </p>
      </div>
    </div>
  );
};
