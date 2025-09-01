export type EditorContentPayload = {
  html: string;
  // Using any for JSON to avoid forcing consumers to import ProseMirror types
  json: any;
};
