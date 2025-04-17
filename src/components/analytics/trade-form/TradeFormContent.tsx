
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
      // Ensure direction is set first
      setDirection(editTrade.direction as 'buy' | 'sell');
      
      // Extract and normalize the setup value
      const setupValue = editTrade.setup ? editTrade.setup.trim() : "";
      
      // Update form values with all trade data
      setFormValues({
        ...editTrade,
        setup: setupValue
      });
      
      console.log("Edit trade setup value:", setupValue);
      
      // Comprehensive delayed update to ensure form is fully mounted
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          // Update all form fields
          Object.entries(editTrade).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
              if (input) {
                input.value = value.toString();
              }
            }
          });
          
          // Explicitly update setup input
          const setupInput = form.querySelector('input[name="setup"]') as HTMLInputElement;
          if (setupInput) {
            setupInput.value = setupValue;
            console.log("Setup input updated to:", setupValue);
          }
        }
      }, 800); // Increased delay to ensure complete mounting
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
    console.log("Setup changed to:", setup);
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
