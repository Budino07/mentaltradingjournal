
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TradingAccount {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

interface TradingAccountsContextType {
  accounts: TradingAccount[];
  activeAccount: TradingAccount | null;
  setActiveAccount: (account: TradingAccount) => void;
  isLoading: boolean;
  createAccount: (name: string, description?: string) => Promise<void>;
  updateAccount: (id: string, name: string, description?: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const TradingAccountsContext = createContext<TradingAccountsContextType | undefined>(undefined);

export const useTradingAccounts = () => {
  const context = useContext(TradingAccountsContext);
  if (context === undefined) {
    throw new Error("useTradingAccounts must be used within a TradingAccountsProvider");
  }
  return context;
};

export const TradingAccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<TradingAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAccounts(data || []);
      
      // Set active account from localStorage or use the first account
      const storedAccountId = localStorage.getItem("activeAccountId");
      if (data && data.length > 0) {
        const active = storedAccountId 
          ? data.find(acc => acc.id === storedAccountId) 
          : data[0];
        
        setActiveAccount(active || data[0]);
        
        if (active) {
          localStorage.setItem("activeAccountId", active.id);
        }
      } else if (data && data.length === 0) {
        // Create a default account if none exists
        await createDefaultAccount();
      }
    } catch (error) {
      console.error("Error fetching trading accounts:", error);
      toast.error("Failed to load trading accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultAccount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("trading_accounts")
        .insert({
          name: "Default Account",
          description: "My main trading account",
          user_id: user.id
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts([data]);
        setActiveAccount(data);
        localStorage.setItem("activeAccountId", data.id);
      }
    } catch (error) {
      console.error("Error creating default account:", error);
      toast.error("Failed to create default trading account");
    }
  };

  const createAccount = async (name: string, description?: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("trading_accounts")
        .insert({
          name,
          description,
          user_id: user.id
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts(prev => [data, ...prev]);
        toast.success(`Account "${name}" created successfully`);
      }
    } catch (error) {
      console.error("Error creating trading account:", error);
      toast.error("Failed to create trading account");
    }
  };

  const updateAccount = async (id: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from("trading_accounts")
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts(prev => 
          prev.map(account => account.id === id ? data : account)
        );
        
        if (activeAccount?.id === id) {
          setActiveAccount(data);
        }
        
        toast.success(`Account "${name}" updated successfully`);
      }
    } catch (error) {
      console.error("Error updating trading account:", error);
      toast.error("Failed to update trading account");
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trading_accounts")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAccounts(prev => prev.filter(account => account.id !== id));
      
      // If we deleted the active account, set the first remaining account as active
      if (activeAccount?.id === id && accounts.length > 1) {
        const newActive = accounts.find(acc => acc.id !== id);
        if (newActive) {
          setActiveAccount(newActive);
          localStorage.setItem("activeAccountId", newActive.id);
        }
      }
      
      toast.success("Trading account deleted successfully");
    } catch (error) {
      console.error("Error deleting trading account:", error);
      toast.error("Failed to delete trading account");
    }
  };

  const handleSetActiveAccount = (account: TradingAccount) => {
    setActiveAccount(account);
    localStorage.setItem("activeAccountId", account.id);
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
      
      // Subscribe to trading_accounts table changes
      const channel = supabase
        .channel("trading_accounts_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "trading_accounts",
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchAccounts();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const value = {
    accounts,
    activeAccount,
    setActiveAccount: handleSetActiveAccount,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount
  };

  return (
    <TradingAccountsContext.Provider value={value}>
      {children}
    </TradingAccountsContext.Provider>
  );
};
