
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Star, Edit, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/journal/entry/utils/dateUtils";
import { Trade } from "@/types/trade";
import { AddTradeDialog } from "@/components/analytics/AddTradeDialog";
import { useTradeActions } from "@/components/journal/entry/hooks/useTradeActions";
import { useAuth } from "@/contexts/AuthContext";
import { TradeDeleteDialog } from "@/components/journal/entry/trade-item/TradeDeleteDialog";
import { Card } from "@/components/ui/card";

export const TradesTable = ({ trades }: { trades: Trade[] }) => {
  const { user } = useAuth();
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedTrade,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleTradeUpdate
  } = useTradeActions(user);

  const getTradePnLColor = (pnl: number | string | undefined) => {
    if (!pnl) return "text-gray-400";
    const numPnl = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    return numPnl > 0 ? "text-green-500" : numPnl < 0 ? "text-red-500" : "text-gray-400";
  };

  const ActionButtons = () => (
    <div className="flex gap-2 mb-4">
      <Button onClick={() => setIsAddTradeOpen(true)} size="sm" className="gap-1">
        <Plus className="h-4 w-4" />
        Add Trade
      </Button>
    </div>
  );

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-xl border-primary/10 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          Trades List
        </h2>
        <ActionButtons />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead>Instrument</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Setup</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead>Exit Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length > 0 ? (
              trades.map((trade) => (
                <TableRow key={trade.id} className="hover:bg-muted/50">
                  <TableCell>
                    {trade.direction === 'buy' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{trade.entryDate ? formatDate(new Date(trade.entryDate)) : '-'}</TableCell>
                  <TableCell>{trade.instrument || '-'}</TableCell>
                  <TableCell className={trade.direction === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {trade.direction?.toUpperCase() || '-'}
                  </TableCell>
                  <TableCell>{trade.setup || '-'}</TableCell>
                  <TableCell className={`text-right ${getTradePnLColor(trade.pnl || trade.profit_loss)}`}>
                    {(trade.pnl || trade.profit_loss) ? 
                      Number(trade.pnl || trade.profit_loss).toFixed(2) : 
                      '-'}
                  </TableCell>
                  <TableCell>{trade.exitDate ? formatDate(new Date(trade.exitDate)) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditClick(trade)}
                        title="Edit trade"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(trade)}
                        title="Delete trade"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No trades found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddTradeDialog
        open={isAddTradeOpen}
        onOpenChange={setIsAddTradeOpen}
        onSubmit={handleTradeUpdate}
      />

      <AddTradeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleTradeUpdate}
        editTrade={selectedTrade}
      />

      <TradeDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
};
