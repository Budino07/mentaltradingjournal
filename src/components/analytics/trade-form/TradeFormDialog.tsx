
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { TradeFormContent } from "./TradeFormContent";
import { Trade } from "@/types/trade";
import { SuccessDialog } from "../SuccessDialog";

interface TradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tradeData: Trade, isEdit: boolean) => void;
  editTrade?: Trade;
  children: React.ReactNode;
}

export const TradeFormDialog = ({ open, onOpenChange, onSubmit, editTrade, children }: TradeFormDialogProps) => {
  const [direction, setDirection] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    if (editTrade) {
      setDirection(editTrade.direction);
    }
  }, [editTrade]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent className="max-h-[90vh] flex flex-col p-0 sm:max-w-[1000px]">
          <div className="p-6 pb-0">
            <DialogTitle>{editTrade ? 'Edit Trade' : 'Add Trade'}</DialogTitle>
          </div>
          <TradeFormContent
            direction={direction}
            setDirection={setDirection}
            onSubmit={onSubmit}
            editTrade={editTrade}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
      <SuccessDialog />
    </>
  );
};
