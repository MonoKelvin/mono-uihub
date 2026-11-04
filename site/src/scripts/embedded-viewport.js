// 去掉根视口，以及紧贴预览右边缘的实际滚动条槽；不裁内容、不改 iframe 宽度。
export const EMBEDDED_VIEWPORT_CSS = `
html, body { scrollbar-gutter: auto !important; scrollbar-width: none !important; }
html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
[data-uihub-edge-scroll] { scrollbar-gutter: auto !important; scrollbar-width: none !important; }
[data-uihub-edge-scroll]::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
`;

export function edgeScrollbarWidth(element, css) {
  const border = (parseFloat(css.borderLeftWidth) || 0) + (parseFloat(css.borderRightWidth) || 0);
  return Math.max(0, element.offsetWidth - element.clientWidth - border);
}

export function removeEdgeScrollbars(doc) {
  const win = doc.defaultView;
  if (!win || !doc.elementFromPoint || !win.innerWidth || !win.innerHeight) return;
  const targets = new Set();
  // 只探测边缘的几个点和祖先，避免扫描整个原型 DOM 或逐帧读取布局。
  for (const ratio of [.1, .35, .6, .85]) {
    let element = doc.elementFromPoint(Math.max(0, win.innerWidth - 2), win.innerHeight * ratio);
    while (element && element !== doc.documentElement && element !== doc.body) {
      if (!element.hasAttribute('data-uihub-edge-scroll')) {
        const rect = element.getBoundingClientRect();
        if (Math.abs(rect.right - win.innerWidth) <= 2 && element.clientWidth > 0) {
          const css = win.getComputedStyle(element);
          const gap = edgeScrollbarWidth(element, css);
          const scrolling = element.scrollHeight > element.clientHeight + 1 || css.scrollbarGutter?.includes('stable');
          // 先扣除真实边框；不把 padding、设计留白或内容尺寸当作滚动条。
          if (scrolling && gap > 1 && gap < 40) targets.add(element);
        }
      }
      element = element.parentElement;
    }
  }
  targets.forEach((element) => element.setAttribute('data-uihub-edge-scroll', ''));
}

export function configureFrameViewport(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc?.head) return;
    if (doc.getElementById('uihub-embedded-viewport')) {
      doc.defaultView?.requestAnimationFrame(() => {
        try { removeEdgeScrollbars(doc); } catch { /* 文档已离开时不再访问。 */ }
      });
      return;
    }
    const style = doc.createElement('style');
    style.id = 'uihub-embedded-viewport';
    style.textContent = EMBEDDED_VIEWPORT_CSS;
    doc.head.append(style);
    const win = doc.defaultView;
    if (!win) return;
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = win.requestAnimationFrame(() => {
        raf = 0;
        try { removeEdgeScrollbars(doc); } catch { /* 原型自身已导航离开时不再访问。 */ }
      });
    };
    schedule();
    win.addEventListener('resize', schedule, { passive: true });
    doc.addEventListener('click', schedule, { passive: true });
  } catch { /* 原型跳转到跨域页面后不访问其文档。 */ }
}
