
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, CreditCard } from 'lucide-react';
import { useTradingAccounts, TradingAccount } from '@/contexts/TradingAccountsContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const TradingAccountsManager = () => {
  const { accounts, activeAccount, setActiveAccount, addAccount, isLoading } = useTradingAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDescription, setNewAccountDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAccountName.trim()) {
      toast.error('Account name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addAccount(newAccountName, newAccountDescription);
      setNewAccountName('');
      setNewAccountDescription('');
      setIsOpen(false);
      toast.success('Trading account created successfully');
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Failed to create trading account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Trading Accounts</h3>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trading Account</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddAccount} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Main Trading Account"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-description">Description (Optional)</Label>
                <Textarea
                  id="account-description"
                  value={newAccountDescription}
                  onChange={(e) => setNewAccountDescription(e.target.value)}
                  placeholder="Forex trading account for swing trades"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !newAccountName.trim()}
                >
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-4 rounded-md border border-border/30">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center p-4 rounded-md border border-border/30 bg-background/50">
          <CreditCard className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No trading accounts yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add an account to track your trades separately
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-md cursor-pointer border",
                activeAccount?.id === account.id
                  ? "bg-primary/10 border-primary/30"
                  : "border-border/30 hover:bg-accent/50"
              )}
              onClick={() => setActiveAccount(account)}
            >
              <Checkbox 
                id={`account-${account.id}`}
                checked={activeAccount?.id === account.id}
                onCheckedChange={() => setActiveAccount(account)}
              />
              <div>
                <Label 
                  htmlFor={`account-${account.id}`}
                  className="font-medium cursor-pointer"
                >
                  {account.name}
                </Label>
                {account.description && (
                  <p className="text-xs text-muted-foreground">{account.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
