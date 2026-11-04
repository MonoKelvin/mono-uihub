import test from 'node:test';
import assert from 'node:assert/strict';
import { colorToRgba, compositeColor, contrast, resolvePrototypePalette, isBackgroundWrapper, isBackgroundDecoration } from '../src/scripts/prototype-background.js';
import { backgroundCover } from '../src/scripts/prototype-backdrop.js';

const view = { width: 1000, height: 700 };
const element = (className, rect = view, tagName = 'DIV') => ({ className, tagName, getBoundingClientRect: () => rect, getAttribute: () => 'true' });

test('颜色支持短 HEX、透明度、百分比和现代 sRGB，非法值不猜测', () => {
  assert.deepEqual(colorToRgba('#abc'), [170, 187, 204, 1]);
  assert.deepEqual(colorToRgba('#aabbcc80'), [170, 187, 204, 128 / 255]);
  const percentage = colorToRgba('rgb(100% 0% 0% / 50%)');
  assert.deepEqual(percentage.slice(0, 3).map(Math.round), [255, 0, 0]);
  assert.equal(percentage[3], .5);
  assert.deepEqual(colorToRgba('color(srgb 1 0 0 / .5)'), [255, 0, 0, .5]);
  assert.deepEqual(colorToRgba('transparent'), [0, 0, 0, 0]);
  for (const value of ['var(--ink)', 'rgb(no 0 0)', '#12345', 'oklch(.5 .2 20)']) assert.equal(colorToRgba(value), null);
  assert.deepEqual(compositeColor([0, 0, 0, .5], [200, 100, 40]), [100, 50, 20]);
});

test('外层 stage 可以抽离，带窗口边框感的 canvas 和真实 Canvas 不识别为背景容器', () => {
  const css = { display: 'grid', placeItems: 'center', boxShadow: 'none', borderRadius: '0px' };
  assert.equal(isBackgroundWrapper(element('stage'), css, view), true);
  assert.equal(isBackgroundWrapper(element('canvas'), css, view), true);
  assert.equal(isBackgroundWrapper(element('canvas'), { ...css, borderRadius: '24px' }, view), false);
  assert.equal(isBackgroundWrapper(element('stage', { width: 600, height: 400 }), css, view), false);
  assert.equal(isBackgroundWrapper(element('stage', view, 'CANVAS'), css, view), false);
  assert.equal(isBackgroundWrapper(element('work-area'), css, view), false);
});

test('只有负层级或明确不可交互的全屏装饰被识别，普通面板不抽离', () => {
  const css = { position: 'absolute', zIndex: '-1', pointerEvents: 'auto' };
  assert.equal(isBackgroundDecoration(element('decor'), css, view), true);
  assert.equal(isBackgroundDecoration(element('panel'), { ...css, zIndex: '0' }, view), false);
  assert.equal(isBackgroundDecoration(element('decor'), { ...css, zIndex: '0', pointerEvents: 'none' }, view), true);
});

test('背景 cover 只计算一个统一比例，不更改前景视口尺寸', () => {
  assert.equal(backgroundCover(view, { width: 1600, height: 1000 }), 1.6);
  assert.equal(backgroundCover(view, { width: 800, height: 1000 }), 1000 / 700);
  assert.equal(backgroundCover({ width: 0, height: 0 }, view), 1);
});

function checkPalette(source) {
  const palette = resolvePrototypePalette(source);
  const surface = colorToRgba(palette['--card']);
  const backgrounds = palette['--detail-panel-bg'] === 'transparent' ? [...(source.samples || [[234, 232, 225]]), surface] : [surface];
  for (const key of ['--ink', '--ink-2', '--ink-3', '--gold']) {
    const color = colorToRgba(palette[key]);
    for (const bg of backgrounds) assert.ok(contrast(color, bg) >= 4.5, `${key}: ${contrast(color, bg)}`);
  }
  return palette;
}

test('浅色和深色原型保留可读的原文字、强调色及局部色系', () => {
  const light = checkPalette({ foreground: [30, 30, 30, 1], accent: [0, 80, 40, 1], samples: [[244, 244, 244]] });
  assert.equal(light['--ink'], 'rgb(30, 30, 30)');
  assert.equal(light['--gold'], 'rgb(0, 80, 40)');
  assert.equal(light['--detail-tone'], 'light');
  const dark = checkPalette({ foreground: [235, 240, 242, 1], surface: [40, 40, 40, 1], samples: [[20, 20, 20]] });
  assert.equal(dark['--ink'], 'rgb(235, 240, 242)');
  assert.equal(dark['--detail-tone'], 'dark');
});

test('低对比文字、透明文字和无法采样的图片背景使用可读的安全表面', () => {
  for (const source of [
    ...[115, 116, 117, 118, 119].map((gray) => ({ foreground: [gray, gray, gray, 1], samples: [[255, 255, 255]] })),
    { foreground: [255, 255, 255, 1], muted: [240, 240, 240, 1], samples: [[255, 255, 255]] },
    { foreground: [0, 0, 0, .05], samples: [[0, 0, 0]] },
    { complex: true, samples: [[230, 220, 210]], surface: [255, 255, 255, .05] },
    { samples: [[255, 255, 255], [0, 0, 0]], accent: [120, 120, 120, 1] },
  ]) {
    const palette = checkPalette(source);
    if (source.complex || source.samples.length > 1) {
      assert.notEqual(palette['--detail-panel-bg'], 'transparent');
      assert.equal(palette['--detail-tool-bg'], palette['--detail-panel-bg']);
    }
  }
});
