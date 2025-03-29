
import { AppLayout } from "@/components/layout/AppLayout";
import { JournalTradesList } from "@/components/journal/TradesList";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";

const TradesList = () => {
  return (
    <TimeFilterProvider>
      <AppLayout>
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          <JournalTradesList />
        </div>
      </AppLayout>
    </TimeFilterProvider>
  );
};

export default TradesList;
