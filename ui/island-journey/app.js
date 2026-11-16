const $ = selector => document.querySelector(selector);
const icon = (name, filled = false) => `<svg class="icon${filled ? ' is-filled' : ''}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeText = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const trips = [
  { id: 'maldives', name: 'Maldives', title: 'Maldives tour', region: 'Maldives', image: 'maldives-lagoon.webp', category: 'island', days: 30, distance: 862, score: '4.7', subtitle: 'Maritime Kingdom', description: 'Wake up with the sunrise, fall asleep to the sound of the waves, and feel as if you are one with nature.', code: 'MLE', photos: ['maldives-lagoon.webp', 'maldives-island.webp', 'sandbank.webp'] },
  { id: 'phuket', name: 'Phuket Island', title: 'Phuket Island', region: 'Thailand', image: 'phuket-island.webp', category: 'island', days: 15, distance: 320, score: '5.0', subtitle: 'A little closer to paradise', description: 'Find sheltered bays, limestone cliffs and long afternoons by the Andaman Sea.', code: 'HKT', photos: ['phuket-island.webp'] },
  { id: 'sandbank', name: 'Sandbank', title: 'Sandbank escape', region: 'Maldives', image: 'sandbank.webp', category: 'island', days: 7, distance: 48, score: '4.9', subtitle: 'Between sky and sea', description: 'A quiet stretch of white sand, clear water and a horizon that seems to go on forever.', code: 'MLE', photos: ['sandbank.webp', 'ocean-shore.webp'] }
];
const people = [
  { id: 'james', name: 'James', profile: 'Balderston', image: 'avatar-james.jpg', city: 'Beijing', bio: 'The world is so big. I want to see it with a good travel partner.', skill: 'Knows the island trails and the quietest beaches.' },
  { id: 'crystal', name: 'Crystal', profile: 'Crystal', image: 'avatar-crystal.jpg', city: 'Sanya', bio: 'A camera, a good book and somewhere new to explore.', skill: 'A photographer with an eye for the coast.' },
  { id: 'felice', name: 'Felice', profile: 'Felice', image: 'avatar-felice.jpg', city: 'Phuket', bio: 'Always happiest where the mountains meet the sea.', skill: 'An experienced diver who knows the island.' },
  { id: 'baeyer', name: 'Baeyer', profile: 'Baeyer', image: null, city: 'Amsterdam', bio: 'Looking for a walking partner for my next journey.', skill: 'Plans gentle hikes and thoughtful little escapes.' }
];
const airports = [
  { code: 'AMS', name: 'Amsterdam', lon: 4.76, lat: 52.31, utc: 1 },
  { code: 'SFO', name: 'San Francisco', lon: -122.38, lat: 37.62, utc: -8 },
  { code: 'PEK', name: 'Beijing', lon: 116.6, lat: 40.08, utc: 8 },
  { code: 'MLE', name: 'Maldives', lon: 73.53, lat: 4.19, utc: 5 },
  { code: 'HKT', name: 'Phuket', lon: 98.32, lat: 8.11, utc: 7 }
];
const today = new Date();
today.setHours(12, 0, 0, 0);
const addDays = (date, amount) => { const result = new Date(date); result.setDate(result.getDate() + amount); return result; };
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateLabel = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const state = {
  view: 'world', data: {}, stack: [], region: 'Maldives', destination: 0,
  query: '', recommend: 'island', foundPage: 0, feedPage: 0, albumPage: 0,
  saved: new Set(['maldives', 'sandbank']), liked: new Set(), followed: new Set(),
  transport: 'plane', guideCategory: 'island', galleryIndex: 0,
  flight: { from: 'AMS', to: 'SFO', roundTrip: true, departure: addDays(today, 11), return: addDays(today, 27), lunch: 'Salad', dinner: 'Bread' },
  flightStatus: 'idle', searchAttempt: 0, searchToken: 0, dayOffset: 0, selectedFlight: 0,
  passenger: { name: 'David', weight: '75', gender: 'Man' }, bank: 0,
  profile: { name: 'Michael Dan', bio: 'Collecting quiet places and beautiful journeys.' },
  loginAttempt: 0, connected: true
};
const rootViews = ['world', 'found', 'travel', 'profile'];
let started = false, noticeTimer, popoverTrigger;
const tripById = id => trips.find(trip => trip.id === id) || trips[0];
const personById = id => people.find(person => person.id === id) || people[0];
const airport = code => airports.find(item => item.code === code);
const photo = (file, alt) => `<img src="assets/${file}" alt="${escapeText(alt)}" draggable="false">`;
const avatar = (person, square = false) => `<span class="avatar${square ? ' square' : ''}">${person.image ? photo(person.image, person.name) : `<span class="avatar-initial">${escapeText(person.name[0])}</span>`}</span>`;
const iconButton = (name, action, label, extra = '', disabled = false) => `<button class="icon-button ${extra}" data-action="${action}" aria-label="${label}" ${disabled ? 'disabled' : ''}>${icon(name)}</button>`;
const header = (title, extra = '', sub = '') => `<header class="screen-top"><div class="header-actions">${iconButton('back', 'back', 'Go back')}${extra}</div><h1>${title}</h1>${sub}</header>`;
const stars = score => `<span class="star-line" aria-label="${score || '5'} out of 5">${Array.from({ length: 5 }, () => icon('star', true)).join('')}${score ? `<span>${score}</span>` : ''}</span>`;
const emptyState = (title, text, action = '', label = '') => `<div class="empty-state">${icon('discover')}<h3>${title}</h3><p>${text}</p>${action ? `<button class="soft-button" data-action="${action}">${label}</button>` : ''}</div>`;
const pair = (symbol, leftLabel, leftValue, rightLabel, rightValue, tint = '') => `<div class="pair-card ${tint}"><span class="pair-icon ${symbol === 'calendar' ? 'blue' : symbol === 'salad' ? 'green' : ''}">${icon(symbol)}</span><div class="pair-values"><div><span>${leftLabel}</span><strong>${escapeText(leftValue)}</strong></div><div><span>${rightLabel}</span><strong>${escapeText(rightValue)}</strong></div></div></div>`;
const currency = amount => '$' + amount.toLocaleString('en-US');
const fare = index => (index === 0 ? 1200 : 860) + state.dayOffset * 25;

function notify(text) {
  clearTimeout(noticeTimer);
  $('#notice').textContent = text;
  $('#notice').hidden = false;
  noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, 2600);
}
function closePopover(restore = true) {
  $('#popover').hidden = true;
  popoverTrigger?.setAttribute('aria-expanded', 'false');
  if (restore && popoverTrigger?.isConnected) popoverTrigger.focus();
}
function navigate(view, data = {}, root = false) {
  closePopover(false);
  state.searchToken++;
  if (root) state.stack = [];
  else state.stack.push({ view: state.view, data: { ...state.data } });
  state.view = view;
  state.data = data;
  render();
  $('#screen').focus({ preventScroll: true });
}
function back() {
  const previous = state.stack.pop();
  closePopover(false);
  state.searchToken++;
  state.view = previous?.view || 'world';
  state.data = previous?.data || {};
  render();
  $('#screen').focus({ preventScroll: true });
}
function renderNavigation() {
  const active = state.view === 'profile' ? 'profile' : state.view;
  $('#bottom-nav').hidden = !rootViews.includes(state.view) || (state.view === 'profile' && !!state.data.person);
  $('#bottom-nav').innerHTML = [['world', 'home', 'World'], ['found', 'discover', 'Found'], ['travel', 'bag', 'Travel'], ['profile', 'user', 'Profile']].map(([view, symbol, label]) => `<button class="nav-button${active === view ? ' is-active' : ''}" data-nav="${view}" aria-label="${label}" ${active === view ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></button>`).join('');
}
function render() {
  const isRoot = rootViews.includes(state.view) && !(state.view === 'profile' && state.data.person);
  $('#screen').className = isRoot ? '' : 'full-screen';
  const views = { world: renderWorld, destinations: renderDestinations, detail: renderDetail, gallery: renderGallery, found: renderFound, friends: renderFriends, profile: renderProfile, about: renderAbout, pathfinder: renderPathfinder, travel: renderTravel, flights: renderFlights, route: renderRoute, traffic: renderTraffic, passenger: renderPassenger, passengerEdit: renderPassengerEdit, review: renderReview, profileEdit: renderProfileEdit, login: renderLogin };
  $('#screen').innerHTML = views[state.view]();
  renderNavigation();
  wirePhotos();
}
function wirePhotos() {
  $('#screen').querySelectorAll('img').forEach(image => {
    image.addEventListener('error', () => {
      const parent = image.parentElement;
      parent.classList.add('photo-failure');
      if (parent.querySelector('.retry-photo')) return;
      const retry = document.createElement(parent.tagName === 'BUTTON' ? 'span' : 'button');
      retry.className = 'retry-photo';
      retry.textContent = 'Retry photo';
      if (retry.tagName === 'BUTTON') retry.dataset.action = 'retry-photo';
      parent.append(retry);
    });
    image.addEventListener('load', () => { image.parentElement.classList.remove('photo-failure'); image.parentElement.querySelector('.retry-photo')?.remove(); });
  });
}
function renderWorld() {
  const regional = trips.filter(trip => trip.region === state.region);
  state.destination = Math.min(state.destination, regional.length - 1);
  const trip = regional[state.destination];
  return `<header class="screen-top world-top"><div class="heading-row"><h1>Asia</h1>${iconButton('grid', 'destinations', 'Browse all destinations')}</div><div class="chips">${['Maldives', 'China', 'Thailand'].map(region => `<button class="chip${region === state.region ? ' is-active' : ''}" data-region="${region}" aria-pressed="${region === state.region}">${region}</button>`).join('')}</div></header><section class="destination-stage" aria-label="Destinations">${trip ? `<button class="carousel-edge previous" data-action="destination-previous" aria-label="Previous destination" ${state.destination === 0 ? 'disabled' : ''}>${photo('sandbank.webp', '')}${icon('chevron')}</button><div class="destination-track"><article class="destination-card"><button class="destination-open" data-trip="${trip.id}" aria-label="Explore ${trip.name}">${photo(trip.image, `${trip.name} surrounded by turquoise water`)}<div class="destination-caption"><h2>${trip.name}</h2>${stars()}</div></button><button class="save-corner${state.saved.has(trip.id) ? ' is-active' : ''}" data-save="${trip.id}" aria-label="${state.saved.has(trip.id) ? 'Unsave' : 'Save'} ${trip.name}" aria-pressed="${state.saved.has(trip.id)}">${icon('star')}</button></article></div><button class="carousel-edge next" data-action="destination-next" aria-label="Next destination" ${state.destination >= regional.length - 1 ? 'disabled' : ''}>${photo('maldives-lagoon.webp', '')}${icon('chevron')}</button>` : emptyState('New places are on their way', 'Explore the islands nearby while we prepare more journeys.', 'reset-region', 'Explore Maldives')}</section>`;
}
function renderDestinations() {
  return `${header('Destinations')}<section class="content"><p class="body-text muted">Find your next little corner of the world.</p><div class="destination-list">${trips.map(destinationRow).join('')}</div></section>`;
}
function destinationRow(trip) {
  return `<button class="destination-row" data-trip="${trip.id}">${photo(trip.image, trip.name)}<div><h3>${trip.name}</h3><p>${trip.days} days · ${trip.subtitle}</p>${stars(trip.score)}</div></button>`;
}
function renderDetail() {
  const trip = tripById(state.data.id);
  return `<div class="detail-photo"><button class="destination-open" data-action="gallery" aria-label="View photos of ${trip.name}">${photo(trip.image, trip.name)}</button><div class="photo-toolbar">${iconButton('back', 'back', 'Go back')}<span class="small-text">01 / ${String(trip.photos.length).padStart(2, '0')}</span></div><div class="photo-metrics"><span class="metric">${icon('clock')} ${trip.days} DAYS</span><span class="metric">${icon('flag')} ${trip.distance} KM</span></div></div><section class="detail-body">${iconButton('send', 'tour-route', 'View route', 'white send-button')}<h1>${trip.title}</h1><p>${trip.description}</p><div class="social-actions"><button data-action="discussion" aria-label="View travel notes">${icon('chat')} 24</button><button data-like="${trip.id}" class="${state.liked.has(trip.id) ? 'is-active' : ''}" aria-pressed="${state.liked.has(trip.id)}" aria-label="Like ${trip.title}">${icon('heart')} ${65 + Number(state.liked.has(trip.id))}</button><button data-save="${trip.id}" class="${state.saved.has(trip.id) ? 'is-active' : ''}" aria-pressed="${state.saved.has(trip.id)}" aria-label="Save ${trip.title}">${icon('star')} ${17 + Number(state.saved.has(trip.id))}</button><button data-action="share" aria-label="Share this journey">${icon('share')} 80</button></div><div class="companion-row"><div class="avatar-group">${people.slice(0, 3).map(person => `<button data-person="${person.id}" aria-label="View ${person.profile}">${avatar(person, true)}</button>`).join('')}</div>${iconButton('more', 'trip-menu', 'More journey options', 'soft')}</div><div class="bottom-action">${pair('pin', 'From', 'Beijing', 'To', trip.name, 'tinted')}<button class="primary-button" data-action="commence" style="margin-top:var(--s4)">Commence The Tour</button></div></section>`;
}
function renderGallery() {
  const trip = tripById(state.data.id), files = trip.photos;
  return `<div class="gallery-photo">${photo(files[state.galleryIndex], `${trip.name} photo ${state.galleryIndex + 1}`)}</div><div class="photo-toolbar">${iconButton('back', 'back', 'Back to journey')}${iconButton('more', 'trip-menu', 'More journey options')}</div><section class="gallery-copy"><h1>${trip.title}</h1><div class="metrics"><span class="metric">${icon('clock')} ${trip.days} DAYS</span><span class="metric">${icon('flag')} ${trip.distance} KM</span></div><p>${trip.description}</p><button class="gallery-heart" data-like="${trip.id}" aria-pressed="${state.liked.has(trip.id)}" aria-label="Like this photo">${icon('heart', state.liked.has(trip.id))} ${295 + Number(state.liked.has(trip.id))}</button></section><div class="gallery-thumbs">${files.map((file, index) => `<button data-gallery="${index}" class="${index === state.galleryIndex ? 'is-active' : ''}" aria-label="View photo ${index + 1}" aria-pressed="${index === state.galleryIndex}">${photo(file, '')}</button>`).join('')}</div>`;
}
function renderFound() {
  return `<header class="screen-top"><div class="heading-row"><h1>Have Fun<br>${escapeText(state.profile.name)}</h1><button class="bookmark-mark icon-button" data-action="traffic" aria-label="Saved journeys">${icon('bookmark')}</button></div><form class="search-field" id="discover-search">${icon('search')}<input name="query" value="${escapeText(state.query)}" aria-label="Search sites" placeholder="Search sites" autocomplete="off" enterkeyhint="search"><button class="icon-button small" type="submit" aria-label="Search destinations">${icon('arrow')}</button></form><div class="quick-links"><button data-action="traffic">${icon('bag')}<span>Free trip</span></button><button data-action="friends">${icon('flag')}<span>Tour group</span></button><button data-action="pathfinder">${icon('book')}<span>Strategy</span></button><button data-action="friends">${icon('chat')}<span>Enjoy travel</span></button></div></header><section class="content"><h2>Recommend</h2><div class="chips compact">${[['ruins', 'Otami Ruins'], ['old', 'Old time'], ['island', 'People island']].map(([id, label]) => `<button class="chip${state.recommend === id ? ' is-active' : ''}" data-recommend="${id}" aria-pressed="${state.recommend === id}">${label}</button>`).join('')}</div><div id="found-results">${foundResults()}</div></section>`;
}
function foundResults() {
  const results = trips.filter(trip => state.recommend === trip.category && `${trip.name} ${trip.region}`.toLowerCase().includes(state.query.toLowerCase().trim()));
  const pageCount = Math.max(1, Math.ceil(results.length / 2));
  state.foundPage = Math.min(state.foundPage, pageCount - 1);
  return results.length ? `<div class="card-grid">${results.slice(state.foundPage * 2, state.foundPage * 2 + 2).map(trip => `<button class="photo-card" data-trip="${trip.id}">${photo(trip.image, trip.name)}<div class="photo-card-label"><h3>${trip.name}</h3><p>For ${trip.days} days</p></div></button>`).join('')}</div><div class="pager">${iconButton('back', 'found-previous', 'Previous recommendations', '', state.foundPage === 0)}<span>${state.foundPage + 1} / ${pageCount}</span>${iconButton('arrow', 'found-next', 'Next recommendations', '', state.foundPage === pageCount - 1)}</div>` : emptyState('No places found', 'Try another place or explore our island collection.', 'clear-search', 'Explore islands');
}
function renderFriends() {
  const visible = [people[state.feedPage % 3], people[(state.feedPage + 1) % 3]];
  return `${header('Find Friend', iconButton('plus', 'find-people', 'Find a travel partner'))}<section class="screen-top" style="padding-top:var(--s2)"><div class="friend-strip">${people.map(person => `<button data-person="${person.id}">${avatar(person)}<span>${person.name}</span></button>`).join('')}</div></section><section class="content"><h2>Life Circle</h2><div class="feed">${visible.map((person, index) => `<article><button class="feed-author" data-person="${person.id}">${avatar(person)}<strong>${person.profile}</strong><span class="location">${person.city}</span></button><button class="feed-photos" data-trip="${trips[index].id}" aria-label="Explore ${trips[index].title}">${photo(index ? 'ocean-shore.webp' : 'maldives-lagoon.webp', 'An island journey')}${photo('maldives-island.webp', '')}${photo('sandbank.webp', '')}</button><p class="feed-caption">${index ? 'A quieter kind of afternoon.' : 'This is my favorite island to visit.'}</p></article>`).join('')}</div><div class="pager">${iconButton('back', 'feed-previous', 'Previous travel notes')}<span>Travel notes</span>${iconButton('arrow', 'feed-next', 'More travel notes')}</div></section>`;
}
function renderProfile() {
  const person = state.data.person ? personById(state.data.person) : null;
  const name = person ? person.profile : state.profile.name;
  const bio = person ? person.bio : state.profile.bio;
  const hasLongBio = bio.length > 55;
  const preview = hasLongBio ? bio.slice(0, 42).trimEnd() + '…' : bio;
  const followed = person && state.followed.has(person.id);
  const album = [
    { file: 'maldives-lagoon.webp', text: 'Crystal-clear water.', id: 'maldives', tall: true },
    { file: 'sandbank.webp', text: 'Between sky and sea.', id: 'sandbank' },
    { file: 'ocean-shore.webp', text: 'A seaside afternoon.', id: 'phuket' },
    { file: 'maldives-island.webp', text: 'My island escape.', id: 'maldives', tall: true }
  ];
  const tile = item => `<button class="journey-tile${item.tall ? ' tall' : ''}" data-trip="${item.id}">${photo(item.file, item.text)}<p>${item.text}</p></button>`;
  return `<header class="screen-top"><div class="header-actions">${iconButton('back', 'back', 'Go back')}${person ? `<button class="soft-button" data-follow="${person.id}" aria-pressed="${followed}">${followed ? 'Following' : 'Follow'}</button>` : iconButton('more', 'profile-menu', 'Profile options', 'soft')}</div><div class="profile-head">${avatar(person || people[0])}<div><h2>${escapeText(name)}</h2><p>${escapeText(preview)}</p>${hasLongBio ? '<button class="profile-more" data-action="about-profile">Read more</button>' : ''}</div></div><div class="profile-stats">${[['6.2k', 'Likes'], [followed ? '8,401' : '8.4k', 'Followers'], ['3.7k', 'Shots'], ['1.5k', 'Following']].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div></header><section class="content profile-content"><div class="heading-row"><h2>Journey</h2>${!person ? `<button class="soft-button" data-action="traffic">Saved</button>` : ''}</div><div class="journey-grid"><div class="journey-column">${tile(album[0])}${tile(album[1])}</div><div class="journey-column">${tile(album[2])}${tile(album[3])}</div></div></section>`;
}
function renderAbout() {
  const person = state.data.person ? personById(state.data.person) : null;
  return `${header('About')}<section class="content profile-about">${avatar(person || people[0])}<h2>${escapeText(person ? person.profile : state.profile.name)}</h2><p>${escapeText(person ? person.bio : state.profile.bio)}</p></section>`;
}
function renderPathfinder() {
  const results = state.guideCategory === 'island' ? trips.slice(0, 2) : [];
  return `${header('Pathfinder', iconButton('search', 'find-people', 'Find a guide'))}<section class="content" style="flex:0 0 auto"><div class="guide-grid">${[people[0], people[2]].map(person => `<button class="guide-card" data-person="${person.id}">${avatar(person)}<h3>${person.profile}</h3><p>${person.skill}</p></button>`).join('')}</div></section><section class="content" style="background:var(--white);border-radius:var(--r-lg)"><h2>Explore nearby</h2><div class="text-tabs">${['Island', 'Park', 'Museum', 'Forest', 'Temple'].map(label => `<button data-guide-category="${label.toLowerCase()}" class="${state.guideCategory === label.toLowerCase() ? 'is-active' : ''}" aria-pressed="${state.guideCategory === label.toLowerCase()}">${label}</button>`).join('')}</div><div class="destination-list">${results.length ? results.map(destinationRow).join('') : emptyState('A little further afield', 'Choose Island to find places and local travel partners.', 'reset-guide', 'See islands')}</div></section>`;
}
function flightFields() {
  const f = state.flight;
  const fieldButton = (key, label, value, disabled = false) => `<button class="field-button" data-field="${key}" aria-haspopup="listbox" aria-expanded="false" ${disabled ? 'disabled' : ''}><span>${label}</span><strong>${escapeText(value)}</strong></button>`;
  return `<div class="pair-card"><span class="pair-icon">${icon('pin')}</span><div class="pair-controls">${fieldButton('from', 'From', airport(f.from).name)}${fieldButton('to', 'To', airport(f.to).name)}</div></div><div class="pair-card"><span class="pair-icon blue">${icon('calendar')}</span><div class="pair-controls">${fieldButton('departure', 'Departure', dateLabel(f.departure))}${fieldButton('return', 'Return', f.roundTrip ? dateLabel(f.return) : 'One way', !f.roundTrip)}</div></div><div class="pair-card"><span class="pair-icon green">${icon('salad')}</span><div class="pair-controls">${fieldButton('lunch', 'Lunch', f.lunch)}${fieldButton('dinner', 'Dinner', f.dinner)}</div></div>`;
}
const segmented = () => `<div class="segmented">${[[true, 'Back Forth'], [false, 'One Way']].map(([roundTrip, label]) => `<button data-round-trip="${roundTrip}" class="${state.flight.roundTrip === roundTrip ? 'is-active' : ''}" aria-pressed="${state.flight.roundTrip === roundTrip}">${label}</button>`).join('')}</div>`;
const airportCodes = () => `<div class="airport-codes"><span>${state.flight.from}</span><button data-action="swap-airports" aria-label="Swap departure and destination">${icon('swap')}</button><span>${state.flight.to}</span></div>`;
function renderTravel() {
  return `<header class="screen-top"><div class="heading-row"><h1>Flight Ticket</h1>${iconButton('search', 'search-flights', 'Search flights')}</div><div class="flight-hero">${segmented()}${airportCodes()}<button class="choose-flights" data-action="search-flights">Choose more flights</button></div></header><section class="content flight-fields">${flightFields()}</section>`;
}
function flightLegs(index) {
  const f = state.flight;
  const transatlantic = [f.from, f.to].includes('SFO');
  const outboundDuration = transatlantic ? (index === 0 ? 725 : 710) : (index === 0 ? 405 : 385);
  const returnDuration = transatlantic ? (index === 0 ? 690 : 705) : (index === 0 ? 390 : 400);
  const leg = (from, to, departure, duration) => {
    const departureMinutes = Number(departure.slice(0, 2)) * 60 + Number(departure.slice(3));
    const arrivalMinutes = departureMinutes + duration + (airport(to).utc - airport(from).utc) * 60;
    const day = Math.floor(arrivalMinutes / 1440), clock = ((arrivalMinutes % 1440) + 1440) % 1440;
    const arrival = `${String(Math.floor(clock / 60)).padStart(2, '0')}:${String(clock % 60).padStart(2, '0')}`;
    return `<div class="flight-leg"><div><strong>${departure}</strong><span>${from}</span></div><div class="flight-duration">${Math.floor(duration / 60)}h ${String(duration % 60).padStart(2, '0')}</div><div><strong>${arrival}</strong><span>${to}${day ? ` ${day > 0 ? '+' : ''}${day} day` : ''}</span></div></div>`;
  };
  return leg(f.from, f.to, index === 0 ? '05:00' : '07:05', outboundDuration) + (f.roundTrip ? leg(f.to, f.from, index === 0 ? '23:20' : '01:20', returnDuration) : '');
}
function renderFlights() {
  let content;
  if (state.flightStatus === 'loading') content = `<div class="empty-state loading">${icon('refresh')}<h3>Finding your flight</h3><p>Checking seats for ${dateLabel(addDays(state.flight.departure, state.dayOffset))}.</p><button class="soft-button" disabled>Searching…</button></div>`;
  else if (state.flightStatus === 'error') content = emptyState('Couldn’t load flights', 'The connection timed out. Your route and dates are still here.', 'retry-flights', 'Try again');
  else content = `<div class="ticket-list">${[0, 1].map(index => `<article class="ticket">${flightLegs(index)}<div class="ticket-price"><strong>${currency(fare(index))}</strong><button data-buy="${index}">Buy</button></div></article>`).join('')}</div>`;
  return `${header(`${state.flight.from} ⇆ ${state.flight.to}`, iconButton('more', 'flight-menu', 'Flight options'), `<div class="day-tabs">${[-1, 0, 1].map(offset => `<button data-day="${offset}" class="${offset === state.dayOffset ? 'is-active' : ''}" aria-pressed="${offset === state.dayOffset}" ${state.flightStatus === 'loading' || addDays(state.flight.departure, offset) < today || (state.flight.roundTrip && addDays(state.flight.departure, offset) > state.flight.return) ? 'disabled' : ''}>${dateLabel(addDays(state.flight.departure, offset))}</button>`).join('')}</div>`)}<section class="content">${content}</section>`;
}
function routeMap() {
  const point = code => { const a = airport(code); return { x: (a.lon + 180) / 360 * 390, y: (80 - a.lat) / 160 * 280 + 25 }; };
  const from = point(state.flight.from), to = point(state.flight.to), middleX = (from.x + to.x) / 2, middleY = Math.min(from.y, to.y) - 55;
  return `<svg class="route-map" viewBox="0 0 390 350" role="img" aria-label="Flight route from ${airport(state.flight.from).name} to ${airport(state.flight.to).name}"><path class="map-grid" d="M0 95h390M0 175h390M0 255h390M65 0v350M195 0v350M325 0v350"/><g class="land"><path d="m19 70 33-29 51-11 31 22-8 26-23 4-6 21-31 14-7 26-17-24-18-12Zm64 78 25 12 21 25-8 46-18 48-13-28-8-43-14-30Zm82-102 22-17 18 12-4 26-20 8Zm10 57 28-13 24 12 7 22-31 10-24-9Zm8 36 39-13 31 19-6 51-28 43-25-13-6-39-16-25Zm37-56 31-41 71-9 35 35 4 40-32 5-11 22-27 13-23-21-15 14-18-19-21-7Zm74 136 40-12 24 25-18 24-38-2-17-14Zm64-98 9 7-8 22-7-10Z"/></g><path class="route-line" d="M${from.x} ${from.y} Q${middleX} ${middleY} ${to.x} ${to.y}"/>${[[from, state.flight.from], [to, state.flight.to]].map(([p, code]) => `<g><circle class="route-point" cx="${p.x}" cy="${p.y}" r="5"/><circle class="hit-point" cx="${p.x}" cy="${p.y}" r="16" data-airport="${code}" role="button" tabindex="0" aria-label="${airport(code).name} airport"><title>${airport(code).name} · ${code}</title></circle><text x="${Math.max(20, Math.min(355, p.x))}" y="${p.y + 24}" text-anchor="middle">${code}</text></g>`).join('')}</svg>`;
}
function renderRoute() {
  return `<section class="map-surface"><div class="photo-toolbar" style="color:var(--ink)">${iconButton('back', 'back', 'Go back', 'white')}${iconButton('send', 'route-info', 'Route details', 'white')}</div><span class="map-label">Route overview</span>${routeMap()}<div class="map-caption" id="map-caption">${airport(state.flight.from).name} → ${airport(state.flight.to).name}</div></section><section class="route-panel">${segmented()}${airportCodes()}<div class="ticket">${flightLegs(state.selectedFlight)}</div><button class="primary-button" data-action="begin-travel">Begin to travel</button></section>`;
}
function renderTraffic() {
  const saved = trips.filter(trip => state.saved.has(trip.id));
  const shown = state.transport === 'plane' || state.transport === 'ferry' ? saved.slice(0, 2) : [];
  return `${header('Traffic Tools', iconButton('more', 'traffic-menu', 'Travel options'), '<p class="small-text muted">Choose the transportation that suits you.</p>')}<section class="screen-top" style="padding-top:var(--s2)"><div class="transport-tabs">${[['plane', 'Flight'], ['train', 'Train'], ['ferry', 'Ferry'], ['bus', 'Bus']].map(([id, label]) => `<button data-transport="${id}" class="${state.transport === id ? 'is-active' : ''}" aria-label="${label}" aria-pressed="${state.transport === id}">${icon(id)}</button>`).join('')}</div></section><section class="content"><h2>Sentiment</h2><div class="saved-list">${shown.length ? shown.map(trip => `<article class="saved-card"><button class="saved-picture" data-trip="${trip.id}" aria-label="View ${trip.title}">${photo(trip.image, trip.name)}</button><div class="saved-label"><button data-trip="${trip.id}"><h3>${trip.title}</h3><p>${trip.subtitle}</p></button><button class="icon-button small is-active" data-save="${trip.id}" aria-label="Unsave ${trip.title}" aria-pressed="true">${icon('heart')}</button></div></article>`).join('') : emptyState(saved.length ? 'No journeys for this route' : 'Your next journey awaits', saved.length ? 'Choose Flight or Ferry for your saved islands.' : 'Save a place you love and find it here.', saved.length ? 'reset-transport' : 'destinations', saved.length ? 'See flights' : 'Find a place')}</div></section>`;
}
function renderPassenger() {
  const p = state.passenger;
  return `${header('Passenger')}<section class="screen-top" style="padding-top:var(--s2)"><div class="passenger-chips"><button data-action="edit-passenger">${escapeText(p.name)}</button><button data-action="edit-passenger">${escapeText(p.weight)}<small>KG</small></button><button data-action="edit-passenger">${escapeText(p.gender)}</button></div><div style="margin-top:var(--s5)">${pair('salad', 'Lunch', state.flight.lunch, 'Dinner', state.flight.dinner)}</div></section><section class="content" style="display:flex;flex-direction:column;background:var(--white)"><h2>Bank card</h2><div class="bank-stage"><button class="bank-card" data-action="change-bank" aria-label="Change payment card"><span class="card-brand" aria-label="Mastercard"><b></b><b></b></span><span class="card-number"><span>**** **** ****</span><span>${state.bank ? '4812' : '0626'}</span></span><span class="card-type"><span>${state.bank ? 'Travel' : 'Platinum'}</span><span>Mastercard</span></span></button>${iconButton('chevron', 'change-bank', 'Next payment card', 'bank-change')}</div><div class="payment-actions"><button class="soft-button" data-action="review"><span>Pay For</span><strong>${currency(fare(state.selectedFlight))}</strong></button>${iconButton('scan', 'edit-passenger', 'Confirm passenger details')}</div></section>`;
}
function renderPassengerEdit() {
  return `${header('Travel details')}<section class="content"><form id="passenger-form" class="form-grid" novalidate><label>Passenger name<input name="name" value="${escapeText(state.passenger.name)}" maxlength="40" autocomplete="name" required></label><div class="two-fields"><label>Baggage · kg<input name="weight" value="${escapeText(state.passenger.weight)}" inputmode="numeric" required></label><label>Passenger<input value="${escapeText(state.passenger.gender)}" readonly aria-label="Passenger type"></label></div><p class="form-message" id="passenger-message" role="status"></p><button class="primary-button" type="submit">Save details</button></form></section>`;
}
function renderReview() {
  const f = state.flight;
  return `${header('Review your trip')}<section class="content" style="display:flex;flex-direction:column"><h2>${airport(f.from).name}<br>to ${airport(f.to).name}</h2><div class="review-lines"><div><span>Passenger</span><strong>${escapeText(state.passenger.name)}</strong></div><div><span>Departure</span><strong>${dateLabel(addDays(f.departure, state.dayOffset))}</strong></div>${f.roundTrip ? `<div><span>Return</span><strong>${dateLabel(f.return)}</strong></div>` : ''}<div><span>Journey</span><strong>${f.roundTrip ? 'Return flight' : 'One way'}</strong></div><div><span>Lunch / Dinner</span><strong>${f.lunch} / ${f.dinner}</strong></div><div><span>Card</span><strong>•••• ${state.bank ? '4812' : '0626'}</strong></div><div class="total"><span>Total</span><strong>${currency(fare(state.selectedFlight))}</strong></div></div><p class="service-message">Payment is currently unavailable. No charge has been made and your trip has not been booked.</p><div class="bottom-action"><button class="primary-button" disabled>Payment unavailable</button><button class="soft-button" data-action="edit-passenger" style="width:100%;margin-top:var(--s3)">Edit passenger details</button></div></section>`;
}
function renderProfileEdit() {
  return `${header('Your profile')}<section class="content"><form id="profile-form" class="form-grid" novalidate><label>Name<input name="name" value="${escapeText(state.profile.name)}" maxlength="32" required autocomplete="name"></label><label>About you<textarea name="bio" rows="4" maxlength="140">${escapeText(state.profile.bio)}</textarea></label><p class="form-message" id="profile-message" role="status"></p><button class="primary-button">Save changes</button></form></section>`;
}
function renderLogin() {
  return `${header('Welcome back')}<section class="content"><h2>Your next journey starts here.</h2><form id="login-form" class="form-grid" novalidate><label>Email<input type="email" name="email" autocomplete="email" autocapitalize="none" placeholder="you@email.com" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required minlength="6"></label><p id="login-message" class="form-message" role="status"></p><button class="primary-button">Sign in</button></form></section>`;
}

function openPopover(trigger, title, body) {
  closePopover(false);
  popoverTrigger = trigger;
  trigger?.setAttribute('aria-expanded', 'true');
  $('#popover').innerHTML = `<div class="popover-heading"><strong>${title}</strong>${iconButton('close', 'close-popover', 'Close menu', 'small')}</div>${body}`;
  $('#popover').hidden = false;
  const canvas = $('.canvas').getBoundingClientRect(), panel = $('#popover').getBoundingClientRect(), anchor = trigger.getBoundingClientRect();
  const top = Math.max(24, Math.min(anchor.bottom - canvas.top + 6, canvas.height - panel.height - 24));
  $('#popover').style.top = top / canvas.width * 100 + 'cqw';
  const selected = $('#popover').querySelector('[aria-selected="true"]:not(:disabled)') || $('#popover').querySelector('.option:not(:disabled),input');
  selected?.focus();
}
function showMenu(trigger, title, options) {
  openPopover(trigger, title, `<div class="options" role="menu">${options.map(([action, label, disabled = false]) => `<button class="option" role="menuitem" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}${icon('chevron')}</button>`).join('')}</div>`);
}
function showField(trigger) {
  const field = trigger.dataset.field;
  if (['departure', 'return'].includes(field)) {
    const date = state.flight[field];
    state.calendar = { field, year: date.getFullYear(), month: date.getMonth() };
    openPopover(trigger, field === 'departure' ? 'Departure date' : 'Return date', calendarBody());
    return;
  }
  const options = ['from', 'to'].includes(field) ? airports.map(item => ({ value: item.code, label: `${item.name} · ${item.code}`, disabled: item.code === state.flight[field === 'from' ? 'to' : 'from'] })) : ['Salad', 'Bread', 'Fruit', 'No meal'].map(value => ({ value, label: value, disabled: false }));
  openPopover(trigger, { from: 'Fly from', to: 'Fly to', lunch: 'Lunch', dinner: 'Dinner' }[field], `<div class="options" role="listbox" aria-label="${field}">${options.map(option => `<button class="option" role="option" data-pick-field="${field}" data-value="${option.value}" aria-selected="${state.flight[field] === option.value}" ${option.disabled ? 'disabled' : ''}>${option.label}${state.flight[field] === option.value ? icon('check') : ''}</button>`).join('')}</div>`);
}
function calendarBody() {
  const c = state.calendar, first = new Date(c.year, c.month, 1, 12), offset = (first.getDay() + 6) % 7;
  return `<div class="calendar-heading">${iconButton('back', 'calendar-previous', 'Previous month', 'small')}<strong>${first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>${iconButton('arrow', 'calendar-next', 'Next month', 'small')}</div><div class="calendar-grid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<span>${day}</span>`).join('')}${Array.from({ length: 42 }, (_, index) => { const date = new Date(c.year, c.month, index - offset + 1, 12); const disabled = date.getMonth() !== c.month || date < (c.field === 'return' ? state.flight.departure : today); return `<button data-date="${dateKey(date)}" class="${dateKey(date) === dateKey(state.flight[c.field]) ? 'is-active' : ''}" aria-label="${date.toLocaleDateString('en-US')}" aria-pressed="${dateKey(date) === dateKey(state.flight[c.field])}" ${disabled ? 'disabled' : ''}>${date.getDate()}</button>`; }).join('')}</div>`;
}
function refreshCalendar() {
  const first = new Date(state.calendar.year, state.calendar.month, 1, 12);
  state.calendar.year = first.getFullYear(); state.calendar.month = first.getMonth();
  $('#popover').innerHTML = `<div class="popover-heading"><strong>${state.calendar.field === 'return' ? 'Return date' : 'Departure date'}</strong>${iconButton('close', 'close-popover', 'Close calendar', 'small')}</div>${calendarBody()}`;
}
async function searchFlights(retry = false) {
  closePopover(false);
  if (!retry) navigate('flights');
  state.flightStatus = 'loading';
  state.searchAttempt++;
  const attempt = state.searchAttempt, token = ++state.searchToken;
  render();
  await new Promise(resolve => setTimeout(resolve, 850));
  if (token !== state.searchToken || state.view !== 'flights') return;
  state.flightStatus = attempt % 2 ? 'ready' : 'error';
  render();
}
async function shareTrip() {
  const trip = tripById(state.data.id);
  const url = new URL(location.href); url.hash = `trip=${trip.id}`;
  try { await navigator.clipboard.writeText(url.href); notify('Journey link copied'); }
  catch { notify('Copy this page address to share the journey.'); }
}
function toggleSaved(id) {
  state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
  render();
  notify(state.saved.has(id) ? 'Added to your saved journeys' : 'Removed from saved journeys');
}
function handleAction(action, button) {
  if (action !== 'close-popover' && !['calendar-next', 'calendar-previous', 'trip-menu', 'profile-menu', 'flight-menu', 'traffic-menu', 'find-people'].includes(action)) closePopover(false);
  switch (action) {
    case 'back': back(); break;
    case 'destinations': navigate('destinations'); break;
    case 'reset-region': state.region = 'Maldives'; state.destination = 0; render(); break;
    case 'destination-previous': state.destination = Math.max(0, state.destination - 1); render(); break;
    case 'destination-next': state.destination++; render(); break;
    case 'gallery': state.galleryIndex = 0; navigate('gallery', { id: state.data.id }); break;
    case 'tour-route': state.flight.from = 'PEK'; state.flight.to = tripById(state.data.id).code; navigate('route'); break;
    case 'commence': state.flight.from = 'PEK'; state.flight.to = tripById(state.data.id).code; navigate('travel', {}, true); break;
    case 'discussion': navigate('friends'); break;
    case 'friends': navigate('friends'); break;
    case 'pathfinder': navigate('pathfinder'); break;
    case 'traffic': navigate('traffic'); break;
    case 'trip-menu': showMenu(button, 'Journey', [['gallery', 'View photos'], ['pathfinder', 'Find a local guide'], ['traffic', 'Saved journeys']]); break;
    case 'profile-menu': showMenu(button, 'Your profile', [['edit-profile', 'Edit profile'], ['traffic', 'Saved journeys'], ['sign-out', 'Sign out']]); break;
    case 'flight-menu': showMenu(button, 'Flight options', [['edit-route', 'Change route or dates'], ['route', 'View route'], ['review', 'Review selected flight']]); break;
    case 'traffic-menu': showMenu(button, 'Travel', [['edit-route', 'Find a flight'], ['pathfinder', 'Travel partners']]); break;
    case 'share': shareTrip(); break;
    case 'clear-search': state.query = ''; state.recommend = 'island'; state.foundPage = 0; render(); break;
    case 'found-previous': state.foundPage = Math.max(0, state.foundPage - 1); render(); break;
    case 'found-next': state.foundPage++; render(); break;
    case 'feed-next': state.feedPage = (state.feedPage + 1) % 3; render(); break;
    case 'feed-previous': state.feedPage = (state.feedPage + 2) % 3; render(); break;
    case 'find-people': openPopover(button, 'Find a travel partner', `<div class="options" role="listbox" aria-label="Travel partners">${people.map(person => `<button class="option" role="option" aria-selected="false" data-person="${person.id}">${person.profile}<span class="muted">${person.city}</span></button>`).join('')}</div>`); break;
    case 'reset-guide': state.guideCategory = 'island'; render(); break;
    case 'reset-transport': state.transport = 'plane'; render(); break;
    case 'search-flights': searchFlights(); break;
    case 'retry-flights': searchFlights(true); break;
    case 'swap-airports': [state.flight.from, state.flight.to] = [state.flight.to, state.flight.from]; render(); break;
    case 'edit-route': navigate('travel', {}, true); break;
    case 'route': navigate('route'); break;
    case 'route-info': $('#map-caption').textContent = `${airport(state.flight.from).name} (${state.flight.from}) → ${airport(state.flight.to).name} (${state.flight.to}) · ${dateLabel(state.flight.departure)}`; break;
    case 'begin-travel': searchFlights(); break;
    case 'edit-passenger': navigate('passengerEdit'); break;
    case 'change-bank': state.bank = 1 - state.bank; render(); break;
    case 'review': navigate('review'); break;
    case 'about-profile': navigate('about', { person: state.data.person }); break;
    case 'edit-profile': navigate('profileEdit'); break;
    case 'sign-out': state.connected = false; navigate('login', {}, true); break;
    case 'close-popover': closePopover(); break;
    case 'calendar-previous': state.calendar.month--; refreshCalendar(); break;
    case 'calendar-next': state.calendar.month++; refreshCalendar(); break;
    case 'retry-photo': retryPhoto(button.parentElement); break;
  }
}
function retryPhoto(parent) {
  const image = parent.querySelector('img');
  parent.querySelector('.retry-photo')?.remove();
  image.src = image.getAttribute('src');
}
function handleClick(event) {
  const button = event.target.closest('button, [data-airport]');
  if (!button || button.disabled) { if (!$('#popover').contains(event.target)) closePopover(false); return; }
  const failed = button.closest('.photo-failure');
  if (failed && !button.matches('[data-action="retry-photo"]')) { retryPhoto(failed); return; }
  const d = button.dataset;
  if (d.nav) { navigate(d.nav, {}, true); return; }
  if (d.trip) { navigate('detail', { id: d.trip }); return; }
  if (d.save) { toggleSaved(d.save); return; }
  if (d.like) { state.liked.has(d.like) ? state.liked.delete(d.like) : state.liked.add(d.like); render(); return; }
  if (d.region) { state.region = d.region; state.destination = 0; render(); return; }
  if (d.person) { navigate('profile', { person: d.person }); return; }
  if (d.follow) { state.followed.has(d.follow) ? state.followed.delete(d.follow) : state.followed.add(d.follow); render(); return; }
  if (d.gallery !== undefined) { state.galleryIndex = Number(d.gallery); render(); return; }
  if (d.recommend) { state.recommend = d.recommend; state.foundPage = 0; render(); return; }
  if (d.guideCategory) { state.guideCategory = d.guideCategory; render(); return; }
  if (d.transport) { state.transport = d.transport; render(); return; }
  if (d.roundTrip) { state.flight.roundTrip = d.roundTrip === 'true'; render(); return; }
  if (d.field) { showField(button); return; }
  if (d.pickField) {
    state.flight[d.pickField] = d.value;
    closePopover(false); render();
    $(`[data-field="${d.pickField}"]`)?.focus(); return;
  }
  if (d.date) {
    const field = state.calendar.field;
    state.flight[field] = new Date(d.date + 'T12:00:00');
    if (state.flight.return < state.flight.departure) state.flight.return = addDays(state.flight.departure, 7);
    state.dayOffset = 0; closePopover(false); render(); $(`[data-field="${field}"]`)?.focus(); return;
  }
  if (d.day) { state.dayOffset = Number(d.day); searchFlights(true); return; }
  if (d.buy !== undefined) { state.selectedFlight = Number(d.buy); navigate('passenger'); return; }
  if (d.airport) { $('#map-caption').textContent = `${airport(d.airport).name} airport · ${d.airport}`; return; }
  if (d.action) handleAction(d.action, button);
  else if (!$('#popover').contains(button)) closePopover(false);
}
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target, data = new FormData(form);
  if (form.id === 'discover-search') {
    state.query = String(data.get('query')); state.foundPage = 0;
    $('#found-results').innerHTML = foundResults(); wirePhotos(); return;
  }
  if (form.id === 'passenger-form') {
    const name = String(data.get('name')).trim(), weight = String(data.get('weight')).trim();
    const nameValid = name.length > 0 && name.length <= 40, weightValid = /^\d{1,3}$/.test(weight) && Number(weight) >= 1 && Number(weight) <= 99;
    form.elements.name.setAttribute('aria-invalid', String(!nameValid));
    form.elements.weight.setAttribute('aria-invalid', String(!weightValid));
    if (!nameValid || !weightValid) { $('#passenger-message').textContent = nameValid ? 'Enter a baggage allowance between 1 and 99 kg.' : 'Enter the passenger’s full name.'; return; }
    state.passenger.name = name; state.passenger.weight = weight; back(); notify('Passenger details saved'); return;
  }
  if (form.id === 'profile-form') {
    const name = String(data.get('name')).trim();
    form.elements.name.setAttribute('aria-invalid', String(!name));
    if (!name) { $('#profile-message').textContent = 'Enter your name.'; return; }
    state.profile.name = name; state.profile.bio = String(data.get('bio')).trim(); back(); notify('Profile updated'); return;
  }
  if (form.id === 'login-form') signIn(form);
}
async function signIn(form) {
  const email = form.elements.email, password = form.elements.password;
  const validEmail = email.validity.valid && !!email.value.trim(), validPassword = password.value.length >= 6;
  email.setAttribute('aria-invalid', String(!validEmail)); password.setAttribute('aria-invalid', String(!validPassword));
  if (!validEmail || !validPassword) { $('#login-message').textContent = validEmail ? 'Use a password with at least 6 characters.' : 'Enter a valid email address.'; return; }
  const submit = form.querySelector('button'); submit.disabled = true; submit.textContent = 'Connecting…';
  const attempt = ++state.loginAttempt, token = ++state.searchToken;
  $('#login-message').textContent = '';
  await new Promise(resolve => setTimeout(resolve, 850));
  if (token !== state.searchToken || !form.isConnected) return;
  if (attempt % 2) { state.connected = true; navigate('profile', {}, true); notify('Welcome back'); }
  else { submit.disabled = false; submit.textContent = 'Try again'; $('#login-message').textContent = 'Couldn’t connect. Your details are still here. Please try again.'; }
}
function handleKeydown(event) {
  if (event.key === 'Escape') { if (!$('#popover').hidden) closePopover(); else if (!rootViews.includes(state.view)) back(); return; }
  if (event.target.matches('[data-airport]') && ['Enter', ' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
  if ($('#popover').hidden || !$('#popover').contains(event.target)) return;
  const items = [...$('#popover').querySelectorAll('button:not(:disabled), input')];
  const options = items.filter(item => item.classList.contains('option'));
  if (options.length && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const current = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
    options[next].focus();
  }
  if (event.key === 'Tab') {
    const current = items.indexOf(document.activeElement);
    if ((event.shiftKey && current <= 0) || (!event.shiftKey && current === items.length - 1)) { event.preventDefault(); (event.shiftKey ? items.at(-1) : items[0]).focus(); }
  }
}
function start() {
  if (started) return;
  started = true;
  $('.canvas').addEventListener('click', handleClick);
  $('.canvas').addEventListener('submit', handleSubmit);
  document.addEventListener('keydown', handleKeydown);
  const sharedTrip = new URLSearchParams(location.hash.slice(1)).get('trip');
  if (trips.some(trip => trip.id === sharedTrip)) { state.view = 'detail'; state.data = { id: sharedTrip }; }
  render();
}
start();
