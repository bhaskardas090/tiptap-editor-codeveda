export const DEFAULT_HTML = `<div class="demo">
  <h1>Hello World</h1>
  <p>Edit the HTML, CSS, and JS to see live output.</p>
</div>`;

export const DEFAULT_CSS = `.demo {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.demo h1 {
  color: #2563eb;
  margin: 0 0 8px;
}

.demo p {
  color: #4b5563;
  margin: 0;
}`;

export const DEFAULT_JS = `document.querySelector('.demo h1')?.addEventListener('click', () => {
  alert('Hello from live preview!');
});`;

export function buildSrcDoc(
  html: string,
  css: string,
  js: string,
  darkMode = false
): string {
  const safeJs = js.replace(/<\/script>/gi, "<\\/script>");
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
    body { padding: 12px; }
    /* Dark-mode default surface so the area around the content isn't white.
       Declared before author CSS so the author can still override it. */
    html[data-darkmode="true"], body[data-darkmode="true"] {
      background-color: #13171f;
      color: #e5e7eb;
    }
    ${css}
  </style>
</head>
<body${darkAttr}>
${html}
<script>${safeJs}<\/script>
<script>(function () {
  function postHeight() {
    var h = Math.max(
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0,
      document.body ? document.body.offsetHeight : 0
    );
    parent.postMessage({ type: "live-preview-height", height: h }, "*");
  }
  window.addEventListener("load", postHeight);
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(postHeight);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  }
  // The parent's message listener can attach late (SSR / hydration /
  // StrictMode double-mount), so a single post can be missed. Re-post a few
  // times so a late-attaching parent still receives the content height.
  [0, 50, 150, 300, 600, 1000].forEach(function (delay) {
    setTimeout(postHeight, delay);
  });
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(postHeight);
  }
  // Re-report once web fonts settle, since they change content height.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(postHeight).catch(function () {});
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
    postHeight();
  }
  // Respond on demand: the parent requests the height after the iframe's
  // onLoad fires (race-proof even if the parent attached late) and pushes the
  // current dark-mode state, since the iframe can't read the cookie itself.
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "live-preview-request-height") postHeight();
    // Accept both the documented { darkMode } shape and the internal { value }.
    if (d.type === "live-preview-darkmode" || "darkMode" in d) {
      setDarkMode(!!(d.darkMode !== undefined ? d.darkMode : d.value));
    }
  });
})();<\/script>
</body>
</html>`;
}
