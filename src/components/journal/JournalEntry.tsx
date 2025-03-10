
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { JournalEntryType } from "@/types/journal";
import { JournalEntryDeleteDialog } from "./entry/JournalEntryDeleteDialog";
import { EntryContent } from "./entry/EntryContent";
import { formatDate } from "./entry/utils/dateUtils";

interface JournalEntryProps {
  entry: JournalEntryType;
}

export const JournalEntry = ({ entry }: JournalEntryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getBadgeVariant = (emotion: string) => {
    const emotionToVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Confident": "default",
      "Calm": "secondary",
      "Frustrated": "destructive",
      "Anxious": "destructive",
      "Excited": "default"
    };

    return emotionToVariant[emotion] || "outline";
  };

  const getOutcomeBadgeVariant = (outcome: string) => {
    if (outcome === "Profitable") return "default";
    if (outcome === "Break Even") return "secondary";
    return "destructive";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(entry.emotion)}>
                  {entry.session_type === "pre" ? "Pre-Session" : "Post-Session"}
                </Badge>
                <Badge variant={getBadgeVariant(entry.emotion)}>
                  {entry.emotion}
                  {entry.emotion_detail && `: ${entry.emotion_detail}`}
                </Badge>
                {entry.outcome && (
                  <Badge variant={getOutcomeBadgeVariant(entry.outcome)}>
                    {entry.outcome}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <EntryContent
              id={entry.id}
              marketConditions={entry.market_conditions}
              notes={entry.notes}
              followedRules={entry.followed_rules}
              trades={entry.trades}
              postSubmissionNotes={entry.post_submission_notes}
              preTradingActivities={entry.pre_trading_activities}
              weeklyUrl={entry.weekly_url}
              dailyUrl={entry.daily_url}
              fourHourUrl={entry.four_hour_url}
              oneHourUrl={entry.one_hour_url}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {showDeleteDialog && (
        <JournalEntryDeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          entryId={entry.id}
        />
      )}
    </Card>
  );
};
