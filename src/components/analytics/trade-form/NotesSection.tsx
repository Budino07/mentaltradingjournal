
import { Trade } from "@/types/trade";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesSectionProps {
  formValues?: Partial<Trade>;
}

export const NotesSection = ({ formValues }: NotesSectionProps) => {
  return (
    <div className="space-y-4 p-6 bg-background/50 border rounded-lg mb-4">
      <h3 className="text-lg font-semibold">Trade Notes</h3>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add any notes, observations, or thoughts about this trade..."
          className="min-h-[100px]"
          defaultValue={formValues?.notes || ''}
        />
      </div>
    </div>
  );
};
