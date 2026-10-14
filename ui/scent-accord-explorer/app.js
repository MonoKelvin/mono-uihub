/* ══════════ 暮屿 MUYU · 香调探索 ══════════ */

const FRAGRANCES = {
  iris: {
    no: "No.02", ghost: "02", name: "鸢尾与雾", latin: "Iris & Mists",
    desc: "鸢尾根在地下沉睡三年才被唤醒。这支香从叶子被雾打湿的青涩开始，落进粉感十足的根茎气息，最后只剩一层薄薄的麝香，像清晨没来得及收的被子。",
    conc: "18%", last: "6–8 小时", mood: "清冷 · 粉感 · 静",
    price: "¥ 1,280", vol: "50 ml",
    stages: {
      top:   { time: "0 – 15 min",   tag: "初见", line: "叶子与果皮被掐破的一瞬，明亮、水汽、微凉。", vol: 72, notes: ["紫罗兰叶", "青梨", "白茶", "佛手柑"] },
      heart: { time: "15 – 120 min", tag: "相认", line: "雾散之后，粉感的鸢尾根浮上来，安静、干燥、几乎不甜。", vol: 55, notes: ["佛罗伦萨鸢尾根", "紫罗兰", "旱金莲"] },
      base:  { time: "2 – 8 hrs",    tag: "余温", line: "一层薄麝香贴着皮肤，像夜里忘收的亚麻被。", vol: 30, notes: ["白麝香", "雪松", "亚麻"] },
    },
  },
  fig: {
    no: "No.05", ghost: "05", name: "无花果园之夜", latin: "Fig Orchard at Night",
    desc: "白日果园的甜被夜色收走，只剩叶子的青绿和树皮的苦。它闻起来不像水果，更像站在果园边缘的人：手里有一杯微温的椰乳，脚边是潮湿的土。",
    conc: "20%", last: "8–10 小时", mood: "青绿 · 奶感 · 深夜",
    price: "¥ 1,380", vol: "50 ml",
    stages: {
      top:   { time: "0 – 20 min",   tag: "初见", line: "叶柄被掐断的奶绿，青得发亮，甜意被夜气压得很低。", vol: 78, notes: ["无花果叶", "绿椰乳", "柠檬叶"] },
      heart: { time: "20 – 150 min", tag: "相认", line: "果肉的奶甜慢慢浮现，但被木头托着，不会腻。", vol: 62, notes: ["无花果", "杏仁乳", "紫罗兰叶"] },
      base:  { time: "2.5 – 10 hrs", tag: "余温", line: "树皮与湿土的苦沉到底，是果园夜里最诚实的部分。", vol: 34, notes: ["雪松木", "湿土", "岩兰草"] },
    },
  },
  brine: {
    no: "No.09", ghost: "09", name: "墨角与海盐", latin: "Bladderwrack & Brine",
    desc: "退潮之后半小时的礁石滩。海藻贴在石头上，盐在空气里结晶。这支香不温柔，它冷、咸、带着矿物的锋利，写给习惯一个人走夜路的人。",
    conc: "16%", last: "5–7 小时", mood: "湿冷 · 矿物 · 锋利",
    price: "¥ 1,180", vol: "50 ml",
    stages: {
      top:   { time: "0 – 12 min",   tag: "初见", line: "海风先到，盐粒几乎能听见，混着一丝海藻的腥绿。", vol: 80, notes: ["海盐", "墨角藻", "杜松子"] },
      heart: { time: "12 – 100 min", tag: "相认", line: "礁石的湿冷浮出来，苔藓像吸饱了潮气。", vol: 58, notes: ["岩苔", "盐生植物", "灰胡椒"] },
      base:  { time: "1.5 – 7 hrs",  tag: "余温", line: "龙涎的咸脂留在衣领上，退得很慢，像潮水并不真的想走。", vol: 28, notes: ["龙涎香调", "浮木", "矿物麝香"] },
    },
  },
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
let currentFrag = "iris";
let currentStage = "top";

/* — 香水切换 — */
function swapFade(el) {
  el.classList.remove("fade-swap");
  void el.offsetWidth;
  el.classList.add("fade-swap");
}
function renderFrag(key, animate = true) {
  const f = FRAGRANCES[key];
  currentFrag = key;
  $("#a-no").textContent = f.no;
  $("#a-ghost").textContent = f.ghost;
  $("#a-name").textContent = f.name;
  $("#a-latin").textContent = f.latin;
  $("#a-desc").textContent = f.desc;
  $("#a-conc").textContent = f.conc;
  $("#a-last").textContent = f.last;
  $("#a-mood").textContent = f.mood;
  $("#a-price").textContent = f.price;
  $("#a-vol").textContent = f.vol;
  $$(".stage-tab").forEach(t => {
    $(`#t-${t.dataset.stage}`).textContent = f.stages[t.dataset.stage].time;
  });
  if (animate) swapFade($(".hero-body"));
  renderStage(currentStage);
}
function renderStage(stage) {
  currentStage = stage;
  const s = FRAGRANCES[currentFrag].stages[stage];
  $("#s-tag").textContent = s.tag;
  $("#s-line").textContent = s.line;
  $("#s-vol").textContent = s.vol;
  requestAnimationFrame(() => { $("#s-fill").style.width = s.vol + "%"; });
  const ul = $("#s-notes");
  ul.innerHTML = "";
  s.notes.forEach((n, i) => {
    const li = document.createElement("li");
    li.textContent = n;
    ul.appendChild(li);
    setTimeout(() => li.classList.add("is-in"), 60 + i * 70);
  });
}
$$(".frag-item").forEach(btn => btn.addEventListener("click", () => {
  if (btn.dataset.frag === currentFrag) return;
  $$(".frag-item").forEach(b => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
  renderFrag(btn.dataset.frag);
}));
$$(".stage-tab").forEach(btn => btn.addEventListener("click", () => {
  $$(".stage-tab").forEach(b => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
  renderStage(btn.dataset.stage);
}));

/* — 原料故事展开（同时只开一条） — */
$$(".material-head").forEach(head => head.addEventListener("click", () => {
  const item = head.parentElement;
  const wasOpen = item.classList.contains("is-open");
  $$(".material").forEach(m => {
    m.classList.remove("is-open");
    $(".material-head", m).setAttribute("aria-expanded", "false");
  });
  if (!wasOpen) {
    item.classList.add("is-open");
    head.setAttribute("aria-expanded", "true");
  }
}));

/* — 场景轨道拖拽 — */
const rail = $(".moments-rail");
let dragging = false, startX = 0, startScroll = 0;
rail.addEventListener("pointerdown", e => {
  dragging = true; startX = e.clientX; startScroll = rail.scrollLeft;
  rail.setPointerCapture(e.pointerId);
});
rail.addEventListener("pointermove", e => {
  if (dragging) rail.scrollLeft = startScroll - (e.clientX - startX);
});
["pointerup", "pointercancel"].forEach(ev => rail.addEventListener(ev, () => dragging = false));
rail.addEventListener("click", e => { if (Math.abs(e.clientX - startX) > 6) e.preventDefault(); }, true);

/* — toast — */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
$("#a-buy").addEventListener("click", () => toast(`「${FRAGRANCES[currentFrag].name}」已加入心愿单`));
$("#book-btn").addEventListener("click", () => toast("闻香室预约功能在原型中未开放"));

/* 初始 */
renderFrag("iris", false);
