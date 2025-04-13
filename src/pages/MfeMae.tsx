
import { AppLayout } from "@/components/layout/AppLayout";
import { MfeMaeChart } from "@/components/backtesting/mfe-mae/MfeMaeChart";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { Card } from "@/components/ui/card";

export default function MfeMae() {
  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="space-y-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">MFE & MAE Analysis</h1>
            <Card className="p-4 sm:p-6 bg-muted/30">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Analyze the maximum favorable and adverse excursions in your trades, with AI-powered recommendations to improve your strategy.
                </p>
                <div className="space-y-2">
                  <h3 className="text-base font-medium">What am I looking at?</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><span className="font-medium text-primary">MFE (Maximum Favorable Excursion)</span>: How far the price moved in your favor before you exited.</li>
                    <li><span className="font-medium text-destructive">MAE (Maximum Adverse Excursion)</span>: How far the price moved against you during the trade.</li>
                    <li>The horizontal line on each bar represents where you actually exited the trade.</li>
                    <li>Click on any trade to view its details in your journal.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
          <MfeMaeChart />
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
