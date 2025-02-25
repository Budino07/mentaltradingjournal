
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trade } from "@/types/trade";
import { TradingRules } from "../entry/TradingRules";
import { TradesList } from "../entry/TradesList";
import { ExternalLink, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const hasObservationLinks = weeklyUrl || dailyUrl || fourHourUrl || oneHourUrl;

  // Update local state when props change
  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ notes: editedNotes })
        .eq('id', id);

      if (error) throw error;

      toast.success("Notes updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error("Failed to update notes");
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
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? "Save" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{editedNotes}</p>
          )}
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
              {postSubmissionNotes}
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
