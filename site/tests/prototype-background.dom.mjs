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
async function fixture(t, { head = '', css = '', html = '<main class="stage"><div class="canvas"><button>交互窗口</button></div></main>', viewer = false, viewport = { width: 1600, height: 1000 }, reducedMotion = 'reduce', details = {}, hasTouch = false } = {}) {
  const page = await browser.newPage({ viewport, reducedMotion, hasTouch });
  t.after(() => page.close());
  const requests = [];
  await page.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    if (scripts.has(path)) return route.fulfill({ contentType: 'text/javascript', body: scripts.get(path) });
    if (path === '/prototype/index.html' || path === '/prototype-next/index.html') return route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head>${head}<link rel="stylesheet" href="styles.css"><style>${baseStyle}${css}${path.includes('-next') ? '.stage{background:#111}body{--ink:#eee}' : ''}</style></head><body>${html}</body></html>` });
    if (path.endsWith('/styles.css')) return route.fulfill({ contentType: 'text/css', headers: { 'Cache-Control': 'no-store' }, body: '.canvas button{font-size:16px}' });
    if (path.endsWith('.svg')) return route.fulfill({ contentType: 'image/svg+xml', headers: { 'Cache-Control': 'no-store' }, body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ddd"/></svg>' });
    if (viewer) {
      const items = ['demo', 'next'].map((slug) => ({ slug, name: slug, href: slug === 'demo' ? '/prototype/index.html' : '/prototype-next/index.html', details: { prompt: slug, type: 'software', ...details } }));
      const markup = detailMarkup.replace('data-detail-items={JSON.stringify(items)}', `data-detail-items='${JSON.stringify(items)}'`);
      return route.fulfill({ contentType: 'text/html', body: `<!doctype html><style>*{box-sizing:border-box}:root{--paper:#eee;--card:white;--ink:#202020;--ink-2:#333;--ink-3:#444;--ease:ease;--ease-shared:ease;--ease-drawer:ease;--r-pill:999px;--shadow-sm:0 1px 2px rgb(0 0 0 / .05)}${detailCss}</style><div id="page"><a class="card" data-slug="demo"><div class="frame">原型</div></a><a class="card" data-slug="next"><div class="frame">下一个</div></a></div>${markup}` });
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

for (const [name, head, css] of [
  ['CSS', '', ':root{color-scheme:dark}'],
  ['meta', '<meta name="color-scheme" content="dark">', ''],
]) {
  test(`${name} 深色 color-scheme 不给原型画布铺不透明底色，清理恢复原声明`, async (t) => {
    const { page } = await fixture(t, { viewer: true, head, css: css + '.stage{background:#1a1a1a}body{--ink:#eee}' });
    await page.waitForFunction(() => root.dataset.load === 'ready' && root.dataset.phase === 'open' && root.dataset.detailTone === 'dark');
    const shot = (await page.screenshot()).toString('base64');
    const result = await page.evaluate(async (base64) => {
      const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + base64)).blob());
      const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d');
      context.drawImage(bitmap, 0, 0);
      const at = (x, y) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3).join(',');
      const frame = document.querySelector('[data-detail-host] iframe');
      const rect = frame.getBoundingClientRect();
      const doc = window.originalSchemeDoc = frame.contentDocument;
      const middle = Math.round(rect.top + rect.height / 2);
      return {
        scheme: getComputedStyle(frame).colorScheme,
        inner: `${getComputedStyle(doc.documentElement).colorScheme},${getComputedStyle(doc.body).colorScheme}`,
        paper: root.style.getPropertyValue('--detail-paper'),
        surface: getComputedStyle(document.querySelector('.detail-surface')).backgroundColor,
        canvas: getComputedStyle(doc.body).backgroundColor,
        edge: at(Math.round(rect.left + 24), middle),
        gutter: at(8, middle),
      };
    }, shot);
    assert.equal(result.scheme, 'normal');
    assert.equal(result.edge, '26,26,26');
    assert.equal(result.gutter, '26,26,26');
    assert.equal(result.inner, 'light,normal');
    assert.equal(result.canvas, 'rgba(0, 0, 0, 0)');
    assert.equal(result.paper, 'rgb(26, 26, 26)');
    assert.equal(result.surface, 'rgb(26, 26, 26)');
    assert.match(detailCss, /\.detail-surface\{[^}]*background:var\(--detail-paper,var\(--paper\)\)/);
    assert.match(detailCss, /\.detail-frame-host iframe\{[^}]*color-scheme:normal/);
    await page.locator('[data-detail-back]').click();
    await page.waitForFunction(() => root.hidden);
    const restored = await page.evaluate(() => ({
      sheet: originalSchemeDoc.getElementById('uihub-background-transparency') !== null,
      marker: originalSchemeDoc.documentElement.hasAttribute('data-uihub-background-host'),
      meta: originalSchemeDoc.querySelector('meta[name="color-scheme"]')?.content ?? null,
    }));
    assert.deepEqual(restored, { sheet: false, marker: false, meta: head ? 'dark' : null });
  });
}

const viewerReady = (page) => page.waitForFunction(() => root.dataset.load === 'ready' && root.dataset.phase === 'open' && slot.children.length === 1);

for (const viewport of [{ width: 1600, height: 1000 }, { width: 390, height: 844 }]) {
  test(`${viewport.width}px 壁纸背景下工具条、两侧按钮和参数面板使用半透明毛玻璃`, async (t) => {
    const { page } = await fixture(t, { viewer: true, viewport, css: '.stage{background:#e8e3d8 url(assets/grain.svg) center / cover}' });
    await viewerReady(page);
    await page.waitForFunction(() => getComputedStyle(root.querySelector('[data-detail-drawer]')).opacity === '1');
    const materials = await page.evaluate(() => ['[data-detail-toolbar]', '[data-detail-back]', '[data-detail-toggle-drawer]', '[data-detail-drawer]'].map((selector) => {
      const css = getComputedStyle(root.querySelector(selector));
      return { selector, background: css.backgroundColor, blur: css.backdropFilter, shadow: css.boxShadow, radius: css.borderTopLeftRadius, border: css.borderLeftWidth };
    }));
    for (const material of materials) {
      assert.match(material.background, /^rgba\(.+, 0\.6\)$/);
      assert.match(material.blur, /blur\((20|24)px\)/);
      if (material.selector === '[data-detail-drawer]') {
        assert.equal(material.shadow, 'none');
        assert.equal(material.radius, '8px');
        assert.equal(material.border, '1px');
      } else assert.match(material.shadow, /inset/);
    }
    assert.equal(await page.locator('[data-detail-loading]').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
    await page.locator('[data-detail-toggle-drawer]').click();
    assert.equal(await page.evaluate(() => root.dataset.drawer), 'closed');
    await page.locator('[data-detail-toggle-drawer]').click();
    assert.equal(await page.evaluate(() => root.dataset.drawer), 'open');
    await page.emulateMedia({ contrast: 'more' });
    const accessible = await page.evaluate(() => {
      const css = getComputedStyle(root.querySelector('[data-detail-drawer]'));
      return { background: css.backgroundColor, blur: css.backdropFilter };
    });
    assert.match(accessible.background, /^rgb\(/);
    assert.equal(accessible.blur, 'none');
  });
}

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

test('全屏恢复按钮位于左上角，闪烁三次后回到半透明，重复进入不残留动画或重载原型', async (t) => {
  const { page } = await fixture(t, { viewer: true, viewport: { width: 1366, height: 768 }, reducedMotion: 'no-preference' });
  await viewerReady(page);
  await page.evaluate(() => {
    window.originalFrame = root.querySelector('[data-detail-host] iframe');
    window.restoreHints = [];
    const restore = root.querySelector('[data-detail-restore]');
    const animate = restore.animate.bind(restore);
    restore.animate = (frames, options) => {
      restoreHints.push({ frames, options });
      window.restoreHintAnimation = animate(frames, options);
      return restoreHintAnimation;
    };
  });
  const restore = page.locator('[data-detail-restore]');
  await page.locator('[data-detail-fullscreen]').click();
  const hints = await page.evaluate(() => restoreHints);
  assert.equal(hints.length, 1);
  assert.deepEqual(hints[0].frames, [{ opacity: '.24' }, { opacity: 1 }, { opacity: '.24' }]);
  assert.equal(hints[0].options.duration, 300);
  assert.equal(hints[0].options.iterations, 3);
  assert.equal(hints[0].options.fill, 'none');
  assert.equal(Math.round(await page.evaluate(() => restoreHintAnimation.effect.getComputedTiming().activeDuration)), 900);
  await page.waitForFunction(() => restoreHintAnimation.playState === 'running' && restoreHintAnimation.currentTime > 350);
  await page.waitForFunction(() => {
    const restore = root.querySelector('[data-detail-restore]');
    return restore.getAnimations().length === 0 && getComputedStyle(restore).opacity === '0.24';
  });
  const position = await restore.boundingBox();
  assert.equal(position.x, 20);
  assert.equal(position.y, 20);
  assert.equal(position.width, 40);
  assert.equal(position.height, 40);
  await restore.hover();
  await page.waitForFunction(() => getComputedStyle(root.querySelector('[data-detail-restore]')).opacity === '1');
  await restore.click();
  assert.equal(await restore.isVisible(), false);
  await page.locator('[data-detail-fullscreen]').click();
  assert.equal(await page.evaluate(() => restoreHints.length), 2);
  await restore.hover();
  await page.waitForFunction(() => restoreHintAnimation.playState === 'idle' && getComputedStyle(root.querySelector('[data-detail-restore]')).opacity === '1');
  await page.keyboard.press('Escape');
  assert.deepEqual(await page.evaluate(() => ({
    clean: root.dataset.clean,
    hidden: root.querySelector('[data-detail-restore]').hidden,
    animations: root.querySelector('[data-detail-restore]').getAnimations().length,
    sameFrame: root.querySelector('[data-detail-host] iframe') === originalFrame,
    focused: document.activeElement === root.querySelector('[data-detail-fullscreen]'),
  })), { clean: 'false', hidden: true, animations: 0, sameFrame: true, focused: true });
});

for (const hasTouch of [false, true]) {
  test(`减少动效时恢复按钮不闪烁，${hasTouch ? '触摸' : '鼠标'}环境保持可见且可退出`, async (t) => {
    const { page } = await fixture(t, { viewer: true, hasTouch, viewport: hasTouch ? { width: 390, height: 844 } : { width: 1366, height: 768 } });
    await viewerReady(page);
    await page.evaluate(() => {
      window.restoreHints = 0;
      const restore = root.querySelector('[data-detail-restore]');
      const animate = restore.animate.bind(restore);
      restore.animate = (...args) => { restoreHints++; return animate(...args); };
    });
    const fullscreen = page.locator('[data-detail-fullscreen]');
    if (hasTouch) await fullscreen.tap(); else await fullscreen.click();
    const restore = page.locator('[data-detail-restore]');
    assert.equal(await page.evaluate(() => restoreHints), 0);
    await page.waitForFunction((opacity) => getComputedStyle(root.querySelector('[data-detail-restore]')).opacity === opacity, hasTouch ? '0.5' : '0.24');
    const position = await restore.boundingBox();
    assert.equal(position.x, 20);
    assert.equal(position.y, 20);
    if (hasTouch) await restore.tap(); else await restore.click();
    assert.equal(await restore.isVisible(), false);
    assert.equal(await page.evaluate(() => root.dataset.clean), 'false');
  });
}

test('键盘进入全屏不闪烁，恢复按钮保持清晰焦点并支持 Escape 退出', async (t) => {
  const { page } = await fixture(t, { viewer: true, reducedMotion: 'no-preference' });
  await viewerReady(page);
  await page.locator('[data-detail-fullscreen]').focus();
  await page.keyboard.press('Enter');
  const restore = page.locator('[data-detail-restore]');
  assert.equal(await restore.evaluate((element) => element === document.activeElement && element.matches(':focus-visible')), true);
  assert.equal(await restore.evaluate((element) => element.getAnimations().filter((animation) => animation.effect.getTiming().fill === 'none').length), 0);
  await page.waitForFunction(() => getComputedStyle(root.querySelector('[data-detail-restore]')).opacity === '1');
  await page.keyboard.press('Escape');
  assert.equal(await restore.isVisible(), false);
  assert.equal(await page.evaluate(() => document.activeElement === root.querySelector('[data-detail-fullscreen]')), true);
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
  const loadingPosition = await page.evaluate(() => {
    const loading = document.querySelector('[data-detail-loading]').getBoundingClientRect();
    const back = document.querySelector('[data-detail-back]').getBoundingClientRect();
    return { left: loading.left, centerY: loading.top + loading.height / 2, backRight: back.right, backCenterY: back.top + back.height / 2, text: document.querySelector('[data-detail-status]').textContent };
  });
  assert.equal(loadingPosition.text, '正在切换原型…');
  assert.ok(loadingPosition.left > loadingPosition.backRight);
  assert.equal(loadingPosition.centerY, loadingPosition.backCenterY);
  assert.equal(await page.evaluate(() => slot.firstChild.srcdoc), before);
  assert.equal(await page.locator('[data-field="prompt"] dd').textContent(), 'demo');
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  for (const route of blocked) await route.fulfill({ contentType: 'text/html', body: '<body>迟到原型</body>' }).catch(() => {});
  assert.deepEqual(await page.evaluate(() => ({ hidden: root.hidden, background: slot.children.length, frames: document.querySelectorAll('[data-detail-host] iframe').length, locked: document.documentElement.classList.contains('detail-scroll-locked') })), { hidden: true, background: 0, frames: 0, locked: false });
});

test('参考来源 hover 与键盘聚焦使用原型强调色，并随深浅主题更新', async (t) => {
  const { page } = await fixture(t, {
    viewer: true,
    details: { source: { raw: '参考设计', href: 'https://example.com' } },
    css: 'body[data-mode="dark"] .stage{background:#111}body[data-mode="dark"]{--ink:#eee;--accent:#aaddbb}',
  });
  await viewerReady(page);
  const link = page.locator('[data-field="source"] a');
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-field="source"] a');
    return getComputedStyle(element).color === getComputedStyle(element.parentElement).color;
  });
  const initial = await link.evaluate((element) => ({ color: getComputedStyle(element).color, parent: getComputedStyle(element.parentElement).color, accent: getComputedStyle(root).getPropertyValue('--gold').trim() }));
  assert.equal(initial.color, initial.parent);
  assert.notEqual(initial.color, initial.accent);
  await link.hover();
  const waitForHighlight = () => page.waitForFunction(() => {
    const style = getComputedStyle(document.querySelector('[data-field="source"] a'));
    const accent = getComputedStyle(root).getPropertyValue('--gold').trim();
    return style.color === accent && style.textDecorationColor === accent;
  });
  await waitForHighlight();
  await page.evaluate(() => { document.querySelector('[data-detail-host] iframe').contentDocument.body.dataset.mode = 'dark'; });
  await page.waitForFunction(() => root.dataset.detailTone === 'dark');
  await waitForHighlight();
  assert.notEqual(await page.evaluate(() => root.style.getPropertyValue('--gold').trim()), initial.accent);
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await link.focus();
  await waitForHighlight();
  assert.equal(await link.evaluate((element) => element.matches(':focus-visible')), true);
  assert.equal(await link.evaluate((element) => getComputedStyle(element).transitionDuration), '0s');
  await link.evaluate((element) => element.blur());
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-field="source"] a');
    return getComputedStyle(element).color === getComputedStyle(element.parentElement).color;
  });
});

test('触摸环境不触发参考来源的鼠标 hover 高亮', async (t) => {
  const { page } = await fixture(t, { viewer: true, hasTouch: true, details: { source: { raw: '参考设计', href: 'https://example.com' } } });
  await viewerReady(page);
  assert.equal(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches), false);
  const link = page.locator('[data-field="source"] a');
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-field="source"] a');
    return getComputedStyle(element).color === getComputedStyle(element.parentElement).color;
  });
  await link.hover();
  const result = await link.evaluate((element) => ({ hover: element.matches(':hover'), color: getComputedStyle(element).color, parent: getComputedStyle(element.parentElement).color, accent: getComputedStyle(root).getPropertyValue('--gold').trim() }));
  assert.equal(result.hover, true);
  assert.equal(result.color, result.parent);
  assert.notEqual(result.color, result.accent);
});

for (const [width, height, reducedMotion] of [[1600, 1000, 'no-preference'], [960, 800, 'reduce'], [320, 720, 'reduce']]) {
  test(`${width}px 详情工具条顶部全视口居中、图标对齐，抽屉及窗口尺寸变化不移动工具条`, async (t) => {
    const { page } = await fixture(t, { viewer: true, viewport: { width, height }, reducedMotion });
    await viewerReady(page);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-detail-toolbar]')).transform === 'none' && getComputedStyle(document.querySelector('[data-detail-toolbar]')).opacity === '1');
    const geometry = () => page.evaluate(() => {
      const rect = (selector) => document.querySelector(selector).getBoundingClientRect().toJSON();
      return { viewport: innerWidth, toolbar: rect('[data-detail-toolbar]'), tool: rect('[data-detail-toolbar] .detail-icon'), back: rect('[data-detail-back]'), toggle: rect('[data-detail-toggle-drawer]'), preview: rect('[data-detail-preview]'), drawer: rect('[data-detail-drawer]'), parent: document.querySelector('[data-detail-tools-anchor]').parentElement === root, header: !!document.querySelector('.detail-drawer-head'), paddingTop: getComputedStyle(document.querySelector('[data-detail-fields]')).paddingTop };
    });
    const check = (result) => {
      const centerY = (rect) => rect.top + rect.height / 2;
      assert.equal(result.toolbar.left + result.toolbar.width / 2, result.viewport / 2);
      assert.equal(centerY(result.tool), centerY(result.back));
      assert.equal(centerY(result.tool), centerY(result.toggle));
      assert.ok(result.toolbar.left > result.back.right);
      assert.ok(result.toolbar.right < result.toggle.left);
      assert.ok(result.toolbar.bottom < result.preview.top);
      assert.equal(result.parent, true);
    };
    const initial = await geometry();
    check(initial);
    assert.equal(initial.header, false);
    assert.equal(initial.paddingTop, '0px');
    assert.ok(initial.drawer.width <= 332);
    if (width === 1600) {
      assert.ok(initial.preview.width > 1092);
      assert.ok(initial.preview.height > 836);
      assert.equal(initial.drawer.width, 332);
    }
    await page.locator('[data-detail-toggle-drawer]').click();
    await page.waitForFunction(() => root.dataset.drawer === 'closed');
    const closed = await geometry();
    check(closed);
    assert.deepEqual(closed.toolbar, initial.toolbar);
    assert.deepEqual(closed.tool, initial.tool);
    await page.setViewportSize({ width: width === 320 ? 390 : width - 160, height });
    check(await geometry());
    await page.route('**/prototype-next/index.html', (route) => route.fulfill({ status: 404, body: 'Not found' }));
    await page.locator('[data-detail-next]').click();
    await page.waitForFunction(() => root.dataset.phase === 'open' && !document.querySelector('[data-detail-retry]').hidden);
    const error = await page.evaluate(() => {
      const status = document.querySelector('[data-detail-loading]').getBoundingClientRect();
      const toolbar = document.querySelector('[data-detail-toolbar]').getBoundingClientRect();
      const back = document.querySelector('[data-detail-back]').getBoundingClientRect();
      return { left: status.left, right: status.right, centerY: status.top + status.height / 2, backRight: back.right, backCenterY: back.top + back.height / 2, toolbarLeft: toolbar.left, width: innerWidth };
    });
    assert.ok(error.left > error.backRight && error.right <= error.width);
    assert.equal(error.centerY, error.backCenterY);
    assert.ok(error.right < error.toolbarLeft);
  });
}

for (const type of ['software', 'app', 'component']) {
  test(`${type} 外层窗口阴影越过 iframe，窗口尺寸、圆角及内部裁剪保持原样`, async (t) => {
    const { page } = await fixture(t, {
      viewer: true, details: { type },
      css: '.canvas{height:calc(100% - 24px);overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4),inset 0 0 0 1px white}.canvas button{box-shadow:0 10px 30px red}',
    });
    await viewerReady(page);
    const result = await page.evaluate(() => {
      const iframe = document.querySelector('[data-detail-host] iframe');
      const window = iframe.contentDocument.querySelector('.canvas');
      const shadow = document.querySelector('.detail-window-shadow');
      const layer = document.querySelector('.detail-shadow-layer');
      const sourceCss = iframe.contentWindow.getComputedStyle(window);
      const sourceRect = window.getBoundingClientRect();
      const frameRect = iframe.getBoundingClientRect();
      const ghostRect = shadow.getBoundingClientRect();
      return {
        count: document.querySelectorAll('.detail-window-shadow').length,
        width: iframe.clientWidth, viewWidth: iframe.contentWindow.innerWidth,
        height: iframe.clientHeight, viewHeight: iframe.contentWindow.innerHeight,
        sourceShadow: sourceCss.boxShadow, ghostShadow: getComputedStyle(shadow).boxShadow,
        ghostBorder: getComputedStyle(shadow).borderBottomWidth,
        radius: sourceCss.borderTopLeftRadius, ghostRadius: getComputedStyle(shadow).borderTopLeftRadius,
        overflow: sourceCss.overflow, previewOverflow: getComputedStyle(document.querySelector('[data-detail-preview]')).overflow,
        hostOverflow: getComputedStyle(document.querySelector('[data-detail-host]')).overflow,
        clip: getComputedStyle(layer).clipPath, pointerEvents: getComputedStyle(layer).pointerEvents,
        source: { left: frameRect.left + sourceRect.left, top: frameRect.top + sourceRect.top, width: sourceRect.width, height: sourceRect.height },
        ghost: { left: ghostRect.left, top: ghostRect.top, width: ghostRect.width, height: ghostRect.height },
        bottomGap: iframe.clientHeight - sourceRect.bottom,
      };
    });
    assert.equal(result.count, 1);
    assert.equal(result.width, result.viewWidth);
    assert.equal(result.height, result.viewHeight);
    assert.match(result.sourceShadow, /inset/);
    assert.doesNotMatch(result.sourceShadow, /30px 80px/);
    assert.doesNotMatch(result.ghostShadow, /inset|rgb\(255, 0, 0\)/);
    assert.equal(result.ghostBorder, '0px');
    assert.match(result.ghostShadow, /30px 80px/);
    assert.equal(result.radius, result.ghostRadius);
    assert.equal(result.overflow, 'hidden');
    assert.equal(result.previewOverflow, 'visible');
    assert.equal(result.hostOverflow, 'visible');
    assert.equal(result.clip, 'none');
    assert.equal(result.pointerEvents, 'none');
    assert.deepEqual(result.ghost, result.source);
    assert.ok(result.bottomGap < 30);
    await page.locator('[data-detail-back]').click();
    await page.waitForFunction(() => root.hidden);
    assert.equal(await page.locator('.detail-shadow-layer').count(), 0);
  });
}

test('阴影层保留 2D 缩放与旋转，外阴影分离不改变窗口变换', async (t) => {
  const { page } = await fixture(t, { viewer: true, css: '.canvas{box-shadow:0 30px 80px rgba(0,0,0,.4);transform:rotate(3deg) scale(.85);padding:12px;border:2px solid black}' });
  await viewerReady(page);
  const result = await page.evaluate(() => {
    const iframe = document.querySelector('[data-detail-host] iframe');
    const window = iframe.contentDocument.querySelector('.canvas');
    const frame = iframe.getBoundingClientRect(), source = window.getBoundingClientRect();
    const ghost = document.querySelector('.detail-window-shadow').getBoundingClientRect();
    return { source: [frame.left + source.left, frame.top + source.top, source.width, source.height], ghost: [ghost.left, ghost.top, ghost.width, ghost.height], transform: iframe.contentWindow.getComputedStyle(window).transform, overflow: getComputedStyle(document.querySelector('.detail-shadow-layer')).overflow };
  });
  result.source.forEach((value, index) => assert.ok(Math.abs(value - result.ghost[index]) < .1));
  assert.notEqual(result.transform, 'none');
  assert.equal(result.overflow, 'visible');
});

test('阴影层跟随主题、尺寸及原地淡化切换，旧层和监听在卸载后清理', async (t) => {
  const { page } = await fixture(t, { viewer: true, reducedMotion: 'no-preference', css: '.canvas{box-shadow:0 30px 80px rgba(0,0,0,.4)}body[data-theme="warm"] .canvas{box-shadow:0 44px 80px -20px rgb(140,60,10)}' });
  await viewerReady(page);
  await page.evaluate(() => { document.querySelector('[data-detail-host] iframe').contentDocument.body.dataset.theme = 'warm'; });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.detail-window-shadow')).boxShadow.includes('140, 60, 10'));
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.waitForFunction(() => document.querySelector('.detail-shadow-layer').style.width === document.querySelector('[data-detail-host] iframe').clientWidth + 'px');
  await page.locator('[data-detail-next]').click();
  await page.waitForFunction(() => root.dataset.swapping === 'true' && [...document.querySelectorAll('.detail-shadow-layer')].some((layer) => layer.getAnimations().some((animation) => animation.effect.getKeyframes().at(-1).opacity === '0')));
  const animations = await page.evaluate(() => {
    const layers = [...document.querySelectorAll('.detail-shadow-layer')];
    return { opacity: layers.map((layer) => layer.style.opacity), linked: layers.some((layer) => layer.getAnimations().some((animation) => animation.effect.getKeyframes().at(-1).opacity === '0')) };
  });
  await page.waitForFunction(() => root.dataset.phase === 'open' && root.dataset.detailTone === 'dark');
  assert.ok(animations.linked);
  assert.equal(await page.locator('.detail-shadow-layer').count(), 1);
  await page.locator('[data-detail-fullscreen]').click();
  await page.waitForFunction(() => root.dataset.clean === 'true');
  await page.locator('[data-detail-restore]').click();
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  assert.equal(await page.locator('.detail-shadow-layer').count(), 0);
});

test('网页不补绘外层窗口阴影，阴影层也不会在失败或取消后残留', async (t) => {
  const website = await fixture(t, { viewer: true, details: { type: 'website' }, css: '.canvas{box-shadow:0 30px 80px black}' });
  await viewerReady(website.page);
  assert.equal(await website.page.locator('.detail-shadow-layer').count(), 0);
  const { page } = await fixture(t, { viewer: true, css: '.canvas{box-shadow:0 30px 80px black}' });
  await viewerReady(page);
  await page.route('**/prototype-next/index.html', (route) => route.fulfill({ status: 404, body: 'Not found' }));
  await page.locator('[data-detail-next]').click();
  await page.waitForFunction(() => root.dataset.phase === 'open' && !document.querySelector('[data-detail-retry]').hidden);
  assert.equal(await page.locator('.detail-shadow-layer').count(), 1);
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  assert.equal(await page.locator('.detail-shadow-layer').count(), 0);
});

test('背景重放失败保留原外阴影，不因阴影补绘移除原型样式', async (t) => {
  const { page } = await fixture(t, { viewer: true, css: '.stage{background-image:url(assets/missing-resource)}.canvas{box-shadow:0 30px 80px black}' });
  await page.waitForFunction(() => root.dataset.phase === 'open' && root.dataset.load === 'ready');
  const result = await page.evaluate(() => {
    const doc = document.querySelector('[data-detail-host] iframe').contentDocument;
    return { background: slot.children.length, shadow: doc.defaultView.getComputedStyle(doc.querySelector('.canvas')).boxShadow, extracted: !!doc.getElementById('uihub-window-shadow') };
  });
  assert.equal(result.background, 0);
  assert.match(result.shadow, /30px 80px/);
  assert.equal(result.extracted, false);
});

test('透明页面完整绘制阴影，无底边裁切或新增边框，返回清理阴影覆盖样式', async (t) => {
  const { page } = await fixture(t, { viewer: true, css: '.stage{background:none}.canvas{width:100%;height:100%;border-radius:0;display:flex;justify-content:center;align-items:center;box-shadow:0 30px 80px rgba(0,0,0,.4)}' });
  await page.waitForFunction(() => root.dataset.phase === 'open' && root.dataset.load === 'ready');
  const result = await page.evaluate(() => {
    window.shadowDoc = document.querySelector('[data-detail-host] iframe').contentDocument;
    const ghost = document.querySelector('.detail-window-shadow');
    const layer = document.querySelector('.detail-shadow-layer');
    return { boxShadow: shadowDoc.defaultView.getComputedStyle(shadowDoc.querySelector('.canvas')).boxShadow, clip: getComputedStyle(layer).clipPath, border: getComputedStyle(ghost).borderBottomWidth, background: slot.children.length };
  });
  assert.equal(result.boxShadow, 'none');
  assert.equal(result.clip, 'none');
  assert.equal(result.border, '0px');
  assert.equal(result.background, 0);
  await page.locator('[data-detail-back]').click();
  await page.waitForFunction(() => root.hidden);
  const restored = await page.evaluate(() => ({ style: !!shadowDoc.getElementById('uihub-window-shadow'), marker: shadowDoc.querySelector('.canvas').getAttribute('data-uihub-shadow-window'), layers: document.querySelectorAll('.detail-shadow-layer').length }));
  assert.deepEqual(restored, { style: false, marker: null, layers: 0 });
});
