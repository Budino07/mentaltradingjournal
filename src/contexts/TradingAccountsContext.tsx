
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface TradingAccount {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_default: boolean;
}

interface TradingAccountsContextType {
  accounts: TradingAccount[];
  isLoading: boolean;
  currentAccount: TradingAccount | null;
  setCurrentAccount: (account: TradingAccount) => void;
  refreshAccounts: () => Promise<void>;
  createAccount: (name: string, description?: string) => Promise<void>;
  updateAccount: (id: string, name: string, description?: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setDefaultAccount: (id: string) => Promise<void>;
}

const TradingAccountsContext = createContext<TradingAccountsContextType | undefined>(undefined);

export const TradingAccountsProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<TradingAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshAccounts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Use a type assertion to work around the TypeScript limitation
      // since the trading_accounts table exists in the database but not in the generated types
      const { data, error } = await supabase
        .from('trading_accounts' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use a more explicit type casting approach with unknown as an intermediary
      const typedAccounts = (data || []) as unknown as TradingAccount[];
      setAccounts(typedAccounts);
      
      // Set current account to default account or first account if available
      if (typedAccounts.length > 0) {
        const defaultAccount = typedAccounts.find(acc => acc.is_default) || typedAccounts[0];
        setCurrentAccount(defaultAccount);
      } else {
        setCurrentAccount(null);
      }
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast.error('Failed to load trading accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (name: string, description?: string) => {
    if (!user) return;

    try {
      // Check if this is the first account (to set as default)
      const isFirstAccount = accounts.length === 0;
      
      const { data, error } = await supabase
        .from('trading_accounts' as any)
        .insert({
          name,
          description,
          user_id: user.id,
          is_default: isFirstAccount
        })
        .select();

      if (error) throw error;
      
      toast.success('Trading account created successfully');
      await refreshAccounts();
    } catch (error) {
      console.error('Error creating trading account:', error);
      toast.error('Failed to create trading account');
    }
  };

  const updateAccount = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('trading_accounts' as any)
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Trading account updated successfully');
      await refreshAccounts();
    } catch (error) {
      console.error('Error updating trading account:', error);
      toast.error('Failed to update trading account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      // Check if this is the default account
      const accountToDelete = accounts.find(acc => acc.id === id);
      if (!accountToDelete) return;
      
      // Don't allow deleting the only account
      if (accounts.length === 1) {
        toast.error('You need at least one trading account');
        return;
      }
      
      const { error } = await supabase
        .from('trading_accounts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If deleting default account, set another account as default
      if (accountToDelete.is_default && accounts.length > 1) {
        const newDefaultAccount = accounts.find(acc => acc.id !== id);
        if (newDefaultAccount) {
          await setDefaultAccount(newDefaultAccount.id);
        }
      }

      toast.success('Trading account deleted successfully');
      await refreshAccounts();
    } catch (error) {
      console.error('Error deleting trading account:', error);
      toast.error('Failed to delete trading account');
    }
  };

  const setDefaultAccount = async (id: string) => {
    try {
      // First remove default status from all accounts
      await supabase
        .from('trading_accounts' as any)
        .update({ is_default: false })
        .eq('user_id', user?.id);
      
      // Then set the selected account as default
      const { error } = await supabase
        .from('trading_accounts' as any)
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default trading account updated');
      await refreshAccounts();
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to update default account');
    }
  };

  useEffect(() => {
    if (user) {
      refreshAccounts();
    }
  }, [user]);

  return (
    <TradingAccountsContext.Provider
      value={{
        accounts,
        isLoading,
        currentAccount,
        setCurrentAccount,
        refreshAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount
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
