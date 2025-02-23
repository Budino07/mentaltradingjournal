
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

const COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#8E9196' },
  { name: 'Red', value: '#ea384c' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Blue', value: '#0EA5E9' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#22C55E' },
];

export const ColorPickerDialog = ({ isOpen, onClose, onColorSelect }: ColorPickerDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Text Color</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 py-4">
          {COLORS.map((color) => (
            <Button
              key={color.value}
              className={`h-12 w-full rounded-md border ${color.value === '#FFFFFF' ? 'border-gray-200' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => {
                onColorSelect(color.value);
                onClose();
              }}
              title={color.name}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
