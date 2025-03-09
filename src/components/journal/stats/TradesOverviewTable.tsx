
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trade";
import { formatDate } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradesOverviewTableProps {
  trades: { 
    trade: Trade; 
    entryId: string;
    entryDate: string;
  }[];
}

// Format the PnL as currency
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined) return "$0.00";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "$0.00";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
};

// Determine if a trade is a win or loss
const getTradeStatus = (pnl: number | string | undefined): "WIN" | "LOSS" => {
  if (pnl === undefined) return "LOSS";
  
  const numPnl = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
  return numPnl > 0 ? "WIN" : "LOSS";
};

export const TradesOverviewTable = ({ trades }: TradesOverviewTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (entryId: string) => {
    navigate(`/journal/${entryId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <div className="overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>STATUS</TableHead>
                    <TableHead>OPEN DATE</TableHead>
                    <TableHead>SYMBOL</TableHead>
                    <TableHead className="text-right">RETURN $</TableHead>
                    <TableHead>SIDE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No trades found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    trades.map((item, index) => {
                      const { trade, entryId, entryDate } = item;
                      const status = getTradeStatus(trade.pnl);
                      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0);
                      
                      return (
                        <TableRow 
                          key={`${trade.id || index}`}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => handleRowClick(entryId)}
                        >
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`font-medium ${status === 'WIN' ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(entryDate || trade.entryDate || '')}</TableCell>
                          <TableCell className="font-medium text-blue-400">{trade.instrument || '-'}</TableCell>
                          <TableCell className={`text-right font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(trade.pnl)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`font-medium ${trade.direction === 'buy' ? 'bg-blue-500/20 text-blue-500 border-blue-500/50' : 'bg-pink-500/20 text-pink-500 border-pink-500/50'}`}
                            >
                              {trade.direction === 'buy' ? 'LONG' : 'SHORT'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
