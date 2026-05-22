# Code Block Copy Button — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

## Overview

Add an always-visible copy button to every code block in the TipTap editor and viewer. Clicking it copies the raw code text to the clipboard and briefly shows a check icon as confirmation.

## Architecture

Three files change:

| File | Change |
|---|---|
| `src/components/extentions/code-block/CodeBlockComponent.tsx` | New file — React NodeView component |
| `src/components/extentions/code-block/index.ts` | Add `addNodeView()` using `ReactNodeViewRenderer` |
| `src/components/extentions/code-block/code-block.scss` | Add copy button styles |

## Component: `CodeBlockComponent`

A React functional component satisfying TipTap's `NodeViewProps` interface.

**Structure:**
```
NodeViewWrapper (as="div")
  └── div.code-block-wrapper   (position: relative)
        ├── button.copy-button  (absolute, top-right)
        │     └── Copy | Check icon (lucide-react)
        └── pre
              └── NodeViewContent (as="code")
```

**Copy logic:**
- `copied: boolean` state, default `false`
- On click: `navigator.clipboard.writeText(node.textContent)` → `setCopied(true)` → `setTimeout(2000)` → `setCopied(false)`
- `node.textContent` gives plain text without any HTML markup

**Icon:** `Copy` / `Check` from `lucide-react` (already used in `CodeBlockMenu.tsx`), size `h-4 w-4`.

## Extension Change (`index.ts`)

```ts
CodeBlockLowlight.extend({
  marks() { return "codeBlockBg"; },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
}).configure({ lowlight });
```

The lowlight syntax-highlighting decorations are applied at the ProseMirror level and are picked up by `NodeViewContent` automatically — no change needed there.

## Styles (`code-block.scss`)

Copy button is positioned `absolute` at `top: 0.5rem; right: 0.5rem`. Styled to fit the dark `pre` background:

- Background: semi-transparent dark (`rgba(255,255,255,0.1)`)
- Icon color: white
- Border: `1px solid rgba(255,255,255,0.2)`
- `border-radius: 0.375rem`
- `padding: 0.25rem`
- Hover: slightly brighter background
- Transition on background and opacity

## Behaviour

- Works in both **editor** and **viewer** modes (NodeView is registered on the extension, not gated by `isEditable`)
- Button is **always visible** (no hover-only hiding) so it works on mobile touch
- No external dependencies — uses `navigator.clipboard` (available in all modern browsers over HTTPS or localhost)

## Out of Scope

- Language label display inside the code block header
- Copy feedback toast/snackbar (icon swap is sufficient)
- Keyboard shortcut for copying
