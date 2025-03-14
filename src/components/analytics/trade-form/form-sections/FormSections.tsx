
import { Trade } from "@/types/trade";
import { GeneralSection } from "../GeneralSection";
import { TradeEntrySection } from "../TradeEntrySection";
import { TradeExitSection } from "../TradeExitSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormSectionsProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
  formValues?: Partial<Trade>;
}

export const FormSections = ({ direction, setDirection, formValues }: FormSectionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'p-1 pt-0 space-y-2' : 'p-2 md:p-6 pt-2'} grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6`}>
      <GeneralSection 
        direction={direction} 
        setDirection={setDirection}
        formValues={formValues}
      />
      <TradeEntrySection formValues={formValues} />
      <TradeExitSection formValues={formValues} />
    </div>
  );
};
