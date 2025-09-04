// Type declarations for CSS imports
declare module "tiptap-editor-codeveda/styles" {
  const styles: string;
  export default styles;
}

// Global module declaration for CSS imports
declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.scss" {
  const content: string;
  export default content;
}
