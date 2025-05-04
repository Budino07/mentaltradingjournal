
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTradingAccounts, TradingAccount } from "@/contexts/TradingAccountsContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AccountForm } from "./AccountForm";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountsDialog = ({ open, onOpenChange }: AccountsDialogProps) => {
  const { accounts, isLoading, currentAccount, setCurrentAccount, setDefaultAccount, deleteAccount } = useTradingAccounts();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'p-4 max-w-[95vw]' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Trading Accounts</DialogTitle>
        </DialogHeader>
        
        {isAddingAccount ? (
          <AccountForm 
            onSubmit={() => setIsAddingAccount(false)}
            onCancel={() => setIsAddingAccount(false)}
          />
        ) : isEditingAccount && selectedAccount ? (
          <AccountForm 
            account={selectedAccount}
            onSubmit={() => setIsEditingAccount(false)}
            onCancel={() => setIsEditingAccount(false)}
          />
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <Button 
                onClick={() => setIsAddingAccount(true)}
                variant="outline"
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Account
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>You don't have any trading accounts yet.</p>
                <p>Add your first account to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={cn(
                      "p-3 rounded-md border flex items-center justify-between",
                      currentAccount?.id === account.id ? "bg-muted border-primary/40" : ""
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{account.name}</h3>
                        {account.is_default && (
                          <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      {account.description && (
                        <p className="text-sm text-muted-foreground">{account.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {!account.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDefaultAccount(account.id)}
                          title="Set as default"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAccount(account);
                          setIsEditingAccount(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAccount(account);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trading Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this trading account?<br />
                <span className="font-medium">{selectedAccount?.name}</span>
                <br /><br />
                This action cannot be undone, and all associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={() => {
                  if (selectedAccount) {
                    deleteAccount(selectedAccount.id);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
