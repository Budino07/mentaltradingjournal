
import { format, differenceInDays } from "date-fns";
import { hasSentWithinDaysWithTitle } from "@/utils/notificationUtils";
import { Notification } from "@/types/notifications";
import { JournalEntryType } from "@/types/journal";

// Type definition for emotion pattern analysis
interface EmotionPattern {
  emotion: string;
  count: number;
  total: number;
  avgPnl: number;
}

export const checkEmotionNotifications = (
  journalEntries: JournalEntryType[],
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
): void => {
  if (!journalEntries || journalEntries.length === 0) return;

  // Get entries from the last 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    return entryDate >= twoWeeksAgo;
  });

  if (recentEntries.length < 5) return; // Not enough data for patterns

  // Analyze emotion patterns and their correlation with trading performance
  const emotionPatterns: Record<string, EmotionPattern> = {};
  
  recentEntries.forEach(entry => {
    const { emotion, trades } = entry;
    
    if (!emotion || !trades || trades.length === 0) return;
    
    if (!emotionPatterns[emotion]) {
      emotionPatterns[emotion] = { emotion, count: 0, total: 0, avgPnl: 0 };
    }
    
    const totalPnl = trades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                 (typeof trade.pnl === 'number' ? trade.pnl : 0);
      return sum + pnl;
    }, 0);
    
    emotionPatterns[emotion].count += 1;
    emotionPatterns[emotion].total += totalPnl;
  });
  
  // Calculate average PnL for each emotion
  Object.values(emotionPatterns).forEach(pattern => {
    pattern.avgPnl = pattern.count > 0 ? pattern.total / pattern.count : 0;
  });
  
  // Find the emotion with the highest average PnL (minimum 3 occurrences)
  const bestEmotion = Object.values(emotionPatterns)
    .filter(pattern => pattern.count >= 3)
    .sort((a, b) => b.avgPnl - a.avgPnl)[0];
  
  // Find the emotion with the lowest average PnL (minimum 3 occurrences)
  const worstEmotion = Object.values(emotionPatterns)
    .filter(pattern => pattern.count >= 3)
    .sort((a, b) => a.avgPnl - b.avgPnl)[0];
  
  // Emotion-Performance Insight (sent once every 14 days)
  if (bestEmotion && worstEmotion && bestEmotion.emotion !== worstEmotion.emotion) {
    const insightTitle = "Emotion-Performance Connection";
    
    // Only send this notification once every 14 days
    if (!hasSentWithinDaysWithTitle(notifications, insightTitle, 14)) {
      const formattedBestAvg = bestEmotion.avgPnl.toFixed(2);
      const formattedWorstAvg = worstEmotion.avgPnl.toFixed(2);
      
      addNotification({
        title: insightTitle,
        message: `Trading while feeling "${bestEmotion.emotion}" yields better results ($${formattedBestAvg} avg) compared to trading while feeling "${worstEmotion.emotion}" ($${formattedWorstAvg} avg). Consider your emotional state before trading.`,
        type: "info"
      });
    }
  }
  
  // Negative Emotion Trading Warning (if applicable and not already sent)
  const negativeEmotionEntries = recentEntries.filter(entry => entry.emotion === 'negative');
  
  if (negativeEmotionEntries.length >= 3) {
    // Calculate success rate when trading with negative emotions
    const negativeEmotionResults = {
      successful: 0,
      total: 0,
      totalPnl: 0
    };
    
    negativeEmotionEntries.forEach(entry => {
      if (!entry.trades) return;
      
      entry.trades.forEach(trade => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                   (typeof trade.pnl === 'number' ? trade.pnl : 0);
        
        negativeEmotionResults.total += 1;
        if (pnl > 0) negativeEmotionResults.successful += 1;
        negativeEmotionResults.totalPnl += pnl;
      });
    });
    
    const successRate = negativeEmotionResults.total > 0 
      ? (negativeEmotionResults.successful / negativeEmotionResults.total) * 100 
      : 0;
    
    // If success rate is low, send warning
    if (successRate < 40 && negativeEmotionResults.total >= 5) {
      const warningTitle = "Trading Mindset Alert";
      
      // Only send once a week
      if (!hasSentWithinDaysWithTitle(notifications, warningTitle, 7)) {
        addNotification({
          title: warningTitle,
          message: `Your success rate is only ${successRate.toFixed(1)}% when trading in a negative emotional state. Consider taking a break when not feeling at your best.`,
          type: "warning"
        });
      }
    }
  }
};
