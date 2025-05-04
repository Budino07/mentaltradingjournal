
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTradingAccounts } from "@/contexts/TradingAccountsContext";
import { useState } from "react";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: { id: string; name: string; description?: string };
}

export const AccountDialog = ({
  open,
  onOpenChange,
  editAccount,
}: AccountDialogProps) => {
  const [name, setName] = useState(editAccount?.name || "");
  const [description, setDescription] = useState(editAccount?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAccount, updateAccount } = useTradingAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editAccount) {
        await updateAccount(editAccount.id, name, description);
      } else {
        await createAccount(name, description);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editAccount ? "Edit Trading Account" : "Create Trading Account"}
            </DialogTitle>
            <DialogDescription>
              {editAccount
                ? "Update your trading account details."
                : "Create a new trading account to track your trades separately."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Trading Account"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of this trading account"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? "Saving..." : editAccount ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
