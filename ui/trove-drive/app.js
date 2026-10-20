/* Trove · cloud drive desktop prototype
   local data only, no backend, no fake server success states            */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'f' + Math.random().toString(36).slice(2, 8);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ── people ─────────────────────────────────────────────── */
  const ME = 'mara';
  const PEOPLE = {
    mara:   { name: 'Mara Okonkwo', img: 'https://i.pravatar.cc/96?u=mara-okonkwo' },
    jonas:  { name: 'Jonas Vetter', img: 'https://i.pravatar.cc/72?u=jonas-vetter' },
    ines:   { name: 'Ines Duarte',  img: 'https://i.pravatar.cc/72?u=ines-duarte' },
    kenji:  { name: 'Kenji Arai',   img: 'https://i.pravatar.cc/72?u=kenji-arai' },
    tomas:  { name: 'Tomas Beck',   img: 'https://i.pravatar.cc/72?u=tomas-beck' },
    priya:  { name: 'Priya Raman',  img: 'https://i.pravatar.cc/72?u=priya-raman' },
  };

  /* ── sample library ─────────────────────────────────────── */
  const seed = [
    { id: 'northwind', name: 'Northwind Rebrand', kind: 'folder', count: 62, size: 3.1e9, modified: '2026-10-20T09:12', owner: 'mara', shared: ['jonas', 'ines'], roles: { jonas: 'Editor', ines: 'Editor' }, space: 'northwind', starred: true, offline: true },
    { id: 'kestrel', name: 'Kestrel launch film v07', kind: 'video', size: 1.82e9, modified: '2026-10-19T18:40', owner: 'kenji', shared: ['mara', 'tomas'], roles: { mara: 'Editor', tomas: 'Commenter' }, space: 'northwind', thumb: 'https://picsum.photos/seed/kestrel7/240/240' },
    { id: 'reykjavik', name: 'Reykjavik selects', kind: 'folder', count: 214, size: 3.4e9, modified: '2026-10-18T11:05', owner: 'ines', shared: ['mara'], roles: { mara: 'Editor' }, space: 'northwind', offline: false },
    { id: 'sable', name: 'Sable packaging', kind: 'folder', count: 18, size: 640e6, modified: '2026-10-17T15:22', owner: 'jonas', shared: [], roles: {}, space: 'sable', offline: true },
    { id: 'foil', name: 'Invitation card foil test', kind: 'image', size: 620e6, modified: '2026-10-16T12:48', owner: 'mara', shared: [], roles: {}, space: 'northwind', thumb: 'https://picsum.photos/seed/foilcard/240/240' },
    { id: 'meridian', name: 'Meridian signage render', kind: 'image', size: 42.6e6, modified: '2026-10-14T09:31', owner: 'tomas', shared: ['mara'], roles: { mara: 'Commenter' }, space: 'northwind', thumb: 'https://picsum.photos/seed/meridiansign/240/240' },
    { id: 'lockup', name: 'Northwind logo lockup', kind: 'design', size: 84.2e6, modified: '2026-10-20T08:55', owner: 'mara', shared: ['jonas'], roles: { jonas: 'Editor' }, space: 'northwind' },
    { id: 'overview', name: 'Studio overview 2026', kind: 'doc', size: 128e6, modified: '2026-10-11T17:20', owner: 'priya', shared: ['mara'], roles: { mara: 'Viewer' }, space: 'northwind', starred: true, offline: true },
    { id: 'dieline', name: 'Sable dieline v3', kind: 'doc', size: 4.6e6, modified: '2026-10-15T10:02', owner: 'jonas', shared: [], roles: {}, space: 'sable' },
    { id: 'vo', name: 'Kestrel VO take 4', kind: 'audio', size: 96.4e6, modified: '2026-10-19T20:14', owner: 'kenji', shared: ['mara'], roles: { mara: 'Editor' }, space: 'northwind' },
    { id: 'onboarding', name: 'Onboarding assets', kind: 'folder', count: 24, size: 412e6, modified: '2026-10-08T14:33', owner: 'priya', shared: ['ines', 'mara', 'tomas'], roles: { ines: 'Editor', mara: 'Editor', tomas: 'Viewer' }, space: 'northwind' },
    { id: 'fieldnotes', name: 'Field notes 2026', kind: 'doc', size: 18e3, modified: '2026-10-13T22:07', owner: 'mara', shared: [], roles: {}, space: 'sable' },
    { id: 'archive', name: 'Q3 handoff archive', kind: 'archive', size: 940e6, modified: '2026-10-06T16:41', owner: 'tomas', shared: [], roles: {}, space: 'northwind' },
  ];

  let files = seed.map((f) => ({ ...f, starred: !!f.starred, offline: !!f.offline }));
  let trash = [{ id: 'roughcut', name: 'Kestrel rough cut', kind: 'video', size: 2.2e9, modified: '2026-10-05T13:12', owner: 'mara', shared: [], roles: {}, space: 'northwind', deletedAt: '2026-10-12T09:40' }];

  const STORAGE = {
    used: 412.6,
    total: 1024,
    buckets: [
      { label: 'Video', gb: 186.4, tone: 0.95 },
      { label: 'Images', gb: 112.8, tone: 0.68 },
      { label: 'Documents', gb: 78.2, tone: 0.46 },
      { label: 'Other', gb: 35.2, tone: 0.26 },
    ],
  };

  const SECTIONS = {
    all:       { title: 'All files', meta: 'library' },
    recent:    { title: 'Recent', meta: 'library' },
    shared:    { title: 'Shared with me', meta: 'library' },
    starred:   { title: 'Starred', meta: 'library' },
    offline:   { title: 'Offline', meta: 'library' },
    large:     { title: 'Large files', meta: 'large' },
    trash:     { title: 'Trash', meta: 'trash' },
    northwind: { title: 'Northwind Studio', meta: 'library' },
    sable:     { title: 'Sable Coffee', meta: 'library' },
  };

  const NAV = [
    { id: 'all', label: 'All files', icon: 'stack-2' },
    { id: 'recent', label: 'Recent', icon: 'history' },
    { id: 'shared', label: 'Shared with me', icon: 'users' },
    { id: 'starred', label: 'Starred', icon: 'star' },
    { id: 'offline', label: 'Offline', icon: 'cloud-download' },
    { id: 'trash', label: 'Trash', icon: 'trash' },
  ];
  const SPACES = [
    { id: 'northwind', label: 'Northwind Studio', icon: 'folder' },
    { id: 'sable', label: 'Sable Coffee', icon: 'folder' },
  ];
  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'folders', label: 'Folders' },
    { id: 'documents', label: 'Documents' },
    { id: 'media', label: 'Media' },
    { id: 'shared', label: 'Shared' },
  ];
  const ICONS = { folder: 'folder', image: 'photo', video: 'movie', design: 'brush', doc: 'file-text', audio: 'music', archive: 'file-zip' };
  const TYPE_LABEL = { folder: 'Folder', image: 'Image', video: 'Video', design: 'Design file', doc: 'Document', audio: 'Audio', archive: 'Archive' };

  const state = { section: 'all', filter: 'all', query: '', sort: 'modified', dir: 'desc', layout: 'list', selected: null, compact: false, calm: false };

  /* ── formatting ─────────────────────────────────────────── */
  function fmtSize(bytes) {
    if (bytes == null) return '';
    if (bytes < 1000) return bytes + ' B';
    const units = ['KB', 'MB', 'GB', 'TB'];
    let v = bytes / 1000;
    let i = 0;
    while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
    const out = v >= 100 ? Math.round(v) : v >= 10 ? parseFloat(v.toFixed(1)) : parseFloat(v.toFixed(2));
    return out + ' ' + units[i];
  }
  function fmtDate(iso) {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hh}:${mm}`;
  }

  /* ── derivations ────────────────────────────────────────── */
  const others = (f) => [...new Set([f.owner, ...(f.shared || [])])].filter((id) => id !== ME && PEOPLE[id]);

  function recentList() {
    return [...files].sort((a, b) => new Date(b.modified) - new Date(a.modified)).slice(0, 8);
  }
  function sectionList() {
    switch (state.section) {
      case 'recent': return recentList();
      case 'shared': return files.filter((f) => f.owner !== ME);
      case 'starred': return files.filter((f) => f.starred);
      case 'offline': return files.filter((f) => f.offline);
      case 'large': return files.filter((f) => f.size >= 1e9);
      case 'trash': return [...trash];
      case 'northwind': return files.filter((f) => f.space === 'northwind');
      case 'sable': return files.filter((f) => f.space === 'sable');
      default: return [...files];
    }
  }
  function tabMatch(f) {
    switch (state.filter) {
      case 'folders': return f.kind === 'folder';
      case 'documents': return ['doc', 'design', 'archive'].includes(f.kind);
      case 'media': return ['image', 'video', 'audio'].includes(f.kind);
      case 'shared': return (f.shared || []).length > 0;
      default: return true;
    }
  }
  function visibleList() {
    const q = state.query.trim().toLowerCase();
    const list = sectionList().filter((f) => tabMatch(f) && (!q || f.name.toLowerCase().includes(q)));
    const dir = state.dir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      if (state.sort === 'name') return dir * a.name.localeCompare(b.name);
      if (state.sort === 'size') return dir * ((a.size || 0) - (b.size || 0));
      return dir * (new Date(a.modified) - new Date(b.modified));
    });
  }

  /* ── chrome: rail, nav, panel ───────────────────────────── */
  let navBuilt = false;
  function navCounts() {
    const counts = {
      all: files.length,
      recent: recentList().length,
      shared: files.filter((f) => f.owner !== ME).length,
      starred: files.filter((f) => f.starred).length,
      offline: files.filter((f) => f.offline).length,
      trash: trash.length,
    };
    SPACES.forEach((s) => { counts[s.id] = files.filter((f) => f.space === s.id).length; });
    return counts;
  }

  /* the rail is built once and only patched afterwards, so switching
     sections never reflows the nav, the spaces block or the account row */
  function renderNav() {
    if (!navBuilt) {
      const itemHTML = (n) => `<button class="nav-item" type="button" data-nav="${n.id}">`
        + `<i class="ti ti-${n.icon}" aria-hidden="true"></i><span>${n.label}</span><em>0</em></button>`;
      $('#nav').innerHTML = NAV.map(itemHTML).join('');
      $('#spaces').innerHTML = SPACES.map(itemHTML).join('');
      navBuilt = true;
    }
    const counts = navCounts();
    $$('[data-nav]').forEach((btn) => {
      const id = btn.dataset.nav;
      const on = state.section === id;
      btn.classList.toggle('is-active', on);
      if (on) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
      const em = btn.querySelector('em');
      const next = String(counts[id] != null ? counts[id] : 0);
      if (em && em.textContent !== next) em.textContent = next;
    });
  }

  /* the meter and legend describe account storage, which never changes here,
     so they are built once and only the derived lines are patched */
  let panelBuilt = false;
  function renderPanel() {
    const { used, total, buckets } = STORAGE;
    if (!panelBuilt) {
      const free = total - used;
      $('#gaugeNum').textContent = used.toFixed(1);
      $('#meter').innerHTML = buckets.map((b) => `<span style="flex:${(b.gb / total * 100).toFixed(2)};opacity:${b.tone}"></span>`).join('')
        + `<span style="flex:${(free / total * 100).toFixed(2)};opacity:.16"></span>`;
      $('#legend').innerHTML = buckets.map((b) => `
      <div class="legend-item"><i style="opacity:${b.tone}"></i>${b.label}<span class="mono">${b.gb.toFixed(1)} GB</span></div>`).join('');
      panelBuilt = true;
    }
    const large = files.filter((f) => f.size >= 1e9);
    const largeSum = large.reduce((n, f) => n + f.size, 0);
    const line = large.length === 1
      ? `${fmtSize(largeSum)} in 1 file over 1 GB`
      : `${fmtSize(largeSum)} in ${large.length} files over 1 GB`;
    if ($('#reclaimLine').textContent !== line) $('#reclaimLine').textContent = line;
    $('#reclaim').hidden = large.length === 0;
  }

  let transferKey = '';
  function renderTransfers() {
    const active = files.filter((f) => f.status === 'uploading' || f.status === 'pending');
    const list = active.length
      ? active.slice(0, 3)
      : [...files].filter((f) => f.kind !== 'folder').sort((a, b) => new Date(b.modified) - new Date(a.modified)).slice(0, 3);
    const key = list.map((f) => f.id + ':' + (f.status || 'synced')).join('|');
    if (key === transferKey) return;
    transferKey = key;
    $('#transferList').innerHTML = list.map((f) => {
      if (f.status === 'uploading' || f.status === 'pending') {
        const p = f.status === 'pending' ? 1 : (f.progress || 0) / 100;
        return `<div class="t-item">
          <div class="t-top"><i class="ti ti-arrow-up" aria-hidden="true"></i><span class="t-name">${esc(f.name)}</span>
            <span class="mono" data-tpct="${f.id}">${f.status === 'pending' ? 'Pending' : Math.round(p * 100) + '%'}</span></div>
          <div class="t-bar"><span data-tbar="${f.id}" style="--p:${p}"></span></div>
        </div>`;
      }
      return `<div class="t-item">
        <div class="t-top"><i class="ti ti-check" aria-hidden="true"></i><span class="t-name">${esc(f.name)}</span>
          <span class="mono">Synced</span></div>
      </div>`;
    }).join('');
  }

  function renderSync() {
    const up = files.filter((f) => f.status === 'uploading').length;
    const pend = files.filter((f) => f.status === 'pending').length;
    $('#syncText').innerHTML = `<i class="pulse" aria-hidden="true"></i>${up ? `Syncing ${up} ${up > 1 ? 'files' : 'file'}` : pend ? `${pend} pending sync` : 'Synced 2 min ago'}`;
    $('#footLeft').textContent = up ? `Uploading ${up} ${up > 1 ? 'files' : 'file'}` : pend ? `${pend} ${pend > 1 ? 'files' : 'file'} pending sync` : 'All changes synced';
  }

  /* ── list rendering ─────────────────────────────────────── */
  function stackHTML(f) {
    const ids = others(f);
    if (!ids.length) return '';
    const shown = ids.slice(0, 2);
    const more = ids.length - shown.length;
    return `<span class="stack-sm">${shown.map((id) => `<img class="avatar" src="${PEOPLE[id].img}" alt="${esc(PEOPLE[id].name)}" title="${esc(PEOPLE[id].name)}">`).join('')}${more ? `<span class="more">+${more}</span>` : ''}</span>`;
  }

  function actionsHTML(f) {
    return state.section === 'trash'
      ? `<button class="icon-btn" data-act="restore" aria-label="Restore ${esc(f.name)}"><i class="ti ti-arrow-back-up"></i></button>
         <button class="icon-btn" data-act="purge" aria-label="Delete forever"><i class="ti ti-trash"></i></button>`
      : `<button class="icon-btn${f.starred ? ' is-on is-star' : ''}" data-act="star" aria-label="${f.starred ? 'Unstar' : 'Star'} ${esc(f.name)}"><i class="ti ${f.starred ? 'ti-star-filled' : 'ti-star'}"></i></button>
         <button class="icon-btn" data-act="menu" aria-label="More actions"><i class="ti ti-dots"></i></button>`;
  }

  function rowHTML(f, i) {
    const isFolder = f.kind === 'folder';
    const sub = f.status === 'uploading' ? `Uploading ${Math.round(f.progress || 0)}%`
      : f.status === 'pending' ? 'Pending sync'
      : isFolder ? `${f.count} items` : '';
    const media = f.thumb
      ? `<img src="${f.thumb}" alt="" loading="lazy">`
      : `<i class="ti ti-${ICONS[f.kind] || 'file'}" aria-hidden="true"></i>`;
    return `<div class="row${state.selected === f.id ? ' is-sel' : ''}" role="button" tabindex="0" data-id="${f.id}" aria-label="${esc(f.name)}" style="--i:${i}">
      <span class="row-name">
        <span class="tile">${media}</span>
        <span class="name-text"><b>${esc(f.name)}</b>${sub ? `<span data-sub="${f.id}">${esc(sub)}</span>` : ''}</span>
      </span>
      <span class="col-share">${stackHTML(f)}</span>
      <span class="row-size">${fmtSize(f.size)}</span>
      <span class="row-date">${fmtDate(f.modified)}</span>
      <span class="row-actions">${actionsHTML(f)}</span>
    </div>`;
  }

  function cardHTML(f, i) {
    const media = f.thumb
      ? `<img src="${f.thumb}" alt="" loading="lazy">`
      : `<i class="ti ti-${ICONS[f.kind] || 'file'}" aria-hidden="true"></i>`;
    const meta = f.status === 'uploading' ? `Uploading ${Math.round(f.progress || 0)}%`
      : f.status === 'pending' ? 'Pending sync'
      : f.kind === 'folder' ? `${f.count} items` : fmtSize(f.size);
    return `<article class="card${state.selected === f.id ? ' is-sel' : ''}" data-id="${f.id}" style="--i:${i}">
      <div class="card-media">${media}<span class="card-actions">${actionsHTML(f)}</span></div>
      <div class="card-body"><b>${esc(f.name)}</b><span>${meta}</span></div>
    </article>`;
  }

  function render(animate = true) {
    const list = visibleList();
    const section = SECTIONS[state.section];

    /* headline */
    $('#title').textContent = state.query.trim() ? 'Search' : section.title;
    const noun = list.length === 1 ? 'item' : 'items';
    const sharedN = list.filter((f) => (f.shared || []).length > 0).length;
    const sum = list.reduce((n, f) => n + (f.size || 0), 0);
    $('#meta').textContent = state.section === 'trash'
      ? `${list.length} ${noun} in trash`
      : state.section === 'large'
        ? `${list.length} ${noun} · ${fmtSize(sum)}`
        : `${list.length} ${noun}${sharedN ? ` · ${sharedN} shared` : ''}`;
    $('#emptyTrashBtn').hidden = !(state.section === 'trash' && trash.length);
    const off = files.filter((f) => f.offline);
    $('#footRight').textContent = off.length
      ? `Offline cache ${fmtSize(off.reduce((n, f) => n + (f.size || 0), 0))}`
      : 'Nothing kept offline';

    /* tabs + sort + layout */
    if (!$('#tabs').children.length) {
      $('#tabs').innerHTML = TABS.map((t) => `<button class="tab" type="button" role="tab" aria-selected="false" data-tab="${t.id}">${t.label}</button>`).join('');
    }
    $$('[data-tab]').forEach((t) => {
      const on = state.filter === t.dataset.tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
    });
    $('#sortLabel').textContent = state.sort[0].toUpperCase() + state.sort.slice(1);
    $('#sortBtn').classList.toggle('is-asc', state.dir === 'asc');
    $('#viewList').classList.toggle('is-on', state.layout === 'list');
    $('#viewGrid').classList.toggle('is-on', state.layout === 'grid');
    $('#filesHead').hidden = state.layout === 'grid' || list.length === 0;

    /* body */
    const body = $('#filesBody');
    body.classList.toggle('is-grid', state.layout === 'grid');
    body.classList.toggle('is-compact', state.compact);
    if (list.length) {
      body.innerHTML = state.layout === 'grid'
        ? list.map((f, i) => cardHTML(f, i)).join('')
        : list.map((f, i) => rowHTML(f, i)).join('');
      if (!animate) $$('.row,.card', body).forEach((el) => { el.style.animation = 'none'; });
      $('#empty').hidden = true;
    } else {
      body.innerHTML = '';
      const filtered = state.query.trim() || state.filter !== 'all';
      $('#emptyText').textContent = filtered ? 'No files match' : emptyCopy(state.section);
      $('#emptyBtn').hidden = !filtered;
      $('#empty').hidden = false;
    }

    renderNav();
    renderPanel();
    renderTransfers();
    renderSync();
  }

  function emptyCopy(section) {
    if (section === 'trash') return 'Trash is empty';
    if (section === 'starred') return 'Nothing starred yet';
    if (section === 'offline') return 'Nothing kept offline';
    if (section === 'large') return 'No large files';
    if (section === 'shared') return 'Nothing shared yet';
    return 'This folder is empty';
  }

  /* ── menus ──────────────────────────────────────────────── */
  let menuOpen = false;
  let menuAnchor = null;
  function closeMenu() {
    const layer = $('#menuLayer');
    layer.classList.remove('is-open');
    layer.innerHTML = '';
    menuOpen = false;
    menuAnchor = null;
    $$('[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }
  function openMenu(anchor, items) {
    if (menuOpen && menuAnchor === anchor) { closeMenu(); return; }
    closeMenu();
    menuAnchor = anchor;
    const app = $('#app').getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    const layer = $('#menuLayer');
    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.setAttribute('role', 'menu');
    items.forEach((item) => {
      if (item.sep) { const s = document.createElement('div'); s.className = 'sep'; menu.appendChild(s); return; }
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      const ico = item.icon === false ? '<span class="mi"></span>' : `<i class="ti ti-${item.icon || 'circle'}" aria-hidden="true"></i>`;
      b.innerHTML = `${ico}<span>${esc(item.label)}</span>${item.mark ? `<span class="mark"><i class="ti ti-check"></i></span>` : ''}`;
      b.addEventListener('click', () => { closeMenu(); item.onPick && item.onPick(); });
      menu.appendChild(b);
    });
    layer.appendChild(menu);
    layer.classList.add('is-open');
    menuOpen = true;
    if (anchor.setAttribute) anchor.setAttribute('aria-expanded', 'true');

    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let x = rect.left - app.left;
    let y = rect.bottom - app.top + 6;
    if (x + mw > app.width - 10) x = rect.right - app.left - mw;
    if (y + mh > app.height - 10) y = rect.top - app.top - mh - 6;
    menu.style.left = Math.max(10, x) + 'px';
    menu.style.top = Math.max(10, y) + 'px';

    layer.onclick = (e) => { if (e.target === layer) closeMenu(); };
  }

  /* ── overlays ───────────────────────────────────────────── */
  const scrims = [];
  function openScrim(el) {
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-in'));
    if (!scrims.includes(el)) scrims.push(el);
  }
  function closeScrim(el) {
    const node = el || scrims[scrims.length - 1];
    if (!node) return;
    node.classList.remove('is-in');
    const i = scrims.indexOf(node);
    if (i > -1) scrims.splice(i, 1);
    setTimeout(() => { if (!node.classList.contains('is-in')) node.hidden = true; }, 240);
  }
  function closeAll() {
    closeMenu();
    while (scrims.length) closeScrim();
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    $('#toastText').textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-in'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-in');
      setTimeout(() => { el.hidden = true; }, 220);
    }, 2400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (err2) { return false; }
    }
  }
  const shareLink = (f) => `trove.app/s/${f.id}`;

  /* preview */
  let previewId = null;
  function openPreview(id) {
    const f = files.find((x) => x.id === id) || trash.find((x) => x.id === id);
    if (!f) return;
    previewId = id;
    state.selected = id;
    const inTrash = !files.some((x) => x.id === id);
    $('#pvShareBtn').hidden = inTrash;
    $('#pvCopy').hidden = inTrash;
    $$('.row,.card').forEach((el) => el.classList.toggle('is-sel', el.dataset.id === id));
    $('#pvName').textContent = f.name;
    $('#pvMedia').innerHTML = f.thumb
      ? `<img src="${f.thumb.replace('/240/240', '/640/640')}" alt="">`
      : `<i class="ti ti-${ICONS[f.kind] || 'file'}" aria-hidden="true"></i>`;
    const meta = [
      ['Type', TYPE_LABEL[f.kind] || 'File'],
      ['Size', f.kind === 'folder' ? `${fmtSize(f.size)} · ${f.count} items` : fmtSize(f.size)],
      ['Modified', fmtDate(f.modified)],
      ['Owner', PEOPLE[f.owner] ? PEOPLE[f.owner].name : 'You'],
    ];
    $('#pvMeta').innerHTML = meta.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    const ids = others(f);
    $('#pvPeople').innerHTML = ids.length
      ? `<span class="stack">${ids.slice(0, 4).map((pid) => `<img class="avatar" src="${PEOPLE[pid].img}" alt="${esc(PEOPLE[pid].name)}" title="${esc(PEOPLE[pid].name)}">`).join('')}</span><span>${ids.length} with access</span>`
      : '<span>Only you</span>';
    paintStar();
    openScrim($('#previewScrim'));
  }
  function paintStar() {
    const f = files.find((x) => x.id === previewId);
    const btn = $('#pvStar');
    if (!f) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.innerHTML = `<i class="ti ${f.starred ? 'ti-star-filled' : 'ti-star'}"></i>${f.starred ? 'Starred' : 'Star'}`;
  }

  /* share */
  let shareId = null;
  function openShare(id) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    shareId = id;
    $('#shTitle').textContent = f.kind === 'folder' ? 'Share folder' : 'Share file';
    $('#shSub').textContent = f.name;
    $('#shareLink').textContent = shareLink(f);
    $('#inviteEmail').value = '';
    renderPeople();
    openScrim($('#shareScrim'));
    setTimeout(() => $('#inviteEmail').focus(), 260);
  }
  function roleMenu(anchor, pid) {
    const f = files.find((x) => x.id === shareId);
    if (!f) return;
    const roles = ['Editor', 'Commenter', 'Viewer'];
    openMenu(anchor, roles.map((r) => ({
      label: r, icon: r === 'Viewer' ? 'eye' : r === 'Editor' ? 'pencil' : 'message-circle',
      mark: (f.roles[pid] || 'Editor') === r,
      onPick: () => { f.roles[pid] = r; renderPeople(); render(false); },
    })));
  }
  function renderPeople() {
    const f = files.find((x) => x.id === shareId);
    if (!f) return;
    const owner = `<li class="person">
      <img class="avatar" src="${PEOPLE[f.owner].img}" alt="">
      <span class="person-text"><b>${esc(PEOPLE[f.owner].name)}</b><span>${f.owner === ME ? 'You' : 'Owner'}</span></span>
      <span class="btn quiet">Owner</span>
    </li>`;
    const rows = (f.shared || []).filter((pid) => PEOPLE[pid]).map((pid) => `<li class="person">
      <img class="avatar" src="${PEOPLE[pid].img}" alt="">
      <span class="person-text"><b>${esc(PEOPLE[pid].name)}</b><span>${pid === ME ? 'You' : 'Studio member'}</span></span>
      <button class="btn quiet role" data-role="${pid}" ${pid === ME ? 'disabled' : ''}><span>${f.roles[pid] || 'Editor'}</span><i class="ti ti-chevron-down"></i></button>
    </li>`).join('');
    $('#peopleList').innerHTML = owner + rows;
  }

  /* prompt */
  let promptHandler = null;
  function openPrompt({ title, sub, value = '', input = true, ok = 'Create', onOk }) {
    $('#pmTitle').textContent = title;
    $('#pmSub').textContent = sub || '';
    $('#pmSub').hidden = !sub;
    const field = $('#pmInput');
    field.hidden = !input;
    field.value = value;
    $('#pmOk').textContent = ok;
    promptHandler = onOk;
    openScrim($('#promptScrim'));
    if (input) setTimeout(() => { field.focus(); field.select(); }, 260);
  }

  /* ── actions ────────────────────────────────────────────── */
  function setSection(id) {
    state.section = id;
    state.query = '';
    state.filter = 'all';
    state.selected = null;
    $('#search').value = '';
    render();
  }

  function toggleStar(id) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    f.starred = !f.starred;
    render(false);
    toast(f.starred ? 'Added to Starred' : 'Removed from Starred');
  }

  function moveToTrash(id) {
    const i = files.findIndex((x) => x.id === id);
    if (i < 0) return;
    const [f] = files.splice(i, 1);
    f.deletedAt = new Date().toISOString();
    trash.unshift(f);
    render(false);
    toast(`${f.name} moved to Trash`);
  }

  function restoreFile(id) {
    const i = trash.findIndex((x) => x.id === id);
    if (i < 0) return;
    const [f] = trash.splice(i, 1);
    delete f.deletedAt;
    files.unshift(f);
    render(false);
    toast(`${f.name} restored`);
  }

  function purgeFile(id) {
    const f = trash.find((x) => x.id === id);
    if (!f) return;
    openPrompt({
      title: 'Delete forever?', sub: `${f.name} cannot be recovered.`, input: false, ok: 'Delete',
      onOk: () => { trash = trash.filter((x) => x.id !== id); render(false); toast('Deleted forever'); },
    });
  }

  function rowMenu(anchor, f) {
    const inTrash = state.section === 'trash';
    if (inTrash) {
      openMenu(anchor, [
        { label: 'Restore', icon: 'arrow-back-up', onPick: () => restoreFile(f.id) },
        { label: 'Delete forever', icon: 'trash', onPick: () => purgeFile(f.id) },
      ]);
      return;
    }
    openMenu(anchor, [
      { label: 'Preview', icon: 'eye', onPick: () => openPreview(f.id) },
      { label: 'Share', icon: 'share', onPick: () => openShare(f.id) },
      { label: 'Copy link', icon: 'link', onPick: () => copyLink(f) },
      { label: f.starred ? 'Remove star' : 'Add to Starred', icon: 'star', onPick: () => toggleStar(f.id) },
      { label: f.offline ? 'Remove from offline' : 'Keep offline', icon: 'cloud-download', onPick: () => toggleOffline(f.id) },
      { sep: true },
      { label: 'Rename', icon: 'pencil', onPick: () => renameFile(f) },
      { label: 'Download', icon: 'download', onPick: () => toast('Downloads need the desktop agent.') },
      { sep: true },
      { label: 'Move to Trash', icon: 'trash', onPick: () => moveToTrash(f.id) },
    ]);
  }

  function toggleOffline(id) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    f.offline = !f.offline;
    render(false);
    toast(f.offline ? 'Kept on this device' : 'Removed from this device');
  }

  function renameFile(f) {
    openPrompt({
      title: 'Rename', sub: '', value: f.name, ok: 'Save',
      onOk: (value) => {
        if (!value.trim()) return;
        f.name = value.trim();
        render(false);
        toast('Renamed');
      },
    });
  }

  async function copyLink(f) {
    const ok = await copyText('https://' + shareLink(f));
    toast(ok ? 'Link copied' : 'Copy failed, select the link instead');
  }

  function newFolder() {
    openPrompt({
      title: 'New folder', sub: state.section === 'sable' ? 'In Sable Coffee' : 'In Northwind Studio',
      value: 'Untitled folder', ok: 'Create',
      onOk: (value) => {
        const name = value.trim();
        if (!name) return;
        files.unshift({
          id: uid(), name, kind: 'folder', count: 0, size: 0, modified: new Date().toISOString(),
          owner: ME, shared: [], roles: {}, space: state.section === 'sable' ? 'sable' : 'northwind',
        });
        state.section = 'all';
        state.filter = 'all';
        state.query = '';
        $('#search').value = '';
        render(false);
        toast(`Folder "${name}" created`);
      },
    });
  }

  /* upload simulation */
  let uploadTimer = null;
  const KIND_BY_EXT = { png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', avif: 'image', tif: 'image', tiff: 'image', mov: 'video', mp4: 'video', webm: 'video', mkv: 'video', ai: 'design', fig: 'design', psd: 'design', sketch: 'design', pdf: 'doc', doc: 'doc', docx: 'doc', key: 'doc', md: 'doc', txt: 'doc', pages: 'doc', wav: 'audio', mp3: 'audio', aif: 'audio', zip: 'archive', rar: 'archive', '7z': 'archive' };

  function addUploads(fileList) {
    const picked = [...fileList];
    if (!picked.length) return;
    picked.forEach((file) => {
      const dot = file.name.lastIndexOf('.');
      const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '';
      const clean = dot > 0 ? file.name.slice(0, dot) : file.name;
      files.unshift({
        id: uid(), name: clean || file.name, kind: KIND_BY_EXT[ext] || 'doc', size: file.size,
        modified: new Date().toISOString(), owner: ME, shared: [], roles: {}, space: 'northwind',
        status: 'uploading', progress: 3,
      });
    });
    state.section = 'all';
    state.filter = 'all';
    state.query = '';
    $('#search').value = '';
    render(false);
    startUploadTimer();
    toast(`${picked.length} ${picked.length > 1 ? 'files' : 'file'} added`);
  }

  function paintProgress(f) {
    const bar = document.querySelector(`[data-tbar="${f.id}"]`);
    if (bar) bar.style.setProperty('--p', (f.status === 'pending' ? 1 : (f.progress || 0) / 100).toFixed(3));
    const pct = document.querySelector(`[data-tpct="${f.id}"]`);
    if (pct) pct.textContent = f.status === 'pending' ? 'Pending' : Math.round(f.progress || 0) + '%';
    const sub = document.querySelector(`[data-sub="${f.id}"]`);
    if (sub) sub.textContent = f.status === 'pending' ? 'Pending sync' : `Uploading ${Math.round(f.progress || 0)}%`;
  }

  function startUploadTimer() {
    if (uploadTimer) return;
    uploadTimer = setInterval(() => {
      const active = files.filter((f) => f.status === 'uploading');
      if (!active.length) {
        clearInterval(uploadTimer);
        uploadTimer = null;
        renderSync();
        return;
      }
      active.forEach((f) => {
        f.progress = Math.min(100, (f.progress || 0) + 5 + Math.random() * 9);
        if (f.progress >= 100) f.status = 'pending';
        paintProgress(f);
      });
      renderSync();
      if (!files.some((f) => f.status === 'uploading')) {
        clearInterval(uploadTimer);
        uploadTimer = null;
        toast('Saved locally. Sync needs the desktop agent.');
      }
    }, 320);
  }

  /* ── events ─────────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#menuLayer') && !(menuAnchor && menuAnchor.contains(e.target))) closeMenu();

    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) { setSection(navBtn.dataset.nav); return; }

    const tab = e.target.closest('[data-tab]');
    if (tab) { state.filter = tab.dataset.tab; render(); return; }

    const roleBtn = e.target.closest('[data-role]');
    if (roleBtn) { roleMenu(roleBtn, roleBtn.dataset.role); return; }

    const item = e.target.closest('.row,.card');
    if (item) {
      const f = (state.section === 'trash' ? trash : files).find((x) => x.id === item.dataset.id);
      if (!f) return;
      const act = e.target.closest('[data-act]');
      if (act) {
        e.stopPropagation();
        const name = act.dataset.act;
        if (name === 'star') { toggleStar(f.id); return; }
        if (name === 'menu') { rowMenu(act, f); return; }
        if (name === 'restore') { restoreFile(f.id); return; }
        if (name === 'purge') { purgeFile(f.id); return; }
      }
      openPreview(f.id);
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      $('#search').focus();
      $('#search').select();
      return;
    }
    if (e.key === 'Escape') { closeAll(); $('#search').blur(); return; }
    const row = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('row');
    if (row && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openPreview(document.activeElement.dataset.id);
    }
  });

  $('#search').addEventListener('input', (e) => { state.query = e.target.value; render(false); });

  $('#sortBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const anchor = e.currentTarget;
    const item = (key, label) => ({ label, icon: false, mark: state.sort === key, onPick: () => { state.sort = key; render(); } });
    openMenu(anchor, [
      item('modified', 'Modified'),
      item('name', 'Name'),
      item('size', 'Size'),
      { sep: true },
      { label: 'Reverse order', icon: false, mark: state.dir === 'asc', onPick: () => { state.dir = state.dir === 'desc' ? 'asc' : 'desc'; render(); } },
    ]);
  });

  $('#viewList').addEventListener('click', () => { state.layout = 'list'; render(); });
  $('#viewGrid').addEventListener('click', () => { state.layout = 'grid'; render(); });
  $('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
  $('#newFolderBtn').addEventListener('click', newFolder);
  $('#fileInput').addEventListener('change', (e) => { addUploads(e.target.files); e.target.value = ''; });
  $('#emptyTrashBtn').addEventListener('click', () => {
    openPrompt({
      title: 'Empty trash?', sub: `${trash.length} ${trash.length > 1 ? 'items' : 'item'} will be deleted forever.`, input: false, ok: 'Empty',
      onOk: () => { trash = []; render(false); toast('Trash emptied'); },
    });
  });
  $('#reclaimBtn').addEventListener('click', () => setSection('large'));
  $('#storageBtn').addEventListener('click', () => setSection('large'));
  $('#settingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu(e.currentTarget, [
      { label: 'Compact rows', icon: 'list', mark: state.compact, onPick: () => { state.compact = !state.compact; render(false); toast(state.compact ? 'Compact rows on' : 'Compact rows off'); } },
      { label: 'Reduce motion', icon: 'wind', mark: state.calm, onPick: () => { state.calm = !state.calm; document.body.classList.toggle('calm', state.calm); toast(state.calm ? 'Motion reduced' : 'Motion restored'); } },
    ]);
  });
  $('#bellBtn').addEventListener('click', () => toast('No new activity'));
  $('#emptyBtn').addEventListener('click', () => { state.query = ''; state.filter = 'all'; $('#search').value = ''; render(); });

  /* preview actions */
  $('#previewScrim').addEventListener('click', (e) => { if (e.target.id === 'previewScrim') closeScrim(e.currentTarget); });
  $('#shareScrim').addEventListener('click', (e) => { if (e.target.id === 'shareScrim') closeScrim(e.currentTarget); });
  $('#promptScrim').addEventListener('click', (e) => { if (e.target.id === 'promptScrim') closeScrim(e.currentTarget); });
  $$('[data-close]').forEach((b) => b.addEventListener('click', (e) => closeScrim(e.target.closest('.scrim'))));

  $('#pvCopy').addEventListener('click', () => { const f = files.find((x) => x.id === previewId); if (f) copyLink(f); });
  $('#pvShareBtn').addEventListener('click', () => { const id = previewId; closeScrim($('#previewScrim')); setTimeout(() => openShare(id), 240); });
  $('#pvStar').addEventListener('click', () => {
    const f = files.find((x) => x.id === previewId);
    if (!f) return;
    f.starred = !f.starred;
    paintStar();
    render(false);
    toast(f.starred ? 'Added to Starred' : 'Removed from Starred');
  });

  /* share actions */
  $('#inviteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#inviteEmail');
    const email = input.value.trim();
    const f = files.find((x) => x.id === shareId);
    if (!email || !f) return;
    const id = 'p' + Math.random().toString(36).slice(2, 7);
    PEOPLE[id] = { name: email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), img: `https://i.pravatar.cc/72?u=${encodeURIComponent(email)}` };
    if (!f.shared.includes(id)) f.shared.push(id);
    f.roles[id] = 'Editor';
    input.value = '';
    renderPeople();
    render(false);
    toast(`Added ${email}`);
  });
  $('#copyLinkBtn').addEventListener('click', () => { const f = files.find((x) => x.id === shareId); if (f) copyLink(f); });

  /* prompt actions */
  $('#pmCancel').addEventListener('click', () => closeScrim($('#promptScrim')));
  $('#pmOk').addEventListener('click', () => {
    const value = $('#pmInput').value;
    const handler = promptHandler;
    closeScrim($('#promptScrim'));
    promptHandler = null;
    if (handler) handler(value);
  });
  $('#pmInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#pmOk').click(); } });

  window.addEventListener('resize', closeMenu);
  $('#filesBody').addEventListener('scroll', () => { if (menuOpen) closeMenu(); }, { passive: true });

  /* initial paint */
  $('#peopleStack').innerHTML = ['jonas', 'ines', 'kenji'].map((id) => `<img class="avatar" src="${PEOPLE[id].img}" alt="${esc(PEOPLE[id].name)}" title="${esc(PEOPLE[id].name)}">`).join('');
  render();
  window.addEventListener('load', () => {
    // keep the first paint in sync when fonts arrive late
    document.body.classList.add('is-ready');
  });
})();
