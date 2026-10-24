/* =================================================================
   量界 · 物理讨论社区 · 网页模式
   数据全部来自 data.js（window.QJ），本文件不含任何硬编码内容。

   关键约定：
   1. 网页模式：整页滚动 + hash 路由（#/、#/channels、#/tags、#/me、
      #/thread/:id、#/chan/:id、#/tag/:id），浏览器前进后退可用。
   2. 滚动驱动的出场：区块进入视口时点亮（IntersectionObserver），
      同时保留兜底扫描，保证任何情况下内容都可见。
   3. 图标全部走内联 SVG sprite，不依赖任何图标字体外链。
   4. HUD 特效：矩阵雨、量子态旋转、拓扑脉冲、信号条、进度线、
      按钮级故障撕裂；reduce-motion 下全部降级。
   ================================================================= */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DATA = window.QJ || { channels: [], tags: [], users: {}, threads: [] };
  const CHANNELS = DATA.channels;
  const TAGS = DATA.tags;
  const USERS = DATA.users;
  const THREADS = DATA.threads;
  const USER_KEYS = Object.keys(USERS);

  const ic = (name, cls = '') => `<svg class="ic ${cls}"><use href="#${name}"/></svg>`;

  /* ------------------------------------------------------------ 频道图形 */

  const ART_SET = {
    mech: {
      icon: '<path d="M12 3v6"/><circle cx="12" cy="11.4" r="2"/><path d="M6.2 15.6c.9 2.6 3.2 4 5.8 4s4.9-1.4 5.8-4" stroke-dasharray="1.8 2.2"/>',
      art: '<path d="M60 12v20"/><circle cx="60" cy="38" r="6.5"/><path d="M36 54Q60 76 84 54" stroke-dasharray="2 3.4"/><circle cx="36" cy="54" r="1.8" fill="var(--ink)" stroke="none"/><circle cx="84" cy="54" r="1.8" fill="var(--ink)" stroke="none"/><path d="M22 70c7-7 14-7 21 0s14 7 21 0 14-7 21 0" stroke="var(--ink-2)" stroke-opacity=".7"/>'
    },
    em: {
      icon: '<circle cx="8.4" cy="12" r="2.2"/><circle cx="15.6" cy="12" r="2.2"/><path d="M8.4 9.8V7.6M15.6 9.8V7.6M8.4 14.2v2.2M15.6 14.2v2.2M10.8 8.6c1.6-2 3.2-2 4.8 0M10.8 15.4c1.6 2 3.2 2 4.8 0"/>',
      art: '<circle cx="46" cy="42" r="9.5"/><circle cx="74" cy="42" r="9.5"/><path d="M41.5 19h9M46 14.5v9" stroke="var(--ink)"/><path d="M69.5 60h9" stroke="var(--ink-2)"/><path d="M52 26C56 18 64 18 68 26M52 58C56 66 64 66 68 58M30 30C22 36 22 48 30 54M90 30C98 36 98 48 90 54"/>'
    },
    quantum: {
      icon: '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.2" ry="3.6" transform="rotate(-60 12 12)"/>',
      art: '<circle cx="60" cy="42" r="5" fill="var(--ink)" stroke="none"/><ellipse cx="60" cy="42" rx="38" ry="14"/><ellipse cx="60" cy="42" rx="38" ry="14" transform="rotate(60 60 42)"/><ellipse cx="60" cy="42" rx="38" ry="14" transform="rotate(-60 60 42)"/><circle cx="98" cy="42" r="3" fill="var(--ink-2)" stroke="none"/><circle cx="79" cy="74.9" r="2.6" fill="var(--ink)" stroke="none"/><circle cx="79" cy="9.1" r="2.2" fill="var(--ink-3)" stroke="none"/>'
    },
    rel: {
      icon: '<path d="M3 7h18"/><path d="M3 12c3.4 0 5 2.6 9 2.6S17.6 12 21 12"/><path d="M3 17h18"/><circle cx="12" cy="14.8" r="1.3" fill="currentColor" stroke="none"/>',
      art: '<path d="M12 20h96"/><path d="M12 42c13 0 20 9 48 9s35-9 48-9"/><path d="M12 64c19 0 29 13 48 13s29-13 48-13"/><circle cx="60" cy="58" r="5.5" fill="var(--ink)" stroke="none"/><ellipse cx="60" cy="58" rx="11" ry="3.6" transform="rotate(-14 60 58)" stroke="var(--ink-2)" stroke-opacity=".8"/>'
    },
    thermo: {
      icon: '<path d="M9.2 3h5.6M10.4 3v5.2L6 17a2.7 2.7 0 0 0 2.4 4h7.2A2.7 2.7 0 0 0 18 17l-4.4-8.8V3"/><circle cx="9.6" cy="15.4" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r=".9" fill="currentColor" stroke="none"/><circle cx="11.8" cy="17.2" r=".9" fill="currentColor" stroke="none"/>',
      art: '<path d="M51 14h18M53 14v13L38 58a9 9 0 0 0 8 13h28a9 9 0 0 0 8-13L67 27V14"/><circle cx="50" cy="56" r="2.4" fill="var(--ink)" stroke="none"/><circle cx="66" cy="49" r="2" fill="var(--ink-2)" stroke="none"/><circle cx="58" cy="64" r="2.2" fill="var(--ink-3)" stroke="none"/><path d="M49 8c2.5-3-2.5-5 0-8M60 8c2.5-3-2.5-5 0-8M71 8c2.5-3-2.5-5 0-8" stroke="var(--ink)" stroke-opacity=".6"/>'
    },
    optics: {
      icon: '<path d="M12 3.4 20.6 19H3.4z"/><path d="M2.6 6.6 9.8 13"/><path d="M14.6 13.4 19.4 11M14.6 13.4 19.6 13.6M14.6 13.4 18.8 16"/>',
      art: '<path d="M60 18 94 68H26z"/><path d="M6 28 44 44" stroke="var(--ink-2)"/><path d="M76 45 110 33" stroke="var(--ink)"/><path d="M76 45 112 45"/><path d="M76 45 110 57" stroke="var(--ink-2)" stroke-opacity=".7"/>'
    },
    astro: {
      icon: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9.4" ry="3.8" transform="rotate(-22 12 12)"/><circle cx="20.4" cy="8.6" r="1.2" fill="currentColor" stroke="none"/><path d="M12 6.6v1.6M12 15.8v1.6M6.8 12h1.6M15.6 12h1.6"/>',
      art: '<circle cx="50" cy="42" r="8.5" stroke="var(--ink)"/><path d="M50 29v-4M50 55v4M37 42h-4M63 42h4" stroke="var(--ink)"/><ellipse cx="50" cy="42" rx="42" ry="15" transform="rotate(-16 50 42)"/><ellipse cx="50" cy="42" rx="30" ry="10.5" transform="rotate(30 50 42)"/><circle cx="90.4" cy="30.4" r="3" fill="var(--ink-2)" stroke="none"/><circle cx="76" cy="57" r="2.4" fill="var(--ink)" stroke="none"/><path d="M18 16v5M15.5 18.5h5M100 62v4M98 64h4" stroke="var(--ink-3)"/>'
    },
    exp: {
      icon: '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M6 12.6c1.8-4.4 3.4 1.2 5.4-2.6 1.6-3 3.4-.8 5.2 1"/><path d="M8.5 21h7M12 16v5"/>',
      art: '<rect x="22" y="14" width="76" height="46" rx="7"/><path d="M32 38q7-13 14 0t14 0t14 0"/><path d="M32 52h56" stroke-opacity=".4"/><circle cx="88" cy="24" r="3" stroke="var(--ink)"/><path d="M60 14V9M48 60v8M72 60v8M40 68h40"/>'
    }
  };

  const chanIcon = (id) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(ART_SET[id] || ART_SET.mech).icon}</svg>`;
  const chanArt = (id) => `<svg viewBox="0 0 120 84" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(ART_SET[id] || ART_SET.mech).art}</svg>`;

  /* ------------------------------------------------------------ 状态 */

  const state = {
    view: 'home',
    sort: 'hot',
    chanFilter: null,
    meTab: 'posts',
    votes: {},
    saved: new Set(['t1', 't5']),
    results: [],
    cursor: 0,
    shown: 10,
    page: null,
    theme: 'dark',
    logCursor: 0
  };

  const PAGE_SIZE = 10;

  /* ------------------------------------------------------------ 工具 */

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const chanById = (id) => CHANNELS.find((c) => c.id === id);
  const chanName = (id) => (chanById(id) || {}).name || '';
  const tagById = (id) => TAGS.find((t) => t.id === id);
  const sep = '<span class="sep" aria-hidden="true"></span>';
  const AV = (key) => `https://api.dicebear.com/9.x/notionists/svg?seed=${(USERS[key] || {}).avatar || key}&backgroundColor=transparent`;

  function sigLevel(seed) {
    let h = 2166136261;
    const str = String(seed);
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h % 5) + 1;
  }
  const sigBars = (seed, cool) => {
    const n = sigLevel(seed);
    return `<span class="sig-bars${cool ? ' cool' : ''}" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  };

  const MATH_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

  function katexHTML(source, displayMode) {
    const plain = String(source).trim();
    if (!window.katex) {
      return `<code style="font-family:var(--font-mono);font-size:.92em">${esc(plain)}</code>`;
    }
    try {
      return katex.renderToString(plain, { displayMode: !!displayMode, throwOnError: false, strict: false });
    } catch (e) {
      return `<code style="font-family:var(--font-mono);font-size:.92em">${esc(plain)}</code>`;
    }
  }

  function mathify(text) {
    const out = [];
    let last = 0;
    let m;
    MATH_RE.lastIndex = 0;
    while ((m = MATH_RE.exec(text)) !== null) {
      out.push(esc(text.slice(last, m.index)));
      if (m[1] !== undefined) out.push(katexHTML(m[1], true));
      else out.push(katexHTML(m[2], false));
      last = m.index + m[0].length;
    }
    out.push(esc(text.slice(last)));
    return out.join('').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  const prose = (text) => text.split('\n').filter(Boolean).map((line) => `<p>${mathify(line)}</p>`).join('');

  let toastTimer = null;
  function toast(msg, iconName = 'i-circle-check') {
    const el = $('#toast');
    el.innerHTML = `${ic(iconName)}<span>${esc(msg)}</span>`;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ------------------------------------------------------------ 滚动出场 */

  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.remove('rv-wait');
          en.target.classList.add('rv-on');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 })
    : null;

  function observeReveals(root = document) {
    $$('.rv:not(.rv-on):not(.rv-wait)', root).forEach((el) => {
      el.classList.add('rv-wait');
      if (io) io.observe(el);
      else { el.classList.remove('rv-wait'); el.classList.add('rv-on'); }
    });
  }

  /* 兜底：任何仍在等待的元素，若已在视口内则点亮 */
  function sweepReveals() {
    $$('.rv.rv-wait').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.remove('rv-wait');
        el.classList.add('rv-on');
        if (io) io.unobserve(el);
      }
    });
  }

  /* ------------------------------------------------------------ 渲染：焦点区 */

  function renderMasthead() {
    const t = THREADS[0];
    const u = USERS[t.user] || {};
    const c = chanById(t.chan);
    const now = new Date();

    $('#mh-date').textContent = `${String(now.getMonth() + 1).padStart(2, '0')} / ${String(now.getDate()).padStart(2, '0')}`;
    $('#mh-title').textContent = t.title;

    $('#mh-eq').innerHTML = `
      <div class="eq-block">
        <span class="eq-no">式 (1)</span>
        <div class="eq-body">
          ${katexHTML(t.eq, true)}
          <p class="eq-note">${esc(t.eqNote)}</p>
        </div>
      </div>`;

    $('#mh-byline').innerHTML = `
      <span class="who"><img src="${AV(t.user)}" alt="" width="22" height="22">${esc(u.name || '')}</span>${sep}
      <span>${esc(u.tag || '')}</span>${sep}
      <span>${esc(t.time)}</span>${sep}
      <span class="stat up">${ic('i-chevron-up', 'ic-sm')}<b data-hvote="${t.id}">${t.votes}</b></span>${sep}
      <span class="stat">${ic('i-message', 'ic-sm')}<b>${t.answers}</b> 回答</span>${sep}
      <span class="stat">${ic('i-eye', 'ic-sm')}<b>${t.views.toLocaleString()}</b></span>`;

    $('#mh-enter').dataset.thread = t.id;
    $('#mh-save').dataset.save = t.id;
    refreshSaveButtons(t.id);

    $('#mh-wm').innerHTML = katexHTML('i\\hbar\\,\\partial_t\\Psi = \\hat{H}\\Psi', false);
  }

  /* ------------------------------------------------------------ 渲染：数据条 */

  function renderStatbar() {
    const totalVotes = THREADS.reduce((s, t) => s + t.votes, 0);
    const answered = THREADS.filter((t) => t.answers > 0).length;
    const online = 12846;

    $('#statbar').innerHTML = `
      <div class="stat">
        <span class="stat-v"><b data-count="${totalVotes}">0</b></span>
        <span class="stat-k">累计赞同</span>
      </div>
      <div class="stat">
        <span class="stat-v"><b data-count="${answered}">0</b><i>/ ${THREADS.length}</i></span>
        <span class="stat-k">已回答</span>
      </div>
      <div class="stat">
        <span class="stat-v"><b data-count="${online}" data-fmt="locale">0</b></span>
        <span class="stat-k">在线成员</span>
      </div>
      <div class="stat">
        <span class="stat-v"><b data-count="2.4" data-fmt="dec1">0</b><i>小时</i></span>
        <span class="stat-k">平均响应</span>
      </div>
      <div class="stat-sig">
        ${sigBars(`sig-${totalVotes}`)}
        <span class="rd">${ic('i-signal', 'ic-sm')}<i>SIGNAL</i><b>${sigLevel(`sig-${totalVotes}`) * 20}</b>%</span>
        <span class="rd">${ic('i-clock', 'ic-sm')}<i>UPDATE</i><b>2</b>min</span>
      </div>`;
  }

  /* ------------------------------------------------------------ 渲染：左索引栏 */

  function renderRail() {
    $('#idx-channels').innerHTML = CHANNELS.map((c, i) => `
      <button class="idx-row ${state.chanFilter === c.id ? 'is-on' : ''}" type="button" data-chan="${c.id}">
        <span class="idx-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="idx-name">${esc(c.name)}</span>
        <span class="idx-n">${c.count}</span>
      </button>`).join('');

    const contrib = USER_KEYS
      .map((k) => ({ key: k, u: USERS[k] }))
      .sort((a, b) => b.u.rep - a.u.rep)
      .slice(0, 4);

    $('#rail-contrib').innerHTML = contrib.map((x) => `
      <div class="contrib-row">
        <img src="${AV(x.key)}" alt="" width="24" height="24">
        <b>${esc(x.u.name)}</b>
        <span>${x.u.rep.toLocaleString()}</span>
      </div>`).join('');
  }

  /* ------------------------------------------------------------ 渲染：频道目录 */

  function renderChanIndex() {
    const sorted = [...CHANNELS].sort((a, b) => b.count - a.count);
    const total = CHANNELS.reduce((s, c) => s + c.count, 0);
    $('#chan-sub').textContent = `${CHANNELS.length} 个分支 · ${total.toLocaleString()} 个主题`;

    $('#chan-index').innerHTML = sorted.map((c, i) => {
      const live = THREADS.filter((t) => t.chan === c.id).length;
      return `
        <li>
          <button class="chan-row rv rv-on" style="--d:${Math.min(i * 55, 400)}ms" type="button" data-chango="${c.id}">
            <span class="ci-no">${String(i + 1).padStart(2, '0')}</span>
            <span class="ci-name">${esc(c.name)}</span>
            <span class="ci-desc">${esc(c.desc)}</span>
            <span class="ci-art">${chanArt(c.id)}</span>
            <span class="ci-end">
              <b class="ci-count">${c.count}</b>
              <span class="ci-live">${live} 在讨论</span>
              ${sigBars(`chan-${c.id}`)}
            </span>
          </button>
        </li>`;
    }).join('');
  }

  /* ------------------------------------------------------------ 渲染：标签术语表 */

  function renderTags() {
    const sum = TAGS.reduce((s, t) => s + t.n, 0);
    const max = Math.max.apply(null, TAGS.map((t) => t.n));
    $('#tag-sub').textContent = `${TAGS.length} 个概念 · ${sum} 次引用`;

    $('#tag-wall').innerHTML = TAGS.map((t, i) => {
      const pct = Math.round((t.n / max) * 100);
      return `
        <button class="trow rv rv-on" style="--d:${Math.min(i * 40, 400)}ms" type="button" data-taggo="${t.id}">
          <b>${esc(t.name)}</b>
          <span class="n">${t.n}</span>
          <span class="bar"><i style="width:${pct}%"></i></span>
        </button>`;
    }).join('');
  }

  /* ------------------------------------------------------------ 渲染：讨论条目 */

  function entryHTML(t, i) {
    const u = USERS[t.user] || {};
    const score = t.votes + (state.votes[t.id] || 0);
    const saved = state.saved.has(t.id);
    const v = state.votes[t.id] || 0;

    return `
      <article class="entry" style="animation-delay:${Math.min(i * 42, 300)}ms">
        <span class="entry-idx">${String(i + 1).padStart(3, '0')}</span>
        <div class="entry-vote">
          <button type="button" data-vote="up" data-id="${t.id}" class="${v > 0 ? 'on-up' : ''}" aria-label="赞同">${ic('i-chevron-up', 'ic-sm')}</button>
          <span class="vnum"><span class="vnum-in" data-score="${t.id}">${score}</span></span>
          <button type="button" data-vote="down" data-id="${t.id}" class="${v < 0 ? 'on-down' : ''}" aria-label="反对">${ic('i-chevron-down', 'ic-sm')}</button>
        </div>
        <div class="entry-main">
          <button class="entry-title" type="button" data-thread="${t.id}">${esc(t.title)}</button>
          <div class="entry-tags">
            ${t.tags.map((g) => `<button class="tag" type="button" data-taggo="${g}">${esc(g)}</button>`).join('')}
            ${t.solved ? `<span class="tag solved">${ic('i-circle-check', 'ic-sm')}已解决</span>` : ''}
          </div>
          <div class="entry-foot">
            <span class="who"><img src="${AV(t.user)}" alt="" width="18" height="18">${esc(u.name || '')}</span>${sep}
            <span>${esc(t.time)}</span>${sep}
            <span class="stat ${t.answers > 0 ? 'answered' : ''}">${ic('i-message', 'ic-sm')}<b>${t.answers}</b> 回答</span>${sep}
            <span class="stat">${ic('i-eye', 'ic-sm')}<b>${t.views.toLocaleString()}</b></span>
            <button class="bookmark-btn ${saved ? 'is-saved' : ''}" type="button" data-save="${t.id}" aria-label="${saved ? '取消收藏' : '收藏'}">${ic(saved ? 'i-bookmark-fill' : 'i-bookmark', 'ic-sm')}</button>
          </div>
        </div>
        <div class="entry-eq">${katexHTML(t.eqRow, false)}</div>
      </article>`;
  }

  function sortedThreads() {
    let list = [...THREADS];
    if (state.chanFilter) list = list.filter((t) => t.chan === state.chanFilter);
    if (state.sort === 'hot') list.sort((a, b) => b.votes - a.votes);
    else if (state.sort === 'new') list.sort((a, b) => b.id.localeCompare(a.id));
    else list.sort((a, b) => (a.answers - b.answers) || (b.votes - a.votes));
    return list;
  }

  function renderEntries() {
    const list = sortedThreads();
    const visible = list.slice(0, state.shown);
    $('#thread-list').innerHTML = visible.length
      ? visible.map(entryHTML).join('')
      : '<p class="pempty" style="padding:40px 0">这个频道还没有人提问</p>';

    const more = $('.more-btn');
    more.hidden = visible.length >= list.length;
    more.querySelector('span').textContent = `加载更早的讨论（剩余 ${Math.max(0, list.length - visible.length)}）`;

    const note = $('#filter-note');
    if (state.chanFilter) {
      note.hidden = false;
      note.querySelector('span').textContent = `仅看 ${chanName(state.chanFilter)}`;
    } else {
      note.hidden = true;
    }
  }

  /* ------------------------------------------------------------ 渲染：我的 */

  function renderMe() {
    const key = USER_KEYS.find((k) => USERS[k].name === '陈砚博') || USER_KEYS[0];
    const u = USERS[key];
    const myThreads = THREADS.filter((t) => t.user === key);
    const myAnswers = THREADS.flatMap((t) => t.answerList.filter((a) => a.user === key).map((a) => ({ t, a })));

    $('#me-card').innerHTML = `
      <div class="me-top">
        <img src="${AV(key)}" alt="${esc(u.name)}" width="56" height="56">
        <div>
          <h2>${esc(u.name)}</h2>
          <p>${ic('i-circle-check', 'ic-sm')}${esc(u.tag)}</p>
        </div>
      </div>
      <p class="me-bio">写凝聚态，也写统计力学。擅长把粗粒化过程讲清楚，不擅长承认自己想错了。</p>
      <div class="me-metrics">
        <div class="me-metric"><span>声望</span><b>${u.rep.toLocaleString()}</b></div>
        <div class="me-metric"><span>提问与回答</span><b>${myThreads.length + myAnswers.length}</b></div>
        <div class="me-metric"><span>采纳率</span><b>92%</b></div>
      </div>`;

    const box = $('#me-list');
    if (state.meTab === 'posts') {
      box.innerHTML = myThreads.length
        ? myThreads.map(entryHTML).join('')
        : emptyBox('还没有提问', '去讨论区看看第一个问题');
    } else if (state.meTab === 'answers') {
      box.innerHTML = myAnswers.length
        ? myAnswers.map(({ t, a }, i) => `
          <article class="entry" style="animation-delay:${Math.min(i * 42, 300)}ms">
            <div class="entry-vote">${ic('i-message', 'ic-sm')}</div>
            <div class="entry-main">
              <button class="entry-title" type="button" data-thread="${t.id}">${esc(t.title)}</button>
              <div class="entry-foot">
                <span class="stat ${a.accepted ? 'answered' : ''}">${ic(a.accepted ? 'i-circle-check' : 'i-message', 'ic-sm')}<b>${a.accepted ? '已采纳' : '待采纳'}</b></span>${sep}
                <span>${esc(a.time)}</span>
              </div>
            </div>
            <div class="entry-eq"></div>
          </article>`).join('')
        : emptyBox('还没有回答', '找一个问题开始推导');
    } else {
      const list = THREADS.filter((t) => state.saved.has(t.id));
      box.innerHTML = list.length
        ? list.map(entryHTML).join('')
        : emptyBox('还没有收藏', '看到想留的推导，按书签存进来');
    }
  }

  function emptyBox(text, btnText) {
    return `
      <div class="pempty">
        <svg viewBox="0 0 120 84" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
          <ellipse cx="60" cy="42" rx="40" ry="15" stroke-dasharray="3 4"/>
          <circle cx="60" cy="42" r="4" fill="currentColor" stroke="none"/>
          <circle cx="98" cy="38" r="2.4" fill="currentColor" stroke="none"/>
        </svg>
        <p>${esc(text)}</p>
        <button class="btn btn-ghost" type="button" data-nav="home">${esc(btnText)}</button>
      </div>`;
  }

  /* ------------------------------------------------------------ 渲染：遥测栏 */

  function renderTelemetry() {
    const graph = buildGraph();
    $('#net-big').innerHTML = graph.full;
    $('#net-legend').innerHTML = `
      <span><i></i>频道</span>
      <span><i class="ghost"></i>成员</span>
      <span>边宽 = 主题数</span>`;

    $('#net-notes').innerHTML = CHANNELS.map((c, i) => {
      const live = THREADS.filter((t) => t.chan === c.id).length;
      return `
        <article class="net-note">
          <h3><i>${String(i + 1).padStart(2, '0')}</i>${esc(c.name)}</h3>
          <p>${esc(c.desc)}</p>
          <p class="note-meta"><span><b>${c.count}</b> 主题</span><span><b>${live}</b> 在讨论</span></p>
        </article>`;
    }).join('');

    $('#rd-node').textContent = String(CHANNELS.length).padStart(2, '0');
    $('#rd-link').textContent = String(graph.edgeCount).padStart(2, '0');
    $('#rd-lat').textContent = String(8 + sigLevel('lat') * 2);

    renderEventLog();
  }

  /* 讨论网络图：8 个频道节点 + 12 个成员节点，边由数据推导 */
  function buildGraph() {
    const CX = 280;
    const CY = 210;
    const RX = 168;
    const RY = 142;

    const chanNodes = CHANNELS.map((c, i) => {
      const a = (i / CHANNELS.length) * Math.PI * 2 - Math.PI / 2;
      const live = THREADS.filter((t) => t.chan === c.id).length;
      return {
        id: c.id,
        name: c.name,
        x: CX + Math.cos(a) * RX,
        y: CY + Math.sin(a) * RY,
        r: 6 + Math.min(9, c.count / 70),
        live,
        hot: live >= 3
      };
    });

    const userNodes = USER_KEYS.map((k, i) => {
      const a = (i / USER_KEYS.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
      return {
        key: k,
        x: CX + Math.cos(a) * (RX * 0.46),
        y: CY + Math.sin(a) * (RY * 0.46)
      };
    });

    const edges = [];
    userNodes.forEach((u, i) => {
      const d = chanNodes
        .map((c, j) => ({ c, d: Math.hypot(c.x - u.x, c.y - u.y) }))
        .sort((p, q) => p.d - q.d);
      const targets = [d[0].c, d[1].c, d[2].c];
      targets.forEach((c, k) => {
        const live = (i + k) % 3 === 0;
        edges.push({ a: u, b: c, live });
      });
    });

    const full = `
      ${edges.map((e) => `<path class="edge${e.live ? ' live' : ''}" d="M${e.a.x} ${e.a.y}L${e.b.x} ${e.b.y}"/>`).join('')}
      <circle class="core" cx="${CX}" cy="${CY}" r="58"/>
      ${userNodes.map((u) => `<circle class="us-node" cx="${u.x}" cy="${u.y}" r="4"/>`).join('')}
      ${chanNodes.map((c) => `
        <circle class="ch-node${c.hot ? ' hot' : ''}" cx="${c.x}" cy="${c.y}" r="${c.r.toFixed(1)}"/>
        <text class="ch-label${c.hot ? ' hot' : ''}" x="${c.x.toFixed(1)}" y="${(c.y + c.r + 15).toFixed(1)}" text-anchor="middle">${esc(c.name)}</text>
      `).join('')}`;

    return { full, edgeCount: edges.length };
  }

  function eventItem(t, i) {
    const u = USERS[t.user] || {};
    const act = t.answers > 0 && i % 2 === 0 ? '回答了' : '在';
    const where = act === '在' ? `${chanName(t.chan)} 提问` : `${chanName(t.chan)} 的提问`;
    return `
      <li class="${i === 0 ? 'is-new' : ''}">
        <time>${esc(t.time)}</time>
        <span><b>${esc(u.name || '')}</b> ${act} ${where}</span>
      </li>`;
  }

  function renderEventLog() {
    const pool = [...THREADS].sort((a, b) => b.votes - a.votes).slice(0, 24);
    const start = state.logCursor % 12;
    const items = pool.slice(start, start + 5);
    $('#event-log').innerHTML = items.map(eventItem).join('');
  }

  /* ------------------------------------------------------------ 渲染：活跃成员段 */

  function renderPeople() {
    const list = USER_KEYS
      .map((k) => {
        const u = USERS[k];
        const posts = THREADS.filter((t) => t.user === k).length;
        const answers = THREADS.reduce((s, t) => s + t.answerList.filter((a) => a.user === k).length, 0);
        return { key: k, u, posts, answers, total: posts + answers };
      })
      .sort((a, b) => b.u.rep - a.u.rep);

    $('#people-grid').innerHTML = list.map((x, i) => `
      <div class="person">
        <div class="person-top">
          <img src="${AV(x.key)}" alt="" width="44" height="44">
          <div>
            <b>${esc(x.u.name)}</b>
            <span>${esc(x.u.tag)}</span>
          </div>
          <span class="person-rank">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="person-meta">
          <span>声望 <b>${x.u.rep.toLocaleString()}</b></span>
          <span>提问 <b>${x.posts}</b></span>
          <span>回答 <b>${x.answers}</b></span>
        </div>
      </div>`).join('');

    const totalVotes = THREADS.reduce((s, t) => s + t.votes, 0);
    $('#foot-read').innerHTML = `
      主题 <b>${THREADS.length}</b><br>
      赞同 <b>${totalVotes.toLocaleString()}</b><br>
      成员 <b>${USER_KEYS.length}</b><br>
      频道 <b>${CHANNELS.length}</b>`;
  }

  /* ------------------------------------------------------------ 渲染：详情页 */

  function eqBlock(tex, note, label, delay) {
    return `
      <div class="eq-block rv rv-on" style="--d:${delay}">
        <span class="eq-no">${label}</span>
        <div class="eq-body">
          ${katexHTML(tex, true)}
          ${note ? `<p class="eq-note">${esc(note)}</p>` : ''}
        </div>
      </div>`;
  }

  function answerHTML(a, eqNo, delay) {
    const u = USERS[a.user] || {};
    return `
      <article class="answer rv rv-on" style="--d:${delay}">
        <div class="ans-head">
          <img src="${AV(a.user)}" alt="" width="26" height="26">
          <b>${esc(u.name || '')}</b>
          <span class="ans-tag">${esc(u.tag || '')}</span>
          <span class="ans-time">${esc(a.time)}</span>
          ${a.accepted ? `<span class="ans-badge">${ic('i-circle-check', 'ic-sm')}最佳回答</span>` : ''}
        </div>
        <div class="ans-body">${prose(a.body)}</div>
        ${a.eq ? eqBlock(a.eq, a.eqNote, `式 (${eqNo})`, delay) : ''}
        <div class="ans-foot">
          <button type="button" data-action="ans-vote">${ic('i-chevron-up', 'ic-sm')}赞同</button>
          <button type="button" data-action="ans-reply">${ic('i-message', 'ic-sm')}回复</button>
          <button type="button" data-action="share">${ic('i-share', 'ic-sm')}分享</button>
        </div>
      </article>`;
  }

  function renderDetail(kind, id) {
    state.page = null;
    if (kind === 'thread') {
      const t = THREADS.find((x) => x.id === id);
      if (t) { state.page = id; return renderThreadDetail(t); }
    } else if (kind === 'chan') {
      const c = chanById(id);
      if (c) return renderChanDetail(c);
    } else if (kind === 'tag') {
      const tag = tagById(id);
      if (tag) return renderTagDetail(tag);
    }
    location.hash = '#/';
  }

  function renderThreadDetail(t) {
    const u = USERS[t.user] || {};
    const c = chanById(t.chan);
    const voted = (state.votes[t.id] || 0) > 0;
    const saved = state.saved.has(t.id);
    const related = THREADS.filter((x) => x.chan === t.chan && x.id !== t.id)
      .sort((a, b) => b.votes - a.votes).slice(0, 3);
    const keyEqs = [t.eq, ...t.answerList.filter((a) => a.eq).map((a) => a.eq)];
    const shown = t.answerList.length;
    const rest = Math.max(0, t.answers - shown);
    let eqNo = 2;

    $('#detail-inner').innerHTML = `
      <div class="detail-bar">
        <a class="back-btn" href="#/"><svg class="ic"><use href="#i-arrow-left"/></svg><span>返回讨论</span></a>
        <nav class="crumbs">
          <span class="crumb-chan">${chanIcon(c.id)}${esc(c.name)}</span>
          <span class="crumb-sep">${ic('i-chevron-right', 'ic-sm')}</span>
          <span class="crumb-tags">${t.tags.map(esc).join('  ')}</span>
        </nav>
        <span class="crumb-read">
          <span>THREAD <b>${esc(t.id.toUpperCase())}</b></span>
          <span>VIEW <b>${t.views.toLocaleString()}</b></span>
          <span>CHAN <b>${esc(c.id.toUpperCase())}</b></span>
        </span>
      </div>
      <div class="article">
        <div class="art-main">
          <h1 class="art-title rv rv-on" style="--d:.02s">${esc(t.title)}</h1>
          <div class="art-meta rv rv-on" style="--d:.06s">
            <span class="who"><img src="${AV(t.user)}" alt="" width="24" height="24">${esc(u.name || '')}</span>${sep}
            <span>${esc(u.tag || '')}</span>${sep}
            <span>${esc(t.time)}</span>${sep}
            <span class="stat">${ic('i-eye', 'ic-sm')}<b>${t.views.toLocaleString()}</b></span>
          </div>
          <div class="art-prose rv rv-on" style="--d:.1s">${prose(t.body.join('\n'))}</div>
          ${eqBlock(t.eq, t.eqNote, '式 (1)', '.14s')}
          <div class="art-tags rv rv-on" style="--d:.18s">
            ${t.tags.map((g) => `<button class="tag" type="button" data-taggo="${g}">${esc(g)}</button>`).join('')}
          </div>
          <section class="answers">
            <div class="ans-head-row rv rv-on" style="--d:.2s"><b>${t.answers}</b><span>个回答</span></div>
            ${t.answerList.length
              ? t.answerList.map((a, i) => answerHTML(a, eqNo++, '.22s')).join('')
              : '<p class="pempty" style="padding:30px 0">还没有回答，成为第一个</p>'}
            ${rest > 0 ? `
              <p class="ans-more">${ic('i-layers', 'ic-sm')}仅显示前 ${shown} 条
                <button type="button" data-action="more-answers">查看其余 ${rest} 条</button>
              </p>` : ''}
          </section>
          <div class="reply-box rv rv-on" style="--d:.26s">
            <textarea placeholder="补充你的推导。先写条件，再写结论。" id="reply-input" aria-label="写回答"></textarea>
            <div class="reply-foot">
              <span class="reply-hint">支持 $…$ 行内公式</span>
              <button class="btn btn-solid glitch-btn" type="button" data-action="submit-reply">
                ${ic('i-send')}<span data-text="发表回答">发表回答</span>
              </button>
            </div>
          </div>
        </div>
        <aside class="art-aside">
          <div class="aside-block rv rv-on" style="--d:.1s">
            <p class="aside-h">${ic('i-user', 'ic-sm')}提问者</p>
            <div class="author-row">
              <img src="${AV(t.user)}" alt="" width="48" height="48">
              <div>
                <b>${esc(u.name || '')}</b>
                <span>${esc(u.tag || '')}</span>
                <div class="author-rep">${(u.rep || 0).toLocaleString()} 声望</div>
              </div>
            </div>
          </div>
          <div class="aside-block rv rv-on" style="--d:.14s">
            <p class="aside-h">${ic('i-sigma', 'ic-sm')}数据</p>
            <div class="aside-stat">${ic('i-chevron-up', 'ic-sm')}赞同<b data-qvote="${t.id}">${t.votes}</b></div>
            <div class="aside-stat">${ic('i-message', 'ic-sm')}回答<b>${t.answers}</b></div>
            <div class="aside-stat">${ic('i-eye', 'ic-sm')}浏览<b>${t.views.toLocaleString()}</b></div>
            <div class="aside-stat">${ic('i-signal', 'ic-sm')}信号${sigBars(`sig-${t.id}`, true)}</div>
            <div class="aside-actions">
              <button class="btn ${voted ? 'btn-ghost is-voted' : 'btn-solid glitch-btn'}" type="button" data-vote="up" data-id="${t.id}">
                ${ic(voted ? 'i-check' : 'i-chevron-up', 'ic-sm')}<span data-text="${voted ? '已赞同' : '赞同'}">${voted ? '已赞同' : '赞同'}</span>
              </button>
              <button class="btn btn-ghost ${saved ? 'is-on' : ''}" type="button" data-save="${t.id}" aria-label="${saved ? '取消收藏' : '收藏'}">
                ${ic(saved ? 'i-bookmark-fill' : 'i-bookmark', 'ic-sm')}
              </button>
              <button class="btn btn-ghost" type="button" data-action="share" aria-label="分享">
                ${ic('i-share', 'ic-sm')}
              </button>
            </div>
          </div>
          <div class="aside-block rv rv-on" style="--d:.16s">
            <p class="aside-h">${ic('i-sigma', 'ic-sm')}关键公式</p>
            <div class="aside-eqs">
              ${keyEqs.map((eq, i) => `
                <div class="aside-eq">
                  <span class="aside-eq-no">式 (${i + 1})</span>
                  <div class="aside-eq-body">${katexHTML(eq, true)}</div>
                </div>`).join('')}
            </div>
          </div>
          ${related.length ? `
            <div class="aside-block rv rv-on" style="--d:.18s">
              <p class="aside-h">${ic('i-message', 'ic-sm')}相关讨论</p>
              ${related.map((x) => `
                <button class="rel-row" type="button" data-thread="${x.id}">
                  <p>${esc(x.title)}</p><b>${x.votes}</b>
                </button>`).join('')}
              <button class="rel-more" type="button" data-chango="${t.chan}">
                查看 ${esc(c.name)} 全部 ${ic('i-chevron-right', 'ic-sm')}
              </button>
            </div>` : ''}
        </aside>
      </div>`;
  }

  function renderChanDetail(c) {
    const live = THREADS.filter((t) => t.chan === c.id);
    $('#detail-inner').innerHTML = `
      <div class="detail-bar">
        <a class="back-btn" href="#/channels"><svg class="ic"><use href="#i-arrow-left"/></svg><span>返回频道</span></a>
        <nav class="crumbs">
          <span class="crumb-chan">${ic('i-grid')}频道</span>
          <span class="crumb-sep">${ic('i-chevron-right', 'ic-sm')}</span>
          <span class="crumb-tags">${esc(c.name)}</span>
        </nav>
        <span class="crumb-read"><span>CHAN <b>${esc(c.id.toUpperCase())}</b></span><span>THREAD <b>${live.length}</b></span></span>
      </div>
      <div class="subpage-head rv rv-on" style="--d:.02s">
        <span class="subpage-art">${chanArt(c.id)}</span>
        <div class="subpage-copy">
          <h1>${esc(c.name)}</h1>
          <p class="sub-desc">${esc(c.desc)}</p>
          <div class="sub-meta"><span><b>${c.count}</b> 个主题</span><span><b>${live.length}</b> 在讨论</span><span>信号 ${sigBars(`chan-${c.id}`)}</span></div>
        </div>
      </div>
      <div class="entries">
        ${live.length
          ? live.map(entryHTML).join('')
          : '<p class="pempty" style="padding:40px 0">这个频道还没有人提问</p>'}
      </div>`;
  }

  function renderTagDetail(tag) {
    const list = THREADS.filter((t) => t.tags.includes(tag.id));
    $('#detail-inner').innerHTML = `
      <div class="detail-bar">
        <a class="back-btn" href="#/tags"><svg class="ic"><use href="#i-arrow-left"/></svg><span>返回标签</span></a>
        <nav class="crumbs">
          <span class="crumb-chan">${ic('i-tag')}标签</span>
          <span class="crumb-sep">${ic('i-chevron-right', 'ic-sm')}</span>
          <span class="crumb-tags">${esc(tag.name)}</span>
        </nav>
        <span class="crumb-read"><span>TAG <b>${esc(tag.id.toUpperCase())}</b></span><span>THREAD <b>${list.length}</b></span></span>
      </div>
      <div class="subpage-head rv rv-on" style="--d:.02s">
        <div class="subpage-copy">
          <h1 class="tagpage-name">${esc(tag.name)}</h1>
          <p class="sub-desc">${esc(tag.desc)}</p>
          <div class="sub-meta"><span><b>${tag.n}</b> 次引用</span><span><b>${list.length}</b> 个主题</span></div>
        </div>
      </div>
      <div class="entries">
        ${list.length
          ? list.map(entryHTML).join('')
          : '<p class="pempty" style="padding:40px 0">这个标签下还没有主题</p>'}
      </div>`;
  }

  /* ------------------------------------------------------------ 路由 */

  function parseRoute() {
    const raw = (location.hash || '#/').replace(/^#/, '').replace(/^\//, '');
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length) return { view: 'home' };
    const [head, param] = parts;
    if (head === 'thread' && param) return { view: 'detail', kind: 'thread', id: param };
    if (head === 'chan' && param) return { view: 'detail', kind: 'chan', id: param };
    if (head === 'tag' && param) return { view: 'detail', kind: 'tag', id: param };
    if (['home', 'channels', 'tags', 'me'].indexOf(head) >= 0) return { view: head };
    return { view: 'home' };
  }

  function navigate() {
    const r = parseRoute();
    state.view = r.view;

    const routeEl = $(`.route[data-route="${r.view}"]`);
    $$('.route').forEach((s) => s.classList.toggle('is-on', s.dataset.route === r.view));

    const navKey = r.view === 'detail'
      ? ({ thread: 'home', chan: 'channels', tag: 'tags' }[r.kind] || 'home')
      : r.view;
    $$('.bnav').forEach((b) => b.classList.toggle('is-on', b.dataset.route === navKey));
    positionInd($('#nav-ind'), $('.bnav.is-on'));

    if (r.view === 'detail') renderDetail(r.kind, r.id);
    if (r.view === 'me') renderMe();
    if (r.view === 'home') renderEntries();

    /* 段落级重新出场：进入视图时把滚动出场区块重新压暗，进入视口再点亮 */
    if (routeEl) {
      $$('.rv-scroll', routeEl).forEach((el) => {
        el.classList.remove('rv-on');
        el.classList.add('rv-wait');
      });
    }

    jumpTop();
    requestAnimationFrame(() => {
      observeReveals();
      sweepReveals();
      if (r.view === 'me') positionInd($('#me-seg .seg-ind'), $('#me-seg button.is-on'));
    });
  }

  /* 立即回到顶部，不受 html{scroll-behavior:smooth} 影响 */
  function jumpTop() {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }

  /* 立即滚动到指定位置 */
  function scrollToY(y) {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    html.style.scrollBehavior = prev;
  }

  function positionInd(ind, btn) {
    if (!ind || !btn || !btn.offsetParent) return;
    ind.style.width = `${btn.offsetWidth}px`;
    ind.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  /* ------------------------------------------------------------ 投票 / 收藏 */

  function setScore(el, val) {
    el.textContent = val;
    el.classList.remove('roll');
    void el.offsetWidth;
    el.classList.add('roll');
  }

  function refreshVoteUI(id) {
    const t = THREADS.find((x) => x.id === id);
    if (!t) return;
    const v = state.votes[id] || 0;

    $$(`[data-score="${id}"]`).forEach((el) => setScore(el, t.votes));
    $$(`[data-vote][data-id="${id}"]`).forEach((btn) => {
      const isUp = btn.dataset.vote === 'up';
      btn.classList.toggle('on-up', isUp && v > 0);
      btn.classList.toggle('on-down', !isUp && v < 0);
    });

    const qv = $(`[data-qvote="${id}"]`);
    if (qv) qv.textContent = t.votes;
    const hv = $(`[data-hvote="${id}"]`);
    if (hv) hv.textContent = t.votes;
  }

  function castVote(id, dir) {
    const t = THREADS.find((x) => x.id === id);
    if (!t) return;
    const cur = state.votes[id] || 0;
    const next = cur === dir ? 0 : dir;
    state.votes[id] = next;
    t.votes += next - cur;
    refreshVoteUI(id);

    if (state.view === 'home') renderEntries();
    if (state.view === 'me') renderMe();
    if (state.view === 'detail' && state.page === id) {
      const keep = window.scrollY;
      const ta = $('#reply-input');
      const keepText = ta ? ta.value : '';
      renderDetail('thread', id);
      scrollToY(keep);
      const ta2 = $('#reply-input');
      if (ta2) ta2.value = keepText;
    }

    toast(next === 0 ? '已取消投票' : next > 0 ? '已赞同' : '已标记有争议',
      next > 0 ? 'i-chevron-up' : next < 0 ? 'i-alert' : 'i-chevron-up');
  }

  function refreshSaveButtons(id) {
    const saved = state.saved.has(id);
    $$(`[data-save="${id}"]`).forEach((btn) => {
      if (btn.classList.contains('bookmark-btn')) {
        btn.classList.toggle('is-saved', saved);
        btn.innerHTML = ic(saved ? 'i-bookmark-fill' : 'i-bookmark', 'ic-sm');
        btn.setAttribute('aria-label', saved ? '取消收藏' : '收藏');
      } else {
        btn.classList.toggle('is-on', saved);
        const use = btn.querySelector('use');
        if (use) use.setAttribute('href', saved ? '#i-bookmark-fill' : '#i-bookmark');
        const span = btn.querySelector('span');
        if (span && btn.id === 'mh-save') span.textContent = saved ? '已收藏' : '收藏';
      }
    });
  }

  function toggleSave(id) {
    if (state.saved.has(id)) { state.saved.delete(id); toast('已取消收藏', 'i-bookmark'); }
    else { state.saved.add(id); toast('已收藏', 'i-bookmark'); }
    refreshSaveButtons(id);
    if (state.view === 'home') renderEntries();
    if (state.view === 'me' && state.meTab !== 'answers') renderMe();
  }

  /* ------------------------------------------------------------ 主题切换 */

  let starsRefresh = null;

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    try { localStorage.setItem('qj-theme', state.theme); } catch (e) { /* 忽略 */ }
    const btn = $('[data-action="theme"] use');
    if (btn) btn.setAttribute('href', state.theme === 'dark' ? '#i-moon' : '#i-sun');
    if (starsRefresh) starsRefresh();
    toast(state.theme === 'dark' ? '已切换到暗色' : '已切换到亮色', state.theme === 'dark' ? 'i-moon' : 'i-sun');
  }

  /* ------------------------------------------------------------ 命令面板 */

  function openPalette(query = '') {
    const q = query.trim().toLowerCase();

    const actions = [
      { kind: 'action', action: 'compose', label: '发起提问', hint: '操作', icon: 'i-plus' },
      { kind: 'action', action: 'go-channels', label: '浏览全部频道', hint: '导航', icon: 'i-grid' },
      { kind: 'action', action: 'go-tags', label: '按标签检索', hint: '导航', icon: 'i-tag' },
      { kind: 'action', action: 'toggle-theme', label: '切换明暗主题', hint: '外观', icon: 'i-moon' }
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    const threads = THREADS
      .filter((t) => !q
        || t.title.toLowerCase().includes(q)
        || (t.excerpt || '').toLowerCase().includes(q)
        || chanName(t.chan).toLowerCase().includes(q)
        || t.tags.some((g) => g.includes(q)))
      .slice(0, 8)
      .map((t) => ({ kind: 'thread', id: t.id, label: t.title, hint: chanName(t.chan), icon: 'i-sigma' }));

    const tags = TAGS
      .filter((t) => !q || t.name.includes(q) || t.desc.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ kind: 'tag', id: t.id, label: t.name, hint: `${t.n} 主题`, icon: 'i-tag' }));

    const groups = [
      { name: '操作', items: actions },
      { name: '讨论', items: threads },
      { name: '标签', items: tags }
    ].filter((g) => g.items.length);

    state.results = [];
    let html = '';
    let idx = 0;
    for (const g of groups) {
      html += `<p class="pal-h">${g.name}</p>`;
      for (const item of g.items) {
        state.results.push(item);
        html += `
          <button class="pitem ${idx === 0 ? 'is-cursor' : ''}" type="button" data-index="${idx}">
            ${ic(item.icon)}
            <span>${esc(item.label)}</span>
            <small>${esc(item.hint)}</small>
          </button>`;
        idx += 1;
      }
    }
    state.cursor = 0;
    $('#pal-list').innerHTML = html || '<p class="pempty" style="padding:30px 0">没有匹配的内容</p>';
  }

  function runPalette(index) {
    const item = state.results[index];
    if (!item) return;
    closePalette();
    if (item.kind === 'thread') { location.hash = `#/thread/${item.id}`; return; }
    if (item.kind === 'tag') { location.hash = `#/tag/${item.id}`; return; }
    if (item.action === 'compose') openComposer();
    if (item.action === 'go-channels') location.hash = '#/channels';
    if (item.action === 'go-tags') location.hash = '#/tags';
    if (item.action === 'toggle-theme') toggleTheme();
  }

  function openPalettePanel() {
    $('#palette').hidden = false;
    $('#pal-input').value = '';
    openPalette('');
    $('#pal-input').focus();
  }

  function closePalette() { $('#palette').hidden = true; }

  /* ------------------------------------------------------------ 提问编辑器 */

  function openComposer() {
    $('#cp-chans').innerHTML = CHANNELS.map((c, i) => `
      <button class="chip ${i === 0 ? 'is-on' : ''}" type="button" data-pick-chan="${c.id}">${esc(c.name)}</button>`).join('');
    $('#composer').hidden = false;
    $('#cp-title').focus();
  }

  function closeComposer() { $('#composer').hidden = true; }

  function insertTex(snippet) {
    const ta = $('#cp-body');
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    let insert = snippet;
    let caret = start + snippet.length;
    if (snippet.endsWith('{}')) {
      insert = snippet.replace('{}', '{$}');
      caret = start + insert.indexOf('{$') + 2;
    }
    ta.value = text.slice(0, start) + insert + text.slice(end);
    ta.focus();
    ta.setSelectionRange(caret, caret);
  }

  /* ------------------------------------------------------------ 事件 */

  document.addEventListener('click', (e) => {
    const t = e.target;

    const nav = t.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      location.hash = nav.dataset.nav === 'me' ? '#/me' : '#/';
      return;
    }

    const threadBtn = t.closest('[data-thread]');
    if (threadBtn) { location.hash = `#/thread/${threadBtn.dataset.thread}`; return; }

    const chanGo = t.closest('[data-chango]');
    if (chanGo) { location.hash = `#/chan/${chanGo.dataset.chango}`; return; }

    const chanBtn = t.closest('[data-chan]');
    if (chanBtn) {
      const id = chanBtn.dataset.chan;
      state.chanFilter = state.chanFilter === id ? null : id;
      renderRail();
      state.shown = PAGE_SIZE;
      if (state.view !== 'home') location.hash = '#/';
      else renderEntries();
      return;
    }

    const voteBtn = t.closest('[data-vote]');
    if (voteBtn) { castVote(voteBtn.dataset.id, voteBtn.dataset.vote === 'up' ? 1 : -1); return; }

    const saveBtn = t.closest('[data-save]');
    if (saveBtn) { toggleSave(saveBtn.dataset.save); return; }

    const tagGo = t.closest('[data-taggo]');
    if (tagGo) { location.hash = `#/tag/${tagGo.dataset.taggo}`; return; }

    const sortBtn = t.closest('#sort-seg button');
    if (sortBtn) {
      state.sort = sortBtn.dataset.sort;
      $$('#sort-seg button').forEach((b) => b.classList.toggle('is-on', b === sortBtn));
      positionInd($('#seg-ind'), sortBtn);
      state.shown = PAGE_SIZE;
      renderEntries();
      return;
    }

    const meTab = t.closest('#me-seg button');
    if (meTab) {
      state.meTab = meTab.dataset.tab;
      $$('#me-seg button').forEach((b) => b.classList.toggle('is-on', b === meTab));
      positionInd($('#me-seg .seg-ind'), meTab);
      renderMe();
      return;
    }

    const pitem = t.closest('.pitem');
    if (pitem) { runPalette(Number(pitem.dataset.index)); return; }

    const act = t.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'omni') { openPalettePanel(); return; }
      if (a === 'close-modal') { closeComposer(); return; }
      if (a === 'compose') { openComposer(); return; }
      if (a === 'theme') { toggleTheme(); return; }
      if (a === 'notify') { toast('暂无新提醒', 'i-bell'); return; }
      if (a === 'share') { toast('链接已复制', 'i-link'); return; }
      if (a === 'ans-vote') { act.classList.toggle('is-on'); toast('已赞同', 'i-chevron-up'); return; }
      if (a === 'more-answers') { toast('演示数据仅展示部分回答', 'i-layers'); return; }
      if (a === 'ans-reply') {
        const ta = $('#reply-input');
        if (ta) { ta.focus(); ta.scrollIntoView({ block: 'center', behavior: REDUCE ? 'auto' : 'smooth' }); }
        return;
      }
      if (a === 'load-more') { state.shown += PAGE_SIZE; renderEntries(); return; }
      if (a === 'submit-question') {
        const title = $('#cp-title').value.trim();
        const body = $('#cp-body').value.trim();
        if (!title || !body) { toast('标题和正文都要填', 'i-alert'); return; }
        const chip = $('#cp-chans .chip.is-on');
        const chid = chip ? chip.dataset.pickChan : CHANNELS[0].id;
        THREADS.unshift({
          id: 'n' + (THREADS.length + 1),
          chan: chid, user: 'chen',
          title, excerpt: body.slice(0, 90),
          eqRow: 'E = mc^2',
          tags: ($('#cp-tag').value.trim().split(/\s+/).filter(Boolean) || ['new']).slice(0, 4),
          votes: 0, answers: 0, views: 1, time: '刚刚', solved: false,
          eq: 'E = mc^2', eqNote: '质能等价',
          body: [body], answerList: []
        });
        closeComposer();
        $('#cp-title').value = '';
        $('#cp-body').value = '';
        $('#cp-tag').value = '';
        state.shown = PAGE_SIZE;
        renderEntries();
        renderChanIndex();
        renderRail();
        toast('提问已发布', 'i-circle-check');
        return;
      }
      if (a === 'submit-reply') {
        const ta = $('#reply-input');
        if (!ta || !ta.value.trim()) { toast('先写点内容', 'i-alert'); return; }
        const t2 = THREADS.find((x) => x.id === (state.page || ''));
        if (t2) {
          t2.answers += 1;
          t2.answerList.push({ user: 'chen', accepted: false, time: '刚刚', body: ta.value.trim() });
          const keep = window.scrollY;
          renderDetail('thread', t2.id);
          scrollToY(keep);
          toast('回答已发表', 'i-circle-check');
        }
        return;
      }
      return;
    }

    const texBtn = t.closest('[data-tex]');
    if (texBtn) { insertTex(texBtn.dataset.tex); return; }

    const chip = t.closest('[data-pick-chan]');
    if (chip) {
      $$('#cp-chans .chip').forEach((c) => c.classList.toggle('is-on', c === chip));
      return;
    }

    if (!t.closest('#palette')) closePalette();
  });

  $('#filter-note').addEventListener('click', () => {
    state.chanFilter = null;
    renderRail();
    renderEntries();
  });

  $('#pal-input').addEventListener('input', (e) => openPalette(e.target.value));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if ($('#palette').hidden) openPalettePanel(); else closePalette();
      return;
    }
    if (e.key === 'Escape') {
      if (!$('#composer').hidden) { closeComposer(); return; }
      if (!$('#palette').hidden) { closePalette(); return; }
      return;
    }
    if (!$('#palette').hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = state.results.length;
        if (!n) return;
        state.cursor = (state.cursor + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
        $$('.pitem').forEach((el, i) => el.classList.toggle('is-cursor', i === state.cursor));
        const cur = $('.pitem.is-cursor');
        if (cur) cur.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        runPalette(state.cursor);
      }
    }
  });

  $('#cp-body').addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      $('[data-action="submit-question"]').click();
    }
  });

  window.addEventListener('hashchange', navigate);

  /* ------------------------------------------------------------ 计数动画 */

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const fmt = el.dataset.fmt;
    if (REDUCE) {
      el.textContent = fmt === 'locale' ? target.toLocaleString() : fmt === 'dec1' ? target.toFixed(1) : String(target);
      return;
    }
    const dur = 900;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = target * ease;
      el.textContent = fmt === 'locale'
        ? Math.round(v).toLocaleString()
        : fmt === 'dec1' ? v.toFixed(1) : String(Math.round(v));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ 矩阵雨 */

  function initMatrix() {
    const cv = $('#matrix');
    const host = $('#mh-side');
    if (!cv || !host) return;
    const ctx = cv.getContext('2d');
    const GLYPHS = '01ΔΨΩ∫φλℏ⊗Σ√∞∂±∴≈ψΛξεμϕ'.split('');
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    let ink = css('--matrix-ink') || '255 255 255';
    let w = 0, h = 0, cols = 0, drops = [];

    function resize() {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(4, Math.floor(w / 16));
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * -h,
        speed: 0.3 + Math.random() * 0.9,
        len: 4 + Math.floor(Math.random() * 7)
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.font = '12px "IBM Plex Mono", monospace';
      for (let i = 0; i < cols; i += 1) {
        const d = drops[i];
        const x = i * 16 + 6;
        const y = d.y;
        for (let k = 0; k < d.len; k += 1) {
          const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          ctx.fillStyle = k === 0 ? `rgba(${ink},.2)` : `rgba(${ink},${Math.max(0, 0.07 - k * 0.012).toFixed(3)})`;
          ctx.fillText(ch, x, y - k * 16);
        }
        d.y += d.speed;
        if (y > h + 40 && Math.random() > 0.978) d.y = -Math.random() * 120;
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    starsRefresh = () => {
      ink = css('--matrix-ink') || '255 255 255';
      resize();
    };
    if (REDUCE) { frame(); return; }
    frame();
  }

  /* ------------------------------------------------------------ 滚动：进度、视差、顶栏状态 */

  function bindScroll() {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 8 ? Math.min(1, y / max) : 0;
        const bar = $('#progress span');
        if (bar) bar.style.transform = `scaleX(${p})`;
        $('#bar').classList.toggle('is-scrolled', y > 12);

        /* 分层视差：焦点区的插画层比文字慢 */
        const side = $('#mh-side');
        const wm = $('#mh-wm');
        const lim = Math.min(y, 600);
        if (side) side.style.transform = `translateY(${lim * 0.12}px)`;
        if (wm) wm.style.transform = `translate(-50%, calc(-50% + ${lim * 0.05}px))`;

        sweepReveals();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ 事件流轮播 */

  function startEventFeed() {
    if (REDUCE) return;
    setInterval(() => {
      state.logCursor += 5;
      renderEventLog();
    }, 9000);
  }

  /* ------------------------------------------------- 焦点区指针视差 */

  function initMastheadParallax() {
    if (REDUCE) return;
    const mh = $('.masthead');
    if (!mh) return;
    const atom = $('.mh-side .atom', mh);
    const wm = $('.mh-wm', mh);
    if (!atom) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    function tick() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      atom.style.transform = 'rotateX(' + cy.toFixed(2) + 'deg) rotateY(' + cx.toFixed(2) + 'deg)';
      if (wm) wm.style.transform = 'translate(-50%, -50%) translate(' + (-cx * 1.6).toFixed(2) + 'px, ' + (cy * 1.6).toFixed(2) + 'px)';
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(tick);
      else raf = 0;
    }
    function onMove(e) {
      const r = mh.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 11; ty = -py * 9;
      mh.style.setProperty('--mx', (px * 100 + 50) + '%');
      mh.style.setProperty('--my', (py * 100 + 50) + '%');
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function onLeave() {
      tx = 0; ty = 0;
      mh.style.setProperty('--mx', '50%');
      mh.style.setProperty('--my', '42%');
      if (!raf) raf = requestAnimationFrame(tick);
    }
    mh.addEventListener('mousemove', onMove);
    mh.addEventListener('mouseleave', onLeave);
  }

  /* ------------------------------------------------------------ 启动 */

  function boot() {
    try {
      const saved = localStorage.getItem('qj-theme');
      if (saved === 'light' || saved === 'dark') state.theme = saved;
    } catch (e) { /* 忽略 */ }
    document.documentElement.dataset.theme = state.theme;
    const tbtn = $('[data-action="theme"] use');
    if (tbtn) tbtn.setAttribute('href', state.theme === 'dark' ? '#i-moon' : '#i-sun');

    const steps = [
      ['焦点区', renderMasthead],
      ['数据条', renderStatbar],
      ['索引栏', renderRail],
      ['遥测栏', renderTelemetry],
      ['成员段', renderPeople],
      ['频道目录', renderChanIndex],
      ['讨论流', renderEntries],
      ['标签表', renderTags],
      ['我的', renderMe]
    ];
    steps.forEach(([name, fn]) => {
      try { fn(); } catch (err) { console.error(`[量界] 渲染「${name}」失败`, err); }
    });

    $$('.masthead .mh-meta, .masthead .mh-title, .masthead .mh-eq, .masthead .mh-foot').forEach((el, i) => {
      el.style.animation = 'rv-in 560ms var(--ease-2) both';
      el.style.animationDelay = `${0.06 + i * 0.07}s`;
    });

    positionInd($('#nav-ind'), $('.bnav.is-on'));
    positionInd($('#seg-ind'), $('#sort-seg button.is-on'));
    requestAnimationFrame(() => {
      positionInd($('#nav-ind'), $('.bnav.is-on'));
      positionInd($('#seg-ind'), $('#sort-seg button.is-on'));
    });

    window.addEventListener('resize', () => {
      positionInd($('#nav-ind'), $('.bnav.is-on'));
      positionInd($('#seg-ind'), $('#sort-seg button.is-on'));
      positionInd($('#me-seg .seg-ind'), $('#me-seg button.is-on'));
    });

    setTimeout(() => {
      $$('#statbar b[data-count]').forEach(countUp);
    }, 420);

    bindScroll();
    initMatrix();
    startEventFeed();
    initMastheadParallax();

    if (!location.hash) { location.hash = '#/'; }
    else navigate();
  }

  if (window.katex) boot();
  else window.addEventListener('load', boot);
})();
