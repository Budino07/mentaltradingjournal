
import { Trade } from "@/types/trade";
import { FormSections } from "./form-sections/FormSections";
import { FormActions } from "./form-sections/FormActions";
import { useTradeForm } from "./hooks/useTradeForm";
import { useEffect } from "react";

interface TradeFormContentProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
  onSubmit: (tradeData: Trade, isEdit: boolean) => void;
  editTrade?: Trade;
  onOpenChange: (open: boolean) => void;
}

export const TradeFormContent = ({ 
  direction, 
  setDirection, 
  onSubmit, 
  editTrade, 
  onOpenChange 
}: TradeFormContentProps) => {
  const { handleSubmit } = useTradeForm({
    editTrade,
    onSubmit,
    onOpenChange
  });

  // Pre-populate form fields when editing
  useEffect(() => {
    if (editTrade) {
      const form = document.querySelector('form');
      if (form) {
        // Set all the form field values based on editTrade data
        Object.entries(editTrade).forEach(([key, value]) => {
          const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
          if (input && value !== undefined && value !== null) {
            input.value = value.toString();
            
            // Trigger change event for URL fields to show previews
            if (key === 'forecastScreenshot' || key === 'resultUrl') {
              const event = new Event('change', { bubbles: true });
              input.dispatchEvent(event);
            }
          }
        });
      }
    }
  }, [editTrade]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      <FormSections direction={direction} setDirection={setDirection} />
      <FormActions isEdit={!!editTrade} />
    </form>
  );
};
