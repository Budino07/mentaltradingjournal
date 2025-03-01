import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EmojiPicker } from "./EmojiPicker";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  tag_colors: Record<string, string>;
  emoji: string;
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const TAG_COLORS = {
  purple: "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-700/60 dark:hover:bg-purple-700/80 dark:text-purple-200",
  blue: "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-700/60 dark:hover:bg-blue-700/80 dark:text-blue-200",
  green: "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-700/60 dark:hover:bg-green-700/80 dark:text-green-200",
  yellow: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-600/60 dark:hover:bg-yellow-600/80 dark:text-yellow-200",
  red: "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-700/60 dark:hover:bg-red-700/80 dark:text-red-200",
  pink: "bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-700/60 dark:hover:bg-pink-700/80 dark:text-pink-200",
};

export const NoteItem = ({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete,
}: NoteItemProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("noteId", note.id);
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.note-actions')) {
      onSelect(note.id);
    }
  };

  const handleEmojiSelect = () => {
    setShowEmojiPicker(false);
  };

  const getTagColorClass = (tag: string) => {
    return note.tag_colors?.[tag] ? TAG_COLORS[note.tag_colors[tag] as keyof typeof TAG_COLORS] : TAG_COLORS.purple;
  };

  return (
    <div
      className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? "bg-secondary/10 border border-secondary/20" 
          : "hover:bg-secondary/5"
      }`}
      onClick={handleNoteClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity note-actions">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary/20 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Change Icon
                </DropdownMenuItem>
              </DialogTrigger>
              <EmojiPicker
                noteId={note.id}
                onEmojiSelect={handleEmojiSelect}
              />
            </Dialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg select-none" role="img" aria-label="note emoji">
          {note.emoji || "📝"}
        </span>
        <h3 className="font-medium">
          {note.title || "Untitled"}
        </h3>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={cn("text-xs transition-colors duration-200", getTagColorClass(tag))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        {format(new Date(note.created_at), "d MMM yyyy")}
      </p>
    </div>
  );
};
