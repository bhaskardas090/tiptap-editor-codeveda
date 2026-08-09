import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Download, Check } from "lucide-react";
import { downloadImage } from "./imageActions";
import { MIN_IMAGE_WIDTH_PERCENT } from "./constants";

/** How long the download button shows its confirmation tick. */
const FEEDBACK_MS = 1500;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ImageComponent: React.FC<NodeViewProps> = ({
  node,
  extension,
  editor,
  updateAttributes,
}) => {
  const { src, alt, title, downloadable, width, align } = node.attrs;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Width while a drag is in flight. The node attribute is only written on
  // pointerup, so a whole drag collapses into a single undo step.
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const dragWidthRef = useRef<number | null>(null);

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

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Without this the browser starts a native image drag — the wrapper
      // carries `data-drag-handle` — and the resize never happens.
      event.preventDefault();
      event.stopPropagation();

      const wrapper = wrapperRef.current;
      const column = wrapper?.parentElement;
      if (!wrapper || !column) return;

      const columnWidth = column.clientWidth;
      if (!columnWidth) return;

      const startX = event.clientX;
      const startWidth = wrapper.getBoundingClientRect().width;
      const handle = event.currentTarget;
      // Capture keeps the drag alive when the pointer outruns the handle.
      // It throws if the pointer is already gone, which must not abort the drag.
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        /* not fatal — the listeners below still track the pointer */
      }

      const onMove = (moveEvent: PointerEvent) => {
        const nextPx = startWidth + (moveEvent.clientX - startX);
        const next = clamp(
          (nextPx / columnWidth) * 100,
          MIN_IMAGE_WIDTH_PERCENT,
          100
        );
        dragWidthRef.current = next;
        setDragWidth(next);
      };

      const onEnd = () => {
        try {
          handle.releasePointerCapture(event.pointerId);
        } catch {
          /* capture was never taken */
        }
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onEnd);
        handle.removeEventListener("pointercancel", onEnd);

        const finalWidth = dragWidthRef.current;
        dragWidthRef.current = null;
        setDragWidth(null);
        if (finalWidth != null) {
          updateAttributes({ width: Math.round(finalWidth * 10) / 10 });
        }
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onEnd);
      handle.addEventListener("pointercancel", onEnd);
    },
    [updateAttributes]
  );

  const appliedWidth = dragWidth ?? width;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className="image-node-view"
      data-align={align || "left"}
      data-resizing={dragWidth != null ? "true" : undefined}
      style={appliedWidth ? { width: `${appliedWidth}%` } : undefined}
      data-drag-handle
    >
      <img
        src={src}
        alt={alt || ""}
        title={title || undefined}
        className={extension.options.HTMLAttributes?.class}
        // Fills the wrapper once the wrapper has an explicit width; otherwise
        // the wrapper is fit-content and the image keeps its natural size.
        style={appliedWidth ? { width: "100%" } : undefined}
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

      {editor.isEditable && (
        <div
          className="image-resize-handle"
          onPointerDown={startResize}
          role="separator"
          aria-label="Resize image"
          contentEditable={false}
        />
      )}
    </NodeViewWrapper>
  );
};

export default ImageComponent;
