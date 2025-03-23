import { Progress } from "@/components/ui/progress";

export const LevelProgress = ({ level, levelProgress }: { level: number; levelProgress: number }) => {
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium">Level {level}</span>
        <span className="text-xs text-muted-foreground">{levelProgress}%</span>
      </div>
      <Progress 
        value={levelProgress} 
        className="h-2" 
        indicatorColor="bg-gradient-to-r from-primary to-accent"
      />
    </div>
  );
};
