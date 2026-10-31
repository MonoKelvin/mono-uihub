/* 异物 · 异常观测室 — 全局配置
 * 所有可调参数、UI 文案、素材引用、风险/分类枚举集中于此。
 * 挂载到 window.LIMEN.config。
 */
window.LIMEN = window.LIMEN || {};
window.LIMEN.config = {
  /* 默认设置（可被 localStorage 覆盖） */
  settings: {
    gaze: true,        // 目光跟随
    motion: false,     // 减少动态
    sound: true,       // 音效反馈
    volume: 0.7,       // 音效音量 0–1
    grid: false,       // 舞台辅助网格
    scanDuration: 2.6, // 探测动画时长（秒）
  },
  /* 生图素材（相对路径）
   * 四张九宫格原图已拆为独立瓦片并删除源图，此处只登记瓦片前缀与数量：
   *   detail_00..08   3×3 表面采样微距
   *   icon_00..08     九枚语义徽记（透明底，黄铜线）
   *   plate_00..08    装饰边框图版（已按边框居中重裁）
   *   specimen_00..08 抠底标本（透明底）
   */
  media: {
    seal: "assets/decor_seal.webp",
    particle: "assets/decor_particle.webp",
    detail: "assets/detail_",
    icon: "assets/icon_",
    plate: "assets/plate_",
    specimen: "assets/specimen_",
    counts: { detail: 9, icon: 9, plate: 9, specimen: 9 },
  },
  /* 分类 → 徽记索引（0 眼 / 1 断环 / 2 螺旋 / 3 波形 / 4 阶梯 / 5 手 / 6 晶体 / 7 水滴焰 / 8 叠门） */
  iconMap: {
    知觉干涉: 0, 反射投射: 0, 反射异常: 0, 投影编织: 0,
    空间褶皱: 1, 通道异常: 1, 拓扑倒置: 1, 拓扑错位: 1,
    记忆环: 2, 时间剥离: 2,
    声学残响: 3, 声学深源: 3, 声学倒置: 3, 信号残响: 3, 信号真空: 3, 共振石语: 3,
    空间递归: 4,
    接触污染: 5, 印痕抹除: 5,
    记忆结晶: 6, 天体残片: 6,
    热力学悖论: 7, 潮汐残响: 7, 液体悖论: 7, 热学负常: 7,
    容积异常: 8, 自持光: 8,
  },
  /* 风险分级（由低到高） */
  riskLevels: ["安全", "警戒", "危险", "绝密"],
  /* 顶部条 / 文案（全部由 applyChrome 填充，禁止在 HTML 里写死第二份） */
  ui: {
    title: "异物 · 异常观测室",
    org: "观测司",
    site: "第九封存处",
    room: "室 04",
    sector: "B 区 · 地下三层",
    code: "LN-04 / 2026",
    operator: "观察员 M",
    operatorName: "观察员 M",
    operatorOrg: "封存委员会 · 二级",
    operatorState: "在岗",
    statusIdle: "观测室稳定",
    statusBusy: "探测进行中",
  },
  /* 分类提示 */
  classificationHint: "异常类型由观测司初判，最终归类以封存委员会裁定为准。",
  /* 探测结果文案池（扫描后随机取一条记入记录） */
  scanLines: [
    { type: "observation", text: "扫描确认：表面纹理与上次记录一致，未见新增形变。" },
    { type: "observation", text: "探测到微弱热信号，分布均匀，无集中源。" },
    { type: "observation", text: "读数与上周同期一致，偏差在允许范围内。" },
    { type: "observation", text: "收容单元封条完好，未见外力痕迹。" },
    { type: "observation", text: "表面采样比对通过，材质未发生变化。" },
    { type: "anomaly", text: "扫描发现：内部出现一处未登记的空腔结构。" },
    { type: "anomaly", text: "边缘检测到相位偏移，建议缩短下次观测间隔。" },
    { type: "anomaly", text: "记录中出现一段无法归因的低频，来源不在本室。" },
    { type: "anomaly", text: "重复计数：本应出现三次的信号出现了四次。" },
    { type: "anomaly", text: "扫描返回了一个比上次多出来的面，已记入异常。" },
  ],
};
