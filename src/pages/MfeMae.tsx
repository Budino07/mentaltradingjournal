
import { AppLayout } from "@/components/layout/AppLayout";
import { MfeMaeChart } from "@/components/backtesting/mfe-mae/MfeMaeChart";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

export default function MfeMae() {
  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gradient">MFE & MAE Analysis</h1>
          <p className="text-muted-foreground mb-4 sm:mb-6">
            Analyze the maximum favorable and adverse excursions in your trades, with AI-powered recommendations to improve your strategy.
            The horizontal line on each bar shows where you exited the trade (green for positive capture, red for negative capture).
            For negative captured moves, a red line appears at the bottom of the chart at the -100% mark.
          </p>
          <div className="overflow-x-auto">
            <MfeMaeChart />
          </div>
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
