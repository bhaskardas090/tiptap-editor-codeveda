import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { selectAllWithin } from "../core-elements/selectAllWithin";

export const UnderlineExtension = Underline;
export const StrikeExtension = Strike;

export const BlockquoteExtension = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Keep "select all" inside the quote the cursor is in, instead of
      // selecting the whole document.
      "Mod-a": ({ editor }: any) => selectAllWithin(editor),
    };
  },
});

export const HorizontalRuleExtension = HorizontalRule;
