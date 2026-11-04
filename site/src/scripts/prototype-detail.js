import { coverRect, snapshotFrames, NO_BORDER } from './preview-motion.js';
import { configureFrameViewport } from './embedded-viewport.js';
import { loadPrototypeFrame, prototypeFrameShadow } from './prototype-frame.js';
import { createPrototypeBackdrop } from './prototype-backdrop.js';

const TEXT = {
  zh: {
    back: '返回画廊', open: '在新标签页打开原型', hideDetails: '收起参数', showDetails: '展开参数',
    fullscreen: '纯净全屏', restore: '还原展示', parameters: '原型参数', toolbar: '原型展示工具',
    previous: '上一个原型', next: '下一个原型',
    switching: '正在切换原型…', switchSlow: '新原型仍在加载，当前界面保持不变', switchError: '切换失败，当前原型保持不变，可重试',
    loading: '正在加载原型…', slow: '加载时间较长，可以继续等待或重试', error: '原型未能加载，请重试或在新标签页打开', retry: '重试',
    createdAt: '创建时间', updatedAt: '修改时间', model: '大模型', prompt: '提示词', promptCount: '对话轮次',
    images: '图片参数', type: '页面类型', source: '参考来源', durationSeconds: '生成耗时',
    copy: '复制提示词', copied: '已复制', copyFailed: '复制失败，请手动选择并复制',
    software: '软件', website: '网页', app: 'App', component: '组件',
  },
  en: {
    back: 'Back to gallery', open: 'Open prototype in a new tab', hideDetails: 'Hide parameters', showDetails: 'Show parameters',
    fullscreen: 'Clean fullscreen', restore: 'Restore viewer', parameters: 'Prototype parameters', toolbar: 'Prototype viewer tools',
    previous: 'Previous prototype', next: 'Next prototype',
    switching: 'Switching prototype…', switchSlow: 'Still loading. The current prototype is unchanged.', switchError: 'Switch failed. The current prototype is unchanged. Retry.',
    loading: 'Loading prototype…', slow: 'Taking longer than usual. You can wait or retry.', error: 'Unable to load the prototype. Retry or open it in a new tab.', retry: 'Retry',
    createdAt: 'Created', updatedAt: 'Modified', model: 'Model', prompt: 'Prompt', promptCount: 'Conversation rounds',
    images: 'Image parameters', type: 'Page type', source: 'Reference source', durationSeconds: 'Generation time',
    copy: 'Copy prompt', copied: 'Copied', copyFailed: 'Copy failed. Select and copy the text manually.',
    software: 'Software', website: 'Website', app: 'App', component: 'Component',
  },
};

export function prototypeHash(slug) {
  return '#prototype=' + encodeURIComponent(slug);
}

export function slugFromHash(hash) {
  return new URLSearchParams(hash.replace(/^#/, '')).get('prototype') || '';
}

export function formatDuration(seconds, lang = 'zh') {
  const value = Math.round(seconds);
  const h = Math.floor(value / 3600), m = Math.floor(value % 3600 / 60), s = value % 60;
  if (lang === 'en') return [h && h + 'h', m && m + 'm', (s || !value) && s + 's'].filter((v) => v !== false && v !== 0).join(' ');
  return [h && h + ' 小时', m && m + ' 分钟', (s || !value) && s + ' 秒'].filter((v) => v !== false && v !== 0).join(' ');
}

// 起止布局各测量一次，中间只使用合成层的 transform。
export function rectTransform(from, to) {
  if (!from || !to || to.width <= 0 || to.height <= 0 || from.width <= 0 || from.height <= 0) return 'none';
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

export async function copyText(text, { clipboard = globalThis.navigator?.clipboard, container } = {}) {
  if (clipboard?.writeText) {
    try { await clipboard.writeText(text); return; } catch { /* 不可用或权限被拒绝时尝试浏览器本地复制能力。 */ }
  }
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') throw new Error('Clipboard unavailable');
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;';
  const focused = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, n) => selection.getRangeAt(n).cloneRange()) : [];
  (container || document.body).append(area);
  try {
    area.select();
    if (!document.execCommand('copy')) throw new Error('Copy failed');
  } finally {
    area.remove();
    focused?.focus?.({ preventScroll: true });
    selection?.removeAllRanges();
    ranges.forEach((range) => selection.addRange(range));
  }
}

export function neighborSlug(sequence, slug, direction) {
  const index = sequence.indexOf(slug);
  return index < 0 ? null : sequence[index + direction] || null;
}

export function initPrototypeDetail({ page, cards, getLanguage, onBusyChange, getSequence = () => cards.filter((card) => !card.hidden).map((card) => card.dataset.slug) }) {
  const root = document.querySelector('[data-detail]');
  if (!root) return null;
  const $ = (selector) => root.querySelector(selector);
  const items = new Map(JSON.parse(root.dataset.detailItems).map((item) => [item.slug, item]));
  const surface = $('[data-detail-surface]'), preview = $('[data-detail-preview]');
  const crop = $('[data-detail-snapshot-crop]'), snapshot = $('[data-detail-snapshot]'), host = $('[data-detail-host]');
  const backdrop = createPrototypeBackdrop(root, $('[data-detail-background]'));
  const fields = $('[data-detail-fields]'), drawer = $('[data-detail-drawer]');
  const back = $('[data-detail-back]'), heading = $('[data-detail-heading]'), toolbar = $('[data-detail-toolbar]');
  const restore = $('[data-detail-restore]');
  const loading = $('[data-detail-loading]'), retry = $('[data-detail-retry]');
  const panelToggle = $('[data-detail-toggle-drawer]');
  const previous = $('[data-detail-previous]'), next = $('[data-detail-next]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const styles = getComputedStyle(root);
  const ease = styles.getPropertyValue('--ease').trim();
  const sharedEase = styles.getPropertyValue('--ease-shared').trim();
  const animations = new Set();
  let active = null, desired = '', routing = false;
  let savedScroll = null, savedFocus = null, savedPageWidth = '';
  let snapshotImage = null, imageSize = null;
  const copyPrompts = new WeakMap(), copyTimers = new Map();
  let loadVersion = 0, loadController = null, loadTimer = 0, loadState = 'loading';
  let currentFrame = null, switchController = null, switchingTo = '', switchState = 'switching', retryItem = null;
  let layoutVersion = 0, scrollRestoration = history.scrollRestoration;
  const d = () => TEXT[getLanguage()] || TEXT.zh;
  const duration = () => reduce.matches ? 160 : 500;
  const paint = () => new Promise((resolve) => requestAnimationFrame(resolve));

  function animate(element, keyframes, options = {}) {
    return Promise.all([element, prototypeFrameShadow(element)].filter(Boolean).map((target) => {
      const animation = target.animate(keyframes, { duration: duration(), easing: sharedEase, fill: 'both', ...options });
      animations.add(animation);
      return animation.finished.catch(() => {});
    }));
  }
  function clearAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }
  function finishAnimations() {
    animations.forEach((animation) => { if (animation.playState !== 'finished') animation.finish(); });
  }
  function adjacent(direction) {
    return active ? neighborSlug(getSequence().filter((slug) => items.has(slug)), active.slug, direction) : null;
  }
  function updateNeighbors() {
    previous.disabled = root.dataset.phase !== 'open' || !adjacent(-1);
    next.disabled = root.dataset.phase !== 'open' || !adjacent(1);
  }
  function phase(value) {
    root.dataset.phase = value;
    updateNeighbors();
  }
  function setChrome(show) {
    root.dataset.chrome = show ? 'on' : 'off';
    heading.inert = !show;
    back.inert = !show;
    toolbar.inert = !show || root.dataset.swapping === 'true';
    panelToggle.inert = !show || root.dataset.swapping === 'true';
    drawer.inert = !show || root.dataset.drawer !== 'open';
  }
  function lock() {
    onBusyChange(true);
    savedScroll = { x: scrollX, y: scrollY };
    savedFocus = document.activeElement;
    scrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    // 锁滚动时撤掉 gutter，但只补偿隐藏主页的宽度，详情仍占满真实视口。
    const gap = Math.max(0, innerWidth - document.documentElement.clientWidth);
    savedPageWidth = page.style.width;
    page.style.width = gap ? `calc(100% - ${gap}px)` : '100%';
    document.documentElement.classList.add('detail-scroll-locked');
    page.inert = true;
  }
  function unlock() {
    page.classList.remove('is-concealed');
    page.inert = false;
    document.documentElement.classList.remove('detail-scroll-locked');
    page.style.width = savedPageWidth;
    if (savedScroll) window.scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: 'instant' });
    savedFocus?.focus?.({ preventScroll: true });
    history.scrollRestoration = scrollRestoration;
    savedScroll = null;
    onBusyChange(false);
  }

  function makeCopyButton(prompt) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'detail-icon detail-copy';
    button.dataset.copyPrompt = '';
    button.dataset.detailLabel = 'copy';
    const icon = document.createElement('i');
    icon.className = 'ti ti-copy';
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    copyPrompts.set(button, prompt);
    return button;
  }
  function clearCopyTimers() {
    copyTimers.forEach((timer) => clearTimeout(timer));
    copyTimers.clear();
  }
  function renderFields() {
    clearCopyTimers();
    fields.replaceChildren();
    if (!active) return;
    const values = active.details;
    const dl = document.createElement('dl');
    dl.className = 'detail-fields';
    const compact = new Set(['prompt', 'source', 'createdAt', 'updatedAt', 'model', 'type', 'promptCount', 'durationSeconds']);
    const keys = ['prompt', 'model', 'type', 'source', 'durationSeconds', 'promptCount', 'images', 'createdAt', 'updatedAt'];
    keys.forEach((key) => {
      if (!(key in values)) return;
      const row = document.createElement('div');
      row.className = 'detail-field' + (compact.has(key) ? ' is-compact' : '');
      row.dataset.field = key;
      row.style.setProperty('--field-order', String(Math.min(dl.children.length, 3)));
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = d()[key];
      if (key === 'prompt') dt.append(makeCopyButton(values.prompt));
      if (key === 'source') {
        const link = document.createElement('a');
        link.href = values.source.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = values.source.raw;
        dd.append(link);
      } else if (key === 'images') {
        values.images.forEach((image) => {
          const record = document.createElement('div');
          record.className = 'detail-image-record';
          const content = document.createElement('div');
          content.className = 'detail-image-content';
          if (image.model) {
            const model = document.createElement('span');
            model.className = 'detail-image-model';
            model.textContent = image.model;
            content.append(model);
          }
          if (image.prompt) {
            const prompt = document.createElement('p');
            prompt.className = 'detail-image-prompt';
            prompt.textContent = image.prompt;
            content.append(prompt);
          }
          record.append(content);
          if (image.prompt) record.append(makeCopyButton(image.prompt));
          dd.append(record);
        });
      } else {
        dd.textContent = key === 'type' ? (d()[values.type] || values.type)
          : key === 'durationSeconds' ? formatDuration(values[key], getLanguage()) : String(values[key]);
      }
      row.append(dt, dd);
      dl.append(row);
    });
    fields.append(dl);
  }

  function updateLabels() {
    root.setAttribute('aria-label', d().parameters);
    drawer.setAttribute('aria-label', d().parameters);
    toolbar.setAttribute('aria-label', d().toolbar);
    const toggle = $('[data-detail-toggle-drawer]');
    toggle.dataset.detailLabel = root.dataset.drawer === 'open' ? 'hideDetails' : 'showDetails';
    root.querySelectorAll('[data-detail-label]').forEach((element) => {
      const label = d()[element.dataset.detailLabel];
      element.setAttribute('aria-label', label);
    });
    root.querySelectorAll('[data-detail-text]').forEach((element) => { element.textContent = d()[element.dataset.detailText]; });
    updateLoadingUI();
  }
  function updateLoadingUI() {
    const switching = root.dataset.phase === 'switching';
    const key = switching ? switchState : retryItem ? 'switchError' : loadState;
    loading.hidden = !switching && !retryItem && loadState === 'ready';
    retry.hidden = switching || (!retryItem && loadState !== 'error' && loadState !== 'slow');
    $('[data-detail-status]').textContent = key === 'ready' ? '' : d()[key];
  }
  function revealSnapshot() {
    root.dataset.revealed = String(loadState === 'ready' && ['open', 'switching', 'leaving'].includes(root.dataset.phase));
  }
  function setLoadState(value) {
    loadState = value;
    root.dataset.load = value === 'slow' ? 'loading' : value;
    revealSnapshot();
    updateLabels();
  }
  function stopLoad({ keepFrames = false } = {}) {
    loadVersion++;
    loadController?.abort();
    clearTimeout(loadTimer);
    currentFrame = null;
    if (!keepFrames) { backdrop.clear(); host.replaceChildren(); }
  }
  function loadPrototype() {
    stopLoad();
    retryItem = null;
    if (!active) return;
    setLoadState('loading');
    const version = loadVersion;
    loadController = new AbortController();
    const { signal } = loadController;
    const frame = loadPrototypeFrame(active, host, signal);
    currentFrame = frame.iframe;
    frame.ready.then(async () => {
      if (version !== loadVersion || signal.aborted) return;
      const background = await backdrop.prepare(frame.iframe, active.details.type, signal);
      if (version !== loadVersion || signal.aborted || root.dataset.phase === 'leaving') { background.dispose(); return; }
      clearTimeout(loadTimer);
      background.commit();
      frame.iframe.style.opacity = '1';
      frame.iframe.style.pointerEvents = '';
      frame.iframe.inert = false;
      configureFrameViewport(frame.iframe);
      setLoadState('ready');
    }).catch(() => {
      if (version !== loadVersion || signal.aborted) return;
      clearTimeout(loadTimer);
      setLoadState('error');
    });
    loadTimer = setTimeout(() => {
      if (version === loadVersion && loadState === 'loading') setLoadState('slow');
    }, 12000);
  }

  function cardFor(slug) { return cards.find((card) => card.dataset.slug === slug && !card.hidden); }
  function visibleRect(card) {
    if (!card) return null;
    const rect = card.querySelector('.frame').getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight ? rect : null;
  }
  function captureCard(card) {
    const frame = card?.querySelector('.frame');
    const image = card?.querySelector('.frame img.is-on');
    if (!frame || !image) return null;
    const rect = frame.getBoundingClientRect();
    const css = getComputedStyle(frame);
    const sx = rect.width / (parseFloat(css.width) || frame.offsetWidth || rect.width);
    const sy = rect.height / (parseFloat(css.height) || frame.offsetHeight || rect.height);
    const border = {
      left: (parseFloat(css.borderLeftWidth) || frame.clientLeft || 0) * sx,
      right: (parseFloat(css.borderRightWidth) || frame.clientLeft || 0) * sx,
      top: (parseFloat(css.borderTopWidth) || frame.clientTop || 0) * sy,
      bottom: (parseFloat(css.borderBottomWidth) || frame.clientTop || 0) * sy,
    };
    const content = { left: rect.left + border.left, top: rect.top + border.top, width: rect.width - border.left - border.right, height: rect.height - border.top - border.bottom };
    const size = { width: image.naturalWidth || 1600, height: image.naturalHeight || 1000 };
    const zoom = image.getBoundingClientRect().width / content.width;
    return { image, size, border, paint: coverRect(content, size, zoom || 1) };
  }
  function makeSnapshot(cardImage) {
    crop.replaceChildren();
    snapshotImage = null;
    imageSize = null;
    root.dataset.cover = String(Boolean(cardImage));
    snapshot.hidden = !cardImage;
    if (!cardImage) return;
    imageSize = cardImage.size;
    snapshotImage = document.createElement('img');
    snapshotImage.src = cardImage.image.currentSrc || cardImage.image.src;
    snapshotImage.alt = '';
    snapshotImage.style.width = imageSize.width + 'px';
    snapshotImage.style.height = imageSize.height + 'px';
    crop.append(snapshotImage);
  }
  function positionSnapshot(rect) {
    if (!snapshotImage) return;
    const paint = coverRect(rect, imageSize);
    snapshotImage.style.transform = `translate(${paint.left - rect.left}px, ${paint.top - rect.top}px) scale(${paint.width / imageSize.width})`;
    crop.style.clipPath = 'inset(0px)';
  }
  function moveSnapshot(from, to, layout, paintFrom, paintTo, borderFrom = NO_BORDER, borderTo = NO_BORDER, options = {}) {
    if (!snapshotImage) return [];
    const frames = snapshotFrames({ from, to, layout, imageSize, paintFrom, paintTo, borderFrom, borderTo });
    snapshotImage.style.transform = frames.image.at(-1).transform;
    crop.style.clipPath = frames.crop.at(-1).clipPath;
    if (reduce.matches) return [];
    return [animate(snapshotImage, frames.image, options), animate(crop, frames.crop, options)];
  }

  async function enter(item) {
    // 先记录点击时的真实裁剪和 hover 放大，不能等隐藏主页后再猜截图尺寸。
    const card = cardFor(item.slug);
    const from = visibleRect(card);
    const cardImage = captureCard(card);
    lock();
    active = item;
    root.hidden = false;
    root.dataset.drawer = 'open';
    root.dataset.clean = 'false';
    root.dataset.revealed = 'false';
    $('[data-detail-toggle-drawer]').setAttribute('aria-expanded', 'true');
    restore.hidden = true;
    setChrome(false);
    phase('entering');
    renderFields();
    fields.scrollTop = 0;
    $('[data-detail-open]').href = item.href;
    makeSnapshot(cardImage);
    card?.classList.add('is-detail-origin');
    setLoadState('loading');
    root.focus({ preventScroll: true });
    const to = preview.getBoundingClientRect();
    const viewport = surface.getBoundingClientRect();
    const spatial = Boolean(from) && !reduce.matches;
    const motions = [
      animate(surface, spatial ? [{ transform: rectTransform(from, viewport), opacity: 0.2 }, { transform: 'none', opacity: 1 }] : [{ opacity: 0 }, { opacity: 1 }]),
      animate(preview, spatial ? [{ transform: rectTransform(from, to) }, { transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }]),
      ...moveSnapshot(spatial ? from : to, to, to, spatial && cardImage ? cardImage.paint : imageSize && coverRect(to, imageSize), imageSize && coverRect(to, imageSize), spatial && cardImage ? cardImage.border : NO_BORDER),
      animate(page, [{ opacity: 1 }, { opacity: 0 }], { easing: ease }),
    ];
    // 先交给合成层启动过渡，再让原型加载；不把网络等待放进动画时间线。
    await paint();
    if (desired === item.slug) loadPrototype();
    await Promise.all(motions);
    page.classList.add('is-concealed');
    clearAnimations();
    positionSnapshot(preview.getBoundingClientRect());
    phase('open');
    revealSnapshot();
    setChrome(true);
    back.focus({ preventScroll: true });
  }

  async function leave() {
    phase('leaving');
    loadVersion++;
    loadController?.abort();
    clearTimeout(loadTimer);
    ++layoutVersion;
    restore.hidden = true;
    clearCopyTimers();
    setChrome(false);
    // 真实页面保持显示，组件退出后直接缩回；不再为退场恢复截图。
    await animate(root, [{ opacity: 1 }, { opacity: 1 }], { duration: reduce.matches ? 160 : 280, easing: ease });
    clearAnimations();
    page.classList.remove('is-concealed');
    const card = cardFor(active.slug);
    const to = visibleRect(card);
    const cardImage = loadState !== 'ready' ? captureCard(card) : null;
    card?.classList.remove('is-detail-origin');
    const from = preview.getBoundingClientRect();
    const viewport = surface.getBoundingClientRect();
    const spatial = Boolean(to) && !reduce.matches;
    await Promise.all([
      animate(surface, spatial ? [{ transform: 'none', opacity: 1 }, { transform: rectTransform(to, viewport), opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }]),
      animate(preview, spatial ? [{ transform: 'none', opacity: 1, offset: 0 }, { opacity: 1, offset: .55 }, { transform: rectTransform(to, from), opacity: 0, offset: 1 }] : [{ opacity: 1 }, { opacity: 0 }]),
      ...(loadState !== 'ready' ? moveSnapshot(from, spatial ? to : from, from, imageSize && coverRect(from, imageSize), spatial && cardImage ? cardImage.paint : imageSize && coverRect(from, imageSize), NO_BORDER, spatial && cardImage ? cardImage.border : NO_BORDER) : []),
      animate(page, [{ opacity: 0 }, { opacity: 1 }], { easing: ease }),
    ]);
    root.hidden = true;
    clearAnimations();
    card?.classList.remove('is-detail-origin');
    stopLoad();
    active = null;
    phase('idle');
    unlock();
  }

  async function switchPrototype(item) {
    ++layoutVersion;
    finishAnimations();
    clearAnimations();
    switchingTo = item.slug;
    switchState = 'switching';
    retryItem = null;
    const controller = new AbortController();
    switchController = controller;
    phase('switching');
    updateLabels();
    let prepared = null, background = null, outgoing = null, adopted = false;
    const timer = setTimeout(() => {
      if (switchController === controller) { switchState = 'switchSlow'; updateLabels(); }
    }, 12000);
    try {
      // 原型就绪前保留旧 iframe 与参数，预加载层不接收鼠标事件。
      prepared = loadPrototypeFrame(item, host, controller.signal);
      await prepared.ready;
      if (controller.signal.aborted || desired !== item.slug) return;
      background = await backdrop.prepare(prepared.iframe, item.details.type, controller.signal);
      if (controller.signal.aborted || desired !== item.slug) return;
      ++layoutVersion;
      finishAnimations();
      clearAnimations();
      root.dataset.swapping = 'true';
      fields.inert = true;
      restore.inert = true;
      setChrome(root.dataset.clean !== 'true');
      await animate(fields, [{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: ease });
      if (controller.signal.aborted || desired !== item.slug) return;
      outgoing = currentFrame;
      const coverOpacity = snapshot.hidden || root.dataset.cover !== 'true' ? 0 : parseFloat(getComputedStyle(snapshot).opacity) || (root.dataset.revealed === 'true' ? 0 : 1);
      cardFor(active.slug)?.classList.remove('is-detail-origin');
      stopLoad({ keepFrames: true });
      active = item;
      currentFrame = prepared.iframe;
      loadController = controller;
      switchController = null;
      adopted = true;
      cardFor(item.slug)?.classList.add('is-detail-origin');
      renderFields();
      fields.scrollTop = 0;
      $('[data-detail-open]').href = item.href;
      if (outgoing) { outgoing.style.zIndex = '1'; outgoing.inert = true; }
      currentFrame.style.zIndex = '0';
      currentFrame.style.opacity = '1';
      currentFrame.style.pointerEvents = '';
      currentFrame.inert = false;
      configureFrameViewport(currentFrame);
      background.commit();
      setLoadState('ready');
      await Promise.all([
        ...(outgoing ? [animate(outgoing, [{ opacity: Number(outgoing.style.opacity) || 0 }, { opacity: 0 }], { duration: 180, easing: ease })] : []),
        animate(fields, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: ease }),
        ...(coverOpacity ? [animate(snapshot, [{ opacity: coverOpacity }, { opacity: 0 }], { duration: 180, easing: ease })] : []),
      ]);
    } catch {
      if (!adopted && !controller.signal.aborted && desired === item.slug) {
        // 失败保持原对象、原参数和原链接；重试仍针对这次失败的目标。
        retryItem = item;
        desired = active.slug;
        const url = new URL(location.href);
        url.hash = prototypeHash(active.slug);
        history.replaceState({ ...history.state, prototype: active.slug }, '', url);
      }
    } finally {
      clearTimeout(timer);
      if (!adopted) { controller.abort(); background?.dispose(); prepared?.iframe.remove(); }
      else { outgoing?.remove(); makeSnapshot(null); currentFrame.inert = false; }
      if (switchController === controller) switchController = null;
      switchingTo = '';
      clearAnimations();
      root.dataset.swapping = 'false';
      fields.inert = false;
      restore.inert = false;
      phase('open');
      revealSnapshot();
      setChrome(root.dataset.clean !== 'true');
      updateLabels();
    }
  }

  async function syncRoute() {
    const slug = slugFromHash(location.hash);
    desired = items.has(slug) ? slug : '';
    if (routing) {
      if (['entering', 'switching'].includes(root.dataset.phase) && desired !== (switchingTo || active?.slug)) {
        switchController?.abort();
        finishAnimations();
      }
      return;
    }
    routing = true;
    try {
      while (desired !== (active?.slug || '')) {
        if (active && !desired) await leave();
        else if (active) await switchPrototype(items.get(desired));
        else {
          const next = items.get(desired);
          if (next) await enter(next);
        }
      }
    } finally { routing = false; }
  }

  function open(slug) {
    if (!items.has(slug) || root.dataset.phase !== 'idle') return;
    const url = new URL(location.href);
    url.hash = prototypeHash(slug);
    history.pushState({ ...history.state, prototype: slug, galleryReturn: location.href }, '', url);
    syncRoute();
  }
  function navigateNeighbor(direction) {
    if (root.dataset.phase !== 'open') return;
    const slug = adjacent(direction);
    if (!slug) return;
    const url = new URL(location.href);
    url.hash = prototypeHash(slug);
    // 连续浏览属于同一次详情访问，不堆叠历史；返回仍一次回到原画廊。
    history.replaceState({ ...history.state, prototype: slug }, '', url);
    syncRoute();
  }

  function goBack() {
    if (!active || root.dataset.phase === 'leaving') return;
    if (history.state?.galleryReturn) {
      history.back();
    } else {
      const url = new URL(location.href);
      url.hash = '';
      history.replaceState(history.state, '', url);
      syncRoute();
    }
  }

  async function changeLayout(update) {
    if (!['open', 'switching'].includes(root.dataset.phase) || root.dataset.swapping === 'true') return;
    const version = ++layoutVersion;
    const from = preview.getBoundingClientRect();
    const paintFrom = snapshotImage?.getBoundingClientRect();
    finishAnimations();
    clearAnimations();
    update();
    const to = preview.getBoundingClientRect();
    backdrop.resize();
    if (!reduce.matches) {
      await Promise.all([
        animate(preview, [{ transform: rectTransform(from, to) }, { transform: 'none' }], { duration: 280, easing: ease }),
        ...moveSnapshot(from, to, to, paintFrom, imageSize && coverRect(to, imageSize), NO_BORDER, NO_BORDER, { duration: 280, easing: ease }),
      ]);
      if (version === layoutVersion && ['open', 'switching'].includes(root.dataset.phase) && root.dataset.swapping !== 'true') clearAnimations();
    } else positionSnapshot(to);
  }
  function toggleDrawer() {
    changeLayout(() => {
      const open = root.dataset.drawer !== 'open';
      root.dataset.drawer = open ? 'open' : 'closed';
      drawer.inert = !open;
      $('[data-detail-toggle-drawer]').setAttribute('aria-expanded', String(open));
      updateLabels();
    });
  }
  function setClean(clean) {
    changeLayout(() => {
      root.dataset.clean = String(clean);
      setChrome(!clean);
      restore.hidden = !clean;
      (clean ? restore : $('[data-detail-fullscreen]')).focus({ preventScroll: true });
    });
  }

  async function copyPrompt(event) {
    const button = event.target.closest('[data-copy-prompt]');
    if (!button || button.disabled || !copyPrompts.has(button)) return;
    const version = loadVersion;
    button.disabled = true;
    clearTimeout(copyTimers.get(button));
    let result = 'copied';
    try { await copyText(copyPrompts.get(button), { container: root }); }
    catch { result = 'copyFailed'; }
    button.disabled = false;
    if (version !== loadVersion || !['open', 'switching'].includes(root.dataset.phase) || root.dataset.swapping === 'true' || button.isConnected === false) return;
    button.dataset.result = result;
    button.dataset.detailLabel = result;
    button.querySelector('i').className = 'ti ' + (result === 'copied' ? 'ti-check' : 'ti-alert-circle');
    $('[data-detail-copy-status]').textContent = d()[result];
    updateLabels();
    copyTimers.set(button, setTimeout(() => {
      button.dataset.result = '';
      button.dataset.detailLabel = 'copy';
      button.querySelector('i').className = 'ti ti-copy';
      copyTimers.delete(button);
      updateLabels();
    }, 2000));
  }

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.closest('.src-link')) return;
      if (event.target.closest('a') && !event.target.closest('.media')) return;
      event.preventDefault();
      open(card.dataset.slug);
    });
  });
  back.addEventListener('click', goBack);
  panelToggle.addEventListener('click', toggleDrawer);
  previous.addEventListener('click', () => navigateNeighbor(-1));
  next.addEventListener('click', () => navigateNeighbor(1));
  $('[data-detail-scrim]').addEventListener('click', toggleDrawer);
  $('[data-detail-fullscreen]').addEventListener('click', () => setClean(true));
  restore.addEventListener('click', () => setClean(false));
  retry.addEventListener('click', () => {
    if (!retryItem) { loadPrototype(); return; }
    const url = new URL(location.href);
    url.hash = prototypeHash(retryItem.slug);
    history.replaceState({ ...history.state, prototype: retryItem.slug }, '', url);
    syncRoute();
  });
  fields.addEventListener('click', copyPrompt);
  addEventListener('popstate', syncRoute);
  addEventListener('hashchange', syncRoute);
  addEventListener('resize', () => {
    if (!active) return;
    finishAnimations();
    backdrop.resize();
    requestAnimationFrame(() => { if (root.dataset.phase === 'open') positionSnapshot(preview.getBoundingClientRect()); });
  }, { passive: true });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (root.dataset.clean === 'true') setClean(false); else goBack();
  });
  // iframe 内的 Escape 不会冒泡到父文档，仍使用同一个还原/返回入口。
  host.addEventListener('load', (event) => {
    const frame = event.target;
    if (frame.tagName !== 'IFRAME') return;
    configureFrameViewport(frame);
    if (frame === currentFrame && loadState === 'ready') {
      const version = loadVersion, controller = loadController;
      backdrop.prepare(frame, active.details.type, controller.signal).then((background) => {
        if (version === loadVersion && !controller.signal.aborted && root.dataset.phase !== 'leaving') background.commit();
        else background.dispose();
      });
    }
    try { frame.contentDocument?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented && root.dataset.clean === 'true') setClean(false);
    }); } catch { /* 原型内部跳转至外部域名时不访问其文档。 */ }
  }, true);
  updateLabels();
  updateNeighbors();
  syncRoute();
  return {
    get active() { return root.dataset.phase !== 'idle'; },
    setLanguage() { renderFields(); updateLabels(); },
  };
}
