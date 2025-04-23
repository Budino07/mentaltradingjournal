
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

  // Pre-populate form fields when editing
  useEffect(() => {
    if (editTrade) {
      setDirection(editTrade.direction as 'buy' | 'sell');
      
      // Ensure we have a clean object with all properties
      const cleanValues = {...editTrade};
      
      // Log setup value for debugging
      console.log("Edit trade setup value:", editTrade.setup);
      
      // Set formValues directly from editTrade
      setFormValues(cleanValues);
      
      // Synchronously update form fields
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          // Set all the form field values based on editTrade data
          Object.entries(editTrade).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
              if (input) {
                input.value = value.toString();
              }
            }
          });
          
          // Explicitly set the setup field and trigger change events
          if (editTrade.setup) {
            const setupInput = form.querySelector('input[name="setup"]') as HTMLInputElement;
            if (setupInput) {
              setupInput.value = editTrade.setup;
              
              // Dispatch an input event to ensure any listeners are triggered
              const event = new Event('input', { bubbles: true });
              setupInput.dispatchEvent(event);
              
              // We also need to trigger a custom event for our setup selector component
              const setupChangeEvent = new CustomEvent('setup-value-changed', { 
                detail: { value: editTrade.setup },
                bubbles: true 
              });
              setupInput.dispatchEvent(setupChangeEvent);
              
              // Force trigger a forced render with this specific setup
              setTimeout(() => {
                const setupSelector = document.querySelector('.setup-selector');
                if (setupSelector) {
                  const forceEvent = new CustomEvent('force-setup-update', { 
                    detail: { value: editTrade.setup },
                    bubbles: true 
                  });
                  setupSelector.dispatchEvent(forceEvent);
                }
              }, 100);
            }
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
    
    // Need to wait for next render cycle
    setTimeout(() => {
      const updatedForm = document.querySelector('form');
      if (updatedForm) {
        // Restore all form values
        Object.entries(currentValues).forEach(([key, value]) => {
          if (key !== 'direction' && value !== undefined && value !== null) {
            const input = updatedForm.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (input) {
              input.value = value.toString();
            }
          }
        });
      }
    }, 0);
  };

  const handleSetupChange = (setup: string) => {
    console.log("Setup change in TradeFormContent:", setup);
    setFormValues(prev => ({
      ...prev,
      setup
    }));
    
    // Also ensure the hidden input is updated
    const setupInput = document.querySelector('input[name="setup"]') as HTMLInputElement;
    if (setupInput) {
      setupInput.value = setup;
    }
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
