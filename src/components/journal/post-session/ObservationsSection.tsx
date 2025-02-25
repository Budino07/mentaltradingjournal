
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ObservationsSectionProps {
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  onWeeklyUrlChange: (url: string) => void;
  onDailyUrlChange: (url: string) => void;
  onFourHourUrlChange: (url: string) => void;
  onOneHourUrlChange: (url: string) => void;
}

export const ObservationsSection = ({
  weeklyUrl = '',
  dailyUrl = '',
  fourHourUrl = '',
  oneHourUrl = '',
  onWeeklyUrlChange,
  onDailyUrlChange,
  onFourHourUrlChange,
  onOneHourUrlChange,
}: ObservationsSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Observations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Weekly"
                defaultValue="Weekly"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="weekly_url" className="sr-only">Weekly</Label>
            </div>
            <Input
              id="weekly_url"
              type="url"
              value={weeklyUrl}
              onChange={(e) => onWeeklyUrlChange(e.target.value)}
              placeholder="Enter weekly chart URL"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Daily"
                defaultValue="Daily"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="daily_url" className="sr-only">Daily</Label>
            </div>
            <Input
              id="daily_url"
              type="url"
              value={dailyUrl}
              onChange={(e) => onDailyUrlChange(e.target.value)}
              placeholder="Enter daily chart URL"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="4HR"
                defaultValue="4HR"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="four_hour_url" className="sr-only">4HR</Label>
            </div>
            <Input
              id="four_hour_url"
              type="url"
              value={fourHourUrl}
              onChange={(e) => onFourHourUrlChange(e.target.value)}
              placeholder="Enter 4-hour chart URL"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="1HR/15m"
                defaultValue="1HR/15m"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="one_hour_url" className="sr-only">1HR/15m</Label>
            </div>
            <Input
              id="one_hour_url"
              type="url"
              value={oneHourUrl}
              onChange={(e) => onOneHourUrlChange(e.target.value)}
              placeholder="Enter 1-hour/15min chart URL"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
