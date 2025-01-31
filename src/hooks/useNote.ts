import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNote = (noteId: string | null, user: any) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId || !user) return null;

      const { data, error } = await supabase
        .from("notebook_notes")
        .select("*")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!noteId && !!user,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
    }
  }, [noteId, note]);

  const updateNote = useMutation({
    mutationFn: async ({ title, content, tags }: { title: string; content: string; tags: string[] }) => {
      if (!noteId || !user) throw new Error("No note selected or user not found");

      const { data, error } = await supabase
        .from("notebook_notes")
        .update({ title, content, tags })
        .eq("id", noteId)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const debouncedUpdate = useCallback((title: string, content: string, tags: string[]) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    queryClient.setQueryData(["note", noteId], (oldData: any) => ({
      ...oldData,
      title,
      content,
      tags,
    }));

    updateTimeoutRef.current = setTimeout(() => {
      updateNote.mutate(
        { title, content, tags },
        {
          onSuccess: (data) => {
            queryClient.setQueryData(["note", noteId], data);
            queryClient.invalidateQueries({ queryKey: ["notes"] });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to save changes",
              variant: "destructive",
            });
          },
        }
      );
    }, 1000);
  }, [noteId, queryClient, updateNote, toast]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedUpdate(newTitle, content, tags);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedUpdate(title, newContent, tags);
  };

  const handleAddTag = (newTag: string) => {
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    debouncedUpdate(title, content, updatedTags);
    toast({
      title: "Tag added",
      description: `Added tag: ${newTag}`,
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    debouncedUpdate(title, content, updatedTags);
    toast({
      title: "Tag removed",
      description: `Removed tag: ${tagToRemove}`,
    });
  };

  return {
    note,
    isLoading,
    title,
    content,
    tags,
    handleTitleChange,
    handleContentChange,
    handleAddTag,
    handleRemoveTag,
  };
};