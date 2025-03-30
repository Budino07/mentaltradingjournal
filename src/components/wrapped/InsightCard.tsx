
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BadgePercent, Calendar, Clock, Award, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from "recharts";

interface InsightCardProps {
  type: 
    | "win-rate" 
    | "streak" 
    | "time" 
    | "setup" 
    | "mood-performance" 
    | "overtrading" 
    | "emotional-heatmap";
  title: string;
  value: string;
  description: string;
  color: "primary" | "destructive" | "green" | "blue" | "purple" | "amber" | "pink" | "orange" | "cyan";
  comparison?: {
    value: number;
    label: string;
  };
  moodData?: Record<string, number>;
  emotionalData?: Record<string, any>;
}

const getGradientClass = (color: string) => {
  switch (color) {
    case "primary":
      return "from-primary/20 to-primary/10";
    case "destructive":
      return "from-destructive/20 to-destructive/10";
    case "green":
      return "from-green-500/20 to-green-500/10";
    case "blue":
      return "from-blue-500/20 to-blue-500/10";
    case "purple":
      return "from-purple-500/20 to-purple-500/10";
    case "amber":
      return "from-amber-500/20 to-amber-500/10";
    case "pink":
      return "from-pink-500/20 to-pink-500/10";
    case "orange":
      return "from-orange-500/20 to-orange-500/10";
    case "cyan":
      return "from-cyan-500/20 to-cyan-500/10";
    default:
      return "from-primary/20 to-primary/10";
  }
};

const getTextColorClass = (color: string) => {
  switch (color) {
    case "primary":
      return "text-primary";
    case "destructive":
      return "text-destructive";
    case "green":
      return "text-green-500";
    case "blue":
      return "text-blue-500";
    case "purple":
      return "text-purple-500";
    case "amber":
      return "text-amber-500";
    case "pink":
      return "text-pink-500";
    case "orange":
      return "text-orange-500";
    case "cyan":
      return "text-cyan-500";
    default:
      return "text-primary";
  }
};

const getIconByType = (type: string, color: string) => {
  const colorClass = getTextColorClass(color);

  switch (type) {
    case "win-rate":
      return <BadgePercent className={`h-8 w-8 ${colorClass}`} />;
    case "streak":
      return <Flame className={`h-8 w-8 ${colorClass}`} />;
    case "time":
      return <Clock className={`h-8 w-8 ${colorClass}`} />;
    case "setup":
      return <Award className={`h-8 w-8 ${colorClass}`} />;
    case "mood-performance":
      return <TrendingUp className={`h-8 w-8 ${colorClass}`} />;
    case "overtrading":
      return <TrendingDown className={`h-8 w-8 ${colorClass}`} />;
    case "emotional-heatmap":
      return <Calendar className={`h-8 w-8 ${colorClass}`} />;
    default:
      return <BadgePercent className={`h-8 w-8 ${colorClass}`} />;
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  value,
  description,
  color,
  comparison,
  moodData,
  emotionalData,
}) => {
  const gradientClass = getGradientClass(color);
  const textColorClass = getTextColorClass(color);
  const icon = getIconByType(type, color);

  const renderComparisonValue = () => {
    if (!comparison) return null;
    
    const isPositive = comparison.value > 0;
    
    return (
      <div className="flex items-center gap-1 text-sm">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-destructive" />
        )}
        <span className={isPositive ? "text-green-500" : "text-destructive"}>
          {isPositive ? "+" : ""}{comparison.value.toFixed(1)}%
        </span>
        <span className="text-muted-foreground">{comparison.label}</span>
      </div>
    );
  };

  const renderMoodPerformanceChart = () => {
    if (!moodData) return null;
    
    const data = Object.entries(moodData).map(([mood, winRate]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: winRate,
    }));
    
    const COLORS = ["#6E59A5", "#34D399", "#F87171"];
    
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, "Win Rate"]}
            contentStyle={{ background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderEmotionalHeatmap = () => {
    if (!emotionalData) return null;
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const data = days.map(day => ({
      name: day,
      positive: emotionalData[day]?.positive || 0,
      negative: emotionalData[day]?.negative || 0,
      neutral: emotionalData[day]?.neutral || 0,
    }));
    
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
            contentStyle={{ background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}
          />
          <Bar dataKey="positive" stackId="a" fill="#34D399" radius={[4, 4, 0, 0]} />
          <Bar dataKey="neutral" stackId="a" fill="#6E59A5" />
          <Bar dataKey="negative" stackId="a" fill="#F87171" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "mood-performance":
        return renderMoodPerformanceChart();
      case "emotional-heatmap":
        return renderEmotionalHeatmap();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full overflow-hidden border border-primary/20 shadow-lg">
      <div className={`h-full bg-gradient-to-br ${gradientClass}`}>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
            </div>
            {renderComparisonValue()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl font-bold ${textColorClass}`}
            >
              {value}
            </motion.p>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-muted-foreground mt-4"
            >
              {description}
            </motion.p>
          </motion.div>
          
          {renderChart()}
        </CardContent>
      </div>
    </Card>
  );
};
