/* 虫况 · 缺陷生命周期控制台 — 原型交互
   纯原生 JS + 本地假数据，不接网络，不使用 localStorage。
   刷新即重置演示状态。 */
(() => {
  'use strict';

  const D = window.BUG_DATA;
  const ME = D.me;

  /* ---------- 状态 / 级别定义 ---------- */
  const STATUS = {
    new:       { label: '新建',   dot: '#129BF1', tint: 'rgba(18,155,241,.10)', deep: '#0B6DC0' },
    confirmed: { label: '已确认', dot: '#3D74EC', tint: 'rgba(61,116,236,.10)', deep: '#2A57B8' },
    fixing:    { label: '修复中', dot: '#10A57E', tint: 'rgba(16,165,126,.10)', deep: '#0B7D5F' },
    verifying: { label: '待验证', dot: '#E8A23C', tint: 'rgba(232,162,60,.12)', deep: '#A96F14' },
    closed:    { label: '已关闭', dot: '#94A8BE', tint: 'rgba(148,168,190,.12)', deep: '#5C7392' },
    rejected:  { label: '已拒绝', dot: '#EE6A57', tint: 'rgba(238,106,87,.10)', deep: '#BE4331' },
  };
  const STAGES = ['new', 'confirmed', 'fixing', 'verifying', 'closed'];

  const SEV = {
    P0: { label: '致命', color: '#E24C4C', deep: '#C03636' },
    P1: { label: '严重', color: '#E8930F', deep: '#B36E08' },
    P2: { label: '一般', color: '#0A72E0', deep: '#0A72E0' },
    P3: { label: '轻微', color: '#6E87AB', deep: '#55708F' },
  };

  const ACTIONS = {
    new:       [{ to: 'confirmed', label: '确认缺陷',       icon: 'ti-check',        tl: '确认缺陷，进入修复队列' },
                { to: 'rejected',  label: '标记拒绝',       icon: 'ti-circle-off',   tl: '标记为拒绝' }],
    confirmed: [{ to: 'fixing',    label: '开始修复',       icon: 'ti-code',         tl: '开始修复' },
                { to: 'rejected',  label: '标记拒绝',       icon: 'ti-circle-off',   tl: '标记为拒绝' }],
    fixing:    [{ to: 'verifying', label: '提交待验证',     icon: 'ti-eye-check',    tl: '提交待验证' }],
    verifying: [{ to: 'closed',    label: '验证通过，关闭', icon: 'ti-circle-check', tl: '验证通过并关闭' },
                { to: 'fixing',    label: '退回修复',       icon: 'ti-rotate',       tl: '验证未通过，退回修复' }],
    closed:    [{ to: 'fixing',    label: '重新打开',       icon: 'ti-rotate',       tl: '重新打开缺陷' }],
    rejected:  [{ to: 'confirmed', label: '恢复为已确认',   icon: 'ti-rotate',       tl: '恢复为已确认' }],
  };

  const VIEWS = [
    { id: 'all',       label: '全部缺陷', icon: 'ti-layout-list',  match: () => true },
    { id: 'triage',    label: '待分诊',   icon: 'ti-inbox',        match: (b) => b.status === 'new' || b.status === 'confirmed' },
    { id: 'fixing',    label: '修复中',   icon: 'ti-code',         match: (b) => b.status === 'fixing' },
    { id: 'verifying', label: '待验证',   icon: 'ti-eye-check',    match: (b) => b.status === 'verifying' },
    { id: 'closed',    label: '已关闭',   icon: 'ti-circle-check', match: (b) => b.status === 'closed' },
    { id: 'rejected',  label: '已拒绝',   icon: 'ti-circle-off',   match: (b) => b.status === 'rejected' },
  ];

  const bugs = D.bugs.map((b) => ({ ...b }));
  let nextId = bugs.reduce((m, b) => Math.max(m, b.id), 0) + 1;

  const state = { view: 'all', stage: null, sev: 'all', q: '' };
  let stateSel = bugs.length ? bugs[0].id : null;
  let pickedSev = 'P2';
  let toastTimer = 0;

  const $ = (id) => document.getElementById(id);
  const el = {
    views: $('views'), listBody: $('listBody'), detail: $('detail'),
    flowstrip: $('flowstrip'), sevSeg: $('sevSeg'), searchInput: $('searchInput'),
    viewTitle: $('viewTitle'), viewSub: $('viewSub'),
    pulseChart: $('pulseChart'), pulseIn: $('pulseIn'), pulseOut: $('pulseOut'),
    prefBtn: $('prefBtn'),
    newBugBtn: $('newBugBtn'), modalBackdrop: $('modalBackdrop'), modalClose: $('modalClose'),
    modalCancel: $('modalCancel'), bugForm: $('bugForm'),
    fTitle: $('fTitle'), fTitleErr: $('fTitleErr'), fModule: $('fModule'),
    fVer: $('fVer'), fDesc: $('fDesc'), sevPicker: $('sevPicker'), modalId: $('modalId'),
    toast: $('toast'),
  };

  /* ---------- 工具 ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtId = (b) => 'BUG-' + b.id;
  const nowstamp = () => {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const AVA_FB = ['#BFDFF6', '#C9E9E2', '#F6E4C8', '#F3D3CF', '#D8DDF6', '#C8DAEF'];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(node, to, ms = 480) {
    if (reduceMotion) { node.textContent = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      node.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const ava = (name, px = 24) => {
    const seed = D.people[name] || name;
    const fb = AVA_FB[[...String(name)].reduce((h, c) => h + c.charCodeAt(0), 0) % AVA_FB.length];
    return `<img class="ava" data-name="${esc(name)}" data-fb="${fb}" src="https://i.pravatar.cc/${px}?u=${encodeURIComponent(seed)}" alt="" aria-hidden="true">`;
  };

  /* ---------- 过滤 ---------- */
  const baseOK = (b) =>
    (state.sev === 'all' || b.sev === state.sev) &&
    (!state.q || `${fmtId(b)} ${b.title} ${b.module}`.toLowerCase().includes(state.q.toLowerCase()));
  const viewOf = (id) => VIEWS.find((v) => v.id === id) || VIEWS[0];
  const visible = () => bugs.filter((b) => baseOK(b) && viewOf(state.view).match(b) && (!state.stage || b.status === state.stage));
  const inStage = (st) => bugs.filter((b) => b.status === st && baseOK(b));

  /* ---------- 渲染：侧栏视图 ---------- */
  function renderViews() {
    const parts = VIEWS.map((v) => {
      const n = bugs.filter((b) => baseOK(b) && v.match(b)).length;
      return `<button class="view ${state.view === v.id ? 'active' : ''}" data-view="${v.id}"
        aria-current="${state.view === v.id}">
        <i class="ti ${v.icon}" aria-hidden="true"></i>
        <span class="vlabel">${v.label}</span><span class="vcount mono">${n}</span></button>`;
    });
    parts.splice(1, 0, '<div class="view-divider" aria-hidden="true"></div>');
    el.views.innerHTML = parts.join('');
  }

  /* ---------- 渲染：生命周期流带 ---------- */
  function renderStages() {
    const keys = [...STAGES, 'rejected'];
    const activeStage = state.stage || null;
    el.flowstrip.innerHTML = keys.map((k) => {
      const n = inStage(k).length;
      return `<button class="stage ${activeStage === k ? 'active' : ''}"
        data-stage="${k}" aria-pressed="${activeStage === k}">
        <span class="stage-label"><span class="dot" style="background:${STATUS[k].dot}"></span>${STATUS[k].label}</span>
        <span class="stage-count" style="color:${activeStage === k ? STATUS[k].deep : 'var(--ink)'}">${n}</span>
      </button>`;
    }).join('');
  }

  /* ---------- 渲染：级别筛选 ---------- */
  function renderSeg() {
    el.sevSeg.innerHTML = ['all', 'P0', 'P1', 'P2', 'P3'].map((s) => {
      const on = state.sev === s;
      const inner = s === 'all'
        ? '全部'
        : `<span class="sd" style="background:${SEV[s].color}"></span><span class="mono">${s}</span>`;
      return `<button class="seg-btn ${on ? 'active' : ''}" role="radio" aria-checked="${on}" data-sev="${s}">${inner}</button>`;
    }).join('');
    requestAnimationFrame(positionSeg);
  }
  function positionSeg() {
    const active = el.sevSeg.querySelector('.seg-btn.active');
    if (!active) return;
    el.sevSeg.style.setProperty('--seg-x', active.offsetLeft + 'px');
    el.sevSeg.style.setProperty('--seg-w', active.offsetWidth + 'px');
  }
  window.addEventListener('resize', positionSeg);

  function renderHeader() {
    const label = state.stage ? STATUS[state.stage].label : viewOf(state.view).label;
    el.viewTitle.textContent = label;
    el.viewSub.textContent = `迭代 2026.10 第 3 周，共 ${visible().length} 条`;
  }

  /* ---------- 渲染：脉冲趋势 ---------- */
  function renderPulse() {
    const { days, in: din, out } = D.pulse;
    const W = 196, H = 56, pad = 8;
    const max = Math.max(...din, ...out);
    const px = (i) => 2 + (i / (days.length - 1)) * (W - 4);
    const py = (v) => H - pad - (v / max) * (H - 2 * pad);
    const line = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    const area = `${line(din)} L${px(days.length - 1).toFixed(1)},${H - 2} L${px(0).toFixed(1)},${H - 2} Z`;
    el.pulseChart.innerHTML =
      `<path class="pc-area" d="${area}"></path>
       <path class="pc-line pc-in"  d="${line(din)}" pathLength="1"></path>
       <path class="pc-line pc-out" d="${line(out)}" pathLength="1"></path>`;
    countUp(el.pulseIn, din.reduce((a, b) => a + b, 0));
    countUp(el.pulseOut, out.reduce((a, b) => a + b, 0));
  }

  /* ---------- 渲染：列表 ---------- */
  function assigneeCell(b) {
    return b.assignee ? ava(b.assignee, 24) : '<span class="ava ava-fb dim-ava" aria-hidden="true">无</span>';
  }
  function rowHTML(b, i) {
    const s = STATUS[b.status];
    return `<div class="bug-row ${stateSel === b.id ? 'selected' : ''}" data-id="${b.id}"
      tabindex="0" role="button" aria-label="${esc(b.title)}" style="animation-delay:${Math.min(i * 18, 120)}ms">
      <div class="cell-state col-state"><span class="sdot" style="background:${s.dot}"></span><span class="slabel">${s.label}</span></div>
      <div class="cell-title col-title"><span class="t-main" title="${esc(b.title)}">${esc(b.title)}</span>
        <span class="t-meta"><span class="m-id mono">${fmtId(b)}</span><span class="m-ver">${esc(b.module)}</span><span class="m-ver mono">${b.ver}</span></span></div>
      <span class="cell-sev mono col-sev" style="color:${SEV[b.sev].deep}">${b.sev}</span>
      <div class="cell-owner col-owner" title="${b.assignee || '未指派'}">${assigneeCell(b)}</div>
      <span class="cell-time mono col-time">${b.updated}</span>
    </div>`;
  }
  function renderList() {
    const list = visible();
    if (stateSel != null && !list.some((b) => b.id === stateSel)) stateSel = list.length ? list[0].id : null;
    const frag = document.createDocumentFragment();
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<i class="ti ti-filter-off" aria-hidden="true"></i><p>没有匹配的缺陷</p><span class="sub">试试清空搜索词或切换级别筛选</span>';
      frag.append(empty);
    } else {
      list.forEach((b, i) => {
        const d = document.createElement('div');
        d.innerHTML = rowHTML(b, i);
        frag.append(d.firstElementChild);
      });
    }
    el.listBody.replaceChildren(frag);
    updateSelection(stateSel);
  }

  /* ---------- 渲染：登记表单级别 ---------- */
  function renderSevPicker() {
    el.sevPicker.innerHTML = Object.keys(SEV).map((k) =>
      `<button type="button" class="sev-pill" role="radio" aria-checked="${pickedSev === k}" data-sev="${k}" style="--sc:${SEV[k].color};--sct:${SEV[k].deep}">
         <span class="dot" style="background:${SEV[k].color}"></span><span class="mono">${k}</span>${SEV[k].label}</button>`
    ).join('');
  }

  function detailHTML(b) {
    const s = STATUS[b.status];
    const acts = ACTIONS[b.status] || [];
    return `
      <div class="d-head">
        <div class="d-top">
          <span class="chip" style="--c:${s.dot};--bg:${s.tint};--tx:${s.deep}"><span class="dot"></span>${s.label}</span>
          <span class="chip-sev mono" style="color:${SEV[b.sev].deep}"><span class="dot" style="background:${SEV[b.sev].color}"></span>${b.sev} ${SEV[b.sev].label}</span>
          <span class="d-id mono">${fmtId(b)}</span>
          <button class="icon-btn d-close-btn" data-close aria-label="关闭详情"><i class="ti ti-x" aria-hidden="true"></i></button>
        </div>
        <h2 class="d-title">${esc(b.title)}</h2>
      </div>
      <div class="d-body">
        <dl class="d-meta">
          <dt>模块</dt><dd>${esc(b.module)}</dd>
          <dt>版本</dt><dd class="mono">${esc(b.ver)}</dd>
          <dt>报告人</dt><dd>${ava(b.reporter, 20)}<span>${esc(b.reporter)}</span></dd>
          <dt>负责人</dt><dd>${b.assignee ? ava(b.assignee, 20) + `<span>${esc(b.assignee)}</span>` : '<span class="dim">未指派</span>'}</dd>
          <dt>更新</dt><dd class="mono">${b.updated}</dd>
        </dl>
        ${b.desc ? `<p class="d-desc">${esc(b.desc)}</p>` : '<div class="sep"></div>'}
        <section class="d-section">
          <h3>处理记录</h3>
          <ul class="tl">${b.timeline.map((e, i) =>
            `<li class="tl-item ${i === 0 ? 'cur' : ''}">
              <span class="tl-dot" aria-hidden="true"></span>
              <span class="tl-time mono">${e.t}</span>
              <span class="tl-actor">${esc(e.actor)}</span>
              <p class="tl-line">${esc(e.line)}</p>
            </li>`).join('')}</ul>
        </section>
      </div>
      <div class="d-actions">
        ${acts.map((a, i) =>
          `<button class="btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}" data-act="${i}" aria-label="${a.label}">
             <i class="ti ${a.icon}" aria-hidden="true"></i>${a.label}</button>`).join('')}
      </div>`;
  }
  function renderDetail() {
    const b = bugs.find((x) => x.id === stateSel);
    el.detail.classList.toggle('open', !!b);
    el.detail.innerHTML = b
      ? detailHTML(b)
      : '<div class="d-empty"><i class="ti ti-bug" aria-hidden="true"></i><p>选择左侧列表中的缺陷，查看详情与处理记录</p></div>';
  }

  /* ---------- 选择态 ---------- */
  function updateSelection(id) {
    el.listBody.querySelectorAll('.bug-row.selected').forEach((r) => r.classList.remove('selected'));
    if (id != null) {
      const row = el.listBody.querySelector(`.bug-row[data-id="${id}"]`);
      if (row) row.classList.add('selected');
    }
    renderDetail();
  }
  function selectRow(id) {
    const list = visible();
    const nextIdx = list.findIndex((b) => b.id === id);
    const prevIdx = list.findIndex((b) => b.id === stateSel);
    el.detail.dataset.dir = prevIdx >= 0 && nextIdx < prevIdx ? 'up' : 'down';
    stateSel = id;
    updateSelection(id);
    renderHeader();
  }

  /* ---------- toast ---------- */
  function toast(icon, msg) {
    el.toast.innerHTML = `<i class="ti ${icon}" aria-hidden="true"></i><span>${esc(msg)}</span>`;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2600);
  }

  /* ---------- 全量渲染 ---------- */
  function renderAll() {
    renderViews();
    renderStages();
    renderSeg();
    renderList();
    renderHeader();
  }

  /* ---------- 事件 ---------- */
  el.views.addEventListener('click', (e) => {
    const btn = e.target.closest('.view');
    if (!btn) return;
    state.view = btn.dataset.view;
    state.stage = null;
    renderAll();
  });
  el.flowstrip.addEventListener('click', (e) => {
    const btn = e.target.closest('.stage');
    if (!btn) return;
    const k = btn.dataset.stage;
    if (state.stage === k) { state.stage = null; }
    else { state.stage = k; state.view = 'all'; }
    renderAll();
  });
  el.sevSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    state.sev = btn.dataset.sev;
    renderAll();
  });
  el.listBody.addEventListener('click', (e) => {
    const row = e.target.closest('.bug-row');
    if (!row) return;
    selectRow(Number(row.dataset.id));
  });
  el.listBody.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = [...el.listBody.querySelectorAll('.bug-row')];
      const idx = rows.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      const next = rows[idx + (e.key === 'ArrowDown' ? 1 : -1)];
      if (next) next.focus();
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('.bug-row');
    if (!row || e.target !== row) return;
    e.preventDefault();
    selectRow(Number(row.dataset.id));
  });
  el.detail.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      stateSel = null;
      updateSelection(null);
      return;
    }
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const b = bugs.find((x) => x.id === stateSel);
    if (!b) return;
    const act = ACTIONS[b.status][Number(btn.dataset.act)];
    b.status = act.to;
    if (act.to === 'fixing' && !b.assignee) {
      b.assignee = ME;
      b.timeline.unshift({ t: nowstamp(), actor: ME, line: '认领缺陷，开始修复' });
    }
    b.timeline.unshift({ t: nowstamp(), actor: ME, line: act.tl });
    b.updated = nowstamp();
    toast(act.icon, `${fmtId(b)} · ${act.tl}`);
    renderAll();
  });
  el.sevPicker.addEventListener('click', (e) => {
    const pill = e.target.closest('.sev-pill');
    if (!pill) return;
    pickedSev = pill.dataset.sev;
    renderSevPicker();
  });

  el.newBugBtn.addEventListener('click', openModal);
  el.modalClose.addEventListener('click', closeModal);
  el.modalCancel.addEventListener('click', closeModal);
  el.prefBtn.addEventListener('click', () => toast('ti-adjustments-horizontal', '偏好设置暂未开放'));
  el.modalBackdrop.addEventListener('click', (e) => { if (e.target === el.modalBackdrop) closeModal(); });
  el.bugForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = el.fTitle.value.trim();
    if (!title) { el.fTitleErr.hidden = false; el.fTitle.focus(); return; }
    const bug = {
      id: nextId++, title,
      sev: pickedSev, status: 'new',
      module: el.fModule.value, ver: el.fVer.value.trim() || 'v3.2.1',
      reporter: ME, assignee: null, updated: nowstamp(),
      desc: el.fDesc.value.trim(),
      timeline: [{ t: nowstamp(), actor: ME, line: '登记缺陷' }],
    };
    bugs.unshift(bug);
    closeModal();
    state.view = 'all'; state.stage = null; state.sev = 'all'; state.q = '';
    el.searchInput.value = '';
    stateSel = bug.id;
    renderAll();
    toast('ti-check', `已登记 ${fmtId(bug)}，等待分诊`);
  });
  el.fTitle.addEventListener('input', () => { el.fTitleErr.hidden = true; });
  el.searchInput.addEventListener('input', () => {
    state.q = el.searchInput.value.trim();
    renderAll();
  });
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
    if (e.key === '/' && !typing) { e.preventDefault(); el.searchInput.focus(); el.searchInput.select(); }
    else if (e.key === 'Escape') {
      if (!el.modalBackdrop.hidden) { closeModal(); }
      else if (stateSel != null) { stateSel = null; updateSelection(null); renderHeader(); }
      else if (state.q) { el.searchInput.value = ''; state.q = ''; renderAll(); }
    }
  });
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement) || !t.classList.contains('ava')) return;
    const fb = document.createElement('span');
    fb.className = 'ava ava-fb';
    fb.textContent = (t.dataset.name || '?').charAt(0);
    if (t.dataset.fb) fb.style.background = t.dataset.fb;
    t.replaceWith(fb);
  }, true);

  function openModal() {
    el.modalId.textContent = fmtId({ id: nextId });
    el.bugForm.reset();
    el.fVer.value = 'v3.2.1';
    pickedSev = 'P2';
    el.fTitleErr.hidden = true;
    renderSevPicker();
    el.modalBackdrop.hidden = false;
    requestAnimationFrame(() => el.fTitle.focus());
  }
  function closeModal() { el.modalBackdrop.hidden = true; }

  /* ---------- 初始化 ---------- */
  renderPulse();
  renderAll();
  stateSel = bugs.length ? bugs[0].id : null;
  updateSelection(stateSel);
  if (document.fonts?.ready) document.fonts.ready.then(positionSeg);
})();
