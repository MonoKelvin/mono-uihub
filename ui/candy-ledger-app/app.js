/* 糖罐账本 · 交互与假数据 */

let BUDGET = 2000;
const MONTH_DAYS = 17; // 10 月已过去的天数（含今天）
const TODAY = "2026-10-17";
const WEEK = ["一", "二", "三", "四", "五", "六", "日"]; // 10-12 是周一

const CATS = {
  food:    { name: "餐饮", color: "var(--food)",    soft: "var(--food-soft)",    hex: "#f0562a" },
  transit: { name: "交通", color: "var(--transit)", soft: "var(--transit-soft)", hex: "#3d7bf0" },
  shop:    { name: "购物", color: "var(--shop)",    soft: "var(--shop-soft)",    hex: "#f5b31d" },
  fun:     { name: "娱乐", color: "var(--fun)",     soft: "var(--fun-soft)",     hex: "#9067f0" },
  daily:   { name: "日用", color: "var(--daily)",   soft: "var(--daily-soft)",   hex: "#26bfa0" },
  other:   { name: "其他", color: "var(--other)",   soft: "var(--other-soft)",   hex: "#9aa3b8" },
  income:  { name: "收入", color: "var(--income)",  soft: "var(--income-soft)",  hex: "#2e9e5b" }
};
const EXPENSE_CATS = ["food", "transit", "shop", "fun", "daily", "other"];

// 2026-10 的假账本
let entries = [
  { id: 1,  date: "2026-10-17", type: "expense", cat: "food",    title: "手抓饼",       note: "楼下早餐摊",         amount: 12.0 },
  { id: 2,  date: "2026-10-17", type: "expense", cat: "food",    title: "公司食堂",     note: "",                   amount: 38.5 },
  { id: 3,  date: "2026-10-17", type: "expense", cat: "transit", title: "地铁通勤",     note: "二号线",             amount: 4.0 },
  { id: 4,  date: "2026-10-17", type: "expense", cat: "food",    title: "奶茶",         note: "三分糖，去冰",       amount: 16.0 },
  { id: 5,  date: "2026-10-17", type: "expense", cat: "daily",   title: "超市采购",     note: "牛奶和水果",         amount: 86.4 },
  { id: 6,  date: "2026-10-17", type: "expense", cat: "fun",     title: "电影票",       note: "新上映的那部",       amount: 58.0 },
  { id: 7,  date: "2026-10-16", type: "expense", cat: "food",    title: "包子铺",       note: "两个肉包一杯豆浆",   amount: 8.0 },
  { id: 8,  date: "2026-10-16", type: "expense", cat: "transit", title: "打车",         note: "加班太晚",           amount: 23.5 },
  { id: 9,  date: "2026-10-16", type: "expense", cat: "shop",    title: "书店",         note: "《每天都是小春日和》", amount: 45.0 },
  { id: 10, date: "2026-10-16", type: "expense", cat: "daily",   title: "猫粮",         note: "主子一个月的口粮",   amount: 79.0 },
  { id: 11, date: "2026-10-15", type: "expense", cat: "food",    title: "咖喱饭",       note: "",                   amount: 32.0 },
  { id: 12, date: "2026-10-15", type: "expense", cat: "other",   title: "话费充值",     note: "",                   amount: 50.0 },
  { id: 13, date: "2026-10-15", type: "income",  cat: "income",  title: "工资",         note: "九月工资到账",       amount: 7800.0 },
  { id: 14, date: "2026-10-15", type: "expense", cat: "transit", title: "地铁",         note: "去客户那儿",         amount: 4.0 },
  { id: 15, date: "2026-10-15", type: "expense", cat: "fun",     title: "音乐会员",     note: "续费",               amount: 18.0 },
  { id: 16, date: "2026-10-14", type: "expense", cat: "food",    title: "豆浆油条",     note: "",                   amount: 7.5 },
  { id: 17, date: "2026-10-14", type: "expense", cat: "transit", title: "共享单车",     note: "",                   amount: 1.5 },
  { id: 18, date: "2026-10-14", type: "expense", cat: "food",    title: "麻辣香锅",     note: "和室友拼的",         amount: 46.0 },
  { id: 19, date: "2026-10-14", type: "expense", cat: "shop",    title: "护肤精华",     note: "空瓶补货",           amount: 289.0 },
  { id: 20, date: "2026-10-13", type: "expense", cat: "food",    title: "日式定食",     note: "",                   amount: 28.0 },
  { id: 21, date: "2026-10-13", type: "expense", cat: "other",   title: "水电缴费",     note: "",                   amount: 186.0 },
  { id: 22, date: "2026-10-13", type: "expense", cat: "food",    title: "咖啡豆",       note: "手冲用",             amount: 68.0 },
  { id: 23, date: "2026-10-12", type: "expense", cat: "daily",   title: "菜市场",       note: "一周的菜",           amount: 53.2 },
  { id: 24, date: "2026-10-12", type: "expense", cat: "transit", title: "高铁票",       note: "周末回家",           amount: 54.0 },
  { id: 25, date: "2026-10-12", type: "expense", cat: "fun",     title: "游戏月卡",     note: "",                   amount: 30.0 },
  { id: 26, date: "2026-10-11", type: "expense", cat: "food",    title: "三明治",       note: "",                   amount: 6.0 },
  { id: 27, date: "2026-10-11", type: "expense", cat: "shop",    title: "理发",         note: "剪短了一点",         amount: 45.0 },
  { id: 28, date: "2026-10-11", type: "expense", cat: "fun",     title: "livehouse 门票", note: "一直想去的那支乐队", amount: 42.0 },
  { id: 29, date: "2026-10-10", type: "expense", cat: "food",    title: "越南粉",       note: "",                   amount: 26.0 },
  { id: 30, date: "2026-10-10", type: "expense", cat: "transit", title: "打车",         note: "赶时间",             amount: 18.0 },
  { id: 31, date: "2026-10-10", type: "expense", cat: "daily",   title: "一束小雏菊",   note: "",                   amount: 39.0 },
  { id: 32, date: "2026-10-10", type: "expense", cat: "shop",    title: "手机壳和钢化膜", note: "",                 amount: 129.0 },
  { id: 33, date: "2026-10-09", type: "income",  cat: "income",  title: "稿费",         note: "给杂志写的小稿",     amount: 800.0 }
];
let nextId = 34;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const fmt = (n) => n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sum = (list) => list.reduce((a, b) => a + b.amount, 0);
const icon = (cat) => `<svg aria-hidden="true"><use href="#ico-${cat}"></use></svg>`;

// ---------- 汇总 ----------

const expenses = () => entries.filter((e) => e.type === "expense");
const totalExpense = () => sum(expenses());
const totalIncome = () => sum(entries.filter((e) => e.type === "income"));
const dayExpense = (date) => sum(entries.filter((e) => e.date === date && e.type === "expense"));
const activeDays = () => new Set(entries.map((e) => e.date)).size;
const sortedEntries = () => [...entries].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));

function byCategory() {
  const map = {};
  for (const e of expenses()) map[e.cat] = (map[e.cat] || 0) + e.amount;
  return Object.entries(map).map(([key, total]) => ({ key, total })).sort((a, b) => b.total - a.total);
}

function byDay(list) {
  const map = new Map();
  for (const e of list) {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date).push(e);
  }
  return [...map.entries()];
}

function dateLabel(date) {
  if (date === TODAY) return "今天";
  const d = new Date(date + "T12:00:00");
  if ((new Date(TODAY + "T12:00:00") - d) / 86400000 === 1) return "昨天";
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
const weekday = (date) => "周" + WEEK[(new Date(date + "T12:00:00").getDay() + 6) % 7];

function txRow(e) {
  const c = CATS[e.cat];
  const sign = e.type === "income" ? "+" : "−";
  return `<li class="tx-row" data-entry="${e.id}" role="button" tabindex="0" aria-label="查看${esc(e.title)}详情">
    <span class="tx-icon" style="--c-soft:${c.soft}">${icon(e.cat)}</span>
    <div class="tx-main">
      <p class="tx-title">${esc(e.title)}</p>
      <p class="tx-note">${esc(e.note || c.name)}</p>
    </div>
    <span class="tx-amount ${e.type === "income" ? "inc" : ""}">${sign}¥${fmt(e.amount)}</span>
  </li>`;
}

// ---------- 首页 ----------

// 糖罐：罐里剩下的糖果数 = 剩余预算占比，花得越多糖越少
const CANDY_COLORS = ["#ffd66b", "#7ce0c3", "#9cc1ff", "#c9b0ff", "#ffad6e", "#ffc6d4"];
const CANDY_SLOTS = (() => {
  const slots = [];
  for (let row = 0; row < 6; row++) {
    const cy = 102 - row * 12.4;
    const xs = row % 2 ? [50.25, 34.75, 65.75] : [42.5, 58, 27, 73.5];
    xs.forEach((cx, i) => slots.push({ cx: cx + (((row + i) % 3) - 1) * 0.8, cy }));
  }
  return slots;
})();

function renderJar(remainRatio) {
  const count = Math.round(CANDY_SLOTS.length * Math.max(0, Math.min(1, remainRatio)));
  $("#jar-candies").innerHTML = CANDY_SLOTS.slice(0, count).map(({ cx, cy }, i) => {
    const c = CANDY_COLORS[(i * 5 + Math.floor(cy)) % CANDY_COLORS.length];
    return `<g class="candy" style="animation-delay:${120 + i * 55}ms">
      <circle cx="${cx}" cy="${cy}" r="7.4" fill="${c}"/>
      <circle cx="${cx - 2.5}" cy="${cy - 2.6}" r="2.1" fill="#fff" opacity=".75"/>
    </g>`;
  }).join("");
  $("#jar").setAttribute("aria-label", remainRatio < 0 ? `预算糖罐，已超出预算 ${Math.round(-remainRatio * 100)}%` : `预算糖罐，还剩 ${Math.round(remainRatio * 100)}%`);
}

function renderHome() {
  const total = totalExpense();
  const left = BUDGET - total;

  $("#hero-budget-label").textContent = "预算 ¥" + BUDGET.toLocaleString("zh-CN");
  $("#month-total").textContent = fmt(total);
  $("#month-income").textContent = "¥" + fmt(totalIncome());
  $("#today-total").textContent = "¥" + fmt(dayExpense(TODAY));
  $("#hero-note").innerHTML = left >= 0 ? `糖罐里还剩 <b>¥${fmt(left)}</b>` : `超出预算 <b>¥${fmt(-left)}</b>`;
  renderJar(left / BUDGET);
  $("#cat-total").textContent = `本月 ¥${fmt(total)}`;

  const totals = Object.fromEntries(byCategory().map((r) => [r.key, r.total]));
  $("#cat-grid").innerHTML = EXPENSE_CATS.map((key) => `
    <button class="cat-tile" type="button" data-cat="${key}" style="--c-soft:${CATS[key].soft}"
      aria-label="${CATS[key].name} ¥${fmt(totals[key] || 0)}，查看账单">
      ${icon(key)}
      <span class="cat-tile-name">${CATS[key].name}</span>
      <span class="cat-tile-amount">¥${Math.round(totals[key] || 0)}</span>
    </button>`).join("");

  $("#recent-list").innerHTML = sortedEntries().slice(0, 4).map(txRow).join("") || `<li class="empty">还没有记录，点下方 + 记一笔吧</li>`;

  const days = activeDays();
  $("#home-sub").textContent = `十月已经记了 ${days} 天`;
  $("#profile-sub").textContent = `已经记账 ${days} 天`;
  let streak = 0;
  for (let d = new Date(TODAY + "T12:00:00"); entries.some(e => e.date === `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); d.setDate(d.getDate()-1)) streak++;
  $("#streak-pill").textContent = `连续 ${streak} 天`;
}

// ---------- 账单 ----------

let billFilter = "all";
let billCat = null;
let billQuery = "";
const hiddenCats = new Set();

function renderBills() {
  let list = sortedEntries();
  if (billFilter !== "all") list = list.filter((e) => e.type === billFilter);
  if (billCat) list = list.filter((e) => e.cat === billCat);
  if (billQuery) list = list.filter(e => `${e.title} ${e.note} ${CATS[e.cat].name} ${e.amount}`.toLowerCase().includes(billQuery));

  $("#cat-filter").hidden = !billCat;
  if (billCat) $("#cat-filter-label").textContent = `只看${CATS[billCat].name}`;

  const spent = sum(list.filter((e) => e.type === "expense"));
  const earned = sum(list.filter((e) => e.type === "income"));
  $("#bills-sub").textContent = `2026 年十月，共 ${list.length} 笔`;
  $("#bill-out").textContent = "¥" + fmt(spent);
  $("#bill-in").textContent = "¥" + fmt(earned);

  if (!list.length) {
    $("#bill-groups").innerHTML = `<p class="empty">这里还空空的</p>`;
    return;
  }
  $("#bill-groups").innerHTML = byDay(list).map(([date, items]) => `
    <section class="day-group">
      <div class="day-head">
        <span class="day-date">${dateLabel(date)}<em>${weekday(date)}</em></span>
        <span class="day-sum">支出 ¥${fmt(sum(items.filter((e) => e.type === "expense")))}</span>
      </div>
      <div class="list-card"><ul class="tx-list">${items.map(txRow).join("")}</ul></div>
    </section>`).join("");
}

// ---------- 统计 ----------

function renderStats() {
  const total = totalExpense();
  const rows = byCategory();
  const R = 78, C = 2 * Math.PI * R, GAP = 7;
  let offset = 0;
  $("#donut").innerHTML = rows.map((r) => {
    const len = (r.total / total) * C;
    const seg = `<circle cx="100" cy="100" r="${R}" stroke="${CATS[r.key].hex}"
      stroke-dasharray="${Math.max(0.1, len - GAP).toFixed(2)} ${C.toFixed(2)}"
      stroke-dashoffset="${(-offset).toFixed(2)}"></circle>`;
    offset += len;
    return seg;
  }).join("");
  $("#donut-total").textContent = "¥" + fmt(total);
  $("#donut-sub").textContent = `预算用掉 ${Math.round((total / BUDGET) * 100)}%`;
  $("#donut-note").textContent = `共 ${rows.length} 类`;
  $("#donut-legend").innerHTML = rows.map((r) => `
    <li>
      <span class="legend-ico" style="--c-soft:${CATS[r.key].soft}">${icon(r.key)}</span>
      <span class="legend-main">
        <span class="legend-name">${CATS[r.key].name}</span>
        <span class="legend-pct" style="--c:${CATS[r.key].hex}">${Math.round((r.total / total) * 100)}%</span>
      </span>
      <span class="legend-amount">¥${fmt(r.total)}</span>
    </li>`).join("");

  // 本周：10-12（周一）到 10-18（周日）
  const weekDates = Array.from({ length: 7 }, (_, i) => `2026-10-${String(12 + i).padStart(2, "0")}`);
  const days = weekDates.map(dayExpense);
  const max = Math.max(...days, 1);
  $("#week-bars").innerHTML = weekDates.map((d, i) => {
    const v = days[i];
    const isToday = d === TODAY;
    return `<div class="week-col${isToday ? " today" : ""}">
      <span class="week-val">${v ? Math.round(v) : ""}</span>
      <span class="week-bar" style="height:${v ? Math.max(8, (v / max) * 84) : 4}px;animation-delay:${0.05 * i}s"></span>
      <span class="week-day">${isToday ? "今" : WEEK[i]}</span>
    </div>`;
  }).join("");
  $("#week-total").textContent = `合计 ¥${fmt(days.reduce((a, b) => a + b, 0))}`;

  const biggest = expenses().reduce((a, b) => (!a || b.amount > a.amount ? b : a), null);
  $("#max-amount").textContent = "¥" + fmt(biggest?.amount || 0);
  $("#max-desc").textContent = biggest?.title || "暂无支出";
  $("#avg-amount").textContent = "¥" + fmt(total / MONTH_DAYS);
  $("#avg-note").textContent = `按 ${MONTH_DAYS} 天算`;
}

// ---------- 我的 ----------

function renderProfile() {
  const total = totalExpense();
  const pct = Math.min(100, Math.round((total / BUDGET) * 100));
  $("#budget-ring").style.setProperty("--p", pct);
  $("#ring-label").textContent = pct + "%";
  $("#profile-budget").textContent = " / ¥" + BUDGET.toLocaleString("zh-CN");
  $("#profile-spent").textContent = "¥" + fmt(total);
  $("#profile-left").textContent = total <= BUDGET ? `还剩 ¥${fmt(BUDGET - total)}` : `已超出 ¥${fmt(total - BUDGET)}`;
}

// ---------- 记一笔 ----------

const sheet = $("#sheet");
const phone = $("#phone"); // 只用于记一笔面板的开关类名
let amountStr = "";
let sheetType = "expense";
let sheetCat = "food";
let sheetDay = 0;
let closeTimer;
let sheetTrigger;
let sheetClosing = false;

$("#keypad").innerHTML = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) =>
  k === "del"
    ? `<button class="key-btn fn" type="button" data-key="del" aria-label="删除"><i class="ti ti-backspace"></i></button>`
    : `<button class="key-btn" type="button" data-key="${k}">${k}</button>`
).join("");

function renderPicker() {
  const keys = sheetType === "income" ? ["income"] : EXPENSE_CATS.filter(k => !hiddenCats.has(k));
  if (!keys.includes(sheetCat)) sheetCat = keys[0];
  $("#cat-picker").innerHTML = keys.map((key) => `
    <button class="cat-pick${key === sheetCat ? " active" : ""}" type="button" data-cat="${key}"
      aria-pressed="${key === sheetCat}" style="--c:${CATS[key].color};--c-soft:${CATS[key].soft}">
      ${icon(key)}${CATS[key].name}</button>`).join("");
  showAmountCat();
}

function showAmountCat() {
  const el = $("#amount-cat");
  el.style.setProperty("--c-soft", CATS[sheetCat].soft);
  el.innerHTML = icon(sheetCat);
  el.classList.remove("bump");
  void el.offsetWidth; // 重新触发弹跳
  el.classList.add("bump");
}

function updateAmount() {
  const display = $("#amount-display");
  display.textContent = amountStr || "0.00";
  display.classList.toggle("zero", !amountStr);
  $("#amount-field").classList.toggle("filled", !!amountStr);
}

function pressKey(k) {
  if (k === "del") amountStr = amountStr.slice(0, -1);
  else if (k === ".") {
    if (amountStr.includes(".")) return;
    amountStr = (amountStr || "0") + ".";
  } else {
    const dot = amountStr.indexOf(".");
    if (dot > -1 && amountStr.length - dot > 2) return; // 最多两位小数
    if (dot < 0 && amountStr.length >= 6) return;
    amountStr = amountStr === "0" ? k : amountStr + k;
  }
  updateAmount();
}

function setPressed(selector, match) {
  $$(selector).forEach((b) => {
    const on = match(b);
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
}

function openSheet() {
  sheetTrigger = document.activeElement;
  sheetClosing = false;
  amountStr = "";
  sheetType = "expense";
  sheetCat = "food";
  sheetDay = 0;
  updateAmount();
  renderPicker();
  setPressed(".seg-btn", (b) => b.dataset.type === "expense");
  setPressed(".day-chip", (b) => b.dataset.day === "0");
  $("#note-input").value = "";
  clearTimeout(closeTimer);
  sheet.hidden = false;
  // 先让浏览器完成一帧布局，再打开，过渡才会生效
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (sheetClosing) return;
    phone.classList.add("sheet-open");
    $("#screen").inert = true; $(".tabbar").inert = true;
    $("#sheet-close").focus({preventScroll:true});
  }));
}

function closeSheet() {
  sheetClosing = true;
  $("#screen").inert = false; $(".tabbar").inert = false;
  sheetTrigger?.focus({preventScroll:true});
  phone.classList.remove("sheet-open");
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => { sheet.hidden = true; }, 340);
}

function saveEntry() {
  if (sheet.hidden || sheetClosing) return;
  const value = Math.round(parseFloat(amountStr) * 100) / 100;
  if (!Number.isFinite(value) || value <= 0) {
    toast("先输入金额吧");
    return;
  }
  const d = new Date(TODAY + "T12:00:00");
  d.setDate(d.getDate() - sheetDay);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const note = $("#note-input").value.trim();
  entries.push({ id: nextId++, date, type: sheetType, cat: sheetCat, title: note || CATS[sheetCat].name, note: "", amount: value });
  closeSheet();
  renderAll();
  toast(`本次演示已记录 · ${sheetType === "income" ? "+" : "−"}¥${fmt(value)}`, "ti-circle-check");
}

// ---------- 通用 ----------

let toastTimer;
function toast(msg, iconName) {
  const el = $("#toast");
  el.innerHTML = (iconName ? `<i class="ti ${iconName}" aria-hidden="true"></i>` : "") + `<span>${esc(msg)}</span>`;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1900);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function switchTab(name) {
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  $$(".tab").forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle("active", on);
    t.setAttribute("aria-current", on ? "page" : "false");
  });
  $("#screen").scrollTop = 0;
}

function renderAll() {
  renderHome();
  renderBills();
  renderStats();
  renderProfile();
}

// ---------- 事件绑定 ----------

$$(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));
$("#fab").addEventListener("click", openSheet);
$("#sheet-close").addEventListener("click", closeSheet);
$("#scrim").addEventListener("click", closeSheet);
$("#save-btn").addEventListener("click", saveEntry);
$("#bell-btn").addEventListener("click", showReminder);

$("#see-all").addEventListener("click", () => {
  billCat = null; billFilter = "all"; billQuery = ""; $("#bill-search").value = "";
  setPressed(".filter-chip", b => b.dataset.filter === "all");
  renderBills();
  switchTab("bills");
});

$("#cat-grid").addEventListener("click", (e) => {
  const tile = e.target.closest("[data-cat]");
  if (!tile) return;
  billQuery = ""; $("#bill-search").value = "";
  billCat = tile.dataset.cat;
  billFilter = "expense";
  setPressed(".filter-chip", (b) => b.dataset.filter === "expense");
  renderBills();
  switchTab("bills");
});

$("#cat-filter").addEventListener("click", () => {
  billCat = null;
  renderBills();
});

$("#keypad").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-key]");
  if (btn) pressKey(btn.dataset.key);
});

$("#cat-picker").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  sheetCat = btn.dataset.cat;
  setPressed(".cat-pick", (b) => b === btn);
  showAmountCat();
});

$$(".seg-btn").forEach((btn) => btn.addEventListener("click", () => {
  sheetType = btn.dataset.type;
  setPressed(".seg-btn", (b) => b === btn);
  renderPicker();
}));

$$(".day-chip").forEach((btn) => btn.addEventListener("click", () => {
  sheetDay = Number(btn.dataset.day);
  setPressed(".day-chip", (b) => b === btn);
}));

$$(".filter-chip").forEach((btn) => btn.addEventListener("click", () => {
  billFilter = btn.dataset.filter;
  if (billFilter === "income") billCat = null;
  setPressed(".filter-chip", (b) => b === btn);
  renderBills();
}));

$$(".switch").forEach((sw) => sw.addEventListener("click", () => {
  const on = sw.getAttribute("aria-pressed") !== "true";
  sw.setAttribute("aria-pressed", on);
  sw.setAttribute("aria-checked", on);
  toast(on ? "已开启本页提醒 · 页面打开时有效" : "已关闭本页提醒");
}));

$$("[data-toast]").forEach((b) => b.addEventListener("click", () => toast(b.dataset.toast)));

document.addEventListener("keydown", (e) => {
  if ($("#modal").hidden) {
    if (sheet.hidden || sheetClosing) return;
    if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
    if (e.key === "Tab") {
      const buttons = [...sheet.querySelectorAll('button:not([disabled]), input')];
      const first = buttons[0], last = buttons[buttons.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (e.target.matches("input, textarea, select")) return;
    if (/^[0-9.]$/.test(e.key)) { e.preventDefault(); pressKey(e.key); }
    else if (e.key === "Backspace") { e.preventDefault(); pressKey("del"); }
    else if (e.key === "Enter" && !e.target.closest("button")) { e.preventDefault(); saveEntry(); }
    return;
  }
  if (e.key === "Escape") { e.preventDefault(); closeDialog(); }
});

// ---------- 本地演示工具（弹层限定在手机框内） ----------
const modal = $("#modal");
const modalCard = $(".modal-card");
let dialogTrigger;
let reminderTime = "21:00";
let remindedDate = "";

function showDialog(title, body) {
  if (modal.hidden) {
    dialogTrigger = document.activeElement;
    $("#screen").inert = true;
    $(".tabbar").inert = true;
  }
  $("#utility-title").textContent = title;
  $("#utility-content").innerHTML = body;
  modal.hidden = false;
  modalCard.scrollTop = 0;
  $("#utility-close").focus({ preventScroll: true });
}
function closeDialog() {
  if (modal.hidden) return;
  modal.hidden = true;
  const sheetOpen = $("#phone").classList.contains("sheet-open");
  $("#screen").inert = sheetOpen;
  $(".tabbar").inert = sheetOpen;
  if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
}
function formField(label, name, value, type = "text", attrs = "") {
  return `<label class="field-label">${label}<input class="form-input" name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
}
function moneyField(label, name, value) {
  return `<label class="field-label">${label}<span class="money-input"><span>¥</span><input name="${name}" type="text" inputmode="decimal" autocomplete="off" value="${esc(value)}"></span></label>`;
}
const readMoney = (raw) => Math.round(parseFloat(String(raw).replace(/[,，\s]/g, "")) * 100) / 100;

// 日期步进器：本原型固定展示 2026-10-01 ~ 10-17
const DATE_MIN = "2026-10-01", DATE_MAX = "2026-10-17";
function dateStepperField(value) {
  return `<span class="field-label">日期<span class="date-stepper"><button type="button" data-date-step="-1" aria-label="前一天"><i class="ti ti-chevron-left"></i></button><output id="date-out">${dateStepLabel(value)}</output><button type="button" data-date-step="1" aria-label="后一天"><i class="ti ti-chevron-right"></i></button></span></span>`;
}
function dateStepLabel(value) {
  const d = new Date(value + "T12:00:00");
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日<em>${weekday(value)}</em>`;
}
function bindDateStepper(value, onChange) {
  const out = $("#date-out");
  const buttons = $$("[data-date-step]");
  const paint = () => {
    out.innerHTML = dateStepLabel(value);
    buttons[0].disabled = value <= DATE_MIN;
    buttons[1].disabled = value >= DATE_MAX;
  };
  buttons.forEach((b) => b.onclick = () => {
    const d = new Date(value + "T12:00:00");
    d.setDate(d.getDate() + Number(b.dataset.dateStep));
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (next < DATE_MIN || next > DATE_MAX) return;
    value = next; paint(); onChange(value);
  });
  paint();
}

function catChoiceHtml(selected, includeIncome) {
  const keys = includeIncome ? [...EXPENSE_CATS, "income"] : EXPENSE_CATS;
  return `<div class="cat-choice" role="group" aria-label="选择分类">${keys.map((k) => `<button type="button" data-choice="${k}" aria-pressed="${k === selected}" class="${k === selected ? "active" : ""}" style="--c:${CATS[k].color};--c-soft:${CATS[k].soft}">${icon(k)}${CATS[k].name}</button>`).join("")}</div>`;
}
function bindCatChoice(selected, onChange) {
  $$("#utility-content [data-choice]").forEach((b) => b.onclick = () => {
    $$("#utility-content [data-choice]").forEach((x) => {
      const on = x === b;
      x.classList.toggle("active", on);
      x.setAttribute("aria-pressed", on);
    });
    onChange(b.dataset.choice);
  });
}

function showDetail(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  const c = CATS[e.cat];
  showDialog("账单详情", `<div class="detail-hero"><span class="tx-icon" style="--c-soft:${c.soft}">${icon(e.cat)}</span><h3>${esc(e.title)}</h3><b>${e.type === "income" ? "+" : "−"}¥${fmt(e.amount)}</b></div><div class="detail-facts"><p><span>分类</span><b>${c.name}</b></p><p><span>日期</span><b>${e.date} ${weekday(e.date)}</b></p><p><span>备注</span><b>${esc(e.note || "没有备注")}</b></p></div><div class="dialog-actions"><button class="secondary-btn" id="entry-edit" type="button">编辑</button><button class="danger-btn" id="entry-delete" type="button">删除</button></div>`);
  $("#entry-edit").onclick = () => editEntry(id);
  $("#entry-delete").onclick = () => {
    showDialog("删除这笔账？", `<p class="helper-text">${esc(e.title)} · ¥${fmt(e.amount)}<br>删除后会同步更新统计，可在提示中撤销。</p><div class="dialog-actions"><button class="secondary-btn" id="delete-cancel">保留</button><button class="danger-btn" id="delete-confirm">确认删除</button></div>`);
    $("#delete-cancel").onclick = () => showDetail(id);
    $("#delete-confirm").onclick = () => {
      entries = entries.filter(x => x.id !== id); closeDialog(); renderAll();
      toast("已删除 · 本次演示可撤销");
      const undo = document.createElement("button"); undo.type = "button"; undo.className = "undo-btn"; undo.textContent = "撤销";
      undo.onclick = () => { if (!entries.some(x => x.id === id)) entries.push(e); renderAll(); toast("已恢复这笔账"); };
      $("#toast").append(undo); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 7000);
    };
  };
}
function editEntry(id) {
  const e = entries.find(x => x.id === id);
  let pickedCat = e.cat, pickedDate = e.date;
  showDialog("编辑账单", `<form id="entry-form">${formField("事项", "title", e.title, "text", 'maxlength="40"')}${moneyField("金额", "amount", e.amount.toFixed(2))}${dateStepperField(e.date)}<span class="field-label">分类</span>${catChoiceHtml(e.cat, true)}${formField("备注", "note", e.note, "text", 'maxlength="100"')}<p class="helper-text">本原型展示 2026 年十月，日期可选 1–17 日。</p><button class="primary-btn" type="submit">保存修改</button></form>`);
  bindCatChoice(e.cat, (k) => { pickedCat = k; });
  bindDateStepper(e.date, (d) => { pickedDate = d; });
  $("#entry-form").onsubmit = ev => {
    ev.preventDefault();
    const f = ev.currentTarget;
    const title = f.elements.title.value.trim();
    if (!title) { toast("事项不能为空"); f.elements.title.focus(); return; }
    const amount = readMoney(f.elements.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) { toast("金额要大于 0 哦"); f.elements.amount.focus(); return; }
    Object.assign(e, { title, amount, date: pickedDate, cat: pickedCat, type: pickedCat === "income" ? "income" : "expense", note: f.elements.note.value.trim() });
    closeDialog(); renderAll(); toast("已更新本次演示账单");
  };
}
function showBudget() {
  showDialog("给糖罐设个预算", `<form id="budget-form">${moneyField("本月预算", "budget", BUDGET.toLocaleString("zh-CN"))}<div class="preset-row" role="group" aria-label="快捷预算">${[1500, 2000, 3000].map(n => `<button class="preset-chip" type="button" data-budget="${n}">${n.toLocaleString()}</button>`).join("")}</div><p class="helper-text">预算改变后，糖罐余量和统计会同步更新。</p><button class="primary-btn" type="submit">保存预算</button></form>`);
  const input = $("#budget-form").elements.budget;
  const syncChips = () => {
    const v = readMoney(input.value);
    $$("[data-budget]").forEach(b => b.classList.toggle("active", Number(b.dataset.budget) === v));
  };
  syncChips();
  input.addEventListener("input", syncChips);
  $$("[data-budget]").forEach(b => b.onclick = () => { input.value = Number(b.dataset.budget).toLocaleString("zh-CN"); syncChips(); });
  $("#budget-form").onsubmit = ev => {
    ev.preventDefault();
    const v = readMoney(input.value);
    if (!Number.isFinite(v) || v <= 0) { toast("预算要大于 0 哦"); input.focus(); return; }
    BUDGET = v; renderAll(); closeDialog(); toast("本次演示预算已更新");
  };
}
function showCategories() {
  showDialog("常用分类", `<p class="helper-text">选择「记一笔」显示的支出分类，至少保留一项。已有账单不会受影响。</p>${EXPENSE_CATS.map(k => `<div class="cat-toggle"><span class="tx-icon" style="--c-soft:${CATS[k].soft}">${icon(k)}</span><span>${CATS[k].name}</span><button class="switch" type="button" role="switch" aria-checked="${!hiddenCats.has(k)}" aria-pressed="${!hiddenCats.has(k)}" data-category="${k}" aria-label="显示${CATS[k].name}"></button></div>`).join("")}`);
  $$("[data-category]").forEach(sw => sw.onclick = () => {
    const key = sw.dataset.category;
    const turningOff = sw.getAttribute("aria-checked") === "true";
    if (turningOff && EXPENSE_CATS.filter(k => !hiddenCats.has(k)).length === 1) { toast("至少保留一个分类"); return; }
    if (turningOff) hiddenCats.add(key); else hiddenCats.delete(key);
    const on = !hiddenCats.has(key);
    sw.setAttribute("aria-checked", on);
    sw.setAttribute("aria-pressed", on);
  });
}
function showReminder() {
  let h = Number(reminderTime.split(":")[0]);
  let m = Math.round(Number(reminderTime.split(":")[1]) / 5) * 5 % 60;
  showDialog("记账小提醒", `<span class="field-label">每天提醒时间</span><div class="time-stepper"><div class="time-unit"><button type="button" data-time-step="h-1" aria-label="减一小时"><i class="ti ti-minus"></i></button><output id="time-h">${String(h).padStart(2, "0")}<em>时</em></output><button type="button" data-time-step="h+1" aria-label="加一小时"><i class="ti ti-plus"></i></button></div><div class="time-unit"><button type="button" data-time-step="m-1" aria-label="减五分钟"><i class="ti ti-minus"></i></button><output id="time-m">${String(m).padStart(2, "0")}<em>分</em></output><button type="button" data-time-step="m+1" aria-label="加五分钟"><i class="ti ti-plus"></i></button></div></div><div class="preset-row" role="group" aria-label="常用时间">${["20:00", "21:00", "21:30", "22:00"].map(t => `<button class="preset-chip" type="button" data-time-preset="${t}">${t}</button>`).join("")}</div><p class="helper-text">仅在本页面保持打开且提醒开关开启时显示站内提示。不发送系统通知，关闭页面后不会提醒。</p><button class="primary-btn" type="button" id="reminder-save">保存提醒时间</button>`);
  const hOut = $("#time-h"), mOut = $("#time-m");
  const paint = () => {
    hOut.innerHTML = String(h).padStart(2, "0") + "<em>时</em>";
    mOut.innerHTML = String(m).padStart(2, "0") + "<em>分</em>";
    $$("[data-time-preset]").forEach(b => b.classList.toggle("active", b.dataset.timePreset === `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`));
  };
  $$("[data-time-step]").forEach(b => b.onclick = () => {
    const [unit, dir] = b.dataset.timeStep.split(/[+-]/);
    if (unit === "h") h = (h + Number(b.dataset.timeStep.slice(1)) + 24) % 24;
    else m = (m + Number(b.dataset.timeStep.slice(1)) * 5 + 60) % 60;
    paint();
  });
  $$("[data-time-preset]").forEach(b => b.onclick = () => { [h, m] = b.dataset.timePreset.split(":").map(Number); paint(); });
  paint();
  $("#reminder-save").onclick = () => {
    reminderTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    remindedDate = "";
    closeDialog(); toast("本页提醒时间已设为 " + reminderTime);
  };
}
function exportCSV() {
  const cell = v => '"'+String(/^[=+@\-\t\r]/.test(String(v)) ? "'"+v : v).replace(/"/g,'""')+'"';
  const rows = [["日期","收支","分类","事项","备注","金额"],...sortedEntries().map(e=>[e.date,e.type==="income"?"收入":"支出",CATS[e.cat].name,e.title,e.note,e.amount.toFixed(2)])];
  const url=URL.createObjectURL(new Blob(["\ufeff"+rows.map(r=>r.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a"); a.href=url; a.download="糖罐账本-2026-10.csv"; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("已生成本次演示账单 CSV");
}
function initTools() {
  $("#utility-close").onclick = closeDialog;
  $("#modal-scrim").onclick = closeDialog;
  $("#hero-budget").onclick=showBudget; $("#budget-card").onclick=showBudget;
  $("#budget-card").onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();showBudget();}};
  $("#bill-search").oninput=ev=>{billQuery=ev.target.value.trim().toLowerCase();renderBills();};
  $("#row-cats").onclick=showCategories; $("#row-report").onclick=()=>switchTab("stats"); $("#row-export").onclick=exportCSV;
  [$("#recent-list"),$("#bill-groups")].forEach(list=>{
    list.addEventListener("click",ev=>{const row=ev.target.closest("[data-entry]");if(row)showDetail(Number(row.dataset.entry));});
    list.addEventListener("keydown",ev=>{if(ev.key!=="Enter"&&ev.key!==" ")return;const row=ev.target.closest("[data-entry]");if(row){ev.preventDefault();showDetail(Number(row.dataset.entry));}});
  });
  $("#amount-field").onclick=()=>$("#keypad button").focus();
  $("#note-input").maxLength=100;
  setInterval(()=>{
    const now=new Date(), date=now.toLocaleDateString("en-CA"), time=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
    if ($(".switch").getAttribute("aria-checked")==="true" && time===reminderTime && remindedDate!==date) { remindedDate=date;toast("到记账时间啦，给今天留一笔小记录吧"); }
  },30000);
}

// ---------- 视口适配：手机框用 CSS clamp + aspect-ratio 自适应，无需 JS ----------

initTools();
renderAll();
// 糖果只在首次进入时掉落一次，之后增删记账不再重播
setTimeout(() => $("#jar").classList.remove("pop"), 2200);
