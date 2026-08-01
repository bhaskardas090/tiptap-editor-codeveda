import { TableView } from "@tiptap/extension-table";

const MIN_THUMB_WIDTH = 44;

/**
 * Table node view with its own horizontal scrollbar.
 *
 * The native one is not good enough here: macOS (and mobile) render overlay
 * scrollbars that fade out when idle, so a table wider than the editor gives no
 * hint that it scrolls and there is nothing to grab. `::-webkit-scrollbar`
 * styling does not opt out of that. This draws a bar that is always visible
 * while the table overflows, and can be dragged or clicked.
 */
export class ScrollableTableView extends TableView {
  private scrollbar: HTMLElement;
  private thumb: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private dragPointerId: number | null = null;
  private dragStartX = 0;
  private dragStartScroll = 0;

  constructor(node: any, cellMinWidth: number, ...rest: any[]) {
    // @ts-expect-error — the base signature varies between callers (the
    // resizing plugin passes the editor view as a third argument).
    super(node, cellMinWidth, ...rest);

    this.scrollbar = document.createElement("div");
    this.scrollbar.className = "table-scrollbar";
    this.scrollbar.setAttribute("aria-hidden", "true");
    this.scrollbar.contentEditable = "false";

    this.thumb = document.createElement("div");
    this.thumb.className = "table-scrollbar-thumb";
    this.scrollbar.appendChild(this.thumb);
    this.dom.appendChild(this.scrollbar);
    this.dom.classList.add("has-custom-scrollbar");

    this.dom.addEventListener("scroll", this.sync, { passive: true });
    this.scrollbar.addEventListener("pointerdown", this.onTrackPointerDown);
    this.thumb.addEventListener("pointerdown", this.onThumbPointerDown);
    this.thumb.addEventListener("pointermove", this.onThumbPointerMove);
    this.thumb.addEventListener("pointerup", this.onThumbPointerUp);
    this.thumb.addEventListener("pointercancel", this.onThumbPointerUp);
    // Keep the editor from moving the selection when the bar is used.
    this.scrollbar.addEventListener("mousedown", preventDefault);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.sync);
      this.resizeObserver.observe(this.dom);
      this.resizeObserver.observe(this.table);
    }

    // Layout is not settled during the constructor.
    requestAnimationFrame(this.sync);
  }

  /** Track geometry, in the coordinate space of the visible wrapper. */
  private get metrics() {
    const visible = this.dom.clientWidth;
    const total = this.dom.scrollWidth;
    const overflow = total - visible;
    return { visible, total, overflow };
  }

  private sync = () => {
    const { visible, total, overflow } = this.metrics;

    // 1px of slack: sub-pixel table widths should not show a dead scrollbar.
    if (overflow <= 1 || visible === 0) {
      this.dom.classList.remove("is-scrollable");
      return;
    }
    this.dom.classList.add("is-scrollable");

    // The bar lives inside the scroll container and is pinned with
    // `position: sticky`, so it has to be told how wide the viewport is.
    this.scrollbar.style.width = `${visible}px`;

    const trackWidth = visible;
    const thumbWidth = Math.max(
      MIN_THUMB_WIDTH,
      Math.round((visible / total) * trackWidth)
    );
    const travel = trackWidth - thumbWidth;
    const progress = overflow > 0 ? this.dom.scrollLeft / overflow : 0;

    this.thumb.style.width = `${thumbWidth}px`;
    this.thumb.style.transform = `translateX(${Math.round(progress * travel)}px)`;
  };

  private scrollToPointer(clientX: number, thumbWidth: number) {
    const rect = this.scrollbar.getBoundingClientRect();
    const travel = rect.width - thumbWidth;
    if (travel <= 0) return;
    const offset = clientX - rect.left - thumbWidth / 2;
    const progress = Math.min(Math.max(offset / travel, 0), 1);
    this.dom.scrollLeft = progress * this.metrics.overflow;
  }

  private onTrackPointerDown = (event: PointerEvent) => {
    if (event.target === this.thumb) return;
    event.preventDefault();
    this.scrollToPointer(event.clientX, this.thumb.getBoundingClientRect().width);
    this.sync();
  };

  private onThumbPointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartScroll = this.dom.scrollLeft;
    this.thumb.setPointerCapture(event.pointerId);
    this.dom.classList.add("is-scrollbar-dragging");
  };

  private onThumbPointerMove = (event: PointerEvent) => {
    if (this.dragPointerId !== event.pointerId) return;
    event.preventDefault();

    const { visible, overflow } = this.metrics;
    const thumbWidth = this.thumb.getBoundingClientRect().width;
    const travel = visible - thumbWidth;
    if (travel <= 0) return;

    const delta = event.clientX - this.dragStartX;
    this.dom.scrollLeft = this.dragStartScroll + (delta / travel) * overflow;
    this.sync();
  };

  private onThumbPointerUp = (event: PointerEvent) => {
    if (this.dragPointerId !== event.pointerId) return;
    this.dragPointerId = null;
    if (this.thumb.hasPointerCapture(event.pointerId)) {
      this.thumb.releasePointerCapture(event.pointerId);
    }
    this.dom.classList.remove("is-scrollbar-dragging");
  };

  update(node: any): boolean {
    const updated = super.update(node);
    if (updated) requestAnimationFrame(this.sync);
    return updated;
  }

  /**
   * The bar is chrome, not content: without this the editor treats adding it
   * (and every class/style change on it) as a document edit and rebuilds the
   * node view, which recreates the bar — an endless loop.
   */
  ignoreMutation(mutation: any): boolean {
    const target = mutation.target as Node;

    if (target === this.scrollbar || this.scrollbar.contains(target)) {
      return true;
    }
    if (mutation.type === "attributes" && target === this.dom) {
      return true;
    }
    if (mutation.type === "childList" && target === this.dom) {
      const involvesScrollbar = (nodes: NodeList) =>
        Array.prototype.includes.call(nodes, this.scrollbar);
      if (
        involvesScrollbar(mutation.addedNodes) ||
        involvesScrollbar(mutation.removedNodes)
      ) {
        return true;
      }
    }

    return super.ignoreMutation(mutation);
  }

  destroy() {
    this.dom.removeEventListener("scroll", this.sync);
    this.scrollbar.removeEventListener("pointerdown", this.onTrackPointerDown);
    this.thumb.removeEventListener("pointerdown", this.onThumbPointerDown);
    this.thumb.removeEventListener("pointermove", this.onThumbPointerMove);
    this.thumb.removeEventListener("pointerup", this.onThumbPointerUp);
    this.thumb.removeEventListener("pointercancel", this.onThumbPointerUp);
    this.scrollbar.removeEventListener("mousedown", preventDefault);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}

function preventDefault(event: Event) {
  event.preventDefault();
}
