# Code Block Copy Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an always-visible copy button to every code block that copies the raw text to the clipboard and briefly shows a check icon as confirmation.

**Architecture:** Extend `CodeBlockLowlight` with a `ReactNodeViewRenderer` pointing to a new `CodeBlockComponent.tsx`. The NodeView renders a `position: relative` wrapper, an absolutely-positioned copy button, and the existing `<pre><code>` structure via `NodeViewContent`. Works in both editor and viewer because the NodeView is registered on the extension, not gated by `isEditable`.

**Tech Stack:** React 18, TipTap `@tiptap/react` (`ReactNodeViewRenderer`, `NodeViewWrapper`, `NodeViewContent`), lucide-react (`Copy`, `Check`), SCSS.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/extentions/code-block/CodeBlockComponent.tsx` | React NodeView — renders wrapper, copy button, pre/code |
| Modify | `src/components/extentions/code-block/index.ts` | Register NodeView on the extension |
| Modify | `src/components/extentions/code-block/code-block.scss` | Styles for wrapper and copy button |

---

### Task 1: Create `CodeBlockComponent.tsx`

**Files:**
- Create: `src/components/extentions/code-block/CodeBlockComponent.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { Copy, Check } from "lucide-react";

const CodeBlockComponent: React.FC<NodeViewProps> = ({ node }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <button
        type="button"
        className="copy-btn"
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extentions/code-block/CodeBlockComponent.tsx
git commit -m "feat: add CodeBlockComponent NodeView with copy button"
```

---

### Task 2: Register the NodeView in `index.ts`

**Files:**
- Modify: `src/components/extentions/code-block/index.ts`

Current file (for reference):
```ts
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
// ... language imports ...

export const CodeBlockExtension = CodeBlockLowlight.extend({
  marks() {
    return "codeBlockBg";
  },
}).configure({ lowlight });

export { CodeBlockBg } from "./code-block-bg";
```

- [ ] **Step 1: Add `ReactNodeViewRenderer` import and `addNodeView()`**

Replace the entire file with:

```ts
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import python3 from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cplusplus from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import CodeBlockComponent from "./CodeBlockComponent";

const lowlight = createLowlight(all);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("java", java);
lowlight.register("c", c);
lowlight.register("cpp", cplusplus);
lowlight.register("python", python3);
lowlight.register("sql", sql);

export const CodeBlockExtension = CodeBlockLowlight.extend({
  marks() {
    return "codeBlockBg";
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
}).configure({
  lowlight,
});

export { CodeBlockBg } from "./code-block-bg";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extentions/code-block/index.ts
git commit -m "feat: register CodeBlockComponent NodeView on CodeBlockExtension"
```

---

### Task 3: Style the copy button in `code-block.scss`

**Files:**
- Modify: `src/components/extentions/code-block/code-block.scss`

The `NodeViewWrapper` renders as a `div.code-block-wrapper`. We move the outer margin to this wrapper and reset it on `pre` (to prevent double spacing), then position the button absolutely inside.

- [ ] **Step 1: Add wrapper and button styles**

Inside the existing `.tiptap { ... }` block, add after the closing brace of the `pre { }` block:

```scss
  .code-block-wrapper {
    position: relative;
    display: block;
    margin: 1.5rem 0;

    /* Reset margin now that the wrapper owns it */
    pre {
      margin: 0;
    }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.375rem;
      color: #ffffff;
      cursor: pointer;
      transition: background 0.15s ease;
      line-height: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
```

The full final file should look like:

```scss
.tiptap {
  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
      white-space: pre;
      word-break: normal;
      word-wrap: normal;
    }

    /* Code block background color mark */
    code span[data-background-color] {
      padding: 2px 4px;
      border-radius: 3px;
      color: inherit;
    }

    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }

  .code-block-wrapper {
    position: relative;
    display: block;
    margin: 1.5rem 0;

    pre {
      margin: 0;
    }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.375rem;
      color: #ffffff;
      cursor: pointer;
      transition: background 0.15s ease;
      line-height: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extentions/code-block/code-block.scss
git commit -m "style: add copy button styles for code block NodeView"
```

---

### Task 4: Manual Verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify in editor mode**

Open the app. Insert a code block (type ` ``` ` or use the toolbar). Confirm:
- The copy button is visible in the top-right corner of the code block
- Clicking it copies the text (paste into a text field to verify)
- The icon changes from `Copy` to `Check` for ~2 seconds then reverts
- Syntax highlighting still works (type JavaScript, select `js` language)
- The `codeBlockBg` mark still works (select code text, apply a background colour via the toolbar)

- [ ] **Step 3: Verify in viewer mode**

Switch to viewer mode (or load `TiptapViewer` directly). Confirm:
- The copy button is present (NodeView is not gated by `isEditable`)
- Clicking copies correctly

- [ ] **Step 4: Verify mobile layout**

Resize the browser to < 768 px wide. Confirm:
- Long lines scroll horizontally inside `pre`
- The copy button does not overflow the code block
- The copy button is tappable (not obscured by other UI)

- [ ] **Step 5: Final commit (if any cleanup needed)**

```bash
git add -p
git commit -m "chore: cleanup after code block copy button verification"
```
