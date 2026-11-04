import test from 'node:test';
import assert from 'node:assert/strict';
import { coverRect, snapshotFrames, NO_BORDER } from '../src/scripts/preview-motion.js';
import { tooltipPosition, tooltipLabel } from '../src/scripts/tooltip.js';
import { configureFrameViewport, EMBEDDED_VIEWPORT_CSS, edgeScrollbarWidth, removeEdgeScrollbars } from '../src/scripts/embedded-viewport.js';
import { neighborSlug } from '../src/scripts/prototype-detail.js';

const numbers = (text) => [...text.matchAll(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)].map(([value]) => Number(value));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

test('截图采用卡片相同的 cover、顶部居中裁剪，并保留 hover 的统一放大', () => {
  const size = { width: 1600, height: 1000 };
  const content = { left: 107, top: 207, width: 386, height: 236 };
  const normal = coverRect(content, size);
  near(normal.width, 386);
  near(normal.height, 241.25);
  near(normal.left, 107);
  near(normal.top, 207);
  const hover = coverRect(content, size, 1.02);
  near(hover.width, 393.72);
  near(hover.left, 103.14);
  near(hover.top, 204.64);
});

test('不同宽高比之间的每个预计算关键帧都保持截图像素等比缩放', () => {
  const size = { width: 1600, height: 1000 };
  const from = { left: 100, top: 200, width: 400, height: 250 };
  const to = { left: 48, top: 76, width: 1000, height: 800 };
  const paintFrom = coverRect({ left: 107, top: 207, width: 386, height: 236 }, size, 1.02);
  const paintTo = coverRect(to, size);
  const frames = snapshotFrames({ from, to, layout: to, imageSize: size, paintFrom, paintTo, borderFrom: { top: 7, right: 7, bottom: 7, left: 7 }, borderTo: NO_BORDER });
  assert.equal(frames.image.length, 65);
  frames.image.forEach((frame) => {
    const p = frame.offset;
    const width = from.width + (to.width - from.width) * p;
    const height = from.height + (to.height - from.height) * p;
    const sx = width / to.width, sy = height / to.height;
    const [x, y, childX, childY] = numbers(frame.transform);
    near(sx * childX, sy * childY);
    near(from.left + (to.left - from.left) * p + x * sx, paintFrom.left + (paintTo.left - paintFrom.left) * p);
    near(from.top + (to.top - from.top) * p + y * sy, paintFrom.top + (paintTo.top - paintFrom.top) * p);
  });
  const [top, right, bottom, left] = numbers(frames.crop[0].clipPath);
  near(left * from.width / to.width, 7);
  near(right * from.width / to.width, 7);
  near(top * from.height / to.height, 7);
  near(bottom * from.height / to.height, 7);
  assert.deepEqual(numbers(frames.crop.at(-1).clipPath), [0, 0, 0, 0]);
});

test('tooltip 从 aria-label 读取，不需要额外标记；区域名字不变成整块悬停提示', () => {
  const element = (tagName, label, role = null) => ({ tagName, getAttribute: (key) => key === 'aria-label' ? label : key === 'role' ? role : null });
  assert.equal(tooltipLabel(element('BUTTON', '复制提示词')), '复制提示词');
  assert.equal(tooltipLabel(element('A', '  在新标签页打开  ')), '在新标签页打开');
  assert.equal(tooltipLabel(element('SPAN', '完整模型名称')), '完整模型名称');
  assert.equal(tooltipLabel(element('BUTTON', '')), '');
  assert.equal(tooltipLabel(element('SECTION', '原型参数')), '');
  assert.equal(tooltipLabel(element('DIV', 'Language', 'group')), '');
  assert.equal(tooltipLabel(element('IFRAME', '原型')), '');
});

test('tooltip 在视口边缘会避让，顶部空间不足时显示在触发器下方', () => {
  const tip = { width: 100, height: 30 }, viewport = { width: 400, height: 300 };
  assert.deepEqual(tooltipPosition({ left: 100, top: 100, bottom: 140, width: 40 }, tip, viewport), { left: 70, top: 61 });
  assert.equal(tooltipPosition({ left: 380, top: 100, bottom: 140, width: 40 }, tip, viewport).left, 292);
  assert.deepEqual(tooltipPosition({ left: 0, top: 0, bottom: 40, width: 40 }, tip, viewport), { left: 8, top: 49 });
});

test('iframe 去掉根滚动条占位，不禁止网页滚动或覆盖其他组件', () => {
  const styles = [];
  const doc = { head: { append: (node) => styles.push(node) }, createElement: () => ({}), getElementById: (id) => styles.find((node) => node.id === id) };
  configureFrameViewport({ contentDocument: doc });
  configureFrameViewport({ contentDocument: doc });
  assert.equal(styles.length, 1);
  assert.equal(styles[0].textContent, EMBEDDED_VIEWPORT_CSS);
  assert.ok(EMBEDDED_VIEWPORT_CSS.includes('html, body'));
  assert.ok(!EMBEDDED_VIEWPORT_CSS.includes('overflow: hidden'));
  assert.ok(!EMBEDDED_VIEWPORT_CSS.includes('*'));
  assert.doesNotThrow(() => configureFrameViewport({ get contentDocument() { throw new Error('Cross origin'); } }));
});

test('相邻原型使用给定的可见顺序，首尾不循环，也不跳到隐藏项', () => {
  const sequence = ['before', 'demo', 'after'];
  assert.equal(neighborSlug(sequence, 'demo', -1), 'before');
  assert.equal(neighborSlug(sequence, 'demo', 1), 'after');
  assert.equal(neighborSlug(sequence, 'before', -1), null);
  assert.equal(neighborSlug(sequence, 'after', 1), null);
  assert.equal(neighborSlug(sequence, 'hidden', 1), null);
  assert.equal(neighborSlug([], 'demo', 1), null);
});

test('滚动条测量扣除真实边框，不把 padding 或边框当作白槽', () => {
  assert.equal(edgeScrollbarWidth({ offsetWidth: 320, clientWidth: 300 }, { borderLeftWidth: '2px', borderRightWidth: '2px' }), 16);
  assert.equal(edgeScrollbarWidth({ offsetWidth: 320, clientWidth: 300 }, { borderLeftWidth: '10px', borderRightWidth: '10px' }), 0);
  assert.equal(edgeScrollbarWidth({ offsetWidth: 320, clientWidth: 320 }, { borderLeftWidth: '0px', borderRightWidth: '0px', paddingRight: '20px' }), 0);
});

test('仅去除贴右边缘的实际滚动条槽，其他位置和正常边框保持不变', () => {
  const make = (right, border = 2) => {
    const attrs = new Set();
    return { offsetWidth: 320, clientWidth: 300, scrollHeight: 1000, clientHeight: 700, parentElement: null, border,
      hasAttribute: (name) => attrs.has(name), setAttribute: (name) => attrs.add(name), getBoundingClientRect: () => ({ right }) };
  };
  const edge = make(1000), interior = make(900), frame = make(1000, 10);
  const doc = { defaultView: { innerWidth: 1000, innerHeight: 800, getComputedStyle: (node) => ({ borderLeftWidth: node.border + 'px', borderRightWidth: node.border + 'px', scrollbarGutter: 'auto' }) },
    elementFromPoint: (_, y) => y < 200 ? edge : y < 500 ? interior : frame };
  removeEdgeScrollbars(doc);
  assert.equal(edge.hasAttribute('data-uihub-edge-scroll'), true);
  assert.equal(interior.hasAttribute('data-uihub-edge-scroll'), false);
  assert.equal(frame.hasAttribute('data-uihub-edge-scroll'), false);
});
