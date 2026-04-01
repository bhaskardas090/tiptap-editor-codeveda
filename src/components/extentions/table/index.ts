import { Table, TableView } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export const TableExtension = Table.configure({
  resizable: true,
});

/**
 * Viewer variant: explicitly adds the TableView NodeView so the
 * `.tableWrapper` div (needed for overflow-x scroll on mobile) is always
 * created even when the editor is non-editable.
 *
 * Background: the standard Table extension only registers TableView through
 * the `columnResizing` ProseMirror plugin, which is gated behind
 * `resizable && editor.isEditable`. Setting `editable: false` in the viewer
 * therefore skips the plugin entirely, leaving tables unwrapped and breaking
 * the horizontal-scroll CSS.
 */
export const ViewerTableExtension = Table.extend({
  addNodeView() {
    return ({ node }) => new TableView(node, this.options.cellMinWidth);
  },
}).configure({ resizable: false });

export { TableRow, TableHeader, TableCell };
