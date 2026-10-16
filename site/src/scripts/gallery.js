import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const I18N = {
  zh: {
    heroTitle:'一句话，即一个界面', heroText:'每个原型都从一句需求现场推导视觉方向。筛选与搜索只依据首次生成记录。', heroUnit:'个原型',
    search:'搜索首次提示词、模型…', all:'全部', more:'高级',
    sortUpdated:'最近更新', sortCreated:'最近创建', sortName:'名称',
    modelK:'模型', colorK:'配色', tagK:'标签', reset:'清除筛选',
    noShot:'暂无截图', unknownModel:'未记录',
    emptyTitle:'没有匹配的原型', emptyText:'换个关键词，或清除筛选条件。',
    count:(n,t)=> n===t ? t+' 个原型' : n+' / '+t+' 个原型',
    type_software:'软件', type_website:'网页', type_app:'App', type_component:'组件', type_unknown:'未分类',
    color_red:'红', color_blue:'蓝', color_green:'绿', color_pink:'粉', color_purple:'紫', color_orange:'橙',
    color_yellow:'黄', color_black:'黑', color_white:'白', color_gray:'灰', color_beige:'米', color_brown:'棕',
  },
  en: {
    heroTitle:'One sentence, one interface.', heroText:'Each prototype derives its own visual direction from a single brief. Filters and search use only the first generation record.', heroUnit:'prototypes',
    search:'Search initial prompts, models…', all:'All', more:'Advanced',
    sortUpdated:'Recently updated', sortCreated:'Recently created', sortName:'Name',
    modelK:'Model', colorK:'Color', tagK:'Tags', reset:'Clear filters',
    noShot:'No screenshot yet', unknownModel:'Unrecorded',
    emptyTitle:'No matching prototypes', emptyText:'Try another keyword or clear the filters.',
    count:(n,t)=> n===t ? t+' prototypes' : n+' / '+t+' prototypes',
    type_software:'Software', type_website:'Website', type_app:'App', type_component:'Component', type_unknown:'Uncategorized',
    color_red:'Red', color_blue:'Blue', color_green:'Green', color_pink:'Pink', color_purple:'Purple', color_orange:'Orange',
    color_yellow:'Yellow', color_black:'Black', color_white:'White', color_gray:'Gray', color_beige:'Beige', color_brown:'Brown',
  },
};
const PARENTS = new Set(['https://monokelvin.cn', 'https://www.monokelvin.cn']);

export function initGallery() {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const embedded = document.body.dataset.embedded === '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const grid = $('[data-grid]');
  const cards = $$('[data-card]', grid);
  const total = cards.length;
  const state = { q: '', type: 'all', sort: 'updated', models: new Set(), tags: new Set(), colors: new Set() };
  let lang = params.get('lang') === 'en' ? 'en' : params.get('lang') === 'zh' ? 'zh'
    : (embedded ? 'zh' : (localStorage.getItem('uihub-lang') || 'zh'));

  /* ---------- i18n ---------- */
  function applyLang(next) {
    lang = next;
    const d = I18N[lang];
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    $$('[data-i18n]').forEach((el) => { const v = d[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-placeholder]').forEach((el) => { el.placeholder = d[el.dataset.i18nPlaceholder] ?? el.placeholder; });
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (!embedded) { try { localStorage.setItem('uihub-lang', lang); } catch {} }
    updateCount();
  }
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang !== lang) applyLang(b.dataset.lang);
  }));

  /* ---------- filter + sort ---------- */
  const isVisible = (c) => !c.hidden;
  function matches(c) {
    if (state.q && !c.dataset.search.includes(state.q)) return false;
    if (state.type !== 'all' && c.dataset.type !== state.type) return false;
    if (state.models.size && !state.models.has(c.dataset.model)) return false;
    if (state.tags.size) { const t = JSON.parse(c.dataset.tags); for (const v of state.tags) if (!t.includes(v)) return false; }
    if (state.colors.size) { const k = JSON.parse(c.dataset.colors); for (const v of state.colors) if (!k.includes(v)) return false; }
    return true;
  }
  function order(a, b) {
    if (state.sort === 'name') return a.dataset.name.localeCompare(b.dataset.name, lang === 'en' ? 'en' : 'zh');
    const key = state.sort === 'created' ? 'created' : 'updated';
    return Number(b.dataset[key]) - Number(a.dataset[key]) || a.dataset.name.localeCompare(b.dataset.name);
  }
  function activeCount() { return state.models.size + state.tags.size + state.colors.size; }
  function updateCount() {
    const n = cards.filter(isVisible).length;
    const label = I18N[lang].count(n, total);
    const count = $('[data-count]'); if (count) count.textContent = label;
    const heroN = $('[data-hero-count]'); if (heroN) heroN.textContent = String(n);
    const _tc = $('[data-tcount]'); if (_tc) _tc.textContent = label;
    $('[data-empty]').classList.toggle('is-on', n === 0);
    const badge = $('[data-more-count]');
    if (badge) { const a = activeCount(); badge.hidden = a === 0; badge.textContent = String(a); }
  }

  /* Reordering happens while every card is a plain grid child: no absolute
     positioning, no FLIP ghosts, so the grid can never end up scrambled. */
  function render({ animate = true } = {}) {
    cards.forEach((c) => { c.hidden = !matches(c); });
    const sorted = [...cards].sort(order);
    sorted.forEach((c) => grid.appendChild(c));
    updateCount();
    const shown = sorted.filter(isVisible);
    // Any card that becomes visible is made fully visible immediately — it can
    // never stay stuck at opacity 0 because its scroll trigger already fired.
    if (reduce || !animate) gsap.set(shown, { clearProps: 'opacity,visibility,transform' });
    else {
      gsap.killTweensOf(shown);
      gsap.fromTo(shown, { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: { amount: Math.min(0.25, shown.length * 0.02) }, overwrite: true });
    }
    ScrollTrigger.refresh();
    postHeight();
  }

  let qTimer;
  $('[data-search-input]').addEventListener('input', (e) => {
    clearTimeout(qTimer);
    const value = e.target.value.trim().toLowerCase();
    qTimer = setTimeout(() => { state.q = value; render(); }, 160);
  });
  const typeButtons = $$('[data-type]', $('[data-type-group]'));
  typeButtons.forEach((b) => b.addEventListener('click', () => {
    state.type = b.dataset.type;
    typeButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  $('[data-sort]').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  const chipGroup = (attr, set) => $$('.chip[data-' + attr + ']').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset[attr];
    set.has(v) ? set.delete(v) : set.add(v);
    b.setAttribute('aria-pressed', String(set.has(v)));
    if (!reduce) gsap.fromTo(b, { scale: 0.94 }, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
    render();
  }));
  chipGroup('model', state.models);
  chipGroup('tag', state.tags);
  chipGroup('color', state.colors);

  $('[data-reset]').addEventListener('click', () => {
    state.q = ''; state.type = 'all'; state.models.clear(); state.tags.clear(); state.colors.clear();
    $('[data-search-input]').value = '';
    $$('.chip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    typeButtons.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.type === 'all')));
    render();
  });

  /* ---------- advanced panel ---------- */
  const more = $('[data-more]');
  const adv = $('[data-adv]');
  if (more && adv) {
    let open = false;
    more.addEventListener('click', () => {
      open = !open;
      more.setAttribute('aria-expanded', String(open));
      if (open) adv.hidden = false;
      const target = open ? adv.firstElementChild.offsetHeight : 0;
      if (reduce) { adv.style.height = open ? 'auto' : '0px'; if (!open) adv.hidden = true; postHeight(); return; }
      gsap.to(adv, { height: target, duration: 0.35, ease: 'power2.inOut',
        onComplete: () => { if (open) adv.style.height = 'auto'; else adv.hidden = true; postHeight(); } });
    });
  }

  /* ---------- card feedback ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) cards.forEach((card) => {
    const imgs = $$('img', card);
    const dots = $$('.dots span', card);
    let index = 0, timer;
    const show = (i) => { index = i; imgs.forEach((im, j) => im.classList.toggle('is-on', j === i)); dots.forEach((d, j) => d.classList.toggle('is-on', j === i)); };
    card.addEventListener('pointerenter', () => {
      if (imgs.length) gsap.to(imgs, { scale: 1.03, duration: 0.6, ease: 'power3.out' });
      if (imgs.length > 1) timer = setInterval(() => show((index + 1) % imgs.length), 1500);
    });
    card.addEventListener('pointerleave', () => {
      clearInterval(timer); show(0);
      if (imgs.length) gsap.to(imgs, { scale: 1, duration: 0.45, ease: 'power3.out' });
    });
  });

  /* ---------- hero eyebrow reveal on scroll ---------- */
  const eyebrow = $('[data-hero-eyebrow]');
  if (eyebrow && !reduce) {
    ScrollTrigger.create({
      trigger: '.hero', start: 'top 40%', end: 'bottom 60%',
      onEnter: () => eyebrow.classList.add('in-view'),
      onEnterBack: () => eyebrow.classList.add('in-view'),
      onLeave: () => eyebrow.classList.remove('in-view'),
      onLeaveBack: () => eyebrow.classList.remove('in-view'),
    });
  }
  const bar = $('[data-bar]');
  if (bar) ScrollTrigger.create({ start: 8, end: 'max', onToggle: (s) => bar.classList.toggle('is-scrolled', s.isActive) });

  /* ---------- embed height reporting ---------- */
  const parent = params.get('parent');
  const target = embedded && window.parent !== window && parent && PARENTS.has(parent) ? parent : null;
  let lastHeight = 0;
  function postHeight() {
    if (!target) return;
    const h = Math.ceil(document.documentElement.scrollHeight);
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    window.parent.postMessage({ type: 'mono-uihub:resize', height: h }, target);
  }
  if (target) { new ResizeObserver(postHeight).observe(document.body); addEventListener('load', postHeight); }

  applyLang(lang);
  render({ animate: false });

  /* First-visit reveal only; the header and hero are never animated away on
     scroll, so nothing can disappear while reading. */
  if (!reduce) {
    const h1 = $('.hero h1');
    if (h1) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(h1, { autoAlpha: 0, y: 24, duration: 0.85, clearProps: 'all' })
        .from('.hero-stat > *', { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.1, clearProps: 'all' }, '-=0.55');
    }
    const first = cards.filter(isVisible);
    gsap.from(first.slice(0, 16), { autoAlpha: 0, y: 18, duration: 0.55, ease: 'power2.out', stagger: { each: 0.04 }, clearProps: 'all' });
  }
}

/* v5: search clear button */
(() => {
  const inp = document.querySelector('[data-search-input]');
  const btn = document.querySelector('[data-clear]');
  if (!inp || !btn) return;
  const sync = () => { btn.hidden = !inp.value; };
  inp.addEventListener('input', sync); sync();
  btn.addEventListener('click', () => { inp.value = ''; sync(); inp.dispatchEvent(new Event('input')); inp.focus(); });
})();
