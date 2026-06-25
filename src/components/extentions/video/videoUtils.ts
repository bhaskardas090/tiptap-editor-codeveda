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
