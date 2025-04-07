
import { useAuth } from "@/contexts/AuthContext";
import { NoteTitle } from "./NoteTitle";
import { NoteTags } from "./NoteTags";
import { NoteContent } from "./NoteContent";
import { FormatToolbar } from "./FormatToolbar";
import { Separator } from "@/components/ui/separator";
import { NoteViewSkeleton } from "./NoteViewSkeleton";
import { EmptyNoteState } from "./EmptyNoteState";
import { useNote } from "@/hooks/useNote";
import { useState, useRef } from "react";
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
  const [selectedText, setSelectedText] = useState("");
  
  const editorRef = useRef<HTMLDivElement | null>(null);
  
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
    // Save the current selection before opening dialog
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
      
      // Store the selection range for later use
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = (url: string, text?: string) => {
    // Ensure URL has protocol prefix
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (!editor) return;
    
    // Focus the editor to ensure we're working with it
    editor.focus();
    
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      // When text is selected, create a link with the selection
      document.execCommand('createLink', false, finalUrl);
      
      // Apply styling to the newly created link
      const links = editor.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add('text-primary', 'hover:text-primary-dark', 'underline');
      });
    } else if (text) {
      // If we have text from the dialog but no selection, insert it as a link
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    } else {
      // If no text is selected or provided, insert the URL as a link
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${finalUrl}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    }
    
    // Trigger content update manually to save the changes
    handleContentChange(editor.innerHTML);
  };

  if (!noteId) {
    return <EmptyNoteState />;
  }

  if (isLoading) {
    return <NoteViewSkeleton />;
  }

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
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
      <div className="p-8 flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 h-full flex flex-col">
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
          <div className="flex-1 overflow-hidden">
            <NoteContent 
              content={content} 
              onContentChange={handleContentChange} 
              editorRef={editorRef}
            />
          </div>
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
            selectionText={selectedText}
          />
        </div>
      </div>
    </div>
  );
};
