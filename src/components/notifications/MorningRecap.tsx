
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { formatDisplayDate, getUserTimezone } from "@/utils/dateUtils";
import { subDays, startOfDay, endOfDay, isAfter, set } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export const MorningRecap = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

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
      profitFactor
    };
  };

  const metrics = getYesterdayMetrics();
  // Format PnL as dollar amount 
  const pnlFormatted = metrics.pnl >= 0 ? 
    `+$${Math.abs(metrics.pnl).toFixed(2)}` : 
    `-$${Math.abs(metrics.pnl).toFixed(2)}`;

  if (!analyticsData) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-xl p-0 border-0 shadow-2xl" hideCloseButton>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6">
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
          
          <DialogHeader className="mb-2 space-y-2 text-left p-0">
            <h3 className="text-2xl font-medium text-slate-800">
              Morning {user?.email?.split('@')[0] || 'trader'}, here's yesterday's recap.
            </h3>
            <p className="text-sm text-slate-500">
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
                <div className="text-2xl font-bold text-slate-800">{pnlFormatted}</div>
                <div className="text-sm text-slate-600">P&L</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{metrics.winRate.toFixed(0)}%</div>
                <div className="text-sm text-slate-600">Trade win%</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{metrics.profitFactor.toFixed(1)}</div>
                <div className="text-sm text-slate-600">Profit factor</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
