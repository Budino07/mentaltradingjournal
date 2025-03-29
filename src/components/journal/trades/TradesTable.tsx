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
import { ArrowUp, ArrowDown, Star, Edit, Trash, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import { Trade } from "@/types/trade";
import { AddTradeDialog } from "@/components/analytics/AddTradeDialog";
import { useTradeActions } from "@/components/journal/entry/hooks/useTradeActions";
import { useAuth } from "@/contexts/AuthContext";
import { TradeDeleteDialog } from "@/components/journal/entry/trade-item/TradeDeleteDialog";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type SortField = 'entryDate' | 'instrument' | 'direction' | 'setup' | 'pnl' | 'exitDate';
type SortDirection = 'asc' | 'desc';

export const TradesTable = ({ trades }: { trades: Trade[] }) => {
  const { user } = useAuth();
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('entryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sortedTrades, setSortedTrades] = useState<Trade[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);
  
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

  useEffect(() => {
    const sorted = [...trades].sort((a, b) => {
      switch (sortField) {
        case 'entryDate':
          if (!a.entryDate) return sortDirection === 'asc' ? 1 : -1;
          if (!b.entryDate) return sortDirection === 'asc' ? -1 : 1;
          return sortDirection === 'asc' 
            ? new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
            : new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
        
        case 'exitDate':
          if (!a.exitDate) return sortDirection === 'asc' ? 1 : -1;
          if (!b.exitDate) return sortDirection === 'asc' ? -1 : 1;
          return sortDirection === 'asc' 
            ? new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()
            : new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime();
            
        case 'pnl':
          const aPnl = parseFloat(String(a.pnl || a.profit_loss || 0));
          const bPnl = parseFloat(String(b.pnl || b.profit_loss || 0));
          return sortDirection === 'asc' ? aPnl - bPnl : bPnl - aPnl;
          
        case 'instrument':
          return sortDirection === 'asc' 
            ? (a.instrument || '').localeCompare(b.instrument || '')
            : (b.instrument || '').localeCompare(a.instrument || '');
        
        case 'direction':
          return sortDirection === 'asc' 
            ? (a.direction || '').localeCompare(b.direction || '')
            : (b.direction || '').localeCompare(a.direction || '');
        
        case 'setup':
          return sortDirection === 'asc' 
            ? (a.setup || '').localeCompare(b.setup || '')
            : (b.setup || '').localeCompare(a.setup || '');
            
        default:
          return 0;
      }
    });
    
    setSortedTrades(sorted);
  }, [trades, sortField, sortDirection]);

  const getTradePnLColor = (pnl: number | string | undefined) => {
    if (!pnl) return "text-gray-400";
    const numPnl = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    return numPnl > 0 ? "text-green-500" : numPnl < 0 ? "text-red-500" : "text-gray-400";
  };

  const handleRowClick = (trade: Trade) => {
    if (!trade.entryDate) return;

    // Create a custom event to select this date in the calendar
    const date = new Date(trade.entryDate);
    const event = new CustomEvent('journal-date-select', { 
      detail: { date }
    });
    window.dispatchEvent(event);
    
    // Scroll to journal entries section
    setTimeout(() => {
      const journalEntriesSection = document.querySelector('#journal-entries');
      if (journalEntriesSection) {
        journalEntriesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };
  
  // Get current trades for pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = sortedTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  
  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-xl border-primary/10 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          Trades List
        </h2>
        <Button onClick={() => setIsAddTradeOpen(true)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead onClick={() => handleSort('entryDate')} className="cursor-pointer">
                <div className="flex items-center">
                  Entry Date
                  {getSortIcon('entryDate')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('instrument')} className="cursor-pointer">
                <div className="flex items-center">
                  Instrument
                  {getSortIcon('instrument')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('direction')} className="cursor-pointer">
                <div className="flex items-center">
                  Direction
                  {getSortIcon('direction')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('setup')} className="cursor-pointer">
                <div className="flex items-center">
                  Setup
                  {getSortIcon('setup')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('pnl')} className="cursor-pointer text-right">
                <div className="flex items-center justify-end">
                  P&L
                  {getSortIcon('pnl')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('exitDate')} className="cursor-pointer">
                <div className="flex items-center">
                  Exit Date
                  {getSortIcon('exitDate')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTrades.length > 0 ? (
              currentTrades.map((trade) => (
                <TableRow 
                  key={trade.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    // Don't trigger row click when clicking on action buttons
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleRowClick(trade);
                  }}
                >
                  <TableCell>
                    {trade.direction === 'buy' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{trade.entryDate ? formatDate(trade.entryDate) : '-'}</TableCell>
                  <TableCell>{trade.instrument || '-'}</TableCell>
                  <TableCell className="text-white">
                    {trade.direction?.toUpperCase() || '-'}
                  </TableCell>
                  <TableCell>{trade.setup || '-'}</TableCell>
                  <TableCell className={`text-right ${getTradePnLColor(trade.pnl || trade.profit_loss)}`}>
                    {(trade.pnl || trade.profit_loss) ? 
                      `$${Number(trade.pnl || trade.profit_loss).toFixed(2)}` : 
                      '-'}
                  </TableCell>
                  <TableCell>{trade.exitDate ? formatDate(trade.exitDate) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(trade);
                        }}
                        title="Edit trade"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(trade);
                        }}
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
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstTrade + 1}-{Math.min(indexOfLastTrade, sortedTrades.length)} of {sortedTrades.length} trades
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
