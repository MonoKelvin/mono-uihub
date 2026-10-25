/* 格木 GEMU / 交互（第四版 / 和纸编辑部）
   数据全部来自 data.js；动效走 IntersectionObserver + CSS 过渡 + rAF，
   不依赖任何外部动画库。 */

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

  /* ---------- 状态 ---------- */
  var state = { type: 'all', style: 'all', q: '', sort: 'none' };
  var favs = {};
  try { favs = JSON.parse(store('gemu-favs') || '{}'); } catch (err) { favs = {}; }

  /* ---------- 导航 ---------- */
  function renderNav() {
    var links = D.nav.map(function (n) {
      return '<a href="#' + n.id + '" data-spy="' + n.id + '">' + esc(n.text) + '</a>';
    }).join('');
    $('#nav-links').innerHTML = links;
    $('#drawer-links').innerHTML = links;
    $('#foot-links').innerHTML = D.nav.map(function (n) {
      return '<a href="#' + n.id + '">' + esc(n.text) + '</a>';
    }).join('') + '<a href="#book">预约量房</a>';
  }

  /* ---------- 首屏 ---------- */
  function renderHero() {
    var h = D.hero;
    $('#hero-label').textContent = h.label;
    $('#hero-title').innerHTML =
      '<span class="ht-lead">' + esc(h.titleLead) + '</span>' +
      '<span class="ht-line">到一间<span class="ht-accent">' + esc(h.titleAccent) +
      '<svg class="brush" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M3 10.5C42 5 82 3.5 122 6c28 1.8 52 3.2 73 1.2" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
      '</span>' + esc(h.titleTail) + '</span>';
    $('#hero-sub').textContent = h.sub;
    $('#hero-primary').innerHTML = esc(h.primary) + icon('arrow-right');
    $('#hero-ghost').innerHTML = esc(h.ghost) + icon('arrow-up-right');
    $('#hero-side').textContent = h.side;

    var f = h.feature;
    var img = $('#hero-img');
    img.src = photo(f.img, 900, 1125);
    img.alt = f.alt;
    $('#hero-cap-no').textContent = f.no;
    $('#hero-cap-name').textContent = f.name;
    $('#hero-cap-meta').textContent = f.meta.join(' / ');
    $('#hero-cap-price').textContent = f.price;

    $('#hero-stats').innerHTML = h.stats.map(function (s) {
      return '<div class="stat' + (s.accent ? ' accent' : '') + '">' +
        '<p class="stat-value">' + esc(s.value) + '<i>' + esc(s.unit) + '</i></p>' +
        '<p class="stat-label">' + esc(s.label) + '</p></div>';
    }).join('');
  }

  /* ---------- 跑马灯 ---------- */
  function renderMarquee() {
    var unit = D.marquee.map(function (t) {
      return '<span class="mq-item">' + esc(t) + '</span>' +
        '<svg class="ic mq-orn" aria-hidden="true"><use href="#i-diamond"/></svg>';
    }).join('');
    $('#marquee').innerHTML = unit + unit;
  }

  /* ---------- 作品：筛选 ---------- */
  function renderFilters() {
    $('#f-type').innerHTML = D.typeFilters.map(function (f) {
      return pickBtn('type', f);
    }).join('');
    $('#f-style').innerHTML = D.styleFilters.map(function (f) {
      return pickBtn('style', f);
    }).join('');
    $('#f-sort').innerHTML = D.sortOptions.map(function (s) {
      return '<button class="pick' + (s.id === state.sort ? ' on' : '') + '" type="button" data-sort="' + esc(s.id) + '">' + esc(s.label) + '</button>';
    }).join('');
    syncPicks();
    updateCount();
  }
  function pickBtn(group, f) {
    var on = state[group] === f.id ? ' on' : '';
    return '<button class="pick' + on + '" type="button" data-group="' + group + '" data-id="' + esc(f.id) + '">' + esc(f.label) + '</button>';
  }
  function syncPicks() {
    $$('#f-type .pick').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-id') === state.type);
    });
    $$('#f-style .pick').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-id') === state.style);
    });
    $$('#f-sort .pick').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-sort') === state.sort);
    });
  }
  function isDefault() {
    return state.type === 'all' && state.style === 'all' && state.q === '' && state.sort === 'none';
  }
  function favCount() {
    return Object.keys(favs).filter(function (k) { return favs[k]; }).length;
  }
  function updateCount(n) {
    var text = '共 ' + n + ' 个案例';
    var fc = favCount();
    if (fc > 0) text += '，收藏 ' + fc;
    $('#f-count').textContent = text;
    $('#f-reset').hidden = isDefault();
  }

  function filtered() {
    var q = state.q;
    var list = D.cases.filter(function (c) {
      if (state.type !== 'all' && c.type !== state.type) return false;
      if (state.style !== 'all' && c.style !== state.style) return false;
      if (q && c.name.toLowerCase().indexOf(q) < 0 && c.city.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (state.sort === 'area') list.sort(function (a, b) { return b.area - a.area; });
    else if (state.sort === 'days') list.sort(function (a, b) { return a.days - b.days; });
    else if (state.sort === 'price') list.sort(function (a, b) { return a.price - b.price; });
    return list;
  }

  /* ---------- 作品：精选案例 ---------- */
  function featureCard(c) {
    var on = !!favs[c.no];
    return '' +
      '<div class="feature-media marks imgz" data-cursor="view">' +
        '<img src="' + photo(c.img, 1000, 750) + '" alt="' + esc(c.alt) + '" loading="eager">' +
      '</div>' +
      '<div class="feature-info">' +
        '<p class="feature-no">' + esc(c.no) + ' / 精选</p>' +
        '<h3 class="feature-name">' + esc(c.name) + '</h3>' +
        '<div class="feature-meta"><span>' + esc(c.city) + '</span><span>' + esc(c.type) + '</span><span>' + c.area + ' ㎡</span><span>交付 ' + c.days + ' 天</span></div>' +
        '<p class="feature-price">¥ ' + yuan(c.price) + '<small>整屋定制到手价</small></p>' +
        '<p class="feature-designer">主案设计 ' + esc(c.designer) + '，含 ' + esc(c.style) + '风格全套柜体</p>' +
        '<div class="feature-act">' +
          '<a class="btn btn-ink" href="#book">预约同款' + icon('arrow-right') + '</a>' +
          '<button class="fav-btn' + (on ? ' on' : '') + '" type="button" data-fav="' + esc(c.no) + '" aria-pressed="' + on + '" aria-label="收藏该案例">' +
            icon(on ? 'bookmark-fill' : 'bookmark') + '<span>收藏</span></button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- 作品：列表行 ---------- */
  function caseRow(c, i) {
    var on = !!favs[c.no];
    return '' +
      '<article class="crow" style="--i:' + i + '" data-cursor="view" data-img="' + esc(c.img) + '">' +
        '<p class="crow-no">' + esc(c.no) + '</p>' +
        '<div class="crow-thumb"><img src="' + photo(c.img, 440, 330) + '" alt="' + esc(c.alt) + '" loading="lazy"></div>' +
        '<div class="crow-main"><h3 class="crow-name">' + esc(c.name) + '</h3><p class="crow-style">' + esc(c.style) + '</p></div>' +
        '<div class="crow-specs"><span>' + esc(c.city) + '</span><span>' + esc(c.type) + ' ' + c.area + ' ㎡</span><span>' + c.days + ' 天</span></div>' +
        '<p class="crow-price">¥ ' + yuan(c.price) + '</p>' +
        '<div class="crow-act">' +
          '<button class="fav-btn' + (on ? ' on' : '') + '" type="button" data-fav="' + esc(c.no) + '" aria-pressed="' + on + '" aria-label="收藏该案例">' + icon(on ? 'bookmark-fill' : 'bookmark') + '</button>' +
          '<span class="crow-arrow">' + icon('arrow-right') + '</span>' +
        '</div>' +
      '</article>';
  }

  function renderCases() {
    var list = filtered();
    updateCount(list.length);
    var feature = $('#feature');
    var cases = $('#cases');
    var empty = $('#empty');

    if (!list.length) {
      feature.hidden = true;
      cases.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    feature.hidden = false;
    feature.innerHTML = featureCard(list[0]);
    feature.classList.remove('fadein');
    void feature.offsetWidth;
    if (!REDUCE) feature.classList.add('fadein');
    cases.innerHTML = list.slice(1).map(caseRow).join('');
  }

  /* ---------- 定制清单 ---------- */
  function renderServices() {
    $('#services-body').innerHTML =
      '<div class="menu-head"><span>项目</span><span>规格</span><span>起价</span><span>周期</span></div>' +
      D.services.map(function (s) {
        var price = s.price > 0
          ? '<p class="mrow-price">¥ ' + yuan(s.price) + '<small>' + esc(s.unit) + '</small></p>'
          : '<p class="mrow-price free">' + esc(s.unit) + '</p>';
        return '<div class="mrow">' +
          '<p class="mrow-name">' + icon(s.icon) + esc(s.name) + '</p>' +
          '<p class="mrow-spec">' + esc(s.spec) + '</p>' +
          price +
          '<p class="mrow-days">' + esc(s.days) + '</p>' +
        '</div>';
      }).join('');
  }

  /* ---------- 材料 ---------- */
  function renderMaterials() {
    var list = D.materials;
    var f = list[0];
    var html = '' +
      '<div class="mat-feature rv">' +
        '<div class="mat-media marks imgz" data-cursor="view">' +
          '<img src="' + photo(f.img, 1000, 750) + '" alt="' + esc(f.alt) + '" loading="lazy">' +
        '</div>' +
        '<div class="mat-info">' +
          '<div class="swatch swatch-lg" style="background:' + esc(f.swatch) + '"></div>' +
          '<h3 class="mat-name">' + esc(f.name) + '</h3>' +
          '<p class="mat-spec">' + esc(f.spec) + '</p>' +
          '<p class="mat-note">' + esc(f.note) + '</p>' +
          '<p class="mat-tag">' + icon('sparkle') + '可替换、可升级，签约前封样</p>' +
        '</div>' +
      '</div>' +
      list.slice(1).map(function (t) {
        return '<div class="mat-row">' +
          '<div class="swatch" style="background:' + esc(t.swatch) + '"></div>' +
          '<div><h3 class="mat-name">' + esc(t.name) + '</h3><p class="mat-spec">' + esc(t.spec) + '</p></div>' +
          '<p class="mat-note">' + esc(t.note) + '</p>' +
        '</div>';
      }).join('');
    $('#mats').innerHTML = html;
  }

  /* ---------- 流程 ---------- */
  function renderSteps() {
    $('#steps').innerHTML = D.steps.map(function (s, i) {
      return '<li class="step">' +
        '<span class="step-node">' + ('0' + (i + 1)).slice(-2) + '</span>' +
        icon(s.icon, 'step-icon') +
        '<h3 class="step-name">' + esc(s.name) + '</h3>' +
        '<p class="step-days">' + esc(s.days) + '</p>' +
        '<p class="step-note">' + esc(s.note) + '</p>' +
      '</li>';
    }).join('');
  }

  /* ---------- 团队与评价 ---------- */
  function renderTeam() {
    $('#team').innerHTML = D.designers.map(function (d, i) {
      return '<article class="tcard rv" style="--d:' + (i % 3) * 90 + 'ms">' +
        '<div class="tcard-media marks imgz" data-cursor="view">' +
          '<img src="' + photo(d.img, 640, 853) + '" alt="' + esc(d.alt) + '" loading="lazy">' +
        '</div>' +
        '<div class="tcard-body">' +
          '<h3 class="tcard-name">' + esc(d.name) + '<span class="tcard-role">' + esc(d.role) + '</span></h3>' +
          '<p class="tcard-meta"><span>' + esc(d.field) + '</span><span>交付 ' + esc(d.count) + '</span></p>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderVoices() {
    $('#voice-list').innerHTML = D.voices.map(function (v, i) {
      return '<figure class="vquote rv" style="--d:' + i * 90 + 'ms">' +
        icon('quote', 'vquote-orn') +
        '<blockquote class="vquote-text">' + esc(v.text) + '</blockquote>' +
        '<figcaption class="vquote-foot"><span class="vquote-name">' + esc(v.name) + '</span>' +
        '<span class="vquote-meta">' + esc(v.city) + ' ' + esc(v.spec) + '</span></figcaption>' +
      '</figure>';
    }).join('');
  }

  /* ---------- 门店与联系 ---------- */
  function renderStores() {
    $('#stores').innerHTML = D.stores.map(function (s) {
      return '<li class="store">' + icon('pin') +
        '<div>' +
          '<p class="store-city">' + esc(s.city) + '<small>' + esc(s.name) + '</small></p>' +
          '<p class="store-addr">' + esc(s.addr) + '</p>' +
          '<p class="store-hours">' + esc(s.hours) + '</p>' +
        '</div></li>';
    }).join('');
    $('#foot-stores').innerHTML = D.stores.map(function (s) {
      return '<li>' + esc(s.city) + ' ' + esc(s.name) + '<br><span class="foot-dim">' + esc(s.addr) + '</span></li>';
    }).join('');
    $('#hotline').textContent = D.brand.hotline;
    $('#foot-phone').textContent = D.brand.hotline;
  }

  /* ---------- 表单 ---------- */
  function renderForm() {
    chipGroup($('#f-city'), D.form.cities, 'city');
    chipGroup($('#f-type2'), D.form.types, 'type');
    chipGroup($('#f-style2'), D.form.styles, 'style');
  }
  function chipGroup(box, items, name) {
    box.innerHTML = items.map(function (t) {
      return '<button class="chip" type="button" role="radio" aria-checked="false" data-name="' + name + '" data-value="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');
  }

  var ERR_LABELS = {
    name: '请填写姓名',
    phone: '请填写 11 位有效手机号',
    area: '面积需在 20 至 999 之间',
    city: '请选择城市',
    type: '请选择户型',
  };
  function showErrors(errs) {
    Object.keys(ERR_LABELS).forEach(function (k) {
      var p = $('.err[data-err="' + k + '"]');
      if (!p) return;
      var on = !!errs[k];
      p.textContent = on ? errs[k] : '';
      p.classList.toggle('on', on);
      var field = p.closest('.field');
      if (field) field.classList.toggle('err', on);
    });
  }
  function clearErr(k) {
    var p = $('.err[data-err="' + k + '"]');
    if (!p) return;
    p.textContent = '';
    p.classList.remove('on');
    var field = p.closest('.field');
    if (field) field.classList.remove('err');
  }
  function validate(v) {
    var errs = {};
    if (!v.name) errs.name = ERR_LABELS.name;
    if (!/^1[3-9]\d{9}$/.test(v.phone)) errs.phone = ERR_LABELS.phone;
    var area = parseFloat(v.area);
    if (!area || area < 20 || area > 999) errs.area = ERR_LABELS.area;
    if (!v.city) errs.city = ERR_LABELS.city;
    if (!v.type) errs.type = ERR_LABELS.type;
    return errs;
  }

  function bindForm() {
    var form = $('#form');
    var picks = { city: '', type: '', style: '' };

    form.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      picks[chip.getAttribute('data-name')] = chip.getAttribute('data-value');
      $$('.chip', chip.parentNode).forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-checked', String(on));
      });
      clearErr(chip.getAttribute('data-name'));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {
        name: $('#f-name').value.trim(),
        phone: $('#f-phone').value.trim(),
        area: $('#f-area').value.trim(),
        city: picks.city,
        type: picks.type,
        style: picks.style,
        note: $('#f-note').value.trim(),
      };
      var errs = validate(v);
      showErrors(errs);
      var first = Object.keys(errs)[0];
      if (first) {
        var map = { name: '#f-name', phone: '#f-phone', area: '#f-area', city: '#f-city', type: '#f-type2' };
        var el = $(map[first]);
        if (el) el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' });
        $('#form-msg').textContent = '还有 ' + Object.keys(errs).length + ' 项待完善';
        return;
      }
      var btn = $('#submit');
      btn.disabled = true;
      btn.innerHTML = '提交中';
      $('#form-msg').textContent = '';
      setTimeout(function () {
        $('#done-no').textContent = 'GMU' + String(Date.now()).slice(-6);
        $('#done-sub').textContent = v.name + '，已收到 ' + v.city + ' ' + v.type + ' ' + v.area +
          ' ㎡ 的量房预约，顾问将携带同户型案例与你联系。';
        form.hidden = true;
        var done = $('#done');
        done.hidden = false;
        done.classList.add('in');
        done.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' });
      }, 900);
    });

    ['name', 'phone', 'area'].forEach(function (k) {
      $({ name: '#f-name', phone: '#f-phone', area: '#f-area' }[k]).addEventListener('input', function () {
        clearErr(k);
      });
    });

    $('#again').addEventListener('click', function () {
      form.reset();
      picks = { city: '', type: '', style: '' };
      $$('.chip').forEach(function (c) {
        c.classList.remove('on');
        c.setAttribute('aria-checked', 'false');
      });
      Object.keys(ERR_LABELS).forEach(clearErr);
      var btn = $('#submit');
      btn.disabled = false;
      btn.innerHTML = '提交预约' + icon('arrow-right');
      $('#done').hidden = true;
      $('#done').classList.remove('in');
      form.hidden = false;
      $('#form-msg').textContent = '';
      $('#f-name').focus({ preventScroll: true });
    });
  }

  /* ---------- 筛选交互 ---------- */
  function bindFilters() {
    $('#filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.pick');
      if (!btn) return;
      if (btn.hasAttribute('data-sort')) {
        state.sort = btn.getAttribute('data-sort');
      } else {
        state[btn.getAttribute('data-group')] = btn.getAttribute('data-id');
      }
      syncPicks();
      renderCases();
    });
    $('#f-reset').addEventListener('click', resetFilters);
    $('#reset').addEventListener('click', resetFilters);
  }
  function resetFilters() {
    state.type = 'all';
    state.style = 'all';
    state.q = '';
    state.sort = 'none';
    $('#q').value = '';
    syncPicks();
    renderCases();
  }

  function bindSearch() {
    var timer = null;
    $('#q').addEventListener('input', function () {
      var v = this.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = v.toLowerCase();
        renderCases();
      }, 180);
    });
  }

  /* ---------- 收藏（事件委托，feature 与列表通用） ---------- */
  function bindCases() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fav]');
      if (!btn) return;
      var no = btn.getAttribute('data-fav');
      favs[no] = !favs[no];
      store('gemu-favs', JSON.stringify(favs));
      var on = !!favs[no];
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.innerHTML = icon(on ? 'bookmark-fill' : 'bookmark') +
        (btn.classList.contains('sm') ? '' : '<span>收藏</span>');
      var n = filtered().length;
      updateCount(n);
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

  /* ---------- 抽屉 ---------- */
  function bindDrawer() {
    var burger = $('#burger');
    var drawer = $('#drawer');
    if (!burger || !drawer) return;
    burger.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        drawer.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
        burger.querySelector('use').setAttribute('href', '#i-menu');
      }
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
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['works', 'services', 'materials', 'flow', 'voices', 'book'].forEach(function (id) {
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
    /* 兜底：观察器未触发时也要保证内容可见 */
    setTimeout(function () {
      $$('.rv:not(.in), .imgz:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2600);
  }

  /* ---------- 悬停图片预览（桌面） ---------- */
  function initPeek() {
    if (!FINE_POINTER || REDUCE) return;
    var peek = $('#peek');
    var img = $('#peek-img');
    if (!peek) return;
    var x = 0, y = 0, cx = 0, cy = 0, raf = null, active = false;

    function place() {
      var px = cx + 22;
      if (px > window.innerWidth - 270) px = cx - 272;
      peek.style.transform = 'translate3d(' + px + 'px,' + (cy - 150) + 'px,0)';
    }
    function loop() {
      cx += (x - cx) * .15;
      cy += (y - cy) * .15;
      place();
      raf = (Math.abs(x - cx) > .5 || Math.abs(y - cy) > .5) ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      if (active && !raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    var box = $('#cases');
    box.addEventListener('mouseover', function (e) {
      var row = e.target.closest('.crow');
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

  /* ---------- 轻量视差 ---------- */
  function initParallax() {
    if (REDUCE) return;
    var els = $$('[data-parallax]');
    if (!els.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      els.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = 'translate3d(0,' + (y * f).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 自定义光标 ---------- */
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
      var hit = t && t.closest ? t.closest('[data-cursor="view"]') : null;
      cur.classList.toggle('is-view', !!hit);
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
    var renders = [
      renderNav, renderHero, renderMarquee, renderFilters, renderCases, renderServices,
      renderMaterials, renderSteps, renderTeam, renderVoices, renderStores, renderForm,
    ];
    renders.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 渲染失败', fn.name, err); }
    });
    var binds = [
      bindFilters, bindSearch, bindCases, bindForm, bindTheme, bindDrawer,
      bindScroll, initReveal, initPeek, initParallax, initCursor, bindTop,
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
