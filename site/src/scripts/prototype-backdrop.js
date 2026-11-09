import { describePrototypeBackground, extractPrototypePalette, resolvePrototypePalette } from './prototype-background.js';

const OWNER = 'data-uihub-background-host';
const DECOR = 'data-uihub-background-decor';
const CONTENT = 'data-uihub-replay-content';
const STYLE_ID = 'uihub-background-transparency';
const PALETTE_KEYS = ['--ink', '--ink-2', '--ink-3', '--gold', '--card', '--line', '--line-2', '--fill', '--fill-2', '--paper-2', '--detail-paper', '--detail-panel-bg', '--detail-tool-bg'];

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
  tree.querySelectorAll('script, iframe, object, embed, audio, video, source, meta, base').forEach((node) => node.remove());
  [tree, ...tree.querySelectorAll('*')].forEach((node) => {
    [...node.attributes].forEach(({ name, value }) => {
      if (/^on/i.test(name) || ['autofocus', 'srcdoc', 'action', 'formaction', 'form', 'ping'].includes(name)) node.removeAttribute(name);
      else if (['href', 'xlink:href', 'src'].includes(name) && /^\s*javascript:/i.test(value)) node.removeAttribute(name);
      else if ((name === 'href' || name === 'xlink:href') && value.startsWith('#')) node.setAttribute(name, 'about:srcdoc' + value);
      else if (value.includes('url(')) node.setAttribute(name, localFragments(value));
    });
    if (node.closest(`[${CONTENT}]`)) {
      if (node.tagName === 'IMG' || node.tagName === 'INPUT') { node.removeAttribute('src'); node.removeAttribute('srcset'); }
      if (node.tagName.toLowerCase() === 'image') { node.removeAttribute('href'); node.removeAttribute('xlink:href'); }
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
      const declarations = Object.entries(styles).map(([key, value]) => `${key}:${localFragments(value)}!important`).join(';');
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
  tree.querySelectorAll('style').forEach((node) => { node.textContent = localFragments(node.textContent); });
  const head = tree.querySelector('head');
  head.querySelectorAll('link').forEach((link) => { if (!link.rel?.split(/\s+/).includes('stylesheet')) link.remove(); });
  const base = doc.createElement('base');
  base.href = doc.baseURI;
  head.prepend(base);
  const policy = doc.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content = "default-src 'none'; script-src 'none'; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' https: http: data: blob:; font-src 'self' https: http: data:; form-action 'none'; frame-src 'none'; object-src 'none'";
  head.prepend(policy);
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

function stylesReady(doc, originalDoc) {
  const originalLinks = originalDoc && [...originalDoc.querySelectorAll('link[rel~="stylesheet"]')];
  return [...doc.querySelectorAll('link[rel~="stylesheet"]')].every((link) => {
    if (link.disabled || link.media && !doc.defaultView.matchMedia(link.media).matches) return true;
    if (!link.sheet) return false;
    try {
      const original = originalLinks?.find((node) => node.href === link.href);
      // 部分浏览器在 CSS 请求失败后仍留下空 stylesheet。
      return !original?.sheet?.cssRules.length || link.sheet.cssRules.length > 0;
    } catch { return true; }
  });
}

function loadBackgroundImages(description, signal, win) {
  const urls = new Set();
  const add = (value) => {
    if (!value || value.startsWith('#') || value.startsWith('about:srcdoc#')) return;
    const url = new URL(value, description.doc.baseURI);
    if (url.hash && url.href.split('#')[0] === description.doc.URL.split('#')[0]) return;
    urls.add(url.href);
  };
  for (const styles of description.layers.flatMap((layer) => [layer.styles, layer.before, layer.after]).concat(description.decorationStyles).filter(Boolean)) {
    for (const key of ['background-image', 'mask-image']) {
      for (const match of (styles[key] || '').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) add((match[1] ?? match[2] ?? match[3]).trim());
    }
  }
  description.decorations.forEach((node) => {
    [node, ...node.querySelectorAll('img, image')].forEach((image) => {
      if (image.tagName === 'IMG') add(image.currentSrc || image.src);
      else if (image.tagName.toLowerCase() === 'image') add(image.getAttribute('href') || image.getAttribute('xlink:href'));
    });
  });
  return Promise.all([...urls].map((url) => new Promise((resolve, reject) => {
    const image = new win.Image();
    const finish = (error) => {
      image.onload = image.onerror = null;
      signal.removeEventListener('abort', abort);
      image.removeAttribute('src');
      if (error) reject(error); else resolve();
    };
    const abort = () => finish(new Error('Background image aborted'));
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Background image unavailable'));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort(); else image.src = url;
  })));
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
    // color-scheme 一并归零：原型自己声明深色时，浏览器会给 iframe 画一块不透明的深色画布，
    // 背景复刻与抽离的窗口阴影就被这层不透明底色吞掉了。
    selectors.push(`[${OWNER}="${index}"]{background-color:transparent!important;background-image:none!important;color-scheme:normal!important}`);
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
  let current = null, version = 0, disposed = false;
  const retired = new Map(), preparing = new Set();
  const resetPalette = () => {
    PALETTE_KEYS.forEach((key) => root.style.removeProperty(key));
    delete root.dataset.detailTone;
  };
  const resize = () => {
    if (!current) return;
    const scale = backgroundCover(current.description.view, { width: root.clientWidth, height: root.clientHeight });
    current.frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };
  function clear() {
    version++;
    current?.dispose();
    current = null;
    preparing.forEach((pending) => pending.dispose());
    retired.forEach((timer, pending) => { clearTimeout(timer); pending.dispose(); });
    retired.clear();
    slot.replaceChildren();
    resetPalette();
  }
  const fallback = (iframe, signal) => {
    let dead = false;
    return { source: iframe, commit() { if (!dead && !disposed && !signal.aborted) clear(); }, dispose() { dead = true; } };
  };
  const capture = (iframe, type) => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return null;
      return withOriginalBackground(doc, () => {
        const description = describePrototypeBackground(iframe, type);
        if (!description) return null;
        const palette = extractPrototypePalette(description);
        const attributes = (node) => [...node.attributes].filter(({ name }) => name !== OWNER && name !== DECOR).map(({ name, value }) => [name, value]);
        const signature = JSON.stringify({ view: description.view, layers: description.layers.map(({ element, ...styles }) => ({ attributes: attributes(element), ...styles })), decorations: description.decorations.map((element, index) => ({ attributes: attributes(element), style: description.decorationStyles[index] })), palette });
        return { description, palette, signature };
      });
    } catch { return null; }
  };
  async function prepare(iframe, type, signal) {
    if (disposed || signal.aborted) return fallback(iframe, signal);
    const captured = capture(iframe, type);
    if (!captured) return fallback(iframe, signal);
    const { description, palette, signature } = captured;
    const { doc, win } = description;
    const frame = document.createElement('iframe');
    frame.className = 'detail-background-frame';
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.inert = true;
    frame.style.width = description.view.width + 'px';
    frame.style.height = description.view.height + 'px';
    frame.style.opacity = '0';
    frame.style.transform = `translate(-50%, -50%) scale(${backgroundCover(description.view, { width: root.clientWidth, height: root.clientHeight })})`;
    let dead = false, committed = false, restore = null, observer = null, timer = 0, refreshController = null;
    let stopWatching = () => {}, cancelLoad = () => {};
    const schedule = () => {
      if (dead || timer) return;
      timer = setTimeout(() => { timer = 0; refresh(pending); }, 80);
    };
    const pending = {
      frame, description, source: iframe, type, signature,
      dispose() {
        if (dead) return;
        dead = true;
        preparing.delete(pending);
        cancelLoad();
        clearTimeout(timer);
        refreshController?.abort();
        observer?.disconnect();
        stopWatching();
        restore?.();
        frame.remove();
      },
      commit() {
        if (committed || dead) return;
        if (signal.aborted || disposed) { pending.dispose(); return; }
        committed = true;
        preparing.delete(pending);
        const old = current;
        if (old?.source === iframe) old.dispose();
        current = pending;
        version++;
        restore = makeTransparent(description);
        const resolved = resolvePrototypePalette(palette);
        PALETTE_KEYS.forEach((key) => root.style.setProperty(key, resolved[key]));
        root.dataset.detailTone = resolved['--detail-tone'];
        frame.style.opacity = '1';
        resize();
        if (old && old.source !== iframe) {
          old.frame.remove();
          retired.set(old, setTimeout(() => { old.dispose(); retired.delete(old); }, 200));
        }
        observer = new MutationObserver((records) => {
          if (records.some((record) => doc.head.contains(record.target) || record.type !== 'attributes' || /^(style|class|data-)/.test(record.attributeName) && ![OWNER, DECOR].includes(record.attributeName))) schedule();
        });
        [...description.hosts, ...description.decorations].forEach((element) => observer.observe(element, { attributes: true }));
        observer.observe(doc.head, { subtree: true, childList: true, characterData: true, attributes: true });
        doc.addEventListener('change', schedule, { passive: true });
        doc.addEventListener('transitionend', schedule, { passive: true });
        win.addEventListener('resize', schedule, { passive: true });
        const styleError = (event) => { if (event.target.matches?.('link[rel~="stylesheet"]') && current === pending) clear(); };
        doc.head.addEventListener('load', schedule, true);
        doc.head.addEventListener('error', styleError, true);
        stopWatching = () => {
          doc.removeEventListener('change', schedule);
          doc.removeEventListener('transitionend', schedule);
          win.removeEventListener('resize', schedule);
          doc.head.removeEventListener('load', schedule, true);
          doc.head.removeEventListener('error', styleError, true);
        };
      },
    };
    async function refresh(old) {
      if (dead || current !== old || disposed) return;
      if (old.source.contentDocument && !stylesReady(old.source.contentDocument)) return;
      const token = version, nextCapture = capture(old.source, type);
      if (nextCapture?.signature === old.signature) { resize(); return; }
      refreshController?.abort();
      const controller = new AbortController();
      refreshController = controller;
      const next = await prepare(old.source, type, controller.signal);
      if (dead || token !== version || current !== old || controller.signal.aborted) { next.dispose(); return; }
      next.commit();
    }
    preparing.add(pending);
    try {
      const html = buildBackgroundDocument(description);
      await new Promise((resolve, reject) => {
        const resources = new AbortController();
        let settled = false;
        const finish = (error) => {
          if (settled) return;
          settled = true;
          resources.abort();
          clearTimeout(timeout);
          signal.removeEventListener('abort', abort);
          frame.removeEventListener('load', load);
          frame.removeEventListener('error', fail);
          cancelLoad = () => {};
          if (error) reject(error); else resolve();
        };
        const abort = () => finish(new Error('Background aborted'));
        const load = async () => {
          try {
            const replayDoc = frame.contentDocument;
            if (!stylesReady(replayDoc, doc) || !replayDoc.querySelector(`[${OWNER}]`)) { fail(); return; }
            await loadBackgroundImages(description, resources.signal, replayDoc.defaultView);
            finish();
          } catch { fail(); }
        };
        const fail = () => finish(new Error('Background unavailable'));
        const timeout = setTimeout(fail, 5000);
        cancelLoad = abort;
        signal.addEventListener('abort', abort, { once: true });
        frame.addEventListener('load', load, { once: true });
        frame.addEventListener('error', fail, { once: true });
        frame.srcdoc = html;
        slot.append(frame);
        if (signal.aborted) abort();
      });
      if (dead || signal.aborted) throw new Error('Background aborted');
      return pending;
    } catch {
      pending.dispose();
      return fallback(iframe, signal);
    }
  }
  return { prepare, clear, resize, dispose() { disposed = true; clear(); } };
}
