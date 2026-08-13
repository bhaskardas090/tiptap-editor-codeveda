import { Extension } from "@tiptap/core";
import { Fragment, Slice } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * Container nodes that should not travel with a copy made from inside them.
 *
 * Selecting a sentence in a blockquote and copying it used to put the whole
 * blockquote on the clipboard: ProseMirror builds the copied slice with
 * `doc.slice(from, to, true)`, and that `true` (includeParents) walks all the
 * way up to the document, so every ancestor ends up in the slice and in its
 * `data-pm-slice` context. Pasting then rebuilds those ancestors.
 *
 * Mirrors SELECT_ALL_BOUNDARIES in ./selectAllWithin — the nodes that behave
 * like their own little document are the same ones whose wrapper should stay
 * behind when you copy out of them. Table cells are left out: tables have their
 * own clipboard handling (CellSelection) and copying cells as cells is correct.
 */
const CLIPBOARD_CONTAINERS = new Set([
  "blockquote",
  "accordion",
  "accordionItem",
  "tabs",
  "tabItem",
  "columnLayout",
  "column",
]);

const everyChildIsContainer = (fragment: Fragment): boolean => {
  if (fragment.childCount === 0) return false;
  for (let i = 0; i < fragment.childCount; i++) {
    if (!CLIPBOARD_CONTAINERS.has(fragment.child(i).type.name)) return false;
  }
  return true;
};

/**
 * Peels container nodes off a copied slice, leaving the content the user
 * actually selected.
 *
 * `openStart`/`openEnd` count the levels left open at each end of the slice.
 * Both being > 0 means the selection began *and* ended inside the outermost
 * nodes — the user selected content, not the container. A selection that takes
 * a container whole has a 0 on at least one end (a NodeSelection from the drag
 * handle is `0 / 0`, a drag across the node from outside resolves at document
 * depth), so copying or dragging a whole component is left alone.
 *
 * Unwrapping a level drops exactly one level of nesting from both ends, so both
 * counts come down by one and the slice stays consistent.
 */
export const stripContainersFromCopy = (slice: Slice): Slice => {
  let { content, openStart, openEnd } = slice;

  while (
    openStart > 0 &&
    openEnd > 0 &&
    everyChildIsContainer(content) &&
    // An empty container at either end has no level to give up.
    content.firstChild!.childCount > 0 &&
    content.lastChild!.childCount > 0
  ) {
    let unwrapped = Fragment.empty;
    content.forEach((child) => {
      unwrapped = unwrapped.append(child.content);
    });

    content = unwrapped;
    openStart -= 1;
    openEnd -= 1;
  }

  if (content === slice.content) return slice;

  return new Slice(content, openStart, openEnd);
};

/**
 * Keeps copy, cut and drag scoped to the selected content instead of the
 * component that happens to hold it.
 */
export const ScopedClipboard = Extension.create({
  name: "scopedClipboard",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("scopedClipboard"),
        props: {
          transformCopied: (slice) => stripContainersFromCopy(slice),
        },
      }),
    ];
  },
});
