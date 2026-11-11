'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const solidPaths = {
    home: '<path d="M12 3 2 11v2h3v7h5v-6h4v6h5v-7h3v-2Z"/>',
    sparkles: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>',
    route: '<circle cx="6" cy="6" r="4"/><circle cx="18" cy="18" r="4"/><path d="M6 10h10v2H8v6h6v2H6Z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 5v5.4l3.3 2.2-1.2 1.6L11 13V7Z"/>',
    folder: '<path d="M3 4h6l3 3h9v13H3Z"/>',
    photo: '<path d="M3 3h18v18H3Zm3 14h12l-4-6-3 4-2-2Zm1-10a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3Z"/>',
    'layout-grid': '<path d="M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z"/>',
    settings: '<path d="m9 2-1 4-4 1-2 4 3 3-1 4 4 3 4-2 4 2 4-3-1-4 3-3-2-4-4-1-1-4Zm3 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8" fill-rule="evenodd"/>',
    'message-circle': '<path d="M12 3a9 9 0 0 0-8 13L2 22l6-2a9 9 0 1 0 4-17"/>'
  };
  const filledIcon = (name, className = 'inline-icon') => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${solidPaths[name] || solidPaths.sparkles}</svg>`;
  const icon = name => name.endsWith('-filled') ? filledIcon(name.replace('-filled', '')) : `<i class="ti ti-${name}" aria-hidden="true"></i>`;
  const image = (src, alt = '', className = '') => `<img src="${escape(src)}" alt="${escape(alt)}" class="${className}">`;
  const button = (label, attributes, className = 'control-button') => `<button type="${/\btype="submit"/.test(attributes) ? 'submit' : 'button'}" class="${className}" ${attributes.replace(/\btype="(?:submit|button)"/g, '')}>${label}</button>`;
  const lightButton = (label, attributes) => button(label, attributes, 'primary-button button-light');
  const sources = {
    dune: 'assets/dune-walker.webp', drift: 'assets/drift.webp', kori: 'assets/kori-streetwear.webp',
    front: 'assets/front-walk.webp', perfume: 'assets/perfume-reveal.webp', night: 'assets/night-drive.webp',
    neon: 'assets/neon-alley.webp', imran: 'assets/avatar-imran.webp', aiko: 'assets/avatar-aiko.webp'
  };
  let projects = [
    {id: 'dune', name: 'Dune Walker', type: 'flows', subtitle: 'Flow · rendering', cover: sources.dune, status: 'rendering', duration: '0:08', collection: 'brand', prompt: 'A lone astronaut walks across amber dunes. Slow tracking shot, warm afternoon light.', ratio: '16:9', seconds: '8 sec', model: 'Kinetix 3.0'},
    {id: 'drift', name: 'Drift', type: 'videos', subtitle: 'Storyboard · yesterday', cover: sources.drift, status: 'ready', duration: '0:41', collection: 'shorts', prompt: 'Ivory silk in motion against a lavender backdrop. Soft light and gentle camera movement.', ratio: '9:16', seconds: '8 sec', model: 'Kinetix 3.0'},
    {id: 'kori', name: 'Kori — Streetwear', type: 'avatars', subtitle: 'AI avatar · 2d ago', cover: sources.kori, status: 'ready', duration: '0:24', collection: 'nori', prompt: 'Kori introduces the new streetwear collection. Relaxed delivery, warm studio light.', ratio: '9:16', seconds: '8 sec', model: 'Kinetix 3.0'},
    {id: 'front', name: 'Front Walk', type: 'videos', subtitle: 'Text to video · 3d ago', cover: sources.front, status: 'ready', duration: '0:12', collection: 'shorts', prompt: 'A quiet walk through an amber-lit city at night. Slow side tracking shot.', ratio: '16:9', seconds: '8 sec', model: 'Kinetix 3.0'},
    {id: 'amber', name: 'Amber Silk', type: 'videos', subtitle: 'Product film · 2h ago', cover: sources.perfume, status: 'draft', duration: '0:08', collection: 'brand', prompt: 'An amber perfume bottle on burgundy marble. A slow push-in catches the reflection.', ratio: '16:9', seconds: '8 sec', model: 'Kinetix 3.0'},
    {id: 'night', name: 'After Hours', type: 'videos', subtitle: 'Cinematic · 4d ago', cover: sources.night, status: 'ready', duration: '0:15', collection: 'shorts', prompt: 'City lights after dark. A slow drive through the quiet streets.', ratio: '16:9', seconds: '8 sec', model: 'Kinetix 3.0'}
  ];
  let queue = [
    {id: 'q-dune', project: 'dune', name: 'Dune Walker', cover: sources.dune, status: 'rendering', progress: 62, step: 'Sampling 18/30', left: '0:42 left'},
    {id: 'q-perfume', project: 'amber', name: 'Perfume Reveal — 4K', cover: sources.perfume, status: 'rendering', progress: 38, step: 'Upscaling', left: '2:10 left'},
    {id: 'q-kori', project: 'kori', name: 'Kori Ad — Voiceover', cover: sources.kori, status: 'queued', progress: 0, step: 'Queued · #2', left: 'Up next'}
  ];
  let media = [
    {id: 'm-dune', name: 'Dune landscape', type: 'images', src: sources.dune, size: 'Scene reference'},
    {id: 'm-drift', name: 'Silk movement', type: 'images', src: sources.drift, size: 'Portrait reference'},
    {id: 'm-kori', name: 'Kori portrait', type: 'images', src: sources.kori, size: 'Avatar reference'},
    {id: 'm-front', name: 'Amber street', type: 'images', src: sources.front, size: 'Scene reference'},
    {id: 'm-perfume', name: 'Amber bottle', type: 'images', src: sources.perfume, size: 'Product reference'},
    {id: 'm-night', name: 'City after dark', type: 'images', src: sources.night, size: 'Location reference'},
    {id: 'm-neon', name: 'Neon street', type: 'images', src: sources.neon, size: 'Location reference'}
  ];
  const avatars = [
    {id: 'elena', name: 'Elena', src: sources.drift, description: 'Editorial · English', voice: 'Warm & expressive'},
    {id: 'marcus', name: 'Marcus', src: sources.front, description: 'Cinematic · English', voice: 'Calm & grounded'},
    {id: 'kori', name: 'Kori', src: sources.kori, description: 'Lifestyle · English', voice: 'Natural & upbeat'},
    {id: 'aiko', name: 'Aiko', src: sources.aiko, description: 'Presenter · Japanese', voice: 'Clear & friendly'}
  ];
  const templates = [
    {id: 'night', name: 'Night drive', cover: sources.night, time: '0:15', category: 'Cinematic', uses: '12k', prompt: 'A slow drive through the city after dark, warm streetlights, reflections on the road, smooth forward camera movement.'},
    {id: 'neon', name: 'Neon alley', cover: sources.neon, time: '0:12', category: 'Mood', uses: '8.4k', prompt: 'An atmospheric street at night. Soft neon reflections and a slow camera push through the city.'},
    {id: 'perfume', name: 'Product reveal', cover: sources.perfume, time: '0:08', category: 'Ad', uses: '6.1k', prompt: 'An amber perfume bottle on burgundy marble. A slow camera orbit reveals the glass reflections under warm studio light.'},
    {id: 'portrait', name: 'Motion portrait', cover: sources.drift, time: '0:10', category: 'Social', uses: '9.7k', prompt: 'An editorial portrait in soft motion, flowing ivory silk, lavender background, a gentle camera move.'}
  ];
  const usage = [100, 135, 125, 175, 160, 195, 140, 185, 230, 165, 200, 320, 175, 145].map((credits, index) => ({date: `2026-${index < 3 ? '10' : '11'}-${String(index < 3 ? 29 + index : index - 2).padStart(2, '0')}`, label: index < 3 ? `Oct ${29 + index}` : `Nov ${index - 2}`, credits}));
  const activity = [
    {id: 'a1', avatar: 'marcus', name: 'Marcus', action: 'commented on Drift', time: '5m', project: 'drift', text: 'The softer opening works well. Let’s keep this camera move.'},
    {id: 'a2', avatar: 'elena', name: 'Elena', action: 'shared Amber Silk', time: '1h', project: 'amber', text: 'The latest product direction is ready for review.'},
    {id: 'a3', avatar: 'kori', name: 'Kori', action: 'approved Kori Ad', time: '3h', project: 'kori', text: 'The pacing and voice feel right for the campaign.'}
  ];
  const collections = [{id: 'brand', name: 'Brand films'}, {id: 'nori', name: 'Nori campaign'}, {id: 'shorts', name: 'Shorts & reels'}];
  const state = {
    view: 'home', returnView: 'projects', returnContext: null, project: null, collection: null, filter: 'all', query: '', page: 0,
    mode: 'text', settingsTab: 'workspace', selectedDay: 11, range: '14', busy: false, error: '',
    draft: {name: '', prompt: '', ratio: '16:9', seconds: '8 sec', model: 'Kinetix 3.0', avatar: 'kori', attachment: null},
    flow: [{id: 'scene', name: 'Scene prompt', icon: 'text-caption', value: 'A lone astronaut walks across amber dunes. Warm afternoon light.'}, {id: 'model', name: 'Video model', icon: 'sparkles', value: 'Kinetix 3.0 · 16:9 · 8 seconds'}, {id: 'output', name: 'Output', icon: 'movie', value: 'Dune Walker · 1080p'}],
    selectedNode: 'scene', profile: {name: 'Imran Hossen', role: 'Product designer', workspace: 'Lumora Studio'}, motion: 'auto', texture: false
  };
  const urls = new Set();
  let started = false, toastTimer, menuTrigger, dialogTrigger, filePurpose, serial = 0;
  const root = $('#view-root');
  const canvas = $('#studio');
  const menu = $('#popup-menu');
  const dialogLayer = $('#dialog-layer');

  function statusPill(status) {
    const names = {rendering: 'Rendering', ready: 'Ready', queued: 'Queued', paused: 'Paused', draft: 'Draft', failed: 'Failed'};
    return `<span class="status-pill ${status}"><span class="status-dot"></span>${names[status] || 'Draft'}</span>`;
  }
  function progress(value, name) {
    return `<div class="progress-track" role="progressbar" aria-label="${escape(name)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><span class="progress-fill" style="--progress:${value}%"></span></div>`;
  }
  function tabs(items, active, attribute = 'data-filter') {
    return `<div class="tabs" role="group" aria-label="${attribute === 'data-mode' ? 'Creation mode' : 'Filter'}">${items.map(([id, label]) => button(escape(label), `${attribute}="${id}" aria-pressed="${active === id}"`, `tab${active === id ? ' is-active' : ''}`)).join('')}</div>`;
  }
  const filterTabs = () => tabs([['all', 'All'], ['videos', 'Videos'], ['avatars', 'Avatars'], ['flows', 'Flows']], state.filter);
  function empty(title, text, action = 'data-nav="new"', label = 'New project', symbol = 'folder-plus') {
    return `<div class="empty-state">${icon(symbol)}<h2>${escape(title)}</h2><p>${escape(text)}</p>${lightButton(escape(label), action)}</div>`;
  }
  function pageHeader(title, subtitle, actions = '') {
    return `<header class="page-header"><div><h1>${escape(title)}</h1><p>${escape(subtitle)}</p></div><div class="page-header-actions">${actions}</div></header>`;
  }
  function projectCard(project) {
    const job = queue.find(item => item.project === project.id);
    const status = project.status === 'ready' ? 'ready' : job?.status || project.status;
    return `<button class="project-card" data-project="${escape(project.id)}" aria-label="Open ${escape(project.name)}">${project.cover ? image(project.cover, project.name) : `<span class="cover-blank">${icon('movie')}</span>`}<span class="project-top">${statusPill(status)}${status === 'rendering' ? '' : `<span class="project-duration">${project.duration}</span>`}</span><span class="project-info">${status === 'rendering' ? progress(job?.progress || 62, project.name) : ''}<h3>${escape(project.name)}</h3><p>${escape(status === 'failed' ? 'Render needs attention' : status === 'paused' ? 'Render paused' : project.subtitle)}</p></span></button>`;
  }
  function templateCard(template) {
    return `<button class="template-card" data-template="${template.id}"><span class="template-thumb">${image(template.cover)}<span>${template.time}</span></span><span class="template-copy"><strong>${template.name}</strong><span>${template.category} · ${template.uses} uses</span></span>${icon('arrow-right')}</button>`;
  }
  function chart(full = false) {
    const data = state.range === '7' && full ? usage.slice(-7) : usage;
    return `<div class="usage-chart${full ? ' chart-full' : ''}" aria-label="Daily credits used">${data.map(day => {
      const index = usage.indexOf(day);
      return `<button class="usage-bar${index === state.selectedDay ? ' is-selected' : ''}" data-day="${index}" aria-label="${day.label}: ${day.credits} credits" aria-pressed="${index === state.selectedDay}"><span style="--value:${day.credits}"></span></button>`;
    }).join('')}<div class="chart-tooltip" role="status"></div></div><div class="chart-axis"><span>${data[0].label}</span><span>${full ? 'Daily usage · credits' : ''}</span><span>Today</span></div>`;
  }
  function queueSummary() {
    const active = queue.filter(item => ['rendering', 'queued'].includes(item.status)).length;
    const first = queue[0];
    if (!first) return `<section class="insight-panel queue-panel"><div class="panel-heading"><h2>Render queue</h2><span class="active-label">0 active</span></div>${empty('Queue is clear', 'Start a new scene when you’re ready.', 'data-nav="generate"', 'Create a video', 'movie')}</section>`;
    return `<section class="insight-panel queue-panel"><div class="panel-heading"><h2>Render queue</h2><span class="active-label">${active} active</span></div><button class="queue-hero" data-project="${first.project}">${image(first.cover)}${statusPill(first.status)}</button><div class="queue-primary"><div><strong>${escape(first.name)}</strong><p>${escape(first.step)} · ${escape(first.left)}</p></div><span>${first.progress}%</span></div>${progress(first.progress, first.name)}<div class="queue-mini-list">${queue.slice(1, 3).map(job => `<button class="queue-mini" data-nav="queue">${image(job.cover)}<span class="queue-mini-copy"><strong>${escape(job.name)}</strong><small>${escape(job.step)}${job.progress ? ' · ' + job.left : ''}</small></span><span>${job.progress ? job.progress + '%' : job.left}</span></button>`).join('')}</div>${button(`Open queue ${icon('arrow-right')}`, 'data-nav="queue"', 'full-width-button')}</section>`;
  }
  function composer() {
    return `<form class="composer${state.error ? ' has-error' : ''}" id="home-form"><label class="prompt-label"><span class="sr-only">Describe your scene</span><textarea name="prompt" maxlength="2000" placeholder="Describe a scene, a mood, a camera move…" aria-describedby="home-error" ${state.busy ? 'readonly' : ''}>${escape(state.draft.prompt)}</textarea></label><div class="composer-bottom"><div class="composer-tools">${button(icon(state.draft.attachment ? 'paperclip' : 'photo'), 'data-action="attach" aria-label="Attach a reference image"', 'control-button attach-button')}${button(state.draft.ratio, 'data-select="ratio" aria-haspopup="menu" aria-expanded="false"')}${button(state.draft.seconds, 'data-select="seconds" aria-haspopup="menu" aria-expanded="false"')}${button(`<span class="status-dot"></span>${state.draft.model}`, 'data-select="model" aria-haspopup="menu" aria-expanded="false"', 'control-button model-button')}</div>${lightButton(`${icon(state.busy ? 'loader-2' : 'sparkles')}<span>${state.busy ? 'Connecting' : 'Generate'}</span>`, `type="submit" ${state.busy ? 'disabled' : ''}`)}</div><p class="home-error" id="home-error" role="alert">${escape(state.error)}</p></form>`;
  }
  function homeView() {
    const filtered = projects.filter(project => state.filter === 'all' || project.type === state.filter).slice(0, 4);
    return `<div class="home-grid"><div class="home-main"><section class="welcome"><span class="greeting"><span class="status-dot"></span>Good evening, Imran</span><h1>What will you<br>create today?</h1></section>${composer()}<div class="quick-actions">${[['text', 'Aa', 'Text to video'], ['image', icon('photo-filled'), 'Image to video'], ['avatar', icon('user-filled'), 'AI avatar'], ['voice', icon('volume'), 'Voice & lip-sync']].map(([id, symbol, title]) => `<button class="quick-action" data-mode-go="${id}"><span class="quick-icon${id === 'text' ? ' text-icon' : ''}">${symbol}</span><span><strong>${title}</strong></span>${icon('arrow-right')}</button>`).join('')}</div><section class="recent-section"><div class="section-heading"><div class="section-heading-left"><h2>Recent projects</h2>${filterTabs()}</div>${button(`View all ${icon('arrow-right')}`, 'data-nav="projects"', 'text-button')}</div><div class="project-grid">${filtered.length ? filtered.map(projectCard).join('') : empty('No projects yet', 'Create your first scene in this category.')}</div></section><section class="trending-section"><div class="section-heading"><h2>Trending templates</h2>${button(`Browse all ${icon('arrow-right')}`, 'data-nav="templates"', 'text-button')}</div><div class="template-row">${templates.map(templateCard).join('')}</div></section></div><aside class="insights" aria-label="Workspace overview">${queueSummary()}<section class="insight-panel usage-panel"><div class="panel-heading"><h2>Monthly usage</h2>${button('Pro plan', 'data-nav="usage"', 'text-button')}</div><div class="usage-number"><strong>2,450</strong><span>/ 4,000 credits</span></div>${chart()}</section><section class="insight-panel avatar-panel"><div class="panel-heading"><h2>Your avatars</h2>${button('View all', 'data-nav="avatars"', 'text-button')}</div><div class="avatar-lineup">${avatars.map(avatar => `<button class="avatar-chip" data-avatar="${avatar.id}">${image(avatar.src, avatar.name)}<span>${avatar.name}</span></button>`).join('')}<button class="avatar-chip" data-nav="train"><span class="avatar-add">${icon('plus')}</span><span>Train</span></button></div></section><section class="insight-panel activity-panel"><div class="panel-heading"><h2>Team activity</h2>${button('See all', 'data-nav="activity"', 'text-button')}</div><div class="activity-list">${activity.map(item => `<button class="activity-item" data-project="${item.project}">${image(avatars.find(avatar => avatar.id === item.avatar).src)}<span><strong>${item.name}</strong> ${item.action}</span><time>${item.time}</time></button>`).join('')}</div></section></aside></div>`;
  }
  function filteredProjects() {
    return projects.filter(project => (!state.collection || project.collection === state.collection) && (state.filter === 'all' || project.type === state.filter) && `${project.name} ${project.prompt}`.toLowerCase().includes(state.query.toLowerCase()));
  }
  function pager(total, size) {
    const pages = Math.max(1, Math.ceil(total / size));
    state.page = Math.min(state.page, pages - 1);
    return `<footer class="pager"><span>${total ? `${state.page * size + 1}–${Math.min((state.page + 1) * size, total)} of ${total}` : '0 items'}</span><div>${button(icon('chevron-left'), `data-action="page-prev" aria-label="Previous page" ${state.page === 0 ? 'disabled' : ''}`, 'icon-button')}${button(icon('chevron-right'), `data-action="page-next" aria-label="Next page" ${state.page === pages - 1 ? 'disabled' : ''}`, 'icon-button')}</div></footer>`;
  }
  function projectsView() {
    const list = filteredProjects();
    const footer = pager(list.length, 6);
    const collection = collections.find(item => item.id === state.collection);
    return `<section class="page-view">${pageHeader(collection?.name || (state.view === 'search' ? 'Search' : 'Projects'), state.view === 'search' ? 'Find your next scene, right where you left it.' : 'Your films, stories and ideas — all in one place.', `${button(`${icon('upload')} Import`, 'data-action="import-project"')}${lightButton(`${icon('plus')} New project`, 'data-nav="new"')}`)}<div class="toolbar"><label><span class="sr-only">Search projects</span><input class="toolbar-search" id="list-search" type="search" value="${escape(state.query)}" placeholder="Search projects…" autocomplete="off"></label>${filterTabs()}<span class="toolbar-spacer"></span>${button('Clear', 'data-action="clear-search"', 'text-button')}</div><div class="library-grid">${list.length ? list.slice(state.page * 6, (state.page + 1) * 6).map(projectCard).join('') : empty('No projects found', 'Try another search, or start with a new idea.', 'data-action="clear-search"', 'Clear filters', 'search')}</div>${footer}</section>`;
  }
  const field = (label, name, value, options = '') => `<label class="field"><span>${escape(label)}</span><input name="${name}" value="${escape(value)}" ${options}></label>`;
  const selectField = (label, key) => `<div class="field"><span>${label}</span>${button(`${escape(state.draft[key])}${icon('chevron-down')}`, `data-select="${key}" aria-haspopup="menu" aria-expanded="false"`)}</div>`;
  function attachmentMarkup() {
    const file = state.draft.attachment;
    if (!file) return '';
    return `<div class="attachment-row">${file.type === 'images' ? image(file.src) : icon(file.type === 'videos' ? 'movie' : 'volume')}<span>${escape(file.name)}</span>${button(icon('x'), 'data-action="remove-attachment" aria-label="Remove reference"', 'icon-button')}</div>`;
  }
  function generateView(isNew = false) {
    const mode = state.mode;
    const avatar = avatars.find(item => item.id === state.draft.avatar) || avatars[2];
    const labels = {text: ['Scene description', 'Describe a scene, the light and a camera move…'], image: ['Motion direction', 'Describe how the image should move…'], avatar: ['Script', 'Write what your presenter should say…'], voice: ['Voiceover script', 'Write the words for your voiceover…']};
    const [label, hint] = labels[mode];
    const title = isNew ? 'Start something new' : 'Bring your idea to life';
    return `<section class="page-view">${pageHeader(title, 'A scene, a still, a voice. Your next story starts here.', button(`${icon('arrow-left')} Back`, 'data-nav="home"'))}${tabs([['text', 'Text to video'], ['image', 'Image to video'], ['avatar', 'AI avatar'], ['voice', 'Voice & lip-sync']], mode, 'data-mode')}<div class="editor-layout"><form class="editor-panel" id="create-form">${field('Project name', 'name', state.draft.name, 'maxlength="80" placeholder="Untitled film"')}${mode === 'image' || mode === 'voice' ? `<button class="upload-zone" type="button" data-action="attach">${icon(mode === 'voice' ? 'movie' : 'photo-plus')}<span>${mode === 'voice' ? 'Add a video or audio file' : 'Add a reference image'}</span><small>${mode === 'voice' ? 'MP4, WebM or audio · up to 100 MB' : 'JPG, PNG or WebP · up to 50 MB'}</small></button>` : ''}${mode === 'avatar' ? `<div class="field"><span>Presenter</span>${button(`${image(avatar.src, '', 'presenter-thumb')}${avatar.name}${icon('chevron-down')}`, 'data-select="avatar" aria-haspopup="menu" aria-expanded="false"', 'control-button presenter-select')}</div>` : ''}${attachmentMarkup()}<label class="field"><span>${label}</span><textarea name="prompt" maxlength="2000" placeholder="${hint}">${escape(state.draft.prompt)}</textarea></label><div class="field-row">${selectField('Aspect ratio', 'ratio')}${selectField('Duration', 'seconds')}</div><div class="field-row">${selectField('Model', 'model')}<div class="field"><span>Output</span><span class="field-static">1080p · MP4</span></div></div><p class="field-error" id="form-error" role="alert">${escape(state.error)}</p><div class="form-footer">${lightButton(`${icon(state.busy ? 'loader-2' : 'sparkles')}${state.busy ? 'Connecting' : 'Generate'}`, `type="submit" ${state.busy ? 'disabled' : ''}`)}${button(`${icon('device-floppy')} Save draft`, `data-action="save-draft" ${state.busy ? 'disabled' : ''}`)}</div></form><section class="preview-panel"><div class="preview-frame">${mode === 'avatar' ? image(avatar.src, avatar.name) : state.draft.attachment?.type === 'images' ? image(state.draft.attachment.src, state.draft.attachment.name) : `<div class="preview-placeholder">${icon('movie')}<h2>A little imagination.<br>A whole new scene.</h2><p>Your scene preview will appear here.</p></div>`}</div><div class="preview-meta"><strong>${mode === 'avatar' ? avatar.name : 'Scene preview'}</strong><span>${state.draft.ratio} · ${state.draft.seconds}</span></div></section></div></section>`;
  }
  function detailView() {
    const project = projects.find(item => item.id === state.project);
    if (!project) return `<section class="page-view">${empty('Project not found', 'Return to your library to choose another project.', 'data-nav="projects"', 'Open projects')}</section>`;
    const job = queue.find(item => item.project === project.id);
    return `<section class="page-view">${pageHeader(project.name, project.subtitle, `${button(`${icon('arrow-left')} Back`, 'data-action="back"')}${button(`${icon('download')} Export project`, 'data-action="export-project"')}${button(icon('dots'), 'data-action="project-menu" aria-label="Project actions" aria-haspopup="menu" aria-expanded="false"', 'icon-button')}`)}<div class="detail-layout"><div class="detail-preview"><div class="preview-frame">${project.video ? `<video src="${escape(project.video)}" controls preload="metadata" aria-label="${escape(project.name)} video"></video>` : project.cover ? image(project.cover, project.name) : `<span class="cover-blank">${icon('movie')}</span>`}${!project.video ? button(`${icon('movie')} Add video preview`, 'data-action="attach-video"', 'control-button attach-video-button') : ''}</div><div class="detail-strip">${project.cover ? image(project.cover) : icon('movie')}<span>${escape(project.name)}<small>${escape(project.ratio)} · ${escape(project.seconds)} · 1080p</small></span>${statusPill(job?.status || project.status)}</div></div><form class="detail-properties" id="detail-form">${statusPill(job?.status || project.status)}${field('Project name', 'projectName', project.name, 'maxlength="80" required')}<label class="field"><span>Scene direction</span><textarea name="projectPrompt" maxlength="2000">${escape(project.prompt)}</textarea></label><dl class="property-list"><div><dt>Model</dt><dd>${escape(project.model)}</dd></div><div><dt>Aspect ratio</dt><dd>${escape(project.ratio)}</dd></div><div><dt>Duration</dt><dd>${escape(project.seconds)}</dd></div><div><dt>Collection</dt><dd>${button(`${escape(collections.find(item => item.id === project.collection)?.name || 'Unsorted')}${icon('chevron-down')}`, 'data-select="projectCollection" aria-haspopup="menu" aria-expanded="false"', 'text-button')}</dd></div></dl><p class="field-error" id="detail-error" role="alert"></p><div class="form-footer">${lightButton('Save changes', 'type="submit"')}${button('Edit scene', 'data-action="edit-scene"')}</div></form></div></section>`;
  }
  function queueView() {
    const list = queue.filter(job => state.filter === 'all' || job.status === state.filter);
    const footer = pager(list.length, 5);
    return `<section class="page-view">${pageHeader('Render queue', 'Keep an eye on every scene in the making.', lightButton(`${icon('plus')} Create a video`, 'data-nav="generate"'))}<div class="toolbar">${tabs([['all', 'All jobs'], ['rendering', 'Rendering'], ['queued', 'Queued'], ['paused', 'Paused'], ['failed', 'Needs attention']], state.filter)}<span class="toolbar-spacer"></span>${button(`${icon('refresh')} Refresh`, 'data-action="refresh-queue"')}</div><div class="queue-table"><div class="queue-table-header"><span>Project</span><span>Status</span><span>Progress</span><span>Time left</span><span class="sr-only">Actions</span></div>${list.length ? list.slice(state.page * 5, (state.page + 1) * 5).map(job => `<div class="queue-table-row"><button class="queue-project" data-project="${job.project}">${job.cover ? image(job.cover) : icon('movie')}<span><strong>${escape(job.name)}</strong><small>${escape(job.step)}</small></span></button>${statusPill(job.status)}<div class="queue-progress"><span>${job.progress}%</span>${progress(job.progress, job.name)}</div><span>${escape(job.left)}</span><div class="queue-row-actions">${button(icon(job.status === 'rendering' ? 'player-pause' : 'refresh'), `data-job="${job.id}" data-job-action="${job.status === 'rendering' ? 'pause' : 'retry'}" aria-label="${job.status === 'rendering' ? 'Pause' : 'Retry'} ${escape(job.name)}"`, 'icon-button')}${button(icon('x'), `data-job="${job.id}" data-job-action="cancel" aria-label="Cancel ${escape(job.name)}"`, 'icon-button')}</div></div>`).join('') : empty('No jobs here', 'Your matching renders will appear here.', 'data-action="clear-search"', 'Show all jobs', 'clock')}</div><p class="queue-note" id="queue-notice" role="status">${escape(state.error || 'Render controls are available. Connect a render service to resume jobs or create new videos.')}</p>${footer}</section>`;
  }
  function mediaView() {
    const list = media.filter(item => (state.filter === 'all' || item.type === state.filter) && item.name.toLowerCase().includes(state.query.toLowerCase()));
    const footer = pager(list.length, 8);
    return `<section class="page-view">${pageHeader('Media library', 'The references, footage and sounds behind your stories.', lightButton(`${icon('upload')} Import files`, 'data-action="import-media"'))}<div class="toolbar"><label><span class="sr-only">Search media</span><input class="toolbar-search" id="list-search" type="search" value="${escape(state.query)}" placeholder="Search media…"></label>${tabs([['all', 'All'], ['images', 'Images'], ['videos', 'Videos'], ['audio', 'Audio']], state.filter)}<span class="toolbar-spacer"></span>${button('Clear', 'data-action="clear-search"', 'text-button')}</div><div class="media-grid">${list.length ? list.slice(state.page * 8, (state.page + 1) * 8).map(item => `<button class="media-card" data-media="${escape(item.id)}"><span class="media-card-cover">${item.type === 'images' ? image(item.src, item.name) : icon(item.type === 'videos' ? 'movie' : 'volume')}</span><strong>${escape(item.name)}</strong><p>${escape(item.size)}</p></button>`).join('') : empty('No media found', 'Import a file or try another search.', 'data-action="import-media"', 'Import files', 'photo-plus')}</div>${footer}</section>`;
  }
  function mediaDetailView() {
    const item = media.find(entry => entry.id === state.media);
    if (!item) return mediaView();
    return `<section class="page-view">${pageHeader(item.name, item.size, `${button(`${icon('arrow-left')} Back`, 'data-nav="media"')}${button(`${icon('trash')} Remove`, 'data-action="delete-media"')}${lightButton('Use as reference', 'data-action="use-media"')}`)}<div class="media-detail preview-frame">${item.type === 'images' ? image(item.src, item.name) : item.type === 'videos' ? `<video src="${escape(item.src)}" controls preload="metadata"></video>` : `<audio src="${escape(item.src)}" controls></audio>`}</div><p class="service-error" id="media-error" role="alert"></p></section>`;
  }
  function avatarsView() {
    return `<section class="page-view">${pageHeader('A familiar face. A new story.', 'Choose a presenter with a voice of their own.', lightButton(`${icon('plus')} Train an avatar`, 'data-nav="train"'))}<div class="avatar-grid">${avatars.map(avatar => `<article class="avatar-card">${image(avatar.src, avatar.name)}<h2>${avatar.name}</h2><p>${avatar.description}<br>${avatar.voice}</p>${button(`Create with ${avatar.name}${icon('arrow-right')}`, `data-avatar="${avatar.id}"`, 'full-width-button')}</article>`).join('')}</div></section>`;
  }
  function trainView() {
    return `<section class="page-view">${pageHeader('Your voice. Your avatar.', 'Create a presenter from footage you have permission to use.', button(`${icon('arrow-left')} Back`, 'data-nav="avatars"'))}<div class="editor-layout"><form class="editor-panel" id="train-form">${field('Avatar name', 'avatarName', '', 'maxlength="60" placeholder="Enter a name"')}<button class="upload-zone" type="button" data-action="training-file">${icon('video-plus')}<span>Add training footage</span><small>MP4 or WebM · up to 100 MB</small></button><p id="training-filename" class="training-filename">${escape(state.trainingFile?.name || 'No footage selected')}</p><label class="consent-row"><input type="checkbox" name="consent"><span>I have permission to use this person’s likeness and voice.</span></label><p class="field-error" id="training-error" role="alert"></p><div class="form-footer">${lightButton(`${icon('sparkles')} Start training`, 'type="submit"')}</div></form><section class="preview-panel"><div class="preview-placeholder"><h2>Made to sound like you.</h2><p>Use a clear, well-lit recording with one person speaking naturally to the camera.</p><p>Avatar training requires a connected render service.</p></div></section></div></section>`;
  }
  function templatesView() {
    const list = templates.filter(template => state.filter === 'all' || template.category.toLowerCase() === state.filter);
    return `<section class="page-view">${pageHeader('A good place to start.', 'Camera moves and creative directions, ready for your next idea.')}<div class="toolbar">${tabs([['all', 'All templates'], ['cinematic', 'Cinematic'], ['mood', 'Mood'], ['ad', 'Ads'], ['social', 'Social']], state.filter)}</div><div class="template-gallery">${list.map(template => `<article class="template-large">${image(template.cover, template.name)}<h2>${template.name}</h2><p>${template.category} · ${template.time} · ${template.uses} uses</p>${button(`Use template ${icon('arrow-right')}`, `data-template="${template.id}"`)}</article>`).join('')}</div></section>`;
  }
  function flowView() {
    const node = state.flow.find(item => item.id === state.selectedNode);
    return `<section class="page-view">${pageHeader('Flow editor', 'Shape a scene. Connect the steps. Keep your direction.', `${button(`${icon('download')} Export flow`, 'data-action="export-flow"')}${lightButton(`${icon('player-play')} Run flow`, 'data-action="run-flow"')}`)}<div class="flow-layout"><div class="flow-board"><svg class="flow-lines" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 230 155 C 370 155, 90 285, 230 285 S 90 445, 230 445"/></svg>${state.flow.map((item, index) => `<button class="flow-node${item.id === state.selectedNode ? ' is-selected' : ''}" data-node="${item.id}" aria-pressed="${item.id === state.selectedNode}" style="--node-x:${index === 1 ? '53%' : '9%'};--node-y:${13 + index * 28}%"><h2>${icon(item.icon)}${item.name}</h2><p>${escape(item.value)}</p></button>`).join('')}</div><form class="flow-inspector" id="flow-form"><h2>${node.name}</h2><label class="field"><span>${node.id === 'scene' ? 'Scene direction' : node.id === 'model' ? 'Model configuration' : 'Output name & format'}</span><textarea name="nodeValue" maxlength="500">${escape(node.value)}</textarea></label><p class="field-error" id="flow-error" role="alert">${escape(state.error)}</p><div class="form-footer">${lightButton('Apply changes', 'type="submit"')}</div><p class="flow-hint">${node.id === 'scene' ? 'Describe the subject, light and camera move.' : node.id === 'model' ? 'Model · aspect ratio · duration' : 'Name your scene and choose an output resolution.'}</p></form></div></section>`;
  }
  function usageView() {
    const data = state.range === '7' ? usage.slice(-7) : usage;
    const total = data.reduce((sum, day) => sum + day.credits, 0);
    return `<section class="page-view">${pageHeader('Every frame, accounted for.', 'Daily credit usage for your workspace.', button(`${icon('download')} Export CSV`, 'data-action="export-usage"'))}<div class="toolbar">${tabs([['14', 'Last 14 days'], ['7', 'Last 7 days']], state.range, 'data-range')}<span class="toolbar-spacer"></span>${button(`${icon('texture')} Texture ${state.texture ? 'on' : 'off'}`, 'data-action="texture" aria-pressed="' + state.texture + '"')}</div><section class="usage-full"><div class="usage-number"><strong>${total.toLocaleString('en-US')}</strong><span>credits used · ${state.range} days</span></div>${chart(true)}<table class="usage-table"><caption class="sr-only">Daily credits used — same values as the chart</caption><thead><tr><th scope="col">Date</th><th scope="col">Workspace</th><th scope="col">Credits used</th></tr></thead><tbody>${data.map(day => `<tr class="${usage.indexOf(day) === state.selectedDay ? 'is-selected' : ''}"><td>${day.label}</td><td>Lumora Studio</td><td>${day.credits}</td></tr>`).join('')}</tbody></table></section></section>`;
  }
  function settingsView() {
    let content = '';
    const tab = state.settingsTab;
    if (tab === 'workspace') content = `<h2>Workspace details</h2><form id="workspace-form">${field('Workspace name', 'workspaceName', state.profile.workspace, 'maxlength="60" required')}${field('Your name', 'profileName', state.profile.name, 'maxlength="60" required')}${field('Role', 'profileRole', state.profile.role, 'maxlength="60"')}<p class="field-error" id="settings-error" role="alert"></p><div class="form-footer">${lightButton('Save changes', 'type="submit"')}</div></form>`;
    if (tab === 'appearance') content = `<h2>Make room for your focus.</h2><div class="setting-row"><div><strong>Motion</strong><p>Follow your device or reduce transitions.</p></div>${button(`${state.motion === 'auto' ? 'Follow device' : 'Reduced'}${icon('chevron-down')}`, 'data-select="motion" aria-haspopup="menu" aria-expanded="false"')}</div><div class="setting-row"><div><strong>Chart texture</strong><p>Add patterned emphasis to credit charts.</p></div><label><span class="sr-only">Chart texture</span><input type="checkbox" id="texture-setting" ${state.texture ? 'checked' : ''}></label></div>`;
    if (tab === 'services') content = `<h2>Connected services</h2><p>Your scene direction stays here until a service is connected.</p><div class="service-card"><div class="service-card-header"><strong>Kinetix render service</strong>${statusPill('paused')}</div><p>Connect a render provider to generate videos, train avatars and resume queued jobs.</p>${button(`${icon('plug-connected')} Connect service`, 'data-action="connect-service"')}<p class="service-error" id="connection-error" role="alert">${escape(state.error)}</p></div>`;
    if (tab === 'billing') content = `<h2>Your plan</h2><div class="billing-plans"><article class="billing-plan is-current"><h3>Pro</h3><strong>$29<small> / month</small></strong><p>4,000 credits<br>1080p video export<br>4 avatar presenters</p>${button('Current plan', 'disabled')}</article><article class="billing-plan"><h3>Studio</h3><strong>$79<small> / month</small></strong><p>12,000 credits<br>8K export<br>Priority rendering</p>${lightButton('Upgrade to Studio', 'data-action="upgrade"')}</article></div><p class="service-error" id="billing-error" role="alert"></p>`;
    return `<section class="page-view">${pageHeader('Settings', 'A workspace that works your way.')}<div class="settings-layout"><nav class="settings-nav" aria-label="Settings sections">${[['workspace', 'Workspace'], ['appearance', 'Appearance'], ['services', 'Services'], ['billing', 'Plans & billing']].map(([id, label]) => button(label, `data-settings="${id}" aria-current="${tab === id ? 'page' : 'false'}"`, 'nav-item' + (tab === id ? ' is-active' : ''))).join('')}</nav><section class="settings-content">${content}</section></div></section>`;
  }
  function activityView() {
    return `<section class="page-view">${pageHeader('A little progress, together.', 'The latest conversations and updates from your team.', button('Mark all read', 'data-action="mark-read"'))}<div class="activity-feed">${activity.map(item => `<article class="feed-row">${image(avatars.find(avatar => avatar.id === item.avatar).src, item.name)}<div><strong>${item.name} ${item.action}</strong><p>${item.text}</p>${button(`Open project ${icon('arrow-right')}`, `data-project="${item.project}"`, 'text-button')}</div><time>${item.time} ago</time></article>`).join('')}</div><p class="activity-read" id="read-notice" role="status">${state.read ? 'You’re all caught up.' : ''}</p></section>`;
  }
  function helpView() {
    return `<section class="page-view">${pageHeader('A little help goes a long way.', 'Find your next step and get back to creating.')}<div class="help-grid">${[['Create a video', 'Start with a scene description or an image. Choose a model, aspect ratio and duration, then generate.', 'generate', 'Start creating'], ['Build a flow', 'Connect a scene prompt, a video model and an output. Edit each step and export your flow as a file.', 'flow', 'Open flow editor'], ['Keep your work', 'Save a draft in your workspace, then export a project file to keep it beyond this session.', 'projects', 'Open projects'], ['Connect your service', 'Video rendering and avatar training need a render provider. Review your connection in workspace settings.', 'services', 'Connection settings']].map(([title, text, target, label]) => `<article class="help-article"><h2>${title}</h2><p>${text}</p>${button(`${label}${icon('arrow-right')}`, `data-nav="${target}"`, 'text-button')}</article>`).join('')}</div></section>`;
  }
  function drawFlow() {
    const board = $('.flow-board');
    if (!board) return;
    const box = board.getBoundingClientRect();
    const svg = $('.flow-lines', board);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const nodes = $$('.flow-node', board).map(node => node.getBoundingClientRect());
    const paths = nodes.slice(0, -1).map((node, index) => {
      const next = nodes[index + 1];
      const x1 = node.right - box.left, y1 = node.top + node.height / 2 - box.top;
      const x2 = next.left - box.left, y2 = next.top + next.height / 2 - box.top;
      const bend = Math.min(box.width * .08, 50);
      return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
    });
    svg.innerHTML = paths.map(path => `<path d="${path}"/>`).join('');
  }
  function render() {
    closeMenu(false);
    const views = {home: homeView, projects: projectsView, search: projectsView, new: () => generateView(true), generate: generateView, detail: detailView, queue: queueView, media: mediaView, 'media-detail': mediaDetailView, avatars: avatarsView, train: trainView, templates: templatesView, flow: flowView, usage: usageView, settings: settingsView, activity: activityView, help: helpView};
    root.innerHTML = (views[state.view] || homeView)();
    const labels = {home: ['Home', 'Overview'], projects: ['Library', 'Projects'], search: ['Library', 'Search'], new: ['Create', 'New project'], generate: ['Create', 'Generate'], detail: ['Projects', 'Scene details'], queue: ['Create', 'Render queue'], media: ['Library', 'Media library'], 'media-detail': ['Media library', 'File details'], avatars: ['Library', 'AI avatars'], train: ['AI avatars', 'Training'], templates: ['Library', 'Templates'], flow: ['Create', 'Flow editor'], usage: ['Workspace', 'Usage'], settings: ['Workspace', 'Settings'], activity: ['Workspace', 'Activity'], help: ['Workspace', 'Help center']};
    const [main, sub] = labels[state.view] || labels.home;
    $('#breadcrumb-main').textContent = main;
    $('#breadcrumb-main').dataset.nav = ({Home: 'home', Library: 'projects', Create: 'generate', Projects: 'projects', 'Media library': 'media', 'AI avatars': 'avatars', Workspace: 'settings'})[main] || 'home';
    $('#breadcrumb-sub').textContent = sub;
    for (const item of $$('.sidebar [data-nav], .sidebar [data-collection]')) {
      const active = item.dataset.collection ? item.dataset.collection === state.collection && state.view === 'projects' : item.dataset.nav === state.view || item.dataset.nav === 'generate' && state.view === 'new' || item.dataset.nav === 'projects' && state.view === 'detail' || item.dataset.nav === 'media' && state.view === 'media-detail' || item.dataset.nav === 'avatars' && state.view === 'train';
      if (!$('.nav-solid', item)) {
        const outline = $('.ti', item);
        const name = outline?.className.match(/ti-([a-z-]+)/)?.[1];
        if (name && solidPaths[name]) outline.insertAdjacentHTML('afterend', filledIcon(name, 'nav-solid'));
      }
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
    }
    $('#queue-count').textContent = queue.filter(job => ['rendering', 'queued'].includes(job.status)).length;
    $('#account-name').textContent = state.profile.name;
    $('.account-button > span > span').textContent = state.profile.role;
    $('.workspace-copy strong').textContent = state.profile.workspace;
    canvas.dataset.motion = state.motion;
    canvas.dataset.texture = state.texture;
    updateTooltip(state.selectedDay);
    drawFlow();
  }
  function navigate(view, options = {}) {
    closeDialog(false);
    state.error = '';
    if (['services', 'billing'].includes(view)) { state.settingsTab = view; view = 'settings'; }
    if (view !== state.view) { state.filter = 'all'; state.page = 0; state.query = ''; state.collection = null; }
    state.view = view;
    Object.assign(state, options);
    render();
    const heading = $('h1', root);
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
  }
  function toast(text, error = false) {
    const element = $('#toast');
    clearTimeout(toastTimer);
    $('span', element).textContent = text;
    element.classList.toggle('is-error', error);
    $('.ti', element).className = 'ti ti-' + (error ? 'alert-circle' : 'check');
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 4000);
  }
  function closeMenu(restore = true) {
    menu.hidden = true;
    if (menuTrigger) {
      menuTrigger.setAttribute('aria-expanded', 'false');
      if (restore && menuTrigger.isConnected) menuTrigger.focus({preventScroll: true});
    }
    menuTrigger = null;
  }
  function openMenu(trigger, title, options) {
    if (menuTrigger === trigger && !menu.hidden) return closeMenu();
    closeMenu(false);
    menuTrigger = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    menu.innerHTML = `<h3>${escape(title)}</h3>${options.map(option => button(`<span>${escape(option.label)}</span>${option.selected ? icon('check') : option.note ? `<small>${escape(option.note)}</small>` : ''}`, `${option.attributes} role="menuitem${option.selected !== undefined ? 'radio' : ''}" ${option.selected !== undefined ? `aria-checked="${option.selected}"` : ''} ${option.disabled ? 'disabled' : ''}`, 'menu-option' + (option.selected ? ' is-selected' : '') + (option.danger ? ' danger' : ''))).join('')}`;
    menu.hidden = false;
    const box = canvas.getBoundingClientRect(), anchor = trigger.getBoundingClientRect(), popup = menu.getBoundingClientRect();
    const gap = box.width * .006;
    let left = anchor.left - box.left;
    let top = anchor.bottom - box.top + gap;
    if (top + popup.height > box.height - gap) top = anchor.top - box.top - popup.height - gap;
    left = Math.max(gap, Math.min(left, box.width - popup.width - gap));
    top = Math.max(gap, Math.min(top, box.height - popup.height - gap));
    menu.style.left = left + 'px'; menu.style.top = top + 'px';
    $('button:not(:disabled)', menu)?.focus();
  }
  function selectMenu(trigger, key) {
    const project = projects.find(item => item.id === state.project);
    const choices = {ratio: ['16:9', '9:16', '1:1', '4:3'], seconds: ['4 sec', '8 sec', '12 sec'], model: ['Kinetix 3.0', 'Kinetix 2.5', 'Cinema 4K'], motion: ['auto', 'reduce'], avatar: avatars.map(item => item.id), projectCollection: collections.map(item => item.id)};
    const values = choices[key] || [];
    openMenu(trigger, {ratio: 'Aspect ratio', seconds: 'Duration', model: 'Video model', motion: 'Motion', avatar: 'Presenter', projectCollection: 'Collection'}[key], values.map(value => ({label: key === 'motion' ? value === 'auto' ? 'Follow device' : 'Reduced motion' : key === 'avatar' ? avatars.find(item => item.id === value).name : key === 'projectCollection' ? collections.find(item => item.id === value).name : value, attributes: `data-pick="${escape(value)}" data-key="${key}"`, selected: (key === 'motion' ? state.motion : key === 'projectCollection' ? project?.collection : state.draft[key]) === value, disabled: value === 'Cinema 4K', note: value === 'Cinema 4K' ? 'Studio plan' : ''})));
  }
  function showDialog(title, description, body, footer) {
    closeMenu(false);
    dialogTrigger = document.activeElement;
    $('#dialog').innerHTML = `<h2 id="dialog-title">${escape(title)}</h2><p>${escape(description)}</p>${body}<div class="form-footer">${button('Cancel', 'data-action="close-dialog"')}${footer}</div>`;
    dialogLayer.hidden = false;
    $('.sidebar').inert = true; $('.workspace').inert = true;
    $('input, button', $('#dialog'))?.focus();
  }
  function closeDialog(restore = true) {
    if (dialogLayer.hidden) return;
    dialogLayer.hidden = true;
    $('.sidebar').inert = false; $('.workspace').inert = false;
    if (restore && dialogTrigger?.isConnected) dialogTrigger.focus({preventScroll: true});
  }
  function updateTooltip(index) {
    const day = usage[index];
    if (!day) return;
    for (const tooltip of $$('.chart-tooltip')) {
      const graph = tooltip.parentElement;
      const bars = $$('.usage-bar', graph);
      const target = bars.find(bar => Number(bar.dataset.day) === index) || bars[0];
      const current = usage[Number(target.dataset.day)];
      const position = bars.indexOf(target);
      tooltip.textContent = `${current.label} · ${current.credits} cr`;
      tooltip.style.left = Math.max(15, Math.min(85, (position + .5) / bars.length * 100)) + '%';
      tooltip.style.bottom = `calc(${current.credits / 320 * 78}% + .4cqw)`;
      for (const bar of bars) bar.classList.toggle('is-selected', bar === target);
    }
  }
  function download(name, content, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('File exported.');
  }
  function exportProject() {
    const project = projects.find(item => item.id === state.project);
    if (!project) return;
    const {id, name, type, prompt, ratio, seconds, model, collection} = project;
    download('lumora-project.json', JSON.stringify({format: 'lumora-project', version: 1, project: {id, name, type, prompt, ratio, seconds, model, collection}}, null, 2));
  }
  function saveDraft() {
    if (!state.draft.prompt.trim()) {
      state.error = 'Add a scene direction before saving your draft.'; render(); return;
    }
    const id = 'project-' + ++serial;
    const project = {id, name: state.draft.name.trim() || 'Untitled film', type: state.mode === 'avatar' ? 'avatars' : 'videos', subtitle: 'Draft · just now', status: 'draft', cover: state.draft.attachment?.type === 'images' ? state.draft.attachment.src : state.mode === 'avatar' ? avatars.find(item => item.id === state.draft.avatar).src : '', duration: '0:' + (state.draft.seconds.startsWith('4') ? '04' : state.draft.seconds.startsWith('12') ? '12' : '08'), prompt: state.draft.prompt.trim(), ratio: state.draft.ratio, seconds: state.draft.seconds, model: state.draft.model, collection: ''};
    projects.unshift(project);
    navigate('detail', {project: id, returnView: 'projects', returnContext: null});
    toast('Draft added to your projects. Export the file to keep it.');
  }
  async function generate() {
    if (state.busy) return;
    if (!state.draft.prompt.trim()) { state.error = 'Describe your scene to get started.'; render(); $('textarea', root)?.focus(); return; }
    if ((state.mode === 'image' || state.mode === 'voice') && state.view !== 'home' && !state.draft.attachment) {
      state.error = state.mode === 'image' ? 'Add a reference image first.' : 'Add a video or audio file first.'; render(); return;
    }
    state.busy = true; state.error = '';
    const origin = state.view;
    render();
    await new Promise(resolve => setTimeout(resolve, 650));
    state.busy = false;
    if (state.view === origin) { state.error = 'Render service is not connected. Save your draft or connect a provider in Settings.'; render(); }
    else toast('Render service is not connected. Your scene direction is retained.', true);
  }
  function chooseFile(purpose) {
    filePurpose = purpose;
    const input = $('#file-input');
    input.accept = purpose === 'project' ? '.json,application/json' : purpose === 'video' || purpose === 'training' ? 'video/mp4,video/webm' : purpose === 'reference' ? state.mode === 'voice' ? 'video/mp4,video/webm,audio/*' : 'image/jpeg,image/png,image/webp,image/gif' : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/*';
    input.multiple = purpose === 'media'; input.value = ''; input.click();
  }
  async function importProject(file) {
    try {
      if (file.size > 1024 * 1024) throw new Error('Project files must be smaller than 1 MB.');
      const data = JSON.parse(await file.text());
      if (data.format !== 'lumora-project' || data.version !== 1 || !data.project) throw new Error('This is not a Lumora project file.');
      const entry = data.project;
      if (typeof entry.name !== 'string' || !entry.name.trim() || entry.name.length > 80 || typeof entry.prompt !== 'string' || entry.prompt.length > 2000) throw new Error('The project name or scene direction is invalid.');
      if (!['videos', 'avatars', 'flows'].includes(entry.type) || !['16:9', '9:16', '1:1', '4:3'].includes(entry.ratio) || !['4 sec', '8 sec', '12 sec'].includes(entry.seconds) || !['Kinetix 3.0', 'Kinetix 2.5'].includes(entry.model)) throw new Error('The project configuration is not supported.');
      const id = 'project-' + ++serial;
      projects.unshift({id, name: entry.name.trim(), type: entry.type, prompt: entry.prompt, ratio: entry.ratio, seconds: entry.seconds, model: entry.model, collection: collections.some(item => item.id === entry.collection) ? entry.collection : '', status: 'draft', subtitle: 'Imported · just now', duration: '0:08', cover: ''});
      navigate('detail', {project: id, returnView: 'projects', returnContext: null}); toast('Project imported.');
    } catch (error) { toast(error.message || 'Could not read this project file.', true); }
  }
  function fileError(message) {
    toast(message, true);
    if (['home', 'new', 'generate'].includes(state.view)) { state.error = message; render(); }
    if (state.view === 'train') $('#training-error').textContent = message;
  }
  async function acceptFiles(files, purpose) {
    if (purpose === 'project') return importProject(files[0]);
    for (const file of files) {
      const type = file.type.startsWith('image/') ? 'images' : file.type.startsWith('video/') ? 'videos' : file.type.startsWith('audio/') ? 'audio' : '';
      if (!type || type === 'images' && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || type === 'videos' && !['video/mp4', 'video/webm'].includes(file.type)) { fileError('Choose a JPG, PNG, WebP, GIF, MP4, WebM or audio file.'); continue; }
      if ((purpose === 'training' || purpose === 'video') && type !== 'videos' || purpose === 'reference' && state.mode !== 'voice' && type !== 'images' || purpose === 'reference' && state.mode === 'voice' && type === 'images') { fileError('This file type is not supported for this action.'); continue; }
      if (file.size > (type === 'images' ? 50 : 100) * 1024 * 1024 || file.size === 0) { fileError(`Choose a non-empty file smaller than ${type === 'images' ? 50 : 100} MB.`); continue; }
      const src = URL.createObjectURL(file); urls.add(src);
      const entry = {id: 'media-' + ++serial, name: file.name, type, src, size: `${(file.size / 1024 / 1024).toFixed(1)} MB · ${type === 'images' ? 'Image' : type === 'videos' ? 'Video' : 'Audio'}`};
      if (type === 'images') {
        const valid = await new Promise(resolve => { const probe = new Image(); probe.onload = () => resolve(true); probe.onerror = () => resolve(false); probe.src = src; });
        if (!valid) { URL.revokeObjectURL(src); urls.delete(src); fileError('This image could not be opened. Choose another file.'); continue; }
      }
      if (purpose === 'training') { state.trainingFile = entry; $('#training-filename').textContent = entry.name; $('#training-error').textContent = ''; }
      else if (purpose === 'video') { const project = projects.find(item => item.id === state.project); if (project) { project.video = src; render(); } }
      else if (purpose === 'reference') { state.draft.attachment = entry; state.error = ''; render(); toast('Reference added.'); }
      else { media.unshift(entry); render(); toast('File added to your media library.'); }
    }
  }
  function action(name, target) {
    const project = projects.find(item => item.id === state.project);
    const actions = {
      search: () => { navigate('search'); $('#list-search').focus(); },
      'workspace-menu': () => openMenu(target, 'Workspace', [{label: state.profile.workspace, selected: true, attributes: 'data-action="close-menu"'}, {label: 'Workspace settings', attributes: 'data-nav="settings"'}, {label: 'Plans & billing', attributes: 'data-nav="billing"'}]),
      account: () => navigate('settings', {settingsTab: 'workspace'}), billing: () => navigate('billing'),
      'close-menu': () => closeMenu(), 'close-toast': () => { $('#toast').hidden = true; }, 'close-dialog': () => closeDialog(),
      attach: () => chooseFile('reference'), 'remove-attachment': () => { state.draft.attachment = null; render(); },
      'import-media': () => chooseFile('media'), 'import-project': () => chooseFile('project'), 'attach-video': () => chooseFile('video'), 'training-file': () => chooseFile('training'),
      'save-draft': saveDraft, 'export-project': exportProject,
      'edit-scene': () => { if (project) { Object.assign(state.draft, {name: project.name, prompt: project.prompt, ratio: project.ratio, seconds: project.seconds, model: project.model}); state.mode = project.type === 'avatars' ? 'avatar' : 'text'; navigate('generate'); } },
      back: () => navigate(state.returnContext?.view || state.returnView, state.returnContext || {}),
      'clear-search': () => { state.query = ''; state.filter = 'all'; state.page = 0; $('#workspace-search').value = ''; render(); },
      'page-prev': () => { state.page = Math.max(0, state.page - 1); render(); }, 'page-next': () => { state.page++; render(); },
      'project-menu': () => openMenu(target, 'Project actions', [{label: 'Duplicate project', attributes: 'data-action="duplicate-project"'}, {label: 'Export project', attributes: 'data-action="export-project"'}, {label: 'Delete project', attributes: 'data-action="delete-project"', danger: true}]),
      'duplicate-project': () => { if (!project) return; const copy = {...project, id: 'project-' + ++serial, name: (project.name.slice(0, 73) + ' — copy'), status: 'draft', subtitle: 'Draft · just now'}; projects.unshift(copy); navigate('detail', {project: copy.id}); toast('Project duplicated.'); },
      'delete-project': () => showDialog('Delete this project?', `“${project?.name}” will be removed from this workspace.`, '', button('Delete project', 'data-action="confirm-delete-project"', 'primary-button danger-button')),
      'confirm-delete-project': () => { projects = projects.filter(item => item.id !== state.project); queue = queue.filter(job => job.project !== state.project); navigate('projects'); toast('Project deleted.'); },
      'new-collection': () => showDialog('A place for your ideas.', 'Give your collection a name.', field('Collection name', 'collectionName', '', 'maxlength="60" placeholder="Collection name"') + '<p class="field-error" id="collection-error" role="alert"></p>', lightButton('Create collection', 'data-action="confirm-collection"')),
      'confirm-collection': () => { const name = $('[name="collectionName"]').value.trim(); if (!name) { $('#collection-error').textContent = 'Enter a collection name.'; return; } if (collections.length >= 5) { $('#collection-error').textContent = 'This workspace supports up to five collections.'; return; } const id = 'collection-' + ++serial; collections.push({id, name}); $('#collections-nav').insertAdjacentHTML('beforeend', `<button class="nav-item collection-item" data-collection="${id}"><span class="collection-dot dot-violet"></span><span>${escape(name)}</span></button>`); closeDialog(); navigate('projects', {collection: id}); toast('Collection created.'); },
      'export-flow': () => download('lumora-flow.json', JSON.stringify({format: 'lumora-flow', nodes: state.flow}, null, 2)),
      'run-flow': () => { state.error = 'Connect a render service in Settings to run this flow.'; render(); },
      'refresh-queue': () => { state.error = 'The render service is not connected. Existing jobs have been retained.'; render(); },
      'export-usage': () => download('lumora-credit-usage.csv', 'Date,Workspace,Credits\n' + (state.range === '7' ? usage.slice(-7) : usage).map(day => `${day.date},Lumora Studio,${day.credits}`).join('\n'), 'text/csv'),
      texture: () => { state.texture = !state.texture; render(); },
      'connect-service': () => { state.error = 'No render provider is configured for this workspace. Add a provider through your Lumora account to connect.'; render(); },
      upgrade: () => { $('#billing-error').textContent = 'Billing is not connected. Contact your workspace owner to change plans.'; },
      'mark-read': () => { state.read = true; $('.notification-dot').style.display = 'none'; $('#read-notice').textContent = 'You’re all caught up.'; },
      'use-media': () => { const item = media.find(entry => entry.id === state.media); if (!item) return; state.draft.attachment = item; state.mode = item.type === 'images' ? 'image' : 'voice'; navigate('generate'); },
      'delete-media': () => showDialog('Remove this file?', 'The file will be removed from your media library. Project references will stay unchanged.', '', button('Remove file', 'data-action="confirm-delete-media"', 'primary-button danger-button')),
      'confirm-delete-media': () => { media = media.filter(item => item.id !== state.media); navigate('media'); toast('File removed.'); }
    };
    actions[name]?.();
  }
  function onClick(event) {
    const target = event.target.closest('button, [data-action]');
    if (!target || target.disabled || target.closest('[inert]')) return;
    if (!menu.hidden && !menu.contains(target) && target !== menuTrigger && !target.hasAttribute('data-select')) closeMenu(false);
    if (target.dataset.nav) return navigate(target.dataset.nav);
    if (target.dataset.collection) return navigate('projects', {collection: target.dataset.collection});
    if (target.dataset.project) return navigate('detail', {project: target.dataset.project, returnView: state.view === 'detail' ? state.returnView : state.view, returnContext: state.view === 'detail' ? state.returnContext : {view: state.view, filter: state.filter, query: state.query, page: state.page, collection: state.collection}});
    if (target.dataset.filter) { state.filter = target.dataset.filter; state.page = 0; render(); return; }
    if (target.dataset.mode || target.dataset.modeGo) { state.mode = target.dataset.mode || target.dataset.modeGo; state.error = ''; if (target.dataset.modeGo) navigate('generate'); else render(); return; }
    if (target.dataset.template) { const template = templates.find(item => item.id === target.dataset.template); state.mode = 'text'; state.draft.prompt = template.prompt; state.draft.name = template.name; navigate('generate'); return; }
    if (target.dataset.avatar) { state.mode = 'avatar'; state.draft.avatar = target.dataset.avatar; navigate('generate'); return; }
    if (target.dataset.media) return navigate('media-detail', {media: target.dataset.media});
    if (target.dataset.select) return selectMenu(target, target.dataset.select);
    if (target.dataset.pick) {
      const key = target.dataset.key, value = target.dataset.pick;
      if (key === 'motion') state.motion = value;
      else if (key === 'projectCollection') { const project = projects.find(item => item.id === state.project); if (project) { project.name = $('[name="projectName"]').value; project.prompt = $('[name="projectPrompt"]').value; project.collection = value; } }
      else state.draft[key] = value;
      render();
      $(`[data-select="${key}"]`)?.focus({preventScroll: true});
      return;
    }
    if (target.dataset.node) { const current = state.flow.find(item => item.id === state.selectedNode); current.value = $('[name="nodeValue"]').value; state.selectedNode = target.dataset.node; state.error = ''; render(); return; }
    if (target.dataset.range) { state.range = target.dataset.range; render(); return; }
    if (target.dataset.day) { state.selectedDay = Number(target.dataset.day); updateTooltip(state.selectedDay); if (state.view === 'usage') render(); return; }
    if (target.dataset.settings) { state.settingsTab = target.dataset.settings; state.error = ''; render(); return; }
    if (target.dataset.job) {
      const job = queue.find(item => item.id === target.dataset.job);
      if (!job) return;
      if (target.dataset.jobAction === 'cancel') { state.cancelJob = job.id; showDialog('Cancel this render?', `“${job.name}” will leave the queue. Its project will stay in your library.`, '', button('Cancel render', 'data-action="confirm-cancel-job"', 'primary-button danger-button')); }
      else if (target.dataset.jobAction === 'pause') { job.status = 'paused'; job.step = 'Paused'; job.left = 'On hold'; render(); toast('Render paused.'); }
      else { job.status = 'failed'; job.step = 'Service not connected'; job.left = '—'; state.error = 'Connect a render service before retrying this job.'; render(); }
      return;
    }
    if (target.dataset.action === 'confirm-cancel-job') { const job = queue.find(item => item.id === state.cancelJob); const project = projects.find(item => item.id === job?.project); if (project) { project.status = 'draft'; project.subtitle = 'Draft · render canceled'; } queue = queue.filter(item => item.id !== state.cancelJob); closeDialog(); render(); toast('Render canceled.'); return; }
    if (target.dataset.action) action(target.dataset.action, target);
  }
  function onInput(event) {
    const target = event.target;
    if (target.name in state.draft && typeof state.draft[target.name] === 'string') state.draft[target.name] = target.value;
    if (target.id === 'list-search' || target.id === 'workspace-search') {
      const id = target.id, position = target.selectionStart;
      state.query = target.value; state.page = 0;
      if (id === 'workspace-search') { state.view = 'search'; state.filter = 'all'; state.collection = null; }
      render();
      const input = $('#' + id); input.focus({preventScroll: true});
      if (input.type !== 'search' && position !== null) input.setSelectionRange(position, position);
    }
    if (target.id === 'texture-setting') { state.texture = target.checked; canvas.dataset.texture = state.texture; }
  }
  function onSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.id === 'home-form' || form.id === 'create-form') return generate();
    if (form.id === 'detail-form') {
      const project = projects.find(item => item.id === state.project);
      const name = $('[name="projectName"]', form).value.trim();
      if (!name) { $('#detail-error').textContent = 'Enter a project name.'; return; }
      project.name = name; project.prompt = $('[name="projectPrompt"]', form).value.trim(); render(); toast('Project updated.');
    }
    if (form.id === 'flow-form') {
      const value = $('[name="nodeValue"]', form).value.trim();
      if (!value) { $('#flow-error').textContent = 'Add a value for this step.'; return; }
      state.flow.find(item => item.id === state.selectedNode).value = value; render(); toast('Flow step updated.');
    }
    if (form.id === 'workspace-form') {
      const data = new FormData(form);
      if (!data.get('workspaceName').trim() || !data.get('profileName').trim()) { $('#settings-error').textContent = 'Workspace name and your name are required.'; return; }
      state.profile = {workspace: data.get('workspaceName').trim(), name: data.get('profileName').trim(), role: data.get('profileRole').trim()}; render(); toast('Workspace details updated.');
    }
    if (form.id === 'train-form') {
      const name = $('[name="avatarName"]', form).value.trim();
      $('#training-error').textContent = !name ? 'Enter a name for your avatar.' : !state.trainingFile ? 'Add a training video first.' : !$('[name="consent"]', form).checked ? 'Confirm you have permission to use this likeness and voice.' : 'Connect a render service in Settings to train this avatar. Your footage stays on this device.';
    }
  }
  function onKeydown(event) {
    if (event.key === 'Escape') { if (!dialogLayer.hidden) closeDialog(); else closeMenu(); return; }
    const editing = event.target.matches('input, textarea, [contenteditable="true"]');
    if (event.key === '/' && !editing && dialogLayer.hidden) { event.preventDefault(); $('#workspace-search').focus(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && dialogLayer.hidden) { event.preventDefault(); if (state.view === 'detail') $('#detail-form').requestSubmit(); else if (state.view === 'new' || state.view === 'generate') saveDraft(); else if (state.view === 'flow') action('export-flow'); }
    if (!menu.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const buttons = $$('button:not(:disabled)', menu); const index = buttons.indexOf(document.activeElement);
      buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
    }
    if (event.key === 'Tab' && !dialogLayer.hidden) {
      const controls = $$('button:not(:disabled), input:not(:disabled), textarea, [tabindex="0"]', $('#dialog'));
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    }
  }
  function start() {
    if (started) return;
    started = true;
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && !menuTrigger?.contains(event.target)) closeMenu(false); });
    document.addEventListener('pointerover', event => { const bar = event.target.closest('[data-day]'); if (bar) updateTooltip(Number(bar.dataset.day)); });
    document.addEventListener('focusin', event => { if (event.target.dataset.day) updateTooltip(Number(event.target.dataset.day)); });
    document.addEventListener('pointerout', event => { if (event.target.closest('.usage-chart') && !event.relatedTarget?.closest('.usage-chart')) updateTooltip(state.selectedDay); });
    $('#file-input').addEventListener('change', event => { const files = [...event.target.files]; if (files.length) acceptFiles(files, filePurpose); });
    root.addEventListener('dragover', event => { const zone = event.target.closest('.upload-zone'); if (!zone) return; event.preventDefault(); zone.classList.add('is-dragover'); });
    root.addEventListener('dragleave', event => { event.target.closest('.upload-zone')?.classList.remove('is-dragover'); });
    root.addEventListener('drop', event => { const zone = event.target.closest('.upload-zone'); if (!zone) return; event.preventDefault(); zone.classList.remove('is-dragover'); if (event.dataTransfer.files.length) acceptFiles([...event.dataTransfer.files], state.view === 'train' ? 'training' : 'reference'); });
    root.addEventListener('error', event => {
      if (event.target.tagName === 'IMG') { event.target.classList.add('image-unavailable'); event.target.alt = event.target.alt || 'Image unavailable'; }
      if (['VIDEO', 'AUDIO'].includes(event.target.tagName)) { const notice = $('#media-error') || $('#detail-error'); if (notice) notice.textContent = 'This media could not be played. Try another file.'; }
    }, true);
    window.addEventListener('resize', () => { closeMenu(false); drawFlow(); updateTooltip(state.selectedDay); });
    window.addEventListener('pagehide', () => { urls.forEach(url => URL.revokeObjectURL(url)); clearTimeout(toastTimer); });
    render();
  }
  start();
})();
