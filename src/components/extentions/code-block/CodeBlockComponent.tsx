import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Copy, Check } from "lucide-react";

const CodeBlockComponent: React.FC<NodeViewProps> = ({ node }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Mirrors the class the extension writes to stored HTML, so the styling for a
  // given language is identical in the editor and in rendered content.
  const language = node.attrs.language || "plaintext";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(node.textContent)
      .then(() => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <button
        type="button"
        className="copy-btn"
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy code"}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre>
        <NodeViewContent<"code">
          as="code"
          className={`language-${language}`}
          style={{ whiteSpace: "pre", wordBreak: "normal", overflowWrap: "normal" }}
        />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
