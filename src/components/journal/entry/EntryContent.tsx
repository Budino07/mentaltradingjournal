
import React from 'react';
import { Trade } from '@/types/analytics'; 
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

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
  // Additional props needed from original entry object
  created_at?: string;
  session_type?: string;
  emotion?: string;
  emotion_detail?: string;
  outcome?: string;
  mistakes?: string[];
}

// Utility functions that were previously imported
const calculateTotalPL = (trades: Trade[]): number => {
  return trades.reduce((total, trade) => {
    const pnl = typeof trade.pnl === 'number' 
      ? trade.pnl 
      : typeof trade.profit_loss === 'number' 
        ? trade.profit_loss 
        : 0;
    return total + pnl;
  }, 0);
};

const calculateSessionTypeColor = (sessionType?: string): string => {
  if (!sessionType) return "bg-gray-500";
  
  switch (sessionType) {
    case "pre":
      return "bg-blue-500";
    case "post":
      return "bg-green-500";
    case "trade":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};

const calculateRulesFollowedStyle = (rule: string): string => {
  // Simple logic to assign color based on rule name
  if (rule.toLowerCase().includes("risk")) return "bg-blue-500 hover:bg-blue-600";
  if (rule.toLowerCase().includes("entry")) return "bg-green-500 hover:bg-green-600";
  if (rule.toLowerCase().includes("exit")) return "bg-amber-500 hover:bg-amber-600";
  return "bg-primary hover:bg-primary/90";
};

const calculateMistakeStyle = (mistake: string): string => {
  // Simple logic to assign color based on mistake type
  if (mistake.toLowerCase().includes("emotion")) return "bg-red-500 hover:bg-red-600";
  if (mistake.toLowerCase().includes("risk")) return "bg-orange-500 hover:bg-orange-600";
  if (mistake.toLowerCase().includes("analysis")) return "bg-purple-500 hover:bg-purple-600";
  return "bg-pink-500 hover:bg-pink-600";
};

const calculatePreTradingActivityStyle = (activity: string): string => {
  // Simple logic to assign color based on activity
  if (activity.toLowerCase().includes("meditation")) return "bg-indigo-500 hover:bg-indigo-600";
  if (activity.toLowerCase().includes("review")) return "bg-cyan-500 hover:bg-cyan-600";
  if (activity.toLowerCase().includes("journal")) return "bg-teal-500 hover:bg-teal-600";
  return "bg-emerald-500 hover:bg-emerald-600";
};

export const EntryContent: React.FC<EntryContentProps> = ({ 
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
  created_at,
  session_type,
  emotion,
  emotion_detail,
  outcome,
  mistakes
}) => {
  const totalPL = calculateTotalPL(trades || []);
  const sessionTypeColor = calculateSessionTypeColor(session_type);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {created_at && format(new Date(created_at), "PPP")}
          </CardTitle>
          <Badge className={sessionTypeColor}>{session_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pl-4">
        <ScrollArea className="h-[450px] w-full pr-4">
          <div className="space-y-4">
            {/* Emotion and Details */}
            <div>
              <h4 className="text-sm font-semibold">Emotion</h4>
              <p className="text-muted-foreground">{emotion}</p>
              {emotion_detail && (
                <>
                  <h4 className="text-sm font-semibold mt-2">Emotion Detail</h4>
                  <p className="text-muted-foreground">{emotion_detail}</p>
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-semibold">Notes</h4>
              <p className="text-muted-foreground">{notes}</p>
            </div>

            {/* Outcome */}
            {outcome && (
              <div>
                <h4 className="text-sm font-semibold">Outcome</h4>
                <p className="text-muted-foreground">{outcome}</p>
              </div>
            )}

            {/* Market Conditions */}
            {marketConditions && (
              <div>
                <h4 className="text-sm font-semibold">Market Conditions</h4>
                <p className="text-muted-foreground">{marketConditions}</p>
              </div>
            )}

            {/* Trades Accordion */}
            {trades && trades.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Trades</h4>
                <Accordion type="single" collapsible>
                  {trades.map((trade, index) => (
                    <AccordionItem key={index} value={`trade-${index}`}>
                      <AccordionTrigger>
                        Trade {index + 1}: {trade.instrument || "Unknown"}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h5 className="text-xs font-semibold">Direction</h5>
                            <p className="text-muted-foreground">{trade.direction}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Entry Date</h5>
                            <p className="text-muted-foreground">
                              {trade.entryDate ? format(new Date(trade.entryDate), "PPP") : "N/A"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Exit Date</h5>
                            <p className="text-muted-foreground">
                              {trade.exitDate ? format(new Date(trade.exitDate), "PPP") : "N/A"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Entry Price</h5>
                            <p className="text-muted-foreground">{trade.entryPrice || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Exit Price</h5>
                            <p className="text-muted-foreground">{trade.exitPrice || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Stop Loss</h5>
                            <p className="text-muted-foreground">{trade.stopLoss || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Take Profit</h5>
                            <p className="text-muted-foreground">{trade.takeProfit || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Quantity</h5>
                            <p className="text-muted-foreground">{trade.quantity || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Fees</h5>
                            <p className="text-muted-foreground">{trade.fees || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">P/L</h5>
                            <p className="text-muted-foreground">{trade.pnl || trade.profit_loss || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">Setup</h5>
                            <p className="text-muted-foreground">{trade.setup || "N/A"}</p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold">HTF Bias</h5>
                            <p className="text-muted-foreground">{trade.htfBias || "N/A"}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            <Separator />

            {/* Rules Followed */}
            {followedRules && followedRules.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Rules Followed</h4>
                <div className="flex flex-wrap gap-1">
                  {followedRules.map((rule, index) => {
                    const style = calculateRulesFollowedStyle(rule);
                    return (
                      <Badge key={index} className={style}>
                        {rule}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mistakes */}
            {mistakes && mistakes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Mistakes</h4>
                <div className="flex flex-wrap gap-1">
                  {mistakes.map((mistake, index) => {
                    const style = calculateMistakeStyle(mistake);
                    return (
                      <Badge key={index} className={style}>
                        {mistake}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pre-Trading Activities */}
            {preTradingActivities && preTradingActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Pre-Trading Activities</h4>
                <div className="flex flex-wrap gap-1">
                  {preTradingActivities.map((activity, index) => {
                    const style = calculatePreTradingActivityStyle(activity);
                    return (
                      <Badge key={index} className={style}>
                        {activity}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Post Submission Notes */}
            {postSubmissionNotes && (
              <div>
                <h4 className="text-sm font-semibold">Post Submission Notes</h4>
                <p className="text-muted-foreground">{postSubmissionNotes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
