/* ═══ 焦度计 RoastLab — app.js ═══
   最简原生 JS：视图切换 / 曲线节点拖拽 / 批次展开 /
   对比并排 / 杯测滑块 / 库存阈值提醒 / 订单筛选 / 笔记 */

"use strict";

/* ── 假数据 ─────────────────────────── */

const BATCHES = [
  {
    id: "1014-A", name: "耶加雪菲 果丁丁合作社", short: "耶加雪菲", origin: "埃塞俄比亚 · 伊迪多",
    process: "水洗 G1", variety: "当地原生种", density: "812 g/L", moisture: "10.8%",
    machine: "PROBAT P12", weight: "12.0 kg",
    timeline: [ // [分钟, 豆温BT, 环境温ET]  节点可拖
      [0.0, 165, 190], [1.5, 122, 186], [3.0, 112, 184], [4.5, 118, 183],
      [6.0, 131, 183], [7.5, 146, 182], [9.0, 162, 181], [10.5, 178, 181], [12.0, 194, 180]
    ],
    crack: 9.7, drop: 205.5, dev: 19.2, rorPeak: 24,
    marks: [
      { t: 4.3, name: "转褐", major: false },
      { t: 9.7, name: "一爆", major: true },
      { t: 12.0, name: "落豆", major: false }
    ],
    status: "done", note: "火力偏保守，脱水段略长。下次 6:00 起把风门从 4 开到 5，梅纳反应压短一点，发展期想拉到 20%。"
  },
  {
    id: "1013-B", name: "瑰夏 骑士庄园", short: "瑰夏", origin: "巴拿马 · 波葵蒂",
    process: "日晒", variety: "Geisha", density: "798 g/L", moisture: "10.2%",
    machine: "PROBAT P12", weight: "8.5 kg",
    timeline: [
      [0.0, 170, 195], [1.5, 128, 190], [3.0, 118, 188], [4.5, 124, 186],
      [6.0, 139, 185], [7.5, 155, 184], [9.0, 172, 183], [10.0, 186, 182]
    ],
    crack: 8.1, drop: 200.0, dev: 17.5, rorPeak: 27,
    marks: [
      { t: 3.9, name: "转褐", major: false },
      { t: 8.1, name: "一爆", major: true },
      { t: 10.0, name: "落豆", major: false }
    ],
    status: "done", note: "瑰夏日晒怕焦糖化过头，落豆点比常规提前 3°C。香气非常打开，栀子花和桃子。"
  },
  {
    id: "1012-C", name: "曼特宁 林东产区", short: "曼特宁", origin: "印尼 · 苏北",
    process: "湿剥法", variety: "Ateng", density: "805 g/L", moisture: "12.4%",
    machine: "PROBAT P12", weight: "12.0 kg",
    timeline: [
      [0.0, 168, 192], [2.0, 126, 188], [4.0, 120, 186], [6.0, 133, 185],
      [8.0, 152, 184], [10.0, 174, 183], [12.0, 196, 182], [13.5, 210, 182]
    ],
    crack: 10.9, drop: 216.0, dev: 19.0, rorPeak: 21,
    marks: [
      { t: 5.2, name: "转褐", major: false },
      { t: 10.9, name: "一爆", major: true },
      { t: 13.5, name: "落豆", major: false }
    ],
    status: "quality", note: "含水率高，脱水段拉到 4 分钟。体脂感厚重但尾段略闷，考虑中深焙再试一炉。"
  }
];

const INVENTORY = [
  { name: "耶加雪菲 G1", origin: "埃塞俄比亚 · 水洗", stock: 42, unit: "kg", threshold: 30, arrival: "10-28 到货" },
  { name: "瑰夏 骑士庄园", origin: "巴拿马 · 日晒", stock: 12, unit: "kg", threshold: 15, arrival: "11-10 到货" },
  { name: "曼特宁 G3", origin: "印尼 · 湿剥", stock: 68, unit: "kg", threshold: 25, arrival: "库存充足" },
  { name: "哥伦比亚 慧兰", origin: "哥伦比亚 · 水洗", stock: 9, unit: "kg", threshold: 20, arrival: "10-22 到货" },
  { name: "云南 保山小粒", origin: "中国 · 日晒", stock: 55, unit: "kg", threshold: 20, arrival: "库存充足" },
  { name: "巴西 摩吉安纳", origin: "巴西 · 半日晒", stock: 36, unit: "kg", threshold: 25, arrival: "库存充足" }
];

const ORDERS = [
  { cust: "山雾咖啡 · 望京店", contact: "沈书航", items: "耶加雪菲 · 中焙 5kg", qty: "5.0 kg", price: "¥ 1,850", state: "pending" },
  { cust: "回声咖啡馆", contact: "郑羽", items: "瑰夏 · 浅焙 2kg + 曼特宁 3kg", qty: "5.0 kg", price: "¥ 3,240", state: "roasting" },
  { cust: "南屿烘焙工作室", contact: "老周", items: "云南小粒 · 中深焙 10kg", qty: "10.0 kg", price: "¥ 2,600", state: "pending" },
  { cust: "白噪音咖啡", contact: "姚思远", items: "曼特宁 · 中焙 6kg", qty: "6.0 kg", price: "¥ 1,560", state: "shipped" },
  { cust: "拾光咖啡 · 三里屯", contact: "韩雨桐", items: "耶加雪菲 · 浅焙 4kg", qty: "4.0 kg", price: "¥ 1,480", state: "shipped" }
];

const CUPPING = [
  { name: "干香 / 湿香", sub: "Fragrance / Aroma", val: 8.5, max: 10 },
  { name: "风味", sub: "Flavor", val: 8.25, max: 10 },
  { name: "余韵", sub: "Aftertaste", val: 7.75, max: 10 },
  { name: "酸质", sub: "Acidity", val: 8.5, max: 10 },
  { name: "醇厚", sub: "Body", val: 7.5, max: 10 },
  { name: "一致性", sub: "Uniformity", val: 10, max: 10 },
  { name: "均衡度", sub: "Balance", val: 8, max: 10 },
  { name: "干净度", sub: "Clean Cup", val: 9, max: 10 },
  { name: "甜度", sub: "Sweetness", val: 10, max: 10 },
  { name: "整体评价", sub: "Overall", val: 8.5, max: 10 }
];

const NOTES = [
  { time: "10-13 18:40", text: "湿度降到 40% 以下时脱水明显变快，今天 1013-B 的转褐提前了半分钟。秋冬两季入豆温可以提 5 度。" },
  { time: "10-12 21:05", text: "P12 的 3 号火排在中段会有轻微回温迟滞，观察 RoR 的时候要留意 6-7 分钟这个区间。" },
  { time: "10-11 20:12", text: "试了一炉浅焙曼特宁，草本味压不住。这个产区的豆子还是往中深走更稳。" }
];

/* ── 工具 ─────────────────────────── */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmtMin = m => `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, "0")}`;
const fmtT = t => t.toFixed(1) + "°C";

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ── 视图切换 ─────────────────────── */

const VIEW_META = {
  curves: ["烘焙曲线", "拖动曲线节点调整烘焙节奏"],
  batch: ["批次记录", "点击任意批次展开详情"],
  compare: ["对比视图", "并排比较两炉曲线与杯测"],
  cupping: ["杯测评分", "拖动滑块为每个维度打分"],
  inventory: ["库存追踪", "低于安全线自动提醒补货"],
  orders: ["客户订单", "待烘焙订单会标记在曲线上"],
  notes: ["烘焙笔记", "这台炉子的脾气都记在这里"]
};

function switchView(name) {
  $$(".rail-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  const [t, s] = VIEW_META[name] || ["", ""];
  $("#viewTitle").textContent = t;
  $("#viewSub").textContent = s;
}
$$(".rail-btn").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));

/* ── SVG 曲线绘制 + 节点拖拽 ───────── */

const NS = "http://www.w3.org/2000/svg";
const W = 780, H = 300, PAD = { l: 42, r: 16, t: 18, b: 30 };
const T_MIN = 90, T_MAX = 220; // 温度范围

function el(tag, attrs = {}) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

function xOf(minute, maxM) { return PAD.l + (minute / maxM) * (W - PAD.l - PAD.r); }
function yOf(temp) { return PAD.t + (1 - (temp - T_MIN) / (T_MAX - T_MIN)) * (H - PAD.t - PAD.b); }

let curBatch = BATCHES[0];

function drawGrid(svg, maxM) {
  const g = el("g", { class: "curve-grid" });
  // 横向温度线
  for (let t = 100; t <= 220; t += 40) {
    g.appendChild(el("line", { x1: PAD.l, x2: W - PAD.r, y1: yOf(t), y2: yOf(t) }));
    const tx = el("text", { x: PAD.l - 8, y: yOf(t) + 3, "text-anchor": "end" });
    tx.textContent = t + "°";
    g.appendChild(tx);
  }
  // 纵向时间线
  for (let m = 0; m <= maxM; m += 3) {
    g.appendChild(el("line", { x1: xOf(m, maxM), x2: xOf(m, maxM), y1: PAD.t, y2: H - PAD.b }));
    const tx = el("text", { x: xOf(m, maxM), y: H - 10, "text-anchor": "middle" });
    tx.textContent = fmtMin(m);
    g.appendChild(tx);
  }
  svg.appendChild(g);
}

function pathFrom(points, f) {
  return points.map((p, i) => (i ? "L" : "M") + f(p).join(",")).join(" ");
}

function drawCurve(svg, batch, interactive) {
  svg.innerHTML = "";
  const pts = batch.timeline;
  const maxM = Math.max(...pts.map(p => p[0])) + 1;
  drawGrid(svg, Math.ceil(maxM / 3) * 3);

  // 发展期底色（一爆之后）
  const crack = batch.crack;
  const band = el("rect", {
    class: "dev-band", x: xOf(crack, maxM), y: PAD.t,
    width: xOf(maxM, maxM) - xOf(crack, maxM), height: H - PAD.t - PAD.b
  });
  svg.appendChild(band);

  // ET 参考线
  svg.appendChild(el("path", {
    class: "path-et", d: pathFrom(pts, p => [xOf(p[0], maxM), yOf(p[2])])
  }));

  // 事件竖线
  batch.marks.forEach(m => {
    svg.appendChild(el("line", {
      class: "event-line", x1: xOf(m.t, maxM), x2: xOf(m.t, maxM), y1: PAD.t, y2: H - PAD.b
    }));
    const tx = el("text", { class: "event-label", x: xOf(m.t, maxM), y: PAD.t + 12, "text-anchor": "middle" });
    tx.textContent = m.name;
    svg.appendChild(tx);
  });

  // BT 主曲线
  svg.appendChild(el("path", {
    class: "path-bt", d: pathFrom(pts, p => [xOf(p[0], maxM), yOf(p[1])])
  }));

  if (!interactive) return;

  // 可拖节点
  pts.forEach((p, i) => {
    const hit = el("circle", { class: "node-hit", cx: xOf(p[0], maxM), cy: yOf(p[1]), r: 14 });
    const dot = el("circle", { class: "node-dot", cx: xOf(p[0], maxM), cy: yOf(p[1]), r: 4.5 });
    svg.appendChild(hit);
    svg.appendChild(dot);

    hit.addEventListener("pointerenter", () => dot.classList.add("hot"));
    hit.addEventListener("pointerleave", () => dot.classList.remove("hot"));

    hit.addEventListener("pointerdown", e => {
      e.preventDefault();
      hit.setPointerCapture(e.pointerId);
      const move = ev => {
        const rect = svg.getBoundingClientRect();
        const sx = W / rect.width, sy = H / rect.height;
        const mx = (ev.clientX - rect.left) * sx, my = (ev.clientY - rect.top) * sy;
        // 时间约束：夹在前后节点之间
        const lo = i === 0 ? 0 : pts[i - 1][0] + 0.3;
        const hi = i === pts.length - 1 ? maxM : pts[i + 1][0] - 0.3;
        p[0] = Math.min(hi, Math.max(lo, (mx - PAD.l) / (W - PAD.l - PAD.r) * maxM));
        // 温度约束
        p[1] = Math.min(T_MAX, Math.max(T_MIN, T_MIN + (1 - (my - PAD.t) / (H - PAD.t - PAD.b)) * (T_MAX - T_MIN)));
        // 重绘（轻量重画曲线与点）
        redraw();
      };
      const up = () => {
        hit.releasePointerCapture(e.pointerId);
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        refreshStats(batch);
        toast(`节点已调整 · ${fmtMin(p[0])} / ${fmtT(p[1])}`);
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
    });
  });

  function redraw() {
    const maxM2 = Math.max(...pts.map(p => p[0])) + 1;
    // 只更新移动的 path 与 dot（简单起见整体重画一次）
    drawCurve(svg, batch, true);
    void maxM2;
  }
}

function refreshStats(batch) {
  const total = batch.timeline[batch.timeline.length - 1][0];
  $("#statTotal").textContent = fmtMin(total);
  $("#statRoR").textContent = batch.rorPeak + " °C/min";
  $("#statCrack").textContent = fmtMin(batch.crack);
  $("#statDrop").textContent = fmtT(batch.drop);
  $("#statDev").textContent = batch.dev.toFixed(1) + "%";
}

function renderBatchMeta(batch) {
  $("#batchMeta").innerHTML = [
    ["品种", batch.variety], ["产地", batch.origin],
    ["处理法", batch.process], ["密度", batch.density + " g/L"],
    ["含水率", batch.moisture], ["投豆量", batch.weight]
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  $("#markList").innerHTML = batch.marks.map(m =>
    `<li><span class="mark-time">${fmtMin(m.t)}</span><span class="mark-note">${m.name}${m.major ? "（关键点）" : ""}</span></li>`
  ).join("");
  $("#batchNote").textContent = batch.note;
}

function renderTimeline(batch) {
  const total = batch.timeline[batch.timeline.length - 1][0];
  const crackT = batch.crack / total * 100;
  $("#timeline").innerHTML = `
    <div class="timeline-track">
      <div class="timeline-seg seg-dry" style="width:${batch.marks[0].t / total * 100}%"></div>
      <div class="timeline-seg seg-maillard" style="left:${batch.marks[0].t / total * 100}%;width:${crackT - batch.marks[0].t / total * 100}%"></div>
      <div class="timeline-seg seg-dev" style="left:${crackT}%;width:${100 - crackT}%"></div>
      ${batch.marks.map(m => `
        <div class="tl-event ${m.major ? "major" : ""}" style="left:${m.t / total * 100}%">
          <span class="tl-dot"></span>
          <span class="tl-name">${m.name}</span>
          <span class="tl-time mono">${fmtMin(m.t)}</span>
        </div>`).join("")}
    </div>`;
}

function loadBatch(id) {
  curBatch = BATCHES.find(b => b.id === id) || BATCHES[0];
  const svg = $("#curveSvg");
  drawCurve(svg, curBatch, true);
  refreshStats(curBatch);
  renderBatchMeta(curBatch);
  renderTimeline(curBatch);
}

// 批次下拉
$("#batchSelect").innerHTML = BATCHES.map(b =>
  `<option value="${b.id}">批次 ${b.id} · ${b.short}</option>`).join("");
$("#batchSelect").addEventListener("change", e => loadBatch(e.target.value));

/* ── 批次记录视图 ─────────────────── */

let batchFilter = "all";

function renderBatchTable() {
  const kw = $("#batchSearch").value.trim();
  const list = BATCHES.filter(b =>
    (batchFilter === "all" || b.status === batchFilter) &&
    (!kw || b.name.includes(kw) || b.origin.includes(kw) || b.id.includes(kw))
  );
  $("#batchTable").innerHTML = list.map(b => `
    <div class="batch-row" data-id="${b.id}" tabindex="0" role="button" aria-expanded="false">
      <div class="batch-head">
        <span class="batch-id">${b.id}</span>
        <span class="batch-name">${b.short}<small>${b.name}</small></span>
        <span class="batch-col">${b.process}</span>
        <span class="batch-col">${b.weight}</span>
        <span class="batch-col">${fmtMin(b.timeline[b.timeline.length - 1][0])}</span>
        <span class="batch-col">${fmtT(b.drop)}</span>
        <span class="batch-col ${b.status === "quality" ? "tag-quality" : "tag-done"}">
          ${b.status === "quality" ? "待品控" : "已完成"}<i class="ti ti-chevron-right batch-chevron"></i>
        </span>
      </div>
      <div class="batch-detail">
        <div><div class="detail-k">产地与品种</div><div class="detail-v">${b.origin}<br>${b.variety}</div></div>
        <div><div class="detail-k">生豆数据</div><div class="detail-v mono">密度 ${b.density} g/L<br>含水 ${b.moisture}</div></div>
        <div><div class="detail-k">关键标记</div><div class="detail-v mono">${b.marks.map(m => `${m.name} ${fmtMin(m.t)}`).join(" · ")}</div></div>
        <div><div class="detail-k">烘焙师备注</div><div class="detail-v">${b.note}</div></div>
      </div>
    </div>`).join("") || `<p style="color:var(--ink-3);padding:20px 4px;">没有匹配的批次</p>`;

  $$(".batch-row").forEach(row => {
    const toggle = () => {
      const open = row.classList.toggle("open");
      row.setAttribute("aria-expanded", open);
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
}
$("#batchSearch").addEventListener("input", renderBatchTable);
$("#batchFilters").addEventListener("click", e => {
  const btn = e.target.closest(".chip"); if (!btn) return;
  $$("#batchFilters .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  batchFilter = btn.dataset.f;
  renderBatchTable();
});

/* ── 对比视图 ─────────────────────── */

function cmpNum(k, va, vb, best /* "low"|"high" */) {
  const bestA = (best === "low" ? va < vb : va > vb);
  return `
    <div class="cmp-num"><span class="k">${k}</span>
      <span class="v ${bestA ? "best" : ""}">${va}</span></div>`;
}

function renderCompareCol(colId, batch, other, selId) {
  const total = batch.timeline[batch.timeline.length - 1][0];
  const svgId = "cmpSvg-" + batch.id + "-" + selId;
  const col = $(colId);
  col.innerHTML = `
    <div class="cmp-head">
      <span class="cmp-name">${batch.short}</span>
      <span class="cmp-id mono">${batch.id}</span>
      <div class="cmp-swatches">
        <span class="cmp-swatch" style="background:var(--scope)" title="本炉 BT"></span>
        <span class="cmp-swatch" style="background:var(--accent)" title="${other.short} BT"></span>
      </div>
    </div>
    <div class="cmp-chart"><svg id="${svgId}" viewBox="0 0 780 300" preserveAspectRatio="xMidYMid meet"></svg></div>
    <div class="cmp-nums">
      ${cmpNum("总时长", fmtMin(total), fmtMin(other.timeline[other.timeline.length - 1][0]), "low")}
      ${cmpNum("一爆", fmtMin(batch.crack), fmtMin(other.crack), "high")}
      ${cmpNum("落豆温", fmtT(batch.drop), fmtT(other.drop), "low")}
      ${cmpNum("发展率", batch.dev.toFixed(1) + "%", other.dev.toFixed(1) + "%", "high")}
    </div>
    <p class="cmp-cupper">${batch.note}</p>`;
  drawCompareChart($("#" + svgId), batch, other);
}

function drawCompareChart(svg, a, b) {
  svg.innerHTML = "";
  const maxM = Math.ceil(Math.max(
    a.timeline[a.timeline.length - 1][0], b.timeline[b.timeline.length - 1][0]
  ) / 3) * 3;
  drawGrid(svg, maxM);
  // 对方曲线用强调橙淡线做参照
  svg.appendChild(el("path", {
    d: pathFrom(b.timeline, p => [xOf(p[0], maxM), yOf(p[1])]),
    stroke: "var(--accent)", "stroke-opacity": ".5", "stroke-width": 1.75, fill: "none"
  }));
  svg.appendChild(el("path", {
    d: pathFrom(a.timeline, p => [xOf(p[0], maxM), yOf(p[1])]),
    stroke: "var(--scope)", "stroke-width": 2.25, fill: "none", "stroke-linecap": "round"
  }));
}

function renderCompare() {
  const a = BATCHES.find(b => b.id === $("#cmpA").value) || BATCHES[0];
  let b = BATCHES.find(x => x.id === $("#cmpB").value) || BATCHES[1];
  if (a.id === b.id) b = BATCHES.find(x => x.id !== a.id); // 避免同炉对比
  renderCompareCol("#cmpColA", a, b, "a");
  renderCompareCol("#cmpColB", b, a, "b");
}
$("#cmpA").innerHTML = BATCHES.map(x => `<option value="${x.id}">${x.id} · ${x.short}</option>`).join("");
$("#cmpB").innerHTML = BATCHES.map(x => `<option value="${x.id}">${x.id} · ${x.short}</option>`).join("");
$("#cmpA").addEventListener("change", renderCompare);
$("#cmpB").addEventListener("change", renderCompare);

/* ── 杯测 ─────────────────────────── */

function renderCupping() {
  $("#cuppingRows").innerHTML = CUPPING.map((c, i) => `
    <div class="cup-row">
      <div class="cup-name">${c.name}<small>${c.sub}</small></div>
      <input type="range" class="cup-slider" min="6" max="10" step="0.25"
        value="${c.val}" data-i="${i}" aria-label="${c.name}评分">
      <span class="cup-val mono" id="cupVal-${i}">${c.val.toFixed(2)}</span>
    </div>`).join("");
  $$(".cup-slider").forEach(sl => sl.addEventListener("input", () => {
    const v = parseFloat(sl.value);
    $("#cupVal-" + sl.dataset.i).textContent = v.toFixed(2);
    updateCupTotal();
  }));
  updateCupTotal();
}
function updateCupTotal() {
  const sum = $$(".cup-slider").reduce((s, sl) => s + parseFloat(sl.value), 0);
  $("#cupTotal").textContent = (sum / CUPPING.length + 36).toFixed(2); // SCA 惯例 +36
}
$("#cupSaveBtn").addEventListener("click", () => toast("杯测记录已保存到批次档案"));

/* ── 库存 ─────────────────────────── */

let lowCount = 0;
function renderInventory() {
  lowCount = INVENTORY.filter(i => i.stock < i.threshold).length;
  $("#invGrid").innerHTML = INVENTORY.map(i => {
    const low = i.stock < i.threshold;
    const pct = Math.min(100, i.stock / (i.threshold * 2) * 100);
    return `
    <div class="inv-card ${low ? "low" : ""}">
      <div class="inv-top">
        <span class="inv-name">${i.name}</span>
        <span class="inv-origin">${i.origin}</span>
        <span class="inv-badge ${low ? "low" : "ok"}">${low ? "低于安全线" : "充足"}</span>
      </div>
      <div class="inv-num">
        <span class="inv-weight">${i.stock}</span><span class="inv-unit">${i.unit} · 安全线 ${i.threshold}${i.unit}</span>
      </div>
      <div class="inv-bar"><div class="inv-bar-fill" style="width:${pct}%"></div></div>
      <div class="inv-meta"><span>${i.arrival}</span><span class="mono">SKU-${i.name.slice(0, 2).toUpperCase()}</span></div>
    </div>`;
  }).join("");
  if (lowCount > 0) {
    $("#stockAlert").querySelector("span").textContent =
      `${lowCount} 项生豆低于安全库存，建议本周内补货`;
  }
}
$("#alertClose").addEventListener("click", () => $("#stockAlert").classList.add("hidden"));

/* ── 订单 ─────────────────────────── */

const ST_TXT = { pending: "待烘焙", roasting: "烘焙中", shipped: "已发货" };

function renderOrders(filter = "all") {
  const list = ORDERS.filter(o => filter === "all" || o.state === filter);
  $("#orderList").innerHTML = list.map(o => `
    <div class="order-row">
      <div class="order-cust"><b>${o.cust}</b><small>${o.contact}</small></div>
      <span class="order-items">${o.items}</span>
      <span class="order-qty">${o.qty}</span>
      <span class="order-price">${o.price}</span>
      <span class="order-state st-${o.state}">● ${ST_TXT[o.state]}</span>
    </div>`).join("") || `<p style="color:var(--ink-3);padding:20px 4px;">没有符合条件的订单</p>`;
}
$("#orderFilters").addEventListener("click", e => {
  const btn = e.target.closest(".chip"); if (!btn) return;
  $$("#orderFilters .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderOrders(btn.dataset.f);
});
$("#newOrderBtn").addEventListener("click", () => toast("新建订单（原型演示）"));

/* ── 笔记 ─────────────────────────── */

function renderNotes() {
  $("#noteList").innerHTML = NOTES.map((n, i) => `
    <div class="note-card">
      <button class="note-del" data-i="${i}" title="删除这条笔记" aria-label="删除"><i class="ti ti-trash"></i></button>
      <time class="mono">${n.time}</time>
      <p>${n.text}</p>
    </div>`).join("");
  $$(".note-del").forEach(btn => btn.addEventListener("click", () => {
    NOTES.splice(+btn.dataset.i, 1);
    renderNotes();
    toast("已删除");
  }));
}
$("#noteInput").addEventListener("input", e => {
  $("#noteCount").textContent = e.target.value.length + " 字";
});
$("#noteSave").addEventListener("click", () => {
  const v = $("#noteInput").value.trim();
  if (!v) { toast("先写点什么再存吧"); return; }
  const now = new Date();
  NOTES.unshift({
    time: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    text: v
  });
  $("#noteInput").value = "";
  $("#noteCount").textContent = "0 字";
  renderNotes();
  toast("已存入笔记");
});

/* ── 顶栏 ─────────────────────────── */

$("#newRoastBtn").addEventListener("click", () => toast("新建烘焙（原型演示）"));
$("#exportBtn").addEventListener("click", () => toast("导出烘焙报告（原型演示）"));

// 顶栏时钟（轻微的生命感）
function tickClock() {
  const n = new Date();
  $("#clock").textContent = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}
tickClock();
setInterval(tickClock, 30000);

/* ── 初始渲染 ─────────────────────── */

loadBatch(BATCHES[0].id);
renderBatchTable();
renderCompare();
renderCupping();
renderInventory();
renderOrders();
renderNotes();
