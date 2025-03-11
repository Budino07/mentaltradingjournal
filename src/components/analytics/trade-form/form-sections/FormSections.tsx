import { GeneralSection } from "../GeneralSection";
import { TradeEntrySection } from "../TradeEntrySection";
import { TradeExitSection } from "../TradeExitSection";

interface FormSectionsProps {
  direction: 'buy' | 'sell' | null;
  setDirection: (direction: 'buy' | 'sell') => void;
}

export const FormSections = ({ direction, setDirection }: FormSectionsProps) => {
  return (
    <div className="flex-1 p-6 space-y-4 md:space-y-0 md:space-x-4 md:flex">
      <div className="flex-1 p-4 border rounded-lg bg-background/50">
        <GeneralSection direction={direction} setDirection={setDirection} />
      </div>
      <div className="flex-1 p-4 border rounded-lg bg-background/50">
        <TradeEntrySection />
      </div>
      <div className="flex-1 p-4 border rounded-lg bg-background/50">
        <TradeExitSection />
      </div>
    </div>
  );
};