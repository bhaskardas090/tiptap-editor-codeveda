import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

export const TextStyleExtension = TextStyle;

export const ColorExtension = Color.configure({
  types: ["textStyle"],
});
