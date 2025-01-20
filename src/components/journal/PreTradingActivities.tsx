import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  MessageCircle,
  Target,
  ShowerHead,
  Sun,
  Award
} from "lucide-react";

interface PreTradingActivitiesProps {
  activities: string[];
  selectedActivities: string[];
  onActivityChange: (activities: string[]) => void;
}

const ACTIVITY_TOOLTIPS: Record<string, { text: string; icon: JSX.Element }> = {
  "Meditation": {
    text: "Calms your mind & removes irrelevant thoughts, allowing you to be present & fully focused.",
    icon: <MessageCircle className="h-4 w-4" />
  },
  "Exercise": {
    text: "Builds resilience to stress, increases your ability to focus.",
    icon: <MessageCircle className="h-4 w-4" />
  },
  "Review Daily Goals": {
    text: "Brings intention to your actions for the day, ensuring you make tangible progress toward your goals.",
    icon: <Target className="h-4 w-4" />
  },
  "Cold Shower": {
    text: "Increases energy from the beginning of your day, proven to benefit peak performers.",
    icon: <ShowerHead className="h-4 w-4" />
  },
  "Good Sleep": {
    text: "Foundational requirement to peak performance & health, non-negotiable 7/8 hours a night.",
    icon: <Sun className="h-4 w-4" />
  },
  "Affirmations": {
    text: "Remind yourself of the person you need to be in order to achieve your goals.",
    icon: <Award className="h-4 w-4" />
  }
};

export const PreTradingActivities = ({
  activities,
  selectedActivities,
  onActivityChange,
}: PreTradingActivitiesProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Pre-Trading Activities</Label>
      <div className="grid grid-cols-2 gap-4">
        <TooltipProvider>
          {activities.map((activity) => (
            <div key={activity} className="flex items-center space-x-2">
              <Checkbox
                id={activity}
                checked={selectedActivities.includes(activity)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onActivityChange([...selectedActivities, activity]);
                  } else {
                    onActivityChange(selectedActivities.filter(a => a !== activity));
                  }
                }}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label 
                    htmlFor={activity}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {activity}
                    {ACTIVITY_TOOLTIPS[activity]?.icon}
                  </Label>
                </TooltipTrigger>
                <TooltipContent 
                  side="right"
                  sideOffset={15}
                  className="p-2"
                >
                  <p>{ACTIVITY_TOOLTIPS[activity]?.text}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};