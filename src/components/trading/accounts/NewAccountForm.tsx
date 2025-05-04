
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TradingAccount } from "./AccountsDialog";

interface NewAccountFormProps {
  onAccountCreated: (account: TradingAccount) => void;
}

export const NewAccountForm = ({ onAccountCreated }: NewAccountFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create accounts");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If setting this as default, unset all other defaults first
      if (isDefault) {
        await supabase
          .from("trading_accounts")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }
      
      // Create new trading account
      const { data, error } = await supabase
        .from("trading_accounts")
        .insert({
          name,
          description: description || null,
          is_default: isDefault,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      onAccountCreated(data as TradingAccount);
      
      // Reset form
      setName("");
      setDescription("");
      setIsDefault(false);
      
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          placeholder="Personal Trading"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe this trading account..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is-default" 
          checked={isDefault} 
          onCheckedChange={(checked) => setIsDefault(checked as boolean)} 
        />
        <Label htmlFor="is-default" className="text-sm font-normal">
          Set as default trading account
        </Label>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
};
