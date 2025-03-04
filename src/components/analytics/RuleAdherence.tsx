
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

      // If no entries found, return empty result
      if (!entries || entries.length === 0) {
        console.log("No post-session entries found");
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

      entries?.forEach(entry => {
        // Only process entries that have a valid outcome and clear rules followed state
        if (!entry.outcome || (entry.outcome === 'no_trades')) {
          return; // Skip entries without valid outcome
        }

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

      // Only include categories with actual data
      const result = [];
      
      // Only add rules followed data if there's actual data
      if (rulesFollowedStats.total > 0) {
        const calculatePercentage = (value, total) => 
          total > 0 ? Math.round((value / total) * 100) : 0;
          
        result.push({
          name: "Rules Followed",
          wins: calculatePercentage(rulesFollowedStats.wins, rulesFollowedStats.total),
          losses: calculatePercentage(rulesFollowedStats.losses, rulesFollowedStats.total),
          total: rulesFollowedStats.total,
        });
      }
      
      // Only add rules not followed data if there's actual data
      if (rulesNotFollowedStats.total > 0) {
        const calculatePercentage = (value, total) => 
          total > 0 ? Math.round((value / total) * 100) : 0;
          
        result.push({
          name: "Rules Not Followed",
          wins: calculatePercentage(rulesNotFollowedStats.wins, rulesNotFollowedStats.total),
          losses: calculatePercentage(rulesNotFollowedStats.losses, rulesNotFollowedStats.total),
          total: rulesNotFollowedStats.total,
        });
      }
      
      console.log("Final analytics data:", result);
      return result;
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

  // Check if we have any valid data to display
  const hasRuleAdherenceData = analytics && analytics.length > 0;

  // Only set up the insight data if we have valid data
  let hasEnoughData = false;
  let winRateDifference = 0;
  let rulesFollowed = { wins: 0, total: 0 };
  
  if (hasRuleAdherenceData) {
    // Find rules followed entry if it exists
    const rulesFollowedEntry = analytics.find(item => item.name === "Rules Followed");
    const rulesNotFollowedEntry = analytics.find(item => item.name === "Rules Not Followed");
    
    rulesFollowed = rulesFollowedEntry || { name: "Rules Followed", wins: 0, losses: 0, total: 0 };
    const rulesNotFollowed = rulesNotFollowedEntry || { name: "Rules Not Followed", wins: 0, losses: 0, total: 0 };
    
    // Require minimum 5 sessions in each category for meaningful insights
    const MINIMUM_SESSIONS = 5;
    hasEnoughData = rulesFollowed.total >= MINIMUM_SESSIONS && 
                    rulesNotFollowed.total >= MINIMUM_SESSIONS;

    // Calculate insights only if we have valid data
    winRateDifference = (rulesFollowed.wins || 0) - (rulesNotFollowed.wins || 0);
  }

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
            hasEnoughData={hasEnoughData}
            winRateDifference={winRateDifference}
            rulesFollowed={rulesFollowed}
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
