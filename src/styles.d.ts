// Type declarations for CSS imports
declare module "tiptap-editor-codeveda/styles" {
  const styles: string;
  export default styles;
}

// Also declare the main package styles
declare module "tiptap-editor-codeveda" {
  // This allows importing CSS from the main package
  const styles: string;
  export { styles };
}
