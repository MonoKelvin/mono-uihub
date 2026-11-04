import test from 'node:test';
import assert from 'node:assert/strict';
import { initPrototypeDetail } from '../src/scripts/prototype-detail.js';

// 只验证控制器的状态和导航，不模拟浏览器布局或动画视觉表现。
async function fixture(t, { hash = '', manualMotion = false, withScreenshot = true, details = { prompt: '首条', promptCount: 2 }, catalog = null, sequence = null } = {}) {
  const motions = [], requests = [], busy = [], copies = [];
  const selectors = new Map();
  let document;
  class Element extends EventTarget {
    children = [];
    dataset = {};
    style = { width: '', setProperty() {} };
    hidden = false;
    inert = false;
    attrs = new Map();
    classes = new Set();
    classList = {
      add: (value) => this.classes.add(value), remove: (value) => this.classes.delete(value),
      contains: (value) => this.classes.has(value),
    };
    append(...nodes) { nodes.forEach((node) => { node.parentElement = this; this.children.push(node); }); }
    replaceChildren(...nodes) { this.children.forEach((node) => { node.parentElement = null; }); this.children = []; this.append(...nodes); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((node) => node !== this); this.parentElement = null; }
    setAttribute(key, value) { this.attrs.set(key, value); }
    getAttribute(key) { return this.attrs.get(key) ?? null; }
    hasAttribute(key) { return this.attrs.has(key); }
    removeAttribute(key) { this.attrs.delete(key); }
    querySelector(selector) {
      if (selector === 'iframe') return this.children[0];
      if (selector === 'i') return this.children.find((node) => node.tagName === 'I');
      return selectors.get(selector) || null;
    }
    querySelectorAll(selector) {
      const roots = this === root ? [...selectors.values()] : this.children;
      const flatten = (node) => [node, ...node.children.flatMap(flatten)];
      return [...new Set(roots.flatMap(flatten))].filter((node) => selector === '[data-detail-label]' && 'detailLabel' in node.dataset);
    }
    closest(selector) { return selector === '[data-copy-prompt]' && 'copyPrompt' in this.dataset ? this : null; }
    getBoundingClientRect() { return { left: 48, top: 72, width: 1000, height: 700, bottom: 772 }; }
    focus() { document.activeElement = this; }
    animate(keyframes, options) {
      let resolve;
      const animation = {
        target: this, keyframes, options,
        playState: 'running', finished: new Promise((done) => { resolve = done; }),
        finish() { this.playState = 'finished'; resolve(); }, cancel() { resolve(); },
      };
      motions.push(animation);
      if (!manualMotion) queueMicrotask(() => animation.finish());
      return animation;
    }
  }
  const names = ['surface', 'preview', 'snapshot', 'snapshot-crop', 'host', 'fields', 'drawer', 'back', 'heading', 'tools-anchor', 'toolbar', 'restore', 'loading', 'retry', 'toggle-drawer', 'previous', 'next', 'status', 'copy-status', 'open', 'scrim', 'fullscreen'];
  for (const name of names) selectors.set(`[data-detail-${name}]`, new Element());
  const root = new Element(), page = new Element(), card = new Element(), frame = new Element();
  const originalFocus = new Element();
  frame.getBoundingClientRect = () => ({ left: 100, top: 200, width: 400, height: 250, bottom: 450 });
  selectors.set('.frame', frame);
  frame.clientLeft = frame.clientTop = 7;
  frame.offsetWidth = 400; frame.offsetHeight = 250;
  if (withScreenshot) {
    const image = new Element();
    image.naturalWidth = 1600; image.naturalHeight = 1000;
    image.src = '/prototypes/demo/screenshots/1.jpg';
    image.getBoundingClientRect = () => ({ left: 107, top: 207, width: 386, height: 236 });
    selectors.set('.frame img.is-on', image);
  }
  const items = catalog || [{ slug: 'demo', name: '原型', href: '/prototypes/demo/index.html', details }];
  const cards = items.map((item, index) => {
    const node = index === 0 ? card : new Element();
    node.dataset.slug = item.slug;
    return node;
  });
  page.filters = { query: 'coffee', sort: 'name', drawer: true };
  root.hidden = true;
  root.dataset = {
    phase: 'idle', drawer: 'open', clean: 'false', chrome: 'off',
    detailItems: JSON.stringify(items),
  };
  document = { querySelector: () => root, createElement: (tag) => { const element = new Element(); element.tagName = tag.toUpperCase(); return element; }, documentElement: new Element(), activeElement: originalFocus };
  document.documentElement.clientWidth = 1585;
  const events = new EventTarget();
  const location = new URL('https://gallery.example/' + hash);
  const entries = [{ href: location.href, state: null }];
  let index = 0;
  const history = {
    state: null, scrollRestoration: 'auto',
    pushState(state, _, url) {
      location.href = String(url); this.state = state;
      entries.splice(++index); entries.push({ href: location.href, state });
    },
    replaceState(state, _, url) { location.href = String(url); this.state = state; entries[index] = { href: location.href, state }; },
    back() { if (index > 0) { index--; this.travel(); } },
    forward() { if (index < entries.length - 1) { index++; this.travel(); } },
    travel() { location.href = entries[index].href; this.state = entries[index].state; events.dispatchEvent(new Event('popstate')); },
  };
  const values = {
    document, history, location, scrollX: 0, scrollY: 400, innerWidth: 1600, innerHeight: 1000,
    window: { scrollTo({ left, top }) { globalThis.scrollX = left; globalThis.scrollY = top; } },
    addEventListener: events.addEventListener.bind(events),
    requestAnimationFrame: (callback) => { queueMicrotask(callback); return 1; },
    matchMedia: () => ({ matches: false }),
    getComputedStyle: () => ({ getPropertyValue: () => 'cubic-bezier(.22,.61,.36,1)' }),
    fetch: (url, options) => new Promise((resolve) => requests.push({ url, options, resolve })),
    navigator: { clipboard: { writeText: async (text) => { copies.push(text); } } },
  };
  const previous = new Map();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  const click = (element) => { const event = new Event('click', { cancelable: true }); Object.defineProperty(event, 'button', { value: 0 }); element.dispatchEvent(event); };
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const finish = () => motions.forEach((motion) => motion.finish());
  const viewer = initPrototypeDetail({ page, cards, getLanguage: () => 'zh', onBusyChange: (value) => busy.push(value), getSequence: () => sequence || cards.filter((node) => !node.hidden).map((node) => node.dataset.slug) });
  t.after(async () => {
    click(selectors.get('[data-detail-back]'));
    for (let n = 0; n < 4; n++) { finish(); await flush(); }
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  });
  await flush();
  const copy = (button) => { const event = new Event('click'); Object.defineProperty(event, 'target', { value: button }); selectors.get('[data-detail-fields]').dispatchEvent(event); };
  const settleFrame = async (index = requests.length - 1, ok = true) => {
    const request = requests[index];
    request.resolve({ ok, status: ok ? 200 : 404 });
    selectors.get('[data-detail-host]').children.find((node) => node.src === request.url)?.dispatchEvent(new Event('load'));
    await flush();
  };
  return { root, page, card, cards, entries, document, originalFocus, history, location, requests, busy, viewer, motions, copies, copy, click, flush, settleFrame, finish, get: (name) => selectors.get(`[data-detail-${name}]`) };
}

test('进入与返回保留主页对象、滚动和焦点，前进后仍可以返回', async (t) => {
  const f = await fixture(t);
  const filters = f.page.filters;
  f.click(f.card);
  await f.flush();
  assert.equal(f.viewer.active, true);
  assert.equal(f.root.dataset.phase, 'open');
  assert.equal(f.page.inert, true);
  assert.equal(f.history.scrollRestoration, 'manual');
  assert.equal(f.page.style.width, 'calc(100% - 15px)');
  assert.equal(f.location.hash, '#prototype=demo');
  globalThis.scrollY = 800;
  f.click(f.get('back'));
  await f.flush();
  assert.equal(f.viewer.active, false);
  assert.equal(f.page.filters, filters);
  assert.equal(globalThis.scrollY, 400);
  assert.equal(f.document.activeElement, f.originalFocus);
  assert.equal(f.page.inert, false);
  assert.equal(f.history.scrollRestoration, 'auto');
  assert.equal(f.page.style.width, '');
  assert.equal(f.document.documentElement.classList.contains('detail-scroll-locked'), false);
  f.history.forward();
  await f.flush();
  assert.equal(f.viewer.active, true);
  f.click(f.get('back'));
  await f.flush();
  assert.equal(f.viewer.active, false);
  assert.deepEqual(f.busy, [true, false, true, false]);
});

test('抽屉与纯净全屏切换不创建新 iframe，并保留抽屉状态', async (t) => {
  const f = await fixture(t);
  f.click(f.card);
  await f.flush();
  const iframe = f.get('host').children[0];
  f.click(f.get('toggle-drawer'));
  await f.flush();
  assert.equal(f.root.dataset.drawer, 'closed');
  f.click(f.get('fullscreen'));
  await f.flush();
  assert.equal(f.root.dataset.clean, 'true');
  assert.equal(f.get('restore').hidden, false);
  f.click(f.get('restore'));
  await f.flush();
  assert.equal(f.root.dataset.clean, 'false');
  assert.equal(f.root.dataset.drawer, 'closed');
  assert.equal(f.get('host').children[0], iframe);
  assert.equal(f.requests.length, 1);
});

test('加载与入场独立，404 不误判成功，重试后的旧事件不改变状态', async (t) => {
  const f = await fixture(t);
  f.click(f.card);
  await f.flush();
  assert.equal(f.root.dataset.phase, 'open');
  assert.equal(f.root.dataset.load, 'loading');
  assert.equal(f.root.dataset.cover, 'true');
  assert.equal(f.root.dataset.revealed, 'false');
  const oldFrame = f.get('host').children[0];
  oldFrame.dispatchEvent(new Event('load'));
  f.requests[0].resolve({ ok: false });
  await f.flush();
  assert.equal(f.root.dataset.load, 'error');
  f.click(f.get('retry'));
  const newFrame = f.get('host').children[0];
  assert.notEqual(newFrame, oldFrame);
  oldFrame.dispatchEvent(new Event('load'));
  assert.equal(f.root.dataset.load, 'loading');
  f.requests[1].resolve({ ok: true });
  newFrame.dispatchEvent(new Event('load'));
  await f.flush();
  assert.equal(f.root.dataset.load, 'ready');
  assert.equal(f.root.dataset.revealed, 'true');
});

test('直接进入详情链接可原地返回，入场中后退不会留下滚动锁', async (t) => {
  const direct = await fixture(t, { hash: '#prototype=demo' });
  assert.equal(direct.viewer.active, true);
  direct.click(direct.get('back'));
  await direct.flush();
  assert.equal(direct.location.hash, '');
  assert.equal(direct.viewer.active, false);
});

test('入场中连续后退会完成清理，不等待网络或遗留页面锁', async (t) => {
  const f = await fixture(t, { manualMotion: true });
  f.click(f.card);
  assert.equal(f.root.dataset.phase, 'entering');
  f.history.back();
  for (let n = 0; n < 4; n++) { f.finish(); await f.flush(); }
  assert.equal(f.viewer.active, false);
  assert.equal(f.root.hidden, true);
  assert.equal(f.page.inert, false);
  assert.equal(f.document.documentElement.classList.contains('detail-scroll-locked'), false);
  assert.equal(f.requests.length, 0);
});

test('已就绪的原型以真实页面退场，不恢复截图或增加截图缩回动画', async (t) => {
  const f = await fixture(t);
  f.click(f.card);
  await f.flush();
  const iframe = f.get('host').children[0];
  f.requests[0].resolve({ ok: true });
  iframe.dispatchEvent(new Event('load'));
  await f.flush();
  const imageMotions = f.motions.filter((motion) => motion.target === f.get('snapshot-crop')).length;
  f.click(f.get('back'));
  assert.equal(f.root.dataset.phase, 'leaving');
  assert.equal(f.root.dataset.revealed, 'true');
  assert.equal(f.get('host').children[0], iframe);
  await f.flush();
  assert.equal(f.motions.filter((motion) => motion.target === f.get('snapshot-crop')).length, imageMotions);
  assert.equal(f.viewer.active, false);
});

test('字段按新顺序呈现，提示词与参考源采用同一标签和值分栏', async (t) => {
  const details = {
    prompt: '首条需求', model: 'Example', type: 'software', source: { raw: '参考', href: 'https://example.com' },
    durationSeconds: 490, promptCount: 3, images: [{ prompt: '图片需求', model: 'Image' }],
    createdAt: '2026-11-04', updatedAt: '2026-11-05',
  };
  const f = await fixture(t, { details });
  f.click(f.card);
  await f.flush();
  const rows = f.get('fields').children[0].children;
  assert.deepEqual(rows.map((row) => row.dataset.field), ['prompt', 'model', 'type', 'source', 'durationSeconds', 'promptCount', 'images', 'createdAt', 'updatedAt']);
  for (const key of ['prompt', 'source']) assert.ok(rows.find((row) => row.dataset.field === key).className.includes('is-compact'));
  assert.equal(rows[0].children[0].textContent, '提示词');
  assert.equal(rows[0].children[0].children[0].dataset.detailLabel, 'copy');
  assert.equal(rows[4].children[0].textContent, '生成耗时');
  assert.equal(rows[5].children[0].textContent, '对话总轮次');
});

test('主提示词和每条图片提示词分别复制原文，结果仅在成功后确认', async (t) => {
  const prompt = '需求第一行\n第二行 <原样保留>';
  const imagePrompt = 'A coat, soft light.';
  const f = await fixture(t, { details: { prompt, images: [{ prompt: imagePrompt, model: 'Image' }] } });
  f.click(f.card);
  await f.flush();
  const rows = f.get('fields').children[0].children;
  const mainButton = rows[0].children[0].children[0];
  const imageButton = rows[1].children[1].children[0].children[1];
  f.copy(mainButton);
  await f.flush();
  f.copy(imageButton);
  await f.flush();
  assert.deepEqual(f.copies, [prompt, imagePrompt]);
  assert.equal(mainButton.dataset.result, 'copied');
  assert.equal(mainButton.getAttribute('aria-label'), '已复制');
  assert.equal(imageButton.dataset.result, 'copied');
  navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  f.copy(mainButton);
  await f.flush();
  assert.equal(mainButton.dataset.result, 'copyFailed');
  assert.equal(mainButton.getAttribute('aria-label'), '复制失败，请手动选择并复制');
});

test('没有截图的原型仍可完成加载和退出，不留下占位图片', async (t) => {
  const f = await fixture(t, { withScreenshot: false });
  f.click(f.card);
  await f.flush();
  assert.equal(f.root.dataset.cover, 'false');
  assert.equal(f.get('snapshot-crop').children.length, 0);
  f.requests[0].resolve({ ok: true });
  f.get('host').children[0].dispatchEvent(new Event('load'));
  await f.flush();
  assert.equal(f.root.dataset.revealed, 'true');
  f.click(f.get('back'));
  await f.flush();
  assert.equal(f.viewer.active, false);
});

const navigationCatalog = ['demo', 'hidden', 'before', 'after'].map((slug) => ({ slug, name: slug, href: `/prototypes/${slug}/index.html`, details: { prompt: slug } }));

test('上下一个遵循筛选后的排序，边界禁用，并一次返回原画廊', async (t) => {
  const f = await fixture(t, { catalog: navigationCatalog, sequence: ['before', 'demo', 'after'] });
  const filters = f.page.filters;
  f.cards.find((card) => card.dataset.slug === 'hidden').hidden = true;
  f.click(f.card);
  await f.flush();
  assert.equal(f.get('previous').disabled, false);
  assert.equal(f.get('next').disabled, false);
  f.click(f.get('next'));
  await f.settleFrame();
  assert.equal(f.location.hash, '#prototype=after');
  assert.equal(f.get('host').children.length, 1);
  assert.equal(f.get('host').children[0].src, '/prototypes/after/index.html');
  assert.equal(f.get('next').disabled, true);
  const count = f.requests.length;
  f.click(f.get('next'));
  await f.flush();
  assert.equal(f.requests.length, count);
  f.click(f.get('previous'));
  await f.settleFrame();
  assert.equal(f.location.hash, '#prototype=demo');
  f.click(f.get('previous'));
  await f.settleFrame();
  assert.equal(f.location.hash, '#prototype=before');
  assert.equal(f.get('previous').disabled, true);
  assert.equal(f.entries.length, 2);
  assert.deepEqual(f.requests.map((request) => request.url), ['/prototypes/demo/index.html', '/prototypes/after/index.html', '/prototypes/demo/index.html', '/prototypes/before/index.html']);
  f.click(f.get('back'));
  await f.flush();
  assert.equal(f.location.hash, '');
  assert.equal(f.viewer.active, false);
  assert.equal(f.page.filters, filters);
  assert.equal(globalThis.scrollY, 400);
});

test('连续点击上下一个不会重复触发导航，过渡期间禁用两个入口', async (t) => {
  const f = await fixture(t, { catalog: navigationCatalog, sequence: ['demo', 'before', 'after'] });
  f.click(f.card);
  await f.flush();
  f.click(f.get('next'));
  assert.equal(f.root.dataset.phase, 'switching');
  assert.equal(f.get('previous').disabled, true);
  assert.equal(f.get('next').disabled, true);
  f.click(f.get('next'));
  await f.settleFrame();
  assert.equal(f.location.hash, '#prototype=before');
  assert.equal(f.requests.length, 2);
  assert.equal(f.root.dataset.phase, 'open');
});

test('上下页只在预览内部切换，加载前保持旧界面和参数，外壳状态不重置', async (t) => {
  const f = await fixture(t, { catalog: navigationCatalog, sequence: ['demo', 'before', 'after'] });
  f.click(f.card);
  await f.flush();
  await f.settleFrame(0);
  f.click(f.get('toggle-drawer'));
  await f.flush();
  const oldFrame = f.get('host').children[0];
  const oldFields = f.get('fields').children[0];
  const sceneTargets = new Set([f.root, f.page, f.get('surface'), f.get('preview')]);
  const sceneMotions = f.motions.filter((motion) => sceneTargets.has(motion.target)).length;
  f.click(f.get('next'));
  await f.flush();
  assert.equal(f.root.dataset.phase, 'switching');
  assert.equal(f.root.dataset.chrome, 'on');
  assert.equal(f.root.dataset.drawer, 'closed');
  assert.equal(f.root.hidden, false);
  assert.equal(f.page.classList.contains('is-concealed'), true);
  assert.equal(f.get('host').children[0], oldFrame);
  assert.equal(f.get('host').children[1].inert, true);
  assert.equal(f.get('fields').children[0], oldFields);
  assert.deepEqual(f.busy, [true]);
  await f.settleFrame();
  assert.equal(f.root.dataset.phase, 'open');
  assert.equal(f.root.dataset.drawer, 'closed');
  assert.equal(f.get('host').children.length, 1);
  assert.notEqual(f.get('host').children[0], oldFrame);
  assert.notEqual(f.get('fields').children[0], oldFields);
  assert.equal(f.motions.filter((motion) => sceneTargets.has(motion.target)).length, sceneMotions);
  assert.deepEqual(f.busy, [true]);
  f.click(f.get('fullscreen'));
  await f.flush();
  f.click(f.get('next'));
  await f.settleFrame();
  assert.equal(f.root.dataset.clean, 'true');
  assert.equal(f.root.dataset.drawer, 'closed');
  assert.equal(f.get('restore').hidden, false);
  assert.equal(f.location.hash, '#prototype=after');
});

test('内部切换失败保持旧原型、参数和链接，重试只加载失败的目标', async (t) => {
  const f = await fixture(t, { catalog: navigationCatalog, sequence: ['demo', 'before', 'after'] });
  f.click(f.card);
  await f.flush();
  await f.settleFrame(0);
  const oldFrame = f.get('host').children[0], oldFields = f.get('fields').children[0];
  f.click(f.get('next'));
  await f.settleFrame(1, false);
  assert.equal(f.root.dataset.phase, 'open');
  assert.equal(f.root.dataset.load, 'ready');
  assert.equal(f.location.hash, '#prototype=demo');
  assert.equal(f.get('host').children[0], oldFrame);
  assert.equal(f.get('host').children.length, 1);
  assert.equal(f.get('fields').children[0], oldFields);
  assert.equal(f.get('retry').hidden, false);
  assert.ok(f.get('status').textContent.includes('当前原型保持不变'));
  f.click(f.get('retry'));
  await f.settleFrame(2);
  assert.equal(f.location.hash, '#prototype=before');
  assert.equal(f.get('host').children[0].src, '/prototypes/before/index.html');
  assert.equal(f.get('retry').hidden, true);
  assert.deepEqual(f.requests.map((request) => request.url), ['/prototypes/demo/index.html', '/prototypes/before/index.html', '/prototypes/before/index.html']);
});

test('内部预加载期间返回会取消目标，迟到事件不会再打开详情或遗留滚动锁', async (t) => {
  const f = await fixture(t, { catalog: navigationCatalog, sequence: ['demo', 'before', 'after'] });
  f.click(f.card);
  await f.flush();
  await f.settleFrame(0);
  f.click(f.get('next'));
  const pending = f.get('host').children[1];
  assert.equal(f.root.dataset.phase, 'switching');
  f.click(f.get('back'));
  await f.flush();
  assert.equal(f.viewer.active, false);
  assert.equal(f.location.hash, '');
  assert.equal(f.page.inert, false);
  assert.deepEqual(f.busy, [true, false]);
  assert.equal(f.document.documentElement.classList.contains('detail-scroll-locked'), false);
  f.requests[1].resolve({ ok: true, status: 200 });
  pending.dispatchEvent(new Event('load'));
  await f.flush();
  assert.equal(f.root.hidden, true);
  assert.equal(f.get('host').children.length, 0);
});
