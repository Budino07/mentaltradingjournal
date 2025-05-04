
import { Trade } from "@/types/trade";
import { TradeEntrySection } from "../TradeEntrySection";
import { TradeExitSection } from "../TradeExitSection";
import { TradeDetailsSection } from "../TradeDetailsSection";
import { TradeNoteSection } from "../TradeNoteSection";
import { DirectionSelector } from "../DirectionSelector";
import { AccountSelector } from "../AccountSelector";

interface FormSectionsProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
  formValues: Partial<Trade>;
  onSetupChange?: (setup: string) => void;
}

export const FormSections = ({ 
  direction, 
  setDirection,
  formValues,
  onSetupChange 
}: FormSectionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6">
      <div className="space-y-6 md:col-span-1">
        <DirectionSelector direction={direction} onDirectionChange={setDirection} />
        <AccountSelector defaultAccountId={formValues?.account_id} />
        <TradeDetailsSection formValues={formValues} onSetupChange={onSetupChange} />
        <TradeNoteSection defaultNote={formValues?.notes} />
      </div>
      <div className="space-y-6 md:col-span-1">
        <TradeEntrySection formValues={formValues} />
        <TradeExitSection formValues={formValues} />
      </div>
    </div>
  );
};
