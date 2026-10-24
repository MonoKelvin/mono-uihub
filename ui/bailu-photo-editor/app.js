/* 白露 · 修图工作台 */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pct = (v, min, max) => ((clamp(v, min, max) - min) / (max - min)) * 100;

  /* ── 数据 ─────────────────────────────────── */

  const DEFAULTS = {
    exposure: 0, contrast: 0, highlights: 0, shadows: 0,
    saturation: 0, temperature: 0, tint: 0,
    clarity: 0, grain: 0, vignette: 0
  };

  const DECO_DEFAULTS = { wm: '', wmSize: 26, wmOpacity: 70, wmPos: 'br', frame: 0, frameColor: '#f8f9fb' };

  const state = { ...DEFAULTS };
  const deco = { ...DECO_DEFAULTS };

  const GROUPS = [
    {
      title: '光线', icon: 'sun', items: [
        { k: 'exposure', label: '曝光', min: -100, max: 100, center: 0 },
        { k: 'contrast', label: '对比度', min: -100, max: 100, center: 0 },
        { k: 'highlights', label: '高光', min: -100, max: 100, center: 0 },
        { k: 'shadows', label: '阴影', min: -100, max: 100, center: 0 }
      ]
    },
    {
      title: '颜色', icon: 'droplet', items: [
        { k: 'saturation', label: '饱和度', min: -100, max: 100, center: 0 },
        { k: 'temperature', label: '色温', min: -100, max: 100, center: 0 },
        { k: 'tint', label: '色调', min: -100, max: 100, center: 0 }
      ]
    },
    {
      title: '质感', icon: 'sparkles', items: [
        { k: 'clarity', label: '清晰度', min: -100, max: 100, center: 0 },
        { k: 'grain', label: '颗粒', min: 0, max: 100, center: 0 },
        { k: 'vignette', label: '暗角', min: 0, max: 100, center: 0 }
      ]
    }
  ];

  const PRESETS = [
    { id: 'none', name: '原片', s: {} },
    { id: 'clear', name: '清透', s: { exposure: 8, contrast: 6, highlights: -12, shadows: 14, saturation: 4, temperature: -4, clarity: 8 } },
    { id: 'warm', name: '暖日光', s: { exposure: 10, contrast: 4, temperature: 22, saturation: 8, highlights: -8, shadows: 10, vignette: 12 } },
    { id: 'cool', name: '冷雾', s: { exposure: 4, contrast: -6, temperature: -20, saturation: -10, shadows: 18, clarity: 6, grain: 12 } },
    { id: 'film', name: '胶片', s: { contrast: 9, saturation: -12, temperature: 8, grain: 28, vignette: 18, highlights: -10 } },
    { id: 'citrus', name: '柑橘', s: { exposure: 6, contrast: 10, saturation: 20, temperature: 14, tint: -10, clarity: 10 } },
    { id: 'dusk', name: '暮色', s: { exposure: -6, contrast: 12, temperature: 10, tint: 12, saturation: 6, vignette: 26, shadows: -8 } },
    { id: 'mono', name: '黑白', s: { saturation: -100, contrast: 16, clarity: 12, grain: 16, vignette: 14 } }
  ];

  const PHOTOS = [
    { id: 'photo-1506905925346-21bda4d32df4', name: 'DSC_2847', ar: 1.5, exif: '1/250s  f/2.8  ISO 400' },
    { id: 'photo-1469474968028-56623f02e42e', name: 'DSC_2913', ar: 1.5, exif: '1/500s  f/4.0  ISO 200' },
    { id: 'photo-1470071459604-3b5ec3a7fe05', name: 'DSC_3051', ar: 1.5, exif: '1/160s  f/5.6  ISO 100' },
    { id: 'photo-1501785888041-af3ef285b470', name: 'DSC_5520', ar: 0.67, exif: '1/320s  f/3.2  ISO 640' },
    { id: 'photo-1441974231531-c6227db76b6e', name: 'DSC_5618', ar: 1.5, exif: '1/125s  f/1.8  ISO 800' },
    { id: 'photo-1426604966848-d7adac402bff', name: 'DSC_5724', ar: 1.5, exif: '1/1000s  f/8  ISO 100' },
    { id: 'photo-1472214103451-9374bd1c798e', name: 'DSC_5801', ar: 1.5, exif: '1/200s  f/2.2  ISO 320' },
    { id: 'photo-1447752875215-b2761acb3c5d', name: 'DSC_5936', ar: 1.5, exif: '1/400s  f/4.5  ISO 250' },
    { id: 'photo-1500534314209-a25ddb2bd429', name: 'DSC_6012', ar: 1.5, exif: '1/80s  f/2.8  ISO 1600' },
    { id: 'photo-1433086966358-54859d0ed716', name: 'DSC_6144', ar: 0.67, exif: '1/250s  f/5.6  ISO 400' },
    { id: 'photo-1519681393784-d120267933ba', name: 'DSC_6288', ar: 1.5, exif: '1/3200s  f/9  ISO 64' },
    { id: 'photo-1497436072909-60f360e1d4b1', name: 'DSC_3309', ar: 1.5, exif: '1/1250s  f/2.8  ISO 100' }
  ].map(p => ({
    name: p.name,
    exif: p.exif,
    ar: p.ar,
    url: `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=1600&q=80`
  }));

  const ui = {
    win: $('#win'),
    bar: $('.bar'),
    docName: $('#docName'),
    docMeta: $('#docMeta'),
    barTool: $('#barTool'),
    barHint: $('#barHint'),
    barDims: $('#barDims'),
    modeLabel: $('#modeLabel'),
    stage: $('#stage'),
    canvasWrap: $('#canvasWrap'),
    photo: $('#photo'),
    img: $('#photoImg'),
    orig: $('#photoOrig'),
    ovTemp: $('#ovTemp'),
    ovHi: $('#ovHi'),
    ovSh: $('#ovSh'),
    ovGrain: $('#ovGrain'),
    ovVig: $('#ovVig'),
    brush: $('#brushCanvas'),
    brushSize: $('#brushSize'),
    brushAlpha: $('#brushAlpha'),
    frame: $('#frame'),
    watermark: $('#watermark'),
    loader: $('#loader'),
    photoError: $('#photoError'),
    cmp: $('#cmp'),
    cmpLine: $('#cmpLine'),
    grid3: $('.photo .grid3'),
    holdBtn: $('#holdBtn'),
    zoomVal: $('#zoomVal'),
    railPin: $('#railPin'),
    histoPath: $('#histoPath'),
    exifText: $('#exifText'),
    tabPill: $('#tabPill'),
    presets: $('#presets'),
    hsteps: $('#hsteps'),
    paneAdjust: $('#paneAdjust'),
    panePreset: $('#panePreset'),
    paneHistory: $('#paneHistory'),
    outSize: $('#outSize'),
    outFormat: $('#outFormat'),
    outScale: $('#outScale'),
    quality: $('#quality'),
    qval: $('#qval'),
    qRow: $('#qRow'),
    qval: $('#qval'),
    film: $('#film'),
    undoBtn: $('#undoBtn'),
    redoBtn: $('#redoBtn'),
    exportBtn: $('#exportBtn'),
    resetAll: $('#resetAll'),
    toast: $('#toast'),
    fileInput: $('#fileInput'),
    helpModal: $('#helpModal'),
    helpTitle: $('#helpTitle')
  };

  const view = {
    tool: 'move',
    cropAr: 0,          // 已应用的裁剪比例
    previewAr: 0,       // 裁剪中的预览比例
    flipH: false,
    flipV: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    natW: 1600,
    natH: 1067,
    cur: 0,
    presetId: 'none',
    format: 'png',
    scale: 0,
    quality: 92,
    comparing: false,
    strokes: [],
    hist: [],
    hi: -1
  };

  const HIST_MAX = 60;

  /* ── 小工具 ───────────────────────────────── */

  let toastTimer = 0;

  function toast(msg) {
    ui.toast.textContent = msg;
    ui.toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('on'), 2200);
  }

  function fontSize(px) {
    return `${px}px`;
  }

  /* ── 图像与滤镜 ───────────────────────────── */

  function filterOf(s) {
    const b = 1 + s.exposure / 240;
    const c = 1 + s.contrast / 200 + s.clarity / 700;
    const sat = Math.max(0, 1 + s.saturation / 100 + s.clarity / 1400);
    return `brightness(${b.toFixed(3)}) contrast(${c.toFixed(3)}) saturate(${sat.toFixed(3)})`;
  }

  function toneColor(s) {
    const t = s.temperature / 100;
    const g = s.tint / 100;
    if (!t && !g) return 'transparent';
    const warm = t > 0;
    const base = warm ? [255, 146, 74] : [86, 156, 255];
    const green = g < 0 ? [120, 255, 190] : [255, 120, 214];
    const mix = Math.abs(t) >= Math.abs(g) ? base : green;
    const a = clamp(Math.max(Math.abs(t), Math.abs(g)) * 0.5, 0, 0.5);
    return `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${a.toFixed(3)})`;
  }

  function paintOverlays() {
    const s = state;
    ui.img.style.filter = filterOf(s);
    ui.orig.style.filter = 'none';

    ui.ovTemp.style.background = toneColor(s);
    ui.ovTemp.style.opacity = (s.temperature || s.tint) ? '1' : '0';

    const hi = s.highlights / 100;
    ui.ovHi.style.background = hi >= 0
      ? `rgba(255, 248, 236, ${(Math.abs(hi) * 0.4).toFixed(3)})`
      : `rgba(10, 22, 20, ${(Math.abs(hi) * 0.45).toFixed(3)})`;
    ui.ovHi.style.opacity = hi ? '1' : '0';

    const sh = s.shadows / 100;
    ui.ovSh.style.mixBlendMode = sh >= 0 ? 'screen' : 'multiply';
    ui.ovSh.style.background = sh >= 0
      ? `rgba(255, 250, 238, ${(Math.abs(sh) * 0.22).toFixed(3)})`
      : `rgba(8, 18, 16, ${(Math.abs(sh) * 0.4).toFixed(3)})`;
    ui.ovSh.style.opacity = sh ? '1' : '0';

    ui.ovGrain.style.opacity = (s.grain / 100 * 0.7).toFixed(3);

    ui.ovVig.style.opacity = (s.vignette / 100).toFixed(3);
    ui.ovVig.style.background = 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,.86) 128%)';

    paintDeco();
  }

  function paintDeco() {
    const w = ui.photo.clientWidth || 1;
    const min = Math.min(ui.photo.clientWidth, ui.photo.clientHeight) || 1;

    if (deco.wm) {
      ui.watermark.textContent = deco.wm;
      ui.watermark.dataset.pos = deco.wmPos;
      ui.watermark.style.fontSize = fontSize(deco.wmSize * (w / 900));
      ui.watermark.style.opacity = (deco.wmOpacity / 100).toFixed(2);
      ui.watermark.classList.add('show');
    } else {
      ui.watermark.classList.remove('show');
    }

    const fw = Math.round(min * (deco.frame / 100));
    ui.frame.style.borderWidth = `${fw}px`;
    ui.frame.style.borderColor = deco.frameColor;
  }

  /* 直方图 */
  const histoCanvas = document.createElement('canvas');
  const histoCtx = histoCanvas.getContext('2d', { willReadFrequently: true });

  function computeHisto() {
    const img = ui.img;
    if (!img.naturalWidth) return;
    const w = 96;
    const h = 64;
    histoCanvas.width = w;
    histoCanvas.height = h;
    histoCtx.clearRect(0, 0, w, h);
    histoCtx.filter = filterOf(state);
    try {
      histoCtx.drawImage(img, 0, 0, w, h);
    } catch (e) {
      return;
    } finally {
      histoCtx.filter = 'none';
    }
    let data;
    try {
      data = histoCtx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return;
    }
    const bins = new Array(64).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const l = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      bins[Math.min(63, Math.floor(l * 64))] += 1;
    }
    drawHisto(bins);
  }

  function drawHisto(bins) {
    const W = 320;
    const H = 64;
    const n = bins.length;
    /* 五点平滑，去掉栅栏感 */
    const sm = bins.map((_, i) => {
      let sum = 0;
      let w = 0;
      for (let k = -2; k <= 2; k += 1) {
        const j = i + k;
        if (j < 0 || j >= n) continue;
        const wt = 3 - Math.abs(k);
        sum += bins[j] * wt;
        w += wt;
      }
      return sum / w;
    });
    const peak = sm.slice().sort((a, b) => a - b)[Math.floor(n * 0.97)] || 1;
    const pts = sm.map((v, i) => {
      const x = ((i + 0.5) / n) * W;
      const y = H - Math.min(1, v / peak) * (H - 6) - 1;
      return [x, y];
    });
    let d = `M0 ${H} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i += 1) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    d += ` L${W} ${H} Z`;
    ui.histoPath.setAttribute('d', d);
  }

  /* ── 面板 ─────────────────────────────────── */

  function sliderRow(cfg) {
    const row = document.createElement('div');
    row.className = 'row';
    const id = `s-${cfg.k}`;

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = cfg.label;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = cfg.min;
    input.max = cfg.max;
    input.step = 1;
    input.value = state[cfg.k];
    input.dataset.k = cfg.k;

    const val = document.createElement('span');
    val.className = 'val';

    row.append(label, input, val);
    row._cfg = cfg;
    return row;
  }

  function buildPanel() {
    ui.paneAdjust.innerHTML = '';

    GROUPS.forEach(group => {
      const sec = document.createElement('section');
      sec.className = 'sec';

      const h = document.createElement('h2');
      h.className = 'sec-h';
      h.innerHTML = `<i class="ti ti-${group.icon} ico"></i><span>${group.title}</span><i class="sec-line"></i>`;

      const rows = document.createElement('div');
      rows.className = 'rows';
      group.items.forEach(cfg => rows.appendChild(sliderRow(cfg)));

      sec.append(h, rows);
      ui.paneAdjust.appendChild(sec);
    });

    const sec = document.createElement('section');
    sec.className = 'sec';
    sec.innerHTML = `
      <h2 class="sec-h"><i class="ti ti-letter-case ico"></i><span>修饰</span><i class="sec-line"></i></h2>
      <div class="deco">
        <label class="field">
          <i class="ti ti-letter-case ico"></i>
          <input type="text" id="wmText" maxlength="18" placeholder="添加水印文字" value="">
        </label>
        <div class="row"><label for="wmSize">字号</label><input id="wmSize" type="range" min="14" max="72" step="1" value="26"><span class="val"></span></div>
        <div class="row"><label for="wmOpacity">不透明</label><input id="wmOpacity" type="range" min="10" max="100" step="1" value="70"><span class="val"></span></div>
        <div class="picks" id="wmPos">
          <button class="pick" type="button" data-pos="tl">左上</button>
          <button class="pick" type="button" data-pos="tr">右上</button>
          <button class="pick" type="button" data-pos="bl">左下</button>
          <button class="pick on" type="button" data-pos="br">右下</button>
        </div>
        <div class="row"><label for="frameW">边框</label><input id="frameW" type="range" min="0" max="8" step="1" value="0"><span class="val"></span></div>
        <div class="picks" id="frameColor">
          <button class="pick on" type="button" data-color="#fffaf4">纸白</button>
          <button class="pick" type="button" data-color="#12201d">深墨</button>
          <button class="pick" type="button" data-color="#ff5a36">珊瑚</button>
        </div>
      </div>`;
    ui.paneAdjust.appendChild(sec);

    // 滑块同步
    $$('input[type="range"]', ui.paneAdjust).forEach(input => {
      const k = input.id;
      if (input.dataset.k) {
        syncSlider(input, state[input.dataset.k], 0);
      } else if (k === 'wmSize') {
        syncSlider(input, deco.wmSize, 14);
      } else if (k === 'wmOpacity') {
        syncSlider(input, deco.wmOpacity, 10);
      } else if (k === 'frameW') {
        syncSlider(input, deco.frame, 0);
      }
      input.addEventListener('input', onPanelSlider);
    });

    const wmText = $('#wmText', ui.paneAdjust);
    wmText.addEventListener('input', () => {
      deco.wm = wmText.value.trim();
      paintDeco();
      pushHistory('水印文字', true);
    });

    $('#wmPos', ui.paneAdjust).addEventListener('click', e => {
      const b = e.target.closest('.pick');
      if (!b) return;
      $$('.pick', $('#wmPos')).forEach(x => x.classList.toggle('on', x === b));
      deco.wmPos = b.dataset.pos;
      paintDeco();
      pushHistory('水印位置', true);
    });

    $('#frameColor', ui.paneAdjust).addEventListener('click', e => {
      const b = e.target.closest('.pick');
      if (!b) return;
      $$('.pick', $('#frameColor')).forEach(x => x.classList.toggle('on', x === b));
      deco.frameColor = b.dataset.color;
      paintDeco();
      pushHistory('边框颜色', true);
    });

    syncDecoUI();
  }

  function syncSlider(input, value, center) {
    input.value = value;
    const imin = Number(input.min);
    const imax = Number(input.max);
    const anchor = clamp(center, imin, imax);
    const a = pct(anchor, imin, imax);
    const b = pct(value, imin, imax);
    input.style.setProperty('--a', `${Math.min(a, b).toFixed(2)}%`);
    input.style.setProperty('--b', `${Math.max(a, b).toFixed(2)}%`);
    const row = input.closest('.row');
    const val = row && $('.val', row);
    if (val) {
      const signed = anchor !== imin;
      val.textContent = (signed && value > 0 ? '+' : '') + Math.round(value);
      val.classList.toggle('mute', !value);
    }
  }

  let sliderTimer = 0;
  let sliderKey = '';
  let histoTimer = 0;

  function queueHisto() {
    clearTimeout(histoTimer);
    histoTimer = setTimeout(computeHisto, 120);
  }

  function queueSliderHistory(label) {
    clearTimeout(sliderTimer);
    sliderKey = label;
    sliderTimer = setTimeout(() => pushHistory(label, true), 420);
  }

  function onPanelSlider(e) {
    const input = e.target;
    const k = input.id;

    if (input.dataset.k) {
      const key = input.dataset.k;
      state[key] = Number(input.value);
      view.presetId = 'none';
      renderPresets();
      syncSlider(input, state[key], 0);
      queueSliderHistory('调整 · ' + input.closest('.row').querySelector('label').textContent);
    } else if (k === 'wmSize') {
      deco.wmSize = Number(input.value);
      syncSlider(input, deco.wmSize, 14);
      paintDeco();
      queueSliderHistory('水印字号');
    } else if (k === 'wmOpacity') {
      deco.wmOpacity = Number(input.value);
      syncSlider(input, deco.wmOpacity, 10);
      paintDeco();
      queueSliderHistory('水印透明');
    } else if (k === 'frameW') {
      deco.frame = Number(input.value);
      syncSlider(input, deco.frame, 0);
      paintDeco();
      queueSliderHistory('边框宽度');
    }
    paintOverlays();
    updateOutSize();
    if (input.dataset.k) queueHisto();
  }

  function syncDecoUI() {
    const wmText = $('#wmText', ui.paneAdjust);
    if (wmText) wmText.value = deco.wm;
    $$('.pick', $('#wmPos')).forEach(x => x.classList.toggle('on', x.dataset.pos === deco.wmPos));
    $$('.pick', $('#frameColor')).forEach(x => x.classList.toggle('on', x.dataset.color === deco.frameColor));
  }

  function renderPresets() {
    ui.presets.innerHTML = '';
    const src = ui.img.src || PHOTOS[view.cur].url;

    PRESETS.forEach(p => {
      const s = { ...DEFAULTS, ...p.s };
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pcard' + (view.presetId === p.id ? ' on' : '');
      card.dataset.preset = p.id;
      card.innerHTML = `
        <span class="pthumb"><img src="${src}" alt="" style="filter:${filterOf(s)}" loading="lazy"></span>
        <span class="pname"><span>${p.name}</span><i class="ptick"></i></span>`;
      card.addEventListener('click', () => applyPreset(p.id));
      ui.presets.appendChild(card);
    });
  }

  function applyPreset(id) {
    const p = PRESETS.find(x => x.id === id);
    if (!p) return;
    Object.assign(state, DEFAULTS, p.s);
    view.presetId = id;
    $$('input[data-k]', ui.paneAdjust).forEach(input => {
      const k = input.dataset.k;
      input.value = state[k];
      syncSlider(input, state[k], 0);
    });
    paintOverlays();
    renderPresets();
    updateOutSize();
    pushHistory(`预设 · ${p.name}`);
  }

  /* ── 标签页 ───────────────────────────────── */

  function setTab(name) {
    const tabs = $$('.tab');
    const idx = ['adjust', 'preset', 'history'].indexOf(name);
    tabs.forEach((t, i) => {
      const on = i === idx;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', String(on));
    });
    ui.tabPill.style.setProperty('--pill-x', `${idx * 100}%`);
    ui.paneAdjust.hidden = name !== 'adjust';
    ui.panePreset.hidden = name !== 'preset';
    ui.paneHistory.hidden = name !== 'history';
    if (name === 'preset') renderPresets();
    if (name === 'history') renderHistory();
    if (typeof layoutSbar === 'function') requestAnimationFrame(layoutSbar);
  }

  $$('.tab').forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

  /* ── 历史 ─────────────────────────────────── */

  function snapshot(label) {
    return {
      label,
      s: { ...state },
      d: { ...deco },
      preset: view.presetId,
      cropAr: view.cropAr,
      flipH: view.flipH,
      flipV: view.flipV,
      strokes: view.strokes.map(p => ({ ...p })),
      time: new Date()
    };
  }

  function pushHistory(label, coalesce) {
    const snap = snapshot(label);
    view.hist = view.hist.slice(0, view.hi + 1);
    const last = view.hist[view.hi];
    if (coalesce && last && last.label === label) {
      view.hist[view.hi] = snap;
    } else {
      view.hist.push(snap);
      view.hi = view.hist.length - 1;
      if (view.hist.length > HIST_MAX) {
        view.hist.shift();
        view.hi = view.hist.length - 1;
      }
    }
    renderHistory();
    updateUndoRedo();
  }

  function renderHistory() {
    if (!ui.hsteps) return;
    ui.hsteps.innerHTML = '';
    const list = view.hist.map((h, i) => ({ h, i })).reverse();
    list.forEach(({ h, i }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hstep' + (i === view.hi ? ' on' : '');
      b.innerHTML = `<i></i><span>${h.label}</span><span class="t mono">${h.time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>`;
      b.addEventListener('click', () => restoreHistory(i));
      ui.hsteps.appendChild(b);
    });
  }

  function restoreHistory(i) {
    const h = view.hist[i];
    if (!h) return;
    Object.assign(state, h.s);
    Object.assign(deco, h.d);
    view.presetId = h.preset;
    view.cropAr = h.cropAr;
    view.flipH = h.flipH;
    view.flipV = h.flipV;
    view.strokes = h.strokes.map(p => ({ ...p }));
    view.hi = i;
    syncAllUI();
    renderHistory();
    updateUndoRedo();
    toast(`回到：${h.label}`);
  }

  function undo() {
    if (view.hi <= 0) return;
    restoreHistory(view.hi - 1);
  }

  function redo() {
    if (view.hi >= view.hist.length - 1) return;
    restoreHistory(view.hi + 1);
  }

  function updateUndoRedo() {
    ui.undoBtn.disabled = view.hi <= 0;
    ui.redoBtn.disabled = view.hi >= view.hist.length - 1;
  }

  function syncAllUI() {
    $$('input[data-k]', ui.paneAdjust).forEach(input => {
      const k = input.dataset.k;
      input.value = state[k];
      syncSlider(input, state[k], 0);
    });
    const wmSize = $('#wmSize', ui.paneAdjust);
    const wmOpacity = $('#wmOpacity', ui.paneAdjust);
    const frameW = $('#frameW', ui.paneAdjust);
    if (wmSize) syncSlider(wmSize, deco.wmSize, 14);
    if (wmOpacity) syncSlider(wmOpacity, deco.wmOpacity, 10);
    if (frameW) syncSlider(frameW, deco.frame, 0);
    syncDecoUI();
    paintOverlays();
    renderStrokes();
    fitPhoto();
    updateFlip();
    renderPresets();
    updateOutSize();
    updateDoc();
  }

  /* ── 视口 ─────────────────────────────────── */

  const dpr = Math.min(2, window.devicePixelRatio || 1);

  const effAr = () => view.previewAr || view.cropAr || (view.natW / view.natH) || 1.5;

  function fitPhoto() {
    const box = ui.canvasWrap.getBoundingClientRect();
    const ar = effAr();
    const availW = Math.max(160, box.width);
    const availH = Math.max(120, box.height);
    let w = availW;
    let h = w / ar;
    if (h > availH) {
      h = availH;
      w = h * ar;
    }
    ui.photo.style.width = `${Math.round(w)}px`;
    ui.photo.style.height = `${Math.round(h)}px`;
    sizeBrush();
    paintDeco();
  }

  function sizeBrush() {
    const w = ui.photo.clientWidth;
    const h = ui.photo.clientHeight;
    if (!w || !h) return;
    ui.brush.width = Math.round(w * dpr);
    ui.brush.height = Math.round(h * dpr);
    renderStrokes();
  }

  function renderStrokes() {
    const ctx = ui.brush.getContext('2d');
    const W = ui.brush.width;
    const H = ui.brush.height;
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    view.strokes.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 82, 38, ${p.a.toFixed(3)})`;
      ctx.arc(p.x * W, p.y * H, Math.max(1, p.r * W), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function applyTransform() {
    ui.photo.style.transform = `translate3d(${view.panX.toFixed(2)}px, ${view.panY.toFixed(2)}px, 0) scale(${view.zoom})`;
    ui.zoomVal.textContent = view.zoom <= 1.001 ? '适应' : `${Math.round(view.zoom * 100)}%`;
  }

  function setZoom(z) {
    view.zoom = clamp(z, 1, 4);
    if (view.zoom <= 1.001) {
      view.panX = 0;
      view.panY = 0;
    }
    applyTransform();
  }

  function updateFlip() {
    ui.photo.classList.toggle('flip-h', view.flipH);
    ui.photo.classList.toggle('flip-v', view.flipV);
  }

  /* ── 工具 ─────────────────────────────────── */

  const TOOL_LABEL = { move: '移动', crop: '裁剪', brush: '涂抹', split: '对比', grid: '三分线' };
  const TOOL_HINT = {
    move: '拖动平移，滚轮缩放',
    crop: '选比例后应用，可翻转',
    brush: '在照片上按住涂抹',
    split: '左右移动指针对比原图',
    grid: '九宫格构图参考'
  };

  function movePin() {
    const active = $('.rail .tool[aria-pressed="true"]');
    if (!active) return;
    ui.railPin.style.setProperty('--pin-y', `${active.offsetTop - 14}px`);
  }

  function setTool(name) {
    if (!TOOL_LABEL[name]) name = 'move';
    view.tool = name;
    ui.stage.dataset.tool = name;
    $$('.tool[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === name)));
    movePin();
    ui.modeLabel.textContent = TOOL_LABEL[name];
    ui.barTool.textContent = TOOL_LABEL[name];
    ui.barHint.textContent = TOOL_HINT[name] || '';
    $$('.ctx-group').forEach(g => { g.hidden = g.dataset.for !== name; });
    ui.brush.classList.toggle('on', name === 'brush');
    ui.photo.classList.toggle('cmp-on', name === 'split');
    ui.cmp.classList.toggle('on', name === 'split');
    ui.cmp.hidden = name !== 'split';
    ui.photo.classList.toggle('crop-on', name === 'crop');
    ui.grid3.classList.toggle('on', name === 'grid');
  }

  function cropChip(ar) {
    view.previewAr = ar;
    $$('.chip[data-ar]').forEach(b => {
      b.classList.toggle('on', Math.abs(Number(b.dataset.ar === 'orig' ? 0 : b.dataset.ar) - ar) < 0.0001);
    });
    fitPhoto();
  }

  function applyCrop() {
    view.cropAr = view.previewAr;
    view.previewAr = 0;
    $$('.chip[data-ar]').forEach(b => b.classList.toggle('on', b.dataset.ar === 'orig' && !view.cropAr));
    fitPhoto();
    updateDoc();
    pushHistory('应用裁剪');
    toast(view.cropAr ? `已裁成 ${view.cropAr === 1 ? '1:1' : view.cropAr === 0.8 ? '4:5' : '16:9'}` : '已恢复原比例');
  }

  function cancelCrop() {
    view.previewAr = 0;
    $$('.chip[data-ar]').forEach(b => b.classList.toggle('on', b.dataset.ar === 'orig'));
    fitPhoto();
  }

  /* 涂抹 */
  let drawing = false;
  let lastPt = null;

  function brushPoint(e, fresh) {
    const rect = ui.brush.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1)
    };
  }

  function addStroke(pt, r, a) {
    if (!pt) return;
    if (lastPt) {
      const dx = pt.x - lastPt.x;
      const dy = pt.y - lastPt.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(r * 0.5, 0.002);
      const n = Math.min(48, Math.floor(dist / step));
      for (let i = 1; i <= n; i++) {
        view.strokes.push({ x: lastPt.x + dx * (i / n), y: lastPt.y + dy * (i / n), r, a });
      }
    }
    view.strokes.push({ x: pt.x, y: pt.y, r, a });
    lastPt = pt;
  }

  ui.brush.addEventListener('pointerdown', e => {
    if (view.tool !== 'brush') return;
    e.preventDefault();
    drawing = true;
    lastPt = null;
    ui.brush.setPointerCapture(e.pointerId);
    const r = (Number(ui.brushSize.value) / 2) / (ui.photo.clientWidth || 1);
    addStroke(brushPoint(e), r, Number(ui.brushAlpha.value) / 100);
    renderStrokes();
  });

  ui.brush.addEventListener('pointermove', e => {
    if (!drawing) return;
    const r = (Number(ui.brushSize.value) / 2) / (ui.photo.clientWidth || 1);
    addStroke(brushPoint(e), r, Number(ui.brushAlpha.value) / 100);
    renderStrokes();
  });

  const endStroke = e => {
    if (!drawing) return;
    drawing = false;
    lastPt = null;
    try { ui.brush.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    if (view.strokes.length) pushHistory('涂抹');
  };

  ui.brush.addEventListener('pointerup', endStroke);
  ui.brush.addEventListener('pointercancel', endStroke);

  ui.brushSize.addEventListener('input', () => {
    const r = Number(ui.brushSize.value);
    ui.brushSize.style.setProperty('--a', '0%');
    ui.brushSize.style.setProperty('--b', `${pct(r, 4, 80)}%`);
  });

  ui.brushAlpha.addEventListener('input', () => {
    const a = Number(ui.brushAlpha.value);
    ui.brushAlpha.style.setProperty('--a', '0%');
    ui.brushAlpha.style.setProperty('--b', `${pct(a, 10, 100)}%`);
  });

  /* 对比分屏 */
  ui.canvasWrap.addEventListener('pointermove', e => {
    if (view.tool !== 'split') return;
    const rect = ui.photo.getBoundingClientRect();
    if (!rect.width) return;
    const f = clamp((e.clientX - rect.left) / rect.width, 0.04, 0.96);
    ui.cmpLine.style.left = `${f * 100}%`;
    ui.orig.style.clipPath = `inset(0 ${(1 - f) * 100}% 0 0)`;
  });

  /* 平移与缩放 */
  let panning = false;
  let panStart = null;

  ui.photo.addEventListener('pointerdown', e => {
    if (view.tool !== 'move' || e.button !== 0) return;
    panning = true;
    panStart = { x: e.clientX - view.panX, y: e.clientY - view.panY };
    ui.photo.classList.add('grabbing');
    ui.photo.setPointerCapture(e.pointerId);
  });

  ui.photo.addEventListener('pointermove', e => {
    if (!panning) return;
    view.panX = e.clientX - panStart.x;
    view.panY = e.clientY - panStart.y;
    applyTransform();
  });

  const endPan = e => {
    if (!panning) return;
    panning = false;
    ui.photo.classList.remove('grabbing');
    try { ui.photo.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
  };

  ui.photo.addEventListener('pointerup', endPan);
  ui.photo.addEventListener('pointercancel', endPan);

  ui.canvasWrap.addEventListener('wheel', e => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    setZoom(view.zoom + dir * 0.15);
  }, { passive: false });

  /* 原图对比 */
  let holding = false;

  function setHolding(on) {
    holding = on;
    ui.photo.classList.toggle('holding', on);
    ui.holdBtn.classList.toggle('on', on);
  }

  ui.holdBtn.addEventListener('pointerdown', e => {
    e.preventDefault();
    setHolding(true);
  });
  window.addEventListener('pointerup', () => { if (holding) setHolding(false); });

  /* ── 文档信息 ─────────────────────────────── */

  function outDims() {
    let w = view.natW || 1600;
    let h = view.natH || 1067;
    const ar = view.cropAr;
    if (ar) {
      if (w / h > ar) w = h * ar;
      else h = w / ar;
    }
    const cap = Number(view.scale) || 0;
    if (cap && w > cap) {
      h = h * (cap / w);
      w = cap;
    }
    return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  }

  function updateOutSize() {
    const d = outDims();
    if (ui.outSize) ui.outSize.textContent = d.w + ' × ' + d.h;
    if (ui.barDims) ui.barDims.textContent = d.w + ' × ' + d.h;
    if (ui.qRow) ui.qRow.hidden = view.format !== 'jpeg';
  }

  function updateDoc() {
    const d = outDims();
    if (ui.docName) ui.docName.textContent = view.docName || '未命名.jpg';
    if (ui.docMeta) ui.docMeta.textContent = d.w + ' × ' + d.h + ' · ' + (view.exif || 'RAW');
    if (ui.exifText) ui.exifText.textContent = view.exif || 'RAW';
    updateOutSize();
  }

  /* ── 照片载入 ─────────────────────────────── */

  const probeCache = new Map();

  function probeCors(url) {
    if (probeCache.has(url)) return probeCache.get(url);
    const p = new Promise(resolve => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(true);
      im.onerror = () => resolve(false);
      im.src = url;
    });
    probeCache.set(url, p);
    return p;
  }

  function loadInto(el, url, cors) {
    return new Promise((resolve, reject) => {
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('load-failed'));
      if (cors) el.setAttribute('crossorigin', 'anonymous');
      else el.removeAttribute('crossorigin');
      el.src = url;
    });
  }

  let newCount = 0;

  async function setPhoto(meta) {
    ui.loader.hidden = false;
    ui.photoError.hidden = true;
    const cors = await probeCors(meta.url);

    try {
      await Promise.all([loadInto(ui.img, meta.url, cors), loadInto(ui.orig, meta.url, cors)]);
    } catch (err) {
      ui.loader.hidden = true;
      ui.photoError.hidden = false;
      toast('这张照片读不出来，换一张试试');
      return;
    }

    view.natW = ui.img.naturalWidth || 1600;
    view.natH = ui.img.naturalHeight || 1067;
    view.docName = meta.name + '.jpg';
    view.exif = meta.exif || 'RAW';
    view.cropAr = 0;
    view.previewAr = 0;
    view.flipH = false;
    view.flipV = false;
    view.zoom = 1;
    view.panX = 0;
    view.panY = 0;
    view.strokes = [];
    view.presetId = 'none';
    Object.assign(state, DEFAULTS);
    Object.assign(deco, DECO_DEFAULTS);

    ui.loader.hidden = true;
    ui.photoError.hidden = true;
    applyTransform();
    updateFlip();
    syncAllUI();
    updateDoc();
    requestAnimationFrame(computeHisto);
    renderFilm();
    setZoom(1);
    pushHistory('打开 ' + meta.name);
    if (view.tool === 'crop') setTool('move');
  }

  function openPhoto(i) {
    if (i === view.cur) return;
    view.cur = i;
    setPhoto(PHOTOS[i]);
  }

  /* ── 胶卷 ─────────────────────────────────── */

  function thumbOf(p) {
    return p.url.replace('w=1600', 'w=260');
  }

  function renderFilm() {
    if (!ui.film) return;
    ui.film.innerHTML = '';
    PHOTOS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cell' + (i === view.cur ? ' on' : '');
      b.dataset.i = String(i);
      b.innerHTML = '<img src="' + thumbOf(p) + '" alt="" loading="lazy"><span class="cap mono">' + p.name.replace('DSC_', '') + '</span>';
      b.addEventListener('click', () => openPhoto(i));
      ui.film.appendChild(b);
    });

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'cell-add';
    add.innerHTML = '<i class="ti ti-plus ico"></i><span>导入</span>';
    add.addEventListener('click', () => ui.fileInput.click());
    ui.film.appendChild(add);

    const on = $('.cell.on', ui.film);
    if (on) {
      const left = on.offsetLeft - ui.film.clientWidth / 2 + on.offsetWidth / 2;
      ui.film.scrollTo({ left, behavior: 'smooth' });
    }
  }

  function stepFilm(dir) {
    if (!PHOTOS.length) return;
    view.cur = (view.cur + dir + PHOTOS.length) % PHOTOS.length;
    setPhoto(PHOTOS[view.cur]);
  }

  /* ── 菜单 ─────────────────────────────────── */

  function closeMenus() {
    $$('.menu').forEach(m => m.classList.remove('open'));
    $$('.menu-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }

  function bindMenus() {
    $$('.menu-btn').forEach(btn => {
      const menu = btn.nextElementSibling;
      if (!menu) return;

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.classList.contains('open');
        closeMenus();
        if (!open) {
          menu.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      btn.addEventListener('pointerenter', () => {
        if (!$$('.menu.open').length) return;
        closeMenus();
        menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      });
    });
    document.addEventListener('click', () => closeMenus());
  }

  /* ── 导出 ─────────────────────────────────── */

  function sourceRect() {
    const ar = effAr();
    let sx = 0;
    let sy = 0;
    let sw = view.natW || 1600;
    let sh = view.natH || 1067;
    const cur = sw / sh;
    if (cur > ar) {
      const nw = sh * ar;
      sx = (sw - nw) / 2;
      sw = nw;
    } else if (cur < ar) {
      const nh = sw / ar;
      sy = (sh - nh) / 2;
      sh = nh;
    }
    return { sx, sy, sw, sh };
  }

  function paintEffects(ctx, w, h) {
    const s = state;
    const min = Math.min(w, h);

    if (s.temperature || s.tint) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = Math.min(.55, (Math.abs(s.temperature) + Math.abs(s.tint)) / 200);
      ctx.fillStyle = toneColor(s);
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (s.highlights) {
      const hi = s.highlights / 100;
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = Math.min(.5, Math.abs(hi) * .45);
      ctx.fillStyle = hi >= 0 ? '#fff8ec' : '#0a1614';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (s.shadows) {
      const sh = s.shadows / 100;
      ctx.save();
      ctx.globalCompositeOperation = sh >= 0 ? 'screen' : 'multiply';
      ctx.globalAlpha = Math.min(.45, Math.abs(sh) * (sh >= 0 ? .26 : .42));
      ctx.fillStyle = sh >= 0 ? '#fff9ee' : '#0b1714';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (s.vignette) {
      const g = ctx.createRadialGradient(w / 2, h * .45, min * .18, w / 2, h * .45, min * .78);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,' + (s.vignette / 100 * .86).toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    if (s.grain) {
      const n = Math.round(w * h * .0016);
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.globalAlpha = s.grain / 100 * .5;
      for (let i = 0; i < n; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      ctx.restore();
    }

    if (deco.frame > 0) {
      const bw = Math.max(1, Math.round(min * deco.frame / 100));
      ctx.save();
      ctx.strokeStyle = deco.frameColor;
      ctx.lineWidth = bw;
      ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
      ctx.restore();
    }

    if (deco.wm) {
      const fs2 = Math.round(deco.wmSize * (w / 900));
      const pad = Math.round(min * .045);
      ctx.save();
      ctx.globalAlpha = deco.wmOpacity / 100;
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 ' + fs2 + 'px Sora, "PingFang SC", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = Math.round(fs2 * .35);
      const mw = ctx.measureText(deco.wm).width;
      const right = deco.wmPos === 'tr' || deco.wmPos === 'br';
      const bottom = deco.wmPos === 'bl' || deco.wmPos === 'br';
      const x = right ? w - pad - mw : pad;
      const y = bottom ? h - pad : pad + fs2;
      ctx.fillText(deco.wm, x, y);
      ctx.restore();
    }

    if (view.strokes.length) {
      ctx.save();
      view.strokes.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 82, 38, ' + p.a.toFixed(3) + ')';
        ctx.arc(p.x * w, p.y * h, Math.max(1, p.r * w), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  function renderExport() {
    const d = outDims();
    const cv = document.createElement('canvas');
    cv.width = d.w;
    cv.height = d.h;
    const ctx = cv.getContext('2d');
    const r = sourceRect();

    ctx.save();
    if (view.flipH || view.flipV) {
      ctx.translate(d.w / 2, d.h / 2);
      ctx.scale(view.flipH ? -1 : 1, view.flipV ? -1 : 1);
      ctx.translate(-d.w / 2, -d.h / 2);
    }
    ctx.filter = filterOf(state);
    try {
      ctx.drawImage(ui.img, r.sx, r.sy, r.sw, r.sh, 0, 0, d.w, d.h);
    } catch (err) {
      ctx.fillStyle = '#12161b';
      ctx.fillRect(0, 0, d.w, d.h);
    }
    ctx.filter = 'none';
    ctx.restore();

    paintEffects(ctx, d.w, d.h);
    return cv;
  }

  function exportImage(kind) {
    const fmt = kind === 'jpeg' || kind === 'jpg' ? 'jpeg' : 'png';
    const cv = renderExport();
    const base = (view.docName || 'photo').replace(/\.[^.]+$/, '');
    const mime = fmt === 'jpeg' ? 'image/jpeg' : 'image/png';

    const done = blob => {
      if (!blob) {
        toast('导出失败，请换一张照片');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = base + '-bailu.' + (fmt === 'jpeg' ? 'jpg' : 'png');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('已导出 ' + cv.width + ' × ' + cv.height + ' ' + (fmt === 'jpeg' ? 'JPG' : 'PNG'));
    };

    if (cv.toBlob) cv.toBlob(done, mime, fmt === 'jpeg' ? view.quality / 100 : undefined);
    else done(null);
  }

  function printPhoto() {
    const cv = renderExport();
    const url = cv.toDataURL('image/jpeg', .92);
    const win = window.open('', '_blank');
    if (!win) {
      toast('浏览器拦住了打印窗口');
      return;
    }
    win.document.write('<title>' + (view.docName || '白露') + '</title><img src="' + url + '" style="max-width:100%;display:block;margin:24px auto" onload="setTimeout(function(){window.print()},300)">');
    win.document.close();
  }

  /* ── 新建 / 导入 ──────────────────────────── */

  function newDoc() {
    const cv = document.createElement('canvas');
    cv.width = 2000;
    cv.height = 1400;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#eef1f5';
    ctx.fillRect(0, 0, 2000, 1400);
    ctx.strokeStyle = 'rgba(15,20,25,.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1920, 1320);

    newCount += 1;
    view.cur = -1;
    setPhoto({ name: '未命名-' + newCount, exif: '空白画布', url: cv.toDataURL('image/png') });
    toast('已新建 2000 × 1400 画布');
  }

  function importFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast('只能打开图片文件');
      return;
    }
    const name = file.name.replace(/\.[^.]+$/, '') || '导入照片';
    view.cur = -1;
    setPhoto({ name, exif: Math.max(1, Math.round(file.size / 1024)) + ' KB', url: URL.createObjectURL(file) });
    toast('已打开 ' + file.name);
  }

  /* ── 弹窗 ─────────────────────────────────── */

  let aboutEl = null;

  function openModal(kind) {
    const about = kind === 'about';
    ui.helpModal.hidden = false;
    ui.helpModal.classList.add('on');
    ui.helpTitle.textContent = about ? '关于白露' : '快捷键';
    const keys = $('.keys', ui.helpModal);
    if (keys) keys.hidden = about;
    if (!aboutEl) {
      aboutEl = document.createElement('div');
      aboutEl.className = 'about';
      aboutEl.innerHTML = '<p>白露是一款面向年轻人的桌面修图工作台：调色、裁剪、涂抹、水印、边框都在本地完成，照片不会上传到任何服务器。</p><p class="mono">v1.0 · 2026</p>';
      $('.sheet', ui.helpModal).appendChild(aboutEl);
    }
    aboutEl.hidden = !about;
  }

  function closeModal() {
    ui.helpModal.classList.remove('on');
    ui.helpModal.hidden = true;
  }

  /* ── 全屏 ─────────────────────────────────── */

  function toggleFull() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    const p = ui.win.requestFullscreen ? ui.win.requestFullscreen() : null;
    if (p && p.catch) p.catch(() => toast('当前环境不支持全屏'));
    else if (!p) toast('当前环境不支持全屏');
  }

  /* ── 动作表 ───────────────────────────────── */

  function resetAll() {
    Object.assign(state, DEFAULTS);
    Object.assign(deco, DECO_DEFAULTS);
    view.presetId = 'none';
    view.cropAr = 0;
    view.previewAr = 0;
    view.flipH = false;
    view.flipV = false;
    view.strokes = [];
    setZoom(1);
    updateFlip();
    syncAllUI();
    updateDoc();
    pushHistory('重置全部');
    toast('已重置调整');
  }

  const ACTIONS = {
    'new': newDoc,
    'import': () => ui.fileInput.click(),
    'export-png': () => exportImage('png'),
    'export-jpg': () => exportImage('jpeg'),
    'print': printPhoto,
    'undo': undo,
    'redo': redo,
    'reset': resetAll,
    'flip': () => {
      view.flipH = !view.flipH;
      updateFlip();
      pushHistory('水平翻转');
      toast(view.flipH ? '已水平翻转' : '已还原方向');
    },
    'flip-v': () => {
      view.flipV = !view.flipV;
      updateFlip();
      pushHistory('垂直翻转');
      toast(view.flipV ? '已垂直翻转' : '已还原方向');
    },
    'fit': () => { setZoom(1); toast('已适应窗口'); },
    'zoomin': () => setZoom(view.zoom * 1.25),
    'zoomout': () => setZoom(view.zoom / 1.25),
    'grid': () => setTool(view.tool === 'grid' ? 'move' : 'grid'),
    'full': toggleFull,
    'help': () => openModal('help'),
    'about': () => openModal('about'),
    'crop-apply': applyCrop,
    'crop-cancel': cancelCrop,
    'brush-clear': () => {
      view.strokes = [];
      renderStrokes();
      pushHistory('清空涂抹');
      toast('笔迹已清空');
    },
    'export-now': () => exportImage(view.format),
    'film-prev': () => stepFilm(-1),
    'film-next': () => stepFilm(1),
    'close-help': closeModal
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    if (el.dataset.act !== 'import' && !/^(film|crop|export-now)/.test(el.dataset.act)) closeMenus();
    fn();
  });

  /* ── 绑定 ─────────────────────────────────── */

  function bindStage() {
    $$('.rail .tool[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));

    $$('.chip[data-ar]').forEach(b => {
      b.addEventListener('click', () => {
        const raw = b.dataset.ar;
        cropChip(raw === 'orig' ? 0 : Number(raw));
      });
    });

    ui.holdBtn.addEventListener('click', () => {
      view.comparing = !view.comparing;
      ui.photo.classList.toggle('compare-on', view.comparing);
      ui.holdBtn.setAttribute('aria-pressed', String(view.comparing));
      toast(view.comparing ? '正在显示原图' : '回到编辑效果');
    });

    ui.outFormat.addEventListener('click', e => {
      const b = e.target.closest('[data-format]');
      if (!b) return;
      view.format = b.dataset.format === 'jpg' ? 'jpeg' : b.dataset.format;
      $$('[data-format]', ui.outFormat).forEach(x => x.classList.toggle('on', x === b));
      updateOutSize();
    });

    ui.outScale.addEventListener('click', e => {
      const b = e.target.closest('[data-scale]');
      if (!b) return;
      view.scale = Number(b.dataset.scale);
      $$('[data-scale]', ui.outScale).forEach(x => x.classList.toggle('on', x === b));
      updateOutSize();
    });

    ui.quality.addEventListener('input', () => {
      view.quality = Number(ui.quality.value);
      ui.qval.textContent = String(view.quality);
      ui.quality.style.setProperty('--b', ((view.quality - 60) / 40 * 100) + '%');
    });

    ui.fileInput.addEventListener('change', () => {
      importFile(ui.fileInput.files && ui.fileInput.files[0]);
      ui.fileInput.value = '';
    });

    ui.helpModal.addEventListener('click', e => {
      if (e.target === ui.helpModal) closeModal();
    });

    ui.stage.addEventListener('dragover', e => {
      e.preventDefault();
      ui.stage.classList.add('dragging');
    });
    ui.stage.addEventListener('dragleave', () => ui.stage.classList.remove('dragging'));
    ui.stage.addEventListener('drop', e => {
      e.preventDefault();
      ui.stage.classList.remove('dragging');
      importFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    });

    ui.resetAll.addEventListener('click', resetAll);
    ui.undoBtn.addEventListener('click', undo);
    ui.redoBtn.addEventListener('click', redo);
    ui.exportBtn.addEventListener('click', () => exportImage(view.format));

    const mark = () => movePin();
    window.addEventListener('resize', () => {
      fitPhoto();
      mark();
    });
    if (window.ResizeObserver) {
      new ResizeObserver(() => mark()).observe($('.rail'));
    }
  }

  function bindKeys() {
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const k = e.key.toLowerCase();
      const meta = e.ctrlKey || e.metaKey;

      if (meta && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && k === 'y') { e.preventDefault(); redo(); return; }
      if (meta && k === 's') { e.preventDefault(); exportImage(view.format); return; }
      if (meta && k === 'n') { e.preventDefault(); newDoc(); return; }
      if (meta) return;

      if (k === 'v') setTool('move');
      else if (k === 'c') setTool('crop');
      else if (k === 'b') setTool('brush');
      else if (k === 's') setTool('split');
      else if (k === 'g') setTool(view.tool === 'grid' ? 'move' : 'grid');
      else if (k === 'f') setZoom(1);
      else if (k === '=' || k === '+') setZoom(view.zoom * 1.2);
      else if (k === '-') setZoom(view.zoom / 1.2);
      else if (k === 'escape') {
        closeMenus();
        closeModal();
        if (view.previewAr) cancelCrop();
      }
    });
  }

  /* ── 启动 ─────────────────────────────────── */

  /* ── 动画滚动条组件 ───────────────────────── */

  let sbar = null, sbarThumb = null, sbarHide = null, sbarPane = null;

  function visiblePane() {
    return [ui.paneAdjust, ui.panePreset, ui.paneHistory].find(p => p && !p.hidden) || null;
  }

  function layoutSbar() {
    if (!sbar) return;
    const pane = visiblePane();
    if (!pane) return;
    sbarPane = pane;
    sbar.style.top = pane.offsetTop + 'px';
    sbar.style.height = pane.clientHeight + 'px';
    const scrollable = pane.scrollHeight > pane.clientHeight + 2;
    if (!scrollable) { sbar.classList.remove('show'); return; }
    const track = pane.clientHeight;
    const thumbH = Math.max(30, Math.round(track * (pane.clientHeight / pane.scrollHeight)));
    sbarThumb.style.height = thumbH + 'px';
    const maxTravel = track - thumbH;
    const maxScroll = pane.scrollHeight - pane.clientHeight;
    const y = maxScroll > 0 ? (pane.scrollTop / maxScroll) * maxTravel : 0;
    sbarThumb.style.transform = `translateY(${Math.round(y)}px)`;
  }

  function sbarShow(persist) {
    if (!sbar || !sbarPane) return;
    if (sbarPane.scrollHeight <= sbarPane.clientHeight + 2) return;
    sbar.classList.add('show');
    clearTimeout(sbarHide);
    if (!persist) sbarHide = setTimeout(() => sbar.classList.remove('show'), 1400);
  }

  function bindScrollbar() {
    const panel = document.querySelector('.panel');
    if (!panel) return;
    sbar = document.createElement('div');
    sbar.className = 'sbar';
    sbar.innerHTML = '<div class="sbar-thumb"></div>';
    sbar.setAttribute('aria-hidden', 'true');
    panel.appendChild(sbar);
    sbarThumb = sbar.firstElementChild;

    [ui.paneAdjust, ui.panePreset, ui.paneHistory].forEach(pane => {
      if (!pane) return;
      pane.addEventListener('scroll', () => { layoutSbar(); sbarShow(false); }, { passive: true });
      pane.addEventListener('pointerenter', () => { layoutSbar(); sbarShow(true); });
      pane.addEventListener('pointerleave', () => {
        if (sbar.classList.contains('dragging')) return;
        clearTimeout(sbarHide);
        sbarHide = setTimeout(() => sbar.classList.remove('show'), 420);
      });
    });

    // 拖拽拇指：从 0 起算，按比例映射滚动位置
    sbar.addEventListener('pointerdown', e => {
      if (!sbarPane) return;
      const onThumb = e.target === sbarThumb;
      if (!onThumb) {                       // 点击轨道：平滑翻页到该处
        e.preventDefault();
        const rect = sbar.getBoundingClientRect();
        const rel = (e.clientY - rect.top) / rect.height;
        sbarPane.scrollTo({ top: rel * sbarPane.scrollHeight, behavior: 'smooth' });
        sbarShow(false);
        return;
      }
      e.preventDefault();
      sbar.classList.add('dragging');
      const thumbH = sbarThumb.offsetHeight;
      const maxTravel = Math.max(1, sbar.clientHeight - thumbH);
      const startY = e.clientY;
      const startTravel = (parseFloat(sbarThumb.style.transform.match(/-?[\d.]+/)?.[0]) || 0);
      const onMove = ev => {
        const travel = Math.min(maxTravel, Math.max(0, startTravel + (ev.clientY - startY)));
        const maxScroll = sbarPane.scrollHeight - sbarPane.clientHeight;
        sbarPane.scrollTop = maxTravel > 0 ? (travel / maxTravel) * maxScroll : 0;
        layoutSbar();
      };
      const onUp = () => {
        sbar.classList.remove('dragging');
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        sbarShow(false);
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    if (window.ResizeObserver) {
      new ResizeObserver(() => layoutSbar()).observe(panel);
    }
    window.addEventListener('resize', layoutSbar);
    layoutSbar();
  }

  function init() {
    buildPanel();
    bindMenus();
    bindStage();
    bindKeys();
    bindScrollbar();
    setTab('adjust');
    setTool('move');

    const p = PHOTOS[0];
    view.cur = 0;
    view.docName = p.name + '.jpg';
    view.exif = p.exif;
    view.natW = 1600;
    view.natH = Math.round(1600 / p.ar);
    setPhoto(p);

    ui.img.addEventListener('load', () => {
      fitPhoto();
      sizeBrush();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(movePin, 60));
    }
    setTimeout(movePin, 80);
  }

  init();

})();
