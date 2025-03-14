
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { TradeFormContent } from "./TradeFormContent";
import { Trade } from "@/types/trade";
import { SuccessDialog } from "../SuccessDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface TradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tradeData: Trade, isEdit: boolean) => void;
  editTrade?: Trade;
  children: React.ReactNode;
}

export const TradeFormDialog = ({ open, onOpenChange, onSubmit, editTrade, children }: TradeFormDialogProps) => {
  const [direction, setDirection] = useState<'buy' | 'sell' | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (editTrade) {
      setDirection(editTrade.direction);
    }
  }, [editTrade]);

  // Disable body scroll when modal is open on mobile
  useEffect(() => {
    if (isMobile) {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open, isMobile]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent className={`${isMobile ? 'max-h-[95vh] w-full p-0 top-[2.5vh] rounded-t-lg' : 'max-h-[90vh] p-4 sm:max-w-[1000px]'} flex flex-col`}>
          <div className={`${isMobile ? 'p-2 sticky top-0 z-10 bg-background' : 'p-3 sm:p-6'} pb-0`}>
            <DialogTitle>{editTrade ? 'Edit Trade' : 'Add Trade'}</DialogTitle>
          </div>
          <div className={`${isMobile ? 'overflow-y-auto flex-1 pb-4' : ''}`}>
            <TradeFormContent
              direction={direction}
              setDirection={setDirection}
              onSubmit={onSubmit}
              editTrade={editTrade}
              onOpenChange={onOpenChange}
            />
          </div>
        </DialogContent>
      </Dialog>
      <SuccessDialog />
    </>
  );
};
