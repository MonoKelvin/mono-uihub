/* 战功阁 · 交互
   单屏展馆：左轨切换视图，英雄居中如选将台，右侧玻璃面板换内容，底部英雄卡 3D 倾斜。
   数据全部来自 data.js（LEDGER_DATA），无 localStorage、无后端。 */
(function () {
  'use strict';

  var D = window.LEDGER_DATA;
  if (!D) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = {
    season: 'S42',
    view: 'legacy',
    heroId: D.player.mainHero.id,
    matchLane: '全部',
    query: '',
    shown: 10,
    openMatch: null
  };

  var VIEW_META = {
    legacy: { cn: '战功', en: 'LEGACY' },
    heroes: { cn: '英雄志', en: 'HEROES' },
    matches: { cn: '对局录', en: 'MATCHES' },
    honors: { cn: '勋章', en: 'HONORS' }
  };

  var SEASON_ORDER = ['S42', 'S41', 'S40'];
  var LANES = ['全部', '打野', '中路', '对抗路', '发育路', '游走'];
  var CDN = 'https://game.gtimg.cn/images/yxzj/img201606/';

  var ITEM_ICON = {
    '暗影战斧': 1137,
    '名刀·司命': 1127,
    '破军': 1138,
    '强者破军': 1138,
    '碎星锤': 1131,
    '纯净苍穹': 11311,
    '贤者的庇护': 1337,
    '噬神之书': 1240,
    '痛苦面具': 1235,
    '冰霜法杖': 1234,
    '凝冰之息': 1234,
    '辉月': 1239,
    '虚无法杖': 1231,
    '博学者之怒': 1232,
    '反伤刺甲': 1327,
    '不祥征兆': 1333,
    '霸者重装': 1332,
    '魔女斗篷': 1335,
    '无尽战刃': 1133,
    '泣血之刃': 1132,
    '逐日之弓': 1141,
    '破晓': 1155,
    '仁者破晓': 1155,
    '闪电匕首': 1135,
    '影刃': 1136,
    '救赎之翼': 1721,
    '极寒风暴': 1336,
    '星泉': 1747
  };

  var SPELL_ICON = { '闪现': 80115, '惩戒': 80102 };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function txt(node, value) { if (node) node.textContent = value; }

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function stageSplash(hero) {
    if (hero.id === 528) return CDN + 'skin/hero-info/528/528-bigskin-2.jpg';
    return hero.splash;
  }

  function heroById(id) {
    for (var i = 0; i < D.heroes.length; i++) if (D.heroes[i].id === id) return D.heroes[i];
    return D.heroes[0];
  }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ── 数字滚动 ─────────────────────────────────────── */
  var raf = window.requestAnimationFrame;
  function countTo(node, to, decimals) {
    if (!node) return;
    var from = parseFloat(String(node.textContent).replace(/[^\d.-]/g, '')) || 0;
    if (reduceMotion || Math.abs(to - from) < 0.04) {
      node.textContent = to.toFixed(decimals || 0);
      return;
    }
    var start = performance.now();
    var dur = 620;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = (from + (to - from) * eased).toFixed(decimals || 0);
      if (t < 1) raf(step);
    }
    raf(step);
  }

  /* ── 环比差 ───────────────────────────────────────── */
  function prevSeason(key) {
    var i = SEASON_ORDER.indexOf(key);
    return i > -1 && i < SEASON_ORDER.length - 1 ? D.seasons[SEASON_ORDER[i + 1]] : null;
  }

  function setDelta(node, value) {
    if (!node) return;
    if (value == null || !isFinite(value)) {
      node.textContent = '';
      node.classList.remove('is-flat');
      return;
    }
    var v = Math.round(value * 10) / 10;
    node.textContent = '较上季 ' + (v > 0 ? '+' : '') + v;
    node.classList.toggle('is-flat', v === 0);
  }

  /* ── 赛季 ─────────────────────────────────────────── */
  function seasonData(key) {
    return D.seasons[key] || D.seasons.S42;
  }

  function renderSeasons() {
    var host = $('#seasonSeg');
    host.innerHTML = '';
    SEASON_ORDER.forEach(function (key) {
      var b = el('button', null, key);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(key === state.season));
      b.dataset.season = key;
      b.addEventListener('click', function () { setSeason(key); });
      host.appendChild(b);
    });
  }

  function setSeason(key) {
    state.season = key;
    var s = seasonData(key);
    var prev = prevSeason(key);

    $$('#seasonSeg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.season === key));
    });

    txt($('#seasonMeta'), s.name + ' · ' + String(s.span).replace(/\s*—\s*/g, ' 至 '));

    var cap = s.rank === '最强王者' ? 50 : 25;
    txt($('#tierRank'), s.rank);
    countTo($('#tierStars'), s.stars, 0);
    $('#starBar').style.width = Math.min(100, Math.round((s.stars / cap) * 100)) + '%';
    var note = s.stars >= cap ? '本赛季已满星' : '距荣耀王者 ' + (cap - s.stars) + ' 星';
    if (prev) note += ' · 较上季 +' + (s.stars - prev.stars) + ' 星';
    txt($('#starNote'), note);

    countTo($('#kpiWin'), s.winrate, 1);
    countTo($('#kpiKda'), s.kda, 1);
    countTo($('#kpiPeak'), s.peak, 0);

    setDelta($('#kpiWinD'), prev ? s.winrate - prev.winrate : null);
    setDelta($('#kpiKdaD'), prev ? s.kda - prev.kda : null);
    setDelta($('#kpiPeakD'), prev ? s.peak - prev.peak : null);

    renderRadar(s);
    renderTrend(s);
    renderMetrics(s);
    txt($('#footNote'), s.name + ' 赛季 · 数据更新于 2026-04-17 22:30');
  }

  /* ── 雷达 ─────────────────────────────────────────── */
  function renderRadar(s) {
    var W = 272;
    var H = 244;
    var cx = W / 2;
    var cy = 116;
    var R = 82;
    var axes = D.radarAxes;
    var n = axes.length;

    function pt(i, r) {
      var a = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }

    var rings = [0.25, 0.5, 0.75, 1].map(function (k) {
      var pts = axes.map(function (_, i) {
        return pt(i, R * k).map(function (v) { return v.toFixed(1); }).join(',');
      }).join(' ');
      return '<polygon class="radar__ring" points="' + pts + '"' + (k === 1 ? '' : ' opacity=".5"') + '/>';
    }).join('');

    var spokes = axes.map(function (_, i) {
      var p = pt(i, R);
      return '<line class="radar__axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>';
    }).join('');

    var dataPts = s.radar.map(function (v, i) {
      return pt(i, (R * v) / 100).map(function (x) { return x.toFixed(1); }).join(',');
    }).join(' ');

    var dots = s.radar.map(function (v, i) {
      var p = pt(i, (R * v) / 100);
      return '<circle class="radar__dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.4"/>';
    }).join('');

    var labels = axes.map(function (name, i) {
      var anchor = 'middle';
      var p = pt(i, R + 20);
      var cos = Math.cos((-Math.PI / 2) + (i * 2 * Math.PI) / n);
      if (cos > 0.3) anchor = 'start';
      if (cos < -0.3) anchor = 'end';
      return '<text class="radar__label" x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle">' +
        name + '<tspan class="radar__val" dx="5">' + s.radar[i] + '</tspan></text>';
    }).join('');

    $('#radar').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="五维战力">' +
      rings + spokes +
      '<polygon class="radar__area" points="' + dataPts + '"/>' +
      dots + labels + '</svg>';

    var area = $('.radar__area', $('#radar'));
    if (area && !reduceMotion && area.getTotalLength) {
      var len = area.getTotalLength();
      if (len) {
        area.style.strokeDasharray = len;
        area.style.strokeDashoffset = len;
        area.style.fillOpacity = '0';
        area.getBoundingClientRect();
        area.style.transition = 'stroke-dashoffset .9s cubic-bezier(.22,1,.36,1), fill-opacity .9s cubic-bezier(.22,1,.36,1)';
        raf(function () {
          area.style.strokeDashoffset = '0';
          area.style.fillOpacity = '1';
        });
      }
    }
  }

  /* ── 十二周走势 ───────────────────────────────────── */
  function renderTrend(s) {
    var host = $('#trendPlot');
    var w = Math.max(180, host.clientWidth || 260);
    var h = 96;
    var padL = 6;
    var padR = 10;
    var padT = 12;
    var padB = 16;
    var data = s.trend;
    var lo = Math.min.apply(null, data);
    var hi = Math.max.apply(null, data);
    var span = Math.max(1, hi - lo);
    var step = span > 320 ? 100 : span > 130 ? 50 : 20;
    var yLo = Math.floor((lo - span * 0.16) / step) * step;
    var yHi = Math.ceil((hi + span * 0.16) / step) * step;

    function x(i) { return padL + ((w - padL - padR) * i) / (data.length - 1); }
    function y(v) { return padT + (h - padT - padB) * (1 - (v - yLo) / (yHi - yLo)); }

    var pts = data.map(function (v, i) { return [x(i), y(v)]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + x(data.length - 1).toFixed(1) + ' ' + (h - padB) + ' L' + padL + ' ' + (h - padB) + ' Z';

    var grid = [0, 0.5, 1].map(function (k) {
      var yy = padT + (h - padT - padB) * k;
      var val = Math.round(yHi - (yHi - yLo) * k);
      // 顶/底刻度移进绘图区内，避免压住「巅峰赛 · 十二周」标题与外框
      var ty = k === 0 ? yy + 11 : k === 1 ? yy - 4 : yy - 4;
      return '<line class="tr__grid" x1="' + padL + '" y1="' + yy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + yy.toFixed(1) + '"/>' +
        '<text class="tr__axis" x="' + (w - padR) + '" y="' + ty.toFixed(1) + '" text-anchor="end">' + val + '</text>';
    }).join('');

    var peakY = y(hi);
    var peak = '<line class="tr__peak" x1="' + padL + '" y1="' + peakY.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + peakY.toFixed(1) + '">' +
      '<title>赛季峰值 ' + hi + '</title></line>';
    var last = pts[pts.length - 1];

    host.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-label="巅峰赛十二周走势">' +
      '<defs><linearGradient id="trFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#e9c27b" stop-opacity=".30"/>' +
      '<stop offset="0.7" stop-color="#e9c27b" stop-opacity=".06"/>' +
      '<stop offset="1" stop-color="#e9c27b" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid + peak +
      '<path d="' + area + '" fill="url(#trFill)" stroke="none"/>' +
      '<path class="tr__line" d="' + line + '"/>' +
      '<circle class="tr__dot" cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.6"/>' +
      '</svg>';

    txt($('#trendPeak'), s.peakHigh);

    var path = $('.tr__line', host);
    if (path && !reduceMotion && path.getTotalLength) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)';
      raf(function () { path.style.strokeDashoffset = '0'; });
    }
  }

  /* ── 六项指标 ─────────────────────────────────────── */
  function renderMetrics(s) {
    var rows = [
      ['最高段位', s.rank + ' ' + s.stars + ' 星'],
      ['赛季场次', s.games + ' 场'],
      ['全场最佳', s.mvp + ' 次'],
      ['平均评分', s.score.toFixed(1)],
      ['最长连胜', s.streak + ' 场'],
      ['五杀', s.penta + ' 次']
    ];
    $('#metrics').innerHTML = rows.map(function (r) {
      return '<li><span>' + r[0] + '</span><b>' + r[1] + '</b></li>';
    }).join('');
  }

  /* ── 本命出装：按英雄分路取装，随英雄联动 ─────────────── */
  function renderBuild(hero) {
    var host = $('#buildRow');
    if (!host || !D.itemsByLane) return;
    var names = D.itemsByLane[hero.lane] || [];
    var spell = hero.lane === '打野' ? '惩戒' : '闪现';
    var html = names.map(function (name) {
      var id = ITEM_ICON[name];
      return id
        ? '<img src="' + CDN + 'itemimg/' + id + '.jpg" alt="' + name + '" title="' + name + '" loading="lazy" referrerpolicy="no-referrer">'
        : '';
    }).join('');
    var sid = SPELL_ICON[spell];
    if (sid) {
      html += '<img class="build__spell" src="' + CDN + 'summoner/' + sid + '.jpg" alt="' + spell + '" title="' + spell + '" loading="lazy" referrerpolicy="no-referrer">';
    }
    host.innerHTML = html;
    guardImages(host);
  }

  /* ── 视图切换 ─────────────────────────────────────── */
  function setView(name) {
    if (!VIEW_META[name]) name = 'legacy';
    state.view = name;

    $$('.nav').forEach(function (b) {
      var on = b.dataset.view === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });

    $$('.pane').forEach(function (p) {
      p.classList.toggle('is-on', p.id === 'pane-' + name);
    });

    txt($('#paneTitle'), VIEW_META[name].cn);
    txt($('#paneEn'), VIEW_META[name].en);

    var pane = $('#pane-' + name);
    if (pane) pane.scrollTop = 0;

    if (name === 'legacy') renderTrend(seasonData(state.season));

    try { history.replaceState(null, '', '#' + name); } catch (err) { /* file:// 下忽略 */ }
  }

  /* ── 英雄 ─────────────────────────────────────────── */
  function fireGlint() {
    var glint = $('#glint');
    if (!glint || reduceMotion) return;
    glint.classList.remove('is-on');
    void glint.offsetWidth; /* 强制回流，保证连续切换时动画可重播 */
    glint.classList.add('is-on');
  }

  function selectHero(id, opts) {
    var hero = heroById(id);
    state.heroId = hero.id;
    var stage = $('#heroStage');
    var img = $('#heroArt');

    function swap() {
      img.dataset.retry = '0';
      img.style.visibility = '';
      img.src = stageSplash(hero);
      img.alt = hero.name + ' · ' + hero.skin;
    }

    if (opts && opts.animate === false) {
      swap();
    } else {
      stage.classList.add('is-swapping');
      fireGlint();
      window.setTimeout(function () {
        swap();
        stage.classList.remove('is-swapping');
      }, reduceMotion ? 0 : 200);
    }

    txt($('#heroName'), hero.name);
    txt($('#heroRole'), hero.role);
    txt($('#ghostWord'), hero.name.slice(0, 1));

    var flag = $('#heroFlag');
    txt(flag, hero.note || '常用');
    flag.style.opacity = hero.note ? '1' : '0.5';

    renderBuild(hero);

    $$('.rc').forEach(function (c) {
      c.setAttribute('aria-pressed', String(Number(c.dataset.hero) === hero.id));
    });
    $$('#heroList button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.hero) === hero.id));
    });
  }

  function renderHeroList() {
    var host = $('#heroList');
    host.innerHTML = D.heroes.map(function (h) {
      return '<li><button type="button" data-hero="' + h.id + '" aria-pressed="' + (h.id === state.heroId) + '">' +
        '<img src="' + h.icon + '" alt="" loading="lazy">' +
        '<span class="hl__main">' +
        '<span class="hl__name">' + h.name + '<i>' + h.lane + ' · ' + h.role + '</i></span>' +
        '<span class="hl__meta">' +
        '<span>' + fmt(h.games) + ' 场</span>' +
        '<span>KDA ' + h.kda + '</span>' +
        '<span>战力 ' + fmt(h.power) + '</span>' +
        '</span>' +
        '</span>' +
        '<span class="hl__wr">' + h.winrate.toFixed(1) + '<i>%</i></span>' +
        '</button></li>';
    }).join('');

    $$('#heroList button').forEach(function (b) {
      b.addEventListener('click', function () { selectHero(Number(b.dataset.hero)); });
    });
    guardImages(host);
  }

  function laneEn(lane) {
    return { '打野': 'JUNGLE', '中路': 'MID', '对抗路': 'CLASH', '发育路': 'FARM', '游走': 'ROAM' }[lane] || 'HERO';
  }

  function renderRoster() {
    var host = $('#roster');
    var picks = [D.heroes[0], D.heroes[2], D.heroes[1], D.heroes[3], D.heroes[4]];
    host.innerHTML = picks.map(function (h, i) {
      return '<button class="rc" type="button" role="listitem" data-hero="' + h.id + '" aria-pressed="' + (h.id === state.heroId) + '">' +
        '<span class="rc__art"><img src="' + h.splash + '" alt="' + h.name + '" loading="lazy"></span>' +
        '<span class="rc__frame" aria-hidden="true"></span>' +
        '<span class="rc__glare" aria-hidden="true"></span>' +
        '<span class="rc__idx">' + ('0' + (i + 1)).slice(-2) + '</span>' +
        (h.note ? '<span class="rc__tag">' + h.note + '</span>' : '') +
        '<span class="rc__plate"><b>' + h.name + '</b><i>' + laneEn(h.lane) + '</i></span>' +
        '</button>';
    }).join('');

    $$('.rc').forEach(function (card) {
      card.addEventListener('click', function () { selectHero(Number(card.dataset.hero)); });
      if (reduceMotion) return;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translateY(-6px) rotateX(' + (-py * 9).toFixed(2) + 'deg) rotateY(' + (px * 12).toFixed(2) + 'deg) scale(1.03)';
        card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
    guardImages(host);
  }

  /* ── 对局录 ───────────────────────────────────────── */
  function laneFilters(host, current, onPick) {
    host.innerHTML = '';
    LANES.forEach(function (lane) {
      var count = lane === '全部'
        ? D.matches.length
        : D.matches.filter(function (m) { return m.lane === lane; }).length;
      var b = el('button', null, lane + '<i>' + count + '</i>');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(lane === current));
      b.addEventListener('click', function () {
        $$('button', host).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onPick(lane);
      });
      host.appendChild(b);
    });
  }

  function filteredMatches() {
    return D.matches.filter(function (m) {
      if (state.matchLane !== '全部' && m.lane !== state.matchLane) return false;
      if (state.query && m.hero.indexOf(state.query) === -1) return false;
      return true;
    });
  }

  function detailMarkup(m) {
    var d = m.detail;
    var bars = [
      ['参团', d.participation, d.participation + '%'],
      ['输出', d.damage, d.damage + '%'],
      ['承伤', d.tank, d.tank + '%'],
      ['经济', d.gold, d.gold + 'k']
    ];
    var items = d.items.map(function (name) {
      var id = ITEM_ICON[name];
      return id
        ? '<img src="' + CDN + 'itemimg/' + id + '.jpg" alt="' + name + '" title="' + name + '" loading="lazy">'
        : '<span class="spell" title="' + name + '">' + name.slice(0, 2) + '</span>';
    }).join('');

    var spellId = SPELL_ICON[d.spell];
    var spell = spellId
      ? '<img src="' + CDN + 'summoner/' + spellId + '.jpg" alt="' + d.spell + '" title="' + d.spell + '" loading="lazy">'
      : '<span class="spell">' + d.spell + '</span>';

    return '<div class="mrow__detail">' +
      '<div class="bars">' + bars.map(function (b) {
        return '<div class="bar"><span>' + b[0] + '</span><i style="--w:' + Math.min(100, b[1]) + '%"></i><b>' + b[2] + '</b></div>';
      }).join('') + '</div>' +
      '<div class="items">' + items + spell + '</div>' +
      '</div>';
  }

  function renderMatches() {
    var list = filteredMatches();
    var shown = list.slice(0, state.shown);
    var host = $('#matchList');

    host.innerHTML = shown.map(function (m) {
      var open = state.openMatch === m.id;
      return '<li class="mrow mrow--' + m.result + '" data-id="' + m.id + '">' +
        '<button class="mrow__btn" type="button" aria-expanded="' + open + '">' +
        '<span class="mrow__res">' + (m.result === 'win' ? 'W' : 'L') + '</span>' +
        '<img class="mrow__icon" src="' + m.icon + '" alt="" loading="lazy">' +
        '<span class="mrow__name">' + m.hero + '<i>' + m.lane + '</i>' + (m.mvp ? '<span class="mvp">MVP</span>' : '') + '</span>' +
        '<span class="mrow__kda">' + m.kda[0] + '<i>/</i>' + m.kda[1] + '<i>/</i>' + m.kda[2] + '</span>' +
        '<span class="mrow__meta">' +
        '<span>' + m.time + '</span>' +
        '<span class="mode">' + m.mode + '</span>' +
        '<span>' + m.duration + '</span>' +
        '<span class="score">评分 ' + m.score.toFixed(1) + '</span>' +
        '</span>' +
        '</button>' + (open ? detailMarkup(m) : '') + '</li>';
    }).join('');

    txt($('#matchCount'), list.length ? '已显示 ' + shown.length + ' / ' + list.length + ' 场' : '共 0 场');
    $('#matchEmpty').hidden = list.length > 0;

    var more = $('#loadMore');
    var rest = list.length - shown.length;
    more.hidden = rest <= 0;
    txt(more, rest > 0 ? '加载更多 · 还有 ' + rest + ' 场' : '加载更多');

    $$('.mrow__btn', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('.mrow').dataset.id;
        state.openMatch = state.openMatch === id ? null : id;
        renderMatches();
      });
    });

    guardImages(host);
  }

  /* ── 勋章 ─────────────────────────────────────────── */
  function renderSeals() {
    var got = D.collected || 0;
    var total = D.totalSeals || 48;
    var pct = Math.round((got / total) * 100);
    txt($('#sealCount'), got);
    txt($('#sealTotal'), total);
    countTo($('#sealPct'), pct, 0);
    $('#sealDonut').style.setProperty('--p', pct);

    $('#sealGrid').innerHTML = D.seals.map(function (s) {
      return '<div class="seal' + (s.fresh ? ' is-fresh' : '') + '">' +
        '<div class="seal__top">' +
        '<span class="seal__char">' + s.chars + '</span>' +
        '<span class="seal__count">×' + s.count + '</span>' +
        '</div>' +
        '<b>' + s.label + '</b>' +
        '<i>' + s.hint + '</i>' +
        '</div>';
    }).join('');
  }

  /* ── 分享 / toast ─────────────────────────────────── */
  var toastTimer = 0;
  function toast(msg) {
    var node = $('#toast');
    txt(node, msg);
    node.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { node.classList.remove('is-on'); }, 2600);
  }

  function shareLink() {
    var url = location.href.split('#')[0] + '#' + state.view;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast('战绩链接已复制');
      }).catch(function () { toast('复制失败，请手动复制地址栏'); });
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    toast(ok ? '战绩链接已复制' : '复制失败，请手动复制地址栏');
  }

  /* ── 金粉 ─────────────────────────────────────────── */
  function renderMotes() {
    var host = $('#motes');
    if (!host || reduceMotion) return;
    var html = '';
    for (var i = 0; i < 14; i++) {
      var dur = 10 + Math.random() * 9;
      html += '<i style="' +
        'left:' + (Math.random() * 100).toFixed(1) + '%;' +
        'top:' + (12 + Math.random() * 76).toFixed(1) + '%;' +
        '--o:' + (0.16 + Math.random() * 0.22).toFixed(2) + ';' +
        'animation-duration:' + dur.toFixed(1) + 's;' +
        'animation-delay:' + (-Math.random() * dur).toFixed(1) + 's' +
        '"></i>';
    }
    host.innerHTML = html;
  }

  /* ── 指针光效与视差 ───────────────────────────────── */
  function bindPointer() {
    var stage = $('#stage');
    var hero = $('#heroStage');
    var ghost = $('.ghost');
    var spot = $('.spot');
    var pending = false;
    var last = { x: 0, y: 0 };

    if (reduceMotion || !stage || !spot) return;

    stage.addEventListener('pointermove', function (e) {
      last.x = e.clientX;
      last.y = e.clientY;
      if (pending) return;
      pending = true;
      raf(function () {
        pending = false;
        var r = stage.getBoundingClientRect();
        var nx = (last.x - r.left) / r.width;
        var ny = (last.y - r.top) / r.height;
        spot.style.setProperty('--mx', (nx * 100).toFixed(1) + '%');
        spot.style.setProperty('--my', (ny * 100).toFixed(1) + '%');
        if (hero && !hero.classList.contains('is-swapping')) {
          hero.style.transform = 'translateX(calc(-50% + ' + ((nx - 0.5) * 16).toFixed(2) + 'px)) translateY(' + ((ny - 0.5) * 10).toFixed(2) + 'px)';
        }
        /* 保持 -50% 居中基准，否则幽灵字会在指针移动时跳位 */
        if (ghost) {
          ghost.style.transform = 'translate(calc(-50% + ' + ((nx - 0.5) * -22).toFixed(2) + 'px), -50%)';
        }
      });
    });

    stage.addEventListener('pointerleave', function () {
      if (hero) hero.style.transform = '';
      if (ghost) ghost.style.transform = '';
    });
  }

  /* ── 图片兜底 ─────────────────────────────────────── */
  function guardImages(root) {
    $$('img', root || document).forEach(function (img) {
      if (img.dataset.guard) return;
      img.dataset.guard = '1';
      img.addEventListener('error', function () {
        // 腾讯 CDN 偶发限流：先带参数重试两次，再降级
        var tried = Number(img.dataset.retry || 0);
        var src = img.getAttribute('src') || '';
        if (tried < 2 && src) {
          img.dataset.retry = String(tried + 1);
          var base = src.split('#')[0].replace(/[?&]r=\d+$/, '');
          window.setTimeout(function () {
            img.src = base + (base.indexOf('?') > -1 ? '&' : '?') + 'r=' + (tried + 1);
          }, 600 * (tried + 1));
          return;
        }
        img.style.visibility = 'hidden';
        var wrap = img.parentElement;
        if (wrap) wrap.classList.add('is-broken');
      });
    });
  }

  /* ── 事件绑定 ─────────────────────────────────────── */
  function bind() {
    $$('.nav').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });

    $('[data-share]').addEventListener('click', shareLink);

    var brand = $('.brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        setView('legacy');
      });
    }

    var input = $('#matchSearch');
    var clear = $('#matchClear');
    var timer = 0;
    function syncClear() {
      if (clear) clear.hidden = input.value.length === 0;
    }
    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      syncClear();
      timer = window.setTimeout(function () {
        state.query = input.value.trim();
        state.shown = 10;
        state.openMatch = null;
        renderMatches();
      }, 140);
    });
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        state.query = '';
        state.shown = 10;
        state.openMatch = null;
        syncClear();
        renderMatches();
        input.focus();
      });
    }

    $('#loadMore').addEventListener('click', function () {
      state.shown += 8;
      renderMatches();
    });

    laneFilters($('#matchFilter'), state.matchLane, function (lane) {
      state.matchLane = lane;
      state.shown = 10;
      state.openMatch = null;
      renderMatches();
    });

    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      var keys = { '1': 'legacy', '2': 'heroes', '3': 'matches', '4': 'honors' };
      if (keys[e.key]) { setView(keys[e.key]); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var i = SEASON_ORDER.indexOf(state.season);
        setSeason(SEASON_ORDER[e.key === 'ArrowRight' ? (i + 1) % SEASON_ORDER.length : (i + SEASON_ORDER.length - 1) % SEASON_ORDER.length]);
      }
    });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (state.view === 'legacy') renderTrend(seasonData(state.season));
      }, 160);
    });
  }

  /* ── 启动 ─────────────────────────────────────────── */
  function init() {
    renderSeasons();
    renderHeroList();
    renderRoster();
    renderMatches();
    renderSeals();
    bind();

    txt($('#serverMeta'), String(D.player.server).split('·')[0].trim());
    var stamp = $('#nameStamp');
    if (stamp) stamp.textContent = D.player.name.slice(-1);
    renderMotes();

    var hash = (location.hash || '').replace('#', '');
    setView(VIEW_META[hash] ? hash : 'legacy');
    setSeason('S42');
    selectHero(D.heroes[0].id, { animate: false });

    guardImages();
    bindPointer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
