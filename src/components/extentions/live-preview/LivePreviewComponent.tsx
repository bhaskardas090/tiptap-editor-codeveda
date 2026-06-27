import React, { useEffect, useMemo, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Button } from "../../ui/button";
import { Settings, Trash2, Play, Code2, Eye } from "lucide-react";
import { buildSrcDoc } from "./utils";
import { useLivePreviewDarkMode } from "./dark-mode";

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

const DEFAULT_TITLE = "Interactive view";
// Default: size the preview to fit its content. An explicit value in the
// height input overrides this.
const DEFAULT_HEIGHT = "auto";

/**
 * Whether a height value means "fit the content" rather than a fixed size.
 * Empty / "auto" / "fit"(-content) / "max"(-content) are treated as auto-fit,
 * in which case the preview is sized from the height the iframe reports.
 */
const isAutoHeight = (value: string): boolean => {
  const v = (value || "").trim().toLowerCase();
  return (
    v === "" ||
    v === "auto" ||
    v === "fit" ||
    v === "fit-content" ||
    v === "max" ||
    v === "max-content"
  );
};

/**
 * Normalizes an explicit height value into a valid CSS dimension.
 * Accepts:
 *  - plain numbers ("400" -> "400px")
 *  - explicit units ("400px", "80%", "50vh", "20rem", ...) -> used as-is
 *  - content keyword "min"/"min-content"
 */
const normalizeHeight = (value: string): string => {
  const v = (value || "").trim();
  if (!v) return DEFAULT_HEIGHT;

  // Plain number -> pixels
  if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;

  const keyword = v.toLowerCase();
  if (keyword === "min" || keyword === "min-content") return "min-content";

  // Already a valid CSS length/percentage (e.g. "400px", "80%", "50vh")
  if (/^\d+(\.\d+)?(px|%|em|rem|vh|vw|vmin|vmax|ch|pt|pc|cm|mm|in)$/i.test(v)) {
    return v;
  }

  // Fallback: hand off as-is (covers calc(), clamp(), etc.)
  return v;
};

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
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const [draft, setDraft] = useState<LivePreviewAttrs>({
    html: node.attrs.html || "",
    css: node.attrs.css || "",
    js: node.attrs.js || "",
    height: node.attrs.height || DEFAULT_HEIGHT,
    title: node.attrs.title || DEFAULT_TITLE,
  });

  const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

  const darkMode = useLivePreviewDarkMode();
  // Captured once so the baked srcDoc (initial paint) stays stable; later
  // toggles are pushed to the live iframe via postMessage, avoiding a reload
  // that would reset the infographic's interactive state.
  const initialDarkRef = React.useRef(darkMode);

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
    () =>
      buildSrcDoc(
        node.attrs.html,
        node.attrs.css,
        node.attrs.js,
        initialDarkRef.current
      ),
    [node.attrs.html, node.attrs.css, node.attrs.js]
  );

  const draftSrcDoc = useMemo(
    () => buildSrcDoc(draft.html, draft.css, draft.js, initialDarkRef.current),
    [draft.html, draft.css, draft.js]
  );

  // Push dark-mode changes to the live iframe without rebuilding its srcDoc, so
  // the preview toggles in place and keeps its interactive state.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "live-preview-darkmode", darkMode },
      "*"
    );
  }, [darkMode, previewKey, isEditing, editPanel]);

  const openEditor = () => {
    if (!isEditable) return;
    setDraft({
      html: node.attrs.html || "",
      css: node.attrs.css || "",
      js: node.attrs.js || "",
      height: node.attrs.height || DEFAULT_HEIGHT,
      title: node.attrs.title || DEFAULT_TITLE,
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
      height: node.attrs.height || DEFAULT_HEIGHT,
      title: node.attrs.title || DEFAULT_TITLE,
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

  // Listen for the height the active iframe reports about its own content so
  // we can size the preview to fit when no explicit height is set.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const data = event.data;
      if (
        data &&
        data.type === "live-preview-height" &&
        typeof data.height === "number"
      ) {
        setMeasuredHeight(data.height);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const renderPreviewIframe = (srcDoc: string, height: string, key: number) => {
    const auto = isAutoHeight(height);

    // Resolve the iframe height. A configured pixel height is treated as a
    // *minimum*: when the content is taller than it (e.g. text wraps taller on
    // a narrow/mobile width), the frame grows to fit instead of clipping and
    // showing an inner scrollbar. `scroll` stays false whenever we've sized the
    // frame to its content, so there is nothing to scroll.
    let resolvedHeight: string;
    let scroll = false;

    if (measuredHeight != null) {
      if (auto) {
        resolvedHeight = `${measuredHeight}px`;
      } else {
        const normalized = normalizeHeight(height);
        const px = /^\d+(\.\d+)?px$/.test(normalized)
          ? parseFloat(normalized)
          : null;
        if (px != null) {
          resolvedHeight = `${Math.max(px, measuredHeight)}px`;
        } else {
          // Non-pixel heights (%, vh, calc(), ...) are respected as authored.
          resolvedHeight = normalized;
          scroll = true;
        }
      }
    } else {
      // Height not measured yet — fall back to the authored value.
      resolvedHeight = auto ? "auto" : normalizeHeight(height);
      scroll = !auto;
    }

    return (
      <iframe
        key={key}
        ref={iframeRef}
        title={node.attrs.title || DEFAULT_TITLE}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-modals"
        className="live-preview-iframe"
        scrolling={scroll ? "auto" : "no"}
        onLoad={(e) => {
          // Request the content height once the iframe has loaded. onLoad is
          // race-proof even when our message listener attaches late (SSR /
          // hydration / StrictMode), so auto-fit works outside the editor too.
          const win = e.currentTarget.contentWindow;
          win?.postMessage({ type: "live-preview-request-height" }, "*");
          // Re-assert dark mode on (re)load, e.g. after a previewKey reload.
          win?.postMessage(
            { type: "live-preview-darkmode", darkMode },
            "*"
          );
        }}
        style={{
          width: "100%",
          height: resolvedHeight,
          border: "none",
          borderRadius: 0,
          display: "block",
        }}
      />
    );
  };

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
                    placeholder="400, 400px, 80%, fit-content, max-content"
                  />
                </label>
                <label className="live-preview-meta-field">
                  <span>Title</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => updateDraftField("title", e.target.value)}
                    placeholder={DEFAULT_TITLE}
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
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Delete"
              onClick={() => deleteNode()}
            >
              <Trash2 className="h-4 w-4" />
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
