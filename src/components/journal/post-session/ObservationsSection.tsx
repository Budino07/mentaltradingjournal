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
          <div>
            <Label htmlFor="weekly_url">Weekly</Label>
            <Input
              id="weekly_url"
              type="url"
              value={weeklyUrl}
              onChange={(e) => onWeeklyUrlChange(e.target.value)}
              placeholder="Enter weekly chart URL"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="daily_url">Daily</Label>
            <Input
              id="daily_url"
              type="url"
              value={dailyUrl}
              onChange={(e) => onDailyUrlChange(e.target.value)}
              placeholder="Enter daily chart URL"
              className="mt-1"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="four_hour_url">4HR</Label>
            <Input
              id="four_hour_url"
              type="url"
              value={fourHourUrl}
              onChange={(e) => onFourHourUrlChange(e.target.value)}
              placeholder="Enter 4-hour chart URL"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="one_hour_url">1HR/15m</Label>
            <Input
              id="one_hour_url"
              type="url"
              value={oneHourUrl}
              onChange={(e) => onOneHourUrlChange(e.target.value)}
              placeholder="Enter 1-hour/15min chart URL"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};