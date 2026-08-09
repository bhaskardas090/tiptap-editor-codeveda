import { useCallback, useEffect, useRef } from "react";

/** Media node types whose files live on the host's storage. */
type MediaKind = "image" | "video";

const NODE_TYPE: Record<MediaKind, string> = {
  image: "image",
  video: "video",
};

/**
 * Collects the `src` of every node of the given type in a ProseMirror JSON doc.
 *
 * A Set, so a URL used by two nodes counts once — deleting one copy must not
 * take the file out from under the other.
 */
export function collectMediaUrls(json: any, kind: MediaKind): Set<string> {
  const urls = new Set<string>();
  const wanted = NODE_TYPE[kind];

  const traverse = (node: any) => {
    if (node?.type === wanted && node.attrs?.src) {
      urls.add(node.attrs.src);
    }
    if (node?.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(json);
  return urls;
}

export interface DeferredMediaCleanupOptions {
  onImageDelete?: (url: string) => Promise<void>;
  onVideoDelete?: (url: string) => Promise<void>;
  /** Grace period, in ms, before a removed file is actually deleted. */
  delay: number;
}

/**
 * Deletes the files behind removed images and videos, but not straight away.
 *
 * Deleting on the edit itself makes undo destructive: the node comes back into
 * the document while the file is already gone from storage, leaving a permanent
 * broken image that nothing re-uploads. Instead each removal is held for a
 * grace period, and a URL that reappears — because the author hit undo, or
 * pasted the node back — cancels its own pending deletion.
 *
 * Anything still pending when the editor unmounts is flushed, so navigating
 * away does not leak orphaned files.
 */
export function useDeferredMediaCleanup({
  onImageDelete,
  onVideoDelete,
  delay,
}: DeferredMediaCleanupOptions) {
  const pending = useRef(
    new Map<string, { kind: MediaKind; timer: ReturnType<typeof setTimeout> }>()
  );

  // The timers outlive the render that scheduled them, so the handlers are
  // read from refs rather than captured.
  const handlers = useRef({ onImageDelete, onVideoDelete });
  useEffect(() => {
    handlers.current = { onImageDelete, onVideoDelete };
  }, [onImageDelete, onVideoDelete]);

  const runDelete = useCallback((url: string, kind: MediaKind) => {
    pending.current.delete(url);

    const handler =
      kind === "image"
        ? handlers.current.onImageDelete
        : handlers.current.onVideoDelete;
    if (!handler) return;

    handler(url).catch((error) => {
      console.error(`Failed to delete ${kind}:`, error);
    });
  }, []);

  /**
   * Compares two document states and schedules or cancels deletions.
   *
   * Safe to call on every update; a URL already awaiting deletion is not
   * rescheduled, so its grace period runs from when it first disappeared.
   */
  const reconcile = useCallback(
    (previousJson: any, currentJson: any) => {
      if (!previousJson) return;

      const currentImages = collectMediaUrls(currentJson, "image");
      const currentVideos = collectMediaUrls(currentJson, "video");

      // A URL that is back in the document cancels its own deletion.
      for (const [url, entry] of pending.current) {
        if (currentImages.has(url) || currentVideos.has(url)) {
          clearTimeout(entry.timer);
          pending.current.delete(url);
        }
      }

      const schedule = (url: string, kind: MediaKind) => {
        if (pending.current.has(url)) return;
        pending.current.set(url, {
          kind,
          timer: setTimeout(() => runDelete(url, kind), delay),
        });
      };

      for (const url of collectMediaUrls(previousJson, "image")) {
        if (!currentImages.has(url)) schedule(url, "image");
      }
      for (const url of collectMediaUrls(previousJson, "video")) {
        if (!currentVideos.has(url)) schedule(url, "video");
      }
    },
    [delay, runDelete]
  );

  // Flush on unmount rather than dropping the timers: a file removed moments
  // before navigating away should still be cleaned up.
  useEffect(() => {
    const map = pending.current;
    return () => {
      for (const [url, entry] of map) {
        clearTimeout(entry.timer);
        runDelete(url, entry.kind);
      }
      map.clear();
    };
  }, [runDelete]);

  return { reconcile };
}
