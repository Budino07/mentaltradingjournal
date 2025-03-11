
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
import { formatCurrency } from "@/utils/analyticsUtils";
import { Trade } from "@/types/analytics";

interface TradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
  setup: string;
}

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
              <TableHead>Duration</TableHead>
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
                  {new Date(trade.entryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{trade.duration || '-'}</TableCell>
                <TableCell className={trade.direction === 'buy' ? 'text-green-500' : 'text-red-500'}>
                  {trade.direction?.toUpperCase()}
                </TableCell>
                <TableCell>{trade.entryPrice}</TableCell>
                <TableCell>{trade.exitPrice}</TableCell>
                <TableCell>{trade.stopLoss}</TableCell>
                <TableCell>{trade.takeProfit}</TableCell>
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
