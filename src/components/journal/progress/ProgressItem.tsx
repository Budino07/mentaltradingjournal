
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ProgressItemProps {
  icon: LucideIcon;
  title: string;
  value: number;
  maxValue: number;
  color: string;
  unit: string;
  showRing?: boolean;
}

export const ProgressItem = ({ 
  icon: Icon, 
  title, 
  value, 
  maxValue, 
  color, 
  unit,
  showRing = false
}: ProgressItemProps) => {
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  // Colors for different states
  const colorMap = {
    primary: {
      bg: "bg-primary/20",
      text: "text-primary",
      fill: "#6E59A5"
    },
    secondary: {
      bg: "bg-secondary/20",
      text: "text-secondary",
      fill: "#78716c"
    },
    accent: {
      bg: "bg-accent/20",
      text: "text-accent-foreground",
      fill: "#F97316"
    }
  };
  
  const selectedColor = colorMap[color as keyof typeof colorMap];
  
  // Data for the ring chart
  const ringData = [
    { name: "Complete", value: percentage, color: selectedColor.fill },
    { name: "Remaining", value: 100 - percentage, color: "#313131" }
  ];
  
  return (
    <div className="p-4 rounded-lg border bg-card/40 backdrop-blur-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${selectedColor.bg}`}>
          <Icon className={`h-4 w-4 ${selectedColor.text}`} />
        </div>
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">
            {value} <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {percentage.toFixed(0)}% of {maxValue} {unit}
          </p>
        </div>
        
        {showRing ? (
          <div className="h-14 w-14">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ringData}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={28}
                  paddingAngle={0}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {ringData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Progress value={percentage} className={`w-20 ${selectedColor.bg}`} />
        )}
      </div>
    </div>
  );
};
