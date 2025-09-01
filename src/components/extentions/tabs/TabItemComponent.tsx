import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export default function TabItemComponent({
  node,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
}) {
  const tabIndex = node.attrs?.tabIndex || 0;

  return (
    <NodeViewWrapper className="tab-item-content p-4" data-tab-index={tabIndex}>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}
