import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadCatalog, UI_ROOT } from '../../site/lib/catalog.mjs';
import { startPrototypeServer } from './server.mjs';

/**
 * After capturing (or preserving) screenshots, scan the page's screenshots
 * directory and update metadata.json so the gallery has alt-text descriptions.
 * Reads all *.jpg files sorted numerically, replaces the existing screenshots
 * entries, and updates `updated_at` — keeping metadata in sync with what's on
 * disk regardless of whether --overwrite was used.
 */
export function updateMetadataScreenshots(slug, { uiRoot = UI_ROOT } = {}) {
  const metadataPath = path.join(uiRoot, slug, 'metadata.json');
  if (!existsSync(metadataPath)) return;
  const screenshotsDir = path.join(uiRoot, slug, 'screenshots');
  if (!existsSync(screenshotsDir) || !lstatSync(screenshotsDir).isDirectory()) return;
  const files = readdirSync(screenshotsDir)
    .filter((name) => /^\d+\.jpe?g$/i.test(name) && lstatSync(path.join(screenshotsDir, name)).isFile())
    .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10) || a.localeCompare(b));
  if (!files.length) return;
  const now = new Date().toISOString();
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
  // Only keep existing descriptions for files that still exist; generate
  // placeholder descriptions for new files.
  const existing = new Map((metadata.screenshots || []).map((s) => [s.file, s.description]));
  metadata.screenshots = files.map((name) => {
    const file = 'screenshots/' + name;
    const desc = existing.get(file) || (name === '1.jpg' ? '页面主要界面截图' : '页面界面截图');
    return { file, description: desc, captured_at: now };
  });
  metadata.updated_at = now;
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  console.log('Updated metadata.json screenshots for ' + slug + ' (' + files.length + ' files)');
}

export function parseArgs(args) {
  const options = { all: false, overwrite: false, slug: null, width: 1600, height: 1200, count: 1 };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--all') options.all = true;
    else if (arg === '--overwrite') options.overwrite = true;
    else if (['--slug', '--width', '--height', '--count'].includes(arg)) {
      const value = args[++index];
      if (!value) throw new Error('Missing value for ' + arg);
      const key = arg.slice(2);
      options[key] = key === 'slug' ? value : Number(value);
    } else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  if (options.help) return options;
  if (options.all === Boolean(options.slug)) throw new Error('Choose exactly one of --all or --slug <name>.');
  for (const key of ['width', 'height', 'count']) if (!Number.isSafeInteger(options[key]) || options[key] < 1 || options[key] > (key === 'count' ? 20 : 8192)) throw new Error('Invalid --' + key);
  if (options.slug && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(options.slug)) throw new Error('Invalid prototype slug.');
  return options;
}
async function launchBrowser(chromium) {
  const errors = [];
  // Playwright's Edge channel discovers the installed system browser on Windows.
  for (const options of [{ channel: 'msedge' }, {}]) {
    try { return await chromium.launch({ headless: true, ...options }); } catch (error) { errors.push(error.message); }
  }
  throw new Error('No usable Edge or Chromium browser. Install Edge or run npx playwright install chromium in site.\n' + errors.join('\n'));
}
export async function capture(options, { uiRoot = UI_ROOT } = {}) {
  const catalog = loadCatalog({ uiRoot });
  const selected = options.all ? catalog : catalog.filter((item) => item.slug === options.slug);
  if (!selected.length) throw new Error('No matching prototypes.');
  const require = createRequire(new URL('../../site/package.json', import.meta.url));
  const { chromium } = require('playwright');
  let host;
  let browser;
  const results = [];
  try {
    host = await startPrototypeServer(uiRoot);
    browser = await launchBrowser(chromium);
    for (const item of selected) {
      const directory = path.join(uiRoot, item.slug, 'screenshots');
      if (existsSync(directory) && (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink())) throw new Error('Unsafe screenshot directory: ' + directory);
      mkdirSync(directory, { recursive: true });
      const page = await browser.newPage({ viewport: { width: options.width ?? 1600, height: options.height ?? 1200 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      try {
        const files = Array.from({ length: options.count ?? 1 }, (_, index) => path.join(directory, (index + 1) + '.jpg')).filter((file) => options.overwrite || !existsSync(file));
        if (!files.length) { console.log('Preserved ' + item.slug); continue; }
        const response = await page.goto(host.url + '/' + encodeURIComponent(item.slug) + '/index.html', { waitUntil: 'load', timeout: 45000 });
        if (!response?.ok()) throw new Error('Prototype returned HTTP ' + response?.status());
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))]));
        // Wait for network quiet (fonts / hot-linked images), every <img> decoded, then two frames for rAF-drawn charts.
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => Promise.race([Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))), new Promise((r) => setTimeout(r, 8000))]));
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.waitForTimeout(1500);
        for (const filename of files) {
          if (existsSync(filename) && !lstatSync(filename).isFile()) throw new Error('Unsafe screenshot target: ' + filename);
          await page.screenshot({ path: filename, type: 'jpeg', quality: 86, fullPage: false, animations: 'disabled', timeout: 30000 });
          results.push(filename);
          console.log('Captured ' + item.slug + '/screenshots/' + path.basename(filename));
          if (files.length > 1) await page.waitForTimeout(500);
        }
        // Update metadata.json screenshots list to match captured files.
        updateMetadataScreenshots(item.slug, { uiRoot });
      } catch (error) { console.error('Failed ' + item.slug + ': ' + error.message); results.push({ slug: item.slug, error: error.message }); }
      finally { await page.close(); }
    }
    return results;
  } finally {
    try { if (browser) await browser.close(); } finally { if (host) await host.close(); }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log('Usage: node tools/screenshots/capture.mjs (--all | --slug <name>) [--overwrite] [--width 1600] [--height 1200] [--count 1]');
    else { const results = await capture(options); if (results.some((result) => typeof result !== 'string')) process.exitCode = 1; }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
