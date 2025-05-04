
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTradingAccounts } from "@/contexts/TradingAccountsContext";
import { ChevronDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import { AccountsDialog } from "./AccountsDialog";

export const AccountSelector = () => {
  const { accounts, currentAccount, setCurrentAccount, isLoading } = useTradingAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <Button variant="outline" className="w-[180px] justify-start" disabled>
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading...
      </Button>
    );
  }
  
  if (accounts.length === 0) {
    return (
      <>
        <Button 
          variant="outline" 
          className="gap-1"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Add Trading Account
        </Button>
        
        <AccountsDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </>
    );
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <span className="truncate">{currentAccount?.name || 'Select Account'}</span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          <DropdownMenuLabel>Trading Accounts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {accounts.map((account) => (
            <DropdownMenuItem 
              key={account.id}
              className="flex items-center justify-between cursor-default"
              onClick={() => setCurrentAccount(account)}
            >
              <span className="truncate">{account.name}</span>
              {account.is_default && (
                <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5 ml-2">
                  Default
                </span>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <span className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Manage Accounts
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AccountsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};
