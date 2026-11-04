import { describePrototypeBackground, extractPrototypePalette, resolvePrototypePalette } from './prototype-background.js';

const OWNER = 'data-uihub-background-host';
const DECOR = 'data-uihub-background-decor';
const CONTENT = 'data-uihub-replay-content';
const STYLE_ID = 'uihub-background-transparency';
const PALETTE_KEYS = ['--ink', '--ink-2', '--ink-3', '--gold', '--card', '--line', '--line-2', '--fill', '--fill-2', '--paper-2', '--detail-panel-bg', '--detail-tool-bg'];

export function backgroundCover(view, area) {
  if (!view.width || !view.height) return 1;
  return Math.max(area.width / view.width, area.height / view.height);
}
function pathTo(element, root) {
  const path = [];
  while (element && element !== root) {
    const parent = element.parentElement;
    if (!parent) return null;
    path.unshift([...parent.children].indexOf(element));
    element = parent;
  }
  return path;
}
function cloneAt(element, originalRoot, cloneRoot) {
  const path = pathTo(element, originalRoot);
  return path?.reduce((node, index) => node?.children[index], cloneRoot) || null;
}
const localFragments = (value) => value.replace(/url\((['"]?)#([^)'"\s]+)\1\)/g, 'url("about:srcdoc#$2")');

export function sanitizeBackgroundTree(tree) {
  tree.querySelectorAll('script, iframe, object, embed, audio, video, source, meta[http-equiv], base').forEach((node) => node.remove());
  tree.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach(({ name, value }) => {
      if (/^on/i.test(name) || name === 'autofocus' || name === 'srcdoc') node.removeAttribute(name);
      else if ((name === 'href' || name === 'xlink:href') && value.startsWith('#')) node.setAttribute(name, 'about:srcdoc' + value);
      else if (value.includes('url(')) node.setAttribute(name, localFragments(value));
    });
    if (node.closest(`[${CONTENT}]`)) {
      if (node.tagName === 'IMG') { node.removeAttribute('src'); node.removeAttribute('srcset'); }
      if (node.tagName === 'IMAGE') { node.removeAttribute('href'); node.removeAttribute('xlink:href'); }
    }
  });
}

export function buildBackgroundDocument(description) {
  const { doc, layers, decorations, content } = description;
  const tree = doc.documentElement.cloneNode(true);
  const rules = [];
  layers.forEach((layer, index) => {
    const clone = cloneAt(layer.element, doc.documentElement, tree);
    if (!clone) return;
    clone.setAttribute(OWNER, String(index));
    Object.entries(layer.styles).forEach(([key, value]) => clone.style.setProperty(key, localFragments(value), 'important'));
    for (const [kind, styles] of [['before', layer.before], ['after', layer.after]]) {
      const selector = `[${OWNER}="${index}"]::${kind}`;
      if (!styles) { rules.push(`${selector}{content:none!important}`); continue; }
      const declarations = Object.entries(styles).map(([key, value]) => `${key}:${localFragments(value)}`).join(';');
      rules.push(`${selector}{content:"";${declarations}}`);
    }
  });
  content.forEach((element) => {
    const clone = cloneAt(element, doc.documentElement, tree);
    if (!clone) return;
    clone.setAttribute(CONTENT, '');
    const rect = element.getBoundingClientRect();
    if (rect.width > 0) clone.style.setProperty('width', rect.width + 'px', 'important');
    if (rect.height > 0) clone.style.setProperty('height', rect.height + 'px', 'important');
  });
  decorations.forEach((element) => cloneAt(element, doc.documentElement, tree)?.setAttribute(DECOR, ''));
  tree.querySelector(`#${STYLE_ID}`)?.remove();
  sanitizeBackgroundTree(tree);
  const head = tree.querySelector('head');
  head.querySelectorAll('link').forEach((link) => { if (!link.rel?.split(/\s+/).includes('stylesheet')) link.remove(); });
  const base = doc.createElement('base');
  base.href = doc.baseURI;
  head.prepend(base);
  const style = doc.createElement('style');
  style.textContent = `
html{scrollbar-gutter:auto!important;scrollbar-width:none!important}
body{overflow:hidden!important;scrollbar-width:none!important}
[${CONTENT}],[${CONTENT}] *{visibility:hidden!important;animation:none!important;transition:none!important;background-image:none!important;mask-image:none!important;pointer-events:none!important}
[${CONTENT}]::before,[${CONTENT}]::after,[${CONTENT}] *::before,[${CONTENT}] *::after{visibility:hidden!important;animation:none!important;background-image:none!important}
[${CONTENT}] defs,[${CONTENT}] defs *,[${CONTENT}] symbol,[${CONTENT}] symbol *{visibility:visible!important}
${rules.join('\n')}`;
  head.append(style);
  return '<!doctype html>\n' + tree.outerHTML;
}

function withOriginalBackground(doc, action) {
  const sheet = doc.getElementById(STYLE_ID)?.sheet;
  if (!sheet) return action();
  const disabled = sheet.disabled;
  sheet.disabled = true;
  try { return action(); } finally { sheet.disabled = disabled; }
}
function makeTransparent(description) {
  const { doc, layers, decorations } = description;
  const previous = [], selectors = [];
  const mark = (element, attr, value = '') => {
    previous.push([element, attr, element.getAttribute(attr)]);
    element.setAttribute(attr, value);
  };
  layers.forEach((layer, index) => {
    mark(layer.element, OWNER, String(index));
    selectors.push(`[${OWNER}="${index}"]{background-color:transparent!important;background-image:none!important}`);
    if (layer.before) selectors.push(`[${OWNER}="${index}"]::before{opacity:0!important}`);
    if (layer.after) selectors.push(`[${OWNER}="${index}"]::after{opacity:0!important}`);
  });
  decorations.forEach((element) => mark(element, DECOR));
  selectors.push(`[${DECOR}]{opacity:0!important;pointer-events:none!important}`);
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = selectors.join('\n');
  doc.head.append(style);
  return () => {
    style.remove();
    previous.forEach(([element, attr, value]) => { if (value === null) element.removeAttribute(attr); else element.setAttribute(attr, value); });
  };
}

export function createPrototypeBackdrop(root, slot) {
  if (!slot) return { prepare: async () => ({ commit() {}, dispose() {} }), clear() {}, resize() {} };
  let current = null, currentType = '', version = 0, raf = 0, disposed = false;
  const resetPalette = () => {
    PALETTE_KEYS.forEach((key) => root.style.removeProperty(key));
    delete root.dataset.detailTone;
  };
  const resize = () => {
    if (!current?.frame) return;
    const scale = backgroundCover(current.description.view, { width: root.clientWidth, height: root.clientHeight });
    current.frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };
  function clear() {
    version++;
    current?.dispose();
    current = null;
    slot.replaceChildren();
    resetPalette();
  }
  async function prepare(iframe, type, signal) {
    const doc = iframe.contentDocument;
    const description = doc && withOriginalBackground(doc, () => describePrototypeBackground(iframe, type));
    if (!description) return { source: iframe, commit() { clear(); }, dispose() {} };
    const palette = extractPrototypePalette(description);
    const frame = document.createElement('iframe');
    frame.className = 'detail-background-frame';
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.inert = true;
    frame.style.width = description.view.width + 'px';
    frame.style.height = description.view.height + 'px';
    frame.style.opacity = '0';
    const scale = backgroundCover(description.view, { width: root.clientWidth, height: root.clientHeight });
    frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
    let timeout = 0, restore = null, observer = null, stopWatching = () => {};
    const pending = {
      frame, description, source: iframe,
      dispose() { restore?.(); observer?.disconnect(); stopWatching(); frame.remove(); clearTimeout(timeout); },
      commit() {
        if (signal.aborted) { pending.dispose(); return; }
        const old = current;
        current = pending;
        currentType = type;
        version++;
        restore = makeTransparent(description);
        const resolved = resolvePrototypePalette(palette);
        PALETTE_KEYS.forEach((key) => root.style.setProperty(key, resolved[key] || ''));
        root.dataset.detailTone = resolved['--detail-tone'];
        frame.style.opacity = '1';
        resize();
        const removeOld = () => old?.dispose();
        setTimeout(removeOld, 200);
        const schedule = () => {
          if (raf) return;
          raf = requestAnimationFrame(() => { raf = 0; if (current === pending) refresh(); });
        };
        observer = new MutationObserver(schedule);
        description.hosts.forEach((element) => observer.observe(element, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] }));
        doc.addEventListener('click', schedule, { passive: true });
        doc.addEventListener('transitionend', schedule, { passive: true });
        description.win.addEventListener('resize', schedule, { passive: true });
        stopWatching = () => { doc.removeEventListener('click', schedule); doc.removeEventListener('transitionend', schedule); description.win.removeEventListener('resize', schedule); };
      },
    };
    try {
      await new Promise((resolve, reject) => {
        const fail = () => reject(new Error('Background unavailable'));
        signal.addEventListener('abort', fail, { once: true });
        frame.addEventListener('load', resolve, { once: true, signal });
        frame.addEventListener('error', fail, { once: true, signal });
        timeout = setTimeout(fail, 5000);
        frame.srcdoc = buildBackgroundDocument(description);
        slot.append(frame);
      });
      clearTimeout(timeout);
      if (signal.aborted) throw new Error('Background aborted');
      return pending;
    } catch {
      pending.dispose();
      return { source: iframe, commit() { clear(); }, dispose() {} };
    }
  }
  let signature = '';
  async function refresh() {
    if (!current || disposed) return;
    const old = current, token = version;
    const description = withOriginalBackground(old.description.doc, () => describePrototypeBackground(old.source, currentType));
    if (!description) return;
    const identity = JSON.stringify({ view: description.view, hosts: description.layers.map((layer) => ({ cls: layer.element.className, inline: layer.element.style.cssText, bg: layer.styles, before: layer.before?.['background-image'], after: layer.after?.['background-image'] })) });
    if (identity === signature) { resize(); return; }
    signature = identity;
    const next = await prepare(old.source, currentType, new AbortController().signal);
    if (token !== version || current !== old) { next.dispose(); return; }
    old.dispose(); // 同一个前景文档先撤旧透明层，再安装新层，避免嵌套恢复。
    current = null;
    next.commit();
  }
  return { prepare, clear, resize, dispose() { disposed = true; clear(); } };
}
