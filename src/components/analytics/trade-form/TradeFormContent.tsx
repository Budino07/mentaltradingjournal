
import { Trade } from "@/types/trade";
import { FormSections } from "./form-sections/FormSections";
import { FormActions } from "./form-sections/FormActions";
import { useTradeForm } from "./hooks/useTradeForm";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [formValues, setFormValues] = useState<Partial<Trade>>({});
  const { handleSubmit } = useTradeForm({
    editTrade,
    onSubmit,
    onOpenChange
  });
  const isMobile = useIsMobile();

  // Pre-populate form fields when editing - optimized for immediate display
  useEffect(() => {
    if (editTrade) {
      // Ensure direction is set first
      setDirection(editTrade.direction as 'buy' | 'sell');
      
      // Extract and normalize the setup value
      const setupValue = editTrade.setup ? editTrade.setup.trim() : "";
      
      // Update form values with all trade data immediately
      setFormValues({
        ...editTrade,
        setup: setupValue
      });
      
      // Force immediate DOM update
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          // Update all form fields immediately
          Object.entries(editTrade).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
              if (input) {
                input.value = value.toString();
              }
            }
          });
          
          // Explicitly force update setup input and the hidden input
          const setupInput = form.querySelector('input[name="setup"]') as HTMLInputElement;
          if (setupInput) {
            setupInput.value = setupValue;
            
            // Dispatch input event to trigger any listeners
            const event = new Event('input', { bubbles: true });
            setupInput.dispatchEvent(event);
          }
        }
      }, 0);
    }
  }, [editTrade, setDirection]);

  // Handle direction change without losing form data
  const handleDirectionChange = (newDirection: 'buy' | 'sell') => {
    // Save current form values
    const form = document.querySelector('form');
    const currentValues: Record<string, any> = {...formValues};
    
    if (form) {
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.name && input.name !== 'direction') {
          currentValues[input.name] = input.value;
        }
      });
    }
    
    // Update direction
    setDirection(newDirection);
    
    // Update formValues with new direction and preserved values
    setFormValues({
      ...currentValues,
      direction: newDirection
    });
    
    // Immediate update without delay
    setTimeout(() => {
      const updatedForm = document.querySelector('form');
      if (updatedForm) {
        // Restore all form values
        Object.entries(currentValues).forEach(([key, value]) => {
          if (key !== 'direction' && value !== undefined && value !== null) {
            const input = updatedForm.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (input) {
              input.value = value.toString();
              
              // Dispatch input event to trigger any listeners
              const event = new Event('input', { bubbles: true });
              input.dispatchEvent(event);
            }
          }
        });
      }
    }, 0);
  };

  const handleSetupChange = (setup: string) => {
    setFormValues({
      ...formValues,
      setup
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col ${isMobile ? 'h-[calc(100vh-120px)]' : 'h-[calc(90vh-60px)]'}`}>
      <div className="flex-1 overflow-y-auto">
        <FormSections 
          direction={direction} 
          setDirection={handleDirectionChange} 
          formValues={formValues}
          onSetupChange={handleSetupChange}
        />
      </div>
      <FormActions isEdit={!!editTrade} />
    </form>
  );
};
