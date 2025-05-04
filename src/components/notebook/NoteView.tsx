import { useAuth } from "@/contexts/AuthContext";
import { NoteTitle } from "./NoteTitle";
import { NoteTags } from "./NoteTags";
import { NoteContent } from "./NoteContent";
import { FormatToolbar } from "./FormatToolbar";
import { Separator } from "@/components/ui/separator";
import { NoteViewSkeleton } from "./NoteViewSkeleton";
import { EmptyNoteState } from "./EmptyNoteState";
import { useNote } from "@/hooks/useNote";
import { useState, useRef, useEffect } from "react";
import { ColorPickerDialog } from "./ColorPickerDialog";
import { LinkDialog } from "./LinkDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { FontSettingsPanel } from "./FontSettingsPanel";
import { useFontSettings } from "@/hooks/useFontSettings";

interface NoteViewProps {
  noteId: string | null;
  onBack?: () => void;
}

export const NoteView = ({ noteId, onBack }: NoteViewProps) => {
  const { user } = useAuth();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  
  const { fontSettings, updateFontSettings, isApplyingToSelection, toggleApplyToSelection } = useFontSettings();
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

  // Check for selection constantly
  useEffect(() => {
    const checkForSelection = () => {
      const selection = window.getSelection();
      const hasActiveSelection = 
        selection && 
        selection.rangeCount > 0 && 
        selection.toString().trim() !== "" &&
        editorRef.current?.contains(selection.anchorNode);
      
      setHasSelection(!!hasActiveSelection);
      
      if (hasActiveSelection && selection) {
        // Save the selection range for later use
        const range = selection.getRangeAt(0);
        setSavedSelection(range.cloneRange());
      }
    };

    // Add event listeners to detect text selection
    document.addEventListener("selectionchange", checkForSelection);
    
    return () => {
      document.removeEventListener("selectionchange", checkForSelection);
    };
  }, []);

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

  // Save the current selection and open link dialog
  const handleLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedText("");
      setSavedSelection(null);
      setIsLinkDialogOpen(true);
      return;
    }

    // Store the current selection range
    const range = selection.getRangeAt(0);
    setSavedSelection(range.cloneRange());
    setSelectedText(selection.toString());
    setIsLinkDialogOpen(true);
  };

  // Handle link submission with proper selection restoration
  const handleLinkSubmit = (url: string, text?: string) => {
    // Ensure URL has protocol prefix
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    
    if (!editorRef.current) return;

    // Focus the editor
    editorRef.current.focus();
    
    const selection = window.getSelection();
    
    // If we have a saved selection, restore it
    if (savedSelection) {
      selection?.removeAllRanges();
      selection?.addRange(savedSelection);
      
      // Create the link from selection
      document.execCommand('createLink', false, finalUrl);
      
      // Get all links in the editor
      const links = editorRef.current.querySelectorAll('a');
      
      // Apply styling to the newly created link
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add('text-primary', 'hover:text-primary-dark', 'underline');
      });
    } else if (text) {
      // If no selection but we have text from dialog, insert as new link
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    } else {
      // If no text provided, insert the URL itself as link
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${finalUrl}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    }
    
    // Reset selection and saved range
    setSavedSelection(null);
    setSelectedText("");
    
    // Trigger content update to save changes
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Apply font to selected text
  const handleApplyFontToSelection = () => {
    if (!hasSelection || !savedSelection) return;

    // Restore the saved selection
    const selection = window.getSelection();
    if (!selection) return;
    
    selection.removeAllRanges();
    selection.addRange(savedSelection);

    // Apply font styling
    if (fontSettings.fontFamily) {
      document.execCommand('fontName', false, fontSettings.fontFamily);
    }

    // Create a span with the desired font size
    const span = document.createElement('span');
    span.style.fontSize = `${fontSettings.fontSize}px`;
    
    try {
      // Use the surroundContents method to wrap the selection in the span
      const range = selection.getRangeAt(0);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      
      // Update content
      if (editorRef.current) {
        handleContentChange(editorRef.current.innerHTML);
      }
    } catch (e) {
      console.error('Could not apply font formatting to selection', e);
    }

    // Clear selection after applying
    selection.removeAllRanges();
    setSavedSelection(null);
    setHasSelection(false);
  };

  if (!noteId) {
    return <EmptyNoteState />;
  }

  if (isLoading) {
    return <NoteViewSkeleton />;
  }

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col" style={{ scrollBehavior: 'auto' }}>
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
          <div className="flex items-center space-x-2">
            <FormatToolbar 
              onBold={handleBold}
              onItalic={handleItalic}
              onUnderline={handleUnderline}
              onStrikethrough={handleStrikethrough}
              onColorChange={handleColorChange}
              onLink={handleLink}
            />
            <FontSettingsPanel 
              settings={fontSettings}
              onSettingsChange={updateFontSettings}
              isApplyingToSelection={true}
              onApplyToSelectionChange={toggleApplyToSelection}
              onApplyClick={handleApplyFontToSelection}
              hasSelection={hasSelection}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex-1 overflow-hidden">
            <NoteContent 
              content={content} 
              onContentChange={handleContentChange}
              editorRef={editorRef}
              fontSettings={fontSettings}
              isApplyingFontToSelection={true}
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
