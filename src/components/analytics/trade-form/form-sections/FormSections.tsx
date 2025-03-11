
import { GeneralSection } from "../GeneralSection";
import { TradeEntrySection } from "../TradeEntrySection";
import { TradeExitSection } from "../TradeExitSection";

interface FormSectionsProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
}

export const FormSections = ({ direction, setDirection }: FormSectionsProps) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto pb-0">
      <div className="space-y-6 md:space-y-6">
        <div className="p-4 border rounded-lg bg-background/50">
          <GeneralSection direction={direction} setDirection={setDirection} />
        </div>
        <div className="p-4 border rounded-lg bg-background/50">
          <TradeEntrySection />
        </div>
        <div className="p-4 border rounded-lg bg-background/50">
          <TradeExitSection />
        </div>
      </div>
    </div>
  );
};
