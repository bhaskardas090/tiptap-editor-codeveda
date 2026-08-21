import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Download, Check, ImageOff } from "lucide-react";
import { downloadImage } from "./imageActions";
import { MIN_IMAGE_WIDTH_PERCENT } from "./constants";
import type { MediaStatus } from "../mediaStatus";

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
  const imgRef = useRef<HTMLImageElement>(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drives the skeleton placeholder. Starts pessimistic so a slow image shows
  // the skeleton rather than an empty gap.
  const [status, setStatus] = useState<MediaStatus>("loading");

  // Width while a drag is in flight. The node attribute is only written on
  // pointerup, so a whole drag collapses into a single undo step.
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const dragWidthRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // A cached image can finish loading before React attaches `onLoad`, which
  // would strand the skeleton on screen forever. `complete` is the browser's
  // own record of that, and `naturalWidth` separates a decoded image from one
  // that failed. Re-checked on every `src` change, which also resets the state
  // when an image is swapped out.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    } else {
      setStatus("loading");
    }
  }, [src]);

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

  // The wrapper is normally fit-content, which would collapse around a skeleton
  // that has no intrinsic size. A resized image already carries an explicit
  // width to fill; one at its natural size borrows the full column until its
  // real dimensions are known.
  const wrapperWidth = appliedWidth
    ? `${appliedWidth}%`
    : status === "loading"
    ? "100%"
    : undefined;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className="image-node-view"
      data-align={align || "left"}
      data-status={status}
      data-resizing={dragWidth != null ? "true" : undefined}
      style={wrapperWidth ? { width: wrapperWidth } : undefined}
      data-drag-handle
    >
      {status === "loading" && (
        <div
          className="tt-media-skeleton image-skeleton"
          aria-hidden="true"
          contentEditable={false}
        />
      )}

      {status === "error" && (
        <div className="image-error" contentEditable={false}>
          <ImageOff className="h-8 w-8" aria-hidden="true" />
          <p className="image-error-text">{alt || "Image not available"}</p>
        </div>
      )}

      {/* Kept mounted in every state: the stylesheet hides it with `display:
          none` while loading, which still lets the browser fetch it, so the
          request starts on first render rather than after the skeleton. */}
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        title={title || undefined}
        className={extension.options.HTMLAttributes?.class}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        // Fills the wrapper once the wrapper has an explicit width; otherwise
        // the wrapper is fit-content and the image keeps its natural size.
        style={appliedWidth ? { width: "100%" } : undefined}
      />

      {downloadable && status === "loaded" && (
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
