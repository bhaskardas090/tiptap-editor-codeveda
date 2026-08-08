/**
 * Download action behind the image download button, kept free of React so it
 * can be exercised on its own.
 */

/**
 * Derives a download filename from a URL.
 *
 * Falls back to `image.png` for URLs whose path carries no usable name — blob
 * and data URLs, or a bare directory path.
 */
export function filenameFromUrl(url: string): string {
  const fallback = "image.png";
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return fallback;
  }

  try {
    // A relative src has no origin of its own, so borrow the document's.
    const base =
      typeof window !== "undefined" ? window.location.href : "http://localhost";
    const { pathname } = new URL(url, base);
    const name = pathname.split("/").filter(Boolean).pop();
    return name && /\.[a-z0-9]{2,5}$/i.test(name)
      ? decodeURIComponent(name)
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Saves the image to disk.
 *
 * Fetching to a blob first keeps a cross-origin `src` from being treated as a
 * navigation, which is what makes a plain `<a download>` open the image in a
 * tab instead of saving it. If the fetch is blocked we still hand the raw URL
 * to the anchor, which at worst degrades to that same tab.
 */
export async function downloadImage(src: string): Promise<void> {
  const filename = filenameFromUrl(src);
  let href = src;
  let objectUrl: string | null = null;

  try {
    const response = await fetch(src);
    if (response.ok) {
      objectUrl = URL.createObjectURL(await response.blob());
      href = objectUrl;
    }
  } catch {
    // CORS or a network failure — fall back to linking at the source URL.
  }

  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (objectUrl) {
    // Revoking immediately can race the download in Safari.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  }
}
