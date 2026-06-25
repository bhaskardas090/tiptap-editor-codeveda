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

export function buildSrcDoc(html: string, css: string, js: string): string {
  const safeJs = js.replace(/<\/script>/gi, "<\\/script>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; }
    body { padding: 12px; }
    ${css}
  </style>
</head>
<body>
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
  // Respond on demand: the parent requests the height after the iframe's
  // onLoad fires, which is race-proof even if the parent attached late.
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "live-preview-request-height") postHeight();
  });
})();<\/script>
</body>
</html>`;
}
