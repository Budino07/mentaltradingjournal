
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ObservationsSectionProps {
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  weeklyTitle?: string;
  dailyTitle?: string;
  fourHourTitle?: string;
  oneHourTitle?: string;
  onWeeklyUrlChange: (url: string) => void;
  onDailyUrlChange: (url: string) => void;
  onFourHourUrlChange: (url: string) => void;
  onOneHourUrlChange: (url: string) => void;
  onWeeklyTitleChange: (title: string) => void;
  onDailyTitleChange: (title: string) => void;
  onFourHourTitleChange: (title: string) => void;
  onOneHourTitleChange: (title: string) => void;
}

export const ObservationsSection = ({
  weeklyUrl = '',
  dailyUrl = '',
  fourHourUrl = '',
  oneHourUrl = '',
  weeklyTitle = 'Weekly',
  dailyTitle = 'Daily',
  fourHourTitle = '4HR',
  oneHourTitle = '1HR/15m',
  onWeeklyUrlChange,
  onDailyUrlChange,
  onFourHourUrlChange,
  onOneHourUrlChange,
  onWeeklyTitleChange,
  onDailyTitleChange,
  onFourHourTitleChange,
  onOneHourTitleChange,
}: ObservationsSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Observations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={weeklyTitle}
                onChange={(e) => onWeeklyTitleChange(e.target.value)}
                placeholder="Weekly"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="weekly_url" className="sr-only">{weeklyTitle}</Label>
            </div>
            <Input
              id="weekly_url"
              type="url"
              value={weeklyUrl}
              onChange={(e) => onWeeklyUrlChange(e.target.value)}
              placeholder={`Enter ${weeklyTitle.toLowerCase()} chart URL`}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={dailyTitle}
                onChange={(e) => onDailyTitleChange(e.target.value)}
                placeholder="Daily"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="daily_url" className="sr-only">{dailyTitle}</Label>
            </div>
            <Input
              id="daily_url"
              type="url"
              value={dailyUrl}
              onChange={(e) => onDailyUrlChange(e.target.value)}
              placeholder={`Enter ${dailyTitle.toLowerCase()} chart URL`}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={fourHourTitle}
                onChange={(e) => onFourHourTitleChange(e.target.value)}
                placeholder="4HR"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="four_hour_url" className="sr-only">{fourHourTitle}</Label>
            </div>
            <Input
              id="four_hour_url"
              type="url"
              value={fourHourUrl}
              onChange={(e) => onFourHourUrlChange(e.target.value)}
              placeholder={`Enter ${fourHourTitle.toLowerCase()} chart URL`}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={oneHourTitle}
                onChange={(e) => onOneHourTitleChange(e.target.value)}
                placeholder="1HR/15m"
                className="w-32 h-8 text-sm"
              />
              <Label htmlFor="one_hour_url" className="sr-only">{oneHourTitle}</Label>
            </div>
            <Input
              id="one_hour_url"
              type="url"
              value={oneHourUrl}
              onChange={(e) => onOneHourUrlChange(e.target.value)}
              placeholder={`Enter ${oneHourTitle.toLowerCase()} chart URL`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
