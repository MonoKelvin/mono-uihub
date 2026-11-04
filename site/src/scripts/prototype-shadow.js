import { isBackgroundWrapper, isBackgroundDecoration, colorToRgba } from './prototype-background.js';

const SHADOW_STYLE = 'uihub-window-shadow';
const SHADOW_OWNER = 'data-uihub-shadow-window';

function boxShadows(value = '') {
  let depth = 0, start = 0;
  const shadows = [];
  for (let index = 0; index <= value.length; index++) {
    if (value[index] === '(') depth++;
    if (value[index] === ')') depth--;
    if (index === value.length || value[index] === ',' && depth === 0) {
      const shadow = value.slice(start, index).trim();
      if (shadow && shadow !== 'none') shadows.push(shadow);
      start = index + 1;
    }
  }
  return shadows;
}

export const outerBoxShadow = (value) => boxShadows(value).filter((shadow) => !/\binset\b/.test(shadow)).join(', ');
const innerBoxShadow = (value) => boxShadows(value).filter((shadow) => /\binset\b/.test(shadow)).join(', ');

function shadowWindows(doc, view) {
  const win = doc.defaultView, hosts = [doc.body];
  let parent = doc.body;
  for (let depth = 0; depth < 4; depth++) {
    const wrappers = [...parent.children].filter((node) => isBackgroundWrapper(node, win.getComputedStyle(node), view));
    if (wrappers.length !== 1) break;
    hosts.push(wrappers[0]);
    parent = wrappers[0];
  }
  const children = (node) => [...node.children].filter((child) => {
    if (hosts.includes(child) || ['SCRIPT', 'STYLE', 'LINK', 'CANVAS', 'VIDEO', 'IFRAME'].includes(child.tagName)) return false;
    const css = win.getComputedStyle(child), rect = child.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && css.visibility === 'visible' && !isBackgroundDecoration(child, css, view);
  });
  const windows = [];
  for (const host of hosts) {
    for (let node of children(host)) {
      for (let depth = 0; depth < 4; depth++) {
        const css = win.getComputedStyle(node);
        if (outerBoxShadow(css.boxShadow)) { windows.push(node); break; }
        const nested = children(node);
        if (nested.length !== 1) break;
        node = nested[0];
      }
    }
  }
  return { hosts, windows };
}

function shadowGeometry(element, win) {
  const css = win.getComputedStyle(element), rect = element.getBoundingClientRect();
  if (css.clipPath && css.clipPath !== 'none') return null;
  const extra = (names) => css.boxSizing === 'border-box' ? 0 : names.reduce((sum, name) => sum + (parseFloat(css[name]) || 0), 0);
  const width = parseFloat(css.width) + extra(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']);
  const height = parseFloat(css.height) + extra(['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']);
  if (!(width > 0 && height > 0)) return null;
  let matrix = new win.DOMMatrixReadOnly(), opacity = 1;
  for (let node = element; node; node = node.parentElement) {
    const style = win.getComputedStyle(node);
    opacity *= Number(style.opacity);
    if (style.transform !== 'none') {
      const transform = new win.DOMMatrixReadOnly(style.transform);
      if (!transform.is2D) return null;
      matrix = new win.DOMMatrixReadOnly([transform.a, transform.b, transform.c, transform.d, 0, 0]).multiply(matrix);
    }
  }
  const corners = (m) => [[0, 0], [width, 0], [width, height], [0, height]].map(([x, y]) => ({ x: m.a * x + m.c * y, y: m.b * x + m.d * y }));
  const points = corners(matrix);
  const span = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
  if (span <= 0) return null;
  matrix = matrix.scale(rect.width / span);
  const transformed = corners(matrix);
  const minX = Math.min(...transformed.map((p) => p.x)), minY = Math.min(...transformed.map((p) => p.y));
  if (Math.abs(Math.max(...transformed.map((p) => p.y)) - minY - rect.height) > 1) return null;
  return { width, height, left: rect.left - minX, top: rect.top - minY, transform: `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, 0, 0)`, opacity, css };
}

export function createPrototypeShadow(iframe, type) {
  if (!['software', 'app', 'component'].includes(type)) return null;
  try { if (!iframe.contentDocument?.body || !iframe.parentElement) return null; } catch { return null; }
  const layer = iframe.ownerDocument.createElement('div');
  layer.className = 'detail-shadow-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  iframe.parentElement.insertBefore(layer, iframe);
  let doc = null, dead = false, raf = 0, sourceObserver = null, shadowStyle = null, stopWatching = () => {};
  const sizes = new Set(), originalAttributes = new Map();
  const restoreAttribute = (element, value) => { if (value === null) element.removeAttribute(SHADOW_OWNER); else element.setAttribute(SHADOW_OWNER, value); };
  const clearExtraction = () => {
    shadowStyle?.remove();
    shadowStyle = null;
    originalAttributes.forEach((value, element) => restoreAttribute(element, value));
    originalAttributes.clear();
  };
  const schedule = () => {
    if (dead || raf) return;
    raf = requestAnimationFrame(() => { raf = 0; update(); });
  };
  const sizeObserver = new ResizeObserver(schedule);
  const syncAppearance = () => { layer.style.opacity = iframe.style.opacity || '1'; layer.style.zIndex = iframe.style.zIndex; };
  const frameObserver = new MutationObserver(syncAppearance);
  frameObserver.observe(iframe, { attributes: true, attributeFilter: ['style'] });
  const parentObserver = new MutationObserver(() => { if (!iframe.isConnected) dispose(); });
  parentObserver.observe(iframe.parentElement, { childList: true });
  function update() {
    if (dead || !iframe.isConnected) { dispose(); return; }
    try {
      const nextDoc = iframe.contentDocument;
      if (!nextDoc?.body) {
        sourceObserver?.disconnect();
        stopWatching();
        clearExtraction();
        doc = null;
        sizes.forEach((node) => { if (node !== iframe) { sizeObserver.unobserve(node); sizes.delete(node); } });
        layer.replaceChildren();
        return;
      }
      if (doc !== nextDoc) {
        sourceObserver?.disconnect();
        stopWatching();
        clearExtraction();
        doc = nextDoc;
        sourceObserver = new MutationObserver((records) => {
          if (records.some((record) => {
            if (record.attributeName === SHADOW_OWNER || record.target.id === SHADOW_STYLE || record.target.parentElement?.id === SHADOW_STYLE) return false;
            if (record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].every((node) => node.id === SHADOW_STYLE)) return false;
            return true;
          })) schedule();
        });
        const win = doc.defaultView;
        win.addEventListener('resize', schedule, { passive: true });
        doc.addEventListener('transitionend', schedule, { passive: true });
        doc.addEventListener('animationend', schedule, { passive: true });
        doc.addEventListener('load', schedule, true);
        stopWatching = () => {
          win.removeEventListener('resize', schedule);
          nextDoc.removeEventListener('transitionend', schedule);
          nextDoc.removeEventListener('animationend', schedule);
          nextDoc.removeEventListener('load', schedule, true);
        };
        doc.fonts?.ready.then(schedule);
      }
      if (shadowStyle?.sheet) shadowStyle.sheet.disabled = true;
      try {
        const win = doc.defaultView, view = { width: iframe.clientWidth, height: iframe.clientHeight };
        const { hosts, windows } = shadowWindows(doc, view);
        const plain = (css) => colorToRgba(css.backgroundColor)?.[3] === 0 && css.backgroundImage === 'none';
        const transparent = [...hosts, doc.documentElement].every((node) => plain(win.getComputedStyle(node)) && ['::before', '::after'].every((pseudo) => plain(win.getComputedStyle(node, pseudo)))) && !hosts.some((node) => [...node.children].some((child) => ['CANVAS', 'VIDEO'].includes(child.tagName) || isBackgroundDecoration(child, win.getComputedStyle(child), view)));
        // 源背景透明后只保留内阴影，外阴影整层绘制，避免 iframe 边缘的拼接线。
        const replace = Boolean(doc.getElementById('uihub-background-transparency')) || transparent;
        const targets = new Set([doc.documentElement, ...hosts, ...windows]);
        const nodes = [], rules = [], extracted = new Set();
        windows.forEach((element) => {
          for (let parent = element.parentElement; parent; parent = parent.parentElement) targets.add(parent);
          const geometry = shadowGeometry(element, win);
          if (!geometry) return;
          const ghost = iframe.ownerDocument.createElement('div');
          ghost.className = 'detail-window-shadow';
          for (const key of ['width', 'height', 'left', 'top']) ghost.style[key] = geometry[key] + 'px';
          ghost.style.transform = geometry.transform;
          ghost.style.opacity = String(geometry.opacity);
          ghost.style.boxShadow = outerBoxShadow(geometry.css.boxShadow);
          for (const key of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']) ghost.style[key] = geometry.css[key];
          if (replace) {
            if (!originalAttributes.has(element)) originalAttributes.set(element, element.getAttribute(SHADOW_OWNER));
            element.setAttribute(SHADOW_OWNER, String(nodes.length));
            rules.push(`[${SHADOW_OWNER}="${nodes.length}"]{box-shadow:${innerBoxShadow(geometry.css.boxShadow) || 'none'}!important}`);
            extracted.add(element);
          }
          nodes.push(ghost);
        });
        originalAttributes.forEach((value, element) => {
          if (!extracted.has(element)) { restoreAttribute(element, value); originalAttributes.delete(element); }
        });
        if (rules.length) {
          if (!shadowStyle) {
            shadowStyle = doc.createElement('style');
            shadowStyle.id = SHADOW_STYLE;
            doc.head.append(shadowStyle);
          }
          const css = rules.join('\n');
          if (shadowStyle.textContent !== css) shadowStyle.textContent = css;
        } else { shadowStyle?.remove(); shadowStyle = null; }
        layer.style.width = view.width + 'px';
        layer.style.height = view.height + 'px';
        layer.replaceChildren(...nodes);
        sourceObserver.disconnect();
        sourceObserver.observe(doc.head, { subtree: true, attributes: true, childList: true, characterData: true });
        targets.forEach((node) => sourceObserver.observe(node, { attributes: true, childList: true }));
        const nextSizes = new Set([iframe, ...windows]);
        sizes.forEach((node) => { if (!nextSizes.has(node)) { sizeObserver.unobserve(node); sizes.delete(node); } });
        nextSizes.forEach((node) => { if (!sizes.has(node)) { sizeObserver.observe(node); sizes.add(node); } });
        syncAppearance();
      } finally { if (shadowStyle?.sheet) shadowStyle.sheet.disabled = false; }
    } catch { clearExtraction(); layer.replaceChildren(); }
  }
  function dispose() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(raf);
    sourceObserver?.disconnect();
    sizeObserver.disconnect();
    frameObserver.disconnect();
    parentObserver.disconnect();
    stopWatching();
    clearExtraction();
    iframe.removeEventListener('load', schedule);
    layer.remove();
  }
  iframe.addEventListener('load', schedule);
  update();
  return { element: layer, dispose };
}
