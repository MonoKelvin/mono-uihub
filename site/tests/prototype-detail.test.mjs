import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMetadata } from '../lib/catalog.mjs';
import { prototypeHash, slugFromHash, formatDuration, rectTransform } from '../src/scripts/prototype-detail.js';

const initial = {
  prompt: '首次 UI 需求', model: 'Claude-Example', duration_seconds: 490,
  image_generation: [{ prompt: '首次生成的衣服', model: 'Image-Example' }, { prompt: '首次生成的鞋' }],
  skills: ['不得展示'], cost: 42,
};

test('详情白名单只含指定字段，后续记录只计数', () => {
  const item = normalizeMetadata({
    name: '详情样本', created_at: '2026-11-04 08:00:00', updated_at: '2026-11-04 09:00:00',
    page_type: 'software', palette: ['#e4485a'], tags: ['根标签'], imageToUI: './assets/source.png',
    history: [initial, { prompt: '后续秘密需求', model: '后续模型', duration_seconds: 9999, image_generation: [{ prompt: '后续生图', model: '后续生图模型' }] }],
  }, 'sample');
  assert.deepEqual(item.details, {
    createdAt: '2026-11-04 08:00:00', updatedAt: '2026-11-04 09:00:00', model: 'Claude-Example',
    prompt: '首次 UI 需求', promptCount: 2, images: initial.image_generation, type: 'software',
    source: { raw: './assets/source.png', href: '/prototypes/sample/assets/source.png', external: false },
    durationSeconds: 490,
  });
  assert.equal(item.model, 'claude-example');
  const json = JSON.stringify(item.details);
  for (const value of ['后续秘密需求', '后续模型', '后续生图', 'skills', 'cost', 'palette', '根标签']) assert.ok(!json.includes(value), value);
});

test('兼容旧 history 结构，首次生图数组不会取后续记录', () => {
  const item = normalizeMetadata({ generation: { history: [initial, { image_generation: [{ prompt: 'revision' }] }] } }, 'legacy');
  assert.equal(item.details.promptCount, 2);
  assert.deepEqual(item.details.images, initial.image_generation);
  const noInitialImage = normalizeMetadata({ history: [{ prompt: '首条' }, { image_generation: initial.image_generation }] });
  assert.ok(!('images' in noInitialImage.details));
});

test('缺失字段整项省略，不用 unknown、null 或空数组占位', () => {
  assert.deepEqual(normalizeMetadata(null).details, {});
  assert.deepEqual(normalizeMetadata({ history: [] }).details, {});
  assert.deepEqual(normalizeMetadata({ history: [{ model: 'unknown', duration_seconds: null, image_generation: [] }] }).details, { promptCount: 1 });
  const explicitType = normalizeMetadata({ page_type: 'website', history: [] });
  assert.deepEqual(explicitType.details, { type: 'website' });
});

test('只保留有效的生图参数，0 秒有效，非法耗时省略', () => {
  const item = normalizeMetadata({ history: [{ duration_seconds: 0, image_generation: [null, {}, { prompt: ' ' }, { model: 'Image' }, { prompt: '主体', model: '', secret: '不发布' }] }] });
  assert.deepEqual(item.details, { promptCount: 1, images: [{ model: 'Image' }, { prompt: '主体' }], durationSeconds: 0 });
  for (const value of [-1, NaN, Infinity, '20', null]) {
    assert.ok(!('durationSeconds' in normalizeMetadata({ history: [{ duration_seconds: value }] }).details));
  }
});

test('无效的当前 history 不读取后续条目或根提示词补齐', () => {
  const item = normalizeMetadata({ prompt: '根提示词', model: '根模型', history: [null, initial] });
  assert.deepEqual(item.details, { promptCount: 2 });
  const current = normalizeMetadata({ history: [], generation: { history: [initial] } });
  assert.deepEqual(current.details, {});
});

test('详情 URL 支持编码及附加 hash 参数，不把其它锚点误判为原型', () => {
  for (const slug of ['roobinium-wear', '名字 & +/#?']) assert.equal(slugFromHash(prototypeHash(slug)), slug);
  assert.equal(slugFromHash('#prototype=demo&other=1'), 'demo');
  assert.equal(slugFromHash('#not-a-detail'), '');
  assert.equal(slugFromHash('#prototype='), '');
});

test('耗时按小时、分钟、秒展示，并正确处理 0 和进位', () => {
  assert.equal(formatDuration(490), '8 分钟 10 秒');
  assert.equal(formatDuration(3600), '1 小时');
  assert.equal(formatDuration(0), '0 秒');
  assert.equal(formatDuration(59.9), '1 分钟');
  assert.equal(formatDuration(3661, 'en'), '1h 1m 1s');
  assert.equal(formatDuration(0, 'en'), '0s');
});

test('共享元素变换使用卡片与容器真实矩形，而非固定缩放值', () => {
  const card = { left: 100, top: 200, width: 400, height: 250 };
  const viewport = { left: 0, top: 0, width: 1600, height: 1000 };
  assert.equal(rectTransform(card, viewport), 'translate(100px, 200px) scale(0.25, 0.25)');
  assert.equal(rectTransform(card, card), 'translate(0px, 0px) scale(1, 1)');
  assert.equal(rectTransform(null, viewport), 'none');
  assert.equal(rectTransform(card, { ...viewport, width: 0 }), 'none');
});
