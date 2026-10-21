/* ============================================================
   望云里 402 · 家居控制
   2.5D 建筑沙盘：几何投影 / 场景绘制
   ============================================================ */
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const A = 0.8660254, B = 0.5;
const R2 = 1.2247, R2Y = 0.7071;

/* 平面坐标 (cm) + 层高 z → 屏幕坐标 */
const F = (x, y, z = 0) => [(x - y) * A, (x + y) * B - z];
const r1 = (v) => Math.round(v * 10) / 10;

const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- 空间 ---------------- */
const ROOMS = [
  { id: 'living',  name: '客厅', icon: 'ti-sofa',            rect: [15, 15, 743, 413],  label: [598, 156] },
  { id: 'kitchen', name: '厨房', icon: 'ti-tools-kitchen-2', rect: [770, 15, 395, 413], label: [872, 392] },
  { id: 'master',  name: '主卧', icon: 'ti-bed',             rect: [15, 440, 443, 405], label: [398, 716] },
  { id: 'hall',    name: '玄关', icon: 'ti-door-enter',      rect: [470, 440, 288, 178], label: [612, 566] },
  { id: 'bath',    name: '卫浴', icon: 'ti-bath',            rect: [470, 630, 288, 215], label: [600, 762] },
  { id: 'study',   name: '书房', icon: 'ti-books',           rect: [770, 440, 395, 405], label: [884, 704] },
];
const ROOM = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
const areaOf = (r) => (r.rect[2] * r.rect[3]) / 10000;

/* ---------------- 设备 ---------------- */
const DEVICES = [
  /* 客厅 */
  { id: 'liv_main',    room: 'living',  name: '主灯',     type: 'light',   icon: 'ti-bulb',      on: true,  bri: 78, ct: 3000, ceil: true },
  { id: 'liv_floor',   room: 'living',  name: '落地灯',   type: 'light',   icon: 'ti-lamp',      on: true,  bri: 46, ct: 2400 },
  { id: 'liv_curtain', room: 'living',  name: '窗帘',     type: 'curtain', icon: 'ti-window',    pos: 70 },
  { id: 'liv_tv',      room: 'living',  name: '电视',     type: 'media',   icon: 'ti-device-tv', on: false, vol: 24 },
  { id: 'liv_ac',      room: 'living',  name: '空调',     type: 'ac',      icon: 'ti-snowflake', on: true,  temp: 24, mode: 'cool', fan: 1 },
  { id: 'liv_pur',     room: 'living',  name: '空气净化器', type: 'purifier', icon: 'ti-wind',   on: true,  fan: 1 },
  /* 厨房 */
  { id: 'kit_main',    room: 'kitchen', name: '吊灯',     type: 'light',   icon: 'ti-bulb',      on: true,  bri: 70, ct: 3200, ceil: true },
  { id: 'kit_fridge',  room: 'kitchen', name: '冰箱',     type: 'appliance', icon: 'ti-fridge',  on: true,  note: '4°C' },
  { id: 'kit_oven',    room: 'kitchen', name: '蒸烤箱',   type: 'appliance', icon: 'ti-microwave', on: false, note: '待机' },
  { id: 'kit_coffee',  room: 'kitchen', name: '咖啡机',   type: 'appliance', icon: 'ti-coffee',  on: true,  note: '保温' },
  { id: 'kit_feeder',  room: 'kitchen', name: '喂猫机',   type: 'feeder',  icon: 'ti-bone',      level: 62, lastFeed: 0 },
  /* 主卧 */
  { id: 'bed_main',    room: 'master',  name: '主灯',     type: 'light',   icon: 'ti-bulb',      on: false, bri: 60, ct: 3000, ceil: true },
  { id: 'bed_lamp',    room: 'master',  name: '床头灯',   type: 'light',   icon: 'ti-lamp',      on: true,  bri: 32, ct: 2300 },
  { id: 'bed_curtain', room: 'master',  name: '窗帘',     type: 'curtain', icon: 'ti-window',    pos: 0 },
  { id: 'bed_ac',      room: 'master',  name: '空调',     type: 'ac',      icon: 'ti-snowflake', on: false, temp: 26, mode: 'cool', fan: 0 },
  { id: 'bed_hum',     room: 'master',  name: '加湿器',   type: 'humidifier', icon: 'ti-droplets', offline: true, on: false },
  /* 书房 */
  { id: 'study_main',  room: 'study',   name: '主灯',     type: 'light',   icon: 'ti-bulb',      on: false, bri: 55, ct: 3400, ceil: true },
  { id: 'study_lamp',  room: 'study',   name: '台灯',     type: 'light',   icon: 'ti-lamp',      on: true,  bri: 58, ct: 3000 },
  { id: 'study_spk',   room: 'study',   name: '音箱',     type: 'media',   icon: 'ti-volume',    on: false, vol: 18 },
  /* 卫浴 */
  { id: 'bath_main',   room: 'bath',    name: '镜灯',     type: 'light',   icon: 'ti-bulb',      on: false, bri: 50, ct: 3400, ceil: true },
  { id: 'bath_heat',   room: 'bath',    name: '浴霸',     type: 'heater',  icon: 'ti-flame',     on: false, mode: 'warm' },
  { id: 'bath_water',  room: 'bath',    name: '热水器',   type: 'appliance', icon: 'ti-droplet', on: true,  temp: 48, note: '48°C' },
  /* 玄关 */
  { id: 'hall_main',   room: 'hall',    name: '筒灯',     type: 'light',   icon: 'ti-bulb',      on: true,  bri: 40, ct: 3000, ceil: true },
  { id: 'hall_lock',   room: 'hall',    name: '门锁',     type: 'lock',    icon: 'ti-lock',      locked: true },
  { id: 'hall_robot',  room: 'hall',    name: '扫地机',   type: 'robot',   icon: 'ti-robot' },
];
const DEV = Object.fromEntries(DEVICES.map((d) => [d.id, d]));

/* 模型上的定位点（平面 cm，z 为离地高度） */
const MP = {
  liv_main: [370, 196, 0], liv_floor: [96, 304, 122], liv_curtain: [398, 22, 176],
  liv_tv: [305, 384, 46], liv_ac: [718, 26, 182],
  kit_main: [935, 246, 0], kit_feeder: [1128, 395, 30],
  bed_main: [250, 640, 0], bed_lamp: [92, 492, 48], bed_curtain: [24, 640, 176],
  bed_ac: [28, 520, 182], bed_hum: [400, 706, 34],
  study_main: [960, 700, 0], study_lamp: [1118, 484, 54],
  bath_main: [722, 690, 52], bath_heat: [566, 700, 62],
  hall_main: [600, 520, 0], hall_lock: [756, 508, 58], hall_robot: [514, 474, 14],
};

/* 只有这些设备在沙盘上出图标（灯用光点） */
const ICON_MK = ['liv_curtain', 'liv_tv', 'liv_ac', 'kit_feeder', 'bed_curtain', 'bed_ac', 'hall_lock', 'hall_robot', 'bed_hum'];

/* 灯池半径 */
const POOL = { liv_main: 176, liv_floor: 118, kit_main: 142, bed_main: 156, bed_lamp: 92, study_main: 142, study_lamp: 96, bath_main: 96, hall_main: 108 };

/* ---------------- 场景 ---------------- */
const SCENES = [
  { id: 'home', name: '回家', icon: 'ti-home', patch: {
    liv_main: { on: true, bri: 78 }, liv_floor: { on: true, bri: 46 }, liv_curtain: { pos: 100 },
    liv_ac: { on: true, temp: 24 }, liv_tv: { on: false }, kit_main: { on: true },
    kit_coffee: { on: true }, hall_main: { on: true, bri: 40 }, hall_lock: { locked: true },
    bed_main: { on: false }, study_lamp: { on: true },
  } },
  { id: 'away', name: '离家', icon: 'ti-door-exit', patch: {
    '*lights': { on: false }, liv_curtain: { pos: 0 }, bed_curtain: { pos: 0 },
    liv_ac: { on: false }, bed_ac: { on: false }, liv_tv: { on: false }, study_spk: { on: false },
    hall_lock: { locked: true },
  } },
  { id: 'cinema', name: '影院', icon: 'ti-movie', patch: {
    liv_main: { on: false }, liv_floor: { on: true, bri: 18, ct: 2300 }, liv_tv: { on: true, vol: 32 },
    liv_curtain: { pos: 0 }, kit_main: { on: false }, study_lamp: { on: false }, study_main: { on: false },
    hall_main: { on: false }, bath_main: { on: false }, liv_ac: { on: true, temp: 24 },
  } },
  { id: 'read', name: '阅读', icon: 'ti-book', patch: {
    liv_main: { on: false }, liv_floor: { on: true, bri: 72, ct: 2700 }, liv_curtain: { pos: 62 },
    liv_tv: { on: false }, study_lamp: { on: true, bri: 80 }, study_main: { on: true, bri: 34 },
  } },
  { id: 'sleep', name: '睡眠', icon: 'ti-moon', patch: {
    '*lights': { on: false }, bed_lamp: { on: true, bri: 9, ct: 2300 }, hall_main: { on: true, bri: 8 },
    bed_curtain: { pos: 0 }, bed_ac: { on: true, temp: 26 }, liv_tv: { on: false },
  } },
];
const SCENE = Object.fromEntries(SCENES.map((s) => [s.id, s]));

/* ---------------- 材质 ---------------- */
const K = {
  top: '#FBF6EC', side: '#CFC2A6', front: '#B4A484',
  wTop: '#FCF8EF', wSide: '#EADFCB', wFront: '#D3C5A9',
  softT: '#FAF5E9', softS: '#D6C9AC', softF: '#BCAD8B',
  woodT: '#E0C69E', woodS: '#C09F6E', woodF: '#9E7B4A',
  darkT: '#4C524B', darkS: '#38403A', darkF: '#2A302B',
  metal: '#C7C1B1', glass: '#9FAEA6', plant: '#84937B',
};

/* ---------------- SVG 原语 ---------------- */
function add(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function poly(g, pts, fill, extra) {
  return add('polygon', Object.assign({
    points: pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' '),
    fill, stroke: fill, 'stroke-width': .6, 'stroke-linejoin': 'round',
  }, extra || {}), g);
}
/* 平面矩形（平行地面） */
function pl(g, x, y, w, d, z, fill, extra) {
  return poly(g, [F(x, y, z), F(x + w, y, z), F(x + w, y + d, z), F(x, y + d, z)], fill, extra);
}
/* 地面纹理线：dir='x' 沿 x 排（横板），dir='y' 沿 y 排 */
function grain(g, x, y, w, d, gap, dir, stroke, z) {
  const zz = z == null ? .18 : z;
  const pts = [];
  if (dir === 'x') {
    for (let yy = y + gap; yy < y + d - 1; yy += gap) {
      const a = F(x, yy, zz), b = F(x + w, yy, zz);
      pts.push('M' + r1(a[0]) + ' ' + r1(a[1]) + 'L' + r1(b[0]) + ' ' + r1(b[1]));
    }
  } else {
    for (let xx = x + gap; xx < x + w - 1; xx += gap) {
      const a = F(xx, y, zz), b = F(xx, y + d, zz);
      pts.push('M' + r1(a[0]) + ' ' + r1(a[1]) + 'L' + r1(b[0]) + ' ' + r1(b[1]));
    }
  }
  if (!pts.length) return null;
  return add('path', { d: pts.join(''), fill: 'none', stroke, 'stroke-width': 2.4 }, g);
}
/* 方盒：面朝相机的两个立面：x=x2 / y=y2 */
const EDGE = 'rgba(48,40,28,.28)';
function bx(g, x, y, w, d, z, h, o) {
  o = o || {};
  const t = o.top || K.top, s = o.side || K.side, f = o.front || K.front;
  const x2 = x + w, y2 = y + d, zt = z + h;
  const ln = o.line === false ? null : (o.line || EDGE);
  const ex = ln ? { stroke: ln, 'stroke-width': 3 } : null;
  /* 落地投影 */
  if (o.sh !== false && z < 30) {
    poly(g, [F(x + 3, y + 3, z + .2), F(x2 + 3, y + 3, z + .2), F(x2 + 3, y2 + 3, z + .2), F(x + 3, y2 + 3, z + .2)], 'rgba(104,86,56,.10)');
    poly(g, [F(x + 9, y + 9, z + .15), F(x2 + 9, y + 9, z + .15), F(x2 + 9, y2 + 9, z + .15), F(x + 9, y2 + 9, z + .15)], 'rgba(104,86,56,.06)');
  }
  poly(g, [F(x, y, zt), F(x2, y, zt), F(x2, y2, zt), F(x, y2, zt)], t, ex);
  poly(g, [F(x2, y, zt), F(x2, y2, zt), F(x2, y2, z), F(x2, y, z)], s, ex);
  poly(g, [F(x2, y2, zt), F(x, y2, zt), F(x, y2, z), F(x2, y2, z)], f, ex);
}
/* 圆柱 */
function cy(g, cx, cyy, r, z, h, o) {
  o = o || {};
  const p = F(cx, cyy, z), rx = R2 * r, ry = R2Y * r;
  const s = o.side || K.metal, t = o.top || s;
  const ex = { stroke: o.line || EDGE, 'stroke-width': 2.4 };
  add('ellipse', { cx: r1(p[0]), cy: r1(p[1]), rx: r1(rx), ry: r1(ry), fill: s, stroke: ex.stroke, 'stroke-width': 2.4 }, g);
  add('rect', { x: r1(p[0] - rx), y: r1(p[1] - h), width: r1(rx * 2), height: h, fill: s }, g);
  add('ellipse', { cx: r1(p[0]), cy: r1(p[1] - h), rx: r1(rx), ry: r1(ry), fill: t, stroke: ex.stroke, 'stroke-width': 2.4 }, g);
}

/* ============================================================
   构建
   ============================================================ */
const scene = $('#scene');
const modelEl = $('#model');
const canvasEl = $('#canvas');
const markersEl = $('#markers');

let root, gFloor, gPools, gWalls, gFurn, gNear, gTrail, gZones;
let vb = { x: 0, y: 0, w: 1, h: 1 };
const poolEls = {};
const washEls = {};
const roomGroup = {};

function defs(svg) {
  const d = add('defs', {}, svg);

  /* 沙盘投影 */
  const sh = add('filter', { id: 'fShadow', x: '-40%', y: '-40%', width: '180%', height: '180%' }, d);
  add('feGaussianBlur', { stdDeviation: 26 }, sh);

  /* 灯池 */
  const pg = add('radialGradient', { id: 'gPool' }, d);
  add('stop', { offset: '0', 'stop-color': '#FFE7BE', 'stop-opacity': '.62' }, pg);
  add('stop', { offset: '.42', 'stop-color': '#FFDCAA', 'stop-opacity': '.34' }, pg);
  add('stop', { offset: '.76', 'stop-color': '#FFE6C4', 'stop-opacity': '.12' }, pg);
  add('stop', { offset: '1', 'stop-color': '#FFF0D8', 'stop-opacity': '0' }, pg);

  const tg = add('radialGradient', { id: 'gScreen' }, d);
  add('stop', { offset: '0', 'stop-color': '#A8C2CE', 'stop-opacity': '.5' }, tg);
  add('stop', { offset: '1', 'stop-color': '#BCD0D8', 'stop-opacity': '0' }, tg);

  /* 窗帘褶 */
  const pl2 = add('linearGradient', { id: 'gPleat', gradientUnits: 'userSpaceOnUse', x1: '0', y1: '0', x2: '11', y2: '0', spreadMethod: 'repeat' }, d);
  add('stop', { offset: '0', 'stop-color': '#F1EAD9' }, pl2);
  add('stop', { offset: '.46', 'stop-color': '#DBD2BB' }, pl2);
  add('stop', { offset: '.54', 'stop-color': '#D5CBB2' }, pl2);
  add('stop', { offset: '1', 'stop-color': '#F1EAD9' }, pl2);

  /* 窗 */
  const wg = add('linearGradient', { id: 'gWin', x1: '0', y1: '0', x2: '0', y2: '1' }, d);
  add('stop', { offset: '0', 'stop-color': '#5C6A64' }, wg);
  add('stop', { offset: '1', 'stop-color': '#79867E' }, wg);

  /* 墙立面（上亮下暗，用于贴墙的竖面） */
  const wi = add('linearGradient', { id: 'gWallIn', gradientUnits: 'userSpaceOnUse', x1: '0', y1: '-152', x2: '0', y2: '0' }, d);
  add('stop', { offset: '0', 'stop-color': '#F5EFE1' }, wi);
  add('stop', { offset: '.42', 'stop-color': '#E0D7C3' }, wi);
  add('stop', { offset: '1', 'stop-color': '#B7AC93' }, wi);
  const wo = add('linearGradient', { id: 'gWallOut', gradientUnits: 'userSpaceOnUse', x1: '0', y1: '-152', x2: '0', y2: '0' }, d);
  add('stop', { offset: '0', 'stop-color': '#E8E1D1' }, wo);
  add('stop', { offset: '1', 'stop-color': '#C2B9A4' }, wo);

  /* 墙脚投影（沿 y 方向淡出） */
  const b1 = add('linearGradient', { id: 'gBandN', gradientUnits: 'userSpaceOnUse', x1: '-13', y1: '7.5', x2: '-73.6', y2: '42.5' }, d);
  add('stop', { offset: '0', 'stop-color': '#8A7A5E', 'stop-opacity': '.30' }, b1);
  add('stop', { offset: '1', 'stop-color': '#8A7A5E', 'stop-opacity': '0' }, b1);
  const b2 = add('linearGradient', { id: 'gBandW', gradientUnits: 'userSpaceOnUse', x1: '13', y1: '7.5', x2: '73.6', y2: '42.5' }, d);
  add('stop', { offset: '0', 'stop-color': '#8A7A5E', 'stop-opacity': '.26' }, b2);
  add('stop', { offset: '1', 'stop-color': '#8A7A5E', 'stop-opacity': '0' }, b2);
}

function build() {
  scene.textContent = '';
  defs(scene);

  root = add('g', { id: 'mRoot' }, scene);
  const shadow = add('g', { id: 'mShadow' }, root);
  const slab = add('g', { id: 'mSlab' }, root);
  gFloor = add('g', { id: 'mFloor' }, root);
  gPools = add('g', { id: 'mPools' }, root);
  gWalls = add('g', { id: 'mWalls' }, root);
  gFurn = add('g', { id: 'mFurn' }, root);
  gNear = add('g', { id: 'mNear' }, root);
  gTrail = add('g', { id: 'mTrail' }, root);
  gZones = add('g', { id: 'mZones' }, root);

  /* 落在地面上的柔和投影 */
  const shp = add('polygon', {
    points: [F(-30, -30, -22), F(1210, -30, -22), F(1210, 890, -22), F(-30, 890, -22)]
      .map((p) => r1(p[0]) + ',' + r1(p[1])).join(' '),
    fill: '#000', opacity: '.30', filter: 'url(#fShadow)',
  }, shadow);
  shp.setAttribute('transform', 'translate(0,26)');

  /* 底板 */
  bx(slab, -16, -16, 1212, 892, -22, 22, { top: '#EDE5D2', side: '#B0A692', front: '#9A907B', sh: false, line: 'rgba(56,48,36,.30)' });

  /* 地面分区 */
  const FLOOR = {
    living: '#E9E0C9', kitchen: '#E4E1D4', master: '#E7DEC6',
    hall: '#EBE3CC', bath: '#DFDCD4', study: '#E6DEC7',
  };
  ROOMS.forEach((r) => {
    const [x, y, w, d] = r.rect;
    pl(gFloor, x, y, w, d, 0, FLOOR[r.id] || '#E8DCC0');
    pl(gFloor, x, y, w, d, .1, 'none', { stroke: 'rgba(118,106,84,.26)', 'stroke-width': 2 });
  });
  /* 地面材质 */
  grain(gFloor, 15, 15, 743, 413, 28, 'y', 'rgba(112,98,74,.13)');
  grain(gFloor, 15, 440, 443, 405, 28, 'y', 'rgba(112,98,74,.13)');
  grain(gFloor, 770, 440, 395, 405, 28, 'y', 'rgba(112,98,74,.13)');
  grain(gFloor, 770, 15, 395, 413, 46, 'x', 'rgba(108,96,74,.11)');
  grain(gFloor, 470, 440, 288, 178, 40, 'y', 'rgba(108,96,74,.10)');
  grain(gFloor, 470, 630, 288, 215, 38, 'x', 'rgba(108,96,74,.13)');
  grain(gFloor, 470, 630, 288, 215, 38, 'y', 'rgba(108,96,74,.13)');
  /* 墙面在地面上的落影 */
  pl(gFloor, 15, 15, 1150, 76, .3, 'url(#gBandN)');
  pl(gFloor, 15, 15, 76, 830, .3, 'url(#gBandW)');

  /* 选中/悬停底色 */
  add('g', { id: 'mWash' }, gFloor);
  ROOMS.forEach((r) => {
    const [x, y, w, d] = r.rect;
    washEls[r.id] = pl($('#mWash'), x, y, w, d, .2, 'transparent', { class: 'zone-wash' });
  });

  /* 灯池 */
  DEVICES.forEach((d) => {
    const rad = POOL[d.id];
    if (!rad) return;
    const [mx, my] = MP[d.id];
    const p = F(mx, my, 0), rx = R2 * rad, ry = R2Y * rad;
    poolEls[d.id] = add('ellipse', { cx: r1(p[0]), cy: r1(p[1]), rx: r1(rx), ry: r1(ry), fill: 'url(#gPool)', opacity: 0 }, gPools);
  });
  /* 电视光 */
  {
    const p = F(305, 300, 0);
    poolEls.__tv = add('ellipse', { cx: r1(p[0]), cy: r1(p[1]), rx: r1(R2 * 210), ry: r1(R2Y * 210), fill: 'url(#gScreen)', opacity: 0 }, gPools);
  }

  /* 窗 */
  drawWalls(gWalls);

  /* 家具（分房间成组，便于淡化非选中空间） */
  ROOMS.forEach((r) => {
    const g = add('g', { class: 'room-g', 'data-room': r.id }, gFurn);
    roomGroup[r.id] = g;
    (FURN[r.id] || (() => {}))(g);
  });

  /* 近侧矮墙 */
  bx(gNear, 15, 845, 1150, 15, 0, 22, { top: K.wTop, side: K.wSide, front: K.wFront });
  bx(gNear, 1165, 15, 15, 830, 0, 22, { top: K.wTop, side: K.wSide, front: K.wFront });

  /* 扫地机轨迹 */
  trailBase = add('path', { fill: 'none', stroke: 'rgba(96,80,56,.16)', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTrail);
  trailLive = add('path', { fill: 'none', stroke: 'rgba(120,96,60,.42)', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTrail);

  /* 房间热区（最上层，透明） */
  ROOMS.forEach((r) => {
    const [x, y, w, d] = r.rect;
    const z = pl(gZones, x, y, w, d, 0, 'rgba(0,0,0,0)', { class: 'zone', 'data-act': 'room', 'data-id': r.id });
    z.setAttribute('stroke', 'none');
  });

  measure();
  fitModel();
}

var trailBase, trailLive;

/* ---------------- 投影 ---------------- */
function drawWalls(g) {
  const H = 150;

  /* 北墙：顶面 + 内立面 */
  pl(g, 0, 0, 1180, 15, H, '#FCFAF4');
  wallRect(g, 'n', 15, 0, 1180, 0, H, 'url(#gWallIn)');
  /* 西墙 */
  pl(g, 0, 0, 15, 860, H, '#FAF7EF');
  wallRect(g, 'w', 15, 0, 860, 0, H, 'url(#gWallIn)');
  /* 墙端封 */
  wallRect(g, 'w', 1180, 0, 15, 0, H, 'url(#gWallOut)');
  wallRect(g, 'n', 860, 0, 15, 0, H, 'url(#gWallOut)');

  /* 窗框 */
  wallRect(g, 'n', 15, 300, 480, 58, 126, 'url(#gWin)');
  wallRect(g, 'w', 15, 560, 720, 58, 126, 'url(#gWin)');
  /* 窗框 */
  wallRect(g, 'n', 15, 300, 480, 58, 126, 'none', { stroke: 'rgba(72,64,50,.30)', 'stroke-width': 4 });
  wallRect(g, 'w', 15, 560, 720, 58, 126, 'none', { stroke: 'rgba(72,64,50,.30)', 'stroke-width': 4 });

  /* 墙上空调 */
  acUnit(g, 'n', 690, 60, 100, 28, 'liv_ac');
  acUnit(g, 'w', 490, 60, 100, 28, 'bed_ac');

  /* 窗帘 */
  curtain(g, 'liv_curtain', 'n', 15, 300, 480);
  curtain(g, 'bed_curtain', 'w', 15, 560, 720);
}

/* wall==='n' → 平面 y=at，u 为 x；wall==='w' → 平面 x=at，u 为 y */
function shearFor(wall, at) {
  return wall === 'n'
    ? 'matrix(' + A + ',' + B + ',0,1,' + r1(-A * at) + ',' + r1(B * at) + ')'
    : 'matrix(' + (-A) + ',' + B + ',0,1,' + r1(A * at) + ',' + r1(B * at) + ')';
}
function wallRect(g, wall, at, u0, u1, z0, z1, fill, extra) {
  const gg = add('g', { transform: shearFor(wall, at) }, g);
  return add('rect', Object.assign({
    x: r1(u0), y: r1(-z1), width: r1(u1 - u0), height: r1(z1 - z0), fill,
  }, extra || {}), gg);
}

/* ---------------- 墙上空调 ---------------- */
const acFlap = {};
function acUnit(g, wall, u0, w, z, h, id) {
  if (wall === 'n') {
    bx(g, u0, 15, w, 26, z, h, { top: '#FBF7EC', side: '#EDE6D5', front: '#DFD7C3' });
    const y2 = 41;
    acFlap[id] = poly(g, [F(u0, y2, z), F(u0 + w, y2, z), F(u0 + w, y2 + 17, z - 13), F(u0, y2 + 17, z - 13)],
      '#D4CDB9', { stroke: '#C6BFA9', 'stroke-width': .8 });
  } else {
    bx(g, 15, u0, 26, w, z, h, { top: '#FBF7EC', side: '#EDE6D5', front: '#DFD7C3' });
    const x2 = 41;
    acFlap[id] = poly(g, [F(x2, u0, z), F(x2, u0 + w, z), F(x2 + 17, u0 + w, z - 13), F(x2 + 17, u0, z - 13)],
      '#D4CDB9', { stroke: '#C6BFA9', 'stroke-width': .8 });
  }
}

/* ---------------- 窗帘 ---------------- */
const curtainRef = {};
function curtain(g, id, wall, at, u0, u1) {
  const gg = add('g', { transform: shearFor(wall, at) }, g);
  const zTop = 138, zBot = 8;
  const mk = () => add('rect', {
    y: r1(-zTop), height: r1(zTop - zBot), fill: 'url(#gPleat)',
    stroke: 'rgba(90,80,62,.20)', 'stroke-width': 2,
  }, gg);
  const l = mk(), rr = mk();
  curtainRef[id] = { l, rr, u0, u1 };
  setCurtain(id, DEV[id].pos);
}
function setCurtain(id, pos) {
  const c = curtainRef[id];
  if (!c) return;
  const W = c.u1 - c.u0;
  const pw = W * (0.5 - 0.375 * (pos / 100));
  c.l.setAttribute('x', r1(c.u0));
  c.l.setAttribute('width', r1(pw));
  c.rr.setAttribute('x', r1(c.u1 - pw));
  c.rr.setAttribute('width', r1(pw));
}

/* ---------------- 家具 ---------------- */
const FURN = {};

FURN.living = (g) => {
  pl(g, 120, 120, 430, 215, .6, '#D9CBA9');
  pl(g, 138, 136, 394, 183, .8, 'none', { stroke: 'rgba(146,120,80,.4)', 'stroke-width': 2.5 });
  /* 沙发：靠北，朝南 */
  bx(g, 150, 62, 300, 26, 0, 64, { top: K.softT, side: K.softS, front: K.softF });
  bx(g, 150, 88, 300, 90, 0, 42, { top: K.softT, side: K.softS, front: K.softF });
  bx(g, 150, 88, 28, 90, 0, 58, { top: K.softT, side: K.softS, front: K.softF });
  bx(g, 422, 88, 28, 90, 0, 58, { top: K.softT, side: K.softS, front: K.softF });
  bx(g, 178, 92, 122, 82, 42, 13, { top: '#F2ECDC', side: K.softS, front: K.softF });
  bx(g, 302, 92, 122, 82, 42, 13, { top: '#F2ECDC', side: K.softS, front: K.softF });
  /* 茶几 */
  bx(g, 218, 226, 150, 72, 0, 25, { top: K.woodT, side: K.woodS, front: K.woodF });
  cy(g, 268, 262, 22, 25, 4, { side: '#CFCFC4', top: '#E6E3D6' });
  /* 电视柜 + 屏 */
  bx(g, 170, 372, 270, 42, 0, 26, { top: K.top, side: K.side, front: K.front });
  bx(g, 200, 380, 210, 9, 26, 62, { top: K.darkT, side: K.darkS, front: '#232723' });
  /* 落地灯 */
  cy(g, 96, 330, 4, 0, 116, { side: '#B9B4A6', top: '#C7C2B4' });
  cy(g, 96, 330, 17, 112, 18, { side: '#EFE2C2', top: '#FBF1D6' });
  /* 边几 + 绿植 */
  bx(g, 470, 96, 62, 62, 0, 46, { top: K.woodT, side: K.woodS, front: K.woodF });
  cy(g, 700, 90, 17, 0, 22, { side: '#C2B49B', top: '#D8CBAC' });
  add('circle', { cx: r1(F(700, 90, 60)[0]), cy: r1(F(700, 90, 60)[1]), r: 30, fill: K.plant, opacity: '.9' }, g);
  add('circle', { cx: r1(F(686, 80, 76)[0]), cy: r1(F(686, 80, 76)[1]), r: 20, fill: '#9DAA94' }, g);
  add('circle', { cx: r1(F(714, 98, 74)[0]), cy: r1(F(714, 98, 74)[1]), r: 17, fill: '#82907B' }, g);
};

FURN.kitchen = (g) => {
  /* 北侧操作台 */
  bx(g, 782, 40, 330, 58, 0, 50, { top: '#EFE9DB', side: '#DFD7C4', front: '#D0C7B2' });
  bx(g, 782, 40, 330, 58, 50, 4, { top: '#F4EFE3', side: '#E6DECD', front: '#D8CFBB' });
  /* 咖啡机 / 蒸烤箱 */
  bx(g, 830, 52, 62, 40, 54, 30, { top: K.darkT, side: K.darkS, front: K.darkF });
  bx(g, 940, 54, 70, 36, 54, 26, { top: '#C8C3B5', side: '#B3AEA0', front: '#A29D90' });
  /* 中岛 */
  bx(g, 800, 168, 270, 92, 0, 46, { top: '#F1EBDE', side: '#E2DAC8', front: '#D3C9B4' });
  bx(g, 792, 160, 286, 108, 46, 5, { top: '#F6F1E5', side: '#E8E0CF', front: '#D9D0BB' });
  cy(g, 880, 214, 12, 51, 9, { side: '#D6D2C6', top: '#E7E3D7' });
  /* 冰箱 */
  bx(g, 1090, 44, 62, 70, 0, 132, { top: '#DCD6C7', side: '#C9C3B3', front: '#BAB4A4' });
  /* 餐桌 + 4 椅 */
  bx(g, 860, 254, 180, 84, 0, 38, { top: K.woodT, side: K.woodS, front: K.woodF });
  [[874, 218], [980, 218], [874, 342], [980, 342]].forEach(([cx, cyy]) => {
    bx(g, cx, cyy, 52, 48, 0, 28, { top: '#E9E2D0', side: '#DAD2BD', front: '#CBC2AA' });
    bx(g, cx + 4, cyy + 16, 44, 10, 28, 34, { top: '#E9E2D0', side: '#DAD2BD', front: '#CBC2AA' });
  });
  /* 喂猫机 */
  bx(g, 1105, 372, 46, 46, 0, 28, { top: '#E4DECE', side: '#D2CBB9', front: '#C2BBA7' });
  cy(g, 1128, 404, 13, 0, 8, { side: '#C9C3B4', top: '#DAD4C4' });
  feederFood = add('ellipse', { cx: r1(F(1128, 404, 8)[0]), cy: r1(F(1128, 404, 8)[1]), rx: r1(R2 * 9), ry: r1(R2Y * 9), fill: '#B98F5E', opacity: '.85' }, g);
};

var feederFood;

FURN.master = (g) => {
  /* 衣柜 */
  bx(g, 30, 540, 40, 240, 0, 112, { top: K.top, side: K.side, front: K.front });
  /* 床 */
  bx(g, 120, 462, 230, 18, 0, 88, { top: K.softT, side: K.softS, front: K.softF });
  bx(g, 120, 480, 230, 330, 0, 26, { top: '#E3DCC9', side: '#D3CBB6', front: '#C5BCA5' });
  bx(g, 126, 486, 218, 318, 26, 26, { top: '#F3EDDD', side: '#E4DCC8', front: '#D5CCB6' });
  bx(g, 126, 640, 218, 164, 52, 12, { top: '#EAE2CF', side: '#DCD3BE', front: '#CDC4AD' });
  bx(g, 146, 492, 82, 44, 52, 16, { top: '#F7F3E8', side: '#EAE3D3', front: '#DBD3BF' });
  bx(g, 240, 492, 82, 44, 52, 16, { top: '#F7F3E8', side: '#EAE3D3', front: '#DBD3BF' });
  /* 床头灯 + 柜 */
  bx(g, 70, 470, 44, 44, 0, 32, { top: K.woodT, side: K.woodS, front: K.woodF });
  cy(g, 92, 492, 5, 32, 8, { side: '#C8C3B5', top: '#D8D3C5' });
  cy(g, 92, 492, 11, 40, 10, { side: '#F0E4C6', top: '#FBF2D8' });
  bx(g, 356, 470, 44, 44, 0, 32, { top: K.woodT, side: K.woodS, front: K.woodF });
  /* 加湿器 */
  cy(g, 400, 706, 12, 0, 34, { side: '#E3DCCB', top: '#F1EBDC' });
};

FURN.study = (g) => {
  /* 书架 */
  bx(g, 782, 470, 44, 260, 0, 124, { top: K.top, side: K.side, front: K.front });
  [24, 58, 92].forEach((z) => {
    bx(g, 782, 472, 44, 256, z, 3, { top: '#E0D8C5', side: '#CFC7B3', front: '#C0B8A4' });
  });
  /* 书桌 */
  const books = [[480, 18, '#8D947F'], [502, 14, '#B9AC90'], [520, 20, '#7F8672'], [556, 16, '#C0B49A'],
    [578, 12, '#949B85'], [598, 18, '#A9A48C'], [626, 14, '#878E79'], [648, 20, '#BDB097']];
  books.forEach(([y0, w, c]) => {
    bx(g, 786, y0, 36, w, 27, 26, { top: c, side: c, front: c });
  });
  books.forEach(([y0, w, c]) => {
    bx(g, 786, y0, 36, w, 61, 24, { top: c, side: c, front: c });
  });
  /* 书桌 */
  bx(g, 990, 460, 160, 62, 0, 38, { top: K.woodT, side: K.woodS, front: K.woodF });
  bx(g, 996, 508, 148, 10, 0, 34, { top: '#E3DCCB', side: '#D4CCB7', front: '#C5BCA6' });
  /* 台灯 */
  cy(g, 1118, 484, 5, 38, 12, { side: '#BEB9AB', top: '#CFCABC' });
  cy(g, 1118, 484, 12, 50, 12, { side: '#EFE3C4', top: '#FAF1D7' });
  /* 浴缸 */
  bx(g, 1030, 540, 58, 55, 0, 26, { top: '#E7E0CE', side: '#D8D0BB', front: '#C9C0A8' });
  bx(g, 1030, 540, 58, 10, 26, 42, { top: '#E7E0CE', side: '#D8D0BB', front: '#C9C0A8' });
  /* 音箱 */
  bx(g, 1052, 500, 26, 22, 38, 12, { top: K.darkT, side: K.darkS, front: K.darkF });
};

FURN.bath = (g) => {
  /* 浴缸 */
  bx(g, 486, 646, 150, 92, 0, 42, { top: '#F1ECDF', side: '#E2DBCA', front: '#D3CBB7' });
  bx(g, 498, 658, 126, 68, 42, 4, { top: '#DCE7E2', side: '#CBD8D3', front: '#BBc9c4' });
  /* 台盆柜 */
  bx(g, 700, 640, 44, 120, 0, 48, { top: K.top, side: K.side, front: K.front });
  cy(g, 722, 686, 16, 48, 4, { top: '#E9EDE8', side: '#D6DCD6' });
  /* 马桶 */
  bx(g, 700, 790, 46, 44, 0, 34, { top: '#F4F1E8', side: '#E6E2D6', front: '#D7D3C5' });
};

FURN.hall = (g) => {
  /* 换鞋凳 */
  bx(g, 492, 452, 44, 44, 0, 16, { top: K.woodT, side: K.woodS, front: K.woodF });
  /* 边柜 */
  bx(g, 700, 448, 44, 130, 0, 78, { top: K.top, side: K.side, front: K.front });
  /* 地垫 */
  pl(g, 496, 500, 150, 96, .4, '#D9D2BF');
  pl(g, 504, 508, 134, 80, .6, '#E4DDCB');
};

/* ---------------- 视野 / 尺寸 ---------------- */
function measure() {
  const b = scene.getBBox();
  const pad = 6;
  vb = { x: b.x - pad, y: b.y - pad, w: b.width + pad * 2, h: b.height + pad * 2 };
  scene.setAttribute('viewBox', [r1(vb.x), r1(vb.y), r1(vb.w), r1(vb.h)].join(' '));
}
function fitModel() {
  const ca = canvasEl.getBoundingClientRect();
  if (!ca.width || !ca.height) return;
  const ar = vb.w / vb.h;
  let w = ca.width, h = w / ar;
  if (h > ca.height) { h = ca.height; w = h * ar; }
  const grow = 1.0;
  modelEl.style.width = Math.floor(w * grow) + 'px';
  modelEl.style.height = Math.floor(h * grow) + 'px';
  placeMarkers();
}
/* ============================================================
   标记 / 左栏 / 舞台头 / 底部卡片
   ============================================================ */
let botEl = null;

function buildMarkers() {
  markersEl.textContent = '';
  DEVICES.forEach((d) => {
    const mp = MP[d.id];
    if (!mp) return;
    const isLight = d.type === 'light';
    if (!isLight && !ICON_MK.includes(d.id)) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mk ' + (isLight ? 'mk-lamp' : 'mk-ic');
    b.dataset.id = d.id;
    b.dataset.act = 'marker';
    b.dataset.mpos = mp.join(',');
    b.innerHTML = isLight ? '<span class="halo"></span><span class="dot"></span>' : '<i class="ti ' + d.icon + '"></i>';
    b.dataset.tip = d.name;
    markersEl.appendChild(b);
  });

  botEl = document.createElement('button');
  botEl.type = 'button';
  botEl.className = 'mk mk-bot';
  botEl.dataset.act = 'marker';
  botEl.dataset.id = 'hall_robot';
  botEl.dataset.mpos = MP.hall_robot.join(',');
  botEl.dataset.tip = '扫地机';
  botEl.innerHTML = '<span class="ring"></span><span class="bot"></span>';
  markersEl.appendChild(botEl);

  /* 空间名称（不参与投影的直立标注） */
  const lab = document.createElement('div');
  lab.className = 'labels';
  ROOMS.forEach((r) => {
    const s = document.createElement('span');
    s.className = 'rlabel';
    s.dataset.room = r.id;
    s.dataset.mpos = r.label[0] + ',' + r.label[1] + ',0';
    s.textContent = r.name;
    lab.appendChild(s);
  });
  modelEl.appendChild(lab);
}

function placeMarkers() {
  const { x, y, w, h } = vb;
  if (!w || !h) return;
  modelEl.querySelectorAll('[data-mpos]').forEach((el) => {
    const mp = el.dataset.mpos.split(',').map(Number);
    el.style.left = ((F(mp[0], mp[1], mp[2])[0] - x) / w * 100).toFixed(3) + '%';
    el.style.top = ((F(mp[0], mp[1], mp[2])[1] - y) / h * 100).toFixed(3) + '%';
  });
}
function placeAt(el, x, y, z) {
  const { x: vx, y: vy, w, h } = vb;
  const p = F(x, y, z);
  el.style.left = ((p[0] - vx) / w * 100).toFixed(3) + '%';
  el.style.top = ((p[1] - vy) / h * 100).toFixed(3) + '%';
}

/* ---------------- 状态查询 ---------------- */
const devsOf = (id) => DEVICES.filter((d) => d.room === id);
function isOn(d) {
  switch (d.type) {
    case 'light': case 'media': case 'ac': case 'purifier':
    case 'appliance': case 'heater': return !!d.on;
    case 'curtain': return d.pos > 0;
    default: return false;
  }
}
const onCount = (id) => devsOf(id).filter(isOn).length;
const allOn = () => DEVICES.filter(isOn).length;

function powerW() {
  let w = 0;
  DEVICES.forEach((d) => {
    if (!d.on) return;
    if (d.type === 'light') w += 5 + d.bri * 0.14;
    else if (d.type === 'media') w += 85;
    else if (d.type === 'ac') w += d.mode === 'fan' ? 45 : d.mode === 'heat' ? 1380 : 1020;
    else if (d.type === 'purifier') w += 12 + d.fan * 16;
    else if (d.type === 'heater') w += 1180;
    else if (d.type === 'appliance') w += d.id === 'bath_water' ? 320 : d.id === 'kit_oven' ? 1750 : d.id === 'kit_coffee' ? 760 : 58;
  });
  if (S.robot.state === 'clean') w += 38;
  return Math.round(w);
}

/* ---------------- 时段主题 ---------------- */
const THEME_INFO = {
  dawn:  { name: '清晨', icon: 'ti-sunrise', pool: 0.5 },
  day:   { name: '白天', icon: 'ti-sun',     pool: 0.26 },
  dusk:  { name: '傍晚', icon: 'ti-sunset',  pool: 1.1 },
  night: { name: '夜晚', icon: 'ti-moon',    pool: 1.3 },
};
function themeAt(h) {
  if (h >= 5 && h < 9) return 'dawn';
  if (h >= 9 && h < 16.5) return 'day';
  if (h >= 16.5 && h < 19.5) return 'dusk';
  return 'night';
}
function curTheme() {
  return document.documentElement.dataset.theme || 'night';
}
function applyTheme() {
  const now = new Date();
  const t = themeAt(now.getHours() + now.getMinutes() / 60);
  const changed = document.documentElement.dataset.theme !== t;
  document.documentElement.dataset.theme = t;
  const el = $('#mTheme');
  if (el) {
    const info = THEME_INFO[t];
    el.innerHTML = '<i class="ti ' + info.icon + '"></i><b>' + info.name + '</b>';
  }
  if (changed && typeof syncModel === 'function' && poolEls && Object.keys(poolEls).length) syncModel();
}

/* ---------------- 左栏 ---------------- */
function buildRail() {
  $('#scenes').innerHTML = SCENES.map((s) => (
    '<button type="button" class="ritem" data-act="scene" data-id="' + s.id + '" title="' + s.name + '" aria-label="' + s.name + '">' +
    '<i class="ti ' + s.icon + '"></i><span class="ri-name">' + s.name + '</span><em></em></button>'
  )).join('');

  $('#rooms').innerHTML = ROOMS.map((r) => (
    '<button type="button" class="ritem" data-act="room" data-id="' + r.id + '" title="' + r.name + '" aria-label="' + r.name + '">' +
    '<span class="ri-top"><i class="ti ' + r.icon + '"></i><em></em></span>' +
    '<span class="ri-name">' + r.name + '</span></button>'
  )).join('');

  $('#energy').innerHTML =
    '<div class="en-text"><div class="en-num"><span id="enNum">4.12</span><s>kWh</s></div>' +
    '<div class="en-label">今日用电</div></div>' +
    '<div class="en-bars" id="enBars">' + '<i></i>'.repeat(7) + '</div>';

  document.querySelectorAll('#scenes .ritem, #rooms .ritem').forEach((el, i) => {
    el.style.animation = 'riseIn .46s cubic-bezier(.22,1,.36,1) both';
    el.style.animationDelay = (60 + i * 26) + 'ms';
  });
}

function syncRail() {
  ['scenes', 'rooms'].forEach((k) => {
    document.querySelectorAll('#' + k + ' .ritem').forEach((el) => {
      const id = el.dataset.id;
      const on = k === 'scenes' ? S.scene === id : S.room === id;
      el.classList.toggle('is-on', on);
      const em = el.querySelector('em');
      if (k === 'rooms') {
        em.textContent = onCount(id) + '/' + devsOf(id).length;
      } else {
        const n = Object.keys(SCENE[id].patch).reduce((acc, key) => (
          acc + (key === '*lights' ? DEVICES.filter((d) => d.type === 'light').length : 1)), 0);
        em.textContent = n;
      }
    });
  });
  const allBtn = document.querySelector('.rail-all');
  if (allBtn) allBtn.classList.toggle('is-on', S.room === 'all');

  const p = powerW();
  const kwh = 2.86 + p / 1000 * 2.7;
  $('#enNum').textContent = kwh.toFixed(2);
  const bars = $('#enBars').children;
  const base = [.42, .55, .38, .66, .5, .58];
  const now = Math.min(.92, .18 + p / 2600);
  for (let i = 0; i < 7; i++) {
    const v = i < 6 ? base[i] : now;
    bars[i].style.height = Math.round(6 + v * 26) + 'px';
  }
  $('#mNet').innerHTML = '<i class="dot"></i><b>' + (DEVICES.length - DEVICES.filter((d) => d.offline).length) +
    '</b><s>/ ' + DEVICES.length + ' 在线</s>';
}

/* ---------------- 舞台头 ---------------- */
function syncHead() {
  const r = S.room === 'all' ? null : ROOM[S.room];
  $('#shTitle').textContent = r ? r.name : '全屋';
  const area = r ? areaOf(r) : ROOMS.reduce((a, x) => a + areaOf(x), 0);
  const on = r ? onCount(r.id) : allOn();
  const total = r ? devsOf(r.id).length : DEVICES.length;
  $('#shSub').textContent = area.toFixed(1) + ' m² · ' + on + '/' + total + ' 运行';

  const lights = (r ? devsOf(r.id) : DEVICES).filter((d) => d.type === 'light' && d.on).length;
  const acs = (r ? devsOf(r.id) : DEVICES).filter((d) => d.type === 'ac' && d.on);
  let html = '<span class="chip"><i class="ti ti-bulb"></i><b>' + lights + '</b></span>';
  if (S.robot.state === 'clean') {
    html += '<span class="chip is-live"><i class="ti ti-robot"></i><b>' + Math.round(S.robot.t * 100) + '%</b></span>';
  } else if (acs.length) {
    html += '<span class="chip is-live"><i class="ti ti-snowflake"></i><b>' + acs[0].temp + '°</b></span>';
  } else {
    html += '<span class="chip"><i class="ti ti-snowflake"></i><b>' + DEV.liv_ac.temp + '°</b></span>';
  }
  $('#shRight').innerHTML = html;
}

/* ---------------- 底部卡片 ---------------- */
function buildDock() {
  $('#dock').innerHTML =
    '<article class="card" id="cardBot">' +
      '<div class="card-top"><i class="card-ic ti ti-robot"></i><span class="card-name">扫地机</span>' +
        '<div class="card-acts">' +
          '<button type="button" class="ibtn" id="botPlay" data-act="robot:start" aria-label="清扫"><i class="ti ti-player-play"></i></button>' +
          '<button type="button" class="ibtn" id="botDock" data-act="robot:dock" aria-label="回充"><i class="ti ti-bolt"></i></button>' +
        '</div></div>' +
      '<div class="card-mid"><span class="bignum" id="botPct">0<s>%</s></span>' +
        '<span class="card-note" id="botState"></span></div>' +
      '<div class="card-foot"><span>电量 <b id="botBat">82%</b></span><span>已扫 <b id="botArea">0.0</b> m²</span></div>' +
    '</article>' +
    '<article class="card" id="cardFeed">' +
      '<div class="card-top"><i class="card-ic ti ti-bone"></i><span class="card-name">喂猫机</span>' +
        '<div class="card-acts">' +
          '<button type="button" class="ibtn" id="btnFeed" data-act="feeder:feed" aria-label="出粮"><i class="ti ti-download"></i></button>' +
        '</div></div>' +
      '<div class="card-mid"><span class="bignum" id="feedPct">62<s>%</s></span>' +
        '<span class="card-note" id="feedState"></span></div>' +
      '<div class="card-foot"><span id="feedLast">上次出粮 3 小时前</span></div>' +
    '</article>';
}

function syncDock() {
  const f = DEV.kit_feeder, r = S.robot;
  const pct = Math.round(r.state === 'dock' ? 0 : r.t * 100);
  const bot = $('#cardBot');
  bot.classList.toggle('is-live', r.state !== 'dock');
  $('#botPct').innerHTML = pct + '<s>%</s>';
  const labels = { clean: '清扫中', return: '返回充电' };
  $('#botState').textContent = r.state === 'dock' ? '' : labels[r.state] + (r.roomName ? ' · ' + r.roomName : '');
  $('#botDock').classList.toggle('is-on', r.state === 'dock');
  $('#botBat').textContent = Math.round(r.battery) + '%';
  $('#botArea').textContent = (r.state === 'dock' ? 0 : r.t * r.area).toFixed(1);
  const play = $('#botPlay');
  const running = r.state === 'clean';
  play.dataset.act = running ? 'robot:pause' : 'robot:start';
  play.querySelector('i').className = 'ti ' + (running ? 'ti-player-pause' : 'ti-player-play');
  botEl.classList.toggle('is-run', running);

  $('#feedPct').innerHTML = Math.round(f.level) + '<s>%</s>';
  $('#cardFeed').classList.toggle('is-live', f.level < 15);
  const low = f.level < 15;
  $('#feedState').textContent = low ? '粮仓将空' : '';
  $('#feedState').classList.toggle('is-warn', low);
  $('#btnFeed').classList.toggle('is-on', f.level >= 15);
  $('#feedLast').textContent = f.lastFeed ? '刚刚出粮 12 g' : '上次出粮 3 小时前';

  if (r.state === 'clean') placeRobot();
  else if (r.state === 'dock') placeAt(botEl, MP.hall_robot[0], MP.hall_robot[1], MP.hall_robot[2]);
}

/* ---------------- Toast ---------------- */
function armToast(t) {
  clearTimeout(t._t1);
  clearTimeout(t._t2);
  t.classList.remove('is-out');
  t._t1 = setTimeout(() => { t.classList.add('is-out'); }, 2200);
  t._t2 = setTimeout(() => { t.remove(); }, 2560);
}

function toast(msg, warn) {
  const box = $('#toasts');
  const same = [...box.querySelectorAll('.toast')].find((t) => t.dataset.msg === msg);
  if (same) {
    armToast(same);
    return;
  }
  const t = document.createElement('div');
  t.className = 'toast' + (warn ? ' is-warn' : '');
  t.dataset.msg = msg;
  t.innerHTML = '<i class="ti ' + (warn ? 'ti-alert-triangle' : 'ti-check') + '"></i>' + msg;
  box.appendChild(t);
  while (box.children.length > 3) box.firstElementChild.remove();
  armToast(t);
}
/* ============================================================
   右栏面板
   ============================================================ */
const MODE_TXT = { cool: '制冷', heat: '制热', fan: '送风' };
const HEAT_TXT = { warm: '暖风', dry: '热干', vent: '换气' };
const FAN_TXT = ['关', '低', '高'];
const PUR_TXT = ['睡眠', '自动', '强力'];

const RNG = {
  bri: { min: 1, max: 100, step: 1, get: (d) => d.bri, txt: (v) => v + '%', pct: (d) => d.bri },
  ct: { min: 2200, max: 4600, step: 50, get: (d) => d.ct, txt: (v) => v + 'K', pct: (d) => ((d.ct - 2200) / 24) },
  pos: { min: 0, max: 100, step: 1, get: (d) => d.pos, txt: (v) => v + '%', pct: (d) => d.pos },
  vol: { min: 0, max: 100, step: 1, get: (d) => d.vol, txt: (v) => v, pct: (d) => d.vol },
};

function devVal(d) {
  if (d.offline) return '离线';
  switch (d.type) {
    case 'light': return d.on ? d.bri + '%' : '关';
    case 'curtain': return d.pos + '%';
    case 'media': return d.on ? '音量 ' + d.vol : '关';
    case 'ac': return d.on ? d.temp + '° ' + MODE_TXT[d.mode] : '关';
    case 'purifier': return d.on ? PUR_TXT[d.fan] : '关';
    case 'appliance': return d.on ? (d.temp ? d.temp + '°C' : (d.note || '运行')) : '待机';
    case 'heater': return d.on ? HEAT_TXT[d.mode] : '关';
    case 'feeder': return Math.round(d.level) + '%';
    case 'lock': return d.locked ? '已上锁' : '未上锁';
    case 'robot': return S.robot.state === 'clean' ? '清扫 ' + Math.round(S.robot.t * 100) + '%' : '在充电';
    default: return '';
  }
}

function rngHTML(a) {
  const r = RNG[a];
  return '<input type="range" min="' + r.min + '" max="' + r.max + '" step="' + r.step +
    '" data-act="' + a + '" data-rng="' + a + '"><output data-out="' + a + '"></output>';
}
function segHTML(field, items) {
  return '<div class="seg" data-seg="' + field + '">' + items.map(([v, t]) => (
    '<button type="button" data-act="' + field + '" data-v="' + v + '">' + t + '</button>'
  )).join('') + '</div>';
}

function detailHTML(d) {
  const seg = (field, items) => '<div class="frow"><label>' + (field === 'fan' ? '风速' : '模式') + '</label>' + segHTML(field, items) + '</div>';
  switch (d.type) {
    case 'light':
      return '<div class="field"><label>亮度</label>' + rngHTML('bri') + '</div>' +
        '<div class="field"><label>色温</label>' + rngHTML('ct') + '</div>';
    case 'curtain':
      return '<div class="field"><label>开合</label>' + rngHTML('pos') + '</div>' +
        '<div class="mini"><button type="button" data-act="pos" data-v="100">全开</button>' +
        '<button type="button" data-act="pos" data-v="0">全关</button></div>';
    case 'media':
      return '<div class="field"><label>音量</label>' + rngHTML('vol') + '</div>';
    case 'ac':
      return '<div class="frow"><label>温度</label><div class="step">' +
        '<button type="button" data-act="step" data-v="-1" aria-label="降低"><i class="ti ti-minus"></i></button>' +
        '<div class="step-num" data-role="step">24<s>°C</s></div>' +
        '<button type="button" data-act="step" data-v="1" aria-label="升高"><i class="ti ti-plus"></i></button>' +
        '</div></div>' + seg('mode', [['cool', '制冷'], ['heat', '制热'], ['fan', '送风']]) +
        seg('fan', [['0', '关'], ['1', '低'], ['2', '高']]);
    case 'purifier':
      return seg('fan', [['0', '睡眠'], ['1', '自动'], ['2', '强力']]);
    case 'heater':
      return seg('mode', [['warm', '暖风'], ['dry', '热干'], ['vent', '换气']]);
    case 'appliance':
      return d.id === 'bath_water'
        ? '<div class="frow"><label>温度</label><div class="step">' +
          '<button type="button" data-act="step" data-v="-1" aria-label="降低"><i class="ti ti-minus"></i></button>' +
          '<div class="step-num" data-role="step">48<s>°C</s></div>' +
          '<button type="button" data-act="step" data-v="1" aria-label="升高"><i class="ti ti-plus"></i></button>' +
          '</div></div>'
        : '<p class="stat" data-role="note">' + (d.note || '运行') + '</p>';
    case 'feeder':
      return '<div class="field"><label>粮量</label><div class="bar"><i data-role="fbar"></i></div>' +
        '<output data-role="fpct">' + Math.round(d.level) + '%</output></div>' +
        '<div class="mini"><button type="button" data-act="feeder:feed">出粮</button>' +
        '<button type="button" data-act="feeder:refill">补粮</button></div>';
    case 'lock':
      return '<p class="stat" data-role="note">门禁状态与全屋联动</p>' +
        '<div class="mini"><button type="button" data-act="lock" data-v="0">开锁</button>' +
        '<button type="button" data-act="lock" data-v="1">上锁</button></div>';
    case 'robot':
      return '<p class="stat" data-role="note">机身电量与清扫进度见下方</p>' +
        '<div class="mini"><button type="button" data-act="robot:start">清扫</button>' +
        '<button type="button" data-act="robot:pause">暂停</button>' +
        '<button type="button" data-act="robot:dock">回充</button></div>';
    case 'humidifier':
      return '<p class="stat" data-role="note">设备离线，请检查电源与网络</p>' +
        '<div class="mini"><button type="button" data-act="reconnect">重新连接</button></div>';
    default:
      return '';
  }
}

function rangeKeyOf(d) {
  if (d.offline) return null;
  if (d.type === 'light') return 'bri';
  if (d.type === 'curtain') return 'pos';
  if (d.type === 'media') return 'vol';
  return null;
}

function devHTML(d) {
  const rk = rangeKeyOf(d);
  return '<div class="dev" data-dev="' + d.id + '">' +
    '<div class="dev-row">' +
      '<i class="dev-fill"></i>' +
      '<button type="button" class="dev-power" data-act="toggle">' +
        '<span class="dev-ic"><i class="ti ' + d.icon + '"></i></span>' +
        '<span class="dev-name">' + d.name + '</span>' +
        '<span class="dev-val" data-role="val"></span>' +
      '</button>' +
      (rk ? '<button type="button" class="dev-fade" aria-label="左右拖动调节' + d.name + '"><i class="dev-knob"></i></button>' : '') +
      '<button type="button" class="sw" role="switch" data-act="toggle" aria-label="开关"><span></span></button>' +
      '<button type="button" class="dev-more" data-act="expand" aria-label="更多设置"><i class="ti ti-chevron-down"></i></button>' +
    '</div>' +
    '<div class="dev-detail"><div class="dd"><div class="dd-pad">' + detailHTML(d) + '</div></div></div>' +
  '</div>';
}

function allHTML() {
  const quick = '<div class="mini" style="padding:2px 10px 14px">' +
    '<button type="button" data-act="quick:lights">全屋关灯</button>' +
    '<button type="button" data-act="quick:curtain">窗帘全合</button>' +
    '<button type="button" data-act="quick:robot">全屋清扫</button>' +
    '</div>';
  return ROOMS.map((r) => (
    '<button type="button" class="roomrow" data-act="room" data-id="' + r.id + '">' +
      '<span class="rr-ic"><i class="ti ' + r.icon + '"></i></span>' +
      '<span class="rr-t"><b>' + r.name + '</b><s>' + areaOf(r).toFixed(1) + ' m²</s></span>' +
      '<span class="rr-n" data-rr="' + r.id + '"></span>' +
      '<span class="rr-arrow"><i class="ti ti-chevron-right"></i></span>' +
    '</button>'
  )).join('') + '<p class="hint">快捷操作</p>' + quick;
}

function renderPanel() {
  const r = S.room === 'all' ? null : ROOM[S.room];
  $('#phTitle').textContent = r ? r.name : '全屋';
  $('#allOff').hidden = !r;
  const body = $('#panelBody');
  body.innerHTML = r ? devsOf(r.id).map(devHTML).join('') : allHTML();
  body.scrollTop = 0;
  [...body.children].forEach((el, i) => {
    el.style.animation = 'riseIn .42s cubic-bezier(.22,1,.36,1) both';
    el.style.animationDelay = (i * 24) + 'ms';
  });
  syncPanel();
}

function syncPanel() {
  const r = S.room === 'all' ? null : ROOM[S.room];
  $('#phSub').textContent = r
    ? onCount(r.id) + '/' + devsOf(r.id).length + ' 台运行'
    : allOn() + '/' + DEVICES.length + ' 台运行 · ' + powerW() + ' W';

  document.querySelectorAll('#panelBody [data-rr]').forEach((el) => {
    const n = onCount(el.dataset.rr), t = devsOf(el.dataset.rr).length;
    el.textContent = n + '/' + t;
    el.classList.toggle('is-live', n > 0);
  });

  document.querySelectorAll('#panelBody .dev').forEach((el) => {
    const d = DEV[el.dataset.dev];
    const on = isOn(d);
    el.classList.toggle('is-on', on);
    el.classList.toggle('is-off', !on);
    el.classList.toggle('is-offline', !!d.offline);
    const sw = el.querySelector('.sw');
    if (sw) sw.setAttribute('aria-checked', on ? 'true' : 'false');
    const val = el.querySelector('[data-role=val]');
    if (val) val.textContent = devVal(d);

    const rk = rangeKeyOf(d);
    if (rk) {
      const p = Math.max(0, Math.min(100, RNG[rk].pct(d)));
      const row = el.querySelector('.dev-row');
      if (row) row.style.setProperty('--p', (on ? p : 0).toFixed(1));
    }

    el.querySelectorAll('[data-rng]').forEach((inp) => {
      const a = inp.dataset.rng, r2 = RNG[a], v = r2.get(d);
      inp.value = v;
      inp.style.setProperty('--p', r2.pct(d).toFixed(1) + '%');
      const out = el.querySelector('[data-out="' + a + '"]');
      if (out) out.textContent = r2.txt(v);
    });

    el.querySelectorAll('[data-seg]').forEach((sg) => {
      const field = sg.dataset.seg;
      sg.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(d[field]) === b.dataset.v ? 'true' : 'false');
      });
    });

    const st = el.querySelector('[data-role=step]');
    if (st && d.temp) st.innerHTML = d.temp + '<s>°C</s>';

    const note = el.querySelector('[data-role=note]');
    if (note && d.type === 'appliance') note.textContent = d.on ? (d.note || '运行') : '待机';
    if (note && d.type === 'lock') note.textContent = d.locked ? '门已上锁' : '门已解锁';
    if (note && d.type === 'robot') note.textContent = S.robot.state === 'clean' ? '正在清扫' : '在充电座';

    const fb = el.querySelector('[data-role=fbar]');
    if (fb) {
      fb.style.width = d.level + '%';
      fb.classList.toggle('is-warn', d.level < 15);
      const fp = el.querySelector('[data-role=fpct]');
      if (fp) fp.textContent = Math.round(d.level) + '%';
    }
  });
}

/* ============================================================
   动作
   ============================================================ */
function toggleDev(d) {
  if (d.offline) { toast('加湿器离线，无法操作', true); return; }
  switch (d.type) {
    case 'curtain': d.pos = d.pos > 0 ? 0 : 100; setCurtain(d.id, d.pos); break;
    case 'lock': d.locked = !d.locked; break;
    case 'feeder': feedCat(); return;
    case 'robot': S.robot.state === 'clean' ? pauseRobot() : startRobot(); return;
    default: d.on = !d.on;
  }
  S.scene = null;
}

function act(name, el) {
  const v = el.dataset.v;
  const devEl = el.closest('[data-dev]');
  const d = devEl ? DEV[devEl.dataset.dev] : null;
  switch (name) {
    case 'marker': {
      const dd = DEV[el.dataset.id];
      if (dd) { toggleDev(dd); syncAll(); }
      return;
    }
    case 'scene': applyScene(el.dataset.id); return;
    case 'room': {
      S.room = el.dataset.id;
      renderPanel();
      syncAll();
      return;
    }
    case 'expand': {
      const dev = el.closest('.dev');
      dev.classList.toggle('is-open');
      return;
    }
    case 'toggle': if (d) toggleDev(d); break;
    case 'pos': if (d) { d.pos = +v; setCurtain(d.id, d.pos); S.scene = null; } break;
    case 'mode': case 'fan': {
      if (d) { d[name] = isNaN(+v) ? v : +v; S.scene = null; }
      break;
    }
    case 'step': {
      if (!d) break;
      const lo = d.type === 'ac' ? 16 : 40, hi = d.type === 'ac' ? 30 : 60;
      d.temp = Math.max(lo, Math.min(hi, (d.temp || lo) + (+v)));
      S.scene = null;
      break;
    }
    case 'lock': if (d) { d.locked = v === '1'; toast(d.locked ? '门已上锁' : '门已解锁'); S.scene = null; } break;
    case 'feeder:feed': feedCat(); break;
    case 'feeder:refill': refillCat(); break;
    case 'reconnect': if (d) { d.offline = false; d.on = true; toast('加湿器已重新连接'); } break;
    case 'robot:start': startRobot(); break;
    case 'robot:pause': pauseRobot(); break;
    case 'robot:dock': dockRobot(); break;
    case 'alloff': allOff(); break;
    case 'marks': toggleMarks(); return;
    case 'lights': toggleLights(); return;
    case 'quick:lights': DEVICES.filter((x) => x.type === 'light').forEach((x) => { x.on = false; }); S.scene = null; toast('全屋灯光已关闭'); break;
    case 'quick:curtain': DEVICES.filter((x) => x.type === 'curtain').forEach((x) => { x.pos = 0; setCurtain(x.id, 0); }); S.scene = null; toast('窗帘已全部合上'); break;
    case 'quick:robot': S.room = 'all'; renderPanel(); startRobot('living'); return;
    default: break;
  }
  syncAll();
}

/* ---------------- 沙盘标注 ---------------- */
let marksOn = true;
function toggleMarks(force) {
  marksOn = force === undefined ? !marksOn : !!force;
  modelEl.classList.toggle('is-bare', !marksOn);
  const btn = $('#mkToggle');
  if (btn) {
    btn.classList.toggle('is-on', marksOn);
    btn.setAttribute('aria-pressed', marksOn ? 'true' : 'false');
    btn.querySelector('i').className = 'ti ' + (marksOn ? 'ti-eye' : 'ti-eye-off');
  }
}

let lampsOn = true;
function toggleLights(force) {
  lampsOn = force === undefined ? !lampsOn : !!force;
  modelEl.classList.toggle('no-lamps', !lampsOn);
  const btn = $('#ltToggle');
  if (btn) {
    btn.classList.toggle('is-on', lampsOn);
    btn.setAttribute('aria-pressed', lampsOn ? 'true' : 'false');
  }
}

function allOff() {
  const list = S.room === 'all' ? DEVICES : devsOf(S.room);
  let n = 0;
  list.forEach((d) => {
    if (d.offline) return;
    if (d.type === 'light' || d.type === 'media' || d.type === 'ac' || d.type === 'purifier' || d.type === 'heater') {
      if (d.on) { d.on = false; n++; }
    } else if (d.type === 'curtain' && d.pos > 0) {
      d.pos = 0; setCurtain(d.id, 0); n++;
    }
  });
  S.scene = null;
  toast(n ? '已关闭 ' + n + ' 台设备' : '当前没有需要关闭的设备');
}

/* ---------------- 场景 ---------------- */
let applying = false;
function applyScene(id) {
  const sc = SCENE[id];
  if (!sc) return;
  S.scene = id;
  const jobs = [];
  Object.keys(sc.patch).forEach((key) => {
    if (key === '*lights') {
      DEVICES.filter((d) => d.type === 'light').forEach((d) => jobs.push([d, sc.patch[key]]));
    } else if (DEV[key]) {
      jobs.push([DEV[key], sc.patch[key]]);
    }
  });
  applying = true;
  jobs.forEach((job, i) => {
    setTimeout(() => {
      const d = job[0], patch = job[1];
      Object.assign(d, patch);
      if (patch.pos !== undefined) setCurtain(d.id, d.pos);
      syncAll();
    }, reduce ? 0 : i * 36);
  });
  setTimeout(() => {
    applying = false;
    S.scene = id;
    syncAll();
    toast('已应用 · ' + jobs.length + ' 台设备');
  }, reduce ? 0 : jobs.length * 36 + 120);
}
/* ============================================================
   扫地机 / 喂猫机 / 同步 / 启动
   ============================================================ */
const S = {
  room: 'living',
  scene: 'home',
  robot: { state: 'dock', t: 0, dur: 20, area: 0, battery: 82, roomName: '', len: 0, raf: 0, last: 0, uiAt: 0 },
};

function robotPath(room) {
  const [x0, y0, w, d] = room.rect;
  const inset = 48;
  const sx = x0 + inset, sy = y0 + inset, ex = x0 + w - inset, ey = y0 + d - inset;
  const lanes = Math.max(2, Math.round((ey - sy) / 78));
  const pts = [];
  for (let k = 0; k <= lanes; k++) {
    const y = sy + (ey - sy) * k / lanes;
    if (k % 2 === 0) pts.push([sx, y], [ex, y]);
    else pts.push([ex, y], [sx, y]);
  }
  let str = '';
  pts.forEach((p, i) => {
    const q = F(p[0], p[1], 0);
    str += (i ? 'L' : 'M') + r1(q[0]) + ' ' + r1(q[1]);
  });
  return str;
}

function placeScreen(el, sx, sy) {
  const { x, y, w, h } = vb;
  if (!w || !h) return;
  el.style.left = ((sx - x) / w * 100).toFixed(3) + '%';
  el.style.top = ((sy - y) / h * 100).toFixed(3) + '%';
}

function placeRobot() {
  const r = S.robot;
  if (!r.len || !botEl) return;
  const p = trailLive.getPointAtLength(r.t * r.len);
  placeScreen(botEl, p.x, p.y);
  trailLive.style.strokeDashoffset = (r.len * (1 - r.t)).toFixed(1);
}

function startRobot(forceRoom) {
  const r = S.robot;
  if (r.state === 'pause') {
    r.state = 'clean';
    r.last = 0;
    cancelAnimationFrame(r.raf);
    r.raf = requestAnimationFrame(tick);
    syncAll();
    return;
  }
  const rid = forceRoom || (S.room === 'all' ? 'living' : S.room);
  const room = ROOM[rid];
  const dStr = robotPath(room);
  trailBase.setAttribute('d', dStr);
  trailLive.setAttribute('d', dStr);
  r.len = trailLive.getTotalLength();
  trailLive.style.strokeDasharray = r.len;
  trailLive.style.strokeDashoffset = r.len;
  r.state = 'clean';
  r.t = 0;
  r.area = areaOf(room);
  r.roomName = room.name;
  r.dur = Math.max(11, Math.min(26, r.len / 155));
  r.last = 0;
  cancelAnimationFrame(r.raf);
  if (reduce) {
    r.t = 1;
    placeRobot();
    finishRobot();
    return;
  }
  r.raf = requestAnimationFrame(tick);
  syncAll();
}

function tick(ts) {
  const r = S.robot;
  if (r.state !== 'clean') return;
  if (!r.last) r.last = ts;
  const dt = Math.min(90, ts - r.last) / 1000;
  r.last = ts;
  r.t = Math.min(1, r.t + dt / r.dur);
  placeRobot();
  if (ts - r.uiAt > 160) {
    r.uiAt = ts;
    syncDock();
    syncHead();
    syncPanel();
  }
  if (r.t >= 1) { finishRobot(); return; }
  r.raf = requestAnimationFrame(tick);
}

function finishRobot() {
  const r = S.robot;
  r.state = 'return';
  r.battery = Math.max(38, Math.round(r.battery - 5));
  toast('已清扫 ' + r.roomName + ' · ' + r.area.toFixed(1) + ' m²');
  syncAll();
  setTimeout(() => {
    if (S.robot.state !== 'return') return;
    S.robot.state = 'dock';
    S.robot.t = 0;
    clearTrail();
    syncAll();
  }, reduce ? 0 : 1500);
}

function pauseRobot() {
  const r = S.robot;
  if (r.state !== 'clean') return;
  r.state = 'pause';
  cancelAnimationFrame(r.raf);
  toast('清扫已暂停');
  syncAll();
}

function dockRobot() {
  const r = S.robot;
  cancelAnimationFrame(r.raf);
  r.state = 'dock';
  r.t = 0;
  clearTrail();
  toast('扫地机返回充电');
  syncAll();
}

function clearTrail() {
  trailBase.setAttribute('d', '');
  trailLive.setAttribute('d', '');
  trailLive.style.strokeDashoffset = 0;
  S.robot.len = 0;
}

/* ---------------- 喂猫机 ---------------- */
function feedCat() {
  const f = DEV.kit_feeder;
  if (f.level < 15) { toast('粮仓将空，请先补粮', true); return; }
  f.level = Math.max(0, f.level - 9);
  f.lastFeed = Date.now();
  if (feederFood) {
    feederFood.animate(
      [{ opacity: 0.1 }, { opacity: 0.9 }],
      { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }
  toast('已出粮 12 g');
  syncAll();
}
function refillCat() {
  DEV.kit_feeder.level = 100;
  toast('粮仓已补满');
  syncAll();
}

/* ---------------- 同步 ---------------- */
function syncModel() {
  const lights = DEVICES.filter((d) => d.type === 'light');
  const lvl = lights.reduce((a, d) => a + (d.on ? d.bri / 100 : 0), 0) / Math.max(1, lights.length);
  const b = 0.66 + 0.34 * Math.min(1, lvl * 2.1);
  root.style.filter = 'brightness(' + b.toFixed(3) + ')';

  const pf = (THEME_INFO[curTheme()] || THEME_INFO.night).pool;
  lights.forEach((d) => {
    const el = poolEls[d.id];
    if (!el) return;
    const o = d.on ? Math.min(1, (0.3 + d.bri / 100 * 0.7) / b) * pf : 0;
    el.setAttribute('opacity', o.toFixed(2));
  });
  if (poolEls.__tv) poolEls.__tv.setAttribute('opacity', DEV.liv_tv.on ? (0.55 / b * pf).toFixed(2) : 0);

  DEVICES.forEach((d) => { if (d.type === 'curtain') setCurtain(d.id, d.pos); });

  ROOMS.forEach((r) => {
    if (roomGroup[r.id]) roomGroup[r.id].style.opacity = (S.room === 'all' || S.room === r.id) ? 1 : 0.84;
    if (washEls[r.id]) washEls[r.id].classList.toggle('is-hot', S.room === r.id);
  });

  modelEl.querySelectorAll('.rlabel').forEach((el) => {
    el.classList.toggle('is-on', S.room === el.dataset.room);
  });

  if (feederFood) feederFood.setAttribute('opacity', (0.22 + DEV.kit_feeder.level / 100 * 0.62).toFixed(2));
  if (acFlap.liv_ac) acFlap.liv_ac.style.display = DEV.liv_ac.on ? '' : 'none';
  if (acFlap.bed_ac) acFlap.bed_ac.style.display = DEV.bed_ac.on ? '' : 'none';
}

function syncMarkersState() {
  markersEl.querySelectorAll('.mk').forEach((el) => {
    const d = DEV[el.dataset.id];
    if (!d) return;
    if (d.type === 'robot') {
      el.classList.toggle('is-run', S.robot.state === 'clean');
      el.dataset.tip = '扫地机 ' + (S.robot.state === 'clean' ? Math.round(S.robot.t * 100) + '%' : '在充电');
      return;
    }
    const on = d.type === 'light' ? d.on : d.type === 'curtain' ? d.pos > 0 : d.type === 'lock' ? d.locked : !!d.on;
    el.classList.toggle('is-on', !!on);
    el.classList.toggle('is-dim', !on && !d.offline);
    el.classList.toggle('is-offline', !!d.offline);
    el.dataset.tip = d.name + ' ' + devVal(d);
  });
}

function syncAll() {
  syncModel();
  syncMarkersState();
  syncPanel();
  syncRail();
  syncHead();
  syncDock();
}

/* ---------------- 启动 ---------------- */
function init() {
  applyTheme();
  build();
  buildRail();
  buildDock();
  buildMarkers();
  fitModel();
  renderPanel();
  const off = $('#allOff');
  if (off) off.dataset.act = 'alloff';
  syncAll();

  if (window.ResizeObserver) {
    new ResizeObserver(() => requestAnimationFrame(fitModel)).observe(canvasEl);
  }
  window.addEventListener('resize', () => fitModel());

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.tagName === 'INPUT') return;
    act(b.dataset.act, b);
  });

  document.addEventListener('input', (e) => {
    const inp = e.target;
    if (!inp || inp.tagName !== 'INPUT' || inp.type !== 'range') return;
    const host = inp.closest('[data-dev]');
    if (!host) return;
    const d = DEV[host.dataset.dev];
    if (!d) return;
    d[inp.dataset.act] = +inp.value;
    if (inp.dataset.act === 'pos') setCurtain(d.id, d.pos);
    S.scene = null;
    syncAll();
  });

  /* 折叠行上的竖直拖拽条：改的是展开后第一个滑杆的值 */
  let fading = null;
  const fadeEnd = () => {
    if (!fading) return;
    fading.el.classList.remove('is-drag');
    window.removeEventListener('pointermove', fading.move);
    window.removeEventListener('pointerup', fadeEnd);
    window.removeEventListener('pointercancel', fadeEnd);
    fading = null;
  };
  document.addEventListener('pointerdown', (e) => {
    const f = e.target.closest('.dev-fade');
    if (!f) return;
    const host = f.closest('[data-dev]');
    const d = host && DEV[host.dataset.dev];
    const rk = d && rangeKeyOf(d);
    if (!rk) return;
    const row = f.parentElement;
    e.preventDefault();
    f.classList.add('is-drag');
    const move = (ev) => {
      const r = row.getBoundingClientRect();
      const span = Math.max(1, r.width - 126);
      const t = Math.max(0, Math.min(1, (ev.clientX - r.left) / span));
      const a = RNG[rk];
      const raw = a.min + t * (a.max - a.min);
      d[rk] = Math.max(a.min, Math.min(a.max, Math.round(raw / a.step) * a.step));
      if (rk === 'pos') setCurtain(d.id, d.pos);
      S.scene = null;
      syncAll();
    };
    move(e);
    fading = { el: f, move };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', fadeEnd);
    window.addEventListener('pointercancel', fadeEnd);
  });

  setInterval(applyTheme, 180000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
