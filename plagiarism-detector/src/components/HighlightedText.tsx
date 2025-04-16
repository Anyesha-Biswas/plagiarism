"use client";

import type React from "react";

interface HighlightedTextProps {
  text: string;
}

export function HighlightedText({ text }: HighlightedTextProps) {
  // Parse the text with HTML tags into React elements
  const createMarkup = () => {
    const elements: React.ReactNode[] = [];
    let buffer = "";
    let insideTag = false;
    let tagContent = "";

    // Very simple HTML parser that only handles <mark> tags
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === "<") {
        if (buffer) {
          elements.push(buffer);
          buffer = "";
        }
        insideTag = true;
        tagContent = "<";
      } else if (char === ">" && insideTag) {
        tagContent += ">";
        insideTag = false;

        if (tagContent === "<mark>") {
          // Start of highlighted section
          const highlightedContent = extractContentUntilClosingTag(text.substring(i + 1));
          if (highlightedContent) {
            elements.push(<mark key={i} className="bg-yellow-200">{highlightedContent.content}</mark>);
            i += highlightedContent.length + "</mark>".length;
          }
        } else {
          // Unrecognized tag, treat it as text
          buffer += tagContent;
        }
      } else if (insideTag) {
        tagContent += char;
      } else {
        buffer += char;
      }
    }

    if (buffer) {
      elements.push(buffer);
    }

    return elements;
  };

  // Helper function to extract content between opening and closing tags
  const extractContentUntilClosingTag = (textSubstring: string) => {
    const closingTagIndex = textSubstring.indexOf("</mark>");
    if (closingTagIndex === -1) return null;

    return {
      content: textSubstring.substring(0, closingTagIndex),
      length: closingTagIndex
    };
  };

  return (
    <div className="p-3 bg-gray-50 rounded text-base leading-relaxed">
      {createMarkup()}
    </div>
  );
}
