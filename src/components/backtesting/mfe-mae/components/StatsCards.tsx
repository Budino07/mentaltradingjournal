
import { Card } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface StatsCardsProps {
  stats: {
    tradesHitTp: number;
    tradesHitSl: number;
    avgUpdrawWinner: number;
    avgUpdrawLoser: number;
    avgDrawdownWinner: number;
    avgDrawdownLoser: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Trades Hit TP
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Percentage of trades that hit their take profit level.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.tradesHitTp.toFixed(2)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Trades Hit SL
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Percentage of trades that hit their stop loss level.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.tradesHitSl.toFixed(2)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Avg. MFE Winner
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Average Maximum Favorable Excursion (MFE) of Winning Trades. On average, your winning trades move this far (%-wise) in your favor before you close them.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.avgUpdrawWinner.toFixed(2)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Avg. MFE Loser
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Average Maximum Favorable Excursion (MFE) of Losing Trades. On average, your losing trades move this far (%-wise) in your favor before they turn into losses.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.avgUpdrawLoser.toFixed(2)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Avg. MAE Winner
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Average Maximum Adverse Excursion (MAE) of Winning Trades. On average, your winning trades move this far (%-wise) against you before they turn profitable.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.avgDrawdownWinner.toFixed(2)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-card-foreground flex items-center gap-2">
            Avg. MAE Loser
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Average Maximum Adverse Excursion (MAE) of Losing Trades. On average, your losing trades move this far (%-wise) against you before you close them at a loss.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{stats.avgDrawdownLoser.toFixed(2)}%</div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
