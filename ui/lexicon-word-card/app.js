'use strict';

/* data.js 只负责内容；此文件只管理词组、阅读状态与点击交互。 */
const WORDS = LEXICON_DATA.groups.flatMap((group) => group.words);
let wordOffset = 0;
const COLLECTIONS = LEXICON_DATA.groups.map((group) => ({
  ...group,
  order: group.words.map(() => wordOffset++),
}));
const GRADES = [
  { id: 1, label: '再学', icon: 'refresh' },
  { id: 2, label: '模糊', icon: 'cloud' },
  { id: 3, label: '记得', icon: 'check' },
  { id: 4, label: '熟练', icon: 'checks' },
];
const $ = (id) => document.getElementById(id);
const el = Object.fromEntries([
  'sheet', 'study', 'reader', 'folioTop', 'collectionSelect', 'wordIpa', 'saveBtn',
  'word', 'posZh', 'speakBtn', 'speakLabel', 'recall', 'recallQuestion', 'recallInitial',
  'detail', 'detailInner', 'defZh', 'defEn', 'example', 'exampleNote', 'noteLineage',
  'noteCollocations', 'noteSynonyms', 'assessmentLabel', 'counter', 'total', 'ticks',
  'progressLabel', 'grades', 'prevBtn', 'nextBtn', 'flipBtn', 'flipLabel', 'fin',
  'finLead', 'finSummary', 'againBtn', 'nextGroupBtn', 'reviewBtn', 'live',
].map((id) => [id, $(id)]));
const state = {
  collection: 0,
  order: [...COLLECTIONS[0].order],
  pos: 0,
  revealed: false,
  grades: new Map(),
  saved: new Set(),
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 600px)');
const motionTokens = getComputedStyle(document.documentElement);
const NAV_DURATION = parseFloat(motionTokens.getPropertyValue('--motion-feedback'));
const NAV_EASING = motionTokens.getPropertyValue('--ease-out').trim();
const pad = (number) => String(number).padStart(2, '0');
const currentId = () => state.order[state.pos];
const current = () => WORDS[currentId()];
const collection = () => COLLECTIONS[state.collection];
const ratedCount = () => state.order.filter((id) => state.grades.has(id)).length;
const isComplete = () => ratedCount() === state.order.length;
let studyMotion = null;
let activeUtterance = null;

function stopStudyMotion() {
  studyMotion?.cancel();
  studyMotion = null;
}
function finishRevealMotion() {
  el.reader.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
}
function animateStudy(direction, instant) {
  if (instant || reducedMotion.matches || !el.study.animate) {
    stopStudyMotion();
    return;
  }
  const visible = studyMotion?.playState === 'running' ? getComputedStyle(el.study) : null;
  const firstFrame = {
    opacity: visible?.opacity ?? '.65',
    transform: visible?.transform ?? `translateX(${direction * 8}px)`,
  };
  stopStudyMotion();
  const animation = el.study.animate([firstFrame, { opacity: 1, transform: 'translateX(0)' }], {
    duration: NAV_DURATION,
    easing: NAV_EASING,
  });
  studyMotion = animation;
  animation.onfinish = () => { if (studyMotion === animation) studyMotion = null; };
}
function syncSaved() {
  const saved = state.saved.has(currentId());
  const label = saved ? '取消收藏该词' : '收藏该词';
  el.saveBtn.setAttribute('aria-pressed', String(saved));
  el.saveBtn.setAttribute('aria-label', label);
  el.saveBtn.title = label;
}
function syncGrades() {
  const selected = state.grades.get(currentId());
  for (const button of el.grades.children) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.grade) === selected));
  }
  el.assessmentLabel.textContent = selected ? `已记录：${GRADES[selected - 1].label}` : '掌握程度';
  el.assessmentLabel.classList.toggle('is-recorded', Boolean(selected));
}
function nextPosition() {
  if (state.pos < state.order.length - 1) return state.pos + 1;
  return state.order.findIndex((id) => !state.grades.has(id));
}
function syncProgress() {
  const count = ratedCount();
  const total = state.order.length;
  const complete = count === total;
  // 窄屏仅显示当前位置附近七个标记，其余词仍可通过导航完整访问。
  const visibleCount = narrowScreen.matches ? Math.min(7, total) : total;
  const start = Math.max(0, Math.min(state.pos - Math.floor(visibleCount / 2), total - visibleCount));
  [...el.ticks.children].forEach((button, position) => {
    const wordId = state.order[position];
    const picked = state.grades.get(wordId);
    button.hidden = position < start || position >= start + visibleCount;
    if (picked) button.dataset.grade = String(picked);
    else delete button.dataset.grade;
    button.setAttribute('aria-current', String(position === state.pos));
    const label = `${WORDS[wordId].word}，${picked ? GRADES[picked - 1].label : '未自评'}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  });
  el.ticks.setAttribute('aria-label', `本组词条，第 ${start + 1} 至 ${start + visibleCount} 个`);
  el.counter.textContent = pad(state.pos + 1);
  el.total.textContent = `/ ${pad(total)}`;
  el.progressLabel.textContent = complete ? '查看本组结果' : `已记录 ${count}/${total}`;
  el.progressLabel.disabled = !complete;
  el.progressLabel.setAttribute('aria-label', complete ? '全部词条已自评，查看本组结果' : `已自评 ${count} 个，共 ${total} 个`);
  el.prevBtn.disabled = state.pos === 0;
  const showResults = complete && state.pos === total - 1;
  const next = nextPosition();
  el.nextBtn.disabled = !showResults && (next === -1 || next === state.pos);
  el.nextBtn.firstElementChild.className = showResults ? 'ti ti-check' : 'ti ti-arrow-right';
  const nextLabel = showResults ? '查看本组结果' : state.pos === total - 1 ? '回到未自评的词' : '下一个词';
  el.nextBtn.setAttribute('aria-label', nextLabel);
  el.nextBtn.title = nextLabel;
}
function setRevealed(value, instant = false) {
  state.revealed = value;
  el.sheet.classList.toggle('is-revealed', value);
  el.detail.inert = !value;
  el.detail.setAttribute('aria-hidden', String(!value));
  el.recall.inert = value;
  el.recall.setAttribute('aria-hidden', String(value));
  el.flipBtn.setAttribute('aria-expanded', String(value));
  el.flipLabel.textContent = value ? '收起释义' : '查看释义';
  if (instant) finishRevealMotion();
}

function setSpeaking(value) {
  el.speakBtn.classList.toggle('is-speaking', value);
  el.speakBtn.setAttribute('aria-pressed', String(value));
  el.speakBtn.setAttribute('aria-label', value ? '停止朗读' : '朗读该词');
  el.speakLabel.textContent = value ? '停止' : '朗读';
}
function stopSpeaking() {
  activeUtterance = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setSpeaking(false);
}
function speak() {
  if (!('speechSynthesis' in window)) return;
  if (activeUtterance) { stopSpeaking(); return; }
  const utterance = new SpeechSynthesisUtterance(current().word);
  utterance.lang = 'en-GB';
  utterance.rate = .84;
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang === 'en-GB') || voices.find((voice) => voice.lang.startsWith('en'));
  if (englishVoice) utterance.voice = englishVoice;
  const complete = (failed = false) => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    setSpeaking(false);
    if (failed) el.live.textContent = '朗读暂不可用，请检查浏览器语音设置。';
  };
  utterance.onend = () => complete();
  utterance.onerror = () => complete(true);
  activeUtterance = utterance;
  setSpeaking(true);
  try { window.speechSynthesis.speak(utterance); }
  catch { complete(true); }
}
function renderExample(text) {
  el.example.replaceChildren();
  text.split(/(\{\{.*?\}\})/g).forEach((part) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      const emphasis = document.createElement('em');
      emphasis.textContent = part.slice(2, -2);
      el.example.appendChild(emphasis);
    } else el.example.appendChild(document.createTextNode(part));
  });
}
function render({ direction = 1, instant = true, revealed = false } = {}) {
  const word = current();
  stopSpeaking();
  setRevealed(false, true);
  el.folioTop.textContent = `词条 ${String(LEXICON_DATA.startNumber + currentId()).padStart(3, '0')}`;
  el.wordIpa.textContent = word.ipa;
  el.word.textContent = word.word;
  el.word.dataset.length = word.word.length > 13 ? 'long' : 'normal';
  el.posZh.textContent = word.posZh;
  el.recallQuestion.textContent = word.recall;
  el.recallInitial.textContent = word.word[0].toUpperCase();
  el.defZh.textContent = word.defZh;
  el.defEn.textContent = word.defEn;
  renderExample(word.example);
  el.exampleNote.textContent = collection().register;
  el.noteLineage.textContent = word.lineage;
  el.noteCollocations.replaceChildren(...word.collocations.map((text) => {
    const line = document.createElement('span');
    line.className = 'collocation';
    line.textContent = text;
    return line;
  }));
  el.noteSynonyms.textContent = word.synonyms;
  el.study.scrollTop = 0;
  el.detailInner.scrollTop = 0;
  syncSaved();
  syncGrades();
  syncProgress();
  if (revealed) setRevealed(true, true);
  animateStudy(direction, instant);
  el.live.textContent = `${collection().name}，第 ${state.pos + 1} 个词，${word.word}`;
}
function goTo(position, instant = false) {
  if (position < 0 || position >= state.order.length || position === state.pos || !el.fin.hidden) return;
  const direction = position > state.pos ? 1 : -1;
  state.pos = position;
  render({ direction, instant });
}
function next(instant = false) {
  if (state.pos === state.order.length - 1 && isComplete()) showFin();
  else goTo(nextPosition(), instant);
}
function grade(id, instant = false) {
  if (!el.fin.hidden || !GRADES.some((item) => item.id === id)) return;
  state.grades.set(currentId(), id);
  // 点击即可自评；尚未查看答案时同步揭示，结果停留供用户对照。
  if (!state.revealed) setRevealed(true, instant);
  syncGrades();
  syncProgress();
  el.live.textContent = `${current().word} 已记为「${GRADES[id - 1].label}」`;
}
function showFin() {
  if (!isComplete()) return;
  stopSpeaking();
  stopStudyMotion();
  const counts = GRADES.map((item) => state.order.filter((id) => state.grades.get(id) === item.id).length);
  const weak = counts[0] + counts[1];
  el.finLead.textContent = weak
    ? `「${collection().name}」的 ${state.order.length} 个词已完成自评，其中 ${weak} 个需要巩固。再次学习时，会优先复习这些词。`
    : `「${collection().name}」已全部达到「记得」以上。可以继续下一组，或再次回忆。`;
  el.finSummary.replaceChildren(...GRADES.map((item, index) => {
    const line = document.createElement('li');
    const count = document.createElement('b');
    count.textContent = `${counts[index]} 个`;
    line.append(document.createTextNode(item.label), count);
    return line;
  }));
  el.nextGroupBtn.textContent = state.collection === COLLECTIONS.length - 1 ? '回到第一组' : '下一组';
  el.fin.hidden = false;
  el.saveBtn.hidden = true;
  el.sheet.classList.add('is-fin');
  el.againBtn.focus({ preventScroll: true });
  el.live.textContent = '本组学习完成';
}
function hideFin() {
  el.sheet.classList.remove('is-fin');
  el.fin.hidden = true;
  el.saveBtn.hidden = false;
}
function review() {
  hideFin();
  render({ revealed: true });
  el.flipBtn.focus({ preventScroll: true });
}
function restart() {
  const weak = state.order.filter((id) => state.grades.get(id) <= 2);
  const steady = state.order.filter((id) => state.grades.get(id) > 2);
  state.order = weak.concat(steady);
  state.order.forEach((id) => state.grades.delete(id));
  state.pos = 0;
  hideFin();
  render();
  el.flipBtn.focus({ preventScroll: true });
  el.live.textContent = '开始巩固本组，先复习需要加强的词';
}
function buildTicks() {
  el.ticks.replaceChildren(...state.order.map((_, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tick';
    button.addEventListener('click', (event) => goTo(position, event.detail === 0));
    return button;
  }));
}
function switchCollection(index) {
  if (!COLLECTIONS[index]) return;
  stopStudyMotion();
  hideFin();
  state.collection = index;
  state.order = [...collection().order];
  const firstUnrated = state.order.findIndex((id) => !state.grades.has(id));
  state.pos = firstUnrated === -1 ? 0 : firstUnrated;
  el.collectionSelect.value = String(index);
  buildTicks();
  render();
}

GRADES.forEach((item) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'grade';
  button.dataset.grade = String(item.id);
  button.setAttribute('aria-label', `记为${item.label}`);
  const icon = document.createElement('i');
  icon.className = `ti ti-${item.icon}`;
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = item.label;
  button.append(icon, label);
  button.addEventListener('click', (event) => grade(item.id, event.detail === 0));
  el.grades.appendChild(button);
});
COLLECTIONS.forEach((group, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = group.name;
  el.collectionSelect.appendChild(option);
});
el.collectionSelect.title = `${WORDS.length} 个词，${COLLECTIONS.length} 个主题组`;
el.collectionSelect.addEventListener('change', () => switchCollection(Number(el.collectionSelect.value)));
el.flipBtn.addEventListener('click', (event) => setRevealed(!state.revealed, event.detail === 0));
el.speakBtn.addEventListener('click', speak);
el.saveBtn.addEventListener('click', () => {
  const id = currentId();
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  syncSaved();
  el.live.textContent = state.saved.has(id) ? `${current().word} 已收藏` : `${current().word} 已取消收藏`;
});
el.prevBtn.addEventListener('click', (event) => goTo(state.pos - 1, event.detail === 0));
el.nextBtn.addEventListener('click', (event) => next(event.detail === 0));
el.progressLabel.addEventListener('click', showFin);
el.againBtn.addEventListener('click', restart);
el.nextGroupBtn.addEventListener('click', () => {
  switchCollection((state.collection + 1) % COLLECTIONS.length);
  el.flipBtn.focus({ preventScroll: true });
});
el.reviewBtn.addEventListener('click', review);
// 不注册自定义快捷键；按钮保留浏览器原生的聚焦和激活行为。
narrowScreen.addEventListener('change', syncProgress);
reducedMotion.addEventListener('change', () => {
  stopStudyMotion();
  finishRevealMotion();
});
window.addEventListener('pagehide', () => {
  stopStudyMotion();
  stopSpeaking();
});
if (!('speechSynthesis' in window)) {
  el.speakBtn.disabled = true;
  el.speakBtn.title = '当前浏览器不支持朗读';
}
buildTicks();
render();
