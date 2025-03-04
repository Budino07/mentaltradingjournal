import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RuleAdherenceChart } from "./rule-adherence/RuleAdherenceChart";
import { RuleAdherenceInsight } from "./rule-adherence/RuleAdherenceInsight";

export const RuleAdherence = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['ruleAdherence'],
    queryFn: async () => {
      console.log("Fetching rule adherence data...");
      
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('session_type', 'post')
        .not('outcome', 'eq', 'no_trades');

      if (error) {
        console.error("Error fetching entries:", error);
        throw error;
      }

      console.log("Fetched entries:", entries);

      const rulesFollowedStats = {
        wins: 0,
        losses: 0,
        total: 0,
      };

      const rulesNotFollowedStats = {
        wins: 0,
        losses: 0,
        total: 0,
      };

      entries?.forEach(entry => {
        const hasFollowedRules = entry.followed_rules && entry.followed_rules.length > 0;
        
        if (hasFollowedRules) {
          rulesFollowedStats.total++;
          if (entry.outcome === 'win') rulesFollowedStats.wins++;
          if (entry.outcome === 'loss') rulesFollowedStats.losses++;
        } else {
          rulesNotFollowedStats.total++;
          if (entry.outcome === 'win') rulesNotFollowedStats.wins++;
          if (entry.outcome === 'loss') rulesNotFollowedStats.losses++;
        }
      });

      console.log("Rules followed stats:", rulesFollowedStats);
      console.log("Rules not followed stats:", rulesNotFollowedStats);

      const calculatePercentage = (value: number, total: number) => 
        total > 0 ? Math.round((value / total) * 100) : 0;

      return [
        {
          name: "Rules Followed",
          wins: calculatePercentage(rulesFollowedStats.wins, rulesFollowedStats.total),
          losses: calculatePercentage(rulesFollowedStats.losses, rulesFollowedStats.total),
          total: rulesFollowedStats.total,
        },
        {
          name: "Rules Not Followed",
          wins: calculatePercentage(rulesNotFollowedStats.wins, rulesNotFollowedStats.total),
          losses: calculatePercentage(rulesNotFollowedStats.losses, rulesNotFollowedStats.total),
          total: rulesNotFollowedStats.total,
        },
      ];
    },
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Default values if analytics data is incomplete
  const defaultStats = { wins: 0, losses: 0, total: 0 };
  const rulesFollowed = analytics[0] || { name: "Rules Followed", ...defaultStats };
  const rulesNotFollowed = analytics[1] || { name: "Rules Not Followed", ...defaultStats };
  
  // Require minimum 5 sessions in each category for meaningful insights
  const MINIMUM_SESSIONS = 5;
  const hasEnoughData = rulesFollowed.total >= MINIMUM_SESSIONS && 
                       rulesNotFollowed.total >= MINIMUM_SESSIONS;

  // Calculate insights only if we have valid data
  const winRateDifference = (rulesFollowed.wins || 0) - (rulesNotFollowed.wins || 0);

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Rule Adherence vs. Performance</h3>
        <p className="text-sm text-muted-foreground">
          Compare outcomes when trading rules are followed vs. not followed
        </p>
      </div>

      <RuleAdherenceChart data={analytics} />

      <RuleAdherenceInsight 
        hasEnoughData={hasEnoughData}
        winRateDifference={winRateDifference}
        rulesFollowed={rulesFollowed}
      />
    </Card>
  );
};