
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { isWithinInterval, startOfMonth, endOfMonth, subMonths, subYears, startOfYear, endOfYear } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trade } from "@/types/trade";
import { JournalEntryType } from "@/types/journal";

interface TradeWithEntry extends Trade {
  journalEntryId: string;
  entryDate: string | Date;
  symbol?: string;
  instrument?: string;
  direction?: 'LONG' | 'SHORT';
  pnl: number | string;
}

export const TradesOverviewTable = () => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'entryDate',
    direction: 'descending'
  });
  
  const { timeFilter } = useTimeFilter();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const getTimeInterval = () => {
    const now = new Date();
    if (!timeFilter) {
      return null;
    }
    
    switch (timeFilter) {
      case "this-month":
        return {
          start: startOfMonth(now),
          end: now
        };
      case "last-month":
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case "last-three-months":
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: now
        };
      case "last-year":
        return {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        };
      case "eternal":
        return null; // No filtering
      default:
        return null;
    }
  };

  // Extract trades from journal entries
  const extractTrades = (): TradeWithEntry[] => {
    if (!analytics?.journalEntries) return [];

    const interval = getTimeInterval();
    const entries = interval
      ? analytics.journalEntries.filter(entry => {
          const entryDate = new Date(entry.created_at);
          return isWithinInterval(entryDate, { start: interval.start, end: interval.end });
        })
      : analytics.journalEntries;

    return entries.flatMap((entry: JournalEntryType) => 
      (entry.trades || []).map((trade: any) => ({
        ...trade,
        journalEntryId: entry.id,
        pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
             typeof trade.pnl === 'number' ? trade.pnl : 0
      }))
    );
  };

  const allTrades = extractTrades();

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTrades = [...allTrades].sort((a, b) => {
    if (sortConfig.key === 'entryDate') {
      const dateA = new Date(a.entryDate || '').getTime();
      const dateB = new Date(b.entryDate || '').getTime();
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'pnl') {
      const pnlA = typeof a.pnl === 'string' ? parseFloat(a.pnl) : a.pnl || 0;
      const pnlB = typeof b.pnl === 'string' ? parseFloat(b.pnl) : b.pnl || 0;
      return sortConfig.direction === 'ascending' ? pnlA - pnlB : pnlB - pnlA;
    }
    // Default string comparison for other fields
    const valueA = a[sortConfig.key as keyof TradeWithEntry] || '';
    const valueB = b[sortConfig.key as keyof TradeWithEntry] || '';
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortConfig.direction === 'ascending'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });

  const handleRowClick = (journalEntryId: string) => {
    navigate(`/journal?entryId=${journalEntryId}`);
  };

  const getPnLColor = (pnl: number | string) => {
    const numericPnL = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    return numericPnL >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBadge = (pnl: number | string) => {
    const numericPnL = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    const isWin = numericPnL >= 0;
    return (
      <span 
        className={`px-2.5 py-0.5 rounded-md text-sm font-medium ${
          isWin ? 'bg-teal-100/20 text-teal-500 border border-teal-500/30' : 
          'bg-red-100/20 text-red-400 border border-red-400/30'
        }`}
      >
        {isWin ? 'WIN' : 'LOSS'}
      </span>
    );
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[80px]">STATUS</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('entryDate')}
                >
                  OPEN DATE {sortConfig.key === 'entryDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHead>
                <TableHead>SYMBOL</TableHead>
                <TableHead 
                  className="text-right cursor-pointer"
                  onClick={() => handleSort('pnl')}
                >
                  RETURN $ {sortConfig.key === 'pnl' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">SIDE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrades.length > 0 ? (
                sortedTrades.map((trade, index) => (
                  <TableRow 
                    key={`${trade.journalEntryId}-${index}`}
                    onClick={() => handleRowClick(trade.journalEntryId)}
                    className="cursor-pointer hover:bg-accent/40"
                  >
                    <TableCell>{getStatusBadge(trade.pnl)}</TableCell>
                    <TableCell>{formatDate(trade.entryDate)}</TableCell>
                    <TableCell className="text-primary">
                      {trade.symbol || trade.instrument || 'N/A'}
                    </TableCell>
                    <TableCell className={`text-right ${getPnLColor(trade.pnl)}`}>
                      {typeof trade.pnl === 'number' 
                        ? (trade.pnl >= 0 ? '$' + trade.pnl.toFixed(2) : '-$' + Math.abs(trade.pnl).toFixed(2))
                        : typeof trade.pnl === 'string'
                          ? (parseFloat(trade.pnl) >= 0 ? '$' + parseFloat(trade.pnl).toFixed(2) : '-$' + Math.abs(parseFloat(trade.pnl)).toFixed(2))
                          : '$0.00'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        trade.direction === 'SHORT' ? 'bg-pink-100/20 text-pink-500 border border-pink-500/30' : 
                        'bg-teal-100/20 text-teal-500 border border-teal-500/30'
                      }`}>
                        {trade.direction || 'LONG'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No trades available for the selected time period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
