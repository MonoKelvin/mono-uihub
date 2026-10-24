/* =================================================================
   量界 · 物理爱好者交流社区
   纯前端演示数据与交互，无后端依赖。
   ================================================================= */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------ 数据 */

  const CHANNELS = [
    { id: 'mech', name: '力学', icon: 'ti-wave-sine', desc: '牛顿力学、分析力学、刚体与连续介质', count: 428 },
    { id: 'em', name: '电磁学', icon: 'ti-bolt', desc: '静电场、麦克斯韦方程、电路与电磁波', count: 371 },
    { id: 'quantum', name: '量子力学', icon: 'ti-atom', desc: '波函数、算符、量子化与纠缠态', count: 512 },
    { id: 'rel', name: '相对论', icon: 'ti-wave-sine', desc: '狭义与广义相对论、时空几何与引力', count: 246 },
    { id: 'thermo', name: '热力学统计', icon: 'ti-temperature', desc: '热力学定律、配分函数与相变', count: 289 },
    { id: 'optics', name: '光学', icon: 'ti-sun', desc: '干涉、衍射、偏振与波动光学', count: 197 },
    { id: 'astro', name: '天体物理', icon: 'ti-telescope', desc: '恒星演化、宇宙学与引力波', count: 158 },
    { id: 'exp', name: '实验物理', icon: 'ti-microscope', desc: '测量技术、仪器与数据处理', count: 133 }
  ];

  const TAGS = [
    { id: 'schrodinger', name: 'schrodinger', n: 128, desc: '方程、本征值与波函数' },
    { id: 'lagrangian', name: 'lagrangian', n: 96, desc: '作用量与变分原理' },
    { id: 'noether', name: 'noether', n: 54, desc: '对称性与守恒律' },
    { id: 'duality', name: 'duality', n: 41, desc: '对偶性与对偶字典' },
    { id: 'renorm', name: 'renorm', n: 63, desc: '重整化与有效场论' },
    { id: 'scattering', name: 'scattering', n: 87, desc: '散射振幅与截面' },
    { id: 'tensor', name: 'tensor', n: 72, desc: '张量与协变导数' },
    { id: 'adiabatic', name: 'adiabatic', n: 33, desc: '绝热定理与循环量' },
    { id: 'superconduct', name: 'superconduct', n: 58, desc: 'BCS 与能隙方程' },
    { id: 'gauge', name: 'gauge', n: 91, desc: '规范场与连接' },
    { id: 'feynman', name: 'feynman', n: 45, desc: '路径积分与图形' },
    { id: 'emergence', name: 'emergence', n: 38, desc: '有效理论与临界现象' }
  ];

  const USERS = {
    chen: { name: '陈砚博', avatar: 'ChenYanbo', rep: 4820, tag: '凝聚态' },
    lin: { name: '林晚舟', avatar: 'LinWanzhou', rep: 3610, tag: '广义相对论' },
    su: { name: '苏鹤鸣', avatar: 'SuHeming', rep: 2940, tag: '量子信息' },
    zhou: { name: '周聿川', avatar: 'ZhouYuchuan', rep: 2180, tag: '实验物理' },
    he: { name: '何宴清', avatar: 'HeYanqing', rep: 1760, tag: '热力学' },
    qi: { name: '祁远山', avatar: 'QiYuanshan', rep: 1320, tag: '光学' }
  };

  const AV = (key) => `https://api.dicebear.com/9.x/notionists/svg?seed=${USERS[key].avatar}&backgroundColor=transparent`;

  const THREADS = [
    {
      id: 't1',
      chan: 'quantum',
      user: 'su',
      title: '测量在位置本征态和动量本征态之间连续切换，是否违反不确定性原理？',
      excerpt: '设想用一台装置以概率 $p$ 测量位置、以 $1-p$ 测量动量。无论 $p$ 取何值，测后状态的方差至少有一个不为零 —— 但这是否真的构成对 $\\Delta x \\Delta p \\geq \\hbar/2$ 的违反？关键在于装置本身的量子涨落。',
      tags: ['schrodinger', 'quantum'],
      votes: 142,
      answers: 23,
      views: 1840,
      time: '2 小时前',
      solved: true,
      eq: '\\Delta x \\, \\Delta p \\geq \\frac{\\hbar}{2}',
      eqNote: '位置与动量测量的标准差乘积下界',
      body: [
        '设想一台装置以概率 $p$ 测量位置、以概率 $1-p$ 测量动量。无论 $p$ 取何值，测后状态的方差至少有一个不为零。但这是否真的构成对 $\\Delta x \\Delta p \\geq \\hbar/2$ 的违反？',
        '我认为关键不在被测系统，而在装置本身的量子涨落：测量位置时动量方差被放大，测量动量时位置方差被放大。混合后的态是否仍满足 Robertson 关系，需要显式计算混合矩阵元的贡献。',
        '有人认为这与 Delbrück 的 $1/k^2$ 实验是同一类问题，也有人认为根本无关。请指正。'
      ],
      answerList: [
        {
          user: 'chen',
          accepted: true,
          time: '1 小时前',
          body: '不违反。Robertson 关系约束的是**同一个态**上的两个算符期望，与测量方案无关。混合后得到的不是纯态，而是密度矩阵 $\\rho = p|\\psi_x\\rangle\\langle\\psi_x| + (1-p)|\\psi_p\\rangle\\langle\\psi_p|$，对混合态要用 $\\Delta A^2 = \\operatorname{Tr}(\\rho A^2) - \\operatorname{Tr}(\\rho A)^2$ 计算。',
          eq: '\\Delta x^2 = p\\,\\sigma_x^2 + (1-p)\\,\\sigma_p^2 + p(1-p)|x_0 - p_0|^2',
          eqNote: '混合态位置方差，含非对角项'
        },
        {
          user: 'lin',
          accepted: false,
          time: '48 分钟前',
          body: '补一个角度：如果把测量装置也算进系统，整体演化是幺正的，不确定性从未被破坏，只是被"转移"到了装置自由度上。所谓"违反"通常是把粗粒化后的经典描述当成了精确的量子态。'
        }
      ]
    },
    {
      id: 't2',
      chan: 'rel',
      user: 'lin',
      title: '等效原理到底陈述了什么？推导时容易忽略哪些前提？',
      excerpt: '引力质量与惯性质量相等并非恒等式 —— 它来自更一般的等效性假设 $m_g = m_i$。讨论中常把"弱场极限"和"局域性"两个限定丢掉，结果推导出比原定理更强的结论。',
      tags: ['tensor', 'emergence'],
      votes: 96,
      answers: 17,
      views: 1220,
      time: '4 小时前',
      solved: false,
      eq: 'm_g = m_i, \\qquad \\frac{F}{m_i} = \\frac{F}{m_g}',
      eqNote: '两种质量的定义式，其相等并非先验',
      body: [
        '等效原理常被简述为"引力和惯性等价"，但这个表述丢掉了很多东西。等效性假设说的是：可以在足够小的区域内把均匀引力场与匀加速参考系等同。',
        '由此推出 $m_g = m_i$，前提是局部性：等效区域必须小到潮汐效应可以忽略。讨论中我们经常直接写"引力质量等于惯性质量"，这其实是结论而非假设。',
        '有人能讲清楚从爱因斯坦 1907 年的原始表述到强等效原理，中间缺了哪些论证？'
      ],
      answerList: [
        {
          user: 'su',
          accepted: false,
          time: '3 小时前',
          body: '1907 年的原始表述只覆盖了弱场、静态、局部匀加速参考系，是"弱等效原理"。从它到强等效原理要靠后续的数学发展，包括费马原理的表述和 1911 年的爱因斯坦论文。弱等效原理本身不足以导出广义相对论 —— 这是常见误解。'
        }
      ]
    },
    {
      id: 't3',
      chan: 'em',
      user: 'zhou',
      title: '平面波导中 TE 与 TM 模式的截止条件为何不同？',
      excerpt: '金属波导中 TE 模式有截止频率而 TM 模式没有，矩形介质波导则相反。这个差异源自边界条件施加在哪个场分量上，追一下本征方程的来源。',
      tags: ['scattering', 'duality'],
      votes: 78,
      answers: 11,
      views: 940,
      time: '6 小时前',
      solved: true,
      eq: 'k_z^2 = k_0^2 - \\left(\\frac{m\\pi}{a}\\right)^2',
      eqNote: '矩形波导纵向传播常数',
      body: [
        '金属波导中 TE 模式有截止频率而 TM 模式没有，矩形介质波导情况相反。这个差异不是记号问题，源自边界条件施加在不同的场分量上。',
        '金属边界切向 $E = 0$，这直接作用在 $E_x$（TE）上给出离散本征值；而 TM 的边界条件作用在 $H_x$ 上，得到的方程形式不同。介质波导换成全反射条件后，结论又反过来。',
        '有没有一个统一的角度把这两组本征方程串起来，而不是分别记忆？'
      ],
      answerList: [
        {
          user: 'qi',
          accepted: true,
          time: '5 小时前',
          body: '统一角度看，本质是**对偶变换**：把 $E \\leftrightarrow H$、$\\epsilon \\leftrightarrow \\mu$ 互换，TE 与 TM 的方程形式互换。金属边界与介质边界的差异，实质是 $\\epsilon/\\mu$ 的符号结构不同 —— 金属内部 $\\epsilon < 0$ 使纵向传播常数的条件反号。',
          eq: '\\epsilon \\, E \\leftrightarrow \\mu \\, H',
          eqNote: '对偶变换的场与本构量互换'
        }
      ]
    },
    {
      id: 't4',
      chan: 'mech',
      user: 'he',
      title: '小角度近似下单摆周期的修正项为何是负的？',
      excerpt: '精确周期展开为 $T = 2\\pi\\sqrt{l/g}\\left(1 + \\frac{1}{16}\\theta_0^2 + \\cdots\\right)$，系数为正，意味着周期随振幅增大而变长。直观图像是什么？',
      tags: ['adiabatic', 'feynman'],
      votes: 64,
      answers: 9,
      views: 810,
      time: '昨天',
      solved: true,
      eq: 'T = 2\\pi\\sqrt{\\frac{l}{g}}\\left(1 + \\frac{1}{16}\\theta_0^2 + \\frac{11}{3072}\\theta_0^4 + \\cdots\\right)',
      eqNote: '单摆周期的振幅展开',
      body: [
        '精确周期展开后系数为正，说明振幅越大周期越长。初学者常觉得"摆得高一点应该更快到达底部"，直觉给不出正确符号。',
        '我猜和大摆幅时轨迹不再是圆弧、有效摆长变长有关，但不确定该怎么严谨地讲清楚这个图像。'
      ],
      answerList: [
        {
          user: 'chen',
          accepted: true,
          time: '昨天',
          body: '图像是**等时椭圆**（等时摆线）。大振幅时摆锤走的是被拉长的椭圆弧，弧的曲率半径大于摆长。等时性要求沿轨迹速度分布使得每四分之一周期时间相同，弧变长意味着平均速度变小，于是周期变长。',
          eq: '\\oint \\frac{ds}{v} = 4T',
          eqNote: '等时摆线的弧长积分'
        }
      ]
    },
    {
      id: 't5',
      chan: 'thermo',
      user: 'chen',
      title: '配分函数中的简并度因子，在相变点附近失效的判据是什么？',
      excerpt: '平均场近似给出 $T_c = z|J|/\ln z$ 一类结果，但临界点附近涨落不可忽略，平均场失效。Landau 判据 $k_BT_c = z|J|$ 如何从涨落关联长度的发散导出？',
      tags: ['emergence', 'superconduct'],
      votes: 53,
      answers: 8,
      views: 640,
      time: '2 天前',
      solved: false,
      eq: '\\xi \\sim \\left(1 - \\frac{T}{T_c}\\right)^{-\\nu}',
      eqNote: '关联长度的临界发散',
      body: [
        '平均场近似给出 $T_c = z|J|/\ln z$ 一类结果，但临界点附近涨落不可忽略，平均场失效。',
        'Landau 判据 $k_B T_c = z|J|$ 是怎么从涨落关联长度发散导出来的？涨落离散化判据给出的是 $k_B T_c = z|J|\\sqrt{z}$，两者已经不一致。'
      ],
      answerList: []
    },
    {
      id: 't6',
      chan: 'astro',
      user: 'lin',
      title: '引力波源的标准警报能量分布，为什么在低频段偏低？',
      excerpt: 'LIGO-Virgo 的 BNS 警报在 10 Hz 以下迅速截止，源的约化质量、SNR 频带依赖与探测器噪声曲线三者耦合，想理清截止频率的物理来源。',
      tags: ['scattering', 'emergence'],
      votes: 47,
      answers: 6,
      views: 520,
      time: '3 天前',
      solved: false,
      eq: '\\rho \\propto \\frac{M_c^{5/3} f^{2/3}}{d_L(z)}',
      eqNote: '应变振幅的标度关系',
      body: [
        'LIGO-Virgo 的双中子星警报在 10 Hz 以下迅速截止。直觉上低频处引力波振幅更大（$f^{2/3}$），应该更容易探测到才对，为什么反而截止了？',
        '我认为根源在探测器噪声：低频地震噪声主导。但这解释不了为什么 10 Hz 以下是"突然"截止而非平滑退化。'
      ],
      answerList: []
    },
    {
      id: 't7',
      chan: 'optics',
      user: 'qi',
      title: '菲涅耳衍射的半波带法，为什么划分半波带比全波带更自然？',
      excerpt: '半波带法把波前切成相邻相位差 $\\pi$ 的条带，使各带贡献两两抵消，得到级数收敛。全波带法也可用，但收敛慢且要处理首带贡献，物理含义不如半波带清晰。',
      tags: ['feynman', 'scattering'],
      votes: 41,
      answers: 7,
      views: 480,
      time: '4 天前',
      solved: true,
      eq: '\\delta = \\frac{2\\lambda\\pi r}{D}',
      eqNote: '半波带的划分条件',
      body: [
        '半波带法把波前切成相邻相位差 $\\pi$ 的条带，使各带贡献两两抵消。全波带法也可用，但要处理首带的贡献，收敛慢。',
        '除了计算上的便利，半波带划分在物理上有没有更深的理由？'
      ],
      answerList: [
        {
          user: 'zhou',
          accepted: true,
          time: '3 天前',
          body: '物理原因是**相位差的均匀分割对应振幅矢量首尾相接的菱形**。相邻半波带的复振幅夹角恰为 $\\pi$，两两相消后总振幅只剩首带的投影。这个几何图像比全波带直观得多 —— 全波带的两两相消会留下首尾不闭合的缺口。'
        }
      ]
    },
    {
      id: 't8',
      chan: 'quantum',
      user: 'su',
      title: '路径积分中，经典路径的偏微分方程从哪个变分条件来？',
      excerpt: '由 $\\delta S = 0$ 得到的是 $\\delta \\mathcal{L} = 0$，写成分子形式是 $\\frac{\\partial \\mathcal{L}}{\\partial q} - \\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot q} = 0$。这个式子和通常的欧拉-拉格朗日方程差了一个符号约定，容易搞混。',
      tags: ['lagrangian', 'feynman'],
      votes: 38,
      answers: 4,
      views: 390,
      time: '5 天前',
      solved: true,
      eq: '\\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot q} - \\frac{\\partial \\mathcal{L}}{\\partial q} = 0',
      eqNote: '欧拉-拉格朗日方程的标准形式',
      body: [
        '路径积分里由 $\\delta S = 0$ 得到的驻值条件，和教科书上的欧拉-拉格朗日方程式子长得不太一样，符号约定到底怎么统一的？',
        '另外，如果作用量含显式时间依赖，这个变分过程的边界条件还需要额外讨论吗？'
      ],
      answerList: [
        {
          user: 'chen',
          accepted: true,
          time: '4 天前',
          body: '两式只是约定不同：路径积分文献多用 $\\delta\\mathcal{L} = 0$ 把整体变分 $\\delta\\mathcal{L} = \\sum \\frac{\\partial \\mathcal{L}}{\\partial q}\\delta q$ 与 $\\sum \\frac{\\partial \\mathcal{L}}{\\partial \\dot q}\\delta\\dot q$ 分别积分后配对，$\\delta\\dot q = \\frac{d}{dt}\\delta q$，配对项移到左边。显式时间依赖不改变变分过程 —— 端点固定时 $\\delta t = 0$。'
        }
      ]
    }
  ];

  const state = {
    pane: 'home',
    sort: 'hot',
    chan: null,
    meTab: 'posts',
    chanFilter: null,
    votes: {},
    saved: new Set(['t1', 't5']),
    results: [],
    cursor: 0,
    shown: 6,
    openThread: null,
    theme: 'dark'
  };

  /* ------------------------------------------------------------ 工具 */

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const chanById = (id) => CHANNELS.find((c) => c.id === id);
  const chanName = (id) => (chanById(id) || {}).name || '';

  /* 主题正文里的 $...$ / $$...$$ 走 KaTeX。
     自己切分而不是用 auto-render 的 DOM 遍历 —— 后者在嵌套结构里会漏节点，
     且渲染时机依赖脚本加载顺序。直接调 katex.renderToString 更确定。 */
  const MATH_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

  /* 单条公式渲染为 HTML；KaTeX 不可用或出错时退回等宽文本 */
  function katexHTML(source, displayMode) {
    const plain = source.trim();
    if (!window.katex) {
      return `<code style="font-family:var(--font-mono)">${esc(plain)}</code>`;
    }
    try {
      return katex.renderToString(plain, {
        displayMode: !!displayMode,
        throwOnError: false,
        strict: false
      });
    } catch (e) {
      return `<code style="font-family:var(--font-mono)">${esc(plain)}</code>`;
    }
  }

  /* 把含公式标记的纯文本转成 HTML：
     先做数学替换，其余部分转义，最后处理 **粗体** */
  function mathify(text) {
    const out = [];
    let last = 0;
    let m;
    MATH_RE.lastIndex = 0;
    while ((m = MATH_RE.exec(text)) !== null) {
      out.push(esc(text.slice(last, m.index)));
      if (m[1] !== undefined) out.push(katexHTML(m[1], true));
      else out.push(katexHTML(m[2], false));
      last = m.index + m[0].length;
    }
    out.push(esc(text.slice(last)));
    return out.join('').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  /* 把段落拆成 <p>，每段内联公式走 mathify */
  function prose(text) {
    return text.split('\n').filter(Boolean).map((line) => `<p>${mathify(line)}</p>`).join('');
  }

  let toastTimer = null;
  function toast(msg, icon = 'ti-circle-check') {
    const el = $('#toast');
    el.innerHTML = `<i class="ti ${icon}" aria-hidden="true"></i>${esc(msg)}`;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ------------------------------------------------------------ 渲染：频道 */

  function renderChannels() {
    $('#chan-list').innerHTML = CHANNELS.map((c) => `
      <button class="chan" type="button" data-chan="${c.id}">
        <i class="ti ${c.icon}" aria-hidden="true"></i>
        <span>${esc(c.name)}</span>
        <b>${c.count}</b>
      </button>`).join('');

    $('#chan-grid').innerHTML = CHANNELS.map((c) => `
      <button class="ccard" type="button" data-chan="${c.id}">
        <span class="ccard-top">
          <i class="ti ${c.icon}" aria-hidden="true"></i>
          <b>${esc(c.name)}</b>
        </span>
        <p>${esc(c.desc)}</p>
        <span class="ccard-foot">
          <span>${c.count} 主题</span>
          <span>${THREADS.filter((t) => t.chan === c.id).length} 在讨论</span>
        </span>
      </button>`).join('');
  }

  function renderHot() {
    const hot = [...THREADS].sort((a, b) => b.votes - a.votes).slice(0, 5);
    $('#hot-list').innerHTML = hot.map((t, i) => `
      <li>
        <button class="hot" type="button" data-thread="${t.id}">
          <i>${String(i + 1).padStart(2, '0')}</i>
          <span>
            <p>${esc(t.title)}</p>
            <em>${esc(chanName(t.chan))} · ${t.answers} 回答</em>
          </span>
        </button>
      </li>`).join('');
  }

  function renderHomeStats() {
    const answered = THREADS.filter((t) => t.answers > 0).length;
    const totalVotes = THREADS.reduce((s, t) => s + t.votes, 0);
    $('#home-stats').innerHTML = `
      <div class="rstat"><span>累计赞同</span><b>${totalVotes.toLocaleString()}</b></div>
      <div class="rstat"><span>已有回答</span><b>${answered} / ${THREADS.length}</b></div>
      <div class="rstat"><span>注册成员</span><b>12,846</b></div>
      <div class="rstat"><span>平均响应</span><b>2.4 小时</b></div>`;
  }

  /* ------------------------------------------------------------ 渲染：主题流 */

  function threadCard(t, i) {
    const u = USERS[t.user];
    const score = t.votes + (state.votes[t.id] || 0);
    const saved = state.saved.has(t.id);
    const voteState = state.votes[t.id] ? (state.votes[t.id] > 0 ? 'on-up' : 'on-down') : '';

    return `
      <article class="thread" style="animation-delay:${Math.min(i * 55, 400)}ms">
        <div class="vote">
          <button type="button" data-vote="up" data-id="${t.id}" class="${voteState === 'on-up' ? 'on-up' : ''}" aria-label="赞同">
            <i class="ti ti-chevron-up" aria-hidden="true"></i>
          </button>
          <b>${score}</b>
          <button type="button" data-vote="down" data-id="${t.id}" class="${voteState === 'on-down' ? 'on-down' : ''}" aria-label="反对">
            <i class="ti ti-chevron-down" aria-hidden="true"></i>
          </button>
        </div>
        <div class="t-body">
          <button class="t-title" type="button" data-thread="${t.id}">${esc(t.title)}</button>
          <div class="t-excerpt">${mathify(t.excerpt)}</div>
          <div class="t-tags">
            ${t.tags.map((g) => `<span class="tag" data-tag="${g}">${esc(g)}</span>`).join('')}
            ${t.solved ? '<span class="tag is-on"><i class="ti ti-circle-check" style="font-size:13px;margin-right:4px"></i>已解决</span>' : ''}
          </div>
          <div class="t-meta">
            <span class="who"><img src="${AV(t.user)}" alt="" width="18" height="18">${esc(u.name)}</span>
            <span class="sep"></span>
            <span>${esc(t.time)}</span>
            <span class="sep"></span>
            <span class="stat ${t.answers > 0 ? 'answered' : ''}">
              <i class="ti ti-message" aria-hidden="true"></i><b>${t.answers}</b> 回答
            </span>
            <span class="sep"></span>
            <span class="stat"><i class="ti ti-eye" aria-hidden="true"></i><b>${t.views}</b></span>
            <button class="ibtn bookmark ${saved ? 'is-saved' : ''}" type="button" data-save="${t.id}" aria-label="${saved ? '取消收藏' : '收藏'}" title="${saved ? '取消收藏' : '收藏'}" style="width:26px;height:26px;font-size:15px">
              <i class="ti ${saved ? 'ti-bookmark' : 'ti-bookmark-off'}" aria-hidden="true" style="${saved ? 'color:var(--accent)' : ''}"></i>
            </button>
          </div>
        </div>
      </article>`;
  }

  function sortedThreads() {
    let list = [...THREADS];
    if (state.chanFilter) list = list.filter((t) => t.chan === state.chanFilter);
    if (state.sort === 'hot') list.sort((a, b) => b.votes - a.votes);
    else if (state.sort === 'new') list.sort((a, b) => a.id.localeCompare(b.id));
    else list.sort((a, b) => (a.answers - b.answers) || (b.votes - a.votes));
    return list;
  }

  function renderThreads() {
    const list = sortedThreads();
    const visible = list.slice(0, state.shown);
    const box = $('#thread-list');
    box.innerHTML = visible.length
      ? visible.map(threadCard).join('')
      : '<p class="pempty" style="padding:40px 0">这个频道还没有人提问</p>';

    const more = $('.more-btn');
    more.hidden = visible.length >= list.length;
    more.querySelector('span').textContent = `加载更早的讨论（剩余 ${Math.max(0, list.length - visible.length)}）`;

    const stat = $('[data-stat="threads"]');
    if (stat) stat.textContent = String(list.length);
  }

  function renderBookmarks() {
    const list = THREADS.filter((t) => state.saved.has(t.id));
    const box = $('#bookmark-list');
    box.innerHTML = list.length
      ? list.map(threadCard).join('')
      : '<p class="pempty" style="padding:40px 0">还没有收藏任何讨论</p>';
  }

  /* ------------------------------------------------------------ 渲染：标签 */

  function renderTags() {
    $('#tag-wall').innerHTML = TAGS.map((t) => `
      <button class="tagcard" type="button" data-taggo="${t.id}">
        <b>${esc(t.name)}</b>
        <span>${esc(t.desc)}</span>
        <em>${t.n} 主题</em>
      </button>`).join('');
  }

  /* ------------------------------------------------------------ 渲染：我的 */

  function renderMe() {
    const u = USERS.chen;
    const myThreads = THREADS.filter((t) => t.user === 'chen');
    const myAnswers = THREADS.flatMap((t) => t.answerList.filter((a) => a.user === 'chen').map((a) => ({ t, a })));

    $('#me-card').innerHTML = `
      <div class="me-top">
        <img src="${AV('chen')}" alt="${esc(u.name)}" width="62" height="62">
        <div>
          <h2>${esc(u.name)}</h2>
          <p>${esc(u.tag)} · 已认证</p>
        </div>
      </div>
      <p class="me-bio">写凝聚态，也写统计力学。擅长把粗粒化过程讲清楚，不擅长承认自己想错了。</p>
      <div class="me-kpis">
        <div><b>${u.rep.toLocaleString()}</b><span>声望</span></div>
        <div><b>${myThreads.length + myAnswers.length}</b><span>贡献</span></div>
        <div><b>92%</b><span>采纳率</span></div>
      </div>`;

    const box = $('#me-list');
    if (state.meTab === 'posts') {
      box.innerHTML = myThreads.length
        ? myThreads.map(threadCard).join('')
        : '<p class="pempty" style="padding:40px 0">还没有提问</p>';
    } else if (state.meTab === 'answers') {
      box.innerHTML = myAnswers.length
        ? myAnswers.map(({ t, a }, i) => `
          <article class="thread" style="animation-delay:${i * 55}ms">
            <div class="vote"><i class="ti ti-message" style="font-size:17px;color:var(--ink-3)"></i></div>
            <div class="t-body">
              <button class="t-title" type="button" data-thread="${t.id}">${esc(t.title)}</button>
              <div class="t-excerpt">${mathify(a.body.slice(0, 120))}…</div>
              <div class="t-meta">
                <span class="stat ${a.accepted ? 'answered' : ''}">
                  <i class="ti ${a.accepted ? 'ti-circle-check' : 'ti-message'}" aria-hidden="true"></i>
                  <b>${a.accepted ? '已采纳' : '待采纳'}</b>
                </span>
                <span class="sep"></span>
                <span>${esc(a.time)}</span>
              </div>
            </div>
          </article>`).join('')
        : '<p class="pempty" style="padding:40px 0">还没有回答</p>';
    } else {
      box.innerHTML = state.saved.size
        ? THREADS.filter((t) => state.saved.has(t.id)).map(threadCard).join('')
        : '<p class="pempty" style="padding:40px 0">还没有收藏</p>';
    }
  }

  /* ------------------------------------------------------------ 渲染：详情抽屉 */

  function answerHTML(a, i) {
    const u = USERS[a.user];
    return `
      <article class="answer ${a.accepted ? 'is-accepted' : ''}" style="animation:thread-in 380ms var(--ease) both;animation-delay:${i * 60}ms">
        <div class="ans-head">
          <img src="${AV(a.user)}" alt="" width="26" height="26">
          <b>${esc(u.name)}</b>
          <span>${esc(u.tag)} · ${esc(a.time)}</span>
          ${a.accepted ? '<span class="ans-badge"><i class="ti ti-circle-check" aria-hidden="true"></i>最佳回答</span>' : ''}
        </div>
        <div class="ans-body">${prose(a.body)}</div>
        ${a.eq ? `<div class="eq">${katexHTML(a.eq, true)}</div>` : ''}
        <div class="ans-foot">
          <span class="stat"><i class="ti ti-chevron-up" style="font-size:13px"></i>赞同</span>
          <span>回复</span>
          <span>分享</span>
        </div>
      </article>`;
  }

  function openThread(id) {
    const t = THREADS.find((x) => x.id === id);
    if (!t) return;
    state.openThread = id;
    const u = USERS[t.user];
    const c = chanById(t.chan);

    $('#drawer-inner').innerHTML = `
      <header class="dr-head">
        <div>
          <span class="dr-chan"><i class="ti ${c.icon}" aria-hidden="true"></i>${esc(c.name)}</span>
          <h2>${esc(t.title)}</h2>
        </div>
        <button class="ibtn" type="button" data-action="close-drawer" aria-label="关闭">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </header>

      <div class="t-meta" style="margin-top:0;margin-bottom:var(--s5)">
        <span class="who"><img src="${AV(t.user)}" alt="" width="18" height="18">${esc(u.name)}</span>
        <span class="sep"></span>
        <span>${esc(t.time)}</span>
        <span class="sep"></span>
        <span class="stat"><i class="ti ti-eye" aria-hidden="true"></i><b>${t.views}</b></span>
      </div>

      <div class="dr-body">${prose(t.body.join('\n'))}</div>
      <div class="eq">${katexHTML(t.eq, true)}</div>
      <p class="eq-note">${esc(t.eqNote)}</p>

      <div class="t-tags">
        ${t.tags.map((g) => `<span class="tag" data-tag="${g}">${esc(g)}</span>`).join('')}
      </div>

      <section class="dr-answers">
        <h3>${t.answers} 个回答</h3>
        ${t.answerList.length
          ? t.answerList.map(answerHTML).join('')
          : '<p class="pempty" style="padding:26px 0">还没有回答，成为第一个</p>'}
      </section>

      <div class="reply-box">
        <textarea placeholder="补充你的推导。先写条件，再写结论。" id="reply-input"></textarea>
        <div class="reply-foot">
          <span>支持 $...$ 行内公式</span>
          <button class="btn btn-solid" type="button" data-action="submit-reply">
            <i class="ti ti-send" aria-hidden="true"></i>发表回答
          </button>
        </div>
      </div>`;

    $('#scrim').hidden = false;
    $('#drawer').hidden = false;
    $('#drawer').scrollTop = 0;
  }

  function closeDrawer() {
    $('#scrim').hidden = true;
    $('#drawer').hidden = true;
  }

  /* ------------------------------------------------------------ 视图切换 */

  function showPane(name) {
    state.pane = name;
    $$('.pane').forEach((p) => p.classList.toggle('is-on', p.dataset.pane === name));
    $$('.bnav').forEach((b) => b.classList.toggle('is-on', b.dataset.nav === name));
    const pane = $(`.pane[data-pane="${name}"]`);
    if (pane) pane.scrollTop = 0;
  }

  /* ------------------------------------------------------------ 命令面板 */

  function openPalette(query = '') {
    const q = query.trim().toLowerCase();

    const actions = [
      { kind: 'action', action: 'compose', label: '发起提问', hint: '提问', icon: 'ti-plus' },
      { kind: 'action', action: 'go-channels', label: '浏览全部频道', hint: '导航', icon: 'ti-layout' },
      { kind: 'action', action: 'go-tags', label: '按标签检索', hint: '导航', icon: 'ti-tags' },
      { kind: 'action', action: 'toggle-theme', label: '切换明暗主题', hint: '外观', icon: 'ti-moon' }
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    const threads = THREADS
      .filter((t) => !q
        || t.title.toLowerCase().includes(q)
        || t.excerpt.toLowerCase().includes(q)
        || chanName(t.chan).toLowerCase().includes(q)
        || t.tags.some((g) => g.includes(q)))
      .slice(0, 7)
      .map((t) => ({ kind: 'thread', id: t.id, label: t.title, hint: chanName(t.chan), icon: 'ti-math-function' }));

    const tags = TAGS
      .filter((t) => !q || t.name.includes(q) || t.desc.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ kind: 'tag', id: t.id, label: t.name, hint: `${t.n} 主题`, icon: 'ti-tag' }));

    const results = actions.concat(threads, tags);
    state.results = results;
    state.cursor = 0;

    $('#pal-list').innerHTML = results.length
      ? results.map((r, i) => `
        <button class="pitem ${i === 0 ? 'is-cursor' : ''}" type="button" data-index="${i}">
          <i class="ti ${r.icon}" aria-hidden="true"></i>
          <span>${esc(r.label)}</span>
          <small>${esc(r.hint)}</small>
        </button>`).join('')
      : '<p class="pempty">没有匹配的内容</p>';
  }

  function runPalette(index) {
    const item = state.results[index];
    if (!item) return;
    closePalette();
    if (item.kind === 'thread') { openThread(item.id); return; }
    if (item.kind === 'tag') { showPane('tags'); toast(`标签 ${item.id}`, 'ti-tag'); return; }
    if (item.action === 'compose') openComposer();
    if (item.action === 'go-channels') showPane('channels');
    if (item.action === 'go-tags') showPane('tags');
    if (item.action === 'toggle-theme') toggleTheme();
  }

  function openPalettePanel() {
    $('#palette').hidden = false;
    $('#pal-input').value = '';
    openPalette('');
    $('#pal-input').focus();
  }

  function closePalette() {
    $('#palette').hidden = true;
  }

  /* ------------------------------------------------------------ 提问编辑器 */

  function openComposer() {
    $('#cp-chans').innerHTML = CHANNELS.map((c, i) => `
      <button class="chip ${i === 0 ? 'is-on' : ''}" type="button" data-pick-chan="${c.id}">${esc(c.name)}</button>`).join('');
    $('#composer').hidden = false;
    $('#cp-title').focus();
  }

  function closeComposer() {
    $('#composer').hidden = true;
  }

  function insertTex(snippet) {
    const ta = $('#cp-body');
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    let insert = snippet;
    if (snippet.endsWith('{}')) {
      insert = snippet.replace('{}', '{$}');
    }
    ta.value = text.slice(0, start) + insert + text.slice(end);
    ta.focus();
    ta.setSelectionRange(start + insert.length - (insert.includes('{}') ? 3 : 0), start + insert.length - (insert.includes('{}') ? 3 : 0));
  }

  /* ------------------------------------------------------------ 主题切换 */

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    const btn = $('[data-action="theme"] .ti');
    btn.className = `ti ${state.theme === 'dark' ? 'ti-moon' : 'ti-sun'}`;
    toast(state.theme === 'dark' ? '已切到暗色' : '已切到亮色', state.theme === 'dark' ? 'ti-moon' : 'ti-sun');
  }

  /* ------------------------------------------------------------ 事件 */

  document.addEventListener('click', (e) => {
    const t = e.target;

    /* 导航 */
    const nav = t.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      showPane(nav.dataset.nav);
      if (nav.dataset.nav === 'me') renderMe();
      if (nav.dataset.nav === 'bookmarks') renderBookmarks();
      return;
    }

    /* 主题详情 */
    const threadBtn = t.closest('[data-thread]');
    if (threadBtn) { openThread(threadBtn.dataset.thread); return; }

    /* 频道筛选 */
    const chanBtn = t.closest('[data-chan]');
    if (chanBtn) {
      const id = chanBtn.dataset.chan;
      state.chanFilter = state.chanFilter === id ? null : id;
      $$('#chan-list .chan').forEach((b) => b.classList.toggle('is-on', b.dataset.chan === state.chanFilter));
      state.shown = 6;
      showPane('home');
      renderThreads();
      toast(state.chanFilter ? `只看「${chanName(id)}」` : '已显示全部频道', 'ti-filter');
      return;
    }

    /* 投票 */
    const voteBtn = t.closest('[data-vote]');
    if (voteBtn) {
      const id = voteBtn.dataset.id;
      const dir = voteBtn.dataset.vote === 'up' ? 1 : -1;
      const cur = state.votes[id] || 0;
      const next = cur === dir ? 0 : dir;
      state.votes[id] = next;
      const score = THREADS.find((x) => x.id === id);
      score.votes += next - cur;
      renderThreads();
      if (state.pane === 'me') renderMe();
      toast(next === 0 ? '已取消投票' : next > 0 ? '已赞同' : '已标记有争议', 'ti-chevron-up');
      return;
    }

    /* 收藏 */
    const saveBtn = t.closest('[data-save]');
    if (saveBtn) {
      const id = saveBtn.dataset.save;
      if (state.saved.has(id)) { state.saved.delete(id); toast('已取消收藏', 'ti-bookmark'); }
      else { state.saved.add(id); toast('已收藏', 'ti-bookmark'); }
      renderThreads();
      renderBookmarks();
      if (state.pane === 'me') renderMe();
      return;
    }

    /* 标签 */
    const tagBtn = t.closest('[data-tag]');
    if (tagBtn) {
      $('#pal-input').value = tagBtn.dataset.tag;
      openPalette(tagBtn.dataset.tag);
      $('#palette').hidden = false;
      $('#pal-input').focus();
      return;
    }
    const tagGo = t.closest('[data-taggo]');
    if (tagGo) {
      $('#pal-input').value = tagGo.dataset.taggo;
      openPalette(tagGo.dataset.taggo);
      $('#palette').hidden = false;
      $('#pal-input').focus();
      return;
    }

    /* 排序 */
    const sortBtn = t.closest('#sort-seg button');
    if (sortBtn) {
      state.sort = sortBtn.dataset.sort;
      $$('#sort-seg button').forEach((b) => b.classList.toggle('is-on', b === sortBtn));
      state.shown = 6;
      renderThreads();
      return;
    }

    /* 我的 tab */
    const meTab = t.closest('#me-seg button');
    if (meTab) {
      state.meTab = meTab.dataset.tab;
      $$('#me-seg button').forEach((b) => b.classList.toggle('is-on', b === meTab));
      renderMe();
      return;
    }

    /* 命令面板项 */
    const pitem = t.closest('.pitem');
    if (pitem) { runPalette(Number(pitem.dataset.index)); return; }

    /* 动作 */
    const act = t.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'omni') { openPalettePanel(); return; }
      if (a === 'close-modal') { closeComposer(); return; }
      if (a === 'close-drawer') { closeDrawer(); return; }
      if (a === 'compose') { openComposer(); return; }
      if (a === 'theme') { toggleTheme(); return; }
      if (a === 'notify') { toast('没有新的未读提醒', 'ti-bell'); return; }
      if (a === 'load-more') {
        state.shown += 4;
        renderThreads();
        return;
      }
      if (a === 'submit-question') {
        const title = $('#cp-title').value.trim();
        const body = $('#cp-body').value.trim();
        if (!title || !body) { toast('标题和正文都要填', 'ti-alert-circle'); return; }
        const chan = $('.chip.is-on');
        const chid = chan ? chan.dataset.pickChan : 'quantum';
        THREADS.unshift({
          id: 't' + (THREADS.length + 1),
          chan: chid,
          user: 'chen',
          title,
          excerpt: body.slice(0, 90),
          tags: ($('#cp-tag').value.trim().split(/\s+/).filter(Boolean) || ['new']).slice(0, 4),
          votes: 0, answers: 0, views: 1, time: '刚刚', solved: false,
          eq: 'E = mc^2', eqNote: '占位公式',
          body: [body], answerList: []
        });
        closeComposer();
        $('#cp-title').value = '';
        $('#cp-body').value = '';
        $('#cp-tag').value = '';
        state.shown = 6;
        showPane('home');
        renderThreads();
        renderChannels();
        toast('提问已发布', 'ti-circle-check');
        return;
      }
      if (a === 'submit-reply') {
        const ta = $('#reply-input');
        if (!ta.value.trim()) { toast('先写点内容', 'ti-alert-circle'); return; }
        const t = THREADS.find((x) => x.id === state.openThread);
        if (t) {
          t.answers += 1;
          t.answerList.push({
            user: 'chen', accepted: false, time: '刚刚', body: ta.value.trim()
          });
          state.shown = 6;
          renderThreads();
          openThread(t.id);
        }
        ta.value = '';
        toast('回答已发表', 'ti-circle-check');
        return;
      }
      return;
    }

    /* 公式工具 */
    const texBtn = t.closest('[data-tex]');
    if (texBtn) { insertTex(texBtn.dataset.tex); return; }

    /* 频道 chip */
    const chip = t.closest('[data-pick-chan]');
    if (chip) {
      $$('.chip').forEach((c) => c.classList.toggle('is-on', c === chip));
      return;
    }

    /* 点空白收起 */
    if (!t.closest('#palette')) closePalette();
  });

  /* 命令面板输入 */
  $('#pal-input').addEventListener('input', (e) => openPalette(e.target.value));

  /* 键盘 */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      $('#palette').hidden ? openPalettePanel() : closePalette();
      return;
    }
    if (e.key === 'Escape') {
      if (!$('#composer').hidden) { closeComposer(); return; }
      if (!$('#palette').hidden) { closePalette(); return; }
      if (!$('#drawer').hidden) { closeDrawer(); return; }
      return;
    }
    /* 命令面板上下选择 */
    if (!$('#palette').hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = state.results.length;
        if (!n) return;
        state.cursor = (state.cursor + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
        $$('.pitem').forEach((el, i) => el.classList.toggle('is-cursor', i === state.cursor));
        const cur = $('.pitem.is-cursor');
        if (cur) cur.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        runPalette(state.cursor);
      }
    }
  });

  /* 点遮罩关抽屉 */
  $('#scrim').addEventListener('click', closeDrawer);

  /* 提交提问的快捷键 */
  $('#cp-body').addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      $('[data-action="submit-question"]').click();
    }
  });

  /* ------------------------------------------------------------ 启动 */

  function boot() {
    renderChannels();
    renderHot();
    renderHomeStats();
    renderThreads();
    renderTags();
    renderBookmarks();
    renderMe();
  }

  /* KaTeX 走 CDN，若脚本晚于 app.js 就绪，等它加载后重绘一次 */
  if (window.katex) boot();
  else window.addEventListener('load', boot);
})();
