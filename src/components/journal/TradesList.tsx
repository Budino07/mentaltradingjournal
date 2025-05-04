
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { TradesTable } from './trades/TradesTable';
import { useTradingAccounts } from "@/contexts/TradingAccountsContext";

export const JournalTradesList = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeAccount } = useTradingAccounts();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        let query = supabase
          .from('journal_entries')
          .select('trades')
          .eq('user_id', user.id)
          .not('trades', 'is', null);
        
        // Filter by account_id if an active account is selected
        if (activeAccount) {
          query = query.eq('account_id', activeAccount.id);
        }
          
        const { data, error } = await query;
          
        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }
        
        // Extract trades from all entries and flatten them into a single array
        const extractedTrades: Trade[] = data
          .flatMap(entry => {
            const trades = entry.trades as unknown as Trade[];
            return trades || [];
          })
          .filter(trade => trade && Object.keys(trade).length > 0);
          
        setTrades(extractedTrades);
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
  }, [user, activeAccount]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return <TradesTable trades={trades} />;
};
