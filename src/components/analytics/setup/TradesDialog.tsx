
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{setup} Trades</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entry Date</TableHead>
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
              <TableRow key={index}>
                <TableCell>
                  {trade.entryDate ? new Date(trade.entryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className={trade.direction === 'buy' ? 'text-green-500' : 'text-red-500'}>
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
