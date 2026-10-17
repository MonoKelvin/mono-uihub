import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EMBED_PARENTS } from '../config.mjs';
import { COLOR_BINS } from '../../lib/colors.mjs';

const I18N = {
  zh: {
    heroL1:'一句话让 AI', heroL2:'生成 UI 原型',
    search:'搜索首次提示词、模型…', all:'全部', more:'筛选',
    sortUpdated:'最近更新', sortCreated:'最近创建', sortName:'名称',
    modelK:'模型', colorK:'配色', tagK:'标签', reset:'清除筛选',
    noShot:'暂无截图', unknownModel:'未记录',
    emptyTitle:'没有匹配的原型', emptyText:'换个关键词，或清除筛选条件。',
    count:(n)=> '共 '+n+' 个结果',
    type_software:'软件', type_website:'网页', type_app:'App', type_component:'组件', type_unknown:'未分类',
    ...Object.fromEntries(COLOR_BINS.map((b) => ['color_' + b.key, b.zh])),
  },
  en: {
    heroL1:'One AI prompt,', heroL2:'one UI prototype',
    search:'Search initial prompts, models…', all:'All', more:'Filters',
    sortUpdated:'Updated', sortCreated:'Created', sortName:'Name',
    modelK:'Model', colorK:'Color', tagK:'Tags', reset:'Clear filters',
    noShot:'No screenshot yet', unknownModel:'Unrecorded',
    emptyTitle:'No matching prototypes', emptyText:'Try another keyword or clear the filters.',
    count:(n)=> n+(n===1?' result':' results'),
    type_software:'Software', type_website:'Website', type_app:'App', type_component:'Component', type_unknown:'Uncategorized',
    ...Object.fromEntries(COLOR_BINS.map((b) => ['color_' + b.key, b.en])),
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
  /* ---------- dropdowns (type + sort): interruptible glass menus ---------- */
  const dropdowns = [];
  function dropdown(btn, menu, optKey, onChoose) {
    const label = btn.querySelector('[data-dd-label],[data-sort-label]');
    const opts = [...menu.querySelectorAll('[role="option"]')];
    let open = false, tween = null;
    function place() {
      const deck = btn.closest('.deck').getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const w = menu.offsetWidth;
      const left = Math.min(Math.max(0, b.left - deck.left + b.width / 2 - w / 2), deck.width - w);
      menu.style.left = left + 'px';
      menu.style.top = (b.bottom - deck.top + 8) + 'px';
    }
    function setOpen(next, { focus = false } = {}) {
      if (next === open) return;
      open = next;
      if (open) dropdowns.forEach((d) => { if (d.setOpen !== setOpen) d.setOpen(false); });
      btn.setAttribute('aria-expanded', String(open));
      if (open) { menu.hidden = false; place(); }
      if (tween) tween.kill();
      if (reduce) {
        gsap.set(menu, { autoAlpha: open ? 1 : 0, scale: 1, y: 0 });
        if (!open) menu.hidden = true;
      } else {
        // gsap.to starts from the CURRENT values, so a reversed click mid-way continues smoothly.
        if (open && menu.style.opacity === '') gsap.set(menu, { autoAlpha: 0, scale: 0.94, y: -6 });
        tween = gsap.to(menu, open
          ? { autoAlpha: 1, scale: 1, y: 0, duration: 0.26, ease: 'power3.out', onComplete: () => { tween = null; } }
          : { autoAlpha: 0, scale: 0.96, y: -4, duration: 0.18, ease: 'power2.in',
              onComplete: () => { tween = null; menu.hidden = true; menu.style.opacity = ''; } });
      }
      if (open && focus) (opts.find((o) => o.getAttribute('aria-selected') === 'true') || opts[0]).focus();
      if (!open && focus) btn.focus();
    }
    function choose(v, { silent = false } = {}) {
      const opt = opts.find((o) => o.dataset[optKey] === v);
      if (!opt) return;
      opts.forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
      const key = opt.querySelector('[data-i18n]').dataset.i18n;
      label.dataset.i18n = key;
      label.textContent = I18N[lang][key] ?? v;
      if (!silent) onChoose(v);
    }
    btn.addEventListener('click', () => setOpen(!open));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true, { focus: true }); }
    });
    opts.forEach((o) => o.addEventListener('click', () => { choose(o.dataset[optKey]); setOpen(false, { focus: true }); }));
    menu.addEventListener('keydown', (e) => {
      const i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); setOpen(false, { focus: e.key === 'Escape' }); }
    });
    document.addEventListener('pointerdown', (e) => {
      if (open && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    addEventListener('resize', () => { if (open) place(); }, { passive: true });
    const api = { setOpen, choose };
    dropdowns.push(api);
    return api;
  }
  const typeDD = dropdown($('[data-dd="type"]'), $('[data-type-menu]'), 'typeOpt', (v) => { state.type = v; render(); });
  dropdown($('[data-sort-btn]'), $('[data-sort-menu]'), 'sortOpt', (v) => { state.sort = v; render(); });

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
    typeDD.choose('all', { silent: true });
    render();
  });

  /* ---------- advanced panel ---------- */
  const more = $('[data-more]');
  const adv = $('[data-adv]');
  let advOpen = false;
  /* Large soft shadow only while the open panel actually overlaps visible cards. */
  function syncAdvShadow() {
    if (!adv) return;
    let over = false;
    if (advOpen || !adv.hidden) {
      const a = adv.getBoundingClientRect();
      over = a.height > 1 && cards.some((c) => {
        if (c.hidden) return false;
        const r = c.getBoundingClientRect();
        return r.top < a.bottom && r.bottom > a.top;
      });
    }
    adv.classList.toggle('is-over', over);
  }
  if (more && adv) {
    const inner = adv.firstElementChild;
    let tween = null;
    more.addEventListener('click', () => {
      advOpen = !advOpen;
      const open = advOpen;
      more.setAttribute('aria-expanded', String(open));
      if (reduce) {
        adv.hidden = !open;
        gsap.set(adv, { height: open ? 'auto' : 0, marginTop: open ? 12 : 0 });
        syncAdvShadow(); postHeight(); return;
      }
      // Interruptible: start from the CURRENT height, never from an end state.
      if (tween) tween.kill();
      adv.hidden = false;
      const from = adv.offsetHeight;
      const full = inner.offsetHeight;
      const to = open ? full : 0;
      const dur = Math.min(0.42, Math.max(0.16, 0.42 * Math.abs(to - from) / Math.max(full, 1)));
      if (open && from < 1) gsap.set(inner, { autoAlpha: 0, y: -8 });
      tween = gsap.timeline({
        onUpdate: syncAdvShadow,
        onComplete: () => {
          tween = null;
          if (open) adv.style.height = 'auto'; else adv.hidden = true;
          syncAdvShadow(); postHeight();
        },
      })
        .fromTo(adv, { height: from }, { height: to, marginTop: open ? 12 : 0, duration: dur, ease: open ? 'power3.out' : 'power2.inOut' }, 0)
        .to(inner, { autoAlpha: open ? 1 : 0, y: open ? 0 : -8, duration: open ? dur : dur * 0.7, ease: 'power2.out' }, open ? dur * 0.15 : 0);
    });
    let advRaf = 0;
    addEventListener('scroll', () => {
      if (advRaf || adv.hidden) return;
      advRaf = requestAnimationFrame(() => { advRaf = 0; syncAdvShadow(); });
    }, { passive: true });
  }

  /* ---------- card feedback ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) cards.forEach((card) => {
    const imgs = $$('img', card);
    const dots = $$('.dots span', card);
    let index = 0, timer;
    const show = (i) => { index = i; imgs.forEach((im, j) => im.classList.toggle('is-on', j === i)); dots.forEach((d, j) => d.classList.toggle('is-on', j === i)); };
    card.addEventListener('pointerenter', () => {
      if (imgs.length > 1) timer = setInterval(() => show((index + 1) % imgs.length), 1500);
    });
    card.addEventListener('pointerleave', () => { clearInterval(timer); show(0); });
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
          const span = Math.max(listY(), 1);
          const dur = Math.min(0.95, Math.max(0.42, 0.95 * Math.abs(to - scrollY) / span));
          anim = gsap.to(window, { duration: dur, ease: 'power2.out',
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
