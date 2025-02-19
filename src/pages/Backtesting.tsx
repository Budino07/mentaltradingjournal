
import { AppLayout } from "@/components/layout/AppLayout";
import { BacktestingForm } from "@/components/backtesting/BacktestingForm";
import { PlaybookSection } from "@/components/backtesting/PlaybookSection";
import { useRef } from "react";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

export default function Backtesting() {
  const backtestingFormRef = useRef<{ fetchBlueprints: () => void }>(null);

  const handleBlueprintAdded = () => {
    backtestingFormRef.current?.fetchBlueprints();
  };

  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gradient">Backtesting</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <BacktestingForm ref={backtestingFormRef} />
            <PlaybookSection onBlueprintAdded={handleBlueprintAdded} />
          </div>
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
