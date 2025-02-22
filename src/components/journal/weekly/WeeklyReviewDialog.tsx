
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NotepadText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface WeeklyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekNumber: number;
}

export const WeeklyReviewDialog = ({
  open,
  onOpenChange,
  weekNumber,
}: WeeklyReviewDialogProps) => {
  const [strength, setStrength] = useState("");
  const [weakness, setWeakness] = useState("");
  const [improvement, setImprovement] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getCurrentWeekStartDate = () => {
    // Get the date for the specific week
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Create a date for the first day of the current month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Get the Monday of that week
    const weekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    
    // Add the correct number of weeks
    weekStart.setDate(weekStart.getDate() + ((weekNumber - 1) * 7));
    
    // Format as YYYY-MM-DD
    return weekStart.toISOString().split('T')[0];
  };

  const loadReview = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const weekStartDate = getCurrentWeekStartDate();
      
      console.log('Loading review for week:', weekNumber);
      console.log('Week start date:', weekStartDate);
      
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('week_start_date', weekStartDate)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      console.log('Loaded review data:', data);

      if (data) {
        setStrength(data.strength || '');
        setWeakness(data.weakness || '');
        setImprovement(data.improvement || '');
      } else {
        // Reset form if no data exists for this week
        setStrength('');
        setWeakness('');
        setImprovement('');
      }
    } catch (error) {
      console.error('Error loading review:', error);
      toast({
        title: "Error Loading Review",
        description: "There was an error loading your weekly review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadReview();
    }
  }, [open, user, weekNumber]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const weekStartDate = getCurrentWeekStartDate();

      console.log('Saving review for week:', weekNumber);
      console.log('Week start date:', weekStartDate);

      // First try to get an existing review
      const { data: existingReview, error: fetchError } = await supabase
        .from('weekly_reviews')
        .select('id')
        .eq('week_start_date', weekStartDate)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let error;

      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('weekly_reviews')
          .update({
            strength,
            weakness,
            improvement,
          })
          .eq('id', existingReview.id);
        error = updateError;
      } else {
        // Insert new review
        const { error: insertError } = await supabase
          .from('weekly_reviews')
          .insert({
            user_id: user.id,
            week_start_date: weekStartDate,
            strength,
            weakness,
            improvement,
          });
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Weekly Review Saved",
        description: "Your weekly review has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: "Error Saving Review",
        description: "There was an error saving your weekly review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <NotepadText className="h-5 w-5" />
            Weekly Review
          </DialogTitle>
          <DialogDescription>
            Review your trading performance and set goals for improvement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Reflection: Strength</h3>
            <p className="text-sm text-muted-foreground">
              What did you do best this week?
            </p>
            <Textarea
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="min-h-[120px] bg-card/50 border-primary/10 focus-visible:ring-primary/30"
              placeholder="Write about your strengths..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Reflection: Weakness</h3>
            <p className="text-sm text-muted-foreground">
              What is the one thing you must improve on?
            </p>
            <Textarea
              value={weakness}
              onChange={(e) => setWeakness(e.target.value)}
              className="min-h-[120px] bg-card/50 border-primary/10 focus-visible:ring-primary/30"
              placeholder="Write about your area of improvement..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Plan: Improvement</h3>
            <p className="text-sm text-muted-foreground">
              What is your plan to ensure you make this improvement next week?
            </p>
            <Textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              className="min-h-[120px] bg-card/50 border-primary/10 focus-visible:ring-primary/30"
              placeholder="Write your improvement plan..."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

