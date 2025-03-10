
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionTypeSelector } from "../SessionTypeSelector";

interface FormHeaderProps {
  sessionType: "pre" | "post";
  onSessionTypeChange: (value: "pre" | "post") => void;
  disableTypeChange?: boolean;
}

export const FormHeader = ({ 
  sessionType, 
  onSessionTypeChange,
  disableTypeChange 
}: FormHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            {sessionType === "pre" ? "Pre-Session Check-in" : "Post-Session Review"}
          </h2>
          {sessionType === "pre" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] p-4">
                  <p>Pre-sessions are designed to be completed daily before your post-session entry to help you track your mood. Many traders overlook this step, but it plays a significant role in improving your performance and decision-making over time.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {!disableTypeChange && (
        <SessionTypeSelector
          sessionType={sessionType}
          onSessionTypeChange={onSessionTypeChange}
        />
      )}
    </div>
  );
};
