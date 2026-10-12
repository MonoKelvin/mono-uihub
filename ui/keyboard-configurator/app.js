/* 衡 HENG · 定制工坊 —— 原型交互 */

const $ = (s, el = document) => el.querySelector(s);

/* ============ 数据 ============ */

const CASES = [
  { id: "GN", name: "石墨灰", sub: "喷砂阳极氧化", price: 0, hex: "#4A4D49", tag: "经典" },
  { id: "SL", name: "月岩银", sub: "细喷砂工艺", price: 40, hex: "#B9BBAF" },
  { id: "NV", name: "墨夜蓝", sub: "微弧氧化", price: 60, hex: "#2E3742", tag: "热门" },
  { id: "MG", name: "曜石黑", sub: "类肤涂层", price: 60, hex: "#21231F" },
  { id: "EG", name: "燕麦米", sub: "电泳工艺", price: 40, hex: "#CFC9B4" },
  { id: "VN", name: "原铝色", sub: "拉丝原色", price: 0, hex: "#9AA0A2" },
];

const SWITCHES = [
  { id: "A28", name: "A28 线性红", sub: "顺滑直上直下", price: 0, act: 45, pre: 2.0, total: 4.0, material: "POM", tag: "口碑之选" },
  { id: "K75", name: "K75 静音茶", sub: "段落静音", price: 45, act: 55, pre: 2.2, total: 4.0, material: "尼龙" },
  { id: "J92", name: "J92 提前黄金", sub: "短键程触发快", price: 60, act: 50, pre: 1.2, total: 3.4, material: "POM" },
  { id: "C60", name: "C60 厚润蓝", sub: "Click 段落感", price: 30, act: 60, pre: 2.4, total: 4.0, material: "POM" },
  { id: "M05", name: "M05 磁轴", sub: "可调触发行程", price: 120, act: 40, pre: 1.1, total: 3.3, material: "霍尔", tag: "电竞" },
  { id: "S88", name: "S88 超重黑", sub: "重手感强回弹", price: 45, act: 80, pre: 2.5, total: 4.4, material: "尼龙" },
];

const KEYCAPS = [
  { id: "PW", name: "纸白 PBT", sub: "热升华侧刻", price: 0, hex: "#E9E6DB", ink: "#565A50", tag: "经典" },
  { id: "BK", name: "深墨 PBT", sub: "热升华正刻", price: 30, hex: "#33362F", ink: "#C9CBBF" },
  { id: "GR", name: "苔绿 PBT", sub: "二色成型", price: 60, hex: "#5C6B54", ink: "#E5E3D3" },
  { id: "MU", name: "暮蓝 ASA", sub: "高球帽二色", price: 80, hex: "#46566B", ink: "#DEE0D6", tag: "热门" },
  { id: "CR", name: "陶土 PBT", sub: "热升华正刻", price: 60, hex: "#A5573A", ink: "#EFEBDF" },
  { id: "IV", name: "象牙 ABS", sub: "细腻光泽感", price: 40, hex: "#EFE9D8", ink: "#565A50" },
];

const BASE_PRICE = 899;

/* 65% 键位布局（列跨度 · 行定位用 grid-template） */
const ROWS = [
  [
    { w: 1, k: "ESC" }, { w: 1, k: "1" }, { w: 1, k: "2" }, { w: 1, k: "3" }, { w: 1, k: "4" }, { w: 1, k: "5" }, { w: 1, k: "6" },
    { w: 1, k: "7" }, { w: 1, k: "8" }, { w: 1, k: "9" }, { w: 1, k: "0" }, { w: 1, k: "-" }, { w: 1, k: "=" }, { w: 2, k: "⌫" },
  ],
  [
    { w: 1.5, k: "TAB" }, { w: 1, k: "Q" }, { w: 1, k: "W" }, { w: 1, k: "E" }, { w: 1, k: "R" }, { w: 1, k: "T" },
    { w: 1, k: "Y" }, { w: 1, k: "U" }, { w: 1, k: "I" }, { w: 1, k: "O" }, { w: 1, k: "P" }, { w: 1, k: "[" }, { w: 1, k: "]" }, { w: 1.5, k: "\\" },
  ],
  [
    { w: 1.75, k: "CAP" }, { w: 1, k: "A" }, { w: 1, k: "S" }, { w: 1, k: "D" }, { w: 1, k: "F" }, { w: 1, k: "G" },
    { w: 1, k: "H" }, { w: 1, k: "J" }, { w: 1, k: "K" }, { w: 1, k: "L" }, { w: 1, k: ";" }, { w: 1, k: "'" }, { w: 2.25, k: "RET" },
  ],
  [
    { w: 2.25, k: "SHF" }, { w: 1, k: "Z" }, { w: 1, k: "X" }, { w: 1, k: "C" }, { w: 1, k: "V" },
    { w: 1, k: "B" }, { w: 1, k: "N" }, { w: 1, k: "M" }, { w: 1, k: "," }, { w: 1, k: "." }, { w: 1, k: "/" }, { w: 1.75, k: "⇧" }, { w: 1, k: "↑" },
  ],
  [
    { w: 1.25, k: "CTL" }, { w: 1.25, k: "WIN" }, { w: 1.25, k: "ALT" }, { w: 6.25, k: "SPACE" },
    { w: 1.25, k: "ALT" }, { w: 1, k: "FN" }, { w: 1, k: "←" }, { w: 1, k: "↓" }, { w: 1, k: "→" },
  ],
];

/* ============ 状态 ============ */

const state = { case: "GN", sw: "A28", cap: "PW", cart: 0 };

const fmt = n => "¥" + n.toLocaleString("zh-CN");

/* ============ 渲染键盘 ============ */

const board = $("#board");

function buildBoard() {
  const CASE_GAP = 2.6; // 键间隙 %
  ROWS.forEach((row, ri) => {
    const rowEl = document.createElement("div");
    rowEl.className = "krow";
    const top = 5 + ri * 19;
    rowEl.style.cssText = `top:${top}%; left:3.4%; right:3.4%; height:15%; display:grid; grid-template-columns:${row.map(k => `${k.w}fr`).join(" ")}; gap:${CASE_GAP}%;`;
    row.forEach(key => {
      const el = document.createElement("div");
      el.className = "key";
      el.textContent = key.k === "SPACE" ? "" : key.k;
      if (key.k === "SPACE") el.setAttribute("aria-label", "空格");
      const sw = document.createElement("span");
      sw.className = "sw";
      el.appendChild(sw);
      rowEl.appendChild(el);
    });
    board.appendChild(rowEl);
  });
  // 拔键视图标注引线
  const co = document.createElement("div");
  co.className = "callout co-x";
  co.style.cssText = "left:6%; top:2%; width:22%;";
  co.innerHTML = '<span class="callout-label" style="left:2px; top:-16px;">SWITCH</span>';
  board.appendChild(co);
}

function paintBoard() {
  const c = CASES.find(x => x.id === state.case);
  const cap = KEYCAPS.find(x => x.id === state.cap);
  const kcase = $(".kcase") || (() => {
    const el = document.createElement("div");
    el.className = "kcase";
    board.prepend(el);
    return el;
  })();
  kcase.style.background = `linear-gradient(160deg, ${c.hex}F2, ${c.hex})`;
  board.querySelectorAll(".key").forEach(k => {
    k.style.background = `linear-gradient(180deg, ${cap.hex}, ${cap.hex})`;
    k.style.color = cap.ink;
  });
  $("#dimYv").textContent = "102";
  $("#dimXv").textContent = "315";
  $("#tbNo").textContent = "HS-65-" + state.case;
}

/* ============ 渲染面板 ============ */

const panel = $("#panel");
const STEPS = [
  { no: "1", title: "外壳", list: CASES, key: "case", note: "6063-T5 铝合金一体 CNC，GASKET 结构。阳极氧化层色差以实物为准。" },
  { no: "2", title: "轴体", list: SWITCHES, key: "sw", note: "出厂全润，附赠同款备用轴 4 颗。参数为实验室抽测均值，公差 ±5gf。" },
  { no: "3", title: "键帽", list: KEYCAPS, key: "cap", note: "68 键兼容 65% 配列。PBT 厚度 1.4mm，二色成型字符永不磨损。" },
];

function optChip(item, kind) {
  if (kind === "sw") {
    return `<div class="opt-chip force-ico"><i class="ti ti-bolt"></i></div>`;
  }
  return `<div class="opt-chip" style="background:linear-gradient(160deg, ${item.hex}, ${item.hex})"></div>`;
}

function renderPanel() {
  panel.innerHTML = "";
  STEPS.forEach((step, si) => {
    const sec = document.createElement("section");
    const done = !!state[step.key];
    sec.innerHTML = `
      <div class="step-head ${done ? "done" : ""}">
        <span class="step-no mono">${step.no}</span>
        <span class="step-title">${step.title}</span>
        <span class="step-done"><i class="ti ti-circle-check"></i></span>
      </div>
      <div class="opts"></div>
      <p class="step-note">${step.note}</p>
      ${si < STEPS.length - 1 ? '<hr class="divider">' : ""}
    `;
    const opts = $(".opts", sec);
    step.list.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "opt" + (state[step.key] === item.id ? " on" : "");
      btn.setAttribute("aria-pressed", state[step.key] === item.id);
      btn.innerHTML = `
        ${item.tag ? `<span class="opt-tag ${item.tag === "热门" ? "hot" : ""}">${item.tag}</span>` : ""}
        ${optChip(item, step.key)}
        <span class="opt-name">${item.name}</span>
        <span class="opt-sub">${item.sub}</span>
        <span class="opt-price mono">${item.price === 0 ? "含在基础价内" : "+" + fmt(item.price)}</span>
      `;
      btn.addEventListener("click", () => {
        if (state[step.key] === item.id) return;
        state[step.key] = item.id;
        // 键盘上先来一个受击反馈
        board.style.transform = "scale(0.995)";
        requestAnimationFrame(() => { board.style.transform = ""; });
        renderAll();
        toast(`${step.title}已选：${item.name}`);
      });
      opts.appendChild(btn);
    });
    // 轴体步骤附参数条
    if (step.key === "sw") {
      const cur = SWITCHES.find(x => x.id === state.sw);
      const fb = document.createElement("div");
      fb.innerHTML = `
        <div class="fbar-row"><span class="fbar-label">触发压力</span><div class="fbar-track"><div class="fbar-fill" style="width:${cur.act / 90 * 100}%"></div></div><span class="fbar-val mono">${cur.act} gf</span></div>
        <div class="fbar-row"><span class="fbar-label">预行程</span><div class="fbar-track"><div class="fbar-fill" style="width:${cur.pre / 3 * 100}%"></div></div><span class="fbar-val mono">${cur.pre.toFixed(1)} mm</span></div>
        <div class="fbar-row"><span class="fbar-label">总行程</span><div class="fbar-track"><div class="fbar-fill" style="width:${cur.total / 4.5 * 100}%"></div></div><span class="fbar-val mono">${cur.total.toFixed(1)} mm</span></div>
      `;
      fb.querySelectorAll(".fbar-row").forEach(r => r.classList.add("now"));
      sec.insertBefore(fb, $(".step-note", sec));
    }
    panel.appendChild(sec);
  });
}

/* ============ 汇总 ============ */

function currentTotal() {
  return BASE_PRICE
    + CASES.find(x => x.id === state.case).price
    + SWITCHES.find(x => x.id === state.sw).price
    + KEYCAPS.find(x => x.id === state.cap).price;
}

function renderSummary() {
  const c = CASES.find(x => x.id === state.case);
  const sw = SWITCHES.find(x => x.id === state.sw);
  const cap = KEYCAPS.find(x => x.id === state.cap);
  $("#sumCode").textContent = `HS-65 / ${state.case} / ${state.sw} / ${state.cap}`;
  $("#sumText").textContent = `${c.name}外壳，${sw.name}，${cap.name}`;
  $("#price").textContent = fmt(currentTotal());
  $("#modelSub").textContent = `65% 配列 · 68 键 · ${sw.material}轴心`;
}

function renderAll() {
  paintBoard();
  renderPanel();
  renderSummary();
}

/* ============ 交互 ============ */

/* 视图切换 */
document.querySelectorAll(".vt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".vt").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("on");
    btn.setAttribute("aria-pressed", "true");
    board.classList.toggle("exp-view", btn.dataset.view === "exp");
  });
});

/* 加入购物车 */
$("#addBtn").addEventListener("click", () => {
  state.cart++;
  const n = $("#cartN");
  n.hidden = false;
  n.textContent = state.cart;
  n.animate([{ transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
  toast(`已加入购物车：${$("#cfgName").value || "HS-65 定制配置"}`);
});

/* 保存配置单（原型：本地反馈） */
$("#saveBtn").addEventListener("click", () => {
  try {
    localStorage.setItem("heng-config", JSON.stringify({ ...state, name: $("#cfgName").value, at: Date.now() }));
    toast("配置单已保存到本机");
  } catch { toast("功能开发中"); }
});

/* 恢复出厂 */
$("#resetBtn").addEventListener("click", () => {
  Object.assign(state, { case: "GN", sw: "A28", cap: "PW" });
  $("#cfgName").value = "";
  renderAll();
  toast("已恢复出厂配置");
});

/* 购物车 */
$("#cartBtn").addEventListener("click", () => {
  toast(state.cart ? `购物车内有 ${state.cart} 台定制配置` : "购物车是空的，先配一台吧");
});

/* Toast */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  $("#toastMsg").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ============ 启动 ============ */

$("#tbDate").textContent = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
buildBoard();
renderAll();
