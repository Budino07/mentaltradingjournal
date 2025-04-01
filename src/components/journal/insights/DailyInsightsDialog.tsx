import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Sparkles } from "lucide-react";
import { formatCurrency } from "@/utils/analyticsUtils";
import { format } from "date-fns";
import { useMemo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

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
    emotionInsight,
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
        emotionInsight: null,
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
    
    // Generate emotion insight based on performance
    let emotionInsight: InsightMessage | null = null;
    
    // Determine emotional insight based on win rate and PnL
    if (winners > losers && netPnL > 0) {
      emotionInsight = {
        title: "Positive emotional momentum",
        message: `Your winning trades today (${winners} wins, ${winRate}% win rate) suggest you were trading with emotional clarity. This correlates with better decision making.`,
        type: "success"
      };
    } else if (losers > winners) {
      emotionInsight = {
        title: "Emotional resilience needed",
        message: `With ${losers} losing trades today, consider how emotions might have affected your decisions. Traders who maintain emotional balance recover faster from losses.`,
        type: "warning"
      };
    } else if (netPnL < 0 && trades.length > 2) {
      emotionInsight = {
        title: "Potential emotional trading",
        message: `Multiple trades with negative P&L ${formatCurrency(netPnL)} may indicate reactive trading. Historical data shows better results when trading with a calm mindset.`,
        type: "warning"
      };
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
      emotionInsight,
    };
  }, [trades]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-black/95 to-gray-900/95 border border-indigo-500/30 text-white shadow-xl shadow-indigo-500/20 rounded-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-indigo-400 ring-offset-2 ring-offset-black/80">
                <AvatarImage
                  src="/lovable-uploads/3de77a29-8ca1-4638-8f34-18f3ecc1a113.png"
                  alt="Logo"
                  className="object-cover"
                />
              </Avatar>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Your Mental Insights
              </DialogTitle>
            </div>
            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="flex justify-between items-center text-sm mt-2 bg-gray-800/40 rounded-lg p-2">
            <div className="text-gray-300 flex items-center">
              <span className="inline-block bg-indigo-500/20 p-1 rounded mr-2">
                {format(date, 'EEE')}
              </span>
              {format(date, 'MMM d, yyyy')}
            </div>
            <div className={`${netPnL >= 0 ? "text-green-400" : "text-red-400"} font-semibold`}>
              Net P&L {formatCurrency(netPnL)}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm py-3 px-1 bg-gray-800/20 rounded-lg mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Total Trades
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{totalTrades}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Gross P&L
            </span>
            <span className={`font-medium ${grossPnL >= 0 ? "text-green-400" : "text-red-400"} bg-gray-800 px-2 py-0.5 rounded`}>
              {formatCurrency(grossPnL)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Winrate
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{winRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Lots
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{Math.round(lots)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Winners
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{winners}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Commissions
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">${commissions.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Losers
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{losers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Profit Factor
            </span>
            <span className="font-medium bg-gray-800 px-2 py-0.5 rounded">{profitFactor}</span>
          </div>
        </div>
        
        {(insights.length > 0 || emotionInsight) && (
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              <h3 className="text-sm font-semibold text-indigo-300">Key Insights</h3>
            </div>
            
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="bg-gray-800/80 backdrop-blur-sm rounded-md p-3 flex gap-3 items-start border border-indigo-500/20 shadow-sm shadow-indigo-500/10"
              >
                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{insight.message}</p>
                </div>
              </div>
            ))}
            
            {emotionInsight && (
              <div 
                className="bg-gray-800/80 backdrop-blur-sm rounded-md p-3 flex gap-3 items-start border border-indigo-500/20 shadow-sm shadow-indigo-500/10"
              >
                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">{emotionInsight.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{emotionInsight.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-2 italic px-2">
          You can see only daily aggregated insights here. To view detailed insights, go to the corresponding trade.
        </div>
      </DialogContent>
    </Dialog>
  );
};
