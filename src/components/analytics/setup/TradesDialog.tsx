
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
import { useNavigate } from "react-router-dom";

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

  const navigateToJournalEntry = (trade: Trade) => {
    // Check if we have a journal entry ID to navigate to
    if (trade.journalEntryId) {
      // Navigate to the journal page with the date of the trade
      if (trade.entryDate) {
        const entryDate = new Date(trade.entryDate);
        navigate('/journal', { state: { selectedDate: entryDate } });
      } else {
        navigate('/journal');
      }
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
                className={trade.journalEntryId ? "cursor-pointer hover:bg-muted/60" : ""}
                onClick={() => trade.journalEntryId && navigateToJournalEntry(trade)}
              >
                <TableCell>
                  {trade.entryDate ? new Date(trade.entryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {trade.instrument || 'N/A'}
                </TableCell>
                <TableCell className={
                  trade.direction === 'buy' || trade.direction === 'BUY' ? 'text-green-500' : 
                  trade.direction === 'sell' || trade.direction === 'SELL' ? 'text-red-500' : 
                  ''
                }>
                  {trade.direction ? String(trade.direction).toUpperCase() : 'N/A'}
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
