
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObservationsSectionProps {
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  onWeeklyUrlChange: (url: string) => void;
  onDailyUrlChange: (url: string) => void;
  onFourHourUrlChange: (url: string) => void;
  onOneHourUrlChange: (url: string) => void;
  weeklyLabel?: string;
  dailyLabel?: string;
  fourHourLabel?: string;
  oneHourLabel?: string;
  onWeeklyLabelChange?: (label: string) => void;
  onDailyLabelChange?: (label: string) => void;
  onFourHourLabelChange?: (label: string) => void;
  onOneHourLabelChange?: (label: string) => void;
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
  weeklyLabel = 'Weekly',
  dailyLabel = 'Daily',
  fourHourLabel = '4HR',
  oneHourLabel = '1HR/15m',
  onWeeklyLabelChange,
  onDailyLabelChange,
  onFourHourLabelChange,
  onOneHourLabelChange,
}: ObservationsSectionProps) => {
  const [editingWeekly, setEditingWeekly] = useState(false);
  const [editingDaily, setEditingDaily] = useState(false);
  const [editingFourHour, setEditingFourHour] = useState(false);
  const [editingOneHour, setEditingOneHour] = useState(false);
  
  const [localWeeklyLabel, setLocalWeeklyLabel] = useState(weeklyLabel);
  const [localDailyLabel, setLocalDailyLabel] = useState(dailyLabel);
  const [localFourHourLabel, setLocalFourHourLabel] = useState(fourHourLabel);
  const [localOneHourLabel, setLocalOneHourLabel] = useState(oneHourLabel);

  const handleLabelSave = (type: 'weekly' | 'daily' | 'fourHour' | 'oneHour') => {
    switch(type) {
      case 'weekly':
        if (onWeeklyLabelChange) onWeeklyLabelChange(localWeeklyLabel);
        setEditingWeekly(false);
        break;
      case 'daily':
        if (onDailyLabelChange) onDailyLabelChange(localDailyLabel);
        setEditingDaily(false);
        break;
      case 'fourHour':
        if (onFourHourLabelChange) onFourHourLabelChange(localFourHourLabel);
        setEditingFourHour(false);
        break;
      case 'oneHour':
        if (onOneHourLabelChange) onOneHourLabelChange(localOneHourLabel);
        setEditingOneHour(false);
        break;
    }
  };

  const renderLabelWithEdit = (
    type: 'weekly' | 'daily' | 'fourHour' | 'oneHour',
    label: string,
    isEditing: boolean,
    setIsEditing: (value: boolean) => void,
    localLabel: string,
    setLocalLabel: (value: string) => void
  ) => {
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            className="h-7 py-1 px-2 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLabelSave(type);
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleLabelSave(type)}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1">
        <Label htmlFor={`${type}_url`} className="cursor-pointer">{label}</Label>
        {(onWeeklyLabelChange || onDailyLabelChange || onFourHourLabelChange || onOneHourLabelChange) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Observations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            {renderLabelWithEdit(
              'weekly',
              weeklyLabel,
              editingWeekly,
              setEditingWeekly,
              localWeeklyLabel,
              setLocalWeeklyLabel
            )}
            <Input
              id="weekly_url"
              type="url"
              value={weeklyUrl}
              onChange={(e) => onWeeklyUrlChange(e.target.value)}
              placeholder={`Enter ${weeklyLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
          </div>
          <div>
            {renderLabelWithEdit(
              'daily',
              dailyLabel,
              editingDaily,
              setEditingDaily,
              localDailyLabel,
              setLocalDailyLabel
            )}
            <Input
              id="daily_url"
              type="url"
              value={dailyUrl}
              onChange={(e) => onDailyUrlChange(e.target.value)}
              placeholder={`Enter ${dailyLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            {renderLabelWithEdit(
              'fourHour',
              fourHourLabel,
              editingFourHour,
              setEditingFourHour,
              localFourHourLabel,
              setLocalFourHourLabel
            )}
            <Input
              id="four_hour_url"
              type="url"
              value={fourHourUrl}
              onChange={(e) => onFourHourUrlChange(e.target.value)}
              placeholder={`Enter ${fourHourLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
          </div>
          <div>
            {renderLabelWithEdit(
              'oneHour',
              oneHourLabel,
              editingOneHour,
              setEditingOneHour,
              localOneHourLabel,
              setLocalOneHourLabel
            )}
            <Input
              id="one_hour_url"
              type="url"
              value={oneHourUrl}
              onChange={(e) => onOneHourUrlChange(e.target.value)}
              placeholder={`Enter ${oneHourLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
