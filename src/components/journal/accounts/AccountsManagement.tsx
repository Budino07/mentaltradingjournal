
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TradingAccount, useTradingAccounts } from "@/contexts/TradingAccountsContext";
import { Edit, MoreVertical, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { AccountDialog } from "./AccountDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountsManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountsManagement = ({ open, onOpenChange }: AccountsManagementProps) => {
  const { accounts, isLoading, deleteAccount } = useTradingAccounts();
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<TradingAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<TradingAccount | null>(null);

  const handleEditAccount = (account: TradingAccount) => {
    setAccountToEdit(account);
  };

  const handleDeleteAccount = async (account: TradingAccount) => {
    setAccountToDelete(account);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    if (accounts.length <= 1) {
      toast.error("You must have at least one trading account");
      setAccountToDelete(null);
      return;
    }

    try {
      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Manage Trading Accounts</DialogTitle>
            <DialogDescription>
              Create and manage your trading accounts to track different strategies or portfolios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Button onClick={() => setIsNewAccountDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Account
            </Button>

            <div className="divide-y">
              {isLoading ? (
                <div className="py-4 text-center text-muted-foreground">
                  Loading accounts...
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No trading accounts found
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      {account.description && (
                        <p className="text-sm text-muted-foreground">
                          {account.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteAccount(account)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AccountDialog
        open={isNewAccountDialogOpen}
        onOpenChange={setIsNewAccountDialogOpen}
      />

      {accountToEdit && (
        <AccountDialog
          open={!!accountToEdit}
          onOpenChange={(isOpen) => {
            if (!isOpen) setAccountToEdit(null);
          }}
          editAccount={{
            id: accountToEdit.id,
            name: accountToEdit.name,
            description: accountToEdit.description,
          }}
        />
      )}

      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAccountToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trading Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{accountToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAccount}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
