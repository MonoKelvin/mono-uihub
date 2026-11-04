const clamp = (value, max = 1) => Math.max(0, Math.min(max, value));

export function colorToRgba(value = '') {
  const color = value.trim().toLowerCase();
  if (color === 'transparent') return [0, 0, 0, 0];
  if (/^#[\da-f]{3,8}$/.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((part) => part + part).join('');
    if (hex.length !== 6 && hex.length !== 8) return null;
    return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
  }
  const rgb = color.match(/^rgba?\((.+)\)$/);
  const srgb = color.match(/^color\(srgb\s+(.+)\)$/);
  if (!rgb && !srgb) return null;
  const parts = (rgb?.[1] || srgb[1]).split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const channels = parts.slice(0, 3).map((part) => clamp(parseFloat(part) * (part.endsWith('%') ? 2.55 : srgb ? 255 : 1), 255));
  const alpha = parts[3] == null ? 1 : clamp(parseFloat(parts[3]) / (parts[3].endsWith('%') ? 100 : 1));
  return [...channels, alpha].every(Number.isFinite) ? [...channels, alpha] : null;
}

export function blendBackground(colors, base = [255, 255, 255]) {
  const visible = colors.filter((color) => color && color[3] > 0);
  if (!visible.length) return null;
  let result = [...base];
  // 列表从外层主体到根画布，反向合成半透明背景。
  for (const [r, g, b, alpha] of [...visible].reverse()) {
    result = [r, g, b].map((channel, index) => channel * alpha + result[index] * (1 - alpha));
  }
  const rgb = result.map(Math.round);
  const linear = rgb.map((channel) => { const s = channel / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  const dark = 1.05 / (luminance + .05) > (luminance + .05) / .05;
  return { color: `rgb(${rgb.join(', ')})`, tone: dark ? 'dark' : 'light' };
}

export function readPrototypeBackground(iframe, type) {
  try {
    const doc = iframe.contentDocument, win = doc?.defaultView;
    if (!doc?.body || !win) return null;
    let context = null;
    const read = (element) => {
      const value = win.getComputedStyle(element).backgroundColor;
      const parsed = colorToRgba(value);
      if (parsed) return parsed;
      // 只解析一个 CSS 色值，不读取原型画面；补充浏览器支持的 Color 4 格式。
      context ||= doc.createElement('canvas').getContext('2d', { willReadFrequently: true });
      if (!context) return null;
      context.canvas.width = context.canvas.height = 1;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const roots = [read(doc.body), read(doc.documentElement)];
    const scheme = win.getComputedStyle(doc.documentElement).colorScheme || '';
    const base = scheme.includes('dark') && !scheme.includes('light') ? [0, 0, 0] : [255, 255, 255];
    // 外部背景优先来自 body/html，不把软件窗口或 App 内部面板的颜色当作画布。
    if (roots.some((color) => color && color[3] > 0)) return blendBackground(roots, base);
    if (!['software', 'app', 'component'].includes(type)) return null;
    const layers = [];
    let element = doc.elementFromPoint?.(2, 2);
    while (element && element !== doc.body && element !== doc.documentElement) {
      layers.push(read(element));
      element = element.parentElement;
    }
    return blendBackground(layers.concat(roots), base);
  } catch { return null; /* 跨域或没有可用背景时保持画廊默认色。 */ }
}
