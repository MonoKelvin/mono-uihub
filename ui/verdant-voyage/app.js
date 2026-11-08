'use strict';

const places = [
  { id: 'angkor', name: '吴哥窟', english: 'ANGKOR WAT', area: 'angkor', category: 'culture', image: './assets/angkor-wat.webp', location: '暹粒，柬埔寨', coordinate: '13°24′45″N · 103°52′02″E', description: '穿过石廊，等一场千年的日出。', story: '沿西侧石桥走入高棉文明的中心。莲花状的塔群与层叠回廊之间，浮雕记录着神话、战争与日常；清晨的光线让古老的砂岩慢慢苏醒。', duration: 3, time: '05:00—17:30', best: '清晨 05:30', tip: '参观寺庙请穿着遮住肩膀与膝盖的衣物。', period: '12 世纪', source: 'https://pixabay.com/photos/cambodia-hindhuism-angkor-temple-1600376/' },
  { id: 'bayon', name: '巴戎寺', english: 'BAYON TEMPLE', area: 'thom', category: 'culture', image: './assets/bayon-temple.webp', location: '吴哥王城，暹粒', coordinate: '13°26′30″N · 103°51′34″E', description: '在石塔之间，遇见高棉的微笑。', story: '吴哥王城中央，巨大的石面像向四方凝望。沿着安静的回廊，细看雕刻中的集市与舟船，再走上平台感受石塔之间的光影。', duration: 2, time: '07:30—17:30', best: '上午 08:00', tip: '通道与石阶较窄，建议穿着防滑的步行鞋。', period: '12—13 世纪', source: 'https://pixabay.com/photos/cambodia-siem-reap-angkor-wat-bayon-1069660/' },
  { id: 'ta-prohm', name: '塔布隆寺', english: 'TA PROHM', area: 'outer', category: 'nature', image: './assets/ta-prohm.webp', location: '吴哥古迹区，暹粒', coordinate: '13°26′06″N · 103°53′21″E', description: '树根与石墙，让时间长在一起。', story: '榕树的根系穿过石墙，丛林缓慢地收回这座寺庙。沿着允许通行的石廊漫步，苔藓、树影与坍塌的拱门构成一段安静的林间旅程。', duration: 2, time: '07:30—17:30', best: '上午 09:00', tip: '请勿攀爬古迹或树根，雨后石面容易湿滑。', period: '12 世纪', source: 'https://pixabay.com/photos/ta-prohm-temple-tomb-raider-fame-934058/' }
];

const state = {
  view: 'discover', selected: 'angkor', category: 'all', region: 'all', query: '', day: 0,
  saved: new Set(['ta-prohm']), itinerary: [['bayon', 'ta-prohm'], [], []],
  journeyName: '暹粒行记', startDate: '2026-11-18', travelers: 2,
  reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, travelTips: true, exporting: false
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const findPlace = (id) => places.find((place) => place.id === id);
const bookmark = '<svg class="bookmark-icon" aria-hidden="true"><use href="#bookmark"/></svg>';
let started = false;
let toastTimer;
let returnFocus;

function visiblePlaces() {
  return places.filter((place) =>
    (state.view !== 'saved' || state.saved.has(place.id)) &&
    (state.view !== 'itinerary' || state.itinerary[state.day].includes(place.id)) &&
    (state.category === 'all' || place.category === state.category) &&
    (state.region === 'all' || place.area === state.region) &&
    `${place.name} ${place.english} ${place.location}`.toLowerCase().includes(state.query.toLowerCase().trim())
  );
}

function dateForDay(day) {
  const date = new Date(`${state.startDate}T12:00:00`);
  date.setDate(date.getDate() + day);
  return date;
}

function toast(message, isError = false) {
  clearTimeout(toastTimer);
  const element = $('#toast');
  element.querySelector('span').textContent = message;
  element.querySelector('i').className = isError ? 'ti ti-alert-circle' : 'ti ti-check';
  element.classList.toggle('is-error', isError);
  element.classList.add('is-visible');
  toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
}

function renderHero(place, list) {
  const image = $('#hero-image');
  if (image.getAttribute('src') !== place.image) {
    $('#hero-error').hidden = true;
    $('#hero').classList.add('is-loading');
    image.src = place.image;
  }
  image.alt = `${place.name}的古迹与自然景观`;
  $('#hero-title').textContent = place.name;
  $('#hero-english').textContent = place.english;
  $('#hero-location').textContent = place.location;
  $('#hero-coordinate').textContent = place.coordinate;
  $('#hero-description').textContent = place.description;
  $('#hero-category').textContent = `世界遗产 · ${place.category === 'nature' ? '林野' : '石迹'}`;
  const saved = state.saved.has(place.id);
  $('#hero-save').setAttribute('aria-pressed', String(saved));
  $('#hero-save').setAttribute('aria-label', `${saved ? '取消收藏' : '收藏'}${place.name}`);
  const position = list.findIndex((item) => item.id === place.id);
  $('#hero-position').innerHTML = `${String(position + 1).padStart(2, '0')} <span>/ ${String(list.length).padStart(2, '0')}</span>`;
  $('#hero-prev').disabled = position <= 0;
  $('#hero-next').disabled = position >= list.length - 1;
}

function renderCards(list) {
  $('#destination-grid').innerHTML = list.map((place) => {
    const saved = state.saved.has(place.id);
    return `<article class="destination-card ${place.id === state.selected ? 'is-current' : ''}">
      <button class="destination-pick" data-place="${place.id}" aria-label="查看${place.name}" aria-pressed="${place.id === state.selected}">
        <div class="destination-photo"><img src="${place.image}" alt="${place.name}" loading="lazy"><span class="photo-error" hidden>照片暂不可用</span></div>
        <div class="card-info"><strong>${place.name}</strong><span>${place.category === 'nature' ? '林野' : '石迹'} · ${place.duration} 小时</span></div>
      </button>
      <button class="icon-button save-button" data-save="${place.id}" aria-pressed="${saved}" aria-label="${saved ? '取消收藏' : '收藏'}${place.name}">${bookmark}</button>
    </article>`;
  }).join('');
}

function render() {
  const list = visiblePlaces();
  if (list.length && !list.some((place) => place.id === state.selected)) state.selected = list[0].id;
  const titles = { discover: ['目的地', '高棉石迹', '文化与自然', '附近值得去'], saved: ['心愿清单', '想去的地方', '收藏你的下一次出发', '收藏的目的地'], itinerary: ['我的行程', state.journeyName, '每一天，循迹而行', '当日目的地'] };
  const [label, title, section, galleryTitle] = titles[state.view];
  $('#view-label').textContent = label;
  $('#view-title').textContent = title;
  $('#section-label').textContent = section;
  $('#destinations-title').textContent = galleryTitle;
  $$('.nav-item').forEach((item, index) => {
    const active = item.dataset.view === state.view;
    item.classList.toggle('is-active', active);
    if (active) {
      item.setAttribute('aria-current', 'page');
      $('.nav-indicator').style.transform = `translateY(${index * 4.35}cqw)`;
    } else item.removeAttribute('aria-current');
  });
  $('#saved-count').textContent = state.saved.size;
  $$('.category-tabs button').forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle('is-selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#hero').hidden = !list.length;
  $('#empty-state').hidden = Boolean(list.length);
  $('#destination-grid').hidden = !list.length;
  $('#discover-panel').classList.toggle('is-empty', !list.length);
  if (list.length) renderHero(findPlace(state.selected), list);
  else {
    const emptySaved = state.view === 'saved' && !state.saved.size;
    const emptyDay = state.view === 'itinerary' && !state.itinerary[state.day].length;
    $('#empty-title').textContent = emptySaved ? '把想去的地方，留在这里' : emptyDay ? '这一天，还没有安排' : '还没有找到这处目的地';
    $('#empty-description').textContent = emptySaved ? '收藏一个目的地，留给下一次出发。' : emptyDay ? '从目的地开始，慢慢排好你的旅程。' : '换个关键词，或看看所有目的地。';
  }
  renderCards(list);
  $('#result-count').textContent = `${list.length} 处目的地 · 暹粒`;
  renderItinerary();
}

function renderItinerary() {
  const ids = state.itinerary[state.day];
  const begin = dateForDay(0);
  const end = dateForDay(2);
  $('#journey-name').textContent = state.journeyName;
  $('#journey-dates').textContent = `${begin.getMonth() + 1} 月 ${begin.getDate()} 日 — ${begin.getMonth() === end.getMonth() ? '' : `${end.getMonth() + 1} 月 `}${end.getDate()} 日`;
  $('#traveler-count').textContent = `${state.travelers} 位旅行者`;
  if (!$('#day-tabs [data-day]')) {
    $('#day-tabs').insertAdjacentHTML('beforeend', state.itinerary.map((_, day) => `<button role="tab" id="day-${day}" aria-controls="itinerary-list" data-day="${day}"></button>`).join(''));
  }
  $$('#day-tabs [data-day]').forEach((button, day) => {
    const date = dateForDay(day);
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    button.innerHTML = `<small>周${weekday}</small>${date.getDate()} 日`;
    button.setAttribute('aria-selected', String(day === state.day));
    button.tabIndex = day === state.day ? 0 : -1;
  });
  $('.day-indicator').style.transform = `translateX(${state.day * 100}%)`;
  $('#day-caption').textContent = `第 ${state.day + 1} 天 · ${['石迹漫步', '林间寻迹', '随心而行'][state.day]}`;
  $('#day-count').textContent = `${ids.length} 处`;
  $('#itinerary-list').setAttribute('aria-labelledby', `day-${state.day}`);
  $('#itinerary-list').innerHTML = ids.length ? ids.map((id, index) => {
    const place = findPlace(id);
    return `<li class="itinerary-item"><span class="stop-marker" aria-hidden="true"></span><div class="stop-top"><button class="stop-name" data-detail="${id}">${place.name}</button><div class="stop-actions"><button class="icon-button" data-move="${index}" data-direction="-1" aria-label="上移${place.name}" ${index === 0 ? 'disabled' : ''}><i class="ti ti-arrow-up" aria-hidden="true"></i></button><button class="icon-button" data-move="${index}" data-direction="1" aria-label="下移${place.name}" ${index === ids.length - 1 ? 'disabled' : ''}><i class="ti ti-arrow-down" aria-hidden="true"></i></button><button class="icon-button" data-remove="${id}" aria-label="移除${place.name}"><i class="ti ti-x" aria-hidden="true"></i></button></div></div><div class="stop-meta">${place.period} · 建议 ${place.duration} 小时</div></li>`;
  }).join('') : '<li class="day-empty"><i class="ti ti-route" aria-hidden="true"></i><span>留一点空白给新的风景</span></li>';
  const duration = ids.reduce((sum, id) => sum + findPlace(id).duration, 0);
  $('#trip-duration').textContent = duration ? `约 ${duration} 小时` : '尚未安排';
  $('#trip-places').textContent = `${ids.length} 处目的地`;
  $('#browse-places').disabled = ids.length >= 3;
  updateAddButton($('#add-to-trip'), state.selected, !visiblePlaces().length);
  const noPlaces = !state.itinerary.some((day) => day.length);
  [$('#export-journey'), $('#export-top')].forEach((button) => { button.disabled = state.exporting || noPlaces; });
}

function updateAddButton(button, id, noSelection = false) {
  const exists = state.itinerary[state.day].includes(id);
  const full = state.itinerary[state.day].length >= 3;
  button.disabled = noSelection || exists || full;
  button.classList.toggle('is-complete', exists);
  button.querySelector('span').textContent = exists ? `已在第 ${state.day + 1} 天` : noSelection ? '请先选择目的地' : full ? '当天已安排 3 处' : `加入第 ${state.day + 1} 天`;
  button.querySelector('i').className = exists ? 'ti ti-check' : 'ti ti-plus';
}

function selectPlace(id) {
  state.selected = id;
  render();
}

function navigate(view) {
  state.view = view;
  resetFilters(false);
  render();
}

function resetFilters(renderAfter = true) {
  state.query = '';
  state.region = 'all';
  state.category = 'all';
  $('#search').value = '';
  $('#region-label').textContent = '所有区域';
  $$('[data-region]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.region === 'all')));
  if (renderAfter) render();
}

function toggleSave(id) {
  const removed = state.saved.has(id);
  if (removed) state.saved.delete(id); else state.saved.add(id);
  render();
  toast(removed ? `已从心愿清单移除${findPlace(id).name}` : `已收藏${findPlace(id).name}`);
}

function addToTrip(id) {
  const day = state.itinerary[state.day];
  if (day.includes(id)) return;
  if (day.length >= 3) { toast('当天已安排 3 处，请先移除一处或切换日期', true); return; }
  day.push(id);
  render();
  toast(`${findPlace(id).name}已加入第 ${state.day + 1} 天`);
  const dialogAdd = $('#dialog-add');
  if (dialogAdd) updateAddButton(dialogAdd, id);
}

function setDay(day, focus = false) {
  state.day = day;
  render();
  if (focus) $(`#day-${day}`).focus();
}

function openRegion() {
  const menu = $('#region-menu');
  menu.hidden = false;
  $('#region-toggle').setAttribute('aria-expanded', 'true');
  menu.querySelector('[aria-selected="true"]').focus();
}

function closeRegion(focus = false) {
  $('#region-menu').hidden = true;
  $('#region-toggle').setAttribute('aria-expanded', 'false');
  if (focus) $('#region-toggle').focus();
}

function openDialog(html, focusSelector = '#dialog-close') {
  closeRegion();
  returnFocus = document.activeElement;
  $('#dialog-content').innerHTML = html;
  $('#dialog-layer').inert = false;
  $('#dialog-layer').setAttribute('aria-hidden', 'false');
  $('#dialog-layer').classList.add('is-open');
  ['.sidebar', '.topbar', '.discover', '.planner'].forEach((selector) => { $(selector).inert = true; });
  $(focusSelector).focus();
}

function closeDialog() {
  $('#dialog-layer').classList.remove('is-open');
  $('#dialog-layer').inert = true;
  $('#dialog-layer').setAttribute('aria-hidden', 'true');
  ['.sidebar', '.topbar', '.discover', '.planner'].forEach((selector) => { $(selector).inert = false; });
  if (returnFocus?.isConnected && !returnFocus.disabled) returnFocus.focus(); else $('#search').focus();
}

function openDetails(id = state.selected) {
  const place = findPlace(id);
  openDialog(`<div class="detail-layout"><div class="detail-image-wrap"><img src="${place.image}" alt="${place.name}的石构建筑"><span class="detail-image-caption">${place.coordinate}</span></div><div class="detail-content"><span class="eyebrow">${place.location} · 世界遗产</span><h2 id="dialog-title">${place.name}</h2><span class="detail-english">${place.english}</span><p>${place.story}</p><div class="detail-facts"><div><span>建议停留</span><strong>${place.duration} 小时</strong></div><div><span>适合抵达</span><strong>${place.best}</strong></div><div><span>开放时间</span><strong>${place.time}</strong></div><div><span>建筑年代</span><strong>${place.period}</strong></div></div><div class="detail-tip" ${state.travelTips ? '' : 'hidden'}><i class="ti ti-info-circle" aria-hidden="true"></i><span>${place.tip}</span></div><button class="primary-button" id="dialog-add" data-dialog-place="${id}"><i class="ti ti-plus" aria-hidden="true"></i><span>加入第 ${state.day + 1} 天</span></button></div></div>`);
  updateAddButton($('#dialog-add'), id);
}

function openJourneyForm() {
  openDialog(`<form class="form-panel" id="journey-form" novalidate><span class="eyebrow">旅程安排</span><h2 id="dialog-title">编辑这一段旅程</h2><p class="form-description">起一个名字，选好出发的日子。</p><div class="form-grid"><label class="field full-width"><span>旅程名称</span><input id="journey-name-input" name="name" maxlength="14" required aria-describedby="journey-error" autocomplete="off"></label><label class="field"><span>出发日期 · YYYY-MM-DD</span><input id="journey-date-input" name="date" inputmode="numeric" maxlength="10" required aria-describedby="journey-error" placeholder="2026-11-18"></label><label class="field"><span>旅行人数 · 1—8 位</span><input id="journey-travelers-input" name="travelers" type="number" min="1" max="8" required aria-describedby="journey-error"></label></div><p class="form-error" id="journey-error" role="alert"></p><div class="form-actions"><button class="quiet-button" type="button" data-close-dialog>取消</button><button class="primary-button" type="submit" id="journey-submit"><i class="ti ti-check" aria-hidden="true"></i><span>保存旅程</span></button></div></form>`, '#journey-name-input');
  $('#journey-name-input').value = state.journeyName;
  $('#journey-date-input').value = state.startDate;
  $('#journey-travelers-input').value = state.travelers;
}

function saveJourney(form) {
  const name = form.elements.name.value.trim();
  const date = form.elements.date.value.trim();
  const travelers = Number(form.elements.travelers.value);
  const parsed = new Date(`${date}T12:00:00`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === Number(date.slice(0, 4)) && parsed.getMonth() + 1 === Number(date.slice(5, 7)) && parsed.getDate() === Number(date.slice(8, 10));
  const invalid = !name ? ['name', '请填写旅程名称'] : !validDate ? ['date', '请输入有效日期，例如 2026-11-18'] : !Number.isInteger(travelers) || travelers < 1 || travelers > 8 ? ['travelers', '旅行人数应为 1—8 位'] : null;
  [...form.querySelectorAll('input')].forEach((input) => input.removeAttribute('aria-invalid'));
  if (invalid) {
    $('#journey-error').textContent = invalid[1];
    form.elements[invalid[0]].setAttribute('aria-invalid', 'true');
    form.elements[invalid[0]].focus();
    return;
  }
  state.journeyName = name;
  state.startDate = date;
  state.travelers = travelers;
  render();
  closeDialog();
  toast('旅程信息已更新');
}

function openPreferences() {
  openDialog(`<section class="form-panel"><span class="eyebrow">旅行偏好</span><h2 id="dialog-title">按自己的节奏探索</h2><p class="form-description">让浏览与出发都更自在。</p><label class="preference-row"><span><strong>减少动态效果</strong><small>减少界面切换和入场时的移动</small></span><input class="switch-input" type="checkbox" id="motion-preference" ${state.reduceMotion ? 'checked' : ''}></label><label class="preference-row"><span><strong>显示古迹参观提醒</strong><small>在目的地详情中显示着装与通行建议</small></span><input class="switch-input" type="checkbox" id="tips-preference" ${state.travelTips ? 'checked' : ''}></label><div class="form-actions"><button class="primary-button" data-close-dialog><i class="ti ti-check" aria-hidden="true"></i><span>完成</span></button></div></section>`);
}

async function exportJourney() {
  if (state.exporting || !state.itinerary.some((day) => day.length)) return;
  state.exporting = true;
  renderItinerary();
  $('#export-journey span').textContent = '正在生成行程…';
  try {
    const lines = [state.journeyName, `${state.travelers} 位旅行者 · 3 天`, ''];
    state.itinerary.forEach((ids, day) => {
      const date = dateForDay(day);
      lines.push(`第 ${day + 1} 天 · ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
      if (!ids.length) lines.push('自由安排');
      ids.forEach((id, index) => {
        const place = findPlace(id);
        lines.push(`${index + 1}. ${place.name} (${place.english})`, `   ${place.location} · 建议 ${place.duration} 小时`, `   ${place.tip}`);
      });
      lines.push('');
    });
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qiantu-journey.txt';
    anchor.hidden = true;
    $('#travel-app').append(anchor);
    await Promise.resolve();
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('行程文件已生成');
  } catch {
    toast('无法生成行程文件，请重试', true);
  } finally {
    state.exporting = false;
    $('#export-journey span').textContent = '导出我的旅程';
    renderItinerary();
  }
}

function start() {
  if (started) return;
  started = true;
  const compass = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="m16 8-2 6-6 2 2-6Z" fill="var(--moss-soft)"/></svg>';
  const route = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8v7a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="6" r="4" fill="currentColor"/><circle cx="18" cy="6" r="4" fill="currentColor"/></svg>';
  $('[data-view="discover"] > i').innerHTML = compass;
  $('[data-view="itinerary"] > i').innerHTML = route;
  $('#travel-app').classList.toggle('reduce-motion', state.reduceMotion);
  $('.navigation').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (button) navigate(button.dataset.view);
  });
  $('#search-form').addEventListener('submit', (event) => { event.preventDefault(); render(); });
  $('#search').addEventListener('input', (event) => { state.query = event.target.value; render(); });
  $('.category-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (button) { state.category = button.dataset.category; render(); }
  });
  $('#region-toggle').addEventListener('click', () => $('#region-menu').hidden ? openRegion() : closeRegion(true));
  $('#region-menu').addEventListener('click', (event) => {
    const button = event.target.closest('[data-region]');
    if (!button) return;
    state.region = button.dataset.region;
    $('#region-label').textContent = button.textContent.trim();
    $$('[data-region]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
    closeRegion(true);
    render();
  });
  $('#region-menu').addEventListener('keydown', (event) => {
    const options = [...$('#region-menu').querySelectorAll('button:not(:disabled)')];
    const index = options.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      options[event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
    }
  });
  $('#travel-app').addEventListener('click', (event) => { if (!event.target.closest('.region-control')) closeRegion(); });
  $('#destination-grid').addEventListener('click', (event) => {
    const save = event.target.closest('[data-save]');
    const select = event.target.closest('[data-place]');
    if (save) toggleSave(save.dataset.save); else if (select) selectPlace(select.dataset.place);
  });
  $('#destination-grid').addEventListener('error', (event) => {
    if (event.target.tagName !== 'IMG') return;
    event.target.hidden = true;
    event.target.nextElementSibling.hidden = false;
  }, true);
  $('#hero-save').addEventListener('click', () => toggleSave(state.selected));
  [$('#hero-prev'), $('#hero-next')].forEach((button, index) => button.addEventListener('click', () => {
    const list = visiblePlaces();
    const position = list.findIndex((place) => place.id === state.selected);
    const target = list[position + (index === 0 ? -1 : 1)];
    if (target) selectPlace(target.id);
  }));
  $('#hero-image').addEventListener('load', () => { $('#hero').classList.remove('is-loading'); $('#hero-error').hidden = true; });
  $('#hero-image').addEventListener('error', () => { $('#hero').classList.remove('is-loading'); $('#hero-error').hidden = false; });
  $('#image-retry').addEventListener('click', () => {
    $('#hero-error').hidden = true;
    $('#hero').classList.add('is-loading');
    $('#hero-image').src = `${findPlace(state.selected).image}?reload=${Date.now()}`;
  });
  $('#detail-open').addEventListener('click', () => openDetails());
  $('#filters-reset').addEventListener('click', () => navigate('discover'));
  $('#day-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-day]');
    if (button) setDay(Number(button.dataset.day), true);
  });
  $('#day-tabs').addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setDay(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (state.day + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3, true);
  });
  $('#itinerary-list').addEventListener('click', (event) => {
    const detail = event.target.closest('[data-detail]');
    const remove = event.target.closest('[data-remove]');
    const move = event.target.closest('[data-move]');
    if (detail) openDetails(detail.dataset.detail);
    if (remove) {
      state.itinerary[state.day] = state.itinerary[state.day].filter((id) => id !== remove.dataset.remove);
      render();
      toast(`已从当天行程移除${findPlace(remove.dataset.remove).name}`);
    }
    if (move) {
      const list = state.itinerary[state.day];
      const index = Number(move.dataset.move);
      const target = index + Number(move.dataset.direction);
      [list[index], list[target]] = [list[target], list[index]];
      render();
      $(`[data-move="${target}"][data-direction="${move.dataset.direction}"]`)?.focus();
    }
  });
  $('#browse-places').addEventListener('click', () => { navigate('discover'); $('#search').focus(); });
  $('#add-to-trip').addEventListener('click', () => addToTrip(state.selected));
  $('#journey-edit').addEventListener('click', openJourneyForm);
  $('#preferences-open').addEventListener('click', openPreferences);
  $('#dialog-close').addEventListener('click', closeDialog);
  $('#dialog-scrim').addEventListener('click', closeDialog);
  $('#dialog-content').addEventListener('click', (event) => {
    if (event.target.closest('[data-close-dialog]')) closeDialog();
    const add = event.target.closest('[data-dialog-place]');
    if (add) addToTrip(add.dataset.dialogPlace);
  });
  $('#dialog-content').addEventListener('submit', (event) => { if (event.target.id === 'journey-form') { event.preventDefault(); saveJourney(event.target); } });
  $('#dialog-content').addEventListener('input', (event) => {
    if (event.target.id === 'journey-name-input') {
      const empty = !event.target.value.trim();
      $('#journey-submit').disabled = empty;
      $('#journey-error').textContent = empty ? '请填写旅程名称' : '';
    }
    event.target.removeAttribute('aria-invalid');
  });
  $('#dialog-content').addEventListener('change', (event) => {
    if (event.target.id === 'motion-preference') { state.reduceMotion = event.target.checked; $('#travel-app').classList.toggle('reduce-motion', state.reduceMotion); }
    if (event.target.id === 'tips-preference') state.travelTips = event.target.checked;
  });
  $('#export-journey').addEventListener('click', exportJourney);
  $('#export-top').addEventListener('click', exportJourney);
  document.addEventListener('keydown', (event) => {
    const dialogOpen = $('#dialog-layer').classList.contains('is-open');
    if (event.key === 'Escape') { if (!$('#region-menu').hidden) closeRegion(true); else if (dialogOpen) closeDialog(); }
    if (event.key === '/' && !dialogOpen && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) { event.preventDefault(); $('#search').focus(); }
    if (event.key === 'Tab' && dialogOpen) {
      const focusable = [...$('#dialog').querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')].filter((element) => !element.hidden && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  render();
  $('#travel-app').classList.add('has-started');
}

start();
