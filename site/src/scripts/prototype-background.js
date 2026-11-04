export function colorToRgba(value = '') {
  const color = value.trim().toLowerCase();
  if (color === 'transparent') return [0, 0, 0, 0];
  if (/^#[\da-f]{3,8}$/.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((part) => part + part).join('');
    if (hex.length !== 6 && hex.length !== 8) return null;
    return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
  }
  const rgb = color.match(/^rgba?\((.+)\)$/), srgb = color.match(/^color\(srgb\s+(.+)\)$/);
  if (!rgb && !srgb) return null;
  const parts = (rgb?.[1] || srgb[1]).split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const clamp = (n, max = 1) => Math.max(0, Math.min(max, n));
  const channels = parts.slice(0, 3).map((part) => clamp(parseFloat(part) * (part.endsWith('%') ? 2.55 : srgb ? 255 : 1), 255));
  const alpha = parts[3] == null ? 1 : clamp(parseFloat(parts[3]) / (parts[3].endsWith('%') ? 100 : 1));
  return [...channels, alpha].every(Number.isFinite) ? [...channels, alpha] : null;
}

export function compositeColor(color, base = [234, 232, 225]) {
  return color.slice(0, 3).map((n, i) => Math.round(n * color[3] + base[i] * (1 - color[3])));
}
export const rgbText = (rgb) => `rgb(${rgb.slice(0, 3).map(Math.round).join(', ')})`;
export function contrast(a, b) {
  const luminance = (rgb) => rgb.slice(0, 3).map((n) => { const s = n / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

const BACKGROUND_PROPERTIES = ['background-color', 'background-image', 'background-position', 'background-size', 'background-repeat', 'background-origin', 'background-clip', 'background-attachment', 'background-blend-mode'];
const DECOR_PROPERTIES = [...BACKGROUND_PROPERTIES, 'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'opacity', 'transform', 'transform-origin', 'filter', 'mix-blend-mode', 'clip-path', 'mask-image', 'mask-size', 'mask-position', 'mask-repeat', 'border', 'border-radius', 'box-shadow', 'z-index', 'animation-name', 'animation-duration', 'animation-delay', 'animation-timing-function', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode'];
const WRAPPER = /(?:^|[\s_-])(stage|backdrop|desk|scene|demo-stage|prototype-stage)(?:$|[\s_-])/i;

export function hasBackground(css) {
  return Boolean((colorToRgba(css.backgroundColor)?.[3] || 0) > 0 || (css.backgroundImage && css.backgroundImage !== 'none'));
}
export function isBackgroundWrapper(element, css, view) {
  const rect = element.getBoundingClientRect();
  const full = rect.width >= view.width * .97 && rect.height >= view.height * .9;
  const centered = ['center', 'space-around'].includes(css.justifyContent) || css.placeItems?.includes('center') || css.alignItems === 'center';
  return full && WRAPPER.test(element.className || '') && centered && element.tagName !== 'CANVAS';
}
export function isBackgroundDecoration(element, css, view) {
  const rect = element.getBoundingClientRect();
  const positioned = css.position === 'fixed' || css.position === 'absolute';
  const behind = Number.parseInt(css.zIndex, 10) < 0;
  const wide = rect.width >= view.width * .75 && rect.height >= view.height * .75;
  return positioned && (behind || (css.pointerEvents === 'none' && wide && element.getAttribute('aria-hidden') === 'true'));
}

function snapshotStyle(css, properties) {
  return Object.fromEntries(properties.map((name) => [name, css.getPropertyValue(name)]).filter(([, value]) => value));
}
function pseudoBackground(win, host, kind) {
  const css = win.getComputedStyle(host, kind);
  if (css.content === 'none' || css.content === 'normal' || !hasBackground(css)) return null;
  if (!['fixed', 'absolute'].includes(css.position) && host.tagName !== 'BODY' && host.tagName !== 'HTML') return null;
  return snapshotStyle(css, DECOR_PROPERTIES);
}

// 描述只读当前文档；分离由背景准备成功后的 commit 执行，不能在预加载阶段改原型。
export function describePrototypeBackground(iframe, type) {
  try {
    const doc = iframe.contentDocument, win = doc?.defaultView;
    if (!doc?.body || !win) return null;
    const view = { width: iframe.clientWidth || win.innerWidth, height: iframe.clientHeight || win.innerHeight };
    if (!view.width || !view.height) return null;
    const hosts = [doc.documentElement, doc.body];
    if (['software', 'app', 'component'].includes(type)) {
      let parent = doc.body;
      for (let depth = 0; depth < 4; depth++) {
        const wrappers = [...parent.children].filter((child) => isBackgroundWrapper(child, win.getComputedStyle(child), view));
        if (wrappers.length !== 1) break;
        hosts.push(wrappers[0]);
        parent = wrappers[0];
      }
    }
    const deepest = hosts.at(-1), decorations = [], content = [];
    for (const child of deepest.children) {
      if (['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) continue;
      const css = win.getComputedStyle(child), rect = child.getBoundingClientRect();
      if (rect.width < 1 && rect.height < 1) continue; // SVG 定义等保持原结构，但不当作窗口。
      if (isBackgroundDecoration(child, css, view)) decorations.push(child); else content.push(child);
    }
    if (decorations.some((node) => ['CANVAS', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED'].includes(node.tagName))) return null;
    const layers = hosts.map((element) => ({ element, styles: snapshotStyle(win.getComputedStyle(element), BACKGROUND_PROPERTIES), before: pseudoBackground(win, element, '::before'), after: pseudoBackground(win, element, '::after') }));
    const hasLayer = layers.some((layer) => hasBackground(win.getComputedStyle(layer.element)) || layer.before || layer.after);
    if (!hasLayer && !decorations.length) return null;
    return { doc, win, view, hosts, layers, decorations, content };
  } catch { return null; }
}

const SEMANTICS = {
  foreground: ['--ink', '--text', '--text-primary', '--foreground', '--panel-ink'],
  muted: ['--muted', '--ink-2', '--text-muted', '--panel-muted'],
  accent: ['--accent', '--brand', '--primary', '--gold'],
  surface: ['--panel', '--card', '--surface', '--paper'],
};
export function extractPrototypePalette(description) {
  if (!description) return {};
  const { win, doc } = description, css = win.getComputedStyle(doc.body), rootCss = win.getComputedStyle(doc.documentElement);
  const get = (keys) => keys.map((key) => colorToRgba(css.getPropertyValue(key) || rootCss.getPropertyValue(key))).find((color) => color && color[3] > 0);
  const palette = Object.fromEntries(Object.entries(SEMANTICS).map(([key, keys]) => [key, get(keys)]));
  palette.foreground ||= colorToRgba(css.color);
  const samples = [];
  for (const layer of description.layers) {
    const color = colorToRgba(layer.styles['background-color']);
    if (color?.[3]) samples.push(compositeColor(color));
    // 渐变停靠色作为安全参考，不把原渐变降级成这些样本。
    for (const value of (layer.styles['background-image'] || '').matchAll(/rgba?\([^)]*\)|#[\da-f]{3,8}\b/gi)) {
      const stop = colorToRgba(value[0]);
      if (stop?.[3]) samples.push(compositeColor(stop, samples.at(-1)));
    }
  }
  palette.samples = samples.length ? samples : [[234, 232, 225]];
  return palette;
}

export function resolvePrototypePalette(source = {}) {
  const samples = source.samples?.length ? source.samples : [[234, 232, 225]];
  const score = (rgb) => Math.min(...samples.map((bg) => contrast(rgb, bg)));
  const dark = [244, 243, 238], light = [23, 22, 20];
  const original = source.foreground && compositeColor(source.foreground, samples[0]);
  const foreground = original && score(original) >= 4.5 ? original : score(dark) > score(light) ? dark : light;
  const needsPanel = score(foreground) < 4.5;
  let surface = source.surface && compositeColor(source.surface, samples[0]);
  if (!surface || contrast(foreground, surface) < 4.5) surface = foreground === dark ? [35, 37, 40] : [244, 243, 238];
  const backgrounds = needsPanel ? [surface] : samples;
  const safeMuted = (color) => {
    let rgb = color ? compositeColor(color, backgrounds[0]) : foreground.map((n, i) => Math.round(n * .7 + backgrounds[0][i] * .3));
    for (let step = 0; step < 10 && Math.min(...backgrounds.map((bg) => contrast(rgb, bg))) < 4.5; step++) rgb = rgb.map((n, i) => Math.round(n * .75 + foreground[i] * .25));
    return rgb;
  };
  const muted = safeMuted(source.muted), accent = safeMuted(source.accent);
  const whiteText = contrast(foreground, [0, 0, 0]) > contrast(foreground, [255, 255, 255]);
  const line = `rgba(${foreground.join(', ')}, .16)`;
  return {
    '--ink': rgbText(foreground), '--ink-2': rgbText(muted), '--ink-3': rgbText(muted), '--gold': rgbText(accent), '--card': rgbText(surface),
    '--line': line, '--line-2': `rgba(${foreground.join(', ')}, .3)`, '--fill': `rgba(${foreground.join(', ')}, .05)`, '--fill-2': `rgba(${foreground.join(', ')}, .1)`,
    '--paper-2': rgbText(surface), '--detail-panel-bg': needsPanel ? rgbText(surface) : 'transparent',
    '--detail-tone': whiteText ? 'dark' : 'light',
  };
}
