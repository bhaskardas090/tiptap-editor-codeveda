import React, { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Button } from "../../ui/button";
import { Settings, ExternalLink, Copy, Trash2 } from "lucide-react";

interface IframeAttributes {
  src: string;
  width: string;
  height: string;
  title: string;
  allow: string;
  sandbox: string;
  style: string;
}

const IframeComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<"simple" | "advanced">("simple");
  const [customIframeCode, setCustomIframeCode] = useState("");
  const [attributes, setAttributes] = useState<IframeAttributes>({
    src: node.attrs.src || "",
    width: node.attrs.width || "100%",
    height: node.attrs.height || "500px",
    title: node.attrs.title || "",
    allow: node.attrs.allow || "",
    sandbox: node.attrs.sandbox || "",
    style: node.attrs.style || "",
  });

  const handleSave = () => {
    updateAttributes(attributes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setAttributes({
      src: node.attrs.src || "",
      width: node.attrs.width || "100%",
      height: node.attrs.height || "500px",
      title: node.attrs.title || "",
      allow: node.attrs.allow || "",
      sandbox: node.attrs.sandbox || "",
      style: node.attrs.style || "",
    });
    setIsEditing(false);
  };

  const copyIframeCode = () => {
    const iframeCode = `<iframe src="${attributes.src}" style="width:${attributes.width}; height: ${attributes.height}; ${attributes.style}" title="${attributes.title}" allow="${attributes.allow}" sandbox="${attributes.sandbox}"></iframe>`;
    navigator.clipboard.writeText(iframeCode);
  };

  const parseCustomIframeCode = (htmlCode: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCode, "text/html");
    const iframe = doc.querySelector("iframe");

    if (iframe) {
      const newAttributes: IframeAttributes = {
        src: iframe.getAttribute("src") || "",
        width: iframe.getAttribute("width") || "100%",
        height: iframe.getAttribute("height") || "500px",
        title: iframe.getAttribute("title") || "",
        allow: iframe.getAttribute("allow") || "",
        sandbox: iframe.getAttribute("sandbox") || "",
        style: iframe.getAttribute("style") || "",
      };
      setAttributes(newAttributes);
      return true;
    }
    return false;
  };

  const handleCustomCodeSubmit = () => {
    if (parseCustomIframeCode(customIframeCode)) {
      setEditMode("simple");
      setCustomIframeCode("");
    } else {
      alert("Invalid iframe HTML code. Please check your input.");
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className="iframe-extension-editing">
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setEditMode("simple")}
              size="sm"
              variant={editMode === "simple" ? "default" : "outline"}
              className="flex-1"
            >
              Simple Mode
            </Button>
            <Button
              onClick={() => setEditMode("advanced")}
              size="sm"
              variant={editMode === "advanced" ? "default" : "outline"}
              className="flex-1"
            >
              Advanced Mode
            </Button>
          </div>

          {editMode === "simple" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={attributes.src}
                  onChange={(e) =>
                    setAttributes({ ...attributes, src: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/embed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="text"
                    value={attributes.width}
                    onChange={(e) =>
                      setAttributes({ ...attributes, width: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={attributes.height}
                    onChange={(e) =>
                      setAttributes({ ...attributes, height: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={attributes.title}
                  onChange={(e) =>
                    setAttributes({ ...attributes, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Embedded Content"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paste your iframe HTML code
                </label>
                <textarea
                  value={customIframeCode}
                  onChange={(e) => setCustomIframeCode(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`<iframe src="https://example.com/embed" style="width:100%; height:500px; border:0; border-radius:4px; overflow:hidden;" title="Example" allow="..." sandbox="..."></iframe>`}
                />
              </div>
              <div className="text-xs text-gray-600">
                Paste your complete iframe HTML code here. The extension will
                automatically extract the attributes.
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {editMode === "advanced" && (
              <Button
                onClick={handleCustomCodeSubmit}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Parse & Apply
              </Button>
            )}
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
            <Button onClick={handleCancel} size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="iframe-extension">
      <div className="relative group">
        {/* Iframe */}
        <iframe
          src={node.attrs.src}
          width={node.attrs.width}
          height={node.attrs.height}
          title={node.attrs.title}
          allow={node.attrs.allow}
          sandbox={node.attrs.sandbox}
          style={{
            ...parseStyle(node.attrs.style),
            width: node.attrs.width,
            height: node.attrs.height,
          }}
          className="rounded-lg"
        />

        {/* Hover Controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border">
          <div className="flex gap-1">
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Edit iframe"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => window.open(node.attrs.src, "_blank")}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              onClick={copyIframeCode}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Copy iframe code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => deleteNode()}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Delete iframe"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Source URL display */}
        {node.attrs.src && (
          <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Source: {node.attrs.src}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// Helper function to parse style string to object
const parseStyle = (styleString: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  if (!styleString) return styles;

  styleString.split(";").forEach((style) => {
    const [property, value] = style.split(":").map((s) => s.trim());
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
      );
      (styles as any)[camelProperty] = value;
    }
  });

  return styles;
};

export default IframeComponent;
