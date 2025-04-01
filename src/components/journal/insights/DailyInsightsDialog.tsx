
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, X } from "lucide-react";
import { formatCurrency } from "@/utils/analyticsUtils";
import { format } from "date-fns";
import { useMemo } from "react";

export type InsightMessage = {
  title: string;
  message: string;
  type: "warning" | "info" | "success";
};

interface DailyInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  trades: any[];
}

export const DailyInsightsDialog = ({
  open,
  onOpenChange,
  date,
  trades,
}: DailyInsightsDialogProps) => {
  const {
    totalTrades,
    winRate,
    winners,
    losers,
    netPnL,
    grossPnL,
    lots,
    commissions,
    profitFactor,
    insights,
  } = useMemo(() => {
    // If no trades, return default values
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        winners: 0,
        losers: 0,
        netPnL: 0,
        grossPnL: 0,
        lots: 0,
        commissions: 0,
        profitFactor: 0,
        insights: [],
      };
    }

    // Calculate basic metrics
    const totalTrades = trades.length;
    
    // Calculate winners and losers
    const winners = trades.filter(trade => Number(trade.pnl) > 0).length;
    const losers = trades.filter(trade => Number(trade.pnl) < 0).length;
    
    // Calculate win rate
    const winRate = totalTrades > 0 ? Math.round((winners / totalTrades) * 100) : 0;
    
    // Calculate PnL values
    const grossPnL = trades.reduce((sum, trade) => {
      return sum + Number(trade.pnl || 0);
    }, 0);
    
    // Calculate total lots (quantity)
    const lots = trades.reduce((sum, trade) => {
      return sum + Number(trade.quantity || 0);
    }, 0);
    
    // Estimate commissions as 0.1% of volume or use actual fees if available
    const volume = trades.reduce((sum, trade) => {
      const quantity = Number(trade.quantity || 0);
      const price = (Number(trade.entryPrice || 0) + Number(trade.exitPrice || 0)) / 2;
      return sum + (quantity * price);
    }, 0);
    
    const commissions = trades.reduce((sum, trade) => {
      return sum + Number(trade.fees || 0);
    }, 0) || (volume * 0.001); // Use 0.1% as default commission if not specified
    
    const netPnL = grossPnL - commissions;
    
    // Calculate profit factor
    const totalGains = trades.reduce((sum, trade) => {
      const pnl = Number(trade.pnl || 0);
      return sum + (pnl > 0 ? pnl : 0);
    }, 0);
    
    const totalLosses = trades.reduce((sum, trade) => {
      const pnl = Number(trade.pnl || 0);
      return sum + (pnl < 0 ? Math.abs(pnl) : 0);
    }, 0);
    
    const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : 0;
    
    // Generate insights
    const insights: InsightMessage[] = [];
    
    // Check for unusual number of trades
    const avgDailyTrades = 1; // This would ideally come from historical data
    if (totalTrades > avgDailyTrades * 1.5) {
      insights.push({
        title: "Unusual number of trades",
        message: `We noticed you had ${totalTrades} trades today and you usually average have ${Math.round(avgDailyTrades)} trades when you have a Green Day.`,
        type: "warning",
      });
    }
    
    // Check for giving away profits
    const maxPnL = trades.reduce((max, trade) => {
      const runningPnL = trades
        .filter(t => new Date(t.exitDate) <= new Date(trade.exitDate))
        .reduce((sum, t) => sum + Number(t.pnl || 0), 0);
      
      return runningPnL > max ? runningPnL : max;
    }, 0);
    
    if (maxPnL > 0 && netPnL < maxPnL && maxPnL - netPnL > 10) {
      insights.push({
        title: "Giving away profits",
        message: `You aren't maximizing your profits for the day. At one point you were up ${formatCurrency(maxPnL)} however closed at ${formatCurrency(netPnL)}, giving away profits.`,
        type: "warning",
      });
    }
    
    return {
      totalTrades,
      winRate,
      winners,
      losers,
      netPnL,
      grossPnL,
      lots,
      commissions,
      profitFactor,
      insights,
    };
  }, [trades]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/95 border-gray-800 text-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/6821d9c7-5948-4435-bdae-6e4fa72856ca.png"
                alt="Logo"
                className="w-12 h-12 rounded-full"
              />
              <DialogTitle className="text-xl font-semibold text-white">
                Your Mental Insights
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="text-gray-300">{format(date, 'EEE, MMM d, yyyy')}</div>
            <div className={netPnL >= 0 ? "text-green-500" : "text-red-500"}>
              Net P&L {formatCurrency(netPnL)}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm py-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Trades</span>
            <span className="font-medium">{totalTrades}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gross P&L</span>
            <span className={grossPnL >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(grossPnL)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Winrate</span>
            <span className="font-medium">{winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lots</span>
            <span className="font-medium">{Math.round(lots)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Winners</span>
            <span className="font-medium">{winners}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Commissions</span>
            <span className="font-medium">${commissions.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Losers</span>
            <span className="font-medium">{losers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Profit Factor</span>
            <span className="font-medium">{profitFactor}</span>
          </div>
        </div>
        
        {insights.length > 0 && (
          <div className="space-y-3 mt-2">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="bg-gray-800 rounded-md p-3 flex gap-3 items-start"
              >
                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-3">
          You can see only daily aggregated insights here. To view detailed insights, go to the corresponding trade.
        </div>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
