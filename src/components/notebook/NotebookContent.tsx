import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PenLine, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotesList } from "./NotesList";
import { NoteView } from "./NoteView";
import { FolderList } from "./FolderList";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export const NotebookContent = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: folders, isLoading: isLoadingFolders } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("notebook_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;

      // Set selected folder to "All Notes" if none is selected
      if (!selectedFolderId && data.length > 0) {
        const defaultFolder = data.find(folder => folder.is_default);
        if (defaultFolder) {
          setSelectedFolderId(defaultFolder.id);
        }
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes", selectedFolderId],
    queryFn: async () => {
      if (!user) throw new Error("No user found");

      const defaultFolder = folders?.find(folder => folder.is_default);
      const query = supabase
        .from("notebook_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Only filter by folder if not viewing "All Notes"
      if (selectedFolderId && defaultFolder?.id !== selectedFolderId) {
        query.eq("folder_id", selectedFolderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(note => ({
        ...note,
        tag_colors: (note.tag_colors || {}) as Record<string, string>
      }));
    },
    enabled: !!user,
  });

  const createNote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("notebook_notes")
        .insert([{ 
          title: "Untitled Note",
          content: "",
          user_id: user.id,
          folder_id: selectedFolderId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteId(data.id);
      toast({
        title: "Success",
        description: "New note created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("notebook_notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const moveNoteToFolder = useMutation({
    mutationFn: async ({ noteId, folderId }: { noteId: string, folderId: string }) => {
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("notebook_notes")
        .update({ folder_id: folderId })
        .eq("id", noteId)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Success",
        description: "Note moved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move note",
        variant: "destructive",
      });
    },
  });

  const handleDrop = (noteId: string, folderId: string) => {
    moveNoteToFolder.mutate({ noteId, folderId });
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes?.filter(note => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      (note.content || "").toLowerCase().includes(searchLower) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }) || [];

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery(""); // Clear search when hiding
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Folders Section (20%) */}
      <div className="w-1/5 min-w-[200px] border-r bg-background/50 flex flex-col">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Folders</h2>
          <FolderList 
            folders={folders || []} 
            isLoading={isLoadingFolders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onDrop={handleDrop}
          />
        </div>
      </div>

      <Separator orientation="vertical" className="mx-0" />

      {/* Notes Section (30%) */}
      <div className="w-[30%] min-w-[280px] border-r bg-background/30 flex flex-col">
        <div className="p-4 border-b bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Notes</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createNote.mutate()}
                className="hover:bg-primary/10"
              >
                <PenLine className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSearch}
                className={`hover:bg-primary/10 ${showSearch ? 'bg-primary/10' : ''}`}
              >
                {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {showSearch && (
            <Input
              type="search"
              placeholder="Search notes..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <NotesList 
          notes={filteredNotes} 
          isLoading={isLoadingNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onDeleteNote={handleDeleteNote}
        />
      </div>

      <Separator orientation="vertical" className="mx-0" />

      {/* Editor Section (50%) */}
      <div className="flex-1 bg-background">
        <NoteView noteId={selectedNoteId} />
      </div>
    </div>
  );
};
