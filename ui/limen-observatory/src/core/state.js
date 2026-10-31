/* 异物 · 异常观测室 — 全局状态与数据接入
 * 单一数据源：所有视图只读 / 写 App.state，避免各处硬编码。
 * 数据来自 data/*.js（挂载于 window.LIMEN），由 index.html 在核心模块前以 <script defer> 载入。
 */
(function (App) {
  "use strict";

  const LIMEN = window.LIMEN || {};
  const NOW = Date.now();

  /* 记录时间戳归一化：data 中以「相对分钟」存储（-420 = 420 分钟前），换算为绝对毫秒，
     保证排序与「刚刚 / 时间」显示一致；绝对毫秒时间戳原样保留。 */
  function normTs(ts) {
    if (typeof ts === "number" && ts > -1e8 && ts < 1e8) return NOW + ts * 60000;
    return ts;
  }
  function normalizeObj(o) {
    if (o && Array.isArray(o.records)) {
      o.records = o.records.map((r) => ({ ...r, ts: normTs(r.ts) }));
    }
    if (o && o.archived === undefined) o.archived = false;
    return o;
  }

  const OBJECTS = (LIMEN.objects || []).map(normalizeObj);

  /* 完整档案文本来自 data/dossiers.js（与 objects.js 解耦，避免主数据文件膨胀）。
     注入到各对象上，供「档案」tab 渲染。 */
  const DOSSIERS = LIMEN.dossiers || {};
  OBJECTS.forEach((o) => { if (!o.dossier && DOSSIERS[o.id]) o.dossier = DOSSIERS[o.id]; });

  const SECTORS = LIMEN.sectors || { map: {}, decode: (id) => String(id || "") };

  /* 素材：九宫格已拆为独立瓦片，运行时不再做背景定位裁格。
     前缀 + 数量 → 路径数组，全部由 config.media 单点驱动。 */
  const MEDIA = (LIMEN.config && LIMEN.config.media) || {};
  const tileSeq = (base, n) =>
    Array.from({ length: n }, (_, i) => `${base || "assets/tile_"}${String(i).padStart(2, "0")}.webp`);
  const COUNTS = MEDIA.counts || {};
  const DETAILS = tileSeq(MEDIA.detail, COUNTS.detail || 9);
  const ICONS = tileSeq(MEDIA.icon, COUNTS.icon || 9);
  const PLATES = tileSeq(MEDIA.plate, COUNTS.plate || 9);
  const SPECIMENS = tileSeq(MEDIA.specimen, COUNTS.specimen || 9);
  const ICON_MAP = (LIMEN.config && LIMEN.config.iconMap) || {};
  const SEAL_IMG = MEDIA.seal || null;
  const PARTICLE_IMG = MEDIA.particle || null;
  const RISK_LEVELS = (LIMEN.config && LIMEN.config.riskLevels) || ["安全", "警戒", "危险", "绝密"];
  const OPERATOR = ((LIMEN.config && LIMEN.config.ui) || {}).operator || "观察员 M";

  const CAM = ["A", "B", "C", "D"];
  /* 缩放：默认 100%（填满舞台、最小尺寸），禁止继续缩小，最大可放大至 300% */
  const ZOOMS = [100, 125, 150, 175, 200, 225, 250, 275, 300];
  const SETTINGS_KEY = "limen-observatory:settings";
  const DEFAULT_SETTINGS = (LIMEN.config && LIMEN.config.settings) || {};

  const state = {
    activeId: null,
    view: "material",
    zoomIdx: 0,
    rotIdx: 0,
    galleryIdx: 0,
    search: "",
    noteType: "observation",
    settings: Object.assign(
      { gaze: true, motion: false, sound: true, volume: 0.7, grid: false, scanDuration: 2.6 },
      DEFAULT_SETTINGS
    ),
  };

  function current() { return OBJECTS.find((o) => o.id === state.activeId) || null; }
  /* 搜索范围：名称 / 编号 / 扇区解码 / 异常类型 / 低语 / 来源考究 */
  function matches(o) {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return [o.name, o.id, SECTORS.decode(o.id), o.classification, o.risk, o.whisper, o.origin]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  }
  /* 集合面板展示全部异物（含已封存）；已封存仅以标记区分，不再单列模块 */
  const allObjects = () => OBJECTS.filter(matches);
  function currentIndex() { return OBJECTS.findIndex((o) => o.id === state.activeId); }

  App.state = {
    OBJECTS, DOSSIERS, SECTORS, MEDIA, SEAL_IMG, PARTICLE_IMG, RISK_LEVELS, OPERATOR,
    DETAILS, ICONS, PLATES, SPECIMENS, ICON_MAP,
    CAM, ZOOMS, SETTINGS_KEY, DEFAULT_SETTINGS,
    state, current, matches, allObjects, currentIndex, NOW,
  };
})(window.App);
