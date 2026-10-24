const cards = [
  { id: 'umbreon', name: '月亮伊布 VMAX', english: 'Umbreon VMAX', game: 'pokemon', series: 'Evolving Skies', collection: '进化苍穹', number: '215 / 203', grade: 'PSA 10', price: 8640, rarity: '异图', language: '英文', seller: '阿野的卡册', avatar: 12, city: '上海', added: 8, image: 'https://images.pokemontcg.io/swsh7/215_hires.png' },
  { id: 'charizard', name: '喷火龙 ex', english: 'Charizard ex', game: 'pokemon', series: 'Pokémon 151', collection: '宝可梦 151', number: '199 / 165', grade: 'PSA 10', price: 1680, rarity: '特别插画', language: '英文', seller: '纸片研究所', avatar: 47, city: '杭州', added: 12, image: 'https://images.pokemontcg.io/sv3pt5/199_hires.png' },
  { id: 'gengar', name: '耿鬼 VMAX', english: 'Gengar VMAX', game: 'pokemon', series: 'Fusion Strike', collection: '融合打击', number: '271 / 264', grade: 'PSA 10', price: 3280, rarity: '异图', language: '英文', seller: '耿鬼不睡觉', avatar: 13, city: '广州', added: 10, image: 'https://images.pokemontcg.io/swsh8/271_hires.png' },
  { id: 'rayquaza', name: '烈空坐 VMAX', english: 'Rayquaza VMAX', game: 'pokemon', series: 'Evolving Skies', collection: '进化苍穹', number: '218 / 203', grade: 'PSA 10', price: 4780, rarity: '异图', language: '英文', seller: '绿毛虫收藏家', avatar: 14, city: '成都', added: 9, image: 'https://images.pokemontcg.io/swsh7/218_hires.png' },
  { id: 'mew', name: '梦幻 VMAX', english: 'Mew VMAX', game: 'pokemon', series: 'Fusion Strike', collection: '融合打击', number: '269 / 264', grade: 'NM', price: 890, rarity: '异图', language: '英文', seller: '西柚汽水', avatar: 44, city: '南京', added: 11, image: 'https://images.pokemontcg.io/swsh8/269_hires.png' },
  { id: 'giratina', name: '骑拉帝纳 V', english: 'Giratina V', game: 'pokemon', series: 'Lost Origin', collection: '失落起源', number: '186 / 196', grade: 'PSA 9', price: 2960, rarity: '异图', language: '英文', seller: '时空之外', avatar: 33, city: '深圳', added: 7, image: 'https://images.pokemontcg.io/swsh11/186_hires.png' },
  { id: 'pikachu', name: '皮卡丘 VMAX', english: 'Pikachu VMAX', game: 'pokemon', series: 'Vivid Voltage', collection: '仰天伏特', number: '188 / 185', grade: 'PSA 10', price: 2160, rarity: '彩虹稀有', language: '英文', seller: '十万伏特', avatar: 5, city: '苏州', added: 6, image: 'https://images.pokemontcg.io/swsh4/188_hires.png' },
  { id: 'leafeon', name: '叶伊布 V', english: 'Leafeon V', game: 'pokemon', series: 'Evolving Skies', collection: '进化苍穹', number: '167 / 203', grade: 'NM', price: 760, rarity: '异图', language: '英文', seller: '森林来信', avatar: 49, city: '武汉', added: 5, image: 'https://images.pokemontcg.io/swsh7/167_hires.png' },
  { id: 'blue-eyes', name: '青眼白龙', english: 'Blue-Eyes White Dragon', game: 'yugioh', series: 'Legend of Blue Eyes', collection: '青眼白龙传说', number: '89631139', grade: 'NM', price: 428, rarity: '经典复刻', language: '英文', seller: '决斗者阿诚', avatar: 11, city: '厦门', added: 4, image: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', fallback: 'https://images.ygoprodeck.com/images/cards_small/89631139.jpg' },
  { id: 'dark-magician', name: '黑魔导', english: 'Dark Magician', game: 'yugioh', series: 'Legend of Blue Eyes', collection: '青眼白龙传说', number: '46986414', grade: 'LP', price: 268, rarity: '经典复刻', language: '英文', seller: '决斗者阿诚', avatar: 11, city: '厦门', added: 3, image: 'https://images.ygoprodeck.com/images/cards/46986414.jpg', fallback: 'https://images.ygoprodeck.com/images/cards_small/46986414.jpg' },
  { id: 'luffy', name: '蒙奇 D. 路飞', english: 'Monkey D. Luffy', game: 'onepiece', series: 'Awakening of the New Era', collection: '新时纪的主角', number: 'OP05-119', grade: 'NM', price: 386, rarity: 'SEC', language: '英文', seller: '伟大航路', avatar: 52, city: '长沙', added: 2, image: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP05-119.png' },
  { id: 'lotus', name: '莲花瓣', english: 'Lotus Petal', game: 'magic', series: 'Tempest', collection: '暴风雨', number: '294 / 350', grade: 'LP', price: 158, rarity: '普通', language: '英文', seller: '五色法术力', avatar: 15, city: '北京', added: 1, image: 'https://api.scryfall.com/cards/named?exact=Lotus%20Petal&set=tmp&format=image&version=normal' }
];

const games = { pokemon: '宝可梦', yugioh: '游戏王', onepiece: '航海王', magic: '万智牌' };
const gradeNames = { 'PSA 10': 'PSA 10', 'PSA 9': 'PSA 9', NM: '近全新 NM', LP: '轻微使用 LP' };
const featuredIds = ['umbreon', 'rayquaza', 'gengar'];
const state = {
  mode: 'market', category: 'all', query: '', grade: 'all', min: null, max: null, sort: 'featured', limit: 8,
  favorites: new Set(['gengar', 'mew']), cart: new Set(), heroIndex: 0,
  drafts: [], nextDraftId: 1, editingDraftId: null,
  offers: [], orders: [],
  checkout: { step: 1, name: '', phone: '', city: '', method: 'wechat' },
  sellForm: { cardId: 'umbreon', grade: 'NM', price: '', note: '' },
  messages: new Map()
};
const $ = (selector) => document.querySelector(selector);
const dialog = $('#market-dialog');
const dialogBody = $('#dialog-body');
const toast = $('#toast');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionStyles = getComputedStyle(document.documentElement);
const motion = {
  easing: motionStyles.getPropertyValue('--ease').trim(),
  duration: parseFloat(motionStyles.getPropertyValue('--medium')),
  exit: parseFloat(motionStyles.getPropertyValue('--exit'))
};
const animations = new WeakMap();
const productNodes = new Map();
let keyboardInput = false;
document.addEventListener('pointerdown', () => { keyboardInput = false; }, true);
document.addEventListener('keydown', () => { keyboardInput = true; }, true);
// The entrance fade plays once per tile; cached tiles keep their settled state.
document.addEventListener('animationend', (event) => {
  if (event.animationName === 'tile-in') event.target.classList.remove('is-entering');
}, true);

function stopMotion(element) {
  animations.get(element)?.cancel();
  animations.delete(element);
}

function animateElement(element, keyframes, delay = 0) {
  stopMotion(element);
  if (reduceMotion.matches || keyboardInput || !element.animate) return;
  const animation = element.animate(keyframes, { duration: motion.duration, easing: motion.easing, delay });
  animations.set(element, animation);
  animation.onfinish = () => {
    if (animations.get(element) === animation) animations.delete(element);
  };
}

const favoriteGlyph = '<span class="favorite-glyph"><i class="ti ti-heart" aria-hidden="true"></i></span>';
const money = (value) => {
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString('zh-CN')
    : rounded.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '¥' + text;
};
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const getCard = (id) => cards.find((card) => card.id === id);
const cartCards = () => cards.filter((card) => state.cart.has(card.id));
const cartTotal = () => cartCards().reduce((sum, card) => sum + Math.round(card.price * 100), 0) / 100;

/* Trends: a stable pseudo-random walk seeded by the card id, so charts never jump. */
function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) || 1;
}

function buildSeries(card) {
  let seed = hashString(card.id);
  const next = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const series = [];
  let value = card.price * (.86 + next() * .14);
  for (let day = 0; day < 7; day++) {
    value = Math.max(card.price * .74, value * (.975 + next() * .06));
    series.push(Math.round(value));
  }
  series[series.length - 1] = card.price;
  return series;
}

const trends = new Map(cards.map((card) => {
  const series = buildSeries(card);
  return [card.id, { series, change: (card.price - series[0]) / series[0] * 100 }];
}));

let sparkSeq = 0;
function sparkline(values, { width = 120, height = 34, stroke = 1.6 } = {}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((value, index) => [index * step, height - ((value - min) / span) * (height - 6) - 3]);
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  const tone = up ? 'var(--trend-up)' : 'var(--trend-down)';
  const id = `spark-${++sparkSeq}`;
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${tone};stop-opacity:.34"></stop><stop offset="1" style="stop-color:${tone};stop-opacity:0"></stop></linearGradient></defs><path d="${line} L${width} ${height} L0 ${height} Z" style="fill:url(#${id})"></path><path d="${line}" fill="none" style="stroke:${tone}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path></svg>`;
}

const trendPill = (change, id = '') => {
  const tone = Math.abs(change) < 0.05 ? 'is-flat' : change > 0 ? 'is-up' : 'is-down';
  const glyph = tone === 'is-up' ? 'ti-arrow-up-right' : tone === 'is-down' ? 'ti-arrow-down-right' : 'ti-minus';
  return `<span${id ? ` id="${id}"` : ''} class="change-pill ${tone}"><i class="ti ${glyph}" aria-hidden="true"></i>${Math.abs(change).toFixed(2)}%</span>`;
};

function renderPulse() {
  const total = cards.reduce((sum, card) => sum + card.price, 0);
  const average = total / cards.length;
  const graded = cards.filter((card) => card.grade.startsWith('PSA')).length;
  const totalsByDay = Array.from({ length: 7 }, (_, day) => cards.reduce((sum, card) => sum + trends.get(card.id).series[day], 0));
  const averageByDay = totalsByDay.map((sum) => sum / cards.length);
  const change = (averageByDay[6] / averageByDay[0] - 1) * 100;
  const index = averageByDay[6] / averageByDay[0] * 1000;
  $('#index-value').textContent = index.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  $('#index-change').outerHTML = trendPill(change, 'index-change');
  $('#index-chart').innerHTML = sparkline(totalsByDay, { width: 260, height: 78, stroke: 2 });
  $('#metric-total').textContent = `${cards.length} 张`;
  $('#metric-average').textContent = money(Math.round(average));
  $('#metric-graded').textContent = `${Math.round(graded / cards.length * 100)}%`;
  const movers = [...cards].sort((a, b) => trends.get(b.id).change - trends.get(a.id).change).slice(0, 4);
  $('#mover-list').innerHTML = movers.map((card, position) => {
    const trend = trends.get(card.id);
    const up = trend.change >= 0;
    return `<li><button class="mover" type="button" data-action="detail" data-id="${card.id}" aria-label="查看${card.name}，七日${up ? '上涨' : '下跌'}${Math.abs(trend.change).toFixed(1)}%"><span class="mover-rank">${String(position + 1).padStart(2, '0')}</span><span class="mover-name">${card.name}</span><span class="mover-spark">${sparkline(trend.series, { width: 54, height: 22, stroke: 1.4 })}</span><span class="mover-tail"><b class="mover-price">${money(card.price)}</b><span class="mover-change ${up ? 'is-up' : 'is-down'}">${up ? '+' : '−'}${Math.abs(trend.change).toFixed(1)}%</span></span></button></li>`;
  }).join('');
}


/* Custom select: the platform menu is replaced by a glass listbox panel. ----- */
const selectStates = new Set();
let openSelect = null;

function selectText(select) {
  const option = select.selectedOptions[0];
  return option ? option.textContent.trim() : '';
}

function syncSelect(state) {
  state.trigger.querySelector('.select-value').textContent = selectText(state.select);
  state.menu.querySelectorAll('.select-option').forEach((node) => {
    node.setAttribute('aria-selected', String(node.dataset.value === state.select.value));
  });
}

function refreshSelect(select) {
  if (!select) return;
  selectStates.forEach((state) => { if (state.select === select) syncSelect(state); });
}

function setSelectValue(select, value) {
  if (!select) return;
  select.value = value;
  refreshSelect(select);
}

function closeSelect(restoreFocus = false) {
  if (!openSelect) return;
  const state = openSelect;
  openSelect = null;
  state.trigger.setAttribute('aria-expanded', 'false');
  state.menu.classList.remove('is-open');
  state.menu.inert = true;
  if (restoreFocus) state.trigger.focus({ preventScroll: true });
}

function placeSelectMenu(state) {
  const { trigger, menu, host } = state;
  const rect = trigger.getBoundingClientRect();
  const hostRect = host === document.body
    ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, height: window.innerHeight }
    : host.getBoundingClientRect();
  const inset = 10;
  const gap = 8;
  menu.style.minWidth = `${Math.min(Math.max(rect.width, 200), 340)}px`;
  menu.style.maxHeight = `${Math.max(168, Math.min(324, hostRect.height - inset * 2 - gap))}px`;
  const box = menu.getBoundingClientRect();
  const maxLeft = Math.max(hostRect.left + inset, hostRect.right - inset - box.width);
  const left = Math.min(Math.max(rect.right - box.width, hostRect.left + inset), maxLeft);
  let top = rect.bottom + gap;
  let above = false;
  if (top + box.height > hostRect.bottom - inset) {
    const flipped = rect.top - box.height - gap;
    if (flipped >= hostRect.top + inset) { top = flipped; above = true; }
    else top = Math.max(hostRect.top + inset, hostRect.bottom - inset - box.height);
  }
  menu.classList.toggle('is-above', above);
  menu.style.left = `${left - hostRect.left}px`;
  menu.style.top = `${top - hostRect.top}px`;
}

function openSelectMenu(state) {
  if (openSelect === state) return;
  closeSelect();
  openSelect = state;
  state.trigger.setAttribute('aria-expanded', 'true');
  state.menu.inert = false;
  state.menu.classList.add('is-open');
  placeSelectMenu(state);
  const current = state.menu.querySelector('[aria-selected="true"]');
  if (current) current.focus({ preventScroll: true });
}

function buildSelect(select) {
  if (select.dataset.enhanced) return;
  const control = select.closest('.select-control');
  if (!control) return;
  select.dataset.enhanced = 'true';
  const host = select.closest('dialog') || document.body;
  const labelledBy = select.getAttribute('aria-labelledby');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (labelledBy) trigger.setAttribute('aria-labelledby', labelledBy);
  trigger.innerHTML = '<span class="select-value"></span><i class="ti ti-chevron-down" aria-hidden="true"></i>';
  const menu = document.createElement('div');
  menu.className = 'select-menu';
  menu.id = `${select.id || 'select'}-menu`;
  menu.setAttribute('role', 'listbox');
  if (labelledBy) menu.setAttribute('aria-labelledby', labelledBy);
  menu.inert = true;
  trigger.setAttribute('aria-controls', menu.id);
  menu.replaceChildren(...[...select.options].map((option, index) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'select-option';
    node.setAttribute('role', 'option');
    node.dataset.value = option.value;
    node.style.setProperty('--i', String(index));
    node.innerHTML = `<span>${escapeHTML(option.textContent.trim())}</span><i class="ti ti-check" aria-hidden="true"></i>`;
    return node;
  }));
  select.hidden = true;
  select.tabIndex = -1;
  control.append(trigger);
  host.append(menu);
  const state = { select, trigger, menu, host };
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    openSelectMenu(state);
  });
  selectStates.add(state);
  syncSelect(state);
}

function enhanceSelects(root = document) {
  root.querySelectorAll('.select-control > select').forEach(buildSelect);
}

function cleanupSelects() {
  selectStates.forEach((state) => {
    if (state.trigger.isConnected) return;
    if (openSelect === state) closeSelect();
    state.menu.remove();
    selectStates.delete(state);
  });
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('.select-trigger');
  if (trigger) {
    const state = [...selectStates].find((item) => item.trigger === trigger);
    if (state) {
      if (openSelect === state) closeSelect(true);
      else openSelectMenu(state);
    }
    return;
  }
  const option = event.target.closest('.select-option');
  if (option && openSelect) {
    const state = openSelect;
    const { value } = option.dataset;
    closeSelect(true);
    if (state.select.value !== value) {
      state.select.value = value;
      state.select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncSelect(state);
    return;
  }
  if (openSelect && !event.target.closest('.select-menu')) closeSelect();
});

document.addEventListener('keydown', (event) => {
  if (!openSelect) return;
  const options = [...openSelect.menu.querySelectorAll('.select-option')];
  const index = options.indexOf(document.activeElement);
  if (event.key === 'Escape') { event.preventDefault(); closeSelect(true); return; }
  if (event.key === 'Tab') { closeSelect(); return; }
  if (!options.length) return;
  if (event.key === 'ArrowDown') { event.preventDefault(); options[(index + 1) % options.length].focus(); }
  else if (event.key === 'ArrowUp') { event.preventDefault(); options[(index - 1 + options.length) % options.length].focus(); }
  else if (event.key === 'Home') { event.preventDefault(); options[0].focus(); }
  else if (event.key === 'End') { event.preventDefault(); options[options.length - 1].focus(); }
});

window.addEventListener('scroll', (event) => {
  if (!openSelect) return;
  if (event.target instanceof Node && openSelect.menu.contains(event.target)) return;
  closeSelect();
}, true);
window.addEventListener('resize', () => closeSelect());

let closeTimer;
let toastTimer;
let lastTrigger;

// Failures stay local to the image, without taking the card's identity away.
document.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  if (image.dataset.fallback && image.src !== image.dataset.fallback) {
    image.src = image.dataset.fallback;
    return;
  }
  const frame = image.closest('.image-frame');
  if (frame) frame.classList.add('image-failed');
  else image.hidden = true;
}, true);
document.addEventListener('load', (event) => {
  if (event.target instanceof HTMLImageElement) event.target.closest('.image-frame')?.classList.remove('image-failed');
}, true);

const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.08 }) : null;

function revealContent(root = document) {
  if (!observer || reduceMotion.matches) return;
  root.querySelectorAll('.reveal:not(.is-observed)').forEach((element) => {
    element.classList.add('is-observed');
    observer.observe(element);
  });
}

function imageHTML(card, className = '', eager = false) {
  return `<img class="${className}" src="${escapeHTML(card.image)}" ${card.fallback ? `data-fallback="${escapeHTML(card.fallback)}"` : ''} alt="${escapeHTML(card.name)}，${escapeHTML(card.number)} 卡面" width="734" height="1024" loading="${eager ? 'eager' : 'lazy'}" decoding="async"><span class="media-fallback"><i class="ti ti-photo-off" aria-hidden="true"></i>图片未加载</span>`;
}

function productHTML(card, index) {
  const favorite = state.favorites.has(card.id);
  const inCart = state.cart.has(card.id);
  const ordinal = String(index + 1).padStart(2, '0');
  return `<article class="product-tile" data-card="${card.id}" data-game="${card.game}">
    <div class="product-inner is-entering" style="--i:${index % 8}">
      <div class="product-visual">
        <a href="#card-${card.id}" class="product-open" data-action="detail" data-id="${card.id}" aria-label="查看${card.name}">
          <span class="card-art image-frame"><span class="grade-badge ${card.grade.startsWith('PSA') ? 'is-graded' : ''}">${gradeNames[card.grade]}</span>${imageHTML(card, '', index < 4)}</span>
        </a>
        <span class="tile-index" aria-hidden="true">${ordinal}</span>
        <button class="icon-button favorite-button" type="button" data-action="favorite" data-id="${card.id}" aria-label="${favorite ? '取消收藏' : '收藏'}${card.name}" aria-pressed="${favorite}">${favoriteGlyph}</button>
        <button class="quick-add ${inCart ? 'is-in-cart' : ''}" type="button" data-cart-id="${card.id}" data-id="${card.id}" data-action="${inCart ? 'cart' : 'add-cart'}"><i class="ti ti-shopping-bag" aria-hidden="true"></i>${inCart ? '已在购物袋' : '加入购物袋'}</button>
      </div>
      <div class="product-meta"><a href="#card-${card.id}" data-action="detail" data-id="${card.id}"><h3>${card.name}</h3></a><span class="product-series">${card.collection} · ${card.number}</span>
        <div class="product-bottom"><span class="product-price"><small>¥</small>${card.price.toLocaleString('zh-CN')}</span><button class="seller-mini" type="button" data-action="seller" data-id="${card.id}" aria-label="查看${card.seller}的主页"><img src="https://i.pravatar.cc/48?img=${card.avatar}" alt="" loading="lazy" width="22" height="22"><span>${card.seller}</span></button></div>
      </div>
    </div>
  </article>`;
}

function filteredCards() {
  const query = state.query.trim().toLocaleLowerCase();
  const result = cards.filter((card) => {
    const searchable = [card.name, card.english, card.series, card.collection, card.number, games[card.game]].join(' ').toLocaleLowerCase();
    return (state.mode !== 'favorites' || state.favorites.has(card.id))
      && (state.category === 'all' || card.game === state.category)
      && (!query || searchable.includes(query))
      && (state.grade === 'all' || card.grade === state.grade)
      && (state.min === null || card.price >= state.min)
      && (state.max === null || card.price <= state.max);
  });
  if (state.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (state.sort === 'newest') result.sort((a, b) => b.added - a.added);
  if (state.sort === 'graded') result.sort((a, b) => Number(b.grade.startsWith('PSA')) - Number(a.grade.startsWith('PSA')) || b.price - a.price);
  return result;
}

function renderMarket({ animate = true } = {}) {
  const result = filteredCards();
  const grid = $('#product-grid');
  const canAnimate = animate && !reduceMotion.matches && !keyboardInput;
  const previousPositions = new Map();
  [...grid.children].forEach((element) => {
    if (canAnimate) previousPositions.set(element.dataset.card, element.getBoundingClientRect());
    stopMotion(element);
  });
  const nodes = result.slice(0, state.limit).map((card, index) => {
    if (!productNodes.has(card.id)) {
      const template = document.createElement('template');
      template.innerHTML = productHTML(card, index);
      productNodes.set(card.id, template.content.firstElementChild);
    }
    const node = productNodes.get(card.id);
    const favorite = state.favorites.has(card.id);
    const button = node.querySelector('[data-action="favorite"]');
    button.setAttribute('aria-pressed', String(favorite));
    button.setAttribute('aria-label', `${favorite ? '取消收藏' : '收藏'}${card.name}`);
    return node;
  });
  grid.replaceChildren(...nodes);
  syncCartButtons();
  if (canAnimate) {
    const positions = nodes.map((element) => element.getBoundingClientRect());
    nodes.forEach((element, index) => {
      const before = previousPositions.get(element.dataset.card);
      if (before) {
        const x = before.left - positions[index].left;
        const y = before.top - positions[index].top;
        if (Math.abs(x) > 1 || Math.abs(y) > 1) animateElement(element, [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0, 0)' }]);
      } else {
        animateElement(element, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], (index % 4) * 30);
      }
    });
  }
  $('#market-title').textContent = state.mode === 'favorites' ? '我的收藏' : '卡市热选';
  $('#result-count').textContent = `${result.length} 张${state.mode === 'favorites' ? '收藏卡牌' : '正在出售'}`;
  $('#empty-state').hidden = result.length !== 0;
  const isEmptyCollection = state.mode === 'favorites' && state.favorites.size === 0;
  $('#empty-title').textContent = isEmptyCollection ? '心头好，还在路上' : '没有找到这张牌';
  $('#empty-description').textContent = isEmptyCollection ? '轻点卡牌上的爱心，把喜欢留下。' : '换个关键词，或试试放宽筛选。';
  $('#load-more').hidden = result.length <= state.limit;
  $('#list-end').hidden = result.length === 0 || result.length > state.limit;
  $('#active-query').hidden = !state.query.trim();
  $('#query-label').textContent = `搜索：${state.query.trim()}`;
  const filterCount = [state.min !== null, state.max !== null, state.grade !== 'all'].filter(Boolean).length;
  $('#filter-count').hidden = filterCount === 0;
  $('#filter-count').textContent = filterCount;
  document.querySelectorAll('[data-category]').forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.main-nav [data-action]').forEach((button) => {
    const active = button.dataset.action === (state.mode === 'favorites' ? 'favorites' : 'market');
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  moveCategoryIndicator(!canAnimate);
}

function moveCategoryIndicator(instant = false) {
  const tabs = $('.category-tabs');
  const indicator = $('.category-indicator');
  const active = tabs.querySelector('.is-active');
  if (!active) return;
  const from = getComputedStyle(indicator).transform;
  const to = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  indicator.hidden = false;
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.height = `${active.offsetHeight}px`;
  indicator.style.transition = 'none';
  indicator.style.transform = to;
  if (!instant && tabs.classList.contains('has-indicator')) animateElement(indicator, [{ transform: from }, { transform: to }]);
  else stopMotion(indicator);
  tabs.classList.add('has-indicator');
}

function syncCartButtons() {
  document.querySelectorAll('[data-cart-id]').forEach((button) => {
    const inCart = state.cart.has(button.dataset.cartId);
    if (button.dataset.cartState === String(inCart)) return;
    const quick = button.classList.contains('quick-add');
    const label = inCart ? (quick ? '已在购物袋' : '查看购物袋') : '加入购物袋';
    button.dataset.cartState = String(inCart);
    button.dataset.action = inCart ? 'cart' : 'add-cart';
    button.classList.toggle('is-in-cart', inCart);
    button.setAttribute('aria-label', `${getCard(button.dataset.cartId).name}，${label}`);
    button.innerHTML = `<i class="ti ti-${inCart ? 'check' : 'shopping-bag'}" aria-hidden="true"></i>${label}`;
  });
}

function updateCounts() {
  const previousCount = Number($('#cart-count').textContent);
  $('#favorites-count').textContent = state.favorites.size;
  $('#cart-count').textContent = state.cart.size;
  $('#cart-count').hidden = state.cart.size === 0;
  $('.bag-button').setAttribute('aria-label', `购物袋，${state.cart.size} 张卡牌`);
  syncCartButtons();
  if (state.cart.size > previousCount) animateElement($('.bag-button .ti'), [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-4px) rotate(-12deg)', offset: .4 }, { transform: 'translateY(0) rotate(0deg)' }]);
  persist();
}

/* Local persistence keeps a demo session from resetting on reload. --------- */
const STORAGE_KEY = 'card-market:v1';

function loadPersisted() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (error) { return; }
  if (!saved || typeof saved !== 'object') return;
  if (Array.isArray(saved.favorites)) state.favorites = new Set(saved.favorites.filter((id) => getCard(id)));
  if (Array.isArray(saved.cart)) state.cart = new Set(saved.cart.filter((id) => getCard(id)));
  if (Array.isArray(saved.drafts)) {
    state.drafts = saved.drafts.filter((draft) => draft && getCard(draft.cardId) && Number.isFinite(draft.price));
    state.nextDraftId = state.drafts.reduce((max, draft) => Math.max(max, Number(draft.id) || 0), 0) + 1;
  }
  if (Array.isArray(saved.offers)) state.offers = saved.offers.filter((offer) => offer && getCard(offer.cardId) && Number.isFinite(offer.amount));
  if (Array.isArray(saved.orders)) state.orders = saved.orders.filter((order) => order && order.id && Array.isArray(order.items));
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites: [...state.favorites], cart: [...state.cart], drafts: state.drafts, offers: state.offers, orders: state.orders }));
  } catch (error) { /* private mode or quota: the session still works in memory */ }
}

function showToast(message) {
  clearTimeout(toastTimer);
  (dialog.open ? dialog : document.body).append(toast);
  toast.querySelector('span').textContent = message;
  toast.classList.toggle('motion-instant', keyboardInput || reduceMotion.matches);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function openDialog(title, html, type = '') {
  clearTimeout(closeTimer);
  const wasOpen = dialog.open;
  if (!wasOpen) lastTrigger = document.activeElement;
  dialog.className = `market-dialog ${type ? 'dialog-' + type : ''}`;
  dialog.classList.toggle('motion-instant', keyboardInput || reduceMotion.matches);
  $('#dialog-title').textContent = title;
  closeSelect();
  stopMotion(dialogBody);
  dialogBody.innerHTML = html;
  cleanupSelects();
  enhanceSelects(dialogBody);
  dialogBody.scrollTop = 0;
  syncCartButtons();
  if (!wasOpen) dialog.showModal();
  else animateElement(dialogBody, [{ opacity: .5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }]);
  $('#dialog-title').focus({ preventScroll: true });
}

function closeDialog() {
  if (!dialog.open) return;
  if (reduceMotion.matches || keyboardInput) { clearTimeout(closeTimer); dialog.close(); return; }
  if (dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  closeTimer = setTimeout(() => dialog.close(), motion.exit);
}

dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
dialog.addEventListener('close', () => {
  clearTimeout(closeTimer);
  closeSelect();
  cleanupSelects();
  dialog.classList.remove('is-closing');
  document.body.append(toast);
  if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
});
let backdropPointer = false;
dialog.addEventListener('pointerdown', (event) => { backdropPointer = event.target === dialog; });
dialog.addEventListener('click', (event) => {
  if (event.target === dialog && backdropPointer) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  }
  backdropPointer = false;
});

function openDetail(id) {
  const card = getCard(id);
  if (!card) return;
  const inCart = state.cart.has(id);
  const favorite = state.favorites.has(id);
  const trend = trends.get(id);
  const myOffers = state.offers.filter((offer) => offer.cardId === id);
  openDialog('卡牌详情', `<div class="detail-layout">
    <div class="detail-media"><div class="detail-image image-frame">${imageHTML(card, '', true)}</div><button class="text-button" type="button" data-action="retry-image">重试图片<i class="ti ti-refresh" aria-hidden="true"></i></button></div>
    <div class="detail-info"><p class="detail-category">${games[card.game]} / ${card.collection}</p><h3>${card.name}</h3><p class="detail-subtitle">${card.english}</p><div class="detail-price">${money(card.price)}</div>
      <div class="detail-trend"><span class="form-footnote">近 7 日成交均价</span><span class="detail-spark">${sparkline(trend.series, { width: 132, height: 34 })}</span>${trendPill(trend.change)}</div>
      <dl class="detail-facts"><div><dt>品相 / 评级</dt><dd>${gradeNames[card.grade]}</dd></div><div><dt>卡牌编号</dt><dd>${card.number}</dd></div><div><dt>稀有度</dt><dd>${card.rarity}</dd></div><div><dt>卡牌语言</dt><dd>${card.language}</dd></div></dl>
      <div class="detail-seller"><img src="https://i.pravatar.cc/72?img=${card.avatar}" alt="" width="36" height="36"><div><button class="seller-name" type="button" data-action="seller" data-id="${id}">${card.seller}</button><small>${card.city}发货</small></div><button class="text-button" type="button" data-action="contact" data-id="${id}">询问卖家<i class="ti ti-message-circle" aria-hidden="true"></i></button></div>
      <div class="detail-actions"><button class="button button-primary" type="button" data-cart-id="${id}" data-action="${inCart ? 'cart' : 'add-cart'}" data-id="${id}"><i class="ti ti-shopping-bag" aria-hidden="true"></i>${inCart ? '查看购物袋' : '加入购物袋'}</button><button class="icon-button" type="button" data-action="favorite" data-id="${id}" aria-label="${favorite ? '取消收藏' : '收藏'}${card.name}" aria-pressed="${favorite}">${favoriteGlyph}</button></div>
      <div class="detail-meta-row"><button class="text-button" type="button" data-action="offer" data-id="${id}"><i class="ti ti-hand-stop" aria-hidden="true"></i>向卖家出价</button><span class="form-footnote">${myOffers.length ? `已有 ${myOffers.length} 次出价` : '单张出售，运费与实拍请向卖家确认'}</span></div>
    </div></div>`, 'detail');
}

function toggleFavorite(id) {
  const card = getCard(id);
  if (!card) return;
  const active = !state.favorites.has(id);
  if (active) state.favorites.add(id);
  else state.favorites.delete(id);
  if (state.mode === 'favorites') {
    const hadListFocus = $('#product-grid').contains(document.activeElement);
    renderMarket();
    if (hadListFocus) ($('#product-grid .favorite-button') || $('#empty-state button')).focus({ preventScroll: true });
  }
  document.querySelectorAll(`[data-action="favorite"][data-id="${id}"]`).forEach((button) => {
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `${active ? '取消收藏' : '收藏'}${card.name}`);
  });
  updateCounts();
  showToast(active ? '已加入我的收藏' : '已取消收藏');
}

function addToCart(id) {
  if (!getCard(id)) return;
  if (state.cart.has(id)) { openCart(); return; }
  state.cart.add(id);
  updateCounts();
  showToast('已放入购物袋');
}

function cartRows(removable = true) {
  return cartCards().map((card) => `<div class="cart-item"><a class="cart-thumb image-frame" href="#card-${card.id}" data-action="detail" data-id="${card.id}" aria-label="查看${card.name}">${imageHTML(card, '', true)}</a><div class="cart-item-info"><strong>${card.name}</strong><small>${gradeNames[card.grade]} · ${card.number}</small><b>${money(card.price)}</b></div>${removable ? `<button class="icon-button" type="button" data-action="remove-cart" data-id="${card.id}" aria-label="移除${card.name}"><i class="ti ti-x" aria-hidden="true"></i></button>` : '<span class="form-footnote">× 1</span>'}</div>`).join('');
}

function openCart() {
  if (state.cart.size === 0) {
    openDialog('购物袋', '<div class="empty-state compact-empty"><i class="ti ti-shopping-bag" aria-hidden="true"></i><h3>给心头好留个位置</h3><p>喜欢的卡牌，可以先放进购物袋。</p><button class="button button-primary" type="button" data-action="browse-from-dialog">去卡市看看</button></div>');
    return;
  }
  openDialog(`购物袋（${state.cart.size}）`, `<div class="cart-list">${cartRows()}</div><div class="cart-summary"><div class="summary-row"><span>卡牌小计</span><strong>${money(cartTotal())}</strong></div><div class="summary-row"><span>运费（跨城）</span><span>${money(SHIPPING_FEE)}</span></div><button class="button button-primary" type="button" data-action="checkout">核对购买清单</button><button class="text-button" type="button" data-action="export-cart">导出清单<i class="ti ti-download" aria-hidden="true"></i></button></div>`);
}

const SHIPPING_FEE = 25;
const SERVICE_RATE = 0.015;
const methodNames = { wechat: '微信支付', alipay: '支付宝', transfer: '银行转账' };

function checkoutTotals() {
  const subtotal = cartTotal();
  const service = Math.round(subtotal * SERVICE_RATE * 100) / 100;
  return { subtotal, service, shipping: SHIPPING_FEE, total: Math.round((subtotal + service + SHIPPING_FEE) * 100) / 100 };
}

function stepBar(step) {
  return `<div class="step-bar">${['核对清单', '收货与支付', '完成订单'].map((label, index) => {
    const value = index + 1;
    const cls = value === step ? 'is-active' : value < step ? 'is-done' : '';
    return `${index ? '<span class="step-line" aria-hidden="true"></span>' : ''}<span class="step-item ${cls}"><b>${value < step ? '<i class="ti ti-check" aria-hidden="true"></i>' : value}</b>${label}</span>`;
  }).join('')}</div>`;
}

function openCheckout(step = state.checkout.step) {
  if (!state.cart.size && step !== 3) { openCart(); return; }
  state.checkout.step = step;
  const totals = checkoutTotals();
  if (step === 3) return;
  if (step === 1) {
    openDialog('核对购买清单', `${stepBar(1)}<form class="sell-form" id="checkout-address" novalidate>
      <div class="cart-list">${cartRows(false)}</div>
      <div class="form-row"><label class="field">收货人<input name="name" maxlength="20" value="${escapeHTML(state.checkout.name)}" placeholder="填写真实姓名" autocomplete="name" required></label><label class="field">手机号<input name="phone" inputmode="numeric" maxlength="11" value="${escapeHTML(state.checkout.phone)}" placeholder="11 位手机号" autocomplete="tel" required></label></div>
      <label class="field">所在城市<input name="city" maxlength="20" value="${escapeHTML(state.checkout.city)}" placeholder="如 上海" autocomplete="address-level2" required></label>
      <p class="form-error" id="checkout-error" role="alert" hidden></p>
      <div class="cart-summary"><div class="summary-row"><span>${state.cart.size} 张卡牌小计</span><strong>${money(totals.subtotal)}</strong></div><button class="button button-primary" type="submit">下一步：收货与支付<i class="ti ti-arrow-right" aria-hidden="true"></i></button></div>
    </form>`);
    return;
  }
  const methods = [
    { id: 'wechat', icon: 'ti-brand-wechat', label: '微信支付', note: '即时到账' },
    { id: 'alipay', icon: 'ti-brand-alipay', label: '支付宝', note: '担保交易' },
    { id: 'transfer', icon: 'ti-building-bank', label: '银行转账', note: '1 个工作日内' }
  ];
  openDialog('收货与支付', `${stepBar(2)}<form class="sell-form" id="checkout-pay" novalidate>
    <div class="summary-row"><span>收货人</span><span>${escapeHTML(state.checkout.name)} · ${escapeHTML(state.checkout.phone)}</span></div>
    <div class="summary-row"><span>收货城市</span><span>${escapeHTML(state.checkout.city)}</span></div>
    <div class="field"><span id="method-label">支付方式</span><div class="method-grid" aria-labelledby="method-label">${methods.map((method) => `<button class="method-card ${state.checkout.method === method.id ? 'is-selected' : ''}" type="button" data-action="method" data-method="${method.id}" aria-pressed="${state.checkout.method === method.id}"><i class="ti ${method.icon}" aria-hidden="true"></i><strong>${method.label}</strong><small>${method.note}</small></button>`).join('')}</div></div>
    <div class="cart-summary"><div class="summary-row"><span>卡牌小计</span><span>${money(totals.subtotal)}</span></div><div class="summary-row"><span>平台服务费 1.5%</span><span>${money(totals.service)}</span></div><div class="summary-row"><span>运费</span><span>${money(totals.shipping)}</span></div><div class="summary-row"><span>应付合计</span><strong>${money(totals.total)}</strong></div></div>
    <p class="form-footnote">下单后由平台托管，确认收卡无误再放款给卖家。</p>
    <button class="button button-primary" type="submit"><i class="ti ti-lock" aria-hidden="true"></i>提交订单 ${money(totals.total)}</button>
    <button class="text-button" type="button" data-action="checkout-back">返回修改收货信息<i class="ti ti-chevron-left" aria-hidden="true"></i></button>
  </form>`);
}

function createOrder() {
  const totals = checkoutTotals();
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const order = {
    id: `KQ${stamp}${String(Math.floor(Math.random() * 9000) + 1000)}`,
    items: cartCards().map((card) => ({ id: card.id, name: card.name, price: card.price })),
    buyer: { name: state.checkout.name.trim(), phone: state.checkout.phone.trim(), city: state.checkout.city.trim(), method: state.checkout.method },
    totals,
    createdAt: now.toISOString(),
    status: '待发货'
  };
  state.orders.unshift(order);
  state.cart.clear();
  state.checkout = { step: 1, name: '', phone: '', city: '', method: 'wechat' };
  updateCounts();
  persist();
  openDialog('订单已创建', `${stepBar(3)}<div class="result-head"><i class="ti ti-circle-check" aria-hidden="true"></i><div><h3>卡牌已经为你留好</h3><p class="form-footnote">卖家会在 48 小时内确认并发货。</p></div></div>
    <div class="order-ticket"><span class="form-footnote">订单号</span><strong class="order-no">${order.id}</strong><div class="summary-row"><span>${order.items.length} 张卡牌</span><span>${methodNames[order.buyer.method]}</span></div><div class="summary-row"><span>应付合计</span><strong>${money(order.totals.total)}</strong></div><span class="form-footnote">${escapeHTML(order.buyer.name)} · ${escapeHTML(order.buyer.phone)} · ${escapeHTML(order.buyer.city)}</span></div>
    <div class="modal-actions"><button class="button button-secondary" type="button" data-action="orders">查看订单记录</button><button class="button button-primary" type="button" data-action="browse-from-dialog">继续逛卡市</button></div>
    <p class="form-footnote">演示环境：订单仅保存在本机浏览器，未对接真实支付。</p>`);
  showToast('订单已创建');
}

function openOrders() {
  if (!state.orders.length) {
    openDialog('我的订单', '<div class="empty-state compact-empty"><i class="ti ti-receipt" aria-hidden="true"></i><h3>还没有订单</h3><p>挑一张卡，第一条订单从这里开始。</p><button class="button button-primary" type="button" data-action="browse-from-dialog">去卡市看看</button></div>');
    return;
  }
  openDialog(`我的订单（${state.orders.length}）`, `${state.orders.map((order) => `<div class="result-panel"><div class="result-head"><i class="ti ti-receipt" aria-hidden="true"></i><div><h3 class="order-no">${order.id}</h3><p class="form-footnote">${new Date(order.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${methodNames[order.buyer.method] ?? '未选择'}</p></div><span class="badge badge-wait">${order.status}</span></div><dl class="detail-facts">${order.items.map((item) => `<div><dt>${escapeHTML(item.name)}</dt><dd>${money(item.price)}</dd></div>`).join('')}</dl><div class="summary-row"><span>合计（含服务费与运费）</span><strong>${money(order.totals.total)}</strong></div></div>`).join('')}<div class="modal-actions"><button class="button button-primary" type="button" data-action="browse-from-dialog">继续逛卡市</button></div>`);
}

function certLookup(raw) {
  const digits = String(raw).replace(/\D/g, '');
  if (!/^\d{8,9}$/.test(digits)) return { valid: false, message: '请输入 8–9 位数字的证书编号，例如 48120937。' };
  const pool = cards.filter((card) => card.grade.startsWith('PSA'));
  const seed = hashString(digits);
  const card = pool[seed % pool.length];
  return { valid: true, cert: digits, card, grade: card.grade.replace('PSA ', ''), year: 2018 + seed % 8, status: seed % 7 === 0 ? 'review' : 'ok' };
}

function openCert(prefill = '') {
  openDialog('评级证书核验', `<form class="sell-form" id="cert-form" novalidate>
    <p class="form-footnote">输入 PSA 证书编号，核对卡牌、分数与认证状态。</p>
    <label class="field">证书编号<span class="input-with-prefix"><i class="ti ti-shield-check" aria-hidden="true"></i><input name="cert" inputmode="numeric" maxlength="9" placeholder="如 48120937" value="${escapeHTML(prefill)}" autocomplete="off" required></span></label>
    <p class="form-error" id="cert-error" role="alert" hidden></p>
    <button class="button button-primary" type="submit"><i class="ti ti-search" aria-hidden="true"></i>核验证书</button>
    <p class="form-footnote">演示环境使用示例数据，正式上线需对接评级机构的查询接口。</p>
  </form><div id="cert-result"></div>`);
  $('#cert-form')?.elements.cert.focus({ preventScroll: true });
}

function renderCert(result) {
  const host = $('#cert-result');
  if (!host) return;
  const pass = result.status === 'ok';
  host.innerHTML = `<div class="result-panel"><div class="result-head"><i class="ti ${pass ? 'ti-shield-check' : 'ti-alert-triangle'}" aria-hidden="true"></i><div><h3>${pass ? '证书与卡牌一致' : '需要人工复核'}</h3><p class="form-footnote">证书 ${result.cert} · PSA 记录</p></div><span class="badge ${pass ? 'badge-ok' : 'badge-wait'}">${pass ? '已通过' : '待复核'}</span></div>
    <dl class="detail-facts"><div><dt>卡牌</dt><dd>${escapeHTML(result.card.name)}</dd></div><div><dt>卡牌编号</dt><dd>${escapeHTML(result.card.number)}</dd></div><div><dt>评级分数</dt><dd>PSA ${escapeHTML(result.grade)}</dd></div><div><dt>认证年份</dt><dd>${result.year}</dd></div></dl>
    <div class="modal-actions"><button class="button button-small button-secondary" type="button" data-action="detail" data-id="${result.card.id}">查看这张卡</button><button class="button button-small button-quiet" type="button" data-action="cert-again">重新核验</button></div></div>`;
}

function openOffer(id) {
  const card = getCard(id);
  if (!card) return;
  const quick = [3, 6, 10].map((pct) => ({ pct, amount: Math.round(card.price * (100 - pct) / 100) }));
  const mine = state.offers.filter((offer) => offer.cardId === id);
  openDialog('提交出价', `<form class="sell-form" id="offer-form" data-id="${id}" novalidate>
    <div class="selected-card-preview"><img src="${escapeHTML(card.image)}" alt="${card.name}" width="55" height="76"><div><strong>${escapeHTML(card.name)}</strong><small>${escapeHTML(card.seller)} · ${gradeNames[card.grade]}</small></div><b class="offer-listed">${money(card.price)}</b></div>
    <div class="field"><span>快速出价</span><div class="offer-chips">${quick.map((item) => `<button class="offer-chip" type="button" data-action="pick-offer" data-offer="${item.amount}">${money(item.amount)}<small> −${item.pct}%</small></button>`).join('')}</div></div>
    <label class="field">你的出价<span class="input-with-prefix"><span>¥</span><input name="amount" inputmode="decimal" maxlength="7" placeholder="低于挂牌价" autocomplete="off" required></span></label>
    <p class="form-footnote">出价需低于挂牌价，卖家可在 72 小时内接受或还价。</p>
    <p class="form-error" id="offer-error" role="alert" hidden></p>
    <button class="button button-primary" type="submit"><i class="ti ti-send" aria-hidden="true"></i>提交出价</button>
    ${mine.length ? `<div class="result-panel"><div class="result-head"><i class="ti ti-hand-stop" aria-hidden="true"></i><div><h3>我的出价</h3><p class="form-footnote">最近提交的出价记录</p></div></div>${mine.slice(0, 3).map((offer) => `<div class="offer-row"><span>${money(offer.amount)}</span><span class="badge badge-wait">${offer.status}</span></div>`).join('')}</div>` : ''}
  </form>`);
}

function openOffers() {
  if (!state.offers.length) {
    openDialog('我的出价', '<div class="empty-state compact-empty"><i class="ti ti-hand-stop" aria-hidden="true"></i><h3>还没有出价</h3><p>在卡牌详情页可以向卖家出价。</p><button class="button button-primary" type="button" data-action="browse-from-dialog">去看看</button></div>');
    return;
  }
  openDialog(`我的出价（${state.offers.length}）`, `${state.offers.map((offer) => {
    const card = getCard(offer.cardId);
    return `<div class="result-panel"><div class="result-head"><i class="ti ti-hand-stop" aria-hidden="true"></i><div><h3>${escapeHTML(card.name)}</h3><p class="form-footnote">挂牌 ${money(card.price)} · ${escapeHTML(card.seller)}</p></div><span class="badge badge-wait">${offer.status}</span></div><div class="offer-row"><span>我的出价</span><strong>${money(offer.amount)}</strong></div><div class="modal-actions"><button class="button button-small button-secondary" type="button" data-action="detail" data-id="${card.id}">查看卡牌</button><button class="button button-small button-quiet" type="button" data-action="offer" data-id="${card.id}">再次出价</button></div></div>`;
  }).join('')}`);
}

const stars = (count) => `<span class="stars" aria-label="${count} 星">${Array.from({ length: 5 }, (_, index) => `<i class="ti ti-star${index < count ? ' is-on' : ''}" aria-hidden="true"></i>`).join('')}</span>`;
const reviewPool = [
  { avatar: 5, name: '林一舟', stars: 5, text: '包装用了两层硬卡夹，卡面比实拍还干净。', days: 3 },
  { avatar: 22, name: 'Momo_卡', stars: 5, text: '沟通爽快，当天就发了顺丰。', days: 12 },
  { avatar: 38, name: '纸片阿凯', stars: 4, text: '边角有一点点白，卖家提前说明了。', days: 26 },
  { avatar: 9, name: '小白收藏', stars: 5, text: '第二次买这家的卡，还是稳。', days: 41 }
];

function openSeller(cardId) {
  const card = getCard(cardId);
  if (!card) return;
  const seed = hashString(card.seller);
  const sold = 36 + seed % 240;
  const rate = (98 + (seed % 19) / 10).toFixed(1);
  const listings = cards.filter((item) => item.seller === card.seller);
  const reviews = [reviewPool[seed % reviewPool.length], reviewPool[(seed + 2) % reviewPool.length]];
  openDialog('卖家主页', `<div class="seller-head"><img src="https://i.pravatar.cc/96?img=${card.avatar}" alt="" width="56" height="56"><div><strong>${escapeHTML(card.seller)}</strong><small>${escapeHTML(card.city)} · 加入卡场 ${2 + seed % 6} 年</small></div><span class="badge badge-ok">已实名</span></div>
    <div class="seller-stats"><div class="seller-stat"><b>${sold}</b><span>完成交易</span></div><div class="seller-stat"><b>${rate}%</b><span>好评率</span></div><div class="seller-stat"><b>${listings.length}</b><span>在售卡牌</span></div></div>
    <h3 class="seller-section">在售</h3>
    <div class="seller-listings">${listings.map((item) => `<button class="seller-listing" type="button" data-action="detail" data-id="${item.id}"><img src="${escapeHTML(item.image)}" alt="" width="34" height="47"><span>${escapeHTML(item.name)}<small class="form-footnote">${gradeNames[item.grade]} · ${escapeHTML(item.number)}</small></span><b>${money(item.price)}</b></button>`).join('')}</div>
    <h3 class="seller-section">买家评价</h3>
    <div class="rating-list">${reviews.map((review) => `<div class="rating-item"><img src="https://i.pravatar.cc/56?img=${review.avatar}" alt="" width="28" height="28"><div>${stars(review.stars)}<p>${review.text}</p><small>${review.name} · ${review.days} 天前</small></div></div>`).join('')}</div>
    <div class="modal-actions"><button class="button button-secondary" type="button" data-action="contact" data-id="${cardId}">询问卖家</button><button class="button button-primary" type="button" data-action="detail" data-id="${cardId}">返回卡牌</button></div>`);
}

function openWeeklyReport() {
  const ranked = [...cards].sort((a, b) => trends.get(b.id).change - trends.get(a.id).change);
  const total = cards.reduce((sum, card) => sum + card.price, 0);
  const graded = cards.filter((card) => card.grade.startsWith('PSA')).length;
  const distribution = Object.entries(games)
    .map(([key, label]) => ({ label, count: cards.filter((card) => card.game === key).length }))
    .sort((a, b) => b.count - a.count);
  const rows = (list) => list.map((card) => {
    const trend = trends.get(card.id);
    return `<div class="offer-row"><span>${escapeHTML(card.name)}</span><span class="summary-inline"><b>${money(card.price)}</b>${trendPill(trend.change)}</span></div>`;
  }).join('');
  openDialog('本周行情周报', `<p class="form-footnote">统计口径：在售 ${cards.length} 张单卡的挂牌价，与近 7 日模拟成交序列。</p>
    <dl class="detail-facts"><div><dt>在售总市值</dt><dd>${money(total)}</dd></div><div><dt>平均挂牌价</dt><dd>${money(Math.round(total / cards.length))}</dd></div><div><dt>评级卡占比</dt><dd>${Math.round(graded / cards.length * 100)}%（${graded} 张）</dd></div><div><dt>品类分布</dt><dd>${distribution[0].label} ${distribution[0].count} 张</dd></div></dl>
    <div class="report-block"><h3>领涨</h3>${rows(ranked.slice(0, 3))}</div>
    <div class="report-block"><h3>回调</h3>${rows(ranked.slice(-3).reverse())}</div>
    <div class="modal-actions"><button class="button button-secondary" type="button" data-action="export-report">导出周报</button><button class="button button-primary" type="button" data-action="close-dialog">知道了</button></div>`);
}

function parseAmount(value, allowEmpty = true) {
  const text = value.trim();
  if (!text && allowEmpty) return { valid: true, value: null };
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) return { valid: false };
  return { valid: true, value: Math.round(Number(text) * 100) / 100 };
}

function openSell(reset = false) {
  if (reset) {
    state.editingDraftId = null;
    state.sellForm = { cardId: 'umbreon', grade: 'NM', price: '', note: '' };
  }
  const form = state.sellForm;
  const card = getCard(form.cardId);
  openDialog('让你的好牌出场', `<form id="sell-form" class="sell-form" novalidate>
    <div class="field"><span id="sell-card-label">选择卡牌</span><span class="select-control"><select name="cardId" id="sell-card" aria-labelledby="sell-card-label">${cards.map((item) => `<option value="${item.id}" ${item.id === form.cardId ? 'selected' : ''}>${item.name} / ${item.number}</option>`).join('')}</select></span></div>
    <div class="selected-card-preview" id="sell-card-preview"><img src="${escapeHTML(card.image)}" alt="${card.name}" width="55" height="76"><div><strong>${card.name}</strong><small>${card.series}</small></div></div>
    <div class="form-row"><div class="field"><span id="sell-grade-label">品相 / 评级</span><span class="select-control"><select name="grade" aria-labelledby="sell-grade-label">${Object.entries(gradeNames).map(([value, label]) => `<option value="${value}" ${form.grade === value ? 'selected' : ''}>${label}</option>`).join('')}</select></span></div><label class="field">你的报价<span class="input-with-prefix"><span>¥</span><input name="price" type="text" inputmode="decimal" placeholder="填写售价" value="${escapeHTML(form.price)}" maxlength="10" required aria-describedby="sell-error" autocomplete="off"></span></label></div>
    <label class="field">卡牌补充说明<textarea name="note" placeholder="如边角状态、卡套情况、可提供的实拍" maxlength="240" rows="3">${escapeHTML(form.note)}</textarea></label>
    <p class="form-error" id="sell-error" role="alert" hidden></p><button class="button button-primary" type="submit">预览上架信息</button><div class="summary-row"><span class="form-footnote">生成预览后，再确认是否发布。</span><button class="text-button" type="button" data-action="drafts">我的预览（${state.drafts.length}）</button></div>
  </form>`, 'sell');
}

function openDraftPreview(id) {
  const draft = state.drafts.find((item) => item.id === Number(id));
  if (!draft) return;
  const card = getCard(draft.cardId);
  openDialog('上架预览', `<div class="preview-heading"><i class="ti ti-file-check" aria-hidden="true"></i><div><h3>好牌，准备出场</h3><p class="form-footnote">核对卡牌与报价，再决定发布。</p></div></div><div class="selected-card-preview"><img src="${escapeHTML(card.image)}" alt="${card.name}" width="55" height="76"><div><strong>${card.name}</strong><small>${gradeNames[draft.grade]} · ${card.number}</small></div></div><div class="detail-price">${money(draft.price)}</div>${draft.note ? `<p class="preview-description">${escapeHTML(draft.note)}</p>` : ''}<div class="notice-panel" id="publish-notice" role="status" hidden><i class="ti ti-cloud-up" aria-hidden="true"></i><h3>卡牌尚未发布</h3><p>需要连接账号与交易服务，并补充卡牌实拍。可以先导出这份上架信息。</p><button class="text-button" type="button" data-action="export-draft" data-draft="${draft.id}">导出上架信息<i class="ti ti-download" aria-hidden="true"></i></button></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="edit-draft" data-draft="${draft.id}">返回修改</button><button class="button button-primary" type="button" data-action="publish-draft">发布卡牌</button></div>`, 'sell');
}

function openDrafts() {
  const content = state.drafts.length ? state.drafts.map((draft) => {
    const card = getCard(draft.cardId);
    return `<div class="draft-item"><div class="summary-row"><span>${card.name}</span><strong>${money(draft.price)}</strong></div><p class="form-footnote">${gradeNames[draft.grade]} · 未发布</p><div class="modal-actions"><button class="button button-small button-secondary" type="button" data-action="view-draft" data-draft="${draft.id}">查看预览</button><button class="button button-small button-quiet" type="button" data-action="delete-draft" data-draft="${draft.id}">删除预览</button></div></div>`;
  }).join('') : '<div class="empty-state compact-empty"><i class="ti ti-file" aria-hidden="true"></i><h3>还没有上架预览</h3><p>选一张卡，给它一个新去处。</p></div>';
  openDialog('我的上架预览', `${content}<div class="modal-actions"><button class="button button-primary" type="button" data-action="new-sell"><i class="ti ti-plus" aria-hidden="true"></i>新建上架预览</button></div>`);
}

function openContact(id) {
  const card = getCard(id);
  if (!card) return;
  const message = state.messages.get(id) ?? `你好，我想了解这张${card.name}，方便提供卡牌背面与四角的实拍吗？`;
  openDialog('询问卖家', `<form class="sell-form" id="contact-form" data-id="${id}"><div class="selected-card-preview"><img src="${escapeHTML(card.image)}" alt="${card.name}" width="55" height="76"><div><strong>${card.seller}</strong><small>${card.name} · ${money(card.price)}</small></div></div><label class="field">询价内容<textarea name="message" rows="4" maxlength="500" required>${escapeHTML(message)}</textarea></label><p id="message-error" class="form-error" role="alert" hidden></p><div class="modal-actions"><button class="button button-secondary" type="button" data-action="export-message" data-id="${id}">导出询价内容</button><button class="button button-primary" type="submit">发送询价</button></div><button class="text-button" type="button" data-action="detail" data-id="${id}">返回卡牌详情</button></form>`);
}

function openAccount() {
  openDialog('我的卡夹', `<div class="account-links"><button class="account-link" type="button" data-action="favorites"><i class="ti ti-heart" aria-hidden="true"></i>我的收藏<span>${state.favorites.size} 张</span></button><button class="account-link" type="button" data-action="cart"><i class="ti ti-shopping-bag" aria-hidden="true"></i>购物袋<span>${state.cart.size} 张</span></button><button class="account-link" type="button" data-action="drafts"><i class="ti ti-file-pencil" aria-hidden="true"></i>上架预览<span>${state.drafts.length} 份</span></button><button class="account-link" type="button" data-action="offers"><i class="ti ti-hand-stop" aria-hidden="true"></i>我的出价<span>${state.offers.length} 条</span></button><button class="account-link" type="button" data-action="orders"><i class="ti ti-receipt" aria-hidden="true"></i>订单记录<span>${state.orders.length} 单</span></button></div><button class="text-button account-cert" type="button" data-action="cert"><i class="ti ti-shield-check" aria-hidden="true"></i>核验一张评级证书</button>`);
}

const helpContent = {
  guide: { title: '交易指南', html: '<ol class="help-list"><li><i class="ti ti-search" aria-hidden="true"></i><div><h3>挑卡，也要核对版本</h3><p>确认系列、语言与编号。卡名相同，不代表是同一版卡牌。</p></div></li><li><i class="ti ti-photo-scan" aria-hidden="true"></i><div><h3>下单前，看看实拍</h3><p>向卖家索取正反面、四角与反光实拍。评级卡还需核对认证编号。</p></div></li><li><i class="ti ti-package" aria-hidden="true"></i><div><h3>确认包装与运费</h3><p>单卡建议使用卡套与硬质卡夹，约定发货方式后再付款。</p></div></li></ol>' },
  grading: { title: '品相与评级', html: '<ul class="help-list"><li><i class="ti ti-rosette-discount-check" aria-hidden="true"></i><div><h3>PSA 10 / PSA 9</h3><p>第三方评级分数。展示分数不等同平台核验，请通过评级机构核对证书。</p></div></li><li><i class="ti ti-sparkles" aria-hidden="true"></i><div><h3>近全新 NM</h3><p>卡面整洁，无明显折痕；可能存在轻微边角痕迹，以实拍为准。</p></div></li><li><i class="ti ti-cards" aria-hidden="true"></i><div><h3>轻微使用 LP</h3><p>可见轻微磨损或白边。收藏前建议重点查看边角、背面与表面划痕。</p></div></li></ul>' },
  support: { title: '联系我们', html: '<div class="notice-panel"><i class="ti ti-message-circle" aria-hidden="true"></i><h3>在线客服需要连接服务</h3><p>交易前可先阅读交易指南；卡牌信息可从详情页向卖家发起询价。</p></div><div class="modal-actions"><button class="button button-primary" type="button" data-action="guide">查看交易指南</button></div>' },
  protection: { title: '交易保障', html: '<ul class="help-list"><li><i class="ti ti-lock-square" aria-hidden="true"></i><div><h3>平台托管</h3><p>付款先进入托管账户，确认收卡与卡况无误后再放款给卖家。</p></div></li><li><i class="ti ti-photo-scan" aria-hidden="true"></i><div><h3>卡况留证</h3><p>发货前需上传四角、卡面与背面的实拍，作为争议处理依据。</p></div></li><li><i class="ti ti-arrow-back-up" aria-hidden="true"></i><div><h3>不符可退</h3><p>收到的卡与描述不一致，可在 48 小时内发起退货并冻结款项。</p></div></li></ul>' },
  'offer-help': { title: '议价说明', html: '<ul class="help-list"><li><i class="ti ti-hand-stop" aria-hidden="true"></i><div><h3>出价需低于挂牌价</h3><p>同一张卡同一时间保留一条有效出价，卖家可接受、拒绝或还价。</p></div></li><li><i class="ti ti-clock" aria-hidden="true"></i><div><h3>72 小时回复</h3><p>超时未回复的出价自动失效，可以再次提交。</p></div></li><li><i class="ti ti-receipt" aria-hidden="true"></i><div><h3>成交即锁定</h3><p>卖家接受出价后，卡牌会进入购物袋并按出价结算。</p></div></li></ul>' },
  sources: { title: '素材来源', html: '<ul class="help-list"><li><i class="ti ti-pokeball" aria-hidden="true"></i><div><h3>宝可梦卡面</h3><p><a href="https://pokemontcg.io/" target="_blank" rel="noopener noreferrer">Pokémon TCG Developers</a></p></div></li><li><i class="ti ti-cards" aria-hidden="true"></i><div><h3>游戏王、航海王与万智牌</h3><p><a href="https://ygoprodeck.com/" target="_blank" rel="noopener noreferrer">YGOPRODeck</a>、<a href="https://en.onepiece-cardgame.com/" target="_blank" rel="noopener noreferrer">ONE PIECE CARD GAME</a>、<a href="https://scryfall.com/" target="_blank" rel="noopener noreferrer">Scryfall</a></p></div></li><li><i class="ti ti-copyright" aria-hidden="true"></i><div><h3>图像权利</h3><p>卡牌名称与图像版权归各发行方所有。头像来自 Pravatar。正式上线前需核对素材使用授权。</p></div></li></ul>' }
};

function openHelp(type) {
  const content = helpContent[type];
  if (content) openDialog(content.title, content.html);
}

function resetFilters(all = false) {
  state.min = null;
  state.max = null;
  state.grade = 'all';
  state.limit = 8;
  $('#min-price').value = '';
  $('#max-price').value = '';
  setSelectValue($('#grade-select'), 'all');
  $('#filter-error').hidden = true;
  if (all) {
    state.category = 'all';
    state.query = '';
    state.sort = 'featured';
    $('#search-input').value = '';
    setSelectValue($('#sort-select'), 'featured');
  }
}

function browse(mode = 'market') {
  state.mode = mode;
  resetFilters(true);
  renderMarket();
  if (dialog.open) closeDialog();
  $('#market').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
}

function changeFeatured(direction) {
  state.heroIndex = (state.heroIndex + direction + featuredIds.length) % featuredIds.length;
  const card = getCard(featuredIds[state.heroIndex]);
  const hero = $('#hero-card');
  hero.dataset.id = card.id;
  hero.setAttribute('aria-label', `查看${card.name}，${card.grade}`);
  $('#hero-image').src = card.image;
  $('#hero-image').alt = `${card.name}，${card.number} 卡面`;
  hero.querySelector('.media-fallback').lastChild.textContent = card.name;
  $('#slab-name').textContent = card.name;
  $('#slab-number').textContent = `${card.number} · ${card.rarity}`;
  $('#slab-grade').textContent = card.grade.replace('PSA ', '');
  $('#featured-series').textContent = `${games[card.game]} / ${card.collection}`;
  $('#featured-name').replaceChildren(document.createTextNode(card.name + ' '));
  const price = document.createElement('span');
  price.id = 'featured-price';
  price.textContent = money(card.price);
  $('#featured-name').append(price);
  $('#feature-position').textContent = String(state.heroIndex + 1).padStart(2, '0');
  ['.fan-left', '.fan-right'].forEach((selector, offset) => {
    const side = $(selector);
    const sideCard = getCard(featuredIds[(state.heroIndex + offset + 1) % featuredIds.length]);
    side.dataset.id = sideCard.id;
    side.setAttribute('aria-label', `查看${sideCard.name}`);
    side.querySelector('img').src = sideCard.image;
    side.querySelector('img').alt = `${sideCard.name} 异图卡面`;
    side.querySelector('.media-fallback').lastChild.textContent = sideCard.name;
  });
  animateElement(hero.querySelector('.slab-art'), [{ opacity: .45, transform: `translateX(${direction * 12}px)` }, { opacity: 1, transform: 'translateX(0)' }]);
  animateElement($('.featured-info'), [{ opacity: .4, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }]);
  document.querySelectorAll('.fan-side img').forEach((image, index) => {
    animateElement(image, [{ opacity: .55, transform: `translateX(${direction * 8}px)` }, { opacity: 1, transform: 'translateX(0)' }], index * 30);
  });
}

function saveFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCart() {
  const quote = (value) => '"' + String(value).replace(/"/g, '""') + '"';
  const rows = [['卡牌', '系列', '编号', '品相', '价格（元）', '卖家'], ...cartCards().map((card) => [card.name, card.series, card.number, gradeNames[card.grade], card.price, card.seller])];
  saveFile('卡场-购买清单.csv', '﻿' + rows.map((row) => row.map(quote).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
  showToast('购买清单已生成');
}

document.addEventListener('click', (event) => {
  const category = event.target.closest('[data-category]');
  if (category) {
    state.category = category.dataset.category;
    state.limit = 8;
    renderMarket();
    return;
  }
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;
  event.preventDefault();
  const { action, id, draft: draftId } = trigger.dataset;
  switch (action) {
    case 'home':
      state.mode = 'market'; resetFilters(true); renderMarket();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      break;
    case 'market': case 'browse-from-dialog': browse(); break;
    case 'favorites': browse('favorites'); break;
    case 'detail': openDetail(id); break;
    case 'favorite': toggleFavorite(id); break;
    case 'add-cart': addToCart(id); break;
    case 'cart': openCart(); break;
    case 'remove-cart': {
      state.cart.delete(id); updateCounts(); openCart();
      const next = dialogBody.querySelector('[data-action="remove-cart"]');
      next?.focus({ preventScroll: true });
      break;
    }
    case 'checkout': openCheckout(1); break;
    case 'checkout-back': openCheckout(1); break;
    case 'method': {
      state.checkout.method = trigger.dataset.method;
      dialogBody.querySelectorAll('.method-card').forEach((node) => {
        const active = node.dataset.method === state.checkout.method;
        node.classList.toggle('is-selected', active);
        node.setAttribute('aria-pressed', String(active));
      });
      break;
    }
    case 'cert': openCert(); break;
    case 'cert-again': openCert(); break;
    case 'offer': openOffer(id); break;
    case 'offers': openOffers(); break;
    case 'orders': openOrders(); break;
    case 'seller': openSeller(id); break;
    case 'pick-offer': {
      const input = dialogBody.querySelector('[name="amount"]');
      if (!input) break;
      input.value = trigger.dataset.offer;
      dialogBody.querySelectorAll('.offer-chip').forEach((chip) => chip.classList.toggle('is-selected', chip === trigger));
      input.focus({ preventScroll: true });
      break;
    }
    case 'weekly-report': openWeeklyReport(); break;
    case 'export-report': {
      const rows = [['卡牌', '系列', '编号', '品相', '挂牌价', '七日变化'], ...cards.map((card) => [card.name, card.series, card.number, gradeNames[card.grade], card.price, `${trends.get(card.id).change.toFixed(2)}%`])];
      saveFile('卡场-行情周报.csv', '﻿' + rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\r\n'), 'text/csv;charset=utf-8');
      showToast('周报已生成');
      break;
    }
    case 'export-cart': exportCart(); break;
    case 'sell': openSell(); break;
    case 'new-sell': openSell(true); break;
    case 'drafts': openDrafts(); break;
    case 'view-draft': openDraftPreview(draftId); break;
    case 'edit-draft': {
      const draft = state.drafts.find((item) => item.id === Number(draftId));
      if (!draft) break;
      state.editingDraftId = draft.id;
      state.sellForm = { cardId: draft.cardId, grade: draft.grade, price: String(draft.price), note: draft.note };
      openSell();
      break;
    }
    case 'delete-draft':
      state.drafts = state.drafts.filter((item) => item.id !== Number(draftId));
      if (state.editingDraftId === Number(draftId)) state.editingDraftId = null;
      persist();
      openDrafts(); showToast('已移除这份预览');
      break;
    case 'publish-draft':
      $('#publish-notice').hidden = false;
      $('#publish-notice').scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      break;
    case 'export-draft': {
      const draft = state.drafts.find((item) => item.id === Number(draftId));
      if (!draft) break;
      const card = getCard(draft.cardId);
      saveFile(`卡场-${card.name}-上架信息.json`, JSON.stringify({ name: card.name, series: card.series, number: card.number, grade: draft.grade, price: draft.price, currency: 'CNY', note: draft.note, status: 'unpublished' }, null, 2), 'application/json;charset=utf-8');
      showToast('上架信息已生成');
      break;
    }
    case 'contact': openContact(id); break;
    case 'export-message': {
      const text = dialogBody.querySelector('[name="message"]').value.trim();
      if (!text) { dialogBody.querySelector('[name="message"]').reportValidity(); break; }
      const card = getCard(id);
      saveFile(`卡场-${card.name}-询价.txt`, `卖家：${card.seller}\n卡牌：${card.name} ${card.number}\n\n${text}`, 'text/plain;charset=utf-8');
      showToast('询价内容已生成');
      break;
    }
    case 'account': openAccount(); break;
    case 'guide': case 'grading': case 'support': case 'sources': case 'protection': case 'offer-help': openHelp(action); break;
    case 'close-dialog': closeDialog(); break;
    case 'toggle-filter': {
      const panel = $('#filter-panel');
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) $('#min-price').focus({ preventScroll: true });
      break;
    }
    case 'reset-filter': resetFilters(); renderMarket(); break;
    case 'reset-all': browse(); break;
    case 'clear-query': state.query = ''; $('#search-input').value = ''; state.limit = 8; renderMarket(); break;
    case 'load-more': {
      const previousLimit = state.limit;
      state.limit += 8;
      renderMarket();
      $('#product-grid').children[previousLimit]?.querySelector('.product-open').focus({ preventScroll: true });
      break;
    }
    case 'hero-prev': changeFeatured(-1); break;
    case 'hero-next': changeFeatured(1); break;
    case 'retry-image': {
      const frame = dialogBody.querySelector('.detail-image');
      const image = frame?.querySelector('img');
      if (image) {
        frame.classList.remove('image-failed');
        const src = image.src;
        image.removeAttribute('src');
        image.src = src;
        showToast('正在重新加载卡面');
      }
      break;
    }
  }
});

$('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  $('#market').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
});
$('#search-input').addEventListener('input', (event) => {
  state.query = event.target.value;
  state.limit = 8;
  renderMarket({ animate: false });
});
$('#sort-select').addEventListener('change', (event) => {
  state.sort = event.target.value;
  state.limit = 8;
  renderMarket();
});
$('#filter-panel').addEventListener('submit', (event) => {
  event.preventDefault();
  const min = parseAmount($('#min-price').value);
  const max = parseAmount($('#max-price').value);
  const error = $('#filter-error');
  let message = '';
  if (!min.valid || !max.valid) message = '请输入有效价格，最多保留两位小数。';
  else if (min.value !== null && max.value !== null && min.value > max.value) message = '最高价格不能低于最低价格。';
  error.hidden = !message;
  error.textContent = message;
  if (message) return;
  state.min = min.value;
  state.max = max.value;
  state.grade = $('#grade-select').value;
  state.limit = 8;
  renderMarket();
  $('#filter-panel').hidden = true;
  $('#filter-toggle').setAttribute('aria-expanded', 'false');
  $('#filter-toggle').focus({ preventScroll: true });
});

dialogBody.addEventListener('input', (event) => {
  if (event.target.closest('#sell-form') && event.target.name) state.sellForm[event.target.name] = event.target.value;
  if (event.target.closest('#contact-form')) state.messages.set(event.target.closest('form').dataset.id, event.target.value);
});
dialogBody.addEventListener('change', (event) => {
  if (!event.target.closest('#sell-form')) return;
  if (event.target.name) state.sellForm[event.target.name] = event.target.value;
  if (event.target.id === 'sell-card') {
    const card = getCard(event.target.value);
    $('#sell-card-preview').innerHTML = `<img src="${escapeHTML(card.image)}" alt="${card.name}" width="55" height="76"><div><strong>${card.name}</strong><small>${card.series}</small></div>`;
  }
});
dialogBody.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'checkout-address') {
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const city = form.elements.city.value.trim();
    const error = $('#checkout-error');
    let message = '';
    if (name.length < 2) message = '请填写收货人姓名。';
    else if (!/^1[3-9]\d{9}$/.test(phone)) message = '请填写 11 位有效手机号。';
    else if (city.length < 2) message = '请填写收货城市。';
    error.hidden = !message;
    error.textContent = message;
    if (message) return;
    state.checkout = { ...state.checkout, name, phone, city, step: 2 };
    openCheckout(2);
    return;
  }
  if (form.id === 'checkout-pay') { createOrder(); return; }
  if (form.id === 'cert-form') {
    const result = certLookup(form.elements.cert.value);
    const error = $('#cert-error');
    error.hidden = result.valid;
    error.textContent = result.valid ? '' : result.message;
    if (!result.valid) { form.elements.cert.focus(); return; }
    renderCert(result);
    return;
  }
  if (form.id === 'offer-form') {
    const id = form.dataset.id;
    const card = getCard(id);
    const amount = parseAmount(form.elements.amount.value, false);
    const error = $('#offer-error');
    let message = '';
    if (!amount.valid || amount.value <= 0) message = '请输入有效出价金额，最多两位小数。';
    else if (amount.value >= card.price) message = `出价需低于挂牌价 ${money(card.price)}。`;
    error.hidden = !message;
    error.textContent = message;
    if (message) { form.elements.amount.focus(); return; }
    state.offers.unshift({ cardId: id, amount: amount.value, status: '等待卖家回复', at: new Date().toISOString() });
    persist();
    openOffer(id);
    showToast('出价已提交，等待卖家回复');
    return;
  }
  if (form.id === 'sell-form') {
    const data = new FormData(form);
    const price = parseAmount(data.get('price'), false);
    const error = $('#sell-error');
    if (!price.valid || price.value <= 0) {
      error.textContent = '报价须大于 0，最多 7 位整数和 2 位小数。';
      error.hidden = false;
      form.elements.price.setAttribute('aria-invalid', 'true');
      form.elements.price.focus();
      return;
    }
    const draft = { id: state.editingDraftId || state.nextDraftId++, cardId: data.get('cardId'), grade: data.get('grade'), price: price.value, note: data.get('note').trim() };
    const existing = state.drafts.findIndex((item) => item.id === draft.id);
    if (existing === -1) state.drafts.push(draft);
    else state.drafts[existing] = draft;
    state.editingDraftId = draft.id;
    state.sellForm = { cardId: draft.cardId, grade: draft.grade, price: String(draft.price), note: draft.note };
    persist();
    openDraftPreview(draft.id);
  }
  if (form.id === 'contact-form') {
    const message = form.elements.message.value.trim();
    const error = $('#message-error');
    error.textContent = message ? '询价尚未发送，需要连接账号与消息服务。内容已保留，可导出。' : '请先填写询价内容。';
    error.hidden = false;
    state.messages.set(form.dataset.id, form.elements.message.value);
  }
});

document.addEventListener('keydown', (event) => {
  const editing = event.target.matches('input, textarea, select, [contenteditable="true"]');
  if (event.key === '/' && !editing && !dialog.open && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    $('#search-input').focus();
  }
});

// The tilt has no idle loop and changes only the two surfaces under the pointer.
const tiltCard = $('#hero-card');
const tiltShine = tiltCard.querySelector('.slab-shine');
let tiltBounds;
let tiltFrame = 0;
let tiltX = 0;
let tiltY = 0;

function resetHeroTilt() {
  cancelAnimationFrame(tiltFrame);
  tiltFrame = 0;
  tiltBounds = null;
  tiltCard.style.removeProperty('transform');
  tiltShine.style.removeProperty('transform');
}

tiltCard.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'touch' || reduceMotion.matches || !finePointer.matches) return;
  tiltBounds = tiltCard.getBoundingClientRect();
});
tiltCard.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch' || reduceMotion.matches || !finePointer.matches || document.hidden) return;
  if (!tiltBounds) tiltBounds = tiltCard.getBoundingClientRect();
  tiltX = Math.max(-1, Math.min(1, (event.clientX - tiltBounds.left) / tiltBounds.width * 2 - 1));
  tiltY = Math.max(-1, Math.min(1, (event.clientY - tiltBounds.top) / tiltBounds.height * 2 - 1));
  if (tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    tiltCard.style.transform = `perspective(1000px) rotateX(${-tiltY * 6}deg) rotateY(${tiltX * 7}deg)`;
    tiltShine.style.transform = `translateX(${tiltX * 20 - 15}%)`;
    tiltFrame = 0;
  });
});
tiltCard.addEventListener('pointerleave', resetHeroTilt);
tiltCard.addEventListener('pointercancel', resetHeroTilt);
finePointer.addEventListener('change', resetHeroTilt);
reduceMotion.addEventListener('change', () => {
  resetHeroTilt();
  if (reduceMotion.matches) {
    document.getAnimations().forEach((animation) => animation.cancel());
    if (dialog.classList.contains('is-closing')) { clearTimeout(closeTimer); dialog.close(); }
  }
  moveCategoryIndicator(true);
});
document.addEventListener('visibilitychange', resetHeroTilt);
window.addEventListener('scroll', resetHeroTilt, { passive: true });
window.addEventListener('resize', () => { resetHeroTilt(); moveCategoryIndicator(true); });
if ('ResizeObserver' in window) {
  const categoryResize = new ResizeObserver(() => moveCategoryIndicator(true));
  categoryResize.observe($('.category-tabs'));
  document.querySelectorAll('[data-category]').forEach((button) => categoryResize.observe(button));
}
document.fonts?.ready.then(() => moveCategoryIndicator(true));

loadPersisted();
enhanceSelects();
$('#stat-cards').textContent = String(cards.length).padStart(2, '0');
$('#stat-games').textContent = String(Object.keys(games).length).padStart(2, '0');
renderPulse();
renderMarket({ animate: false });
updateCounts();
revealContent();
document.querySelectorAll('.image-frame img').forEach((image) => {
  if (image.complete && image.naturalWidth === 0) image.dispatchEvent(new Event('error'));
});
