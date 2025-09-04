import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: [
        "src/index.ts",
        "src/tiptap-editor.tsx",
        "src/tiptap-viewer.tsx",
        "src/useEditorContent.ts",
        "src/types.ts",
      ],
      exclude: [
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/main.tsx",
        "src/App.tsx",
        "src/styles.d.ts",
      ],
      outDir: "dist",
      entryRoot: "src",
      rollupTypes: true,
      copyDtsFiles: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
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
      formats: ["es", "umd"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@tiptap/react",
        "@tiptap/core",
        "@tiptap/starter-kit",
        "@tiptap/extension-table",
        "@tiptap/extension-table-row",
        "@tiptap/extension-table-header",
        "@tiptap/extension-table-cell",
        "@tiptap/extension-image",
        "@tiptap/extension-link",
        "@tiptap/extension-underline",
        "@tiptap/extension-strike",
        "@tiptap/extension-text-style",
        "@tiptap/extension-color",
        "@tiptap/extension-highlight",
        "@tiptap/extension-code-block-lowlight",
        "@tiptap/extension-blockquote",
        "@tiptap/extension-horizontal-rule",
        "firebase",
        "lowlight",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "@radix-ui/react-slot",
        "@floating-ui/react",
        "react-tabs",
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
