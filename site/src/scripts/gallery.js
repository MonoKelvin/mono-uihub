import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EMBED_PARENTS } from '../config.mjs';

const I18N = {
  zh: {
    heroL1:'AI 一句话', heroL2:'生成一个原型',
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
    heroL1:'One AI prompt,', heroL2:'one UI prototype',
    search:'Search initial prompts, models…', all:'All', more:'Advanced',
    sortUpdated:'Updated', sortCreated:'Created', sortName:'Name',
    modelK:'Model', colorK:'Color', tagK:'Tags', reset:'Clear filters',
    noShot:'No screenshot yet', unknownModel:'Unrecorded',
    emptyTitle:'No matching prototypes', emptyText:'Try another keyword or clear the filters.',
    count:(n,t)=> n===t ? t+' prototypes' : n+' / '+t+' prototypes',
    type_software:'Software', type_website:'Website', type_app:'App', type_component:'Component', type_unknown:'Uncategorized',
    color_red:'Red', color_blue:'Blue', color_green:'Green', color_pink:'Pink', color_purple:'Purple', color_orange:'Orange',
    color_yellow:'Yellow', color_black:'Black', color_white:'White', color_gray:'Gray', color_beige:'Beige', color_brown:'Brown',
  },
};
const PARENTS = new Set(EMBED_PARENTS);

export function initGallery() {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const embedded = document.body.dataset.embedded === '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Split hero title lines into per-word spans so they can stagger in.
     Chinese lines split per character, latin per word. */
  function splitWords(el) {
    const text = el.textContent;
    const isCJK = /[一-鿿]/.test(text);
    const parts = isCJK ? [...text] : text.split(/(\s+)/);
    el.textContent = '';
    for (const part of parts) {
      if (!part.trim()) { el.append(document.createTextNode(part)); continue; }
      const w = document.createElement('span');
      w.className = 'word';
      w.textContent = part;
      el.append(w);
    }
  }

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
    $$('[data-i18n]').forEach((el) => {
      const v = d[el.dataset.i18n]; if (typeof v !== 'string') return;
      el.textContent = v;
      if (el.closest('.hero-title')) splitWords(el);
    });
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
    const ac = $('[data-count-all]'); if (ac) ac.textContent = String(n);
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

  /* First-visit reveal only; hero content never animates away on scroll. */
  if (!reduce) {
    const words = $$('.hero-title .word');
    if (words.length) {
      gsap.from(words, { autoAlpha: 0, y: 34, rotate: 2, duration: 0.9, ease: 'power3.out', stagger: 0.07, clearProps: 'all' });
    }
    const first = cards.filter(isVisible);
    gsap.from(first.slice(0, 16), { autoAlpha: 0, y: 18, duration: 0.55, ease: 'power2.out', stagger: { each: 0.04 }, clearProps: 'all' });

    /* ---------- scroll: aura drift ---------- */
    const aura = $('.aura');
    if (aura) gsap.to(aura, { yPercent: 45, xPercent: -14, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 1.2 } });

    /* ---------- wheel: interruptible two-way snap (hero <-> list) ----------
       Down inside hero -> glide to list top (tools pinned). Up near list top ->
       glide back to page top. A reverse wheel mid-animation starts a NEW tween
       from the CURRENT scroll position, so direction changes stay fluid. */
    if (!embedded && matchMedia('(pointer: fine)').matches) {
      const tools = $('[data-tools]');
      if (tools) {
        let anim = null;
        let dir = 0; // +1 gliding down, -1 gliding up, 0 idle
        let atSnap = false; // user is RESTING at the list-top snap point
        let idleT = 0;
        // Snap point in DOCUMENT coordinates, measured with tools unpinned.
        // Once tools is sticky, rect.top is constant, so we must measure it
        // while at scrollY=0 (or derive it from the first pre-sticky layout).
        let ly = -1;
        const measure = () => {
          if (scrollY <= 0) ly = Math.max(0, tools.getBoundingClientRect().top - 14);
        };
        measure();
        addEventListener('resize', () => { const y0 = scrollY; if (y0 <= 0) measure(); }, { passive: true });
        const listY = () => ly >= 0 ? ly : Math.max(0, tools.getBoundingClientRect().top + scrollY - 14);
        addEventListener('scroll', () => {
          clearTimeout(idleT);
          idleT = setTimeout(() => { atSnap = !anim && Math.abs(scrollY - listY()) <= 2; }, 120);
        }, { passive: true });
        const glide = (to, d) => {
          if (anim) anim.kill(); // hand off from current position
          dir = d;
          atSnap = false;
          anim = gsap.to(window, { duration: 1.05, ease: 'power2.out',
            scrollTo: { y: to, autoKill: false },
            onComplete: () => { anim = null; dir = 0; } });
        };
        addEventListener('wheel', (e) => {
          const down = e.deltaY > 0;
          if (e.deltaY === 0) return;
          if (scrollY <= 0) measure(); // refresh layout-derived snap point when at top
          const y = scrollY, ly = listY();
          if (anim) {
            // mid-flight: only a reverse wheel redirects, from where we are now
            if ((dir > 0 && !down) || (dir < 0 && down)) {
              e.preventDefault();
              glide(down ? ly : 0, down ? 1 : -1);
            } else e.preventDefault(); // same direction: keep gliding, swallow input
            return;
          }
          if (down && y < ly - 2) { e.preventDefault(); glide(ly, 1); return; }
          // snap home only when resting at the list top — never hijack a
          // pass-by from deep below
          if (!down && atSnap && y > 0) { e.preventDefault(); glide(0, -1); }
        }, { passive: false });
      }
    }
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
