(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name) => '<i class="ti ti-' + esc(name) + '" aria-hidden="true"></i>';
  const { initialMessages, contacts, materials } = window.RhodesData;
  const storeKey = 'rhodes-mail-v2';
  const folderNames = {inbox:['收件箱','INBOX'],starred:['星标邮件','STARRED'],snoozed:['稍后处理','SNOOZED'],sent:['发件箱','OUTBOX'],drafts:['草稿箱','DRAFTS'],archive:['已归档','ARCHIVE'],trash:['回收站','RECYCLE']};
  const defaultLabels = [{id:'action',name:'行动待办'},{id:'reference',name:'资料归档'},{id:'personal',name:'私人通讯'}];
  /* Rule: UI 原型刷新即清零 — 不从 localStorage 读取业务数据，写入即刻清空 */
  try { localStorage.removeItem(storeKey); localStorage.removeItem('rhodes-mail-v1'); } catch {}
  try { indexedDB.deleteDatabase('rhodes-mail-attachments'); } catch {}
  try { sessionStorage.removeItem('rhodes-booted'); } catch {}
  try {
    if (window.caches?.keys) caches.keys().then((keys) => Promise.all(keys.filter((key) => /rhodes|mail/i.test(key)).map((key) => caches.delete(key)))).catch(() => {});
  } catch {}
  let messages = structuredClone(initialMessages);
  let labels = structuredClone(defaultLabels);
  let settings = { motion:true, compact:false, largeReading:false, signature:'博士\n罗德岛 / 行动指挥' };
  let tasks = { equipment:true, medical:false, specimen:false };
  let deployment = {confirmed:false,at:null};
  messages.forEach((mail) => {
    mail.labels = Array.isArray(mail.labels) ? mail.labels.filter((id) => labels.some((l) => l.id === id)) : mail.featured ? ['action'] : mail.sender === '调香师' ? ['personal'] : [];
    mail.unread = Boolean(mail.unread); mail.starred = Boolean(mail.starred);
  });
  if (!Object.values(tasks).every(Boolean)) deployment = {confirmed:false,at:null};
  const state = { folder:'inbox', group:null, label:null, filter:'all', query:'', ascending:false, selected:null, checked:new Set(), unreadSession:[], advanced:{from:'',after:'',before:'',priority:false,starred:false} };
  const canvasViews = new Map();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let inputMethod = 'pointer', readerAnimation, readerRendered = false, toastTimer, undoAction;
  let draftId = null, parentId = null, composeFiles = [], draftTimer, readingFiles = 0, composeSession = 0;
  let previewUrl = null, infoVersion = 0;
  const closing = new WeakSet();
  const uid = (prefix) => prefix + '-' + (crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2,7));
  const current = () => messages.find((m) => m.id === state.selected);
  const timeString = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,19); };
  const sizeString = (n) => n >= 1048576 ? (n/1048576).toFixed(1)+' MB' : n >= 1024 ? (n/1024).toFixed(1)+' KB' : n+' B';
  const fileSize = (file) => file.size ?? new Blob([file.content || '']).size;
  const emailList = (value) => value.split(/[,，;；\n]+/).map((v) => v.trim()).filter(Boolean);
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const hasAdvanced = () => Object.values(state.advanced).some(Boolean);

  function toast(message, undo = null) {
    clearTimeout(toastTimer);
    const el = $('#toast');
    if (el.showPopover) { if (el.matches(':popover-open')) el.hidePopover(); el.showPopover(); }
    $('#toast-text').textContent = message; $('#toast-undo').hidden = !undo; undoAction = undo;
    el.classList.add('visible');
    toastTimer = setTimeout(() => {
      el.classList.remove('visible'); undoAction = null;
      setTimeout(() => { if (!el.classList.contains('visible')) el.hidePopover?.(); },250);
    }, undo ? 8000 : 4500);
  }
  function persist(notify = false) {
    /* Rule: UI 原型刷新即清零 — 不把业务数据写入 localStorage，仅保留内存 */
    return false;
  }
  function applySettings() {
    document.body.classList.toggle('no-motion', !settings.motion);
    document.body.classList.toggle('compact', settings.compact);
    document.body.classList.toggle('large-reading', settings.largeReading);
    if (!settings.motion) readerAnimation?.cancel();
  }
  const emblemGlyphs = {
    'command':          'M9 4L4 9v10l5 5h10l5-5V9l-5-5H9z',
    'snowflake':        'M9 4L4 9v10l5 5h10l5-5V9l-5-5H9z',
    'medical':          'M11 2h6v6h6v6h-6v6h-6v-6H5V8h6z',
    'logistics':        'M8 2L4 6v16l4 4h16l4-4V6l-4-4H8z',
    'package':          'M8 2L4 6v16l4 4h16l4-4V6l-4-4H8z',
    'engineering':      'M6 4h16v16H6z',
    'cube':             'M6 4h16v16H6z',
    'system':           'M7 4h14l3 7-3 9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V11z',
    'cpu':              'M7 4h14l3 7-3 9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V11z',
    'personal':         'M14 2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
    'ring':             'M14 2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
    'plant-2':          'M12 3l3 5h5l-4 3 2 5-4-3v-2l-2 2-2-2v-1l-2-1z',
    'medical-cross':    'M11 2h6v6h6v6h-6v6h-6v-6H5V8h6z',
    'shield':           'M12 2L4 6v10c0 5 5 9 8 9s8-4 8-9V6z',
    'flower':           'M12 6a6 6 0 0 1 6 6 6 6 0 0 1-12 0 6 6 0 0 1 6-6z',
    'clipboard-list':   'M6 4h12v2H6zm2 4h8v12H8z',
    'file-pencil':      'M10 3h4l4 4v12H6V7l4-4z',
    'tool':             'M11 2h6v6h6l-8 8-8-8h6z',
    'default':          'M12 3L4 9v12h16L20 9z',
  };
  function emblem(source) {
    const mark = source?.emblem || source?.mark || source?.role || source?.group;
    let glyphKey = mark;
    if (mark === '行动指挥') glyphKey = 'command';
    else if (mark === '医疗部门') glyphKey = 'medical';
    else if (mark === '后勤保障') glyphKey = 'logistics';
    const glyph = emblemGlyphs[glyphKey] || emblemGlyphs['default'];
    const gap = 'M23 6L21.3 7.7L21 8l-1.3-1.3 1.3-1.3z';
    return '<svg viewBox="0 0 28 28" aria-hidden="true" class="emblem"><polygon points="15 2 23 6 23 16 15 22 7 16 7 6" fill="none" stroke="currentColor" stroke-width="1.3" class="emblem-frame"/><path d="'+glyph+'" fill="currentColor" class="emblem-glyph"/><path d="'+gap+'" fill="none" stroke="var(--accent)" stroke-width="1.1" class="emblem-gap"/></svg>';
  }
  function visibleMessages(ignoreFilter = false) {
    const a = state.advanced;
    return messages.filter((m) => {
      let matches = state.query ? m.folder !== 'trash' : state.label ? m.folder !== 'trash' && m.labels.includes(state.label) : state.group ? m.folder === 'inbox' && m.role === state.group : state.folder === 'starred' ? m.starred && m.folder !== 'trash' : m.folder === state.folder;
      if (!matches) return false;
      if (!ignoreFilter && state.filter === 'unread' && !m.unread && !state.unreadSession.includes(m.id)) return false;
      if (!ignoreFilter && state.filter === 'attachment' && !m.attachments.length) return false;
      if (a.from && ![m.sender,m.email,m.to].join(' ').toLowerCase().includes(a.from.toLowerCase())) return false;
      if (a.after && m.date.slice(0,10) < a.after) return false;
      if (a.before && m.date.slice(0,10) > a.before) return false;
      if (a.priority && !m.priority || a.starred && !m.starred) return false;
      const text = [m.sender,m.email,m.to,m.subject,m.role,...m.paragraphs,...m.labels.map((id) => labels.find((l) => l.id === id)?.name || '')].join(' ').toLowerCase();
      return !state.query || state.query.toLowerCase().split(/\s+/).every((word) => text.includes(word));
    }).sort((a,b) => state.ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }
  function mountArt() {
    canvasViews.forEach((view,canvas) => { if (!canvas.isConnected) { view.destroy(); canvasViews.delete(canvas); } });
    $$('canvas[data-specimen]').forEach((canvas) => {
      if (!canvasViews.has(canvas)) canvasViews.set(canvas,new window.SpecimenView(canvas,{interactive:canvas.dataset.specimen === 'interactive'}));
    });
  }
  function renderNav() {
    $$('[data-count]').forEach((el) => {
      const folder = el.dataset.count;
      const count = messages.filter((m) => folder === 'starred' ? m.starred && m.folder !== 'trash' : m.folder === folder).length;
      el.textContent = count || '';
    });
    $('#label-nav').innerHTML = labels.map((l) => '<button class="nav-item" data-label-filter="'+esc(l.id)+'" title="'+esc(l.name)+'"><span class="label-dot"></span><span>'+esc(l.name)+'</span></button>').join('');
    $$('.nav-item').forEach((el) => {
      const active = !state.query && (state.label ? el.dataset.labelFilter === state.label : state.group ? el.dataset.group === state.group : el.dataset.folder === state.folder);
      el.classList.toggle('active',active);
      if (active) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
    });
  }
  function renderList() {
    const focus = document.activeElement;
    const restore = focus?.dataset.select ? ['select',focus.dataset.select] : focus?.dataset.open ? ['open',focus.dataset.open] : focus?.dataset.star && focus.closest('#mail-list') ? ['star',focus.dataset.star] : null;
    const list = visibleMessages();
    const ids = new Set(list.map((m) => m.id));
    state.checked.forEach((id) => { if (!ids.has(id)) state.checked.delete(id); });
    const heading = state.query ? ['搜索结果','SEARCH'] : state.label ? [labels.find((l) => l.id === state.label)?.name || '标签','LABEL'] : state.group ? [state.group,'CHANNEL'] : folderNames[state.folder];
    $('#folder-title').textContent = heading[0]; $('#folder-code').textContent = heading[1]; $('#folder-total').textContent = String(list.length).padStart(2,'0');
    $('#unread-count').textContent = visibleMessages(true).filter((m) => m.unread).length;
    $('#list-summary').textContent = list.length+' 封通讯';
    $$('.filter').forEach((b) => { b.classList.toggle('active',b.dataset.filter === state.filter); b.setAttribute('aria-pressed',String(b.dataset.filter === state.filter)); });
    const total = state.checked.size;
    $('#selection-label').textContent = total ? '已选择 '+total+' 封' : '选择邮件';
    $('#select-all').checked = list.length > 0 && total === list.length; $('#select-all').indeterminate = total > 0 && total < list.length; $('#select-all').disabled = !list.length;
    $('#batch-toolbar').hidden = !total; $('#clear-selection').hidden = !total;
    $('#active-filters').hidden = !hasAdvanced();
    $('#active-filters').innerHTML = '<span>已启用高级筛选</span><button data-clear-filters>清除</button>';
    let date = '';
    $('#mail-list').innerHTML = list.length ? list.map((m) => {
      const group = date !== m.date.slice(0,10) ? '<div class="date-group">'+esc(m.date.slice(0,10).replace(/-/g,'.'))+'</div>' : '';
      date = m.date.slice(0,10);
      return group+'<article class="mail-row'+(m.id === state.selected ? ' selected' : '')+(m.unread ? ' unread' : '')+(settings.motion && !reduce.matches ? ' stagger' : '')+'"><button class="mail-open" data-open="'+esc(m.id)+'" aria-label="'+esc((m.unread?'未读，':'')+m.sender+'：'+m.subject)+'" aria-current="'+(m.id === state.selected)+'"></button><label class="row-check"><input type="checkbox" data-select="'+esc(m.id)+'" aria-label="选择 '+esc(m.subject)+'" '+(state.checked.has(m.id)?'checked':'')+'></label><div class="mail-row-top">'+(m.unread?'<span class="unread-dot"></span>':'')+'<span class="mail-sender">'+esc(m.sender)+'</span><time class="mail-time" datetime="'+esc(m.date)+'">'+esc(m.date.slice(11,16))+'</time><button class="row-star'+(m.starred?' starred':'')+'" data-star="'+esc(m.id)+'" aria-label="'+(m.starred?'取消星标':'添加星标')+'" aria-pressed="'+m.starred+'">'+icon(m.starred?'star-filled':'star')+'</button></div><h3>'+esc(m.subject || '无主题')+'</h3><p>'+esc(m.preview || m.paragraphs.join(' '))+'</p><div class="mail-row-tags"><span class="mail-tag">'+esc(m.folder === 'drafts'?'草稿':m.folder === 'sent'?'待发送':m.folder === 'snoozed'?'稍后提醒':m.role || '个人通讯')+'</span>'+m.labels.slice(0,1).map((id) => '<span class="mail-tag">'+esc(labels.find((l) => l.id === id)?.name || '')+'</span>').join('')+(m.priority?'<span class="mail-tag">优先</span>':'')+(m.attachments.length?icon('paperclip'):'')+'</div></article>';
    }).join('') : '<div class="empty-state">'+icon('inbox')+'<h2>'+(state.query?'没有匹配的通讯':'这里暂时没有通讯')+'</h2><p>'+(state.filter === 'unread'?'全部读完了，休息一下吧。':'新的讯息，会在这里与你相遇。')+'</p>'+((state.query || hasAdvanced() || state.filter !== 'all')?'<button class="secondary-button" data-clear-filters>清除筛选</button>':'')+'</div>';
    renderNav(); updatePosition();
    if (restore) $$('[data-'+restore[0]+']',$('#mail-list')).find((el) => el.dataset[restore[0]] === restore[1])?.focus({preventScroll:true});
  }
  function updatePosition() {
    const list = visibleMessages(), index = list.findIndex((m) => m.id === state.selected);
    $('#mail-position').textContent = (index+1)+' / '+list.length;
    $('#prev-mail').disabled = index <= 0; $('#next-mail').disabled = index < 0 || index === list.length-1;
  }
  function renderReader(preserveScroll = false) {
    const scroll = $('#reader-scroll').scrollTop;
    const focusedStar = document.activeElement.closest('#mail-content')?.contains(document.activeElement) && document.activeElement.dataset.star;
    const m = current();
    readerAnimation?.cancel();
    $$('[data-action]').forEach((b) => { b.disabled = !m; });
    $('#reply-button').disabled = !m; $('#forward-button').disabled = !m; $('#reader-bottom').hidden = !m;
    if (!m) {
      $('#reader-category').textContent = '待阅';
      $('#mail-content').innerHTML = '<div class="empty-state">'+icon('mail-opened')+'<h2>信号所至，同路前行。</h2><p>选择一封通讯，继续与你的同伴保持联络。</p></div>';
      mountArt(); return;
    }
    $('#reader-category').textContent = m.role || '个人通讯';
    const featured = m.featured ? '<section class="briefing" aria-label="龙门停靠行动简报"><span class="hud-bracket corner"></span><span class="hud-bracket"></span><div class="briefing-copy"><div class="briefing-overline">OPERATION / LM-1097</div><h3>下一站，龙门。</h3><p class="briefing-title">LUNGMEN</p><div class="briefing-route">'+icon('navigation')+'<span>东侧停靠区 / <strong data-deployment-status>'+deploymentStatus()+'</strong></span></div></div><button class="specimen-button" data-material="originium" aria-label="检视源石晶簇"><canvas data-specimen="static" aria-hidden="true"></canvas><span class="specimen-hint">'+icon('cube-3d-sphere')+'检视源石</span></button><div class="briefing-foot"><span>RHODES ISLAND</span><span>FIELD BRIEFING</span></div></section>' : '';
    const details = m.featured ? '<div class="operation-details"><div><span>预计停靠</span><strong><time>10.15 / 08:30</time></strong></div><div><span>集合地点</span><strong>第三甲板 / 东侧舷梯</strong></div></div>' : '';
    let notice = '';
    if (m.folder === 'sent') notice = '<div class="mail-notice"><span>已加入发件箱，等待连接邮件服务</span><button data-edit-current>编辑</button></div>';
    if (m.folder === 'snoozed') notice = '<div class="mail-notice"><span>提醒时间：'+esc(new Date(m.snoozeUntil).toLocaleString('zh-CN',{hour12:false}))+'</span><button data-restore-current>立即恢复</button></div>';
    if (m.folder === 'trash') notice = '<div class="mail-notice"><span>这封通讯位于回收站</span><button data-restore-current>恢复通讯</button><button data-delete-current>永久删除</button></div>';
    const replies = messages.filter((reply) => reply.parentId === m.id && reply.folder !== 'trash').sort((a,b) => a.date.localeCompare(b.date));
    $('#mail-content').innerHTML = '<div class="subject-topline">'+(m.priority?'<span class="priority-flag">'+icon('flag')+'优先通讯</span>':'<span>内部通讯</span>')+'<span class="message-code">'+esc(m.id.startsWith('ri-')?m.id.toUpperCase():'R.I. / PERSONAL')+'</span></div><div class="subject-row"><h2>'+esc(m.subject || '无主题')+'</h2><button class="icon-button reader-star'+(m.starred?' starred':'')+'" data-star="'+esc(m.id)+'" aria-label="'+(m.starred?'取消星标':'添加星标')+'" aria-pressed="'+m.starred+'">'+icon(m.starred?'star-filled':'star')+'</button></div>'+(m.labels.length?'<div class="message-labels">'+m.labels.map((id) => '<button class="message-label" data-label-filter="'+esc(id)+'">'+icon('tag')+esc(labels.find((l) => l.id === id)?.name || '')+'</button>').join('')+'</div>':'')+'<div class="sender-detail"><span class="sender-emblem">'+emblem(m)+'</span><div class="sender-info"><div class="sender-name">'+esc(m.sender)+'<span>&lt;'+esc(m.email)+'&gt;</span></div><div class="sender-recipient">发送至 '+esc(m.to || '博士 <doctor@rhodes.is>')+(m.cc?'<br>抄送 '+esc(m.cc):'')+'</div></div><time class="sender-date" datetime="'+esc(m.date)+'">'+esc(m.date.slice(0,10).replace(/-/g,'.'))+'<br>'+esc(m.date.slice(11,16))+'</time></div>'+notice+featured+'<div class="mail-body">'+m.paragraphs.map((paragraph,index) => '<p>'+esc(paragraph).replace(/\n/g,'<br>')+'</p>'+(index === 1?details:'')).join('')+'</div>'+(m.signature?'<div class="mail-signature">'+esc(m.signature)+'</div>':'')+(m.attachments.length?'<div class="attachment-heading">'+icon('paperclip')+m.attachments.length+' 个附件</div><div class="attachments">'+m.attachments.map((file,index) => '<button class="attachment" data-attachment="'+index+'">'+icon(file.type?.startsWith('image/')?'photo':'file-text')+'<span><b>'+esc(file.name)+'</b><small>'+esc(file.name.split('.').pop().toUpperCase())+' / '+sizeString(fileSize(file))+'</small></span>'+icon('arrow-up-right')+'</button>').join('')+'</div>':'')+(replies.length?'<section class="thread-section"><h3>相关通讯 / '+replies.length+'</h3>'+replies.map((r) => '<div class="thread-entry"><div><strong>博士 · '+(r.folder === 'drafts'?'草稿':'待发送')+'</strong><time>'+esc(r.date.slice(5,16).replace('T',' '))+'</time></div><p>'+esc(r.paragraphs.join('\n\n'))+'</p><button class="text-button" data-open-related="'+esc(r.id)+'">查看通讯</button></div>').join('')+'</section>':'');
    const editable = ['drafts','sent'].includes(m.folder);
    $('#reply-button').innerHTML = icon(editable?'pencil':'arrow-back-up')+(editable?'继续编辑':'回复通讯');
    $('#forward-button').hidden = editable;
    $('[data-action="archive"]').title = ['archive','trash','snoozed'].includes(m.folder)?'恢复通讯':'归档';
    $('[data-action="archive"]').setAttribute('aria-label',$('[data-action="archive"]').title);
    $('[data-action="archive"]').innerHTML = icon(['archive','trash','snoozed'].includes(m.folder)?'inbox':'archive');
    $('[data-action="read"]').title = m.unread?'标为已读':'标为未读';
    $('[data-action="read"]').setAttribute('aria-label',$('[data-action="read"]').title);
    $('[data-action="read"]').innerHTML = icon(m.unread?'mail-opened':'mail');
    $('[data-action="snooze"]').disabled = ['drafts','sent','trash'].includes(m.folder);
    $('[data-action="trash"]').title = m.folder === 'trash'?'永久删除':'移至回收站';
    if (focusedStar) $('.reader-star')?.focus({preventScroll:true});
    $('#reader-scroll').scrollTop = preserveScroll?scroll:0;
    if (readerRendered && settings.motion && !reduce.matches && inputMethod !== 'keyboard' && !preserveScroll) readerAnimation = $('#mail-content').animate([{opacity:.55},{opacity:1}],{duration:160,easing:'cubic-bezier(.23,1,.32,1)'});
    readerRendered = true; updatePosition(); mountArt();
  }
  function dossierMarkup() {
    const count = Object.values(tasks).filter(Boolean).length;
    return '<header class="dossier-header"><span>行动档案</span><span>LM-1097</span></header><div class="dossier-summary"><span class="hud-bracket corner"></span><span class="hud-bracket"></span><span class="outline-number" aria-hidden="true">03</span><p class="dossier-code">NEXT DESTINATION</p><h2>龙门停靠</h2><p>罗德岛 / 第三甲板</p><svg class="carrier-diagram" aria-label="原创舰船装载位置图"><use href="#carrier-plan"/></svg><div class="dossier-meta"><span>10.15 / 08:30</span><span data-deployment-status>'+deploymentStatus()+'</span></div><div class="diagonal-rule"></div></div><section class="dossier-block"><div class="dossier-block-heading"><h3>出发前检查</h3><span data-task-count>'+count+' / 3</span></div><div class="task-list">'+[{id:'equipment',name:'外勤装备检查',code:'OPERATIONS'},{id:'medical',name:'医疗物资复核',code:'MEDICAL'},{id:'specimen',name:'源石封装交接',code:'ENGINEERING'}].map((t) => '<label class="task-item'+(tasks[t.id]?' done':'')+'"><input type="checkbox" data-task="'+t.id+'" '+(tasks[t.id]?'checked':'')+'><span>'+t.name+'<small>'+t.code+'</small></span></label>').join('')+'</div><button class="deployment-button'+(deployment.confirmed?' confirmed':'')+'" data-confirm-deployment '+(!Object.values(tasks).every(Boolean)||deployment.confirmed?'disabled':'')+'>'+icon(deployment.confirmed?'shield-check':'checklist')+(deployment.confirmed?'部署已确认':'确认部署')+'</button></section><section class="dossier-block"><div class="dossier-block-heading"><h3>随行物资</h3><span>03</span></div><button class="material-card" data-material="originium" aria-label="检视源石封装样本"><span class="material-quantity">12<small>枚</small></span><canvas data-specimen="static" aria-hidden="true"></canvas><span class="material-caption"><strong>源石封装样本</strong><small>ORIGINIUM / RI-041</small></span>'+icon('arrow-up-right')+'</button><div class="mini-materials">'+materials.slice(1).map((m) => '<button class="mini-material" data-material="'+m.id+'"><svg aria-hidden="true"><use href="#'+(m.id === 'case'?'cargo-mark':'record-mark')+'"/></svg><span>'+m.name+'<small>'+m.reference+'</small></span><b>'+String(m.quantity).padStart(2,'0')+'</b></button>').join('')+'</div></section><div class="dossier-footer"><svg aria-hidden="true"><use href="#post-mark"/></svg><p>RHODES ISLAND<br>EVER FORWARD.</p></div>';
  }
  function deploymentStatus() { return deployment.confirmed?'部署已确认':Object.values(tasks).every(Boolean)?'待确认部署':'准备中'; }
  function syncDeployment() {
    const ready=Object.values(tasks).every(Boolean);
    if(!ready)deployment={confirmed:false,at:null};
    $('[data-deployment-status]').forEach((el)=>{el.textContent=deploymentStatus();});
    $('[data-confirm-deployment]').forEach((el)=>{
      el.disabled=!ready||deployment.confirmed;el.classList.toggle('confirmed',deployment.confirmed);
      el.innerHTML=icon(deployment.confirmed?'shield-check':'checklist')+(deployment.confirmed?'部署已确认':'确认部署');
    });
  }
  function confirmDeployment() {
    if(!Object.values(tasks).every(Boolean))return;
    showInfo('确认行动部署','<p>外勤装备、医疗物资与源石封装均已检查。确认后，行动档案将记录本次部署状态。</p><div class="form-actions"><button class="secondary-button" data-close="info-dialog">返回检查</button><button class="primary-button" id="approve-deployment">确认部署</button></div>');
    $('#approve-deployment').onclick=()=>{
      deployment={confirmed:true,at:new Date().toISOString()};syncDeployment();const saved=persist();closeDialog($('#info-dialog'));
      toast(saved?'部署记录已保存':'部署记录已更新，仅保留在当前会话');
    };
  }
  function refresh(preserveScroll = false) {
    const list = visibleMessages();
    if (!list.some((m) => m.id === state.selected)) state.selected = list[0]?.id || null;
    renderList(); renderReader(preserveScroll);
  }
  function clearFilters() { state.query='';state.filter='all';state.unreadSession=[];state.advanced={from:'',after:'',before:'',priority:false,starred:false};$('#search').value='';state.checked.clear();refresh(); }
  function switchView(folder='inbox',group=null,label=null) {
    state.folder=folder;state.group=group;state.label=label;state.selected=null;state.checked.clear();
    $('#terminal').classList.remove('reading','focus-mode');$('#focus-button').setAttribute('aria-pressed','false');clearFilters();
  }
  function select(id, mobile=true) {
    const m = messages.find((item) => item.id === id); if (!m) return;
    state.selected=id;
    if (m.unread) {m.unread=false;persist();}
    renderList();renderReader();
    if (mobile) $('#terminal').classList.add('reading');
  }
  function navigate(direction) { const list=visibleMessages(),index=list.findIndex((m)=>m.id===state.selected);if(list[index+direction]) select(list[index+direction].id); }
  function toggleStar(id) {const m=messages.find((item)=>item.id===id);if(m){m.starred=!m.starred;persist(true);refresh(true);}}
  function updateMany(ids, changes, message) {
    const originals = [];
    messages.forEach((m) => {
      if (!ids.includes(m.id)) return;
      const patch = typeof changes==='function'?changes(m):changes;
      originals.push({id:m.id,values:Object.fromEntries(Object.keys(patch).map((key)=>[key,structuredClone(m[key] ?? null)]))});
      Object.assign(m,patch);
    });
    state.checked.clear(); const saved=persist(true);refresh(true);
    if (!current()) $('#terminal').classList.remove('reading');
    toast(message+(saved?'':'（仅当前会话）'),()=>{
      originals.forEach((entry)=>{const m=messages.find((item)=>item.id===entry.id);if(m)Object.assign(m,entry.values);});
      persist(true);refresh(true);toast('已撤销操作');
    });
  }
  function move(ids,target) {
    if (!ids.length) return;
    if (target==='trash' && ids.every((id)=>messages.find((m)=>m.id===id)?.folder==='trash')) {confirmDelete(ids);return;}
    updateMany(ids,(m)=>{
      if (target==='restore') return {folder:m.previousFolder && !['trash','snoozed','starred'].includes(m.previousFolder)?m.previousFolder:'inbox',snoozeUntil:null,previousFolder:null};
      return {folder:target,previousFolder:m.folder === target?m.previousFolder:m.folder,snoozeUntil:null};
    },target==='trash'?'通讯已移至回收站':target==='restore'?'通讯已恢复':'通讯已归档');
  }
  function confirmDelete(ids) {
    showInfo('永久删除通讯','<p>将永久删除 '+ids.length+' 封通讯。此操作无法撤销。</p><div class="form-actions"><button class="secondary-button" data-close="info-dialog">取消</button><button class="primary-button" id="confirm-delete">永久删除</button></div>');
    $('#confirm-delete').onclick=()=>{
      const blobs=messages.filter((m)=>ids.includes(m.id)).flatMap((m)=>m.attachments.map((f)=>f.blobId).filter(Boolean));
      messages=messages.filter((m)=>!ids.includes(m.id));state.checked.clear();const saved=persist(true);
      if(saved)pruneFiles(blobs);
      closeDialog($('#info-dialog'));refresh();toast(saved?'通讯已永久删除':'当前会话已删除，浏览器未能保存更改');
    };
  }
  function openDialog(dialog) {
    if (closing.has(dialog)) return;
    if (!dialog.open) dialog.showModal();
    if (inputMethod==='keyboard' || !settings.motion || reduce.matches) dialog.classList.add('visible');
    else requestAnimationFrame(()=>{if(dialog.open)dialog.classList.add('visible');});
  }
  function closeDialog(dialog,save=true) {
    if (!dialog?.open || closing.has(dialog)) return;
    if (dialog.id==='compose-dialog') {
      if(readingFiles){toast('附件正在保存，请稍候');return;}
      clearTimeout(draftTimer);if(save)saveDraft(false);composeSession++;
    }
    if(dialog.id==='info-dialog')infoVersion++;
    closing.add(dialog);dialog.classList.remove('visible');
    setTimeout(()=>{
      dialog.close();closing.delete(dialog);
      if(dialog.id==='info-dialog'){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}$('#info-content').innerHTML='';}
      if(dialog.id==='material-dialog')$('#material-content').innerHTML='';
      mountArt();
    },inputMethod==='keyboard'||!settings.motion||reduce.matches?0:200);
  }
  function showInfo(title,content) {
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
    infoVersion++;$('#info-title').textContent=title;$('#info-content').innerHTML=content;openDialog($('#info-dialog'));mountArt();return infoVersion;
  }

  // File contents live in IndexedDB; mail metadata remains small in localStorage.
  let dbPromise;
  function attachmentDB() {
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open('rhodes-mail-attachments',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('files');
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('附件存储被其他窗口占用'));
    }).catch((error)=>{dbPromise=null;throw error;});
    return dbPromise;
  }
  async function putFile(file) {
    const db=await attachmentDB(),id=uid('file');
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
    return {blobId:id,name:file.name,type:file.type||'application/octet-stream',size:file.size};
  }
  async function getFile(file) {
    if(file.blobId){
      const db=await attachmentDB();
      return new Promise((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(file.blobId);request.onsuccess=()=>request.result?resolve(request.result):reject(new Error('未找到附件内容，请重新附加文件'));request.onerror=()=>reject(request.error);});
    }
    if(file.unavailable)throw new Error('旧版只保留了文件名，请重新附加原文件');
    return new Blob([file.content||''],{type:file.type||'text/plain'});
  }
  async function pruneFiles(ids) {
    const referenced=new Set(messages.flatMap((m)=>m.attachments.map((f)=>f.blobId)));
    if($('#compose-dialog').open)composeFiles.forEach((f)=>referenced.add(f.blobId));
    const unused=[...new Set(ids)].filter((id)=>id&&!referenced.has(id));
    if(!unused.length)return;
    try{
      const db=await attachmentDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('files','readwrite');unused.forEach((id)=>tx.objectStore('files').delete(id));
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
      });
    }catch{ /* Mail deletion remains valid if the browser cannot reclaim attachment space. */ }
  }
  function bytesBase64(bytes) {
    let binary='';
    for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(binary);
  }
  async function exportCurrentMail() {
    const mail=structuredClone(current());if(!mail)return;
    const button=$('[data-action="export"]');button.disabled=true;
    try{
      const encode=(value)=>bytesBase64(new TextEncoder().encode(value));
      const encodedHeader=(value)=>'=?UTF-8?B?'+encode(String(value).replace(/[\\r\\n]/g,' '))+'?=';
      const safe=(value)=>String(value||'').replace(/[\\r\\n]/g,' ');
      const wrap=(value)=>(value.match(/.{1,76}/g)||['']).join('\\r\\n');
      const boundary=uid('rhodes');
      const lines=['MIME-Version: 1.0','From: '+encodedHeader(mail.sender)+' <'+safe(mail.email)+'>','To: '+safe(mail.to||'doctor@rhodes.is'),'Subject: '+encodedHeader(mail.subject||'无主题'),'Date: '+new Date(mail.date).toUTCString()];
      if(mail.cc)lines.push('Cc: '+safe(mail.cc));
      lines.push('Content-Type: multipart/mixed; boundary="'+boundary+'"','','--'+boundary,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',wrap(encode(mail.paragraphs.join('\\n\\n'))));
      for(const file of mail.attachments){
        const blob=await getFile(file);
        lines.push('--'+boundary,'Content-Type: '+safe(blob.type||'application/octet-stream'),'Content-Disposition: attachment; filename*=UTF-8\'\''+encodeURIComponent(file.name),'Content-Transfer-Encoding: base64','',wrap(bytesBase64(new Uint8Array(await blob.arrayBuffer()))));
      }
      lines.push('--'+boundary+'--','');
      const url=URL.createObjectURL(new Blob([lines.join('\\r\\n')],{type:'message/rfc822'}));
      const link=document.createElement('a');link.href=url;link.download='通讯-'+mail.id+'.eml';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){toast('导出失败：'+(error.message||'附件不可用'));}
    finally{button.disabled=!current();}
  }
  async function openAttachment(index) {
    const file=current()?.attachments[index];if(!file)return;
    const version=showInfo('附件详情','<p>正在读取附件…</p>');
    try{
      const blob=await getFile(file);
      if(infoVersion!==version||!$('#info-dialog').open||closing.has($('#info-dialog')))return;
      let preview='';
      if(blob.type.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name)) preview='<pre class="attachment-preview">'+esc((await blob.text()).slice(0,80000))+'</pre>';
      else if(['image/png','image/jpeg','image/webp','image/gif','image/svg+xml'].includes(blob.type)) preview='<img class="attachment-image" id="attachment-preview-image" alt="'+esc(file.name)+'">';
      else preview='<div class="attachment-unsupported">'+icon('file')+'<p>保存到设备后，可使用对应的软件打开。</p></div>';
      if(infoVersion!==version||!$('#info-dialog').open||closing.has($('#info-dialog')))return;
      showInfo('附件详情','<p><strong>'+esc(file.name)+'</strong><br>'+sizeString(blob.size)+'</p>'+preview+'<button class="primary-button" id="download-attachment">'+icon('download')+'保存附件</button>');
      previewUrl=URL.createObjectURL(blob);
      const image=$('#attachment-preview-image');if(image)image.src=previewUrl;
      $('#download-attachment').onclick=()=>{const link=document.createElement('a');link.href=previewUrl;link.download=file.name;document.body.append(link);link.click();link.remove();};
    }catch(error){toast(error.message||'无法读取此附件');}
  }
  function renderComposeFiles() {
    $('#compose-attachments').innerHTML=composeFiles.map((f,i)=>'<span class="file-chip"><span>'+esc(f.name)+' / '+sizeString(fileSize(f))+'</span><button type="button" data-remove-file="'+i+'" aria-label="移除 '+esc(f.name)+'">'+icon('x')+'</button></span>').join('');
  }
  function openCompose(mode='new',to='') {
    const m=current();clearTimeout(draftTimer);composeSession++;draftId=null;parentId=null;composeFiles=[];
    $('#compose-form').reset();$('#compose-to').setCustomValidity('');$('#compose-cc').setCustomValidity('');$('#cc-field').hidden=true;$('#toggle-cc').textContent='抄送';
    $('#compose-title').textContent=mode==='reply'?'回复通讯':mode==='forward'?'转发通讯':mode==='edit'?'编辑通讯':'新建通讯';
    if(mode==='edit'&&m){
      draftId=m.id;parentId=m.parentId||null;$('#compose-to').value=m.to||'';$('#compose-cc').value=m.cc||'';$('#compose-subject').value=m.subject;$('#compose-body').value=m.paragraphs.join('\n\n');$('#compose-priority').checked=Boolean(m.priority);composeFiles=structuredClone(m.attachments);
      if(m.cc){$('#cc-field').hidden=false;$('#toggle-cc').textContent='取消抄送';}
    }else if(mode==='reply'&&m){
      parentId=m.id;$('#compose-to').value=m.sender==='博士'?m.to||'':m.email;$('#compose-subject').value='回复：'+m.subject.replace(/^回复：/,'');$('#compose-body').value=(m.sender==='博士'?'':m.sender+'：')+'\n\n';
    }else if(mode==='forward'&&m){
      $('#compose-subject').value='转发：'+m.subject;$('#compose-body').value='\n\n转发通讯\n发件人：'+m.sender+' <'+m.email+'>\n主题：'+m.subject+'\n\n'+m.paragraphs.join('\n\n');composeFiles=structuredClone(m.attachments);
    }else $('#compose-to').value=to;
    $('#draft-status').textContent=draftId?'草稿已载入':'草稿将自动保存';$('#word-count').textContent=$('#compose-body').value.length+' 字';renderComposeFiles();openDialog($('#compose-dialog'));
    (mode==='reply'?$('#compose-body'):$('#compose-to')).focus();
  }
  function collectCompose(folder) {
    const previous=messages.find((m)=>m.id===draftId);
    return {...previous,id:draftId||uid('local'),sender:'博士',email:'doctor@rhodes.is',to:emailList($('#compose-to').value).join(', '),cc:emailList($('#compose-cc').value).join(', '),subject:$('#compose-subject').value.trim(),preview:$('#compose-body').value.trim().replace(/\s+/g,' ').slice(0,110),paragraphs:$('#compose-body').value.trim().split(/\n\s*\n/),date:timeString(),role:'个人通讯',folder,priority:$('#compose-priority').checked,unread:false,starred:previous?.starred||false,labels:previous?.labels||[],attachments:structuredClone(composeFiles),parentId};
  }
  function saveDraft(notify=true) {
    if(readingFiles)return false;
    const empty=![$('#compose-to').value,$('#compose-cc').value,$('#compose-subject').value,$('#compose-body').value].some((v)=>v.trim())&&!composeFiles.length;
    if(empty){
      if(draftId){messages=messages.filter((m)=>m.id!==draftId);draftId=null;persist();refresh(true);}
      $('#draft-status').textContent='空白草稿未保存';if(notify)toast('空白草稿无需保存');return true;
    }
    const m=collectCompose('drafts'),index=messages.findIndex((item)=>item.id===m.id);
    if(index<0)messages.push(m);else messages[index]=m;
    draftId=m.id;const saved=persist();
    $('#draft-status').textContent=saved?'已自动保存 '+m.date.slice(11,16):'保存不可用，内容保留在当前会话';
    refresh(true);if(notify)toast(saved?'草稿已保存':'草稿保留在当前会话，存储不可用');
    return saved;
  }
  function scheduleDraft() {
    clearTimeout(draftTimer);$('#word-count').textContent=$('#compose-body').value.length+' 字';$('#draft-status').textContent='正在编辑…';
    draftTimer=setTimeout(()=>{if($('#compose-dialog').open){if(readingFiles)scheduleDraft();else saveDraft(false);}},700);
  }
  async function attachFiles(files) {
    if(composeFiles.length+files.length>10){toast('每封通讯最多添加 10 个附件');return;}
    const session=composeSession;readingFiles++;
    $('#draft-status').textContent='正在保存附件…';
    try{
      for(const file of files){
        if(file.size>10*1024*1024){toast(file.name+' 超过 10 MB，请选择较小文件');continue;}
        try{const saved=await putFile(file);if(session===composeSession)composeFiles.push(saved);}
        catch{toast('附件保存失败，请检查浏览器存储后重试');}
      }
    }finally{
      readingFiles--;
      if(session===composeSession){renderComposeFiles();scheduleDraft();}
    }
  }
  function showLabels(ids=[],manage=false) {
    showInfo(manage?'管理个人标签':'设置通讯标签',manage?'<div id="label-editor"></div><form class="label-create" id="create-label-form"><input id="new-label-name" aria-label="标签名称" placeholder="新标签名称" maxlength="16" required><button class="primary-button">创建</button></form>':'<p>选择标签。批量处理仅修改你勾选或取消的项目。</p><form id="assign-label-form"><div id="label-choices"></div><div class="form-actions"><button type="button" class="secondary-button" data-close="info-dialog">取消</button><button class="primary-button">应用标签</button></div></form>');
    if(manage){
      const draw=()=>{
        $('#label-editor').innerHTML=labels.map((l)=>'<div class="label-editor-row"><span class="label-dot"></span><span>'+esc(l.name)+'</span><button class="icon-button" data-delete-label="'+esc(l.id)+'" aria-label="删除 '+esc(l.name)+'">'+icon('trash')+'</button></div>').join('')||'<p>还没有个人标签。</p>';
      };
      draw();
      $('#label-editor').onclick=(event)=>{
        const button=event.target.closest('[data-delete-label]');if(!button)return;
        const id=button.dataset.deleteLabel,l=labels.find((item)=>item.id===id),affected=messages.filter((m)=>m.labels.includes(id)).map((m)=>m.id);
        labels=labels.filter((item)=>item.id!==id);messages.forEach((m)=>{m.labels=m.labels.filter((v)=>v!==id);});if(state.label===id)state.label=null;
        persist(true);draw();refresh(true);toast('标签已删除',()=>{if(!labels.some((item)=>item.id===id))labels.push(l);messages.forEach((m)=>{if(affected.includes(m.id)&&!m.labels.includes(id))m.labels.push(id);});persist(true);refresh(true);if($('#label-editor'))draw();toast('已恢复标签');});
      };
      $('#create-label-form').onsubmit=(event)=>{
        event.preventDefault();const name=$('#new-label-name').value.trim();
        if(!name)return;if(labels.some((l)=>l.name===name)){toast('已有同名标签');return;}if(labels.length>=12){toast('最多创建 12 个标签');return;}
        labels.push({id:uid('tag'),name});persist(true);$('#new-label-name').value='';draw();refresh(true);
      };
    }else{
      $('#label-choices').innerHTML=labels.length?labels.map((l)=>'<label class="check-row"><input type="checkbox" data-assign-label="'+esc(l.id)+'"><span>'+esc(l.name)+'</span></label>').join(''):'<p>请先在侧边栏创建个人标签。</p>';
      $$('[data-assign-label]').forEach((input)=>{
        const count=messages.filter((m)=>ids.includes(m.id)&&m.labels.includes(input.dataset.assignLabel)).length;
        input.checked=count===ids.length;input.indeterminate=count>0&&count<ids.length;
        input.onchange=()=>{input.dataset.changed='true';};
      });
      $('#assign-label-form').onsubmit=(event)=>{
        event.preventDefault();const choices=$$('[data-assign-label][data-changed]');
        if(choices.length)updateMany(ids,(m)=>({labels:labels.filter((l)=>{const choice=choices.find((c)=>c.dataset.assignLabel===l.id);return choice?choice.checked:m.labels.includes(l.id);}).map((l)=>l.id)}),'标签已更新');
        closeDialog($('#info-dialog'));
      };
    }
  }
  function showAdvanced() {
    const a=state.advanced;
    showInfo('筛选通讯','<form id="filter-form"><div class="form-row"><label for="filter-from">发件人 / 收件人</label><input id="filter-from" value="'+esc(a.from)+'" placeholder="姓名或邮箱"></div><div class="form-row-inline"><div class="form-row"><label for="filter-after">起始日期</label><input type="date" id="filter-after" value="'+esc(a.after)+'"></div><div class="form-row"><label for="filter-before">截止日期</label><input type="date" id="filter-before" value="'+esc(a.before)+'"></div></div><label class="check-row"><input type="checkbox" id="filter-priority" '+(a.priority?'checked':'')+'>仅优先通讯</label><label class="check-row"><input type="checkbox" id="filter-starred" '+(a.starred?'checked':'')+'>仅星标通讯</label><div class="form-actions"><button type="button" class="secondary-button" id="reset-advanced">重置</button><button class="primary-button">应用筛选</button></div></form>');
    $('#reset-advanced').onclick=()=>{$('#filter-form').reset();$('#filter-from').value='';$('#filter-after').value='';$('#filter-before').value='';$('#filter-priority').checked=false;$('#filter-starred').checked=false;};
    $('#filter-form').onsubmit=(event)=>{
      event.preventDefault();const after=$('#filter-after').value,before=$('#filter-before').value;
      if(after&&before&&after>before){toast('起始日期不能晚于截止日期');return;}
      state.advanced={from:$('#filter-from').value.trim(),after,before,priority:$('#filter-priority').checked,starred:$('#filter-starred').checked};
      state.checked.clear();refresh();closeDialog($('#info-dialog'));
    };
  }
  function showSnooze() {
    const m=current();if(!m)return;
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(9,0,0,0);
    const local=new Date(tomorrow-tomorrow.getTimezoneOffset()*60000).toISOString().slice(0,16);
    showInfo('稍后处理','<p>到达提醒时间后，这封通讯将重新出现在收件箱中。</p><form id="snooze-form"><div class="form-row"><label for="snooze-time">提醒时间</label><input type="datetime-local" id="snooze-time" required value="'+local+'"></div><div class="form-actions"><button type="button" class="secondary-button" data-close="info-dialog">取消</button><button class="primary-button">设定提醒</button></div></form>');
    $('#snooze-form').onsubmit=(event)=>{
      event.preventDefault();const date=new Date($('#snooze-time').value);
      if(!Number.isFinite(date.getTime())||date<=new Date()){toast('请选择未来的提醒时间');return;}
      updateMany([m.id],{folder:'snoozed',snoozeUntil:date.toISOString(),previousFolder:m.folder==='snoozed'?m.previousFolder:m.folder},'已移至稍后处理');closeDialog($('#info-dialog'));
    };
  }
  function wakeDueMessages() {
    let count=0;
    messages.forEach((m)=>{if(m.folder==='snoozed'&&m.snoozeUntil&&Date.parse(m.snoozeUntil)<=Date.now()){m.folder='inbox';m.snoozeUntil=null;m.previousFolder=null;m.unread=true;count++;}});
    if(count){persist();refresh();toast(count+' 封通讯已到提醒时间');}
  }
  function showContacts() {
    showInfo('通讯录','<input class="contact-search" id="contact-search" type="search" placeholder="搜索姓名、部门或邮箱" aria-label="搜索通讯录"><nav class="contact-groups" id="contact-list"></nav>');
    const draw=()=>{
      const query=$('#contact-search').value.toLowerCase();
      const list=contacts.filter((c)=>[c.name,c.group,c.email,c.title].join(' ').toLowerCase().includes(query));
      const groups={};
      list.forEach((c)=>{const g=c.group||'其他';if(!groups[g])groups[g]=[];groups[g].push(c);});
      const fragments=Object.keys(groups).sort().map((g)=>'<div class="contact-group"><div class="contact-group-heading">'+esc(g)+'</div><div class="contact-rows">'+groups[g].map((c)=>'<button class="contact-entry" data-contact="'+esc(c.email)+'"><span class="sender-emblem">'+emblem(c)+'</span><span class="contact-info"><strong>'+esc(c.name)+'</strong><small class="contact-title">'+esc(c.title||g)+'</small><small class="contact-email">'+esc(c.email)+'</small></span><span class="contact-status'+(c.status==='offline'?' offline':'')+'" title="'+esc(c.status==='offline'?'离舰':'在舰')+'"></span>'+icon('send')+'</button>').join('')+'</div></div>').join('');
      $('#contact-list').innerHTML=fragments||'<p>没有匹配的联系人。</p>';
    };draw();$('#contact-search').oninput=draw;
    $('#contact-list').onclick=(event)=>{const b=event.target.closest('[data-contact]');if(b){closeDialog($('#info-dialog'));openCompose('new',b.dataset.contact);}};
  }
  function showSettings() {
    showInfo('终端设置','<label class="setting-row"><span>界面动效<small>保留轻量进场与状态反馈</small></span><input type="checkbox" data-setting="motion" '+(settings.motion?'checked':'')+'></label><label class="setting-row"><span>紧凑列表<small>在同一屏显示更多通讯</small></span><input type="checkbox" data-setting="compact" '+(settings.compact?'checked':'')+'></label><label class="setting-row"><span>放大正文字号<small>适合长时间阅读</small></span><input type="checkbox" data-setting="largeReading" '+(settings.largeReading?'checked':'')+'></label><div class="form-row"><label for="signature-setting">通讯签名</label><textarea id="signature-setting">'+esc(settings.signature)+'</textarea></div><button class="primary-button" id="save-settings">保存设置</button>');
    $('#save-settings').onclick=()=>{$$('[data-setting]').forEach((input)=>{settings[input.dataset.setting]=input.checked;});settings.signature=$('#signature-setting').value.trim();applySettings();const ok=persist();closeDialog($('#info-dialog'));toast(ok?'终端设置已保存':'设置仅在当前会话生效');};
  }
  function openMaterial(id) {
    const material=materials.find((m)=>m.id===id);if(!material)return;
    $('#material-title').textContent=material.name+' / '+material.reference;
    $('#material-content').innerHTML='<div class="material-stage"><span class="hud-bracket"></span>'+(id==='originium'?'<canvas id="interactive-specimen" data-specimen="interactive" tabindex="0" role="img" aria-label="原创源石晶簇三维结构，拖动或使用方向键旋转"></canvas>':'<svg aria-label="'+esc(material.name)+'"><use href="#'+(id==='case'?'cargo-mark':'record-mark')+'"/></svg>')+'<span class="model-overlay-label">'+esc(material.reference.toUpperCase())+'</span><span class="model-overlay-label bottom">'+(id==='originium'?'DRAG TO ROTATE':'CARGO INSPECTION')+'</span></div>'+(id==='originium'?'<div class="material-controls"><button class="secondary-button" id="turn-model">'+icon('rotate')+'旋转视角</button><button class="secondary-button" id="reset-model">重置</button><label class="wireframe-toggle"><input type="checkbox" id="wireframe-model">结构线框</label><label>缩放<input id="zoom-model" type="range" min="60" max="165" value="100" aria-label="模型缩放"></label></div>':'')+'<div class="material-description"><div><h3>'+esc(material.english)+'</h3><p>'+esc(material.description)+'</p><small>'+esc(material.handling)+' / '+material.quantity+' '+material.unit+'</small></div>'+(id==='originium'?'<div><img class="reference-image" id="game-reference" src="https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/main/item/DIAMOND.png" alt="明日方舟至纯源石物品图" width="86" height="86"><div class="reference-caption">游戏物品图对照</div></div>':'')+'</div>';
    openDialog($('#material-dialog'));mountArt();
    if(id==='originium'){
      const view=canvasViews.get($('#interactive-specimen'));
      $('#turn-model').onclick=()=>view.turn();$('#reset-model').onclick=()=>{view.reset();$('#zoom-model').value=100;};$('#zoom-model').oninput=(event)=>view.setZoom(Number(event.target.value)/100);$('#wireframe-model').onchange=(event)=>view.setWireframe(event.target.checked);
      $('#game-reference').onerror=(event)=>{event.target.hidden=true;event.target.nextElementSibling.textContent='物品图暂不可用';};
    }
  }

  document.addEventListener('pointerdown',()=>{inputMethod='pointer';document.body.dataset.inputMethod='pointer';},true);
  document.addEventListener('keydown',()=>{inputMethod='keyboard';document.body.dataset.inputMethod='keyboard';},true);
  document.addEventListener('click',(event)=>{
    const target=event.target;
    const close=target.closest('[data-close]');if(close){closeDialog(document.getElementById(close.dataset.close));return;}
    const folder=target.closest('[data-folder]');if(folder){switchView(folder.dataset.folder);return;}
    const group=target.closest('[data-group]');if(group){switchView('inbox',group.dataset.group);return;}
    const label=target.closest('[data-label-filter]');if(label){switchView('inbox',null,label.dataset.labelFilter);return;}
    const material=target.closest('[data-material]');if(material){openMaterial(material.dataset.material);return;}
    const star=target.closest('[data-star]');if(star){toggleStar(star.dataset.star);return;}
    const open=target.closest('[data-open]');if(open){select(open.dataset.open);if(inputMethod==='keyboard'&&matchMedia('(max-width:720px)').matches)$('#back-button').focus();return;}
    const related=target.closest('[data-open-related]');if(related){const m=messages.find((m)=>m.id===related.dataset.openRelated);if(m){switchView(m.folder);select(m.id);}return;}
    const attachment=target.closest('[data-attachment]');if(attachment){openAttachment(Number(attachment.dataset.attachment));return;}
    if(target.closest('[data-clear-filters]')){clearFilters();return;}
    if(target.closest('[data-confirm-deployment]')){confirmDeployment();return;}
    if(target.closest('[data-edit-current]')){openCompose('edit');return;}
    if(target.closest('[data-restore-current]')){move([state.selected],'restore');return;}
    if(target.closest('[data-delete-current]')){confirmDelete([state.selected]);return;}
    const remove=target.closest('[data-remove-file]');if(remove){composeFiles.splice(Number(remove.dataset.removeFile),1);renderComposeFiles();scheduleDraft();return;}
    const action=target.closest('[data-action]');
    if(action&&current()){
      const m=current(),kind=action.dataset.action;
      if(kind==='archive')move([m.id],['archive','trash','snoozed'].includes(m.folder)?'restore':'archive');
      if(kind==='trash')move([m.id],'trash');
      if(kind==='read')updateMany([m.id],{unread:!m.unread},m.unread?'已标为已读':'已标为未读');
      if(kind==='snooze')showSnooze();
      if(kind==='label')showLabels([m.id]);
      if(kind==='export')exportCurrentMail();
      return;
    }
    const batch=target.closest('[data-batch]');
    if(batch){
      const ids=[...state.checked];if(!ids.length)return;
      if(batch.dataset.batch==='label')showLabels(ids);
      else if(['read','unread'].includes(batch.dataset.batch))updateMany(ids,{unread:batch.dataset.batch==='unread'},'已更新 '+ids.length+' 封通讯的阅读状态');
      else move(ids,batch.dataset.batch);
    }
  });
  document.addEventListener('change',(event)=>{
    const input=event.target;
    if(input.matches('[data-select]')){if(input.checked)state.checked.add(input.dataset.select);else state.checked.delete(input.dataset.select);renderList();}
    if(input.matches('[data-task]')){
      tasks[input.dataset.task]=input.checked;syncDeployment();persist(true);
      $$('[data-task]').forEach((el)=>{el.checked=tasks[el.dataset.task];el.closest('.task-item').classList.toggle('done',el.checked);});
      $$('[data-task-count]').forEach((el)=>{el.textContent=Object.values(tasks).filter(Boolean).length+' / 3';});
    }
  });
  $('#select-all').onchange=(event)=>{state.checked=event.target.checked?new Set(visibleMessages().map((m)=>m.id)):new Set();renderList();};
  $('#clear-selection').onclick=()=>{state.checked.clear();renderList();};
  $$('.filter').forEach((button)=>{button.onclick=()=>{state.filter='all';state.unreadSession=button.dataset.filter==='unread'?visibleMessages().filter((m)=>m.unread).map((m)=>m.id):[];state.filter=button.dataset.filter;state.checked.clear();refresh();};});
  $('#search').oninput=(event)=>{state.query=event.target.value.trim();state.filter='all';state.unreadSession=[];state.checked.clear();$('#terminal').classList.remove('reading');refresh();};
  $('#advanced-search').onclick=showAdvanced;
  $('#focus-button').onclick=()=>{const active=$('#terminal').classList.toggle('focus-mode');$('#focus-button').setAttribute('aria-pressed',String(active));if(active)$('#terminal').classList.add('reading');};
  $('#sort-button').onclick=()=>{state.ascending=!state.ascending;$('#sort-button').innerHTML=icon(state.ascending?'sort-ascending':'sort-descending');$('#sort-button').title=state.ascending?'最早优先':'最新优先';renderList();};
  $('#refresh-button').onclick=()=>{wakeDueMessages();refresh(true);toast('本地通讯列表已更新');};
  $('#prev-mail').onclick=()=>navigate(-1);$('#next-mail').onclick=()=>navigate(1);
  $('#back-button').onclick=()=>{$('#terminal').classList.remove('reading','focus-mode');$('#focus-button').setAttribute('aria-pressed','false');$('[data-open]').find((el)=>el.dataset.open===state.selected)?.focus();};
  $('#compose-button').onclick=()=>openCompose();
  $('#reply-button').onclick=()=>openCompose(['drafts','sent'].includes(current()?.folder)?'edit':'reply');
  $('#forward-button').onclick=()=>openCompose('forward');
  $('#manage-labels').onclick=()=>showLabels([],true);
  $('#contacts-button').onclick=showContacts;
  $('#settings-button').onclick=showSettings;
  $('#dossier-button').onclick=()=>showInfo('行动档案','<div class="dossier-dialog-content">'+dossierMarkup()+'</div>');
  $('#profile-button').onclick=()=>showInfo('终端身份','<div class="profile-card"><div class="doctor-avatar"><svg><use href="#operator-mark"/></svg></div><div><strong>博士</strong><span>doctor@rhodes.is</span></div></div><div class="setting-row"><span>所属组织</span><strong>罗德岛</strong></div><div class="setting-row"><span>职务</span><span>战术指挥</span></div><div class="setting-row"><span>存储状态</span><strong>仅当前会话</strong></div>');
  $('#shortcuts-button').onclick=()=>showInfo('键盘快捷键',[['搜索通讯','/'],['新建通讯','C'],['回复通讯','R'],['归档通讯','E'],['专注阅读','F'],['上一封 / 下一封','↑ / ↓'],['关闭窗口或返回列表','Esc']].map(([label,key])=>'<div class="shortcut-row"><span>'+label+'</span><kbd>'+key+'</kbd></div>').join(''));
  $('#toggle-cc').onclick=()=>{const hide=!$('#cc-field').hidden;$('#cc-field').hidden=hide;$('#toggle-cc').textContent=hide?'抄送':'取消抄送';if(hide)$('#compose-cc').value='';else $('#compose-cc').focus();scheduleDraft();};
  $('#insert-signature').onclick=()=>{const field=$('#compose-body');field.value=field.value.trimEnd()+'\n\n'+settings.signature;scheduleDraft();};
  $('#save-draft').onclick=()=>{if(readingFiles){toast('附件正在保存，请稍候');return;}saveDraft(true);closeDialog($('#compose-dialog'),false);};
  $('#compose-form').addEventListener('input',(event)=>{if(event.target.matches('input'))event.target.setCustomValidity('');scheduleDraft();});
  $('#compose-form').addEventListener('change',(event)=>{if(event.target.id!=='compose-file')scheduleDraft();});
  $('#compose-file').onchange=(event)=>{const files=[...event.target.files];event.target.value='';attachFiles(files);};
  $('#compose-form').onsubmit=(event)=>{
    event.preventDefault();
    if(readingFiles){toast('附件正在保存，请稍候');return;}
    for(const id of ['compose-to','compose-cc']){
      const field=$('#'+id),values=emailList(field.value);
      if((id==='compose-to'&&!values.length)||values.some((v)=>!validEmail(v))){field.setCustomValidity('请填写有效邮箱，多个地址用逗号分隔');field.reportValidity();return;}
    }
    if(!$('#compose-subject').value.trim()||!$('#compose-body').value.trim()){toast('请填写通讯主题和正文');return;}
    clearTimeout(draftTimer);const m=collectCompose('sent');messages=messages.filter((item)=>item.id!==m.id);messages.push(m);
    const saved=persist();closeDialog($('#compose-dialog'),false);
    if(settings.motion && !reduce.matches) {
      const stamp=$('#toast').querySelector('.stamp')||document.createElement('svg');
      stamp.className='stamp';stamp.innerHTML='<use href="#post-mark"/>';stamp.style.cssText='position:fixed;top:40%;left:50%;transform:translate(-50%,-50%) scale(0.6);width:60px;height:60px;color:var(--accent);animation:stamp-press 700ms var(--ease-out) forwards';
      stamp.setAttribute('viewBox','0 0 56 56');document.body.appendChild(stamp);
      setTimeout(()=>stamp.remove(),700);
    }
    refresh(true);toast(saved?'已加入本地发件箱，等待连接邮件服务':'已加入当前会话的发件箱，尚未发送');
  };
  $$('dialog').forEach((dialog)=>{
    dialog.addEventListener('cancel',(event)=>{event.preventDefault();closeDialog(dialog);});
    dialog.addEventListener('click',(event)=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeDialog(dialog);});
  });
  $('#toast-undo').onclick=()=>{const action=undoAction;undoAction=null;action?.();};
  $('#fullscreen-button').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('浏览器暂不支持全屏，可使用 F11');}};
  document.addEventListener('fullscreenchange',()=>{$('#fullscreen-button').innerHTML=icon(document.fullscreenElement?'minimize':'maximize');});
  document.addEventListener('keydown',(event)=>{
    if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,[contenteditable]')||$('dialog[open]'))return;
    const key=event.key.toLowerCase();
    if(key==='/'){event.preventDefault();$('#search').focus();}
    if(key==='c'){event.preventDefault();openCompose();}
    if(key==='r'&&current()){event.preventDefault();openCompose(['drafts','sent'].includes(current().folder)?'edit':'reply');}
    if(key==='f'){event.preventDefault();$('#focus-button').click();}
    if(key==='e'&&current()){event.preventDefault();move([state.selected],'archive');}
    if(event.key==='ArrowDown'){event.preventDefault();navigate(1);}
    if(event.key==='ArrowUp'){event.preventDefault();navigate(-1);}
    if(event.key==='Escape'){$('#terminal').classList.remove('reading','focus-mode');$('#focus-button').setAttribute('aria-pressed','false');state.checked.clear();renderList();}
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wakeDueMessages();});
  window.addEventListener('pagehide',()=>{if($('#compose-dialog').open&&!readingFiles)saveDraft(false);});
  $('#contact-options').innerHTML=contacts.map((c)=>'<option value="'+esc(c.email)+'">'+esc(c.name)+'</option>').join('');
  $('#dossier').innerHTML=dossierMarkup();applySettings();refresh();wakeDueMessages();
  $('#storage-status').textContent='仅当前会话';
  setInterval(wakeDueMessages,30000);

  /* PRTS boot sequence — every refresh starts a 3–5 second, non-linear system check. */
  const boot = $('#boot');
  const skipBoot = !settings.motion || reduce.matches || window.matchMedia('(max-width:720px)').matches;
  if(boot && !skipBoot) {
    boot.style.display = 'flex';
    let bootTimer, bootFinished = false;
    const bootTimers = [];
    const setBootProgress = (value) => {
      const progress = boot.querySelector('.boot-progress');
      const valueEl = boot.querySelector('.boot-progress-value');
      if(progress) progress.setAttribute('aria-valuenow', String(value));
      if(valueEl) valueEl.innerHTML = String(value).padStart(2,'0')+'<span>%</span>';
      const bar = boot.querySelector('.boot-progress-bar');
      if(bar) bar.style.width = value + '%';
    };
    const finishBoot = () => {
      if (bootFinished) return;
      bootFinished = true;
      clearTimeout(bootTimer);
      bootTimers.forEach(clearTimeout);
      setBootProgress(100);
      boot.classList.add('boot-exit');
      setTimeout(() => boot.remove(), 300);
    };
    const skipBootNow = (e) => {
      e && e.preventDefault();
      finishBoot();
    };
    const handlers = ['click', 'keydown', 'pointerdown', 'touchstart'];
    handlers.forEach((type) => boot.addEventListener(type, skipBootNow, { once: true }));
    setBootProgress(0);
    const stages = [
      {value:18, delay:500 + Math.random() * 250},
      {value:43, delay:650 + Math.random() * 350},
      {value:69, delay:600 + Math.random() * 400},
      {value:86, delay:500 + Math.random() * 350},
      {value:100, delay:450 + Math.random() * 250}
    ];
    let elapsed = 0;
    stages.forEach(({value, delay}) => {
      elapsed += delay;
      bootTimers.push(setTimeout(() => setBootProgress(value), elapsed));
    });
    bootTimer = setTimeout(finishBoot, elapsed + 300);
  } else if(boot) {
    boot.remove();
  }
})();
