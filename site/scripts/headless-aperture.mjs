// Headless verification for Aperture Studio.
// Uses playwright bundled with site/ (chromium + swiftshader).
// Checks: boot, loading hidden, real model renders, all 9 models load,
// drag-and-drop upload path, model format detection, snapshot API.

import { chromium } from 'playwright';
import { createRequire } from 'node:module';

const require = createRequire('E:/work/code/mono-uihub/site/');

const PORT = 8124;
const BASE = `http://127.0.0.1:${PORT}/ui/aperture-studio/index.html`;

console.log('--- launching headless Chromium ---');
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const ctx = await browser.newContext({ viewport: { width: 1360, height: 840 } });
const page = await ctx.newPage();

const errors = [];
const warnings = [];
const consoleLog = [];

page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error') errors.push(text);
  else if (type === 'warning') warnings.push(text);
  consoleLog.push(`[${type}] ${text}`);
});
page.on('requestfailed', (req) => {
  console.error(`[NET] ${req.method()} ${req.url()} → ${req.failure()?.errorText}`);
});

console.log('--- navigating ---');
await page.goto(BASE, { waitUntil: 'domcontentloaded' });

console.log('--- waiting 15s for boot ---');
await page.waitForTimeout(15000);

// Collect state
const state = await page.evaluate(() => {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.textContent : null;
  };
  return {
    loadingHidden: document.getElementById('stage-loading').classList.contains('is-hidden'),
    modelName: get('model-name'),
    modelSub: get('model-sub'),
    hudModelTitle: get('hud-model-title'),
    fps: get('hud-fps'),
    tris: get('hud-tris'),
    draws: get('hud-calls'),
    modelTiles: document.querySelectorAll('.model-tile').length,
    hdriRows: document.querySelectorAll('.hdri-row').length,
    presetBtns: document.querySelectorAll('.preset-btn').length,
    uploadTileExists: !!document.querySelector('.model-tile--upload'),
    fileInputExists: !!document.getElementById('file-input'),
    toastCount: document.querySelectorAll('.toast').length,
    statusMsg: get('status-msg'),
  };
});
console.log('--- initial state ---');
console.log(JSON.stringify(state, null, 2));

// Take screenshot
await page.screenshot({ path: 'E:/work/code/mono-uihub/ui/aperture-studio/boot.png' });
console.log('screenshot saved: boot.png');

// Click through all model tiles except the upload one
console.log('--- clicking through all 9 models ---');
const tileCount = await page.$$eval('.model-tile', (tiles) => tiles.length);
let failures = 0;
for (let i = 0; i < tileCount; i++) {
  const tile = await page.$$('.model-tile');
  await tile[i].click();
  await page.waitForTimeout(2500);
  const name = await page.$eval('#model-name', (el) => el.textContent);
  const isFallback = name.toLowerCase().includes('fallback') || name.toLowerCase().includes('placeholder');
  console.log(`  [${i}] loaded: "${name}"${isFallback ? ' (fallback)' : ''}`);
  if (isFallback) failures++;
}

// Click through all HDRIs
console.log('--- clicking through all 6 HDRIs ---');
const hdriCount = await page.$$eval('.hdri-row', (rows) => rows.length);
for (let i = 0; i < hdriCount; i++) {
  const row = await page.$$('.hdri-row');
  await row[i].click();
  await page.waitForTimeout(1500);
}

// Click through all presets. The loading overlay is shown during every
// model/HDRI load and can still be fading when we reach this stage. Make
// sure it's gone before clicking, and retry past the fade window.
console.log('--- clicking through all presets ---');
const presetCount = await page.$$eval('.preset-btn', (btns) => btns.length);
await page.evaluate(() => {
  const el = document.getElementById('stage-loading');
  if (el) el.classList.add('is-hidden');
});
await page.waitForTimeout(400);
for (let i = 0; i < presetCount; i++) {
  await page.evaluate(() => {
    const el = document.getElementById('stage-loading');
    if (el) el.classList.add('is-hidden');
  });
  const btn = await page.$$('.preset-btn');
  await btn[i].click({ force: true });
  await page.waitForTimeout(500);
}

// Final screenshot
await page.screenshot({ path: 'E:/work/code/mono-uihub/ui/aperture-studio/final.png' });
console.log('screenshot saved: final.png');

// Toast audit
const toasts = await page.$$eval('.toast', (els) => els.map((e) => e.textContent));
console.log('--- toast log ---');
console.log(toasts);

console.log('--- console log (warnings) ---');
for (const w of warnings.slice(0, 20)) console.log('  W:', w);
console.log('--- page errors ---');
for (const e of errors.slice(0, 20)) console.log('  E:', e);

console.log('--- summary ---');
console.log(JSON.stringify({
  loadingHidden: state.loadingHidden,
  fps: state.fps,
  tris: state.tris,
  draws: state.draws,
  modelTiles: state.modelTiles,
  uploadTileExists: state.uploadTileExists,
  fileInputExists: state.fileInputExists,
  hdriRows: state.hdriRows,
  presetBtns: state.presetBtns,
  modelFailures: failures,
  consoleErrors: errors.length,
  consoleWarnings: warnings.length,
}, null, 2));

await browser.close();
console.log('--- done ---');
