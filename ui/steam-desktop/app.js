'use strict';

const games = [
  {
    id: 'stray', name: 'Stray', genre: 'Adventure', price: 16.99, originalPrice: 27.99,
    cover: 'stray-cover', hero: 'stray-keyart', banner: 'stray-banner',
    media: ['stray-keyart', 'stray-hero', 'stray-neon'],
    tags: ['Cats', 'Adventure', 'Cyberpunk', 'Atmospheric'],
    description: 'Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity and find their way home.',
    brief: 'A stray cat must untangle an ancient mystery and find a way home from a forgotten cybercity.',
    developer: 'BlueTwelve Studio', publisher: 'Annapurna Interactive', released: '19 Jul, 2022',
    owned: false, installed: false, playtime: '0', size: '10 GB'
  },
  {
    id: 'hogwarts', name: 'Hogwarts Legacy', genre: 'Adventure', price: 29.99, originalPrice: 59.99,
    cover: 'hogwarts-cover', hero: 'hogwarts-banner', banner: 'hogwarts-banner',
    media: ['hogwarts-banner', 'hogwarts-hero', 'hogwarts-cover'],
    tags: ['Adventure', 'Open World', 'Fantasy', 'RPG'],
    description: 'Your letter has arrived. Explore an open-world adventure set in the wizarding world, learn spells, and uncover a mystery of ancient magic.',
    brief: 'Explore the wizarding world and uncover a mystery of ancient magic.',
    developer: 'Avalanche Software', publisher: 'Warner Bros. Games', released: '10 Feb, 2023',
    owned: false, installed: false, playtime: '0', size: '85 GB'
  },
  {
    id: 'cod', name: 'Call of Duty: Infinite Warfare', genre: 'Action', price: 19.79, originalPrice: 59.99,
    cover: 'cod-cover', hero: 'cod-hero', banner: 'cod-hero',
    media: ['cod-hero', 'cod-cover'], tags: ['Action', 'FPS', 'Sci-fi', 'Multiplayer'],
    description: 'Lead the crew of the Retribution through a cinematic campaign beyond Earth. Take the fight into orbit in an all-new chapter of Call of Duty.',
    brief: 'Lead the crew of the Retribution in a cinematic campaign beyond Earth.',
    developer: 'Infinity Ward', publisher: 'Activision', released: '4 Nov, 2016',
    owned: true, installed: true, playtime: '42.6', size: '76 GB'
  },
  {
    id: 'fifa', name: 'EA SPORTS FIFA 23', genre: 'Sports', price: 29.99, originalPrice: 59.99,
    cover: 'fifa-original', hero: 'fifa-hero', banner: 'fifa-banner',
    media: ['fifa-hero', 'fifa-original'], tags: ['Sports', 'Football', 'Multiplayer', 'Controller'],
    description: 'The world’s game brings the pitch to life. Build your club, play with friends, and experience the biggest stages in football.',
    brief: 'Build your club and experience the biggest stages in football.',
    developer: 'EA Canada', publisher: 'Electronic Arts', released: '30 Sep, 2022',
    owned: true, installed: true, playtime: '68.2', size: '100 GB'
  },
  {
    id: 'mass-effect', name: 'Mass Effect: Andromeda', genre: 'RPG', price: 11.99, originalPrice: 39.99,
    cover: 'mass-effect-cover', hero: 'mass-effect-hero', banner: 'mass-effect-hero',
    media: ['mass-effect-hero', 'mass-effect-cover'], tags: ['RPG', 'Sci-fi', 'Exploration', 'Adventure'],
    description: 'Find a new home for humanity. As the Pathfinder, lead your team through the Andromeda galaxy and discover worlds beyond the Milky Way.',
    brief: 'Lead your team through the Andromeda galaxy to find a new home for humanity.',
    developer: 'BioWare', publisher: 'Electronic Arts', released: '23 Mar, 2017',
    owned: true, installed: false, playtime: '15.8', size: '55 GB'
  }
];

const friends = [
  { id: 'alex', name: 'Alex Chen', avatar: 'avatar-alex', status: 'Playing Stray', online: true },
  { id: 'marcus', name: 'Marcus Reed', avatar: 'avatar-marcus', status: 'Playing FIFA 23', online: true },
  { id: 'maya', name: 'Maya Torres', avatar: 'avatar-maya', status: 'Online', online: true },
  { id: 'robin', name: 'Robin Gray', avatar: 'avatar-robin', status: 'Away', online: false },
  { id: 'ella', name: 'Ella Collins', status: 'Last online 2 hours ago', online: false },
  { id: 'noah', name: 'Noah Harris', status: 'Last online yesterday', online: false },
  { id: 'lena', name: 'Lena Park', status: 'Online', online: true },
  { id: 'oliver', name: 'Oliver Kim', status: 'Last online yesterday', online: false },
  { id: 'sophie', name: 'Sophie Turner', status: 'Away', online: false },
  { id: 'james', name: 'James Cole', status: 'Last online 3 days ago', online: false },
  { id: 'liam', name: 'Liam Walker', status: 'Last online 4 hours ago', online: false },
  { id: 'zoe', name: 'Zoe Brooks', status: 'Online', online: true }
];

const posts = [
  { id: 'rooftops', game: 'stray', author: 'maya', time: '2 hours ago', title: 'A little light in the Dead City', text: 'Stopped exploring for a moment. Every corner of this city has a story.', image: 'stray-city', likes: 42, replies: 8 },
  { id: 'soundtrack', game: 'stray', author: 'alex', time: 'Yesterday', title: 'The rooftops soundtrack is something else', text: 'The quiet moments between the neon streets are my favorite part. Which chapter did you keep coming back to?', likes: 28, replies: 12 },
  { id: 'quiet-city', game: 'stray', author: 'robin', time: 'Yesterday', title: 'One more corner to explore', text: 'A postcard from the city after everyone else has gone home.', image: 'stray-neon', likes: 36, replies: 5 },
  { id: 'wizarding-world', game: 'hogwarts', author: 'maya', time: '3 days ago', title: 'The view from the castle', text: 'Finally found this spot just before sunset. There is always another path to take.', image: 'hogwarts-banner', likes: 64, replies: 7 },
  { id: 'retribution', game: 'cod', author: 'marcus', time: '4 days ago', title: 'Back aboard the Retribution', text: 'Returning to the campaign this weekend. The first mission still has one of my favorite openings.', likes: 19, replies: 3 }
];

const helpArticles = [
  { id: 'launch', title: 'A game won’t launch', text: 'Make sure the Steam desktop client is running and you are signed in to the account that owns the game.', steps: ['Open Library in the Steam desktop client.', 'Select the game and open Properties.', 'Under Installed Files, select Verify integrity of game files.'], end: 'If the issue continues, check the game’s support page for its system requirements and troubleshooting steps.' },
  { id: 'purchase', title: 'Purchases and refunds', text: 'You can review a purchase and request a refund from Steam Support. Refund eligibility depends on the purchase date and playtime.', steps: ['Sign in to Steam Support.', 'Choose Purchases and select the game.', 'Choose the issue that matches your purchase.'], end: 'Keep your purchase receipt handy. Do not share your password or Steam Guard code.' },
  { id: 'account', title: 'Protect your account', text: 'Steam Guard adds a second layer of protection to your Steam account. Use the Steam mobile app to manage your authenticator.', steps: ['Install the Steam mobile app and sign in.', 'Open Steam Guard and add an authenticator.', 'Store your recovery code somewhere safe.'], end: 'Steam Support will never ask you to send your password or authentication code in chat.' },
  { id: 'friends', title: 'Friends and chat', text: 'Use a friend code or a profile link to find someone on Steam. Your friend requests and conversations are managed by the Steam service.', steps: ['Open Friends in the Steam desktop client.', 'Choose Add a Friend and enter their friend code.', 'Send the request and wait for them to accept.'], end: 'You need an active Steam connection to send messages and friend requests.' }
];

const slides = [
  { id: 'hogwarts', media: 0 }, { id: 'stray', media: 0 }, { id: 'cod', media: 0 },
  { id: 'fifa', media: 0 }, { id: 'mass-effect', media: 0 }, { id: 'stray', media: 1 }
];
const preferences = { ambient: true, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches, notifications: true, startPage: 'store' };
try {
  const saved = JSON.parse(localStorage.getItem('steam-desktop.preferences') || '{}');
  for (const key of ['ambient', 'motion', 'notifications']) if (typeof saved[key] === 'boolean') preferences[key] = saved[key];
  if (['store', 'library'].includes(saved.startPage)) preferences.startPage = saved.startPage;
} catch {}

const state = {
  view: 'store', slide: 1, game: 'stray', media: 0, returnRoute: 'store', query: '',
  genre: 'All games', sort: 'Featured', page: 0, compact: false, cart: new Set(), wishlist: new Set(['hogwarts']),
  libraryGame: 'cod', libraryFilter: 'All games', friend: 'alex', friendFilter: 'All friends', friendQuery: '', friendPage: 0,
  friendTab: 'Friends', communityTab: 'Screenshots', communityGame: '', post: 'soundtrack', liked: new Set(),
  readNotices: new Set(), drafts: {}, replyDraft: '', friendCode: '', profileDraft: 'Jenny Wilson', accountTab: 'Overview',
  helpArticle: 'launch', helpQuery: '', operations: new Set(), errors: new Map(), popoverKind: '', dialogKind: ''
};

const canvas = document.querySelector('.canvas');
const workspace = document.getElementById('workspace');
const searchInput = document.getElementById('search-input');
const popover = document.getElementById('popover');
const dialogLayer = document.getElementById('dialog-layer');
const dialog = dialogLayer.querySelector('.dialog');
const toast = document.getElementById('toast');
let started = false;
let popoverAnchor = null;
let dialogFocus = null;
let toastTimer = 0;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function asset(name) { return './assets/' + name + '.webp'; }
function gameById(id) { return games.find(game => game.id === id); }
function money(value) { return '$' + value.toFixed(2); }
function icon(name) { return '<i class="ti ti-' + name + '" aria-hidden="true"></i>'; }
function avatar(person, extraClass = '') {
  if (person.avatar) return '<img class="avatar ' + extraClass + '" src="' + asset(person.avatar) + '" alt="">';
  const initials = person.name.split(' ').map(word => word[0]).join('').slice(0, 2);
  return '<span class="avatar avatar-initials ' + extraClass + '" aria-hidden="true">' + initials + '</span>';
}
function heart(active) {
  return '<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" fill="' + (active ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
}
function viewHeader(title, subtitle = '', actions = '') {
  return '<header class="view-header"><div><h1>' + escapeHTML(title) + '</h1>' + (subtitle ? '<p>' + escapeHTML(subtitle) + '</p>' : '') + '</div><div class="view-actions">' + actions + '</div></header>';
}
function emptyState(title, text, route, label, symbol = 'search') {
  return '<div class="empty-state">' + icon(symbol) + '<h2>' + escapeHTML(title) + '</h2><p>' + escapeHTML(text) + '</p>' + (route ? '<button class="btn btn-primary" data-action="navigate" data-route="' + route + '">' + label + '</button>' : '') + '</div>';
}
function serviceButton(key, label, action = 'service', attrs = '', primary = true) {
  const busy = state.operations.has(key);
  return '<button class="btn ' + (primary ? 'btn-primary' : '') + '" data-action="' + action + '" data-service="' + key + '" ' + attrs + (busy ? ' disabled aria-busy="true"' : '') + '>' + (busy ? '<span class="spinner" aria-hidden="true"></span>' + (key.startsWith('message-') ? '' : 'Connecting…') : label) + '</button>';
}
function serviceError(key) {
  return '<p class="inline-error" id="' + key + '-error" role="alert"' + (state.errors.has(key) ? '' : ' hidden') + '>' + escapeHTML(state.errors.get(key) || '') + '</p>';
}
function pagination(count, perPage, action = 'catalog-page', current = state.page) {
  const pages = Math.max(1, Math.ceil(count / perPage));
  return '<footer class="pagination"><span>' + (count ? current * perPage + 1 : 0) + '–' + Math.min((current + 1) * perPage, count) + ' of ' + count + '</span><button class="icon-button" data-action="' + action + '" data-direction="-1" aria-label="Previous page"' + (current === 0 ? ' disabled' : '') + '>' + icon('chevron-left') + '</button><button class="icon-button" data-action="' + action + '" data-direction="1" aria-label="Next page"' + (current >= pages - 1 ? ' disabled' : '') + '>' + icon('chevron-right') + '</button></footer>';
}
function navigationButton(route, label, quiet = false) {
  return '<button class="btn ' + (quiet ? 'btn-quiet' : '') + '" data-action="navigate" data-route="' + route + '">' + label + '</button>';
}

function renderStore() {
  const slide = slides[state.slide];
  const game = gameById(slide.id);
  const image = game.media[slide.media];
  const featureTitle = game.id === 'stray' && slide.media === 0
    ? '<img class="feature-logo" src="' + asset('stray-logo') + '" alt="">'
    : '<span class="feature-title">' + escapeHTML(game.name) + '</span>';
  const offers = ['hogwarts', 'cod', 'fifa', 'mass-effect'].map(id => {
    const item = gameById(id);
    return '<button class="offer-poster" data-action="open-game" data-id="' + id + '" aria-label="View ' + escapeHTML(item.name) + '"><img src="' + asset(id === 'hogwarts' ? 'hogwarts-banner' : id === 'mass-effect' ? 'mass-effect-art' : item.cover) + '" alt="' + escapeHTML(item.name) + '"><span class="poster-hover">' + money(item.price) + '</span></button>';
  }).join('');
  return '<section class="view store-view" data-view="store"><div class="showcase"><div class="feature" data-game="' + game.id + '"><img class="feature-background" src="' + asset(game.id === 'stray' ? 'stray-hero' : image) + '" alt=""><img class="feature-art" src="' + asset(image) + '" alt="' + escapeHTML(game.name) + ' key art"><div class="feature-shade"></div><button class="feature-open" data-action="open-game" data-id="' + game.id + '" aria-label="Explore ' + escapeHTML(game.name) + '"></button>' + featureTitle + '<div class="feature-tags">' + game.tags.map(tag => '<button class="chip" data-action="genre" data-value="' + escapeHTML(tag) + '">' + escapeHTML(tag) + '</button>').join('') + '<button class="chip-plus" data-popover="genre" aria-label="Browse more categories" aria-haspopup="listbox" aria-expanded="false">' + icon('plus') + '</button></div><button class="feature-friends" data-action="navigate" data-route="friends" aria-label="See your friends"><span class="avatar-stack">' + friends.slice(0, 4).map(friend => avatar(friend)).join('') + '</span><span class="friends-count">12 friends</span></button></div><aside class="feature-aside"><div class="feature-info"><h1>' + escapeHTML(game.name) + '</h1><p class="full-copy">' + escapeHTML(game.description) + '</p><p class="brief-copy">' + escapeHTML(game.brief) + '</p><div class="feature-purchase"><div class="feature-price">' + money(game.price) + ' USD</div><div class="feature-purchase-row"><button class="available-button" data-action="open-game" data-id="' + game.id + '">Available now</button>' + icon('brand-windows') + '</div></div></div><div class="feature-thumbnails">' + [1, 2].map((index) => '<button class="thumbnail" data-action="open-game" data-id="' + game.id + '" data-media="' + Math.min(index, game.media.length - 1) + '" aria-label="View ' + escapeHTML(game.name) + ' screenshot ' + index + '"><img src="' + asset(game.media[Math.min(index, game.media.length - 1)]) + '" alt="' + escapeHTML(game.name) + ' scene"></button>').join('') + '</div></aside></div><div class="feature-pager" aria-label="Featured games">' + slides.map((item, index) => '<button class="pager-dot' + (index === state.slide ? ' is-active' : '') + '" data-action="slide" data-index="' + index + '" aria-label="Featured ' + escapeHTML(gameById(item.id).name) + (item.media ? ' screenshots' : '') + '" aria-pressed="' + (index === state.slide) + '"></button>').join('') + '</div><section class="offers"><header class="section-heading"><h2>Special offers</h2><button class="text-link" data-action="navigate" data-route="offers">Learn more</button></header><div class="offer-posters">' + offers + '</div></section></section>';
}

function gameCard(game) {
  return '<button class="game-card" data-action="open-game" data-id="' + game.id + '"><img class="cover" src="' + asset(game.cover) + '" alt="' + escapeHTML(game.name) + '"><div class="game-card-body"><h2>' + escapeHTML(game.name) + '</h2><p>' + escapeHTML(game.genre) + ' · ' + escapeHTML(game.developer) + '</p><div class="price-row"><span>' + money(game.price) + '</span><span class="discount">−' + Math.round((1 - game.price / game.originalPrice) * 100) + '%</span></div></div></button>';
}
function catalogItems() {
  let result = games.filter(game => state.genre === 'All games' || game.genre === state.genre || game.tags.includes(state.genre));
  if (state.view === 'search') {
    const query = state.query.toLowerCase();
    result = result.filter(game => [game.name, game.genre, game.developer, ...game.tags].join(' ').toLowerCase().includes(query));
  }
  if (state.sort === 'Price: low to high') result.sort((a, b) => a.price - b.price);
  if (state.sort === 'Name: A to Z') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
function renderCatalog() {
  const items = catalogItems();
  const perPage = state.compact ? 2 : 4;
  state.page = Math.min(state.page, Math.max(0, Math.ceil(items.length / perPage) - 1));
  const title = state.view === 'search' ? 'Search results' : 'Special offers';
  const tabs = ['All games', 'Adventure', 'Action', 'Sports', 'RPG'];
  let content = '';
  if (!items.length) content = emptyState('No games found', 'Try a different title or clear your filters.', '', '', 'search') + '<div class="view-actions empty-actions">' + '<button class="btn" data-action="reset-catalog">Clear filters</button></div>';
  else content = '<div class="catalog-grid">' + items.slice(state.page * perPage, (state.page + 1) * perPage).map(gameCard).join('') + '</div>' + pagination(items.length, perPage);
  return '<section class="view catalog-view" data-view="' + state.view + '">' + viewHeader(title, state.view === 'search' ? 'Results for “' + state.query + '”' : 'A new adventure, for a little less.', navigationButton('wishlist', heart(true) + ' Wishlist', true)) + '<div class="toolbar"><div class="tabs" role="tablist" aria-label="Game categories">' + tabs.map((tag, index) => '<button class="tab" data-action="catalog-genre" data-value="' + tag + '" role="tab" aria-selected="' + (state.genre === tag) + '"' + (state.compact && index > 2 ? ' hidden' : '') + '>' + (state.compact && tag === 'All games' ? 'All' : tag) + '</button>').join('') + (tabs.includes(state.genre) ? '' : '<button class="tab" data-action="catalog-genre" data-value="' + escapeHTML(state.genre) + '" role="tab" aria-selected="true">' + escapeHTML(state.genre) + '</button>') + '</div><button class="dropdown-trigger" data-popover="sort" aria-haspopup="listbox" aria-expanded="false"><span>' + escapeHTML(state.compact ? 'Sort' : state.sort) + '</span>' + icon('chevron-down') + '</button></div>' + content + '</section>';
}

function renderDetail() {
  const game = gameById(state.game);
  const wished = state.wishlist.has(game.id);
  const inCart = state.cart.has(game.id);
  const action = game.owned ? '<button class="btn" data-action="open-library" data-id="' + game.id + '">' + icon('device-gamepad-2') + ' In your library</button>'
    : '<button class="btn btn-primary" data-action="' + (inCart ? 'navigate' : 'add-cart') + '" ' + (inCart ? 'data-route="cart"' : 'data-id="' + game.id + '"') + '>' + icon(inCart ? 'check' : 'basket') + (inCart ? ' In cart' : ' Add to cart') + '</button>';
  const back = '<button class="btn btn-quiet" data-action="detail-back">' + icon('arrow-left') + ' Back</button>';
  const description = state.compact ? game.brief : game.description;
  return '<section class="view detail-view" data-view="game">' + viewHeader(game.name, '', back) + '<div class="detail-layout"><div class="detail-media"><div class="detail-main-image" data-media="' + (state.media === 0 ? 'keyart' : 'screenshot') + '"><img src="' + asset(game.media[state.media]) + '" alt="' + escapeHTML(game.name) + ' artwork"><span class="media-caption">' + (state.media === 0 ? 'Key art' : 'In-game screenshot') + '</span></div><div class="detail-thumbnails">' + game.media.map((image, index) => '<button class="thumbnail" data-action="media" data-index="' + index + '" aria-label="View artwork ' + (index + 1) + '" aria-pressed="' + (state.media === index) + '"><img src="' + asset(image) + '" alt=""></button>').join('') + '</div></div><aside class="detail-info"><h2>' + escapeHTML(game.name) + '</h2><p class="detail-description">' + escapeHTML(description) + '</p><div class="detail-tags">' + game.tags.map(tag => '<button class="chip" data-action="genre" data-value="' + tag + '">' + tag + '</button>').join('') + '</div><dl class="detail-facts"><dt>Developer</dt><dd>' + escapeHTML(game.developer) + '</dd><dt>Publisher</dt><dd>' + escapeHTML(game.publisher) + '</dd><dt>Release date</dt><dd>' + game.released + '</dd><dt>Platform</dt><dd>Windows</dd></dl><div class="detail-purchase"><div class="detail-price"><strong>' + money(game.price) + '</strong><span>USD</span></div>' + action + '<button class="btn btn-quiet wish-button icon-toggle" data-action="wishlist" data-id="' + game.id + '" aria-pressed="' + wished + '">' + heart(wished) + (wished ? ' On your wishlist' : ' Add to wishlist') + '</button></div></aside></div></section>';
}

function renderLibrary() {
  const owned = games.filter(game => game.owned && (state.libraryFilter !== 'Installed' || game.installed));
  if (!owned.some(game => game.id === state.libraryGame)) state.libraryGame = owned[0]?.id || '';
  const game = gameById(state.libraryGame);
  const content = game ? '<div class="library-layout"><div class="library-list">' + owned.map(item => '<button class="library-game" data-action="library-game" data-id="' + item.id + '" aria-pressed="' + (item.id === game.id) + '"><img src="' + asset(item.cover) + '" alt=""><span><strong>' + escapeHTML(item.name) + '</strong><small>' + (item.installed ? 'Installed' : 'Ready to install') + '</small></span></button>').join('') + '</div><div class="library-detail"><img class="library-art" src="' + asset(game.hero) + '" alt="' + escapeHTML(game.name) + '"><div class="library-title-row"><div><h2>' + escapeHTML(game.name) + '</h2><p>' + (game.installed ? 'Last played yesterday' : 'Available in your library') + '</p></div>' + serviceButton('launch-' + game.id, icon(game.installed ? 'player-play' : 'download') + (game.installed ? ' Play' : ' Install')) + '</div>' + serviceError('launch-' + game.id) + '<div class="library-meta"><span>' + icon('clock') + game.playtime + ' hours played</span><span>' + icon('device-floppy') + game.size + '</span><button class="text-link" data-action="community-hub" data-id="' + game.id + '">Community hub ' + icon('arrow-up-right') + '</button></div></div></div>'
    : emptyState('Your library is waiting', 'Discover a game you’ll want to come back to.', 'store', 'Browse the store', 'device-gamepad-2');
  return '<section class="view library-view" data-view="library">' + viewHeader('Your library', games.filter(item => item.owned).length + ' games, all in one place.', '<button class="dropdown-trigger" data-popover="library-filter" aria-haspopup="listbox" aria-expanded="false">' + state.libraryFilter + icon('chevron-down') + '</button>') + content + '</section>';
}

function renderCart() {
  const items = games.filter(game => state.cart.has(game.id));
  const total = items.reduce((sum, game) => sum + game.price, 0);
  const perPage = state.compact ? 2 : 3;
  state.page = Math.min(state.page, Math.max(0, Math.ceil(items.length / perPage) - 1));
  const content = items.length ? '<div class="cart-layout"><div class="cart-list">' + items.slice(state.page * perPage, (state.page + 1) * perPage).map(game => '<article class="cart-item"><button data-action="open-game" data-id="' + game.id + '" aria-label="View ' + escapeHTML(game.name) + '"><img src="' + asset(game.banner) + '" alt=""></button><div class="cart-item-content"><h2>' + escapeHTML(game.name) + '</h2><p>For your account · Windows</p><button class="text-link" data-action="remove-cart" data-id="' + game.id + '">Remove</button></div><strong>' + money(game.price) + '</strong></article>').join('') + (items.length > perPage ? pagination(items.length, perPage) : '') + '</div><aside class="cart-summary"><h2>Order summary</h2><div class="summary-row"><span>' + items.length + (items.length === 1 ? ' game' : ' games') + '</span><span>' + money(total) + '</span></div><div class="summary-row"><span>Taxes</span><span>Included</span></div><div class="summary-row summary-total"><span>Estimated total</span><strong>' + money(total) + '</strong></div>' + serviceButton('checkout', 'Continue to checkout') + serviceError('checkout') + '<p class="fine-print">The final amount is confirmed at checkout. All prices are in USD.</p></aside></div>'
    : emptyState('Your cart is empty', 'There’s a whole world waiting to be explored.', 'store', 'Discover games', 'basket');
  return '<section class="view cart-view" data-view="cart">' + viewHeader('Shopping cart', '', navigationButton('store', 'Continue shopping', true)) + content + '</section>';
}
function renderWishlist() {
  const items = games.filter(game => state.wishlist.has(game.id));
  const perPage = state.compact ? 3 : 5;
  state.page = Math.min(state.page, Math.max(0, Math.ceil(items.length / perPage) - 1));
  const content = items.length ? '<div class="wishlist-list">' + items.slice(state.page * perPage, (state.page + 1) * perPage).map(game => '<article class="wishlist-row"><button data-action="open-game" data-id="' + game.id + '" aria-label="View ' + escapeHTML(game.name) + '"><img src="' + asset(game.banner) + '" alt=""></button><div class="wishlist-info"><h2>' + escapeHTML(game.name) + '</h2><p>' + game.genre + ' · ' + money(game.price) + '</p></div><button class="btn" data-action="open-game" data-id="' + game.id + '">View game</button><button class="btn btn-quiet icon-toggle" data-action="wishlist" data-id="' + game.id + '" aria-label="Remove ' + escapeHTML(game.name) + ' from wishlist" aria-pressed="true">' + heart(true) + '</button></article>').join('') + '</div>' + (items.length > perPage ? pagination(items.length, perPage) : '')
    : emptyState('Make room for your next favorite', 'Keep the games you’re looking forward to together.', 'store', 'Browse games', 'heart');
  return '<section class="view wishlist-view" data-view="wishlist">' + viewHeader('Your wishlist', items.length + (items.length === 1 ? ' game' : ' games') + ' to look forward to.', navigationButton('store', 'Game store', true)) + content + '</section>';
}

function postCard(post, image = true, thread = false) {
  const person = friends.find(friend => friend.id === post.author);
  const liked = state.liked.has(post.id);
  const likeIcon = '<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H3V10zm3 11h8a2 2 0 0 0 2-1.6L22 11a2 2 0 0 0-2-2h-6l1-5c0-2-2-3-3-1L8 10v9a2 2 0 0 0 2 2Z" fill="' + (liked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  return '<article class="community-post"><div class="post-author">' + avatar(person) + '<div>' + escapeHTML(person.name) + '<small>' + gameById(post.game).name + ' · ' + post.time + '</small></div></div><h2>' + escapeHTML(post.title) + '</h2><p>' + escapeHTML(post.text) + '</p>' + (image && post.image ? '<img class="post-image" src="' + asset(post.image) + '" alt="' + escapeHTML(post.title) + '">' : '') + '<div class="post-actions"><button class="btn btn-quiet icon-toggle" data-action="like" data-id="' + post.id + '" aria-label="Like ' + escapeHTML(post.title) + '" aria-pressed="' + liked + '">' + likeIcon + (post.likes + Number(liked)) + '</button>' + (!thread ? '<button class="btn btn-quiet" data-action="thread" data-id="' + post.id + '">' + icon('message-circle') + post.replies + ' comments</button>' : '') + '</div></article>';
}
function communityItems() {
  return posts.filter(post => (!state.communityGame || post.game === state.communityGame) && (state.communityTab !== 'Screenshots' || post.image));
}
function renderCommunity() {
  const items = communityItems();
  const perPage = state.compact || state.communityTab === 'Screenshots' ? 1 : 2;
  state.page = Math.min(state.page, Math.max(0, Math.ceil(items.length / perPage) - 1));
  const currentGame = gameById(state.communityGame);
  const feed = items.length ? items.slice(state.page * perPage, (state.page + 1) * perPage).map(post => postCard(post, state.communityTab === 'Screenshots')).join('') + pagination(items.length, perPage, 'community-page') : emptyState('No posts here yet', 'Browse all game communities to see what your friends are sharing.', '', '', 'messages') + '<button class="btn" data-action="all-community">All communities</button>';
  return '<section class="view community-view" data-view="community">' + viewHeader(currentGame ? currentGame.name : 'Community', '', currentGame ? '<button class="btn btn-quiet" data-action="all-community">All games</button>' : '') + '<div class="toolbar"><div class="tabs" role="tablist" aria-label="Community content">' + ['Screenshots', 'Discussions', 'Friends activity'].map(tab => '<button class="tab" data-action="community-tab" data-value="' + tab + '" role="tab" aria-selected="' + (state.communityTab === tab) + '">' + (state.compact && tab === 'Friends activity' ? 'Activity' : tab) + '</button>').join('') + '</div></div><div class="community-layout"><div class="community-feed">' + feed + '</div><aside class="community-aside"><h2>Your game hubs</h2>' + games.slice(0, 4).map(game => '<button class="hub-row" data-action="community-hub" data-id="' + game.id + '"><img src="' + asset(game.cover) + '" alt=""><div><strong>' + escapeHTML(game.name) + '</strong><span>' + game.genre + '</span></div></button>').join('') + '</aside></div></section>';
}
function renderThread() {
  const post = posts.find(item => item.id === state.post);
  return '<section class="view thread-view" data-view="thread">' + viewHeader('Discussion', '', navigationButton('community', icon('arrow-left') + ' Community', true)) + '<div class="thread-layout">' + postCard(post, false, true) + '<div class="thread-replies"><article class="reply">' + avatar(friends[1]) + '<div><strong>Marcus Reed</strong><p>Same here. The little details make the city feel alive.</p></div></article><article class="reply">' + avatar(friends[2]) + '<div><strong>Maya Torres</strong><p>The rooftops, definitely. I spent so much time just looking around.</p></div></article></div><form class="reply-form" id="reply-form" novalidate><textarea aria-label="Write a reply" name="reply" placeholder="Join the conversation…" maxlength="500">' + escapeHTML(state.replyDraft) + '</textarea>' + serviceButton('reply', 'Reply', 'submit-reply', 'type="submit"' + (!state.replyDraft.trim() && !state.operations.has('reply') ? ' disabled' : '')) + serviceError('reply') + '</form></div></section>';
}

function visibleFriends() {
  return friends.filter(friend => (state.friendFilter !== 'Online' || friend.online) && friend.name.toLowerCase().includes(state.friendQuery.toLowerCase()));
}
function friendRows() {
  const items = visibleFriends();
  const perPage = state.compact ? 4 : 5;
  state.friendPage = Math.min(state.friendPage, Math.max(0, Math.ceil(items.length / perPage) - 1));
  return (items.length ? '<div class="friend-list">' + items.slice(state.friendPage * perPage, (state.friendPage + 1) * perPage).map(person => '<button class="friend-row" data-action="friend" data-id="' + person.id + '" aria-pressed="' + (state.friend === person.id) + '">' + avatar(person) + '<span><strong>' + escapeHTML(person.name) + '</strong><small' + (!person.online ? ' class="is-away"' : '') + '>' + escapeHTML(person.status) + '</small></span></button>').join('') + '</div>' : '<div class="notification-empty">No friends found.</div>') + pagination(items.length, perPage, 'friend-page', state.friendPage);
}
function conversation() {
  const person = friends.find(friend => friend.id === state.friend);
  const message = state.drafts[person.id] || '';
  const firstMessage = person.id === 'alex' ? 'Have you found the little rooftop garden in Stray yet?' : 'Hey Jenny! What are you playing this weekend?';
  const lastMessage = person.id === 'alex' ? 'You’ll love it. The view is worth the climb.' : 'Let me know when you’re around.';
  return '<div class="conversation"><div class="conversation-header">' + avatar(person) + '<div><strong>' + escapeHTML(person.name) + '</strong><small>' + escapeHTML(person.status) + '</small></div></div><div class="conversation-date">Yesterday</div><div class="messages"><div class="message">' + firstMessage + '<small>6:42 PM</small></div><div class="message is-mine">Not yet! It’s next on my list.<small>6:44 PM</small></div><div class="message">' + lastMessage + '<small>6:45 PM</small></div></div><form class="message-form" id="message-form" novalidate><div class="message-input-row"><textarea name="message" aria-label="Message ' + escapeHTML(person.name) + '" placeholder="Message ' + escapeHTML(person.name.split(' ')[0]) + '…" maxlength="1000">' + escapeHTML(message) + '</textarea>' + serviceButton('message-' + person.id, icon('send'), 'submit-message', 'type="submit" aria-label="Send message"' + (!message.trim() && !state.operations.has('message-' + person.id) ? ' disabled' : '')) + '</div>' + serviceError('message-' + person.id) + '</form></div>';
}
function renderFriends() {
  const controls = '<button class="btn" data-action="add-friend">' + icon('user-plus') + (state.compact ? '' : ' Add friend') + '</button>';
  let content;
  if (state.friendTab === 'Groups') content = '<div class="group-card"><h2>The Night Shift</h2><p>One more game before calling it a night.<br>Alex, Marcus, Maya, and 5 others.</p>' + serviceButton('group-chat', icon('messages') + ' Open group chat') + serviceError('group-chat') + '</div><div class="group-card"><h2>Weekend Explorers</h2><p>A place to share your next adventure.</p>' + navigationButton('community', 'View community') + '</div>';
  else content = '<div class="friends-layout"><div class="friend-panel"><div class="local-search">' + icon('search') + '<input id="friend-search" type="search" aria-label="Search friends" placeholder="Find a friend" value="' + escapeHTML(state.friendQuery) + '" autocomplete="off"></div><div class="friend-results" id="friend-results">' + friendRows() + '</div></div>' + conversation() + '</div>';
  return '<section class="view friends-view" data-view="friends">' + viewHeader('Friends & chat', '', controls) + '<div class="toolbar"><div class="tabs" role="tablist" aria-label="Friends and groups">' + ['Friends', 'Groups'].map(tab => '<button class="tab" data-action="friend-tab" data-value="' + tab + '" role="tab" aria-selected="' + (state.friendTab === tab) + '">' + tab + '</button>').join('') + '</div>' + (state.friendTab === 'Friends' ? '<button class="dropdown-trigger" data-popover="friend-filter" aria-haspopup="listbox" aria-expanded="false">' + (state.compact ? (state.friendFilter === 'Online' ? 'Online' : 'All') : state.friendFilter) + icon('chevron-down') + '</button>' : '') + '</div>' + content + '</section>';
}

function renderSettings() {
  const settings = [
    { key: 'ambient', title: 'Ambient backdrop', description: 'Soft color around the games you’re exploring.' },
    { key: 'motion', title: 'Interface motion', description: 'Subtle transitions as you move through Steam.' },
    { key: 'notifications', title: 'Friend notifications', description: 'Show new activity from your friends.' }
  ];
  return '<section class="view settings-view" data-view="settings">' + viewHeader('Settings', '') + '<div class="settings-layout"><div class="settings-section"><h2>Appearance & preferences</h2>' + settings.map(setting => '<div class="setting-row"><div><strong>' + setting.title + '</strong><p>' + setting.description + '</p></div><label class="switch"><input type="checkbox" data-preference="' + setting.key + '" aria-label="' + setting.title + '"' + (preferences[setting.key] ? ' checked' : '') + '></label></div>').join('') + '<div class="setting-row"><div><strong>Start page</strong><p>Choose where Steam opens.</p></div><button class="dropdown-trigger" data-popover="start-page" aria-haspopup="listbox" aria-expanded="false">' + (preferences.startPage === 'library' ? 'Library' : 'Game store') + icon('chevron-down') + '</button></div><p class="inline-success" id="preference-result" role="status" hidden></p></div><aside class="connection-panel">' + icon('plug-connected-x') + '<h2>Steam connection</h2><p>Connect the desktop client to play games, complete purchases, and keep in touch.</p><div class="status-label">Not connected</div>' + serviceButton('connect', 'Connect Steam') + serviceError('connect') + '</aside></div></section>';
}
function renderAccount() {
  let content;
  if (state.accountTab === 'Edit profile') content = '<form class="profile-form" id="profile-form" novalidate><label class="form-field"><span>Profile name</span><input name="profile-name" type="text" maxlength="32" value="' + escapeHTML(state.profileDraft) + '" autocomplete="nickname"><small>This is how your friends find you.</small></label>' + serviceButton('profile', 'Save profile', 'submit-profile', 'type="submit"' + (!state.profileDraft.trim() && !state.operations.has('profile') ? ' disabled' : '')) + serviceError('profile') + '</form>';
  else if (state.accountTab === 'Purchase history') content = '<div class="account-section"><h2>Recent purchases</h2>' + games.filter(game => game.owned).map((game, index) => '<article class="purchase-row"><div><strong>' + escapeHTML(game.name) + '</strong><p>' + ['22 Oct, 2026', '3 Sep, 2026', '16 Aug, 2026'][index] + ' · Purchase</p></div><span>' + money(game.price) + '</span></article>').join('') + '</div>';
  else content = '<div class="account-layout"><div class="account-section"><div class="account-profile">' + avatar({ avatar: 'avatar-jenny', name: 'Jenny Wilson' }) + '<div><h2>Jenny Wilson</h2><p>jennywilson · Online</p></div></div><div class="account-facts"><div class="account-fact"><span>Steam ID</span><strong>76561198048265329</strong></div><div class="account-fact"><span>Store country</span><strong>United States</strong></div><div class="account-fact"><span>Account security</span><strong>Steam Guard enabled</strong></div><div class="account-fact"><span>Member since</span><strong>14 March, 2018</strong></div></div><div class="account-links">' + '<button class="btn" data-action="account-tab" data-value="Edit profile">Edit profile</button><button class="btn btn-quiet" data-action="account-tab" data-value="Purchase history">Purchase history</button></div></div><aside class="account-wallet"><p>Your Steam Wallet</p><strong>$24.60</strong>' + serviceButton('wallet', 'Add funds') + serviceError('wallet') + '<div class="account-links">' + navigationButton('wishlist', 'Your wishlist', true) + '</div></aside></div>';
  return '<section class="view account-view" data-view="account">' + viewHeader('Your account', '', state.accountTab !== 'Overview' ? '<button class="btn btn-quiet" data-action="account-tab" data-value="Overview">' + icon('arrow-left') + ' Overview</button>' : '') + content + '</section>';
}
function renderHelp() {
  const articles = helpArticles.filter(article => [article.title, article.text, ...article.steps].join(' ').toLowerCase().includes(state.helpQuery.toLowerCase()));
  let article = articles.find(item => item.id === state.helpArticle) || articles[0];
  if (article) state.helpArticle = article.id;
  return '<section class="view help-view" data-view="help">' + viewHeader('How can we help?', 'Find your way back to playing.') + '<div class="help-layout"><aside class="help-aside"><div class="local-search">' + icon('search') + '<input id="help-search" type="search" aria-label="Search help" placeholder="Search help" value="' + escapeHTML(state.helpQuery) + '"></div><div class="help-article-list" id="help-topics">' + articles.map(item => '<button class="help-topic" data-action="help-topic" data-id="' + item.id + '" aria-pressed="' + (article?.id === item.id) + '">' + item.title + '</button>').join('') + '</div></aside><article class="help-article" id="help-article">' + (article ? '<h2>' + article.title + '</h2><p>' + article.text + '</p><ol>' + article.steps.map(step => '<li>' + step + '</li>').join('') + '</ol><p>' + article.end + '</p><a class="btn" href="https://help.steampowered.com/" target="_blank" rel="noopener noreferrer">Steam Support ' + icon('external-link') + '</a>' : '<h2>No matching articles</h2><p>Try searching for a game, purchases, or your account.</p><button class="btn" data-action="clear-help">Clear search</button>') + '</article></div></section>';
}

function renderView() {
  const renderers = { store: renderStore, offers: renderCatalog, search: renderCatalog, game: renderDetail, library: renderLibrary, cart: renderCart, wishlist: renderWishlist, community: renderCommunity, thread: renderThread, friends: renderFriends, settings: renderSettings, account: renderAccount, help: renderHelp };
  workspace.innerHTML = renderers[state.view]();
  const nav = ['store', 'offers', 'search', 'game', 'cart', 'wishlist', 'account'].includes(state.view) ? 'store' : state.view === 'thread' ? 'community' : state.view;
  document.querySelectorAll('[data-nav]').forEach(item => {
    const active = item.dataset.nav === nav;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
  const navIndex = ['store', 'library', 'community', 'friends'].indexOf(nav);
  const indicator = document.querySelector('.nav-indicator');
  indicator.hidden = navIndex < 0;
  indicator.style.transform = 'translateY(' + navIndex * (state.compact ? 8.5 : 4.04) + 'cqw)';
  document.title = 'Steam — ' + ({ store: 'Game store', game: gameById(state.game)?.name, thread: 'Discussion' }[state.view] || state.view[0].toUpperCase() + state.view.slice(1));
  updateHeader();
}
function updateHeader() {
  const count = document.querySelector('.cart-count');
  count.textContent = state.cart.size;
  count.hidden = !state.cart.size;
  document.querySelector('.cart-trigger').setAttribute('aria-label', 'Shopping cart' + (state.cart.size ? ', ' + state.cart.size + ' games' : ''));
  document.querySelector('.unread-dot').hidden = !preferences.notifications || state.readNotices.size >= 2;
  document.querySelector('.search-clear').hidden = !searchInput.value;
}
function routeName() { return state.view === 'game' ? 'game/' + state.game : state.view === 'thread' ? 'thread/' + state.post : state.view; }
function navigate(route, push = true) {
  const [view, id] = route.split('/');
  const allowed = ['store', 'offers', 'search', 'game', 'library', 'cart', 'wishlist', 'community', 'thread', 'friends', 'settings', 'account', 'help'];
  state.view = allowed.includes(view) ? view : 'store';
  if (state.view === 'game') {
    const game = gameById(id);
    if (game) { state.game = id; state.media = Math.min(state.media, game.media.length - 1); }
    else state.view = 'store';
  }
  if (state.view === 'thread') {
    if (posts.some(post => post.id === id)) state.post = id; else state.view = 'community';
  }
  state.page = 0;
  closePopover(false);
  closeDialog(false);
  if (push && location.hash !== '#' + routeName()) history.pushState(null, '', '#' + routeName());
  renderView();
}
function openGame(id, media = 0) {
  if (state.view !== 'game') state.returnRoute = routeName();
  state.media = media;
  navigate('game/' + id);
}
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}
function applyPreferences() {
  canvas.classList.toggle('ambient-off', !preferences.ambient);
  canvas.classList.toggle('reduce-motion', !preferences.motion || matchMedia('(prefers-reduced-motion: reduce)').matches);
  updateHeader();
}
function savePreferences() {
  applyPreferences();
  const result = document.getElementById('preference-result');
  try {
    localStorage.setItem('steam-desktop.preferences', JSON.stringify(preferences));
    if (result) { result.className = 'inline-success'; result.textContent = 'Preferences saved.'; result.hidden = false; }
  } catch {
    if (result) { result.className = 'inline-error'; result.textContent = 'Your browser couldn’t save these preferences.'; result.hidden = false; }
  }
}

function menuOption(label, action, value, selected = false, disabled = false) {
  return '<button class="menu-option" role="option" data-action="' + action + '" data-value="' + escapeHTML(value) + '" aria-selected="' + selected + '"' + (disabled ? ' disabled' : '') + '><span>' + escapeHTML(label) + '</span>' + (selected ? icon('check') : '') + (disabled ? '<small>Unavailable</small>' : '') + '</button>';
}
function renderPopover(kind) {
  if (kind === 'profile') return '<div class="popover-title">Jenny Wilson</div><div role="menu"><button class="menu-option" role="menuitem" data-action="navigate" data-route="account">Your account ' + icon('user-circle') + '</button><button class="menu-option" role="menuitem" data-action="navigate" data-route="wishlist">Wishlist <span>' + state.wishlist.size + '</span></button><button class="menu-option" role="menuitem" data-action="navigate" data-route="settings">Settings ' + icon('settings') + '</button><div class="menu-separator"></div><button class="menu-option" role="menuitem" data-action="navigate" data-route="help">Steam Support ' + icon('help') + '</button></div>';
  if (kind === 'notifications') {
    const notices = [{ id: 'wish', person: friends[1], text: 'Marcus added Stray to their wishlist.', time: '12 minutes ago' }, { id: 'shot', person: friends[2], text: 'Maya shared a new screenshot.', time: '2 hours ago' }].filter(item => !state.readNotices.has(item.id));
    return '<div class="popover-title">Notifications</div>' + (notices.length ? notices.map(item => '<button class="notification-item" data-action="notice" data-id="' + item.id + '">' + avatar(item.person) + '<div><p>' + item.text + '</p><small>' + item.time + '</small></div></button>').join('') + '<button class="menu-option" data-action="read-notices">Mark all as read ' + icon('checks') + '</button>' : '<div class="notification-empty">You’re all caught up.</div>');
  }
  const config = {
    genre: { title: 'Browse categories', values: ['All games', 'Adventure', 'Action', 'Sports', 'RPG', 'Cats', 'Cyberpunk'], action: 'genre', selected: state.genre },
    sort: { title: 'Sort games', values: ['Featured', 'Price: low to high', 'Name: A to Z', 'Friends’ playtime'], action: 'sort', selected: state.sort, disabled: 'Friends’ playtime' },
    'library-filter': { title: 'Show games', values: ['All games', 'Installed', 'Updates available'], action: 'library-filter', selected: state.libraryFilter, disabled: 'Updates available' },
    'friend-filter': { title: 'Show friends', values: ['All friends', 'Online'], action: 'friend-filter', selected: state.friendFilter },
    'start-page': { title: 'Start page', values: ['Game store', 'Library'], action: 'start-page', selected: preferences.startPage === 'library' ? 'Library' : 'Game store' }
  }[kind];
  return '<div class="popover-title">' + config.title + '</div><div role="listbox" aria-label="' + config.title + '">' + config.values.map(value => menuOption(value, config.action, value, value === config.selected, value === config.disabled)).join('') + '</div>';
}
function positionPopover() {
  if (!popoverAnchor?.isConnected) return;
  const bounds = canvas.getBoundingClientRect();
  const trigger = popoverAnchor.getBoundingClientRect();
  const panel = popover.getBoundingClientRect();
  const padding = Math.min(24, bounds.width * .06);
  const left = Math.max(padding, Math.min(trigger.left - bounds.left, bounds.width - panel.width - padding));
  const top = Math.max(padding, Math.min(trigger.bottom - bounds.top + bounds.width * .006, bounds.height - panel.height - padding));
  popover.style.left = left / bounds.width * 100 + 'cqw';
  popover.style.top = top / bounds.width * 100 + 'cqw';
}
function openPopover(kind, trigger) {
  if (!popover.hidden && state.popoverKind === kind && popoverAnchor === trigger) { closePopover(); return; }
  closePopover(false);
  state.popoverKind = kind;
  popoverAnchor = trigger;
  popover.dataset.kind = kind;
  popover.innerHTML = renderPopover(kind);
  popover.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  positionPopover();
}
function closePopover(restoreFocus = true) {
  if (popover.hidden) return;
  popover.hidden = true;
  popoverAnchor?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && popoverAnchor?.isConnected) popoverAnchor.focus({ preventScroll: true });
  state.popoverKind = '';
  popoverAnchor = null;
}
function openFriendDialog() {
  closePopover(false);
  state.dialogKind = 'friend';
  dialogFocus = document.activeElement;
  dialog.innerHTML = '<header class="dialog-header"><h2 id="dialog-title">Add a friend</h2><button class="icon-button" data-action="close-dialog" aria-label="Close">' + icon('x') + '</button></header><p class="dialog-copy">A new adventure is better together. Find your friend with their Steam friend code.</p><form id="friend-request-form" novalidate><label class="form-field"><span>Friend code</span><input name="friend-code" type="text" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="Enter a friend code" value="' + escapeHTML(state.friendCode) + '"><small>Find your code in the Steam desktop client.</small></label>' + serviceError('friend-request') + '<div class="dialog-footer"><button class="btn btn-quiet" type="button" data-action="close-dialog">Cancel</button>' + serviceButton('friend-request', 'Send request', 'submit-friend', 'type="submit"' + (!/^\d{8,12}$/.test(state.friendCode) && !state.operations.has('friend-request') ? ' disabled' : '')) + '</div></form>';
  dialogLayer.hidden = false;
  document.querySelector('.app').inert = true;
  dialog.querySelector('input').focus({ preventScroll: true });
}
function closeDialog(restoreFocus = true) {
  if (dialogLayer.hidden) return;
  dialogLayer.hidden = true;
  document.querySelector('.app').inert = false;
  state.dialogKind = '';
  if (restoreFocus && dialogFocus?.isConnected) dialogFocus.focus({ preventScroll: true });
}

function requireConnection(key, button) {
  if (state.operations.has(key)) return;
  state.operations.add(key);
  state.errors.delete(key);
  const previous = button.innerHTML;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + (key.startsWith('message-') ? '' : 'Connecting…');
  const error = document.getElementById(key + '-error');
  if (error) error.hidden = true;
  setTimeout(() => {
    state.operations.delete(key);
    const message = key === 'checkout' ? 'Connect to Steam to continue to checkout. Your cart hasn’t changed.'
      : key.startsWith('message-') ? 'Connect to Steam to send this message.'
      : key.startsWith('launch-') ? 'Connect the Steam desktop client to launch or install this game.'
      : key === 'friend-request' ? 'Connect to Steam to send a friend request.'
      : key === 'profile' ? 'Connect to Steam to save your profile. Your changes are still here.'
      : key === 'reply' ? 'Connect to Steam to post your reply.'
      : key === 'wallet' ? 'Connect to Steam to add funds to your wallet.'
      : key === 'group-chat' ? 'Connect to Steam to join the group chat.'
      : 'The Steam desktop client isn’t connected. Open the client and try again.';
    state.errors.set(key, message);
    const current = canvas.querySelector('[data-service="' + key + '"]');
    if (current) {
      current.disabled = false;
      current.removeAttribute('aria-busy');
      current.innerHTML = previous;
      const form = current.closest('form');
      if (form) updateFormButton(form);
    }
    const currentError = document.getElementById(key + '-error');
    if (currentError) { currentError.textContent = message; currentError.hidden = false; }
  }, 480);
}
function updateFormButton(form) {
  const button = form.querySelector('[data-service]');
  if (!button || state.operations.has(button.dataset.service)) return;
  const input = form.querySelector('input, textarea');
  button.disabled = form.id === 'friend-request-form' ? !/^\d{8,12}$/.test(input.value.trim()) : !input.value.trim();
}

function onClick(event) {
  const button = event.target.closest('[data-action], [data-popover]');
  if (!button || !canvas.contains(button) || button.disabled) return;
  if (button.dataset.popover) { openPopover(button.dataset.popover, button); return; }
  const id = button.dataset.id;
  const value = button.dataset.value;
  const action = button.dataset.action;
  if (action === 'navigate') navigate(button.dataset.route);
  else if (action === 'open-game') openGame(id, Number(button.dataset.media || 0));
  else if (action === 'detail-back') navigate(state.returnRoute);
  else if (action === 'slide') { state.slide = Number(button.dataset.index); renderView(); }
  else if (action === 'media') { state.media = Number(button.dataset.index); renderView(); }
  else if (action === 'genre') { state.genre = value; navigate('offers'); }
  else if (action === 'catalog-genre') { state.genre = value; state.page = 0; renderView(); }
  else if (action === 'sort') { state.sort = value; state.page = 0; closePopover(); renderView(); }
  else if (action === 'reset-catalog') { state.genre = 'All games'; state.query = ''; searchInput.value = ''; state.page = 0; renderView(); }
  else if (action === 'clear-search') { state.query = ''; searchInput.value = ''; if (state.view === 'search') navigate('store'); else updateHeader(); searchInput.focus(); }
  else if (action === 'catalog-page') { state.page += Number(button.dataset.direction); renderView(); }
  else if (action === 'wishlist') {
    if (state.wishlist.has(id)) state.wishlist.delete(id); else state.wishlist.add(id);
    renderView();
  }
  else if (action === 'add-cart') { state.cart.add(id); renderView(); notify(gameById(id).name + ' added to your cart.'); }
  else if (action === 'remove-cart') { state.cart.delete(id); state.errors.delete('checkout'); renderView(); }
  else if (action === 'open-library') { state.libraryGame = id; navigate('library'); }
  else if (action === 'library-game') { state.libraryGame = id; renderView(); }
  else if (action === 'library-filter') { state.libraryFilter = value; closePopover(); renderView(); }
  else if (action === 'community-hub') { state.communityGame = id; navigate('community'); }
  else if (action === 'all-community') { state.communityGame = ''; state.page = 0; renderView(); }
  else if (action === 'community-tab') { state.communityTab = value; state.page = 0; renderView(); }
  else if (action === 'community-page') { state.page += Number(button.dataset.direction); renderView(); }
  else if (action === 'like') { if (state.liked.has(id)) state.liked.delete(id); else state.liked.add(id); renderView(); }
  else if (action === 'thread') { state.post = id; navigate('thread/' + id); }
  else if (action === 'friend') { state.friend = id; renderView(); }
  else if (action === 'friend-tab') { state.friendTab = value; renderView(); }
  else if (action === 'friend-filter') { state.friendFilter = value; state.friendPage = 0; closePopover(); renderView(); }
  else if (action === 'friend-page') { state.friendPage += Number(button.dataset.direction); document.getElementById('friend-results').innerHTML = friendRows(); }
  else if (action === 'add-friend') openFriendDialog();
  else if (action === 'close-dialog') closeDialog();
  else if (action === 'start-page') { preferences.startPage = value === 'Library' ? 'library' : 'store'; closePopover(); renderView(); savePreferences(); }
  else if (action === 'account-tab') { state.accountTab = value; renderView(); }
  else if (action === 'help-topic') { state.helpArticle = id; renderView(); }
  else if (action === 'clear-help') { state.helpQuery = ''; renderView(); }
  else if (action === 'read-notices') { state.readNotices.add('wish'); state.readNotices.add('shot'); popover.innerHTML = renderPopover('notifications'); updateHeader(); positionPopover(); }
  else if (action === 'notice') { state.readNotices.add(id); if (id === 'wish') openGame('stray'); else { state.communityTab = 'Screenshots'; navigate('community'); } }
  else if (action === 'service') requireConnection(button.dataset.service, button);
  else if (action === 'retry-artwork') {
    const container = button.closest('.artwork-error').parentElement;
    const image = container.querySelector('img:not(.feature-background)');
    button.closest('.artwork-error').remove();
    image.src = image.dataset.originalSrc + '?retry=' + Date.now();
  }
}

function onInput(event) {
  const input = event.target;
  if (input === searchInput) {
    state.query = input.value.trim();
    state.genre = 'All games';
    state.page = 0;
    if (state.query) {
      if (state.view !== 'search') navigate('search'); else renderView();
    } else if (state.view === 'search') navigate('store');
    updateHeader();
  } else if (input.id === 'friend-search') {
    state.friendQuery = input.value;
    state.friendPage = 0;
    document.getElementById('friend-results').innerHTML = friendRows();
  } else if (input.id === 'help-search') {
    state.helpQuery = input.value;
    const position = input.selectionStart;
    renderView();
    const next = document.getElementById('help-search');
    next.focus({ preventScroll: true });
    next.setSelectionRange(position, position);
  } else if (input.name === 'message') {
    state.drafts[state.friend] = input.value;
    state.errors.delete('message-' + state.friend);
    document.getElementById('message-' + state.friend + '-error').hidden = true;
    updateFormButton(input.form);
  } else if (input.name === 'reply') { state.replyDraft = input.value; updateFormButton(input.form); }
  else if (input.name === 'friend-code') {
    state.friendCode = input.value;
    const error = document.getElementById('friend-request-error');
    const valid = /^\d{8,12}$/.test(input.value.trim());
    input.setAttribute('aria-invalid', String(!!input.value && !valid));
    if (input.value && !valid) { error.hidden = false; error.textContent = 'Enter an 8–12 digit friend code.'; }
    else { error.hidden = true; state.errors.delete('friend-request'); }
    updateFormButton(input.form);
  } else if (input.name === 'profile-name') { state.profileDraft = input.value; updateFormButton(input.form); }
}
function onSubmit(event) {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'global-search') {
    state.query = searchInput.value.trim();
    if (state.query) navigate('search');
    return;
  }
  const button = form.querySelector('[data-service]');
  if (!button || button.disabled) return;
  if (form.id === 'friend-request-form' && !/^\d{8,12}$/.test(state.friendCode.trim())) return;
  requireConnection(button.dataset.service, button);
}
function onKeydown(event) {
  if (event.key === 'Escape') {
    if (!dialogLayer.hidden) closeDialog();
    else if (!popover.hidden) closePopover();
    else if (searchInput.value && document.activeElement === searchInput) { searchInput.value = ''; state.query = ''; navigate('store'); }
  }
  if (!dialogLayer.hidden && event.key === 'Tab') {
    const controls = [...dialog.querySelectorAll('button:not(:disabled), input, textarea, a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (!popover.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    const options = [...popover.querySelectorAll('button:not(:disabled)')];
    let index = options.indexOf(document.activeElement);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = options.length - 1;
    else index = (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    event.preventDefault(); options[index]?.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && dialogLayer.hidden) { event.preventDefault(); searchInput.focus(); }
}
function onImageError(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const parent = image.parentElement;
  if (!parent.matches('.detail-main-image, .feature') || image.classList.contains('feature-background') || image.classList.contains('feature-logo')) return;
  if (parent.querySelector('.artwork-error')) return;
  image.dataset.originalSrc = image.getAttribute('src').split('?')[0];
  const error = document.createElement('div');
  error.className = 'artwork-error';
  error.innerHTML = icon('photo-off') + '<span>Artwork couldn’t be loaded.</span><button class="btn" data-action="retry-artwork">Try again</button>';
  parent.append(error);
}

function start() {
  if (started) return;
  started = true;
  state.compact = canvas.clientWidth <= 720;
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('input', onInput);
  canvas.addEventListener('submit', onSubmit);
  canvas.addEventListener('change', event => {
    const key = event.target.dataset.preference;
    if (key) { preferences[key] = event.target.checked; savePreferences(); }
  });
  canvas.addEventListener('error', onImageError, true);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', event => {
    if (!popover.hidden && !popover.contains(event.target) && !popoverAnchor?.contains(event.target)) closePopover(false);
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); navigate(link.getAttribute('href').slice(1));
  }));
  window.addEventListener('popstate', () => navigate(location.hash.slice(1) || preferences.startPage, false));
  const resize = new ResizeObserver(() => {
    const compact = canvas.clientWidth <= 720;
    if (compact !== state.compact) { state.compact = compact; renderView(); closePopover(false); }
    else positionPopover();
  });
  resize.observe(canvas);
  navigate(location.hash.slice(1) || preferences.startPage, false);
  applyPreferences();
  requestAnimationFrame(() => canvas.classList.add('is-ready'));
  setTimeout(() => canvas.classList.add('entry-complete'), 650);
}

start();
