/* ================================================================
   苔径 · 团队即时通讯  — 交互脚本
   ================================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ── 数据 ──────────────────────────────────────────────────────── */

const TEAM = [
  { id:'zhouyan',   name:'周砚',   role:'产品设计师',     online:true,          img:'47' },
  { id:'linwanqiao',name:'林晚乔', role:'交互设计师',      online:true,          img:'13' },
  { id:'chenmo',    name:'陈默',   role:'前端工程师',      online:true,          img:'32' },
  { id:'suli',      name:'苏黎',   role:'用户研究员',       online:false,         img:'5'  },
  { id:'heyizhou',  name:'何一舟', role:'项目经理',        online:true,          img:'44' },
  { id:'wangning',  name:'王宁',    role:'前端工程师',      online:true,          img:'52' },
  { id:'lilyxu',    name:'徐莉莉',  role:'产品经理',       online:false,         img:'9'  },
  { id:'gufan',     name:'顾帆',   role:'前端工程师',      online:true,          img:'12' },
];

const STATE = {
  currentChannel : 'product',
  activeThread   : null,
  files          : [],
  myReactions    : new Set(),
  pollVoted      : false,
  mentionQuery   : '',
  scenes         : { daily: true, thread: false, draft: false },
};

/* ── 场景切换 ─────────────────────────────────────────────────── */

function setScene(name) {
  STATE.scenes = { daily: false, thread: false, draft: false, [name]: true };
  $$('.scene').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scene === name);
    btn.setAttribute('aria-pressed', btn.dataset.scene === name);
  });
  const win = $('#window');

  if (name === 'daily') {
    win.classList.remove('has-thread');
    setTimeout(() => { if (!STATE.scenes.thread) closeThread(); }, 50);
  } else if (name === 'thread') {
    openThread();
  } else if (name === 'draft') {
    win.classList.remove('has-thread');
    closeThread();
    openMentionPop('');
    focusEditor();
  }
  showToast(`${name === 'daily' ? '日常对话' : name === 'thread' ? '话题回复' : '提及与附件'}`);
}

/* ── Toast ────────────────────────────────────────────────────── */

function showToast(msg, icon = 'ti-check') {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.removeAttribute('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.setAttribute('hidden', ''), 2000);
}

/* ── 频道 / 群组 / 私聊 ────────────────────────────────────────── */

function buildNav() {
  const channels = $$('#channels')[0];
  const groups   = $$('#groups')[0];
  const directs  = $$('#directs')[0];

  channels.innerHTML = [
    { id:'product',    label:'# 产品设计',    unread:6,    active:true  },
    { id:'frontend',   label:'# 前端开发',    unread:2,    active:false },
    { id:'market',     label:'# 市场情报',    unread:0,    active:false },
    { id:'management', label:'🔒 管理层周报', unread:0,    active:false },
    { id:'lobby',      label:'# 摸鱼茶水间',  unread:0,    active:false },
  ].map(c => navItem(c, 'hash', false)).join('');

  groups.innerHTML = [
    { id:'launch',   label:'新品发布冲刺',   avatars:['47','13','32'], unread:12, active:false },
    { id:'design',   label:'设计走查小组',    avatars:['5','44'],        unread:0,  active:false },
  ].map(g => navGroupItem(g)).join('');

  directs.innerHTML = [
    { id:'linwanqiao', name:'林晚乔', online:true,  typing:true,  img:'13' },
    { id:'suli',       name:'苏 黎',  online:false, unread:1,    img:'5'  },
    { id:'heyizhou',   name:'何一舟', online:true,  typing:false, img:'44' },
    { id:'wangning',   name:'王 宁',  online:true,  typing:false, img:'52' },
    { id:'lilyxu',     name:'徐莉莉', online:false, typing:false, img:'9'  },
  ].map(d => dmItem(d)).join('');

  $$('.nav-item', channels).forEach(n => n.addEventListener('click', () => switchChannel(n)));
  $$('.nav-item', groups  ).forEach(n => n.addEventListener('click', () => showToast(`已切换到群组：${n.querySelector('.nav-name').textContent}`)));
  $$('.nav-item', directs ).forEach(n => n.addEventListener('click', () => showToast(`已打开与 ${n.querySelector('.nav-name').textContent} 的私聊`)));
}

function navItem({ id, label, unread, active }, icon, showDot) {
  return `<button class="nav-item${active ? ' active' : ''}" data-channel="${id}" aria-label="${label}">
    <i class="ti ti-${icon}" aria-hidden="true"></i>
    <span class="nav-name">${label.replace('# ','').replace('🔒 ','')}</span>
    ${unread ? `<span class="count">${unread}</span>` : ''}
    ${showDot ? '<span class="nav-unread" aria-hidden="true"></span>' : ''}
  </button>`;
}

function navGroupItem({ id, label, avatars, unread }) {
  return `<button class="nav-item" data-group="${id}">
    <span class="stack-avatars">${avatars.slice(0,2).map(a => `<img src="https://i.pravatar.cc/28?img=${a}" alt="">`).join('')}</span>
    <span class="nav-name">${label}</span>
    ${unread ? `<span class="count">${unread}</span>` : ''}
  </button>`;
}

function dmItem({ id, name, online, typing, unread, img }) {
  return `<button class="nav-item" data-dm="${id}">
    <span class="dm-avatar${online ? '' : ' offline'}"><img src="https://i.pravatar.cc/28?img=${img}" alt=""></span>
    <span class="nav-name">${name}</span>
    ${typing ? '<span class="nav-typing">正在输入…</span>' : ''}
    ${unread ? `<span class="count">${unread}</span>` : ''}
  </button>`;
}

function switchChannel(el) {
  $$('.nav-item', $('#channels')).forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  const name = el.querySelector('.nav-name').textContent;
  $('#channelName').textContent = name;
  $('#channelDescription').textContent = CHANNEL_DESCS[name.replace('# ','')] || '把想法聊清楚，再一起做好。';
  showToast(`已切换到 ${name}`);
}

/* ── 消息渲染 ─────────────────────────────────────────────────── */

const CHANNEL_DESCS = {
  '产品设计' : '讨论视觉方向、交互细节与发布节奏。',
  '前端开发' : '前端技术选型、代码审查与工程实践。',
  '市场情报' : '竞品动态、行业报告与用户洞察。',
  '管理层周报' : '私密频道，仅管理层可见。',
  '摸鱼茶水间' : '随便聊聊，休息一下。',
};

const MESSAGES = {
  product: [
    { id:'m1',  who:'zhouyan',   time:'09:41', type:'text',    content:'各位，新版工作台的首屏稿我改到第三版了，信息密度比上一版降了不少。', reactions:[['👍',3],['👀',2]] },
    { id:'m2',  who:'zhouyan',   time:'09:52', type:'image',   content:'第三版长这样，左侧导航收了一级，首屏只留一个核心指标。', src:'https://picsum.photos/seed/design3/480/280', alt:'工作台首屏第三版设计稿' },
    { id:'m3',  who:'linwanqiao',time:'10:07', type:'thread',  content:'导航收起一级之后，「数据看板」的入口会变深。我担心一线同事找不到，要不把它提到顶栏？这个话题我展开了，里面聊。', thread:4, lastReply:'林晚乔', threadTime:'10:41', threadPeople:['zhouyan','chenmo','suli','heyizhou'] },
    { id:'m4',  who:'chenmo',    time:'10:15', type:'code',    content:'导航收起后的过渡我做了 200ms 的 ease-out，顺手贴一下关键代码，别用默认 linear，手感差很多：\n.nav-item {\n  transform: translateX(-8px);\n  opacity: 0;\n  transition:\n    transform .2s cubic-bezier(.22,.61,.36,1),\n    opacity .2s ease-out;\n}\n.nav-item.open { transform: none; opacity: 1; }', reactions:[['💯',2]] },
    { id:'m5',  who:'suli',      time:'10:31', type:'file',    content:'上周可用性测试的记录整理好了，8 位受访者，结论在第三页，挺值得一看。', filename:'可用性测试记录-1008.pdf', size:'4.2 MB' },
    { id:'m6',  who:'heyizhou',  time:'10:38', type:'poll',    question:'设计评审改到周几开比较合适？', options:[{label:'周三下午',votes:14,total:31},{label:'周四上午',votes:11,total:31},{label:'周五下午',votes:6,total:31}], ends:'明天中午' },
    { id:'m7',  who:'zhouyan',   time:'10:44', type:'text',    content:'收到，今天下班前出稿。我先把顶栏的排布画两版，发到这里大家挑。', reactions:[['🎉',2]] },
  ],
  frontend: [
    { id:'f1', who:'chenmo',   time:'09:10', type:'text', content:'Vite 5.2 升级踩了个坑，记录一下：plugins 数组里不能直接写异步函数，必须包装成函数形式。' },
    { id:'f2', who:'wangning', time:'09:25', type:'text', content:'收到，我来更新下文档。还有个 tsconfig 的问题想请教你。' },
    { id:'f3', who:'chenmo',   time:'09:28', type:'code', content:'tsconfig 里加一行 "moduleResolution": "bundler"，基本上能解决 90% 的路径问题。\nmoduleResolution 是 NodeNext 还是 Bundler，区别挺大的。', reactions:[['👍',1]] },
  ],
};

function renderMessages(channel = 'product') {
  const list = $('#messageList');
  const msgs = MESSAGES[channel] || [];
  list.innerHTML = msgs.map((m, i) => buildMessage(m, i)).join('');
  attachMessageEvents();
  scrollBottom();
}

function buildMessage(m, i) {
  const w   = TEAM.find(t => t.id === m.who) || TEAM[0];
  const reactHtml = m.reactions ? m.reactions.map(([r,c]) =>
    `<button class="reaction${STATE.myReactions.has(m.id+r) ? ' mine' : ''}" data-msg="${m.id}" data-react="${r}" aria-label="${r} 有 ${c} 人回应">${r}<span>${c}</span></button>`
  ).join('') + `<button class="reaction-add" data-msg="${m.id}" aria-label="添加回应"><i class="ti ti-mood-plus" aria-hidden="true"></i></button>` : '';

  const common = `style="--i:${i}"`;
  const ts = m.type === 'thread' ? buildThreadChip(m) : '';

  let body = `<p class="message-text">${escapeHtml(m.content)}</p>`;
  if (m.type === 'image') body = `<a class="image-message" href="${m.src}" target="_blank" rel="noopener"><img src="${m.src}" alt="${m.alt}"><span class="image-caption"><i class="ti ti-photo" aria-hidden="true"></i> 工作台-v3.png · 1.8 MB</span></a>${body}`;
  if (m.type === 'file')  body = buildFileMsg(m);
  if (m.type === 'code')  body = buildCodeMsg(m);
  if (m.type === 'poll')  body = buildPollMsg(m);

  return `<div class="message${m.type === 'thread' ? ' is-origin' : ''} enter-stagger" data-id="${m.id}" ${common}>
    <img class="message-avatar" src="https://i.pravatar.cc/80?img=${w.img}" alt="${w.name}" loading="lazy">
    <div class="message-content">
      <div class="message-meta">
        <strong class="message-name">${w.name}</strong>
        <span class="message-role">${w.role}</span>
        <time>${m.time}</time>
      </div>
      ${body}
      ${reactHtml ? `<div class="reactions">${reactHtml}</div>` : ''}
      ${ts}
    </div>
    <div class="message-actions" aria-label="消息操作">
      <button class="icon-btn" data-action="react" data-msg="${m.id}" title="添加回应" aria-label="添加回应"><i class="ti ti-mood-smile" aria-hidden="true"></i></button>
      <button class="icon-btn" data-action="reply"  data-msg="${m.id}" title="回复此消息" aria-label="回复此消息"><i class="ti ti-arrow-back-up" aria-hidden="true"></i></button>
      <button class="icon-btn" data-action="more"   data-msg="${m.id}" title="更多操作" aria-label="更多操作"><i class="ti ti-dots" aria-hidden="true"></i></button>
    </div>
  </div>`;
}

function buildThreadChip(m) {
  const faces = m.threadPeople.map(id => {
    const t = TEAM.find(x => x.id === id);
    return t ? `<img src="https://i.pravatar.cc/28?img=${t.img}" alt="${t.name}">` : '';
  }).join('');
  return `<button class="thread-chip" data-thread="${m.id}" aria-label="查看 ${m.thread} 条话题回复">
    <i class="ti ti-message-circle" aria-hidden="true"></i>
    <span class="facepile">${faces}</span>
    <strong>${m.thread} 条回复</strong>
    <span>最后回复 ${m.threadTime} · ${m.lastReply}</span>
  </button>`;
}

function buildFileMsg(m) {
  return `<div class="file-message">
    <div class="file-tile"><i class="ti ti-file-type-pdf" aria-hidden="true"></i></div>
    <div class="file-details"><strong>${m.filename}</strong><span>PDF · ${m.size}</span></div>
    <button class="icon-btn" data-action="download" aria-label="下载文件"><i class="ti ti-download" aria-hidden="true"></i></button>
  </div>`;
}

function buildCodeMsg(m) {
  return `<div class="code-message">
    <header><span>nav-transition.css</span><button class="copy-button" data-copy="${encodeURIComponent(m.content)}" aria-label="复制代码"><i class="ti ti-copy" aria-hidden="true"></i>复制</button></header>
    <pre><code>${escapeHtml(m.content)}</code></pre>
  </div>`;
}

function buildPollMsg(m) {
  const total = m.options[0].total;
  return `<div class="poll-message" data-poll="${m.id}">
    <div class="poll-header"><i class="ti ti-chart-bar" aria-hidden="true"></i><strong>${m.question}</strong></div>
    <div class="poll-options">${m.options.map((o,i) => {
      const pct = Math.round(o.votes / total * 100);
      return `<button class="poll-option" data-opt="${i}" data-poll="${m.id}">
        <span class="poll-radio"></span>
        <span>${o.label}</span>
        <em>${pct}%</em>
      </button>`;
    }).join('')}</div>
    <div class="poll-footer"><span>${total} 人已投</span><span>${m.ends}截止</span></div>
  </div>`;
}

/* ── 消息交互 ─────────────────────────────────────────────────── */

function attachMessageEvents() {
  $$('.thread-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.thread;
      STATE.activeThread = id;
      openThread(id);
    });
  });

  $$('.reaction').forEach(btn => {
    btn.addEventListener('click', () => {
      const { msg, react } = btn.dataset;
      const key = `${msg}|${react}`;
      if (STATE.myReactions.has(key)) {
        STATE.myReactions.delete(key);
        btn.classList.remove('mine');
        const sp = btn.querySelector('span');
        if (sp) sp.textContent = Math.max(1, parseInt(sp.textContent) - 1);
      } else {
        STATE.myReactions.add(key);
        btn.classList.add('mine', 'pop');
        setTimeout(() => btn.classList.remove('pop'), 400);
        const sp = btn.querySelector('span');
        if (sp) sp.textContent = parseInt(sp.textContent) + 1;
      }
    });
  });

  $$('.reaction-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const { msg } = btn.dataset;
      const key = `${msg}|✨`;
      STATE.myReactions.add(key);
      const count = STATE.myReactions.has(`${msg}|✨`) ? $$('.reaction', btn.closest('.reactions')).filter(r => r.dataset.react === '✨').length : 0;
      const newBtn = document.createElement('button');
      newBtn.className = 'reaction mine pop';
      newBtn.dataset.msg = msg;
      newBtn.dataset.react = '✨';
      newBtn.innerHTML = '✨<span>1</span>';
      btn.before(newBtn);
      newBtn.addEventListener('click', () => $$('.reaction[data-react="✨"]')[0]?.click());
      btn.remove();
      showToast('已添加回应');
    });
  });

  $$('.poll-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (STATE.pollVoted) return;
      STATE.pollVoted = true;
      const pollEl = opt.closest('.poll-message');
      $$('.poll-option', pollEl).forEach(o => {
        o.classList.remove('selected');
        o.querySelector('.poll-radio').style.borderColor = '#a3b2a5';
        o.querySelector('.poll-radio').style.background = 'none';
      });
      opt.classList.add('selected');
      opt.querySelector('.poll-radio').style.borderColor = 'var(--accent)';
      opt.querySelector('.poll-radio').style.background = 'var(--accent)';
      showToast('已记录你的选择');
    });
  });

  $$('.copy-button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = decodeURIComponent(btn.dataset.copy || '');
      try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i>已复制';
        setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy" aria-hidden="true"></i>复制'; }, 1500);
        showToast('代码已复制');
      } catch { showToast('浏览器未允许复制'); }
    });
  });

  $$('[data-action="react"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { msg } = btn.dataset;
      $$('.reaction-add', $(`[data-id="${msg}"]`))[0]?.click();
    });
  });

  $$('[data-action="reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { msg } = btn.dataset;
      STATE.activeThread = msg;
      openThread(msg);
    });
  });

  $$('[data-action="download"]').forEach(btn => {
    btn.addEventListener('click', () => showToast('文件开始下载'));
  });
}

/* ── 话题 ─────────────────────────────────────────────────────── */

const THREAD_REPLIES = {
  m3: [
    { who:'chenmo',    time:'10:11', content:'提到顶栏我同意，但要控制数量，顶栏最多放 4 个入口，不然又乱了。', reactions:[['👍',1]] },
    { who:'suli',      time:'10:16', content:'补个数据：测试里 8 个人有 5 个第一时间去点顶栏找看板，顶栏确实是心智默认位置。', reactions:[['👍',4]] },
    { who:'heyizhou',  time:'10:20', content:'那就定：看板进顶栏，报表留在左侧。周砚你出第四版时带上这个改动。', reactions:[] },
    { who:'zhouyan',    time:'10:24', content:'收到，今天下班前出稿。我先把顶栏的排布画两版，发到这里大家挑。', reactions:[['🎉',2]] },
  ],
};

function openThread(msgId = 'm3') {
  STATE.activeThread = msgId;
  const win  = $('#window');
  const orig = MESSAGES.product.find(m => m.id === msgId) || MESSAGES.product.find(m => m.type === 'thread');
  const origWho = TEAM.find(t => t.id === orig?.who);

  $('#threadOrigin').innerHTML = `<div class="message">
    <img class="message-avatar" src="https://i.pravatar.cc/80?img=${origWho?.img || '13'}" alt="${origWho?.name}">
    <div class="message-content">
      <div class="message-meta">
        <strong class="message-name">${origWho?.name || '未知'}</strong>
        <time>${orig?.time || ''}</time>
      </div>
      <p class="message-text">${escapeHtml(orig?.content || '')}</p>
    </div>
  </div>`;

  const replies = THREAD_REPLIES[msgId] || THREAD_REPLIES['m3'] || [];
  $('#threadReplies').innerHTML = replies.map((r, i) => {
    const w = TEAM.find(t => t.id === r.who) || TEAM[0];
    const reactHtml = r.reactions?.map(([re,c]) =>
      `<button class="reaction${STATE.myReactions.has(`${r.who+i}|${re}`) ? ' mine' : ''}" data-thread-react="${r.who+i}" data-react="${re}">${re}<span>${c}</span></button>`
    ).join('') + `<button class="reaction-add" data-thread-react="${r.who+i}" aria-label="添加回应"><i class="ti ti-mood-plus"></i></button>`;
    return `<div class="message enter-stagger" style="--i:${i}">
      <img class="message-avatar" src="https://i.pravatar.cc/80?img=${w.img}" alt="${w.name}">
      <div class="message-content">
        <div class="message-meta"><strong class="message-name">${w.name}</strong><time>${r.time}</time></div>
        <p class="message-text">${escapeHtml(r.content)}</p>
        ${reactHtml ? `<div class="reactions">${reactHtml}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  $$('.reaction[data-thread-react], .reaction-add[data-thread-react]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.threadReact;
      if (btn.classList.contains('reaction-add')) {
        const newR = document.createElement('button');
        newR.className = 'reaction mine';
        newR.dataset.threadReact = key;
        newR.dataset.react = '✨';
        newR.innerHTML = '✨<span>1</span>';
        btn.before(newR);
        btn.remove();
        showToast('已添加回应');
      } else {
        const { threadReact, react } = btn.dataset;
        const existing = STATE.myReactions.has(`${threadReact}|${react}`);
        if (existing) { STATE.myReactions.delete(`${threadReact}|${react}`); btn.classList.remove('mine'); }
        else { STATE.myReactions.add(`${threadReact}|${react}`); btn.classList.add('mine'); }
      }
    });
  });

  win.classList.add('has-thread');
  win.removeAttribute('hidden');
  $('#thread').removeAttribute('hidden');
  const threadScroll = $('#threadScroll');
  if (threadScroll) threadScroll.scrollTop = 0;
  showToast('已打开话题');
}

function closeThread() {
  const win = $('#window');
  win.classList.remove('has-thread');
  $('#thread').setAttribute('hidden', '');
  STATE.activeThread = null;
}

/* ── 话题输入 ─────────────────────────────────────────────────── */

function attachThreadInput() {
  const ed = $('#threadEditor');
  const btn = $('#threadSend');
  const also = $('#alsoChannel');

  ed?.addEventListener('input', () => {
    btn.disabled = !ed.value.trim();
  });
  btn?.addEventListener('click', () => {
    const text = ed.value.trim();
    if (!text) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'message enter-stagger';
    msgEl.innerHTML = `<img class="message-avatar" src="https://i.pravatar.cc/80?img=12" alt="顾帆">
      <div class="message-content">
        <div class="message-meta"><strong class="message-name">顾帆</strong><time>刚刚</time></div>
        <p class="message-text">${escapeHtml(text)}</p>
      </div>`;
    $('#threadReplies').appendChild(msgEl);
    ed.value = '';
    btn.disabled = true;
    const count = $$('#threadReplies .message').length + 1;
    $('#threadCount').textContent = `${count} 条回复`;
    $('#threadHeaderCount').textContent = count;
    $('#threadScroll').scrollTop = $('#threadScroll').scrollHeight;
    if (also.checked) showToast('回复已发送到频道');
    else showToast('回复已发送到话题');
  });
}

/* ── @ 提及 ──────────────────────────────────────────────────── */

function openMentionPop(query = '') {
  const pop = $('#mentionPop');
  if (!pop) return;
  STATE.mentionQuery = query;
  const members = TEAM.filter(t => !query || t.name.includes(query.replace('@','')));
  if (!members.length) {
    pop.innerHTML = `<div class="mention-empty">未找到匹配的同事</div>`;
    pop.removeAttribute('hidden');
    return;
  }
  pop.innerHTML = `<header>提醒谁看</header>
    ${members.map((m, i) => `<button class="mention-option" data-name="${m.name}" ${i===0?'aria-selected="true"':''}>
      <img src="https://i.pravatar.cc/28?img=${m.img}" alt="${m.name}">
      <strong>${m.name}</strong><span>${m.role}</span>
    </button>`).join('')}`;
  pop.removeAttribute('hidden');
  $$('.mention-option', pop).forEach(btn => {
    btn.addEventListener('click', () => {
      const ed = $('#editor');
      if (ed) {
        ed.value = `@${btn.dataset.name} `;
        ed.focus();
      }
      pop.setAttribute('hidden', '');
    });
  });
}

function closeMentionPop() {
  $('#mentionPop')?.setAttribute('hidden', '');
}

/* ── 编辑器 / 发送 ─────────────────────────────────────────────── */

function focusEditor() {
  setTimeout(() => $('#editor')?.focus(), 60);
}

function attachComposer() {
  const ed  = $('#editor');
  const btn = $('#sendBtn');

  ed?.addEventListener('input', () => {
    btn.disabled = !ed.value.trim();
    const atIdx = ed.value.lastIndexOf('@');
    if (atIdx >= 0 && (atIdx === 0 || /[\s​]/.test(ed.value[atIdx-1]))) {
      const q = ed.value.slice(atIdx);
      if (!q.includes(' ') && q.length < 20) openMentionPop(q);
      else closeMentionPop();
    } else {
      closeMentionPop();
    }
    autoResize(ed);
  });

  ed?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (ed.value.trim()) sendMessage();
    }
    if (e.key === 'Escape') closeMentionPop();
  });

  btn?.addEventListener('click', () => { if (!$('#sendBtn').disabled) sendMessage(); });

  $$('.mention-pop button').forEach(btn => {
    btn.addEventListener('click', () => {
      const ed = $('#editor');
      if (ed) { ed.value = '@' + btn.dataset.name + ' '; ed.focus(); }
      closeMentionPop();
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.mention-pop') && !e.target.closest('[data-mention]')) closeMentionPop();
  });
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 130) + 'px';
}

function sendMessage() {
  const ed  = $('#editor');
  const btn = $('#sendBtn');
  const text = ed?.value.trim();
  if (!text) return;

  const list = $('#messageList');
  const msgEl = document.createElement('div');
  msgEl.className = 'message is-new';
  msgEl.innerHTML = `<img class="message-avatar" src="https://i.pravatar.cc/80?img=12" alt="顾帆">
    <div class="message-content">
      <div class="message-meta"><strong class="message-name">顾帆</strong><time>刚刚</time></div>
      <p class="message-text">${escapeHtml(text)}</p>
    </div>`;
  list.appendChild(msgEl);
  msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  ed.value = '';
  ed.style.height = 'auto';
  btn.disabled = true;
  closeMentionPop();
  if (STATE.files.length) {
    STATE.files = [];
    $('#attachments')?.remove();
  }
  showToast('消息已发送');
}

/* ── 文件附件 ─────────────────────────────────────────────────── */

function attachDropZone() {
  const comp = $('#composer');
  comp?.addEventListener('dragover', e => { e.preventDefault(); comp.classList.add('is-dragging'); });
  comp?.addEventListener('dragleave', e => { if (!comp.contains(e.relatedTarget)) comp.classList.remove('is-dragging'); });
  comp?.addEventListener('drop', e => {
    e.preventDefault();
    comp.classList.remove('is-dragging');
    const files = [...(e.dataTransfer?.files || [])];
    files.forEach(f => addAttachment(f));
  });

  $('#attachButton')?.addEventListener('click', () => $('#fileInput').click());
  $('#fileInput')?.addEventListener('change', e => {
    [...(e.target.files || [])].forEach(f => addAttachment(f));
    e.target.value = '';
  });
}

function addAttachment(file) {
  const comp = $('#composer');
  let attach = $('#attachments');
  if (!attach) {
    attach = document.createElement('div');
    attach.className = 'draft-attachments';
    attach.id = 'attachments';
    comp.insertBefore(attach, comp.querySelector('textarea'));
  }
  const chip = document.createElement('div');
  chip.className = 'draft-file';
  const isImg = file.type.startsWith('image/');
  const size = file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  chip.innerHTML = isImg
    ? `<img src="${URL.createObjectURL(file)}" alt="${file.name}">`
    : `<i class="ti ti-file" aria-hidden="true"></i>`;
  chip.innerHTML += `<div><strong>${file.name}</strong><span>${size}</span></div>
    <button class="icon-btn" aria-label="移除"><i class="ti ti-x" aria-hidden="true"></i></button>`;
  chip.querySelector('button').addEventListener('click', () => {
    chip.remove();
    STATE.files = STATE.files.filter(f => f !== file);
    if (!$$('.draft-file').length) attach.remove();
    showToast('附件已移除');
  });
  attach.appendChild(chip);
  STATE.files.push(file);
  showToast('附件已添加');
}

/* ── 表情选择 ─────────────────────────────────────────────────── */

const EMOJIS = ['👍','👏','🎉','💯','🔥','👀','✨','✅','😂','🤔','❤️','🚀'];

function attachEmoji() {
  $('#emojiButton')?.addEventListener('click', e => {
    e.stopPropagation();
    const pop = $('#emojiPop');
    if (!pop.hasAttribute('hidden')) { pop.setAttribute('hidden',''); return; }
    pop.innerHTML = EMOJIS.map(em => `<button aria-label="${em}">${em}</button>`).join('');
    pop.removeAttribute('hidden');
    $$('button', pop).forEach(btn => {
      btn.addEventListener('click', () => {
        const ed = $('#editor');
        if (ed) { ed.value += btn.textContent; ed.focus(); }
        pop.setAttribute('hidden','');
      });
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#emojiPop') && !e.target.closest('#emojiButton')) {
      $('#emojiPop')?.setAttribute('hidden','');
    }
  });
}

/* ── 键盘快捷键 ────────────────────────────────────────────────── */

function attachShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      $('#searchOpen')?.click();
      showToast('搜索功能开发中');
    }
    if (e.key === 'Escape') {
      if (!$('#thread').hasAttribute('hidden')) closeThread();
      closeMentionPop();
      $('#emojiPop')?.setAttribute('hidden','');
    }
    if (e.key === 'Escape' && e.shiftKey) openThread();
  });
}

/* ── 辅助函数 ─────────────────────────────────────────────────── */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function scrollBottom() {
  const sc = $('.conversation-scroll');
  if (sc) sc.scrollTop = sc.scrollHeight;
}

/* ── 演示自动状态 ──────────────────────────────────────────────── */

function startDemo() {
  // 模拟同事动态输入
  const cycleTyping = () => {
    const people = ['林晚乔', '陈默', '周砚'];
    const names  = people.slice(0, Math.floor(Math.random() * 3) + 1).join('、');
    $('#typingText').innerHTML = `<strong>${names}</strong> 正在输入`;
    $$('.typing-people img').forEach((img, i) => {
      const t = TEAM[i % TEAM.length];
      img.src = `https://i.pravatar.cc/40?img=${t.img}`;
    });
    $$('.typing-dots b').forEach(b => { b.style.animation = 'none'; b.offsetHeight; b.style.animation = ''; });
    setTimeout(cycleTyping, 4000 + Math.random() * 3000);
  };
  setTimeout(cycleTyping, 2500);

  // 模拟新消息
  const newMsg = () => {
    const pool = [
      { who:'chenmo', time:'10:52', content:'刚确认了 CSS 过渡的优先级没问题，可以放心用。' },
      { who:'zhouyan', time:'10:55', content:'顶栏方案出了，截图发到频道里，大家看一下。' },
      { who:'suli',    time:'10:57', content:'数据这边有个问题想确认：周报里的 DAU 口径是什么？' },
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const w = TEAM.find(t => t.id === pick.who);
    const list = $('#messageList');
    const el = document.createElement('div');
    el.className = 'message is-new';
    el.innerHTML = `<img class="message-avatar" src="https://i.pravatar.cc/80?img=${w.img}" alt="${w.name}">
      <div class="message-content">
        <div class="message-meta"><strong class="message-name">${w.name}</strong><time>${pick.time}</time></div>
        <p class="message-text">${escapeHtml(pick.content)}</p>
      </div>`;
    list.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#newMessagePill')?.setAttribute('hidden','');
    setTimeout(newMsg, 18000 + Math.random() * 12000);
  };
  setTimeout(newMsg, 8000);
}

/* ── 全局 UI ──────────────────────────────────────────────────── */

function attachGlobalUI() {
  $('#threadClose')?.addEventListener('click', closeThread);

  $$('.scene').forEach(btn => {
    btn.addEventListener('click', () => setScene(btn.dataset.scene));
  });

  $$('.group-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'false';
      toggle.setAttribute('aria-expanded', String(!expanded));
    });
  });

  $('#unreadButton')?.addEventListener('click', () => showToast('未读消息功能开发中'));
  $('#channelSearch')?.addEventListener('click', () => showToast('当前对话搜索功能开发中'));
  $('#channelInfo')?.addEventListener('click', () => showToast('频道信息开发中'));
  $('#membersButton')?.addEventListener('click', () => openMembersDialog());
  $('#favoriteChannel')?.addEventListener('click', e => {
    const btn = e.currentTarget;
    btn.classList.toggle('selected');
    showToast(btn.classList.contains('selected') ? '已收藏频道' : '已取消收藏');
  });
  $('#quietSwitch')?.addEventListener('click', e => {
    const sw = e.currentTarget;
    const on = sw.getAttribute('aria-checked') === 'true';
    sw.setAttribute('aria-checked', String(!on));
    $('#quietLabel').textContent = on ? '通知已静默' : '通知正常接收';
    showToast(on ? '已开启免打扰' : '已关闭免打扰');
  });
  $('#searchOpen')?.addEventListener('click', () => showToast('全局搜索功能开发中'));
  $('#helpButton')?.addEventListener('click', () => openHelpDialog());
  $$('.rail-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = $('small', btn)?.textContent || '';
      $$('.rail-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`正在打开${icon}`);
    });
  });
  $('#sidebarToggle')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('mobile-open'));
  $('#newConversation')?.addEventListener('click', () => showToast('发起新对话功能开发中'));
  $('#workspaceButton')?.addEventListener('click', () => showToast('切换工作区功能开发中'));
  $('#addDirect')?.addEventListener('click', () => showToast('发起私聊功能开发中'));
  $$('[data-create]').forEach(btn => {
    btn.addEventListener('click', () => showToast(`新建${btn.dataset.create}功能开发中`));
  });
  $('#dialogClose')?.addEventListener('click', () => $('#dialog').close());
  $('#dialog').addEventListener('click', e => { if (e.target === $('#dialog')) $('#dialog').close(); });
  $('#codeButton')?.addEventListener('click', () => showToast('代码片段功能开发中'));
  $('#mentionButton')?.addEventListener('click', () => {
    openMentionPop('@');
    const ed = $('#editor');
    if (ed) { ed.value = '@'; ed.focus(); }
  });
}

function openMembersDialog() {
  $('#dialogTitle').textContent = '频道成员';
  $('#dialogBody').innerHTML = TEAM.map(m => `<button class="dialog-member">
    <img src="https://i.pravatar.cc/60?img=${m.img}" alt="${m.name}">
    <div><strong>${m.name}</strong><small>${m.role}</small></div>
    <span>${m.online ? '在线' : '离线'}</span>
  </button>`).join('');
  $$('.dialog-member').forEach(btn => btn.addEventListener('click', () => { $('#dialog').close(); showToast(`正在打开与 ${$('strong', btn).textContent} 的私聊`); }));
  $('#dialog').showModal();
}

function openHelpDialog() {
  $('#dialogTitle').textContent = '原型说明';
  $('#dialogBody').innerHTML = `<p>这是一个可交互的高保真即时通讯桌面端原型。</p>
    <div class="setting-row"><label>聊天消息</label><span>点击频道即可切换对话</span></div>
    <div class="setting-row"><label>消息回应</label><span>点击 👍 等按钮添加表情回应</span></div>
    <div class="setting-row"><label>话题回复</label><span>点击 <strong>查看 N 条回复</strong> 打开右侧话题栏</span></div>
    <div class="setting-row"><label>@ 提及</label><span>输入 @ 触发同事选择弹层</span></div>
    <div class="setting-row"><label>拖放附件</label><span>将文件拖入输入框下方的虚线区域</span></div>
    <div class="setting-row"><label>发送消息</label><span>在输入框写好后按 Enter 或点击发送按钮</span></div>
    <div class="setting-row"><label>快捷键</label><span>Ctrl+K 搜索 · Esc 关闭弹层</span></div>
    <div class="setting-row"><label>顶部状态栏</label><span>点击 <i class="ti ti-help-circle"></i> 查看此说明</span></div>`;
  $('#dialog').showModal();
}

/* ── 初始化 ──────────────────────────────────────────────────── */

buildNav();
renderMessages();
attachComposer();
attachThreadInput();
attachDropZone();
attachEmoji();
attachShortcuts();
attachGlobalUI();
startDemo();

/* 预置 3 种场景的快速演示 */
setTimeout(() => {
  const scenes = ['thread', 'draft'];
  scenes.forEach((s, i) => {
    setTimeout(() => setScene(s), i * 12000 + 5000);
  });
  setTimeout(() => setScene('daily'), scenes.length * 12000 + 8000);
}, 3000);
