'use strict';

/* ═══ 数据 ═══ */
const STRATA = [
  { no: 'Ⅰ', name: '表土层', years: '2018–2026', top: 0, height: 8, hue: '#6b6558', tint: '#6f695c', shade: '#655f52', code: '01' },
  { no: 'Ⅱ', name: '数码尘积层', years: '1998–2018', top: 8, height: 15, hue: '#565a64', tint: '#5b5f6a', shade: '#50545e', code: '02' },
  { no: 'Ⅲ', name: '磁带纪', years: '1935–1972', top: 23, height: 22, hue: '#6e5f4e', tint: '#736452', shade: '#685a48', code: '03' },
  { no: 'Ⅳ', name: '留声纪', years: '1877–1935', top: 45, height: 18, hue: '#4a5a52', tint: '#50615a', shade: '#45564e', code: '04' },
  { no: 'Ⅴ', name: '乐谱沉积纪', years: '1600–1877', top: 63, height: 17, hue: '#42504a', tint: '#475650', shade: '#3d4b45', code: '05' },
  { no: 'Ⅵ', name: '骨笛基岩', years: '前6000–1600', top: 80, height: 20, hue: '#3c4450', tint: '#414a56', shade: '#38404c', code: '06' },
];

const SPECIMENS = [
  {
    id: 'AC-1953-Ⅲ-07', stratum: 2, name: '中波电台整点报时', quality: 'good', qualityText: '固结完好',
    shape: 'pips',
    desc: '六响调频报时信号的后两响，封装在胶木绝缘片内。640 Hz 信号沿石英颗粒间隙渗入并完成置换，尾音里封存了当夜的一次电台切换噪声。',
    meta: [['主频', '640 Hz'], ['包埋率', '72.4 %'], ['半衰', '未检出'], ['修复度', '89 %']],
  },
  {
    id: 'AC-1912-Ⅳ-22', stratum: 3, name: '蒸汽渡轮离港汽笛', quality: 'good', qualityText: '固结完好',
    shape: 'bell',
    desc: '三长一短的离港笛声，被封存于煤渣砂岩的气孔中。低频段保存极好，320 Hz 处可辨识出码头回声的两次反射纹路。',
    meta: [['主频', '318 Hz'], ['包埋率', '81.0 %'], ['半衰', '410 年'], ['修复度', '76 %']],
  },
  {
    id: 'AC-1708-Ⅴ-03', stratum: 4, name: '铸钟作坊淬火鸣响', quality: 'warning', qualityText: '边缘风化',
    shape: 'triple',
    desc: '钟体入水淬火时的一次完整泛音列，附着在硅化木切片上。基频清晰，但第三次泛音以上已被地下水溶蚀，需注固后方可重建。',
    meta: [['主频', '212 Hz'], ['包埋率', '58.7 %'], ['半衰', '180 年'], ['修复度', '52 %']],
  },
  {
    id: 'AC-1938-Ⅲ-15', stratum: 2, name: '铁皮玩具发条游走', quality: 'good', qualityText: '固结完好',
    shape: 'saw',
    desc: '发条齿轮组的棘轮噪声，嵌在一枚氧化铁结核里。2 kHz 以上的锯齿波形保存完整，是本探方磁带纪最完整的一件机械声化石。',
    meta: [['主频', '2.1 kHz'], ['包埋率', '66.2 %'], ['半衰', '未检出'], ['修复度', '84 %']],
  },
  {
    id: 'AC-1580-Ⅴ-11', stratum: 4, name: '雨落书院瓦檐', quality: 'warning', qualityText: '边缘风化',
    shape: 'pips',
    desc: '一场秋雨打在陶瓦上的连续脉冲序列，渗入并封存于膨胀珍珠岩夹层。脉冲间隔稳定在 0.4 秒，末段因岩层错动缺失约六秒。',
    meta: [['主频', '1.3 kHz'], ['包埋率', '49.5 %'], ['半衰', '220 年'], ['修复度', '61 %']],
  },
  {
    id: 'AC-6200-Ⅵ-01', stratum: 5, name: '骨笛残段吹奏泛音', quality: 'warning', qualityText: '固结脆弱',
    shape: 'bell',
    desc: '鹤骨笛残段的一次短促吹奏，声纹置换进埋藏环境中的方解石晶簇。仅存第二、第三泛音，是本层目前唯一确认的史前声化石。',
    meta: [['主频', '486 Hz'], ['包埋率', '37.1 %'], ['半衰', '90 年'], ['修复度', '28 %']],
  },
];

const LOGS = [
  { year: '2018', text: 'JX-KQ-04 探方开掘，表土层下 1.2 米处首见声化石胶结带。' },
  { year: '2003', text: '数码尘积层中分理出首批可播放的存储残片，读出率不足两成。' },
  { year: '1972', text: '磁带纪底界采样完成，确认该纪终止于批量转数字前的最后一次灌带。', key: true },
  { year: '1953', text: '本层最厚胶木绝缘片出土，内部检出六响报时信号。' },
  { year: '1912', text: '渡轮汽笛化石定年，与航运档案记录的离港时刻完全吻合。' },
  { year: '1877', text: '留声纪顶界划出，机械录音开始参与声纹置换过程。', key: true },
  { year: '1708', text: '铸钟淬火鸣响出土，泛音列不完整，列入注固优先名单。' },
  { year: '前 6000', text: '骨笛基岩顶部检出史前吹奏泛音，为本馆最早的声音标本。', key: true },
];

/* ═══ 状态 ═══ */
const state = {
  depth: 23,          // 剖面顶界埋深（% of full depth）
  targetDepth: 23,
  dragging: false,
  specimen: null,     // 当前选中化石
  bench: null,        // 载入分析台的化石
  playing: false,
  t: 0,               // 播放进度 0..1
  volume: 0.62,
  cutoff: 0.52,
  stretch: 0.5,
  gain: 0.5,
};

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ 轻提示 ═══ */
let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ═══ 地层剖面 Canvas ═══ */
const strataCanvas = $('strataCanvas');
const sctx = strataCanvas.getContext('2d');
let strataW = 0, strataH = 0, dpr = 1;

function resizeStrata() {
  dpr = window.devicePixelRatio || 1;
  const r = strataCanvas.parentElement.getBoundingClientRect();
  strataW = r.width; strataH = r.height;
  strataCanvas.width = strataW * dpr;
  strataCanvas.height = strataH * dpr;
}

// 由 depth（0..100 顶部埋深，整层高 100）换算各层绘制的竖直区间
function strataRange(depth) {
  // 视口展示 0..(depth+100)，地层 0..100 映射到视口 0..(100/(depth+100))*100
  const span = depth + 100;
  return (top, height) => ({ y0: (top / span) * 100, y1: ((top + height) / span) * 100 });
}

function drawStrata(depth) {
  const ctx = sctx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, strataW, strataH);
  const map = strataRange(depth);

  // 背景微网格
  ctx.fillStyle = 'rgba(216,213,202,0.015)';
  for (let x = 0; x < strataW; x += 28) ctx.fillRect(x, 0, 1, strataH);

  // 地层
  STRATA.forEach((s, i) => {
    const { y0, y1 } = map(s.top, s.height);
    const py0 = (y0 / 100) * strataH;
    const py1 = (y1 / 100) * strataH;
    const h = py1 - py0;
    if (h < 1) return;

    ctx.fillStyle = s.tint;
    ctx.fillRect(0, py0, strataW, h);

    // 层内纹理：随机分布的水平细颗粒
    let seed = i * 977 + 13;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = 'rgba(216,213,202,0.025)';
    const grains = Math.floor(h / 3);
    for (let g = 0; g < grains; g++) {
      ctx.fillRect(rnd() * strataW, py0 + rnd() * h, 2 + rnd() * 7, 1);
    }

    // 层间界线
    ctx.fillStyle = 'rgba(216,213,202,0.07)';
    ctx.fillRect(0, py1 - 1, strataW, 1);

    // 当前层用略亮的底色区分
    if (i === currentStratumIndex()) {
      ctx.fillStyle = 'rgba(212,160,64,0.04)';
      ctx.fillRect(0, py0, strataW, h);
    }

    // 左侧标注（仅当层高足够）
    if (h > 34) {
      ctx.fillStyle = 'rgba(216,213,202,0.45)';
      ctx.font = '600 12px "Spline Sans Mono", monospace';
      ctx.fillText(`${s.code} · ${s.years}`, 14, py0 + 20);
      ctx.fillStyle = 'rgba(216,213,202,0.75)';
      ctx.font = '600 14px "WenYuan Serif SC VF", "Songti SC", serif';
      ctx.fillText(s.name, 14, py0 + 40);
    } else if (h > 20) {
      ctx.fillStyle = 'rgba(216,213,202,0.4)';
      ctx.font = '600 11px "Spline Sans Mono", monospace';
      ctx.fillText(`${s.code} ${s.name}`, 14, py0 + h / 2 + 4);
    }
  });

  // 当前地层高亮描边
  const cur = currentStratum();
  const cr = map(cur.top, cur.height);
  const cy0 = (cr.y0 / 100) * strataH, cy1 = (cr.y1 / 100) * strataH;
  ctx.fillStyle = 'rgba(212,160,64,0.03)';
  ctx.fillRect(0, cy0, strataW, Math.max(2, cy1 - cy0));
  ctx.strokeStyle = '#d4a040';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.strokeRect(1.5, cy0 + 1, strataW - 3, Math.max(2, cy1 - cy0 - 2));
  ctx.setLineDash([]);

  // 顶部铲斗线
  ctx.fillStyle = 'rgba(216,213,202,0.15)';
  ctx.fillRect(0, 0, strataW, 2);
}

function currentStratumIndex() {
  const centerDepth = state.depth + 50;
  for (let i = 0; i < STRATA.length; i++) {
    const s = STRATA[i];
    if (centerDepth >= s.top && centerDepth < s.top + s.height) return i;
  }
  return 0;
}

function currentStratum() {
  return STRATA[currentStratumIndex()];
}

function updateStratumUI() {
  const s = currentStratum();
  $('pillNo').textContent = s.no;
  $('pillName').textContent = s.name;
  $('pillYears').textContent = s.years;
  $('readoutStratum').textContent = `勘测中 · 第 ${s.no} 层 ${s.name}`;
  $('readoutAge').textContent = `${s.years} 年代带`;
  $('logYear').textContent = s.years.split('–')[0];

  document.querySelectorAll('.legend-item').forEach((el, i) => {
    el.classList.toggle('active', i === STRATA.indexOf(s));
  });

  // 当前层的大事记年份高亮（当前层年代带内的事件）
  const yearStart = parseInt(s.years.split('–')[0].replace('前 ', ''), 10) || 0;
  const yearEnd = parseInt(s.years.split('–')[1] || s.years.split('–')[0], 10) || 0;
  document.querySelectorAll('.log-item').forEach((el, i) => {
    const raw = LOGS[i].year.replace('前 ', '-');
    const y = parseInt(raw, 10) || 0;
    el.classList.toggle('key', !!LOGS[i].key && y >= yearStart - 26 && y <= yearEnd + 26);
  });

  const readout = $('surveyReadout');
  readout.classList.remove('tick');
  void readout.offsetWidth;
  readout.classList.add('tick');
}

// 平滑趋近目标埋深
function strataLoop() {
  if (!state.dragging && Math.abs(state.depth - state.targetDepth) > 0.05) {
    state.depth += (state.targetDepth - state.depth) * 0.14;
    drawStrata(state.depth);
    updateStratumUI();
  }
  requestAnimationFrame(strataLoop);
}

function snapTo(pct) {
  state.targetDepth = clamp(pct, 0, 100);
}

strataCanvas.addEventListener('pointerdown', (e) => {
  state.dragging = true;
  strataCanvas.classList.add('dragging');
  strataCanvas.setPointerCapture(e.pointerId);
  $('dragHint').classList.add('gone');
  const r = strataCanvas.getBoundingClientRect();
  // 以按住点为中心吸附
  const holdCenter = (e.clientY - r.top) / r.height;
  state.dragOffset = holdCenter - 0.5;
  state.targetDepth = clamp(state.depth + (holdCenter - 0.5) * 100 * 0.3, 0, 100);
});
strataCanvas.addEventListener('pointermove', (e) => {
  if (!state.dragging) return;
  const r = strataCanvas.getBoundingClientRect();
  const dy = e.movementY;
  state.targetDepth = clamp(state.targetDepth + dy / r.height * 90, 0, 100);
});
window.addEventListener('pointerup', () => {
  state.dragging = false;
  strataCanvas.classList.remove('dragging');
});

/* ═══ 地层图例 ═══ */
function renderLegend() {
  const wrap = $('stratumLegend');
  wrap.innerHTML = '';
  STRATA.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'legend-item';
    btn.setAttribute('role', 'tab');
    const sw = document.createElement('span');
    sw.className = 'legend-swatch';
    sw.style.background = s.hue;
    const body = document.createElement('span');
    body.innerHTML = '';
    const nm = document.createElement('span');
    nm.className = 'legend-name';
    nm.textContent = `${s.no} ${s.name}`;
    const ag = document.createElement('span');
    ag.className = 'legend-age';
    ag.textContent = s.years;
    body.append(nm, ag);
    btn.append(sw, body);
    btn.addEventListener('click', () => {
      snapTo(s.top + s.height / 2 - 50);
    });
    wrap.appendChild(btn);
  });
}

/* ═══ 化石图标（手绘 SVG） ═══ */
function fossilSVG(shape) {
  const s = {
    pips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>
      <circle cx="8" cy="12" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="10" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="1.3" fill="currentColor" stroke="none"/>
      <path d="M4.5 9.5 Q12 14.5 19.5 9.5" opacity=".5"/>
    </svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <path d="M12 4 c4.5 0 6.5 3.2 6.5 6.8 0 3.2 1.2 4.6 2.5 5.7 h-18 c1.3-1.1 2.5-2.5 2.5-5.7 C5.5 7.2 7.5 4 12 4 Z"/>
      <path d="M10 19.5 a2 2 0 0 0 4 0"/>
      <path d="M9 10.5 v3 M12 9 v5 M15 10.5 v3" opacity=".6"/>
    </svg>`,
    triple: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <path d="M3 16 Q6 6 9 16"/><path d="M9 16 Q12 4 15 16"/><path d="M15 16 Q18 7 21 16"/>
      <path d="M2.5 16 h19" opacity=".5"/>
    </svg>`,
    saw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 14 l2.4-6 2.4 6 2.4-6 2.4 6 2.4-6 2.4 6 2.4-6 1.8 6"/>
      <circle cx="6" cy="19" r="1.4"/><circle cx="12" cy="19" r="1.4"/><circle cx="18" cy="19" r="1.4"/>
    </svg>`,
  };
  return s[shape] || s.pips;
}

/* ═══ 标本列表 ═══ */
function renderSpecimens() {
  const list = $('specimenList');
  list.innerHTML = '';
  SPECIMENS.forEach((sp, i) => {
    const btn = document.createElement('button');
    btn.className = 'specimen-item';
    btn.setAttribute('role', 'listitem');
    btn.dataset.idx = i;
    const glyph = document.createElement('span');
    glyph.className = 'fossil-glyph';
    glyph.innerHTML = fossilSVG(sp.shape);
    const body = document.createElement('span');
    const h = document.createElement('h3');
    h.textContent = sp.name;
    const id = document.createElement('span');
    id.className = 'specimen-id';
    id.textContent = sp.id;
    body.append(h, id);
    const no = document.createElement('span');
    no.className = 'specimen-no mono';
    no.textContent = `No.${String(i + 1).padStart(2, '0')}`;
    btn.append(glyph, body, no);
    btn.addEventListener('click', () => selectSpecimen(i));
    list.appendChild(btn);
  });
  $('specimenCount').textContent = `${SPECIMENS.length} 件`;
}

function selectSpecimen(i) {
  state.specimen = SPECIMENS[i];
  document.querySelectorAll('.specimen-item').forEach((el, j) => {
    el.classList.toggle('active', j === i);
  });
  const sp = state.specimen;
  $('specTagNo').textContent = sp.id;
  $('specTagName').textContent = sp.name;
  $('fossilDetail').hidden = false;
  $('detailName').textContent = sp.name;
  $('detailStatus').innerHTML = `<span class="status-dot ${sp.quality}"></span>${sp.qualityText}`;
  $('detailDesc').textContent = sp.desc;
  const meta = $('detailMeta');
  meta.innerHTML = '';
  sp.meta.forEach(([k, v]) => {
    const dv = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dv.append(dt, dd);
    meta.appendChild(dv);
  });
  drawSpectrum();
}

$('collapseBtn').addEventListener('click', () => {
  $('fossilDetail').hidden = true;
  state.specimen = null;
  document.querySelectorAll('.specimen-item').forEach((el) => el.classList.remove('active'));
  $('specTagNo').textContent = '—';
  $('specTagName').textContent = '悬停查看频点';
});

/* ═══ 大事记 ═══ */
function renderLogs() {
  const list = $('logList');
  list.innerHTML = '';
  LOGS.forEach((log) => {
    const item = document.createElement('div');
    item.className = 'log-item' + (log.key ? ' key' : '');
    const y = document.createElement('span');
    y.className = 'log-year';
    y.textContent = log.year;
    const p = document.createElement('p');
    p.textContent = log.text;
    item.append(y, p);
    list.appendChild(item);
  });
}

/* ═══ 频谱分析 Canvas ═══ */
const specCanvas = $('spectrumCanvas');
const specCtx = specCanvas.getContext('2d');
let specW = 0, specH = 0;
const BINS = 96;

function resizeSpectrum() {
  const r = specCanvas.parentElement.getBoundingClientRect();
  const d = window.devicePixelRatio || 1;
  specW = r.width; specH = r.height;
  specCanvas.width = specW * d;
  specCanvas.height = specH * d;
  specCtx.setTransform(d, 0, 0, d, 0, 0);
}

// 稳定的伪随机
function hash(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

function spectrumData(sp, t) {
  // 生成频谱：低频主峰 + 谐波 + 噪声底
  const data = new Float32Array(BINS);
  if (!sp) {
    for (let i = 0; i < BINS; i++) data[i] = 0.03 + hash(i) * 0.02;
    return data;
  }
  const mainF = 0.18 + (SPECIMENS.indexOf(sp) / SPECIMENS.length) * 0.5;
  const harm = [1, 2, 3, 4.7, 6.2];
  const amp = [1, 0.55, 0.32, 0.18, 0.1];
  for (let i = 0; i < BINS; i++) {
    const f = i / BINS;
    let v = 0.02 + hash(i + 7) * 0.025;
    harm.forEach((hh, k) => {
      const c = mainF * hh;
      const w = 0.02 + k * 0.008;
      v += amp[k] * Math.exp(-((f - c) ** 2) / (2 * w * w));
    });
    // 轻微时间起伏（播放时呼吸感）
    if (state.playing) v *= 0.86 + 0.14 * Math.sin(t * 2.4 + i * 0.4);
    data[i] = v;
  }
  return data;
}

function drawSpectrum(t = 0) {
  const ctx = specCtx;
  ctx.clearRect(0, 0, specW, specH);
  const pad = { l: 44, r: 16, t: 34, b: 30 };
  const pw = specW - pad.l - pad.r, ph = specH - pad.t - pad.b;
  const data = spectrumData(state.specimen, t);

  // 网格与坐标轴
  ctx.strokeStyle = 'rgba(216,213,202,0.06)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(110,108,98,0.9)';
  // 频谱图轴刻度字号
  ctx.font = '10px "Spline Sans Mono", monospace';
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    const y = pad.t + ph * (1 - f);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
    ctx.fillText(`${Math.round(f * 100)}`, 20, y + 3);
  });
  ctx.fillText('kHz', 20, pad.t - 8);
  [0.5, 2, 4, 8].forEach((k) => {
    const x = pad.l + (Math.log2(k * 2) / Math.log2(32)) * pw;
    ctx.fillText(k >= 1 ? `${k}k` : '0.5k', x - 8, pad.t + ph + 16);
  });

  if (!state.specimen) {
    ctx.fillStyle = 'rgba(110,108,98,0.75)';
    ctx.font = '13px "WenYuan Serif SC VF", serif';
    ctx.fillText('在左侧选择一件声音化石标本，展开其频谱结构', pad.l + pw / 2 - 130, pad.t + ph / 2);
    return;
  }

  // 频谱柱
  const bw = pw / BINS;
  data.forEach((v, i) => {
    const x = pad.l + i * bw;
    const h = v * ph;
    ctx.fillStyle = `rgba(111,192,160,${0.55 + v * 0.4})`;
    ctx.fillRect(x + 0.5, pad.t + ph - h, Math.max(1, bw - 1.2), h);
  });

  // 主频标注线
  const mainF = 0.18 + (SPECIMENS.indexOf(state.specimen) / SPECIMENS.length) * 0.5;
  const mx = pad.l + mainF * pw;
  ctx.strokeStyle = 'rgba(212,160,64,0.6)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(212,160,64,0.9)';
  ctx.font = '600 10px "Spline Sans Mono", monospace';
  const label = `${(mainF * 16).toFixed(2)} kHz 主频`;
  ctx.fillText(label, Math.min(mx + 6, pad.l + pw - 74), pad.t + 12);

  // 悬停读数
  if (state.hoverBin != null) {
    const i = state.hoverBin;
    const x = pad.l + i * bw + bw / 2;
    ctx.strokeStyle = 'rgba(216,213,202,0.2)';
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
    const val = data[i];
    const fq = (i / BINS) * 16;
    $('spectrumReadout').textContent = `${fq.toFixed(2)} kHz · ${Math.round(val * 100)} %`;
  }
}

specCanvas.addEventListener('pointermove', (e) => {
  if (!state.specimen) return;
  const r = specCanvas.getBoundingClientRect();
  const pad = { l: 44, r: 16 };
  const rel = (e.clientX - r.left - pad.l) / (r.width - pad.l - pad.r);
  state.hoverBin = clamp(Math.round(rel * BINS), 0, BINS - 1);
  drawSpectrum();
});
specCanvas.addEventListener('pointerleave', () => {
  state.hoverBin = null;
  $('spectrumReadout').textContent = '悬停查看频点';
  drawSpectrum();
});

// 频谱呼吸动画（播放中）
function spectrumLoop(t) {
  if (state.playing && state.specimen) {
    drawSpectrum(t / 1000);
  }
  requestAnimationFrame(spectrumLoop);
}

/* ═══ 载入 / 标记 ═══ */
$('loadBtn').addEventListener('click', () => {
  state.bench = state.specimen;
  state.t = 0;
  updateBench();
  toast(`已载入分析台：${state.specimen.name}`);
});
$('pinBtn').addEventListener('click', () => {
  toast(`${state.specimen.name} 已标记为待注固样本`);
});

function updateBench() {
  const sp = state.bench;
  $('timeTotal').textContent = sp ? fmtTime(durationOf(sp)) : '00:00';
  $('timeNow').textContent = '00:00';
  if (!sp) return;
}

function durationOf(sp) {
  // 有机时长：由修复度决定（%）
  return 140 + Math.round(sp.meta[3][1].replace(' %', '') * 1.4);
}
function fmtTime(s) {
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/* ═══ 播放 ═══ */
let lastTick = null;
function playLoop(ts) {
  if (lastTick == null) lastTick = ts;
  const dt = (ts - lastTick) / 1000;
  lastTick = ts;
  if (state.playing && state.bench) {
    const speed = stretchSpeed();
    state.t += (dt * speed) / durationOf(state.bench);
    if (state.t >= 1) { state.t = 1; setPlaying(false); }
    updateScrub();
  }
  requestAnimationFrame(playLoop);
}
function stretchSpeed() {
  // 时间伸缩 0.5..2.0
  return 0.5 + state.stretch * 1.5;
}

function setPlaying(v) {
  state.playing = v;
  $('playIcon').className = v ? 'ti ti-player-pause-filled' : 'ti ti-player-play-filled';
  $('playBtn').setAttribute('aria-label', v ? '暂停' : '播放重建声音');
  if (!v) drawSpectrum();
}

$('playBtn').addEventListener('click', () => {
  if (!state.bench) {
    toast('请先选择化石并载入分析台');
    return;
  }
  if (state.t >= 1) state.t = 0;
  setPlaying(!state.playing);
  if (state.playing) toast(`重建播放：${state.bench.name}（合成监听）`);
});

function updateScrub() {
  const pct = state.t * 100;
  $('scrubFill').style.width = pct + '%';
  $('scrubKnob').style.left = pct + '%';
  $('scrubBar').setAttribute('aria-valuenow', Math.round(pct));
  if (state.bench) $('timeNow').textContent = fmtTime(state.t * durationOf(state.bench));
}

const scrubBar = $('scrubBar');
function scrubTo(clientX) {
  if (!state.bench) return;
  const r = scrubBar.getBoundingClientRect();
  state.t = clamp((clientX - r.left) / r.width, 0, 1);
  updateScrub();
}
scrubBar.addEventListener('pointerdown', (e) => {
  scrubTo(e.clientX);
  scrubBar.setPointerCapture(e.pointerId);
  scrubBar.dataset.scrubbing = '1';
});
scrubBar.addEventListener('pointermove', (e) => {
  if (scrubBar.dataset.scrubbing) scrubTo(e.clientX);
});
scrubBar.addEventListener('pointerup', () => { delete scrubBar.dataset.scrubbing; });
scrubBar.addEventListener('keydown', (e) => {
  if (!state.bench) return;
  if (e.key === 'ArrowRight') { state.t = clamp(state.t + 0.02, 0, 1); updateScrub(); }
  if (e.key === 'ArrowLeft') { state.t = clamp(state.t - 0.02, 0, 1); updateScrub(); }
});

$('volSlider').addEventListener('input', (e) => {
  state.volume = e.target.value / 100;
});

/* ═══ 参数 ═══ */
const params = [
  { id: 'pCutoff', out: 'vCutoff', get: (v) => `${(0.3 + (v / 100) * 7.7).toFixed(1)} kHz`, set: (v) => { state.cutoff = v / 100; } },
  { id: 'pStretch', out: 'vStretch', get: (v) => `×${(0.5 + (v / 100) * 1.5).toFixed(2)}`, set: (v) => { state.stretch = v / 100; } },
  { id: 'pGain', out: 'vGain', get: (v) => `${((v - 50) / 50 * 12).toFixed(1)} dB`, set: (v) => { state.gain = (v - 50) / 50; } },
];
params.forEach((p) => {
  const el = $(p.id);
  const apply = () => {
    $(p.out).textContent = p.get(+el.value);
    p.set(+el.value);
  };
  el.addEventListener('input', apply);
  apply();
});

/* ═══ 导出 ═══ */
$('exportBtn').addEventListener('click', () => {
  if (!state.bench) { toast('分析台尚未载入化石切片'); return; }
  toast(`「${state.bench.name}」切片已存入出站队列（本地暂存）`);
});

/* ═══ 帮助 ═══ */
$('helpBtn').addEventListener('click', () => toast('拖动地层穿越年代，点击化石展开频谱并载入分析台'));

/* ═══ 时钟 ═══ */
function tickClock() {
  const d = new Date();
  $('clockChip').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
setInterval(tickClock, 15000);
tickClock();

/* ═══ 布局与循环 ═══ */
function resizeAll() {
  resizeStrata();
  resizeSpectrum();
  drawStrata(state.depth);
  drawSpectrum();
}
window.addEventListener('resize', resizeAll);

renderLegend();
renderSpecimens();
renderLogs();
resizeAll();
updateStratumUI();
updateBench();
requestAnimationFrame(strataLoop);
requestAnimationFrame(playLoop);
requestAnimationFrame(spectrumLoop);
