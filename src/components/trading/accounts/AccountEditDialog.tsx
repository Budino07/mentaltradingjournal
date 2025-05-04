
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TradingAccount } from "./AccountsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AccountEditDialogProps {
  account: TradingAccount | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (account: TradingAccount) => void;
}

export const AccountEditDialog = ({
  account,
  onOpenChange,
  onUpdate,
}: AccountEditDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (account) {
      setName(account.name);
      setDescription(account.description || "");
      setIsDefault(account.is_default);
    }
  }, [account]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || !account) return;
    
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If setting this as default, unset all other defaults first
      if (isDefault && !account.is_default) {
        await supabase
          .from("trading_accounts")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }
      
      // Update the account
      const { data, error } = await supabase
        .from("trading_accounts")
        .update({
          name,
          description: description || null,
          is_default: isDefault,
        })
        .eq("id", account.id)
        .select()
        .single();
      
      if (error) throw error;
      
      onUpdate(data as TradingAccount);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trading Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Account Name</Label>
            <Input
              id="edit-name"
              placeholder="Personal Trading"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe this trading account..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="edit-is-default" 
              checked={isDefault} 
              onCheckedChange={(checked) => setIsDefault(checked as boolean)} 
              disabled={account?.is_default}
            />
            <Label htmlFor="edit-is-default" className="text-sm font-normal">
              {account?.is_default 
                ? "This is the default trading account" 
                : "Set as default trading account"}
            </Label>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
