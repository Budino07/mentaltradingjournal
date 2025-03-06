
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NoteEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  initialText: string;
  noteType: "notes" | "post_submission_notes";
  onNoteUpdated: (newText: string) => void;
}

export const NoteEditDialog = ({
  isOpen,
  onClose,
  entryId,
  initialText,
  noteType,
  onNoteUpdated,
}: NoteEditDialogProps) => {
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Notes cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create an update object with the appropriate field based on noteType
      const updateData = { [noteType]: text };
      
      const { error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', entryId);

      if (error) throw error;

      onNoteUpdated(text);
      toast.success("Notes updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit {noteType === "notes" ? "Trading Notes" : "Post-Session Notes"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your notes here..."
            className="min-h-[150px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
