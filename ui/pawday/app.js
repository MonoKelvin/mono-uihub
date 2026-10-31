'use strict';

const TODAY = '2026-10-31';
const PHOTOS = {
  dog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&q=80&auto=format&fit=crop',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80&auto=format&fit=crop',
  outdoors: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80&auto=format&fit=crop'
};
const KINDS = {
  food: { label: '喂食', icon: 'bowl-spoon', className: 'food', unit: 'g', field: '食物重量（g）', max: 5000 },
  walk: { label: '散步', icon: 'walk', className: 'walk', unit: '分钟', field: '散步时长（分钟）', max: 1440 },
  groom: { label: '护理', icon: 'brush', className: 'groom' },
  weight: { label: '体重', icon: 'scale', className: 'walk', unit: 'kg', field: '体重（kg）', max: 150 },
  note: { label: '心情', icon: 'mood-smile', className: 'food' },
  expense: { label: '花销', icon: 'wallet', className: 'walk', unit: '元', field: '金额（元）', max: 1000000 },
  medical: { label: '健康', icon: 'vaccine', className: 'medical' }
};
const CATEGORIES = { food: '日常饮食', health: '医疗护理', goods: '玩具用品', other: '其他花销' };
const VIEW_NAMES = { today: '今日概览', health: '健康档案', records: '生活记录', schedule: '日程安排', expenses: '花销记账' };
const pets = [
  { id: 'cream', name: '奶油', species: 'dog', breed: '金毛寻回犬', sex: 'male', birthday: '2024-02-18', adoption: '2024-05-23', neutered: true, mood: '今天也想出去玩', budget: 800 },
  { id: 'rice', name: '糯米', species: 'cat', breed: '中华田园猫', sex: 'female', birthday: '2025-04-06', adoption: '2025-06-01', neutered: true, mood: '晒太阳，打个盹', budget: 500 }
];
let tasks = [
  { id: 't1', petId: 'cream', date: TODAY, time: '08:00', kind: 'food', title: '早餐时间', note: '成犬粮 120 g，记得换一碗新鲜水', done: true },
  { id: 't2', petId: 'cream', date: TODAY, time: '08:30', kind: 'walk', title: '出门闻闻新鲜空气', note: '晨间散步 30 分钟', done: true },
  { id: 't3', petId: 'cream', date: TODAY, time: '12:30', kind: 'food', title: '午间加餐', note: '鲜肉罐头半罐，约 80 g', done: false },
  { id: 't4', petId: 'cream', date: TODAY, time: '18:00', kind: 'walk', title: '傍晚的公园散步', note: '带好牵引绳和拾便袋', done: false },
  { id: 't5', petId: 'cream', date: TODAY, time: '20:30', kind: 'groom', title: '梳梳毛，揉揉小耳朵', note: '梳毛 10 分钟，检查耳朵', done: false },
  { id: 't6', petId: 'rice', date: TODAY, time: '08:00', kind: 'food', title: '糯米的早餐', note: '猫粮 35 g，清洗水碗', done: true },
  { id: 't7', petId: 'rice', date: TODAY, time: '19:00', kind: 'food', title: '晚餐小罐头', note: '主食罐头 85 g', done: false },
  { id: 't8', petId: 'rice', date: TODAY, time: '20:00', kind: 'groom', title: '清理猫砂盆', note: '顺便看看猫砂是否需要补充', done: false },
  { id: 't9', petId: 'cream', date: '2026-11-01', time: '09:00', kind: 'walk', title: '周末的长散步', note: '去河边走走，预计 45 分钟', done: false }
];
let events = [
  { id: 'e1', petId: 'cream', date: '2026-11-06', time: '10:00', title: '年度疫苗加强针', kind: 'medical', note: '带上免疫证，接种方案以兽医建议为准。', location: '和安宠物医院' },
  { id: 'e2', petId: 'cream', date: '2026-11-12', time: '14:30', title: '洗澡与基础护理', kind: 'groom', note: '记得带奶油常用的洗护用品。', location: '小尾巴宠物生活馆' },
  { id: 'e3', petId: 'rice', date: '2026-11-04', time: '15:00', title: '例行健康检查', kind: 'medical', note: '准备好航空箱和既往检查记录。', location: '和安宠物医院' }
];
let records = [
  ...[['10-01', 27.8], ['10-07', 28.1], ['10-13', 28], ['10-19', 28.3], ['10-25', 28.4], ['10-31', 28.5]].map(([day, value], i) => ({ id: `w${i}`, petId: 'cream', kind: 'weight', date: `2026-${day}`, time: '07:30', title: '体重记录', value, note: '早餐前称重。' })),
  ...[['10-04', 3.8], ['10-11', 3.9], ['10-18', 3.9], ['10-25', 4], ['10-31', 4.1]].map(([day, value], i) => ({ id: `rw${i}`, petId: 'rice', kind: 'weight', date: `2026-${day}`, time: '08:00', title: '体重记录', value, note: '用同一台秤记录。' })),
  { id: 'r1', petId: 'cream', kind: 'food', date: TODAY, time: '08:00', title: '早餐吃得很香', value: 120, note: '全价成犬粮，换了新鲜饮用水。', taskId: 't1' },
  { id: 'r2', petId: 'cream', kind: 'walk', date: TODAY, time: '08:30', title: '公园里认识了新朋友', value: 30, note: '走了 1.8 km，和一只小柯基玩了一会儿。回家后擦了爪子。', taskId: 't2' },
  { id: 'r3', petId: 'cream', kind: 'note', date: '2026-10-30', time: '21:15', title: '把下巴放在我的膝盖上', note: '看书的时候一直陪着我。今天也是被小狗治愈的一天。' },
  { id: 'r4', petId: 'cream', kind: 'groom', date: '2026-10-29', time: '20:00', title: '剪指甲与梳毛', note: '这次很配合，奖励了一小块冻干。' },
  { id: 'r5', petId: 'cream', kind: 'medical', date: '2026-10-18', time: '14:00', title: '体外驱虫', note: '已按兽医指导完成本次体外驱虫。' },
  { id: 'r6', petId: 'cream', kind: 'medical', date: '2026-08-23', time: '10:30', title: '年度健康检查', note: '和安宠物医院。体检报告请以医院原始记录为准。' },
  { id: 'r7', petId: 'cream', kind: 'medical', date: '2026-04-10', time: '11:00', title: '狂犬疫苗接种', note: '已记录接种日期，后续安排以免疫证及兽医建议为准。' },
  { id: 'rr1', petId: 'rice', kind: 'food', date: TODAY, time: '08:00', title: '早餐记录', value: 35, note: '猫粮吃完了，水碗也洗干净了。', taskId: 't6' },
  { id: 'rr2', petId: 'rice', kind: 'note', date: '2026-10-30', time: '14:20', title: '午后的小太阳', note: '糯米在窗边睡了一下午，醒来伸了一个好长的懒腰。' },
  { id: 'rr3', petId: 'rice', kind: 'medical', date: '2026-09-08', time: '14:00', title: '例行健康检查', note: '已将检查日期记入健康档案。' },
  { id: 'x1', petId: 'cream', kind: 'expense', category: 'food', date: '2026-10-28', time: '16:00', title: '冻干小零食', value: 62, note: '训练时的小奖励。' },
  { id: 'x2', petId: 'cream', kind: 'expense', category: 'goods', date: '2026-10-24', time: '12:00', title: '耐咬毛绒玩具', value: 99.9, note: '奶油的新玩具。' },
  { id: 'x3', petId: 'cream', kind: 'expense', category: 'health', date: '2026-10-18', time: '14:00', title: '体外驱虫药', value: 158, note: '和安宠物医院。' },
  { id: 'x4', petId: 'cream', kind: 'expense', category: 'food', date: '2026-10-12', time: '15:00', title: '鲜肉罐头', value: 78, note: '六罐装。' },
  { id: 'x5', petId: 'cream', kind: 'expense', category: 'food', date: '2026-10-03', time: '11:00', title: '全价成犬粮', value: 189, note: '日常主粮补货。' },
  { id: 'rx1', petId: 'rice', kind: 'expense', category: 'food', date: '2026-10-21', time: '13:00', title: '猫粮与主食罐头', value: 168, note: '' },
  { id: 'rx2', petId: 'rice', kind: 'expense', category: 'goods', date: '2026-10-14', time: '12:00', title: '豆腐猫砂', value: 69, note: '' }
];
let photos = [
  { id: 'p1', petId: 'cream', src: PHOTOS.dog, title: '今天也是乖乖小狗', date: TODAY, note: '早餐后的一个可爱瞬间。', favorite: true, shape: 'portrait' },
  { id: 'p2', petId: 'rice', src: PHOTOS.cat, title: '窗边的小观察员', date: '2026-10-30', note: '糯米最喜欢的午后时光。', favorite: false, shape: 'square' },
  { id: 'p3', petId: 'cream', src: PHOTOS.outdoors, title: '草地上的新朋友', date: '2026-10-28', note: '出去玩的时候，时间总是过得特别快。', favorite: true, shape: 'landscape' },
  { id: 'p4', petId: 'cream', src: './assets/golden.webp', title: '等一个摸摸头', date: '2026-10-25', note: '一抬头，就看见它亮晶晶的眼睛。', favorite: false, shape: 'portrait' },
  { id: 'p5', petId: 'rice', src: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80&auto=format&fit=crop', title: '猫猫的慢日子', date: '2026-10-22', note: '在家里找到了一个新的舒服角落。', favorite: true, shape: 'portrait' },
  { id: 'p6', petId: 'cream', src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80&auto=format&fit=crop', title: '有风的傍晚', date: '2026-10-18', note: '散步之后，坐下来看看风景。', favorite: false, shape: 'square' },
  { id: 'p7', petId: 'rice', src: './assets/orange-cat.webp', title: '一小团温柔', date: '2026-10-12', note: '把平凡的一天留在照片里。', favorite: false, shape: 'square' },
  { id: 'p8', petId: 'cream', src: './assets/corgi.webp', title: '认识了新的小伙伴', date: '2026-10-08', note: '今天的公园里有好多快乐的小狗。', favorite: false, shape: 'landscape' },
  { id: 'p9', petId: 'cream', src: './assets/field-dog.webp', title: '把风景留给它', date: '2026-10-06', note: '周末不着急，慢慢走，慢慢看。', favorite: true, shape: 'square' },
  { id: 'p10', petId: 'cream', src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=80&auto=format&fit=crop', title: '一起慢慢长大', date: '2026-10-04', note: '把陪伴的每一天，都认真记下来。', favorite: false, shape: 'portrait' },
  { id: 'p11', petId: 'rice', src: './assets/curious-cat.webp', title: '小猫的好奇心', date: '2026-10-03', note: '总有一些小事情，会让它停下脚步。', favorite: false, shape: 'square' },
  { id: 'p12', petId: 'rice', src: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200&q=80&auto=format&fit=crop', title: '今天也很柔软', date: '2026-10-01', note: '一张照片，存下一段安静的时光。', favorite: true, shape: 'portrait' }
];
const state = { petId: 'cream', view: 'today', day: TODAY, taskFilter: 'all', recordFilter: 'all', recordQuery: '', recordTab: 'timeline', calendarMonth: '2026-10', expenseMonth: '2026-10', healthRange: 'month', user: '阿宁', notifications: true, photoFilter: 'all', photoQuery: '', viewingPhotoId: '', photoSeen: false };
const workspace = document.querySelector('#workspace');
const modal = document.querySelector('#modal');
let toastTimer;
let recordDraft;
const chartCache = new Map();
let chartResizeObserver;
let modalReturnFocus;
const formatWeight = value => Number(value).toFixed(2).replace(/0$/, '');

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const currentPet = () => pets.find(pet => pet.id === state.petId);
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;
const parseDay = day => new Date(`${day}T12:00:00`);
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function addDays(day, amount) { const date = parseDay(day); date.setDate(date.getDate() + amount); return dateKey(date); }
function dayDistance(start, end) { return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000); }
function shortDate(day) { const date = parseDay(day); return `${date.getMonth() + 1} 月 ${date.getDate()} 日`; }
function longDate(day) { return `${parseDay(day).getFullYear()} 年 ${shortDate(day)}，星期${'日一二三四五六'[parseDay(day).getDay()]}`; }
function ageText(pet) { const birth = parseDay(pet.birthday), now = parseDay(TODAY); let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth(); if (now.getDate() < birth.getDate()) months--; months = Math.max(0, months); return months >= 12 ? `${Math.floor(months / 12)} 岁 ${months % 12} 个月` : `${months} 个月`; }
function money(value) { return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function chronological(a, b) { return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`); }
function petRecords(kind) { return records.filter(record => record.petId === state.petId && (!kind || record.kind === kind)).reverse().sort((a, b) => chronological(b, a)); }
function inHealthRange(record) { return state.healthRange === 'week' ? record.date >= addDays(TODAY, -6) : state.healthRange === 'month' ? record.date.startsWith(TODAY.slice(0, 7)) : true; }
function weights(range = 'all') { return petRecords('weight').filter(record => range === 'week' ? record.date >= addDays(TODAY, -6) : range === 'month' ? record.date.startsWith(TODAY.slice(0, 7)) : true).reverse(); }
function expenses(month = state.expenseMonth) { return petRecords('expense').filter(record => record.date.startsWith(month)); }
function expenseTotal(month) { return expenses(month).reduce((sum, record) => sum + Math.round(record.value * 100), 0) / 100; }
function avatar(pet, className = '') { return `<span class="pet-avatar ${pet.species === 'cat' ? 'cat' : ''} ${className}"><img src="${PHOTOS[pet.species]}" alt="${escapeText(pet.name)}的照片" loading="lazy"></span>`; }
function taskIcon(kind) { const type = KINDS[kind]; return `<span class="task-icon ${type.className}">${icon(type.icon)}</span>`; }
function actionButton(label, action, extra = '', primary = false) { return `<button class="${primary ? 'primary-button' : 'secondary-button'}" data-action="${action}" ${extra}>${icon('plus')}${label}</button>`; }
function emptyState(title, description, action = '', label = '添加记录') { return `<div class="empty-state">${icon('paw')}<h3>${title}</h3><p>${description}</p>${action ? `<button class="secondary-button" data-action="${action}">${icon('plus')}${label}</button>` : ''}</div>`; }
function petSwitcher() { return `<div class="pet-switcher">${pets.map(pet => `<button class="pet-pill ${pet.id === state.petId ? 'selected' : ''}" data-action="switch-pet" data-id="${pet.id}" aria-pressed="${pet.id === state.petId}">${avatar(pet)}<span class="pet-pill-label">${escapeText(pet.name)}</span></button>`).join('')}<button class="icon-button" data-action="add-pet" aria-label="添加宠物">${icon('plus')}</button></div>`; }
function viewHeader(title, description = '', action = '') { return `<div class="view-header"><div><h1>${title}</h1>${description ? `<p class="view-description">${description}</p>` : ''}</div>${action ? `<div class="header-right">${petSwitcher()}${action}</div>` : petSwitcher()}</div>`; }

function render() {
  const pet = currentPet();
  document.querySelector('#sidebar-pets').innerHTML = pets.map(item => `<button class="sidebar-pet ${item.id === pet.id ? 'selected' : ''}" data-action="switch-pet" data-id="${item.id}" aria-pressed="${item.id === pet.id}">${avatar(item)}<span><strong>${escapeText(item.name)}</strong><small>${item.species === 'dog' ? '狗狗' : '猫咪'} · ${ageText(item)}</small></span>${item.id === pet.id ? `<i class="ti ti-circle-check pet-selected-mark" aria-hidden="true"></i>` : ''}</button>`).join('');
  document.querySelector('#pet-count').textContent = pets.length;
  document.querySelector('#breadcrumb-current').textContent = VIEW_NAMES[state.view];
  document.querySelector('.user-avatar').textContent = Array.from(state.user).at(-1);
  document.querySelector('#notification-dot').hidden = !state.notifications || !notificationItems().length;
  document.querySelectorAll('.primary-nav .nav-item').forEach(button => {
    const selected = button.dataset.view === state.view;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    let dot = button.querySelector('.nav-dot');
    if (selected && !dot) { dot = document.createElement('span'); dot.className = 'nav-dot'; button.append(dot); }
    if (!selected && dot) dot.remove();
  });
  workspace.innerHTML = ({ today: renderToday, health: renderHealth, records: renderRecords, schedule: renderSchedule, expenses: renderExpenses })[state.view]();
  bindCharts();
}
function navigate(view) { state.view = view; render(); workspace.scrollTop = 0; }
function switchPet(id) { if (id === state.petId) return; state.petId = id; state.recordFilter = 'all'; state.recordQuery = ''; state.photoQuery = ''; render(); }

function renderToday() {
  const pet = currentPet(), weight = petRecords('weight')[0];
  const daily = tasks.filter(task => task.petId === pet.id && task.date === state.day);
  const completed = daily.filter(task => task.done).length;
  const shown = daily.filter(task => state.taskFilter === 'all' || !task.done).sort(chronological);
  const total = expenseTotal(TODAY.slice(0, 7));
  const nextEvent = events.filter(event => event.petId === pet.id && event.date >= TODAY).sort(chronological)[0];
  const petPhotos = photos.filter(photo => photo.petId === pet.id);
  return `<div class="view-header"><div><p class="greeting">${icon('sun')}嗨，${escapeText(state.user)}</p><h1>今天，和${escapeText(pet.name)}一起。</h1></div><div class="header-right"><button class="date-label" data-action="nav" data-view="schedule" aria-label="${longDate(TODAY)}，查看日程">${icon('calendar')}<span class="full-date">${longDate(TODAY)}</span><span class="compact-date">${shortDate(TODAY)}，周${'日一二三四五六'[parseDay(TODAY).getDay()]}</span></button>${petSwitcher()}</div></div>
  <div class="overview-grid"><div class="overview-main">
    <section class="pet-hero ${pet.species === 'cat' ? 'cat' : ''}" aria-label="宠物档案">
      <div class="pet-intro"><div class="pet-intro-top"><h2>${escapeText(pet.name)}</h2><span class="sex-chip" aria-label="${pet.sex === 'male' ? '男孩子' : '女孩子'}">${icon(pet.sex === 'male' ? 'gender-male' : 'gender-female')}</span></div><p class="breed-label">${escapeText(pet.breed)}</p>
      <span class="pet-mood">${icon('mood-smile')}${escapeText(pet.mood)}</span><div class="pet-vitals"><div class="vital"><strong>${ageText(pet)}</strong><small>已经这么大啦</small></div><div class="vital"><strong class="number">${weight ? `${formatWeight(weight.value)} kg` : '待记录'}</strong><small>最近一次体重</small></div></div>
      <button class="edit-profile" data-action="edit-pet">编辑小档案 ${icon('arrow-up-right')}</button></div>
      <div class="hero-photo-wrap"><span class="hero-doodle hero-doodle-one" aria-hidden="true">${icon(pet.species === 'dog' ? 'bone' : 'fish')}</span><span class="hero-sticker" aria-hidden="true"><svg viewBox="0 0 100 100"><g fill="currentColor"><circle cx="50" cy="20" r="19"/><circle cx="72" cy="28" r="19"/><circle cx="80" cy="50" r="19"/><circle cx="72" cy="72" r="19"/><circle cx="50" cy="80" r="19"/><circle cx="28" cy="72" r="19"/><circle cx="20" cy="50" r="19"/><circle cx="28" cy="28" r="19"/><circle cx="50" cy="50" r="31"/></g></svg>${icon('paw')}</span><div class="hero-photo"><img src="${PHOTOS[pet.species]}" alt="${escapeText(pet.name)}，${escapeText(pet.breed)}" fetchpriority="high"></div><span class="hero-photo-caption">${icon('heart')}陪伴的第 <span class="number">${dayDistance(pet.adoption, TODAY) + 1}</span> 天</span></div>
    </section>
    <section class="care-section"><div class="section-heading"><div class="section-title-group"><h2 class="icon-heading"><span class="heading-icon">${icon('checklist')}</span>${state.day === TODAY ? '今天的照护' : `${shortDate(state.day)}的照护`}</h2><small id="care-progress"><span class="number">${completed} / ${daily.length}</span> 已完成</small></div><div class="section-tools"><div class="segmented" aria-label="照护筛选"><button data-action="task-filter" data-filter="all" class="${state.taskFilter === 'all' ? 'selected' : ''}" aria-pressed="${state.taskFilter === 'all'}">全部</button><button data-action="task-filter" data-filter="pending" class="${state.taskFilter === 'pending' ? 'selected' : ''}" aria-pressed="${state.taskFilter === 'pending'}">待完成</button></div><button class="text-button" data-action="add-task">${icon('plus')}添加</button></div></div>
      ${renderWeek()}<div class="task-list">${shown.length ? shown.map(renderTask).join('') : emptyState(daily.length ? '照护小事都记好啦' : '这一天还没有照护计划', daily.length ? '接下来，好好享受你们的相处时间。' : '添加一件小事，安排好它的一天。', daily.length ? '' : 'add-task', '添加照护')}</div>
    </section>
  </div><aside class="overview-aside" aria-label="近期安排与生活摘要">
    <section><div class="rail-heading"><h2>接下来</h2><button class="text-button" data-action="nav" data-view="schedule">全部 ${icon('chevron-right')}</button></div>${nextEvent ? renderAppointment(nextEvent) : emptyState('暂时没有新安排', '把下一次护理或检查记下来。', 'add-event', '添加安排')}</section>
    <section><div class="rail-heading"><h2>最近体重</h2><button class="text-button" data-action="nav" data-view="health">健康档案 ${icon('chevron-right')}</button></div><div class="weight-head"><strong class="weight-value">${weight ? formatWeight(weight.value) : '—'}<small>kg</small></strong><span class="weight-date">${weight ? shortDate(weight.date) : '尚未记录'}</span></div><p class="weight-caption">同一台秤，记录每一点变化</p>${renderChart(weights('month'), 'overview-weight', true)}</section>
    <section><div class="rail-heading"><h2>本月花销</h2><button class="text-button" data-action="nav" data-view="expenses">明细 ${icon('chevron-right')}</button></div><div class="expense-summary"><span>¥</span><strong>${money(total)}</strong></div><p class="budget-caption">${total <= pet.budget ? `预算剩余 ¥${money(pet.budget - total)}` : `超出预算 ¥${money(total - pet.budget)}`} / 月预算 ¥${money(pet.budget)}</p><div class="expense-mini-list">${Object.entries(CATEGORIES).map(([key, label]) => { const value = expenses(TODAY.slice(0, 7)).filter(record => record.category === key).reduce((sum, record) => sum + record.value, 0); return value ? `<div class="expense-mini-row"><span>${label}</span><strong>¥ ${money(value)}</strong></div>` : ''; }).join('')}</div></section>
    ${petPhotos.length ? `<button class="memory-preview" data-action="open-photo-wall"><span class="memory-image"><img src="${pet.species === 'dog' ? PHOTOS.outdoors : PHOTOS.cat}" alt="宠物生活照片" loading="lazy"></span><span class="memory-preview-body"><span><strong>生活碎片，慢慢收藏</strong><small>${petPhotos.length} 张照片 · 去看看照片墙</small></span>${icon('arrow-up-right')}</span></button>` : ''}
  </aside></div>`;
}
function renderWeek() {
  const day = parseDay(state.day), offset = (day.getDay() + 6) % 7, monday = addDays(state.day, -offset);
  return `<div class="week-strip" aria-label="选择照护日期">${Array.from({ length: 7 }, (_, index) => { const date = addDays(monday, index); return `<button class="week-day ${date === state.day ? 'selected' : ''}" data-action="select-day" data-date="${date}" aria-label="${longDate(date)}" aria-pressed="${date === state.day}"><span>${date === TODAY ? '今天' : `周${'一二三四五六日'[index]}`}</span><strong>${parseDay(date).getDate()}</strong></button>`; }).join('')}</div>`;
}
function renderTask(task) {
  return `<div class="task-row ${task.done ? 'done' : ''}"><span class="task-time">${task.time}</span><button class="task-check ${task.done ? 'checked' : ''}" data-action="toggle-task" data-id="${task.id}" aria-label="${task.done ? '取消完成' : '完成'}：${escapeText(task.title)}" aria-pressed="${task.done}">${icon('check')}</button>${taskIcon(task.kind)}<button class="task-description" data-action="edit-task" data-id="${task.id}"><strong>${escapeText(task.title)}</strong><small>${escapeText(task.note)}</small></button><span class="task-tag ${task.done ? 'completed' : ''}">${task.done ? '已完成' : KINDS[task.kind].label}</span></div>`;
}
function renderAppointment(event) {
  const date = parseDay(event.date), days = dayDistance(TODAY, event.date);
  return `<div class="appointment-card"><div class="appointment-top"><span class="appointment-type">${icon(KINDS[event.kind].icon)}${KINDS[event.kind].label}提醒</span><span class="days-away">${days === 0 ? '今天' : `${days} 天后`}</span></div><h3>${escapeText(event.title)}</h3><p class="appointment-date">${String(date.getMonth() + 1).padStart(2, '0')} / ${String(date.getDate()).padStart(2, '0')}<span>星期${'日一二三四五六'[date.getDay()]} ${event.time}</span></p><p class="appointment-place">${icon('map-pin')}${escapeText(event.location || '地点待定')}</p><button class="text-button" data-action="event-detail" data-id="${event.id}">查看安排 ${icon('arrow-up-right')}</button></div>`;
}

function renderChart(data, id, compact = false, fittedWidth = 0) {
  chartCache.set(id, { data, compact });
  if (!data.length) return `<p class="weight-caption" style="padding:24px 0">这个时间段还没有体重记录。</p>`;
  const width = fittedWidth || (compact ? 240 : 560), height = compact ? 122 : 210;
  const values = data.map(record => record.value);
  const min = Math.max(0, Math.floor(Math.min(...values) * 2) / 2 - .5), max = Math.ceil(Math.max(...values) * 2) / 2 + .5;
  const ticks = [min, (min + max) / 2, max];
  const left = Math.max(...ticks.map(value => formatWeight(value).length)) * 8 + 10, right = 22, top = 13, bottom = 30, plotWidth = width - left - right, plotHeight = height - top - bottom;
  const firstTime = Date.parse(`${data[0].date}T${data[0].time}`), lastTime = Date.parse(`${data.at(-1).date}T${data.at(-1).time}`), timeSpan = lastTime - firstTime;
  const points = data.map(record => ({ ...record, x: timeSpan === 0 ? left + plotWidth / 2 : left + (Date.parse(`${record.date}T${record.time}`) - firstTime) / timeSpan * plotWidth, y: top + (max - record.value) / (max - min) * plotHeight }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  const grid = ticks.map(value => { const y = top + (max - value) / (max - min) * plotHeight; return `<line class="chart-grid" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"></line><text class="chart-label" x="${left - 7}" y="${y + 3}" text-anchor="end">${formatWeight(value)}</text>`; }).join('');
  const midpoint = points.reduce((nearest, point, index) => Math.abs(point.x - (left + plotWidth / 2)) < Math.abs(points[nearest].x - (left + plotWidth / 2)) ? index : nearest, 0);
  const candidates = [...new Set(compact || width < 420 ? [0, points.length - 1] : [0, midpoint, points.length - 1])];
  const labelIndices = candidates.filter((index, position) => !candidates.slice(0, position).some(previous => Math.abs(points[previous].x - points[index].x) < 48));
  return `<div class="chart-wrap" data-chart-id="${id}"><svg viewBox="0 0 ${width} ${height}" role="group" aria-label="体重变化，单位 kg">${grid}<path class="chart-area" d="${path} L${points.at(-1).x},${top + plotHeight} L${points[0].x},${top + plotHeight} Z"></path><path class="chart-line" d="${path}"></path><line class="chart-cross" y1="${top}" y2="${top + plotHeight}" hidden></line>${points.map(point => `<g class="chart-point" tabindex="0" role="img" aria-label="${shortDate(point.date)} ${point.time}，${formatWeight(point.value)} kg" data-x="${point.x}" data-date="${point.date}" data-time="${point.time}" data-value="${formatWeight(point.value)}"><circle class="chart-dot" cx="${point.x}" cy="${point.y}" r="4"></circle><rect class="chart-hit" x="${point.x - 12}" y="${top}" width="24" height="${plotHeight}"></rect></g>`).join('')}${labelIndices.map(index => `<text class="chart-label" x="${points[index].x}" y="${height - 8}" text-anchor="middle">${points[index].date.slice(5).replace('-', '/')}</text>`).join('')}</svg><div class="chart-tooltip" hidden></div></div><button class="chart-data" data-action="weight-table" data-id="${id}">${icon('table')}查看${compact ? '' : '体重'}数据</button>`;
}
function bindCharts() {
  chartResizeObserver?.disconnect();
  function fit(wrap) {
    if (!wrap.isConnected) return;
    const width = Math.floor(wrap.getBoundingClientRect().width), svg = wrap.querySelector('svg');
    if (!width || Math.abs(svg.viewBox.baseVal.width - width) < 1) return;
    const { data, compact } = chartCache.get(wrap.dataset.chartId), template = document.createElement('template');
    template.innerHTML = renderChart(data, wrap.dataset.chartId, compact, width);
    wrap.innerHTML = template.content.firstElementChild.innerHTML;
  }
  chartResizeObserver = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
  workspace.querySelectorAll('.chart-wrap').forEach(wrap => {
    fit(wrap);
    wrap.style.height = `${chartCache.get(wrap.dataset.chartId).compact ? 122 : 210}px`;
    chartResizeObserver.observe(wrap);
    function hide() { wrap.querySelector('.chart-tooltip').hidden = true; wrap.querySelector('.chart-cross').setAttribute('hidden', ''); }
    function show(point) {
      const svg = wrap.querySelector('svg'), tooltip = wrap.querySelector('.chart-tooltip'), cross = wrap.querySelector('.chart-cross'), x = Number(point.dataset.x), width = svg.viewBox.baseVal.width;
      cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.removeAttribute('hidden');
      tooltip.textContent = `${point.dataset.value} kg · ${shortDate(point.dataset.date)} ${point.dataset.time}`;
      tooltip.hidden = false;
      const half = tooltip.offsetWidth / 2, target = x / width * wrap.clientWidth;
      tooltip.style.left = `${Math.max(half + 4, Math.min(wrap.clientWidth - half - 4, target))}px`;
    }
    wrap.addEventListener('pointermove', event => { const svg = wrap.querySelector('svg'), points = [...wrap.querySelectorAll('.chart-point')], bounds = svg.getBoundingClientRect(), x = (event.clientX - bounds.left) / bounds.width * svg.viewBox.baseVal.width; show(points.reduce((nearest, point) => Math.abs(Number(point.dataset.x) - x) <= Math.abs(Number(nearest.dataset.x) - x) ? point : nearest)); });
    wrap.addEventListener('pointerleave', hide);
    wrap.addEventListener('focusin', event => { const point = event.target.closest('.chart-point'); if (point) show(point); });
    wrap.addEventListener('focusout', event => { if (!wrap.contains(event.relatedTarget)) hide(); });
  });
}
function openWeightTable(id) {
  const { data } = chartCache.get(id);
  openModal('每一次体重变化', `<div class="table-scroll"><table><thead><tr><th>记录日期</th><th>时间</th><th class="table-number">体重（kg）</th></tr></thead><tbody>${data.map(record => `<tr><td class="number">${record.date}</td><td class="number">${record.time}</td><td class="table-number">${formatWeight(record.value)}</td></tr>`).join('')}</tbody></table></div>`, `${currentPet().name}的体重数据`);
  modal.classList.add('data-modal');
}

function renderHealth() {
  const pet = currentPet(), data = weights(state.healthRange), latest = data.at(-1), medical = petRecords('medical').filter(inHealthRange);
  return `${viewHeader('它的健康，有迹可循。', `${escapeText(pet.name)}的体重、护理与医疗记录都在这里。`, actionButton('新增健康记录', 'add-health', '', true))}
  <div class="filters" aria-label="健康记录时间范围">${[['month', '本月'], ['week', '近 7 天'], ['all', '全部记录']].map(([key, label]) => `<button class="filter-chip ${state.healthRange === key ? 'selected' : ''}" data-action="health-range" data-range="${key}" aria-pressed="${state.healthRange === key}">${label}</button>`).join('')}</div>
  <div class="health-layout"><aside class="health-facts"><div class="health-profile-head">${avatar(pet)}<div><h2>${escapeText(pet.name)}</h2><p class="breed-label">${escapeText(pet.breed)}</p></div></div><dl class="fact-list"><div><dt>年龄</dt><dd>${ageText(pet)}</dd></div><div><dt>生日</dt><dd>${pet.birthday}</dd></div><div><dt>性别</dt><dd>${pet.sex === 'male' ? '男孩子' : '女孩子'}</dd></div><div><dt>绝育状态</dt><dd>${pet.neutered ? '已绝育' : '未绝育'}</dd></div><div><dt>来到家里</dt><dd>${pet.adoption}</dd></div></dl><button class="text-button" data-action="edit-pet">${icon('edit')}编辑小档案</button></aside>
  <section class="weight-main"><div class="section-heading health-chart-heading"><div class="health-chart-title"><h2>体重变化</h2><p class="weight-caption">记录变化，不代替兽医的健康评估。</p></div><div class="health-chart-reading"><strong class="weight-value">${latest ? formatWeight(latest.value) : '—'}<small>kg</small></strong><span class="weight-date">${latest ? `${shortDate(latest.date)}记录` : '暂无记录'}</span></div><button class="text-button" data-action="add-record" data-kind="weight">${icon('plus')}记体重</button></div>${renderChart(data, 'health-weight')}</section>
  <section class="content-panel health-medical"><div class="section-heading"><h2>医疗与健康记录</h2><button class="text-button" data-action="add-record" data-kind="medical">${icon('plus')}添加记录</button></div>${medical.length ? `<table class="health-medical-table"><thead><tr><th>记录事项</th><th>日期</th><th>备注</th><th></th></tr></thead><tbody>${medical.map(record => `<tr><td><button class="medical-record-name" data-action="record-detail" data-id="${record.id}">${taskIcon('medical')}<strong>${escapeText(record.title)}</strong></button></td><td class="table-date">${record.date}</td><td class="medical-note">${escapeText(record.note || '—')}</td><td class="medical-record-action"><button class="icon-button" data-action="record-detail" data-id="${record.id}" aria-label="查看${escapeText(record.title)}">${icon('arrow-up-right')}</button></td></tr>`).join('')}</tbody></table>` : emptyState('这段时间还没有医疗记录', '换一个时间范围，或记下一次检查、接种与护理。', 'add-health', '添加健康记录')}</section></div>`;
}
function matchingRecords() { const query = state.recordQuery.trim().toLowerCase(); return petRecords().filter(record => (state.recordFilter === 'all' || record.kind === state.recordFilter) && (!query || `${record.title} ${record.note} ${record.date}`.toLowerCase().includes(query))); }
function renderRecordList() {
  const list = matchingRecords();
  if (!list.length) return emptyState(state.recordQuery || state.recordFilter !== 'all' ? '没有找到符合条件的记录' : '你们的故事，从这里开始', state.recordQuery || state.recordFilter !== 'all' ? '试试其他关键词，或切换记录类型。' : '记下一次喂食、散步或相处的小事。', state.recordQuery ? '' : 'add-record');
  let lastDay = '';
  return list.map(record => { let heading = ''; if (record.date !== lastDay) { lastDay = record.date; heading = `<h2 class="record-day">${record.date === TODAY ? '今天' : record.date === addDays(TODAY, -1) ? '昨天' : shortDate(record.date)}<span class="subtle"> · ${record.date}</span></h2>`; } const kind = KINDS[record.kind]; return `${heading}<button class="record-row" data-action="record-detail" data-id="${record.id}">${taskIcon(record.kind)}<span class="record-copy"><h3>${escapeText(record.title)}${record.value != null ? ` <span class="number">${record.kind === 'expense' ? `¥${money(record.value)}` : `${record.value} ${kind.unit}`}</span>` : ''}</h3>${record.note ? `<p>${escapeText(record.note)}</p>` : ''}<small>${kind.label}${record.category ? ` / ${CATEGORIES[record.category]}` : ''}</small></span><span class="record-time">${record.time}</span></button>`; }).join('');
}
function renderTimeline() {
  return `<div class="records-top"><div class="filters" aria-label="记录类型">${['all', 'food', 'walk', 'groom', 'weight', 'note', 'medical'].map(kind => `<button class="filter-chip ${state.recordFilter === kind ? 'selected' : ''}" data-action="record-filter" data-filter="${kind}" aria-pressed="${state.recordFilter === kind}">${kind === 'all' ? '全部' : KINDS[kind].label}</button>`).join('')}</div><label class="input-search">${icon('search')}<input id="record-query" type="search" placeholder="找找那一天的小事" aria-label="搜索当前宠物记录" value="${escapeText(state.recordQuery)}"></label></div><div id="record-list">${renderRecordList()}</div>`;
}
function recordTabs() {
  return `<div class="record-tabs" role="tablist" aria-label="生活记录视图" data-mode="${state.recordTab}">${[['timeline', 'notebook', '日常记录'], ['photos', 'photo', '照片墙']].map(([mode, symbol, label]) => `<button role="tab" id="record-tab-${mode}" data-action="record-mode" data-mode="${mode}" aria-selected="${state.recordTab === mode}" aria-controls="record-module" tabindex="${state.recordTab === mode ? 0 : -1}">${icon(symbol)}${label}</button>`).join('')}<div class="record-tabs-active" aria-hidden="true"><span>${icon('notebook')}日常记录</span><span>${icon('photo')}照片墙</span></div></div>`;
}
function renderRecords() {
  const photoMode = state.recordTab === 'photos';
  return `${viewHeader('把小日常，记成故事。', `属于${escapeText(currentPet().name)}的生活记录与照片。`, actionButton(photoMode ? '添加照片' : '记录一下', photoMode ? 'add-photos' : 'add-record', 'id="record-main-action"', true))}${recordTabs()}<div id="record-module" role="tabpanel" aria-labelledby="record-tab-${state.recordTab}">${photoMode ? renderPhotoModule() : renderTimeline()}</div>`;
}
function setRecordMode(mode, instant = false) {
  if (state.recordTab === mode) return;
  state.recordTab = mode;
  const tabs = workspace.querySelector('.record-tabs'), panel = workspace.querySelector('#record-module');
  if (instant) tabs.classList.add('instant-tabs');
  tabs.dataset.mode = mode;
  tabs.querySelectorAll('[role="tab"]').forEach(tab => { const selected = tab.dataset.mode === mode; tab.setAttribute('aria-selected', selected); tab.tabIndex = selected ? 0 : -1; });
  panel.setAttribute('aria-labelledby', `record-tab-${mode}`);
  panel.innerHTML = mode === 'photos' ? renderPhotoModule() : renderTimeline();
  const action = workspace.querySelector('#record-main-action');
  action.dataset.action = mode === 'photos' ? 'add-photos' : 'add-record';
  action.innerHTML = `${icon('plus')}${mode === 'photos' ? '添加照片' : '记录一下'}`;
  if (instant) requestAnimationFrame(() => tabs.classList.remove('instant-tabs'));
}
function visiblePhotos() { const query = state.photoQuery.trim().toLowerCase(); return photos.filter(photo => photo.petId === state.petId && (state.photoFilter === 'all' || photo.favorite) && (!query || `${photo.title} ${photo.note} ${photo.date}`.toLowerCase().includes(query))).sort((a, b) => b.date.localeCompare(a.date)); }
function heartGlyphs() { return `<span class="heart-outline">${icon('heart')}</span><svg class="heart-solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.979 3c-1.964 0-3.671.744-4.9 2.1C.923 6.376.249 8.065.249 9.9c0 4.84 4.425 8.204 10.845 12.045a1 1 0 0 0 1.03 0C18.544 18.104 22.969 14.74 22.969 9.9c0-1.835-.674-3.524-1.83-4.8C19.91 3.744 18.203 3 16.239 3c-2.05 0-3.791.946-4.63 2.17C10.77 3.946 9.029 3 6.979 3z"/></svg>`; }
function imageFallback() { return `<span class="image-fallback">${icon('photo-off')}图片暂时无法加载</span>`; }
function renderPhotoGrid() {
  const list = visiblePhotos();
  if (!list.length) return emptyState(state.photoQuery ? '没有找到这张照片' : state.photoFilter === 'favorite' ? '还没有收藏的照片' : '给你们留一面照片墙', state.photoQuery ? '换个标题、备注或日期试试。' : state.photoFilter === 'favorite' ? '点一下照片上的小爱心，把喜欢的瞬间收进来。' : '从电脑里添加几张照片，记住陪伴的时光。', !state.photoQuery && state.photoFilter === 'all' ? 'add-photos' : '', '添加照片');
  return list.map((photo, index) => `<article class="photo-card" style="animation-delay:${Math.min(index * 30, 90)}ms"><button class="photo-open" data-action="photo-detail" data-id="${photo.id}" aria-label="查看照片：${escapeText(photo.title)}"><span class="photo-image ${photo.shape}"><img src="${escapeText(photo.src)}" alt="${escapeText(photo.title)}" loading="lazy" decoding="async">${imageFallback()}${photo.uploaded ? '<span class="local-photo-badge">本地照片</span>' : ''}</span><span class="photo-caption"><strong>${escapeText(photo.title)}</strong><span>${icon('calendar')}${shortDate(photo.date)}<span class="photo-pet-name">${escapeText(currentPet().name)}</span></span></span></button><button class="photo-favorite" data-action="photo-favorite" data-id="${photo.id}" aria-label="收藏照片：${escapeText(photo.title)}" aria-pressed="${photo.favorite}">${heartGlyphs()}</button></article>`).join('');
}
function renderPhotoModule() {
  const entering = !state.photoSeen;
  state.photoSeen = true;
  const favorites = photos.filter(photo => photo.petId === state.petId && photo.favorite).length;
  return `<div class="photo-module-heading"><div><h2 class="icon-heading"><span class="heading-icon">${icon('photo-heart')}</span>照片墙<span id="photo-count" class="photo-count">${visiblePhotos().length} 张照片</span></h2><p>把喜欢的瞬间收进来，留住你们一起的时光。</p></div><span class="photo-module-doodle" aria-hidden="true">${icon('paw')}</span></div><div class="photo-toolbar"><div class="filters" aria-label="照片筛选"><button class="filter-chip ${state.photoFilter === 'all' ? 'selected' : ''}" data-action="photo-filter" data-filter="all" aria-pressed="${state.photoFilter === 'all'}">全部照片</button><button class="filter-chip ${state.photoFilter === 'favorite' ? 'selected' : ''}" data-action="photo-filter" data-filter="favorite" aria-pressed="${state.photoFilter === 'favorite'}">喜欢的 <span id="photo-favorite-count" class="number">${favorites}</span></button></div><label class="input-search">${icon('search')}<input id="photo-query" type="search" placeholder="搜索照片的小故事" aria-label="搜索照片" value="${escapeText(state.photoQuery)}"></label></div><div id="photo-grid" class="photo-grid ${entering ? 'first-visit' : ''}">${renderPhotoGrid()}</div>`;
}
function updatePhotoGrid() {
  const grid = workspace.querySelector('#photo-grid');
  if (!grid) return;
  grid.classList.remove('first-visit');
  grid.innerHTML = renderPhotoGrid();
  workspace.querySelector('#photo-count').textContent = `${visiblePhotos().length} 张照片`;
  workspace.querySelector('#photo-favorite-count').textContent = photos.filter(photo => photo.petId === state.petId && photo.favorite).length;
}
function togglePhotoFavorite(id) {
  const photo = photos.find(item => item.id === id);
  photo.favorite = !photo.favorite;
  document.querySelectorAll(`[data-action="photo-favorite"][data-id="${id}"]`).forEach(button => button.setAttribute('aria-pressed', photo.favorite));
  const count = workspace.querySelector('#photo-favorite-count');
  if (count) count.textContent = photos.filter(item => item.petId === state.petId && item.favorite).length;
  if (state.view === 'records' && state.recordTab === 'photos' && state.photoFilter === 'favorite') updatePhotoGrid();
  refreshPhotoViewerNav();
}
function openPhotoDetail(id) {
  const photo = photos.find(item => item.id === id);
  if (!photo) return;
  state.viewingPhotoId = id;
  openModal('照片里的小日常', `<div class="photo-view-layout"><div class="photo-view-image"><img src="${escapeText(photo.src)}" alt="${escapeText(photo.title)}">${imageFallback()}<button class="photo-view-arrow previous" data-action="photo-step" data-step="-1" aria-label="上一张照片">${icon('chevron-left')}</button><button class="photo-view-arrow next" data-action="photo-step" data-step="1" aria-label="下一张照片">${icon('chevron-right')}</button></div><aside class="photo-view-aside"><div class="photo-view-caption"><div><h3>${escapeText(photo.title)}</h3><p>${escapeText(pets.find(pet => pet.id === photo.petId).name)} · ${photo.date}<span class="photo-viewer-count"></span></p></div><button class="photo-favorite viewer-favorite" data-action="photo-favorite" data-id="${id}" aria-label="收藏这张照片" aria-pressed="${photo.favorite}">${heartGlyphs()}</button></div>${photo.note ? `<p class="photo-story">${escapeText(photo.note)}</p>` : ''}<div class="form-actions"><button class="secondary-button danger-button" data-action="delete-photo" data-id="${id}">${icon('trash')}删除照片</button><button class="secondary-button" data-action="edit-photo" data-id="${id}">${icon('edit')}编辑说明</button></div></aside></div>`, `${pets.find(pet => pet.id === photo.petId).name}的生活相册`);
  modal.classList.add('photo-viewer');
  refreshPhotoViewerNav();
}
function refreshPhotoViewerNav() {
  if (!modal.open || !modal.classList.contains('photo-viewer')) return;
  const list = visiblePhotos(), index = list.findIndex(photo => photo.id === state.viewingPhotoId);
  modal.querySelector('.photo-viewer-count').textContent = index < 0 ? '单张查看' : `${index + 1} / ${list.length}`;
  modal.querySelectorAll('.photo-view-arrow').forEach(button => { button.disabled = list.length < 2 || index < 0; });
}
function photoStep(step) { const list = visiblePhotos(), index = list.findIndex(photo => photo.id === state.viewingPhotoId); if (index < 0 || list.length < 2) return; openPhotoDetail(list[(index + step + list.length) % list.length].id); }
function openPhotoForm(id) {
  const photo = photos.find(item => item.id === id);
  openModal('编辑这张照片的小故事', `<form data-form="photo" data-id="${id}"><div class="form-grid">${field('照片标题', 'title', photo.title, { full: true, attrs: 'maxlength="80"' })}${field('拍摄日期', 'date', photo.date, { type: 'date', attrs: `min="2000-01-01" max="${TODAY}"` })}${selectField('属于哪位小伙伴', 'petId', photo.petId, pets.map(pet => [pet.id, escapeText(pet.name)]))}${noteField(photo.note)}</div>${formActions('保存说明')}</form>`, '给这个瞬间留一句话');
}
function addPhotos(files) {
  const selected = [...files], accepted = selected.filter(file => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) && file.size > 0 && file.size <= 10 * 1024 * 1024);
  accepted.forEach(file => photos.unshift({ id: uid('p'), petId: state.petId, src: URL.createObjectURL(file), title: file.name.replace(/\.[^.]+$/, '').slice(0, 80) || '新的生活瞬间', date: TODAY, note: '', favorite: false, shape: 'square', uploaded: true }));
  if (accepted.length) { state.photoFilter = 'all'; state.photoQuery = ''; state.recordTab = 'photos'; navigate('records'); }
  document.querySelector('#photo-input').value = '';
  toast(accepted.length ? `已添加 ${accepted.length} 张照片。${accepted.length < selected.length ? '其余文件格式或大小不符合要求。' : ''}` : '请选择 JPG、PNG、WebP 或 AVIF 图片，每张不超过 10 MB。');
}

function monthShift(month, amount) { const date = parseDay(`${month}-01`); date.setMonth(date.getMonth() + amount); return dateKey(date).slice(0, 7); }
function renderSchedule() {
  const first = `${state.calendarMonth}-01`, start = addDays(first, -(parseDay(first).getDay() + 6) % 7);
  const year = state.calendarMonth.slice(0, 4), month = Number(state.calendarMonth.slice(5));
  const dayItems = [...tasks.filter(task => task.petId === state.petId && task.date === state.day), ...events.filter(event => event.petId === state.petId && event.date === state.day)].sort(chronological);
  return `${viewHeader('留一点时间，给它。', `${escapeText(currentPet().name)}的照护计划与重要安排。`, actionButton('添加安排', 'add-event', '', true))}<div class="schedule-layout"><section><div class="calendar-toolbar"><div class="month-controls"><button class="icon-button" data-action="calendar-month" data-step="-1" aria-label="上个月">${icon('chevron-left')}</button><h2><span class="number">${year}</span> 年 <span class="number">${month}</span> 月</h2><button class="icon-button" data-action="calendar-month" data-step="1" aria-label="下个月">${icon('chevron-right')}</button></div><button class="secondary-button" data-action="calendar-today">回到今天</button></div><div class="calendar-days">${[...'一二三四五六日'].map(day => `<div class="calendar-weekday">周${day}</div>`).join('')}${Array.from({ length: 42 }, (_, i) => { const date = addDays(start, i), itemCount = [...tasks, ...events].filter(item => item.petId === state.petId && item.date === date).length; return `<button class="calendar-cell ${date.startsWith(state.calendarMonth) ? '' : 'other-month'} ${date === TODAY ? 'today' : ''} ${date === state.day ? 'selected' : ''}" data-action="calendar-day" data-date="${date}" aria-label="${longDate(date)}，${itemCount} 项安排" aria-pressed="${date === state.day}"><span class="calendar-number">${parseDay(date).getDate()}</span>${itemCount ? `<span class="calendar-event-indicator"><span>${itemCount}</span><span class="calendar-event-label">项安排</span></span>` : ''}</button>`; }).join('')}</div></section><aside class="calendar-aside"><h2>${shortDate(state.day)}的安排</h2><p>${dayItems.length} 件小事，慢慢来。</p><div class="task-list">${dayItems.length ? dayItems.map(item => 'done' in item ? renderTask(item) : `<div class="task-row">${taskIcon(item.kind)}<button class="task-description" data-action="event-detail" data-id="${item.id}"><strong>${escapeText(item.title)}</strong><small>${item.time} · ${escapeText(item.location || '地点待定')}</small></button>${icon('chevron-right')}</div>`).join('') : emptyState('这一天还是空白的', '给它安排一件喜欢的小事。')}</div><button class="text-button" data-action="add-event">${icon('plus')}添加这一天的安排</button></aside></div>`;
}
function renderExpenses() {
  const pet = currentPet(), list = expenses(), total = expenseTotal(state.expenseMonth);
  return `${viewHeader('花在它身上的，都记得。', `${escapeText(pet.name)}的饮食、护理与生活花销。`, actionButton('记一笔', 'add-record', 'data-kind="expense"', true))}<div class="calendar-toolbar"><div class="month-controls"><button class="icon-button" data-action="expense-month" data-step="-1" aria-label="查看上个月花销">${icon('chevron-left')}</button><h2><span class="number">${state.expenseMonth.slice(0, 4)}</span> 年 <span class="number">${Number(state.expenseMonth.slice(5))}</span> 月</h2><button class="icon-button" data-action="expense-month" data-step="1" aria-label="查看下个月花销">${icon('chevron-right')}</button></div><button class="text-button" data-action="export">${icon('download')}导出记录</button></div><div class="expenses-head"><section class="month-total"><p>这个月，为它花了</p><div class="expense-summary"><span>¥</span><strong>${money(total)}</strong></div><small>${list.length} 笔记录，不算大账，只记日常。</small></section><section class="budget-panel"><div class="budget-title"><h3>每月的小预算</h3><button class="text-button" data-action="budget">调整 ${icon('edit')}</button></div><div class="expense-summary"><span>¥</span><strong>${money(pet.budget)}</strong></div><p>${total <= pet.budget ? `还可以花 ¥${money(pet.budget - total)}` : `本月超出预算 ¥${money(total - pet.budget)}`}</p></section></div><section class="content-panel"><div class="section-heading"><h2>花销明细</h2><span class="subtle">共 ${list.length} 笔</span></div>${list.length ? `<div class="table-scroll"><table class="expense-table"><thead><tr><th>买了什么</th><th>分类</th><th>日期</th><th class="table-number">金额</th><th></th></tr></thead><tbody>${list.map(record => `<tr><td><button class="expense-name" data-action="record-detail" data-id="${record.id}">${taskIcon(record.category === 'health' ? 'medical' : 'expense')}${escapeText(record.title)}</button></td><td><span class="category-tag">${CATEGORIES[record.category]}</span></td><td class="table-date">${record.date}</td><td class="table-number">¥ ${money(record.value)}</td><td style="text-align:right"><button class="icon-button" data-action="edit-record" data-id="${record.id}" aria-label="编辑${escapeText(record.title)}">${icon('edit')}</button></td></tr>`).join('')}</tbody></table></div>` : emptyState('这个月还没有花销记录', '买一袋粮，添一个玩具，都可以记在这里。', 'add-expense', '记一笔')}</section>`;
}

function openModal(title, body, kicker = '') {
  if (!modal.open && !document.activeElement.closest('.modal-layer')) modalReturnFocus = document.activeElement;
  modal.classList.remove('photo-viewer', 'notifications-modal', 'compact-modal', 'settings-modal', 'data-modal', 'about-modal', 'instant-modal');
  document.querySelector('#modal-status').textContent = '';
  document.querySelector('#toast').classList.remove('visible');
  document.querySelector('#modal-title').textContent = title;
  document.querySelector('#modal-kicker').textContent = kicker;
  const content = document.querySelector('#modal-body'), footer = document.querySelector('#modal-footer');
  content.innerHTML = body;
  footer.replaceChildren();
  const actions = content.querySelector('.form-actions'), form = content.querySelector('form[data-form]');
  if (actions) footer.append(actions);
  footer.hidden = !actions;
  if (form) { form.id = 'active-modal-form'; footer.querySelectorAll('button[type="submit"]').forEach(button => button.setAttribute('form', form.id)); }
  document.querySelector('#modal-layer').hidden = false;
  document.querySelector('.sidebar').inert = true;
  document.querySelector('.main-window').inert = true;
  if (!modal.open) modal.show();
  (content.querySelector('[autofocus], input:not([type="hidden"]), select, textarea') || modal.querySelector('[data-action="close-modal"]')).focus({ preventScroll: true });
}
function closeModal() {
  modal.close();
  document.querySelector('#modal-layer').hidden = true;
  document.querySelector('.sidebar').inert = false;
  document.querySelector('.main-window').inert = false;
  queueMicrotask(() => { if (!modal.open) (modalReturnFocus?.isConnected ? modalReturnFocus : workspace.querySelector('.primary-button') || workspace).focus({ preventScroll: true }); });
}
function toast(message) { clearTimeout(toastTimer); if (modal.open) { const status = document.querySelector('#modal-status'); status.textContent = message; toastTimer = setTimeout(() => { status.textContent = ''; }, 3500); return; } const element = document.querySelector('#toast'); element.querySelector('span').textContent = message; element.classList.add('visible'); toastTimer = setTimeout(() => element.classList.remove('visible'), 2800); }
function field(label, name, value = '', options = {}) { const { type = 'text', full = false, required = true, attrs = '', placeholder = '' } = options; return `<label class="form-field ${full ? 'full' : ''}">${label}<input name="${name}" type="${type}" value="${escapeText(value)}" ${required ? 'required' : ''} ${attrs} placeholder="${escapeText(placeholder)}"></label>`; }
function selectField(label, name, selected, items, full = false) { return `<label class="form-field ${full ? 'full' : ''}">${label}<select name="${name}">${items.map(([value, text]) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`; }
function noteField(value = '') { return `<label class="form-field full">备注<textarea name="note" maxlength="500" placeholder="还有什么想记下来？">${escapeText(value)}</textarea></label>`; }
function formActions(label, deleteAction = '', id = '') { return `<div class="form-actions">${deleteAction ? `<button type="button" class="secondary-button danger-button" data-action="${deleteAction}" data-id="${id}">${icon('trash')}删除</button>` : ''}<button type="button" class="secondary-button" data-action="close-modal">取消</button><button type="submit" class="primary-button">${label}</button></div>`; }
function openPetForm(id = '') {
  const pet = id ? pets.find(item => item.id === id) : { name: '', species: 'dog', breed: '', sex: 'male', birthday: '2025-01-01', adoption: TODAY, neutered: false };
  openModal(id ? `编辑${pet.name}的小档案` : '认识一位新伙伴', `<form data-form="pet" data-id="${id}"><div class="form-grid">${field('宠物名字', 'name', pet.name, { attrs: 'maxlength="20"', placeholder: '你平时怎么叫它？' })}${selectField('宠物类型', 'species', pet.species, [['dog', '狗狗'], ['cat', '猫咪']])}${field('品种', 'breed', pet.breed, { full: true, attrs: 'maxlength="40"', placeholder: '例如：金毛寻回犬' })}${field('生日', 'birthday', pet.birthday, { type: 'date', attrs: `min="2000-01-01" max="${TODAY}"` })}${field('来到家的日子', 'adoption', pet.adoption, { type: 'date', attrs: `min="2000-01-01" max="${TODAY}"` })}${selectField('性别', 'sex', pet.sex, [['male', '男孩子'], ['female', '女孩子']])}${selectField('绝育状态', 'neutered', String(pet.neutered), [['true', '已绝育'], ['false', '未绝育']])}</div>${formActions(id ? '保存档案' : '添加宠物')}</form>`, '每一个小伙伴，都有自己的名字');
}
function openRecord(kind = 'note', id = '') {
  const record = id ? records.find(item => item.id === id) : null;
  const titles = { food: '喂食记录', walk: `和${currentPet().name}散步`, groom: '日常护理', weight: '体重记录', note: '今天的小记', expense: '宠物用品', medical: '健康检查' };
  recordDraft = record ? { ...record } : { kind, title: titles[kind], date: TODAY, time: '12:30', value: '', note: '', category: 'food' };
  recordDraft.allowedKinds = record?.taskId ? [record.kind] : kind === 'medical' || state.view === 'health' ? ['medical', 'weight', 'groom'] : ['food', 'walk', 'groom', 'weight', 'note', 'expense'];
  renderRecordForm(id);
}
function renderRecordForm(id = '') {
  const draft = recordDraft, kind = KINDS[draft.kind], available = draft.allowedKinds;
  openModal(id ? '编辑这次记录' : '记录一下小日常', `<div class="record-types" style="grid-template-columns:repeat(${available.length},minmax(0,1fr))">${available.map(key => `<button class="record-type ${draft.kind === key ? 'selected' : ''}" data-action="record-kind" data-kind="${key}" data-id="${id}" aria-pressed="${draft.kind === key}">${icon(KINDS[key].icon)}${KINDS[key].label}</button>`).join('')}</div><form data-form="record" data-id="${id}" data-kind="${draft.kind}"><div class="form-grid">${field('记录内容', 'title', draft.title, { full: true, attrs: 'maxlength="80"' })}${field('日期', 'date', draft.date, { type: 'date', attrs: `min="2000-01-01" max="${TODAY}"` })}${field('时间', 'time', draft.time, { type: 'time' })}${kind.field ? field(kind.field, 'value', draft.value ?? '', { type: 'number', full: draft.kind !== 'expense', attrs: `min="${['weight', 'expense'].includes(draft.kind) ? '.01' : '1'}" max="${kind.max}" step="${['weight', 'expense'].includes(draft.kind) ? '.01' : '1'}"` }) : ''}${draft.kind === 'expense' ? selectField('花销分类', 'category', draft.category || 'food', Object.entries(CATEGORIES)) : ''}${noteField(draft.note)}</div>${formActions(id ? '保存记录' : '添加记录', id ? 'delete-record' : '', id)}</form>`, `${currentPet().name}的${kind.label}记录`);
}
function openRecordDetail(id) {
  const record = records.find(item => item.id === id);
  if (!record) return;
  const pet = pets.find(item => item.id === record.petId), kind = KINDS[record.kind];
  openModal('一件值得记住的小事', `<div class="detail-header">${taskIcon(record.kind)}<div><h3>${escapeText(record.title)}</h3><p>${escapeText(pet.name)} · ${record.date} ${record.time} · ${kind.label}</p></div></div>${record.value != null ? `<p class="detail-value">${record.kind === 'expense' ? `¥ ${money(record.value)}` : record.value}<small>${record.kind === 'expense' ? CATEGORIES[record.category] : kind.unit}</small></p>` : ''}<p class="detail-note">${escapeText(record.note || '这次没有额外备注。')}</p><div class="form-actions"><button class="secondary-button danger-button" data-action="delete-record" data-id="${id}">${icon('trash')}删除记录</button><button class="primary-button" data-action="edit-record" data-id="${id}">${icon('edit')}编辑记录</button></div>`, `${shortDate(record.date)}的生活片段`);
}
function openTaskForm(id = '') {
  const task = id ? tasks.find(item => item.id === id) : { title: '', date: state.day, time: '18:00', kind: 'food', note: '' };
  openModal(id ? '编辑照护小事' : '添加一件照护小事', `<form data-form="task" data-id="${id}"><div class="form-grid">${field('要做什么', 'title', task.title, { full: true, attrs: 'maxlength="80"', placeholder: '例如：傍晚带它散步' })}${field('日期', 'date', task.date, { type: 'date', attrs: 'min="2000-01-01" max="2100-12-31"' })}${field('时间', 'time', task.time, { type: 'time' })}${selectField('照护类型', 'kind', task.kind, ['food', 'walk', 'groom', 'medical'].map(key => [key, KINDS[key].label]), true)}${noteField(task.note)}</div>${formActions(id ? '保存照护' : '添加照护', id ? 'delete-task' : '', id)}</form>`, `${currentPet().name}的日常照护`);
}
function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  if (!task.done && task.date > TODAY) { toast('未来的照护还不能打卡，到了当天再记录。'); return; }
  task.done = !task.done;
  if (task.done) records.push({ id: uid('r'), petId: task.petId, kind: task.kind, date: task.date, time: task.time, title: task.title, note: task.note, taskId: task.id });
  else records = records.filter(record => record.taskId !== task.id);
  const check = workspace.querySelector(`[data-action="toggle-task"][data-id="${id}"]`), row = check.closest('.task-row'), list = row.parentElement;
  check.classList.toggle('checked', task.done); check.setAttribute('aria-pressed', task.done); check.setAttribute('aria-label', `${task.done ? '取消完成' : '完成'}：${task.title}`);
  row.classList.toggle('done', task.done);
  const tag = row.querySelector('.task-tag'); tag.classList.toggle('completed', task.done); tag.textContent = task.done ? '已完成' : KINDS[task.kind].label;
  const progress = workspace.querySelector('#care-progress');
  if (progress) { const daily = tasks.filter(item => item.petId === state.petId && item.date === state.day); progress.innerHTML = `<span class="number">${daily.filter(item => item.done).length} / ${daily.length}</span> 已完成`; }
  if (state.view === 'today' && state.taskFilter === 'pending' && task.done) { row.remove(); if (!list.querySelector('.task-row')) list.innerHTML = emptyState('照护小事都记好啦', '接下来，好好享受你们的相处时间。'); }
  document.querySelector('#notification-dot').hidden = !state.notifications || !notificationItems().length;
  toast(task.done ? '照护已完成，也记进生活记录啦。' : '已取消完成，关联的打卡记录已移除。');
}
function openEventForm(id = '') {
  const event = id ? events.find(item => item.id === id) : { title: '', date: state.day, time: '10:00', kind: 'medical', location: '', note: '' };
  openModal(id ? '编辑这次安排' : '留出下一次陪伴的时间', `<form data-form="event" data-id="${id}"><div class="form-grid">${field('安排名称', 'title', event.title, { full: true, attrs: 'maxlength="80"', placeholder: '例如：年度疫苗加强针' })}${field('日期', 'date', event.date, { type: 'date', attrs: 'min="2000-01-01" max="2100-12-31"' })}${field('时间', 'time', event.time, { type: 'time' })}${selectField('安排类型', 'kind', event.kind, ['medical', 'groom', 'walk', 'food'].map(key => [key, KINDS[key].label]))}${field('地点', 'location', event.location, { required: false, attrs: 'maxlength="80"', placeholder: '也可以在家里' })}${noteField(event.note)}</div><p class="weight-caption" style="margin-top:15px">安排会显示在日历中，方便查看和调整。</p>${formActions(id ? '保存安排' : '添加安排', id ? 'delete-event' : '', id)}</form>`, `${currentPet().name}的日程`);
}
function openEventDetail(id) {
  const event = events.find(item => item.id === id);
  if (!event) return;
  openModal('下一次，好好陪它', `<div class="detail-header">${taskIcon(event.kind)}<div><h3>${escapeText(event.title)}</h3><p>${longDate(event.date)} ${event.time}</p></div></div><dl class="fact-list"><div><dt>小伙伴</dt><dd>${escapeText(pets.find(pet => pet.id === event.petId).name)}</dd></div><div><dt>地点</dt><dd>${escapeText(event.location || '地点待定')}</dd></div></dl><p class="detail-note">${escapeText(event.note || '这次没有额外备注。')}</p><div class="form-actions"><button class="secondary-button" data-action="export-event" data-id="${id}">${icon('calendar-share')}导出日历</button><button class="primary-button" data-action="edit-event" data-id="${id}">${icon('edit')}编辑安排</button></div>`, `${currentPet().name}的${KINDS[event.kind].label}安排`);
}
function openBudget() { openModal('每月的小预算', `<form data-form="budget"><div class="form-grid">${field('每月预算（元）', 'budget', currentPet().budget, { type: 'number', full: true, attrs: 'min="0" max="1000000" step="0.01"' })}</div>${formActions('保存预算')}</form>`, `为${currentPet().name}留一点生活预算`); }
function notificationItems() {
  return [...tasks.filter(task => task.date === TODAY && !task.done).map(task => ({ ...task, source: 'task' })), ...events.filter(event => event.date >= TODAY && dayDistance(TODAY, event.date) <= 7).map(event => ({ ...event, source: 'event' }))].sort(chronological);
}
function openNotifications() {
  const list = state.notifications ? notificationItems() : [], today = list.filter(item => item.source === 'task'), upcoming = list.filter(item => item.source === 'event');
  const itemMarkup = item => `<button class="notification-item" data-action="notification-open" data-id="${item.id}" data-pet="${item.petId}" data-source="${item.source}">${taskIcon(item.kind)}<span><strong>${escapeText(item.title)}</strong><small>${escapeText(pets.find(pet => pet.id === item.petId).name)} · ${item.date === TODAY ? '今天' : shortDate(item.date)} ${item.time}</small></span></button>`;
  openModal('别忘了这些小事', `${state.notifications ? `<div class="notifications-layout"><section class="notifications-column"><h3>${icon('checklist')}今天的照护<span>${today.length} 项</span></h3><div class="notification-list">${today.length ? today.map(itemMarkup).join('') : emptyState('今天的照护都完成啦', '好好享受你们的相处时间。')}</div></section><section class="notifications-column"><h3>${icon('calendar-event')}接下来 7 天<span>${upcoming.length} 项</span></h3><div class="notification-list">${upcoming.length ? upcoming.map(itemMarkup).join('') : emptyState('近期没有新安排', '下一次护理或检查可以记进日历。')}</div></section></div>` : emptyState('照护提醒已关闭', '可以在偏好设置中重新打开。')}<div class="notification-footnote"><span>把每一件照护小事安排好。</span><button class="text-button" data-action="settings">${icon('adjustments-horizontal')}提醒偏好</button></div>`, `${TODAY} · 所有小伙伴的照护提醒`);
  modal.classList.add('notifications-modal');
  if (!state.notifications) modal.classList.add('compact-modal');
}
function openSettings() {
  openModal('让这里更像你的日常', `<form data-form="settings"><input type="hidden" name="notifications" value="${state.notifications}"><div class="form-grid">${field('怎么称呼你', 'user', state.user, { attrs: 'maxlength="20"' })}${field(`${escapeText(currentPet().name)}的每月预算（元）`, 'budget', currentPet().budget, { type: 'number', attrs: 'min="0" max="1000000" step="0.01"' })}</div><div class="setting-row"><span><strong>照护提醒</strong><small>别忘记今天的照护和近期的重要安排。</small></span><button type="button" class="switch ${state.notifications ? 'on' : ''}" data-action="toggle-notifications" role="switch" aria-checked="${state.notifications}" aria-label="照护提醒"></button></div><div class="setting-row"><span><strong>把记录带走</strong><small>整理小伙伴的档案、日程与生活记录。</small></span><button type="button" class="secondary-button" data-action="export">${icon('download')}导出</button></div>${formActions('保存偏好')}</form>`, '个人偏好');
  modal.classList.add('settings-modal');
}
function openSearch() {
  openModal('找找那一天的小事', `<label class="search-modal-input">${icon('search')}<input id="global-search" type="search" placeholder="搜索所有宠物的记录、备注或日期" aria-label="搜索所有宠物记录" autofocus></label><div id="search-results" class="search-results">${renderSearchResults('')}</div>`, '搜索生活记录');
    modal.classList.add('instant-modal');
}
function renderSearchResults(query) {
  query = query.trim().toLowerCase();
  const list = records.filter(record => `${record.title} ${record.note} ${record.date} ${pets.find(pet => pet.id === record.petId).name}`.toLowerCase().includes(query)).sort((a, b) => chronological(b, a)).slice(0, 12);
  return list.length ? list.map(record => `<button class="search-result" data-action="search-open" data-id="${record.id}" data-pet="${record.petId}">${taskIcon(record.kind)}<span><strong>${escapeText(record.title)}</strong><small>${escapeText(pets.find(pet => pet.id === record.petId).name)} · ${record.date} ${record.time}</small></span></button>`).join('') : emptyState('没有找到这件小事', '试试宠物名字、日期或备注中的关键词。');
}
function download(content, filename, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.hidden = true; document.querySelector('.app-window').append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function exportRecords() { const photoMetadata = photos.map(({ src, ...info }) => ({ ...info, ...(info.uploaded ? { source: 'local-session', imageIncluded: false } : { src }) })); download(JSON.stringify({ exportedAt: new Date().toISOString(), referenceDate: TODAY, pets, tasks, events, records, photos: photoMetadata }, null, 2), `pawday-records-${TODAY}.json`, 'application/json'); toast('已生成 JSON 导出文件，包含照片说明但不包含图片文件。'); }
function exportEvent(id) {
  const event = events.find(item => item.id === id), start = parseDay(event.date);
  const [hours, minutes] = event.time.split(':').map(Number); start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 60 * 60000);
  const stamp = date => `${dateKey(date).replaceAll('-', '')}T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00`;
  const safe = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//pawday//Pet life//ZH', 'BEGIN:VEVENT', `UID:${safe(event.id)}@pawday.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${safe(event.title)}`, `LOCATION:${safe(event.location)}`, `DESCRIPTION:${safe(event.note)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  download(content, `pawday-${event.date}.ics`, 'text/calendar;charset=utf-8'); toast('已生成日历文件，可导入你的日历应用。');
}
function confirmDelete(type, id) {
  const item = ({ record: records, task: tasks, event: events, photo: photos })[type].find(entry => entry.id === id);
  openModal(type === 'photo' ? '删除这张照片？' : '删除这条记录？', `<div class="detail-note" style="margin-top:0">${escapeText(item.title)}${type === 'record' && item.taskId ? '\n删除打卡记录后，对应照护将恢复为待完成。' : ''}${type === 'task' && item.done ? '\n照护计划会被删除，已完成的生活记录会保留。' : ''}</div><div class="form-actions"><button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="confirm-delete" data-type="${type}" data-id="${id}">确认删除</button></div>`, '删除后无法撤销');
}

function submitForm(form) {
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  for (const name of ['title', 'name', 'breed', 'user']) {
    if (name in data && !data[name].trim()) { const input = form.elements.namedItem(name); input.setCustomValidity('请填写内容，不能只输入空格。'); input.reportValidity(); return; }
    if (name in data) data[name] = data[name].trim();
  }
  const id = form.dataset.id;
  switch (form.dataset.form) {
    case 'pet': {
      if (data.adoption < data.birthday) { const input = form.elements.namedItem('adoption'); input.setCustomValidity('来到家的日子不能早于生日。'); input.reportValidity(); return; }
      data.neutered = data.neutered === 'true';
      if (id) Object.assign(pets.find(pet => pet.id === id), data);
      else { const pet = { ...data, id: uid('pet'), mood: '新伙伴，慢慢熟悉中', budget: 800 }; pets.push(pet); state.petId = pet.id; }
      break;
    }
    case 'record': {
      const existing = id ? records.find(record => record.id === id) : null;
      const record = { ...(existing || {}), ...data, id: id || uid('r'), petId: existing?.petId || state.petId, kind: form.dataset.kind };
      if ('value' in data) record.value = Number(data.value); else delete record.value;
      if (record.kind !== 'expense') delete record.category;
      if (id) records[records.findIndex(item => item.id === id)] = record; else records.push(record);
      if (record.taskId) { const task = tasks.find(item => item.id === record.taskId); if (task) Object.assign(task, { date: record.date, time: record.time, title: record.title, note: record.note }); }
      if (record.kind === 'expense') state.expenseMonth = record.date.slice(0, 7);
      break;
    }
    case 'task': {
      if (id) { const task = tasks.find(item => item.id === id); if (task.done && data.date > TODAY) { const input = form.elements.namedItem('date'); input.setCustomValidity('已完成的照护不能移动到未来日期。'); input.reportValidity(); return; } Object.assign(task, data); const linked = records.find(record => record.taskId === id); if (linked) { if (linked.kind !== data.kind) delete linked.value; Object.assign(linked, { date: data.date, time: data.time, kind: data.kind, title: data.title, note: data.note }); } }
      else tasks.push({ ...data, id: uid('t'), petId: state.petId, done: false });
      state.day = data.date; state.calendarMonth = data.date.slice(0, 7);
      break;
    }
    case 'event': {
      if (id) Object.assign(events.find(item => item.id === id), data); else events.push({ ...data, id: uid('e'), petId: state.petId });
      state.day = data.date; state.calendarMonth = data.date.slice(0, 7);
      break;
    }
    case 'budget': currentPet().budget = Number(data.budget); break;
    case 'settings': state.user = data.user; state.notifications = data.notifications === 'true'; currentPet().budget = Number(data.budget); break;
    case 'photo': Object.assign(photos.find(photo => photo.id === id), data); break;
  }
  closeModal(); render(); toast(({ pet: '小档案已记好。', record: '这次的小日常已记好。', task: '照护计划已更新。', event: '安排已记进日历。', budget: '月度预算已更新。', settings: '偏好已更新。', photo: '照片说明已保存。' })[form.dataset.form]);
}

document.addEventListener('click', event => {
  const brand = event.target.closest('.brand');
  if (brand) { event.preventDefault(); navigate('today'); return; }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, kind, view, filter, date, step, range } = button.dataset;
  if (event.detail === 0) { button.classList.add('instant-action'); if (modal.open) modal.classList.add('instant-modal'); requestAnimationFrame(() => button.classList.remove('instant-action')); }
  switch (action) {
    case 'nav': navigate(view); break;
    case 'switch-pet': switchPet(id); break;
    case 'add-pet': openPetForm(); break;
    case 'edit-pet': openPetForm(state.petId); break;
    case 'add-record': openRecord(kind || 'note'); break;
    case 'add-expense': openRecord('expense'); break;
    case 'add-health': openRecord('medical'); break;
    case 'edit-record': { const record = records.find(item => item.id === id); state.petId = record.petId; openRecord(record.kind, id); break; }
    case 'record-detail': openRecordDetail(id); break;
    case 'record-kind': { const form = modal.querySelector('form'); const values = Object.fromEntries(new FormData(form)); const previous = recordDraft.kind; Object.assign(recordDraft, values, { kind }); if (previous !== kind) recordDraft.value = ''; renderRecordForm(id); break; }
    case 'add-task': openTaskForm(); break;
    case 'edit-task': openTaskForm(id); break;
    case 'toggle-task': toggleTask(id); break;
    case 'task-filter': state.taskFilter = filter; render(); break;
    case 'select-day': state.day = date; render(); break;
    case 'record-filter': state.recordFilter = filter; render(); break;
    case 'record-mode': if (event.detail === 0) state.photoSeen = true; setRecordMode(button.dataset.mode, event.detail === 0); break;
    case 'open-photo-wall': state.recordTab = 'photos'; if (event.detail === 0) state.photoSeen = true; navigate('records'); break;
    case 'add-photos': document.querySelector('#photo-input').click(); break;
    case 'photo-detail': openPhotoDetail(id); break;
    case 'photo-favorite': togglePhotoFavorite(id); break;
    case 'photo-step': photoStep(Number(step)); break;
    case 'edit-photo': openPhotoForm(id); break;
    case 'delete-photo': confirmDelete('photo', id); break;
    case 'photo-filter': state.photoFilter = filter; workspace.querySelectorAll('.photo-toolbar [data-action="photo-filter"]').forEach(chip => { const selected = chip.dataset.filter === filter; chip.classList.toggle('selected', selected); chip.setAttribute('aria-pressed', selected); }); updatePhotoGrid(); break;
    case 'health-range': state.healthRange = range; render(); break;
    case 'weight-table': openWeightTable(id); break;
    case 'add-event': openEventForm(); break;
    case 'edit-event': openEventForm(id); break;
    case 'event-detail': openEventDetail(id); break;
    case 'calendar-day': state.day = date; if (!date.startsWith(state.calendarMonth)) state.calendarMonth = date.slice(0, 7); render(); break;
    case 'calendar-month': state.calendarMonth = monthShift(state.calendarMonth, Number(step)); state.day = `${state.calendarMonth}-01`; render(); break;
    case 'calendar-today': state.day = TODAY; state.calendarMonth = TODAY.slice(0, 7); render(); break;
    case 'expense-month': state.expenseMonth = monthShift(state.expenseMonth, Number(step)); render(); break;
    case 'budget': openBudget(); break;
    case 'settings': openSettings(); break;
    case 'notifications': openNotifications(); break;
    case 'toggle-notifications': { const input = button.closest('form').elements.namedItem('notifications'), enabled = input.value !== 'true'; input.value = String(enabled); button.classList.toggle('on', enabled); button.setAttribute('aria-checked', enabled); break; }
    case 'notification-open': state.petId = button.dataset.pet; closeModal(); if (button.dataset.source === 'task') { state.day = TODAY; navigate('today'); openTaskForm(id); } else { const selected = events.find(item => item.id === id); state.day = selected.date; state.calendarMonth = selected.date.slice(0, 7); navigate('schedule'); openEventDetail(id); } break;
    case 'search': openSearch(); break;
    case 'search-open': state.petId = button.dataset.pet; state.recordFilter = 'all'; state.recordQuery = ''; state.recordTab = 'timeline'; navigate('records'); openRecordDetail(id); break;
    case 'export': exportRecords(); break;
    case 'export-event': exportEvent(id); break;
    case 'delete-record': confirmDelete('record', id); break;
    case 'delete-task': confirmDelete('task', id); break;
    case 'delete-event': confirmDelete('event', id); break;
    case 'confirm-delete': {
      if (button.dataset.type === 'record') { const record = records.find(item => item.id === id); const task = tasks.find(item => item.id === record.taskId); if (task) task.done = false; records = records.filter(item => item.id !== id); }
      if (button.dataset.type === 'task') { tasks = tasks.filter(item => item.id !== id); records.forEach(record => { if (record.taskId === id) delete record.taskId; }); }
      if (button.dataset.type === 'event') events = events.filter(item => item.id !== id);
      if (button.dataset.type === 'photo') { const photo = photos.find(item => item.id === id); if (photo.uploaded) URL.revokeObjectURL(photo.src); photos = photos.filter(item => item.id !== id); }
      closeModal(); render(); toast(button.dataset.type === 'photo' ? '这张照片已删除。' : '这条记录已删除。'); break;
    }
    case 'close-modal': closeModal(); break;
    case 'about': openModal('关于爪爪日常', `<section class="about-card"><div class="about-hero"><div><span class="about-wordmark">pawday<span>.</span></span><h3>给陪伴，多一点用心。</h3></div><img src="./assets/walking-together.svg" alt="和小狗一起散步" class="about-illustration"></div><p class="about-description">它记得你回家的声音，你记得它长大的模样。一起吃饭、一起散步，把陪伴的点滴认真收藏。</p><div class="about-moments"><span>${icon('bowl-spoon')}好好吃饭</span><span>${icon('walk')}一起走走</span><span>${icon('photo')}留住瞬间</span></div></section>`, '有它的每一天，都值得被记住'); modal.classList.add('about-modal'); break;
  }
  if (event.detail === 0 && modal.open) modal.classList.add('instant-modal');
});
document.addEventListener('submit', event => { if (event.target.matches('form[data-form]')) { event.preventDefault(); submitForm(event.target); } });
document.addEventListener('input', event => {
  event.target.closest('form')?.querySelectorAll('input, select, textarea').forEach(input => input.setCustomValidity(''));
  if (event.target.id === 'record-query') { state.recordQuery = event.target.value; document.querySelector('#record-list').innerHTML = renderRecordList(); }
  if (event.target.id === 'global-search') document.querySelector('#search-results').innerHTML = renderSearchResults(event.target.value);
  if (event.target.id === 'photo-query') { state.photoQuery = event.target.value; updatePhotoGrid(); }
});
document.addEventListener('change', event => { if (event.target.id === 'photo-input') addPhotos(event.target.files); });
document.addEventListener('error', event => { if (event.target.matches?.('.photo-image > img, .photo-view-image > img')) event.target.parentElement.classList.add('failed'); }, true);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); modal.querySelector('#global-search').focus(); return; }
  if (modal.open && event.key === 'Escape') { event.preventDefault(); modal.classList.add('instant-modal'); closeModal(); return; }
  if (modal.open && event.key === 'Tab') { const controls = [...modal.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter(control => control.getClientRects().length); const first = controls[0], last = controls.at(-1); if (!first) { event.preventDefault(); modal.focus(); } else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
  if (modal.open && event.key === 'Enter') modal.classList.add('instant-modal');
  const tab = event.target.closest('[data-action="record-mode"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const mode = event.key === 'Home' ? 'timeline' : event.key === 'End' ? 'photos' : state.recordTab === 'timeline' ? 'photos' : 'timeline'; state.photoSeen = true; setRecordMode(mode, true); workspace.querySelector(`#record-tab-${mode}`).focus(); return; }
  if (modal.open && modal.classList.contains('photo-viewer') && !event.altKey && !event.ctrlKey && !event.metaKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); photoStep(event.key === 'ArrowLeft' ? -1 : 1); modal.classList.add('instant-modal'); }
});
render();
