import { TiptapViewer } from ".";
import TiptapEditor from "./tiptap-editor";
import { useState } from "react";

function App() {
  const [content, setEditorContent] = useState({
    html: `<p>In the <strong>DOM (Document Object Model)</strong>, when an event occurs on an element, it <strong>travels through the DOM</strong> in a specific order. This is known as <strong>event propagation. I</strong>t travels through the DOM in <strong>phases</strong>.</p><h3>✅ Three Event Phases</h3><p>1️⃣ <strong>Capturing Phase (Event goes DOWN the tree)</strong></p><p>→ From <code>window</code> → <code>document</code> → <code>&lt;html&gt;</code> → <code>&lt;body&gt;</code> → parent elements → target</p><p>2️⃣ <strong>Target Phase</strong></p><p>→ Event reaches the actual clicked element</p><p>3️⃣ <strong>Bubbling Phase (Event goes UP the tree)</strong></p><p>→ From target element → parent → <code>&lt;body&gt;</code> → <code>&lt;html&gt;</code> → <code>document</code></p><hr><h3>🔽 Event Capturing (Trickling Phase)</h3><ul><li><p>Event is handled <strong>from outermost to innermost</strong></p></li><li><p>Rarely used but available</p></li></ul><h4>How to enable capturing:</h4><pre><code class="language-jsx">element.addEventListener('click', handler, true);</code></pre><p>✅ The <code>true</code> makes the listener run <strong>during capturing phase</strong></p><hr><p>🔼 Event Bubbling (Default Behavior)</p><ul><li><p>Event is handled <strong>from innermost to outermost</strong></p></li><li><p><strong>Default phase</strong> in JavaScript</p></li></ul><h4>Bubbling example:</h4><pre><code class="language-html">&lt;div id="parent"&gt;
  &lt;button id="child"&gt;Click Me&lt;/button&gt;
&lt;/div&gt;

&lt;script&gt;
  document.getElementById('parent').addEventListener('click', () =&gt; {
    console.log('Parent clicked');
  });

  document.getElementById('child').addEventListener('click', () =&gt; {
    console.log('Child clicked');
  });
&lt;/script&gt;</code></pre><div data-title="Output" data-open="false" data-type="accordion"><div data-type="accordion-item"><pre><code>Child clicked
Parent clicked</code></pre></div></div><hr><h3>✋ Stopping the Event Flow</h3><h4><code>stopPropagation()</code></h4><p>Stops event from continuing to bubble or capture.</p><pre><code class="language-jsx">&lt;div id="parent"&gt;
    Parent Div
    &lt;button id="child"&gt;Click Child Button&lt;/button&gt;
&lt;/div&gt;

&lt;script&gt;
  const parent = document.getElementById('parent');
  const child = document.getElementById('child');

  parent.addEventListener('click', () =&gt; {
    console.log('Parent clicked');
  });

  child.addEventListener('click', (e) =&gt; {
    e.stopPropagation(); // ✅ prevents bubbling to parent
    console.log('Child clicked');
  });
&lt;/script&gt;</code></pre><div data-title="Output" data-open="false" data-type="accordion"><div data-type="accordion-item"><pre><code>Child clicked</code></pre></div></div><p>✅ Parent does NOT log</p><p>✅ Because <code>stopPropagation()</code> stops the event from bubbling up</p><div data-title="Output" data-open="false" data-type="accordion"><div data-type="accordion-item"><pre><code>Parent clicked</code></pre></div></div><p>✅ Works normally</p><p>✅ Because no child event was triggered</p><hr><h4><code>stopImmediatePropagation()</code></h4><ul><li><p><strong>Stops bubbling/capturing</strong>, just like <code>stopPropagation()</code></p></li><li><p><strong>AND stops other event listeners on the SAME element</strong> from running</p></li></ul><pre><code class="language-jsx">button.addEventListener('click', () =&gt; {
  console.log('Listener 1');
});

button.addEventListener('click', (e) =&gt; {
  e.stopImmediatePropagation();
  console.log('Listener 2');
});

button.addEventListener('click', () =&gt; {
  console.log('Listener 3');
});

// Output : Listener 2</code></pre><h3>Why?</h3><ul><li><p><code>Listener 2</code> runs first</p></li><li><p>It calls <code>stopImmediatePropagation()</code></p></li><li><p>So:</p><p>❌ No more listeners on <strong>button</strong></p><p>❌ Event does NOT bubble up</p><p>✅ Only <code>Listener 2</code> executes</p></li></ul><table style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p></p></th></tr><tr><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td></tr><tr><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table><hr><h3>🆚 Quick difference</h3><table style="min-width: 476px;"><colgroup><col style="width: 260px;"><col style="width: 191px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="260"><p>Method</p></th><th colspan="1" rowspan="1" colwidth="191"><p>Stops bubbling?</p></th><th colspan="1" rowspan="1"><p>Stops other listeners on same element?</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="260"><p><code>stopPropagation()</code></p></td><td colspan="1" rowspan="1" colwidth="191"><p>✅ Yes</p></td><td colspan="1" rowspan="1"><p>❌ No</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="260"><p><code>stopImmediatePropagation()</code></p></td><td colspan="1" rowspan="1" colwidth="191"><p>✅ Yes</p></td><td colspan="1" rowspan="1"><p>✅ Yes</p></td></tr></tbody></table><hr><h4>🔍 Quick Comparison</h4><table style="min-width: 204px;"><colgroup><col style="width: 154px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="154"><p>Feature</p></th><th colspan="1" rowspan="1"><p>Capturing</p></th><th colspan="1" rowspan="1"><p>Bubbling</p></th></tr><tr><td colspan="1" rowspan="1" colwidth="154"><p>Direction</p></td><td colspan="1" rowspan="1"><p>Top → Target</p></td><td colspan="1" rowspan="1"><p>Target → Top</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="154"><p>Default?</p></td><td colspan="1" rowspan="1"><p>❌ No</p></td><td colspan="1" rowspan="1"><p>✅ Yes</p></td></tr><tr><td colspan="1" rowspan="1" colwidth="154"><p>Enable using</p></td><td colspan="1" rowspan="1"><p><code>addEventListener(..., true)</code></p></td><td colspan="1" rowspan="1"><p><code>addEventListener(..., false)</code></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="154"><p>Common usage</p></td><td colspan="1" rowspan="1"><p>Rare</p></td><td colspan="1" rowspan="1"><p>Very common (delegation)</p></td></tr></tbody></table><p></p>`,
    json: null,
  });

  return (
    <>
      <TiptapEditor
        setEditorContent={setEditorContent}
        content="<p>Hello World</p>"
      />
      <TiptapViewer editorContent={content.html} />
    </>
  );
}

export default App;
