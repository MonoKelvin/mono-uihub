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
  /* 生图素材（相对路径） */
  media: {
    details: "assets/matrix_details.png",
    seal: "assets/decor_seal.png",
    icons: "assets/decor_icons.png",
  },
  /* 风险分级（由低到高） */
  riskLevels: ["安全", "警戒", "危险", "绝密"],
  /* 顶部条 / 文案 */
  ui: {
    title: "异物 · 异常观测室",
    room: "室 04",
    operator: "观察员 M",
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
  /* 装饰图标表裁格（4×4，背景定位用） */
  iconGrid: { cols: 4, rows: 4 },
};
