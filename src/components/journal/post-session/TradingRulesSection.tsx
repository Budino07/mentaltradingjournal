
import { Checkbox } from "@/components/ui/checkbox";

interface TradingRulesSectionProps {
  followedRules: string[];
  setFollowedRules: (rules: string[]) => void;
  selectedOutcome?: string;
}

export const TradingRulesSection = ({
  followedRules,
  setFollowedRules,
  selectedOutcome,
}: TradingRulesSectionProps) => {
  // If session outcome is "loss", it should not require rule selection
  const isOptional = selectedOutcome === "loss";

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        Trading Rules Followed {isOptional && <span className="text-sm font-normal text-muted-foreground ml-1">(optional)</span>}
      </h3>
      <div className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="position_sizing"
            checked={followedRules.includes('position_sizing')}
            onCheckedChange={(checked) => {
              if (checked) {
                setFollowedRules([...followedRules, 'position_sizing']);
              } else {
                setFollowedRules(followedRules.filter(rule => rule !== 'position_sizing'));
              }
            }}
            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <label
            htmlFor="position_sizing"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Proper position sizing
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="entry_criteria"
            checked={followedRules.includes('entry_criteria')}
            onCheckedChange={(checked) => {
              if (checked) {
                setFollowedRules([...followedRules, 'entry_criteria']);
              } else {
                setFollowedRules(followedRules.filter(rule => rule !== 'entry_criteria'));
              }
            }}
            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <label
            htmlFor="entry_criteria"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Entry Criteria
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="exit_strategy"
            checked={followedRules.includes('exit_strategy')}
            onCheckedChange={(checked) => {
              if (checked) {
                setFollowedRules([...followedRules, 'exit_strategy']);
              } else {
                setFollowedRules(followedRules.filter(rule => rule !== 'exit_strategy'));
              }
            }}
            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <label
            htmlFor="exit_strategy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Exit Strategy
          </label>
        </div>
      </div>
    </div>
  );
};
