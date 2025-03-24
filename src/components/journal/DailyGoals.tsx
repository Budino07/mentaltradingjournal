
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DailyGoalsProps {
  goals: string[];
  setGoals: (goals: string[]) => void;
  maxGoals?: number;
}

export const DailyGoals = ({
  goals,
  setGoals,
  maxGoals = 3
}: DailyGoalsProps) => {
  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState("");

  const handleAddGoal = () => {
    if (inputValue.trim() && goals.length < maxGoals) {
      setGoals([...goals, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const handleRemoveGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
  };

  const handleChangeGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <Label className="text-lg font-medium">Daily Goals</Label>
      </div>
      
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={goal}
              onChange={(e) => handleChangeGoal(index, e.target.value)}
              className="flex-1 bg-card/50 border-primary/10"
              placeholder={`Goal ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveGoal(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Remove
            </Button>
          </div>
        ))}
        
        {goals.length < maxGoals && (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-card/50 border-primary/10"
              placeholder={`Add goal ${goals.length + 1} of ${maxGoals}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddGoal}
              className="gap-1 whitespace-nowrap"
              disabled={!inputValue.trim()}
            >
              <PlusCircle className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        )}
        
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Set up to {maxGoals} goals for your trading day
          </p>
        )}
      </div>
    </div>
  );
};
