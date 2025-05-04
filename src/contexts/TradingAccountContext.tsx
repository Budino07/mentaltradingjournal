
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TradingAccount {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

interface TradingAccountContextType {
  currentAccount: TradingAccount | null;
  accounts: TradingAccount[];
  isLoading: boolean;
  error: string | null;
  refreshAccounts: () => Promise<void>;
  setCurrentAccount: (account: TradingAccount) => void;
}

const TradingAccountContext = createContext<TradingAccountContextType>({
  currentAccount: null,
  accounts: [],
  isLoading: true,
  error: null,
  refreshAccounts: async () => {},
  setCurrentAccount: () => {},
});

export const useTradingAccount = () => useContext(TradingAccountContext);

export const TradingAccountProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<TradingAccount | null>(null);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setCurrentAccount(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAccounts(data || []);

      // Set current account to default account or first account
      const defaultAccount = data?.find((account) => account.is_default);
      if (defaultAccount) {
        setCurrentAccount(defaultAccount);
      } else if (data && data.length > 0) {
        setCurrentAccount(data[0]);
      } else {
        setCurrentAccount(null);
      }
    } catch (err) {
      console.error("Error fetching trading accounts:", err);
      setError("Failed to load trading accounts");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accounts on initial load
  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  // Listen for real-time changes to trading accounts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("trading_accounts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trading_accounts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh accounts when changes occur
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <TradingAccountContext.Provider
      value={{
        currentAccount,
        accounts,
        isLoading,
        error,
        refreshAccounts: fetchAccounts,
        setCurrentAccount,
      }}
    >
      {children}
    </TradingAccountContext.Provider>
  );
};
