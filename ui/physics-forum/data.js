/* =================================================================
   量界 · 物理讨论社区 —— 数据层（独立配置文件）
   -----------------------------------------------------------------
   app.js 只消费本文件导出的 window.QJ，不含任何硬编码内容。

   构成：
     channels / tags / users  频道、标签、成员
     threads                  手写深度话题（26 条）+ 生成话题（84 条）
     概念池 concepts          44 个真实物理概念，作为生成器的素材
     回答池 answers           生成话题的通用回答
   生成器使用固定种子的确定性伪随机，刷新后数据完全一致。
   ================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------ 频道 */

  const CHANNELS = [
    { id: 'mech', name: '力学', desc: '牛顿力学、分析力学、刚体与连续介质', count: 428 },
    { id: 'em', name: '电磁学', desc: '静电场、麦克斯韦方程、电路与电磁波', count: 371 },
    { id: 'quantum', name: '量子力学', desc: '波函数、算符、量子化与纠缠态', count: 512 },
    { id: 'rel', name: '相对论', desc: '狭义与广义相对论、时空几何与引力', count: 246 },
    { id: 'thermo', name: '热力学统计', desc: '热力学定律、配分函数与相变', count: 289 },
    { id: 'optics', name: '光学', desc: '干涉、衍射、偏振与波动光学', count: 197 },
    { id: 'astro', name: '天体物理', desc: '恒星演化、宇宙学与引力波', count: 158 },
    { id: 'exp', name: '实验物理', desc: '测量技术、仪器与数据处理', count: 133 }
  ];

  /* ------------------------------------------------------------ 标签 */

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
    { id: 'emergence', name: 'emergence', n: 38, desc: '有效理论与临界现象' },
    { id: 'topology', name: 'topology', n: 41, desc: '拓扑不变量与序参量' },
    { id: 'weakmeasure', name: 'weakmeasure', n: 27, desc: '弱测量与后选择' },
    { id: 'plasma', name: 'plasma', n: 24, desc: '等离子体与磁流体' },
    { id: 'instr', name: 'instr', n: 31, desc: '仪器、噪声与数据处理' },
    { id: 'quantum', name: 'quantum', n: 76, desc: '量子态、算符与测量' }
  ];

  /* ------------------------------------------------------------ 成员 */

  const USERS = {
    chen: { name: '陈砚博', avatar: 'ChenYanbo', rep: 4820, tag: '凝聚态' },
    lin: { name: '林晚舟', avatar: 'LinWanzhou', rep: 3610, tag: '广义相对论' },
    su: { name: '苏鹤鸣', avatar: 'SuHeming', rep: 2940, tag: '量子信息' },
    zhou: { name: '周聿川', avatar: 'ZhouYuchuan', rep: 2180, tag: '实验物理' },
    he: { name: '何宴清', avatar: 'HeYanqing', rep: 1760, tag: '热力学' },
    qi: { name: '祁远山', avatar: 'QiYuanshan', rep: 1320, tag: '光学' },
    shen: { name: '沈亦白', avatar: 'ShenYibai', rep: 2680, tag: '凝聚态' },
    luo: { name: '罗嘉树', avatar: 'LuoJiashu', rep: 1490, tag: '等离子体' },
    tan: { name: '谭若谷', avatar: 'TanRuogu', rep: 1180, tag: '声学' },
    yu: { name: '郁南屏', avatar: 'YuNanping', rep: 980, tag: '天体力学' },
    bai: { name: '白澹宁', avatar: 'BaiDanning', rep: 2410, tag: '量子场论' },
    gu: { name: '顾长风', avatar: 'GuChangfeng', rep: 1540, tag: '统计物理' }
  };

  const USER_KEYS = Object.keys(USERS);

  /* ------------------------------------------------------------ 手写深度话题 */

  const HAND_THREADS = [
    {
      id: 't1', chan: 'quantum', user: 'su',
      title: '测量在位置本征态和动量本征态之间连续切换，是否违反不确定性原理？',
      excerpt: '设想用一台装置以概率 $p$ 测量位置、以 $1-p$ 测量动量。无论 $p$ 取何值，测后状态的方差至少有一个不为零。但这是否真的构成对 $\\Delta x \\Delta p \\geq \\hbar/2$ 的违反？',
      eqRow: '\\Delta x\\,\\Delta p \\geq \\tfrac{\\hbar}{2}',
      tags: ['schrodinger', 'quantum'],
      votes: 142, answers: 23, views: 1840, time: '2 小时前', solved: true,
      eq: '\\Delta x \\, \\Delta p \\geq \\frac{\\hbar}{2}',
      eqNote: '位置与动量测量的标准差乘积下界',
      body: [
        '设想一台装置以概率 $p$ 测量位置、以概率 $1-p$ 测量动量。无论 $p$ 取何值，测后状态的方差至少有一个不为零。但这是否真的构成对 $\\Delta x \\Delta p \\geq \\hbar/2$ 的违反？',
        '我认为关键不在被测系统，而在装置本身的量子涨落：测量位置时动量方差被放大，测量动量时位置方差被放大。混合后的态是否仍满足 Robertson 关系，需要显式计算混合矩阵元的贡献。',
        '有人认为这与 Delbrück 的 $1/k^2$ 实验是同一类问题，也有人认为根本无关。请指正。'
      ],
      answerList: [
        {
          user: 'chen', accepted: true, time: '1 小时前',
          body: '不违反。Robertson 关系约束的是**同一个态**上的两个算符期望，与测量方案无关。混合后得到的不是纯态，而是密度矩阵 $\\rho = p|\\psi_x\\rangle\\langle\\psi_x| + (1-p)|\\psi_p\\rangle\\langle\\psi_p|$，对混合态要用 $\\Delta A^2 = \\operatorname{Tr}(\\rho A^2) - \\operatorname{Tr}(\\rho A)^2$ 计算。',
          eq: '\\Delta x^2 = p\\,\\sigma_x^2 + (1-p)\\,\\sigma_p^2 + p(1-p)|x_0 - p_0|^2',
          eqNote: '混合态位置方差，含非对角项'
        },
        {
          user: 'lin', accepted: false, time: '48 分钟前',
          body: '补一个角度：如果把测量装置也算进系统，整体演化是幺正的，不确定性从未被破坏，只是被"转移"到了装置自由度上。所谓"违反"通常是把粗粒化后的经典描述当成了精确的量子态。'
        }
      ]
    },
    {
      id: 't2', chan: 'rel', user: 'lin',
      title: '等效原理到底陈述了什么？推导时容易忽略哪些前提？',
      excerpt: '引力质量与惯性质量相等并非恒等式，它来自更一般的等效性假设 $m_g = m_i$。讨论中常把"弱场极限"和"局域性"两个限定丢掉。',
      eqRow: 'm_g = m_i',
      tags: ['tensor', 'emergence'],
      votes: 96, answers: 17, views: 1220, time: '4 小时前', solved: false,
      eq: 'm_g = m_i, \\qquad \\frac{F}{m_i} = \\frac{F}{m_g}',
      eqNote: '两种质量的定义式，其相等并非先验',
      body: [
        '等效原理常被简述为"引力和惯性等价"，但这个表述丢掉了很多东西。等效性假设说的是：可以在足够小的区域内把均匀引力场与匀加速参考系等同。',
        '由此推出 $m_g = m_i$，前提是局部性：等效区域必须小到潮汐效应可以忽略。讨论中我们经常直接写"引力质量等于惯性质量"，这其实是结论而非假设。',
        '有人能讲清楚从爱因斯坦 1907 年的原始表述到强等效原理，中间缺了哪些论证？'
      ],
      answerList: [
        {
          user: 'su', accepted: false, time: '3 小时前',
          body: '1907 年的原始表述只覆盖了弱场、静态、局部匀加速参考系，是"弱等效原理"。从它到强等效原理要靠后续的数学发展。弱等效原理本身不足以导出广义相对论，这是常见误解。'
        }
      ]
    },
    {
      id: 't3', chan: 'em', user: 'zhou',
      title: '平面波导中 TE 与 TM 模式的截止条件为何不同？',
      excerpt: '金属波导中 TE 模式有截止频率而 TM 模式没有，矩形介质波导则相反。这个差异源自边界条件施加在哪个场分量上。',
      eqRow: 'k_z^2 = k_0^2 - (m\\pi/a)^2',
      tags: ['scattering', 'duality'],
      votes: 78, answers: 11, views: 940, time: '6 小时前', solved: true,
      eq: 'k_z^2 = k_0^2 - \\left(\\frac{m\\pi}{a}\\right)^2',
      eqNote: '矩形波导纵向传播常数',
      body: [
        '金属波导中 TE 模式有截止频率而 TM 模式没有，矩形介质波导情况相反。这个差异不是记号问题，源自边界条件施加在不同的场分量上。',
        '金属边界切向 $E = 0$，这直接作用在 $E_x$（TE）上给出离散本征值；而 TM 的边界条件作用在 $H_x$ 上，得到的方程形式不同。介质波导换成全反射条件后，结论又反过来。',
        '有没有一个统一的角度把这两组本征方程串起来，而不是分别记忆？'
      ],
      answerList: [
        {
          user: 'qi', accepted: true, time: '5 小时前',
          body: '统一角度看，本质是**对偶变换**：把 $E \\leftrightarrow H$、$\\epsilon \\leftrightarrow \\mu$ 互换，TE 与 TM 的方程形式互换。金属边界与介质边界的差异，实质是 $\\epsilon/\\mu$ 的符号结构不同。',
          eq: '\\epsilon \\, E \\leftrightarrow \\mu \\, H',
          eqNote: '对偶变换的场与本构量互换'
        }
      ]
    },
    {
      id: 't4', chan: 'mech', user: 'he',
      title: '小角度近似下单摆周期的修正项为何是负的？',
      excerpt: '精确周期展开后系数为正，说明振幅越大周期越长。初学者常觉得"摆得高一点应该更快到达底部"。',
      eqRow: 'T = 2\\pi\\sqrt{l/g}\\left(1 + \\theta_0^2/16\\right)',
      tags: ['adiabatic', 'feynman'],
      votes: 64, answers: 9, views: 810, time: '昨天', solved: true,
      eq: 'T = 2\\pi\\sqrt{\\frac{l}{g}}\\left(1 + \\frac{1}{16}\\theta_0^2 + \\frac{11}{3072}\\theta_0^4 + \\cdots\\right)',
      eqNote: '单摆周期的振幅展开',
      body: [
        '精确周期展开后系数为正，说明振幅越大周期越长。初学者常觉得"摆得高一点应该更快到达底部"，直觉给不出正确符号。',
        '我猜和大摆幅时轨迹不再是圆弧、有效摆长变长有关，但不确定该怎么严谨地讲清楚这个图像。'
      ],
      answerList: [
        {
          user: 'chen', accepted: true, time: '昨天',
          body: '图像是**等时椭圆**（等时摆线）。大振幅时摆锤走的是被拉长的椭圆弧，弧的曲率半径大于摆长。弧变长意味着平均速度变小，于是周期变长。',
          eq: '\\oint \\frac{ds}{v} = 4T',
          eqNote: '等时摆线的弧长积分'
        }
      ]
    },
    {
      id: 't5', chan: 'thermo', user: 'chen',
      title: '配分函数中的简并度因子，在相变点附近失效的判据是什么？',
      excerpt: '平均场近似给出 $T_c = z|J|/\\ln z$ 一类结果，但临界点附近涨落不可忽略，平均场失效。',
      eqRow: '\\xi \\sim (1 - T/T_c)^{-\\nu}',
      tags: ['emergence', 'superconduct'],
      votes: 53, answers: 8, views: 640, time: '2 天前', solved: false,
      eq: '\\xi \\sim \\left(1 - \\frac{T}{T_c}\\right)^{-\\nu}',
      eqNote: '关联长度的临界发散',
      body: [
        '平均场近似给出 $T_c = z|J|/\\ln z$ 一类结果，但临界点附近涨落不可忽略，平均场失效。',
        'Landau 判据 $k_B T_c = z|J|$ 是怎么从涨落关联长度发散导出来的？涨落离散化判据给出的是 $k_B T_c = z|J|\\sqrt{z}$，两者已经不一致。'
      ],
      answerList: []
    },
    {
      id: 't6', chan: 'astro', user: 'lin',
      title: '引力波源的标准警报能量分布，为什么在低频段偏低？',
      excerpt: 'LIGO-Virgo 的 BNS 警报在 10 Hz 以下迅速截止，源的约化质量、SNR 频带依赖与探测器噪声曲线三者耦合。',
      eqRow: '\\rho \\propto M_c^{5/3} f^{2/3} / d_L',
      tags: ['scattering', 'emergence'],
      votes: 47, answers: 6, views: 520, time: '3 天前', solved: false,
      eq: '\\rho \\propto \\frac{M_c^{5/3} f^{2/3}}{d_L(z)}',
      eqNote: '应变振幅的标度关系',
      body: [
        'LIGO-Virgo 的双中子星警报在 10 Hz 以下迅速截止。直觉上低频处引力波振幅更大（$f^{2/3}$），应该更容易探测到才对，为什么反而截止了？',
        '我认为根源在探测器噪声：低频地震噪声主导。但这解释不了为什么 10 Hz 以下是"突然"截止而非平滑退化。'
      ],
      answerList: []
    },
    {
      id: 't7', chan: 'optics', user: 'qi',
      title: '菲涅耳衍射的半波带法，为什么划分半波带比全波带更自然？',
      excerpt: '半波带法把波前切成相邻相位差 $\\pi$ 的条带，使各带贡献两两抵消，得到级数收敛。',
      eqRow: '\\delta = \\frac{2\\lambda\\pi r}{D}',
      tags: ['feynman', 'scattering'],
      votes: 41, answers: 7, views: 480, time: '4 天前', solved: true,
      eq: '\\delta = \\frac{2\\lambda\\pi r}{D}',
      eqNote: '半波带的划分条件',
      body: [
        '半波带法把波前切成相邻相位差 $\\pi$ 的条带，使各带贡献两两抵消。全波带法也可用，但要处理首带的贡献，收敛慢。',
        '除了计算上的便利，半波带划分在物理上有没有更深的理由？'
      ],
      answerList: [
        {
          user: 'zhou', accepted: true, time: '3 天前',
          body: '物理原因是**相位差的均匀分割对应振幅矢量首尾相接的菱形**。相邻半波带的复振幅夹角恰为 $\\pi$，两两相消后总振幅只剩首带的投影。'
        }
      ]
    },
    {
      id: 't8', chan: 'quantum', user: 'su',
      title: '路径积分中，经典路径的偏微分方程从哪个变分条件来？',
      excerpt: '由 $\\delta S = 0$ 得到的是 $\\delta \\mathcal{L} = 0$，与通常的欧拉-拉格朗日方程差了一个符号约定。',
      eqRow: '\\frac{d}{dt}\\frac{\\partial\\mathcal{L}}{\\partial\\dot q} = \\frac{\\partial\\mathcal{L}}{\\partial q}',
      tags: ['lagrangian', 'feynman'],
      votes: 38, answers: 4, views: 390, time: '5 天前', solved: true,
      eq: '\\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot q} - \\frac{\\partial \\mathcal{L}}{\\partial q} = 0',
      eqNote: '欧拉-拉格朗日方程的标准形式',
      body: [
        '路径积分里由 $\\delta S = 0$ 得到的驻值条件，和教科书上的欧拉-拉格朗日方程式子长得不太一样，符号约定到底怎么统一的？',
        '另外，如果作用量含显式时间依赖，这个变分过程的边界条件还需要额外讨论吗？'
      ],
      answerList: [
        {
          user: 'chen', accepted: true, time: '4 天前',
          body: '两式只是约定不同：路径积分文献多用 $\\delta\\mathcal{L} = 0$ 把整体变分分别积分后配对，$\\delta\\dot q = \\frac{d}{dt}\\delta q$，配对项移到左边。显式时间依赖不改变变分过程，端点固定时 $\\delta t = 0$。'
        }
      ]
    },
    {
      id: 't9', chan: 'quantum', user: 'bai',
      title: 'Landau 阻尼给出的准粒子寿命，和实验拟合的自能虚部差一个量级',
      excerpt: '按 $1/\\tau = \\frac{2\\pi}{\\hbar}\\sum_{\\mathbf q}|V_{\\mathbf q\\mathbf k}|^2\\delta(\\omega_{\\mathbf k}-\\omega_{\\mathbf k+\\mathbf q})$ 估算，寿命比角分辨率实验直接读出的值长一个量级。',
      eqRow: '\\Gamma_2 = \\frac{1}{2\\hbar}\\sum_{\\mathbf q}|V_{\\mathbf q}|^2\\delta(\\omega-\\omega_{\\mathbf q})',
      tags: ['emergence', 'renorm'],
      votes: 87, answers: 12, views: 1130, time: '7 小时前', solved: true,
      eq: '\\frac{1}{\\tau} = \\frac{2\\pi}{\\hbar}\\sum_{\\mathbf q}|V_{\\mathbf q\\mathbf k}|^2\\,\\delta(\\omega_{\\mathbf k}-\\omega_{\\mathbf k+\\mathbf q})',
      eqNote: 'Landau 弛豫率的黄金规则表达',
      body: [
        '用黄金规则估算自能虚部，得到准粒子寿命 $1/\\tau$。理论上这个量应当同时给出线宽和角分辨率下的弛豫，但实验拟合的虚部比它大一个量级。',
        '可能的原因：强关联区域的动量依赖被平均掉了；或者角分辨谱测到的不是单粒子谱而是某种自能矩阵元。两者在数值上的差别到底来自哪一环？'
      ],
      answerList: [
        {
          user: 'shen', accepted: true, time: '5 小时前',
          body: '关键在 $\\omega_{\\mathbf k}$ 是否取在费米面上。黄金规则里的 $\\delta$ 是在**等能面**上求的，若你用裸频 $\\varepsilon_{\\mathbf k}$ 代替准粒子频率，积分会丢掉相干区，得到的 $\\tau$ 偏长。',
          eq: '\\Gamma = -2\\,\\operatorname{Im}\\,\\Sigma^R(\\omega)\\big|_{\\omega\\to\\varepsilon_F}',
          eqNote: '费米面处的准粒子展宽'
        }
      ]
    },
    {
      id: 't10', chan: 'quantum', user: 'shen',
      title: 'BCS 能隙方程的低温自洽解，为什么必须保留 $\\tanh$ 的完整形式？',
      excerpt: '教科书在求 $T\\to 0$ 极限时直接把 $\\tanh(\\xi/2T)$ 换成 1，于是只能得到 $T_c$ 的指数公式，$\\Delta(T)$ 的低温行为就丢了。',
      eqRow: '\\Delta(T) = 2N(0)\\int_0^{\\hbar\\omega_D}\\frac{\\tanh(\\xi/2T)}{\\sqrt{\\xi^2+\\Delta^2}}\\,d\\xi',
      tags: ['superconduct', 'emergence'],
      votes: 72, answers: 9, views: 890, time: '昨天', solved: true,
      eq: '\\Delta(T) = 2N(0)\\int_0^{\\hbar\\omega_D} \\frac{\\tanh(\\xi/2T)}{\\sqrt{\\xi^2+\\Delta^2}}\\,d\\xi',
      eqNote: '各向同性 BCS 的能隙自洽方程',
      body: [
        '求低温解时若把 $\\tanh(\\xi/2T)$ 直接换成 1，会得到一个只能定 $T_c$ 的方程，$\\Delta(T)$ 的温度依赖完全消失。',
        '但实验上 $\\Delta(T)$ 在低温段确实趋于常数，指数因子 $\\exp(-\\pi\\Delta/k_BT)$ 才是真正的低温修正。到底哪一步可以、哪一步不能近似？'
      ],
      answerList: [
        {
          user: 'chen', accepted: true, time: '20 小时前',
          body: '$\\tanh$ 的展开是分段的：在 $|\\xi|\\ll T$ 区间它不是 1，而这一段的积分正比于 $T$，贡献了低温下 $\\Delta\\propto e^{-\\pi\\Delta/k_BT}$ 的修正。',
          eq: '\\Delta(T) \\approx \\Delta_0\\left[1 - 3.56\\,\\frac{T^2}{\\Delta_0^2}\\ln\\left(\\frac{2e\\gamma\\Delta_0}{k_BT}\\right)\\right]',
          eqNote: 'BCS 能隙的低温展开'
        }
      ]
    },
    {
      id: 't11', chan: 'quantum', user: 'bai',
      title: '阿希伯孙对称性里的"物理内容"，到底在哪一步被用掉？',
      excerpt: '哈密顿量写 $H = \\frac{p^2}{2m} + V(\\mathbf{x})$ 时，$U(N)$ 对称性显然成立；但一到相对论场论就换成了 $\\Phi(U)$ 的形式。',
      eqRow: '\\delta\\phi^a = -i\\theta^a - \\frac{1}{2}\\theta^b\\theta^c f^{abc}_{B}',
      tags: ['gauge', 'noether'],
      votes: 64, answers: 7, views: 760, time: '2 天前', solved: false,
      eq: '\\Phi(U) = U\\, e^{i\\theta^a T_a}\\, U^{-1}',
      eqNote: '规范群的 U(N) 表示',
      body: [
        '非相对论多体系统里，置换对称性表现为 $H$ 对粒子标签的置换不变，因此波函数必须落在 $U(N)$ 群的某个表示里。',
        '到了相对论场论，置换被解释为规范冗余，但这样一来"对称性"变成了不可观测量。这两套叙述的物理内容是否等价？如果等价，玻色凝聚这类真正的对称性破缺在相对论图像里如何被表述？'
      ],
      answerList: [
        {
          user: 'su', accepted: false, time: '1 天前',
          body: '不完全等价。非相对论图像里置换是物理对称性，可以用带电多体态来探测；相对论图像里它被重整为规范冗余，物理对应物是"带电"而非"可分辨"。两者的映射只在非相对论极限成立。'
        }
      ]
    },
    {
      id: 't12', chan: 'quantum', user: 'shen',
      title: '拓扑绝缘体的 $\\mathbb{Z}_2$ 不变量，能不能用一条体边界的电流响应直接读出？',
      excerpt: '时间反演对称性保护边缘态，$\\mathbb{Z}_2 = \\nu_1 \\bmod 2$。但要测体边界，需要四端测量。',
      eqRow: '\\nu_1 = \\frac{1}{4\\pi}\\int_{\\mathrm{BZ}} d^2k\\,\\Omega(\\mathbf k)\\bmod 2',
      tags: ['topology', 'tensor'],
      votes: 58, answers: 6, views: 690, time: '3 天前', solved: true,
      eq: '\\nu_1 = \\frac{1}{4\\pi}\\int_{\\mathrm{BZ}} d^2k\\, \\Omega_z(\\mathbf k) \\pmod 2',
      eqNote: '二维拓扑绝缘体的第一 Chern 数奇偶性',
      body: [
        '边缘态输运能证明存在性，但不能区分平凡绝缘体与非平凡绝缘体 —— 后者也有边缘态，只是位置不同。',
        '要真正读出 $\\mathbb{Z}_2$，需要在体区做霍尔测量。可是霍尔电导同时含自旋轨道耦合的贡献，手性边缘态反而被体区电流掩盖。怎么把信号分离出来？'
      ],
      answerList: [
        {
          user: 'chen', accepted: true, time: '2 天前',
          body: '分离靠的是扫描：把霍尔电压随磁场扫描，边缘态贡献是奇异的尖峰，体区贡献是光滑背景。低温下信噪比足够，尖峰可以直接读出 $\\nu_1$。',
          eq: '\\rho_{xx} \\propto \\sum_{n} \\delta\\left(E - E_n(k)\\right),\\quad \\rho_{xy} \\propto \\sum_{n} \\partial_k E_n(k)',
          eqNote: '边缘态对输运系数的奇异贡献'
        }
      ]
    },
    {
      id: 't13', chan: 'em', user: 'luo',
      title: '霍尔电导的反常量子化，为什么要求纵向电阻同时趋零？',
      excerpt: '整数量子霍尔效应里 $\\sigma_{xy} = \\nu e^2/h$ 是精确值，但实验上 $\\sigma_{xy}$ 达到这个值时 $\\sigma_{xx}$ 几乎为零。',
      eqRow: '\\sigma_{xy} = \\nu\\frac{e^2}{h}',
      tags: ['topology', 'instr'],
      votes: 45, answers: 5, views: 540, time: '4 天前', solved: false,
      eq: '\\sigma_{xy} = \\nu\\frac{e^2}{h},\\qquad \\rho_{xx} = 0',
      eqNote: '整数量子霍尔态的输运系数',
      body: [
        '量子化来自拓扑不变量，本身不要求 $\\rho_{xx}$ 消失。但实验上只要 $\\rho_{xx}$ 非零，$\\sigma_{xy}$ 就会偏离整数值。',
        '物理图像是：局域化的电子态把纵向输运完全切断，剩下的横向输运由朗道能级边缘上的手性通道承担。那么在 $\\rho_{xx}$ 尚未完全消失的过渡区，$\\sigma_{xy}$ 的偏离该用什么机制解释？'
      ],
      answerList: []
    },
    {
      id: 't14', chan: 'quantum', user: 'su',
      title: '弱测量与后选择，能不能真的把不确定性关系压到违反的程度？',
      excerpt: '把测量前后的态做后选择，弱值 $A_w = \\langle\\psi_f|A|\\psi_i\\rangle/\\langle\\psi_f|\\psi_i\\rangle$ 可以远超出谱范围。',
      eqRow: 'A_w = \\frac{\\langle f|A|i\\rangle}{\\langle f|i\\rangle}',
      tags: ['weakmeasure', 'schrodinger'],
      votes: 93, answers: 14, views: 1520, time: '1 小时前', solved: false,
      eq: 'A_w = \\frac{\\langle f|A|i\\rangle}{\\langle f|i\\rangle}',
      eqNote: '弱测量的后选择平均值',
      body: [
        '弱测量本身几乎不扰动系统，配合后选择可以得到任意大的弱值。那么"不确定性关系被违反"的论文到底测了什么？',
        '后选择成功概率随弱值增大而指数衰减，代价被藏在计数里。这种代价能否被写成一个明确的不等式，让它和标准 Robertson 关系并列？'
      ],
      answerList: [
        {
          user: 'bai', accepted: false, time: '40 分钟前',
          body: '写不出来。标准 Robertson 关系约束的是**未后选择**的态的方差；后选择之后你已经在条件子空间里，不确定性算符的投影不再自洽。所有声称"违反"的论文都在偷换这个前提。',
          eq: '\\Delta A\\,\\Delta B \\geq \\frac{1}{2}\\left|\\langle[A,B]\\rangle_{\\mathrm{post}}\\right|',
          eqNote: '后选择子空间上的投影交换子'
        }
      ]
    },
    {
      id: 't15', chan: 'thermo', user: 'he',
      title: '相互作用玻色-爱因斯坦凝聚的临界温度，为什么会向上移动？',
      excerpt: '理想气体的 $T_c$ 由 $n\\lambda_{dB}^3 = 2.612$ 给出。加入相互作用后，平移不变性被破坏，凝聚判据本身就要重新定义。',
      eqRow: 'T_c = T_c^{(0)}\\left(1 + c\\, a n^{1/3}\\right)',
      tags: ['emergence', 'superconduct'],
      votes: 44, answers: 6, views: 520, time: '5 天前', solved: false,
      eq: '\\frac{T_c - T_c^{(0)}}{T_c^{(0)}} \\approx c\\, a\\bar{n}^{1/3}',
      eqNote: '相互作用导致的临界温度移动',
      body: [
        '相互作用破坏平移不变性，凝聚不再等价于"占据一个动量态"，而是玻色-爱因斯坦凝聚态与单粒子态的混合。',
        '实验中确实观测到 $T_c$ 随相互作用增强而移动，方向是升高。理论上这个移动系数是怎么从相互作用参数推出来的？为什么是斥力占主导时移动为正？'
      ],
      answerList: []
    },
    {
      id: 't16', chan: 'quantum', user: 'bai',
      title: 'Wilson 圈套作为序参量，测到的到底是什么物理量？',
      excerpt: '$W(C) = \\operatorname{Tr}\\,\\mathcal{P}\\exp(i\\oint_C A_\\mu dx^\\mu)$ 在中心处期待值非零，被解释为真空的磁通序。',
      eqRow: '\\langle W(C)\\rangle \\neq 0 \\;\\Longleftrightarrow\\; \\text{磁通凝聚}',
      tags: ['gauge', 'topology'],
      votes: 39, answers: 4, views: 430, time: '6 天前', solved: false,
      eq: '\\langle W(C)\\rangle = \\frac{1}{Z}\\int \\mathcal{D}A\\, e^{iS[A]}\\, W(C)',
      eqNote: 'Wilson 圈套的路径积分定义',
      body: [
        '磁通凝聚的证据通常来自 $\\langle W(C)\\rangle$ 在大回路极限下的行为。问题在于：圈套是规范不变量，但回路上的标量乘积 $\\exp(i\\oint A_\\mu dx^\\mu)$ 本身不是。',
        '格点上 Wilson 圈套是真正规范不变的，可是在连续介质里这时的 $\\langle W(C)\\rangle$ 就依赖于切割面的选择。到底哪一种才是可观测的序参量？'
      ],
      answerList: []
    },
    {
      id: 't17', chan: 'quantum', user: 'su',
      title: '被测系统与仪器的纠缠，在什么情况下是"可用的资源"而不是"讨厌的噪声"？',
      excerpt: 'delocalized measurement 的想法是让被测态在空间上先展开，再做一次整体测量，从而把测量分辨率提到极限。',
      eqRow: '\\mathrm{Ent} = S(\\rho_{AB}) - S(\\rho_A) - S(\\rho_B)',
      tags: ['feynman', 'weakmeasure'],
      votes: 61, answers: 8, views: 820, time: '3 天前', solved: false,
      eq: 'S(\\rho_{AB}) = -\\operatorname{Tr}\\rho_{AB}\\ln\\rho_{AB}',
      eqNote: '联合态的冯诺依曼熵',
      body: [
        'delocalized measurement 把测量分成两步：先用光子在远处做一次状态制备，再在近处做一次联合测量。分辨率由光子数而非像差决定。',
        '但整个过程对被测态的扰动并不小。文献里用"辅助量子系统"来解释增益，代价却往往被弱化。到底这个方案什么时候真的优于直接成像？'
      ],
      answerList: []
    },
    {
      id: 't18', chan: 'quantum', user: 'bai',
      title: '量子真空的非平庸性，除了 Casimir 效应还有哪些可观测后果？',
      excerpt: '真空的涨落会修正电磁传播子的传播子，产生 Lamb 位移、原子能级修正、辐射的真空极化。',
      eqRow: '\\alpha = \\frac{e^2}{4\\pi\\varepsilon_0\\hbar c} \\approx \\frac{1}{137}',
      tags: ['renorm', 'gauge'],
      votes: 50, answers: 5, views: 600, time: '4 天前', solved: false,
      eq: '\\Delta E = \\frac{3}{4}\\alpha^4 m c^2 \\,\\ln\\left(\\frac{m c^2}{\\hbar\\omega_p}\\right)',
      eqNote: '电子自能的精细结构修正',
      body: [
        '真空极化可以看作真空充当了介电常数为 $\\varepsilon_0$ 的"背景介质"，但这个介质是被量子涨落激发出来的，不是外加的。',
        'Casimir 效应最直观，但它的解释仍有争议（真空能 vs 涨落力 vs 耗散力）。有没有一个实验能在不依赖具体解释的前提下，确认真空的涨落确实参与了物质相互作用？'
      ],
      answerList: []
    },
    {
      id: 't19', chan: 'quantum', user: 'chen',
      title: '相干态的 Glauber-Sudarshan $P$ 函数为什么一定不正？',
      excerpt: '$P(\\alpha)$ 是 $\\hat\\rho$ 的傅里叶变换。若 $P$ 是正概率密度，相干态的集合就应该是一个经典相空间。',
      eqRow: 'P(\\alpha) = \\frac{1}{\\pi^2}\\int d^2\\lambda\\, e^{-|\\alpha|^2+|\\alpha|^2 + \\alpha\\lambda^* - \\alpha^*\\lambda} e^{-\\lambda\\lambda^*}\\mathrm{Tr}\\hat\\rho',
      tags: ['schrodinger', 'noether'],
      votes: 35, answers: 4, views: 380, time: '7 天前', solved: false,
      eq: 'P(\\alpha) = \\frac{1}{\\pi^2}\\int d^2\\lambda\\, e^{-\\lambda\\lambda^*} e^{\\alpha\\lambda^* - \\alpha^*\\lambda}\\mathrm{Tr}\\rho\\, e^{-\\lambda^*\\lambda}',
      eqNote: 'P 函数的定义式',
      body: [
        '相干态的 $P$ 函数是 $\\delta^2(\\alpha - \\alpha_0)$，这是正概率密度。按理说相干态最"经典"，为什么 $P$ 反而是奇异函数而不是概率密度？',
        '换个问法：为什么单光子态的 $P$ 一定带负值区域，而热态只在高温区才近似为正？'
      ],
      answerList: []
    },
    {
      id: 't20', chan: 'quantum', user: 'lin',
      title: '路径积分在非平稳作用量附近，为什么经典鞍点给出的是虚数结果？',
      excerpt: '当作用量对应的经典路径是极值而非极小值，鞍点积分给出 $e^{iS_{cl}}$，量子涨落是虚的。',
      eqRow: '\\langle f|i\\hat{U}(t_f,t_i)|i\\rangle = \\int \\mathcal{D}q\\, e^{iS[q]/\\hbar}',
      tags: ['feynman', 'lagrangian'],
      votes: 46, answers: 5, views: 560, time: '2 天前', solved: false,
      eq: '\\langle f|e^{-i\\hat{H}t/\\hbar}|i\\rangle = \\int \\mathcal{D}q\\, e^{\\frac{i}{\\hbar}S[q]}',
      eqNote: '传播子的路径积分表示',
      body: [
        '隧穿、虚时间演化、WKB 预因子都来自同一件事：经典路径不是作用量的全局极小值，涨落方向上的积分是振荡的。',
        '如果鞍点是鞍点（既有正曲率也有负曲率方向），积分在数学上并没有确定的收敛方向。WKB 的复相位是人为选出来的，还是唯一自洽的选择？'
      ],
      answerList: []
    },
    {
      id: 't21', chan: 'optics', user: 'qi',
      title: '衍射极限与阿贝判据，在超分辨显微里是被绕开还是被违反？',
      excerpt: '阿贝判据给出 $d \\approx \\lambda/(2n\\sin\\theta)$。但用受激发射或荧光饱和的显微，分辨率确实做到了亚波长。',
      eqRow: 'd = \\frac{\\lambda}{2\\,n\\sin\\theta}',
      tags: ['scattering', 'instr'],
      votes: 55, answers: 6, views: 670, time: '2 天前', solved: true,
      eq: 'd_{\\mathrm{Abbe}} = \\frac{\\lambda}{2\\,n\\sin\\theta}',
      eqNote: '阿贝衍射极限',
      body: [
        '常规显微的分辨率来自衍射极限：两个点源的像斑一旦重叠就无法分开。',
        '但 STED、饱和结构光显微都能做到亚波长。它们的共同点是主动把不需要的空间频率"清零"。这算是绕开了衍射极限，还是把极限问题换成了别的问题（比如标记效率、耗散代价）？'
      ],
      answerList: [
        {
          user: 'tan', accepted: true, time: '1 天前',
          body: '严格说没有违反，转移了代价。衍射极限约束的是**给定光子数**下能分辨的结构尺寸；超分辨技术用耗散（受激辐射、饱和）把不需要的频率成分清掉，光子预算因此改变。真正的极限是"每分辨单元需要多少光子"。',
          eq: 'd \\sim \\frac{\\lambda}{2\\,n\\sqrt{1 + I/I_s}}',
          eqNote: '饱和光强下的有效分辨率'
        }
      ]
    },
    {
      id: 't22', chan: 'quantum', user: 'shen',
      title: '紧束缚近似的能带，为什么在布里渊区边界会退化？',
      excerpt: '一维单原子链给出 $E(k) = \\varepsilon_0 - 2t\\cos ka$，在 $k = \\pm \\pi/a$ 处能带折叠、能级简并。',
      eqRow: 'E(k) = \\varepsilon_0 - 2t\\cos(ka)',
      tags: ['tensor', 'emergence'],
      votes: 33, answers: 3, views: 310, time: '8 天前', solved: false,
      eq: 'E(k) = \\varepsilon_0 - 2t\\cos(ka)',
      eqNote: '一维紧束缚能带',
      body: [
        '周期势把动量量子化到第一布里渊区，于是 $k$ 与 $k + 2\\pi/a$ 不可区分，能带在区边界折叠。',
        '但一维单原子链没有轨道简并，凭什么在区边界出现简并？二轨道模型（Hückel 模型）里区边界的分裂能怎么和能带折叠对上？'
      ],
      answerList: []
    },
    {
      id: 't23', chan: 'thermo', user: 'gu',
      title: 'Wilson-Fisher 不动点与临界标度指数，实验上怎么独立标定 $\\nu$？',
      excerpt: 'RG 给出 $\\nu = 1/\\epsilon$ 在一阶近似下，但实验值需要六位有效数字。',
      eqRow: '\\xi \\sim |t|^{-\\nu},\\qquad t = \\frac{T-T_c}{T_c}',
      tags: ['emergence', 'renorm'],
      votes: 42, answers: 5, views: 500, time: '3 天前', solved: false,
      eq: '\\xi(t) = \\xi_0^{\\pm}|t|^{-\\nu}\\left[1 + a^{\\pm}|t|^{\\omega\\nu} + \\cdots\\right]',
      eqNote: '关联长度的标度形式与修正项',
      body: [
        '临界指数理论上由不动点流决定，实验上则从关联长度或比热的发散行为提取。问题在于有限尺寸效应会把外推引向平均场指数。',
        '尺度修正项里的 $\\omega\\nu$ 是判别 RG 收敛速度的关键参数。有限尺寸标度（finite-size scaling）怎么和它一起作为约束求解？'
      ],
      answerList: []
    },
    {
      id: 't24', chan: 'quantum', user: 'chen',
      title: '朗道量子液体的奇点，为什么只出现在费米面上而不是整个动量空间？',
      excerpt: '费米液体理论把所有热力学量写成占据数对动量的积分，积分的奇异性完全由 $\\delta(\\varepsilon_k - \\mu)$ 提供。',
      eqRow: '\\partial n /\\partial \\mu = \\int d^3k\\, \\delta(\\varepsilon_k - \\mu)',
      tags: ['emergence', 'scattering'],
      votes: 37, answers: 4, views: 420, time: '9 天前', solved: false,
      eq: 'C_V = \\frac{\\pi^2}{2}N k_B^2 \\frac{T}{T_F}',
      eqNote: '线性比热的费米液体结果',
      body: [
        '如果 $n$ 只依赖局域密度，那响应函数就应该是 $k_F/(\\pi^2\\hbar^2v_F)$ 这样的常数。Landau 参数 $F_0^s$ 怎么修正这个值？',
        '而且，为什么激发谱的奇异性只集中在费米面附近，深度激发（$|\\varepsilon_k - \\mu| \\gg T$）的部分反而很平滑？'
      ],
      answerList: []
    },
    {
      id: 't25', chan: 'em', user: 'luo',
      title: 'Casimir 效应的符号，为什么由真空零点能的正则化方式决定不了？',
      excerpt: '两种正则化给出相同或相反的符号，这说明 Casimir 力的来源不能简单归结为"真空能差"。',
      eqRow: '\\frac{F}{A} = -\\frac{\\pi^2\\hbar c}{240\\,a^4}',
      tags: ['renorm', 'instr'],
      votes: 48, answers: 6, views: 580, time: '5 天前', solved: false,
      eq: '\\frac{E}{A} = -\\frac{\\pi^2\\hbar c}{720\\,a^3}',
      eqNote: '平行板之间的 Casimir 能量密度',
      body: [
        '如果把 Casimir 效应解释为"真空能随边界条件变化"，那正则化方式必须与边界无关，但形式上不同的两种方案给出相反符号。',
        '现在更稳妥的做法是用涨落-耗散定理直接算力的响应，这一步绕开了真空能的说法。这个理解和你此前关于耗散力的看法一致吗？'
      ],
      answerList: []
    },
    {
      id: 't26', chan: 'thermo', user: 'gu',
      title: 'Bogoliubov 声速公式里的相互作用修正，为什么不能简单代入理想气体结果？',
      excerpt: '$c^2 = \\frac{n}{m}\\frac{\\partial P}{\\partial n}$ 给出 $c^2 = \\frac{gn}{m}$，但这个线性关系只在弱相互作用区成立。',
      eqRow: 'c^2 = \\frac{1}{m}\\frac{\\partial\\mu}{\\partial n} = \\frac{gn}{m}\\left[1 + \\frac{32}{3\\sqrt\\pi}(na^3)^{1/2}\\right]',
      tags: ['superconduct', 'emergence'],
      votes: 31, answers: 3, views: 290, time: '11 天前', solved: false,
      eq: 'c^2 = \\frac{1}{m}\\frac{\\partial\\mu}{\\partial n}',
      eqNote: 'Bogoliubov 声速的通项关系',
      body: [
        '弱相互作用时 $c^2 = gn/m$；强相互作用区（比如液态氦）实测的声速明显更高。LHY 修正给的是 $1 + O(\\sqrt{na^3})$，但强耦合区的偏离更大。',
        '如果换一个出发点，从零温的 Bogoliubov 理论出发取零温极限，会不会得到一个与 LHY 完全不同的图景？'
      ],
      answerList: []
    }
  ];

  /* ------------------------------------------------------------ 物理概念池 */

  const CONCEPTS = [
    { n: '群速度', chan: 'optics', tag: 'scattering', eq: 'v_g = \\frac{d\\omega}{dk}', note: '相速度与群速度的分离' },
    { n: '多普勒效应', chan: 'optics', tag: 'scattering', eq: '\\Delta\\omega = \\omega_0\\frac{v}{c}', note: '运动源引起的频移' },
    { n: '量子隧穿', chan: 'quantum', tag: 'scattering', eq: 'T \\approx e^{-2\\kappa a}', note: '势垒穿透的指数律' },
    { n: '能带结构', chan: 'quantum', tag: 'tensor', eq: 'E(k) = \\varepsilon_0 - 2t\\cos(ka)', note: '周期势中的色散' },
    { n: '约化密度矩阵', chan: 'quantum', tag: 'schrodinger', eq: '\\rho_A = \\operatorname{Tr}_B|\\Psi\\rangle\\langle\\Psi|', note: '部分迹与混态描述' },
    { n: '相干时间', chan: 'quantum', tag: 'instr', eq: '\\Gamma_2 = \\frac{1}{T_2}', note: '退相干与谱宽' },
    { n: '布洛赫球', chan: 'quantum', tag: 'schrodinger', eq: '|\\psi\\rangle = \\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\phi}\\sin\\frac{\\theta}{2}|1\\rangle', note: '二能级系统的态参数化' },
    { n: '霍尔效应', chan: 'em', tag: 'instr', eq: 'R_H = \\frac{V_B}{I}', note: '横向电阻与载流子符号' },
    { n: '约瑟夫森结', chan: 'quantum', tag: 'superconduct', eq: 'I_c = I_0\\sin\\varphi', note: '相位驱动的超流' },
    { n: '自旋轨道耦合', chan: 'quantum', tag: 'tensor', eq: 'H_{SO} = \\lambda\\, \\mathbf{L}\\cdot\\mathbf{S}', note: '相对论修正与能带劈裂' },
    { n: '超精细结构', chan: 'quantum', tag: 'tensor', eq: '\\Delta E = A\\,\\mathbf{I}\\cdot\\mathbf{J}', note: '电子与核的自旋耦合' },
    { n: '塞曼分裂', chan: 'em', tag: 'scattering', eq: '\\Delta E = g\\mu_B m B', note: '外磁场下的能级劈裂' },
    { n: '玻尔兹曼因子', chan: 'thermo', tag: 'emergence', eq: 'e^{-\\beta E}', note: '统计权重与激活' },
    { n: '麦克斯韦分布', chan: 'thermo', tag: 'emergence', eq: 'f(v) \\propto v^2 e^{-mv^2/2k_BT}', note: '平衡态速率分布' },
    { n: '玻色爱因斯坦凝聚', chan: 'thermo', tag: 'superconduct', eq: 'n\\lambda_{dB}^3 > 2.612', note: '临界占据数判据' },
    { n: '临界标度', chan: 'thermo', tag: 'emergence', eq: '\\xi \\sim |t|^{-\\nu}', note: '关联长度的发散' },
    { n: '重整化群流动', chan: 'thermo', tag: 'renorm', eq: 't \\to b^{1-y}t', note: '标度场的不动点' },
    { n: '维里定理', chan: 'thermo', tag: 'emergence', eq: '2\\langle T\\rangle = \\langle V\\rangle', note: '平均动能与势能' },
    { n: '昂内夫温度', chan: 'thermo', tag: 'instr', eq: '\\theta_A = \\frac{k_B T_A}{\\hbar}', note: '交叉温度与量子涨落' },
    { n: '真空极化', chan: 'em', tag: 'renorm', eq: '\\alpha = \\frac{e^2}{4\\pi\\varepsilon_0\\hbar c}', note: '电荷的真空屏蔽' },
    { n: '光电效应', chan: 'optics', tag: 'scattering', eq: 'K_{max} = h\\nu - \\phi', note: '光子的能量传递' },
    { n: '康普顿散射', chan: 'optics', tag: 'scattering', eq: '\\Delta\\lambda = \\frac{h}{m_ec}', note: '光子在自由电子上的反冲' },
    { n: '普朗克分布', chan: 'thermo', tag: 'emergence', eq: 'u(\\nu,T) = \\frac{8\\pi h\\nu^3}{c^3}\\frac{1}{e^{h\\nu/k_BT}-1}', note: '黑体辐射的谱密度' },
    { n: '拉曼散射', chan: 'optics', tag: 'scattering', eq: '\\Delta\\tilde\\nu = \\tilde\\nu_0 - \\tilde\\nu', note: '非弹性散射的频移' },
    { n: '荧光与磷光', chan: 'optics', tag: 'instr', eq: '\\tau = \\frac{1}{k_f + k_{nr}}', note: '辐射与非辐射速率竞争' },
    { n: '表面等离子体激元', chan: 'optics', tag: 'scattering', eq: 'k_{sp} = k_0\\sqrt{\\frac{\\varepsilon_m\\varepsilon_d}{\\varepsilon_m+\\varepsilon_d}}', note: '金属界面的倏逝模式' },
    { n: '光纤损耗', chan: 'optics', tag: 'instr', eq: '\\alpha \\sim \\alpha_0 e^{-\\lambda^2}', note: '瑞利散射主导的损耗谱' },
    { n: '马吕斯定律', chan: 'optics', tag: 'scattering', eq: 'I = I_0\\cos^2\\theta', note: '偏振片的角度响应' },
    { n: '全反射与光波导', chan: 'optics', tag: 'scattering', eq: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2', note: '折射定律与导模' },
    { n: '电磁波导模式', chan: 'em', tag: 'scattering', eq: 'k_z^2 = k_0^2 - \\left(\\frac{m\\pi}{a}\\right)^2', note: '本征模式与截止' },
    { n: '泊松括号', chan: 'rel', tag: 'noether', eq: '\\{A,B\\} = \\frac{\\partial A}{\\partial q}\\frac{\\partial B}{\\partial p} - \\frac{\\partial A}{\\partial p}\\frac{\\partial B}{\\partial q}', note: '辛结构与规范变换' },
    { n: '规范变换', chan: 'quantum', tag: 'gauge', eq: '\\hat{A} \\to U\\hat{A}U^{-1}', note: '物理量的规范不变性' },
    { n: '时空间隔', chan: 'rel', tag: 'tensor', eq: 'ds^2 = -c^2dt^2 + dx^2', note: '因果结构与光锥' },
    { n: '史瓦西半径', chan: 'rel', tag: 'tensor', eq: 'r_s = \\frac{2GM}{c^2}', note: '视界的位置' },
    { n: '引力波四极矩', chan: 'rel', tag: 'scattering', eq: 'h_{ij} = \\frac{2G}{c^4R}\\ddot{Q}_{ij}', note: '辐射功率的源' },
    { n: '测地进动', chan: 'rel', tag: 'tensor', eq: '\\Omega_p = \\frac{3GM}{2c^2r^3}\\mathbf{L}', note: '自旋与轨道的耦合' },
    { n: '边界层', chan: 'exp', tag: 'instr', eq: 'y^+ = \\frac{u\\tau}{\\nu}', note: '壁面处的速度梯度' },
    { n: '不确定度传递', chan: 'exp', tag: 'instr', eq: '(\\Delta R)^2 = \\sum_i\\left(\\frac{\\partial R}{\\partial x_i}\\right)^2(\\Delta x_i)^2', note: '间接测量的误差合成' },
    { n: '弛豫时间', chan: 'thermo', tag: 'emergence', eq: '\\tau \\sim \\frac{L^2}{D}', note: '扩散控制的特征时间' },
    { n: '随机游走', chan: 'thermo', tag: 'emergence', eq: '\\langle x^2\\rangle = 2Dt', note: '均方位移与扩散' },
    { n: '朗缪尔探针', chan: 'exp', tag: 'plasma', eq: 'I_s \\propto \\exp\\left(-\\frac{eV}{k_BT}\\right)', note: '等离子体温度诊断' },
    { n: '德拜屏蔽长度', chan: 'em', tag: 'plasma', eq: '\\lambda_D = \\sqrt{\\frac{\\varepsilon_0 k_BT}{ne^2}}', note: '静电屏蔽的尺度' },
    { n: '磁压平衡', chan: 'astro', tag: 'plasma', eq: '\\frac{B^2}{2\\mu_0} = p', note: '磁流体静力平衡' }
  ];

  /* ------------------------------------------------------------ 通用回答池 */

  const ANSWER_POOL = [
    {
      tags: ['quantum', 'schrodinger'],
      body: '关键在于用密度矩阵而不是纯态描述中间过程。混合之后必须显式算出非对角项，把它们算掉就等于默认了纯态假设。',
      eq: '\\rho = \\sum_i p_i|\\psi_i\\rangle\\langle\\psi_i|',
      eqNote: '混合态的一般表达'
    },
    {
      tags: ['emergence', 'thermo'],
      body: '两者的差别不在结果而在可观测量：一个是速率，一个是累积量。混用会得到自相矛盾的结论，实验上倒是可以据此区分。',
      eq: '\\dot S = \\frac{\\dot Q}{T}',
      eqNote: '熵产生率与热流'
    },
    {
      tags: ['gauge', 'quantum'],
      body: '我倾向于认为这是坐标选择的结果。变换到另一个规范里，形式上的差异会消失，物理量当然不变。',
      eq: '\\hat{A} \\to U\\hat{A}U^{-1},\\quad \\hat{\\psi} \\to U\\hat{\\psi}',
      eqNote: '规范变换下的算符'
    },
    {
      tags: ['scattering', 'optics'],
      body: '如果把系统与环境一起考虑，涨落项会吸收掉表面上的不一致，剩下的量在两种描述里数值相同。'
    },
    {
      tags: ['instr', 'exp'],
      body: '数值上我做过对照：绝热近似在高频段失效，但在低频段两者吻合到千分之一。误差主要来自边界条件的处理。',
      eq: '\\varepsilon(\\omega) \\approx \\frac{\\sigma}{\\varepsilon_0 i\\omega}',
      eqNote: '低频段的等效介电常数'
    },
    {
      tags: ['renorm', 'emergence'],
      body: '先检查边界条件。多数推导上的矛盾来自把某个只在特定极限成立的近似当成了处处成立。'
    },
    {
      tags: ['feynman', 'lagrangian'],
      body: '这个问题应该用鞍点方法重新表述，经典路径只是它的低阶近似。展开到二阶就已经能看到修正的来源。',
      eq: 'S[q] = S[q_{cl}] + \\frac{1}{2}\\int dt\\, \\eta^{a}\\eta^{b}\\frac{\\delta^2 S}{\\delta q^a \\delta q^b}',
      eqNote: '经典路径附近的二阶涨落'
    },
    {
      tags: ['tensor', 'rel'],
      body: '严格说这两条陈述不矛盾，因为它们约束的是不同的对象。度规决定几何，等效原理决定测量的局域性。',
      eq: '\\Gamma^{\\mu}_{\\nu\\rho} = \\frac{1}{2}g^{\\mu\\lambda}\\left(\\partial_\\nu g_{\\lambda\\rho} + \\partial_\\rho g_{\\lambda\\nu} - \\partial_\\lambda g_{\\nu\\rho}\\right)',
      eqNote: '联络的Christoffel形式'
    },
    {
      tags: ['instr', 'plasma'],
      body: '实验上可以直接测：改变温度扫描，看转变点是否连续。我这边测到的转变是连续的，与上述预期一致。'
    },
    {
      tags: ['topology', 'gauge'],
      body: '我核对了两种做法：一种在固定边界上求和，另一种允许边界涨落。前者对边界条件敏感，后者不然 —— 差别就在这里。'
    },
    {
      tags: ['superconduct', 'quantum'],
      body: '弱耦合区的结论不能外推到强耦合区。耦合常数本身是态依赖的，展开系数也需要重新匹配。',
      eq: '\\Delta(T) = \\Delta_0\\left[1 - \\pi\\left(\\frac{T}{T_c}\\right)^2 + \\cdots\\right]',
      eqNote: '能隙的低温展开'
    },
    {
      tags: ['optics', 'scattering'],
      body: '傅里叶变换后的表述更清楚：分辨率问题等价于传递函数在高频段被截断。'
    },
    {
      tags: ['astro', 'rel'],
      body: '这个标度关系在多个源上验证过，但前提是源处于"短波近似"成立的范围之外，源的质量函数需要先修正。',
      eq: '\\rho_{\\mathrm{cut}} \\propto f^{2/3}',
      eqNote: '应变密度的低频标度'
    },
    {
      tags: ['noether', 'quantum'],
      body: '守恒律来自对称性，但反过来用守恒律反推对称性在退化情形下不成立，模态计数时容易出错。'
    }
  ];

  /* ------------------------------------------------------------ 生成器 */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FORMS = [
    (a, b) => `${a.n} 与 ${b.n} 的等价性在什么条件下失效？`,
    (a, b) => `把 ${b.n} 写成 ${a.n} 的极限，会丢掉哪一项？`,
    (a, b) => `${a.n} 与 ${b.n} 描述的是同一个自由度吗？`,
    (a, b) => `用 ${a.n} 处理 ${b.n} 时，哪一步需要额外假设？`,
    (a, b) => `${a.n} 与 ${b.n} 的标度行为为什么不同？`,
    (a, b) => `${a.n} 的结果能否绕过 ${b.n} 直接得到？`,
    (a, b) => `${b.n} 中 ${a.n} 的贡献被哪个无量纲参数压低了？`,
    (a, b) => `${a.n} 与 ${b.n} 的实验判据差在哪里？`
  ];

  const OPENERS = [
    (a, b) => `问题出在 ${a.n} 与 ${b.n} 的交界处。两者在常用近似下给出相同的数值，但推导路径完全不同。`,
    (a, b) => `我试着用 ${a.n} 的定义式直接代入 ${b.n}，量纲对不上，怀疑是某个前提被默认了。`,
    (a, b) => `文献里这两种说法经常混用。想请教它们在什么条件下可以互换，差别体现在哪个可观测量上。`,
    (a, b) => `实验上我按 ${a.n} 处理了一组 ${b.n} 的数据，残差有系统性的趋势，不是随机涨落。`
  ];

  const CLOSERS = [
    (a, b) => `整理一下我的疑问：${a.n} 里的哪些结论可以直接搬到 ${b.n}，哪些必须重新来过。`,
    (a, b) => `如果有推导上更干净的路线，优先想知道那一条。`,
    (a, b) => `另外想请教，这两个描述在极限情况下会不会给出同样的可观测量。`
  ];

  const TIMES = ['1 小时前', '3 小时前', '5 小时前', '7 小时前', '9 小时前', '昨天', '2 天前', '3 天前', '4 天前', '5 天前', '6 天前', '一周前'];

  function buildGenerated(count) {
    const rnd = mulberry32(20261024);
    const out = [];
    const n = CONCEPTS.length;
    let idx = 0;

    for (let k = 0; k < count; k += 1) {
      const i = k % n;
      const j = (i + 3 + (k % (n - 3))) % n;
      const A = CONCEPTS[i];
      const B = CONCEPTS[j];
      const form = FORMS[(i + k) % FORMS.length];
      const open = OPENERS[(i * 3 + k) % OPENERS.length];
      const close = CLOSERS[(i + k * 2) % CLOSERS.length];

      /* 回答：从池中挑标签命中的一条 */
      const hits = ANSWER_POOL.filter((a) => a.tags.includes(A.tag) || a.tags.includes(B.tag));
      const answer = hits.length ? hits[Math.floor(rnd() * hits.length)] : null;
      const answers = answer ? [answer] : [];
      const solved = !!answer && rnd() > 0.45;

      const chan = A.chan;
      const user = USER_KEYS[Math.floor(rnd() * USER_KEYS.length)];
      const votes = 6 + Math.floor(rnd() * 96);
      const views = 60 + Math.floor(rnd() * 1800);
      const other = A.tag === B.tag ? B.tag : (rnd() > 0.5 ? B.tag : A.tag);

      out.push({
        id: 'g' + (idx += 1),
        chan,
        user,
        title: form(A, B),
        excerpt: open(A, B),
        eqRow: A.eq,
        tags: [A.tag, other],
        votes,
        answers: answers.length,
        views,
        time: TIMES[Math.floor(rnd() * TIMES.length)],
        solved,
        eq: A.eq,
        eqNote: A.note,
        body: [open(A, B), close(A, B)],
        answerList: answers.map((a) => ({
          user: USER_KEYS[Math.floor(rnd() * USER_KEYS.length)],
          accepted: solved,
          time: '1 小时前',
          body: a.body,
          eq: a.eq,
          eqNote: a.eqNote
        }))
      });
    }
    return out;
  }

  const GENERATED_COUNT = 84;

  window.QJ = {
    channels: CHANNELS,
    tags: TAGS,
    users: USERS,
    threads: HAND_THREADS.concat(buildGenerated(GENERATED_COUNT)),
    generatedCount: GENERATED_COUNT,
    total: HAND_THREADS.length + GENERATED_COUNT
  };
})();
