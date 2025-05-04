
import { AppLayout } from "@/components/layout/AppLayout";
import { JournalTradesList } from "@/components/journal/TradesList";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";
import { TradingAccountsProvider } from "@/contexts/TradingAccountsContext";

const TradesList = () => {
  return (
    <TimeFilterProvider>
      <TradingAccountsProvider>
        <AppLayout>
          <div className="container mx-auto py-6 px-4 max-w-6xl">
            <JournalTradesList />
          </div>
        </AppLayout>
      </TradingAccountsProvider>
    </TimeFilterProvider>
  );
};

export default TradesList;
