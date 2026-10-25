/* 格木 GEMU / 交互（第五版 / 余白）
   数据全部来自 data.js；动效走 IntersectionObserver + CSS 过渡 + rAF，
   不依赖任何外部动画库。作品区为滚动驱动的横向 pin 画廊，
   移动端与降低动效场景自动降级为原生横向滚动。 */

(function () {
  'use strict';

  var D = window.GEMU;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
    var links = D.nav.map(function (n) {
      return '<a href="#' + n.id + '" data-spy="' + n.id + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#nav-links').innerHTML = links;
    $('#drawer-links').innerHTML = D.nav.map(function (n, i) {
      return '<a href="#' + n.id + '" style="--i:' + i + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#foot-links').innerHTML = D.nav.map(function (n) {
      return '<a href="#' + n.id + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#drawer-meta').textContent = D.brand.line + ' / 设计热线 ' + D.brand.hotline;
  }

  /* ---------- 首屏 ---------- */
  function renderHero() {
    var h = D.hero;
    $('#hero-kicker').textContent = h.kicker;
    $('#hero-title').innerHTML = h.lines.map(function (l, i) {
      return '<span class="ht-ln' + (l.accent ? ' ht-accent' : '') + '"><i style="--i:' + i + '">' +
        esc(l.text) + '</i></span>';
    }).join('');
    $('#hero-sub').textContent = h.sub;
    $('#hero-meta').innerHTML = h.meta.map(function (m) {
      return '<span>' + esc(m) + '</span>';
    }).join('');
    $('#hero-side').textContent = h.side;
    var img = $('#hero-img');
    img.src = photo(h.img, 900, 1200);
    img.alt = h.alt;
    $('#hero-cap').textContent = h.cap;
  }

  /* ---------- 作品：横向画廊 ---------- */
  function renderWorks() {
    var w = D.works;
    $('#w-label').textContent = w.label;
    $('#w-hint').innerHTML = esc(w.hint) + icon('arrow-right');
    $('#w-track').innerHTML = w.items.map(function (c) {
      return '<a class="w-card" href="#book" data-cursor="view">' +
        '<span class="w-ghost" aria-hidden="true">' + esc(c.no) + '</span>' +
        '<span class="w-media imgz"><img src="' + photo(c.img, 900, 1125) + '" alt="' + esc(c.alt) + '" loading="lazy"></span>' +
        '<span class="w-no">' + esc(c.no) + ' / ' + esc(c.type) + '</span>' +
        '<span class="w-name">' + esc(c.name) + '</span>' +
        '<span class="w-meta">' + esc(c.city) + ' / ' + c.area + ' ㎡ / 交付 ' + c.days + ' 天</span>' +
        '<span class="w-price">¥ ' + yuan(c.price) + '</span>' +
        '</a>';
    }).join('');
  }

  /* ---------- 服务：四行清单 ---------- */
  function renderServices() {
    $('#s-label').textContent = D.services.label;
    $('#s-list').innerHTML = D.services.items.map(function (s) {
      return '<a class="srow" href="#book" data-cursor="talk" data-img="' + esc(s.img) + '">' +
        '<span class="s-no">' + esc(s.no) + '</span>' +
        '<span class="s-main"><span class="s-name">' + esc(s.name) + '</span>' +
        '<span class="s-en">' + esc(s.en) + '</span></span>' +
        '<span class="s-desc">' + esc(s.desc) + '</span>' +
        '<span class="s-arrow">' + icon('arrow-right') + '</span>' +
        '</a>';
    }).join('');
  }

  /* ---------- 流程 ---------- */
  function renderFlow() {
    $('#f-label').textContent = D.flow.label;
    $('#f-steps').innerHTML = D.flow.items.map(function (s, i) {
      return '<li class="fstep" style="--d:' + i * 110 + 'ms">' +
        '<p class="f-no">' + esc(s.no) + '</p>' +
        '<h3 class="f-name">' + esc(s.name) + '</h3>' +
        '<p class="f-days">' + esc(s.days) + '</p>' +
        '<p class="f-note">' + esc(s.note) + '</p>' +
        '</li>';
    }).join('');
    var q = D.flow.quote;
    $('#f-quote').innerHTML = icon('quote') +
      '<blockquote class="fquote-text">' + esc(q.text) + '</blockquote>' +
      '<figcaption class="fquote-foot"><span class="fquote-name">' + esc(q.name) + '</span>' +
      '<span>' + esc(q.meta) + '</span></figcaption>';
  }

  /* ---------- 预约 ---------- */
  function renderBook() {
    var b = D.book;
    $('#b-kicker').textContent = b.kicker;
    $('#b-title').innerHTML = esc(b.lead) + '<span class="b-accent">' + esc(b.accent) + '</span>';
    $('#b-sub').textContent = b.sub;
    $('#b-phone-label').textContent = b.phoneLabel;
    $('#b-phone-no').textContent = D.brand.hotline;
    $('#b-btn').textContent = b.btn;
    $('#b-input').placeholder = b.placeholder;
    $('#b-submit').textContent = '提交';
    $('#b-ok-title').textContent = b.okTitle;
    $('#b-ok-sub').textContent = b.okSub;
    $('#b-again').textContent = b.again;
    $('#b-stores').textContent = b.stores;
  }

  /* ---------- 预约表单：只收一个手机号 ---------- */
  function bindMini() {
    var btn = $('#b-btn');
    var form = $('#b-form');
    var input = $('#b-input');
    var msg = $('#b-msg');
    var ok = $('#b-ok');
    var sub = $('#b-submit');

    btn.addEventListener('click', function () {
      form.hidden = false;
      form.classList.remove('fadein');
      void form.offsetWidth;
      form.classList.add('fadein');
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
        ok.hidden = false;
        ok.classList.remove('fadein');
        void ok.offsetWidth;
        ok.classList.add('fadein');
      }, 700);
    });

    input.addEventListener('input', function () { msg.textContent = ''; });

    $('#b-again').addEventListener('click', function () {
      ok.hidden = true;
      input.value = '';
      sub.disabled = false;
      sub.textContent = '提交';
      form.hidden = false;
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

  /* ---------- 滚动：进度条 / 导航态 / 高亮 ---------- */
  function bindScroll() {
    var bar = $('#progress');
    var nav = $('#nav');
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      if (nav) nav.classList.toggle('solid', h.scrollTop > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav-links a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('data-spy') === en.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['works', 'services', 'flow', 'book'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- 进场动效 ---------- */
  function initReveal() {
    var items = $$('.rv, .imgz');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    /* 兜底：观察器未触发时也要保证内容可见 */
    setTimeout(function () {
      $$('.rv:not(.in), .imgz:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2600);
  }

  /* ---------- 作品：横向 pin 画廊 ---------- */
  function initWorks() {
    var sec = $('#works');
    var stage = $('#w-stage');
    var track = $('#w-track');
    var prog = $('#w-prog-i');
    if (!sec || !stage || !track) return;

    /* 移动端或降低动效：走原生横向滚动（CSS 默认态） */
    if (REDUCE || (window.matchMedia && window.matchMedia('(max-width: 900px)').matches)) return;

    stage.classList.add('pin');
    var dist = 0;

    function measure() {
      dist = Math.max(0, (track.scrollWidth || 0) - (window.innerWidth || 0));
      sec.style.height = ((window.innerHeight || 0) + dist) + 'px';
    }
    function update() {
      var rect = sec.getBoundingClientRect();
      var total = (sec.offsetHeight || 0) - (window.innerHeight || 0);
      var p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (prog) prog.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }

    measure();
    update();

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { measure(); update(); }, 160);
    });
  }

  /* ---------- 自定义光标 ---------- */
  var CURSOR_TEXT = { view: '查看', talk: '咨询' };
  function initCursor() {
    if (!FINE_POINTER || REDUCE) return;
    var cur = $('#cursor');
    if (!cur) return;
    var x = 0, y = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (x - cx) * .22;
      cy += (y - cy) * .22;
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
      raf = (Math.abs(x - cx) > .4 || Math.abs(y - cy) > .4) ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      cur.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var hit = t && t.closest ? t.closest('[data-cursor]') : null;
      var mode = hit ? hit.getAttribute('data-cursor') : '';
      cur.classList.toggle('is-view', !!mode && CURSOR_TEXT[mode]);
      $('#cursor-t').textContent = CURSOR_TEXT[mode] || 'view';
    });
  }

  /* ---------- 悬停参考图（服务行，桌面） ---------- */
  function initPeek() {
    if (!FINE_POINTER || REDUCE) return;
    var peek = $('#peek');
    var img = $('#peek-img');
    var box = $('#s-list');
    if (!peek || !box) return;
    var x = 0, y = 0, cx = 0, cy = 0, raf = null, active = false;

    function place() {
      var px = cx + 26;
      if (px > window.innerWidth - 260) px = cx - 266;
      var py = cy - 130;
      if (py < 12) py = 12;
      peek.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
    }
    function loop() {
      cx += (x - cx) * .14;
      cy += (y - cy) * .14;
      place();
      raf = (Math.abs(x - cx) > .5 || Math.abs(y - cy) > .5) ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      if (active && !raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    box.addEventListener('mouseover', function (e) {
      var row = e.target.closest('.srow');
      if (!row) return;
      img.src = photo(row.getAttribute('data-img'), 500, 375);
      active = true;
      peek.classList.add('on');
      cx = x; cy = y;
      place();
      if (!raf) raf = requestAnimationFrame(loop);
    });
    box.addEventListener('mouseleave', function () {
      active = false;
      peek.classList.remove('on');
    });
  }

  /* ---------- 回到顶部 ---------- */
  function bindTop() {
    $('#to-top').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    var renders = [renderNav, renderHero, renderWorks, renderServices, renderFlow, renderBook];
    renders.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 渲染失败', fn.name, err); }
    });
    var binds = [
      bindMini, bindTheme, bindDrawer, bindScroll,
      initReveal, initWorks, initCursor, initPeek, bindTop,
    ];
    binds.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 绑定失败', fn.name, err); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
