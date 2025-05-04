
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { TradesTable } from './trades/TradesTable';
import { useTradingAccount } from '@/contexts/TradingAccountContext';

export const JournalTradesList = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentAccount } = useTradingAccount();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all journal entries with trades
        const { data, error } = await supabase
          .from('journal_entries')
          .select('trades')
          .eq('user_id', user.id)
          .not('trades', 'is', null);
          
        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }
        
        // Extract trades from all entries and flatten them into a single array
        const allTrades = data.flatMap(entry => {
          const trades = entry.trades as unknown as Trade[];
          return trades || [];
        }).filter(trade => trade && Object.keys(trade).length > 0);
        
        // Filter trades by current account if one is selected
        const filteredTrades = currentAccount 
          ? allTrades.filter(trade => trade.account_id === currentAccount.id)
          : allTrades;
        
        setTrades(filteredTrades);
      } catch (error) {
        console.error('Error in fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrades();
    
    // Set up real-time subscription for journal entries changes
    const channel = supabase
      .channel('trades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          // Refetch trades when journal entries change
          fetchTrades();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentAccount]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return <TradesTable trades={trades} />;
};
