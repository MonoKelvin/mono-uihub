const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const bookmarkIcon = saved => saved ? '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18a1 1 0 0 1-1.5.87L12 18.6l-5.5 3.27A1 1 0 0 1 5 21z"/></svg>' : icon('bookmark');
const teamLogo = (team, className = '') => `<svg class="team-logo ${className}" viewBox="0 0 64 70" aria-hidden="true"><use href="#team-${team.logo}"></use></svg>`;
const btn = (label, action, extra = '', className = 'button') => `<button type="button" class="${className}" data-action="${action}" ${extra}>${label}</button>`;
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date();
today.setHours(0, 0, 0, 0);
const dateAt = offset => { const date = new Date(today); date.setDate(date.getDate() + offset); return dateKey(date); };
const formatDate = key => new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const image = (src, alt, className = '') => `<img src="assets/${src}" alt="${escapeHTML(alt)}" class="${className}" loading="lazy">`;
const teams = {
  butterfly: { name: 'Butterfly', logo: 'butterfly', country: 'Indonesia' },
  peacock: { name: 'Peacock', logo: 'peacock', country: 'Indonesia' },
  deer: { name: 'Deer', logo: 'deer', country: 'Indonesia' },
  aerowolf: { name: 'Aerowolf', logo: 'wolf', country: 'Indonesia' },
  bigetron: { name: 'Bigetron', logo: 'peacock', country: 'Indonesia' },
  alter: { name: 'Alter ego', logo: 'deer', country: 'Indonesia' },
  aura: { name: 'Aura', logo: 'butterfly', country: 'Indonesia' },
  brent: { name: 'Brent', logo: 'wolf', country: 'Singapore' },
  onic: { name: 'Onic', logo: 'peacock', country: 'Indonesia' },
  evos: { name: 'Evos SG', logo: 'deer', country: 'Singapore' },
  geek: { name: 'Geek fam', logo: 'wolf', country: 'Malaysia' }
};
const matches = [
  { id: 'butterfly-peacock', a: 'butterfly', b: 'peacock', game: 'lol', league: 'ESL Pro League', date: dateAt(0), time: '09:00', status: 'live', score: [2, 0], round: 'Playoffs · Best of 5' },
  { id: 'aerowolf-bigetron', a: 'aerowolf', b: 'bigetron', game: 'lol', league: 'ESL Pro League', date: dateAt(0), time: '10:45', status: 'upcoming', score: null, round: 'Group A · Best of 3' },
  { id: 'alter-aura', a: 'alter', b: 'aura', game: 'lol', league: 'ESL Pro League', date: dateAt(0), time: '12:00', status: 'upcoming', score: null, round: 'Group B · Best of 3' },
  { id: 'brent-onic', a: 'brent', b: 'onic', game: 'valorant', league: 'VCT Pacific', date: dateAt(0), time: '14:00', status: 'upcoming', score: null, round: 'Quarterfinal · Best of 3' },
  { id: 'evos-geek', a: 'evos', b: 'geek', game: 'lol', league: 'ESL Pro League', date: dateAt(0), time: '16:00', status: 'upcoming', score: null, round: 'Group A · Best of 3' },
  { id: 'deer-aerowolf', a: 'deer', b: 'aerowolf', game: 'dota', league: 'SEA Championship', date: dateAt(1), time: '11:30', status: 'upcoming', score: null, round: 'Upper bracket · Best of 3' },
  { id: 'peacock-onic', a: 'peacock', b: 'onic', game: 'lol', league: 'ESL Pro League', date: dateAt(1), time: '14:00', status: 'upcoming', score: null, round: 'Group B · Best of 3' },
  { id: 'butterfly-deer', a: 'butterfly', b: 'deer', game: 'lol', league: 'ESL Pro League', date: dateAt(-1), time: '15:00', status: 'finished', score: [2, 1], round: 'Group A · Best of 3' },
  { id: 'aura-brent', a: 'aura', b: 'brent', game: 'valorant', league: 'VCT Pacific', date: dateAt(-1), time: '17:30', status: 'finished', score: [0, 2], round: 'Group stage · Best of 3' },
  { id: 'geek-bigetron', a: 'geek', b: 'bigetron', game: 'dota', league: 'SEA Championship', date: dateAt(3), time: '13:00', status: 'upcoming', score: null, round: 'Lower bracket · Best of 3' },
  { id: 'deer-evos', a: 'deer', b: 'evos', game: 'lol', league: 'ESL Pro League', date: dateAt(5), time: '18:00', status: 'upcoming', score: null, round: 'Semifinal · Best of 5' }
];
const gameNames = { all: 'All games', lol: 'League Of Legends', valorant: 'Valorant', dota: 'Dota 2', tft: 'Teamfight Tactics' };
const news = [
  { id: 'fates', title: 'Festival of beasts', game: 'tft', img: 'festival-of-beasts.jpg', category: 'Game updates', read: '4 min read', popularity: 98, intro: 'A new chapter of Fates brings a little celebration to the Convergence.', body: ['The Festival of Beasts brings new champions, traits, and team compositions to Teamfight Tactics. Build around your Chosen, adapt to the lobby, and find a new path to the top four.', 'Dragonsoul, Fabled, and Syphoner give every round a different rhythm. The best compositions stay flexible: keep an eye on your economy and leave room for the champion that changes everything.', 'Bring your favorite Little Legend, explore the festival, and discover what your next winning board looks like.'], date: 'Jan 21' },
  { id: 'lol-talk', title: 'LOL Talk', game: 'lol', img: 'lol-talk.jpg', category: 'Community', read: '6 min read', popularity: 87, intro: 'Small decisions. Big plays. A closer look at what wins a series.', body: ['The strongest teams make the map feel small. A clean rotation, a patient support, and a well-timed objective can create the opening that a highlight reel never shows.', 'This week we look at Butterfly’s playoff run: a bot lane that plays around pressure, coordinated vision, and a draft that gives the carries room to work.', 'Join the conversation with your friends and choose the match you want to follow next.'], date: 'Jan 22' },
  { id: 'explanner', title: 'Explanner', game: 'tft', img: 'yuumi.jpg', category: 'Guides', read: '3 min read', popularity: 75, intro: 'Your next favorite companion is waiting on the Convergence.', body: ['Little Legends bring personality to every match. Whether you like a bold entrance or a quiet victory, there is a companion for the way you play.', 'Start with a familiar composition, watch the lobby, and learn when to level. A strong economy gives you more opportunities to find the units you need.', 'A little curiosity goes a long way. Try a different trait, experiment with an item, and make your next game your own.'], date: 'Jan 23' },
  { id: 'playoffs', title: 'The road to playoffs', game: 'lol', img: 'lol-talk.jpg', category: 'Esports', read: '5 min read', popularity: 92, intro: 'Meet the teams shaping the next chapter of the ESL Pro League.', body: ['The group stage is over, but the story is just beginning. Butterfly, Peacock, and Deer enter the playoffs with very different strengths.', 'Every draft matters in a best-of-five. Expect more adaptation, new picks, and a few surprises as the series develops.', 'Follow the schedule to keep track of every match and save the series you do not want to miss.'], date: 'Jan 24' },
  { id: 'chosen', title: 'Find your Chosen', game: 'tft', img: 'festival-of-beasts.jpg', category: 'Strategy', read: '4 min read', popularity: 69, intro: 'Learn when to commit, when to pivot, and when to roll.', body: ['A Chosen champion can be the foundation of your board. The challenge is knowing when that foundation should change.', 'Keep your early game flexible. Pairs are useful, but a strong item holder and a healthy economy can be worth more than chasing one specific unit.', 'Scout your opponents before making a big investment. The right decision depends on the lobby, not just the composition you had in mind.'], date: 'Jan 25' },
  { id: 'support', title: 'A little magic', game: 'lol', img: 'yuumi.jpg', category: 'Champions', read: '3 min read', popularity: 62, intro: 'Good support play starts before the fight begins.', body: ['Information is one of the most valuable resources on the Rift. The right ward can save a carry, reveal an objective, or set up a winning fight.', 'Work with your team to control the river before an objective spawns. A patient approach is often more useful than a rushed engage.', 'Stay connected, communicate your plan, and turn a small advantage into something your whole team can use.'], date: 'Jan 26' }
];
const streams = [
  { id: 'rift', title: 'A good day on the Rift', user: 'Vektora Gaming', game: 'lol', viewers: '12.8K', img: 'lol-talk.jpg' },
  { id: 'convergence', title: 'Climbing the Convergence', user: 'Little Legend', game: 'tft', viewers: '8.4K', img: 'festival-of-beasts.jpg' },
  { id: 'support-main', title: 'A little support magic', user: 'Yuumi & friends', game: 'lol', viewers: '6.2K', img: 'yuumi.jpg' }
];
const initialFriends = [
  { id: 'gon', name: 'Gon', tag: 'gon#021', initials: 'GO', color: 'mint', status: 'online', activity: 'League of Legends', rank: 'Diamond II' },
  { id: 'kurapika', name: 'Kurapika', tag: 'kurapika#404', initials: 'KU', color: 'gold', status: 'online', activity: 'Watching Butterfly vs Peacock', rank: 'Platinum I' },
  { id: 'leorio', name: 'Leorio', tag: 'leorio#007', initials: 'LE', color: 'blue', status: 'away', activity: 'Away from keyboard', rank: 'Gold III' },
  { id: 'alluka', name: 'Alluka', tag: 'alluka#111', initials: 'AL', color: 'pink', status: 'online', activity: 'Teamfight Tactics', rank: 'Diamond IV' },
  { id: 'hisoka', name: 'Hisoka', tag: 'hisoka#044', initials: 'HI', color: 'purple', status: 'offline', activity: 'Last seen 2 hours ago', rank: 'Master' },
  { id: 'kite', name: 'Kite', tag: 'kite#090', initials: 'KI', color: 'blue', status: 'offline', activity: 'Last seen yesterday', rank: 'Platinum II' }
];
const initialRequests = [
  { id: 'biscuit', name: 'Biscuit', tag: 'bisky#057', initials: 'BI', color: 'pink', status: 'online', activity: 'League of Legends', rank: 'Diamond I' },
  { id: 'knuckle', name: 'Knuckle', tag: 'knuckle#012', initials: 'KN', color: 'mint', status: 'online', activity: 'Teamfight Tactics', rank: 'Platinum III' }
];
const state = {
  game: 'lol', newsSort: 'popular', streamSort: 'popular', nextDay: 'today', trendTab: 'all', trendGame: 'all', trendPage: 1,
  matchFilter: 'all', matchGame: 'all', matchPage: 1, friendsFilter: 'all', friendQuery: '', friendPage: 1, addFriendOpen: false,
  friends: initialFriends.map(friend => ({ ...friend })), requests: initialRequests.map(friend => ({ ...friend })), invites: new Set(),
  reminders: new Set(['aerowolf-bigetron']), picks: {}, bookmarks: new Set(), calendarMonth: new Date(today.getFullYear(), today.getMonth(), 1), selectedDate: dateKey(today), agendaPage: 1, reminderPage: 1, notificationPage: 1, searchMatchPage: 1, searchNewsPage: 1,
  profile: { name: 'Killua', email: 'killua@hoxye.gg', region: 'Indonesia', favorite: 'lol', bio: 'Good games. Better friends.' }, settingsTab: 'profile',
  preferences: { matchAlerts: true, friendAlerts: true, messageAlerts: true, reducedMotion: false },
  chats: {
    gon: [{ from: 'them', text: 'Hey! Are you watching the playoffs today?', time: '09:12' }, { from: 'me', text: 'Of course. Butterfly is looking strong!', time: '09:14' }, { from: 'them', text: 'Meet you here for the next game.', time: '09:15' }],
    kurapika: [{ from: 'them', text: 'That last team fight was incredible.', time: '08:46' }]
  }, drafts: {}, chatPage: {}, unread: new Set(['gon', 'kurapika']), attachments: {}, notificationsRead: false, signedOut: false, streamStatus: {}, busy: new Set()
};
let started = false;
let currentRoute = [];
let routeKey = '';
let toastTimer;
let menuTrigger;
const content = $('#content');

function dropdown(id, value, options, className = '') {
  const chosen = options.find(option => option.value === value) || options[0];
  return `<div class="dropdown ${className}" data-dropdown="${id}"><button class="dropdown-trigger" type="button" aria-expanded="false" aria-controls="menu-${id}" data-action="dropdown"><span>${escapeHTML(chosen.label)}</span>${icon('chevron-down')}</button><div class="dropdown-menu" id="menu-${id}" role="listbox" aria-label="${id.replaceAll('-', ' ')}" hidden>${options.map(option => `<button type="button" role="option" aria-selected="${option.value === value}" class="dropdown-option ${option.value === value ? 'selected' : ''}" data-action="select" data-select="${id}" data-value="${option.value}" ${option.disabled ? 'disabled' : ''}><span>${escapeHTML(option.label)}</span>${option.value === value ? icon('check') : ''}</button>`).join('')}</div></div>`;
}
const gameOptions = (all = true) => Object.entries(gameNames).filter(([key]) => all || ['lol', 'valorant', 'dota'].includes(key)).map(([value, label]) => ({ value, label }));
const sortOptions = [{ value: 'popular', label: 'Popular' }, { value: 'latest', label: 'Latest' }, { value: 'saved', label: 'Saved' }];
const avatar = friend => `<span class="friend-avatar ${friend.color}">${escapeHTML(friend.initials)}<span class="presence ${friend.status}" aria-label="${friend.status}"></span></span>`;
const statusBadge = match => `<span class="badge ${match.status}">${match.status === 'live' ? 'Live' : match.status === 'finished' ? 'Final' : match.time}</span>`;
const empty = (title, text, action = '') => `<div class="empty-state">${icon('search-off')}<h3>${title}</h3><p>${text}</p>${action}</div>`;
const heading = (title, subtitle, actions = '') => `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
function tabs(items, selected, action, className = '') {
  return `<div class="tabs ${className}" role="group" aria-label="View">${items.map(([key, label]) => `<button type="button" class="tab ${selected === key ? 'active' : ''}" data-action="${action}" data-value="${key}" aria-pressed="${selected === key}">${label}</button>`).join('')}</div>`;
}
function pager(total, page, size, key) {
  const pages = Math.max(1, Math.ceil(total / size));
  return `<div class="pagination"><span>${total ? `${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}` : '0 results'}</span><div>${btn(icon('chevron-left'), 'page', `data-key="${key}" data-value="${page - 1}" aria-label="Previous page" ${page <= 1 ? 'disabled' : ''}`, 'icon-button')}<span>${page} / ${pages}</span>${btn(icon('chevron-right'), 'page', `data-key="${key}" data-value="${page + 1}" aria-label="Next page" ${page >= pages ? 'disabled' : ''}`, 'icon-button')}</div></div>`;
}
function newsCard(article) {
  return `<a class="news-card" href="#article/${article.id}">${image(article.img, article.title)}<div class="news-copy"><h3>${article.title}</h3><p>Vektora Gaming</p></div></a>`;
}
function matchCard(match) {
  return `<article class="match-card"><div class="match-card-top"><span>${match.league}</span>${statusBadge(match)}</div><a class="match-teams" href="#match/${match.id}"><span>${teamLogo(teams[match.a])}<strong>${teams[match.a].name}</strong></span><span class="score">${match.score ? `${match.score[0]} <em>:</em> ${match.score[1]}` : '<em>VS</em>'}</span><span>${teamLogo(teams[match.b])}<strong>${teams[match.b].name}</strong></span></a><div class="match-card-bottom"><span>${formatDate(match.date)} · ${gameNames[match.game]}</span>${match.status === 'upcoming' ? btn(icon(state.reminders.has(match.id) ? 'bell-check' : 'bell-plus'), 'reminder', `data-id="${match.id}" aria-label="${state.reminders.has(match.id) ? 'Remove' : 'Add'} reminder for ${teams[match.a].name} versus ${teams[match.b].name}" aria-pressed="${state.reminders.has(match.id)}"`, `icon-button ${state.reminders.has(match.id) ? 'selected' : ''}`) : `<a class="text-link" href="#match/${match.id}">${match.status === 'live' ? 'Watch' : 'View result'} ${icon('arrow-up-right')}</a>`}</div></article>`;
}
function renderHome() {
  const live = matches.find(match => match.game === state.game && match.status === 'live') || matches.find(match => match.game === state.game);
  const next = matches.filter(match => match.date === dateAt(state.nextDay === 'today' ? 0 : 1) && match.status === 'upcoming');
  let articles = [...news.slice(0, 3)];
  if (state.newsSort === 'latest') articles.reverse();
  if (state.newsSort === 'saved') articles = news.filter(article => state.bookmarks.has(article.id)).slice(0, 3);
  const orderedStreams = state.streamSort === 'latest' ? [...streams].reverse() : streams;
  return `<div class="home-grid"><section class="home-main"><div class="hero"><div class="hero-background" aria-hidden="true"></div>${image('jinx-hero.png', 'Jinx, the Loose Cannon', 'hero-character')}<div class="hero-copy"><div class="riot-wordmark"><span class="riot-fist" aria-hidden="true">${icon('hand-grab')}</span><span>RIOT<small>GAMES</small></span></div><h1>Butterfly VS Peacock – ESL Pro League Season 16 – Playoffs</h1><p>League Of Legends <span>·</span> <span class="country-flag" aria-label="Indonesia"></span> Indonesia</p><a class="button button-white" href="#match/butterfly-peacock">Watch</a></div></div><section class="news-section"><div class="section-heading"><h2>News</h2>${dropdown('news-sort', state.newsSort, sortOptions)}</div><div class="news-grid">${articles.length ? articles.map(newsCard).join('') : empty('Your reading list is empty', 'Save a story to find it here.', '<a class="text-link" href="#trending">Explore news</a>')}</div></section><section class="streaming-section"><div class="section-heading"><a class="section-title" href="#trending/streams"><h2>Streaming</h2></a>${dropdown('stream-sort', state.streamSort, sortOptions.slice(0, 2))}</div><div class="stream-strip">${orderedStreams.slice(0, 2).map(stream => `<a href="#watch/${stream.id}" class="mini-stream">${image(stream.img, '')}<span><strong>${stream.user}</strong><small>${stream.viewers} watching</small></span>${icon('player-play')}</a>`).join('')}</div></section></section><aside class="home-aside">${dropdown('home-game', state.game, gameOptions(false), 'game-dropdown')}<section class="live-panel"><div class="live-heading"><div><h2>${gameNames[state.game]}</h2><p>${live?.round || 'Championship'}</p></div>${live ? statusBadge(live) : ''}</div>${live ? `<a class="live-scoreboard" href="#match/${live.id}"><span>${teamLogo(teams[live.a])}<strong>${teams[live.a].name}</strong></span><span class="score">${live.score ? `${live.score[0]} <em>:</em> <span class="losing-score">${live.score[1]}</span>` : '<em>VS</em>'}</span><span>${teamLogo(teams[live.b])}<strong>${teams[live.b].name}</strong></span></a><div class="live-actions"><a class="button" href="#match/${live.id}">${live.status === 'upcoming' ? 'Details' : 'Watch'}</a><a class="button button-soft" href="#match/${live.id}/predictions">Bet</a></div>` : ''}<div class="next-heading"><h2>Next match</h2>${dropdown('next-day', state.nextDay, [{ value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow' }], 'plain-dropdown')}</div><div class="next-matches">${next.length ? next.slice(0, 4).map(match => `<a href="#match/${match.id}" class="next-match"><time>${match.time}</time><span class="match-dot">·</span><span>${teams[match.a].name}</span><small>vs</small><span>${teams[match.b].name}</span></a>`).join('') : '<p class="no-matches">No more matches today.</p>'}</div></section><section class="league-panel"><div class="section-heading"><h2>ESL Pro League</h2><a href="#league" class="icon-button" aria-label="League standings">${icon('dots')}</a></div>${[['deer', 29], ['butterfly', 26]].map(([id, points]) => `<a class="league-row" href="#league">${teamLogo(teams[id])}<span><strong>${teams[id].name}</strong><small>${teams[id].country}</small></span><b>${points}</b></a>`).join('')}</section></aside></div>`;
}
function renderTrending() {
  const isStreams = state.trendTab === 'streams';
  let list = isStreams ? streams : [...news];
  if (state.trendTab === 'saved') list = news.filter(article => state.bookmarks.has(article.id));
  if (state.trendGame !== 'all') list = list.filter(item => item.game === state.trendGame);
  if (!isStreams && state.newsSort === 'latest') list.reverse();
  const size = 6;
  state.trendPage = Math.min(state.trendPage, Math.max(1, Math.ceil(list.length / size)));
  return `<div class="page-layout">${heading('Trending', 'The stories, streams, and plays everyone is talking about.', dropdown('trend-game', state.trendGame, gameOptions()))}<div class="filter-row">${tabs([['all', 'For you'], ['streams', 'Live streams'], ['saved', 'Saved stories']], state.trendTab, 'trend-tab')}${!isStreams ? dropdown('news-sort', state.newsSort, sortOptions.slice(0, 2), 'plain-dropdown') : '<span class="muted">Browse channels</span>'}</div><div class="browse-grid">${list.length ? list.slice((state.trendPage - 1) * size, state.trendPage * size).map(item => isStreams ? `<a class="stream-card" href="#watch/${item.id}"><div class="stream-image">${image(item.img, item.title)}<span class="badge live">Live</span><span class="viewers">${icon('eye')} ${item.viewers}</span><span class="play-circle">${icon('player-play')}</span></div><h3>${item.title}</h3><p>${item.user} <span>· ${gameNames[item.game]}</span></p></a>` : `<article class="story-card"><a href="#article/${item.id}">${image(item.img, item.title)}<span class="story-category">${item.category}</span><h3>${item.title}</h3><p>${item.intro}</p></a><div class="story-footer"><span>Vektora Gaming · ${item.read}</span>${btn(bookmarkIcon(state.bookmarks.has(item.id)), 'bookmark', `data-id="${item.id}" aria-label="${state.bookmarks.has(item.id) ? 'Unsave' : 'Save'} ${item.title}" aria-pressed="${state.bookmarks.has(item.id)}"`, `icon-button ${state.bookmarks.has(item.id) ? 'selected' : ''}`)}</div></article>`).join('') : empty(state.trendTab === 'saved' ? 'Nothing saved yet' : 'No stories here yet', state.trendTab === 'saved' ? 'Save the stories you want to come back to.' : 'Choose another game to discover more.', btn('Explore all games', 'reset-trending'))}</div>${pager(list.length, state.trendPage, size, 'trendPage')}</div>`;
}
function renderMatches() {
  let list = matches.filter(match => (state.matchGame === 'all' || match.game === state.matchGame) && (state.matchFilter === 'all' || (state.matchFilter === 'saved' ? state.reminders.has(match.id) : match.status === state.matchFilter)));
  if (state.matchFilter === 'finished') list = list.toReversed();
  state.matchPage = Math.min(state.matchPage, Math.max(1, Math.ceil(list.length / 6)));
  return `<div class="page-layout">${heading('Match center', 'Your front-row seat to the games that matter.', dropdown('match-game', state.matchGame, gameOptions()))}<div class="filter-row">${tabs([['all', 'All matches'], ['live', 'Live'], ['upcoming', 'Upcoming'], ['finished', 'Results'], ['saved', 'Following']], state.matchFilter, 'match-tab')}<span class="muted">${list.length} matches</span></div><div class="matches-grid">${list.length ? list.slice((state.matchPage - 1) * 6, state.matchPage * 6).map(matchCard).join('') : empty('No matches found', 'Try another game or follow an upcoming match.', btn('Show all matches', 'reset-matches'))}</div>${pager(list.length, state.matchPage, 6, 'matchPage')}</div>`;
}
function renderMatch(id, tab = 'overview') {
  const match = matches.find(item => item.id === id);
  if (!match) return empty('Match not found', 'Browse the match center to find your next series.', '<a class="button" href="#matches">Find a match</a>');
  const picked = state.picks[id];
  const rosterA = ['Raze', 'Nero', 'Akira', 'Jelly', 'Crown'];
  const rosterB = ['Sky', 'Nox', 'Luna', 'Fable', 'Echo'];
  return `<div class="page-layout detail-layout"><a class="back-link" href="#matches">${icon('arrow-left')} Match center</a><div class="page-heading match-detail-heading"><div><p>${gameNames[match.game]} <span>·</span> ${match.league}</p><h1>${teams[match.a].name} <span class="muted">vs</span> ${teams[match.b].name}</h1></div>${statusBadge(match)}</div><div class="detail-score-bar"><span>${teamLogo(teams[match.a])}<strong>${teams[match.a].name}</strong></span><b>${match.score ? `${match.score[0]} <em>:</em> ${match.score[1]}` : 'VS'}</b><span><strong>${teams[match.b].name}</strong>${teamLogo(teams[match.b])}</span><p>${formatDate(match.date)} · ${match.time} WIB<br>${match.round}</p>${btn(icon(state.reminders.has(id) ? 'bell-check' : 'bell-plus') + ' ' + (state.reminders.has(id) ? 'Following' : 'Follow match'), 'reminder', `data-id="${id}" ${match.status === 'finished' ? 'disabled' : ''}`, 'button button-soft')}</div><div class="filter-row">${tabs([['overview', 'Overview'], ['lineups', 'Lineups'], ['predictions', 'Predictions']], tab, 'match-detail-tab')}<span class="muted">Jakarta, Indonesia</span></div>${tab === 'predictions' ? `<div class="prediction-layout"><section class="prediction-panel"><span class="eyebrow">MAKE YOUR PICK</span><h2>Who takes the series?</h2><p>Pick the team you are cheering for.</p><form id="prediction-form" data-id="${id}"><div class="prediction-options">${[match.a, match.b].map(team => `<label class="prediction-choice"><input type="radio" name="team" value="${team}" ${picked === team ? 'checked' : ''} ${match.status === 'finished' ? 'disabled' : ''}>${teamLogo(teams[team])}<strong>${teams[team].name}</strong><span class="choice-check">${icon('check')}</span></label>`).join('')}</div><div class="prediction-footer"><span id="prediction-status" role="status">${picked ? `Your pick: ${teams[picked].name}` : match.status === 'finished' ? 'Predictions are closed for this match.' : 'No entry fee. Just team spirit.'}</span><button class="button" type="submit" ${match.status === 'finished' ? 'disabled' : ''}>${picked ? 'Update pick' : 'Save pick'}</button></div></form></section><aside class="prediction-info">${icon('trophy')}<h3>A series to remember</h3><p>${teams[match.a].name} and ${teams[match.b].name} go head-to-head in the ${match.league}.</p><dl><div><dt>Format</dt><dd>${match.round.split(' · ')[1]}</dd></div><div><dt>Game</dt><dd>${gameNames[match.game]}</dd></div><div><dt>Region</dt><dd>Southeast Asia</dd></div></dl></aside></div>` : tab === 'lineups' ? `<div class="lineups-grid">${[match.a, match.b].map((team, index) => `<section class="lineup-panel"><h2>${teamLogo(teams[team])}${teams[team].name}</h2>${(index ? rosterB : rosterA).map((name, playerIndex) => `<div class="player-row"><span class="player-number">${String(playerIndex + 1).padStart(2, '0')}</span><span class="player-avatar">${name[0]}</span><strong>${name}</strong><span>${['Top', 'Jungle', 'Mid', 'Bot', 'Support'][playerIndex]}</span></div>`).join('')}</section>`).join('')}</div>` : `<div class="watch-layout">${broadcastPanel(id, `${teams[match.a].name} vs ${teams[match.b].name}`, 'lol-talk.jpg', match.status)}<aside class="match-info"><h2>Series overview</h2><p>${match.round}</p><div class="game-results">${[1, 2, 3].map(number => `<div><span>Game ${number}</span><strong>${match.score && number <= match.score[0] + match.score[1] ? teams[number <= match.score[0] ? match.a : match.b].name : match.status === 'live' && number === 3 ? 'In progress' : 'Not started'}</strong>${icon(match.score && number <= match.score[0] + match.score[1] ? 'check' : 'clock')}</div>`).join('')}</div><a class="button button-soft" href="#match/${id}/predictions">${picked ? 'View your pick' : 'Make your pick'}</a><a class="text-link" href="#schedule">Full schedule ${icon('arrow-right')}</a></aside></div>`}</div>`;
}
function broadcastPanel(id, title, poster, status = 'live') {
  const streamState = state.streamStatus[id] || 'idle';
  return `<section class="broadcast-panel"><div class="broadcast-poster">${image(poster, title)}<div class="broadcast-shade"></div><span class="badge ${status === 'live' ? 'live' : 'upcoming'}">${status === 'live' ? 'Live coverage' : status === 'finished' ? 'Match replay' : 'Coming up'}</span><div class="broadcast-state" role="status">${streamState === 'loading' ? `${icon('loader-2')}<h3>Connecting to broadcast</h3><p>Finding the channel…</p>` : streamState === 'error' ? `${icon('wifi-off')}<h3>Broadcast unavailable</h3><p>A streaming provider is not connected.</p>${btn('Try again', 'connect-stream', `data-id="${id}"`, 'button button-white')}` : `${btn(icon('player-play'), 'connect-stream', `data-id="${id}" aria-label="Play broadcast"`, 'broadcast-play')}<h3>${title}</h3><p>${status === 'upcoming' ? 'The broadcast opens when the match begins.' : 'Watch with your favorite community.'}</p>`}</div></div><div class="broadcast-footer"><strong>${title}</strong><span>${icon('broadcast')} ${status === 'upcoming' ? 'Scheduled' : 'ESL Pro League'}</span></div></section>`;
}
function friendCard(friend, isRequest) {
  return `<article class="friend-card"><div class="friend-card-head">${avatar(friend)}<span class="presence-label ${friend.status}">${friend.status === 'online' ? 'Online' : friend.status === 'away' ? 'Away' : 'Offline'}</span></div><h3>${escapeHTML(friend.name)}</h3><p class="friend-tag">${escapeHTML(friend.tag)}</p><div class="friend-activity">${icon(friend.status === 'online' ? 'device-gamepad-2' : 'clock')}<span>${escapeHTML(friend.activity)}</span></div><div class="friend-rank">${icon('diamond')} ${escapeHTML(friend.rank)}</div><div class="friend-actions">${isRequest ? `${btn('Accept', 'accept-friend', `data-id="${friend.id}"`)}${btn('Decline', 'decline-friend', `data-id="${friend.id}"`, 'button button-soft')}` : `<a class="button button-soft" href="#messages/${friend.id}">${icon('message-circle')} Message</a>${btn(icon(state.invites.has(friend.id) ? 'check' : 'user-plus'), 'invite', `data-id="${friend.id}" aria-label="${state.invites.has(friend.id) ? 'Invite pending connection' : `Invite ${escapeHTML(friend.name)}`}" ${friend.status !== 'online' || state.invites.has(friend.id) ? 'disabled' : ''}`, 'icon-button invite-button')}`}</div></article>`;
}
function renderFriends() {
  const isRequests = state.friendsFilter === 'requests';
  let list = isRequests ? state.requests : state.friends;
  if (state.friendsFilter === 'online') list = list.filter(friend => friend.status === 'online');
  list = list.filter(friend => `${friend.name} ${friend.tag}`.toLowerCase().includes(state.friendQuery.toLowerCase()));
  const size = state.addFriendOpen ? 3 : 6;
  state.friendPage = Math.min(state.friendPage, Math.max(1, Math.ceil(list.length / size)));
  return `<div class="page-layout friends-layout">${heading('Friends', 'Good games are even better together.', btn(icon('user-plus') + ' Add friend', 'toggle-add-friend', `aria-expanded="${state.addFriendOpen}"`))}${state.addFriendOpen ? `<form class="add-friend-form" id="add-friend-form"><label for="player-tag">Player tag</label><input id="player-tag" name="player" placeholder="Player name#000" maxlength="40" autocomplete="off"><button type="submit" class="button">Find player</button><span class="form-message" id="friend-feedback" role="status"></span>${btn(icon('x'), 'toggle-add-friend', 'aria-label="Close add friend"', 'icon-button')}</form>` : ''}<div class="filter-row">${tabs([['all', `All friends <small>${state.friends.length}</small>`], ['online', 'Online'], ['requests', `Requests <small>${state.requests.length}</small>`]], state.friendsFilter, 'friend-tab')}<div class="local-search">${icon('search')}<input type="search" id="friend-search" placeholder="Find a friend" value="${escapeHTML(state.friendQuery)}" aria-label="Find a friend" maxlength="60"></div></div><div class="friends-grid">${list.length ? list.slice((state.friendPage - 1) * size, state.friendPage * size).map(friend => friendCard(friend, isRequests)).join('') : empty(isRequests ? 'You are all caught up' : 'No friends found', isRequests ? 'New friend requests will appear here.' : 'Try another name or add a friend.', btn('Show all friends', 'reset-friends'))}</div>${pager(list.length, state.friendPage, size, 'friendPage')}</div>`;
}
function renderSchedule() {
  const month = state.calendarMonth;
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const agenda = matches.filter(match => match.date === state.selectedDate);
  state.agendaPage = Math.min(state.agendaPage, Math.max(1, Math.ceil(agenda.length / 3)));
  return `<div class="page-layout">${heading('Schedule', 'Make time for your favorite teams.', `<a class="button button-soft" href="#reminders">${icon('bell')} Following <span>${state.reminders.size}</span></a>${btn(icon('download') + ' Export', 'export-calendar')}`)}<div class="schedule-layout"><section class="calendar-panel"><div class="calendar-toolbar"><h2>${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><div>${btn('Today', 'calendar-today', '', 'button button-soft button-small')}${btn(icon('chevron-left'), 'calendar-month', 'data-value="-1" aria-label="Previous month"', 'icon-button')}${btn(icon('chevron-right'), 'calendar-month', 'data-value="1" aria-label="Next month"', 'icon-button')}</div></div><div class="calendar-weekdays">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `<span>${day}</span>`).join('')}</div><div class="calendar-grid" style="--weeks:${cells / 7}">${Array.from({ length: cells }, (_, index) => {
    const day = new Date(month.getFullYear(), month.getMonth(), index - startOffset + 1);
    const key = dateKey(day);
    const dayMatches = matches.filter(match => match.date === key);
    return `<button type="button" class="calendar-day ${day.getMonth() !== month.getMonth() ? 'other-month' : ''} ${key === dateKey(today) ? 'today' : ''} ${key === state.selectedDate ? 'selected' : ''}" data-action="calendar-day" data-date="${key}" aria-label="${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${dayMatches.length} matches" aria-pressed="${key === state.selectedDate}"><span>${day.getDate()}</span>${dayMatches.length ? `<small>${dayMatches.length} match${dayMatches.length > 1 ? 'es' : ''}</small><b class="calendar-dot"></b>` : ''}</button>`;
  }).join('')}</div><div class="calendar-legend"><span><b></b> Match day</span><span>All times in WIB · UTC+7</span></div></section><aside class="agenda-panel"><div class="section-heading"><h2>${state.selectedDate === dateKey(today) ? 'Today' : formatDate(state.selectedDate)}</h2><span class="muted">${agenda.length} matches</span></div><p class="agenda-date">${new Date(`${state.selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><div class="agenda-items">${agenda.length ? agenda.slice((state.agendaPage - 1) * 3, state.agendaPage * 3).map(match => `<article class="agenda-item"><div><span>${match.time} WIB</span>${statusBadge(match)}</div><a href="#match/${match.id}"><h3>${teams[match.a].name}<span>vs</span>${teams[match.b].name}</h3><p>${match.league}</p></a>${btn(icon(state.reminders.has(match.id) ? 'bell-check' : 'bell-plus') + ' ' + (state.reminders.has(match.id) ? 'Following' : 'Remind me'), 'reminder', `data-id="${match.id}" ${match.status === 'finished' ? 'disabled' : ''}`, 'button button-soft button-small')}</article>`).join('') : empty('A little downtime', 'There are no matches on this day.', btn('Go to today', 'calendar-today', '', 'button button-soft'))}</div>${pager(agenda.length, state.agendaPage, 3, 'agendaPage')}</aside></div></div>`;
}
function renderReminders() {
  const list = matches.filter(match => state.reminders.has(match.id));
  state.reminderPage = Math.min(state.reminderPage, Math.max(1, Math.ceil(list.length / 5)));
  return `<div class="page-layout"><a class="back-link" href="#schedule">${icon('arrow-left')} Schedule</a>${heading('Following', 'The matches you do not want to miss.', btn(icon('download') + ' Export calendar', 'export-calendar'))}<div class="reminder-list">${list.length ? list.slice((state.reminderPage - 1) * 5, state.reminderPage * 5).map(match => `<article class="reminder-row"><time>${formatDate(match.date)}<strong>${match.time}</strong></time>${teamLogo(teams[match.a])}<a href="#match/${match.id}"><h3>${teams[match.a].name} vs ${teams[match.b].name}</h3><p>${match.league} · ${gameNames[match.game]}</p></a>${btn(icon('bell-off') + ' Unfollow', 'reminder', `data-id="${match.id}"`, 'button button-soft')}</article>`).join('') : empty('Your schedule is wide open', 'Follow a match to keep it close.', '<a class="button" href="#matches">Find a match</a>')}</div>${pager(list.length, state.reminderPage, 5, 'reminderPage')}</div>`;
}
function renderMessages(friendId) {
  const people = state.friends.filter(friend => state.chats[friend.id] || friend.id === friendId);
  const active = people.find(friend => friend.id === friendId) || people[0];
  if (state.signedOut) return accountGate();
  if (!active) return empty('Your inbox is quiet', 'Start a conversation with a friend.', '<a class="button" href="#friends">Find friends</a>');
  state.unread.delete(active.id);
  const visible = people.slice(Math.floor(people.indexOf(active) / 4) * 4, Math.floor(people.indexOf(active) / 4) * 4 + 4);
  const messages = state.chats[active.id] || [];
  const pages = Math.max(1, Math.ceil(messages.length / 2));
  state.chatPage[active.id] = Math.min(state.chatPage[active.id] || pages, pages);
  const draft = state.drafts[active.id] || '';
  return `<div class="page-layout messages-page">${heading('Messages', 'Stay close, in and out of the game.')}<div class="messenger"><aside class="conversation-list"><h2>Conversations <span>${people.length}</span></h2>${visible.map(friend => { const last = (state.chats[friend.id] || []).at(-1); return `<a class="conversation ${friend.id === active.id ? 'active' : ''}" href="#messages/${friend.id}">${avatar(friend)}<span><strong>${escapeHTML(friend.name)}</strong><small>${escapeHTML(last?.text || 'Start a conversation')}</small></span>${state.unread.has(friend.id) ? '<b class="unread-dot"></b>' : ''}</a>`; }).join('')}${people.length > 4 ? `<div class="conversation-pages">${people.map((friend, index) => index % 4 === 0 ? `<a href="#messages/${friend.id}" class="${visible.includes(friend) ? 'active' : ''}">${Math.floor(index / 4) + 1}</a>` : '').join('')}</div>` : ''}<a class="text-link new-conversation" href="#friends">${icon('plus')} New conversation</a></aside><section class="chat-panel"><header class="chat-heading">${avatar(active)}<div><h2>${escapeHTML(active.name)}</h2><p>${escapeHTML(active.activity)}</p></div><a class="icon-button" href="#friends" aria-label="View friends">${icon('users')}</a></header><div class="chat-history" id="chat-history" aria-label="Conversation with ${escapeHTML(active.name)}"><span class="chat-day">Today</span>${messages.length ? messages.slice((state.chatPage[active.id] - 1) * 2, state.chatPage[active.id] * 2).map((message, index) => `<div class="chat-message ${message.from === 'me' ? 'outgoing' : 'incoming'}"><p>${escapeHTML(message.text.length > 80 ? `${message.text.slice(0, 60)}…` : message.text)}</p>${message.text.length > 80 ? `<a class="message-expand" href="#message/${active.id}/${(state.chatPage[active.id] - 1) * 2 + index}/1">Read full message ${icon('arrow-up-right')}</a>` : ''}${message.file ? `<a class="chat-attachment" href="#message/${active.id}/${(state.chatPage[active.id] - 1) * 2 + index}/1">${icon('file-text')}<span>${escapeHTML(message.file)}</span></a>` : ''}<small>${message.time}${message.pending ? ' · Pending connection' : ''}</small></div>`).join('') : '<p class="chat-empty">Say hello to start the conversation.</p>'}</div><div class="chat-pagination">${pager(messages.length, state.chatPage[active.id], 2, 'chatHistoryPage')}</div><div class="chat-connection">${icon('wifi-off')} Messages will be delivered when the connection is restored.</div><form class="chat-composer" id="chat-form" data-id="${active.id}"><label class="icon-button attachment-button" aria-label="Attach a file">${icon('paperclip')}<input type="file" id="chat-file" accept=".txt,.pdf" aria-label="Attach a text or PDF file"></label><textarea id="chat-input" name="message" placeholder="Write a message . . ." aria-label="Message" rows="1" maxlength="1000">${escapeHTML(draft)}</textarea><button class="send-button" type="submit" aria-label="Send message" ${!draft.trim() && !state.attachments[active.id] ? 'disabled' : ''}>${icon('send')}</button><span class="chat-file-name" id="chat-file-name">${state.attachments[active.id] ? escapeHTML(state.attachments[active.id]) : ''}</span></form></section></div></div>`;
}
function renderMessage(id, index, pageNumber = 1) {
  const message = state.chats[id]?.[Number(index)];
  const friend = state.friends.find(person => person.id === id);
  if (!message || !friend) return empty('Message not found', 'Return to your conversation.', '<a class="button" href="#messages">Messages</a>');
  const characters = Array.from(message.text);
  const pages = Math.max(1, Math.ceil(characters.length / 600));
  const page = Math.max(1, Math.min(Number(pageNumber) || 1, pages));
  return `<div class="page-layout"><a class="back-link" href="#messages/${id}">${icon('arrow-left')} Conversation with ${escapeHTML(friend.name)}</a>${heading(message.from === 'me' ? 'Your message' : `Message from ${escapeHTML(friend.name)}`, `${message.time}${message.pending ? ' · Pending connection' : ''}`)}<article class="message-detail-card"><p class="message-detail-text">${escapeHTML(characters.slice((page - 1) * 600, page * 600).join(''))}</p>${message.file ? `<div class="message-detail-file">${icon('file-text')} ${escapeHTML(message.file)}</div>` : ''}</article><div class="pagination"><span>${pages > 1 ? `Part ${page} of ${pages}` : 'Full message'}</span><div><a class="icon-button ${page <= 1 ? 'inactive' : ''}" href="#message/${id}/${index}/${Math.max(1, page - 1)}" aria-label="Previous part" aria-disabled="${page <= 1}">${icon('chevron-left')}</a><span>${page} / ${pages}</span><a class="icon-button ${page >= pages ? 'inactive' : ''}" href="#message/${id}/${index}/${Math.min(pages, page + 1)}" aria-label="Next part" aria-disabled="${page >= pages}">${icon('chevron-right')}</a></div></div></div>`;
}
function renderSettings(section) {
  const tab = ['profile', 'notifications', 'preferences', 'account'].includes(section) ? section : state.settingsTab;
  state.settingsTab = tab;
  return `<div class="page-layout">${heading('Settings', 'Make Hoxye feel like home.')}<div class="settings-layout"><nav class="settings-nav" aria-label="Settings sections">${[['profile', 'user', 'My profile'], ['notifications', 'bell', 'Notifications'], ['preferences', 'adjustments', 'Preferences'], ['account', 'shield-lock', 'Account']].map(([id, symbol, label]) => `<a href="#settings/${id}" class="${tab === id ? 'active' : ''}">${icon(symbol)}${label}${icon('chevron-right')}</a>`).join('')}</nav><section class="settings-panel">${tab === 'profile' ? `<form id="profile-form" novalidate><div class="profile-heading"><span class="portrait"></span><div><h2>Your profile</h2><p>This is how your friends see you.</p></div></div><div class="form-grid"><label>Display name<input name="name" type="text" value="${escapeHTML(state.profile.name)}" maxlength="24" required autocomplete="nickname"></label><label>Email address<input name="email" type="email" value="${escapeHTML(state.profile.email)}" maxlength="100" required autocomplete="email"></label><label>Region${dropdown('profile-region', state.profile.region, ['Indonesia', 'Singapore', 'Malaysia', 'Philippines'].map(value => ({ value, label: value })))}</label><label>Favorite game${dropdown('profile-game', state.profile.favorite, gameOptions(false))}</label><label class="full-width">Bio<textarea name="bio" rows="2" maxlength="120">${escapeHTML(state.profile.bio)}</textarea></label></div><div class="form-footer"><span class="form-message" id="profile-feedback" role="status"></span><button class="button" type="submit">Save changes</button></div></form>` : tab === 'notifications' ? `<h2>Your notifications</h2><p class="settings-description">Keep up with the things that matter to you.</p>${settingSwitch('matchAlerts', 'Match reminders', 'Alerts for the matches you follow.')}${settingSwitch('friendAlerts', 'Friend activity', 'Invites and new friend requests.')}${settingSwitch('messageAlerts', 'Messages', 'A heads-up when friends send a message.')}<a class="text-link" href="#notifications">View notification center ${icon('arrow-right')}</a>` : tab === 'preferences' ? `<h2>Your experience</h2><p class="settings-description">A few small things to make it yours.</p>${settingSwitch('reducedMotion', 'Reduce motion', 'Keep transitions calm and minimal.')}<div class="setting-row"><span><strong>Time zone</strong><small>Match times are shown in your region.</small></span><span class="setting-value">WIB · UTC+7</span></div><div class="setting-row"><span><strong>Language</strong><small>Hoxye interface language.</small></span><span class="setting-value">English</span></div><div class="preference-note">${icon('device-desktop')} A little space for every game.</div>` : `<h2>Your account</h2><p class="settings-description">Stay in control of your session.</p><div class="setting-row"><span><strong>Account</strong><small>${escapeHTML(state.profile.email)}</small></span><span class="badge ${state.signedOut ? 'finished' : 'online'}">${state.signedOut ? 'Guest' : 'Active'}</span></div><div class="setting-row"><span><strong>Streaming connection</strong><small>A provider is needed to play live broadcasts.</small></span><span class="setting-value">Not connected</span></div><div class="account-actions"><h3>End this session</h3><p>Your conversations and followed matches will be cleared from this session.</p><a class="button button-soft" href="#account">${icon('logout')} Sign out</a></div>`}</section></div></div>`;
}
function settingSwitch(key, title, description) {
  return `<div class="setting-row"><span><strong>${title}</strong><small>${description}</small></span><button type="button" class="switch ${state.preferences[key] ? 'on' : ''}" role="switch" aria-checked="${state.preferences[key]}" aria-label="${title}" data-action="preference" data-key="${key}"><span></span></button></div>`;
}
function renderArticle(id) {
  const article = news.find(item => item.id === id);
  if (!article) return empty('Story not found', 'Discover the latest from the community.', '<a class="button" href="#trending">Browse news</a>');
  return `<div class="page-layout article-page"><a class="back-link" href="#trending">${icon('arrow-left')} News & stories</a><div class="article-layout"><article class="article-content">${image(article.img, article.title, 'article-image')}<span class="story-category">${article.category} · ${gameNames[article.game]}</span><h1>${article.title}</h1><p class="article-intro">${article.intro}</p><div class="article-body">${article.body.map(text => `<p>${text}</p>`).join('')}</div></article><aside class="article-aside"><span class="publisher-logo">V</span><h2>Vektora Gaming</h2><p>Games. Stories. Community.</p><span class="article-meta">${article.date} · ${article.read}</span>${btn(bookmarkIcon(state.bookmarks.has(id)) + ' ' + (state.bookmarks.has(id) ? 'Saved story' : 'Save story'), 'bookmark', `data-id="${id}" aria-pressed="${state.bookmarks.has(id)}"`)}<h3>Keep reading</h3>${news.filter(item => item.id !== id).slice(0, 2).map(item => `<a class="related-story" href="#article/${item.id}">${image(item.img, '')}<span><strong>${item.title}</strong><small>${item.read}</small></span>${icon('arrow-up-right')}</a>`).join('')}</aside></div></div>`;
}
function renderWatch(id) {
  const stream = streams.find(item => item.id === id);
  if (!stream) return empty('Channel not found', 'Discover another live channel.', '<a class="button" href="#trending/streams">Browse streams</a>');
  return `<div class="page-layout"><a class="back-link" href="#trending/streams">${icon('arrow-left')} Live streams</a>${heading(stream.title, `${stream.user} · ${gameNames[stream.game]}`)}<div class="watch-layout channel-layout">${broadcastPanel(id, stream.title, stream.img)}<aside class="channel-panel"><span class="publisher-logo">V</span><h2>${stream.user}</h2><p>${gameNames[stream.game]}</p><div class="channel-stat">${icon('eye')} ${stream.viewers} watching</div><h3>Watch together</h3><p>Good company makes a great game.</p><a class="button button-soft" href="#friends">${icon('users')} Find your friends</a></aside></div></div>`;
}
function renderLeague() {
  return `<div class="page-layout"><a class="back-link" href="#home">${icon('arrow-left')} Home</a>${heading('ESL Pro League', 'Season 16 · Southeast Asia · Group standings', '<a class="button button-soft" href="#matches">View matches</a>')}<div class="standings-panel"><div class="standings-top"><h2>League standings</h2><span>Group stage</span></div><table class="standings-table"><thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Played</th><th scope="col">Won</th><th scope="col">Lost</th><th scope="col">Points</th></tr></thead><tbody>${[['deer', 12, 9, 3, 29], ['butterfly', 12, 8, 4, 26], ['peacock', 12, 7, 5, 23], ['aerowolf', 12, 6, 6, 20], ['evos', 12, 5, 7, 17], ['geek', 12, 4, 8, 14]].map(([id, played, won, lost, points], index) => `<tr><td>${String(index + 1).padStart(2, '0')}</td><th scope="row">${teamLogo(teams[id])}<span>${teams[id].name}<small>${teams[id].country}</small></span></th><td>${played}</td><td>${won}</td><td>${lost}</td><td><strong>${points}</strong></td></tr>`).join('')}</tbody></table><p class="standings-note">Top four teams advance to playoffs. Points include bonus points.</p></div></div>`;
}
function renderSearch() {
  const query = $('#search-input').value.trim();
  const normalized = query.toLowerCase();
  const foundMatches = query ? matches.filter(match => `${teams[match.a].name} ${teams[match.b].name} ${match.league} ${gameNames[match.game]}`.toLowerCase().includes(normalized)) : [];
  const foundNews = query ? news.filter(article => `${article.title} ${article.category} ${gameNames[article.game]}`.toLowerCase().includes(normalized)) : [];
  state.searchMatchPage = Math.min(state.searchMatchPage, Math.max(1, Math.ceil(foundMatches.length / 4)));
  state.searchNewsPage = Math.min(state.searchNewsPage, Math.max(1, Math.ceil(foundNews.length / 3)));
  return `<div class="page-layout">${heading('Search', query ? `Results for “${escapeHTML(query)}”` : 'Find your next favorite match, team, or story.', btn('Clear search', 'clear-search', '', 'button button-soft'))}${query ? `<div class="search-results"><section><h2>Matches <span>${foundMatches.length}</span></h2><div class="search-match-list">${foundMatches.length ? foundMatches.slice((state.searchMatchPage - 1) * 4, state.searchMatchPage * 4).map(match => `<a class="search-match" href="#match/${match.id}">${teamLogo(teams[match.a])}<span><strong>${teams[match.a].name} vs ${teams[match.b].name}</strong><small>${match.league} · ${formatDate(match.date)}</small></span>${statusBadge(match)}${icon('arrow-up-right')}</a>`).join('') : '<p class="search-empty">No matching teams or matches.</p>'}</div>${pager(foundMatches.length, state.searchMatchPage, 4, 'searchMatchPage')}</section><section><h2>Stories <span>${foundNews.length}</span></h2>${foundNews.length ? foundNews.slice((state.searchNewsPage - 1) * 3, state.searchNewsPage * 3).map(item => `<a class="related-story" href="#article/${item.id}">${image(item.img, '')}<span><strong>${item.title}</strong><small>${item.category} · ${item.read}</small></span>${icon('arrow-up-right')}</a>`).join('') : '<p class="search-empty">No matching stories. Try “Fates” or “League”.</p>'}${pager(foundNews.length, state.searchNewsPage, 3, 'searchNewsPage')}</section></div>` : empty('The next game is out there', 'Search a team, a game, or a league above.')}</div>`;
}
function renderNotifications() {
  const notifications = [
    { type: 'device-gamepad-2', title: 'Butterfly vs Peacock is live', text: 'ESL Pro League · Playoffs · Game 3', href: '#match/butterfly-peacock', time: 'Just now' },
    ...(state.requests.length ? [{ type: 'user-plus', title: `${state.requests[0].name} sent you a friend request`, text: 'A new face for your next game.', href: '#friends/requests', time: '12 min ago' }] : []),
    ...matches.filter(match => state.reminders.has(match.id)).map(match => ({ type: 'bell', title: `${teams[match.a].name} vs ${teams[match.b].name}`, text: `You are following this match · ${match.time} WIB`, href: `#match/${match.id}`, time: formatDate(match.date) }))
  ];
  state.notificationPage = Math.min(state.notificationPage, Math.max(1, Math.ceil(notifications.length / 5)));
  return `<div class="page-layout">${heading('Notifications', 'A little heads-up, all in one place.', btn(state.notificationsRead ? 'All caught up' : 'Mark all as read', 'read-notifications', state.notificationsRead ? 'disabled' : '', 'button button-soft'))}<div class="notification-list">${notifications.slice((state.notificationPage - 1) * 5, state.notificationPage * 5).map(item => `<a class="notification-row ${state.notificationsRead ? 'read' : ''}" href="${item.href}"><span class="notification-symbol">${icon(item.type)}</span><span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></span><time>${item.time}</time>${icon('chevron-right')}</a>`).join('')}</div>${pager(notifications.length, state.notificationPage, 5, 'notificationPage')}</div>`;
}
function accountGate() {
  return `<div class="account-page"><span class="brand-mark">G</span><h1>Keep the good games going.</h1><p>You are browsing as a guest. Start a session to connect with your friends.</p>${btn('Continue as Killua', 'start-session')}<a class="text-link" href="#home">Back to matches ${icon('arrow-right')}</a></div>`;
}
function renderAccount() {
  if (state.signedOut) return accountGate();
  return `<div class="account-page"><span class="portrait"></span><h1>Taking a break?</h1><p>End this session for ${escapeHTML(state.profile.name)}. Your conversations and followed matches will be cleared.</p><div>${btn('End session', 'end-session')}<a class="button button-soft" href="#home">Stay a little longer</a></div></div>`;
}
function render() {
  const parts = location.hash.slice(1).split('/');
  const name = parts[0] || 'home';
  currentRoute = parts;
  closeDropdowns();
  const renderers = { home: renderHome, trending: renderTrending, matches: renderMatches, friends: renderFriends, schedule: renderSchedule, messages: () => renderMessages(parts[1]), message: () => renderMessage(parts[1], parts[2], parts[3]), settings: () => renderSettings(parts[1]), match: () => renderMatch(parts[1], parts[2]), article: () => renderArticle(parts[1]), watch: () => renderWatch(parts[1]), league: renderLeague, search: renderSearch, notifications: renderNotifications, reminders: renderReminders, account: renderAccount };
  if (name === 'trending' && parts[1] === 'streams') state.trendTab = 'streams';
  if (name === 'friends' && parts[1] === 'requests') state.friendsFilter = 'requests';
  content.innerHTML = (renderers[name] || renderHome)();
  content.dataset.view = name;
  const activeRoute = ['match', 'league', 'reminders'].includes(name) ? name === 'reminders' ? 'schedule' : 'matches' : ['article', 'watch'].includes(name) ? 'trending' : name === 'message' ? 'messages' : name;
  $$('.nav-item[data-route]').forEach(item => { const selected = item.dataset.route === activeRoute; item.classList.toggle('active', selected); if (selected) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current'); });
  updateShell();
  const activeItem = $('.navigation .nav-item.active');
  const indicator = $('.nav-indicator');
  indicator.style.opacity = activeItem ? '1' : '0';
  if (activeItem) { indicator.style.top = `${activeItem.offsetTop}px`; indicator.style.height = `${activeItem.offsetHeight}px`; }
  const headingText = $('h1', content)?.textContent || name[0].toUpperCase() + name.slice(1);
  content.setAttribute('aria-label', headingText);
  document.title = `Hoxye — ${name === 'home' ? 'Home' : headingText}`;
  if (routeKey !== location.hash) { content.classList.remove('view-enter'); void content.offsetWidth; content.classList.add('view-enter'); routeKey = location.hash; }
  if ($('#chat-history')) $('#chat-history').scrollTop = $('#chat-history').scrollHeight;
}
function updateShell() {
  $('#sidebar-name').textContent = state.signedOut ? 'Guest' : state.profile.name;
  $('#notification-dot').hidden = state.notificationsRead || (!state.preferences.matchAlerts && !state.preferences.friendAlerts);
  $('#message-count').hidden = !state.unread.size || !state.preferences.messageAlerts;
  $('#message-count').textContent = state.unread.size;
  $('#app').classList.toggle('reduce-motion', state.preferences.reducedMotion);
  $('.search-clear').hidden = !$('#search-input').value;
}
function showToast(text, failed = false) {
  const toast = $('#toast');
  $('span', toast).textContent = text;
  $('i', toast).className = `ti ti-${failed ? 'alert-circle' : 'check'}`;
  toast.classList.toggle('error', failed);
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
function openDropdown(trigger) {
  closeDropdowns();
  trigger.setAttribute('aria-expanded', 'true');
  const menu = trigger.nextElementSibling;
  menu.hidden = false;
  if (menu.getBoundingClientRect().bottom > $('#app').getBoundingClientRect().bottom - 8) trigger.parentElement.classList.add('drop-up');
  menuTrigger = trigger;
}
function closeDropdowns() {
  $$('.dropdown-menu').forEach(menu => { menu.hidden = true; });
  $$('.dropdown-trigger').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  $$('.dropdown').forEach(dropdownElement => dropdownElement.classList.remove('drop-up'));
}
function preserveDraft() {
  const chat = $('#chat-form');
  if (chat) state.drafts[chat.dataset.id] = $('#chat-input').value;
}
function rerenderWithFocus(selector) {
  const previous = $(selector);
  const position = previous?.selectionStart;
  render();
  const next = $(selector);
  if (next) { next.focus(); if (typeof next.setSelectionRange === 'function' && position != null) next.setSelectionRange(position, position); }
}
function exportCalendar() {
  const followed = matches.filter(match => state.reminders.has(match.id));
  if (!followed.length) { showToast('Follow a match before exporting your calendar.', true); return; }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hoxye//Match Calendar//EN', 'CALSCALE:GREGORIAN'];
  for (const match of followed) {
    const localStart = new Date(`${match.date}T${match.time}:00+07:00`);
    const stamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
    lines.push('BEGIN:VEVENT', `UID:${match.id}@hoxye.gg`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(localStart)}`, `DTEND:${stamp(new Date(localStart.getTime() + 2 * 60 * 60 * 1000))}`, `SUMMARY:${teams[match.a].name} vs ${teams[match.b].name}`, `DESCRIPTION:${match.league} - ${gameNames[match.game]}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'hoxye-match-calendar.ics';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Match calendar downloaded.');
}
function selectValue(key, value) {
  const setters = { 'home-game': 'game', 'news-sort': 'newsSort', 'stream-sort': 'streamSort', 'next-day': 'nextDay', 'trend-game': 'trendGame', 'match-game': 'matchGame' };
  if (key === 'profile-region' || key === 'profile-game') {
    const field = key === 'profile-region' ? 'region' : 'favorite';
    const panel = $(`[data-dropdown="${key}"]`);
    panel.dataset.value = value;
    $('.dropdown-trigger span', panel).textContent = key === 'profile-game' ? gameNames[value] : value;
    $$('.dropdown-option', panel).forEach(option => { const chosen = option.dataset.value === value; option.classList.toggle('selected', chosen); option.setAttribute('aria-selected', chosen); const check = $('i', option); if (check) check.remove(); if (chosen) option.insertAdjacentHTML('beforeend', icon('check')); });
    closeDropdowns();
    $('.dropdown-trigger', panel).focus();
    return;
  }
  if (setters[key]) state[setters[key]] = value;
  if (key === 'match-game') state.matchPage = 1;
  if (key === 'trend-game') state.trendPage = 1;
  render();
  $(`[data-dropdown="${key}"] .dropdown-trigger`)?.focus();
}
async function submitProfile(form) {
  if (state.busy.has('profile')) return;
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim();
  const email = String(fields.get('email')).trim();
  const feedback = $('#profile-feedback');
  $$('input', form).forEach(input => input.removeAttribute('aria-invalid'));
  if (name.length < 2 || name.length > 24) { feedback.textContent = 'Use a display name with 2–24 characters.'; feedback.classList.add('error'); $('[name="name"]', form).setAttribute('aria-invalid', 'true'); $('[name="name"]', form).focus(); return; }
  if (!$('[name="email"]', form).validity.valid || !email) { feedback.textContent = 'Enter a valid email address.'; feedback.classList.add('error'); $('[name="email"]', form).setAttribute('aria-invalid', 'true'); $('[name="email"]', form).focus(); return; }
  const region = $('[data-dropdown="profile-region"]', form).dataset.value || state.profile.region;
  const favorite = $('[data-dropdown="profile-game"]', form).dataset.value || state.profile.favorite;
  const data = { name, email, region, favorite, bio: String(fields.get('bio')).trim() };
  const submit = $('[type="submit"]', form);
  state.busy.add('profile'); submit.disabled = true; submit.textContent = 'Saving…'; feedback.textContent = ''; feedback.classList.remove('error');
  await new Promise(resolve => setTimeout(resolve, 450));
  Object.assign(state.profile, data);
  state.busy.delete('profile'); updateShell();
  if (form.isConnected) { submit.disabled = false; submit.textContent = 'Save changes'; feedback.textContent = 'Profile updated.'; }
  showToast('Profile updated.');
}
function submitChat(form) {
  const id = form.dataset.id;
  const text = $('#chat-input').value.trim();
  const file = state.attachments[id];
  if (!text && !file) return;
  if (text.length > 1000) { showToast('Keep your message under 1,000 characters.', true); return; }
  state.chats[id] ||= [];
  state.chats[id].push({ from: 'me', text, file, pending: true, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) });
  state.drafts[id] = ''; delete state.attachments[id]; delete state.chatPage[id];
  render(); $('#chat-input')?.focus();
}
async function submitFriend(form) {
  const input = $('#player-tag');
  const feedback = $('#friend-feedback');
  const tag = input.value.trim().toLowerCase();
  const submit = $('[type="submit"]', form);
  if (!/^[\p{L}\p{N} _-]{2,24}#[\p{L}\p{N}]{2,8}$/u.test(tag)) { feedback.textContent = 'Enter a player tag, such as gon#021.'; feedback.className = 'form-message error'; input.setAttribute('aria-invalid', 'true'); return; }
  input.removeAttribute('aria-invalid'); submit.disabled = true; submit.textContent = 'Finding…'; feedback.textContent = '';
  await new Promise(resolve => setTimeout(resolve, 350));
  if (!form.isConnected) return;
  const friend = state.friends.find(item => item.tag.toLowerCase() === tag);
  const request = state.requests.find(item => item.tag.toLowerCase() === tag);
  submit.disabled = false; submit.textContent = 'Find player';
  if (friend) { feedback.textContent = `${friend.name} is already on your friends list.`; feedback.className = 'form-message'; }
  else if (request) { state.friendsFilter = 'requests'; state.addFriendOpen = false; render(); }
  else { feedback.textContent = 'Player not found. Check the tag and try again.'; feedback.className = 'form-message error'; }
}
function onClick(event) {
  const trigger = event.target.closest('[data-action]');
  if (!trigger || trigger.disabled) { if (!event.target.closest('.dropdown')) closeDropdowns(); return; }
  const action = trigger.dataset.action;
  if (action === 'dropdown') {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    closeDropdowns();
    if (!open) openDropdown(trigger);
    return;
  }
  if (action === 'select') { selectValue(trigger.dataset.select, trigger.dataset.value); return; }
  closeDropdowns();
  preserveDraft();
  const id = trigger.dataset.id;
  if (action === 'clear-search') { $('#search-input').value = ''; updateShell(); if (currentRoute[0] === 'search') render(); $('#search-input').focus(); }
  else if (action === 'trend-tab') { state.trendTab = trigger.dataset.value; state.trendPage = 1; if (currentRoute[1] === 'streams') location.hash = '#trending'; else render(); }
  else if (action === 'match-tab') { state.matchFilter = trigger.dataset.value; state.matchPage = 1; render(); }
  else if (action === 'match-detail-tab') location.hash = `#match/${currentRoute[1]}/${trigger.dataset.value}`;
  else if (action === 'friend-tab') { state.friendsFilter = trigger.dataset.value; state.friendPage = 1; if (currentRoute[1]) location.hash = '#friends'; else render(); }
  else if (action === 'page') { if (trigger.dataset.key === 'chatHistoryPage') state.chatPage[$('#chat-form').dataset.id] = Number(trigger.dataset.value); else state[trigger.dataset.key] = Number(trigger.dataset.value); render(); }
  else if (action === 'reminder') { const following = state.reminders.has(id); following ? state.reminders.delete(id) : state.reminders.add(id); render(); showToast(following ? 'Match removed from your schedule.' : 'Match added to your schedule.'); }
  else if (action === 'bookmark') { state.bookmarks.has(id) ? state.bookmarks.delete(id) : state.bookmarks.add(id); render(); showToast(state.bookmarks.has(id) ? 'Story saved to your reading list.' : 'Story removed from your reading list.'); }
  else if (action === 'reset-matches') { state.matchFilter = 'all'; state.matchGame = 'all'; state.matchPage = 1; render(); }
  else if (action === 'reset-trending') { state.trendTab = 'all'; state.trendGame = 'all'; state.trendPage = 1; render(); }
  else if (action === 'reset-friends') { state.friendsFilter = 'all'; state.friendQuery = ''; state.friendPage = 1; if (currentRoute[1]) location.hash = '#friends'; else render(); }
  else if (action === 'toggle-add-friend') { state.addFriendOpen = !state.addFriendOpen; render(); if (state.addFriendOpen) $('#player-tag').focus(); }
  else if (action === 'accept-friend' || action === 'decline-friend') { const friend = state.requests.find(item => item.id === id); if (!friend) return; state.requests = state.requests.filter(item => item.id !== id); if (action === 'accept-friend') state.friends.push(friend); render(); showToast(action === 'accept-friend' ? `${friend.name} added to your friends.` : 'Friend request declined.'); }
  else if (action === 'invite') { state.invites.add(id); render(); showToast('Invite queued. Waiting for connection.'); }
  else if (action === 'calendar-day') { state.selectedDate = trigger.dataset.date; state.agendaPage = 1; render(); }
  else if (action === 'calendar-month') { state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + Number(trigger.dataset.value), 1); state.selectedDate = dateKey(state.calendarMonth); state.agendaPage = 1; render(); }
  else if (action === 'calendar-today') { state.calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1); state.selectedDate = dateKey(today); state.agendaPage = 1; render(); }
  else if (action === 'export-calendar') exportCalendar();
  else if (action === 'preference') { const key = trigger.dataset.key; state.preferences[key] = !state.preferences[key]; trigger.classList.toggle('on', state.preferences[key]); trigger.setAttribute('aria-checked', state.preferences[key]); updateShell(); showToast(`${trigger.getAttribute('aria-label')} ${state.preferences[key] ? 'on' : 'off'}.`); }
  else if (action === 'read-notifications') { state.notificationsRead = true; render(); }
  else if (action === 'connect-stream') { if (state.streamStatus[id] === 'loading') return; state.streamStatus[id] = 'loading'; render(); setTimeout(() => { state.streamStatus[id] = 'error'; if ((currentRoute[0] === 'match' || currentRoute[0] === 'watch') && currentRoute[1] === id) render(); }, 650); }
  else if (action === 'end-session') { state.signedOut = true; state.chats = {}; state.drafts = {}; state.chatPage = {}; state.attachments = {}; state.unread.clear(); state.reminders.clear(); state.picks = {}; state.bookmarks.clear(); state.invites.clear(); render(); updateShell(); }
  else if (action === 'start-session') { state.signedOut = false; location.hash = '#home'; }
}
function onSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'global-search') { preserveDraft(); if (currentRoute[0] !== 'search') location.hash = '#search'; else render(); }
  else if (form.id === 'profile-form') submitProfile(form);
  else if (form.id === 'chat-form') submitChat(form);
  else if (form.id === 'add-friend-form') submitFriend(form);
  else if (form.id === 'prediction-form') {
    const team = new FormData(form).get('team');
    const match = matches.find(item => item.id === form.dataset.id);
    if (!match || match.status === 'finished') return;
    if (![match.a, match.b].includes(team)) { $('#prediction-status').textContent = 'Choose a team to save your pick.'; $('#prediction-status').classList.add('error'); return; }
    state.picks[match.id] = team; render(); showToast(`Your pick: ${teams[team].name}.`);
  }
}
function onInput(event) {
  if (event.target.id === 'search-input') { state.searchMatchPage = 1; state.searchNewsPage = 1; updateShell(); if (currentRoute[0] === 'search') render(); }
  if (event.target.id === 'friend-search') { state.friendQuery = event.target.value; state.friendPage = 1; rerenderWithFocus('#friend-search'); }
  if (event.target.id === 'chat-input') { const id = $('#chat-form').dataset.id; state.drafts[id] = event.target.value; $('.send-button').disabled = !event.target.value.trim() && !state.attachments[id]; }
}
function onKeydown(event) {
  if (event.key === 'Escape') { const menu = $('.dropdown-menu:not([hidden])'); closeDropdowns(); if (menu) menuTrigger?.focus(); $('#toast').classList.remove('visible'); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search-input').focus(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && $('#profile-form')) { event.preventDefault(); $('#profile-form').requestSubmit(); }
  if (event.target.id === 'chat-input' && event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); $('#chat-form').requestSubmit(); }
  if (event.target.closest('.dropdown') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault(); const dropdownElement = event.target.closest('.dropdown'); const trigger = $('.dropdown-trigger', dropdownElement); const menu = $('.dropdown-menu', dropdownElement);
    if (menu.hidden) openDropdown(trigger);
    const options = $$('.dropdown-option:not(:disabled)', menu); const index = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : index < 0 ? event.key === 'ArrowDown' ? 0 : options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options[next]?.focus();
  }
}
function start() {
  if (started) return;
  started = true;
  const filledNavigation = {
    trending: '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="m7 15 4-5 3 3 3-5" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    matches: '<path d="M7 5h10c3 0 4 2 5 9 .6 4-1 6-3 6-1.8 0-3-3-4-4H9c-1 1-2.2 4-4 4-2 0-3.6-2-3-6C3 7 4 5 7 5z"/><path d="M7 8v6M4 11h6" fill="none" stroke="white" stroke-width="1.5"/><circle cx="16" cy="10" r="1" fill="white"/><circle cx="19" cy="12" r="1" fill="white"/>',
    friends: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-4a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v4z"/><circle cx="18" cy="8" r="3"/><path d="M18 13a4 4 0 0 1 4 4v4h-4v-4a8 8 0 0 0-1-4z"/>',
    schedule: '<path d="M5 3h14a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M3 9h18M8 2v4M16 2v4" fill="none" stroke="white" stroke-width="1.5"/><path d="M7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 16h2v2H7zm4 0h2v2h-2z" fill="white"/>',
    messages: '<path d="M12 2C6 2 2 6 2 11c0 2.3.8 4.4 2.3 6L3 22l5-1.3c1.3.6 2.6.8 4 .8 6 0 10-4.1 10-10.5S18 2 12 2z"/><circle cx="7" cy="11" r="1" fill="white"/><circle cx="12" cy="11" r="1" fill="white"/><circle cx="17" cy="11" r="1" fill="white"/>',
    settings: '<path d="m10 2 4 0 1 3 3-1 3 3-1 3 3 1v4l-3 1 1 3-3 3-3-1-1 3h-4l-1-3-3 1-3-3 1-3-3-1v-4l3-1-1-3 3-3 3 1z" transform="translate(0 -1) scale(.95)"/><circle cx="12" cy="12" r="3.5" fill="white"/>'
  };
  for (const [route, paths] of Object.entries(filledNavigation)) $(`[data-route="${route}"]`).insertAdjacentHTML('afterbegin', `<svg class="active-icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`);
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('change', event => {
    if (event.target.id !== 'chat-file') return;
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !/\.(txt|pdf)$/i.test(file.name)) { showToast('Choose a text or PDF file under 5 MB.', true); event.target.value = ''; return; }
    const id = $('#chat-form').dataset.id; state.attachments[id] = file.name; $('#chat-file-name').textContent = file.name; $('.send-button').disabled = false;
  });
  window.addEventListener('hashchange', () => { preserveDraft(); render(); content.focus({ preventScroll: true }); });
  const observer = new ResizeObserver(() => { const active = $('.navigation .nav-item.active'); if (active) { $('.nav-indicator').style.top = `${active.offsetTop}px`; $('.nav-indicator').style.height = `${active.offsetHeight}px`; } });
  observer.observe($('#app'));
  render();
  $('.hero')?.classList.add('first-enter');
}
start();
