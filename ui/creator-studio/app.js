(() => {
  'use strict';

  /* --------------------------------------------------------------- data */

  // 原型用固定基准日，保证演示内容与日历始终对得上
  const TODAY = new Date(2026, 9, 24);
  const WEEK_START = new Date(2026, 9, 19);

  const PLATFORMS = ['小红书', '抖音', 'B站', '公众号'];
  const LIMITS = { 小红书: 1000, 抖音: 55, B站: 2000, 公众号: 20000 };
  const STATUS = { idea: '选题', draft: '草稿', queued: '待发', published: '已发' };

  let content = [
    {
      id: 1, title: '在东京住了一个月，只带了两件外套', status: 'queued', tag: '旅行',
      platforms: ['小红书', 'B站'], date: '2026-10-24', time: '20:00', views: 0,
      body: '出发前把行李箱清到只剩两件外套，想看看一个月只靠叠穿能撑多久。\n\n第一周最难。十月的东京白天还有二十度，早晚却要加一件，我把衬衫当内搭，外面套薄风衣，中午脱下来塞进帆布袋。\n\n第二周开始习惯。洗衣店在住处拐角，六百日元洗一筐，周三去一次就够。省下来的空间放了一本书和一台胶片机。\n\n回来整理照片，发现拍得最多的不是衣服，是便利店门口的光。凌晨两点的自动门，灯管有点闪，照在湿的柏油路上。\n\n行李变少之后，选择也变少了，反而有时间看别的东西。'
    },
    {
      id: 2, title: '把 6㎡ 阳台改成工作室', status: 'draft', tag: '家居',
      platforms: ['小红书'], date: '', time: '', views: 0,
      body: '量了三次尺寸，最后只留了一张 80cm 的桌子和一盏灯。\n\n采光是这个改造里最贵也最值的一项。'
    },
    {
      id: 3, title: '为什么我不再买快时尚', status: 'idea', tag: '观点',
      platforms: ['公众号'], date: '', time: '', views: 0, body: ''
    },
    {
      id: 4, title: '用 300 块拍出杂志感静物', status: 'published', tag: '教程',
      platforms: ['小红书', 'B站'], date: '2026-10-21', time: '19:30', views: 48200,
      body: '一块石膏板，两张 A3 白卡，一盏 60 块的台灯。\n\n拍摄顺序是：先定光位，再摆道具。台灯放在十点钟方向，白卡立在右侧补暗部，石膏板当桌面，纹理比纯白纸有细节。\n\n背景用第二张白卡竖起来，离主体八十厘米，这样会自然退到焦外。光圈开到 f2.8，快门 1/125，ISO 400。\n\n后期只做了三件事：拉回高光、压一点绿、加颗粒。\n\n角度比器材重要，这句话被说烂了，但真到现场还是会先怪相机。'
    },
    {
      id: 5, title: '胶片相机入坑半年的 12 张废片', status: 'idea', tag: '摄影',
      platforms: ['B站'], date: '', time: '', views: 0, body: ''
    },
    {
      id: 6, title: '复盘：一条视频涨粉 4 千，我踩的坑', status: 'draft', tag: '复盘',
      platforms: ['公众号'], date: '', time: '', views: 0, review: true,
      body: '前三秒的钩子改了七版，最后用的是最不像钩子的那版。\n\n这条要写清楚数据是怎么骗人的。'
    },
    {
      id: 7, title: '一个人的周末：从早市到深夜书房', status: 'queued', tag: '生活',
      platforms: ['小红书'], date: '2026-10-26', time: '10:30', views: 0,
      body: '早市六点半开，去晚了虾就没了。\n\n下午在书房整理这一年的票根。'
    },
    {
      id: 8, title: '独立创作者的第四个年头，账本公开', status: 'idea', tag: '复盘',
      platforms: ['公众号'], date: '', time: '', views: 0, body: ''
    },
    {
      id: 9, title: '通勤四十分钟，我听完了 12 本书', status: 'published', tag: '阅读',
      platforms: ['公众号'], date: '2026-10-17', time: '08:00', views: 18600,
      body: '把倍速调到 1.25，是这半年唯一坚持下来的习惯。\n\n书单按听感排，不按评分排。'
    },
    {
      id: 10, title: '小户型厨房改造成本清单', status: 'draft', tag: '家居',
      platforms: ['小红书'], date: '', time: '', views: 0,
      body: '台面、五金、人工三项拆开算，先写结论：贵在人工。'
    },
    {
      id: 11, title: '深夜写不出稿时，我做这三件事', status: 'published', tag: '写作',
      platforms: ['小红书'], date: '2026-10-22', time: '21:00', views: 31400,
      body: '第一件事是离开椅子。走到楼下便利店买一瓶水，来回八分钟，回来往往就知道下一句该写什么。\n\n第二件是把稿子念出来。念不顺的地方就是要改的地方，眼睛会骗人，嘴巴不会。\n\n第三件是关掉字数统计。盯着数字写，写出来的都是凑数的句子。'
    },
    {
      id: 12, title: '编辑部不会告诉你的排版四原则', status: 'queued', tag: '排版',
      platforms: ['公众号', 'B站'], date: '2026-10-25', time: '20:00', views: 0,
      body: '对齐、留白、层级、节奏。四个词各自展开两千字都够，这篇先讲最容易被忽略的那两个。\n\n留白不是空，是让读者有地方停。段间距比行距更值得调，行距管的是句子的呼吸，段间距管的是思路的呼吸。\n\n节奏靠长短句交替。连着三个长句之后，来一个四字的短句，读者的注意力会自己回来。'
    },
    {
      id: 13, title: '我把通勤时间变成了播客时间', status: 'idea', tag: '播客',
      platforms: ['B站'], date: '', time: '', views: 0, body: ''
    },
    {
      id: 14, title: '三条视频剪到凌晨三点，值得吗', status: 'published', tag: '复盘',
      platforms: ['B站'], date: '2026-10-20', time: '21:30', views: 12700,
      body: '数据上不值得，手感上值得。这次把两边的账都算了一遍。'
    }
  ];

  const platforms = [
    { name: '小红书', fans: 12480, delta: 110, views: 62400, rate: 7.2, icon: 'ti-book-2' },
    { name: '抖音', fans: 8200, delta: 64, views: 38900, rate: 5.1, icon: 'ti-brand-tiktok' },
    { name: 'B站', fans: 3940, delta: 12, views: 18600, rate: 8.4, icon: 'ti-brand-bilibili' },
    { name: '公众号', fans: 2310, delta: 18, views: 8740, rate: 3.8, icon: 'ti-brand-wechat' }
  ];

  /* 平台授权：假定已通过 OAuth / API Key 绑定，账户可用于发布、编辑、删除 */
  const BIND = [
    {
      name: '小红书', icon: 'ti-book-2', handle: '@砚舟', auth: 'OAuth',
      state: 'ok', scope: ['发布', '编辑', '删除'], used: 3, quota: 5,
      note: '图文最多 9 图', max: 1000
    },
    {
      name: '抖音', icon: 'ti-brand-tiktok', handle: '@yanzhou', auth: 'OAuth',
      state: 'ok', scope: ['发布', '删除'], used: 2, quota: 3,
      note: '只收视频', max: 55
    },
    {
      name: 'B站', icon: 'ti-brand-bilibili', handle: '砚舟Yanzhou', auth: 'OAuth',
      state: 'expiring', scope: ['发布'], used: 1, quota: 3,
      note: '授权 3 天后到期', max: 2000
    },
    {
      name: '公众号', icon: 'ti-brand-wechat', handle: '砚舟手记', auth: 'API Key',
      state: 'ok', scope: ['发布', '编辑', '删除'], used: 0, quota: 1,
      note: '每日 1 次群发', max: 20000
    }
  ];

  const PUSH_STATE = { queue: '排队', upload: '推送中', review: '审核中', live: '已发布', failed: '失败' };

  const bindOf = (n) => BIND.find((b) => b.name === n);

  /* 已发布内容已有的分发痕迹（模拟），14 号留一条失败用来演示重试 */
  const SEED_PUSH = {
    4: {
      小红书: { state: 'live', at: '10/21 19:34', note: '笔记 6f2a91' },
      B站: { state: 'live', at: '10/21 19:41', note: 'BV1qs4y1H7kD' }
    },
    9: { 公众号: { state: 'live', at: '10/17 08:02', note: '已群发' } },
    11: { 小红书: { state: 'live', at: '10/22 21:06', note: '笔记 a8c30d' } },
    14: { B站: { state: 'failed', at: '10/20 21:52', note: '转码超时，可重试' } }
  };

  const replies = [
    { name: '阿柑', text: '这套配色可以出个教程吗？想看调色过程', time: '2 小时前', seed: 'AhGan' },
    { name: '林间', text: '阳台改造的预算能再细说一下吗', time: '5 小时前', seed: 'LinJian' },
    { name: 'momo', text: '第三张用的什么相机，颗粒感很好看', time: '昨天', seed: 'Momo' }
  ];

  /* 素材库：图片之外还有链接、新闻、知识库、文件、文档、灵感与笔记 */
  const RTYPE = {
    image: { label: '图片', icon: 'ti-photo' },
    link: { label: '链接', icon: 'ti-link' },
    news: { label: '新闻', icon: 'ti-news' },
    kb: { label: '知识库', icon: 'ti-database' },
    file: { label: '文件', icon: 'ti-file-zip' },
    doc: { label: '文档', icon: 'ti-file-text' },
    spark: { label: '灵感', icon: 'ti-bulb' },
    note: { label: '笔记', icon: 'ti-notebook' }
  };

  let assets = [
    { id: 1, type: 'image', kind: 'cover', name: '东京街头-夜色.jpg', seed: 'tokyo-night', size: '2.4 MB' },
    { id: 13, type: 'link', tags: ['排版', '引用'], title: '排版四原则的原始出处', host: 'typejournal.org', url: 'https://typejournal.org/essays/space', note: '讲对齐与留白的关系，比教程扎实', at: '10/22' },
    { id: 2, type: 'image', kind: 'cover', name: '阳台改造-俯拍.jpg', seed: 'balcony-03', size: '3.1 MB' },
    { id: 17, type: 'news', tags: ['规则', '分发'], title: '平台调整图文流量分发规则', source: '平台公告', note: '九图以上更容易进推荐池，正文前两行权重上调', at: '今天 09:20', fresh: true },
    { id: 3, type: 'image', kind: 'shot', name: '静物台-白卡.jpg', seed: 'still-life-7', size: '1.8 MB' },
    { id: 27, type: 'spark', text: '地铁到站时，所有人同时抬头的那个瞬间', at: '今天 08:41' },
    { id: 4, type: 'image', kind: 'ref', name: '排版参考-日刊.jpg', seed: 'type-ref-2', size: '0.9 MB' },
    { id: 5, type: 'image', kind: 'cover', name: '厨房改造-台面.jpg', seed: 'kitchen-top', size: '2.7 MB' },
    { id: 30, type: 'note', tags: ['家居', '预算'], title: '阳台改造：尺寸与预算', lines: 18, at: '10/24', note: '桌子 80×50，灯 12W 暖白，预算一千八' },
    { id: 6, type: 'image', kind: 'cover', name: '书房-深夜.jpg', seed: 'study-night', size: '2.2 MB' },
    { id: 20, type: 'kb', tags: ['摄影', '基础'], title: '构图与光线', path: '摄影 / 基础', count: 42, at: '10/23', note: '案例、布光图与失败样本' },
    { id: 7, type: 'image', kind: 'shot', name: '胶片废片-01.jpg', seed: 'film-01', size: '4.6 MB' },
    { id: 22, type: 'file', name: '封面模板-栏目.psd', ext: 'PSD', size: '18.2 MB', at: '10/22' },
    { id: 8, type: 'image', kind: 'shot', name: '早市-六点半.jpg', seed: 'market-early', size: '3.4 MB' },
    { id: 9, type: 'image', kind: 'ref', name: '排版参考-书脊.jpg', seed: 'type-ref-9', size: '1.1 MB' },
    { id: 25, type: 'doc', tags: ['选题', '纪要'], title: '十月选题会纪要', pages: 3, at: '10/23', note: '定了四个栏目和一条长期线' },
    { id: 10, type: 'image', kind: 'shot', name: '通勤-车窗.jpg', seed: 'commute-win', size: '2.0 MB' },
    { id: 18, type: 'news', tags: ['趋势'], title: '短视频平均完播率连续三个月下滑', source: '行业周报', note: '十五秒以内的内容反而回升', at: '昨天' },
    { id: 11, type: 'image', kind: 'cover', name: '封面模板-栏目.jpg', seed: 'cover-tpl-4', size: '0.6 MB' },
    { id: 28, type: 'spark', text: '如果一篇稿子只能留三个句子，会是哪三个', at: '昨天 23:10' },
    { id: 12, type: 'image', kind: 'shot', name: '剪辑截图-时间线.jpg', seed: 'timeline-2', size: '1.4 MB' },
    { id: 14, type: 'link', tags: ['变现', '数据'], title: '独立创作者的收入结构调查', host: 'ghost.org', url: 'https://ghost.org/resources/creator-income', note: '订阅与商单的比例数据，样本 2,400 人', at: '10/19' },
    { id: 21, type: 'kb', tags: ['运营'], title: '平台规则速查', path: '运营 / 分发', count: 18, at: '10/21', note: '字数、图片数、发布时间窗' },
    { id: 23, type: 'file', name: '东京夜景-原片.raw', ext: 'RAW', size: '42.6 MB', at: '10/18' },
    { id: 29, type: 'spark', text: '旧书店的塑料价签，比书本身更像时间', at: '10/19' },
    { id: 31, type: 'note', tags: ['流程'], title: '录音转文字的几个坑', lines: 9, at: '10/20', note: '断句、口头语、人名，三样都要手改' },
    { id: 15, type: 'link', tags: ['摄影', '夜拍'], title: '城市夜拍的色温控制', host: 'fstoppers.com', url: 'https://fstoppers.com/night/white-balance', note: '路灯下的白平衡参考，附直方图', at: '10/16' },
    { id: 26, type: 'doc', tags: ['商务'], title: '商单报价与交付清单', pages: 5, at: '10/11', note: '含修改次数与加急费' },
    { id: 19, type: 'news', tags: ['出版'], title: '独立出版小册子的印刷成本回落', source: '出版观察', note: '小批量起印价降了两成，适合先做试读本', at: '10/20' },
    { id: 24, type: 'file', name: '栏目片头.bgm.mp3', ext: 'MP3', size: '6.4 MB', at: '10/15' },
    { id: 16, type: 'link', tags: ['工具'], title: '写作工具清单（今年版）', host: 'sspai.com', url: 'https://sspai.com/post/writing-tools', note: '只留了三个真在用的', at: '10/12' },
    { id: 32, type: 'note', tags: ['读者'], title: '读者提问汇总', lines: 24, at: '10/18', note: '器材、预算、更新时间，问得最多的三类' }
  ];

  const series7 = [3860, 4120, 4480, 4210, 3960, 4520, 4859];
  const series30 = [
    3410, 3620, 3290, 3880, 4120, 3980, 3710, 4050, 4420, 4180,
    4620, 4890, 4710, 4380, 4120, 4460, 4910, 5230, 4980, 4720,
    4510, 4870, 5310, 5120, 4780, 4940, 5410, 5230, 4980, 5160
  ];

  content.forEach((c) => {
    c.words = c.body.replace(/\s/g, '').length;
    c.push = SEED_PUSH[c.id] ? JSON.parse(JSON.stringify(SEED_PUSH[c.id])) : {};
  });


  const prefs = Object.assign(
    { goal: 4, remind: '19:30', plats: ['小红书', 'B站'], motion: true },
    readPrefs()
  );

  const state = {
    view: 'today',
    returnView: 'today',
    status: 'all',
    weekOffset: 0,
    range: 7,
    assetType: 'all',
    aiOpen: true,
    layer: null,
    cursor: 0,
    results: []
  };

  // 编辑器会话：草稿 + 历史栈
  const ed = { id: null, draft: null, saved: null, stack: [], index: -1, timer: 0 };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const app = $('#app');

  /* ------------------------------------------------------------- helpers */

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem('creator-studio:prefs') || '{}'); } catch { return {}; }
  }

  function savePrefs() {
    try { localStorage.setItem('creator-studio:prefs', JSON.stringify(prefs)); } catch { /* 忽略隐私模式 */ }
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
  const pad = (n) => String(n).padStart(2, '0');
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const weekday = (d) => '日一二三四五六'[d.getDay()];
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function monthDay(str) {
    if (!str) return '';
    const [, m, d] = str.split('-');
    return `${Number(m)}月${Number(d)}日`;
  }

  function shortDate(str) {
    if (!str) return '';
    const [, m, d] = str.split('-');
    return `${Number(m)}/${Number(d)}`;
  }

  function relativeDay(str) {
    if (!str) return '不排期';
    const diff = Math.round((new Date(`${str}T00:00`) - TODAY) / 86400000);
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === -1) return '昨天';
    return shortDate(str);
  }

  const slotText = (c) => (c.date ? `${shortDate(c.date)} ${c.time}` : '');
  const find = (id) => content.find((c) => c.id === Number(id));
  const words = (body) => String(body).replace(/\s/g, '').length;
  const avatar = (seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
  const art = (seed) => `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

  function toast(text) {
    const el = $('#toast');
    $('span', el).textContent = text;
    el.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  function download(name, text, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    fallbackCopy(text);
    return Promise.resolve();
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* 旧环境忽略 */ }
    ta.remove();
  }

  /* -------------------------------------------------------------- render */

  function renderMetrics() {
    const queued = content.filter((c) => c.status === 'queued');
    const drafts = content.filter((c) => c.status === 'draft');
    const review = content.filter((c) => c.review).length;

    $('[data-date-label]').textContent = `${TODAY.getMonth() + 1}月${TODAY.getDate()}日 周${weekday(TODAY)}`;

    const start = weekStart(0);
    const done = content.filter((c) => c.status === 'published' && c.date >= key(start) && c.date <= key(addDays(start, 6))).length;
    $('[data-goal-label]').textContent = `已发 ${done} / ${prefs.goal}`;
    $('[data-goal-fill]').style.width = `${Math.min(100, (done / prefs.goal) * 100)}%`;
    $('[data-due-count]').textContent = queued.length;
    $('[data-count-draft]').textContent = drafts.length;
    $('[data-count-review]').textContent = review;
    $('[data-count-follow]').textContent = `+${platforms.reduce((s, p) => s + p.delta, 0)}`;
    $('[data-total-count]').textContent = content.length;
    $('[data-asset-count]').textContent = assets.length;
    $('[data-asset-img]').textContent = assets.filter((a) => a.type === 'image').length;
    $('[data-asset-size]').textContent = `${assets.reduce((s, a) => s + (a.size ? parseFloat(a.size) : 0), 0).toFixed(1)} MB`;

    const next = queued.filter((c) => c.date).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    $('.lede-note').innerHTML = next
      ? `最近一条 <b data-next-slot>${esc(slotText(next))}</b> 上${esc(next.platforms[0])}`
      : '眼下没有排定待发的内容';
  }

  function weekStart(offset) {
    return addDays(WEEK_START, offset * 7);
  }

  function cardHTML(c, i) {
    let meta = '';
    let cls = '';
    if (c.status === 'published' && c.views) {
      meta = `${(c.views / 1000).toFixed(1)}k 阅`;
    } else if (c.date) {
      meta = slotText(c);
      cls = c.status === 'queued' ? 'card-due' : '';
    } else if (c.words) {
      meta = `${c.words} 字`;
    }
    const ex = String(c.body || '').replace(/\s+/g, ' ').trim().slice(0, 64);
    return `<article class="card" draggable="true" tabindex="0" data-card="${c.id}" style="--i:${i}">
      <h3>${esc(c.title) || '无标题'}</h3>
      ${ex ? `<p class="card-ex">${esc(ex)}</p>` : ''}
      <div class="card-foot"><span class="card-tag">${esc(c.tag)}</span><span class="${cls}">${meta}</span></div>
    </article>`;
  }

  function renderBoard(animate = false) {
    $$('.col').forEach((col) => {
      const status = col.dataset.status;
      const items = content.filter((c) => c.status === status);
      $('[data-col-count]', col).textContent = String(items.length);
      const body = $('.col-body', col);
      const label = { idea: '加一个选题', draft: '新建草稿', queued: '排入待发', published: '登记已发' }[status];
      body.innerHTML = items.map((c, i) => cardHTML(c, i)).join('')
        + `<button class="col-foot-add" type="button" data-add="${status}"><i class="ti ti-plus" aria-hidden="true"></i>${label}</button>`;
      if (animate) {
        $$('.card', body).forEach((el) => {
          el.classList.add('is-entering');
          el.addEventListener('animationend', () => el.classList.remove('is-entering'), { once: true });
        });
      }
    });
  }

  function renderToday(animate = false) {
    renderMetrics();
    renderBoard(animate);
    renderTicker();
  }

  function renderTicker() {
    const up = content
      .filter((c) => c.status === 'queued' && c.date)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 3);

    const el = $('#ticker');
    if (!up.length) {
      el.innerHTML = '<i class="ti ti-calendar-off" aria-hidden="true"></i><span>排期是空的，去排期页安排下一周</span>';
      return;
    }

    el.innerHTML = '<i class="ti ti-calendar-event" aria-hidden="true"></i>'
      + up.map((c) => `<span class="ticker-item"><b>${esc(slotText(c))}</b><span>${esc(c.title)}</span></span>`).join('<span class="ticker-sep">/</span>');
  }

  function renderTable() {
    const rows = content.filter((c) => state.status === 'all' || c.status === state.status);
    $('[data-filter-note]').textContent = state.status === 'all' ? '全部状态' : `只看${STATUS[state.status]}`;

    const head = `<div class="tr tr-head" role="row">
      <span>标题</span><span>分发</span><span>状态</span><span>字数</span><span>日期</span><span></span>
    </div>`;

    if (!rows.length) {
      $('#content-table').innerHTML = head + emptyHTML('这个状态下还没有内容');
      return;
    }

    $('#content-table').innerHTML = head + rows.map((c) => `
      <div class="tr" role="row" data-card="${c.id}" tabindex="0">
        <div class="tr-title"><span>${esc(c.title) || '无标题'}</span></div>
        <span class="tr-dist">${distChips(c)}</span>
        <span class="state" data-status="${c.status}"><i></i>${STATUS[c.status]}</span>
        <span class="tr-words">${c.words ? c.words.toLocaleString('zh-CN') : ''}</span>
        <span class="tr-date">${c.date ? shortDate(c.date) : ''}</span>
        <span class="tr-ops">
          <button class="tr-send" type="button" data-action="open-push" data-id="${c.id}" aria-label="推送到平台" title="推送到平台"><i class="ti ti-send" aria-hidden="true"></i></button>
          <button class="tr-more" type="button" data-action="row-menu" data-id="${c.id}" aria-label="更多操作"><i class="ti ti-dots" aria-hidden="true"></i></button>
        </span>
      </div>`).join('');
  }

  /* 分发状态点：灰=未推送，绿=已发布，红=失败 */
  function distChips(c) {
    return c.platforms.map((p) => {
      const b = bindOf(p);
      const st = (c.push || {})[p];
      const s = st ? st.state : 'idle';
      const label = st ? `${p} · ${PUSH_STATE[st.state]}${st.note ? ` · ${st.note}` : ''}` : `${p} · 未推送`;
      return `<span class="dchip" data-state="${s}" title="${escAttr(label)}"><i class="ti ${b ? b.icon : 'ti-world'}" aria-hidden="true"></i></span>`;
    }).join('');
  }

  function emptyHTML(text) {
    return `<div class="empty">
      <img src="${art('empty-state')}" alt="" aria-hidden="true" loading="lazy">
      <span>${text}</span>
    </div>`;
  }

  function renderSchedule() {
    const start = weekStart(state.weekOffset);
    const end = addDays(start, 6);
    $('[data-week-label]').textContent = `${monthDay(key(start))} 至 ${monthDay(key(end))}`;

    const weekItems = content.filter((c) => c.date >= key(start) && c.date <= key(end) && c.status !== 'idea');
    $('[data-week-due]').textContent = weekItems.filter((c) => c.status === 'queued').length;
    $('[data-week-note]').textContent = `空档 ${7 - new Set(weekItems.map((c) => c.date)).size} 天`;

    $('#week-grid').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const k = key(d);
      const items = content.filter((c) => c.date === k && c.status !== 'idea');
      const today = k === key(TODAY);
      return `<div class="wday ${today ? 'is-today' : ''}">
        <div class="wday-head"><span>周${weekday(d)}</span><b>${d.getDate()}</b></div>
        <div class="wday-body">
          ${items.length ? items.map((c) => `<button class="wchip ${c.status === 'published' ? 'is-published' : ''}" type="button" data-card="${c.id}">
            <time>${c.time}</time><p>${esc(c.title)}</p>
          </button>`).join('') : `<button class="wslot-empty" type="button" data-schedule="${k}">空档</button>`}
        </div>
        <button class="wday-add" type="button" data-schedule="${k}" aria-label="${monthDay(k)} 新建"><i class="ti ti-plus" aria-hidden="true"></i></button>
      </div>`;
    }).join('');

    const pool = content.filter((c) => !c.date && c.status !== 'published');
    $('[data-pool-count]').textContent = `${pool.length} 条`;
    $('#pool-list').innerHTML = pool.length ? pool.map((c) => `
      <div class="pool-card" data-card="${c.id}" tabindex="0">
        <p>${esc(c.title) || '无标题'}</p>
        <div class="pool-foot">
          <span>${STATUS[c.status]}</span>
          <button type="button" data-schedule-for="${c.id}"><i class="ti ti-calendar-due" aria-hidden="true"></i>安排</button>
        </div>
      </div>`).join('') : `<div class="empty"><span>待排期是空的</span></div>`;
  }

  function imgSrc(a) {
    return a.src || `https://picsum.photos/seed/${encodeURIComponent(a.seed)}/560/420`;
  }

  function assetTitle(a) {
    if (a.type === 'image' || a.type === 'file') return a.name;
    return a.title || a.text || '未命名';
  }

  function renderAssetFilter() {
    const rows = [['all', '全部', 'ti-layout-grid', assets.length]];
    Object.entries(RTYPE).forEach(([k, t]) => {
      rows.push([k, t.label, t.icon, assets.filter((a) => a.type === k).length]);
    });
    $('#asset-filter').innerHTML = rows
      .filter(([k, , , n]) => k === 'all' || n > 0)
      .map(([k, label, icon, n]) => `<button class="kbtn ${state.assetType === k ? 'is-on' : ''}" type="button" role="tab" aria-selected="${state.assetType === k}" data-type="${k}">
        <i class="ti ${icon}" aria-hidden="true"></i><span>${label}</span><em>${n}</em>
      </button>`).join('');
  }

  function assetFoot(a) {
    if (a.type === 'kb') return `${a.count} 条 · ${a.at} 更新`;
    if (a.type === 'file') return `${a.ext} · ${a.size}`;
    if (a.type === 'doc') return `${a.pages} 页 · ${a.at}`;
    if (a.type === 'note') return `${a.lines} 行 · ${a.at}`;
    return a.at || '';
  }

  function assetCard(a) {
    if (a.type === 'image') {
      return `<figure class="res res-img" data-asset="${a.id}" tabindex="0">
        <div class="res-thumb">
          <img src="${imgSrc(a)}" alt="${escAttr(a.name)}" loading="lazy">
          <div class="res-acts">
            <button type="button" data-action="copy-name" data-name="${escAttr(a.name)}" aria-label="复制文件名"><i class="ti ti-copy" aria-hidden="true"></i></button>
            <button type="button" data-action="asset-remove" data-id="${a.id}" aria-label="移除"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </div>
        <figcaption class="res-cap"><span>${esc(a.name)}</span><em>${esc(a.size)}</em></figcaption>
      </figure>`;
    }

    const t = RTYPE[a.type];
    const sub = a.host || a.source || a.path || a.ext || '';
    const head = `<div class="res-head">
        <span class="res-badge"><i class="ti ${t.icon}" aria-hidden="true"></i>${t.label}</span>
        ${a.fresh ? '<span class="res-fresh">新</span>' : ''}
        ${sub ? `<span class="res-sub">${esc(sub)}</span>` : ''}
      </div>`;

    const body = a.type === 'spark'
      ? `<blockquote class="res-quote">${esc(a.text)}</blockquote>`
      : `<h3 class="res-title">${esc(a.title || a.name)}</h3>${a.note ? `<p class="res-note">${esc(a.note)}</p>` : ''}`;

    const tags = a.tags && a.tags.length
      ? `<div class="res-tags">${a.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>`
      : '';

    return `<article class="res res-${a.type}" data-asset="${a.id}" tabindex="0">
      ${head}${body}${tags}
      <div class="res-foot">
        <span>${esc(assetFoot(a))}</span>
        <span class="res-tools">
          <button type="button" data-action="copy-name" data-name="${escAttr(assetTitle(a))}" aria-label="复制标题"><i class="ti ti-copy" aria-hidden="true"></i></button>
          <button type="button" data-action="asset-remove" data-id="${a.id}" aria-label="移除"><i class="ti ti-trash" aria-hidden="true"></i></button>
          <i class="ti ti-arrow-up-right res-go" aria-hidden="true"></i>
        </span>
      </div>
    </article>`;
  }

  function renderAssets() {
    if (state.assetType !== 'all' && !assets.some((a) => a.type === state.assetType)) state.assetType = 'all';
    renderAssetFilter();
    const list = assets.filter((a) => state.assetType === 'all' || a.type === state.assetType);
    $('#asset-grid').innerHTML = list.map(assetCard).join('') || emptyHTML('这个类型下还没有收录');
    renderMetrics();
  }

  function addAsset(item) {
    const id = Math.max(0, ...assets.map((a) => a.id)) + 1;
    assets.unshift(Object.assign({ id }, item));
    renderAssets();
  }

  /* --------------------------------------------------------- 数据面板模拟数据 */

  const ANA = {
    kpi: [
      { label: '阅读总量', num: '135,990', unit: '', delta: '+18.2%', foot: '日均 4,533', icon: 'ti-eye', up: true, series: series30 },
      { label: '新增粉丝', num: '1,462', unit: '', delta: '+12.4%', foot: '七日净增 204', icon: 'ti-user-plus', up: true, series: [23, 31, 26, 36, 31, 37, 20] },
      { label: '互动率', num: '6.4', unit: '%', delta: '+0.7pt', foot: '收藏 2,318 · 评论 704', icon: 'ti-heart', up: true, series: [5.2, 5.6, 5.4, 6.1, 5.9, 6.3, 6.4] },
      { label: '本月营收', num: '5,180', unit: '元', delta: '+24.1%', foot: '商单占 51%', icon: 'ti-report-money', up: true, series: [2.4, 2.9, 3.1, 3.7, 4.4, 5.18] }
    ],
    source: [
      { name: '首页推荐', value: 38 },
      { name: '关注页', value: 24 },
      { name: '站内搜索', value: 17 },
      { name: '站外分享', value: 13 },
      { name: '其他', value: 8 }
    ],
    fans: [
      { name: '小红书', alpha: 1, values: [11, 14, 12, 16, 15, 18, 10] },
      { name: '抖音', alpha: .66, values: [7, 9, 8, 11, 9, 10, 4] },
      { name: 'B站', alpha: .4, values: [2, 4, 3, 4, 3, 4, 2] },
      { name: '公众号', alpha: .2, values: [3, 4, 3, 5, 4, 5, 4] }
    ],
    revenue: {
      months: ['5月', '6月', '7月', '8月', '9月', '10月'],
      items: [
        { name: '商单', alpha: 1, values: [1.4, 1.6, 1.5, 1.9, 2.2, 2.64] },
        { name: '订阅', alpha: .6, values: [.5, .6, .7, .8, .9, 1.02] },
        { name: '打赏', alpha: .36, values: [.3, .3, .4, .4, .5, .62] },
        { name: '带货', alpha: .18, values: [.2, .4, .5, .6, .8, .9] }
      ]
    },
    funnel: [
      { name: '曝光', value: 1284000, rate: '100%' },
      { name: '点击', value: 186400, rate: '14.5%' },
      { name: '阅读', value: 135990, rate: '73.0%' },
      { name: '互动', value: 8712, rate: '6.4%' },
      { name: '关注', value: 1462, rate: '16.8%' }
    ],
    heat: {
      rows: ['一', '二', '三', '四', '五', '六', '日'],
      cols: ['08', '12', '16', '20', '22', '00'],
      values: [
        [.18, .32, .28, .74, .88, .42],
        [.22, .36, .3, .66, .78, .36],
        [.16, .3, .26, .7, .84, .4],
        [.2, .34, .32, .82, .96, .5],
        [.26, .4, .34, .72, .8, .46],
        [.4, .52, .44, .6, .66, .58],
        [.34, .46, .4, .56, .6, .5]
      ]
    },
    types: [
      { name: '旅行', value: 8420 },
      { name: '教程', value: 6940 },
      { name: '复盘', value: 5230 },
      { name: '家居', value: 4160 },
      { name: '生活', value: 3620 },
      { name: '观点', value: 2180 }
    ]
  };

  const nf = (n) => Number(n).toLocaleString('zh-CN');
  const tint = (a) => `rgb(var(--brand-rgb) / ${a})`;

  /* ------------------------------------------------------------- 图表生成 */

  function sparkSVG(arr, w = 138, h = 52) {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const span = max - min || 1;
    const x = (i) => (i / (arr.length - 1)) * w;
    const y = (v) => h - 6 - ((v - min) / span) * (h - 14);
    const line = arr.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' L ');
    const gid = `sp${Math.round(arr[0] * 100)}x${arr.length}`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style="stop-color: rgb(var(--brand-rgb) / .22)"/>
        <stop offset="100%" style="stop-color: rgb(var(--brand-rgb) / 0)"/>
      </linearGradient></defs>
      <path d="M${line} L ${w} ${h} L 0 ${h} Z" fill="url(#${gid})"/>
      <path d="M${line}" fill="none" style="stroke: rgb(var(--brand-rgb) / .5)" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }

  function lineChart(data, prev) {
    const W = 760;
    const H = 220;
    const all = data.concat(prev);
    const max = Math.max(...all) * 1.08;
    const min = Math.min(...all) * 0.84;
    const x = (i) => 6 + (i / (data.length - 1)) * (W - 12);
    const y = (v) => H - ((v - min) / (max - min)) * H;

    const line = (arr) => `M${arr.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' L ')}`;
    const area = `${line(data)} L ${W - 6} ${H} L 6 ${H} Z`;
    const grid = [0.22, 0.5, 0.78].map((r) => `<line x1="0" y1="${(H * r).toFixed(1)}" x2="${W}" y2="${(H * r).toFixed(1)}" vector-effect="non-scaling-stroke"/>`).join('');
    const last = data.length - 1;
    const step = Math.max(1, Math.round(data.length / 7));
    const dots = data.map((v, i) => (i % step === 0 || i === last)
      ? `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.6" style="fill: var(--surface); stroke: var(--brand)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`
      : '').join('');

    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="阅读趋势折线图">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style="stop-color: rgb(var(--brand-rgb) / .2)"/>
          <stop offset="100%" style="stop-color: rgb(var(--brand-rgb) / .01)"/>
        </linearGradient>
      </defs>
      <g style="stroke: var(--line-soft)" stroke-width="1" stroke-dasharray="2 6">${grid}</g>
      <path d="${area}" fill="url(#chartFill)"/>
      <path d="${line(prev)}" fill="none" style="stroke: #c3bda9" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-dasharray="4 4"/>
      <path d="${line(data)}" fill="none" style="stroke: var(--brand)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      <circle cx="${x(last).toFixed(1)}" cy="${y(data[last]).toFixed(1)}" r="4.5" style="fill: rgb(var(--brand-rgb) / .18)"/>
      <circle cx="${x(last).toFixed(1)}" cy="${y(data[last]).toFixed(1)}" r="2.6" style="fill: var(--brand)"/>
    </svg>`;
  }

  function stackChart(series, W = 520, H = 140) {
    const n = series[0].values.length;
    const totals = Array.from({ length: n }, (_, i) => series.reduce((s, x) => s + x.values[i], 0));
    const max = Math.max(...totals) * 1.12;
    const gap = 18;
    const bw = (W - gap * (n - 1)) / n;
    const offset = 0;

    const bars = Array.from({ length: n }, (_, i) => {
      let acc = 0;
      return series.map((s, si) => {
        const h = (s.values[i] / max) * H;
        const y = H - acc - h;
        acc += h;
        const top = si === series.length - 1;
        return `<rect x="${(offset + i * (bw + gap)).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h, 0.6).toFixed(1)}" rx="${top ? 3 : 1}" style="fill: ${tint(s.alpha)}; stroke: var(--surface)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
      }).join('');
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="柱状图">
      <line x1="0" y1="${H}" x2="${W}" y2="${H}" style="stroke: var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>
      ${bars}
    </svg>`;
  }

  function donutChart(items, size = 132) {
    const r = 52;
    const c = 2 * Math.PI * r;
    const cx = size / 2;
    let offset = 0;
    const rings = items.map((it) => {
      const len = (it.value / 100) * c;
      const dash = `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" style="stroke: ${tint(it.alpha)}" stroke-width="15" stroke-dasharray="${Math.max(len - 3, 1).toFixed(2)} ${(c - len + 3).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
      offset += len;
      return dash;
    }).join('');

    return `<svg viewBox="0 0 ${size} ${size}" aria-label="流量来源占比">
      <g transform="rotate(-90 ${cx} ${cx})">
        <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" style="stroke: #14130e0a" stroke-width="15"/>
        ${rings}
      </g>
    </svg>`;
  }

  /* ------------------------------------------------------------- 数据渲染 */

  function renderInsights() {
    const data = state.range === 7 ? series7 : series30;
    const avg = Math.round(data.reduce((s, v) => s + v, 0) / data.length);
    $('[data-chart-note]').textContent = `近 ${state.range} 天，日均 ${nf(avg)}`;
    $('#trend-chart').innerHTML = lineChart(data, data.map((v, i) => Math.round(v * (0.82 + (i % 4) * 0.035))));

    const span = state.range === 7 ? [6, 4, 2, 0] : [29, 20, 10, 0];
    $('#chart-axis').innerHTML = span.map((d) => `<span>${shortDate(key(addDays(TODAY, -d)))}</span>`).join('');

    $('[data-total-read]').textContent = nf(series30.reduce((a, b) => a + b, 0));

    $('#kpi-row').innerHTML = ANA.kpi.map((k) => `
      <article class="kpi">
        <div class="kpi-top">
          <span class="kpi-icon"><i class="ti ${k.icon}" aria-hidden="true"></i></span>
          <span class="kpi-delta ${k.up ? '' : 'is-down'}"><i class="ti ${k.up ? 'ti-arrow-up-right' : 'ti-arrow-down-right'}" aria-hidden="true"></i>${k.delta}</span>
        </div>
        <div>
          <p class="kpi-label">${k.label}</p>
          <p class="kpi-num">${k.num}${k.unit ? `<em>${k.unit}</em>` : ''}</p>
        </div>
        <p class="kpi-foot">${k.foot}</p>
        <div class="kpi-spark">${sparkSVG(k.series)}</div>
      </article>`).join('');

    const source = ANA.source.map((s, i) => Object.assign({}, s, { alpha: [1, 0.68, 0.46, 0.3, 0.16][i] }));
    $('#donut-box').innerHTML = donutChart(source) + `<div class="donut-center"><b>${source[0].value}%</b><span>首页推荐</span></div>`;
    $('#donut-legend').innerHTML = source.map((s) => `<li><i style="background: ${tint(s.alpha)}"></i><span>${s.name}</span><b>${s.value}%</b></li>`).join('');

    $('#fan-chart').innerHTML = stackChart(ANA.fans);
    $('#fan-axis').innerHTML = ['一', '二', '三', '四', '五', '六', '日'].map((d) => `<span>周${d}</span>`).join('');
    $('[data-fans-total]').textContent = `七日 +${ANA.fans.reduce((s, x) => s + x.values.reduce((a, b) => a + b, 0), 0)}`;

    $('#rev-chart').innerHTML = stackChart(ANA.revenue.items, 520, 120);
    $('#rev-axis').innerHTML = ANA.revenue.months.map((m) => `<span>${m}</span>`).join('');
    $('[data-rev-total]').textContent = `¥${ANA.revenue.items.reduce((s, x) => s + x.values[x.values.length - 1], 0).toFixed(2)}k`;

    const maxFans = Math.max(...platforms.map((p) => p.fans));
    const head = '<div class="plat-line is-head"><span>平台</span><span class="plat-num">粉丝</span><span>结构</span><span class="plat-rate">互动</span><span class="plat-delta">七日</span></div>';
    $('#plat-rows').innerHTML = head + platforms.map((p) => `
      <div class="plat-line">
        <span class="plat-name"><i class="ti ${p.icon}" aria-hidden="true"></i>${p.name}</span>
        <b class="plat-num">${nf(p.fans)}</b>
        <span class="plat-share"><i style="width:${Math.round((p.fans / maxFans) * 100)}%"></i></span>
        <span class="plat-rate">${p.rate}%</span>
        <span class="plat-delta">+${p.delta}</span>
      </div>`).join('');

    const f0 = ANA.funnel[0].value;
    $('#funnel-box').innerHTML = ANA.funnel.map((f, i) => `
      <div class="f-step">
        <div class="f-bar ${i >= 3 ? 'is-light' : ''}" style="width:${(Math.pow(f.value / f0, 0.35) * 100).toFixed(1)}%; background: ${tint(1 - i * 0.17)}">
          <span>${f.name}</span><b>${nf(f.value)}</b>
        </div>
        <div class="f-note"><span>${i === 0 ? '起点' : `转化 ${f.rate}`}</span><span>${i === 0 ? '' : `每千人 ${Math.round((f.value / f0) * 1000)}`}</span></div>
      </div>`).join('');

    const h = ANA.heat;
    const heatHead = '<span></span>' + h.cols.map((c) => `<span class="heat-col">${c}:00</span>`).join('');
    const heatRows = h.rows.map((r, ri) => `<span class="heat-row">周${r}</span>`
      + h.values[ri].map((v, ci) => `<span class="heat-cell" style="--a:${v}" title="周${r} ${h.cols[ci]}:00 · 指数 ${Math.round(v * 100)}"></span>`).join('')).join('');
    const legend = `<div class="heat-scale" style="grid-column:1/-1"><span>低</span><i style="background:${tint(0.14)}"></i><i style="background:${tint(0.38)}"></i><i style="background:${tint(0.65)}"></i><i style="background:${tint(0.96)}"></i><span>高</span></div>`;
    $('#heat-box').innerHTML = heatHead + heatRows + legend;

    const maxType = Math.max(...ANA.types.map((t) => t.value));
    $('#type-box').innerHTML = ANA.types.map((t) => `
      <div class="hb">
        <span class="hb-name">${t.name}</span>
        <span class="hb-track"><i class="hb-fill" style="width:${Math.round((t.value / maxType) * 100)}%"></i></span>
        <b class="hb-num">${(t.value / 1000).toFixed(1)}k</b>
      </div>`).join('');

    const top = content
      .filter((c) => c.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    $('#rank-list').innerHTML = top.map((c, i) => `
      <li class="rank-item" data-card="${c.id}">
        <span>${i + 1}</span>
        <div><strong>${esc(c.title)}</strong><em>${esc(c.platforms.join(' / '))} · 互动 ${((c.views * 0.062) / 1000).toFixed(1)}k</em></div>
        <b>${nf(c.views)}</b>
      </li>`).join('');
  }

  function renderSettings() {
    $$('#goal-set button').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.goal) === prefs.goal));
    $('[data-pick-label]').textContent = prefs.remind;
    $('#default-plat').innerHTML = PLATFORMS.map((p) => `
      <button class="chip ${prefs.plats.includes(p) ? 'is-on' : ''}" type="button" data-plat-toggle="${p}">${p}</button>`).join('');
    $('#auth-list').innerHTML = BIND.map((b) => {
      const pct = Math.round((b.used / b.quota) * 100);
      const live = content.filter((c) => (c.push || {})[b.name] && c.push[b.name].state === 'live').length;
      return `<div class="auth" data-state="${b.state}">
        <span class="auth-icon"><i class="ti ${b.icon}" aria-hidden="true"></i></span>
        <div class="auth-copy">
          <b>${b.name}<em>${esc(b.auth)}</em></b>
          <span>${esc(b.handle)} · 可${b.scope.join(' / ')} · ${b.note}</span>
        </div>
        <div class="auth-nums">
          <div><span>已推送</span><b>${live}</b></div>
          <div>
            <span>今日额度</span>
            <b>${b.used}<em>/${b.quota}</em></b>
            <span class="aq"><i style="width:${pct}%"></i></span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-action="auth-renew" data-auth="${b.name}">
          <i class="ti ${b.state === 'expiring' ? 'ti-alert-triangle' : 'ti-refresh'}" aria-hidden="true"></i>${b.state === 'expiring' ? '续期' : '重新授权'}
        </button>
      </div>`;
    }).join('');

    const motion = $('[data-toggle="motion"]');
    motion.classList.toggle('is-on', prefs.motion);
    motion.setAttribute('aria-checked', String(prefs.motion));
    app.classList.toggle('no-motion', !prefs.motion);
  }

  /* -------------------------------------------------------------- editor */

  function openEditor(id) {
    const c = find(id);
    if (!c) return;
    if (state.view !== 'editor') state.returnView = state.view;

    ed.id = c.id;
    ed.draft = { title: c.title, body: c.body, tag: c.tag, platforms: c.platforms.slice(), status: c.status, date: c.date, time: c.time };
    ed.saved = clone(ed.draft);
    ed.stack = [clone(ed.draft)];
    ed.index = 0;
    clearTimeout(ed.timer);

    showView('editor');
    const title = $('#ed-title');
    if (title) {
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
    }
  }

  function editorHTML() {
    const d = ed.draft;
    return `<div class="editor-bar">
      <button class="back" type="button" data-action="close-editor"><i class="ti ti-arrow-left" aria-hidden="true"></i>返回</button>
      <span class="ed-status" data-ed-status><i></i><span>已保存</span></span>
      <div class="editor-bar-right">
        <button class="btn btn-ghost btn-sm ${state.aiOpen ? 'is-on' : ''}" type="button" data-action="ai-toggle" aria-pressed="${state.aiOpen}"><i class="ti ti-sparkles" aria-hidden="true"></i>写作助手</button>
        <button class="btn btn-solid btn-sm" type="button" data-action="push-current"><i class="ti ti-send" aria-hidden="true"></i>推送</button>
        <button class="icon-btn" type="button" data-action="copy-content" aria-label="复制正文" title="复制正文"><i class="ti ti-copy" aria-hidden="true"></i></button>
        <button class="icon-btn" type="button" data-action="delete-content" aria-label="删除" title="删除"><i class="ti ti-trash" aria-hidden="true"></i></button>
      </div>
    </div>

    <div class="editor-split ${state.aiOpen ? 'ai-on' : ''}">
      <div class="canvas">
        <div class="canvas-meta">
          <input class="canvas-tag" id="ed-tag" type="text" value="${escAttr(d.tag)}" maxlength="8" placeholder="栏目" autocomplete="off">
          ${PLATFORMS.map((p) => `<button class="chip ${d.platforms.includes(p) ? 'is-on' : ''}" type="button" data-plat="${p}">${p}</button>`).join('')}
        </div>

        <input class="ed-title" id="ed-title" type="text" value="${escAttr(d.title)}" maxlength="60" placeholder="先写标题，或者直接从正文开始" autocomplete="off">

        <div class="canvas-tools">
          <button class="tool" type="button" data-md="h2" aria-label="小标题" title="小标题"><i class="ti ti-h-2" aria-hidden="true"></i></button>
          <button class="tool" type="button" data-md="bold" aria-label="加粗" title="加粗"><i class="ti ti-bold" aria-hidden="true"></i></button>
          <button class="tool" type="button" data-md="italic" aria-label="斜体" title="斜体"><i class="ti ti-italic" aria-hidden="true"></i></button>
          <button class="tool" type="button" data-md="quote" aria-label="引用" title="引用"><i class="ti ti-quote" aria-hidden="true"></i></button>
          <button class="tool" type="button" data-md="list" aria-label="列表" title="列表"><i class="ti ti-list" aria-hidden="true"></i></button>
          <span class="canvas-grow"></span>
          <span class="words" data-words></span>
        </div>

        <textarea class="ed-body" id="ed-body" spellcheck="false" placeholder="在这里写。写到一半卡住也没关系，草稿会替你留着。">${esc(d.body)}</textarea>
      </div>

      <aside class="side-dock">
        <div class="dock-col dock-meta">
          <header class="dock-head">
            <span class="dock-mark"><i class="ti ti-adjustments-horizontal" aria-hidden="true"></i></span>
            <div class="dock-copy"><b>发布信息</b><span>封面 · 状态 · 排期</span></div>
          </header>

          <div class="prop">
            <h3>封面</h3>
            <div class="prop-art"><img src="${art(`cover-${ed.id}`)}" alt="" aria-hidden="true"></div>
          </div>

          <div class="prop">
            <h3>状态</h3>
            <button class="prop-line" type="button" data-pick="status">
              <i class="ti ti-circle-dot" aria-hidden="true"></i>
              <span data-prop-status>${STATUS[d.status]}</span>
              <i class="ti ti-chevron-down" aria-hidden="true"></i>
            </button>
          </div>

          <div class="prop">
            <h3>排期</h3>
            <button class="prop-line" type="button" data-pick="date">
              <i class="ti ti-calendar" aria-hidden="true"></i>
              <span data-prop-date>${d.date ? `${relativeDay(d.date)} ${d.time}` : '不排期'}</span>
              <i class="ti ti-chevron-down" aria-hidden="true"></i>
            </button>
          </div>

          <div class="prop">
            <h3>字数上限</h3>
            <div class="meter"><i data-meter-fill></i></div>
            <div class="meter-note"><span data-meter-left></span><span data-meter-limit></span></div>
          </div>
        </div>

        <div class="dock-col dock-ai" id="ai-panel" ${state.aiOpen ? '' : 'hidden'}></div>
      </aside>
    </div>

    <div class="editor-dock">
      <button class="dock-btn" type="button" data-action="ed-undo" data-dock-undo><i class="ti ti-arrow-back-up" aria-hidden="true"></i>撤销</button>
      <button class="dock-btn" type="button" data-action="ed-redo" data-dock-redo><i class="ti ti-arrow-forward-up" aria-hidden="true"></i>重做</button>
      <button class="dock-btn" type="button" data-action="ed-revert"><i class="ti ti-history" aria-hidden="true"></i>还原</button>
      <span class="dock-sep"></span>
      <button class="dock-btn primary" type="button" data-action="save-content"><i class="ti ti-check" aria-hidden="true"></i>保存</button>
    </div>`;
  }

  function fitBody() {
    const ta = $('#ed-body');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(240, ta.scrollHeight)}px`;
  }

  function renderEditor() {
    $('#editor').innerHTML = editorHTML();
    refreshEd();
    fitBody();
    if (state.aiOpen) renderAI();
  }

  function sameSnap(a, b) {
    return a.title === b.title && a.body === b.body && a.tag === b.tag
      && a.status === b.status && a.date === b.date && a.time === b.time
      && a.platforms.join(',') === b.platforms.join(',');
  }

  function refreshEd() {
    if (!ed.draft) return;
    const d = ed.draft;
    const limit = Math.min(...(d.platforms.length ? d.platforms : ['公众号']).map((p) => LIMITS[p] || 2000));
    const n = words(d.body);
    const pct = Math.min(100, (n / limit) * 100);

    const fill = $('[data-meter-fill]');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.classList.toggle('is-over', n > limit);
    }
    const left = $('[data-meter-left]');
    if (left) left.textContent = n > limit ? `超出 ${(n - limit).toLocaleString('zh-CN')}` : `还剩 ${(limit - n).toLocaleString('zh-CN')}`;
    const lim = $('[data-meter-limit]');
    if (lim) lim.textContent = `${n.toLocaleString('zh-CN')} / ${limit.toLocaleString('zh-CN')}`;

    const w = $('[data-words]');
    if (w) w.innerHTML = `<b class="${n > limit ? 'is-over' : ''}">${n.toLocaleString('zh-CN')}</b> 字`;

    const status = $('[data-ed-status]');
    if (status) {
      const dirty = ed.saved ? !sameSnap(ed.saved, d) : true;
      status.classList.toggle('is-dirty', dirty);
      $('span', status).textContent = dirty ? '未保存' : '已保存';
    }

    const undo = $('[data-dock-undo]');
    const redo = $('[data-dock-redo]');
    if (undo) undo.toggleAttribute('disabled', ed.index <= 0);
    if (redo) redo.toggleAttribute('disabled', ed.index >= ed.stack.length - 1);

    const ps = $('[data-prop-status]');
    if (ps) ps.textContent = STATUS[d.status];
    const pd = $('[data-prop-date]');
    if (pd) pd.textContent = d.date ? `${relativeDay(d.date)} ${d.time}` : '不排期';

    $$('[data-plat]').forEach((b) => b.classList.toggle('is-on', d.platforms.includes(b.dataset.plat)));
  }

  function commitEd() {
    if (!ed.draft) return;
    const cur = ed.stack[ed.index];
    if (cur && sameSnap(cur, ed.draft)) return;
    ed.stack = ed.stack.slice(0, ed.index + 1);
    ed.stack.push(clone(ed.draft));
    if (ed.stack.length > 80) ed.stack.shift();
    ed.index = ed.stack.length - 1;
    refreshEd();
  }

  function queueCommit() {
    clearTimeout(ed.timer);
    ed.timer = setTimeout(commitEd, 650);
  }

  function applySnap(s) {
    ed.draft = clone(s);
    const t = $('#ed-title');
    const b = $('#ed-body');
    const g = $('#ed-tag');
    if (t) t.value = s.title;
    if (b) b.value = s.body;
    if (g) g.value = s.tag;
    refreshEd();
    fitBody();
  }

  function flushCommit() {
    clearTimeout(ed.timer);
    commitEd();
  }

  function undoEd() {
    flushCommit();
    if (ed.index <= 0) return;
    ed.index -= 1;
    applySnap(ed.stack[ed.index]);
  }

  function redoEd() {
    flushCommit();
    if (ed.index >= ed.stack.length - 1) return;
    ed.index += 1;
    applySnap(ed.stack[ed.index]);
  }

  function revertEd() {
    if (!ed.saved) return;
    applySnap(ed.saved);
    commitEd();
    toast('已还原到上次保存');
  }

  function saveEd() {
    const c = find(ed.id);
    if (!c) return;
    const d = ed.draft;
    if (!d.title.trim() && !d.body.trim()) { toast('还没有内容可保存'); return; }

    c.title = d.title.trim() || '无标题';
    c.body = d.body;
    c.tag = d.tag.trim() || '未分类';
    c.platforms = d.platforms.slice();
    c.status = d.status;
    c.date = d.date;
    c.time = d.time;
    c.words = words(d.body);

    ed.saved = clone(d);
    commitEd();
    refreshEd();

    renderBoard(false);
    renderTicker();
    renderMetrics();
    if (state.view === 'content') renderTable();
    toast(`已保存 · ${c.title}`);
  }

  function closeEditor() {
    clearTimeout(ed.timer);
    if (!ed.draft) { showView(state.returnView || 'today'); return; }

    const c = find(ed.id);
    const blank = !ed.draft.title.trim() && !ed.draft.body.trim();

    if (c && blank) {
      // 新建之后什么都没写，就不留下空条目
      content = content.filter((x) => x.id !== c.id);
      renderToday(false);
      if (state.view === 'content') renderTable();
      if (state.view === 'schedule') renderSchedule();
    } else if (c && ed.saved && !sameSnap(ed.saved, ed.draft)) {
      saveEd();
    }

    ed.id = null;
    ed.draft = null;
    showView(state.returnView || 'today');
  }

  /* -------------------------------------------------------------- views */

  function showView(name, skipRender = false) {
    state.view = name;
    const activeNav = name === 'editor' ? state.returnView : name;
    $$('.tab').forEach((b) => b.classList.toggle('is-active', b.dataset.nav === activeNav));
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));

    if (name === 'editor') {
      if (!skipRender) renderEditor();
      return;
    }
    if (name === 'today') renderToday(false);
    if (name === 'content') renderTable();
    if (name === 'schedule') renderSchedule();
    if (name === 'assets') renderAssets();
    if (name === 'insights') renderInsights();
    if (name === 'settings') renderSettings();
  }

  /* ------------------------------------------------------------- layers */

  function openLayer(kind) {
    state.layer = kind;
    $('#scrim').hidden = false;
    if (kind === 'modal') $('#modal').hidden = false;
    if (kind === 'palette') {
      $('#palette').hidden = false;
      $('#palette-input').value = '';
      openPalette('');
      $('#palette-input').focus();
    }
  }

  function closeLayer() {
    clearPushTimers();
    state.layer = null;
    $('#scrim').hidden = true;
    $('#modal').hidden = true;
    $('#palette').hidden = true;
    closeMenu();
  }

  function openModal({ kicker, title, body, foot }) {
    $('#modal').classList.remove('is-push');
    $('#modal-kicker').textContent = kicker;
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = body;
    $('#modal-foot').innerHTML = foot;
    openLayer('modal');
  }

  function openCollectMenu(anchorEl) {
    openMenu(anchorEl, [
      { value: 'file', label: '导入本地文件' },
      { value: 'link', label: '收录链接' },
      { value: 'spark', label: '记一条灵感' },
      { value: 'note', label: '新建笔记' }
    ], '', (v) => {
      if (v === 'file') { $('#file-input').click(); return; }
      if (v === 'link') { openLinkForm(); return; }
      if (v === 'spark') { collectSpark(); return; }
      collectNote();
    });
  }

  function collectSpark() {
    const pool = [
      '真正难的不是找不到题材，是舍不得删掉那些看着还行的题材',
      '写不下去的时候，先把句子写短',
      '读者记住的从来不是结论，是那个画面'
    ];
    addAsset({ type: 'spark', text: pool[Math.floor(Math.random() * pool.length)], at: '刚刚' });
    toast('记下一条灵感');
  }

  function collectNote() {
    addAsset({ type: 'note', title: '未命名笔记', lines: 0, at: '刚刚', note: '' });
    toast('新建了一条空笔记');
  }

  function openLinkForm() {
    openModal({
      kicker: '收录',
      title: '收录一个链接',
      body: `<div class="field">
          <label for="link-url">网址</label>
          <input id="link-url" type="text" inputmode="url" placeholder="https://" autocomplete="off" spellcheck="false">
        </div>
        <div class="field">
          <label for="link-note">留一句为什么收藏</label>
          <input id="link-note" type="text" placeholder="比如：讲留白的那段可以引用" autocomplete="off">
        </div>`,
      foot: `<button class="btn btn-quiet" type="button" data-action="close-modal">取消</button>
        <span class="spacer"></span>
        <button class="btn btn-solid" type="button" data-action="link-save"><i class="ti ti-check" aria-hidden="true"></i>收录</button>`
    });
    setTimeout(() => { const el = $('#link-url'); if (el) el.focus(); }, 80);
  }

  function assetDetail(a) {
    switch (a.type) {
      case 'image': return [['体积', a.size], ['类型', '图片 · ' + (a.kind === 'cover' ? '封面' : a.kind === 'ref' ? '参考' : '截图')]];
      case 'link': return [['来源', a.host], ['收录', a.at], ['地址', a.url.replace(/^https?:\/\//, '')]];
      case 'news': return [['来源', a.source], ['时间', a.at], ['状态', a.fresh ? '今日更新' : '已读']];
      case 'kb': return [['归属', a.path], ['条目', String(a.count)], ['更新', a.at]];
      case 'file': return [['格式', a.ext], ['体积', a.size], ['收录', a.at]];
      case 'doc': return [['页数', String(a.pages)], ['更新', a.at], ['格式', 'DOCX']];
      case 'spark': return [['记于', a.at], ['来源', '随手记']];
      default: return [['行数', String(a.lines)], ['更新', a.at], ['归属', '未归档']];
    }
  }

  function assetPreview(a) {
    if (a.type === 'image') {
      return `<div class="asset-preview"><img src="${imgSrc(a)}" alt="${escAttr(a.name)}"></div>`;
    }
    const t = RTYPE[a.type];
    const line = a.type === 'spark' ? a.text : (a.note || a.url || '');
    return `<div class="res-pre res-pre-${a.type}">
      <span class="res-pre-icon"><i class="ti ${t.icon}" aria-hidden="true"></i></span>
      <p>${esc(line)}</p>
      <em>${esc(a.host || a.source || a.path || assetFoot(a))}</em>
    </div>`;
  }

  function openAsset(id) {
    const a = assets.find((x) => x.id === Number(id));
    if (!a) return;
    const t = RTYPE[a.type];
    openModal({
      kicker: t.label,
      title: assetTitle(a),
      body: `${assetPreview(a)}
        <div class="meta-list">${assetDetail(a).map(([k, v]) => `<div class="meta-row"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>`,
      foot: `<button class="btn btn-quiet" type="button" data-action="asset-remove" data-id="${a.id}"><i class="ti ti-trash" aria-hidden="true"></i>移除</button>
        <span class="spacer"></span>
        <button class="btn btn-ghost" type="button" data-action="copy-name" data-name="${escAttr(a.url || assetTitle(a))}"><i class="ti ti-copy" aria-hidden="true"></i>${a.url ? '复制链接' : '复制标题'}</button>`
    });
  }

  function openInbox() {
    openModal({
      kicker: `${replies.length} 条待回复`,
      title: '评论',
      body: `<ul class="reply-list">${replies.map((r) => `
        <li><button class="reply-item" type="button" data-reply="${escAttr(r.name)}">
          <img src="${avatar(r.seed)}" alt="" width="28" height="28" loading="lazy">
          <span class="reply-copy"><b>${esc(r.name)}</b><em>${esc(r.text)}</em></span>
          <span class="reply-time">${esc(r.time)}</span>
        </button></li>`).join('')}</ul>`,
      foot: '<span class="spacer"></span><button class="btn btn-ghost" type="button" data-action="close-modal">关掉</button>'
    });
  }

  function openReply(name) {
    const r = replies.find((x) => x.name === name);
    if (!r) return;
    openModal({
      kicker: r.time,
      title: `回复 ${r.name}`,
      body: `<div class="reply-quote">
          <img src="${avatar(r.seed)}" alt="" width="28" height="28">
          <p>${esc(r.text)}</p>
        </div>
        <div class="note-area"><textarea id="reply-text" placeholder="写回复"></textarea></div>`,
      foot: `<span class="spacer"></span>
        <button class="btn btn-ghost" type="button" data-action="close-modal">取消</button>
        <button class="btn btn-solid" type="button" data-action="send-reply"><i class="ti ti-send" aria-hidden="true"></i>发送</button>`
    });
    setTimeout(() => $('#reply-text')?.focus(), 60);
  }

  /* ----------------------------------------------------------------- push */

  // 一次推送会话：选平台 → 预检 → 逐平台推进度 → 结果/重试
  const push = { id: null, sel: [], when: 'now', time: '20:00', form: '图文', phase: 'pick', runs: {}, timers: [] };

  function clearPushTimers() {
    push.timers.forEach((t) => clearTimeout(t));
    push.timers = [];
  }

  function openPush(id, only) {
    const c = find(id);
    if (!c) return;
    clearPushTimers();
    push.id = c.id;
    push.phase = 'pick';
    push.runs = {};
    if (only) {
      push.sel = [only];
    } else {
      push.sel = c.platforms.filter((p) => {
        const b = bindOf(p);
        return b && b.state !== 'expired' && b.used < b.quota;
      });
    }
    if (!push.sel.length) push.sel = [BIND[0].name];
    push.when = 'now';
    push.time = c.time || '20:00';
    push.form = c.platforms.includes('抖音') ? '视频' : '图文';
    paintPush();
    openLayer('modal');
  }

  function paintPush() {
    const c = find(push.id);
    if (!c) return;
    $('#modal-kicker').textContent = push.phase === 'pick' ? '分发' : '推送记录';
    $('#modal-title').textContent = c.title || '无标题';
    $('#modal').classList.add('is-push');
    $('#modal-body').innerHTML = push.phase === 'pick' ? pushPickHTML(c) : pushRunHTML(c);
    $('#modal-foot').innerHTML = pushFootHTML(c);
    $('#modal').hidden = false;
  }

  function pushPickHTML(c) {
    const plats = c.platforms.map((p) => {
      const b = bindOf(p);
      if (!b) return '';
      const on = push.sel.includes(p);
      const full = b.used >= b.quota;
      const dead = b.state === 'expired' || full;
      return `<button class="pp" type="button" data-push-plat="${p}" data-state="${b.state}" ${dead ? 'disabled' : ''} aria-pressed="${on}">
        <span class="pp-icon"><i class="ti ${b.icon}" aria-hidden="true"></i></span>
        <span class="pp-copy">
          <b>${p}</b>
          <em>${esc(b.handle)} · ${esc(full ? `今日额度用完 ${b.used}/${b.quota}` : b.note)}</em>
        </span>
        <span class="pp-scope">${b.scope.map((s) => `<i>${s}</i>`).join('')}</span>
        <span class="pp-tick"><i class="ti ti-check" aria-hidden="true"></i></span>
      </button>`;
    }).join('');

    return `<div class="push-src">
        <img src="${art(`cover-${c.id}`)}" alt="" aria-hidden="true">
        <div class="push-src-copy">
          <b>${esc(c.tag)}</b>
          <span>正文 ${nf(c.words)} 字 · 封面已选 · ${c.date ? `${shortDate(c.date)} ${c.time}` : '未排期'}</span>
        </div>
      </div>

      <h3 class="push-h">选择平台</h3>
      <div class="push-plats">${plats}</div>

      <h3 class="push-h">发布方式</h3>
      <div class="push-line">
        <div class="seg" role="tablist" aria-label="发布形态">
          ${['图文', '长文', '视频'].map((f) => `<button type="button" class="${push.form === f ? 'is-on' : ''}" data-push-form="${f}">${f}</button>`).join('')}
        </div>
        <div class="seg" role="tablist" aria-label="发布时机">
          <button type="button" class="${push.when === 'now' ? 'is-on' : ''}" data-push-when="now"><i class="ti ti-bolt" aria-hidden="true"></i>立即</button>
          <button type="button" class="${push.when === 'later' ? 'is-on' : ''}" data-push-when="later"><i class="ti ti-clock-hour-4" aria-hidden="true"></i>定时</button>
        </div>
        ${push.when === 'later' ? `<input class="push-time" id="push-time" type="text" value="${escAttr(push.time)}" maxlength="5" inputmode="numeric" aria-label="定时时间">` : ''}
      </div>

      <h3 class="push-h">发布前检查</h3>
      <ul class="push-checks">${pushChecks(c).map(([k, t]) => `
        <li data-kind="${k}"><i class="ti ${k === 'ok' ? 'ti-circle-check' : k === 'warn' ? 'ti-alert-triangle' : 'ti-circle-x'}" aria-hidden="true"></i><span>${esc(t)}</span></li>`).join('')}
      </ul>`;
  }

  function pushChecks(c) {
    const out = [];
    const len = c.words || 0;
    if (!c.title) out.push(['block', '缺标题，平台会直接拒收']);
    if (!len) out.push(['block', '正文是空的，先写点东西再推']);
    push.sel.forEach((p) => {
      const b = bindOf(p);
      if (!b) return;
      if (len > b.max) out.push(['block', `${p} 正文 ${nf(len)} 字，超出上限 ${nf(b.max)}`]);
      if (p === '抖音' && push.form !== '视频') out.push(['block', '抖音只收视频，先把形态切成视频']);
      if (b.state === 'expiring') out.push(['warn', `${p} 授权 3 天后到期，建议先续期`]);
    });
    if (!push.sel.length) out.push(['block', '还没有选中平台']);
    if (!out.length) out.push(['ok', `正文 ${nf(len)} 字，栏目「${c.tag}」，封面与标签已就绪`]);
    return out;
  }

  function pushRunHTML(c) {
    const list = push.sel.map((p) => {
      const b = bindOf(p);
      const r = push.runs[p] || { state: 'queue', pct: 0, note: '' };
      return `<div class="pr" data-state="${r.state}">
        <span class="pr-icon"><i class="ti ${b.icon}" aria-hidden="true"></i></span>
        <div class="pr-copy">
          <b>${p}</b>
          <em>${esc(r.note || '等待开始')}</em>
        </div>
        <span class="pr-state">${PUSH_STATE[r.state]}</span>
        <span class="pr-bar"><i style="width:${r.pct}%"></i></span>
      </div>`;
    }).join('');
    const tip = push.phase === 'run'
      ? '<p class="pr-note"><i class="ti ti-info-circle" aria-hidden="true"></i>推送期间不要关掉页面，失败的平台可以单独重试。</p>'
      : '';
    return `<div class="pr-list">${list}</div>${tip}`;
  }

  function pushFootHTML(c) {
    if (push.phase === 'pick') {
      const blocked = pushChecks(c).some(([k]) => k === 'block');
      return `<span class="push-count">已选 <b>${push.sel.length}</b> 个平台</span>
        <span class="spacer"></span>
        <button class="btn btn-ghost" type="button" data-action="push-close">取消</button>
        <button class="btn btn-solid" type="button" data-action="push-run" ${blocked || !push.sel.length ? 'disabled' : ''}>
          <i class="ti ti-send" aria-hidden="true"></i>${push.when === 'later' ? `定时 ${push.time} 推送` : '一键推送'}
        </button>`;
    }
    const finished = push.sel.every((p) => ['live', 'failed'].includes((push.runs[p] || {}).state));
    if (!finished) {
      return `<span class="push-count">正在推送…</span><span class="spacer"></span><button class="btn btn-ghost" type="button" disabled>请稍候</button>`;
    }
    const failed = push.sel.filter((p) => (push.runs[p] || {}).state === 'failed');
    return `<span class="push-count">${failed.length ? `${failed.length} 个平台失败` : `${push.sel.length} 个平台全部发布`}</span>
      <span class="spacer"></span>
      ${failed.length ? '<button class="btn btn-ghost" type="button" data-action="push-retry"><i class="ti ti-refresh" aria-hidden="true"></i>重试失败项</button>' : ''}
      <button class="btn btn-solid" type="button" data-action="push-done"><i class="ti ti-check" aria-hidden="true"></i>完成</button>`;
  }

  function togglePushPlat(p) {
    const b = bindOf(p);
    if (!b || b.used >= b.quota) return;
    push.sel = push.sel.includes(p) ? push.sel.filter((x) => x !== p) : push.sel.concat(p);
    paintPush();
  }

  function queuePush(fn, delay) { push.timers.push(setTimeout(fn, delay)); }

  function setRun(p, state, pct, note) {
    push.runs[p] = { state, pct, note };
    paintPush();
  }

  function runPush() {
    const c = find(push.id);
    if (!c) return;
    if (pushChecks(c).some(([k]) => k === 'block')) { toast('还有没通过的前置检查'); return; }
    push.phase = 'run';
    push.runs = {};
    push.sel.forEach((p) => { push.runs[p] = { state: 'queue', pct: 8, note: '已进入推送队列' }; });
    paintPush();

    push.sel.forEach((p, i) => {
      const base = 380 + i * 460;
      queuePush(() => setRun(p, 'upload', 44, `上传封面与正文到${p}`), base);
      queuePush(() => setRun(p, 'review', 78, '平台侧审核与转码'), base + 820);
      queuePush(() => finishRun(p, false), base + 1740);
    });
  }

  function finishRun(p, retry) {
    const c = find(push.id);
    const b = bindOf(p);
    if (!c || !b) return;
    const now = new Date();
    const at = `${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // 太短的稿子会被平台判为不通过，用来演示失败与重试
    if (!retry && (c.words || 0) < 60) {
      push.runs[p] = { state: 'failed', pct: 100, note: '平台判定内容过短，未通过审核' };
    } else {
      c.push = c.push || {};
      c.push[p] = { state: 'live', at, note: retry ? `${b.auth} 补发` : `${b.auth} 直发` };
      b.used = Math.min(b.quota, b.used + 1);
      push.runs[p] = { state: 'live', pct: 100, note: `${retry ? '已补发' : '已发布'} ${at} · ${b.handle}` };
      if (c.status !== 'published') { c.status = 'published'; c.date = c.date || key(TODAY); c.time = c.time || push.time; }
    }

    if (push.sel.every((x) => ['live', 'failed'].includes((push.runs[x] || {}).state))) {
      push.phase = 'done';
      renderTable();
      renderToday(false);
      renderSchedule();
      renderSettings();
      const live = push.sel.filter((x) => push.runs[x].state === 'live').length;
      const dead = push.sel.length - live;
      toast(live && dead ? `${live} 个已发布，${dead} 个失败` : live ? `已推送 ${live} 个平台` : '推送未通过，可以重试');
    }
    paintPush();
  }

  function retryPush() {
    const failed = push.sel.filter((p) => (push.runs[p] || {}).state === 'failed');
    if (!failed.length) return;
    push.phase = 'run';
    failed.forEach((p) => { push.runs[p] = { state: 'queue', pct: 10, note: '重新排队' }; });
    paintPush();
    failed.forEach((p, i) => {
      const base = 320 + i * 420;
      queuePush(() => setRun(p, 'upload', 48, '重新上传素材'), base);
      queuePush(() => setRun(p, 'review', 80, '再次提交审核'), base + 760);
      queuePush(() => finishRun(p, true), base + 1580);
    });
  }

  function unpublish(id, p) {
    const c = find(id);
    if (!c || !c.push || !c.push[p]) return;
    delete c.push[p];
    renderTable();
    renderToday(false);
    toast(`已从${p}撤下，本地内容保留`);
  }

  function renewBind(name) {
    const b = bindOf(name);
    if (!b) return;
    b.state = 'ok';
    renderSettings();
    toast(`${name} 授权已续期 90 天`);
  }

  /* --------------------------------------------------------------- menu */

  /* 当前展开的下拉：记录元素与触发点，用于开关与外部关闭 */
  let menuOpen = null;

  function openMenu(anchor, items, selected, onPick) {
    const same = menuOpen && menuOpen.anchor === anchor && menuOpen.el.isConnected;
    closeMenu();
    if (same) return; // 再点一次触发点即收起

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.innerHTML = items.map((it) => `
      <button type="button" data-val="${escAttr(it.value)}" aria-selected="${it.value === selected}">
        <span>${esc(it.label)}</span><i class="ti ti-check" aria-hidden="true"></i>
      </button>`).join('');

    const ar = anchor.getBoundingClientRect();
    const pr = app.getBoundingClientRect();
    app.append(menu);

    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = ar.left - pr.left;
    let top = ar.bottom - pr.top + 6;
    if (left + mw > pr.width - 12) left = pr.width - mw - 12;
    if (top + mh > pr.height - 12) top = Math.max(12, ar.top - pr.top - mh - 6);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.minWidth = `${Math.max(ar.width, 128)}px`;

    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      onPick(btn.dataset.val);
      closeMenu();
    });

    menuOpen = { el: menu, anchor };
  }

  function closeMenu() {
    menuOpen = null;
    $$('.menu', app).forEach((m) => m.remove());
  }

  /* ------------------------------------------------------------- actions */

  function changeStatus(id, status) {
    const c = find(id);
    if (!c || c.status === status) return;
    c.status = status;
    if ((status === 'queued' || status === 'published') && !c.date) {
      c.date = key(TODAY);
      c.time = status === 'queued' ? '20:00' : '21:00';
      toast(`${STATUS[status]}，已排在今天 ${c.time}`);
    } else {
      toast(`已移到${STATUS[status]}`);
    }
    renderToday(false);
    if (state.view === 'content') renderTable();
    if (state.view === 'schedule') renderSchedule();
  }

  function newContent(status = 'draft', date = '') {
    const id = Math.max(0, ...content.map((c) => c.id)) + 1;
    content.unshift({
      id, title: '', status, tag: '未分类',
      platforms: prefs.plats.slice(), date, time: date ? '20:00' : '', views: 0, body: ''
    });
    renderToday(false);
    if (state.view === 'content') renderTable();
    if (state.view === 'schedule') renderSchedule();
    openEditor(id);
  }

  function openPalette(query = '') {
    const q = query.trim().toLowerCase();
    const actions = [
      { kind: 'action', action: 'new', label: '新建内容', hint: 'N', icon: 'ti-plus' },
      { kind: 'action', action: 'go-schedule', label: '打开排期', hint: '视图', icon: 'ti-calendar-month' },
      { kind: 'action', action: 'push-latest', label: '推送最近一条待发', hint: '分发', icon: 'ti-send' },
      { kind: 'action', action: 'export-all', label: '导出全部内容', hint: 'Markdown', icon: 'ti-download' }
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    const hits = content
      .filter((c) => !q || c.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((c) => ({ kind: 'content', id: c.id, label: c.title || '无标题', hint: STATUS[c.status], icon: 'ti-file-text' }));

    const results = actions.concat(hits);
    state.results = results;
    state.cursor = 0;

    $('#palette-list').innerHTML = results.length ? results.map((r, i) => `
      <button class="p-item ${i === 0 ? 'is-cursor' : ''}" type="button" role="option" data-index="${i}">
        <i class="ti ${r.icon}" aria-hidden="true"></i>
        <span>${esc(r.label)}</span>
        <small>${esc(r.hint)}</small>
      </button>`).join('') : '<p class="p-empty">没有匹配的内容</p>';
  }

  function runPalette(index) {
    const item = state.results[index];
    if (!item) return;
    closeLayer();
    if (item.kind === 'content') { openEditor(item.id); return; }
    if (item.action === 'new') newContent('draft');
    if (item.action === 'go-schedule') showView('schedule');
    if (item.action === 'export-all') exportAll();
    if (item.action === 'push-latest') {
      const next = content.filter((c) => c.status === 'queued').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
      if (next) openPush(next.id); else toast('没有待发的内容');
    }
  }

  function exportAll() {
    const md = content.map((c) => [
      `# ${c.title || '无标题'}`,
      '',
      `状态：${STATUS[c.status]}　栏目：${c.tag}　平台：${c.platforms.join(' / ')}`,
      c.date ? `排期：${c.date} ${c.time}` : '排期：未安排',
      '',
      c.body || '_正文待写_'
    ].join('\n')).join('\n\n---\n\n');
    download('砚舟-内容库.md', md, 'text/markdown;charset=utf-8');
    toast(`已导出 ${content.length} 条内容`);
  }

  function exportReport() {
    const rows = [['平台', '粉丝', '7日新增', '阅读', '互动率']]
      .concat(platforms.map((p) => [p.name, p.fans, p.delta, p.views, `${p.rate}%`]));
    const csv = `\ufeff${rows.map((r) => r.join(',')).join('\n')}`;
    download('砚舟-平台数据.csv', csv, 'text/csv;charset=utf-8');
    toast('报表已导出');
  }

  function insertMd(kind) {
    const ta = $('#ed-body');
    if (!ta || !ed.draft) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const picked = ta.value.slice(start, end);
    const wrap = { h2: ['## ', ''], bold: ['**', '**'], italic: ['*', '*'], quote: ['> ', ''], list: ['- ', ''] }[kind] || ['', ''];
    const fill = picked || (kind === 'h2' ? '小标题' : kind === 'list' ? '条目' : '文字');
    ta.value = ta.value.slice(0, start) + wrap[0] + fill + wrap[1] + ta.value.slice(end);
    ta.focus();
    fitBody();
    ta.setSelectionRange(start + wrap[0].length, start + wrap[0].length + fill.length);
    ed.draft.body = ta.value;
    refreshEd();
    commitEd();
  }

  /* ------------------------------------------------------------ AI 助手 */

  const AI_ACT = {
    title: { label: '起标题', icon: 'ti-heading' },
    summary: { label: '写摘要', icon: 'ti-align-left' },
    tags: { label: '提标签', icon: 'ti-tags' },
    more: { label: '续写一段', icon: 'ti-arrow-bar-down' },
    polish: { label: '润色开头', icon: 'ti-wand' },
    check: { label: '核查细节', icon: 'ti-list-check' }
  };

  const aiState = { open: true, running: '', result: null, round: 0 };

  function aiTip() {
    const d = ed.draft || {};
    const title = (d.title || '').trim();
    const body = d.body || '';
    const n = words(body);
    const out = [];
    if (!title) out.push({ icon: 'ti-heading', text: '还没定标题，先看三个方向', act: 'title', cta: '起标题' });
    else if (title.length > 24) out.push({ icon: 'ti-heading', text: `标题 ${title.length} 字，手机上会被截断`, act: 'title', cta: '缩短' });
    if (n < 200) out.push({ icon: 'ti-arrow-bar-down', text: `正文 ${n} 字，还撑不起一条完整内容`, act: 'more', cta: '续写' });
    if (!(d.tag || '').trim()) out.push({ icon: 'ti-tags', text: '还没有栏目，可以从正文里提', act: 'tags', cta: '提标签' });
    if (n >= 200 && title) out.push({ icon: 'ti-wand', text: '开头两句偏长，读起来会拖', act: 'polish', cta: '润色' });
    out.push({ icon: 'ti-list-check', text: '有 2 处数字与时间需要核对', act: 'check', cta: '核查' });
    return out.slice(0, 3);
  }

  function aiMake(kind) {
    const d = ed.draft;
    const tag = (d.tag || '').trim() || '这件事';
    const n = words(d.body);
    const round = aiState.round % 2;

    if (kind === 'title') {
      const pool = [
        { text: `${tag}这件事，我用了半年才想明白`, score: 94 },
        { text: `把${tag}拆开看：三个不一定对的结论`, score: 88 },
        { text: `关于${tag}，先说结论`, score: 81 },
        { text: `${tag}：那些没人告诉你的细节`, score: 90 },
        { text: `我试了 27 次，只留下这 3 条关于${tag}的经验`, score: 86 },
        { text: `${tag}的账，摊开算一遍`, score: 79 }
      ];
      return pool.slice(round * 3, round * 3 + 3);
    }

    if (kind === 'summary') {
      const first = (d.body || '').trim().split(/\n+/)[0] || '这条还没有正文';
      return [
        { text: `${first}全文约 ${n} 字，结论在最后两段。`, score: 91 },
        { text: `从一个具体的场景讲起，落到可以照做的三步。${n} 字。`, score: 84 }
      ].slice(round, round + 1);
    }

    if (kind === 'tags') {
      const pool = [
        { text: `${tag} · 复盘 · 长期`, score: 92 },
        { text: `${tag} · 方法 · 记录`, score: 85 }
      ];
      return [pool[round]];
    }

    if (kind === 'more') {
      const pool = [
        { text: '真正让这件事变难的，不是执行，是每次都重新决定要不要做。把决定提前，剩下的就只是动作。', score: 89 },
        { text: '后来我给自己定了一条很笨的规矩：不管写得好不好，先写满两百字再说。多数时候，卡住的地方就在这两百字里。', score: 86 }
      ];
      return [pool[round]];
    }

    if (kind === 'polish') {
      const first = (d.body || '').split(/\n/)[0] || '';
      return [
        { text: '先说结论：这件事的成本被高估了，门槛被低估了。', before: first, score: 90 },
        { text: '我把它拆成三步，第一步就劝退了一半人。', before: first, score: 83 }
      ].slice(round, round + 1);
    }

    return [
      { text: '「六百日元」与「6㎡」两处数字，建议统一成阿拉伯数字', score: 0, warn: true },
      { text: '提到的时间是周三，与后文「周末」冲突，确认一下', score: 0, warn: true }
    ];
  }

  function renderAI() {
    const panel = $('#ai-panel');
    if (!panel) return;

    const quick = Object.entries(AI_ACT).map(([k, a]) => `
      <button class="ai-act" type="button" data-ai="${k}">
        <i class="ti ${a.icon}" aria-hidden="true"></i>
        <span>${a.label}</span>
      </button>`).join('');

    let stream = '';
    if (aiState.running) {
      const a = AI_ACT[aiState.running];
      stream = `<div class="ai-card is-loading">
        <p class="ai-loading"><i class="ti ti-loader-3" aria-hidden="true"></i>正在${a.label}…</p>
        <span class="sk"></span><span class="sk short"></span>
      </div>`;
    } else if (aiState.result) {
      const r = aiState.result;
      const a = AI_ACT[r.kind];
      stream = `<div class="ai-result-head"><i class="ti ${a.icon}" aria-hidden="true"></i>${a.label}<em>${r.items.length} 条</em></div>`
        + r.items.map((it, i) => `
        <div class="ai-card">
          <div class="ai-card-top"><span>${it.warn ? '核查项' : `方案 ${i + 1}`}</span>${it.warn ? '<em>待确认</em>' : `<em>匹配 ${it.score}%</em>`}</div>
          ${it.before ? `<p class="ai-before">${esc(it.before)}</p>` : ''}
          <p class="ai-text">${esc(it.text)}</p>
          <div class="ai-card-foot">
            ${it.warn
              ? `<button class="ai-btn is-quiet" type="button" data-action="ai-again">换一批</button>`
              : `<button class="ai-btn" type="button" data-action="ai-use" data-i="${i}">${r.kind === 'title' || r.kind === 'tags' ? '用这条' : r.kind === 'polish' ? '替换' : '插入'}</button>
                 ${i === r.items.length - 1 ? '<button class="ai-btn is-quiet" type="button" data-action="ai-again">换一批</button>' : ''}`}
          </div>
        </div>`).join('');
    } else {
      const tips = aiTip();
      stream = `<div class="ai-diag">
        <p class="ai-diag-title"><i class="ti ti-sparkles" aria-hidden="true"></i>读完草稿的 ${tips.length} 条建议</p>
        ${tips.map((t) => `<button class="ai-tip" type="button" data-ai="${t.act}">
          <i class="ti ${t.icon}" aria-hidden="true"></i>
          <span>${esc(t.text)}</span>
          <em>${t.cta}</em>
        </button>`).join('')}
      </div>`;
    }

    panel.innerHTML = `<header class="ai-head dock-head">
        <span class="dock-mark"><i class="ti ti-sparkles" aria-hidden="true"></i></span>
        <div class="dock-copy"><b>写作助手</b><span>只读本机草稿，不联网</span></div>
        <button class="icon-btn" type="button" data-action="ai-close" aria-label="收起"><i class="ti ti-x" aria-hidden="true"></i></button>
      </header>
      <div class="ai-quick">${quick}</div>
      ${aiStats()}
      <div class="ai-stream" id="ai-stream">${stream}</div>
      ${aiRefs()}
      <footer class="ai-foot"><i class="ti ti-shield-check" aria-hidden="true"></i>建议由本地规则生成，仅作参考</footer>`;
  }

  function aiStats() {
    const d = ed.draft || {};
    const n = words(d.body || '');
    const paras = (d.body || '').split(/\n+/).filter((x) => x.trim()).length;
    const limit = Math.min(...((d.platforms && d.platforms.length) ? d.platforms : ['公众号']).map((p) => LIMITS[p] || 2000));
    const read = Math.max(1, Math.round(n / 300));
    const rows = [['字数', n.toLocaleString('zh-CN')], ['段落', String(paras)], ['预计阅读', `${read} 分钟`], ['平台上限', limit.toLocaleString('zh-CN')]];
    return `<div class="ai-stats">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
  }

  function aiRefs() {
    const list = assets.filter((a) => ['link', 'kb', 'news'].includes(a.type)).slice(0, 3);
    if (!list.length) return '';
    return `<div class="ai-ref">
      <p class="ai-diag-title"><i class="ti ti-paperclip" aria-hidden="true"></i>可以引用的素材</p>
      ${list.map((a) => `<button class="ai-ref-item" type="button" data-action="ai-ref" data-id="${a.id}">
        <i class="ti ${RTYPE[a.type].icon}" aria-hidden="true"></i>
        <span>${esc(assetTitle(a))}</span>
      </button>`).join('')}
    </div>`;
  }

  function insertRef(id) {
    const a = assets.find((x) => x.id === Number(id));
    if (!a || !ed.draft) return;
    const src = a.host || a.source || a.path || '';
    ed.draft.body = `${ed.draft.body.trimEnd()}

> 参考：${assetTitle(a)}${src ? ` · ${src}` : ''}`.trim();
    $('#ed-body').value = ed.draft.body;
    commitEd();
    refreshEd();
    fitBody();
    toast('已插到正文末尾');
  }

  function toggleAI(force) {
    state.aiOpen = typeof force === 'boolean' ? force : !state.aiOpen;
    const split = $('.editor-split');
    const panel = $('#ai-panel');
    if (split) split.classList.toggle('ai-on', state.aiOpen);
    if (panel) {
      panel.hidden = !state.aiOpen;
      if (state.aiOpen) renderAI();
    }
    const btn = $('[data-action="ai-toggle"]');
    if (btn) btn.classList.toggle('is-on', state.aiOpen);
  }

  function runAI(kind) {
    if (!AI_ACT[kind] || aiState.running) return;
    aiState.running = kind;
    aiState.result = null;
    renderAI();
    setTimeout(() => {
      aiState.running = '';
      aiState.result = { kind, items: aiMake(kind) };
      renderAI();
    }, 720);
  }

  function useAI(i) {
    const r = aiState.result;
    if (!r || !r.items[i] || !ed.draft) return;
    const item = r.items[i];
    const d = ed.draft;

    if (r.kind === 'title') {
      d.title = item.text;
      $('#ed-title').value = item.text;
    } else if (r.kind === 'tags') {
      d.tag = item.text.split(/[·/／,，]/)[0].trim();
      $('#ed-tag').value = d.tag;
    } else if (r.kind === 'summary') {
      d.body = `> ${item.text}\n\n${d.body}`.trim();
      $('#ed-body').value = d.body;
    } else if (r.kind === 'more') {
      d.body = `${d.body.trimEnd()}\n\n${item.text}`;
      $('#ed-body').value = d.body;
    } else if (r.kind === 'polish' && item.before) {
      d.body = d.body.replace(item.before, item.text);
      $('#ed-body').value = d.body;
    }

    commitEd();
    refreshEd();
    fitBody();
    aiState.result = null;
    renderAI();
    toast('已写进草稿，可随时撤销');
  }

  /* -------------------------------------------------------------- events */

  app.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { showView(nav.dataset.nav); return; }

    const schedFor = e.target.closest('[data-schedule-for]');
    if (schedFor) {
      const c = find(schedFor.dataset.scheduleFor);
      const items = [];
      for (let i = 0; i < 10; i += 1) {
        const d = addDays(TODAY, i);
        items.push({ value: key(d), label: `${monthDay(key(d))} 周${weekday(d)}` });
      }
      openMenu(schedFor, items, c.date, (v) => {
        c.date = v;
        c.time = c.time || '20:00';
        if (c.status !== 'queued') c.status = 'queued';
        renderSchedule(); renderToday(false);
        toast(`已排到 ${monthDay(v)} ${c.time}`);
      });
      return;
    }

    const card = e.target.closest('[data-card], [data-day], [data-schedule]');
    if (card && !e.target.closest('[data-action]')) {
      if (card.dataset.card) {
        openEditor(card.dataset.card);
        return;
      }
      if (card.dataset.schedule) { newContent('queued', card.dataset.schedule); return; }
    }

    const asset = e.target.closest('[data-asset]');
    if (asset && !e.target.closest('[data-action]')) { openAsset(asset.dataset.asset); return; }

    const reply = e.target.closest('[data-reply]');
    if (reply) { openReply(reply.dataset.reply); return; }

    const add = e.target.closest('[data-add]');
    if (add) { newContent(add.dataset.add); return; }

    const sched = e.target.closest('[data-schedule]');
    if (sched) { newContent('queued', sched.dataset.schedule); return; }

    const platToggle = e.target.closest('[data-plat-toggle]');
    if (platToggle) {
      const p = platToggle.dataset.platToggle;
      if (prefs.plats.includes(p)) {
        if (prefs.plats.length === 1) { toast('至少保留一个平台'); return; }
        prefs.plats = prefs.plats.filter((x) => x !== p);
      } else {
        prefs.plats.push(p);
      }
      savePrefs();
      renderSettings();
      return;
    }

    const pushPlat = e.target.closest('[data-push-plat]');
    if (pushPlat) { togglePushPlat(pushPlat.dataset.pushPlat); return; }

    const pushForm = e.target.closest('[data-push-form]');
    if (pushForm) { push.form = pushForm.dataset.pushForm; paintPush(); return; }

    const pushWhen = e.target.closest('[data-push-when]');
    if (pushWhen) { push.when = pushWhen.dataset.pushWhen; paintPush(); return; }

    const aiAct = e.target.closest('[data-ai]');
    if (aiAct) { runAI(aiAct.dataset.ai); return; }

    const chip = e.target.closest('[data-plat]');
    if (chip && ed.draft) {
      const p = chip.dataset.plat;
      if (ed.draft.platforms.includes(p)) {
        if (ed.draft.platforms.length === 1) { toast('至少留一个发布平台'); return; }
        ed.draft.platforms = ed.draft.platforms.filter((x) => x !== p);
      } else {
        ed.draft.platforms.push(p);
      }
      refreshEd();
      commitEd();
      return;
    }

    const md = e.target.closest('[data-md]');
    if (md) { insertMd(md.dataset.md); return; }

    const pick = e.target.closest('[data-pick]');
    if (pick) {
      if (pick.dataset.pick === 'remind') {
        openMenu(pick, ['18:30', '19:00', '19:30', '20:00', '21:00'].map((t) => ({ value: t, label: t })), prefs.remind, (v) => {
          prefs.remind = v; savePrefs(); renderSettings(); toast(`提醒时间改为 ${v}`);
        });
      }
      if (pick.dataset.pick === 'status' && ed.draft) {
        openMenu(pick, Object.entries(STATUS).map(([v, l]) => ({ value: v, label: l })), ed.draft.status, (v) => {
          ed.draft.status = v;
          refreshEd();
          commitEd();
        });
      }
      if (pick.dataset.pick === 'date' && ed.draft) {
        const items = [{ value: '', label: '不排期' }];
        for (let i = 0; i < 10; i += 1) {
          const d = addDays(TODAY, i);
          items.push({ value: key(d), label: `${monthDay(key(d))} 周${weekday(d)}` });
        }
        openMenu(pick, items, ed.draft.date, (v) => {
          ed.draft.date = v;
          if (v) ed.draft.time = ed.draft.time || '20:00';
          refreshEd();
          commitEd();
        });
      }
      return;
    }

    const goal = e.target.closest('[data-goal]');
    if (goal) {
      prefs.goal = Number(goal.dataset.goal);
      savePrefs(); renderSettings(); renderToday(false);
      toast(`每周目标改为 ${prefs.goal} 条`);
      return;
    }

    const range = e.target.closest('[data-range]');
    if (range) {
      state.range = Number(range.dataset.range);
      $$('#range-filter button').forEach((b) => b.classList.toggle('is-on', b === range));
      renderInsights();
      return;
    }

    const statusBtn = e.target.closest('[data-status]');
    if (statusBtn && statusBtn.closest('#status-filter')) {
      state.status = statusBtn.dataset.status;
      $$('#status-filter button').forEach((b) => b.classList.toggle('is-on', b === statusBtn));
      renderTable();
      return;
    }

    const kind = e.target.closest('[data-type]');
    if (kind && kind.closest('#asset-filter')) {
      state.assetType = kind.dataset.type;
      renderAssets();
      return;
    }

    const toggle = e.target.closest('[data-toggle="motion"]');
    if (toggle) {
      prefs.motion = !prefs.motion;
      savePrefs(); renderSettings();
      toast(prefs.motion ? '动效已开启' : '动效已关闭');
      return;
    }

    const action = e.target.closest('[data-action]');
    if (!action) return;

    switch (action.dataset.action) {
      case 'palette': state.layer === 'palette' ? closeLayer() : openLayer('palette'); break;
      case 'inbox': openInbox(); break;
      case 'new': newContent('draft'); break;
      case 'close-modal': closeLayer(); break;
      case 'close-editor': closeEditor(); break;
      case 'save-content': saveEd(); break;
      case 'ed-undo': undoEd(); break;
      case 'ed-redo': redoEd(); break;
      case 'ed-revert': revertEd(); break;
      case 'copy-content': {
        const d = ed.draft;
        if (!d) break;
        copyText(`${d.title}\n\n${d.body}`).then(() => toast('正文已复制'));
        break;
      }
      case 'delete-content': {
        const c = find(ed.id);
        if (!c) break;
        content = content.filter((x) => x.id !== c.id);
        ed.id = null;
        ed.draft = null;
        renderToday(false); renderTable(); renderSchedule();
        showView(state.returnView || 'today');
        toast('已删除这条内容');
        break;
      }
      case 'week-prev': state.weekOffset -= 1; renderSchedule(); break;
      case 'week-next': state.weekOffset += 1; renderSchedule(); break;
      case 'export-all': exportAll(); break;
      case 'export-report': exportReport(); break;
      case 'upload': openCollectMenu(action); break;
      case 'collect-link': openLinkForm(); break;
      case 'collect-spark': collectSpark(); break;
      case 'collect-note': collectNote(); break;
      case 'link-save': {
        const url = ($('#link-url') || {}).value ? $('#link-url').value.trim() : '';
        if (!/^https?:\/\//.test(url)) { toast('先填一个以 http 开头的网址'); return; }
        let host = url;
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (err) { /* 保住原串 */ }
        const note = ($('#link-note') || {}).value ? $('#link-note').value.trim() : '';
        addAsset({ type: 'link', title: host, host, url, note: note || '还没写为什么留', at: '刚刚' });
        closeLayer();
        toast('已收录到素材');
        break;
      }
      case 'copy-name': copyText(action.dataset.name).then(() => toast('文件名已复制')); break;
      case 'asset-remove':
        assets = assets.filter((a) => a.id !== Number(action.dataset.id));
        if (state.layer === 'modal') closeLayer();
        renderAssets(); renderMetrics();
        toast('已从素材里移除');
        break;
      case 'send-reply': {
        const text = $('#reply-text').value.trim();
        if (!text) { toast('还没写回复'); $('#reply-text').focus(); return; }
        closeLayer();
        toast('回复已存为本地草稿，发送需要连接平台授权');
        break;
      }
      case 'row-menu': {
        const id = action.dataset.id;
        const c = find(id);
        if (!c) break;
        const live = Object.entries(c.push || {}).filter(([, v]) => v.state === 'live').map(([k]) => k);
        const items = [{ value: 'push', label: '推送到平台' }, { value: 'edit', label: '打开编辑' }];
        live.forEach((p) => items.push({ value: `update:${p}`, label: `更新${p}上的版本` }));
        live.forEach((p) => items.push({ value: `remove:${p}`, label: `从${p}撤下` }));
        items.push({ value: 'queued', label: '移到待发' }, { value: 'published', label: '标记为已发' });
        openMenu(action, items, '', (v) => {
          if (v === 'push') openPush(id);
          else if (v === 'edit') openEditor(id);
          else if (v.startsWith('update:')) openPush(id, v.slice(7));
          else if (v.startsWith('remove:')) unpublish(id, v.slice(7));
          else changeStatus(id, v);
        });
        break;
      }
      case 'ai-toggle': toggleAI(); break;
      case 'ai-close': toggleAI(false); break;
      case 'ai-use': useAI(Number(action.dataset.i)); break;
      case 'ai-ref': insertRef(action.dataset.id); break;
      case 'ai-again': aiState.round += 1; runAI(aiState.result ? aiState.result.kind : 'title'); break;
      case 'open-push': openPush(action.dataset.id); break;
      case 'push-current': if (ed.id) openPush(ed.id); break;
      case 'push-run': runPush(); break;
      case 'push-retry': retryPush(); break;
      case 'push-close': clearPushTimers(); closeLayer(); break;
      case 'push-done': clearPushTimers(); closeLayer(); break;
      case 'auth-renew': renewBind(action.dataset.auth); break;
      default: break;
    }
  });

  // drag and drop between columns
  let dragId = null;

  app.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    dragId = Number(card.dataset.card);
    card.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dragId));
  });

  app.addEventListener('dragend', (e) => {
    const card = e.target.closest('.card');
    if (card) card.classList.remove('is-dragging');
    $$('.col-body').forEach((b) => b.classList.remove('is-over'));
  });

  app.addEventListener('dragover', (e) => {
    const body = e.target.closest('.col-body');
    if (!body || dragId == null) return;
    e.preventDefault();
    body.classList.add('is-over');
  });

  app.addEventListener('dragleave', (e) => {
    const body = e.target.closest('.col-body');
    if (body && !body.contains(e.relatedTarget)) body.classList.remove('is-over');
  });

  app.addEventListener('drop', (e) => {
    const body = e.target.closest('.col-body');
    if (!body || dragId == null) return;
    e.preventDefault();
    body.classList.remove('is-over');
    changeStatus(dragId, body.dataset.drop);
    dragId = null;
  });

  // live editing
  app.addEventListener('input', (e) => {
    if (!ed.draft) {
      if (e.target.id === 'palette-input') openPalette(e.target.value);
      return;
    }
    if (e.target.id === 'ed-body') {
      ed.draft.body = e.target.value;
      refreshEd();
      fitBody();
      queueCommit();
      return;
    }
    if (e.target.id === 'ed-title') {
      ed.draft.title = e.target.value;
      refreshEd();
      queueCommit();
      return;
    }
    if (e.target.id === 'ed-tag') {
      ed.draft.tag = e.target.value;
      queueCommit();
      return;
    }
    if (e.target.id === 'palette-input') openPalette(e.target.value);
  });

  $('#palette-input').addEventListener('keydown', (e) => {
    const rows = $$('.p-item');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      state.cursor = (state.cursor + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % Math.max(rows.length, 1);
      rows.forEach((r, i) => r.classList.toggle('is-cursor', i === state.cursor));
      rows[state.cursor]?.scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      runPalette(state.cursor);
    }
  });

  $('#palette-list').addEventListener('click', (e) => {
    const item = e.target.closest('.p-item');
    if (item) runPalette(Number(item.dataset.index));
  });

  $('#scrim').addEventListener('click', closeLayer);

  /* 下拉：点空白处、滚动或缩放都收起。
     指针按下即关，早于 click，避免旧菜单压住新触发点。
     点在菜单内或触发点上时交给各自的 click 处理（触发点用于开合切换）。 */
  document.addEventListener('pointerdown', (e) => {
    if (!menuOpen) return;
    if (e.target.closest('.menu')) return;
    if (menuOpen.anchor.contains(e.target)) return;
    closeMenu();
  }, true);

  window.addEventListener('scroll', (e) => {
    if (menuOpen && !menuOpen.el.contains(e.target)) closeMenu();
  }, true);

  window.addEventListener('resize', () => closeMenu());

  $('#file-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const nextId = Math.max(0, ...assets.map((a) => a.id)) + 1;
    files.forEach((f, i) => {
      assets.unshift({
        id: nextId + i,
        name: f.name,
        type: 'image',
        kind: 'shot',
        seed: `local-${encodeURIComponent(f.name).slice(0, 12)}`,
        src: URL.createObjectURL(f),
        size: `${(f.size / 1048576).toFixed(1)} MB`
      });
    });
    renderAssets();
    renderMetrics();
    toast(`已加入 ${files.length} 张本地素材，刷新后清空`);
    e.target.value = '';
  });

  document.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    const inEditor = state.view === 'editor' && ed.draft && !state.layer;

    if (meta && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      state.layer === 'palette' ? closeLayer() : openLayer('palette');
      return;
    }
    if (meta && e.key.toLowerCase() === 's') {
      if (inEditor) { e.preventDefault(); saveEd(); }
      return;
    }
    if (meta && e.key.toLowerCase() === 'z' && inEditor) {
      e.preventDefault();
      e.shiftKey ? redoEd() : undoEd();
      return;
    }
    if (e.key === 'Escape') {
      if ($$('.menu', app).length) { closeMenu(); return; }
      if (state.layer) { closeLayer(); return; }
      if (state.view === 'editor') closeEditor();
      return;
    }
    const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
    if (!typing && !state.layer && state.view !== 'editor' && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      newContent('draft');
    }
  });

  // keyboard support for cards
  app.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.card, .tr, .res, .pool-card');
    if (!card) return;
    if (card.dataset.card) { e.preventDefault(); openEditor(card.dataset.card); }
    else if (card.dataset.asset) { e.preventDefault(); openAsset(card.dataset.asset); }
  });

  /* ---------------------------------------------------------------- boot */

  renderTable();
  renderSchedule();
  renderAssets();
  renderInsights();
  renderSettings();
  showView('today');
  renderBoard(true);
})();
