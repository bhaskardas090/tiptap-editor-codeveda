import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { getYouTubeEmbedUrl } from "./videoUtils";

interface VideoComponentProps {
  node: any;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ node }) => {
  const { src, type, title } = node.attrs;

  if (!src) {
    return (
      <NodeViewWrapper className="video-node-view">
        <div className="video-placeholder">
          <div className="video-placeholder-content">
            <div className="video-placeholder-icon">🎥</div>
            <p className="video-placeholder-text">Video not available</p>
          </div>
        </div>
      </NodeViewWrapper>
    );
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
            />
          </div>
          {title && (
            <div className="video-caption">
              <span className="video-caption-text">{title}</span>
            </div>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="video-node-view">
      <div className="video-container" contentEditable={false}>
        <video controls className="video-element" preload="metadata" poster="">
          <source src={src} type={type || "video/mp4"} />
          {title || "Your browser does not support the video tag."}
        </video>
        {title && (
          <div className="video-caption">
            <span className="video-caption-text">{title}</span>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default VideoComponent;
