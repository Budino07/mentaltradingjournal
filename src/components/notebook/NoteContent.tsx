import { useEffect, useRef, forwardRef } from "react";
import { FontSettings } from "@/hooks/useFontSettings";

interface NoteContentProps {
  content: string;
  onContentChange: (newContent: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  fontSettings: FontSettings;
  isApplyingFontToSelection: boolean;
}

export const NoteContent = ({ 
  content, 
  onContentChange, 
  editorRef, 
  fontSettings,
  isApplyingFontToSelection
}: NoteContentProps) => {
  const localEditorRef = useRef<HTMLDivElement>(null);
  
  // Use provided ref or local ref
  const finalEditorRef = editorRef || localEditorRef;

  const makeLinksClickable = () => {
    const editor = finalEditorRef.current;
    if (!editor) return;

    // Find all links and ensure they have the correct attributes
    const links = editor.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.classList.add('text-primary', 'hover:text-primary-dark', 'underline');
    });

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
        // Only process nodes that aren't already inside a link
        if (node.parentElement?.tagName !== 'A') {
          nodesToReplace.push({ node, urls: matches });
        }
      }
    }

    // Replace text nodes with linked versions
    nodesToReplace.forEach(({ node, urls }) => {
      if (!node.textContent) return;
      
      let html = node.textContent;
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

  // Apply custom link styling to ensure visual consistency
  const applyLinkStyling = (editor: HTMLElement) => {
    const links = editor.querySelectorAll('a');
    links.forEach(link => {
      link.classList.add('text-primary', 'hover:text-primary-dark', 'underline');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  };

  useEffect(() => {
    const editor = finalEditorRef.current;
    if (!editor) return;

    // Only set the innerHTML if the content has changed and the editor isn't focused
    if (!editor.isEqualNode(document.activeElement)) {
      editor.innerHTML = content;
      makeLinksClickable();
      applyLinkStyling(editor);
    }
  }, [content, finalEditorRef]);

  useEffect(() => {
    const editor = finalEditorRef.current;
    if (!editor) return;

    const handleInput = () => {
      onContentChange(editor.innerHTML);
      makeLinksClickable();
    };

    editor.addEventListener('input', handleInput);
    return () => editor.removeEventListener('input', handleInput);
  }, [onContentChange, finalEditorRef]);

  // Apply link styling when contentEditable changes
  useEffect(() => {
    const editor = finalEditorRef.current;
    if (!editor) return;

    const handleContentChange = () => {
      applyLinkStyling(editor);
    };

    const observer = new MutationObserver(handleContentChange);
    observer.observe(editor, { subtree: true, childList: true });

    return () => observer.disconnect();
  }, [finalEditorRef]);

  // Apply font formatting to the entire document
  const applyFontFormatting = () => {
    if (isApplyingFontToSelection) {
      // Don't apply global styling when we're in selection mode
      return {};
    }
    
    // Only apply global font settings when not in selection mode
    return {
      fontFamily: fontSettings.fontFamily,
      fontSize: `${fontSettings.fontSize}px`,
    };
  };

  // We're removing the automatic application on selection and only exposing this method
  // to be called explicitly from the font settings panel
  const handleSelectionFormat = () => {
    // This function is now only called explicitly from the font panel
    // and not on mouse up or key up events
  };

  // Handle paste to ensure links are clickable immediately
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    makeLinksClickable();
  };

  // Prevent default handling of clicking links inside contentEditable
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      window.open(target.getAttribute('href'), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      ref={finalEditorRef}
      contentEditable
      className="min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] overflow-y-auto focus:outline-none focus-visible:outline-none text-lg leading-relaxed transition-colors duration-200 prose prose-sm max-w-none dark:prose-invert"
      role="textbox"
      aria-multiline="true"
      onPaste={handlePaste}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          document.execCommand('insertLineBreak');
          e.preventDefault();
        }
      }}
      style={applyFontFormatting()}
    />
  );
};
