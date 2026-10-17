/**
 * Palette classification: every #rrggbb from metadata.json `palette` is snapped
 * to the nearest of a fixed set of named color bins, measured in OKLCh with
 * hue weighted above lightness so tints stay in their hue family.
 * Low-chroma colors only compete with neutral bins so tinted off-whites and
 * near-blacks never land in a hue bin.
 */
export const COLOR_BINS = [
  { key: 'snow', zh: '雪白', en: 'Snow', hex: '#f5f7f6', neutral: true },
  { key: 'ivory', zh: '米白', en: 'Ivory', hex: '#f5efe2', neutral: true },
  { key: 'oat', zh: '燕麦', en: 'Oat', hex: '#e2d8c3', neutral: true },
  { key: 'mist', zh: '雾灰', en: 'Mist', hex: '#dde2e0', neutral: true },
  { key: 'silver', zh: '银灰', en: 'Silver', hex: '#b6bdba', neutral: true },
  { key: 'slate', zh: '石板灰', en: 'Slate', hex: '#6c7477', neutral: true },
  { key: 'graphite', zh: '深灰', en: 'Graphite', hex: '#34383b', neutral: true },
  { key: 'ink', zh: '墨黑', en: 'Ink', hex: '#1c1e1d', neutral: true },
  { key: 'rose', zh: '玫瑰红', en: 'Rose', hex: '#d0465a' },
  { key: 'vermilion', zh: '朱红', en: 'Vermilion', hex: '#cf4a24' },
  { key: 'brick', zh: '砖红', en: 'Brick', hex: '#9e4a3a' },
  { key: 'sakura', zh: '樱粉', en: 'Sakura', hex: '#f0b7c4' },
  { key: 'lotus', zh: '藕粉', en: 'Lotus', hex: '#c9a3b0' },
  { key: 'tangerine', zh: '橘橙', en: 'Tangerine', hex: '#e8832e' },
  { key: 'caramel', zh: '焦糖', en: 'Caramel', hex: '#a3612f' },
  { key: 'coffee', zh: '咖啡棕', en: 'Coffee', hex: '#5b3f2a' },
  { key: 'amber', zh: '琥珀金', en: 'Amber', hex: '#c99a4e' },
  { key: 'lemon', zh: '柠檬黄', en: 'Lemon', hex: '#e9d04c' },
  { key: 'moss', zh: '苔绿', en: 'Moss', hex: '#4f6b48' },
  { key: 'forest', zh: '墨绿', en: 'Forest', hex: '#2c4a3a' },
  { key: 'emerald', zh: '翠绿', en: 'Emerald', hex: '#1f9a68' },
  { key: 'mint', zh: '薄荷绿', en: 'Mint', hex: '#a3d9c0' },
  { key: 'teal', zh: '湖青', en: 'Teal', hex: '#2a8a8a' },
  { key: 'ice', zh: '冰蓝', en: 'Ice blue', hex: '#cfe2f4' },
  { key: 'sky', zh: '天蓝', en: 'Sky', hex: '#5aaee6' },
  { key: 'cobalt', zh: '钴蓝', en: 'Cobalt', hex: '#2a63d4' },
  { key: 'haze', zh: '雾霾蓝', en: 'Haze blue', hex: '#6b879e' },
  { key: 'navy', zh: '藏青', en: 'Navy', hex: '#1b2b48' },
  { key: 'monet', zh: '莫奈紫', en: 'Monet lilac', hex: '#a99cc6' },
  { key: 'grape', zh: '葡萄紫', en: 'Grape', hex: '#6a3e8c' },
];

const NEUTRAL_CHROMA = 0.028;
const HEX = /^#[0-9a-f]{6}$/;

export function normalizeHex(value) {
  const hex = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return HEX.test(hex) ? hex : null;
}

/** sRGB hex → OKLab [L, a, b] (Björn Ottosson). */
export function hexToOklab(hex) {
  const lin = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = lin;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const toLch = (hex) => { const [L, a, b] = hexToOklab(hex); return { L, C: Math.hypot(a, b), H: Math.atan2(b, a) }; };
const BINS = COLOR_BINS.map((bin) => ({ ...bin, lch: toLch(bin.hex) }));
function distance(p, q, neutral) {
  const dL = p.L - q.L, dC = p.C - q.C;
  if (neutral) return Math.hypot(dL, dC * 2);
  const dH = 2 * Math.sqrt(p.C * q.C) * Math.sin((p.H - q.H) / 2);
  return Math.hypot(dL * 0.55, dC, dH * 2.2);
}

/** Returns the bin key for one #rrggbb color, or null when the input is not valid hex. */
export function classifyColor(value) {
  const hex = normalizeHex(value);
  if (!hex) return null;
  const lch = toLch(hex);
  const neutral = lch.C < NEUTRAL_CHROMA;
  let best = null;
  for (const bin of BINS) {
    if (Boolean(bin.neutral) !== neutral) continue;
    const d = distance(lch, bin.lch, neutral);
    if (!best || d < best.d) best = { key: bin.key, d };
  }
  return best.key;
}

/** Unique bin keys for a palette, in palette order. */
export function classifyPalette(palette) {
  return [...new Set((Array.isArray(palette) ? palette : []).map(classifyColor).filter(Boolean))];
}

export const colorBin = (key) => COLOR_BINS.find((bin) => bin.key === key) ?? null;
