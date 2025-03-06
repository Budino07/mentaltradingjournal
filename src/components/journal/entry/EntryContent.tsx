
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TradesList } from "./TradesList";
import { TradingRules } from "./TradingRules";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ListChecks, NotebookPen, LineChart } from "lucide-react";
import { Trade } from "@/types/trade";

interface EntryContentProps {
  id: string;
  marketConditions?: string;
  notes: string;
  followedRules?: string[];
  trades?: Trade[];
  postSubmissionNotes?: string;
  preTradingActivities?: string[];
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
}

export const EntryContent = ({
  id,
  marketConditions,
  notes,
  followedRules,
  trades,
  postSubmissionNotes,
  preTradingActivities,
  weeklyUrl,
  dailyUrl,
  fourHourUrl,
  oneHourUrl,
}: EntryContentProps) => {
  const [showNotes, setShowNotes] = useState(true);
  const [showRules, setShowRules] = useState(true);

  const formatNotes = (text: string) => {
    if (!text) return "";
    
    // First, convert newlines to <br> tags
    let formattedText = text.replace(/\n/g, "<br />");
    
    // Then, convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formattedText = formattedText.replace(
      urlRegex, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    );
    
    return formattedText;
  };

  return (
    <div className="space-y-4">
      {marketConditions && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Market Conditions</h4>
          <p className="text-sm">{marketConditions}</p>
        </div>
      )}

      {notes && (
        <Collapsible open={showNotes} onOpenChange={setShowNotes} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Trading Notes</h4>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: formatNotes(notes) }}
            />
          </CollapsibleContent>
        </Collapsible>
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

      {/* Screenshots section */}
      {(weeklyUrl || dailyUrl || fourHourUrl || oneHourUrl) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <LineChart className="w-4 h-4 text-primary" />
            Chart Screenshots
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Weekly</p>
                <img src={weeklyUrl} alt="Weekly chart" className="rounded-md border max-h-64 object-contain" />
              </div>
            )}
            {dailyUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Daily</p>
                <img src={dailyUrl} alt="Daily chart" className="rounded-md border max-h-64 object-contain" />
              </div>
            )}
            {fourHourUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium">4-Hour</p>
                <img src={fourHourUrl} alt="4-Hour chart" className="rounded-md border max-h-64 object-contain" />
              </div>
            )}
            {oneHourUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium">1-Hour</p>
                <img src={oneHourUrl} alt="1-Hour chart" className="rounded-md border max-h-64 object-contain" />
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

      {postSubmissionNotes && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <NotebookPen className="w-4 h-4 text-primary" />
            Post Session Notes
          </h4>
          <div
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatNotes(postSubmissionNotes) }}
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
    </div>
  );
};
