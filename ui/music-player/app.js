/* =========================================================
   正在播放 — 交互逻辑（本地假数据，无后端）
   ======================================================= */

const TRACKS = [
  { id: 't1', title: 'Tidewater', artist: 'Marta Bell', album: 'Salt & Signal', year: 2024, genre: '独立电子', duration: 252, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop' },
  { id: 't2', title: 'Slow Ferry', artist: 'Okonkwo Trio', album: 'Ferry Notes', year: 2023, genre: '爵士三重奏', duration: 227, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80&auto=format&fit=crop' },
  { id: 't3', title: 'Night Bus', artist: 'The Hollow Coast', album: 'Twelve Street Sessions', year: 2025, genre: '独立摇滚', duration: 303, cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80&auto=format&fit=crop' },
  { id: 't4', title: 'Paper Lantern', artist: 'Ji-Yeon Park', album: 'Lantern Room', year: 2022, genre: '室内乐', duration: 201, cover: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&q=80&auto=format&fit=crop' },
  { id: 't5', title: 'Cassette Sunrise', artist: 'Nadia Reinhart', album: 'Half Speed', year: 2024, genre: '合成器流行', duration: 178, cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80&auto=format&fit=crop' },
  { id: 't6', title: 'Halogen Blue', artist: 'Marta Bell', album: 'Salt & Signal', year: 2024, genre: '独立电子', duration: 276, cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop' }
];

const OUTPUTS = ['此 Mac 的扬声器', '无线耳机', '客厅音响'];
const REPEAT_LABEL = { off: '关闭', all: '列表循环', one: '单曲循环' };

const el = (id) => document.getElementById(id);
const player = el('player');
const artImg = el('artImg');
const ambA = el('ambA'), ambB = el('ambB');
const glowA = el('glowA'), glowB = el('glowB');
const scrub = el('scrub'), scrubFill = el('scrubFill'), scrubKnob = el('scrubKnob');
const volTrack = el('vol'), volFill = el('volFill'), volKnob = el('volKnob');
const queueList = el('queue');
const sheet = el('sheet'), menu = el('menu');
const toast = el('toast'), toastText = el('toastText');
const notice = el('notice'), noticeText = el('noticeText');
const collapseBtn = el('btnCollapse');

const state = {
  currentId: 't1',
  upNext: ['t2', 't3', 't4', 't5', 't6'],
  history: [],
  playing: false,
  loading: false,
  position: 0,
  volume: 0.72,
  muted: false,
  shuffle: false,
  repeat: 'off',
  scrubbing: false,
  liked: new Set(),
  downloaded: new Set(['t1', 't2', 't3', 't4', 't6']),
  output: 0
};

const track = (id) => TRACKS.find((item) => item.id === id);
const current = () => track(state.currentId);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/* ---------- 封面 / 背景交叉淡入 ---------- */

function swapCover(url) {
  [[ambA, ambB], [glowA, glowB]].forEach(([a, b]) => {
    const active = a.classList.contains('is-active') ? a : b;
    const next = active === a ? b : a;
    next.style.backgroundImage = `url("${url}")`;
    next.classList.add('is-active');
    active.classList.remove('is-active');
  });
}

/* ---------- 渲染 ---------- */

function renderTrack() {
  const item = current();
  el('title').textContent = item.title;
  el('artist').textContent = item.artist;
  el('album').textContent = item.album;
  el('timeTotal').textContent = formatTime(item.duration);

  artImg.alt = `${item.title} 专辑封面`;
  artImg.onload = () => { artImg.style.display = ''; };
  artImg.onerror = () => { artImg.style.display = 'none'; };
  artImg.src = item.cover;
  if (artImg.complete && artImg.naturalWidth > 0) artImg.style.display = '';

  swapCover(item.cover);
  renderProgress();
  renderState();
  renderQueue();
}

function renderProgress() {
  const item = current();
  const ratio = clamp(state.position / item.duration, 0, 1);
  scrubFill.style.width = `${ratio * 100}%`;
  scrubKnob.style.left = `${ratio * 100}%`;
  el('timeNow').textContent = formatTime(state.position);
  scrub.setAttribute('aria-valuemax', String(item.duration));
  scrub.setAttribute('aria-valuenow', String(Math.round(state.position)));
  scrub.setAttribute('aria-valuetext', `${Math.floor(state.position / 60)} 分 ${Math.floor(state.position % 60)} 秒`);
  renderTransportState();
}

function renderState() {
  player.classList.toggle('is-playing', state.playing && !state.loading);
  player.classList.toggle('is-loading', state.loading);
  el('playIcon').hidden = state.loading;
  el('playSpin').hidden = !state.loading;
  el('playIcon').className = state.playing ? 'ti ti-player-pause' : 'ti ti-player-play';
  el('btnPlay').setAttribute('aria-label', state.playing ? '暂停' : '播放');
  el('btnLike').setAttribute('aria-pressed', String(state.liked.has(state.currentId)));
  el('btnMute').setAttribute('aria-pressed', String(state.muted));
  el('btnMute').setAttribute('aria-label', state.muted ? '取消静音' : '静音');
  el('volIcon').className = state.muted || state.volume === 0 ? 'ti ti-volume-off' : state.volume < 0.5 ? 'ti ti-volume' : 'ti ti-volume-3';
  el('btnShuffle').setAttribute('aria-pressed', String(state.shuffle));
  el('btnRepeat').setAttribute('aria-pressed', String(state.repeat !== 'off'));
  el('btnRepeat').setAttribute('aria-label', `循环模式：${REPEAT_LABEL[state.repeat]}`);
  el('repeatNum').hidden = state.repeat !== 'one';
  el('btnOutput').setAttribute('aria-label', `输出设备：${OUTPUTS[state.output]}`);
}

function renderVolume() {
  const value = state.muted ? 0 : state.volume;
  volFill.style.width = `${value * 100}%`;
  volKnob.style.left = `${value * 100}%`;
  volTrack.setAttribute('aria-valuenow', String(Math.round(value * 100)));
  volTrack.setAttribute('aria-valuetext', `音量 ${Math.round(value * 100)}%`);
  renderState();
}

function renderTransportState() {
  el('btnPrev').disabled = state.history.length === 0 && state.position < 3;
  el('btnNext').disabled = state.repeat === 'off' && !state.upNext.length;
}

function renderQueue() {
  queueList.innerHTML = '';
  const now = current();

  const head = document.createElement('li');
  const nowItem = document.createElement('button');
  nowItem.type = 'button';
  nowItem.className = 'qitem is-current';
  nowItem.dataset.id = now.id;
  nowItem.innerHTML = `
    <span class="qitem__thumb" style="background-image:url('${now.cover}')">
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
    </span>
    <span class="qitem__text">
      <span class="qitem__title">${now.title}</span>
      <span class="qitem__artist">${now.artist}</span>
    </span>
    <span class="qitem__side">${formatTime(now.duration)}</span>`;
  head.appendChild(nowItem);
  queueList.appendChild(head);

  if (!state.upNext.length) {
    const empty = document.createElement('li');
    empty.className = 'qempty';
    empty.innerHTML = '<p>接下来没有待播放的曲目</p><button class="linkbtn" type="button" data-act="restore">恢复默认队列</button>';
    queueList.appendChild(empty);
    return;
  }

  state.upNext.forEach((id) => {
    const item = track(id);
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'qitem';
    button.dataset.id = id;
    const badge = state.downloaded.has(id) ? '' : '<i class="ti ti-download"></i>';
    button.innerHTML = `
      <span class="qitem__thumb" style="background-image:url('${item.cover}')"></span>
      <span class="qitem__text">
        <span class="qitem__title">${item.title}</span>
        <span class="qitem__artist">${item.artist}</span>
      </span>
      <span class="qitem__side">${badge}${formatTime(item.duration)}</span>`;
    li.appendChild(button);
    queueList.appendChild(li);
  });
}

function showNotice(text, primary, onPrimary) {
  noticeText.textContent = text;
  el('noticePrimary').textContent = primary;
  el('noticePrimary').onclick = onPrimary;
  notice.hidden = false;
}

function hideNotice() {
  notice.hidden = true;
}

let toastTimer = 0;
function showToast(message) {
  toastText.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

/* ---------- 播放控制 ---------- */

function loadTrack(id, autoplay = true) {
  const item = track(id);
  if (!item) return;
  state.currentId = id;
  state.position = 0;
  hideNotice();

  if (!state.downloaded.has(id)) {
    state.playing = false;
    state.loading = false;
    setSheet(false);
    renderTrack();
    showNotice('该曲目尚未下载，无法播放', '下载', () => downloadAndPlay(id));
    return;
  }

  state.loading = true;
  state.playing = false;
  renderTrack();
  setTimeout(() => {
    state.loading = false;
    state.playing = autoplay;
    renderState();
  }, 420);
}

function downloadAndPlay(id) {
  state.loading = true;
  state.playing = false;
  renderState();
  setTimeout(() => {
    state.downloaded.add(id);
    state.loading = false;
    state.currentId = id;
    state.position = 0;
    hideNotice();
    state.playing = true;
    renderTrack();
    showToast('已保存到离线资料库');
  }, 1400);
}

function togglePlay() {
  if (state.loading) return;
  if (!state.downloaded.has(state.currentId)) {
    showNotice('该曲目尚未下载，无法播放', '下载', () => downloadAndPlay(state.currentId));
    return;
  }
  state.playing = !state.playing;
  if (state.playing && state.position >= current().duration) state.position = 0;
  renderState();
  renderProgress();
}

function pickNextId() {
  if (!state.upNext.length) return null;
  if (state.shuffle && state.upNext.length > 1) {
    const index = Math.floor(Math.random() * state.upNext.length);
    return state.upNext.splice(index, 1)[0];
  }
  return state.upNext.shift();
}

function next(auto = false) {
  if (state.repeat === 'one' && auto) {
    state.position = 0;
    renderProgress();
    return;
  }
  let id = pickNextId();
  if (!id && state.repeat === 'all') {
    state.upNext = TRACKS.map((item) => item.id).filter((itemId) => itemId !== state.currentId);
    id = pickNextId();
  }
  if (!id) {
    state.playing = false;
    state.position = current().duration;
    renderState();
    renderProgress();
    return;
  }
  state.history.push(state.currentId);
  loadTrack(id, true);
}

function prev() {
  if (state.position > 3) {
    state.position = 0;
    renderProgress();
    return;
  }
  const previous = state.history.pop();
  if (!previous) {
    state.position = 0;
    renderProgress();
    return;
  }
  loadTrack(previous, state.playing);
}

function seek(seconds) {
  state.position = clamp(seconds, 0, current().duration);
  renderProgress();
}

function tick() {
  if (!state.playing || state.loading || state.scrubbing) return;
  state.position += 0.2;
  if (state.position >= current().duration) {
    next(true);
    return;
  }
  renderProgress();
}

/* ---------- 抽屉 / 菜单 ---------- */

function setSheet(open) {
  el('btnQueue').setAttribute('aria-expanded', String(open));
  if (open) {
    sheet.hidden = false;
    void sheet.offsetWidth;
    sheet.classList.add('is-open');
  } else {
    sheet.classList.remove('is-open');
    setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 340);
  }
}

function setMenu(open) {
  el('btnMore').setAttribute('aria-expanded', String(open));
  if (open) {
    menu.hidden = false;
    void menu.offsetWidth;
    menu.classList.add('is-open');
  } else {
    menu.classList.remove('is-open');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 180);
  }
}

/* ---------- 交互绑定 ---------- */

el('btnPlay').addEventListener('click', togglePlay);
el('btnNext').addEventListener('click', () => next());
el('btnPrev').addEventListener('click', prev);
el('btnBack').addEventListener('click', () => seek(state.position - 15));
el('btnFwd').addEventListener('click', () => seek(state.position + 15));

el('btnLike').addEventListener('click', () => {
  const id = state.currentId;
  if (state.liked.has(id)) {
    state.liked.delete(id);
    showToast('已从资料库移除');
  } else {
    state.liked.add(id);
    showToast('已收藏到资料库');
  }
  renderState();
});

el('btnMute').addEventListener('click', () => {
  state.muted = !state.muted;
  renderVolume();
});

el('btnShuffle').addEventListener('click', () => {
  state.shuffle = !state.shuffle;
  renderState();
  showToast(state.shuffle ? '随机播放已开启' : '随机播放已关闭');
});

el('btnRepeat').addEventListener('click', () => {
  const order = ['off', 'all', 'one'];
  state.repeat = order[(order.indexOf(state.repeat) + 1) % order.length];
  renderState();
  renderTransportState();
  showToast(`循环：${REPEAT_LABEL[state.repeat]}`);
});

el('btnOutput').addEventListener('click', () => {
  state.output = (state.output + 1) % OUTPUTS.length;
  renderState();
  showToast(`输出：${OUTPUTS[state.output]}`);
});

el('btnQueue').addEventListener('click', () => setSheet(!sheet.classList.contains('is-open')));
el('btnSheetClose').addEventListener('click', () => setSheet(false));

el('btnMore').addEventListener('click', (event) => {
  event.stopPropagation();
  setMenu(!menu.classList.contains('is-open'));
});

el('btnQueueClear').addEventListener('click', () => {
  state.upNext = [];
  renderQueue();
  renderTransportState();
  showToast('播放队列已清空');
});

collapseBtn.addEventListener('click', () => {
  const mini = player.classList.toggle('is-mini');
  if (mini) setSheet(false);
  collapseBtn.setAttribute('aria-label', mini ? '展开播放器' : '收起为迷你播放器');
  collapseBtn.setAttribute('aria-expanded', String(!mini));
  collapseBtn.querySelector('i').className = mini ? 'ti ti-chevron-up' : 'ti ti-chevron-down';
});

menu.addEventListener('click', (event) => {
  const action = event.target.closest('[data-act]');
  if (!action) return;
  const item = current();
  if (action.dataset.act === 'copy') {
    const link = `https://music.local/track/${item.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).catch(() => {});
    showToast('曲目链接已复制');
  }
  if (action.dataset.act === 'download') {
    if (state.downloaded.has(item.id)) {
      state.downloaded.delete(item.id);
      showToast('已移出离线资料库');
    } else {
      state.downloaded.add(item.id);
      showToast('已保存到离线资料库');
    }
    renderQueue();
  }
  if (action.dataset.act === 'info') {
    showToast(`${item.album}，${item.year}，${item.genre}`);
  }
  setMenu(false);
});

el('noticeSkip').addEventListener('click', () => {
  hideNotice();
  next();
});

queueList.addEventListener('click', (event) => {
  const restore = event.target.closest('[data-act="restore"]');
  if (restore) {
    state.upNext = TRACKS.map((item) => item.id).filter((id) => id !== state.currentId);
    renderQueue();
    renderTransportState();
    showToast('已恢复默认队列');
    return;
  }
  const item = event.target.closest('.qitem');
  if (!item || !item.dataset.id || item.dataset.id === state.currentId) return;
  const id = item.dataset.id;
  const index = state.upNext.indexOf(id);
  if (index > -1) state.upNext.splice(index, 1);
  state.history.push(state.currentId);
  setSheet(false);
  loadTrack(id, true);
});

document.addEventListener('click', (event) => {
  if (!menu.hidden && !menu.contains(event.target) && !event.target.closest('#btnMore')) setMenu(false);
});

/* ---------- 滑块 ---------- */

function bindSlider(trackEl, onChange) {
  const apply = (event) => {
    const rect = trackEl.getBoundingClientRect();
    onChange(clamp((event.clientX - rect.left) / rect.width, 0, 1));
  };
  trackEl.addEventListener('pointerdown', (event) => {
    trackEl.setPointerCapture(event.pointerId);
    trackEl.classList.add('is-dragging');
    apply(event);
  });
  trackEl.addEventListener('pointermove', (event) => {
    if (trackEl.classList.contains('is-dragging')) apply(event);
  });
  const stop = (event) => {
    trackEl.classList.remove('is-dragging');
    if (event.pointerId != null && trackEl.hasPointerCapture(event.pointerId)) trackEl.releasePointerCapture(event.pointerId);
  };
  trackEl.addEventListener('pointerup', stop);
  trackEl.addEventListener('pointercancel', stop);
}

bindSlider(scrub, (ratio) => {
  state.scrubbing = true;
  state.position = ratio * current().duration;
  renderProgress();
});
scrub.addEventListener('pointerup', () => { state.scrubbing = false; });
scrub.addEventListener('pointercancel', () => { state.scrubbing = false; });

bindSlider(volTrack, (ratio) => {
  state.volume = ratio;
  if (state.muted && ratio > 0) state.muted = false;
  renderVolume();
});

scrub.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 30 : 5;
  if (event.key === 'ArrowRight') { seek(state.position + step); event.preventDefault(); }
  if (event.key === 'ArrowLeft') { seek(state.position - step); event.preventDefault(); }
  if (event.key === 'Home') { seek(0); event.preventDefault(); }
  if (event.key === 'End') { seek(current().duration); event.preventDefault(); }
});

volTrack.addEventListener('keydown', (event) => {
  const step = 0.05;
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { state.volume = clamp(state.volume + step, 0, 1); state.muted = false; renderVolume(); event.preventDefault(); }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { state.volume = clamp(state.volume - step, 0, 1); renderVolume(); event.preventDefault(); }
});

/* ---------- 键盘 ---------- */

document.addEventListener('keydown', (event) => {
  if (event.target.closest('input, textarea, [contenteditable]')) return;
  if (event.key === ' ' || event.code === 'Space') {
    if (event.target.closest('button, [role="slider"]')) return;
    togglePlay();
    event.preventDefault();
    return;
  }
  if (event.target.closest('[role="slider"]')) return;
  if (event.key === 'ArrowRight') { seek(state.position + 5); event.preventDefault(); }
  if (event.key === 'ArrowLeft') { seek(state.position - 5); event.preventDefault(); }
  if (event.key === 'ArrowUp') { state.volume = clamp(state.volume + 0.05, 0, 1); state.muted = false; renderVolume(); event.preventDefault(); }
  if (event.key === 'ArrowDown') { state.volume = clamp(state.volume - 0.05, 0, 1); renderVolume(); event.preventDefault(); }
  if (event.key.toLowerCase() === 'm') { state.muted = !state.muted; renderVolume(); }
  if (event.key.toLowerCase() === 'q') { setSheet(!sheet.classList.contains('is-open')); }
});

/* ---------- 启动 ---------- */

TRACKS.forEach((item) => { const image = new Image(); image.src = item.cover; });

renderTrack();
renderVolume();
setInterval(tick, 200);
