/* 格木 GEMU / 交互（第七版 / GSAP + ScrollTrigger）
   动效全部由 GSAP 驱动：入场时间线、滚动视差、横向 pin 画廊、
   分块揭示、磁吸按钮、跟随光标。所有 from 态在运行时才写入，
   GSAP 未加载时页面保持静态可读，不会出现「动效依赖导致空白」。 */

(function () {
  'use strict';

  var D = window.GEMU;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var hasG = !!(window.gsap && window.ScrollTrigger);
  if (hasG) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  }
  function yuan(n) { return Number(n).toLocaleString('zh-CN'); }
  function photo(id, w, h) {
    return 'https://images.unsplash.com/' + id + '?q=80&w=' + w + '&h=' + h + '&auto=format&fit=crop';
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (err) { /* 隐私模式下静默降级 */ }
    return null;
  }

  /* ---------- 导航 ---------- */
  function renderNav() {
    $('#nav-links').innerHTML = D.nav.map(function (n) {
      return '<a href="#' + n.id + '" data-spy="' + n.id + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#drawer-links').innerHTML = D.nav.map(function (n, i) {
      return '<a href="#' + n.id + '" style="--i:' + i + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#foot-links').innerHTML = D.nav.map(function (n) {
      return '<a href="#' + n.id + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#drawer-meta').textContent = D.brand.line + ' / 设计热线 ' + D.brand.hotline;
    $('#foot-word').textContent = D.footer.word;
  }

  /* ---------- 首屏 ---------- */
  function renderHero() {
    var h = D.hero;
    $('#hero-kicker').textContent = h.kicker;
    $('#hero-outline').textContent = h.outline;
    $('#hero-latin').textContent = h.latin;
    $('#hero-title').innerHTML = h.lines.map(function (l) {
      return '<span class="ht-ln' + (l.accent ? ' ht-accent' : '') + '"><i>' + esc(l.text) + '</i></span>';
    }).join('');
    $('#hero-sub').textContent = h.sub;
    $('#hero-meta').innerHTML = h.meta.map(function (m) {
      return '<span>' + icon(m.icon) + esc(m.text) + '</span>';
    }).join('');
    var img = $('#hero-img');
    img.src = photo(h.img, 900, 1125);
    img.alt = h.alt;
    $('#hero-cap').textContent = h.cap;
  }

  /* ---------- 作品：横向画廊 ---------- */
  function renderWorks() {
    var w = D.works;
    $('#w-label').textContent = w.label;
    $('#w-latin').textContent = w.latin;
    $('#w-count').textContent = w.count;
    $('#w-lead').textContent = w.lead;
    $('#w-hint').innerHTML = esc(w.hint) + icon('arrow-right');
    $('#w-track').innerHTML = w.items.map(function (c) {
      return '<a class="w-card" href="#book" data-cursor="view">' +
        '<span class="w-media imgz"><img src="' + photo(c.img, 900, 1125) + '" alt="' + esc(c.alt) + '" loading="lazy"></span>' +
        '<span class="w-no"><b>' + esc(c.no) + '</b>' + esc(c.type) + '</span>' +
        '<span class="w-name">' + esc(c.name) + '</span>' +
        '<span class="w-meta">' +
          '<span>' + icon('pin') + esc(c.city) + '</span>' +
          '<span>' + icon('ruler') + c.area + ' ㎡</span>' +
          '<span>' + icon('clock') + c.days + ' 天</span>' +
        '</span>' +
        '<span class="w-foot">' +
          '<span class="w-price">¥ ' + yuan(c.price) + '</span>' +
          '<span class="w-go">查看' + icon('arrow-up-right') + '</span>' +
        '</span>' +
        '</a>';
    }).join('');
  }

  /* ---------- 服务：四行清单 ---------- */
  function renderServices() {
    var s = D.services;
    $('#s-label').textContent = s.label;
    $('#s-latin').textContent = s.latin;
    $('#s-index').textContent = s.index;
    $('#s-lead').textContent = s.lead;
    $('#s-list').innerHTML = s.items.map(function (it) {
      return '<a class="srow" href="#book" data-cursor="talk" data-img="' + esc(it.img) + '">' +
        '<span class="s-no">' + esc(it.no) + '</span>' +
        '<span class="s-ic">' + icon(it.icon) + '</span>' +
        '<span class="s-main"><span class="s-name">' + esc(it.name) + '</span>' +
        '<span class="s-en">' + esc(it.en) + '</span></span>' +
        '<span class="s-desc">' + esc(it.desc) + '</span>' +
        '<span class="s-arrow">' + icon('arrow-right') + '</span>' +
        '</a>';
    }).join('');
  }

  /* ---------- 流程：三列 ---------- */
  function renderFlow() {
    var f = D.flow;
    $('#f-label').textContent = f.label;
    $('#f-latin').textContent = f.latin;
    $('#f-lead').textContent = f.lead;
    $('#f-steps').innerHTML = '<span class="f-line" id="f-line" aria-hidden="true"></span>' +
      f.items.map(function (s) {
        return '<div class="fstep">' +
          '<span class="f-ic">' + icon(s.icon) + '</span>' +
          '<p class="f-no">' + esc(s.no) + '</p>' +
          '<h3 class="f-name">' + esc(s.name) + '</h3>' +
          '<p class="f-days">' + icon('clock') + esc(s.days) + '</p>' +
          '<p class="f-note">' + esc(s.note) + '</p>' +
          '</div>';
      }).join('');
    var q = f.quote;
    $('#f-quote').innerHTML = icon('quote') +
      '<blockquote class="fquote-text">' + esc(q.text) + '</blockquote>' +
      '<figcaption class="fquote-foot"><span class="fquote-name">' + esc(q.name) + '</span>' +
      '<span>' + esc(q.meta) + '</span></figcaption>';
  }

  /* ---------- 预约 ---------- */
  function renderBook() {
    var b = D.book;
    $('#b-kicker').textContent = b.kicker;
    $('#b-rsvp').textContent = b.rsvp;
    $('#b-title').innerHTML = esc(b.lead) + '<span class="b-accent">' + esc(b.accent) + '</span>';
    $('#b-sub').textContent = b.sub;
    $('#b-phone-label').innerHTML = icon('phone') + esc(b.phoneLabel);
    $('#b-phone-no').textContent = D.brand.hotline;
    $('#b-btn').innerHTML = esc(b.btn) + icon('arrow-right');
    $('#b-input').placeholder = b.placeholder;
    $('#b-submit').textContent = '提交';
    $('#b-ok-title').innerHTML = icon('check') + esc(b.okTitle);
    $('#b-ok-sub').textContent = b.okSub;
    $('#b-again').textContent = b.again;
    $('#b-stores').innerHTML = b.stores.map(function (s) {
      return '<span>' + icon(s.icon) + esc(s.text) + '</span>';
    }).join('');
  }

  /* ---------- 预约表单：只收一个手机号 ---------- */
  function bindMini() {
    var btn = $('#b-btn');
    var form = $('#b-form');
    var input = $('#b-input');
    var msg = $('#b-msg');
    var ok = $('#b-ok');
    var sub = $('#b-submit');

    function show(el) {
      el.hidden = false;
      if (hasG && !REDUCE) {
        window.gsap.fromTo(el, { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: .55, ease: 'power3.out' });
      }
    }

    btn.addEventListener('click', function () {
      show(form);
      btn.hidden = true;
      input.focus({ preventScroll: true });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!/^1[3-9]\d{9}$/.test(v)) {
        msg.textContent = D.book.invalid;
        input.focus({ preventScroll: true });
        return;
      }
      msg.textContent = '';
      sub.disabled = true;
      sub.textContent = D.book.sending;
      setTimeout(function () {
        form.hidden = true;
        show(ok);
      }, 700);
    });

    input.addEventListener('input', function () { msg.textContent = ''; });

    $('#b-again').addEventListener('click', function () {
      ok.hidden = true;
      input.value = '';
      sub.disabled = false;
      sub.textContent = '提交';
      show(form);
      input.focus({ preventScroll: true });
    });
  }

  /* ---------- 主题 ---------- */
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var use = $('#theme-use');
    if (use) use.setAttribute('href', mode === 'day' ? '#i-moon' : '#i-sun');
  }
  function bindTheme() {
    var q = (location.search.match(/theme=(day|night)/) || [])[1];
    setTheme(q || store('gemu-theme') || 'day');
    $('#theme-btn').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'day' ? 'night' : 'day';
      setTheme(next);
      store('gemu-theme', next);
      if (hasG && !REDUCE) {
        window.gsap.fromTo('#theme-use', { rotate: -80, scale: .55 },
          { rotate: 0, scale: 1, duration: .65, ease: 'back.out(1.8)' });
      }
    });
  }

  /* ---------- 全屏抽屉 ---------- */
  function bindDrawer() {
    var burger = $('#burger');
    var drawer = $('#drawer');
    if (!burger || !drawer) return;
    function close() {
      drawer.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      $('#burger-use').setAttribute('href', '#i-menu');
    }
    burger.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      $('#burger-use').setAttribute('href', open ? '#i-x' : '#i-menu');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) close();
    });
  }

  /* ---------- 导航高亮：滚动进入视口中段即点亮 ---------- */
  function bindSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav-links a');
    if (!links.length) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('data-spy') === en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['works', 'services', 'flow', 'book'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- 自定义光标 ---------- */
  var CURSOR_TEXT = { view: '查看', talk: '咨询' };
  function initCursor() {
    if (!FINE || !hasG || REDUCE) return;
    var cur = $('#cursor');
    if (!cur) return;
    var g = window.gsap;
    g.set(cur, { xPercent: -50, yPercent: -50 });
    var tx = g.quickTo(cur, 'x', { duration: .32, ease: 'power3' });
    var ty = g.quickTo(cur, 'y', { duration: .32, ease: 'power3' });
    var shown = false;

    document.addEventListener('mousemove', function (e) {
      tx(e.clientX); ty(e.clientY);
      if (!shown) { shown = true; g.to(cur, { autoAlpha: 1, duration: .25 }); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      shown = false;
      g.to(cur, { autoAlpha: 0, duration: .25 });
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var hit = t && t.closest ? t.closest('[data-cursor]') : null;
      var mode = hit ? hit.getAttribute('data-cursor') : '';
      cur.classList.toggle('is-view', !!mode && CURSOR_TEXT[mode]);
      $('#cursor-t').textContent = CURSOR_TEXT[mode] || 'view';
    });
  }

  /* ---------- 服务行悬停参考图 ---------- */
  function initPeek() {
    if (!FINE || !hasG || REDUCE) return;
    var peek = $('#peek');
    var img = $('#peek-img');
    var box = $('#s-list');
    if (!peek || !box) return;
    var g = window.gsap;
    var vw = 240, vh = 300;
    var qx = g.quickTo(peek, 'x', { duration: .5, ease: 'power3' });
    var qy = g.quickTo(peek, 'y', { duration: .5, ease: 'power3' });
    var cx = 0, cy = 0, active = false;

    function place() {
      var px = cx + 28;
      if (px > window.innerWidth - vw - 24) px = cx - vw - 28;
      var py = cy - vh / 2;
      if (py < 16) py = 16;
      if (py > window.innerHeight - vh - 16) py = window.innerHeight - vh - 16;
      qx(px); qy(py);
    }

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (active) place();
    }, { passive: true });

    box.addEventListener('mouseover', function (e) {
      var row = e.target.closest('.srow');
      if (!row) return;
      img.src = photo(row.getAttribute('data-img'), 500, 625);
      active = true;
      peek.classList.add('on');
      place();
    });
    box.addEventListener('mouseleave', function () {
      active = false;
      peek.classList.remove('on');
    });
  }

  /* ---------- 磁吸按钮 ---------- */
  function initMagnetic() {
    if (!FINE || !hasG || REDUCE) return;
    var g = window.gsap;
    $$('[data-mag]').forEach(function (el) {
      var qx = g.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      var qy = g.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * .2);
        qy((e.clientY - r.top - r.height / 2) * .2);
      });
      el.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  }

  /* ---------- 回到顶部 ---------- */
  function bindTop() {
    $('#to-top').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     动效层
     ============================================================ */
  function heroIntro() {
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: 'power3.out' }, delay: .1 });

    tl.from('.hero-kicker', { y: 12, autoAlpha: 0, duration: .6 })
      .from('.hero-latin', { y: 16, autoAlpha: 0, duration: .7 }, '-=.38')
      .from('.hero-title .ht-ln > i', { yPercent: 112, duration: 1, stagger: .08 }, '-=.48')
      .from('.hero-sub', { y: 14, autoAlpha: 0, duration: .7 }, '-=.58')
      .from('.hero-frame', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'power2.inOut' }, '-=.95')
      .from('.hero-frame img', { scale: 1.14, duration: 1.4, ease: 'power2.out' }, '-=1.15')
      .from('.hero-cap', { y: 10, autoAlpha: 0, duration: .5 }, '-=.75')
      .from('.hero-meta span', { y: 10, autoAlpha: 0, duration: .5, stagger: .07 }, '-=.55')
      .from('.hero-scroll', { autoAlpha: 0, duration: .5 }, '-=.4')
      .from('.hero-outline', { yPercent: 24, autoAlpha: 0, duration: 1.1 }, '-=.95');
  }

  function heroScroll() {
    var g = window.gsap;
    g.to('.hero-frame img', {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    g.to('.hero-outline', {
      yPercent: -18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    g.to('.hero-copy', {
      yPercent: -8, autoAlpha: .3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true },
    });
  }

  function scrollChrome() {
    var g = window.gsap;
    g.to('#progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: .25 },
    });

    var nav = $('#nav');
    window.ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle('is-solid', y > 40);
        nav.classList.toggle('is-hide', y > 520 && self.direction === 1);
      },
    });
  }

  function galleryMotion(mm) {
    var g = window.gsap;

    /* 卡片入场：移动端同样生效 */
    g.from('.w-card', {
      y: 46, autoAlpha: 0, duration: .9, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: '#w-stage', start: 'top 78%' },
    });
    g.from('.w-head > *', {
      y: 18, autoAlpha: 0, duration: .7, stagger: .07,
      scrollTrigger: { trigger: '#w-stage', start: 'top 82%' },
    });

    /* 桌面：滚动驱动横向 pin */
    mm.add('(min-width: 901px)', function () {
      var stage = $('#w-stage');
      var track = $('#w-track');
      var bar = $('#w-prog-i');

      function dist() {
        return Math.max(0, track.offsetWidth - stage.clientWidth);
      }
      if (dist() < 60) return;

      stage.classList.add('is-pin');

      var tl = g.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: function () { return '+=' + (dist() + window.innerHeight * .35); },
          pin: true,
          scrub: .6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { g.set(bar, { scaleX: self.progress }); },
        },
      });
      tl.to(track, { x: function () { return -dist(); }, ease: 'none' });

      return function () {
        stage.classList.remove('is-pin');
        g.set(track, { clearProps: 'transform' });
        g.set(bar, { clearProps: 'transform' });
      };
    });
  }

  function blockReveals() {
    var g = window.gsap;

    g.from('.s-head > *', {
      y: 22, autoAlpha: 0, duration: .7, stagger: .07,
      scrollTrigger: { trigger: '.services', start: 'top 76%' },
    });
    g.from('.s-lead', {
      y: 16, autoAlpha: 0, duration: .7,
      scrollTrigger: { trigger: '.services', start: 'top 74%' },
    });
    g.from('.srow', {
      y: 30, autoAlpha: 0, duration: .8, stagger: .09, ease: 'power3.out',
      scrollTrigger: { trigger: '.s-list', start: 'top 86%' },
    });

    g.from('.f-head > *, .f-lead', {
      y: 20, autoAlpha: 0, duration: .7, stagger: .06,
      scrollTrigger: { trigger: '.flow', start: 'top 80%' },
    });
    g.from('.fstep', {
      y: 30, autoAlpha: 0, duration: .8, stagger: .12, ease: 'power3.out',
      scrollTrigger: { trigger: '.fsteps', start: 'top 84%' },
    });
    g.from('.f-ic', {
      scale: .5, autoAlpha: 0, duration: .6, stagger: .12, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.fsteps', start: 'top 84%' },
    });
    g.from('.fquote', {
      y: 26, autoAlpha: 0, duration: .8,
      scrollTrigger: { trigger: '.f-quote', start: 'top 88%' },
    });

    g.from('.b-left > *', {
      y: 26, autoAlpha: 0, duration: .8, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: '.book', start: 'top 72%' },
    });
    g.from('.b-right > *', {
      y: 24, autoAlpha: 0, duration: .8, stagger: .07, ease: 'power3.out',
      scrollTrigger: { trigger: '.book', start: 'top 72%' },
    });

    g.fromTo('.foot-word',
      { yPercent: 16 },
      {
        yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
  }

  function flowConnector(mm) {
    var g = window.gsap;
    mm.add('(min-width: 901px)', function () {
      g.from('#f-line', {
        scaleX: 0, duration: 1.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.fsteps', start: 'top 84%' },
      });
    });
    mm.add('(max-width: 900px)', function () {
      g.from('#f-line', {
        scaleY: 0, duration: 1.1, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.fsteps', start: 'top 86%' },
      });
    });
  }

  function initMotion() {
    if (!hasG || REDUCE) return;
    var mm = window.gsap.matchMedia();
    heroIntro();
    heroScroll();
    scrollChrome();
    galleryMotion(mm);
    blockReveals();
    flowConnector(mm);

    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
    }
  }

  /* ---------- 启动 ---------- */
  function boot() {
    var renders = [renderNav, renderHero, renderWorks, renderServices, renderFlow, renderBook];
    renders.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 渲染失败', fn.name, err); }
    });

    var binds = [bindMini, bindTheme, bindDrawer, bindSpy, bindTop, initCursor, initPeek, initMagnetic];
    binds.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 绑定失败', fn.name, err); }
    });

    try { initMotion(); } catch (err) { console.error('[gemu] 动效失败', err); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
