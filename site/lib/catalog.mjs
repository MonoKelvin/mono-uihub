import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyPalette, normalizeHex } from './colors.mjs';

export const UI_ROOT = fileURLToPath(new URL('../../ui/', import.meta.url));
const text = (value) => typeof value === 'string' ? value.trim() : '';
const list = (value) => [...new Set((Array.isArray(value) ? value : typeof value === 'string' ? [value] : []).map(text).filter(Boolean))];
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : null;
const fold = (value) => text(value).toLowerCase();
const typePatterns = [
  ['component', /组件|\bcomponent\b/i],
  ['app', /手机|移动端|\bmobile\b|\bapp\b/i],
  ['website', /网站|网页|单页|落地页|\bwebsite\b|\blanding page\b/i],
  ['software', /软件|工作台|客户端|工具|显示屏|中控|\bsoftware\b|\bdashboard\b/i],
];
const tagPatterns = ['蜂箱', '蜂蜜', '咖啡', '烘焙', '品控', '库存', '客户', '摄影', '照片', '选片', '调色', '家具', '定制', '材料', '订单', '香水', '香调', '邮件', '明日方舟', '超跑', '银行卡', '奶茶', '蜘蛛侠', '地图', '动画', '交互', '简约', '高级', '科幻', '温暖', '优雅'];

/** Only the first history entry is evidence for searchable/filterable fields. */
export function normalizeMetadata(metadata, slug = '') {
  const root = record(metadata);
  const initial = record(root?.history?.[0]) ?? record(root?.generation?.history?.[0]);
  const prompt = text(initial?.prompt);
  const explicitType = fold(initial?.page_type ?? initial?.type);
  const typeAliases = { webpage: 'website', web: 'website', '网页': 'website', '软件': 'software', '组件': 'component', '应用': 'app' };
  const type = explicitType ? (typeAliases[explicitType] ?? explicitType) : typePatterns.find(([, pattern]) => pattern.test(prompt))?.[0] ?? 'unknown';
  const tags = initial?.tags != null ? list(initial.tags) : tagPatterns.filter((tag) => prompt.includes(tag));
  const palette = (Array.isArray(root?.palette) ? root.palette : []).map(normalizeHex).filter(Boolean);
  const colors = classifyPalette(palette);
  return {
    slug,
    name: text(root?.name) || slug,
    prompt,
    model: fold(initial?.model) || 'unknown',
    type,
    tags,
    colors: [...new Set(colors)],
    createdAt: text(root?.created_at ?? root?.createdAt) || null,
    updatedAt: text(root?.updated_at ?? root?.updatedAt) || null,
    screenshots: [],
    href: '/prototypes/' + encodeURIComponent(slug) + '/index.html',
    hasMetadata: Boolean(root),
  };
}

export function isRegularFile(filename) {
  try { return lstatSync(filename).isFile(); } catch { return false; }
}

/** Synchronous by design; also safe to await in Astro/build consumers. */
export function loadCatalog({ uiRoot = UI_ROOT } = {}) {
  if (!existsSync(uiRoot)) return [];
  return readdirSync(uiRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && isRegularFile(path.join(uiRoot, entry.name, 'index.html'))).map(({ name: slug }) => {
    const metadataPath = path.join(uiRoot, slug, 'metadata.json');
    let metadata = null;
    if (isRegularFile(metadataPath)) {
      try { metadata = JSON.parse(readFileSync(metadataPath, 'utf8')); } catch { /* Invalid metadata stays visibly unknown. */ }
    }
    const item = normalizeMetadata(metadata, slug);
    const screenshotsDir = path.join(uiRoot, slug, 'screenshots');
    if (existsSync(screenshotsDir) && lstatSync(screenshotsDir).isDirectory() && !lstatSync(screenshotsDir).isSymbolicLink()) {
      item.screenshots = readdirSync(screenshotsDir).filter((name) => /^\d+\.jpe?g$/i.test(name) && isRegularFile(path.join(screenshotsDir, name)))
        .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10) || a.localeCompare(b))
        .map((name) => '/prototypes/' + encodeURIComponent(slug) + '/screenshots/' + encodeURIComponent(name));
    }
    return item;
  }).sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Search deliberately excludes mutable names, slugs, dates, and all revisions. */
export function filterCatalog(catalog, filters = {}) {
  const query = fold(filters.query ?? filters.search ?? filters.q);
  const requested = (value) => list(value).map(fold).filter((entry) => entry !== 'all');
  return catalog.filter((item) => {
    if (query && ![item.prompt, item.model, item.type, ...item.tags, ...item.colors].join(' ').toLowerCase().includes(query)) return false;
    const model = fold(filters.model);
    const type = fold(filters.type ?? filters.page_type);
    if (model && model !== 'all' && fold(item.model) !== model) return false;
    if (type && type !== 'all' && fold(item.type) !== type) return false;
    return requested(filters.tags ?? filters.tag).every((tag) => item.tags.some((value) => fold(value) === tag))
      && requested(filters.colors ?? filters.color).every((color) => item.colors.some((value) => fold(value) === color));
  });
}
