/**
 * Transactions behind a column's remove button.
 *
 * Kept apart from the node view so the position arithmetic can be exercised
 * without a DOM: ColumnComponent is a thin shell over these.
 *
 * Positions come in as arguments rather than being read from the selection. A
 * button is clicked with the cursor wherever the user last left it, so anything
 * that walks up from the selection would miss, or act on a different layout
 * than the one whose button was pressed.
 */

import type { Node as PMNode } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";

/** The slice of a Tiptap command's arguments these commands actually use. */
type ColumnCommandProps = {
  tr: Transaction;
  dispatch?: ((tr: Transaction) => void) | undefined;
};

/** Reads a column layout and the positions of its direct column children. */
const readLayout = (doc: PMNode, layoutPos: number) => {
  if (layoutPos < 0 || layoutPos >= doc.content.size) return null;

  const layout = doc.nodeAt(layoutPos);
  if (!layout || layout.type.name !== "columnLayout") return null;

  const positions: number[] = [];
  let offset = layoutPos + 1;
  layout.forEach((child: PMNode) => {
    positions.push(offset);
    offset += child.nodeSize;
  });

  return { layout, positions };
};

/**
 * Locates the layout that owns the column at `columnPos` (the position a node
 * view's `getPos()` reports), along with that column's index among its
 * siblings. Returns null for any position that is not a column in a layout.
 */
export const findColumnLayout = (
  doc: PMNode,
  columnPos: number
): { layoutPos: number; index: number; childCount: number } | null => {
  if (columnPos < 0 || columnPos >= doc.content.size) return null;

  const column = doc.nodeAt(columnPos);
  if (!column || column.type.name !== "column") return null;

  const $pos = doc.resolve(columnPos);
  if ($pos.depth < 1 || $pos.parent.type.name !== "columnLayout") return null;

  return {
    layoutPos: $pos.before($pos.depth),
    index: $pos.index(),
    childCount: $pos.parent.childCount,
  };
};

/**
 * Removes one column from the layout at `layoutPos`.
 *
 * Dropping the last column would leave the layout with no children, which its
 * `column+` content expression forbids, so that case removes the layout too.
 */
export const removeColumnAt =
  (layoutPos: number, index: number) =>
  ({ tr, dispatch }: ColumnCommandProps) => {
    const info = readLayout(tr.doc, layoutPos);
    if (!info) return false;

    const { layout, positions } = info;
    if (index < 0 || index >= layout.childCount) return false;

    const column = layout.child(index);
    if (!dispatch) return true;

    if (layout.childCount <= 1) {
      tr.delete(layoutPos, layoutPos + layout.nodeSize);
      return true;
    }

    tr.delete(positions[index], positions[index] + column.nodeSize);

    // `columns` drives grid-template-columns in CSS, so it has to follow the
    // real child count or the grid keeps a track for the column just removed.
    // Deleting inside the layout leaves `layoutPos` (which sits before it)
    // valid, so no mapping is needed.
    tr.setNodeMarkup(layoutPos, undefined, {
      ...layout.attrs,
      columns: layout.childCount - 1,
    });

    return true;
  };
