
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, text?: string) => void;
  selectionText?: string;
}

export const LinkDialog = ({ isOpen, onClose, onSubmit, selectionText }: LinkDialogProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  // Reset states and update text when dialog opens or selection changes
  useEffect(() => {
    if (isOpen) {
      if (selectionText) {
        setText(selectionText);
      } else {
        setText("");
      }
      setUrl("");
    }
  }, [isOpen, selectionText]);

  const handleSubmit = () => {
    if (url.trim()) {
      onSubmit(url.trim(), text || undefined);
      setUrl("");
      setText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogDescription>
            {selectionText ? `Link text: "${selectionText}"` : "Enter URL to insert a link"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            autoFocus
          />
          {!selectionText && (
            <Input
              placeholder="Link text (optional)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Insert Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
