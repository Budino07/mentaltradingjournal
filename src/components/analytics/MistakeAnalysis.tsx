
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { mistakeCategories } from "@/components/journal/emotionConfig";
import { CustomTooltip } from "./shared/CustomTooltip";

export const MistakeAnalysis = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Process mistakes and calculate percentages
  const mistakes = Object.entries(analytics.mistakeFrequencies);
  const totalMistakes = mistakes.reduce((sum, [_, { count }]) => sum + count, 0);
  
  console.log("Mistake frequencies data:", analytics.mistakeFrequencies);

  // Get all possible mistake categories except "No Trading Mistakes"
  const allMistakeCategories = mistakeCategories
    .filter(category => category.value !== 'no_mistakes')
    .map(category => ({
      value: category.value,
      label: category.label
    }));

  // If there are no mistakes, show empty state
  if (totalMistakes === 0) {
    const emptyData = [{ name: "No Data", value: 100, loss: 0 }];
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Behavioral Slippage</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of trading mistakes and their impact
          </p>
        </div>

        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emptyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#6E59A5"
                dataKey="value"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
          <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            Start logging your trading mistakes to get insights on areas for improvement.
          </p>
        </div>
      </Card>
    );
  }

  // Create data array including all possible mistakes
  const data = allMistakeCategories.map(category => {
    const mistakeData = analytics.mistakeFrequencies[category.value] || { count: 0, loss: 0 };
    return {
      name: category.label,
      value: (mistakeData.count / totalMistakes) * 100,
      loss: mistakeData.loss,
    };
  }).filter(item => item.value > 0)
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 6);  // Show top 6 mistakes by loss impact
  
  console.log("Processed chart data:", data);

  const COLORS = ['#6E59A5', '#0EA5E9', '#FEC6A1', '#F87171', '#A78BFA', '#34D399'];

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Behavioral Slippage</h3>
        <p className="text-sm text-muted-foreground">
          Analysis of trading mistakes and their impact
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          {data.length > 0 ? (
            <p>
              {data[0].name} is your most frequent mistake, occurring in {data[0].value.toFixed(1)}% of losing trades.
            </p>
          ) : (
            <p>Start logging your trading mistakes to get insights on areas for improvement.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
