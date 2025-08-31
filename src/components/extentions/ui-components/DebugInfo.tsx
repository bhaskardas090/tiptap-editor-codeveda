import React from "react";
import { Editor } from "@tiptap/react";

interface DebugInfoProps {
  editor: Editor;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ editor }) => {
  return (
    <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
      <strong>Debug:</strong> Current position - H1:{" "}
      {editor.isActive("heading", { level: 1 }) ? "✅" : "❌"} | H2:{" "}
      {editor.isActive("heading", { level: 2 }) ? "✅" : "❌"} | H3:{" "}
      {editor.isActive("heading", { level: 3 }) ? "✅" : "❌"} | P:{" "}
      {editor.isActive("paragraph") ? "✅" : "❌"} | Bold:{" "}
      {editor.isActive("bold") ? "✅" : "❌"} | List:{" "}
      {editor.isActive("bulletList") ? "✅" : "❌"} | Table:{" "}
      {editor.isActive("table") ? "✅" : "❌"}
    </div>
  );
};

export default DebugInfo;
