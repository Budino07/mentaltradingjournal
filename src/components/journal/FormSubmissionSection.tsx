import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trade } from "@/types/trade";

interface FormSubmissionSectionProps {
  sessionType: "pre" | "post";
  notes: string;
  setNotes: (notes: string) => void;
  trades: Trade[];
  handleSubmit: () => void;
  selectedOutcome?: string;
}

export const FormSubmissionSection = ({
  sessionType,
  notes,
  setNotes,
  handleSubmit,
}: FormSubmissionSectionProps) => {
  return (
    <div className="space-y-6">
      <Textarea
        placeholder={sessionType === "pre" 
          ? "How are you feeling before starting your trading session?" 
          : "Reflect on your trading session. How do you feel about your performance and decisions?"
        }
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[120px] bg-card/50 border-primary/10 focus-visible:ring-primary/30 resize-none"
      />

      <Button 
        onClick={handleSubmit}
        className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300"
      >
        Log {sessionType === "pre" ? "Pre" : "Post"}-Session Entry
      </Button>
    </div>
  );
};