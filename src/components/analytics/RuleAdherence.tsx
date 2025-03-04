
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
      
      // Fetch all post-session entries that have trade outcomes
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*, trades(*)')
        .eq('session_type', 'post')
        .not('outcome', 'eq', 'no_trades');

      if (error) {
        console.error("Error fetching entries:", error);
        throw error;
      }

      console.log("Fetched post-session entries:", entries);
      
      // If no entries found, return empty array to indicate no data
      if (!entries || entries.length === 0) {
        return [];
      }

      // Only process entries that have proper rule adherence data and valid outcome
      const validEntries = entries.filter(entry => 
        entry.outcome && 
        (entry.outcome === 'win' || entry.outcome === 'loss') && 
        Array.isArray(entry.followed_rules)
      );
      
      console.log("Valid entries for processing:", validEntries);
      
      if (validEntries.length === 0) {
        return [];
      }

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

      validEntries.forEach(entry => {
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

      // Only return categories that have data
      const results = [];
      
      const calculatePercentage = (value, total) => 
        total > 0 ? Math.round((value / total) * 100) : 0;
      
      // Only add rules followed data if we have entries in that category
      if (rulesFollowedStats.total > 0) {
        results.push({
          name: "Rules Followed",
          wins: calculatePercentage(rulesFollowedStats.wins, rulesFollowedStats.total),
          losses: calculatePercentage(rulesFollowedStats.losses, rulesFollowedStats.total),
          total: rulesFollowedStats.total,
          actualWins: rulesFollowedStats.wins,
          actualLosses: rulesFollowedStats.losses,
        });
      }
      
      // Only add rules not followed data if we have entries in that category
      if (rulesNotFollowedStats.total > 0) {
        results.push({
          name: "Rules Not Followed",
          wins: calculatePercentage(rulesNotFollowedStats.wins, rulesNotFollowedStats.total),
          losses: calculatePercentage(rulesNotFollowedStats.losses, rulesNotFollowedStats.total),
          total: rulesNotFollowedStats.total,
          actualWins: rulesNotFollowedStats.wins,
          actualLosses: rulesNotFollowedStats.losses,
        });
      }
      
      return results;
    },
  });
  
  if (isLoading) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Check if we have any valid rule adherence data
  const hasRuleAdherenceData = analytics && analytics.length > 0;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Rule Adherence vs. Performance</h3>
        <p className="text-sm text-muted-foreground">
          Compare outcomes when trading rules are followed vs. not followed
        </p>
      </div>

      {hasRuleAdherenceData ? (
        <>
          <RuleAdherenceChart data={analytics} />
          
          <RuleAdherenceInsight 
            hasEnoughData={analytics.some(item => item.total >= 5)}
            winRateDifference={
              (analytics[0]?.wins || 0) - (analytics[1]?.wins || 0)
            }
            rulesFollowed={analytics.find(item => item.name === "Rules Followed") || { wins: 0, total: 0 }}
          />
        </>
      ) : (
        <div className="h-[250px] flex flex-col items-center justify-center text-center p-6">
          <p className="text-muted-foreground mb-2">No rule adherence data available</p>
          <p className="text-sm text-muted-foreground">
            Complete post-session journal entries and indicate which trading rules you followed 
            to see how rule adherence affects your performance.
          </p>
        </div>
      )}
    </Card>
  );
};
