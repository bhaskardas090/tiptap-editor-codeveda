/**
 * Load state of a media asset in a node view, shared by the image and video
 * extensions so both show the same skeleton placeholder and the same failure
 * treatment.
 *
 * `loading` is the initial state: the element is in the DOM and fetching, and
 * the skeleton stands in for it. `error` is terminal — the asset will not
 * arrive, so a placeholder takes its place rather than the skeleton animating
 * forever.
 */
export type MediaStatus = "loading" | "loaded" | "error";
