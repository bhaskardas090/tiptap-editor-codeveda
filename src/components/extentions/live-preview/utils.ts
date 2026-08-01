/** A new live preview starts empty — the author writes the whole markup. */
export const DEFAULT_HTML = "";

/**
 * Builds the document loaded into the preview iframe.
 *
 * `html` carries the full snippet, including any `<style>` / `<script>` the
 * author writes. `css` and `js` are only populated by documents saved before
 * the editor was reduced to a single field; they are still injected so that
 * older content keeps rendering.
 */
export function buildSrcDoc(
  html: string,
  css = "",
  js = "",
  darkMode = false
): string {
  const safeJs = (js || "").replace(/<\/script>/gi, "<\\/script>");
  const legacyJs = safeJs ? `<script>${safeJs}<\/script>` : "";
  // Baked into the initial markup so there is no light->dark flash on first
  // paint. Explicit "true"/"false" so content can branch deterministically
  // without falling back to a cookie it can't read. Live toggles then arrive
  // via the postMessage below.
  const darkAttr = ` data-darkmode="${darkMode ? "true" : "false"}"`;

  return `<!DOCTYPE html>
<html lang="en"${darkAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; }
    /* Making the body a containing block means absolutely positioned content
       counts towards the body's scroll height, which is what the frame is
       sized from. The padding box shares the border box's origin here, so
       nothing shifts. */
    body { padding: 12px; position: relative; }
    /* Dark-mode default surface so the area around the content isn't white.
       Declared before author CSS so the author can still override it. */
    html[data-darkmode="true"], body[data-darkmode="true"] {
      background-color: #13171f;
      color: #e5e7eb;
    }
    ${css || ""}
  </style>
</head>
<body${darkAttr}>
${html || ""}
${legacyJs}
<script>(function () {
  var lastPosted = -1;

  // Measure the body box only. documentElement is stretched to the iframe's
  // own height, so measuring it would ratchet: once an interaction grows the
  // frame the root never reports anything smaller, and the extra space stays
  // behind when the content shrinks back.
  function isOverflowing() {
    var doc = document.documentElement;
    return !!doc && doc.scrollHeight > doc.clientHeight + 1;
  }

  function contentHeight() {
    var body = document.body;
    if (!body) return 0;
    var margins = 0;
    if (window.getComputedStyle) {
      var s = window.getComputedStyle(body);
      margins = (parseFloat(s.marginTop) || 0) + (parseFloat(s.marginBottom) || 0);
    }
    // scrollHeight covers children that overflow the body box; the bounding
    // rect covers the box itself.
    var h =
      Math.max(body.scrollHeight, body.getBoundingClientRect().height) + margins;
    // Content anchored to the viewport rather than the body only shows up on
    // the root. Consult the root when — and only when — something really does
    // stick out past the frame, so its viewport-filling height can never drive
    // the measurement.
    if (isOverflowing()) {
      h = Math.max(h, document.documentElement.scrollHeight);
    }
    return Math.ceil(h);
  }

  function postHeight(force) {
    var h = contentHeight();
    // A 1px wobble is layout rounding, not a real change — ignoring it keeps
    // the frame from oscillating against its own resize.
    if (!force && Math.abs(h - lastPosted) <= 1) return;
    // Never shrink while content is still spilling out of the frame: that
    // would start a grow/shrink loop with anything the body cannot measure.
    if (!force && h < lastPosted && isOverflowing()) return;
    lastPosted = h;
    parent.postMessage({ type: "live-preview-height", height: h }, "*");
  }

  var scheduled = false;
  function schedulePost() {
    if (scheduled) return;
    scheduled = true;
    var run = function () {
      scheduled = false;
      postHeight(false);
    };
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(run);
    } else {
      setTimeout(run, 16);
    }
  }

  window.addEventListener("load", function () { postHeight(true); });
  window.addEventListener("resize", schedulePost);

  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(schedulePost);
    // The root is observed for width changes (the reported height comes from
    // the body, so this cannot feed back into itself).
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  }

  // Content that overflows the body box leaves the body's own size untouched,
  // so watch for DOM/style changes and for animations finishing as well.
  if (typeof MutationObserver !== "undefined" && document.body) {
    new MutationObserver(schedulePost).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }
  ["transitionend", "animationend", "animationcancel"].forEach(function (evt) {
    document.addEventListener(evt, schedulePost, true);
  });

  // The parent's message listener can attach late (SSR / hydration /
  // StrictMode double-mount), so a single post can be missed. Re-post a few
  // times so a late-attaching parent still receives the content height.
  [0, 50, 150, 300, 600, 1000].forEach(function (delay) {
    setTimeout(function () { postHeight(true); }, delay);
  });
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(function () { postHeight(true); });
  }
  // Re-report once web fonts settle, since they change content height.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { postHeight(true); }).catch(function () {});
  }
  function setDarkMode(on) {
    var el = document.documentElement;
    if (on) {
      el.setAttribute("data-darkmode", "true");
      if (document.body) document.body.setAttribute("data-darkmode", "true");
    } else {
      el.removeAttribute("data-darkmode");
      if (document.body) document.body.removeAttribute("data-darkmode");
    }
    postHeight(true);
  }
  // Respond on demand: the parent requests the height after the iframe's
  // onLoad fires (race-proof even if the parent attached late) and pushes the
  // current dark-mode state, since the iframe can't read the cookie itself.
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "live-preview-request-height") postHeight(true);
    // Accept both the documented { darkMode } shape and the internal { value }.
    if (d.type === "live-preview-darkmode" || "darkMode" in d) {
      setDarkMode(!!(d.darkMode !== undefined ? d.darkMode : d.value));
    }
  });
})();<\/script>
</body>
</html>`;
}
