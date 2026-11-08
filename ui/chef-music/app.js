const $ = (selector) => document.querySelector(selector);
const app = $('#music-app');
const audio = new Audio();
audio.preload = 'none';
audio.volume = .6;

const tracks = [
  { id: 'sleep', title: 'Sleep 4Ever', artist: 'MAGGIE ANDREW, blackbear', duration: 162, album: 'sleep', preview: '' },
  { id: 'queen', title: 'queen of broken hearts', artist: 'blackbear', duration: 171, album: 'everything', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bd/2c/b2/bd2cb27f-0a45-44e7-bad6-aa9b98b8cb9c/mzaf_1459486215834940342.plus.aac.p.m4a' },
  { id: 'if-u', title: 'if i were u', artist: 'blackbear, Lauv', duration: 186, album: 'everything', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d0/c4/d3/d0c4d32c-cbc0-e703-fd2a-ede1995202c6/mzaf_15441793741378380047.plus.aac.p.m4a' },
  { id: 'hot-girl', title: 'hot girl bummer', artist: 'blackbear', duration: 188, album: 'everything', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/31/af/a2/31afa227-9399-c359-2e2e-8efceccd996a/mzaf_2222994767763590375.plus.aac.p.m4a' },
  { id: 'best-friend', title: "my ex's best friend", artist: 'Machine Gun Kelly, blackbear', duration: 139, album: 'tickets', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/92/0b/14/920b1432-cfed-6422-a514-8c4e637d25d0/mzaf_862680738571191748.plus.aac.p.m4a' },
  { id: 'brightside', title: 'The Brightside', artist: 'Lil Peep', duration: 216, album: 'come-over', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a7/17/77/a717778c-f368-30c7-04ee-42565b997fe1/mzaf_2116291904349696577.plus.aac.p.m4a' },
  { id: 'igor-theme', title: "IGOR'S THEME", artist: 'Tyler, The Creator', duration: 201, album: 'igor', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b5/f1/58/b5f158c7-0938-82de-e380-a19444cd0260/mzaf_4489287100179218200.plus.aac.p.m4a' },
  { id: 'bubblegum', title: 'Princess Bubblegum', artist: 'ilyTOMMY', duration: 96, album: 'bubblegum', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/51/00/38/5100385b-290f-cbf3-914a-1ddf2930ba67/mzaf_16362991058488796778.plus.aac.p.m4a' },
  { id: 'gang-gang', title: 'GANG GANG', artist: 'JACKBOYS, Sheck Wes', duration: 244, album: 'jackboys', preview: '' },
  { id: 'life-sux', title: 'I hope your whole life sux', artist: 'blackbear', duration: 179, album: 'cybersex', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d3/e7/dd/d3e7dd0f-cc4e-2535-5226-d0f90ef2b97f/mzaf_5203938032325355787.plus.aac.p.m4a' },
  { id: 'deep-end', title: 'Deep End', artist: 'Fousheé', duration: 141, album: 'deep-end', preview: '' },
  { id: 'gimme-love', title: 'Gimme Love', artist: 'Joji', duration: 215, album: 'nectar', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b4/1c/88/b41c8867-d8d9-ee32-b1ee-4c08a4398291/mzaf_8857024758258373155.plus.aac.p.m4a' },
  { id: 'im-gone', title: "I'm Gone", artist: 'Oliver Tree', duration: 185, album: 'ugly', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/43/92/3a4392b9-13fa-8419-d81e-589b6656fdad/mzaf_13661508329925436940.plus.aac.p.m4a' }
];
const albums = [
  { id: 'come-over', title: "Come Over When You're Sober, Pt. 1", artist: 'Lil Peep', art: 'album-come-over.jpg' },
  { id: 'igor', title: 'IGOR', artist: 'Tyler, The Creator', art: 'album-igor.jpg' },
  { id: 'bubblegum', title: 'Princess Bubblegum', artist: 'ilyTOMMY', art: 'album-princess-bubblegum.jpg' },
  { id: 'jackboys', title: 'JACKBOYS', artist: 'JACKBOYS, Travis Scott', art: 'album-jackboys.svg' },
  { id: 'cybersex', title: 'cybersex', artist: 'blackbear', art: 'album-cybersex.jpg' },
  { id: 'sleep', title: 'Sleep 4Ever', artist: 'MAGGIE ANDREW, blackbear', art: 'album-sleep-4ever.svg' },
  { id: 'everything', title: 'everything means nothing', artist: 'blackbear', art: 'album-everything.jpg' },
  { id: 'tickets', title: 'Tickets To My Downfall', artist: 'Machine Gun Kelly', art: 'album-tickets.jpg' },
  { id: 'deep-end', title: 'Deep End', artist: 'Fousheé', art: 'album-deep-end.svg' },
  { id: 'nectar', title: 'Nectar', artist: 'Joji', art: 'album-nectar.jpg' },
  { id: 'ugly', title: 'Ugly Is Beautiful', artist: 'Oliver Tree', art: 'album-ugly.jpg' }
];
const friends = [
  { id: 'sofi', name: 'Sofi', subtitle: 'Lil Peep', image: 'avatar-sofi.jpg', artist: 'Lil Peep', album: 'come-over', active: true },
  { id: 'daniel', name: 'Daniel', subtitle: 'Travis Scott', image: 'avatar-daniel.jpg', artist: 'JACKBOYS', album: 'jackboys' },
  { id: 'nekichetire', name: 'nekichetire', subtitle: 'Listening 3h ago', image: 'avatar-nekichetire.jpg', artist: 'blackbear', album: 'cybersex' },
  { id: 'tolik', name: 'Tolik', subtitle: 'Listening 5h ago', image: 'avatar-tolik.jpg', artist: 'Joji', album: 'nectar' },
  { id: 'kostia', name: 'Kostia', subtitle: 'Listening 8h ago', image: 'avatar-kostia.jpg', artist: 'Tyler, The Creator', album: 'igor' },
  { id: 'dima', name: 'Dima V.', subtitle: 'Listening 15h ago', image: 'avatar-dima.jpg', artist: 'Oliver Tree', album: 'ugly' }
];
let activities = [
  { id: 'blackbear', name: 'blackbear', subtitle: 'Artists', image: 'avatar-blackbear.jpg', type: 'artist', artist: 'blackbear' },
  { id: 'deep-end', name: 'Deep End', subtitle: 'Fousheé', image: 'album-deep-end.svg', type: 'track', track: 'deep-end' },
  { id: 'lil-peep', name: 'Lil Peep', subtitle: 'Artists', image: 'avatar-lil-peep.jpg', type: 'artist', artist: 'Lil Peep' },
  { id: 'gimme-love', name: 'Gimme Love', subtitle: 'Joji', image: 'album-nectar.jpg', type: 'track', track: 'gimme-love' },
  { id: 'oliver-tree', name: 'Oliver Tree', subtitle: 'Artists', image: 'avatar-oliver-tree.jpg', type: 'artist', artist: 'Oliver Tree' }
];
const playlists = [
  { id: 'hip-hop', name: 'Hip-hop', tracks: ['gang-gang', 'igor-theme', 'best-friend', 'hot-girl'] },
  { id: 'jazz', name: 'Jazz', tracks: [] }
];
const homeTracks = ['sleep', 'queen', 'if-u', 'hot-girl', 'best-friend'];
const recentAlbums = albums.slice(0, 5);
const liked = new Set(['hot-girl']);
let recentTracks = ['brightside', 'igor-theme', 'bubblegum', 'gang-gang', 'life-sux'];
let view = 'for-you';
let viewTitle = 'Releases for You';
let featuredAlbum = 'sleep';
let currentId = 'sleep';
let pageIndex = 0;
let playlistPage = 0;
let selectedFriend = 'sofi';
let extraQueue = [];
let shuffle = false;
let repeat = 'off';
let privateListening = false;
let toastTimer;
let playbackTimeout;
let playbackRequest = 0;
let pendingSeek = .537;
let dialogReturnFocus;
let menuReturnFocus;
let started = false;

const getTrack = (id) => tracks.find((track) => track.id === id);
const getAlbum = (id) => albums.find((album) => album.id === id);
const artFor = (track) => './assets/' + getAlbum(track.album).art;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const heart = '<svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.5-6.6 5 5 0 0 1 7.5 6.6Z"/></svg>';
const equalizer = '<span class="equalizer" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b></span>';
const formatTime = (seconds) => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');

function notify(message, error = false) {
  clearTimeout(toastTimer);
  const toast = $('#toast');
  toast.querySelector('span').textContent = message;
  toast.querySelector('i').className = error ? 'ti ti-alert-circle' : 'ti ti-check';
  toast.classList.toggle('is-error', error);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

function viewTracks() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  let result;
  if (view.startsWith('playlist:')) {
    result = playlists.find((playlist) => playlist.id === view.slice(9)).tracks.map(getTrack);
  } else if (view.startsWith('album:')) {
    result = tracks.filter((track) => track.album === view.slice(6));
  } else if (view.startsWith('artist:')) {
    result = tracks.filter((track) => track.artist.includes(view.slice(7)));
  } else if (view.startsWith('friend:')) {
    const friend = friends.find((item) => item.id === view.slice(7));
    result = tracks.filter((track) => track.artist.includes(friend.artist));
  } else if (view === 'liked') {
    result = tracks.filter((track) => liked.has(track.id));
  } else if (view === 'recent') {
    result = recentTracks.map(getTrack);
  } else if (view === 'for-you') {
    result = homeTracks.map(getTrack);
  } else if (view === 'radio') {
    result = ['queen', 'if-u', 'hot-girl', 'life-sux', 'gimme-love'].map(getTrack);
  } else if (view === 'artists') {
    result = tracks.filter((track) => track.artist.includes('blackbear'));
  } else {
    result = tracks;
  }
  if (query) result = tracks.filter((track) => [track.title, track.artist, getAlbum(track.album).title].join(' ').toLocaleLowerCase().includes(query));
  return result;
}

function renderTrackList() {
  const result = viewTracks();
  pageIndex = Math.min(pageIndex, Math.max(0, Math.ceil(result.length / 5) - 1));
  const visible = result.slice(pageIndex * 5, pageIndex * 5 + 5);
  $('#track-list').innerHTML = visible.map((track, index) => `<div class="track-row ${track.id === currentId ? 'is-current' : ''}" data-track="${track.id}">
    <button class="track-number" data-action="play" aria-label="Play ${escapeHTML(track.title)}">${track.id === currentId ? equalizer : index + pageIndex * 5 + 1}</button>
    <button class="icon-button heart-button" data-action="like" aria-label="${liked.has(track.id) ? 'Unlike' : 'Like'} ${escapeHTML(track.title)}" aria-pressed="${liked.has(track.id)}">${heart}</button>
    <button class="track-info" data-action="play"><span class="track-title">${escapeHTML(track.title)}</span><span class="track-artist">${escapeHTML(track.artist)}</span></button>
    <button class="icon-button track-more" data-action="more" aria-label="More options for ${escapeHTML(track.title)}" aria-haspopup="menu" aria-expanded="false"><i class="ti ti-dots" aria-hidden="true"></i></button>
    <span class="track-time">${formatTime(track.duration)}</span>
  </div>`).join('');
  $('#list-pagination').hidden = result.length <= 5;
  $('#page-count').textContent = `${pageIndex + 1} / ${Math.max(1, Math.ceil(result.length / 5))}`;
  $('#previous-page').disabled = pageIndex === 0;
  $('#next-page').disabled = (pageIndex + 1) * 5 >= result.length;
  $('#release-content').hidden = result.length === 0;
  $('#empty-state').hidden = result.length > 0;
  if (!result.length) {
    const searching = Boolean($('#search').value.trim());
    $('#empty-title').textContent = searching ? 'No songs found' : view === 'liked' ? 'Your favorites start here' : 'A little quiet in here';
    $('#empty-description').textContent = searching ? 'Try another song or artist.' : view === 'liked' ? 'Save the songs you love with a heart.' : 'Add a song to make it yours.';
    $('#empty-action').textContent = searching ? 'Clear search' : 'Explore music';
  }
  if ($('#search').value.trim() && visible.length) featuredAlbum = visible[0].album;
  const album = getAlbum(featuredAlbum);
  $('#featured-image').src = './assets/' + album.art;
  $('#featured-image').alt = album.title + ' album cover';
  $('#featured-cover').setAttribute('aria-label', 'Play ' + album.title);
  $('#featured-cover').classList.remove('image-failed');
}

function renderAlbums() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const visible = query ? albums.filter((album) => (album.title + ' ' + album.artist).toLocaleLowerCase().includes(query)).slice(0, 5) : view === 'artists' ? albums.filter((album) => album.artist.includes('blackbear')).slice(0, 5) : recentAlbums;
  $('#album-grid').innerHTML = visible.map((album) => `<button class="album-card" data-album="${album.id}" aria-label="Open ${escapeHTML(album.title)}"><span class="album-art artwork"><img src="./assets/${album.art}" alt="${escapeHTML(album.title)} album cover" loading="eager"></span><span class="album-name">${escapeHTML(album.title)}</span><span class="album-artist">${escapeHTML(album.artist)}</span></button>`).join('');
  $('#recent-title').textContent = query ? 'Matching Albums' : view === 'albums' ? 'Your Albums' : view === 'artists' ? 'From blackbear' : 'Recently Played';
  if (query && !visible.length) $('#album-grid').innerHTML = '<p class="muted">No matching albums.</p>';
}

function renderPlaylists() {
  const visible = playlists.slice(playlistPage * 4, playlistPage * 4 + 4);
  $('#playlist-nav').classList.toggle('is-full', visible.length > 3);
  $('#playlist-nav').innerHTML = visible.map((playlist) => `<button class="nav-item ${view === 'playlist:' + playlist.id ? 'is-active' : ''}" data-playlist="${playlist.id}" ${view === 'playlist:' + playlist.id ? 'aria-current="page"' : ''} title="${escapeHTML(playlist.name)}"><i class="ti ti-music" aria-hidden="true"></i><span>${escapeHTML(playlist.name)}</span></button>`).join('');
  $('#playlist-page').hidden = playlists.length <= 4;
}

function renderActivities() {
  $('#friends-list').innerHTML = friends.map((friend) => `<button class="friend ${selectedFriend === friend.id ? 'is-active' : ''}" data-friend="${friend.id}" aria-label="Open ${escapeHTML(friend.name)}'s music"><img src="./assets/${friend.image}" alt="" class="avatar"><span class="friend-details"><span>${friend.name}</span><span class="muted">${friend.subtitle}</span></span>${friend.active ? equalizer : ''}</button>`).join('');
  $('#activity-list').innerHTML = activities.length ? activities.map((item) => `<div class="activity-card" data-activity="${item.id}"><button class="activity-open" aria-label="Open ${escapeHTML(item.name)}"><img class="activity-cover ${item.type === 'artist' ? 'is-artist' : ''}" src="./assets/${item.image}" alt=""><span class="friend-details"><span>${item.name}</span><span class="muted">${item.subtitle}</span></span></button><button class="icon-button" data-action="activity-more" aria-label="Options for ${escapeHTML(item.name)}" aria-haspopup="menu" aria-expanded="false"><i class="ti ti-dots" aria-hidden="true"></i></button></div>`).join('') : '<p class="activity-empty">Your listening activity will appear here.</p>';
}

function renderPlayer() {
  const track = getTrack(currentId);
  $('#now-image').src = artFor(track);
  $('#now-image').parentElement.classList.remove('image-failed');
  $('#now-title').textContent = track.title;
  $('#now-artist').textContent = track.artist;
  $('#now-playing').setAttribute('aria-label', 'Open ' + getAlbum(track.album).title);
  $('#player-like').setAttribute('aria-pressed', String(liked.has(currentId)));
  $('#player-like').setAttribute('aria-label', `${liked.has(currentId) ? 'Unlike' : 'Like'} ${track.title}`);
  syncPlayback();
}

function syncPlayback() {
  const playing = !audio.paused;
  const loading = $('#play-toggle').classList.contains('is-loading');
  app.classList.toggle('is-playing', playing);
  $('#play-toggle').setAttribute('aria-pressed', String(playing));
  $('#play-toggle').setAttribute('aria-label', loading ? 'Cancel loading' : playing ? 'Pause' : 'Play');
  $('#play-toggle i').className = loading ? 'ti ti-loader-2' : playing ? 'ti ti-player-pause' : 'ti ti-player-play';
}

function renderView() {
  $('#view-title').textContent = $('#search').value.trim() ? 'Search results' : viewTitle;
  document.title = 'Chef Music — ' + ($('#search').value.trim() ? 'Search' : viewTitle);
  document.querySelectorAll('.navigation [data-view]').forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  renderTrackList();
  renderAlbums();
  renderPlaylists();
}

function navigate(nextView, title, album = 'sleep') {
  view = nextView;
  viewTitle = title;
  featuredAlbum = album;
  pageIndex = 0;
  $('#search').value = '';
  $('#clear-search').hidden = true;
  closeMenu(false);
  renderView();
}

function openAlbum(id) {
  const album = getAlbum(id);
  navigate('album:' + id, album.title, id);
}

function toggleLike(id) {
  if (liked.has(id)) liked.delete(id); else liked.add(id);
  renderTrackList();
  renderPlayer();
  notify(liked.has(id) ? 'Added to Liked Songs' : 'Removed from Liked Songs');
}

function cancelPlayback() {
  playbackRequest++;
  clearTimeout(playbackTimeout);
  audio.pause();
  $('#play-toggle').classList.remove('is-loading');
  syncPlayback();
}

async function playTrack(id, toggle = false) {
  if (toggle && id === currentId && (!audio.paused || $('#play-toggle').classList.contains('is-loading'))) {
    cancelPlayback();
    return;
  }
  const changed = id !== currentId;
  if (changed) {
    cancelPlayback();
    currentId = id;
    pendingSeek = 0;
    audio.removeAttribute('src');
    updateRange($('#seek'), 0);
    renderTrackList();
    renderPlayer();
  }
  const track = getTrack(id);
  if (!track.preview) {
    notify('A music service connection is needed for this song.', true);
    $('#player-status').textContent = 'This song is not available for preview.';
    return;
  }
  const request = ++playbackRequest;
  $('#play-toggle').classList.add('is-loading');
  syncPlayback();
  if (!audio.getAttribute('src')) audio.src = track.preview;
  clearTimeout(playbackTimeout);
  playbackTimeout = setTimeout(() => {
    if (request !== playbackRequest) return;
    cancelPlayback();
    notify("Couldn't load this preview. Please try again.", true);
  }, 15000);
  try {
    await audio.play();
    if (request !== playbackRequest) return;
    clearTimeout(playbackTimeout);
    $('#play-toggle').classList.remove('is-loading');
    recentTracks = [id, ...recentTracks.filter((trackId) => trackId !== id)].slice(0, 13);
    $('#player-status').textContent = 'Playing ' + track.title;
    syncPlayback();
  } catch (error) {
    if (request !== playbackRequest || error.name === 'AbortError') return;
    clearTimeout(playbackTimeout);
    $('#play-toggle').classList.remove('is-loading');
    syncPlayback();
    notify("Couldn't play this preview. Please try again.", true);
  }
}

function moveTrack(direction) {
  if (direction > 0 && extraQueue.length) {
    playTrack(extraQueue.shift());
    return;
  }
  const available = viewTracks().filter((track) => track.preview);
  if (!available.length) {
    notify('There are no available previews in this selection.', true);
    return;
  }
  const index = available.findIndex((track) => track.id === currentId);
  let next;
  if (shuffle && available.length > 1) {
    const choices = available.filter((track) => track.id !== currentId);
    next = choices[Math.floor(Math.random() * choices.length)];
  } else next = index === -1 ? available[direction > 0 ? 0 : available.length - 1] : available[(index + direction + available.length) % available.length];
  playTrack(next.id);
}

function updateRange(input, value) {
  input.value = String(value);
  input.style.setProperty('--range-value', value + '%');
}

function closeMenu(restoreFocus = true) {
  $('#context-menu').hidden = true;
  if (menuReturnFocus) {
    menuReturnFocus.setAttribute('aria-expanded', 'false');
    if (restoreFocus && menuReturnFocus.isConnected) menuReturnFocus.focus();
  }
  menuReturnFocus = null;
}

function showMenu(anchor, items, heading = '') {
  const wasOpen = !$('#context-menu').hidden && menuReturnFocus === anchor;
  closeMenu(false);
  if (wasOpen) return;
  const menu = $('#context-menu');
  menu.innerHTML = heading ? `<div class="menu-heading">${escapeHTML(heading)}</div>` : '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'menu-item';
    button.type = 'button';
    button.setAttribute('role', item.checked === undefined ? 'menuitem' : 'menuitemcheckbox');
    if (item.checked !== undefined) button.setAttribute('aria-checked', String(item.checked));
    button.disabled = Boolean(item.disabled);
    button.innerHTML = `<i class="ti ti-${item.icon}" aria-hidden="true"></i><span>${escapeHTML(item.label)}</span>${item.checked ? '<i class="ti ti-check menu-check" aria-hidden="true"></i>' : ''}`;
    button.addEventListener('click', () => { closeMenu(); item.action(); });
    menu.append(button);
  });
  menu.hidden = false;
  menuReturnFocus = anchor;
  anchor.setAttribute('aria-expanded', 'true');
  const rect = app.getBoundingClientRect();
  const buttonRect = anchor.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const left = Math.min((buttonRect.left - rect.left) / rect.width * 100, 100 - menuRect.width / rect.width * 100 - 1.67);
  const below = (buttonRect.bottom - rect.top) / rect.width * 100 + .3;
  const bottomLimit = rect.height / rect.width * 100 - 1.67;
  const top = below + menuRect.height / rect.width * 100 <= bottomLimit ? below : (buttonRect.top - rect.top - menuRect.height) / rect.width * 100 - .3;
  menu.style.left = Math.max(1.67, left) + 'cqw';
  menu.style.top = Math.max(1.67, top) + 'cqw';
  menu.querySelector('button:not(:disabled)')?.focus();
}

function trackMenu(anchor, id) {
  const track = getTrack(id);
  showMenu(anchor, [
    { icon: 'player-play', label: 'Play preview', disabled: !track.preview, action: () => playTrack(id) },
    { icon: 'player-track-next', label: 'Play next', action: () => { extraQueue.unshift(id); notify('Playing next: ' + track.title); } },
    { icon: 'playlist-add', label: 'Add to queue', action: () => { extraQueue.push(id); notify('Added to your queue'); } },
    { icon: 'heart', label: liked.has(id) ? 'Remove from Liked Songs' : 'Save to Liked Songs', checked: liked.has(id), action: () => toggleLike(id) },
    { icon: 'music', label: 'Add to playlist', action: () => showPlaylistPicker(id) }
  ], track.title);
}

function openDialog(title, content, className = '') {
  closeMenu(false);
  if ($('#dialog-layer').hidden) dialogReturnFocus = document.activeElement;
  $('#dialog-title').textContent = title;
  $('#dialog').className = 'dialog ' + className;
  $('#dialog-content').innerHTML = content;
  $('#dialog-layer').hidden = false;
  app.querySelector('.workspace').inert = true;
  app.querySelector('.player').inert = true;
  $('#dialog-content').querySelector('input, button:not(:disabled)')?.focus();
  if (!$('#dialog').contains(document.activeElement)) $('#dialog').focus();
}

function closeDialog() {
  $('#dialog-layer').hidden = true;
  app.querySelector('.workspace').inert = false;
  app.querySelector('.player').inert = false;
  if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
}

function newPlaylist() {
  openDialog('New Playlist', `<form id="playlist-form" class="playlist-form" novalidate>
    <div class="playlist-art"><i class="ti ti-playlist" aria-hidden="true"></i></div>
    <div class="form-fields"><label for="playlist-name">Playlist name</label><input id="playlist-name" name="name" maxlength="40" autocomplete="off" placeholder="Give your playlist a name" aria-describedby="playlist-error"><p id="playlist-error" class="form-error" aria-live="polite"></p><div class="form-actions"><button type="button" class="soft-button" id="cancel-playlist">Cancel</button><button class="primary-button" id="create-playlist" type="submit" disabled>Create</button></div></div>
  </form>`);
  const input = $('#playlist-name');
  $('#cancel-playlist').addEventListener('click', closeDialog);
  input.addEventListener('input', () => {
    $('#create-playlist').disabled = !input.value.trim();
    input.removeAttribute('aria-invalid');
    $('#playlist-error').textContent = '';
  });
  $('#playlist-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();
    const duplicate = playlists.some((playlist) => playlist.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!name || duplicate) {
      $('#playlist-error').textContent = duplicate ? 'This playlist name is already taken.' : 'Enter a playlist name.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    const playlist = { id: 'custom-' + crypto.randomUUID(), name, tracks: [] };
    playlists.push(playlist);
    playlistPage = Math.floor((playlists.length - 1) / 4);
    closeDialog();
    navigate('playlist:' + playlist.id, name);
    notify('Playlist created: ' + name);
  });
}

function showPlaylistPicker(id) {
  openDialog('Add to playlist', `<div class="queue-list" id="playlist-picker">${playlists.map((playlist) => `<button class="menu-item" data-target-playlist="${playlist.id}" ${playlist.tracks.includes(id) ? 'disabled' : ''}><i class="ti ti-music" aria-hidden="true"></i><span>${escapeHTML(playlist.name)}</span>${playlist.tracks.includes(id) ? '<i class="ti ti-check menu-check" aria-hidden="true"></i>' : ''}</button>`).join('')}</div>`);
  $('#playlist-picker').addEventListener('click', (event) => {
    const button = event.target.closest('[data-target-playlist]');
    if (!button) return;
    const playlist = playlists.find((item) => item.id === button.dataset.targetPlaylist);
    playlist.tracks.push(id);
    closeDialog();
    if (view === 'playlist:' + playlist.id) renderView();
    notify('Added to ' + playlist.name);
  });
}

function showQueue() {
  const content = extraQueue.length ? `<div class="queue-list">${extraQueue.slice(0, 5).map((id, index) => {
    const track = getTrack(id);
    return `<div class="queue-row"><button data-queue-play="${index}"><img src="${artFor(track)}" alt=""><span class="queue-details"><span>${escapeHTML(track.title)}</span><span class="muted">${escapeHTML(track.artist)}</span></span></button><button class="icon-button" data-queue-remove="${index}" aria-label="Remove ${escapeHTML(track.title)}"><i class="ti ti-x" aria-hidden="true"></i></button></div>`;
  }).join('')}</div>` : '<p class="queue-empty">Your queue is empty. Add a song to keep listening.</p>';
  const remaining = extraQueue.length > 5 ? `<p class="muted">${extraQueue.length - 5} more songs in your queue</p>` : '';
  openDialog('Up next', content + remaining + `<div class="form-actions"><button class="soft-button" id="clear-queue" ${extraQueue.length ? '' : 'disabled'}>Clear queue</button></div>`, 'dialog--queue');
  $('#clear-queue').addEventListener('click', () => { extraQueue = []; showQueue(); });
  $('#dialog-content').querySelectorAll('[data-queue-play]').forEach((button) => button.addEventListener('click', () => {
    const [id] = extraQueue.splice(Number(button.dataset.queuePlay), 1);
    closeDialog();
    playTrack(id);
  }));
  $('#dialog-content').querySelectorAll('[data-queue-remove]').forEach((button) => button.addEventListener('click', () => {
    extraQueue.splice(Number(button.dataset.queueRemove), 1);
    showQueue();
  }));
}

function openActivity(item) {
  if (item.type === 'artist') {
    const first = tracks.find((track) => track.artist.includes(item.artist));
    navigate('artist:' + item.artist, item.name, first.album);
  } else {
    openAlbum(getTrack(item.track).album);
    playTrack(item.track);
  }
}

function start() {
  if (started) return;
  started = true;
  renderView();
  renderActivities();
  renderPlayer();
  app.classList.add('is-entering');
  app.addEventListener('animationend', () => app.classList.remove('is-entering'), { once: true });
  app.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) event.target.closest('.artwork')?.classList.add('image-failed');
  }, true);

  app.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-view]');
    if (nav) {
      const names = { 'for-you': 'Releases for You', library: 'Your Library', radio: 'Radio Station', videos: 'Music Video', liked: 'Liked Songs', albums: 'Albums', artists: 'Artists', recent: 'Recently Played' };
      navigate(nav.dataset.view, names[nav.dataset.view], nav.dataset.view === 'artists' ? 'cybersex' : nav.dataset.view === 'liked' ? 'everything' : 'sleep');
      if (nav.dataset.view === 'videos') {
        openDialog('Music Video', '<div class="video-notice"><p>Connect your music service to watch official videos.</p><button class="primary-button" id="browse-audio">Browse audio instead</button></div>');
        $('#browse-audio').addEventListener('click', () => { closeDialog(); navigate('library', 'Your Library'); });
      }
      return;
    }
    const playlist = event.target.closest('[data-playlist]');
    if (playlist) {
      const item = playlists.find((item) => item.id === playlist.dataset.playlist);
      navigate('playlist:' + item.id, item.name, item.tracks.length ? getTrack(item.tracks[0]).album : 'sleep');
      return;
    }
    const trackRow = event.target.closest('[data-track]');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (trackRow && action) {
      if (action === 'play') playTrack(trackRow.dataset.track, true);
      if (action === 'like') toggleLike(trackRow.dataset.track);
      if (action === 'more') trackMenu(event.target.closest('button'), trackRow.dataset.track);
      return;
    }
    const album = event.target.closest('[data-album]');
    if (album) { openAlbum(album.dataset.album); return; }
    const friendButton = event.target.closest('[data-friend]');
    if (friendButton) {
      const friend = friends.find((item) => item.id === friendButton.dataset.friend);
      selectedFriend = friend.id;
      navigate('friend:' + friend.id, friend.name + "'s music", friend.album);
      renderActivities();
      return;
    }
    const activityCard = event.target.closest('[data-activity]');
    if (activityCard) {
      const item = activities.find((item) => item.id === activityCard.dataset.activity);
      if (action === 'activity-more') showMenu(event.target.closest('button'), [
        { icon: item.type === 'artist' ? 'microphone-2' : 'disc', label: item.type === 'artist' ? 'Open artist' : 'Open song', action: () => openActivity(item) },
        { icon: 'x', label: 'Remove from activity', action: () => { activities = activities.filter((activity) => activity.id !== item.id); renderActivities(); notify('Removed from your activity'); } }
      ], item.name);
      else openActivity(item);
    }
  });

  $('#search').addEventListener('input', () => {
    pageIndex = 0;
    $('#clear-search').hidden = !$('#search').value;
    renderView();
  });
  $('#clear-search').addEventListener('click', () => {
    $('#search').value = '';
    $('#clear-search').hidden = true;
    featuredAlbum = view === 'for-you' ? 'sleep' : featuredAlbum;
    renderView();
    $('#search').focus();
  });
  $('#empty-action').addEventListener('click', () => {
    if ($('#search').value.trim()) $('#clear-search').click(); else navigate('for-you', 'Releases for You');
  });
  $('#previous-page').addEventListener('click', () => { pageIndex--; renderTrackList(); });
  $('#next-page').addEventListener('click', () => { pageIndex++; renderTrackList(); });
  $('#playlist-page').addEventListener('click', () => { playlistPage = (playlistPage + 1) % Math.ceil(playlists.length / 4); renderPlaylists(); });
  $('#featured-cover').addEventListener('click', () => { const track = viewTracks()[pageIndex * 5]; if (track) playTrack(track.id, true); });
  $('#new-playlist').addEventListener('click', newPlaylist);
  $('#now-playing').addEventListener('click', () => openAlbum(getTrack(currentId).album));
  $('#play-toggle').addEventListener('click', () => playTrack(currentId, true));
  $('#previous-track').addEventListener('click', () => moveTrack(-1));
  $('#next-track').addEventListener('click', () => moveTrack(1));
  $('#player-like').addEventListener('click', () => toggleLike(currentId));
  $('#shuffle').addEventListener('click', () => {
    shuffle = !shuffle;
    $('#shuffle').setAttribute('aria-pressed', String(shuffle));
    $('#shuffle').setAttribute('aria-label', shuffle ? 'Disable shuffle' : 'Enable shuffle');
    notify(shuffle ? 'Shuffle on' : 'Shuffle off');
  });
  $('#repeat').addEventListener('click', () => {
    repeat = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    $('#repeat').setAttribute('aria-pressed', String(repeat !== 'off'));
    $('#repeat').setAttribute('aria-label', 'Repeat: ' + repeat);
    $('#repeat i').className = repeat === 'one' ? 'ti ti-repeat-once' : 'ti ti-repeat';
    notify(repeat === 'one' ? 'Repeat this song' : repeat === 'all' ? 'Repeat all' : 'Repeat off');
  });
  $('#mute').addEventListener('click', () => {
    audio.muted = !audio.muted;
    $('#mute').setAttribute('aria-pressed', String(audio.muted));
    $('#mute').setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    $('#mute i').className = audio.muted ? 'ti ti-volume-off' : 'ti ti-volume';
  });
  $('#volume').addEventListener('input', () => {
    audio.volume = Number($('#volume').value) / 100;
    audio.muted = false;
    updateRange($('#volume'), Number($('#volume').value));
    $('#mute').setAttribute('aria-pressed', 'false');
    $('#mute').setAttribute('aria-label', 'Mute');
    $('#mute i').className = audio.volume === 0 ? 'ti ti-volume-off' : 'ti ti-volume';
  });
  $('#seek').addEventListener('input', () => {
    pendingSeek = Number($('#seek').value) / 100;
    if (Number.isFinite(audio.duration)) { audio.currentTime = audio.duration * pendingSeek; pendingSeek = null; }
    updateRange($('#seek'), Number($('#seek').value));
  });
  $('#player-more').addEventListener('click', () => showMenu($('#player-more'), [
    { icon: 'playlist', label: 'Up next', action: showQueue },
    { icon: 'album', label: 'Open album', action: () => openAlbum(getTrack(currentId).album) },
    { icon: 'music', label: 'Add to playlist', action: () => showPlaylistPicker(currentId) }
  ]));
  $('#profile-button').addEventListener('click', () => showMenu($('#profile-button'), [
    { icon: 'headphones', label: 'Your library', action: () => navigate('library', 'Your Library') },
    { icon: 'lock', label: 'Private listening', checked: privateListening, action: () => { privateListening = !privateListening; notify(privateListening ? 'Private listening on' : 'Private listening off'); } }
  ], 'Alisha Chef'));
  $('#close-dialog').addEventListener('click', closeDialog);
  $('#scrim').addEventListener('click', closeDialog);
  document.addEventListener('pointerdown', (event) => {
    if (!$('#context-menu').hidden && !$('#context-menu').contains(event.target) && !menuReturnFocus?.contains(event.target)) closeMenu(false);
  });
  window.addEventListener('resize', () => closeMenu(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { if (!$('#dialog-layer').hidden) closeDialog(); closeMenu(); return; }
    if (!$('#dialog-layer').hidden && event.key === 'Tab') {
      const focusable = [...$('#dialog').querySelectorAll('button:not(:disabled), input:not(:disabled)')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (!$('#context-menu').hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = [...$('#context-menu').querySelectorAll('button:not(:disabled)')];
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
      return;
    }
    if (event.target.closest('input, textarea') || !$('#dialog-layer').hidden || !$('#context-menu').hidden) return;
    if (event.code === 'Space' && (event.target === document.body || event.target === $('#play-toggle'))) { event.preventDefault(); playTrack(currentId, true); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search').focus(); }
  });
  audio.addEventListener('loadedmetadata', () => {
    if (pendingSeek !== null && Number.isFinite(audio.duration)) { audio.currentTime = audio.duration * pendingSeek; pendingSeek = null; }
  });
  audio.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audio.duration)) return;
    updateRange($('#seek'), audio.currentTime / audio.duration * 100);
    $('#seek').setAttribute('aria-valuetext', formatTime(audio.currentTime) + ' of ' + formatTime(audio.duration));
  });
  audio.addEventListener('play', syncPlayback);
  audio.addEventListener('pause', syncPlayback);
  audio.addEventListener('ended', () => {
    if (repeat === 'one') { audio.currentTime = 0; playTrack(currentId); }
    else if (repeat === 'all' || extraQueue.length) moveTrack(1);
    else { syncPlayback(); $('#player-status').textContent = 'Preview finished.'; }
  });
  window.addEventListener('pagehide', () => { cancelPlayback(); clearTimeout(toastTimer); });
}

start();
