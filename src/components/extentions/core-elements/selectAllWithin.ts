/**
 * Scoped "select all" (Mod-a) for nodes that should behave like their own
 * little document: table cells, tab items, …
 *
 * Extensions that own such a node bind `Mod-a` to `selectAllWithin`. Every one
 * of them checks the same list of boundary types and picks the *innermost*
 * one around the cursor, so the result is the same no matter which extension's
 * keymap happens to run first — a table cell inside a tab selects the cell,
 * not the whole tab.
 */
export const SELECT_ALL_BOUNDARIES = [
  "tableCell",
  "tableHeader",
  "tabItem",
  "column",
  "accordionItem",
  "blockquote",
] as const;

/**
 * Selects the content of the innermost boundary node around the cursor.
 * Returns false when the cursor is outside all of them, which leaves the
 * editor's normal document-wide select-all in place.
 */
export const selectAllWithin = (editor: any): boolean => {
  const { state } = editor;
  const { $from } = state.selection;

  let depth = -1;
  for (let d = $from.depth; d > 0; d--) {
    if (SELECT_ALL_BOUNDARIES.includes($from.node(d).type.name)) {
      depth = d;
      break;
    }
  }
  if (depth === -1) return false;

  // First/last text positions inside the node. Its own boundaries are block
  // positions, which cannot hold a text selection.
  let from = -1;
  let to = -1;
  state.doc.nodesBetween(
    $from.start(depth),
    $from.end(depth),
    (child: any, pos: number) => {
      if (child.isTextblock) {
        if (from === -1) from = pos + 1;
        to = pos + child.nodeSize - 1;
      }
    }
  );
  if (from === -1) return false;

  return editor.commands.setTextSelection({ from, to });
};
