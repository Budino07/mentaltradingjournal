
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NoteTagsProps {
  tags: string[];
  tagColors: Record<string, string>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onUpdateTagColor: (tag: string, color: string) => void;
}

const TAG_COLORS = {
  purple: "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-700/60 dark:hover:bg-purple-700/80 dark:text-purple-200",
  blue: "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-700/60 dark:hover:bg-blue-700/80 dark:text-blue-200",
  green: "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-700/60 dark:hover:bg-green-700/80 dark:text-green-200",
  yellow: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-600/60 dark:hover:bg-yellow-600/80 dark:text-yellow-200",
  red: "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-700/60 dark:hover:bg-red-700/80 dark:text-red-200",
  pink: "bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-700/60 dark:hover:bg-pink-700/80 dark:text-pink-200",
};

export const NoteTags = ({ 
  tags, 
  tagColors, 
  onAddTag, 
  onRemoveTag, 
  onUpdateTagColor 
}: NoteTagsProps) => {
  const [newTag, setNewTag] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  const getTagColorClass = (tag: string) => {
    return tagColors[tag] ? TAG_COLORS[tagColors[tag] as keyof typeof TAG_COLORS] : TAG_COLORS.purple;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center min-h-[32px] opacity-70 hover:opacity-100 transition-opacity duration-200 mb-0">
      {tags.map((tag) => (
        <div key={tag} className="group relative">
          <Badge 
            variant="secondary" 
            className={cn(
              "transition-colors duration-200 flex items-center gap-1 pr-1", 
              getTagColorClass(tag)
            )}
          >
            <span>{tag}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 p-0.5 rounded transition-all">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <DropdownMenuItem 
                  onClick={() => onRemoveTag(tag)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 focus:text-red-600 dark:focus:text-red-300 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(TAG_COLORS).map((color) => (
                        <button
                          key={color}
                          onClick={() => onUpdateTagColor(tag, color)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all transform hover:scale-110 shadow-sm",
                            color === 'purple' && "bg-purple-500 dark:bg-purple-400",
                            color === 'blue' && "bg-blue-500 dark:bg-blue-400",
                            color === 'green' && "bg-green-500 dark:bg-green-400",
                            color === 'yellow' && "bg-yellow-400 dark:bg-yellow-300",
                            color === 'red' && "bg-red-500 dark:bg-red-400",
                            color === 'pink' && "bg-pink-500 dark:bg-pink-400",
                            tagColors[tag] === color && "ring-2 ring-offset-2 ring-primary"
                          )}
                          aria-label={`Set tag color to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Badge>
        </div>
      ))}
      <div className="flex items-center gap-2 group">
        <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag..."
          className="border-none w-24 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 bg-transparent transition-colors duration-200 outline-none"
        />
      </div>
    </div>
  );
};
