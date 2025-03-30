
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { InsightCard } from "./InsightCard";

interface InsightsDialogProps {
  open: boolean;
  onClose: () => void;
  monthData: any;
  monthName: string;
}

export const InsightsDialog: React.FC<InsightsDialogProps> = ({
  open,
  onClose,
  monthData,
  monthName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Define our insight cards
  const insights = [
    {
      id: "win-rate",
      title: "Win Rate",
      render: () => (
        <InsightCard 
          type="win-rate"
          title="Win Rate"
          value={`${(monthData.winRate || 0).toFixed(1)}%`}
          description={`Your win rate for ${monthName} was ${(monthData.winRate || 0).toFixed(1)}%.`}
          comparison={{
            value: monthData.prevMonthWinRate,
            label: "vs previous month",
          }}
          color="primary"
        />
      ),
    },
    {
      id: "winning-streak",
      title: "Winning Streak",
      render: () => (
        <InsightCard 
          type="streak"
          title="Biggest Winning Streak"
          value={`${monthData.winningStreak || 0}`}
          description={`Your longest winning streak was ${monthData.winningStreak || 0} consecutive winning trades.`}
          color="green"
        />
      ),
    },
    {
      id: "losing-streak",
      title: "Losing Streak",
      render: () => (
        <InsightCard 
          type="streak"
          title="Biggest Losing Streak"
          value={`${monthData.losingStreak || 0}`}
          description={`Your longest losing streak was ${monthData.losingStreak || 0} consecutive losing trades.`}
          color="destructive"
        />
      ),
    },
    {
      id: "active-time",
      title: "Most Active Time",
      render: () => (
        <InsightCard 
          type="time"
          title="Most Active Trading Time"
          value={monthData.mostActiveTime || "N/A"}
          description={`You traded most frequently during ${monthData.mostActiveTime || "N/A"}.`}
          color="blue"
        />
      ),
    },
    {
      id: "favorite-setup",
      title: "Favorite Setup",
      render: () => (
        <InsightCard 
          type="setup"
          title="Favorite Setup"
          value={monthData.favoriteSetup || "N/A"}
          description={`Your most profitable setup was "${monthData.favoriteSetup || "Unknown"}".`}
          color="purple"
        />
      ),
    },
    {
      id: "holding-time",
      title: "Avg Holding Time",
      render: () => (
        <InsightCard 
          type="time"
          title="Average Holding Time"
          value={monthData.avgHoldingTime || "N/A"}
          description={`On average, you held your trades for ${monthData.avgHoldingTime || "an unknown amount of time"}.`}
          color="amber"
        />
      ),
    },
    {
      id: "mood-performance",
      title: "Mood vs Performance",
      render: () => (
        <InsightCard 
          type="mood-performance"
          title="Mood vs Performance"
          value={monthData.bestMood || "Positive"}
          description={`Your ${monthData.bestMood || "positive"} mood resulted in the highest win rate at ${(monthData.bestMoodWinRate || 0).toFixed(1)}%.`}
          moodData={monthData.moodPerformance || {}}
          color="pink"
        />
      ),
    },
    {
      id: "overtrading",
      title: "Overtrading Indicator",
      render: () => (
        <InsightCard 
          type="overtrading"
          title="Overtrading Indicator"
          value={`${monthData.overtradingDays || 0} days`}
          description={`You exceeded your usual trade count on ${monthData.overtradingDays || 0} trading days this month.`}
          color="orange"
        />
      ),
    },
    {
      id: "emotional-heatmap",
      title: "Emotional Heatmap",
      render: () => (
        <InsightCard 
          type="emotional-heatmap"
          title="Emotional Heatmap"
          value={monthData.mostEmotionalDay || "Monday"}
          description={`${monthData.mostEmotionalDay || "Monday"} was your most emotional trading day.`}
          emotionalData={monthData.emotionalByDay || {}}
          color="cyan"
        />
      ),
    },
  ];

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev === insights.length - 1 ? 0 : prev + 1));
  };

  const prevInsight = () => {
    setCurrentIndex((prev) => (prev === 0 ? insights.length - 1 : prev - 1));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 border-none bg-transparent shadow-none">
        <div className="relative w-full overflow-hidden rounded-lg">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {insights[currentIndex].render()}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {insights.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-10 w-10"
            onClick={prevInsight}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-10 w-10"
            onClick={nextInsight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
