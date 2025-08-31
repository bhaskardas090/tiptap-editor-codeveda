import Link from "@tiptap/extension-link";

export const LinkExtension = Link.configure({
  openOnClick: false,
  autolink: true,
  defaultProtocol: "https",
});
