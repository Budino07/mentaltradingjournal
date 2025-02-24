
import { useEffect, useRef } from "react";

interface NoteContentProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

export const NoteContent = ({ content, onContentChange }: NoteContentProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const makeLinksClickable = () => {
    const editor = editorRef.current;
    if (!editor) return;

    // Find text nodes containing URLs
    const walk = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: { node: Text; urls: string[] }[] = [];
    let node: Text;

    // Find all text nodes with URLs
    while ((node = walk.nextNode() as Text)) {
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      const matches = node.textContent?.match(urlRegex);
      
      if (matches) {
        nodesToReplace.push({ node, urls: matches });
      }
    }

    // Replace text nodes with linked versions
    nodesToReplace.forEach(({ node, urls }) => {
      let html = node.textContent || "";
      urls.forEach(url => {
        html = html.replace(
          url,
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-dark underline">${url}</a>`
        );
      });
      
      const temp = document.createElement("div");
      temp.innerHTML = html;
      
      while (temp.firstChild) {
        node.parentNode?.insertBefore(temp.firstChild, node);
      }
      node.parentNode?.removeChild(node);
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Only set the innerHTML if the content has changed and the editor isn't focused
    if (!editor.isEqualNode(document.activeElement)) {
      editor.innerHTML = content;
      makeLinksClickable();
    }
  }, [content]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleInput = () => {
      onContentChange(editor.innerHTML);
      makeLinksClickable();
    };

    editor.addEventListener('input', handleInput);
    return () => editor.removeEventListener('input', handleInput);
  }, [onContentChange]);

  // Handle paste to ensure links are clickable immediately
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    makeLinksClickable();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      className="min-h-[calc(100vh-300px)] focus:outline-none focus-visible:outline-none text-lg leading-relaxed transition-colors duration-200 prose prose-sm max-w-none dark:prose-invert"
      role="textbox"
      aria-multiline="true"
      onPaste={handlePaste}
    />
  );
};
