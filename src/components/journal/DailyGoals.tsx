
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DailyGoalsProps {
  dailyGoals: string[];
  setDailyGoals: (goals: string[]) => void;
  completedGoals?: string[];
  setCompletedGoals?: (goals: string[]) => void;
  isPostSession?: boolean;
}

export const DailyGoals = ({
  dailyGoals,
  setDailyGoals,
  completedGoals = [],
  setCompletedGoals,
  isPostSession = false
}: DailyGoalsProps) => {
  const [newGoal, setNewGoal] = useState("");
  
  const handleAddGoal = () => {
    if (newGoal.trim() && dailyGoals.length < 3) {
      setDailyGoals([...dailyGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = [...dailyGoals];
    updatedGoals.splice(index, 1);
    setDailyGoals(updatedGoals);
    
    // If in post-session, also update completed goals
    if (isPostSession && setCompletedGoals) {
      const updatedCompleted = completedGoals.filter(
        goal => !dailyGoals[index].includes(goal)
      );
      setCompletedGoals(updatedCompleted);
    }
  };

  const handleGoalCheck = (index: number, checked: boolean) => {
    if (!setCompletedGoals || !isPostSession) return;
    
    const goal = dailyGoals[index];
    if (checked) {
      setCompletedGoals([...completedGoals, goal]);
    } else {
      setCompletedGoals(completedGoals.filter(g => g !== goal));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <Label className="text-lg font-medium">Daily Goals</Label>
      </div>

      <div className="space-y-3">
        {dailyGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Set up to 3 trading goals for the day
          </p>
        ) : (
          <div className="space-y-2">
            {dailyGoals.map((goal, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-card/50 p-3 rounded-md border border-border/50"
              >
                {isPostSession ? (
                  <Checkbox 
                    id={`goal-${index}`}
                    checked={completedGoals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalCheck(index, !!checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                ) : null}
                <span className="flex-1 text-sm">
                  {goal}
                </span>
                {!isPostSession && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveGoal(index)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isPostSession && dailyGoals.length < 3 && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter a goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddGoal();
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddGoal}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
