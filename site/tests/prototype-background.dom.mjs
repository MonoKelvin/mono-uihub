import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { chromium } from 'playwright';

let browser, detailMarkup, detailCss;
const scripts = new Map();
before(async () => {
  const directory = new URL('../src/scripts/', import.meta.url);
  for (const file of await readdir(directory)) if (file.endsWith('.js')) scripts.set('/scripts/' + file, await readFile(new URL(file, directory), 'utf8'));
  detailMarkup = await readFile(new URL('../src/components/PrototypeDetail.astro', import.meta.url), 'utf8');
  detailMarkup = detailMarkup.slice(detailMarkup.indexOf('<section'));
  detailCss = await readFile(new URL('../src/styles/prototype-detail.css', import.meta.url), 'utf8');
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL || process.platform === 'win32' ? { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' } : {}) });
});
after(async () => { await browser?.close(); });

const baseStyle = `html,body{margin:0;width:100%;height:100%}body{--ink:#202020;--accent:#17552b;color:var(--ink)}.stage{width:100%;height:100%;display:grid;place-items:center;background:#e8e3d8}.canvas{width:600px;height:400px;background:white;border-radius:24px;color:#202020}`;
async function fixture(t, { css = '', html = '<main class="stage"><div class="canvas"><button>交互窗口</button></div></main>', viewer = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
  t.after(() => page.close());
  const requests = [];
  await page.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    if (scripts.has(path)) return route.fulfill({ contentType: 'text/javascript', body: scripts.get(path) });
    if (path === '/prototype/index.html' || path === '/prototype-next/index.html') return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><link rel="stylesheet" href="styles.css"><style>${baseStyle}${css}${path.includes('-next') ? '.stage{background:#111}body{--ink:#eee}' : ''}</style></head><body>${html}</body></html>` });
    if (path.endsWith('/styles.css')) return route.fulfill({ contentType: 'text/css', headers: { 'Cache-Control': 'no-store' }, body: '.canvas button{font-size:16px}' });
    if (path.endsWith('.svg')) return route.fulfill({ contentType: 'image/svg+xml', headers: { 'Cache-Control': 'no-store' }, body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ddd"/></svg>' });
    if (viewer) {
      const items = ['demo', 'next'].map((slug) => ({ slug, name: slug, href: slug === 'demo' ? '/prototype/index.html' : '/prototype-next/index.html', details: { prompt: slug, type: 'software' } }));
      const markup = detailMarkup.replace('data-detail-items={JSON.stringify(items)}', `data-detail-items='${JSON.stringify(items)}'`);
      return route.fulfill({ contentType: 'text/html', body: `<!doctype html><style>:root{--paper:#eee;--card:white;--ink:#202020;--ink-2:#333;--ink-3:#444;--ease:ease;--ease-shared:ease;--ease-drawer:ease;--r-pill:999px}${detailCss}</style><div id="page"><a class="card" data-slug="demo"><div class="frame">原型</div></a><a class="card" data-slug="next"><div class="frame">下一个</div></a></div>${markup}` });
    }
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><style>#root{position:fixed;inset:0}#slot{position:absolute;inset:0}#source{position:absolute;left:40px;top:76px;width:1000px;height:700px;border:0}</style><div id="root"><div id="slot"></div><iframe id="source" src="/prototype/index.html"></iframe></div>' });
  });
  await page.goto('https://uihub.test/' + (viewer ? '#prototype=demo' : ''));
  await page.evaluate(async (viewer) => {
    if (viewer) {
      const { initPrototypeDetail } = await import('/scripts/prototype-detail.js');
      window.root = document.querySelector('[data-detail]');
      window.slot = document.querySelector('[data-detail-background]');
      window.viewer = initPrototypeDetail({ page: document.getElementById('page'), cards: [...document.querySelectorAll('.card')], getLanguage: () => 'zh', onBusyChange() {} });
      return;
    }
    window.bg = await import('/scripts/prototype-background.js');
    window.replay = await import('/scripts/prototype-backdrop.js');
    window.source = document.getElementById('source');
    window.root = document.getElementById('root');
    window.slot = document.getElementById('slot');
    window.manager = replay.createPrototypeBackdrop(root, slot);
    window.controller = new AbortController();
  }, viewer);
  return { page, requests };
}

test('真实 DOM 中仅 stage 分离，窗口背景与前景坐标不变，清理恢复原型', async (t) => {
  const { page } = await fixture(t);
  const result = await page.evaluate(async () => {
    const before = source.getBoundingClientRect().toJSON();
    const background = await manager.prepare(source, 'software', controller.signal);
    const doc = source.contentDocument;
    const beforeCommit = doc.querySelector('.stage').getAttribute('data-uihub-background-host');
    background.commit();
    const after = source.getBoundingClientRect().toJSON();
    const answer = { before, after, beforeCommit, stage: getComputedStyle(doc.querySelector('.stage')).backgroundColor, window: getComputedStyle(doc.querySelector('.canvas')).backgroundColor, frames: slot.children.length, width: slot.firstChild.style.width, transform: slot.firstChild.style.transform, sandbox: slot.firstChild.getAttribute('sandbox') };
    manager.clear();
    answer.restored = getComputedStyle(doc.querySelector('.stage')).backgroundColor;
    answer.remaining = slot.children.length;
    answer.palette = root.style.getPropertyValue('--ink');
    return answer;
  });
  assert.deepEqual(result.after, result.before);
  assert.equal(result.beforeCommit, null);
  assert.equal(result.stage, 'rgba(0, 0, 0, 0)');
  assert.equal(result.window, 'rgb(255, 255, 255)');
  assert.equal(result.width, '1000px');
  assert.match(result.transform, /scale\(1\.6\)/);
  assert.equal(result.sandbox, 'allow-same-origin');
  assert.equal(result.restored, 'rgb(232, 227, 216)');
  assert.equal(result.remaining, 0);
  assert.equal(result.palette, '');
});

test('多层渐变、body 伪元素、装饰 DOM 和相对 CSS 资源保留，窗口纹理不外泄', async (t) => {
  const { page, requests } = await fixture(t, {
    css: 'body::before{content:"";position:fixed;inset:0;pointer-events:none;background:url(assets/grain.svg);z-index:-1}.stage{background:radial-gradient(circle,rgba(200,100,50,.5),transparent),linear-gradient(#ddd,#aaa)}.canvas::after{content:"";position:absolute;width:20px;height:20px;background:red}.decor{position:fixed;inset:0;pointer-events:none;z-index:-1;background:url(assets/decor.svg)}',
    html: '<div class="decor" aria-hidden="true"></div><main class="stage"><div class="canvas">窗口</div></main>',
  });
  const result = await page.evaluate(async () => {
    const description = bg.describePrototypeBackground(source, 'app');
    const prepared = await manager.prepare(source, 'app', controller.signal);
    prepared.commit();
    const doc = slot.firstChild.contentDocument;
    return { layers: description.layers.length, decorations: description.decorations.length, image: getComputedStyle(doc.querySelector('.stage')).backgroundImage, pseudo: getComputedStyle(doc.body, '::before').backgroundImage, base: doc.baseURI, originalPseudo: getComputedStyle(source.contentDocument.body, '::before').opacity, windowPseudo: getComputedStyle(source.contentDocument.querySelector('.canvas'), '::after').opacity, hidden: getComputedStyle(doc.querySelector('.canvas')).visibility, href: doc.querySelector('link').href };
  });
  assert.equal(result.layers, 3);
  assert.equal(result.decorations, 1);
  assert.match(result.image, /radial-gradient.*linear-gradient/);
  assert.match(result.pseudo, /\/prototype\/assets\/grain.svg/);
  assert.equal(result.base, 'https://uihub.test/prototype/index.html');
  assert.equal(result.href, 'https://uihub.test/prototype/styles.css');
  assert.equal(result.originalPseudo, '0');
  assert.equal(result.windowPseudo, '1');
  assert.equal(result.hidden, 'hidden');
  assert.ok(requests.includes('/prototype/assets/grain.svg'));
});

test('无外层窗口的网页和透明场景回退，独立背景装饰的网页可以分离', async (t) => {
  const { page } = await fixture(t, { css: 'body{background:#ddd}', html: '<main style="width:100%;height:100%">全出血网页</main>' });
  const result = await page.evaluate(() => {
    const fullPage = bg.describePrototypeBackground(source, 'website');
    source.contentDocument.body.style.background = 'transparent';
    const transparent = bg.describePrototypeBackground(source, 'software');
    const decoration = source.contentDocument.createElement('div');
    decoration.style.cssText = 'position:fixed;inset:0;z-index:-1;background:#ddd';
    source.contentDocument.body.append(decoration);
    return { fullPage: fullPage === null, transparent: transparent === null, explicit: !!bg.describePrototypeBackground(source, 'website') };
  });
  assert.deepEqual(result, { fullPage: true, transparent: true, explicit: true });
});

test('脚本背景和装饰后代中的 Canvas 或视频不抽离，窗口内部 Canvas 不受影响', async (t) => {
  const { page } = await fixture(t);
  const result = await page.evaluate(() => {
    const doc = source.contentDocument;
    const canvas = doc.createElement('canvas');
    doc.querySelector('.canvas').append(canvas);
    const inside = !!bg.describePrototypeBackground(source, 'software');
    const decor = doc.createElement('div');
    decor.style.cssText = 'position:fixed;inset:0;z-index:-1';
    decor.append(canvas);
    doc.body.append(decor);
    const nested = bg.describePrototypeBackground(source, 'software') === null;
    decor.remove();
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%';
    doc.body.append(canvas);
    return { inside, nested, direct: bg.describePrototypeBackground(source, 'software') === null };
  });
  assert.deepEqual(result, { inside: true, nested: true, direct: true });
});

test('重放文档清除脚本、根事件、嵌套页、自动聚焦、表单和内容图片资源', async (t) => {
  const { page } = await fixture(t);
  const result = await page.evaluate(async () => {
    const doc = source.contentDocument;
    doc.documentElement.setAttribute('onload', 'parent.replayExecuted = true');
    const content = doc.querySelector('.canvas');
    content.innerHTML = '<script>parent.replayExecuted=true</script><iframe srcdoc="<script>parent.replayExecuted=true</script>"></iframe><input autofocus type="image" src="assets/unneeded.svg" formaction="/submit"><img src="assets/unneeded.svg" srcset="assets/unneeded.svg 2x"><svg><image href="assets/unneeded.svg"/></svg><a href="javascript:parent.replayExecuted=true" onclick="parent.replayExecuted=true">链接</a>';
    window.replayExecuted = false;
    const description = bg.describePrototypeBackground(source, 'component');
    const html = replay.buildBackgroundDocument(description);
    const prepared = await manager.prepare(source, 'component', controller.signal);
    prepared.commit();
    const clone = slot.firstChild.contentDocument;
    return { html, executed: window.replayExecuted, scripts: clone.querySelectorAll('script,iframe').length, autofocus: clone.querySelectorAll('[autofocus],[onclick],[onload],[formaction]').length, img: clone.querySelector('img').getAttribute('src'), svg: clone.querySelector('image').getAttribute('href'), policy: clone.querySelector('meta').content };
  });
  assert.equal(result.executed, false);
  assert.equal(result.scripts, 0);
  assert.equal(result.autofocus, 0);
  assert.equal(result.img, null);
  assert.equal(result.svg, null);
  assert.match(result.policy, /script-src 'none'/);
  assert.doesNotMatch(result.html, /javascript:/);
});

test('背景 error 和取消不透明化原型；就绪后取消也不能提交迟到背景', async (t) => {
  const { page } = await fixture(t);
  const result = await page.evaluate(async () => {
    const original = getComputedStyle(source.contentDocument.querySelector('.stage')).backgroundColor;
    const failed = manager.prepare(source, 'software', controller.signal);
    slot.firstChild.dispatchEvent(new Event('error'));
    (await failed).commit();
    const failure = getComputedStyle(source.contentDocument.querySelector('.stage')).backgroundColor;
    const aborted = manager.prepare(source, 'software', controller.signal);
    controller.abort();
    (await aborted).commit();
    const cancelCount = slot.children.length;
    controller = new AbortController();
    const ready = await manager.prepare(source, 'software', controller.signal);
    controller.abort();
    ready.commit();
    return { original, failure, cancelCount, remaining: slot.children.length, background: getComputedStyle(source.contentDocument.querySelector('.stage')).backgroundColor };
  });
  assert.equal(result.original, result.failure);
  assert.equal(result.original, result.background);
  assert.equal(result.cancelCount, 0);
  assert.equal(result.remaining, 0);
});

test('根主题和自定义 data 属性触发合并更新，旧监听与透明标记可以完整清理', async (t) => {
  const { page } = await fixture(t, { css: 'body[data-mode="dark"] .stage{background:#101010}body[data-mode="dark"]{--ink:#eee;--accent:#aaddbb}' });
  await page.evaluate(async () => { (await manager.prepare(source, 'software', controller.signal)).commit(); source.contentDocument.body.dataset.mode = 'dark'; });
  await page.waitForFunction(() => root.dataset.detailTone === 'dark');
  const result = await page.evaluate(() => {
    const color = getComputedStyle(slot.firstChild.contentDocument.querySelector('.stage')).backgroundColor;
    manager.clear();
    source.contentDocument.body.dataset.mode = 'light';
    return { color, frames: slot.children.length, marker: source.contentDocument.querySelector('.stage').getAttribute('data-uihub-background-host'), tone: root.dataset.detailTone || '' };
  });
  assert.equal(result.color, 'rgb(16, 16, 16)');
  assert.equal(result.frames, 0);
  assert.equal(result.marker, null);
  assert.equal(result.tone, '');
});

const viewerReady = (page) => page.waitForFunction(() => root.dataset.load === 'ready' && root.dataset.phase === 'open' && slot.children.length === 1);

test('重放样式表或背景图片失败时不隐藏前景背景', async (t) => {
  const { page } = await fixture(t, { css: '.stage{background-image:url(assets/grain.svg)}' });
  let attempts = 0;
  await page.route('**/prototype/styles.css', (route) => { attempts++; return route.fulfill({ status: 404, contentType: 'text/css', body: 'Unavailable' }); });
  const cssFailure = await page.evaluate(async () => {
    (await manager.prepare(source, 'software', controller.signal)).commit();
    return { frames: slot.children.length, image: getComputedStyle(source.contentDocument.querySelector('.stage')).backgroundImage };
  });
  assert.equal(attempts, 1);
  assert.equal(cssFailure.frames, 0);
  assert.match(cssFailure.image, /grain\.svg/);
  await page.unroute('**/prototype/styles.css');
  await page.route('**/assets/grain.svg', (route) => route.fulfill({ status: 404, body: 'Unavailable' }));
  const imageFailure = await page.evaluate(async () => {
    (await manager.prepare(source, 'software', controller.signal)).commit();
    return { frames: slot.children.length, image: getComputedStyle(source.contentDocument.querySelector('.stage')).backgroundImage };
  });
  assert.equal(imageFailure.frames, 0);
  assert.match(imageFailure.image, /grain\.svg/);
});

test('主题 link 的 href、media 和加载完成都会更新重放样式', async (t) => {
  const { page } = await fixture(t);
  await page.route('**/red.css', (route) => route.fulfill({ contentType: 'text/css', body: '.stage{background:red!important}' }));
  await page.route('**/blue.css', (route) => route.fulfill({ contentType: 'text/css', body: '.stage{background:blue!important}' }));
  await page.evaluate(async () => {
    const link = source.contentDocument.querySelector('link');
    await new Promise((resolve) => { link.onload = resolve; link.href = 'red.css'; });
    (await manager.prepare(source, 'software', controller.signal)).commit();
    link.href = 'blue.css';
  });
  await page.waitForFunction(() => slot.firstChild && getComputedStyle(slot.firstChild.contentDocument.querySelector('.stage')).backgroundColor === 'rgb(0, 0, 255)');
  await page.evaluate(() => { source.contentDocument.querySelector('link').media = 'not all'; });
  await page.waitForFunction(() => slot.firstChild && getComputedStyle(slot.firstChild.contentDocument.querySelector('.stage')).backgroundColor === 'rgb(232, 227, 216)');
});

test('详情切换同步提交背景和参数，抽屉及全屏保留，背景 cover 不拉大前景 iframe', async (t) => {
  const { page } = await fixture(t, { viewer: true });
  await viewerReady(page);
  await page.locator('[data-detail-toggle-drawer]').click();
  await page.waitForFunction(() => root.dataset.drawer === 'closed');
  const before = await page.evaluate(() => document.querySelector('[data-detail-host] iframe').getBoundingClientRect().toJSON());
  await page.locator('[data-detail-next]').click();
  await page.waitForFunction(() => location.hash === '#prototype=next' && root.dataset.phase === 'open' && root.dataset.detailTone === 'dark');
  const result = await page.evaluate(() => ({
    foreground: document.querySelector('[data-detail-host] iframe').getBoundingClientRect().toJSON(),
    background: getComputedStyle(slot.firstChild.contentDocument.querySelector('.stage')).backgroundColor,
    prompt: document.querySelector('[data-field="prompt"] dd').textContent,
    drawer: root.dataset.drawer, frames: document.querySelectorAll('[data-detail-host] iframe').length,
  }));
  assert.deepEqual(result.foreground, before);
  assert.equal(result.background, 'rgb(17, 17, 17)');
  assert.equal(result.prompt, 'next');
  assert.equal(result.drawer, 'closed');
  assert.equal(result.frames, 1);
  await page.locator('[data-detail-fullscreen]').click();
  await page.waitForFunction(() => root.dataset.clean === 'true');
  await page.evaluate(() => document.querySelector('[data-detail-previous]').click());
  await page.waitForFunction(() => location.hash === '#prototype=demo' && root.dataset.phase === 'open' && root.dataset.detailTone === 'light');
  assert.deepEqual(await page.evaluate(() => ({ clean: root.dataset.clean, drawer: root.dataset.drawer })), { clean: 'true', drawer: 'closed' });
  await page.locator('[data-detail-restore]').click();
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  assert.equal(await page.locator('[data-detail-background] iframe').count(), 0);
});

test('详情原型 404 保留旧背景、参数和配色，重试才能切换', async (t) => {
  const { page } = await fixture(t, { viewer: true });
  await viewerReady(page);
  const before = await page.evaluate(() => ({ background: slot.firstChild.srcdoc, ink: root.style.getPropertyValue('--ink'), prompt: document.querySelector('[data-field="prompt"] dd').textContent }));
  await page.route('**/prototype-next/index.html', (route) => route.fulfill({ status: 404, body: 'Not found' }));
  await page.locator('[data-detail-next]').click();
  await page.waitForFunction(() => root.dataset.phase === 'open' && !document.querySelector('[data-detail-retry]').hidden);
  assert.deepEqual(await page.evaluate(() => ({ background: slot.firstChild.srcdoc, ink: root.style.getPropertyValue('--ink'), prompt: document.querySelector('[data-field="prompt"] dd').textContent })), before);
  assert.equal(await page.evaluate(() => location.hash), '#prototype=demo');
  await page.unroute('**/prototype-next/index.html');
  await page.locator('[data-detail-retry]').click();
  await page.waitForFunction(() => root.dataset.phase === 'open' && root.dataset.detailTone === 'dark');
  assert.equal(await page.evaluate(() => location.hash), '#prototype=next');
});

test('详情后台预加载期间旧背景不消失，返回取消后迟到事件不会恢复详情', async (t) => {
  const { page } = await fixture(t, { viewer: true });
  await viewerReady(page);
  const blocked = [];
  await page.route('**/prototype-next/index.html', (route) => {
    if (route.request().method() === 'HEAD') return route.fulfill({ status: 200 });
    blocked.push(route);
  });
  const before = await page.evaluate(() => slot.firstChild.srcdoc);
  await page.locator('[data-detail-next]').click();
  await page.waitForFunction(() => root.dataset.phase === 'switching');
  assert.equal(await page.evaluate(() => slot.firstChild.srcdoc), before);
  assert.equal(await page.locator('[data-field="prompt"] dd').textContent(), 'demo');
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  for (const route of blocked) await route.fulfill({ contentType: 'text/html', body: '<body>迟到原型</body>' }).catch(() => {});
  assert.deepEqual(await page.evaluate(() => ({ hidden: root.hidden, background: slot.children.length, frames: document.querySelectorAll('[data-detail-host] iframe').length, locked: document.documentElement.classList.contains('detail-scroll-locked') })), { hidden: true, background: 0, frames: 0, locked: false });
});
