
import { Bold, Italic, Underline, Strikethrough, Palette, Link2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface FormatToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onColorChange: () => void;
  onLink: () => void;
}

export const FormatToolbar = ({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onColorChange,
  onLink
}: FormatToolbarProps) => {
  return (
    <div className="flex items-center gap-1 mt-2 opacity-70 hover:opacity-100 transition-opacity duration-200">
      <Toggle size="sm" onClick={onBold} aria-label="Toggle bold" pressed={false}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={onItalic} aria-label="Toggle italic" pressed={false}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={onUnderline} aria-label="Toggle underline" pressed={false}>
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={onStrikethrough} aria-label="Toggle strikethrough" pressed={false}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={onColorChange} aria-label="Change text color" pressed={false}>
        <Palette className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={onLink} aria-label="Insert link" pressed={false}>
        <Link2 className="h-4 w-4" />
      </Toggle>
    </div>
  );
};
