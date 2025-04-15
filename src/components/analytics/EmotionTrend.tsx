
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";

export const EmotionTrend = () => {
  const { isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading) {
    return (
      <Card className="p-4 md:p-6 space-y-4 col-span-2">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[400px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Return null since the component is no longer needed
  return null;
};
