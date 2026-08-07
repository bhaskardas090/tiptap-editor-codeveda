/**
 * Extracts the 11-character video id from a YouTube URL and returns a
 * privacy-friendly embed URL, or `null` if the URL is not a YouTube link.
 *
 * Supports watch, share (youtu.be), embed, shorts and live URL shapes.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
    /youtube\.com\/embed\/([\w-]{11})/i,
    /youtube\.com\/shorts\/([\w-]{11})/i,
    /youtube\.com\/live\/([\w-]{11})/i,
    /youtube-nocookie\.com\/embed\/([\w-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

/** Whether the given URL points at a YouTube video. */
export function isYouTubeUrl(url: string): boolean {
  return getYouTubeEmbedUrl(url) !== null;
}

/**
 * MIME types browsers accept as a `<source type>` hint. Anything else — most
 * notably `video/quicktime`, which is what a `.mov` upload reports as its
 * `File.type` — makes the browser reject the source outright without ever
 * fetching it, even when the file itself is H.264 it could decode fine.
 */
const PLAYABLE_SOURCE_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

/**
 * Returns `type` only when it is a safe hint to hand the browser, otherwise
 * `undefined` so the caller omits the attribute and lets the browser sniff the
 * container. The attribute is purely an optimisation: dropping it costs a
 * request that would have been skipped, keeping a bad one costs playback.
 */
export function normalizeVideoMimeType(
  type?: string | null
): string | undefined {
  if (!type) return undefined;

  const base = type.split(";")[0].trim().toLowerCase();
  return PLAYABLE_SOURCE_TYPES.has(base) ? type : undefined;
}

/**
 * QuickTime MIME types that describe an ISO base media container — the exact
 * same box layout as MP4, so a browser that refuses `video/quicktime` decodes
 * the identical bytes happily when they are labelled `video/mp4`.
 */
const QUICKTIME_MIME_TYPES = ["video/quicktime", "video/x-quicktime", "video/x-m4v"];

/**
 * Relabels a base64 `data:` video URL that declares a QuickTime MIME type.
 *
 * A remote `.mov` still plays because the browser sniffs the container and
 * ignores the server's `Content-Type`, but a `data:` URL carries its MIME
 * inline and that value is authoritative — Chrome rejects the whole URL with
 * `MEDIA_ELEMENT_ERROR: Unable to load URL due to content type` before it ever
 * looks at the bytes. This is the path `.mov` uploads take whenever no
 * `onVideoUpload` handler is supplied and the file is inlined by `FileReader`.
 *
 * Non-data URLs and every other MIME type are returned untouched.
 */
export function normalizeVideoSrc(src?: string | null): string {
  if (!src || !src.startsWith("data:")) return src || "";

  for (const mime of QUICKTIME_MIME_TYPES) {
    if (src.toLowerCase().startsWith(`data:${mime}`)) {
      return `data:video/mp4${src.slice(`data:${mime}`.length)}`;
    }
  }

  return src;
}
