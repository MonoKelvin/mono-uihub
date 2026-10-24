const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const startedAt = Date.now();
const notes = [
  { id: 'lake', author: '一只水獭', icon: 'fish', content: '今天的西湖，是抹茶色的。\n坐在长椅上发了半小时呆，什么都没想。', category: '日常', x: 568, y: 328, minutes: 3, likes: 23, saved: false, liked: false, hours: 72, replies: [{ author: '一片银杏', icon: 'leaf', content: '刚刚也路过了，风很舒服。', minutes: 1 }, { author: '慢慢走', icon: 'walk', content: '能好好发呆，也是很棒的一天。', minutes: 2 }] },
  { id: 'umbrella', author: '路过的云', icon: 'cloud', content: '北山街这边，哪里能借到一把伞？\n出门时的我还是太相信天气预报了。', category: '提问', x: 377, y: 344, minutes: 12, likes: 8, saved: false, liked: false, hours: 24, replies: [{ author: '一盏路灯', icon: 'bulb', content: '附近游客服务点有，往东走一点。', minutes: 7 }] },
  { id: 'coffee', author: '半杯拿铁', icon: 'coffee', content: '带了本一直没看完的书，找个地方坐坐。有人一起吗？各看各的，也挺好。', category: '搭子', x: 455, y: 356, minutes: 26, likes: 14, saved: true, liked: false, hours: 24, replies: [{ author: '未读一页', icon: 'book-2', content: '我也带了书。你还在附近吗？', minutes: 9 }, { author: '半杯拿铁', icon: 'coffee', content: '在，刚坐下。', minutes: 5 }] },
  { id: 'sunset', author: '一颗小石头', icon: 'circle-dotted', content: '把耳机摘下来才发现，鸟叫比歌好听。', category: '日常', x: 339, y: 474, minutes: 41, likes: 31, saved: false, liked: true, hours: 72, replies: [] },
  { id: 'cat', author: '橘子汽水', icon: 'bottle', content: '巷口那只橘猫今天终于让我摸了。\n从认识到今天，整整两个月。', category: '日常', x: 649, y: 300, minutes: 56, likes: 42, saved: true, liked: false, hours: 72, replies: [{ author: '一小撮猫毛', icon: 'cat', content: '是不是特别圆的那只？它只是慢热。', minutes: 21 }] },
  { id: 'pine', author: '一颗松果', icon: 'seeding', content: '今天提前下班了。沿着湖走一走，不急着回家。', category: '日常', x: 540, y: 441, minutes: 73, likes: 7, saved: false, liked: false, mine: true, hours: 72, replies: [{ author: '一尾小鱼', icon: 'fish', content: '我也是。把今天剩下的时间还给自己。', minutes: 48 }] },
  { id: 'run', author: '一双跑鞋', icon: 'shoe', content: '明早七点，湖边慢跑五公里。配速不重要，跑完吃碗面比较重要。', category: '搭子', x: 764, y: 296, minutes: 91, likes: 11, saved: false, liked: false, hours: 24, replies: [] },
  { id: 'book', author: '旧书签', icon: 'bookmark', content: '在孤山找到一本旧诗集，扉页上写着「愿你总有地方可去」。', category: '日常', x: 258, y: 632, minutes: 126, likes: 19, saved: true, liked: false, hours: 168, replies: [] },
  { id: 'noodle', author: '不加香菜', icon: 'bowl-spoon', content: '松木场有什么开到比较晚的面馆？想吃一碗热汤面。', category: '提问', x: 808, y: 168, minutes: 168, likes: 5, saved: false, liked: false, hours: 24, replies: [{ author: '小碗宽面', icon: 'bowl', content: '体育场路的小店，九点半前都在。', minutes: 101 }] },
  { id: 'bench', author: '一颗松果', icon: 'seeding', content: '树荫下还有一张空长椅。\n这次，手机留在口袋里。', category: '日常', x: 240, y: 663, minutes: 215, likes: 12, saved: false, liked: false, mine: true, hours: 168, replies: [] },
  { id: 'walk', author: '松鼠邮差', icon: 'mail', content: '回家的路多绕了一站，碰到一家很好闻的面包店。算今天的小幸运。', category: '日常', x: 908, y: 600, minutes: 284, likes: 18, saved: false, liked: false, hours: 72, replies: [] }
].map(note => ({ ...note, created: startedAt - note.minutes * 60000, expires: startedAt - note.minutes * 60000 + note.hours * 3600000, allowReplies: true, hidden: false, replies: note.replies.map(reply => ({ ...reply, created: startedAt - reply.minutes * 60000 })) }));
const areas = {
  beishan: { name: '北山街', x: 500, y: 415 },
  songmu: { name: '松木场', x: 773, y: 187 },
  gushan: { name: '孤山路', x: 250, y: 645 }
};
const categoryIcons = { '日常': 'coffee', '提问': 'message-question', '搭子': 'users' };
const state = { view: 'nearby', radius: 500, category: 'all', sort: 'latest', query: '', area: 'beishan', selected: null, zoom: 1, panX: 0, panY: 0, distance: true, allowReplies: true, composeCategory: '日常', reportId: null, deleteId: null, page: 0 };
let toastTimer;
let areaTimer;
let initialRender = true;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionTokens = getComputedStyle(document.documentElement);
const canAnimate = () => !reducedMotion.matches && !document.body.classList.contains('no-motion') && !document.body.classList.contains('keyboard-interaction');
const uiAnimations = new Map();
function animateUI(element, frames, durationToken = '--duration-switch') {
  if (!element) return;
  uiAnimations.get(element)?.cancel();
  if (!canAnimate()) return;
  const animation = element.animate(frames, { duration: parseFloat(motionTokens.getPropertyValue(durationToken)), easing: motionTokens.getPropertyValue('--ease').trim() });
  uiAnimations.set(element, animation);
  animation.finished.then(() => { if (uiAnimations.get(element) === animation) uiAnimations.delete(element); }, () => { if (uiAnimations.get(element) === animation) uiAnimations.delete(element); });
}
function stopAnimations() {
  uiAnimations.forEach(animation => animation.cancel());
  uiAnimations.clear();
}
reducedMotion.addEventListener('change', stopAnimations);
document.addEventListener('pointerdown', () => document.body.classList.remove('keyboard-interaction'), true);
document.addEventListener('keydown', () => { document.body.classList.add('keyboard-interaction'); stopAnimations(); }, true);
function updateIndicators() {
  $$('.main-nav, .feed-filters, .radius-options').forEach(group => {
    const active = $('button.is-active', group);
    const indicator = $('.selection-indicator', group);
    if (!active || !indicator || !group.getClientRects().length) return;
    indicator.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth / 100})`;
    indicator.classList.add('is-ready');
  });
}
const pageSize = () => matchMedia('(max-width: 560px)').matches ? 1 : matchMedia('(max-width: 980px)').matches ? 2 : 3;
new ResizeObserver(() => {
  render();
  centerMap(getNote(state.selected) || area());
  applyMapTransform();
}).observe($('.app-window'));
document.fonts.ready.then(updateIndicators);
const area = () => areas[state.area];
const getNote = id => notes.find(note => note.id === id && !note.hidden && note.expires > Date.now());
const distance = note => Math.hypot(note.x - area().x, note.y - area().y) / .41;
const formatDistance = value => value < 1000 ? `约 ${Math.round(value / 10) * 10} m` : `约 ${(value / 1000).toFixed(1)} km`;
const timeAgo = timestamp => {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`;
  return `${Math.floor(minutes / 1440)} 天前`;
};
function filteredNotes() {
  return notes.filter(note => !note.hidden && note.expires > Date.now())
    .filter(note => state.view === 'saved' ? note.saved : state.view === 'mine' ? note.mine : distance(note) <= state.radius)
    .filter(note => state.category === 'all' || note.category === state.category)
    .filter(note => !state.query || `${note.content} ${note.author} ${note.category}`.includes(state.query))
    .sort((a, b) => state.sort === 'distance' ? distance(a) - distance(b) : state.sort === 'popular' ? b.likes - a.likes : b.created - a.created);
}
function showToast(message, icon = 'check') {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  $('.ti', toast).className = `ti ti-${icon}`;
  $('span', toast).textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => { toast.classList.remove('is-visible'); }, 3200);
}
function noteHeader(note) {
  return `<div class="note-header"><span class="note-avatar"><i class="ti ti-${escapeHTML(note.icon)}" aria-hidden="true"></i></span><span class="note-author">${escapeHTML(note.author)}${note.mine ? '（我）' : ''}</span>${state.distance ? `<span class="note-distance">${formatDistance(distance(note))}</span>` : ''}</div>`;
}
function noteFooter(note) {
  return `<div class="note-footer"><span class="note-category"><i class="ti ti-${categoryIcons[note.category]}" aria-hidden="true"></i>${escapeHTML(note.category)}</span><span class="note-time">${timeAgo(note.created)}</span><div class="note-reactions"><button class="reaction-button ${note.liked ? 'is-active' : ''}" data-like="${note.id}" aria-label="共鸣，${note.likes} 次" aria-pressed="${note.liked}"><i class="ti ti-heart${note.liked ? '-filled' : ''}" aria-hidden="true"></i><span>${note.likes}</span></button><button class="reaction-button" data-open="${note.id}" aria-label="查看 ${note.replies.length} 条回复"><i class="ti ti-message-circle" aria-hidden="true"></i><span>${note.replies.length}</span></button></div></div>`;
}
function render() {
  const list = filteredNotes();
  const previousListScroll = $('#feed-list').scrollTop;
  const pages = Math.max(1, Math.ceil(list.length / pageSize()));
  state.page = Math.min(state.page, pages - 1);
  const visibleNotes = list.slice(state.page * pageSize(), (state.page + 1) * pageSize());
  const feedTitles = { nearby: '附近留言', saved: '我的收藏', mine: '我的留言' };
  $('#feed-title').innerHTML = `${feedTitles[state.view]} <span id="feed-count">${list.length}</span>`;
  $('#location-label').textContent = `杭州，${area().name}`;
  $('#page-label').textContent = `${state.page + 1} / ${pages}`;
  $('#feed-prev').disabled = state.page === 0;
  $('#feed-next').disabled = state.page >= pages - 1;
  $('#export-button').hidden = state.view !== 'mine';
  $('#sort-label').textContent = { latest: '最新', distance: '最近', popular: '共鸣' }[state.sort];
  $$('[data-view]').forEach(button => {
    const active = button.dataset.view === state.view;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  $$('[data-category]').forEach(button => {
    const active = button.dataset.category === state.category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active);
  });
  $$('[data-sort]').forEach(button => button.classList.toggle('is-active', button.dataset.sort === state.sort));
  $('#feed-list').innerHTML = list.length ? visibleNotes.map((note, index) => `<article class="note-card ${initialRender ? 'is-entering' : ''} ${note.id === state.selected ? 'is-selected' : ''}" tabindex="0" data-note="${note.id}" aria-label="${escapeHTML(note.author)}的留言" style="--index:${Math.min(index, 4)}">${noteHeader(note)}<p class="note-content">${escapeHTML(note.content)}</p>${noteFooter(note)}</article>`).join('') : `<div class="feed-empty"><i class="ti ti-${state.view === 'saved' ? 'bookmark' : state.view === 'mine' ? 'pencil' : 'message-off'}" aria-hidden="true"></i><p>${state.query || state.category !== 'all' ? '没有找到这样的声音' : state.view === 'saved' ? '还没有收藏的声音' : state.view === 'mine' ? '你还没有留下声音' : '这一带，还很安静'}</p><button data-empty-action>${state.query || state.category !== 'all' ? '清除筛选' : state.view === 'nearby' ? (state.radius < 3000 ? '扩大方圆' : '留个言') : state.view === 'mine' ? '留个言' : '去听听附近'}</button></div>`;
  const selected = getNote(state.selected);
  if (selected) renderDetail(selected); else {
    state.selected = null;
    $('.feed-panel').classList.remove('is-detail');
    $('#feed-header').hidden = false;
    $('#feed-list').hidden = false;
    $('#detail-panel').hidden = true;
  }
  renderMap(list);
  $('#feed-list').scrollTop = previousListScroll;
  updateIndicators();
  initialRender = false;
}
function renderDetail(note) {
  $('.feed-panel').classList.add('is-detail');
  $('#feed-header').hidden = true;
  $('#feed-list').hidden = true;
  const panel = $('#detail-panel');
  const previousScroll = $('.detail-scroll', panel)?.scrollTop || 0;
  const input = $('#reply-input', panel);
  const draft = input?.value || '';
  const focused = document.activeElement === input;
  panel.hidden = false;
  const remainingHours = Math.max(1, Math.ceil((note.expires - Date.now()) / 3600000));
  const expiry = remainingHours >= 24 ? `${Math.ceil(remainingHours / 24)} 天后消失` : `${remainingHours} 小时后消失`;
  panel.innerHTML = `<div class="detail-toolbar"><button class="icon-button" id="back-to-feed" aria-label="返回留言列表"><i class="ti ti-arrow-left" aria-hidden="true"></i></button><span>一条附近的声音</span><div class="detail-tools"><button class="icon-button" data-save="${note.id}" aria-label="${note.saved ? '取消收藏' : '收藏留言'}" aria-pressed="${note.saved}"><i class="ti ti-bookmark${note.saved ? '-filled' : ''}" aria-hidden="true"></i></button><button class="icon-button" data-copy="${note.id}" aria-label="复制留言"><i class="ti ti-copy" aria-hidden="true"></i></button><button class="icon-button" data-${note.mine ? 'delete' : 'report'}="${note.id}" aria-label="${note.mine ? '收回留言' : '隐藏留言'}"><i class="ti ti-${note.mine ? 'trash' : 'dots'}" aria-hidden="true"></i></button></div></div><div class="detail-scroll"><section class="detail-main">${noteHeader(note)}<p class="note-content">${escapeHTML(note.content)}</p><div class="note-footer"><span class="note-category"><i class="ti ti-${categoryIcons[note.category]}" aria-hidden="true"></i>${note.category}</span><span class="note-time">${timeAgo(note.created)}</span></div><div class="detail-actions"><button class="reaction-button ${note.liked ? 'is-active' : ''}" data-like="${note.id}" aria-pressed="${note.liked}"><i class="ti ti-heart${note.liked ? '-filled' : ''}" aria-hidden="true"></i>共鸣 ${note.likes}</button><span class="detail-expiry"><i class="ti ti-hourglass" aria-hidden="true"></i>${expiry}</span></div></section><section class="detail-discussion"><h3 class="replies-heading">回音<span>${note.replies.length}</span></h3><div class="replies-list">${note.replies.length ? note.replies.map(reply => `<div class="reply-item"><span class="note-avatar"><i class="ti ti-${escapeHTML(reply.icon)}" aria-hidden="true"></i></span><div class="reply-body"><div class="reply-meta"><span>${escapeHTML(reply.author)}</span><span>${timeAgo(reply.created)}</span></div><p class="reply-content">${escapeHTML(reply.content)}</p></div></div>`).join('') : `<p class="no-replies">${note.allowReplies ? '做第一个听见的人。' : '这条声音不接收回复。'}</p>`}</div></section></div><form class="reply-form" id="reply-form"><label class="sr-only" for="reply-input">匿名回复</label><input id="reply-input" name="reply" placeholder="${note.allowReplies ? '匿名回一句…' : '这条留言已关闭回复'}" maxlength="200" autocomplete="off" ${note.allowReplies ? '' : 'disabled'}><button type="submit" class="icon-button" aria-label="发送匿名回复" ${note.allowReplies ? '' : 'disabled'}><i class="ti ti-send" aria-hidden="true"></i></button><span class="reply-error" id="reply-error" role="alert" hidden></span></form>`;
  $('.detail-scroll', panel).scrollTop = previousScroll;
  $('#reply-input', panel).value = draft;
  if (focused) $('#reply-input', panel).focus();
}
function renderMap(list) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const group = $('#map-markers');
  const visibleIds = new Set(list.map(note => note.id));
  $$('[data-open]', group).forEach(marker => { if (!visibleIds.has(marker.dataset.open)) marker.remove(); });
  list.forEach(note => {
    let marker = $(`[data-open="${note.id}"]`, group);
    if (!marker) {
      marker = document.createElementNS(svgNS, 'g');
      marker.classList.add('map-marker');
      marker.setAttribute('transform', `translate(${note.x} ${note.y})`);
      marker.setAttribute('tabindex', '0');
      marker.setAttribute('role', 'button');
      marker.dataset.open = note.id;
      marker.innerHTML = `<circle class="marker-hit" r="25"/><g class="marker-body"><ellipse class="marker-shadow" cx="0" cy="12" rx="17" ry="4"/><path class="marker-shape" d="M-16-19h32a7 7 0 0 1 7 7v17a7 7 0 0 1-7 7H4l-4 6-4-6h-12a7 7 0 0 1-7-7v-17a7 7 0 0 1 7-7Z"/><path class="marker-symbol" d="M-9-10H9v13H2L-3 7V3H-9Z M-5-5H5 M-5-1H1"/></g>`;
      marker.addEventListener('pointerenter', event => {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        highlightNote(note.id);
        showMapTooltip(note, event);
      });
      marker.addEventListener('pointermove', event => { if (!$('#map-tooltip').hidden) showMapTooltip(note, event); });
      marker.addEventListener('pointerleave', () => { hideMapTooltip(); highlightNote(null); });
      marker.addEventListener('focus', () => {
        const bounds = marker.getBoundingClientRect();
        highlightNote(note.id);
        showMapTooltip(note, { clientX: bounds.x + bounds.width / 2, clientY: bounds.y });
      });
      marker.addEventListener('blur', () => { hideMapTooltip(); highlightNote(null); });
      group.append(marker);
      if (!initialRender) animateUI($('.marker-body', marker), [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], '--duration-feedback');
    }
    marker.classList.toggle('is-selected', note.id === (state.selected || list.find(item => item.id === 'lake')?.id || list[0]?.id));
    marker.setAttribute('aria-label', `${note.author}：${note.content}${state.distance ? `，${formatDistance(distance(note))}` : ''}`);
  });
  $('#origin-marker').style.transform = `translate(${area().x}px, ${area().y}px)`;
  ['#range-fill', '#range-boundary'].forEach(selector => {
    $(selector).style.transform = `translate(${area().x}px, ${area().y}px) scale(${state.radius / 500})`;
  });
  const voices = $('#map-voices');
  const voiceNotes = [...list].sort((a, b) => Number(b.id === state.selected) - Number(a.id === state.selected)).slice(0, 4);
  const voiceIds = new Set(voiceNotes.map(note => note.id));
  $$('[data-voice]', voices).forEach(button => { if (!voiceIds.has(button.dataset.voice)) button.remove(); });
  voiceNotes.forEach(note => {
    let button = $(`[data-voice="${note.id}"]`, voices);
    if (!button) {
      button = document.createElement('button');
      button.className = 'map-voice';
      button.dataset.voice = note.id;
      button.dataset.open = note.id;
      button.innerHTML = `<i class="ti ti-${escapeHTML(note.icon)}" aria-hidden="true"></i><span></span>`;
      button.addEventListener('pointerenter', () => {
        if (matchMedia('(hover: hover) and (pointer: fine)').matches) highlightNote(note.id);
      });
      button.addEventListener('pointerleave', () => highlightNote(null));
      button.addEventListener('focus', () => highlightNote(note.id));
      button.addEventListener('blur', () => highlightNote(null));
      voices.append(button);
    }
    const headline = note.content.split('\n')[0];
    $('span', button).textContent = headline.length > 25 ? `${headline.slice(0, 24)}…` : headline;
    button.setAttribute('aria-label', `${note.author}：${note.content}`);
    button.classList.toggle('is-selected', note.id === state.selected);
  });
  applyMapTransform();
}
function highlightNote(id) {
  $$('.map-marker').forEach(marker => marker.classList.toggle('is-highlighted', marker.dataset.open === id));
  $$('.note-card').forEach(card => card.classList.toggle('is-highlighted', card.dataset.note === id));
  $$('.map-voice').forEach(button => button.classList.toggle('is-highlighted', button.dataset.voice === id));
}
function centerMap(point = area()) {
  const map = $('#neighborhood-map');
  const bounds = map.getBoundingClientRect();
  const inverse = map.getScreenCTM()?.inverse();
  if (!inverse) return;
  const trayTop = $('.feed-panel').getBoundingClientRect().top - bounds.top;
  const target = new DOMPoint(bounds.left + bounds.width * .5, bounds.top + Math.max(145, (155 + trayTop - 65) / 2)).matrixTransform(inverse);
  state.panX = target.x - 500 - (point.x - 500) * state.zoom;
  state.panY = target.y - 415 - (point.y - 415) * state.zoom;
}
function applyMapTransform() {
  $('#map-scene').style.transform = `translate(${state.panX}px, ${state.panY}px) translate(500px, 415px) scale(${state.zoom}) translate(-500px, -415px)`;
  $('#zoom-in').disabled = state.zoom >= 2;
  $('#zoom-out').disabled = state.zoom <= .6;
  $('#scale-label').textContent = `${Math.round(200 / state.zoom / 10) * 10} m`;
  positionMapVoices();
}
function positionMapVoices() {
  const svg = $('#neighborhood-map');
  const matrix = svg.getScreenCTM();
  if (!matrix) return;
  const bounds = $('.map-panel').getBoundingClientRect();
  const bottom = Math.min($('.feed-panel').getBoundingClientRect().top - bounds.top - 14, $('.map-bottom').getBoundingClientRect().top - bounds.top - 8);
  const top = 164;
  const occupied = [];
  $$('[data-voice]', $('#map-voices')).forEach(button => {
    const note = getNote(button.dataset.voice);
    if (!note) return;
    const projected = new DOMPoint(state.panX + 500 + (note.x - 500) * state.zoom, state.panY + 415 + (note.y - 415) * state.zoom).matrixTransform(matrix);
    const px = projected.x - bounds.left;
    const py = projected.y - bounds.top;
    button.hidden = false;
    const width = button.offsetWidth;
    const height = button.offsetHeight;
    const candidates = [
      { x: px - width / 2, y: py - height - 30 },
      { x: px + 30, y: py - height / 2 },
      { x: px - width - 30, y: py - height / 2 },
      { x: px - width / 2, y: py + 30 }
    ];
    const placement = candidates.find(candidate => candidate.x >= 16 && candidate.x + width <= bounds.width - 72 && candidate.y >= top && candidate.y + height <= bottom && !occupied.some(rect => candidate.x < rect.x + rect.width + 12 && candidate.x + width + 12 > rect.x && candidate.y < rect.y + rect.height + 12 && candidate.y + height + 12 > rect.y));
    if (!placement) { button.hidden = true; return; }
    button.style.transform = `translate(${placement.x}px, ${placement.y}px)`;
    occupied.push({ ...placement, width, height });
  });
}
function showMapTooltip(note, event) {
  const tooltip = $('#map-tooltip');
  const bounds = $('.map-panel').getBoundingClientRect();
  tooltip.textContent = `${note.author}${state.distance ? ` / ${formatDistance(distance(note))}` : ''}：${note.content.split('\n')[0]}`;
  tooltip.hidden = false;
  tooltip.style.left = `${Math.max(8, Math.min(event.clientX - bounds.left + 12, bounds.width - tooltip.offsetWidth - 8))}px`;
  tooltip.style.top = `${Math.max(8, Math.min(event.clientY - bounds.top - tooltip.offsetHeight - 16, bounds.height - tooltip.offsetHeight - 8))}px`;
}
function hideMapTooltip() { $('#map-tooltip').hidden = true; }
function openNote(id) {
  if (!getNote(id)) return;
  clearTimeout(areaTimer);
  state.selected = id;
  const index = filteredNotes().findIndex(note => note.id === id);
  if (index >= 0) state.page = Math.floor(index / pageSize());
  $('#detail-panel').innerHTML = '';
  hideMapTooltip();
  render();
  centerMap(getNote(id));
  applyMapTransform();
  $('#back-to-feed').focus({ preventScroll: true });
}
function returnToFeed() {
  const previous = state.selected;
  state.selected = null;
  render();
  centerMap();
  applyMapTransform();
  const previousCard = $(`[data-note="${previous}"]`);
  if (previousCard) previousCard.focus({ preventScroll: true });
  else $('#feed-title').focus({ preventScroll: true });
  animateUI($('#feed-list'), [{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], '--duration-feedback');
}
function changeView(view) {
  clearTimeout(areaTimer);
  state.view = view;
  state.page = 0;
  state.selected = null;
  state.category = 'all';
  state.query = '';
  $('#search-input').value = '';
  $('#sort-menu').hidden = true;
  $('#sort-button').setAttribute('aria-expanded', 'false');
  hideMapTooltip();
  render();
  $('#feed-list').scrollTop = 0;
  animateUI($('#feed-list'), [{ opacity: .4, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], '--duration-feedback');
}
function setRadius(radius) {
  state.radius = radius;
  state.page = 0;
  state.selected = null;
  $$('[data-radius]').forEach(button => {
    const active = Number(button.dataset.radius) === radius;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active);
  });
  const desiredZoom = { 300: 1.2, 500: 1, 1000: .8, 3000: .6 }[radius];
  state.zoom = desiredZoom;
  centerMap();
  render();
}
function showCompose() {
  $('#compose-location').textContent = `${area().name}附近`;
  $('#compose-dialog').showModal();
}
$$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));
$('#compose-button').addEventListener('click', showCompose);
['feed-prev', 'feed-next'].forEach(id => $(`#${id}`).addEventListener('click', () => {
  clearTimeout(areaTimer);
  const direction = id === 'feed-next' ? 1 : -1;
  const lastPage = Math.max(0, Math.ceil(filteredNotes().length / pageSize()) - 1);
  state.page = Math.max(0, Math.min(lastPage, state.page + direction));
  hideMapTooltip();
  render();
  $('#feed-list').scrollTop = 0;
  if ($(`#${id}`).disabled) $(`#${id === 'feed-next' ? 'feed-prev' : 'feed-next'}`).focus({ preventScroll: true });
  animateUI($('#feed-list'), [{ opacity: .5, transform: `translateX(${direction * 8}px)` }, { opacity: 1, transform: 'translateX(0)' }], '--duration-feedback');
}));
$('.brand').addEventListener('click', event => { event.preventDefault(); changeView('nearby'); });
$$('[data-view]').forEach(button => button.addEventListener('click', () => changeView(button.dataset.view)));
$$('[data-category]').forEach(button => button.addEventListener('click', () => {
  state.category = button.dataset.category;
  state.page = 0;
  state.selected = null;
  render();
  $('#feed-list').scrollTop = 0;
  animateUI($('#feed-list'), [{ opacity: .5 }, { opacity: 1 }], '--duration-feedback');
}));
$$('[data-radius]').forEach(button => button.addEventListener('click', () => { clearTimeout(areaTimer); setRadius(Number(button.dataset.radius)); }));
$('#search-input').addEventListener('input', event => { state.query = event.target.value.trim(); state.page = 0; state.selected = null; render(); });
$('#sort-button').addEventListener('click', () => {
  const menu = $('#sort-menu');
  menu.hidden = !menu.hidden;
  $('#sort-button').setAttribute('aria-expanded', !menu.hidden);
  if (!menu.hidden) $('button', menu).focus();
});
$$('[data-sort]').forEach(button => button.addEventListener('click', () => {
  state.sort = button.dataset.sort;
  state.page = 0;
  $('#sort-menu').hidden = true;
  $('#sort-button').setAttribute('aria-expanded', 'false');
  render();
  $('#sort-button').focus();
}));
$('#sort-menu').addEventListener('keydown', event => {
  const items = $$('button', $('#sort-menu'));
  const index = items.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
  }
});
$('#location-button').addEventListener('click', () => {
  $$('[data-location]').forEach(button => {
    const active = button.dataset.location === state.area;
    button.classList.toggle('is-active', active);
    $('.location-check', button).hidden = !active;
  });
  $('#location-dialog').showModal();
});
$$('[data-location]').forEach(button => button.addEventListener('click', () => {
  clearTimeout(areaTimer);
  state.area = button.dataset.location;
  state.page = 0;
  centerMap();
  state.selected = null;
  state.query = '';
  $('#search-input').value = '';
  $('#location-dialog').close();
  render();
  $('#feed-list').innerHTML = '<div class="feed-empty loading-state" role="status"><i class="ti ti-loader-2" aria-hidden="true"></i><p>正在听附近的声音</p></div>';
  areaTimer = setTimeout(render, 360);
}));
$('#map-info-button').addEventListener('click', () => $('#settings-dialog').showModal());
$('#settings-button').addEventListener('click', () => $('#settings-dialog').showModal());
$('#distance-setting').addEventListener('change', event => { state.distance = event.target.checked; render(); });
$('#reply-setting').addEventListener('change', event => { state.allowReplies = event.target.checked; });
$('#motion-setting').addEventListener('change', event => {
  document.body.classList.toggle('no-motion', !event.target.checked);
  if (!event.target.checked) stopAnimations();
});
$('#notifications-button').addEventListener('click', () => {
  const notifications = notes.filter(note => note.mine && !note.hidden).flatMap(note => note.replies.filter(reply => reply.author !== '一颗松果').map(reply => ({ ...reply, noteId: note.id }))).sort((a, b) => b.created - a.created);
  $('#notification-list').innerHTML = notifications.length ? notifications.map(reply => `<button class="notification-item" data-notification="${reply.noteId}"><span class="note-avatar"><i class="ti ti-${escapeHTML(reply.icon)}" aria-hidden="true"></i></span><span><strong>${escapeHTML(reply.author)}回复了你</strong><p>${escapeHTML(reply.content)}</p><small>${timeAgo(reply.created)}</small></span></button>`).join('') : '<div class="feed-empty"><i class="ti ti-message-circle" aria-hidden="true"></i><p>还没有新的回音</p></div>';
  $('.notification-dot').hidden = true;
  $('#notifications-dialog').showModal();
});
$$('[data-compose-category]').forEach(button => button.addEventListener('click', () => {
  state.composeCategory = button.dataset.composeCategory;
  $$('[data-compose-category]').forEach(item => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', active);
  });
}));
$('#note-content').addEventListener('input', event => {
  $('#character-count').textContent = event.target.value.length;
  $('#compose-error').textContent = '';
});
$('#compose-form').addEventListener('submit', event => {
  event.preventDefault();
  const content = $('#note-content').value.trim();
  if (!content) { $('#compose-error').textContent = '写下一点什么，再留下。'; $('#note-content').focus(); return; }
  const timestamp = Date.now();
  const note = { id: `note-${timestamp}`, author: '一颗松果', icon: 'seeding', content, category: state.composeCategory, x: area().x + 26, y: area().y - 32, created: timestamp, expires: timestamp + Number($('#note-lifetime').value) * 3600000, mine: true, likes: 0, liked: false, saved: false, replies: [], hidden: false, allowReplies: state.allowReplies };
  notes.unshift(note);
  $('#compose-dialog').close();
  $('#note-content').value = '';
  $('#character-count').textContent = '0';
  changeView('mine');
  openNote(note.id);
  showToast('已加入当前页面的附近留言');
});
$('#export-button').addEventListener('click', () => {
  const mine = notes.filter(note => note.mine && !note.hidden);
  if (!mine.length) { showToast('还没有可以导出的留言', 'info-circle'); return; }
  const data = mine.map(note => ({ 内容: note.content, 分类: note.category, 留言时间: new Date(note.created).toISOString(), 失效时间: new Date(note.expires).toISOString(), 共鸣: note.likes, 回复: note.replies.map(reply => ({ 匿名昵称: reply.author, 内容: reply.content })) }));
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = '方圆-我的留言.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('已导出当前页面的留言');
});
$('#report-form').addEventListener('submit', event => {
  event.preventDefault();
  const note = getNote(state.reportId);
  if (note) note.hidden = true;
  state.selected = null;
  $('#report-dialog').close();
  render();
  showToast('这条留言已从当前页面隐藏');
});
$('#confirm-delete').addEventListener('click', () => {
  const index = notes.findIndex(note => note.id === state.deleteId && note.mine);
  if (index !== -1) notes.splice(index, 1);
  state.selected = null;
  $('#delete-dialog').close();
  render();
  showToast('已收回这条留言');
});
document.addEventListener('click', async event => {
  const target = event.target.closest('button, [data-note]');
  if (!event.target.closest('.sort-wrapper')) {
    $('#sort-menu').hidden = true;
    $('#sort-button').setAttribute('aria-expanded', 'false');
  }
  if (!target) return;
  if (target.dataset.like) {
    const note = getNote(target.dataset.like);
    if (!note) return;
    note.liked = !note.liked;
    note.likes += note.liked ? 1 : -1;
    const id = note.id;
    render();
    const focus = state.selected ? $(`[data-like="${id}"]`, $('#detail-panel')) : $(`[data-like="${id}"]`, $('#feed-list'));
    focus?.focus({ preventScroll: true });
    if (note.liked) animateUI($('.ti', focus), [{ transform: 'scale(.9)' }, { transform: 'scale(1.18)', offset: .45 }, { transform: 'scale(1)' }], '--duration-feedback');
  } else if (target.dataset.open) openNote(target.dataset.open);
  else if (target.dataset.note) openNote(target.dataset.note);
  else if (target.id === 'back-to-feed') returnToFeed();
  else if (target.dataset.save) {
    const note = getNote(target.dataset.save);
    if (!note) return;
    note.saved = !note.saved;
    render();
    const saveButton = $(`[data-save="${note.id}"]`);
    saveButton?.focus({ preventScroll: true });
    if (note.saved) animateUI($('.ti', saveButton), [{ transform: 'translateY(-4px)', opacity: .4 }, { transform: 'translateY(0)', opacity: 1 }], '--duration-feedback');
    showToast(note.saved ? '已收藏这条声音' : '已取消收藏');
  } else if (target.dataset.copy) {
    const note = getNote(target.dataset.copy);
    if (!note) return;
    try {
      await navigator.clipboard.writeText(note.content);
      showToast('留言已复制');
    } catch {
      showToast('无法读取剪贴板权限，请手动选中文字复制', 'info-circle');
    }
  } else if (target.dataset.report) {
    state.reportId = target.dataset.report;
    $('#report-dialog').showModal();
  } else if (target.dataset.delete) {
    state.deleteId = target.dataset.delete;
    $('#delete-dialog').showModal();
  } else if (target.dataset.notification) {
    $('#notifications-dialog').close();
    changeView('mine');
    openNote(target.dataset.notification);
  } else if (target.hasAttribute('data-empty-action')) {
    if (state.query || state.category !== 'all') {
      state.query = ''; state.category = 'all'; state.page = 0; $('#search-input').value = ''; render();
    } else if (state.view === 'mine') showCompose();
    else if (state.view === 'saved') changeView('nearby');
    else if (state.radius < 3000) setRadius(state.radius < 1000 ? 1000 : 3000);
    else showCompose();
  }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'reply-form') return;
  event.preventDefault();
  const note = getNote(state.selected);
  if (!note?.allowReplies) return;
  const input = $('#reply-input');
  const content = input.value.trim();
  if (!content) {
    $('#reply-error').textContent = '先写一句回音。';
    $('#reply-error').hidden = false;
    input.focus();
    return;
  }
  note.replies.push({ author: '一颗松果', icon: 'seeding', content, created: Date.now() });
  input.value = '';
  render();
  const scroll = $('.detail-scroll');
  scroll.scrollTop = scroll.scrollHeight;
  $('#reply-input').focus();
  animateUI($('.reply-item:last-child'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }]);
  showToast('已加入当前页面的回音');
});
document.addEventListener('input', event => {
  if (event.target.id === 'reply-input') $('#reply-error').hidden = true;
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    if ($('dialog[open]')) return;
    event.preventDefault();
    $('#search-input').focus();
  }
  if (event.key === 'Escape' && !$('dialog[open]')) {
    if (!$('#sort-menu').hidden) {
      $('#sort-menu').hidden = true;
      $('#sort-button').setAttribute('aria-expanded', 'false');
      $('#sort-button').focus();
    } else if (state.selected) returnToFeed();
    hideMapTooltip();
  }
  if ((event.key === 'Enter' || event.key === ' ') && (event.target.matches('[data-note]') || event.target.matches('.map-marker'))) {
    event.preventDefault();
    openNote(event.target.dataset.note || event.target.dataset.open);
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && $('#compose-dialog').open) $('#compose-form').requestSubmit();
});
['zoom-in', 'zoom-out'].forEach(id => $(`#${id}`).addEventListener('click', () => {
  state.zoom = Math.max(.6, Math.min(2, Math.round((state.zoom + (id === 'zoom-in' ? .2 : -.2)) * 10) / 10));
  centerMap(getNote(state.selected) || area());
  applyMapTransform();
}));
$('#recenter-button').addEventListener('click', () => {
  centerMap();
  applyMapTransform();
});
const map = $('#neighborhood-map');
let drag;
let preventMapClick = false;
map.addEventListener('pointerdown', event => {
  if (drag || event.button !== 0 || event.target.closest('.map-marker')) return;
  const inverse = map.getScreenCTM()?.inverse();
  if (!inverse) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(inverse);
  drag = { id: event.pointerId, startX: point.x, startY: point.y, panX: state.panX, panY: state.panY, moved: false };
  map.setPointerCapture(event.pointerId);
  map.classList.add('is-dragging');
  hideMapTooltip();
});
map.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const inverse = map.getScreenCTM()?.inverse();
  if (!inverse) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(inverse);
  const deltaX = point.x - drag.startX;
  const deltaY = point.y - drag.startY;
  if (Math.hypot(deltaX, deltaY) > 4) drag.moved = true;
  state.panX = Math.max(-700, Math.min(700, drag.panX + deltaX));
  state.panY = Math.max(-600, Math.min(600, drag.panY + deltaY));
  applyMapTransform();
});
function endDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  preventMapClick = drag.moved;
  drag = null;
  map.classList.remove('is-dragging');
  if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
}
map.addEventListener('pointerup', endDrag);
map.addEventListener('pointercancel', endDrag);
map.addEventListener('click', event => {
  if (preventMapClick) { event.stopPropagation(); preventMapClick = false; return; }
  const marker = event.target.closest('.map-marker');
  if (marker) { event.stopPropagation(); openNote(marker.dataset.open); }
});
$('#feed-list').addEventListener('pointerover', event => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const card = event.target.closest('[data-note]');
  if (card && !card.contains(event.relatedTarget)) highlightNote(card.dataset.note);
});
$('#feed-list').addEventListener('pointerout', event => {
  const card = event.target.closest('[data-note]');
  if (card && !card.contains(event.relatedTarget)) highlightNote(null);
});
$('#feed-list').addEventListener('focusin', event => highlightNote(event.target.closest('[data-note]')?.dataset.note));
$('#feed-list').addEventListener('focusout', event => {
  if (!$('#feed-list').contains(event.relatedTarget)) highlightNote(null);
});
render();
