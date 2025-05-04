
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
import { TradingAccount } from "./AccountsDialog";
import { useState } from "react";

interface AccountDeleteDialogProps {
  account: TradingAccount | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (accountId: string) => void;
}

export const AccountDeleteDialog = ({
  account,
  onOpenChange,
  onDelete,
}: AccountDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = () => {
    if (!account) return;
    
    setIsDeleting(true);
    
    try {
      onDelete(account.id);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };
  
  return (
    <AlertDialog open={!!account} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trading Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{account?.name}"? This action cannot be undone.
            All trades associated with this account will be reassigned to your default account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
