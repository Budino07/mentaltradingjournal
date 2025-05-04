
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TradingAccount {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}

interface TradingAccountsContextType {
  accounts: TradingAccount[];
  activeAccount: TradingAccount | null;
  setActiveAccount: (account: TradingAccount) => void;
  addAccount: (name: string, description?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TradingAccountsContext = createContext<TradingAccountsContextType | undefined>(undefined);

export const TradingAccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<TradingAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setActiveAccount(null);
      setIsLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('trading_accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setAccounts(data as TradingAccount[]);
          
          // Set the first account as active if no active account
          if (data.length > 0 && !activeAccount) {
            setActiveAccount(data[0] as TradingAccount);
          }
        }
      } catch (err) {
        console.error('Error fetching trading accounts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trading accounts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, [user]);
  
  const addAccount = async (name: string, description?: string) => {
    if (!user) return;
    
    try {
      setError(null);
      
      const newAccount = {
        name,
        description,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert(newAccount)
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        const typedAccount = data as unknown as TradingAccount;
        setAccounts(prevAccounts => [...prevAccounts, typedAccount]);
        
        // If this is the first account, set it as active
        if (accounts.length === 0) {
          setActiveAccount(typedAccount);
        }
      }
    } catch (err) {
      console.error('Error adding trading account:', err);
      setError(err instanceof Error ? err.message : 'Failed to add trading account');
    }
  };

  return (
    <TradingAccountsContext.Provider
      value={{
        accounts,
        activeAccount,
        setActiveAccount,
        addAccount,
        isLoading,
        error
      }}
    >
      {children}
    </TradingAccountsContext.Provider>
  );
};

export const useTradingAccounts = () => {
  const context = useContext(TradingAccountsContext);
  if (context === undefined) {
    throw new Error('useTradingAccounts must be used within a TradingAccountsProvider');
  }
  return context;
};
