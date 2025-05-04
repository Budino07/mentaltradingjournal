
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTradingAccount } from "@/contexts/TradingAccountContext";
import { Input } from "@/components/ui/input";

interface AccountSelectorProps {
  defaultAccountId?: string;
}

export const AccountSelector = ({ defaultAccountId }: AccountSelectorProps) => {
  const { accounts, currentAccount } = useTradingAccount();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    defaultAccountId || currentAccount?.id
  );

  // Update hidden input when account changes
  useEffect(() => {
    if (!selectedAccountId && currentAccount) {
      setSelectedAccountId(currentAccount.id);
    }
  }, [currentAccount, selectedAccountId]);

  return (
    <div className="space-y-2">
      <Label htmlFor="account">Trading Account</Label>
      <Select
        value={selectedAccountId}
        onValueChange={(value) => setSelectedAccountId(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} {account.is_default && "(Default)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Hidden input to store account_id */}
      <Input 
        type="hidden" 
        name="account_id" 
        value={selectedAccountId || ""} 
      />
    </div>
  );
};
