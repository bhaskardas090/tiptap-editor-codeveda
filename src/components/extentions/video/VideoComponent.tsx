import React, { useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { getYouTubeEmbedUrl, normalizeVideoSrc } from "./videoUtils";
import type { MediaStatus } from "../mediaStatus";

/** Shown when there is no source, or when the one there is cannot be played. */
const VideoUnavailable: React.FC = () => (
  <NodeViewWrapper className="video-node-view">
    <div className="video-placeholder">
      <div className="video-placeholder-content">
        <div className="video-placeholder-icon">🎥</div>
        <p className="video-placeholder-text">Video not available</p>
      </div>
    </div>
  </NodeViewWrapper>
);

const VideoSkeleton: React.FC = () => (
  <div className="tt-media-skeleton video-skeleton" aria-hidden="true" />
);

const VideoComponent: React.FC<NodeViewProps> = ({ node }) => {
  const { src, title } = node.attrs;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<MediaStatus>("loading");

  // A cached video can reach HAVE_METADATA before React attaches the handler
  // below, which would leave the skeleton running over a ready player. The
  // element's own `readyState` is the reliable record of that. Keyed on `src`
  // so replacing the source shows the skeleton again.
  useEffect(() => {
    const element = videoRef.current;
    if (element && element.readyState >= 1 /* HAVE_METADATA */) {
      setStatus("loaded");
    } else {
      setStatus("loading");
    }
  }, [src]);

  if (!src) {
    return <VideoUnavailable />;
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);

  if (youtubeEmbedUrl) {
    return (
      <NodeViewWrapper className="video-node-view">
        <div className="video-container video-youtube" contentEditable={false}>
          <div className="video-youtube-frame">
            <iframe
              src={youtubeEmbedUrl}
              title={title || "YouTube video"}
              className="video-youtube-iframe"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              onLoad={() => setStatus("loaded")}
            />
            {/* After the iframe in the DOM so it paints on top of it. A
                cross-origin frame gives us no error signal, only `onLoad`. */}
            {status === "loading" && <VideoSkeleton />}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // A source the browser refused is terminal — swapping in the placeholder
  // beats a skeleton that would animate forever.
  if (status === "error") {
    return <VideoUnavailable />;
  }

  // `src` goes on the element rather than a <source> child: a child would be
  // filtered by its `type` before the browser ever fetches it, and its absence
  // would also trip the `video:not([src])` placeholder styling.
  return (
    <NodeViewWrapper className="video-node-view">
      <div
        className="video-container"
        data-status={status}
        contentEditable={false}
      >
        <video
          ref={videoRef}
          controls
          className="video-element"
          preload="metadata"
          src={normalizeVideoSrc(src)}
          title={title || undefined}
          // Metadata is the first point the player knows its own dimensions,
          // so it is also the first point the skeleton can step aside without
          // the frame resizing underneath it.
          onLoadedMetadata={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        >
          Your browser does not support the video tag.
        </video>
        {status === "loading" && <VideoSkeleton />}
      </div>
    </NodeViewWrapper>
  );
};

export default VideoComponent;
