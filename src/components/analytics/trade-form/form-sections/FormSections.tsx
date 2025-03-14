
import { Trade } from "@/types/trade";
import { GeneralSection } from "../GeneralSection";
import { TradeEntrySection } from "../TradeEntrySection";
import { TradeExitSection } from "../TradeExitSection";

interface FormSectionsProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
  formValues?: Partial<Trade>;
}

export const FormSections = ({ direction, setDirection, formValues }: FormSectionsProps) => {
  return (
    <div className="p-2 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
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
