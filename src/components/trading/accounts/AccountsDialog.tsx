
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AccountsList } from "./AccountsList";
import { NewAccountForm } from "./NewAccountForm";
import { toast } from "sonner";

export interface TradingAccount {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

interface AccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountsDialog = ({ open, onOpenChange }: AccountsDialogProps) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [currentAccount, setCurrentAccount] = useState<TradingAccount | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchAccounts();
    }
  }, [open, user]);

  const fetchAccounts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAccounts(data || []);
      
      // Set current account to default account
      const defaultAccount = data?.find(account => account.is_default);
      if (defaultAccount) {
        setCurrentAccount(defaultAccount);
      } else if (data && data.length > 0) {
        setCurrentAccount(data[0]);
      }
      
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      toast.error('Failed to load trading accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountCreated = (newAccount: TradingAccount) => {
    setAccounts(prev => [newAccount, ...prev]);
    
    // If it's the first account or marked as default, set it as current
    if (newAccount.is_default || accounts.length === 0) {
      setCurrentAccount(newAccount);
    }
    
    toast.success('Account created successfully');
  };

  const handleAccountUpdated = async (updatedAccount: TradingAccount) => {
    setAccounts(prev => prev.map(account => 
      account.id === updatedAccount.id ? updatedAccount : account
    ));
    
    // If updated account is different from current and is default, update current
    if (updatedAccount.is_default && currentAccount?.id !== updatedAccount.id) {
      setCurrentAccount(updatedAccount);
    }
    
    toast.success('Account updated successfully');
  };

  const handleAccountDeleted = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) throw error;
      
      // Remove account from list
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      
      // If deleted account is current, set current to another account
      if (currentAccount?.id === accountId) {
        const remainingAccounts = accounts.filter(account => account.id !== accountId);
        if (remainingAccounts.length > 0) {
          const defaultAccount = remainingAccounts.find(account => account.is_default);
          setCurrentAccount(defaultAccount || remainingAccounts[0]);
        } else {
          setCurrentAccount(null);
        }
      }
      
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      // First, unset all accounts as default
      await supabase
        .from('trading_accounts')
        .update({ is_default: false })
        .eq('user_id', user?.id);
      
      // Then set the selected account as default
      const { data, error } = await supabase
        .from('trading_accounts')
        .update({ is_default: true })
        .eq('id', accountId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the accounts list
      setAccounts(prev => prev.map(account => ({
        ...account,
        is_default: account.id === accountId
      })));
      
      // Update current account
      if (data) {
        setCurrentAccount(data);
      }
      
      toast.success('Default account updated successfully');
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to set default account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trading Accounts</DialogTitle>
          <DialogDescription>
            Manage your trading accounts. Each account will track trades and performance separately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <NewAccountForm onAccountCreated={handleAccountCreated} />
          
          <AccountsList 
            accounts={accounts}
            isLoading={isLoading}
            currentAccount={currentAccount}
            onSetDefault={handleSetDefault}
            onUpdate={handleAccountUpdated}
            onDelete={handleAccountDeleted}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
