import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import VideoComponent from "./VideoComponent";
import {
  getYouTubeEmbedUrl,
  normalizeVideoMimeType,
  normalizeVideoSrc,
} from "./videoUtils";

const YOUTUBE_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

export interface VideoOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /**
       * Add a video
       */
      setVideo: (options: {
        src: string;
        type?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: "max-w-full h-auto rounded-lg shadow-sm",
      },
    };
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("src") || element.getAttribute("data-src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }

          return {
            src: attributes.src,
          };
        },
      },
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute("type"),
        renderHTML: (attributes) => {
          if (!attributes.type) {
            return {};
          }

          return {
            type: attributes.type,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("title") || element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }

          return {
            title: attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-video='youtube']",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            src: el.getAttribute("data-src"),
            title: el.getAttribute("data-title"),
          };
        },
      },
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type, title } = HTMLAttributes;

    if (!src) {
      return [
        "video",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ];
    }

    const youtubeEmbedUrl = getYouTubeEmbedUrl(src);

    if (youtubeEmbedUrl) {
      return [
        "div",
        mergeAttributes(
          {
            class: "video-youtube-embed",
            "data-video": "youtube",
            "data-src": src,
          },
          title ? { "data-title": title } : {}
        ),
        [
          "iframe",
          {
            src: youtubeEmbedUrl,
            title: title || "YouTube video",
            frameborder: "0",
            allow: YOUTUBE_IFRAME_ALLOW,
            allowfullscreen: "true",
            loading: "lazy",
          },
        ],
      ];
    }

    const playableSrc = normalizeVideoSrc(src);
    const sourceType = normalizeVideoMimeType(type);

    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        src: playableSrc,
        controls: true,
        preload: "metadata",
      }),
      [
        "source",
        sourceType
          ? { src: playableSrc, type: sourceType }
          : { src: playableSrc },
      ],
      "Your browser does not support the video tag.",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
