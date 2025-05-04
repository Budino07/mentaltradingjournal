
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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

    // For now, use localStorage to persist accounts
    const loadAccounts = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const storedAccounts = localStorage.getItem(`trading_accounts_${user.id}`);
        const parsedAccounts = storedAccounts ? JSON.parse(storedAccounts) as TradingAccount[] : [];
        
        setAccounts(parsedAccounts);
        
        // Set first account as active if we have accounts and no active account
        if (parsedAccounts.length > 0 && !activeAccount) {
          setActiveAccount(parsedAccounts[0]);
        }
      } catch (err) {
        console.error('Error loading trading accounts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trading accounts');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAccounts();
  }, [user]);
  
  // Save accounts to localStorage whenever accounts change
  useEffect(() => {
    if (user && accounts.length > 0) {
      localStorage.setItem(`trading_accounts_${user.id}`, JSON.stringify(accounts));
    }
  }, [accounts, user]);

  const addAccount = async (name: string, description?: string) => {
    if (!user) return;
    
    try {
      setError(null);
      
      const newAccount: TradingAccount = {
        id: crypto.randomUUID(),
        name,
        description,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      // Update state with new account
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      
      // If this is the first account, set it as active
      if (accounts.length === 0) {
        setActiveAccount(newAccount);
      }
      
      toast.success("Trading account added successfully");
      
      return;
    } catch (err) {
      console.error('Error adding trading account:', err);
      setError(err instanceof Error ? err.message : 'Failed to add trading account');
      toast.error("Failed to add trading account");
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
