
import { useState, useEffect } from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Type } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface FontSettings {
  fontFamily: string;
  fontSize: number;
}

const FONT_OPTIONS = [
  { name: "Archer", value: "'Archer', serif" },
  { name: "Gotham Rounded", value: "'Gotham Rounded', sans-serif" },
  { name: "Ideal Sans", value: "'Ideal Sans', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Roboto Slab", value: "'Roboto Slab', serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Verlag", value: "'Verlag', sans-serif" }
];

const FONT_SIZE_OPTIONS = [10, 11, 12, 13, 14];

interface FontSettingsPanelProps {
  settings: FontSettings;
  onSettingsChange: (settings: FontSettings) => void;
  isApplyingToSelection: boolean;
  onApplyToSelectionChange: (value: boolean) => void;
}

export const FontSettingsPanel = ({ 
  settings, 
  onSettingsChange,
  isApplyingToSelection,
  onApplyToSelectionChange
}: FontSettingsPanelProps) => {
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  
  useEffect(() => {
    onSettingsChange({ fontFamily, fontSize });
  }, [fontFamily, fontSize, onSettingsChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Font Settings">
          <Type className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Font Family</h4>
            <Select 
              value={fontFamily} 
              onValueChange={setFontFamily}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Font Size: {fontSize}px</h4>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                value={[fontSize]}
                min={10}
                max={14}
                step={1}
                onValueChange={(value) => setFontSize(value[0])}
                className="flex-1"
              />
              <div className="w-12 text-center">
                {fontSize}px
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="apply-to-selection"
              checked={isApplyingToSelection}
              onCheckedChange={onApplyToSelectionChange}
            />
            <Label htmlFor="apply-to-selection">Apply to selected text only</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
