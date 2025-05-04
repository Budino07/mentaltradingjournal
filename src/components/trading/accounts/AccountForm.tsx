
import { useState } from "react";
import { useTradingAccounts, TradingAccount } from "@/contexts/TradingAccountsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountFormProps {
  account?: TradingAccount;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AccountForm = ({ account, onSubmit, onCancel }: AccountFormProps) => {
  const { createAccount, updateAccount } = useTradingAccounts();
  const [name, setName] = useState(account?.name || "");
  const [description, setDescription] = useState(account?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (account) {
        await updateAccount(account.id, name, description || undefined);
      } else {
        await createAccount(name, description || undefined);
      }
      onSubmit();
    } catch (error) {
      console.error("Error saving account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., 50K Account"
          required
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="w-full resize-none h-20"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              </span>
              Saving...
            </>
          ) : account ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
};
