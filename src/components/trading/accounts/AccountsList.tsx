
import { useState } from "react";
import { TradingAccount } from "./AccountsDialog";
import { Edit, Trash2, Check, Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountEditDialog } from "./AccountEditDialog";
import { AccountDeleteDialog } from "./AccountDeleteDialog";

interface AccountsListProps {
  accounts: TradingAccount[];
  isLoading: boolean;
  currentAccount: TradingAccount | null;
  onSetDefault: (accountId: string) => void;
  onUpdate: (account: TradingAccount) => void;
  onDelete: (accountId: string) => void;
}

export const AccountsList = ({
  accounts,
  isLoading,
  currentAccount,
  onSetDefault,
  onUpdate,
  onDelete,
}: AccountsListProps) => {
  const [editAccount, setEditAccount] = useState<TradingAccount | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<TradingAccount | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No trading accounts found. Create one above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Your Accounts</h3>
      
      <div className="space-y-2">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className={`flex items-center justify-between p-3 rounded-md border ${
              account.is_default ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              {account.is_default && (
                <Star className="h-4 w-4 text-primary" fill="currentColor" />
              )}
              <div>
                <p className="font-medium">{account.name}</p>
                {account.description && (
                  <p className="text-sm text-muted-foreground">{account.description}</p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!account.is_default && (
                  <DropdownMenuItem onClick={() => onSetDefault(account.id)}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setEditAccount(account)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!account.is_default && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteAccount(account)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      
      <AccountEditDialog
        account={editAccount}
        onOpenChange={(open) => !open && setEditAccount(null)}
        onUpdate={onUpdate}
      />
      
      <AccountDeleteDialog
        account={deleteAccount}
        onOpenChange={(open) => !open && setDeleteAccount(null)}
        onDelete={onDelete}
      />
    </div>
  );
};
