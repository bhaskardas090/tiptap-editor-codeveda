import React, { useEffect, useMemo, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Button } from "../../ui/button";
import {
  Settings,
  Trash2,
  Play,
  Maximize,
  Minimize,
  Code2,
  Eye,
} from "lucide-react";
import { buildSrcDoc } from "./utils";

type CodeTab = "html" | "css" | "js";
type EditPanel = "code" | "preview";

interface LivePreviewAttrs {
  html: string;
  css: string;
  js: string;
  height: string;
  title: string;
}

const CODE_TABS: { id: CodeTab; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JS" },
];

const LivePreviewComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const [isEditing, setIsEditing] = useState(!!node.attrs.pendingEdit);
  const [activeTab, setActiveTab] = useState<CodeTab>("html");
  const [editPanel, setEditPanel] = useState<EditPanel>("code");
  const [previewKey, setPreviewKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<LivePreviewAttrs>({
    html: node.attrs.html || "",
    css: node.attrs.css || "",
    js: node.attrs.js || "",
    height: node.attrs.height || "400px",
    title: node.attrs.title || "Live Preview",
  });

  const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

  useEffect(() => {
    if (node.attrs.pendingEdit && isEditable) {
      setIsEditing(true);
      updateAttributes({ pendingEdit: false });
    }
  }, [node.attrs.pendingEdit, isEditable, updateAttributes]);

  useEffect(() => {
    if (!editor) return;

    const updateEditableState = () => setIsEditable(editor.isEditable);
    updateEditableState();
    editor.on("update", updateEditableState);
    editor.on("selectionUpdate", updateEditableState);

    return () => {
      editor.off("update", updateEditableState);
      editor.off("selectionUpdate", updateEditableState);
    };
  }, [editor]);

  const savedSrcDoc = useMemo(
    () => buildSrcDoc(node.attrs.html, node.attrs.css, node.attrs.js),
    [node.attrs.html, node.attrs.css, node.attrs.js]
  );

  const draftSrcDoc = useMemo(
    () => buildSrcDoc(draft.html, draft.css, draft.js),
    [draft.html, draft.css, draft.js]
  );

  const openEditor = () => {
    if (!isEditable) return;
    setDraft({
      html: node.attrs.html || "",
      css: node.attrs.css || "",
      js: node.attrs.js || "",
      height: node.attrs.height || "400px",
      title: node.attrs.title || "Live Preview",
    });
    setActiveTab("html");
    setEditPanel("code");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!isEditable) return;
    updateAttributes(draft);
    setPreviewKey((k) => k + 1);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft({
      html: node.attrs.html || "",
      css: node.attrs.css || "",
      js: node.attrs.js || "",
      height: node.attrs.height || "400px",
      title: node.attrs.title || "Live Preview",
    });
    setIsEditing(false);
  };

  const handleRunPreview = () => {
    setPreviewKey((k) => k + 1);
    setEditPanel("preview");
  };

  const updateDraftField = (field: keyof LivePreviewAttrs, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!isFullscreen) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const renderPreviewIframe = (srcDoc: string, height: string, key: number) => (
    <iframe
      key={key}
      title={node.attrs.title || "Live Preview"}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-modals"
      className="live-preview-iframe"
      style={{
        width: "100%",
        height: isFullscreen ? "100vh" : height,
        border: "none",
        borderRadius: 0,
        display: "block",
      }}
    />
  );

  if (isEditing) {
    return (
      <NodeViewWrapper className="live-preview-extension live-preview-editing">
        <div className="live-preview-editor-panel">
          <div className="live-preview-editor-header">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">Live Preview Editor</span>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={editPanel === "code" ? "default" : "outline"}
                onClick={() => setEditPanel("code")}
              >
                <Code2 className="h-3.5 w-3.5 mr-1" />
                Code
              </Button>
              <Button
                type="button"
                size="sm"
                variant={editPanel === "preview" ? "default" : "outline"}
                onClick={() => {
                  setPreviewKey((k) => k + 1);
                  setEditPanel("preview");
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {editPanel === "code" ? (
            <>
              <div className="live-preview-tabs">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`live-preview-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <textarea
                className="live-preview-code-input"
                value={draft[activeTab]}
                onChange={(e) => updateDraftField(activeTab, e.target.value)}
                spellCheck={false}
                aria-label={`${activeTab.toUpperCase()} code`}
              />

              <div className="live-preview-meta-row">
                <label className="live-preview-meta-field">
                  <span>Height</span>
                  <input
                    type="text"
                    value={draft.height}
                    onChange={(e) => updateDraftField("height", e.target.value)}
                    placeholder="400px"
                  />
                </label>
                <label className="live-preview-meta-field">
                  <span>Title</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => updateDraftField("title", e.target.value)}
                    placeholder="Live Preview"
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="live-preview-edit-preview">
              {renderPreviewIframe(draftSrcDoc, draft.height, previewKey)}
            </div>
          )}

          <div className="live-preview-actions">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRunPreview}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Run
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="live-preview-extension">
      <div ref={containerRef} className="live-preview-output group relative">
        {renderPreviewIframe(savedSrcDoc, node.attrs.height, previewKey)}

        {isEditable && (
          <div className="live-preview-controls">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Edit code"
              onClick={openEditor}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Delete"
              onClick={() => deleteNode()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!isEditable && (
          <div className="live-preview-controls live-preview-controls-readonly">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {node.attrs.title && (
          <div className="live-preview-label">{node.attrs.title}</div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default LivePreviewComponent;
