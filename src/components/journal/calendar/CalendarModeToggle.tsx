
import { useCalendarMode } from "@/contexts/CalendarModeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CalendarModeToggle = () => {
  const { mode, toggleMode } = useCalendarMode();
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Label 
        htmlFor="calendar-mode" 
        className={`text-sm font-medium transition-colors ${mode === 'emotion' ? 'text-primary' : 'text-muted-foreground'}`}
      >
        Emotion
      </Label>
      <Switch 
        id="calendar-mode" 
        checked={mode === 'performance'} 
        onCheckedChange={toggleMode}
      />
      <Label 
        htmlFor="calendar-mode" 
        className={`text-sm font-medium transition-colors ${mode === 'performance' ? 'text-primary' : 'text-muted-foreground'}`}
      >
        Performance
      </Label>
    </div>
  );
};
