
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trade } from "@/types/analytics";

interface TradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
  setup: string;
}

// Helper function to format currency values
const formatCurrency = (value: number): string => {
  return Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const TradesDialog = ({ open, onOpenChange, trades, setup }: TradesDialogProps) => {
  const navigate = useNavigate();

  const handleTradeClick = (trade: Trade) => {
    // If the trade has a journalEntryId, navigate to the dashboard
    if (trade.id) {
      navigate(`/dashboard?entry=${trade.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{setup} Trades</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-2">
          Click to view entries
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry Date</TableHead>
              <TableHead>Instrument</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>Stop Loss</TableHead>
              <TableHead>Take Profit</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade, index) => (
              <TableRow 
                key={index} 
                className={trade.id ? "cursor-pointer hover:bg-accent/50" : ""}
                onClick={() => trade.id && handleTradeClick(trade)}
              >
                <TableCell>
                  {trade.entryDate ? new Date(trade.entryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {trade.instrument || 'N/A'}
                </TableCell>
                <TableCell className={
                  trade.direction?.toLowerCase() === 'buy' ? 'text-green-500' : 
                  trade.direction?.toLowerCase() === 'sell' ? 'text-red-500' : ''
                }>
                  {trade.direction?.toUpperCase() || 'N/A'}
                </TableCell>
                <TableCell>{trade.entryPrice || 'N/A'}</TableCell>
                <TableCell>{trade.exitPrice || 'N/A'}</TableCell>
                <TableCell>{trade.stopLoss || 'N/A'}</TableCell>
                <TableCell>{trade.takeProfit || 'N/A'}</TableCell>
                <TableCell className={`text-right ${Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${formatCurrency(Number(trade.pnl))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
