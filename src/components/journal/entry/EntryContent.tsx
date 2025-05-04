
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TradesList } from "./TradesList";
import { TradingRules } from "./TradingRules";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ListChecks, NotebookPen, LineChart, ExternalLink, Pencil, Target, AlertTriangle } from "lucide-react";
import { Trade } from "@/types/trade";
import { NoteEditDialog } from "./NoteEditDialog";
import { TradingMistakes } from "./TradingMistakes";

interface EntryContentProps {
  id: string;
  marketConditions?: string;
  notes: string;
  followedRules?: string[];
  mistakes?: string[];
  trades?: Trade[];
  postSubmissionNotes?: string;
  preTradingActivities?: string[];
  dailyGoals?: string[];
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  weeklyLabel?: string;
  dailyLabel?: string;
  fourHourLabel?: string;
  oneHourLabel?: string;
}

export const EntryContent = ({
  id,
  marketConditions,
  notes,
  followedRules,
  mistakes,
  trades,
  postSubmissionNotes,
  preTradingActivities,
  dailyGoals,
  weeklyUrl,
  dailyUrl,
  fourHourUrl,
  oneHourUrl,
  weeklyLabel = 'Weekly',
  dailyLabel = 'Daily',
  fourHourLabel = '4HR',
  oneHourLabel = '1HR/15m',
}: EntryContentProps) => {
  const [showNotes, setShowNotes] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [showMistakes, setShowMistakes] = useState(true);
  const [localNotes, setLocalNotes] = useState(notes);
  const [localPostNotes, setLocalPostNotes] = useState(postSubmissionNotes);
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingPostNotes, setIsEditingPostNotes] = useState(false);

  const formatNotes = (text: string) => {
    if (!text) return "";
    
    let formattedText = text.replace(/\n/g, "<br />");
    
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formattedText = formattedText.replace(
      urlRegex, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    );
    
    return formattedText;
  };

  const openImageInNewTab = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {marketConditions && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Market Conditions</h4>
          <p className="text-sm">{marketConditions}</p>
        </div>
      )}

      {localNotes && (
        <Collapsible open={showNotes} onOpenChange={setShowNotes} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Trading Notes</h4>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setIsEditingNotes(true)}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="sr-only">Edit notes</span>
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                  {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent className="space-y-2">
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: formatNotes(localNotes) }}
            />
          </CollapsibleContent>
        </Collapsible>
      )}

      {dailyGoals && dailyGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Target className="w-4 h-4 text-primary" />
            Daily Goals
          </h4>
          <ul className="text-sm list-disc pl-5 text-muted-foreground">
            {dailyGoals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {preTradingActivities && preTradingActivities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <ListChecks className="w-4 h-4 text-primary" />
            Pre-Trading Activities
          </h4>
          <ul className="text-sm list-disc pl-5 text-muted-foreground">
            {preTradingActivities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      )}

      {(weeklyUrl || dailyUrl || fourHourUrl || oneHourUrl) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <LineChart className="w-4 h-4 text-primary" />
            Chart Screenshots
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  {weeklyLabel}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </p>
                <div 
                  onClick={() => openImageInNewTab(weeklyUrl)} 
                  className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                >
                  <img 
                    src={weeklyUrl} 
                    alt={`${weeklyLabel} chart`} 
                    className="rounded-md border max-h-64 object-contain w-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
            {dailyUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  {dailyLabel}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </p>
                <div 
                  onClick={() => openImageInNewTab(dailyUrl)} 
                  className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                >
                  <img 
                    src={dailyUrl} 
                    alt={`${dailyLabel} chart`} 
                    className="rounded-md border max-h-64 object-contain w-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
            {fourHourUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  {fourHourLabel}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </p>
                <div 
                  onClick={() => openImageInNewTab(fourHourUrl)} 
                  className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                >
                  <img 
                    src={fourHourUrl} 
                    alt={`${fourHourLabel} chart`} 
                    className="rounded-md border max-h-64 object-contain w-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
            {oneHourUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  {oneHourLabel}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </p>
                <div 
                  onClick={() => openImageInNewTab(oneHourUrl)} 
                  className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                >
                  <img 
                    src={oneHourUrl} 
                    alt={`${oneHourLabel} chart`} 
                    className="rounded-md border max-h-64 object-contain w-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {followedRules && followedRules.length > 0 && (
        <Collapsible open={showRules} onOpenChange={setShowRules} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Trading Rules Followed</h4>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                {showRules ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <TradingRules rules={followedRules} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {mistakes && mistakes.length > 0 && (
        <Collapsible open={showMistakes} onOpenChange={setShowMistakes} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h4 className="text-sm font-medium">Trading Mistakes</h4>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                {showMistakes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <TradingMistakes mistakes={mistakes} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {localPostNotes && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <NotebookPen className="w-4 h-4 text-primary" />
              Post Session Notes
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2"
              onClick={() => setIsEditingPostNotes(true)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Edit post-session notes</span>
            </Button>
          </div>
          <div
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatNotes(localPostNotes) }}
          />
        </div>
      )}

      {trades && trades.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Trades</h4>
            <TradesList journalEntryId={id} trades={trades} />
          </div>
        </>
      )}

      {isEditingNotes && (
        <NoteEditDialog 
          isOpen={isEditingNotes}
          onClose={() => setIsEditingNotes(false)}
          entryId={id}
          initialText={localNotes}
          noteType="notes"
          onNoteUpdated={setLocalNotes}
        />
      )}

      {isEditingPostNotes && (
        <NoteEditDialog 
          isOpen={isEditingPostNotes}
          onClose={() => setIsEditingPostNotes(false)}
          entryId={id}
          initialText={localPostNotes || ""}
          noteType="post_submission_notes"
          onNoteUpdated={setLocalPostNotes}
        />
      )}
    </div>
  );
};
