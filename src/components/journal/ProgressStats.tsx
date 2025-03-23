import { Card } from "@/components/ui/card";
import { Trophy, Flame, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ProgressItem } from "./progress/ProgressItem";
import { LevelProgress } from "./progress/LevelProgress";

interface ProgressStats {
  preSessionStreak: number;
  postSessionStreak: number;
  dailyStreak: number;
  level: number;
  levelProgress: number;
}

interface ProgressStatsRow {
  pre_session_streak: number;
  post_session_streak: number;
  daily_streak: number;
  level: number;
  level_progress: number;
}

const inspirationalMessages = [
  "Great job! Every step you take brings you closer to your goals.",
  "You've just made progress! Small habits lead to big changes.",
  "Well done! Reflecting like this is a powerful way to grow.",
  "You're building consistency—keep up the momentum!",
  "Another win for today! Your dedication is inspiring.",
  "Awesome! Every entry is a step toward self-awareness.",
  "You're on a roll! Keep tracking, and great insights will follow.",
  "Nice work! This entry is one more piece of your success story.",
  "Way to go! Your discipline is paving the way for better results.",
  "Fantastic effort! Reflecting on your journey is how you master it."
];

interface ProgressStatsProps {
  preSessionStreak: number;
  postSessionStreak: number;
  dailyStreak: number;
  level: number;
  levelProgress: number;
}

export const ProgressStats = ({
  preSessionStreak,
  postSessionStreak,
  dailyStreak,
  level,
  levelProgress,
}: ProgressStatsProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    preSessionStreak,
    postSessionStreak,
    dailyStreak,
    level,
    levelProgress,
  });
  const [previousPreStreak, setPreviousPreStreak] = useState(preSessionStreak);
  const [previousPostStreak, setPreviousPostStreak] = useState(postSessionStreak);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial stats when component mounts
  useEffect(() => {
    const fetchInitialStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('progress_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const newStats: ProgressStats = {
            preSessionStreak: data.pre_session_streak,
            postSessionStreak: data.post_session_streak,
            dailyStreak: data.daily_streak,
            level: data.level,
            levelProgress: data.level_progress,
          };
          setStats(newStats);
          setPreviousPreStreak(data.pre_session_streak);
          setPreviousPostStreak(data.post_session_streak);
        }
      } catch (error) {
        console.error('Error fetching initial stats:', error);
        toast.error('Failed to load progress stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStats();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('progress_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_stats',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && 'pre_session_streak' in payload.new) {
            const newData = payload.new as ProgressStatsRow;
            const newStats: ProgressStats = {
              preSessionStreak: newData.pre_session_streak,
              postSessionStreak: newData.post_session_streak,
              dailyStreak: newData.daily_streak,
              level: newData.level,
              levelProgress: newData.level_progress,
            };

            if (newData.pre_session_streak > previousPreStreak) {
              const randomMessage = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];
              toast.success(randomMessage, {
                duration: 5000,
                className: "bg-primary text-white",
              });
            }

            if (newData.post_session_streak > previousPostStreak) {
              const randomMessage = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];
              toast.success(randomMessage, {
                duration: 5000,
                className: "bg-primary text-white",
              });
            }

            setPreviousPreStreak(newData.pre_session_streak);
            setPreviousPostStreak(newData.post_session_streak);
            setStats(newStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, previousPreStreak, previousPostStreak]);

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6 bg-card/30 backdrop-blur-xl border-primary/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6 bg-card/30 backdrop-blur-xl border-primary/10">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Your Progress</h3>
        <p className="text-sm text-muted-foreground">
          Track your trading journal consistency
        </p>
      </div>

      <div className="grid gap-4">
        <ProgressItem
          icon={Trophy}
          title="Pre-Session Daily Goal"
          value={stats.preSessionStreak > 0 ? 1 : 0}
          maxValue={1}
          color="primary"
          unit="completed"
        />

        <ProgressItem
          icon={Star}
          title="Post-Session Daily Goal"
          value={stats.postSessionStreak > 0 ? 1 : 0}
          maxValue={1}
          color="secondary"
          unit="completed"
        />

        <ProgressItem
          icon={Flame}
          title="Daily Activity Streak"
          value={stats.dailyStreak}
          maxValue={30}
          color="accent"
          unit="days"
        />

        <LevelProgress
          level={stats.level}
          levelProgress={stats.levelProgress}
        />
      </div>
    </Card>
  );
};