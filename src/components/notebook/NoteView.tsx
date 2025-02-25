import { useState } from "react";
import { NoteTitle } from "@/components/notebook/NoteTitle";
import { NoteContent } from "@/components/notebook/NoteContent";
import { NoteTags } from "@/components/notebook/NoteTags";
import { NoteViewSkeleton } from "@/components/notebook/NoteViewSkeleton";
import { EmptyNoteState } from "@/components/notebook/EmptyNoteState";
import { FormatToolbar } from "@/components/notebook/FormatToolbar";
import { ColorPickerDialog } from "@/components/notebook/ColorPickerDialog";
import { LinkDialog } from "@/components/notebook/LinkDialog";

interface NoteViewProps {
  note: any;
  isLoading: boolean;
}

export const NoteView = ({ note, isLoading }: NoteViewProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const handleFormat = (command: string) => () => {
    document.execCommand(command, false);
  };

  const handleColorChange = (color: string) => {
    document.execCommand('foreColor', false, color);
    setIsColorPickerOpen(false);
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedRange(selection.getRangeAt(0));
      setIsLinkDialogOpen(true);
    }
  };

  const handleLinkSubmit = (url: string) => {
    if (selectedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectedRange);
        document.execCommand('createLink', false, url);
        const links = document.querySelectorAll('a');
        links.forEach(link => {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'text-primary hover:text-primary-dark underline';
        });
      }
    }
    setIsLinkDialogOpen(false);
  };

  if (isLoading) {
    return <NoteViewSkeleton />;
  }

  if (!note) {
    return <EmptyNoteState />;
  }

  return (
    <div className="h-full flex flex-col">
      <NoteTitle
        title={note.title}
        onTitleChange={note.handleTitleChange}
      />
      <FormatToolbar
        onBold={handleFormat('bold')}
        onItalic={handleFormat('italic')}
        onUnderline={handleFormat('underline')}
        onStrikethrough={handleFormat('strikeThrough')}
        onColorChange={() => setIsColorPickerOpen(true)}
        onLink={handleLinkClick}
      />
      <NoteTags
        tags={note.tags}
        tagColors={note.tagColors}
        onAddTag={note.handleAddTag}
        onRemoveTag={note.handleRemoveTag}
        onUpdateTagColor={note.handleUpdateTagColor}
      />
      <NoteContent
        content={note.content}
        onContentChange={note.handleContentChange}
      />
      <ColorPickerDialog
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onColorSelect={handleColorChange}
      />
      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
      />
    </div>
  );
};
