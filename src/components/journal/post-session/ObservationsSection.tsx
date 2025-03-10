
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

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
  const [editingWeeklyLabel, setEditingWeeklyLabel] = useState(false);
  const [editingDailyLabel, setEditingDailyLabel] = useState(false);
  const [editingFourHourLabel, setEditingFourHourLabel] = useState(false);
  const [editingOneHourLabel, setEditingOneHourLabel] = useState(false);

  const [localWeeklyLabel, setLocalWeeklyLabel] = useState(weeklyLabel);
  const [localDailyLabel, setLocalDailyLabel] = useState(dailyLabel);
  const [localFourHourLabel, setLocalFourHourLabel] = useState(fourHourLabel);
  const [localOneHourLabel, setLocalOneHourLabel] = useState(oneHourLabel);

  const openImageInNewTab = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    setLocalWeeklyLabel(weeklyLabel);
    setLocalDailyLabel(dailyLabel);
    setLocalFourHourLabel(fourHourLabel);
    setLocalOneHourLabel(oneHourLabel);
  }, [weeklyLabel, dailyLabel, fourHourLabel, oneHourLabel]);

  const handleLabelClick = (labelType: 'weekly' | 'daily' | 'fourHour' | 'oneHour') => {
    if (labelType === 'weekly') setEditingWeeklyLabel(true);
    if (labelType === 'daily') setEditingDailyLabel(true);
    if (labelType === 'fourHour') setEditingFourHourLabel(true);
    if (labelType === 'oneHour') setEditingOneHourLabel(true);
  };

  const handleLabelBlur = (labelType: 'weekly' | 'daily' | 'fourHour' | 'oneHour') => {
    if (labelType === 'weekly') {
      setEditingWeeklyLabel(false);
      if (onWeeklyLabelChange) onWeeklyLabelChange(localWeeklyLabel);
    }
    if (labelType === 'daily') {
      setEditingDailyLabel(false);
      if (onDailyLabelChange) onDailyLabelChange(localDailyLabel);
    }
    if (labelType === 'fourHour') {
      setEditingFourHourLabel(false);
      if (onFourHourLabelChange) onFourHourLabelChange(localFourHourLabel);
    }
    if (labelType === 'oneHour') {
      setEditingOneHourLabel(false);
      if (onOneHourLabelChange) onOneHourLabelChange(localOneHourLabel);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, labelType: 'weekly' | 'daily' | 'fourHour' | 'oneHour') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelBlur(labelType);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Observations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            {editingWeeklyLabel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={localWeeklyLabel}
                  onChange={(e) => setLocalWeeklyLabel(e.target.value)}
                  onBlur={() => handleLabelBlur('weekly')}
                  onKeyDown={(e) => handleKeyDown(e, 'weekly')}
                  autoFocus
                  className="py-0 h-7 text-sm font-medium"
                  maxLength={15}
                />
              </div>
            ) : (
              <Label 
                htmlFor="weekly_url" 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleLabelClick('weekly')}
              >
                {localWeeklyLabel}
              </Label>
            )}
            <Input
              id="weekly_url"
              type="url"
              value={weeklyUrl}
              onChange={(e) => onWeeklyUrlChange(e.target.value)}
              placeholder={`Enter ${localWeeklyLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
            {weeklyUrl && (
              <div 
                onClick={() => openImageInNewTab(weeklyUrl)} 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group mt-2"
              >
                <img 
                  src={weeklyUrl} 
                  alt={`${localWeeklyLabel} chart`} 
                  className="rounded-md border max-h-32 object-contain w-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
          <div>
            {editingDailyLabel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={localDailyLabel}
                  onChange={(e) => setLocalDailyLabel(e.target.value)}
                  onBlur={() => handleLabelBlur('daily')}
                  onKeyDown={(e) => handleKeyDown(e, 'daily')}
                  autoFocus
                  className="py-0 h-7 text-sm font-medium"
                  maxLength={15}
                />
              </div>
            ) : (
              <Label 
                htmlFor="daily_url" 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleLabelClick('daily')}
              >
                {localDailyLabel}
              </Label>
            )}
            <Input
              id="daily_url"
              type="url"
              value={dailyUrl}
              onChange={(e) => onDailyUrlChange(e.target.value)}
              placeholder={`Enter ${localDailyLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
            {dailyUrl && (
              <div 
                onClick={() => openImageInNewTab(dailyUrl)} 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group mt-2"
              >
                <img 
                  src={dailyUrl} 
                  alt={`${localDailyLabel} chart`} 
                  className="rounded-md border max-h-32 object-contain w-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            {editingFourHourLabel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={localFourHourLabel}
                  onChange={(e) => setLocalFourHourLabel(e.target.value)}
                  onBlur={() => handleLabelBlur('fourHour')}
                  onKeyDown={(e) => handleKeyDown(e, 'fourHour')}
                  autoFocus
                  className="py-0 h-7 text-sm font-medium"
                  maxLength={15}
                />
              </div>
            ) : (
              <Label 
                htmlFor="four_hour_url" 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleLabelClick('fourHour')}
              >
                {localFourHourLabel}
              </Label>
            )}
            <Input
              id="four_hour_url"
              type="url"
              value={fourHourUrl}
              onChange={(e) => onFourHourUrlChange(e.target.value)}
              placeholder={`Enter ${localFourHourLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
            {fourHourUrl && (
              <div 
                onClick={() => openImageInNewTab(fourHourUrl)} 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group mt-2"
              >
                <img 
                  src={fourHourUrl} 
                  alt={`${localFourHourLabel} chart`} 
                  className="rounded-md border max-h-32 object-contain w-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
          <div>
            {editingOneHourLabel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={localOneHourLabel}
                  onChange={(e) => setLocalOneHourLabel(e.target.value)}
                  onBlur={() => handleLabelBlur('oneHour')}
                  onKeyDown={(e) => handleKeyDown(e, 'oneHour')}
                  autoFocus
                  className="py-0 h-7 text-sm font-medium"
                  maxLength={15}
                />
              </div>
            ) : (
              <Label 
                htmlFor="one_hour_url" 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleLabelClick('oneHour')}
              >
                {localOneHourLabel}
              </Label>
            )}
            <Input
              id="one_hour_url"
              type="url"
              value={oneHourUrl}
              onChange={(e) => onOneHourUrlChange(e.target.value)}
              placeholder={`Enter ${localOneHourLabel.toLowerCase()} chart URL`}
              className="mt-1"
            />
            {oneHourUrl && (
              <div 
                onClick={() => openImageInNewTab(oneHourUrl)} 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group mt-2"
              >
                <img 
                  src={oneHourUrl} 
                  alt={`${localOneHourLabel} chart`} 
                  className="rounded-md border max-h-32 object-contain w-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
