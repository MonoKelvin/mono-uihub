import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { normalizeMetadata, filterCatalog, loadCatalog } from '../lib/catalog.mjs';
import { COLOR_BINS, classifyColor, classifyPalette } from '../lib/colors.mjs';
import { isSafePublicPath } from '../scripts/sync-prototypes.mjs';
import { parseArgs } from '../../tools/screenshots/capture.mjs';

const meta = {
  name: '示例', page_type: 'software', tags: ['后改标签'], palette: ['#e4485a', '#1c1e1d', '#zzz'],
  created_at: '2026-01-01T00:00:00+08:00', updated_at: '2026-02-01T00:00:00+08:00',
  history: [
    { prompt: '设计一个咖啡烘焙软件，红色主题', model: 'GPT-X' },
    { prompt: '改成蓝色的网页，加入蜘蛛侠', model: 'Other-Model' },
  ],
};

test('revisions do not drive filter fields; root page_type is only a fallback', () => {
  const it = normalizeMetadata(meta, 'demo');
  assert.equal(it.model, 'gpt-x');
  assert.equal(it.type, 'software');
  assert.deepEqual(it.colors, ['rose', 'ink']);
  assert.ok(it.tags.includes('咖啡') && !it.tags.includes('蜘蛛侠') && !it.tags.includes('后改标签'));
  assert.equal(filterCatalog([it], { query: '蜘蛛侠' }).length, 0);
  assert.equal(filterCatalog([it], { model: 'other-model' }).length, 0);
  assert.equal(filterCatalog([it], { colors: ['cobalt'] }).length, 0);
  assert.equal(filterCatalog([it], { query: '咖啡', colors: ['rose'] }).length, 1);
});

test('legacy generation.history layout is supported', () => {
  const it = normalizeMetadata({ generation: { history: [{ prompt: '一个管理蜂箱的工具', model: 'A' }] } }, 'x');
  assert.equal(it.model, 'a');
  assert.equal(it.type, 'software');
});

test('missing metadata stays unknown instead of fabricated', () => {
  const it = normalizeMetadata(null, 'bare');
  assert.equal(it.model, 'unknown');
  assert.equal(it.type, 'unknown');
  assert.equal(it.prompt, '');
  assert.equal(it.updatedAt, null);
  assert.equal(it.hasMetadata, false);
});

test('screenshots are discovered and sorted numerically', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'uihub-'));
  try {
    const dir = path.join(root, 'p', 'screenshots');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(root, 'p', 'index.html'), '<!doctype html>');
    for (const f of ['10.jpg', '2.jpg', '1.jpg', 'cover.png']) writeFileSync(path.join(dir, f), '');
    const [item] = loadCatalog({ uiRoot: root });
    assert.deepEqual(item.screenshots.map((s) => s.split('/').pop()), ['1.jpg', '2.jpg', '10.jpg']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('only safe public assets are published', () => {
  assert.ok(isSafePublicPath('index.html'));
  assert.ok(isSafePublicPath('screenshots/1.jpg'));
  assert.ok(!isSafePublicPath('metadata.json'));
  assert.ok(!isSafePublicPath('.env'));
  assert.ok(!isSafePublicPath('assets/secret-key.png'));
});

test('initial explicit fields win; mutable display names and dates are not searchable', () => {
  const item = normalizeMetadata({ name: 'NameOnlySecret', page_type: 'website', colors: ['pink'], tags: ['RootOnlySecret'], history: [
    { prompt: 'initial brief', model: 'GPT-X', tags: ['initial'], colors: ['blue'], page_type: 'component' },
    { prompt: 'RevisionOnlySecret', model: 'RevisionModel', tags: ['revision'], colors: ['pink'], page_type: 'website' },
  ] }, 'SlugOnlySecret');
  assert.deepEqual(item.tags, ['initial']);
  assert.deepEqual(item.colors, []);
  assert.equal(item.type, 'component');
  for (const query of ['NameOnlySecret', 'RootOnlySecret', 'RevisionOnlySecret', 'RevisionModel', 'SlugOnlySecret', 'pink']) {
    assert.equal(filterCatalog([item], { query }).length, 0, query);
  }
  assert.equal(filterCatalog([item], { model: 'GPT-X', tags: ['initial'], type: 'component' }).length, 1);
});

test('root page_type supplies the type when the initial record omits it', () => {
  const item = normalizeMetadata({ page_type: 'website', history: [{ prompt: '一个卡牌交易平台', model: 'X' }] }, 'card-market');
  assert.equal(item.type, 'website');
});

test('empty history keeps prompt/model/tags unknown but uses explicit root page_type', () => {
  const item = normalizeMetadata({ prompt: 'blue website', model: 'RootModel', page_type: 'website', tags: ['blue'], colors: ['blue'], history: [] }, 'blue-website');
  assert.equal(item.prompt, '');
  assert.equal(item.model, 'unknown');
  assert.equal(item.type, 'website');
  assert.deepEqual(item.tags, []);
  assert.deepEqual(item.colors, []);
});

test('repository prototypes all carry a palette; missing history keeps prompt/model/tags unknown', () => {
  const catalog = loadCatalog();
  assert.ok(catalog.length > 0);
  for (const item of catalog) {
    assert.ok(item.colors.length > 0, item.slug);
    assert.ok(['software', 'website', 'app', 'component', 'unknown'].includes(item.type), item.slug);
    if (item.prompt) continue;
    assert.equal(item.model, 'unknown', item.slug);
    assert.deepEqual(item.tags, [], item.slug);
  }
});

test('palette colors snap to at most 30 named bins', () => {
  assert.ok(COLOR_BINS.length <= 30);
  assert.equal(new Set(COLOR_BINS.map((b) => b.key)).size, COLOR_BINS.length);
  assert.equal(classifyColor('#FAF6EC'), 'ivory');
  assert.equal(classifyColor('#1b1d1f'), 'ink');
  assert.equal(classifyColor('#0a72e0'), 'cobalt');
  assert.equal(classifyColor('#e4485a'), 'rose');
  assert.equal(classifyColor('#3e6b4f'), 'moss');
  assert.equal(classifyColor('#c99a4e'), 'amber');
  assert.equal(classifyColor('red'), null);
  assert.deepEqual(classifyPalette(['#d4a7b5', '#b59db0', 'bad']), ['lotus']);
});

test('safe-path rules deny traversal, hidden files, histories, maps and credentials', () => {
  for (const name of ['../index.html', 'assets/../index.html', 'assets/.hidden.js', 'assets/credentials.png', 'history.js', 'private_key.js', 'app.js.map', 'assets/data.json']) assert.equal(isSafePublicPath(name), false, name);
  for (const name of ['assets/icon.svg', 'styles.css', 'app.js', 'screenshots/10.jpg']) assert.equal(isSafePublicPath(name), true, name);
});

test('screenshot CLI argument parsing', () => {
  assert.deepEqual(parseArgs(['--slug', 'a', '--count', '3']).count, 3);
  assert.equal(parseArgs(['--all']).width, 1600);
  assert.equal(parseArgs(['--all']).height, 1000);
  assert.throws(() => parseArgs([]));
  assert.throws(() => parseArgs(['--slug', '../x']));
});
