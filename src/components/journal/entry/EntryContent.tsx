
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trade } from "@/types/trade";
import { TradingRules } from "../entry/TradingRules";
import { TradesList } from "../entry/TradesList";
import { ExternalLink, Edit2 } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const hasObservationLinks = weeklyUrl || dailyUrl || fourHourUrl || oneHourUrl;

  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('journal_entries')
        .update({ notes: editedNotes })
        .eq('id', id);

      if (error) throw error;

      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Notes updated successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error("Failed to update notes");
      setIsSaving(false);
    }
  };

  const renderChartButton = (url: string | undefined | null, label: string) => {
    if (!url) return null;
    
    return (
      <Button
        variant="outline"
        className="justify-start space-x-2 w-full"
        onClick={() => window.open(url, '_blank')}
      >
        <ExternalLink className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    );
  };

  const renderTextWithLinks = (text?: string): ReactNode[] => {
    if (!text) return [];
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex) || [];
    
    return parts.map((part, i) => {
      if (matches.includes(part)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline inline-flex items-center"
          >
            {part}
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {notes && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Notes</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  {isEditing ? "Save" : "Edit"}
                </>
              )}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="min-h-[100px]"
              disabled={isSaving}
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">
              {renderTextWithLinks(notes)}
            </p>
          )}
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4"></div>
          <p className="text-lg text-muted-foreground">Updating...</p>
        </div>
      )}

      {marketConditions && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Market Conditions</h3>
            <p className="text-muted-foreground">{marketConditions}</p>
          </div>
        </>
      )}

      {followedRules && followedRules.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Trading Rules Followed</h3>
            <TradingRules rules={followedRules} />
          </div>
        </>
      )}

      {hasObservationLinks && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Observations</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderChartButton(weeklyUrl, "Weekly Chart")}
              {renderChartButton(dailyUrl, "Daily Chart")}
              {renderChartButton(fourHourUrl, "4HR Chart")}
              {renderChartButton(oneHourUrl, "1HR Chart")}
            </div>
          </div>
        </>
      )}

      {trades && trades.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Trades</h3>
            <TradesList trades={trades} />
          </div>
        </>
      )}

      {postSubmissionNotes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Post Submission Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {renderTextWithLinks(postSubmissionNotes)}
            </p>
          </div>
        </>
      )}

      {preTradingActivities && preTradingActivities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Pre-Trading Activities</h3>
            <ul className="list-disc list-inside space-y-1">
              {preTradingActivities.map((activity, index) => (
                <li key={index} className="text-muted-foreground">
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
