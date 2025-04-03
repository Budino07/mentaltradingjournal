
import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { formatDisplayDate } from "@/utils/dateUtils";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";

export const MorningRecap = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Get analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  useEffect(() => {
    // Check if we should show the recap
    const checkAndShowRecap = () => {
      if (!user) return;

      // Always show the recap when there's analytics data (for testing)
      if (analyticsData) {
        setOpen(true);
      }
    };
    
    // Check immediately when analytics data is loaded
    checkAndShowRecap();
    
  }, [user, analyticsData]);

  // Calculate yesterday's metrics
  const getYesterdayMetrics = () => {
    if (!analyticsData?.journalEntries) {
      return { pnl: 0, winRate: 0, profitFactor: 0 };
    }

    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    // Get all trades from yesterday
    const yesterdayTrades = analyticsData.journalEntries
      .filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= yesterdayStart && entryDate <= yesterdayEnd;
      })
      .flatMap(entry => entry.trades || []);

    if (yesterdayTrades.length === 0) {
      return { pnl: 0, winRate: 0, profitFactor: 0 };
    }

    // Calculate PnL
    const totalPnl = yesterdayTrades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, 0);

    // Calculate win rate
    const winningTrades = yesterdayTrades.filter(trade => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      return pnl > 0;
    }).length;
    
    const winRate = yesterdayTrades.length > 0 ? 
      (winningTrades / yesterdayTrades.length) * 100 : 0;

    // Calculate profit factor
    const grossProfit = yesterdayTrades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + (pnl > 0 ? pnl : 0);
    }, 0);
    
    const grossLoss = Math.abs(yesterdayTrades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + (pnl < 0 ? pnl : 0);
    }, 0));
    
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 
                         grossProfit > 0 ? grossProfit : 0;

    return {
      pnl: totalPnl,
      winRate,
      profitFactor,
      totalTrades: yesterdayTrades.length,
      winningTrades,
      losingTrades: yesterdayTrades.length - winningTrades
    };
  };

  const metrics = getYesterdayMetrics();
  // Format PnL as dollar amount 
  const pnlFormatted = metrics.pnl >= 0 ? 
    `+$${Math.abs(metrics.pnl).toFixed(2)}` : 
    `-$${Math.abs(metrics.pnl).toFixed(2)}`;

  // Generate mental insight based on performance
  const getMentalInsight = () => {
    if (metrics.losingTrades > metrics.winningTrades) {
      return {
        title: "Emotional resilience needed",
        message: `With ${metrics.losingTrades} losing trades yesterday, consider how emotions might have affected your decisions. Traders who maintain emotional balance recover faster from losses.`
      };
    } 
    
    if (metrics.totalTrades > 3 && metrics.winRate < 50) {
      return {
        title: "Potential emotional trading",
        message: `Multiple trades with negative P&L ${pnlFormatted} may indicate reactive trading. Historical data shows better results when trading with a calm mindset.`
      };
    }
    
    if (metrics.totalTrades > 3 && metrics.pnl > 0) {
      return {
        title: "Unusual number of trades",
        message: `We noticed you had ${metrics.totalTrades} trades yesterday and you usually average have 1 trades when you have a Green Day.`
      };
    }
    
    if (metrics.winRate > 60) {
      return {
        title: "Positive emotional momentum",
        message: `Your winning trades yesterday (${metrics.winningTrades} wins, ${metrics.winRate.toFixed(0)}% win rate) suggest you were trading with emotional clarity. This correlates with better decision making.`
      };
    }
    
    return {
      title: "Daily reflection is key",
      message: "Take a moment to reflect on yesterday's trades. Understanding your emotional state during trading can lead to better decisions today."
    };
  };

  const insight = getMentalInsight();

  if (!analyticsData) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-md rounded-xl p-0 border-0 shadow-2xl ${
          isDark 
            ? "bg-gradient-to-br from-black/95 to-gray-900/95 border border-indigo-500/30 text-white shadow-indigo-500/20" 
            : "bg-gradient-to-br from-white to-slate-50"
        }`} 
        hideCloseButton
      >
        <div className="p-6">
          <button 
            onClick={() => setOpen(false)}
            className={`absolute right-4 top-4 ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <X size={24} />
          </button>
          
          <DialogHeader className="mb-2 space-y-2 text-left p-0">
            <h3 className={`text-2xl font-medium ${
              isDark 
                ? "text-white" 
                : "text-slate-800"
            }`}>
              Morning {user?.user_metadata?.username || user?.email?.split('@')[0] || 'trader'}, here's yesterday's recap.
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-500"}`}>
              {formatDisplayDate(subDays(new Date(), 1))}
            </p>
          </DialogHeader>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <span role="img" aria-label="unicorn" className="text-3xl">
                🦄
              </span>
            </div>
            
            <div className="flex justify-between space-x-6 w-4/5">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}>{pnlFormatted}</div>
                <div className={`text-sm ${
                  isDark ? "text-gray-300" : "text-slate-600"
                }`}>P&L</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}>{metrics.winRate.toFixed(0)}%</div>
                <div className={`text-sm ${
                  isDark ? "text-gray-300" : "text-slate-600"
                }`}>Trade win%</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}>{metrics.profitFactor.toFixed(1)}</div>
                <div className={`text-sm ${
                  isDark ? "text-gray-300" : "text-slate-600"
                }`}>Profit factor</div>
              </div>
            </div>
          </div>
          
          {/* Mental Insight Section */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDark 
              ? "bg-gray-800/80 backdrop-blur-sm border border-indigo-500/20" 
              : "bg-gray-100"
          }`}>
            <div className="flex gap-3">
              <AlertCircle className={`h-5 w-5 mt-0.5 shrink-0 ${
                isDark ? "text-indigo-400" : "text-primary"
              }`} />
              <div>
                <h4 className={`font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>{insight.title}</h4>
                <p className={`text-sm mt-1 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>{insight.message}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
