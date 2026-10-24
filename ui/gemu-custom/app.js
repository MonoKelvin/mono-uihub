/* 格木 GEMU · 交互
   内容全部来自 data.js；本页只负责渲染、筛选、表单与动效。 */
(function () {
  'use strict';

  var D = window.GEMU;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var UNSPLASH = 'https://images.unsplash.com/';
  function photo(id, w, h) {
    return UNSPLASH + id + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=80';
  }
  function yuan(n) { return '¥' + n.toLocaleString('zh-CN'); }

  /* ---------- 状态 ---------- */
  var state = {
    type: '全部',
    style: '全部',
    q: '',
    sort: 'none',
    desc: false,
    fav: {}
  };

  /* ---------- 顶栏与页脚 ---------- */
  function renderNav() {
    var links = D.nav.map(function (n) {
      return '<a href="#' + n.id + '" data-spy="' + n.id + '">' + n.text + '</a>';
    }).join('');
    $('#nav-links').innerHTML = links;
    $('#drawer-links').innerHTML = links;
    $('#foot-links').innerHTML = D.nav.map(function (n) {
      return '<a href="#' + n.id + '">' + n.text + '</a>';
    }).join('') + '<a href="#book">预约量房</a>';
  }

  /* ---------- 首屏 ---------- */
  function renderHero() {
    $('#hero-eyebrow').textContent = D.hero.eyebrow;
    $('#hero-title').innerHTML = D.hero.title.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    $('#hero-sub').textContent = D.hero.sub;

    $('#hero-stats').innerHTML = D.hero.stats.map(function (s) {
      return '<div class="stat' + (s.accent ? ' accent' : '') + '">' +
        '<span class="stat-value">' + s.value + '<i>' + s.unit + '</i></span>' +
        '<span class="stat-label">' + s.label + '</span></div>';
    }).join('');

    var f = D.hero.feature;
    var img = $('#hero-img');
    img.src = photo(f.img, 2000, 1100);
    img.alt = f.alt;
    $('#hero-cap-no').textContent = '№ ' + f.no;
    $('#hero-cap-name').textContent = f.name;
    $('#hero-cap-meta').innerHTML = '<span class="meta-row">' +
      f.meta.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</span>';
    $('#hero-cap-price').textContent = yuan(f.price) + ' 起';
  }

  /* ---------- 案例 ---------- */
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = D.cases.filter(function (c) {
      var okType = state.type === '全部' || c.type === state.type;
      var okStyle = state.style === '全部' || c.style === state.style;
      var hay = (c.name + c.city + c.style + c.type + c.designer + c.area).toLowerCase();
      return okType && okStyle && (!q || hay.indexOf(q) > -1);
    });
    if (state.sort !== 'none') {
      list.sort(function (a, b) {
        var d = a[state.sort] - b[state.sort];
        return state.desc ? -d : d;
      });
    }
    return list;
  }

  /* 编辑式行跨度：全景 → 双联 → 三联 循环，末尾按剩余数量收口 */
  function spanPlan(n) {
    var rows = [[12], [6, 6], [4, 4, 4]];
    var out = [], i = 0, k = 0;
    while (i < n) {
      var plan = rows[k % rows.length];
      if (i + plan.length <= n) {
        for (var j = 0; j < plan.length; j++) out.push(plan[j]);
        i += plan.length;
      } else {
        var rem = n - i;
        var tail = rem === 1 ? [12] : rem === 2 ? [6, 6] : [4, 4, 4];
        for (var t = 0; t < tail.length; t++) out.push(tail[t]);
        i = n;
      }
      k++;
    }
    return out;
  }

  function caseCard(c, span) {
    return '<article class="case s' + span + ' reveal">' +
      '<div class="case-media" data-src="' + c.img + '">' +
      '<img loading="lazy" alt="' + c.alt + '" src="' + photo(c.img, 1200, 900) + '">' +
      '<span class="case-no">№ ' + c.no + '</span>' +
      '<button class="fav' + (state.fav[c.no] ? ' on' : '') + '" type="button" data-no="' + c.no + '" aria-label="收藏 ' + c.name + '" aria-pressed="' + !!state.fav[c.no] + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.6l8.8-8.6a5.2 5.2 0 0 0 0-7.4z"/></svg>' +
      '</button></div>' +
      '<div class="case-body"><div class="case-id">' +
      '<h3 class="case-name">' + c.name + '</h3>' +
      '<p class="case-meta meta-row">' +
      '<span>' + c.city + '</span><span>' + c.type + '</span><span>' + c.area + ' ㎡</span><span>' + c.style + '</span></p>' +
      '</div><div class="case-foot">' +
      '<span class="case-days">交付 ' + c.days + ' 天</span>' +
      '<span class="case-price">' + yuan(c.price) + ' 起</span></div></div>' +
      '</article>';
  }

  function renderCases() {
    var list = filtered();
    var spans = spanPlan(list.length);
    var box = $('#cases');
    box.innerHTML = list.map(function (c, i) { return caseCard(c, spans[i]); }).join('');
    $('#empty').hidden = list.length !== 0;
    $('#fcount').textContent = list.length + ' 个案例';
    observeReveal(box);
  }

  function bindCases() {
    var box = $('#cases');
    box.addEventListener('click', function (e) {
      var fav = e.target.closest('.fav');
      if (fav) {
        var no = fav.getAttribute('data-no');
        state.fav[no] = !state.fav[no];
        fav.classList.toggle('on', !!state.fav[no]);
        fav.setAttribute('aria-pressed', String(!!state.fav[no]));
        return;
      }
      var retry = e.target.closest('.img-err button');
      if (retry) {
        var media = retry.closest('.case-media');
        var img = media.querySelector('img');
        media.classList.remove('is-error');
        var err = media.querySelector('.img-err');
        if (err) err.remove();
        img.src = photo(media.getAttribute('data-src'), 900, 700) + '&r=' + Date.now();
      }
    });
    /* 捕获阶段监听图片加载失败 */
    box.addEventListener('error', function (e) {
      var img = e.target;
      if (img.tagName !== 'IMG') return;
      var media = img.closest('.case-media');
      if (!media) return;
      media.classList.add('is-error');
      if (!media.querySelector('.img-err')) {
        var box2 = document.createElement('div');
        box2.className = 'img-err';
        box2.innerHTML = '<span>图片暂时加载失败</span><button type="button">重新加载</button>';
        media.appendChild(box2);
      }
    }, true);
  }

  function renderFilters() {
    function picks(host, values, key) {
      host.innerHTML = values.map(function (v) {
        var on = state[key] === v;
        return '<button class="pick" type="button" data-key="' + key + '" data-val="' + v + '" aria-pressed="' + on + '">' + v + '</button>';
      }).join('');
    }
    picks($('#f-type'), D.typeFilters, 'type');
    picks($('#f-style'), D.styleFilters, 'style');
  }

  function bindFilters() {
    ['#f-type', '#f-style'].forEach(function (sel) {
      $(sel).addEventListener('click', function (e) {
        var b = e.target.closest('.chip');
        if (!b) return;
        var key = b.getAttribute('data-key');
        state[key] = b.getAttribute('data-val');
        renderFilters();
        renderCases();
      });
    });
  }

  function bindSearch() {
    $('#q').addEventListener('input', function (e) {
      state.q = e.target.value;
      renderCases();
    });
  }

  function bindSort() {
    var btn = $('#sort-btn');
    var menu = $('#sort-menu');
    var labels = { none: '默认排序', area: '按面积', days: '按交付周期', price: '按造价' };

    btn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var key = li.getAttribute('data-sort');
      if (key === 'none') state.desc = false;
      else if (state.sort === key) state.desc = !state.desc;
      else { state.sort = key; state.desc = false; }
      $('#sort-label').textContent = labels[state.sort];
      $$('#sort-menu li').forEach(function (o) { o.setAttribute('aria-selected', String(o === li)); });
      var icon = $('i', btn);
      icon.className = 'ti ' + (state.desc ? 'ti-chevron-up' : 'ti-chevron-down');
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      renderCases();
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 定制清单 ---------- */
  function renderServices() {
    $('#services-body').innerHTML = D.services.map(function (s) {
      return '<div class="prow reveal">' +
        '<span class="prow-name">' + s.name + '</span>' +
        '<span class="prow-spec">' + s.spec + '</span>' +
        '<span class="prow-price">' + yuan(s.price) + ' 起</span>' +
        '<span class="prow-days">' + s.days + ' 天</span></div>';
    }).join('');
  }

  /* ---------- 材料 ---------- */
  function renderMaterials() {
    $('#mats').innerHTML = D.materials.map(function (m) {
      return '<div class="mat reveal">' +
        '<div class="mat-media"><img loading="lazy" alt="' + m.alt + '" src="' + photo(m.img, 700, 900) + '"></div>' +
        '<h3 class="mat-name">' + m.name + '</h3>' +
        '<p class="mat-spec">' + m.spec + '</p>' +
        '<p class="mat-note">' + m.note + '</p></div>';
    }).join('');
  }

  /* ---------- 流程 ---------- */
  function renderSteps() {
    $('#steps').innerHTML = D.steps.map(function (s, i) {
      return '<li class="step reveal"><span class="step-no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<p class="step-name">' + s.name + '</p>' +
        '<p class="step-note">' + s.note + '</p>' +
        '<p class="step-days">' + s.days + ' 天</p></li>';
    }).join('');
  }

  /* ---------- 团队与评价 ---------- */
  function renderTeam() {
    $('#team').innerHTML = D.designers.map(function (p) {
      return '<div class="person reveal">' +
        '<img loading="lazy" alt="' + p.name + '" src="' + p.avatar + '">' +
        '<div><p class="person-name">' + p.name + '</p>' +
        '<p class="person-field">' + p.field + '</p>' +
        '<p class="person-count">落地 ' + p.count + '</p></div></div>';
    }).join('');
  }

  function renderVoices() {
    $('#voice-list').innerHTML = D.voices.map(function (v) {
      return '<figure class="voice reveal"><blockquote class="voice-text">' + v.text + '</blockquote>' +
        '<figcaption class="voice-name">' + v.name + '</figcaption>' +
        '<p class="voice-meta">' + v.meta + '</p></figure>';
    }).join('');
  }

  /* ---------- 门店 ---------- */
  function renderStores() {
    $('#stores').innerHTML = D.stores.map(function (s) {
      return '<li><span class="store-city">' + s.city + '</span><span class="store-addr">' + s.addr + '</span></li>';
    }).join('');
    $('#foot-stores').innerHTML = D.stores.map(function (s) {
      return '<li>' + s.city + ' ' + s.addr + '</li>';
    }).join('');
    $('#hotline').textContent = D.brand.hotline;
    $('#foot-phone').textContent = D.brand.hotline;
  }

  /* ---------- 预约表单 ---------- */
  var picked = { city: '', type: '', style: '' };

  function chipGroup(host, values, key) {
    host.innerHTML = values.map(function (v) {
      return '<button class="pick" type="button" data-key="' + key + '" data-val="' + v + '" aria-pressed="false">' + v + '</button>';
    }).join('');
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.pick');
      if (!b) return;
      var val = b.getAttribute('data-val');
      picked[key] = picked[key] === val ? '' : val;
      $$('.pick', host).forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.getAttribute('data-val') === picked[key]));
      });
      clearError(key);
    });
  }

  function setError(key, msg) {
    var p = $('[data-err="' + key + '"]');
    if (p) p.textContent = msg || '';
    var field = p ? p.closest('.field') : null;
    if (field) field.classList.toggle('invalid', !!msg);
  }

  function clearError(key) {
    if (key === 'name') setError('name', '');
    if (key === 'phone') setError('phone', '');
    if (key === 'area') setError('area', '');
    if (key === 'city') setError('city', '');
    if (key === 'type') setError('type', '');
  }

  function validate() {
    var ok = true;
    var first = null;
    var name = $('#f-name').value.trim();
    var phone = $('#f-phone').value.trim();
    var area = $('#f-area').value.trim();

    if (name.length < 2) { setError('name', '请填写称呼，至少 2 个字'); ok = false; first = first || '#f-name'; }
    else setError('name', '');

    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('phone', '请填写 11 位手机号'); ok = false; first = first || '#f-phone'; }
    else setError('phone', '');

    var n = Number(area);
    if (!area || !isFinite(n) || n < 20 || n > 999) { setError('area', '面积需在 20 至 999 ㎡ 之间'); ok = false; first = first || '#f-area'; }
    else setError('area', '');

    if (!picked.city) { setError('city', '请选择城市'); ok = false; first = first || '#f-city'; }
    else setError('city', '');

    if (!picked.type) { setError('type', '请选择户型'); ok = false; first = first || '#f-type2'; }
    else setError('type', '');

    if (!ok && first) {
      var el = $(first);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.tagName === 'INPUT') el.focus({ preventScroll: true });
      }
    }
    return ok;
  }

  function bindForm() {
    chipGroup($('#f-city'), D.form.cities, 'city');
    chipGroup($('#f-type2'), D.form.types, 'type');
    chipGroup($('#f-style2'), D.form.styles, 'style');

    ['#f-name', '#f-phone', '#f-area'].forEach(function (sel) {
      $(sel).addEventListener('input', function () {
        var key = sel === '#f-name' ? 'name' : sel === '#f-phone' ? 'phone' : 'area';
        clearError(key);
      });
    });

    $('#form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        $('#form-msg').textContent = '请补全标出的信息';
        return;
      }
      var btn = $('#submit');
      btn.disabled = true;
      btn.textContent = '提交中';
      $('#form-msg').textContent = '正在提交预约';
      setTimeout(function () {
        var d = new Date();
        var no = 'GEMU-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 900) + 100);
        $('#done-no').textContent = no;
        $('#done-sub').textContent = $('#f-name').value.trim() + '，' + picked.city + ' ' + picked.type + ' ' + $('#f-area').value.trim() + ' ㎡，主案设计师 ' + (picked.style || '未定') + ' 方向';
        $('#form').hidden = true;
        $('#done').hidden = false;
        $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 900);
    });

    $('#again').addEventListener('click', function () {
      $('#form').reset();
      picked = { city: '', type: '', style: '' };
      $$('#form .pick').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      $$('#form .field').forEach(function (f) { f.classList.remove('invalid'); });
      $$('#form .err').forEach(function (p) { p.textContent = ''; });
      $('#form-msg').textContent = '';
      var btn = $('#submit');
      btn.disabled = false;
      btn.textContent = '提交预约';
      $('#done').hidden = true;
      $('#form').hidden = false;
      $('#f-name').focus({ preventScroll: true });
    });
  }

  /* ---------- 主题 ---------- */
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var icon = $('#theme-icon');
    if (icon) icon.className = 'ti ' + (mode === 'night' ? 'ti-sun' : 'ti-moon');
  }

  function bindTheme() {
    var saved = null;
    var q = (location.search.match(/theme=(day|night)/) || [])[1];
    try { saved = q || localStorage.getItem('gemu-theme'); } catch (err) { saved = q; }
    var prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefers ? 'night' : 'day'));
    $('#theme-btn').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'night' ? 'day' : 'night';
      setTheme(next);
      try { localStorage.setItem('gemu-theme', next); } catch (err) { /* 忽略隐私模式写入失败 */ }
    });
  }

  /* ---------- 抽屉 ---------- */
  function bindDrawer() {
    var burger = $('#burger');
    var drawer = $('#drawer');
    burger.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.querySelector('i').className = 'ti ' + (open ? 'ti-x' : 'ti-menu');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        drawer.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
        burger.querySelector('i').className = 'ti ti-menu';
      }
    });
  }

  /* ---------- 滚动驱动 ---------- */
  var io = null;

  function initObserver() {
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
  }

  function observeReveal(root) {
    if (!io) return;
    $$('.reveal', root).forEach(function (el) {
      if (el.dataset.seen) return;
      el.dataset.seen = '1';
      io.observe(el);
    });
  }

  function bindScroll() {
    var bar = $('#progress');
    var nav = $('#nav');
    var ticking = false;

    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      nav.classList.toggle('solid', h.scrollTop > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (!('IntersectionObserver' in window)) return;

    observeReveal(document);

    /* 兜底：观察器未触发时也要保证内容可见 */
    setTimeout(function () {
      $$('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2600);

    /* 流程连线绘制 */
    var steps = $('#steps');
    var stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { steps.classList.add('in'); stepIO.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    stepIO.observe(steps);

    /* 导航高亮 */
    var links = $$('.nav-links a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('data-spy') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['works', 'services', 'materials', 'flow', 'voices', 'book'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    try { initObserver(); } catch (err) { console.error('[gemu] 观察器初始化失败', err); }
    var tasks = [
      renderNav, renderHero, renderFilters, renderCases, renderServices,
      renderMaterials, renderSteps, renderTeam, renderVoices, renderStores
    ];
    tasks.forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[gemu] 渲染失败', fn.name, err); }
    });
    try { bindFilters(); } catch (err) { console.error('[gemu] 筛选绑定失败', err); }
    try { bindCases(); } catch (err) { console.error('[gemu] 案例交互失败', err); }
    try { bindSearch(); } catch (err) { console.error('[gemu] 搜索绑定失败', err); }
    try { bindSort(); } catch (err) { console.error('[gemu] 排序绑定失败', err); }
    try { bindForm(); } catch (err) { console.error('[gemu] 表单绑定失败', err); }
    try { bindTheme(); } catch (err) { console.error('[gemu] 主题绑定失败', err); }
    try { bindDrawer(); } catch (err) { console.error('[gemu] 抽屉绑定失败', err); }
    try { bindScroll(); } catch (err) { console.error('[gemu] 滚动绑定失败', err); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
