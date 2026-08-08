import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Download, Check } from "lucide-react";
import { downloadImage } from "./imageActions";

/** How long the button shows its confirmation tick. */
const FEEDBACK_MS = 1500;

const ImageComponent: React.FC<NodeViewProps> = ({ node, extension }) => {
  const { src, alt, title, downloadable } = node.attrs;
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDownload = useCallback(
    async (event: React.MouseEvent) => {
      // The image is a selectable node; without this the click selects it and
      // the editor steals focus mid-download.
      event.preventDefault();
      event.stopPropagation();

      await downloadImage(src);

      setDone(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDone(false), FEEDBACK_MS);
    },
    [src]
  );

  return (
    <NodeViewWrapper className="image-node-view" data-drag-handle>
      <img
        src={src}
        alt={alt || ""}
        title={title || undefined}
        className={extension.options.HTMLAttributes?.class}
      />

      {downloadable && (
        <button
          type="button"
          className="image-download-btn"
          onClick={handleDownload}
          aria-label={done ? "Downloaded" : "Download image"}
          title={done ? "Downloaded" : "Download image"}
          contentEditable={false}
        >
          {done ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </NodeViewWrapper>
  );
};

export default ImageComponent;
