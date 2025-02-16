
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile, ThumbsUp, Heart, Star, Trophy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface BlueprintCardProps {
  name: string;
  winRate?: number;
  id: string;
  emoji?: string;
  onDelete?: () => void;
}

const emojis = [
  { icon: Smile, label: "Smile", color: "#F2FCE2" },
  { icon: ThumbsUp, label: "Thumbs Up", color: "#D3E4FD" },
  { icon: Heart, label: "Heart", color: "#FFDEE2" },
  { icon: Star, label: "Star", color: "#FEF7CD" },
  { icon: Trophy, label: "Trophy", color: "#FEC6A1" },
];

export function BlueprintCard({ name, winRate = 0, id, emoji: initialEmoji, onDelete }: BlueprintCardProps) {
  const navigate = useNavigate();
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji || "Smile");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleEmojiSelect = async (emojiLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmoji(emojiLabel);
    
    const { error } = await supabase
      .from("trading_blueprints")
      .update({ emoji: emojiLabel })
      .eq("id", id);

    if (error) {
      console.error("Error updating emoji:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase
      .from("trading_blueprints")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete blueprint"
      });
    } else {
      toast({
        title: "Success",
        description: "Blueprint deleted successfully"
      });
      if (onDelete) {
        onDelete();
      }
    }
    setShowDeleteDialog(false);
  };

  const selectedEmojiConfig = emojis.find(e => e.label === selectedEmoji);
  const EmojiIcon = selectedEmojiConfig?.icon || Smile;

  return (
    <>
      <Card 
        className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer relative group"
        onClick={() => navigate(`/blueprint/${id}`)}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 bg-red-400/80 hover:bg-red-400/90"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: selectedEmojiConfig?.color,
                    border: `1px solid ${selectedEmojiConfig?.color}`,
                  }}
                >
                  <EmojiIcon 
                    className="h-5 w-5" 
                    style={{ color: "#1A1F2C" }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm">
                {emojis.map(({ icon: Icon, label, color }) => (
                  <DropdownMenuItem
                    key={label}
                    onClick={(e) => handleEmojiSelect(label, e)}
                    className="cursor-pointer hover:bg-accent/10"
                  >
                    <Icon className="mr-2 h-4 w-4" style={{ color: "#1A1F2C" }} />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-end">
            <span className="text-sm text-muted-foreground">
              Win Rate: {winRate}%
            </span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blueprint
              "{name}" and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
