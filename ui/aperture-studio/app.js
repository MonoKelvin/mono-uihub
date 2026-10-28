// Aperture Studio · app.js
// UI layer: wires HTML controls to the engine, drives the HUD readout.
// 界面层 —— 只通过 ApertureEngine 公共 API 与引擎通信，不直接接触 WebGL。

import { ApertureEngine } from '../../../site/modules/render_engine/aperture.js';
import { detectFormat } from '../../../site/modules/render_engine/models.js';

// ── 模型与 HDRI 目录（仅数据）────────────────────────────────────────────
// 全部资源为 CC0-1.0（见 assets/CREDITS.md）。路径由页面 URL 推算，可适配任意服务根。
const HERE = new URL('.', import.meta.url).href;
const ASSET_BASE = HERE + 'assets/';

const MODELS = [
  { id: 'car-concept',     file: ASSET_BASE + 'models/CarConcept.glb',            title: '概念跑车',           sub: '跑车（Car Concept）·clearcoat 清漆',   triHint: '190k' },
  { id: 'chronograph',     file: ASSET_BASE + 'models/ChronographWatch.glb',      title: '计时腕表',           sub: '机械（Chronograph）·金属玻璃',        triHint: '96k' },
  { id: 'dragon',          file: ASSET_BASE + 'models/DragonDispersion.glb',      title: '龙',                 sub: '生物（Dragon）·色散彩虹',             triHint: '84k' },
  { id: 'water-bottle',    file: ASSET_BASE + 'models/WaterBottle.glb',           title: '水壶',               sub: '玻璃（Water Bottle）·液体折射',       triHint: '21k' },
  { id: 'damaged-helmet',  file: ASSET_BASE + 'models/DamagedHelmet.glb',         title: '战损头盔',           sub: '头盔（Helmet）·风化金属',             triHint: '7.5k' },
  { id: 'metal-spheres',   file: ASSET_BASE + 'models/MetalRoughSpheres.glb',     title: '金属球组',           sub: '金属（Metal Rough）·PBR 测试',        triHint: '17k' },
  { id: 'suzanne',         file: ASSET_BASE + 'models/IridescenceSuzanne.glb',    title: '苏珊',               sub: '虹彩（Suzanne）·薄膜干涉',            triHint: '2k' },
  { id: 'shoe',            file: ASSET_BASE + 'models/MaterialsVariantsShoe.glb', title: '设计鞋款',           sub: '鞋（Shoe）·多材质织物',               triHint: '58k' },
  { id: 'fox',             file: ASSET_BASE + 'models/Fox.glb',                   title: '红狐',               sub: '狐狸（Fox）·毛发次表面',              triHint: '1.4k' },
];

const HDRIS = [
  { id: 'studio-03',   file: ASSET_BASE + 'hdris/studio_small_03.hdr',           title: '影棚 03',  sub: '中性柔光箱（Studio 03）',   exp: 1.20 },
  { id: 'studio-02',   file: ASSET_BASE + 'hdris/studio_small_02.hdr',           title: '影棚 02',  sub: '主光+补光（Studio 02）',    exp: 1.25 },
  { id: 'studio-08',   file: ASSET_BASE + 'hdris/studio_small_08.hdr',           title: '影棚 08',  sub: '高反差（Studio 08）',       exp: 1.15 },
  { id: 'studio-09',   file: ASSET_BASE + 'hdris/studio_small_09.hdr',           title: '影棚 09',  sub: '暖主光（Studio 09）',       exp: 1.20 },
  { id: 'photostudio', file: ASSET_BASE + 'hdris/brown_photostudio_02.hdr',      title: '摄影棚',   sub: '棕色背景（Brown 02）',     exp: 1.05 },
  { id: 'kloppenheim', file: ASSET_BASE + 'hdris/kloppenheim_02.hdr',            title: '户外',     sub: '日光（Kloppenheim 02）',    exp: 1.00 },
];

const PRESETS = [
  { id: 'product',   name: '产品展示', fov: 38, dist: 3.2, tilt: 0.28, spin: 0.0,  bg: 'env',  showFloor: true  },
  { id: 'detail',    name: '细节特写', fov: 30, dist: 2.0, tilt: 0.10, spin: 0.0,  bg: 'env',  showFloor: false },
  { id: 'studio',    name: '影棚',     fov: 42, dist: 4.0, tilt: 0.45, spin: 0.0,  bg: 'room', showFloor: true  },
  { id: 'turntable', name: '转台',     fov: 42, dist: 4.2, tilt: 0.32, spin: 0.0,  bg: 'env',  showFloor: true  },
];

// ── page engine subclass ───────────────────────────────────────────────────
class ApertureStudioEngine extends ApertureEngine {
  constructor({ canvas }) {
    super({ canvas, models: MODELS, hdris: HDRIS, presets: PRESETS });
  }
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ── DOM refs ───────────────────────────────────────────────────────────────
const canvas = $('#stage-canvas');
const loading = $('#stage-loading');
const loadingText = $('#stage-loading-text');

const modelName = $('#model-name');
const modelSub  = $('#model-sub');
const hudModelTitle = $('#hud-model-title');
const hudModelSub   = $('#hud-model-sub');
const fpsEl     = $('#hud-fps');
const trisEl    = $('#hud-tris');
const callsEl   = $('#hud-calls');
const fxEl      = $('#hud-fx');

const modelGrid    = $('#model-grid');
const hdriList     = $('#hdri-list');
const presetGrid   = $('#preset-grid');
const exposureRange = $('#exposure');
const exposureValue = $('#exposure-value');
const spinRange     = $('#spin');
const spinValue     = $('#spin-value');
const toggleShadows = $('#toggle-shadows');
const toggleFloor   = $('#toggle-floor');
const toggleSkybox  = $('#toggle-skybox');
const btnSnapshot   = $('#btn-snapshot');
const btnReset      = $('#btn-reset');
const btnKeys       = $('#btn-keys');
const toastHost     = $('#toast-host');
// ── boot ───────────────────────────────────────────────────────────────────

const engine = new ApertureStudioEngine({ canvas });
window.__apertureEngine = engine; // diagnostic handle (harmless in prod)

new ResizeObserver(() => {
  const p = canvas.parentElement;
  engine.camera.setAspect(p.clientWidth, p.clientHeight);
}).observe(canvas.parentElement);

// ── HUD tick ───────────────────────────────────────────────────────────────

engine.onTick = (_dt, stats) => {
  fpsEl.textContent   = stats.fps.toFixed(0);
  trisEl.textContent  = formatCompact(stats.triangles);
  callsEl.textContent = stats.drawCalls;
  const ps = engine.getPostStats();
  fxEl.textContent = (ps.bloom ? 'B' : '') + (ps.ssao ? 'S' : '') + (ps.dof ? 'D' : '') + (ps.fxaa ? 'F' : '') || '·';
};

function formatCompact(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

// ── model gallery ──────────────────────────────────────────────────────────

function renderModels() {
  modelGrid.innerHTML = '';
  MODELS.forEach((m) => {
    const fmt = detectFormat(m.file).toUpperCase();
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'model-tile' + (m.id === engine.currentModelId ? ' is-active' : '');
    tile.dataset.id = m.id;
    tile.innerHTML = `
      <span class="model-tile__glyph">${m.title.split(' ').map(s => s[0]).slice(0,2).join('')}</span>
      <span class="model-tile__title">${m.title}</span>
      <span class="model-tile__meta">${m.sub}</span>
      <span class="model-tile__badge">${fmt} · ${m.triHint} tris</span>
    `;
    tile.addEventListener('click', () => selectModel(m.id));
    modelGrid.appendChild(tile);
  });

  const uploadTile = document.createElement('button');
  uploadTile.type = 'button';
  uploadTile.className = 'model-tile model-tile--upload';
  uploadTile.dataset.id = '__upload__';
  uploadTile.innerHTML = `
    <span class="model-tile__glyph ti ti-upload"></span>
    <span class="model-tile__title">上传模型</span>
    <span class="model-tile__meta">glb · obj · fbx · stl</span>
    <span class="model-tile__badge">本地文件</span>
  `;
  uploadTile.addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  modelGrid.appendChild(uploadTile);
}

async function selectModel(id) {
  const tile = $$('.model-tile').find((t) => t.dataset.id === id);
  $$('.model-tile').forEach((t) => t.classList.remove('is-active'));
  if (tile) tile.classList.add('is-active');

  const def = MODELS.find((m) => m.id === id);
  showLoading(`loading · ${def.title}`);
  modelName.textContent = def.title;
  modelSub.textContent  = def.sub;
  hudModelTitle.textContent = def.title;
  hudModelSub.textContent   = def.sub;

  const ok = await engine.loadModel(id);
  if (!ok) {
    toast('模型加载失败');
  } else if (engine.lastModelWasFallback) {
    toast('模型加载失败 · 显示程序占位体');
  }
  syncAllFromEngine();
  hideLoading();
}

// ── drag-and-drop + file upload ────────────────────────────────────────────

async function loadFileFromUser(file) {
  if (!file) return;
  const fmt = detectFormat(file.name);
  if (fmt === 'unknown') {
    toast(`不支持的格式 · ${file.name}`);
    return;
  }

  $$('.model-tile').forEach((t) => t.classList.remove('is-active'));

  showLoading(`加载中 · ${file.name}`);
  const sizeKB = Math.round(file.size / 1024);
  modelName.textContent = file.name;
  modelSub.textContent  = `${fmt.toUpperCase()} · ${sizeKB} kB`;
  hudModelTitle.textContent = file.name;
  hudModelSub.textContent   = `${fmt.toUpperCase()} · ${sizeKB} kB`;

  try {
    await engine.loadModelFromFile(file);
    if (engine.lastModelWasFallback) {
      toast(`解析失败 · 显示程序占位体`);
    } else {
      toast(`已加载 · ${fmt.toUpperCase()}`);
    }
  } catch (err) {
    console.error('[Aperture] file load error', err);
    toast('加载失败: ' + ((err && err.message) || '未知错误').slice(0, 60));
  }
  syncAllFromEngine();
  hideLoading();
}

const stage = document.getElementById('stage');
if (stage) {
  stage.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    stage.classList.add('is-dropping');
  });
  stage.addEventListener('dragleave', (e) => {
    if (stage.contains(e.relatedTarget)) return;
    stage.classList.remove('is-dropping');
  });
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    stage.classList.remove('is-dropping');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadFileFromUser(file);
  });
}

const fileInput = document.getElementById('file-input');
if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) loadFileFromUser(file);
    fileInput.value = '';
  });
}

// ── HDRI list ──────────────────────────────────────────────────────────────

function renderHdriList() {
  hdriList.innerHTML = '';
  HDRIS.forEach((h) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'hdri-row' + (h.id === engine.currentHdriId ? ' is-active' : '');
    row.dataset.id = h.id;
    row.innerHTML = `
      <span class="hdri-row__swatch" data-hdri="${h.id}"></span>
      <span class="hdri-row__title">${h.title}</span>
      <span class="hdri-row__sub">${h.sub}</span>
    `;
    row.addEventListener('click', () => selectHdri(h.id));
    hdriList.appendChild(row);
  });
  paintHdriSwatches();
}

function paintHdriSwatches() {
  const gradients = {
    'studio-03':   'linear-gradient(135deg,#2a2c30 0%,#7d8188 55%,#e8e9eb 100%)',
    'studio-02':   'linear-gradient(135deg,#1c1d1f 0%,#9aa0a6 45%,#f5f5f5 100%)',
    'studio-08':   'linear-gradient(135deg,#0f1011 0%,#4d5058 40%,#c8cad0 100%)',
    'studio-09':   'linear-gradient(135deg,#231f1c 0%,#8c7a66 55%,#f0d9b8 100%)',
    'photostudio': 'linear-gradient(135deg,#26201c 0%,#6e5844 50%,#c0a184 100%)',
    'kloppenheim': 'linear-gradient(135deg,#2b3849 0%,#87a3c2 50%,#e8d8b0 100%)',
  };
  $$('[data-hdri]').forEach((el) => {
    const g = gradients[el.dataset.hdri];
    if (g) el.style.background = g;
  });
}

async function selectHdri(id) {
  $$('.hdri-row').forEach((r) => r.classList.remove('is-active'));
  const row = $$('.hdri-row').find((r) => r.dataset.id === id);
  if (row) row.classList.add('is-active');

  const def = HDRIS.find((h) => h.id === id);
  showLoading(`加载中 · ${def.title}`);
  const ok = await engine.loadHdri(id);
  // Sync the exposure slider to the engine's recomputed applied exposure,
  // since switching HDRI recalibrates exposure against the user's factor.
  exposureRange.value = String(engine.exposure);
  exposureValue.textContent = engine.exposure.toFixed(2);
  if (!ok) {
    toast('环境贴图加载失败');
  } else if (engine.lastHdriWasFallback) {
    toast(`HDR 未加载 · 显示程序影棚环境`);
  }
  syncAllFromEngine();
  hideLoading();
}

// ── presets (render tab grid + stage chips) ────────────────────────────────

function renderPresets() {
  presetGrid.innerHTML = '';
  PRESETS.forEach((p) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'preset-btn--grid' + (p.id === engine.currentPreset.id ? ' is-active' : '');
    el.dataset.id = p.id;
    el.textContent = p.name;
    el.addEventListener('click', () => {
      $$('.preset-btn--grid').forEach((b) => b.classList.remove('is-active'));
      el.classList.add('is-active');
      engine.applyPreset(p.id);
      syncPresetChips();
    });
    presetGrid.appendChild(el);
  });
}

function renderPresetChips() {
  const list = document.getElementById('preset-list');
  if (!list) return;
  list.innerHTML = '';
  PRESETS.forEach((p) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'preset-btn' + (p.id === engine.currentPreset.id ? ' is-active' : '');
    el.dataset.id = p.id;
    el.textContent = p.name;
    el.addEventListener('click', () => {
      $$('.preset-btn').forEach((b) => b.classList.remove('is-active'));
      el.classList.add('is-active');
      engine.applyPreset(p.id);
      syncPresetGrid();
    });
    list.appendChild(el);
  });
}

function syncPresetChips() {
  $$('.preset-btn').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.id === engine.currentPreset.id);
  });
}
function syncPresetGrid() {
  $$('.preset-btn--grid').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.id === engine.currentPreset.id);
  });
}

// ── sliders & toggles ──────────────────────────────────────────────────────

exposureRange.addEventListener('input', () => {
  const v = parseFloat(exposureRange.value);
  exposureValue.textContent = v.toFixed(2);
  engine.setExposure(v);
});

spinRange.addEventListener('input', () => {
  const v = parseFloat(spinRange.value);
  spinValue.textContent = v.toFixed(2);
  engine.setSpin(v);
});

function bindToggle(id, initial, onChange) {
  const el = document.getElementById(id);
  el.setAttribute('aria-pressed', String(initial));
  el.classList.toggle('is-on', initial);
  el.addEventListener('click', () => {
    const next = !el.classList.contains('is-on');
    el.classList.toggle('is-on', next);
    el.setAttribute('aria-pressed', String(next));
    onChange(next);
  });
}
bindToggle('toggle-shadows', true,  (v) => engine.setShadow(v));
bindToggle('toggle-floor',   true,  (v) => engine.setFloorVisible(v));
bindToggle('toggle-skybox',  true,  (v) => engine.environment.setSkybox(v));
bindToggle('toggle-contact', true,  (v) => engine.setContactShadow(v));

// ── parameter bindings (render / light / fx tabs) ──────────────────────────

// Light tab
const envInt = $('#envint');
const envIntValue = $('#envint-value');
const keyRange = $('#key');
const keyValue = $('#key-value');
const fillRange = $('#fill');
const fillValue = $('#fill-value');
const rimRange = $('#rim');
const rimValue = $('#rim-value');

function bindSlider(id, valueId, fmt, onInput) {
  const range = document.getElementById(id);
  const valueEl = document.getElementById(valueId);
  range.addEventListener('input', () => {
    const v = parseFloat(range.value);
    valueEl.textContent = fmt(v);
    onInput(v);
  });
  return range;
}

bindSlider('envint', 'envint-value', (v) => v.toFixed(2), (v) => engine.setEnvironmentIntensity(v));
bindSlider('key', 'key-value', (v) => v.toFixed(2), (v) => engine.setKeyLight(v));
bindSlider('fill', 'fill-value', (v) => v.toFixed(2), (v) => engine.setFillLight(v));
bindSlider('rim', 'rim-value', (v) => v.toFixed(2), (v) => engine.setRimLight(v));
bindSlider('shadow-softness', 'shadow-softness-value', (v) => v.toFixed(1), (v) => engine.setShadowSoftness(v));

// Contact shadow (depth+blur) + continuous reflection (Reflector)
const contactBlurWrap = $('#contact-blur-wrap');
const reflectionStrengthWrap = $('#reflection-strength-wrap');
const reflectionStrength = $('#reflection-strength');
const reflectionStrengthValue = $('#reflection-strength-value');

bindToggle('toggle-contact', true, (on) => {
  contactBlurWrap.style.display = on ? 'flex' : 'none';
  engine.setContactShadow(on);
});
bindToggle('toggle-reflection', false, (on) => {
  reflectionStrengthWrap.style.display = on ? 'flex' : 'none';
  engine.setReflection(on);
});
bindSlider('contact-blur', 'contact-blur-value', (v) => v.toFixed(2), (v) => engine.setContactShadowBlur(v));
bindSlider('contact-intensity', 'contact-intensity-value', (v) => v.toFixed(2), (v) => engine.setContactShadowIntensity(v));
reflectionStrength.addEventListener('input', () => {
  reflectionStrengthValue.textContent = reflectionStrength.value;
  engine.setReflectionStrength(parseFloat(reflectionStrength.value));
});

// Ground
bindSlider('floor-rough', 'floor-rough-value', (v) => v.toFixed(2), (v) => engine.ground.setMaterial({ roughness: v }));
const floorColor = $('#floor-color');
const floorColorValue = $('#floor-color-value');
floorColor.addEventListener('input', () => {
  floorColorValue.textContent = floorColor.value;
  engine.ground.setMaterial({ color: floorColor.value });
});

// Effects tab
const bloomSection = $('#bloom-section');
const ssaoSection = $('#ssao-section');
const dofSection = $('#dof-section');

bindToggle('toggle-bloom', false, (on) => {
  bloomSection.style.display = on ? 'flex' : 'none';
  engine.setBloom({ enabled: on });
});
bindToggle('toggle-ssao', false, (on) => {
  ssaoSection.style.display = on ? 'flex' : 'none';
  engine.setSsao({ enabled: on });
});
bindToggle('toggle-dof', false, (on) => {
  dofSection.style.display = on ? 'flex' : 'none';
  engine.setDof({ enabled: on });
});
bindToggle('toggle-fxaa', true, (on) => engine.setFxaa(on));

bindSlider('bloom-intensity', 'bloom-intensity-value', (v) => v.toFixed(2), (v) => engine.setBloom({ intensity: v }));
bindSlider('bloom-threshold', 'bloom-threshold-value', (v) => v.toFixed(2), (v) => engine.setBloom({ threshold: v }));
bindSlider('ssao-radius', 'ssao-radius-value', (v) => v.toFixed(1), (v) => engine.setSsao({ radius: v }));
bindSlider('dof-focus', 'dof-focus-value', (v) => v.toFixed(1), (v) => engine.setDof({ focus: v }));
bindSlider('dof-aperture', 'dof-aperture-value', (v) => v.toFixed(3), (v) => engine.setDof({ aperture: v }));
bindSlider('dof-blur', 'dof-blur-value', (v) => v.toFixed(3), (v) => engine.setDof({ maxblur: v }));

// ── tab switching ──────────────────────────────────────────────────────────

$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    $$('.tabpane').forEach((p) => p.classList.remove('is-active'));
    const pane = $(`.tabpane[data-pane="${tab.dataset.tab}"]`);
    if (pane) pane.classList.add('is-active');
  });
});

// ── action buttons ─────────────────────────────────────────────────────────

btnSnapshot.addEventListener('click', () => {
  const btn = btnSnapshot;
  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = 'rendering…';
  requestAnimationFrame(() => {
    try {
      const result = engine.snapshot({ width: 1920, height: 1080 });
      engine.downloadSnapshot(result, 'aperture-studio.png');
      toast('已保存截图 · 1920 × 1080');
    } catch (err) {
      toast('截图失败');
    } finally {
      btn.textContent = prev;
      btn.disabled = false;
    }
  });
});

btnReset.addEventListener('click', () => {
  engine.applyPreset(engine.currentPreset.id);
  engine.camera.controls.target.set(0, 0.05, 0);
  engine.camera.controls.update();
  syncAllFromEngine();
  toast('视图已重置');
});

// ── stage quick controls (bottom-left overlay) ─────────────────────────────

const btnSnapshotFast = $('#btn-snapshot-fast');
const btnResetFast    = $('#btn-reset-fast');
const btnSpinFast     = $('#btn-spin-fast');

btnSnapshotFast.addEventListener('click', () => btnSnapshot.click());
btnResetFast.addEventListener('click', () => btnReset.click());
btnSpinFast.addEventListener('click', () => {
  const on = !engine.getSpin();
  engine.setSpin(on ? 0.35 : 0);
  spinRange.value = String(on ? 0.35 : 0);
  spinValue.textContent = (on ? 0.35 : 0).toFixed(2);
  btnSpinFast.classList.toggle('is-on', on);
});

// ── keyboard shortcuts ─────────────────────────────────────────────────────

const KEYS = {
  '1': () => selectModel(MODELS[0].id),
  '2': () => selectModel(MODELS[1].id),
  '3': () => selectModel(MODELS[2].id),
  '4': () => selectModel(MODELS[3].id),
  '5': () => selectModel(MODELS[4].id),
  '6': () => selectModel(MODELS[5].id),
  '7': () => selectModel(MODELS[6].id),
  '8': () => selectModel(MODELS[7].id),
  '9': () => selectModel(MODELS[8].id),
  'r': () => btnReset.click(),
  's': () => btnSnapshot.click(),
  'space': (e) => {
    e.preventDefault();
    const s = !engine.getSpin();
    engine.setSpin(s ? 0.35 : 0);
    spinRange.value = String(s ? 0.35 : 0);
    spinValue.textContent = (s ? 0.35 : 0).toFixed(2);
    $('#btn-spin-fast').classList.toggle('is-on', s);
  },
};
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const k = e.key.toLowerCase();
  if (KEYS[k]) KEYS[k](e);
});

btnKeys.addEventListener('click', () => {
  toast('快捷键 · 1–9 切换模型 · r 重置视图 · s 截图 · 空格 旋转 · 拖入文件加载');
});// ── loading + toast ─────────────────────────────────────────────────────────

function showLoading(msg) {
  loading.classList.remove('is-hidden');
  loadingText.textContent = msg;
}
function hideLoading() {
  loading.classList.add('is-hidden');
}
let toastTimer = null;
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  toastHost.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 220);
  }, 1800);
}

/**
 * 实时联动：把引擎当前状态写回面板控件。
 * 模型/环境切换后调用，保证用户调过的参数不会在视觉上"丢回默认"。
 */
function syncAllFromEngine() {
  exposureRange.value = String(engine.exposure);
  exposureValue.textContent = engine.exposure.toFixed(2);
  spinRange.value = String(engine.spinSpeed);
  spinValue.textContent = engine.spinSpeed.toFixed(2);
  $('#btn-spin-fast').classList.toggle('is-on', engine.getSpin() > 0);

  const env = engine.getEnvironmentIntensity ? engine.getEnvironmentIntensity() : engine._envIntensity;
  if (env != null && $('#envint')) $('#envint').value = String(env);
  if ($('#envint-value')) $('#envint-value').textContent = (env ?? 1).toFixed(2);

  syncLight('key', engine.getLightIntensities ? engine.getLightIntensities().key : null);
  syncLight('fill', engine.getLightIntensities ? engine.getLightIntensities().fill : null);
  syncLight('rim', engine.getLightIntensities ? engine.getLightIntensities().rim : null);
  if (engine._key && $('#shadow-softness')) {
    $('#shadow-softness').value = String(engine._key.shadow.radius);
    $('#shadow-softness-value').textContent = engine._key.shadow.radius.toFixed(1);
  }
}

function syncLight(id, v) {
  if (v == null || !$('#' + id)) return;
  $('#' + id).value = String(v);
  $('#' + id + '-value').textContent = v.toFixed(2);
}

// ── first boot ─────────────────────────────────────────────────────────────

(function boot() {
  renderModels();
  renderHdriList();
  renderPresets();
  renderPresetChips();

  exposureValue.textContent = engine.exposure.toFixed(2);
  spinRange.value = String(engine.spinSpeed);
  spinValue.textContent = engine.spinSpeed.toFixed(2);

  // sync quick spin button to current state
  $('#btn-spin-fast').classList.toggle('is-on', engine.getSpin() > 0);

  showLoading('正在启动引擎');
  Promise.allSettled([
    engine.loadHdri(HDRIS[0].id),
    engine.loadModel(MODELS[0].id),
  ]).then((results) => {
    hideLoading();
    modelName.textContent = MODELS[0].title;
    modelSub.textContent  = MODELS[0].sub;
    hudModelTitle.textContent = MODELS[0].title;
    hudModelSub.textContent   = MODELS[0].sub;
    syncAllFromEngine();

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length) {
      const reason = failed[0].reason;
      console.error('[Aperture] boot load failed', reason);
      const details = reason && reason.message ? reason.message : String(reason || 'unknown');
      toast('加载失败: ' + details.slice(0, 60));
    }
  });
})();
