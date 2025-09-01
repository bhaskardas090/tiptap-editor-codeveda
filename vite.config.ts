import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ insertTypesEntry: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "TiptapEditorCodeveda",
      fileName: (format) => `tiptap-editor-codeveda.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@tiptap/react",
        "@tiptap/core",
        "@tiptap/starter-kit",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
