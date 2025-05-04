
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TradingAccount, useTradingAccounts } from "@/contexts/TradingAccountsContext";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { AccountDialog } from "./AccountDialog";

export const AccountSelector = () => {
  const { accounts, activeAccount, setActiveAccount } = useTradingAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!activeAccount) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 border-dashed"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Account
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            {activeAccount.name}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Trading Accounts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => setActiveAccount(account)}
              className="flex justify-between"
            >
              {account.name}
              {activeAccount.id === account.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};
