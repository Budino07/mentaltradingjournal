
import { NoteItem } from "./notes-list/NoteItem";
import { NotesLoadingSkeleton } from "./notes-list/NotesLoadingSkeleton";
import { NotesEmptyState } from "./notes-list/NotesEmptyState";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  tag_colors: Record<string, string>;
  emoji: string;
  folder_id?: string;
  updated_at: string;
  user_id: string;
}

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesList = ({ 
  notes, 
  isLoading, 
  selectedNoteId, 
  onSelectNote,
  onDeleteNote 
}: NotesListProps) => {
  if (isLoading) {
    return <NotesLoadingSkeleton />;
  }

  return (
    <div className="p-4 space-y-2 overflow-auto">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isSelected={selectedNoteId === note.id}
          onSelect={onSelectNote}
          onDelete={onDeleteNote}
        />
      ))}
      {notes.length === 0 && <NotesEmptyState />}
    </div>
  );
};
