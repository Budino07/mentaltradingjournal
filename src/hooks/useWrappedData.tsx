
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, differenceInMinutes, setHours, setMinutes, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export interface WrappedMonthData {
  month: string;
  formattedMonth: string;
  winRate: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  mostActiveTime: string;
  favoriteSetup: string;
  avgHoldingTime: number;
  emotionPerformance: {
    positive: number;
    neutral: number;
    negative: number;
  };
  overtradingDays: number;
  emotionalHeatmap: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
  };
}

export function useWrappedData() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthlyData, setMonthlyData] = useState<Record<string, WrappedMonthData>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Fetch journal entries
        const { data: entries, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (!entries || entries.length === 0) {
          setIsLoading(false);
          return;
        }

        // Process the data to get available months
        const months = new Set<string>();
        
        entries.forEach(entry => {
          if (entry.created_at) {
            const date = parseISO(entry.created_at);
            const monthKey = format(date, 'yyyy-MM');
            months.add(monthKey);
          }
        });

        const monthsList = Array.from(months).sort().reverse();
        setAvailableMonths(monthsList);

        // Process monthly data
        const processedData: Record<string, WrappedMonthData> = {};
        
        for (const monthKey of monthsList) {
          const monthStart = startOfMonth(parseISO(`${monthKey}-01`));
          const monthEnd = endOfMonth(monthStart);
          
          // Filter entries for this month
          const monthEntries = entries.filter(entry => {
            const entryDate = parseISO(entry.created_at);
            return isSameMonth(entryDate, monthStart);
          });

          // Extract trades from all entries
          const allTrades = monthEntries.flatMap(entry => entry.trades || []);
          
          // Calculate win rate
          const winningTrades = allTrades.filter(trade => Number(trade.pnl) > 0);
          const winRate = allTrades.length > 0 ? (winningTrades.length / allTrades.length) * 100 : 0;
          
          // Calculate winning and losing streaks
          let currentWinStreak = 0;
          let maxWinStreak = 0;
          let currentLoseStreak = 0;
          let maxLoseStreak = 0;
          
          // Sort trades by date
          const sortedTrades = [...allTrades].sort((a, b) => 
            new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime()
          );
          
          sortedTrades.forEach(trade => {
            const pnl = Number(trade.pnl);
            if (pnl > 0) {
              currentWinStreak++;
              currentLoseStreak = 0;
              maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
            } else if (pnl < 0) {
              currentLoseStreak++;
              currentWinStreak = 0;
              maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
            }
          });

          // Find most active trading time
          const tradeTimes: Record<number, number> = {};
          allTrades.forEach(trade => {
            if (trade.entryDate) {
              const entryTime = parseISO(trade.entryDate);
              const hour = entryTime.getHours();
              tradeTimes[hour] = (tradeTimes[hour] || 0) + 1;
            }
          });
          
          let mostActiveHour = 9; // Default to market open
          let maxTradesAtHour = 0;
          
          Object.entries(tradeTimes).forEach(([hour, count]) => {
            if (count > maxTradesAtHour) {
              mostActiveHour = parseInt(hour);
              maxTradesAtHour = count;
            }
          });
          
          // Format time as "9 AM" or "2 PM"
          const formattedActiveTime = format(
            setHours(setMinutes(new Date(), 0), mostActiveHour),
            'h a'
          );
          
          // Find favorite setup
          const setupCounts: Record<string, number> = {};
          allTrades.forEach(trade => {
            if (trade.setup) {
              setupCounts[trade.setup] = (setupCounts[trade.setup] || 0) + 1;
            }
          });
          
          let favoriteSetup = 'None';
          let maxSetupCount = 0;
          
          Object.entries(setupCounts).forEach(([setup, count]) => {
            if (count > maxSetupCount) {
              favoriteSetup = setup;
              maxSetupCount = count;
            }
          });
          
          // Calculate average holding time
          let totalHoldingTime = 0;
          let tradesWithHoldingTime = 0;
          
          allTrades.forEach(trade => {
            if (trade.entryDate && trade.exitDate) {
              const entryTime = parseISO(trade.entryDate);
              const exitTime = parseISO(trade.exitDate);
              const holdingTimeMinutes = differenceInMinutes(exitTime, entryTime);
              
              if (holdingTimeMinutes > 0) {
                totalHoldingTime += holdingTimeMinutes;
                tradesWithHoldingTime++;
              }
            }
          });
          
          const avgHoldingTime = tradesWithHoldingTime > 0 ? totalHoldingTime / tradesWithHoldingTime : 0;

          // Calculate emotion performance
          const emotionPerformance = {
            positive: 0,
            neutral: 0,
            negative: 0
          };
          
          monthEntries.forEach(entry => {
            if (entry.emotion && entry.trades) {
              const totalPnL = entry.trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
              
              if (entry.emotion === 'positive') {
                emotionPerformance.positive += totalPnL;
              } else if (entry.emotion === 'neutral') {
                emotionPerformance.neutral += totalPnL;
              } else if (entry.emotion === 'negative') {
                emotionPerformance.negative += totalPnL;
              }
            }
          });
          
          // Calculate overtrading days
          const tradesPerDay: Record<string, number> = {};
          
          allTrades.forEach(trade => {
            if (trade.entryDate) {
              const date = format(parseISO(trade.entryDate), 'yyyy-MM-dd');
              tradesPerDay[date] = (tradesPerDay[date] || 0) + 1;
            }
          });
          
          const tradeDays = Object.keys(tradesPerDay).length;
          const totalTrades = allTrades.length;
          const avgTradesPerDay = tradeDays > 0 ? totalTrades / tradeDays : 0;
          
          // Count days with more than 150% of average trades
          const overtradingDays = Object.values(tradesPerDay).filter(
            count => count > avgTradesPerDay * 1.5
          ).length;
          
          // Calculate emotional heatmap
          const dayEmotions: Record<string, string[]> = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: []
          };
          
          monthEntries.forEach(entry => {
            if (entry.emotion && entry.created_at) {
              const date = parseISO(entry.created_at);
              const day = format(date, 'EEEE').toLowerCase();
              
              if (day in dayEmotions) {
                dayEmotions[day].push(entry.emotion);
              }
            }
          });
          
          // Determine dominant emotion for each day
          const emotionalHeatmap: Record<string, string> = {};
          
          Object.entries(dayEmotions).forEach(([day, emotions]) => {
            if (emotions.length === 0) {
              emotionalHeatmap[day] = 'neutral';
              return;
            }
            
            const counts = {
              positive: emotions.filter(e => e === 'positive').length,
              neutral: emotions.filter(e => e === 'neutral').length,
              negative: emotions.filter(e => e === 'negative').length
            };
            
            if (counts.positive > counts.neutral && counts.positive > counts.negative) {
              emotionalHeatmap[day] = 'positive';
            } else if (counts.negative > counts.neutral && counts.negative > counts.positive) {
              emotionalHeatmap[day] = 'negative';
            } else {
              emotionalHeatmap[day] = 'neutral';
            }
          });
          
          // Store processed data
          processedData[monthKey] = {
            month: monthKey,
            formattedMonth: format(monthStart, 'MMMM yyyy'),
            winRate,
            longestWinStreak: maxWinStreak,
            longestLoseStreak: maxLoseStreak,
            mostActiveTime: formattedActiveTime,
            favoriteSetup,
            avgHoldingTime,
            emotionPerformance,
            overtradingDays,
            emotionalHeatmap: emotionalHeatmap as any
          };
        }
        
        setMonthlyData(processedData);
      } catch (error) {
        console.error("Error fetching wrapped data:", error);
        toast({
          title: "Error",
          description: "Failed to load Mental Wrapped data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalData();
  }, [toast]);

  const getMonthlyData = (month: string): WrappedMonthData | null => {
    return monthlyData[month] || null;
  };

  return {
    isLoading,
    availableMonths,
    getMonthlyData
  };
}
