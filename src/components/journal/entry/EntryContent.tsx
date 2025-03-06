import React from 'react';
import { Trade } from '@/types/analytics'; // Ensure correct import

import { JournalEntry } from "@/types/analytics";
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
import { calculateTotalPL } from "@/utils/tradeUtils";
import { calculateSessionTypeColor } from "@/utils/journalUtils";
import { calculateRulesFollowedStyle } from "@/utils/ruleUtils";
import { calculateMistakeStyle } from "@/utils/mistakeUtils";
import { calculatePreTradingActivityStyle } from "@/utils/preTradingActivityUtils";

interface EntryContentProps {
  entry: JournalEntry;
}

export const EntryContent: React.FC<EntryContentProps> = ({ entry }) => {
  const totalPL = calculateTotalPL(entry.trades || []);
  const sessionTypeColor = calculateSessionTypeColor(entry.session_type);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(new Date(entry.created_at), "PPP")}
          </CardTitle>
          <Badge className={sessionTypeColor}>{entry.session_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pl-4">
        <ScrollArea className="h-[450px] w-full pr-4">
          <div className="space-y-4">
            {/* Emotion and Details */}
            <div>
              <h4 className="text-sm font-semibold">Emotion</h4>
              <p className="text-muted-foreground">{entry.emotion}</p>
              {entry.emotion_detail && (
                <>
                  <h4 className="text-sm font-semibold mt-2">Emotion Detail</h4>
                  <p className="text-muted-foreground">{entry.emotion_detail}</p>
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-semibold">Notes</h4>
              <p className="text-muted-foreground">{entry.notes}</p>
            </div>

            {/* Outcome */}
            {entry.outcome && (
              <div>
                <h4 className="text-sm font-semibold">Outcome</h4>
                <p className="text-muted-foreground">{entry.outcome}</p>
              </div>
            )}

            {/* Market Conditions */}
            {entry.market_conditions && (
              <div>
                <h4 className="text-sm font-semibold">Market Conditions</h4>
                <p className="text-muted-foreground">{entry.market_conditions}</p>
              </div>
            )}

            {/* Trades Accordion */}
            {entry.trades && entry.trades.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Trades</h4>
                <Accordion type="single" collapsible>
                  {entry.trades.map((trade, index) => (
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
            {entry.followed_rules && entry.followed_rules.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Rules Followed</h4>
                <div className="flex flex-wrap gap-1">
                  {entry.followed_rules.map((rule, index) => {
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
            {entry.mistakes && entry.mistakes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Mistakes</h4>
                <div className="flex flex-wrap gap-1">
                  {entry.mistakes.map((mistake, index) => {
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
            {entry.pre_trading_activities && entry.pre_trading_activities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Pre-Trading Activities</h4>
                <div className="flex flex-wrap gap-1">
                  {entry.pre_trading_activities.map((activity, index) => {
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
            {entry.post_submission_notes && (
              <div>
                <h4 className="text-sm font-semibold">Post Submission Notes</h4>
                <p className="text-muted-foreground">{entry.post_submission_notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Fix for the specific error mentioned
const handleSomeFunctionWithError = (param: any) => {
  // Convert string to the correct type or handle it appropriately
  // This is just a placeholder fix - update according to actual implementation
  return param;
};
