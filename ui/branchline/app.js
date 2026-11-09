const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const icon = (name) => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const timeOrigin = Date.now();
const ago = (minutes) => timeOrigin - minutes * 60000;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function makeFile(id, path, lines, staged = false, status = 'M', start = 1) {
  return { id, path, staged, status, start, lines: lines.map((line) => ({ type: line[0] === '+' ? 'add' : line[0] === '-' ? 'remove' : 'context', text: line.slice(1) })) };
}

const workingFiles = [
  makeFile('repository', 'src/workspace/repository.ts', [
    " import { workspace } from './store';", " import { git } from '../services/git';", ' ',
    ' export async function switchRepository(id: string) {',
    '-  const repository = await git.open(id);', '+  const repository = await git.open(id, {', '+    preserveChanges: true,', '+    restoreSelection: true,', '+  });', ' ',
    '-  workspace.setActive(repository);', '+  workspace.setActiveRepository(repository);', '+  workspace.history.restore(repository.id);', '   return repository;', ' }', ' ',
    '+export function getRecentRepositories() {', '+  return workspace.repositories.slice(0, 8);', '+}',
  ], true, 'M', 24),
  makeFile('palette', 'src/commands/palette.ts', [
    " import { commands } from './registry';", ' ', ' export function searchCommands(query: string) {',
    '-  return commands.filter(command => command.name.includes(query));', '+  const keyword = query.trim().toLowerCase();', '+  return commands.filter(command =>', '+    command.name.toLowerCase().includes(keyword)', '+  );', ' }', ' ',
    '+export function openCommandPalette() {', "+  window.dispatchEvent(new Event('commands:open'));", '+}',
  ], true, 'M', 12),
  makeFile('tokens', 'src/styles/tokens.css', [
    ' :root {', '-  --panel-radius: 6px;', '+  --panel-radius: 8px;', '   --panel-padding: 16px;', '-  --focus-color: #8b929a;', '+  --focus-color: #cb572e;', '+  --selection-background: #f8e9e1;', ' }',
  ], false, 'M', 18),
  makeFile('shortcuts', 'docs/keyboard-shortcuts.md', [
    '+# 键盘快捷键', '+', '+| 操作 | 快捷键 |', '+| --- | --- |', '+| 打开命令面板 | Ctrl + K |', '+| 查找提交 | Ctrl + F |', '+| 提交暂存的更改 | Ctrl + Enter |',
  ], false, 'A'),
];

const people = { LQ: { name: '林乔', initials: 'LQ' }, WX: { name: '王旭', initials: 'WX' }, AK: { name: 'Alex Kim', initials: 'AK' } };
const initialCommits = [
  { id: '9a4e812', subject: 'feat: 支持命令面板与仓库快捷切换', author: 'LQ', time: ago(12), lane: 0, parents: ['f32ab9e'], files: structuredClone(workingFiles.slice(0, 2)) },
  { id: 'f32ab9e', subject: "Merge branch 'feature/command-menu'", author: 'LQ', time: ago(43), lane: 0, parents: ['7d6e2af', 'c82d104'], files: structuredClone(workingFiles.slice(0, 2)) },
  { id: '7d6e2af', subject: 'feat: 新增全局快捷指令', author: 'WX', time: ago(58), lane: 1, parents: ['a1e2b39'], files: structuredClone([workingFiles[1]]) },
  { id: 'c82d104', subject: 'fix: 修复窗口切换后的焦点丢失', author: 'AK', time: ago(92), lane: 0, parents: ['bc49d2a'], files: structuredClone([workingFiles[0]]) },
  { id: 'a1e2b39', subject: 'feat: 支持多仓库工作区', author: 'WX', time: ago(127), lane: 1, parents: ['bc49d2a'], files: structuredClone([workingFiles[0]]) },
  { id: 'bc49d2a', subject: 'refactor: 统一工作区状态管理', author: 'LQ', time: ago(186), lane: 0, parents: ['e4319a7'], files: structuredClone([workingFiles[2]]) },
  { id: '0d1f738', subject: 'chore: 发布 v1.8.0', author: 'AK', time: ago(1390), lane: 2, parents: ['e4319a7'], files: structuredClone([workingFiles[3]]) },
  { id: 'e4319a7', subject: 'style: 调整面板间距与聚焦状态', author: 'LQ', time: ago(1480), lane: 0, parents: ['16bdc8e'], files: structuredClone([workingFiles[2]]) },
  { id: '16bdc8e', subject: 'chore: 初始化项目结构', author: 'LQ', time: ago(2980), lane: 0, parents: [], files: structuredClone([workingFiles[3]]) },
];

function createRepository(id, name, path, commits, files, branches) {
  return {
    id, name, path, remote: commits.length ? `git@github.com:orbit-dev/${name}.git` : '', commits, files, branches, current: 'main', ahead: commits.length ? 1 : 0,
    remoteHead: commits[1]?.id || null, busyCommit: false, busyRemote: false, connectionError: '', authorName: '林乔', authorEmail: 'lin.qiao@orbit.dev',
    draft: { subject: '', description: '' }, stashes: [],
    ui: { view: 'history', selectedCommit: commits[0]?.id || null, selectedChange: files[0]?.id || null, selectedPreviewFile: null, selectedStash: null, selectedStashFile: null, query: '', filter: 'all', branchForm: false, expanded: false, historyScroll: 0, settingsDraft: null, settingsError: '', settingsResult: '' },
  };
}

const orbit = createRepository('orbit', 'orbit-web', '~/Projects/orbit-web', structuredClone(initialCommits), structuredClone(workingFiles), [
  { name: 'main', head: '9a4e812', lane: 0, protected: true },
  { name: 'feature/command-menu', head: '7d6e2af', lane: 1 },
  { name: 'release/1.8', head: '0d1f738', lane: 2 },
]);
orbit.stashes = [{ id: 'stash-layout', message: '调整设置页布局', branch: 'main', time: ago(1610), files: structuredClone([workingFiles[2]]) }];
orbit.ui.selectedStash = 'stash-layout';
const spectraCommits = [
  { id: '52daba7', subject: 'feat: 增加表单控件与键盘导航', author: 'WX', time: ago(81), lane: 0, parents: ['ef9203b'], files: structuredClone([workingFiles[2]]) },
  { id: 'ef9203b', subject: 'style: 统一组件聚焦边界', author: 'LQ', time: ago(330), lane: 0, parents: [], files: structuredClone([workingFiles[2]]) },
];
const spectra = createRepository('spectra', 'spectra-ui', '~/Projects/spectra-ui', spectraCommits, [], [{ name: 'main', head: '52daba7', lane: 0, protected: true }]);
const docs = createRepository('docs', 'orbit-docs', '~/Projects/orbit-docs', [], [makeFile('readme', 'README.md', ['+# Orbit 文档', '+', '+产品文档与开发规范。'], false, 'A')], [{ name: 'main', head: null, lane: 0, protected: true }]);
const state = { repositories: [orbit, spectra, docs], active: 'orbit', graph: true, split: false, wrapped: false, theme: 'light', menuAnchor: null, dialogReturn: null, dialogContext: null, toastTimer: null };
const repository = () => state.repositories.find((item) => item.id === state.active);
const selectedCommit = (repo = repository()) => repo.commits.find((commit) => commit.id === repo.ui.selectedCommit);
const branch = (repo = repository()) => repo.branches.find((item) => item.name === repo.current);
const basename = (path) => path.split('/').pop();
const parentPath = (path) => path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '根目录';
const fileCounts = (files) => files.reduce((result, file) => { result.add += file.lines.filter((line) => line.type === 'add').length; result.remove += file.lines.filter((line) => line.type === 'remove').length; return result; }, { add: 0, remove: 0 });
const countMarkup = (files) => { const count = fileCounts(files); return `<span class="line-counts"><span class="add-count">+${count.add}</span><span class="remove-count">−${count.remove}</span></span>`; };
const currentPerson = (commit) => commit.person || people[commit.author];
const avatarMarkup = (person) => `<span class="avatar" data-person="${escapeHTML(person.initials)}">${escapeHTML(person.initials)}</span>`;
const freshId = () => [...crypto.getRandomValues(new Uint8Array(4))].map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, 7);

function relativeTime(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`;
  if (minutes < 2880) return '昨天';
  return `${Math.floor(minutes / 1440)} 天前`;
}

function notify(message, error = false) {
  clearTimeout(state.toastTimer);
  $('#toast > span').textContent = message;
  $('#toast > .ti').className = `ti ti-${error ? 'alert-circle' : 'circle-check'}`;
  $('#toast').classList.add('is-visible');
  state.toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3600);
}

function emptyState(title, message, action = '', label = '', symbol = 'git-commit') {
  return `<div class="empty-state">${icon(symbol)}<h3>${escapeHTML(title)}</h3>${message ? `<p>${escapeHTML(message)}</p>` : ''}${action ? `<button class="button compact" data-action="${action}">${escapeHTML(label)}</button>` : ''}</div>`;
}

function renderSidebar() {
  const repo = repository();
  $('#repository-list').innerHTML = state.repositories.map((item) => `<button class="repository-item ${item.id === repo.id ? 'is-active' : ''}" data-action="select-repository" data-id="${escapeHTML(item.id)}" ${item.id === repo.id ? 'aria-current="true"' : ''} title="${escapeHTML(item.path)}">${icon('folder')}<span class="repo-label">${escapeHTML(item.name)}</span>${item.files.length ? '<span class="repo-dirty-dot" aria-label="有未提交更改"></span>' : ''}</button>`).join('');
  const views = [['history', 'git-branch', '提交历史'], ['changes', 'files', '本地更改', repo.files.length], ['branches', 'git-fork', '分支管理'], ['stashes', 'archive', '贮藏', repo.stashes.length]];
  $('#view-navigation').innerHTML = views.map(([id, symbol, label, count]) => `<button class="nav-item ${repo.ui.view === id ? 'is-active' : ''}" data-action="view" data-view="${id}" ${repo.ui.view === id ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span>${count !== undefined ? `<span class="count-badge">${count}</span>` : ''}</button>`).join('');
  $('#sidebar-branches').innerHTML = repo.branches.map((item) => `<button class="sidebar-branch ${repo.current === item.name ? 'is-current' : ''}" data-lane="${item.lane}" data-action="checkout" data-name="${escapeHTML(item.name)}" title="${escapeHTML(item.name)}" ${repo.current === item.name ? 'aria-current="true"' : ''} ${repo.busyCommit ? 'disabled' : ''}><span class="branch-dot"></span><span class="branch-name">${escapeHTML(item.name)}</span>${repo.current === item.name ? icon('check') : ''}</button>`).join('');
  $('#repository-name').textContent = repo.name;
  $('#current-branch').innerHTML = `${icon('git-branch')}<span>${escapeHTML(repo.current)}</span>${icon('chevron-down')}`;
  $('#current-branch').title = repo.current;
  $('#current-branch').disabled = repo.busyCommit;
  $('#ahead-count').textContent = repo.ahead;
  $('#ahead-count').hidden = !repo.ahead;
  $('#status-branch').textContent = repo.current;
  $('#status-text').textContent = repo.busyCommit ? '正在创建提交…' : repo.files.length ? `${repo.files.length} 个文件有更改` : '工作区干净';
  const banner = $('#connection-banner');
  banner.hidden = !repo.connectionError;
  banner.innerHTML = repo.connectionError ? `${icon('cloud-off')}<span>${escapeHTML(repo.connectionError)}</span><button data-action="show-settings">检查设置</button><button class="icon-button small" data-action="dismiss-connection-error" aria-label="关闭连接提示">${icon('x')}</button>` : '';
  $$('.sync-button').forEach((button) => { button.disabled = Boolean(repo.busyRemote); button.classList.toggle('is-loading', button.dataset.operation === repo.busyRemote); button.setAttribute('aria-busy', button.dataset.operation === repo.busyRemote); });
}

function saveScroll() {
  const scroll = $('.history-scroll');
  if (scroll) repository().ui.historyScroll = scroll.scrollTop;
}

function setView(view) {
  saveScroll();
  closePopover();
  hideGraphTooltip();
  repository().ui.view = view;
  $('.canvas').classList.remove('sidebar-open');
  $('.mobile-menu').setAttribute('aria-expanded', 'false');
  render();
}

function render() {
  renderSidebar();
  const view = repository().ui.view;
  if (view === 'history') renderHistory();
  if (view === 'changes') renderChanges();
  if (view === 'branches') renderBranches();
  if (view === 'stashes') renderStashes();
  if (view === 'settings') renderSettings();
}

function segmentedMarkup(kind, first, second, selected, labels = true) {
  const [left, right] = [first, second];
  return `<div class="segmented" data-selected="${selected ? 1 : 0}"><span class="segmented-slider" aria-hidden="true"></span><button data-action="${kind}" data-value="0" aria-pressed="${!selected}" aria-label="${left[1]}">${labels ? left[1] : icon(left[0])}</button><button data-action="${kind}" data-value="1" aria-pressed="${selected}" aria-label="${right[1]}">${labels ? right[1] : icon(right[0])}</button></div>`;
}

function renderHistory() {
  const repo = repository();
  $('#view-root').innerHTML = `<section class="history-view ${repo.ui.expanded ? 'is-expanded' : ''}"><header class="view-toolbar"><div class="toolbar-start"><h2 class="view-title">提交历史</h2><button class="filter-trigger" data-menu="filter" aria-haspopup="menu" aria-expanded="false">${icon('filter')}<span>${escapeHTML(repo.ui.filter === 'all' ? '所有分支' : repo.ui.filter)}</span>${icon('chevron-down')}</button></div><div class="toolbar-end"><label class="search-field">${icon('search')}<input id="history-search" type="search" placeholder="搜索提交" aria-label="搜索提交、作者或哈希" value="${escapeHTML(repo.ui.query)}"></label>${segmentedMarkup('history-mode', ['git-branch', '图谱视图'], ['list', '列表视图'], !state.graph, false)}</div></header><div class="history-table ${!state.graph ? 'is-list' : ''}" role="table" aria-label="提交历史"><div class="history-columns" role="row"><span class="graph-column" role="columnheader">图谱</span><span role="columnheader">提交说明</span><span class="author-column" role="columnheader">作者</span><span role="columnheader">哈希</span><span class="time-column" role="columnheader">时间</span></div><div class="history-scroll scroll-area"><div id="history-rows" class="history-rows" role="rowgroup"></div></div><div class="graph-legend"><div class="legend-items"><span><i class="legend-dot"></i>main</span><span><i class="legend-dot feature"></i>feature</span><span><i class="legend-dot release"></i>release</span></div><span class="graph-total" id="history-total"></span></div></div><section id="commit-preview" class="commit-preview" aria-label="提交详情"></section></section>`;
  renderHistoryRows();
  $('.history-scroll').scrollTop = repo.ui.historyScroll;
}

function filteredCommits() {
  const repo = repository();
  let commits = repo.commits;
  if (repo.ui.filter !== 'all') {
    const head = repo.branches.find((item) => item.name === repo.ui.filter)?.head;
    const reachable = new Set();
    const visit = (id) => { if (!id || reachable.has(id)) return; reachable.add(id); repo.commits.find((item) => item.id === id)?.parents.forEach(visit); };
    visit(head);
    commits = commits.filter((item) => reachable.has(item.id));
  }
  const query = repo.ui.query.trim().toLowerCase();
  return commits.filter((item) => `${item.subject} ${item.id} ${currentPerson(item).name}`.toLowerCase().includes(query));
}

function commitRefs(commit) {
  const repo = repository();
  const names = repo.branches.filter((item) => item.head === commit.id);
  const refs = names.map((item) => `<span class="commit-ref ${item.name === repo.current ? 'is-head' : ''}" title="${escapeHTML(item.name)}">${icon(item.name === repo.current ? 'git-branch' : item.lane === 2 ? 'tag' : 'git-fork')}<span>${escapeHTML(item.name === repo.current ? 'HEAD · ' + item.name : item.name)}</span></span>`);
  if (repo.remoteHead === commit.id) refs.push(`<span class="commit-ref">${icon('cloud')}<span>origin/main</span></span>`);
  return refs.join('');
}

function renderHistoryRows() {
  const repo = repository();
  const commits = filteredCommits();
  const rows = $('#history-rows');
  if (!rows) return;
  if (commits.length && !commits.some((item) => item.id === repo.ui.selectedCommit)) repo.ui.selectedCommit = commits[0].id;
  rows.innerHTML = commits.length ? `<svg class="commit-graph" aria-hidden="true"></svg>${commits.map((commit) => { const person = currentPerson(commit); return `<div class="history-row ${repo.ui.selectedCommit === commit.id ? 'is-selected' : ''}" data-action="select-commit" data-id="${commit.id}" role="row" tabindex="0" aria-selected="${repo.ui.selectedCommit === commit.id}"><div class="graph-cell" role="cell" aria-label="${['main', 'feature', 'release'][commit.lane]}，${commit.parents.length} 个父提交"><span class="graph-node ${commit.parents.length > 1 ? 'is-merge' : ''}" data-lane="${commit.lane}"></span></div><div class="commit-subject" role="cell" title="${escapeHTML(commit.subject)}"><span class="commit-message">${escapeHTML(commit.subject)}</span>${commitRefs(commit)}</div><div class="author-cell" role="cell">${avatarMarkup(person)}<span>${escapeHTML(person.name)}</span></div><div role="cell"><button class="commit-hash" data-action="copy-hash" data-id="${commit.id}" aria-label="复制提交哈希 ${commit.id}">${commit.id}</button></div><span class="time-cell" role="cell">${relativeTime(commit.time)}</span></div>`; }).join('')}` : emptyState(repo.commits.length ? '没有匹配的提交' : '还没有提交记录', repo.commits.length ? '换一个关键词，或查看所有分支。' : '提交第一个文件，开始记录项目的变化。', repo.commits.length ? 'clear-search' : 'show-changes', repo.commits.length ? '清除筛选' : '查看本地更改');
  $('#history-total').textContent = `${commits.length} 条提交`;
  renderGraph();
  renderCommitPreview(commits.length ? selectedCommit(repo) : null);
}

function renderGraph() {
  const svg = $('.commit-graph');
  if (!svg) return;
  const commits = filteredCommits();
  const indexes = new Map(commits.map((commit, index) => [commit.id, index]));
  const rowHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--history-row'));
  const width = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-width'));
  const step = width < 80 ? 17 : 23;
  const x = (lane) => 28 + lane * step;
  const y = (index) => index * rowHeight + rowHeight / 2;
  const visibleParents = (id, seen = new Set()) => { if (!id || seen.has(id)) return []; seen.add(id); if (indexes.has(id)) return [id]; return repository().commits.find((item) => item.id === id)?.parents.flatMap((parent) => visibleParents(parent, seen)) || []; };
  const paths = [];
  commits.forEach((commit, index) => commit.parents.forEach((parentId) => visibleParents(parentId).forEach((id) => {
    const parentIndex = indexes.get(id);
    if (parentIndex <= index) return;
    const parent = commits[parentIndex];
    const [x1, y1, x2, y2] = [x(commit.lane), y(index), x(parent.lane), y(parentIndex)];
    const lane = commit.lane === parent.lane ? commit.lane : Math.max(commit.lane, parent.lane);
    const curve = x1 === x2 ? `M${x1},${y1} V${y2}` : `M${x1},${y1} C${x1},${y1 + 23} ${x2},${y2 - 23} ${x2},${y2}`;
    paths.push(`<path data-lane="${lane}" d="${curve}"/>`);
  })));
  svg.setAttribute('viewBox', `0 0 ${width} ${Math.max(rowHeight, commits.length * rowHeight)}`);
  svg.style.height = `${commits.length * rowHeight}px`;
  svg.innerHTML = paths.join('');
}

function fileListMarkup(files, selected, action) {
  return files.map((file) => `<button class="file-item ${file.id === selected ? 'is-selected' : ''}" data-action="${action}" data-id="${escapeHTML(file.id)}" title="${escapeHTML(file.path)}" aria-pressed="${file.id === selected}">${icon(file.path.endsWith('.md') ? 'markdown' : file.path.endsWith('.css') ? 'file-type-css' : 'file-code')}<span class="file-name">${escapeHTML(basename(file.path))}</span><span class="file-status ${file.status === 'A' ? 'is-added' : file.status === 'D' ? 'is-deleted' : ''}">${file.status}</span></button>`).join('');
}

function renderCommitPreview(commit) {
  const target = $('#commit-preview');
  if (!target) return;
  if (!commit) { target.innerHTML = emptyState('选择一条提交', '在这里查看文件与代码的变化。', '', '', 'file-diff'); return; }
  const repo = repository();
  if (!commit.files.some((file) => file.id === repo.ui.selectedPreviewFile)) repo.ui.selectedPreviewFile = commit.files[0]?.id;
  const person = currentPerson(commit);
  target.innerHTML = `<header class="preview-heading"><div><h2 title="${escapeHTML(commit.subject)}">${escapeHTML(commit.subject)}</h2><div class="commit-meta">${icon('git-commit')}<span>${commit.id}</span><span>·</span><span>${escapeHTML(person.name)}</span><span>·</span><span>${relativeTime(commit.time)}</span><span>·</span><span>${commit.files.length} 个文件</span></div></div><div class="preview-actions">${countMarkup(commit.files)}<button class="icon-button" data-action="export-patch" aria-label="导出此提交的补丁" title="导出补丁">${icon('download')}</button><button class="icon-button" data-action="expand-diff" aria-label="${repo.ui.expanded ? '返回提交图谱' : '展开代码差异'}" title="${repo.ui.expanded ? '返回图谱' : '展开差异'}">${icon(repo.ui.expanded ? 'arrows-minimize' : 'arrows-maximize')}</button></div></header><div class="diff-layout"><div class="file-tree scroll-area"><div class="tree-heading"><span>变更文件</span>${countMarkup(commit.files)}</div>${fileListMarkup(commit.files, repo.ui.selectedPreviewFile, 'preview-file')}</div><div class="diff-panel" id="preview-diff"></div></div>`;
  renderDiff($('#preview-diff'), commit.files.find((file) => file.id === repo.ui.selectedPreviewFile));
}

function highlightCode(text) {
  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\/\/.*$|\b(?:const|let|return|export|import|from|async|await|function|if|true|false|new|type|string|number)\b|\b\d+\b)/g;
  let position = 0;
  let result = '';
  for (const match of text.matchAll(pattern)) {
    result += escapeHTML(text.slice(position, match.index));
    const token = match[0];
    const kind = token.startsWith('//') ? 'comment' : /^['"`]/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
    result += `<span class="syntax-${kind}">${escapeHTML(token)}</span>`;
    position = match.index + token.length;
  }
  return result + escapeHTML(text.slice(position));
}

function numberedLines(file) {
  let oldLine = file.start;
  let newLine = file.start;
  return file.lines.map((line) => ({ ...line, old: line.type === 'add' ? '' : oldLine++, new: line.type === 'remove' ? '' : newLine++ }));
}

function splitLines(lines) {
  const result = [];
  for (let index = 0; index < lines.length;) {
    if (lines[index].type === 'context') { result.push([lines[index], lines[index]]); index++; continue; }
    const removed = [];
    const added = [];
    while (index < lines.length && lines[index].type !== 'context') { (lines[index].type === 'remove' ? removed : added).push(lines[index]); index++; }
    for (let pair = 0; pair < Math.max(removed.length, added.length); pair++) result.push([removed[pair], added[pair]]);
  }
  return result;
}

function renderDiff(target, file) {
  if (!target) return;
  if (!file) { target.innerHTML = emptyState('没有文件差异', '', '', '', 'file-check'); return; }
  const numbered = numberedLines(file);
  const lineMarkup = state.split ? splitLines(numbered).map(([left, right]) => `<div class="split-row">${[left, right].map((line, side) => `<div class="split-code ${line?.type === 'add' ? 'is-add' : line?.type === 'remove' ? 'is-remove' : ''}"><span class="line-number">${line ? side === 0 ? line.old : line.new : ''}</span><span class="code-text">${line ? highlightCode(line.text) : ''}</span></div>`).join('')}</div>`).join('') : numbered.map((line) => `<div class="code-row ${line.type === 'add' ? 'is-add' : line.type === 'remove' ? 'is-remove' : ''}"><span class="line-number">${line.old}</span><span class="line-number">${line.new}</span><span class="line-marker">${line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ''}</span><span class="code-text">${highlightCode(line.text)}</span></div>`).join('');
  const oldCount = file.lines.filter((line) => line.type !== 'add').length;
  const newCount = file.lines.filter((line) => line.type !== 'remove').length;
  target.innerHTML = `<header class="diff-toolbar"><span class="diff-path" title="${escapeHTML(file.path)}">${escapeHTML(file.path)}</span><div class="diff-tools">${segmentedMarkup('diff-mode', ['', '统一'], ['', '并排'], state.split)}<button class="icon-button small" data-action="wrap-diff" aria-label="切换代码自动换行" aria-pressed="${state.wrapped}" title="自动换行">${icon('text-wrap')}</button></div></header><div class="diff-scroll scroll-area"><div class="diff-content ${state.wrapped ? 'is-wrapped' : ''}"><div class="diff-hunk">@@ −${oldCount ? file.start : 0},${oldCount} +${file.start},${newCount} @@</div>${lineMarkup}</div></div>`;
}

function rerenderDiff() {
  const repo = repository();
  if (repo.ui.view === 'history') renderDiff($('#preview-diff'), selectedCommit()?.files.find((file) => file.id === repo.ui.selectedPreviewFile));
  if (repo.ui.view === 'changes') renderChangeDetail();
  if (repo.ui.view === 'stashes') renderStashDetail();
}

function renderChanges() {
  const repo = repository();
  $('#view-root').innerHTML = `<section class="changes-view"><aside class="changes-sidebar"><div class="changes-heading"><h2>本地更改</h2><span>${repo.files.length} 个文件</span></div><div id="change-files" class="change-files scroll-area"></div><form class="commit-form" id="commit-form" novalidate><div class="commit-form-label"><label for="commit-subject">提交到 ${escapeHTML(repo.current)}</label><span id="staged-count"></span></div><input id="commit-subject" name="subject" placeholder="提交说明" aria-label="提交说明" value="${escapeHTML(repo.draft.subject)}" ${repo.busyCommit ? 'disabled' : ''}><textarea id="commit-description" name="description" placeholder="详细描述（可选）" aria-label="提交详细描述" ${repo.busyCommit ? 'disabled' : ''}>${escapeHTML(repo.draft.description)}</textarea><p id="commit-error" class="form-error" role="alert" hidden></p><button id="commit-submit" class="button primary" type="submit">${icon('git-commit')}<span>提交暂存的更改</span></button><div class="commit-form-footer"><button type="button" data-action="stash-changes" ${!repo.files.length || repo.busyCommit ? 'disabled' : ''}>${icon('archive')} 贮藏更改</button><kbd>Ctrl ↵</kbd></div></form></aside><section id="change-detail" class="change-detail" aria-label="文件差异"></section></section>`;
  renderChangeFiles();
}

function renderChangeFiles() {
  const repo = repository();
  if (!repo.files.some((file) => file.id === repo.ui.selectedChange)) repo.ui.selectedChange = repo.files[0]?.id || null;
  $('#change-files').innerHTML = repo.files.length ? [false, true].map((staged) => {
    const files = repo.files.filter((file) => file.staged === staged);
    return `<div class="change-group-heading"><span>${staged ? '已暂存' : '未暂存'} <b>${files.length}</b></span><button data-action="stage-all" data-value="${staged ? 0 : 1}" ${!files.length || repo.busyCommit ? 'disabled' : ''}>${staged ? '全部取消' : '全部暂存'}</button></div>${files.map((file) => `<div class="change-row ${repo.ui.selectedChange === file.id ? 'is-selected' : ''}"><input type="checkbox" data-stage-id="${escapeHTML(file.id)}" aria-label="暂存 ${escapeHTML(file.path)}" ${file.staged ? 'checked' : ''} ${repo.busyCommit ? 'disabled' : ''}><button class="file-item" data-action="change-file" data-id="${escapeHTML(file.id)}" title="${escapeHTML(file.path)}">${icon('file-code')}<div><strong>${escapeHTML(basename(file.path))}</strong><span class="file-parent">${escapeHTML(parentPath(file.path))}</span></div><span class="file-status ${file.status === 'A' ? 'is-added' : ''}">${file.status}</span></button></div>`).join('')}`;
  }).join('') : emptyState('工作区干净', '所有更改都已记录。', 'show-history', '查看提交历史', 'circle-check');
  updateCommitButton();
  renderChangeDetail();
}

function updateCommitButton() {
  const button = $('#commit-submit');
  if (!button) return;
  const repo = repository();
  const count = repo.files.filter((file) => file.staged).length;
  $('#staged-count').textContent = `${count} 个文件`;
  button.disabled = repo.busyCommit || !count || !repo.draft.subject.trim();
  $('span', button).textContent = repo.busyCommit ? '正在创建提交…' : `提交 ${count ? count + ' 个文件' : '暂存的更改'}`;
}

function renderChangeDetail() {
  const repo = repository();
  const target = $('#change-detail');
  if (!target) return;
  const file = repo.files.find((item) => item.id === repo.ui.selectedChange);
  if (!file) { target.innerHTML = emptyState('没有未提交的差异', '可以切换到提交历史，查看最近的改动。', 'show-history', '查看提交历史', 'file-check'); return; }
  target.innerHTML = `<header class="change-detail-heading"><div><h2>${escapeHTML(basename(file.path))}</h2><p>${file.staged ? '已加入暂存区' : '尚未暂存'} · ${escapeHTML(parentPath(file.path))}</p></div><div class="preview-actions">${countMarkup([file])}<button class="icon-button" data-action="discard-file" data-id="${escapeHTML(file.id)}" ${repo.busyCommit ? 'disabled' : ''} aria-label="丢弃此文件的更改" title="丢弃更改">${icon('restore')}</button></div></header><div class="diff-panel" id="change-diff"></div>`;
  renderDiff($('#change-diff'), file);
}

async function submitCommit(form) {
  const repo = repository();
  if (repo.busyCommit) return;
  const files = repo.files.filter((file) => file.staged);
  const title = repo.draft.subject.trim();
  if (!title || !files.length) { const error = $('#commit-error'); error.hidden = false; error.textContent = !title ? '请填写提交说明。' : '请先暂存需要提交的文件。'; return; }
  const snapshot = { subject: title, description: repo.draft.description.trim(), files: structuredClone(files), branchName: repo.current, person: { name: repo.authorName, initials: 'LQ' } };
  const head = branch(repo);
  repo.busyCommit = true;
  renderSidebar();
  renderChanges();
  await wait(520);
  const commit = { id: freshId(), subject: snapshot.subject, description: snapshot.description, author: 'LQ', person: snapshot.person, time: Date.now(), lane: head.lane, parents: head.head ? [head.head] : [], files: snapshot.files };
  repo.commits.unshift(commit);
  head.head = commit.id;
  repo.files = repo.files.filter((file) => !snapshot.files.some((submitted) => submitted.id === file.id));
  repo.ahead++;
  repo.draft = { subject: '', description: '' };
  repo.ui.selectedCommit = commit.id;
  repo.ui.selectedPreviewFile = snapshot.files[0]?.id;
  repo.busyCommit = false;
  if (state.active === repo.id) render();
  notify(`已创建提交 ${commit.id} · ${snapshot.files.length} 个文件`);
}

function stashChanges(repo = repository(), message = '') {
  if (!repo.files.length || repo.busyCommit) return null;
  const stash = { id: `stash-${freshId()}`, message: message || `WIP · ${repo.current}`, branch: repo.current, time: Date.now(), files: structuredClone(repo.files) };
  repo.stashes.unshift(stash);
  repo.files = [];
  repo.ui.selectedStash = stash.id;
  repo.ui.selectedStashFile = stash.files[0]?.id;
  return stash;
}

function renderBranches() {
  const repo = repository();
  $('#view-root').innerHTML = `<section class="branches-view"><header class="page-heading"><div><h2>分支管理</h2><p>${repo.branches.length} 个本地分支</p></div><button class="button compact" data-action="new-branch" ${repo.busyCommit ? 'disabled' : ''}>${icon('plus')}新建分支</button></header><form id="branch-create-form" class="branch-create-form" novalidate ${repo.ui.branchForm ? '' : 'hidden'}><label class="field-label" for="branch-name">分支名称</label><div class="branch-form-row"><input id="branch-name" name="name" placeholder="feature/new-feature" autocomplete="off" aria-describedby="branch-error"><button class="button primary" type="submit">创建分支</button><button class="button tertiary" type="button" data-action="cancel-branch">取消</button></div><div class="branch-form-base">${icon('git-branch')}从 ${escapeHTML(repo.current)} ${branch(repo).head ? '· ' + branch(repo).head : ''} 创建</div><p id="branch-error" class="form-error" role="alert" hidden></p></form><div class="branch-table scroll-area"><div class="branch-table-header"><span>分支</span><span>最近提交</span><span>更新</span><span></span></div>${repo.branches.map((item) => { const commit = repo.commits.find((entry) => entry.id === item.head); return `<div class="branch-table-row"><div class="branch-identity" data-lane="${item.lane}"><span class="branch-dot"></span><div><strong title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</strong><small>${item.head || '尚无提交'}</small></div></div><span class="branch-last-commit" title="${escapeHTML(commit?.subject || '')}">${escapeHTML(commit?.subject || '等待第一次提交')}</span><span class="time-cell">${commit ? relativeTime(commit.time) : '—'}</span><div class="branch-row-actions">${item.name === repo.current ? `<span class="current-label">${icon('check')}当前</span>` : `<button class="button compact tertiary" data-action="checkout" data-name="${escapeHTML(item.name)}" ${repo.busyCommit ? 'disabled' : ''}>切换</button>`}<button class="icon-button small" data-action="delete-branch" data-name="${escapeHTML(item.name)}" ${item.name === repo.current || item.protected || repo.busyCommit ? 'disabled' : ''} aria-label="删除分支 ${escapeHTML(item.name)}" title="${item.protected ? '受保护分支' : item.name === repo.current ? '不能删除当前分支' : '删除分支'}">${icon('trash')}</button></div></div>`; }).join('')}</div></section>`;
}

function createBranch(form) {
  const repo = repository();
  const name = form.elements.name.value.trim();
  const error = $('#branch-error');
  const invalid = /[\s~^:?*\[\]\\]/.test(name) || name.includes('..') || name.includes('@{') || name.includes('//') || name === '@' || name.startsWith('/') || name.startsWith('.') || name.endsWith('/') || name.endsWith('.') || name.endsWith('.lock') || name.split('/').some((part) => part.startsWith('.'));
  const message = !name ? '请输入分支名称。' : invalid ? '分支名称不能包含空格或 Git 保留字符。' : repo.branches.some((item) => item.name === name) ? '该分支已存在，请换一个名称。' : !branch(repo).head ? '仓库中还没有提交，请先创建一次提交。' : '';
  if (message) { error.textContent = message; error.hidden = false; return; }
  if (repo.busyCommit) return;
  repo.branches.push({ name, head: branch(repo).head, lane: name.startsWith('release/') ? 2 : 1 });
  repo.current = name;
  repo.ui.branchForm = false;
  render();
  notify(`已创建并切换到 ${name}`);
}

function checkout(name) {
  const repo = repository();
  if (repo.busyCommit || !repo.branches.some((item) => item.name === name)) return;
  if (repo.current === name) { closePopover(); notify(`当前已在 ${name}`); return; }
  closePopover();
  if (repo.files.length) {
    openDialog('保留更改并切换分支', `<p>当前有 ${repo.files.length} 个文件尚未提交。贮藏这些更改后，切换到 <strong>${escapeHTML(name)}</strong>。</p>`, `<button class="button tertiary" data-action="close-dialog">取消</button><button class="button primary" data-action="stash-checkout">贮藏并切换</button>`, { kind: 'checkout', repoId: repo.id, name });
    return;
  }
  finishCheckout(repo, name);
}

function finishCheckout(repo, name) {
  repo.current = name;
  repo.ui.selectedCommit = branch(repo).head;
  repo.ui.selectedPreviewFile = null;
  repo.ui.query = '';
  repo.ui.filter = 'all';
  repo.ui.expanded = false;
  repo.ui.historyScroll = 0;
  if (state.active === repo.id) { repo.ui.view = 'history'; render(); }
  notify(`已切换到 ${name}`);
}

function renderStashes() {
  const repo = repository();
  if (!repo.stashes.some((item) => item.id === repo.ui.selectedStash)) repo.ui.selectedStash = repo.stashes[0]?.id || null;
  $('#view-root').innerHTML = `<section class="stashes-view"><aside class="stash-list-panel"><h2>贮藏 <span class="count-badge">${repo.stashes.length}</span></h2><div class="stash-list scroll-area">${repo.stashes.length ? repo.stashes.map((item) => `<button class="stash-item ${repo.ui.selectedStash === item.id ? 'is-selected' : ''}" data-action="select-stash" data-id="${escapeHTML(item.id)}"><strong>${escapeHTML(item.message)}</strong><span>${icon('git-branch')}${escapeHTML(item.branch)} · ${item.files.length} 个文件</span><span>${relativeTime(item.time)}</span></button>`).join('') : emptyState('没有贮藏的更改', '需要暂时切换任务时，可以先贮藏工作区的更改。', 'show-changes', '查看工作区', 'archive')}</div></aside><section id="stash-detail" class="stash-detail" aria-label="贮藏详情"></section></section>`;
  renderStashDetail();
}

function renderStashDetail() {
  const repo = repository();
  const stash = repo.stashes.find((item) => item.id === repo.ui.selectedStash);
  const target = $('#stash-detail');
  if (!target) return;
  if (!stash) { target.innerHTML = emptyState('选择一份贮藏', '', '', '', 'archive'); return; }
  if (!stash.files.some((file) => file.id === repo.ui.selectedStashFile)) repo.ui.selectedStashFile = stash.files[0]?.id;
  target.innerHTML = `<header class="preview-heading"><div><h2>${escapeHTML(stash.message)}</h2><div class="commit-meta"><span>${escapeHTML(stash.branch)}</span><span>·</span><span>${relativeTime(stash.time)}</span></div></div><div class="preview-actions"><button class="button primary compact" data-action="restore-stash" data-id="${escapeHTML(stash.id)}" ${repo.busyCommit ? 'disabled' : ''}>恢复更改</button><button class="icon-button" data-action="delete-stash" data-id="${escapeHTML(stash.id)}" aria-label="删除贮藏">${icon('trash')}</button></div></header><div class="stash-file-tabs scroll-area">${fileListMarkup(stash.files, repo.ui.selectedStashFile, 'stash-file')}</div><div class="diff-panel" id="stash-diff"></div>`;
  renderDiff($('#stash-diff'), stash.files.find((file) => file.id === repo.ui.selectedStashFile));
}

function restoreStash(id) {
  const repo = repository();
  const stash = repo.stashes.find((item) => item.id === id);
  if (!stash || repo.busyCommit) return;
  const conflicts = stash.files.filter((file) => repo.files.some((current) => current.path === file.path));
  if (conflicts.length) { notify(`${basename(conflicts[0].path)} 已有未提交更改，请先提交或贮藏。`, true); return; }
  repo.files.push(...structuredClone(stash.files).map((file) => ({ ...file, id: `${file.id}-${freshId()}`, staged: false })));
  repo.stashes = repo.stashes.filter((item) => item.id !== id);
  repo.ui.selectedChange = repo.files.at(-1).id;
  setView('changes');
  notify(`已恢复 ${stash.files.length} 个文件到工作区`);
}

function renderSettings() {
  const repo = repository();
  const draft = repo.ui.settingsDraft ||= { author: repo.authorName, email: repo.authorEmail, remote: repo.remote };
  $('#view-root').innerHTML = `<section class="settings-view"><header class="page-heading"><div><h2>仓库设置</h2><p>${escapeHTML(repo.name)}</p></div></header><div class="settings-content scroll-area"><div class="settings-grid"><form id="repository-settings-form" novalidate><section class="settings-section"><h3>仓库与远程</h3><div class="setting-field"><span class="field-label">本地路径</span><div class="setting-value"><code>${escapeHTML(repo.path)}</code><button class="icon-button small" type="button" data-action="copy-path" aria-label="复制本地路径">${icon('copy')}</button></div></div><div class="setting-field"><label class="field-label" for="remote-address">远程地址 · origin（可选）</label><input id="remote-address" name="remote" value="${escapeHTML(draft.remote)}" autocomplete="off"></div><h3>提交身份</h3><div class="setting-field"><label class="field-label" for="author-name">姓名</label><input id="author-name" name="author" value="${escapeHTML(draft.author)}"></div><div class="setting-field"><label class="field-label" for="author-email">邮箱</label><input id="author-email" name="email" type="email" value="${escapeHTML(draft.email)}"></div><p id="settings-error" class="form-error" role="alert" ${repo.ui.settingsError ? '' : 'hidden'}>${escapeHTML(repo.ui.settingsError)}</p><button class="button primary" type="submit">更新配置</button><p id="settings-result" class="setting-help" role="status">${escapeHTML(repo.ui.settingsResult)}</p></section></form><div><section class="settings-section"><h3>外观</h3><div class="theme-options">${['light', 'dark'].map((theme) => `<button class="theme-option ${state.theme === theme ? 'is-selected' : ''}" data-action="set-theme" data-theme="${theme}" aria-pressed="${state.theme === theme}"><div class="theme-preview ${theme === 'dark' ? 'dark' : ''}"><span></span><div><b></b><b></b><b></b></div></div><span>${theme === 'light' ? '浅色' : '深色'}</span></button>`).join('')}</div></section><section class="settings-section"><h3>Git 服务</h3><div class="connection-state">${icon('plug-connected-x')}<span>${repo.busyRemote === 'connect' ? '正在连接…' : '尚未连接'}</span></div><button class="button" data-action="remote-operation" data-operation="connect" ${repo.busyRemote ? 'disabled' : ''} aria-busy="${repo.busyRemote === 'connect'}">${icon('plug')}连接 Git 服务</button><p class="setting-help">获取、拉取与推送需要连接 Git 服务。</p></section></div></div></div></section>`;
}

async function remoteOperation(operation) {
  const repo = repository();
  if (repo.busyRemote) return;
  repo.busyRemote = operation;
  repo.connectionError = '';
  renderSidebar();
  if (repo.ui.view === 'settings') renderSettings();
  await wait(650);
  repo.busyRemote = false;
  repo.connectionError = operation === 'connect' ? '无法连接 Git 服务，请检查客户端连接。' : '尚未连接 Git 服务，远程操作未执行。';
  if (state.active === repo.id) { renderSidebar(); if (repo.ui.view === 'settings') renderSettings(); }
  notify(repo.connectionError, true);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  const button = $('#theme-toggle');
  button.setAttribute('aria-pressed', theme === 'dark');
  button.setAttribute('aria-label', `切换到${theme === 'dark' ? '浅' : '深'}色主题`);
  button.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  try { localStorage.setItem('branchline-theme', theme); } catch {}
  if (repository().ui.view === 'settings') renderSettings();
}

function openPopover(anchor, kind) {
  if (state.menuAnchor === anchor && $('#popover').classList.contains('is-open')) { closePopover(); return; }
  closePopover();
  const repo = repository();
  const option = (name, action, value, selected = false) => `<button class="menu-option" role="menuitemradio" aria-checked="${selected}" data-action="${action}" data-name="${escapeHTML(value)}">${icon(action === 'checkout' ? 'git-branch' : 'filter')}<span>${escapeHTML(name)}</span>${selected ? `<i class="ti ti-check menu-check" aria-hidden="true"></i>` : ''}</button>`;
  $('#popover').innerHTML = kind === 'checkout' ? `<div class="menu-label">切换分支</div>${repo.branches.map((item) => option(item.name, 'checkout', item.name, item.name === repo.current)).join('')}<button class="menu-option" role="menuitem" disabled aria-disabled="true">${icon('archive')}<span>release/1.7 · 已归档</span></button><div class="menu-divider"></div><button class="menu-option" role="menuitem" data-action="new-branch">${icon('plus')}<span>新建分支</span></button><button class="menu-option" role="menuitem" data-action="show-branches">${icon('git-fork')}<span>管理分支</span></button>` : `<div class="menu-label">显示提交</div>${option('所有分支', 'filter-branch', 'all', repo.ui.filter === 'all')}${repo.branches.map((item) => option(item.name, 'filter-branch', item.name, item.name === repo.ui.filter)).join('')}<div class="menu-divider"></div><button class="menu-option" disabled aria-disabled="true" role="menuitem">${icon('cloud-off')}<span>远程分支 · 未连接</span></button>`;
  state.menuAnchor = anchor;
  anchor.setAttribute('aria-expanded', 'true');
  const panel = $('#popover');
  panel.setAttribute('aria-hidden', 'false');
  panel.classList.add('is-open');
  const canvas = $('.canvas').getBoundingClientRect();
  const bounds = anchor.getBoundingClientRect();
  panel.style.width = `${Math.min(264, canvas.width - 48)}px`;
  panel.style.left = `${Math.max(24, Math.min(bounds.left - canvas.left, canvas.width - panel.offsetWidth - 24))}px`;
  panel.style.top = `${Math.max(24, Math.min(bounds.bottom - canvas.top + 7, canvas.height - panel.offsetHeight - 24))}px`;
  $('.menu-option:not(:disabled)', panel)?.focus();
}

function closePopover(restore = false) {
  $('#popover').classList.remove('is-open');
  $('#popover').setAttribute('aria-hidden', 'true');
  state.menuAnchor?.setAttribute('aria-expanded', 'false');
  if (restore && state.menuAnchor?.isConnected) state.menuAnchor.focus();
  state.menuAnchor = null;
}

function dialogHeader(title) {
  return `<header class="dialog-header"><h2 id="dialog-title">${escapeHTML(title)}</h2><button class="icon-button" data-action="close-dialog" aria-label="关闭对话框">${icon('x')}</button></header>`;
}

function openDialog(title, body, footer = '', context = null) {
  closePopover();
  hideGraphTooltip();
  state.dialogReturn = document.activeElement;
  state.dialogContext = context;
  $('#dialog').className = 'dialog';
  $('#dialog').innerHTML = `${dialogHeader(title)}<div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ''}`;
  $('#dialog-layer').hidden = false;
  $('.app-body').inert = true;
  $('.titlebar').inert = true;
  const focus = $('input, textarea', $('#dialog')) || $('#dialog');
  focus.focus();
}

function closeDialog(restore = true) {
  $('#dialog-layer').hidden = true;
  $('.app-body').inert = false;
  $('.titlebar').inert = false;
  state.dialogContext = null;
  if (restore && state.dialogReturn?.isConnected) state.dialogReturn.focus();
}

function openRepositoryDialog() {
  openDialog('添加本地仓库', `<form id="add-repository-form" class="dialog-form" novalidate><div class="setting-field"><label class="field-label" for="new-repository-name">仓库名称</label><input id="new-repository-name" name="name" placeholder="my-project" autocomplete="off"></div><div class="setting-field"><label class="field-label" for="new-repository-path">本地路径</label><input id="new-repository-path" name="path" placeholder="~/Projects/my-project" autocomplete="off"></div><p id="repository-error" class="form-error" role="alert" hidden></p><footer class="dialog-footer"><button class="button tertiary" type="button" data-action="close-dialog">取消</button><button class="button primary" type="submit">添加仓库</button></footer></form>`);
}

const commands = [
  { label: '查看提交历史', symbol: 'git-branch', action: 'show-history' },
  { label: '查看本地更改', symbol: 'files', action: 'show-changes' },
  { label: '暂存全部更改', symbol: 'square-check', action: 'command-stage' },
  { label: '新建分支', symbol: 'git-fork', action: 'new-branch' },
  { label: '查看贮藏', symbol: 'archive', action: 'show-stashes' },
  { label: '添加本地仓库', symbol: 'folder-plus', action: 'open-repository' },
  { label: '仓库设置', symbol: 'settings', action: 'show-settings' },
  { label: '切换浅色 / 深色主题', symbol: 'moon', action: 'toggle-theme' },
];

function openCommands() {
  openDialog('搜索命令', `<div class="command-search">${icon('search')}<input id="command-query" aria-label="搜索命令" placeholder="输入命令名称…" autocomplete="off"></div><div id="command-list" class="command-list scroll-area"></div><footer class="command-footer"><span>↑ ↓ 选择 · Enter 执行</span><kbd>Esc 关闭</kbd></footer>`);
  $('#dialog').classList.add('commands');
  renderCommands('');
  $('#command-query').focus();
}

function renderCommands(query) {
  const matched = commands.filter((command) => command.label.toLowerCase().includes(query.trim().toLowerCase()));
  $('#command-list').innerHTML = matched.length ? matched.map((command) => `<button class="command-item" data-action="run-command" data-command="${command.action}">${icon(command.symbol)}<span>${command.label}</span></button>`).join('') : emptyState('没有匹配的命令', '试试“分支”或“提交”。', '', '', 'search');
}

function showGraphTooltip(row) {
  if (!state.graph || !row) return;
  const commit = repository().commits.find((item) => item.id === row.dataset.id);
  if (!commit) return;
  const tooltip = $('#graph-tooltip');
  tooltip.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = `${commit.id} · ${['main', 'feature', 'release'][commit.lane]}`;
  const description = document.createElement('span');
  description.textContent = `${commit.parents.length > 1 ? '合并提交' : commit.parents.length ? '普通提交' : '初始提交'} · ${currentPerson(commit).name} · ${relativeTime(commit.time)}`;
  tooltip.append(heading, description);
  tooltip.hidden = false;
  const canvas = $('.canvas').getBoundingClientRect();
  const bounds = row.getBoundingClientRect();
  tooltip.style.left = `${Math.min(bounds.left - canvas.left + 78, canvas.width - tooltip.offsetWidth - 24)}px`;
  tooltip.style.top = `${Math.max(24, Math.min(bounds.top - canvas.top - tooltip.offsetHeight - 4, canvas.height - tooltip.offsetHeight - 24))}px`;
}

function hideGraphTooltip() { $('#graph-tooltip').hidden = true; }

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); notify(`已复制 ${text}`); }
  catch { notify('无法访问剪贴板，请手动选中并复制。', true); }
}

function exportPatch() {
  const commit = selectedCommit();
  if (!commit) return;
  const content = commit.files.map((file) => { const oldCount = file.lines.filter((line) => line.type !== 'add').length; const newCount = file.lines.filter((line) => line.type !== 'remove').length; return `diff --git a/${file.path} b/${file.path}\n--- ${file.status === 'A' ? '/dev/null' : 'a/' + file.path}\n+++ b/${file.path}\n@@ -${oldCount ? file.start : 0},${oldCount} +${file.start},${newCount} @@\n${file.lines.map((line) => `${line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}${line.text}`).join('\n')}\n`; }).join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${repository().name}-${commit.id}.patch`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify(`已导出 ${commit.id}.patch`);
}

function confirmAction(title, message, context, label = '确认删除') {
  openDialog(title, `<p>${escapeHTML(message)}</p>`, `<button class="button tertiary" data-action="close-dialog">取消</button><button class="button danger primary" data-action="confirm-action">${escapeHTML(label)}</button>`, { ...context, repoId: repository().id });
}

function runAction(action, element = null) {
  const repo = repository();
  if (action === 'view') return setView(element.dataset.view);
  const viewActions = { 'show-history': 'history', 'show-changes': 'changes', 'show-branches': 'branches', 'show-stashes': 'stashes', 'show-settings': 'settings' };
  if (viewActions[action]) return setView(viewActions[action]);
  if (action === 'select-repository') { if (element.dataset.id === repo.id) return; saveScroll(); state.active = element.dataset.id; closePopover(); $('.canvas').classList.remove('sidebar-open'); $('.mobile-menu').setAttribute('aria-expanded', 'false'); render(); return; }
  if (action === 'select-commit') { repo.ui.selectedCommit = element.dataset.id; $$('.history-row').forEach((row) => { row.classList.toggle('is-selected', row.dataset.id === repo.ui.selectedCommit); row.setAttribute('aria-selected', row.dataset.id === repo.ui.selectedCommit); }); renderCommitPreview(selectedCommit()); return; }
  if (action === 'copy-hash') return copyText(element.dataset.id);
  if (action === 'copy-path') return copyText(repo.path);
  if (action === 'preview-file') { repo.ui.selectedPreviewFile = element.dataset.id; return renderCommitPreview(selectedCommit()); }
  if (action === 'change-file') { repo.ui.selectedChange = element.dataset.id; return renderChangeFiles(); }
  if (action === 'stash-file') { repo.ui.selectedStashFile = element.dataset.id; return renderStashDetail(); }
  if (action === 'history-mode') { saveScroll(); state.graph = element.dataset.value === '0'; return renderHistory(); }
  if (action === 'diff-mode') { state.split = element.dataset.value === '1'; return rerenderDiff(); }
  if (action === 'wrap-diff') { state.wrapped = !state.wrapped; return rerenderDiff(); }
  if (action === 'expand-diff') { saveScroll(); repo.ui.expanded = !repo.ui.expanded; return renderHistory(); }
  if (action === 'export-patch') return exportPatch();
  if (action === 'clear-search') { repo.ui.query = ''; repo.ui.filter = 'all'; return renderHistory(); }
  if (action === 'filter-branch') { saveScroll(); repo.ui.filter = element.dataset.name; repo.ui.historyScroll = 0; closePopover(); return renderHistory(); }
  if (action === 'checkout') return checkout(element.dataset.name);
  if (action === 'stage-all') { if (repo.busyCommit) return; repo.files.forEach((file) => { file.staged = element.dataset.value === '1'; }); renderSidebar(); return renderChangeFiles(); }
  if (action === 'command-stage') { if (repo.busyCommit) return; repo.files.forEach((file) => { file.staged = true; }); setView('changes'); return notify(repo.files.length ? `已暂存 ${repo.files.length} 个文件` : '没有需要暂存的更改'); }
  if (action === 'stash-changes') { const stash = stashChanges(repo); if (!stash) return; setView('stashes'); return notify(`已贮藏 ${stash.files.length} 个文件`); }
  if (action === 'stash-checkout') { const context = state.dialogContext; const target = state.repositories.find((item) => item.id === context?.repoId); if (!target || target.busyCommit) return; stashChanges(target); const name = context.name; closeDialog(false); return finishCheckout(target, name); }
  if (action === 'new-branch') { if (repo.busyCommit) return; closePopover(); repo.ui.branchForm = true; setView('branches'); $('#branch-name')?.focus(); return; }
  if (action === 'cancel-branch') { repo.ui.branchForm = false; return renderBranches(); }
  if (action === 'delete-branch') return confirmAction('删除分支', `删除 ${element.dataset.name}？已有提交会保留在提交历史中。`, { kind: 'delete-branch', name: element.dataset.name });
  if (action === 'discard-file') { const file = repo.files.find((item) => item.id === element.dataset.id); if (!file || repo.busyCommit) return; return confirmAction('丢弃文件更改', `${file.path} 的未提交更改将被移除。此操作无法撤销。`, { kind: 'discard-file', id: file.id }, '丢弃更改'); }
  if (action === 'select-stash') { repo.ui.selectedStash = element.dataset.id; return renderStashes(); }
  if (action === 'restore-stash') return restoreStash(element.dataset.id);
  if (action === 'delete-stash') return confirmAction('删除贮藏', '删除后将无法恢复这份贮藏中的更改。', { kind: 'delete-stash', id: element.dataset.id });
  if (action === 'confirm-action') {
    const context = state.dialogContext;
    const target = state.repositories.find((item) => item.id === context?.repoId);
    if (!target) return;
    if (context.kind === 'delete-branch') target.branches = target.branches.filter((item) => item.name !== context.name || item.name === target.current || item.protected);
    if (context.kind === 'discard-file' && !target.busyCommit) target.files = target.files.filter((item) => item.id !== context.id);
    if (context.kind === 'delete-stash') target.stashes = target.stashes.filter((item) => item.id !== context.id);
    closeDialog(false); render(); return notify(context.kind === 'discard-file' ? '已丢弃文件更改' : '已删除');
  }
  if (action === 'open-repository') return openRepositoryDialog();
  if (action === 'open-commands') return openCommands();
  if (action === 'run-command') { const command = element.dataset.command; closeDialog(false); return runAction(command); }
  if (action === 'close-dialog') return closeDialog();
  if (action === 'toggle-theme') return applyTheme(state.theme === 'light' ? 'dark' : 'light');
  if (action === 'set-theme') return applyTheme(element.dataset.theme);
  if (action === 'remote-operation') return remoteOperation(element.dataset.operation);
  if (action === 'dismiss-connection-error') { repo.connectionError = ''; return renderSidebar(); }
  if (action === 'dismiss-toast') { clearTimeout(state.toastTimer); return $('#toast').classList.remove('is-visible'); }
  if (action === 'toggle-sidebar') { const open = $('.canvas').classList.toggle('sidebar-open'); $('.mobile-menu').setAttribute('aria-expanded', open); $('.mobile-menu').setAttribute('aria-label', open ? '关闭仓库导航' : '打开仓库导航'); }
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'commit-form') return submitCommit(form);
  if (form.id === 'branch-create-form') return createBranch(form);
  if (form.id === 'add-repository-form') {
    const name = form.elements.name.value.trim();
    const path = form.elements.path.value.trim();
    const message = !name || !path ? '请填写仓库名称和本地路径。' : state.repositories.some((item) => item.path === path) ? '这个路径已经在工作区中。' : /[\x00-\x1f]/.test(name + path) ? '名称和路径不能包含控制字符。' : '';
    if (message) { $('#repository-error').hidden = false; $('#repository-error').textContent = message; return; }
    const id = `repo-${freshId()}`;
    const repo = createRepository(id, name, path, [], [makeFile(`readme-${id}`, 'README.md', [`+# ${name}`, '+'], false, 'A')], [{ name: 'main', head: null, lane: 0, protected: true }]);
    state.repositories.push(repo);
    closeDialog(false);
    state.active = id;
    render();
    notify(`已将 ${name} 加入工作区`);
  }
  if (form.id === 'repository-settings-form') {
    const repo = repository();
    const name = form.elements.author.value.trim();
    const email = form.elements.email.value.trim();
    const remote = form.elements.remote.value.trim();
    const message = !name ? '请填写提交者姓名。' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '请输入有效的邮箱地址。' : remote && /\s/.test(remote) ? '远程地址不能包含空格。' : '';
    repo.ui.settingsError = message;
    repo.ui.settingsResult = '';
    if (message) { $('#settings-error').hidden = false; $('#settings-error').textContent = message; $('#settings-result').textContent = ''; return; }
    repo.authorName = name; repo.authorEmail = email; repo.remote = remote;
    repo.ui.settingsDraft = { author: name, email, remote };
    repo.ui.settingsResult = '仓库配置已更新。';
    renderSettings();
  }
}

function handleKeyboard(event) {
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && event.key.toLowerCase() === 'k') { event.preventDefault(); return $('#dialog-layer').hidden ? openCommands() : closeDialog(); }
  if (event.key === 'Escape') {
    event.preventDefault();
    if (!$('#dialog-layer').hidden) return closeDialog();
    if ($('#popover').classList.contains('is-open')) return closePopover(true);
    if ($('.canvas').classList.contains('sidebar-open')) return runAction('toggle-sidebar');
    if (repository().ui.expanded) { repository().ui.expanded = false; return renderHistory(); }
  }
  if (!$('#dialog-layer').hidden) {
    if (event.key === 'Tab') {
      const focusable = $$('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]', $('#dialog')).filter((item) => item.getClientRects().length);
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === $('#dialog'))) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if ($('#dialog').classList.contains('commands')) {
      const items = $$('.command-item');
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const index = items.indexOf(document.activeElement); items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
      if (event.key === 'Enter' && event.target.id === 'command-query') { event.preventDefault(); items[0]?.click(); }
    }
    return;
  }
  if ($('#popover').classList.contains('is-open') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const items = $$('.menu-option:not(:disabled)', $('#popover'));
    const index = items.indexOf(document.activeElement);
    items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    return;
  }
  if (modifier && event.key.toLowerCase() === 'f' && repository().ui.view === 'history') { event.preventDefault(); $('#history-search')?.focus(); return; }
  if (modifier && event.key === 'Enter' && repository().ui.view === 'changes') { event.preventDefault(); return submitCommit($('#commit-form')); }
  if (['Enter', ' '].includes(event.key) && event.target.matches('.history-row')) { event.preventDefault(); event.target.click(); }
}

function start() {
  if (document.body.dataset.branchlineStarted) return;
  document.body.dataset.branchlineStarted = 'true';
  try { state.theme = localStorage.getItem('branchline-theme') === 'dark' ? 'dark' : 'light'; } catch {}
  applyTheme(state.theme);
  render();
  $('.canvas').addEventListener('click', (event) => {
    const menu = event.target.closest('[data-menu]');
    if (menu && !menu.disabled) return openPopover(menu, menu.dataset.menu);
    if (!event.target.closest('#popover')) closePopover();
    const action = event.target.closest('[data-action]');
    if (action && !action.disabled && action.getAttribute('aria-disabled') !== 'true') runAction(action.dataset.action, action);
  });
  $('.canvas').addEventListener('submit', handleSubmit);
  $('.canvas').addEventListener('input', (event) => {
    if (event.target.id === 'history-search') { repository().ui.query = event.target.value; repository().ui.historyScroll = 0; renderHistoryRows(); }
    if (event.target.id === 'command-query') renderCommands(event.target.value);
    if (event.target.id === 'commit-subject') { repository().draft.subject = event.target.value; $('#commit-error').hidden = true; updateCommitButton(); }
    if (event.target.id === 'commit-description') repository().draft.description = event.target.value;
    if (event.target.closest('#repository-settings-form')) {
      const ui = repository().ui;
      ui.settingsDraft[event.target.name] = event.target.value;
      ui.settingsError = '';
      ui.settingsResult = '';
      $('#settings-error').hidden = true;
      $('#settings-result').textContent = '';
    }
  });
  $('.canvas').addEventListener('change', (event) => {
    if (event.target.matches('[data-stage-id]')) {
      const repo = repository();
      if (repo.busyCommit) return;
      const file = repo.files.find((item) => item.id === event.target.dataset.stageId);
      if (!file) return;
      file.staged = event.target.checked;
      renderSidebar(); renderChangeFiles();
    }
  });
  $('.canvas').addEventListener('pointerover', (event) => { const row = event.target.closest('.history-row'); if (row && event.clientX < row.getBoundingClientRect().left + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-width'))) showGraphTooltip(row); else hideGraphTooltip(); });
  $('.canvas').addEventListener('pointerleave', hideGraphTooltip);
  $('.canvas').addEventListener('focusin', (event) => { if (event.target.matches('.history-row')) showGraphTooltip(event.target); else hideGraphTooltip(); });
  document.addEventListener('keydown', handleKeyboard);
  document.addEventListener('pointerdown', (event) => { if (!event.target.closest('#popover, [data-menu]')) closePopover(); });
  new ResizeObserver(() => { closePopover(); hideGraphTooltip(); renderGraph(); }).observe($('.canvas'));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { $('.canvas').classList.add('is-starting'); setTimeout(() => $('.canvas').classList.remove('is-starting'), 400); }
}

start();
