/* =========================================================
   余果 · 绘本插画工作室 · 交互脚本
   路由：hash（#home / #works / #serial / #invite / #work/<id>）
   ========================================================= */

'use strict';

const $  = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

// ── Toast ───────────────────────────────────────────────
const toast = $('#toast');
let toastTimer;

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

// ── 数据 · 作品 ──────────────────────────────────────────
// crops: [x%, y%] 三处局部取景位置，用于详情页「画面细节」
const WORKS = {
  radio: {
    title: '咸风里的旧电台',
    kind: '绘本', year: '2025',
    publisher: '青禾童书馆', pages: '40 页', medium: '水粉',
    img: 'assets/work-radio.png',
    cap: '绘本内页 · 2025',
    desc: '2025 年由青禾童书馆出版的绘本，40 页全彩水粉。讲的是一只收音机在海边等一艘船的故事。船最后没有来，收音机也没有坏，它只是学会了在潮声里调台。',
    note: '海的反光换了四种蓝。最亮的那道不许用白，兑了一点土黄，太阳落下去的样子才拎得起来。',
    tags: ['绘本', '水粉', '海边', '40 页'],
    crops: [[0, 42], [82, 18], [28, 88]],
  },
  tin: {
    title: '小满的锡罐头',
    kind: '绘本', year: '2024',
    publisher: '潮鸣出版社', pages: '36 页', medium: '水粉',
    img: 'assets/work-tin.png',
    cap: '绘本内页 · 2024',
    desc: '2024 年由潮鸣出版社出版，36 页全彩。讲的是一个小孩和一只凹了的锡罐头的故事。入围青芒插画奖绘本组。',
    note: '凹进去的那道折光画了一整个下午。锡罐头不是主角，主角是小孩不肯换掉它的那段时间。',
    tags: ['绘本', '水粉', '潮鸣出版社', '36 页'],
    crops: [[12, 28], [58, 52], [86, 82]],
  },
  nightbus: {
    title: '夜班车上的乘客',
    kind: '杂志插画', year: '2024',
    publisher: '《汀洲》第 58 期', pages: '6 幅', medium: '水粉',
    img: 'assets/work-nightbus.png',
    cap: '杂志内页 · 2024',
    desc: '2024 年发表于文学杂志《汀洲》第 58 期的 6 幅水粉内页，给一篇写末班车的小说画的插图。画的是车上的猫，和睡不着的人。',
    note: '夜里的蓝最忌匀。每一块车窗的蓝都差半度，人才会信这是晚上十一点的城。',
    tags: ['杂志插画', '水粉', '《汀洲》'],
    crops: [[22, 44], [76, 22], [58, 76]],
  },
  letters: {
    title: '给外婆的三十七封信',
    kind: '手工书', year: '2023',
    publisher: '自印', pages: '12 册', medium: '水粉 · 拼贴',
    img: 'assets/work-letters.png',
    cap: '手工书 · 2023',
    desc: '2023 年自印手工书，只做了 12 册，非卖品。讲的是一个住在城市的人，每周给外婆写一封信的故事。每一册的信纸和印章都不一样。',
    note: '竹影是用真竹子拓上去的，再拿水粉补颜色。寄出去之前，每册都在窗台上晒了两个太阳。',
    tags: ['手工书', '自印', '非卖品'],
    crops: [[32, 30], [72, 16], [10, 78]],
  },
};

// 作品集网格顺序
const ORDER = ['radio', 'tin', 'nightbus', 'letters'];
// 首页精选三件
const FEATURED = ['radio', 'tin', 'nightbus'];
// 筛选映射
const FILTERS = {
  all: ORDER,
  book: ['radio', 'tin'],
  mag: ['nightbus'],
  zine: ['letters'],
};

// ── 数据 · 连载章节 ──────────────────────────────────────
const CHAPTERS = [
  { n: 1, title: '渡口的第一盏灯', date: '2026.03.15', line: '灯是借来的，渡口是自己的。' },
  { n: 2, title: '迟到的鹭',       date: '2026.04.15', line: '白鹭第一次迟到，整整迟到了一片云的时间。' },
  { n: 3, title: '云晒得半干',     date: '2026.05.15', line: '午后云最薄，能看见底下种油菜的人家。' },
  { n: 4, title: '雾里的船',       date: '2026.06.15', line: '没有船期表，船却从来没有错过。' },
  { n: 5, title: '划船的人',       date: '2026.07.15', line: '她第一次把船划进雾里，为了去找一盏别人的灯。' },
  { n: 6, title: '灯芯',           date: '2026.08.15', line: '灯芯短了一截，她学会了不把火调那么大。' },
  { n: 7, title: '提灯的人',       date: '2026.09.15', line: '云散得越来越早，她开始每天多等一刻钟。' },
];
const TOTAL_CHAPTERS = 24;

// ── 路由 ─────────────────────────────────────────────────
const VIEWS = ['home', 'works', 'serial', 'invite'];
const VIEW_EL = {
  home:   '#viewHome',
  works:  '#viewWorks',
  serial: '#viewSerial',
  invite: '#viewInvite',
  detail: '#viewDetail',
};

function currentRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return { view: 'home' };
  const parts = h.split('/');
  if (parts[0] === 'work' && parts[1] && WORKS[parts[1]]) return { view: 'detail', param: parts[1] };
  if (VIEWS.includes(parts[0])) return { view: parts[0] };
  return { view: 'home' };
}

function go(hash) {
  const target = '#' + hash;
  if (location.hash === target) applyRoute();
  else location.hash = target;
}

function applyRoute() {
  const r = currentRoute();
  openView(r.view, r.param);
}

function openView(view, param) {
  $$('.view').forEach(v => v.classList.remove('is-open'));
  const el = $(VIEW_EL[view] || VIEW_EL.home);
  el.classList.add('is-open');

  // 侧栏高亮：详情页归属「作品集」
  const navKey = view === 'detail' ? 'works' : view;
  $$('.nav-item').forEach(b => {
    const on = b.dataset.nav === navKey;
    b.classList.toggle('is-on', on);
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  if (view === 'detail') renderDetail(param);

  // 块内错落入场
  $$('.rv', el).forEach((n, i) => n.style.setProperty('--d', Math.min(i * 60, 300) + 'ms'));

  const main = $('#main');
  if (main) main.scrollTop = 0;
  el.focus({ preventScroll: true });
}

// ── 作品卡片 ─────────────────────────────────────────────
function workCardHTML(id, w) {
  return `
  <button type="button" class="work-card" data-work="${id}" aria-label="查看《${w.title}》的作品详情">
    <span class="work-card-fig">
      <img src="${w.img}" alt="${w.title}内页" width="1536" height="1024" loading="lazy">
      <span class="work-card-veil"><span><i class="ti ti-photo" aria-hidden="true"></i>查看详情</span></span>
    </span>
    <span class="work-card-body">
      <span class="work-card-kicker"><span>${w.kind}</span><span class="mono">${w.year}</span></span>
      <span class="work-card-title">${w.title}</span>
      <span class="work-card-meta">${w.publisher}，${w.pages}</span>
    </span>
  </button>`;
}

function renderGrid(targetId, ids) {
  const el = $(targetId);
  if (!el) return;
  el.innerHTML = ids.map(id => workCardHTML(id, WORKS[id])).join('');
}

// ── 作品详情 ─────────────────────────────────────────────
function metaRow(label, value) {
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function renderDetail(id) {
  const w = WORKS[id];
  if (!w) { go('works'); return; }

  const img = $('#dImg');
  if (img) { img.src = w.img; img.alt = w.title + '内页'; }
  $('#dCap').textContent = w.cap;
  $('#dKicker').textContent = w.kind + ' · ' + w.year;
  $('#dTitle').textContent = w.title;
  $('#dMeta').innerHTML =
    metaRow('出版 / 发表', w.publisher) +
    metaRow('篇幅', w.pages) +
    metaRow('媒介', w.medium);
  $('#dDesc').textContent = w.desc;
  $('#dNote').innerHTML = '<p class="note-lbl">创作手记</p><p></p>';
  $('#dNote').lastElementChild.textContent = w.note;
  $('#dTags').innerHTML = w.tags.map(t => `<span class="tag">${t}</span>`).join('');
  $('#dCrops').innerHTML = w.crops.map(c =>
    `<div class="crop" role="img" aria-label="${w.title}的画面局部" style="background-image:url('${w.img}');background-position:${c[0]}% ${c[1]}%"></div>`
  ).join('');

  const others = ORDER.filter(k => k !== id).slice(0, 2);
  renderGrid('#dOthers', others);
}

// ── 连载进度 ─────────────────────────────────────────────
function renderSideCells() {
  const el = $('#sideCells');
  if (!el) return;
  let html = '';
  for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
    const cls = i <= CHAPTERS.length ? 'done' : (i === CHAPTERS.length + 1 ? 'curr' : '');
    html += `<span class="pcell ${cls}"></span>`;
  }
  el.innerHTML = html;
}

function showChapter(ch) {
  const el = $('#chapReadout');
  if (!el) return;
  el.innerHTML =
    `<p class="chap-readout-title">第 ${ch.n} 章 · ${ch.title}<span class="mono">${ch.date}</span></p>` +
    `<p class="chap-readout-line">${ch.line}</p>`;
}

function renderChapGrid() {
  const el = $('#chapGrid');
  if (!el) return;
  el.innerHTML = '';

  CHAPTERS.forEach(ch => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chap-cell done';
    b.textContent = String(ch.n).padStart(2, '0');
    b.setAttribute('aria-label', `第 ${ch.n} 章 ${ch.title}，已画完`);
    b.addEventListener('click', () => showChapter(ch));
    el.appendChild(b);
  });

  for (let i = CHAPTERS.length + 1; i <= TOTAL_CHAPTERS; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    const curr = i === CHAPTERS.length + 1;
    b.className = 'chap-cell ' + (curr ? 'curr' : 'tbd');
    b.textContent = String(i).padStart(2, '0');
    b.setAttribute('aria-label', `第 ${i} 章，${curr ? '正在画' : '还没开始'}`);
    if (!curr) {
      b.addEventListener('click', () => showToast(`第 ${i} 章还没画，先看看已经完成的七章。`));
    }
    el.appendChild(b);
  }
}

// ── 作品集筛选 ───────────────────────────────────────────
function initChips() {
  const box = $('#workFilters');
  if (!box) return;
  box.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', box).forEach(c => c.classList.remove('is-on'));
    chip.classList.add('is-on');
    renderGrid('#worksGrid', FILTERS[chip.dataset.filter] || ORDER);
  });
}

// ── 表单 ─────────────────────────────────────────────────
function initInviteForm() {
  const form = $('#inviteForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const nameEl  = $('#fName', form);
    const mailEl  = $('#fMail', form);
    const storyEl = $('#fStory', form);

    function err(id, msg) {
      const el = $('[data-err="' + id + '"]', form);
      if (el) el.textContent = msg;
      return false;
    }

    if (!nameEl.value.trim()) {
      nameEl.classList.add('is-err');
      valid = err('fName', '请告诉我怎么称呼你');
    } else {
      nameEl.classList.remove('is-err');
      err('fName', '');
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mailEl.value.trim() || !emailRe.test(mailEl.value.trim())) {
      mailEl.classList.add('is-err');
      valid = err('fMail', '这个邮箱格式好像不太对');
    } else {
      mailEl.classList.remove('is-err');
      err('fMail', '');
    }

    if (!storyEl.value.trim() || storyEl.value.trim().length < 10) {
      storyEl.classList.add('is-err');
      valid = err('fStory', '简单说几句想讲的故事，我会更好奇');
    } else {
      storyEl.classList.remove('is-err');
      err('fStory', '');
    }

    if (valid) {
      showToast('信写好了。这是原型页面，正式站点才会真的寄到 hi@yuguo.ink。');
      form.reset();
    }
  });

  ['fName', 'fMail', 'fStory'].forEach(id => {
    const el = $('#' + id, form);
    if (el) el.addEventListener('input', () => el.classList.remove('is-err'));
  });
}

// ── 全局委托：导航与作品卡 ────────────────────────────────
function initDelegates() {
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { go(nav.dataset.nav); return; }
    const card = e.target.closest('[data-work]');
    if (card) { go('work/' + card.dataset.work); }
  });

  // Esc：作品详情返回作品集
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentRoute().view === 'detail') go('works');
  });
}

// ── 启动 ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGrid('#homeGrid', FEATURED);
  renderGrid('#worksGrid', ORDER);
  renderSideCells();
  renderChapGrid();
  initChips();
  initInviteForm();
  initDelegates();
  applyRoute();
  window.addEventListener('hashchange', applyRoute);
});
