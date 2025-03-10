
import React from "react";
import { LinkPreview } from "../LinkPreview";

export const formatNotesWithLinkPreviews = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  
  // Split the text by URLs
  const parts = text.split(urlRegex);
  
  // Find all URLs in the text
  const urls = text.match(urlRegex) || [];
  
  // Create an array to hold the formatted content
  const formattedContent: React.ReactNode[] = [];
  
  // Process each part
  parts.forEach((part, index) => {
    // If this part is not empty, add it as text (with line breaks preserved)
    if (part) {
      const textWithBreaks = part.split('\n').map((line, i) => (
        <React.Fragment key={`text-${index}-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ));
      
      formattedContent.push(
        <span key={`text-part-${index}`}>{textWithBreaks}</span>
      );
    }
    
    // If there's a URL after this part, add the LinkPreview
    if (urls[index]) {
      formattedContent.push(
        <LinkPreview key={`link-${index}`} url={urls[index]} />
      );
    }
  });
  
  return formattedContent;
};
