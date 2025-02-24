
import { useAuth } from "@/contexts/AuthContext";
import { NoteTitle } from "./NoteTitle";
import { NoteTags } from "./NoteTags";
import { NoteContent } from "./NoteContent";
import { FormatToolbar } from "./FormatToolbar";
import { Separator } from "@/components/ui/separator";
import { NoteViewSkeleton } from "./NoteViewSkeleton";
import { EmptyNoteState } from "./EmptyNoteState";
import { useNote } from "@/hooks/useNote";
import { useState } from "react";
import { ColorPickerDialog } from "./ColorPickerDialog";
import { LinkDialog } from "./LinkDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface NoteViewProps {
  noteId: string | null;
  onBack?: () => void;
}

export const NoteView = ({ noteId, onBack }: NoteViewProps) => {
  const { user } = useAuth();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const {
    isLoading,
    title,
    content,
    tags,
    tagColors,
    handleTitleChange,
    handleContentChange,
    handleAddTag,
    handleRemoveTag,
    handleUpdateTagColor,
  } = useNote(noteId, user);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleBold = () => {
    execCommand('bold');
  };

  const handleItalic = () => {
    execCommand('italic');
  };

  const handleUnderline = () => {
    execCommand('underline');
  };

  const handleStrikethrough = () => {
    execCommand('strikeThrough');
  };

  const handleColorChange = () => {
    setIsColorPickerOpen(true);
  };

  const handleLink = () => {
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = (url: string) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (range && !range.collapsed) {
      // If text is selected, wrap it in a link
      const selectedText = range.toString();
      const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${selectedText}</a>`;
      document.execCommand('insertHTML', false, link);
    } else {
      // If no text is selected, insert the URL as a link
      const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${url}</a>`;
      document.execCommand('insertHTML', false, link);
    }
  };

  if (!noteId) {
    return <EmptyNoteState />;
  }

  if (isLoading) {
    return <NoteViewSkeleton />;
  }

  return (
    <div className="h-full bg-background">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden m-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>
      )}
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <NoteTitle title={title} onTitleChange={handleTitleChange} />
          <NoteTags 
            tags={tags} 
            tagColors={tagColors}
            onAddTag={handleAddTag} 
            onRemoveTag={handleRemoveTag} 
            onUpdateTagColor={handleUpdateTagColor}
          />
          <FormatToolbar 
            onBold={handleBold}
            onItalic={handleItalic}
            onUnderline={handleUnderline}
            onStrikethrough={handleStrikethrough}
            onColorChange={handleColorChange}
            onLink={handleLink}
          />
          <Separator className="my-4" />
          <NoteContent 
            content={content} 
            onContentChange={handleContentChange} 
          />
          <ColorPickerDialog
            isOpen={isColorPickerOpen}
            onClose={() => setIsColorPickerOpen(false)}
            onColorSelect={(color) => {
              execCommand('foreColor', color);
            }}
          />
          <LinkDialog
            isOpen={isLinkDialogOpen}
            onClose={() => setIsLinkDialogOpen(false)}
            onSubmit={handleLinkSubmit}
          />
        </div>
      </div>
    </div>
  );
};
