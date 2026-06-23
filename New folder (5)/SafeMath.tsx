import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import "katex/dist/katex.min.css";

const SafeMath: React.FC<{ children?: string }> = ({ children }) => {
  if (!children || typeof children !== "string") return null;

  // 1. Check if the string already has standard $ or $$ delimiters
  const hasDelimiters = /\$|\\\[|\\\(/.test(children);

  let processedContent = children;

  if (!hasDelimiters) {
    // 2. Check if the text contains a backslash (not newline)
    const containsBackslash = /\\[^n]/.test(children);

    // If it contains a backslash (latex-like), wrap it in math delimiters
    processedContent = containsBackslash ? `$${children}$` : children;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkBreaks]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Inline code
        code: ({ node, ...props }) => (
          <code
            {...props}
            className="whitespace-pre-wrap break-all bg-slate-100 px-1 rounded text-sm"
          />
        ),
        // Paragraphs — keep them inline-block so they flow naturally inside headings
        p: ({ node, ...props }) => (
          <span {...props} className="block" />
        ),
        // Strong/bold
        strong: ({ node, ...props }) => (
          <strong {...props} className="font-bold text-slate-900" />
        ),
        // Blockquote — useful for assertion-reason style
        blockquote: ({ node, ...props }) => (
          <blockquote
            {...props}
            className="border-l-4 border-indigo-300 pl-3 my-1 text-slate-600 italic"
          />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default SafeMath;
