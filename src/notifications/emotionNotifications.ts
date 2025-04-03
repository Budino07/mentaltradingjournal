
import { format, isSameDay, differenceInDays, startOfDay, subDays } from "date-fns";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle, getDaysSinceEmotion } from "@/utils/notificationUtils";
import { Notification } from "@/types/notifications";
import { JournalEntryType } from "@/types/journal";

export const checkEmotionNotifications = (
  analyticsData: any,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
): void => {
  if (!analyticsData?.journalEntries?.length) return;

  // Get all emotions logged in journal entries
  const journalEntries = analyticsData.journalEntries;
  const emotions = journalEntries
    .filter((entry: JournalEntryType) => entry.emotion)
    .map((entry: JournalEntryType) => ({
      emotion: entry.emotion,
      date: new Date(entry.created_at),
    }));

  // Track emotions and their frequency
  const emotionCounts: Record<string, { count: number; lastLogged: Date }> = {};
  emotions.forEach((item: { emotion: string; date: Date }) => {
    if (!emotionCounts[item.emotion]) {
      emotionCounts[item.emotion] = { count: 0, lastLogged: item.date };
    }
    emotionCounts[item.emotion].count++;
    
    // Update last logged date if this entry is more recent
    if (item.date > emotionCounts[item.emotion].lastLogged) {
      emotionCounts[item.emotion].lastLogged = item.date;
    }
  });

  // Check for emotions that seem to be recurring patterns
  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);
  
  if (dominantEmotions.length > 0 && dominantEmotions[0][1].count > 5) {
    const dominantEmotion = dominantEmotions[0][0];
    const emotionTitle = `Emotional pattern detected: ${dominantEmotion}`;
    
    // Only send once every 14 days
    if (!hasSentWithinDaysWithTitle(notifications, emotionTitle, 14)) {
      // Get possible matching trades to this emotion
      const tradesWithEmotion = journalEntries
        .filter((entry: JournalEntryType) => entry.emotion === dominantEmotion && entry.trades && entry.trades.length > 0)
        .flatMap((entry: JournalEntryType) => entry.trades);
      
      // Calculate win rate for trades with this emotion
      const winCount = tradesWithEmotion.filter((trade: any) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
        return pnl > 0;
      }).length;
      
      const winRate = tradesWithEmotion.length > 0 ? 
        Math.round((winCount / tradesWithEmotion.length) * 100) : 0;
      
      let message = `You've logged "${dominantEmotion}" ${dominantEmotions[0][1].count} times in your journal.`;
      
      // Add win rate context if we have enough trades
      if (tradesWithEmotion.length >= 5) {
        message += ` When trading with this emotion, your win rate is ${winRate}%.`;
        if (winRate < 50) {
          message += ` Consider strategies to manage this emotional state before trading.`;
        } else {
          message += ` This emotion appears to correlate with positive trading results.`;
        }
      }
      
      addNotification({
        title: emotionTitle,
        message,
        type: "info"
      });
    }
  }

  // Check for unusual emotions that weren't logged before
  const today = startOfDay(new Date());
  const recentEntries = journalEntries.filter((entry: JournalEntryType) => 
    isSameDay(new Date(entry.created_at), today)
  );
  
  recentEntries.forEach((entry: JournalEntryType) => {
    if (!entry.emotion) return;
    
    // Check if this emotion has been rarely logged before
    const previousOccurrences = emotions.filter(e => 
      e.emotion === entry.emotion && 
      !isSameDay(e.date, today)
    ).length;
    
    if (previousOccurrences <= 1 && emotions.length > 10) {
      const unusualEmotionTitle = `Unusual emotion detected: ${entry.emotion}`;
      
      if (!hasSentTodayWithTitle(notifications, unusualEmotionTitle)) {
        addNotification({
          title: unusualEmotionTitle,
          message: `You've rarely logged "${entry.emotion}" before. Pay attention to how this emotional state affects your trading decisions today.`,
          type: "warning"
        });
      }
    }
  });
  
  // Emotion/Performance correlation insights
  if (analyticsData.emotionPerformance) {
    const emotionPerformance = analyticsData.emotionPerformance;
    
    // Find emotions with significant impact (positive or negative)
    Object.entries(emotionPerformance).forEach(([emotion, stats]: [string, any]) => {
      if (typeof stats === 'object' && stats !== null && stats.count >= 5) {
        const avgPnl = stats.total / stats.count;
        const significantPnl = Math.abs(avgPnl) > 100; // Threshold for "significant" impact
        
        if (significantPnl) {
          const isProfitable = avgPnl > 0;
          const emotionImpactTitle = `${emotion} affects your trading ${isProfitable ? 'positively' : 'negatively'}`;
          
          if (!hasSentWithinDaysWithTitle(notifications, emotionImpactTitle, 21)) {
            const message = isProfitable
              ? `When you log "${emotion}", your average P&L is +$${avgPnl.toFixed(2)}. This emotion appears to correlate with profitable trades.`
              : `When you log "${emotion}", your average P&L is -$${Math.abs(avgPnl).toFixed(2)}. Consider pausing trading when you experience this emotion.`;
            
            addNotification({
              title: emotionImpactTitle,
              message,
              type: isProfitable ? "success" : "warning"
            });
          }
        }
      }
    });
  }
  
  // Check for negative emotions happening in sequence
  const negativeEmotions = ["frustrated", "angry", "sad", "fearful", "anxious", "stressed"];
  const recentNegativeCount = journalEntries
    .filter((entry: JournalEntryType) => {
      const entryDate = new Date(entry.created_at);
      const daysSinceEntry = differenceInDays(today, entryDate);
      return daysSinceEntry <= 3 && negativeEmotions.includes(entry.emotion?.toLowerCase() || '');
    })
    .length;
  
  if (recentNegativeCount >= 2) {
    const negativePatternTitle = "Take care of your mental health";
    if (!hasSentWithinDaysWithTitle(notifications, negativePatternTitle, 3)) {
      addNotification({
        title: negativePatternTitle,
        message: `You've logged multiple negative emotions recently. Remember to take breaks and practice self-care for better trading decisions.`,
        type: "warning"
      });
    }
  }
};
