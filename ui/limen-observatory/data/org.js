/* 异物 · 异常观测室 — 组织与管理人员
 * 挂载到 window.LIMEN.org。
 */
window.LIMEN = window.LIMEN || {};
window.LIMEN.org = {
  name: "异常编目总局 · 第四观测室",
  short: "LIMEN-04",
  founded: "1971",
  motto: "先观察，再下结论。",
  director: { name: "顾衡", title: "观测司司长", clearance: "Ω", note: "自 1983 年执掌本室，极少现身现场。" },
  departments: [
    { code: "观测司", duty: "日常观测、记录与异常初判" },
    { code: "封存委员会", duty: "异物分级、封存与解封裁定" },
    { code: "声学部", duty: "声学签名采集与残响分析" },
    { code: "收容工程处", duty: "收容单元设计与定期维护" },
    { code: "内务审查", duty: "人员状态与接触后随访" },
  ],
  personnel: [
    { name: "观察员 M", role: "现场观测", clearance: "L2", note: "本室当前主要记录人。" },
    { name: "观察员 K", role: "材料与微距采样", clearance: "L2" },
    { name: "技术员 周", role: "声学设备维护", clearance: "L3" },
    { name: "审核员 林", role: "记录复核", clearance: "L3" },
    { name: "医师 沈", role: "接触后随访", clearance: "L2" },
  ],
  clearance: [
    { level: "L1", desc: "公共区域与档案摘要" },
    { level: "L2", desc: "当前在册异物观测与采样" },
    { level: "L3", desc: "封存裁定与声学原始数据" },
    { level: "Ω", desc: "总局级 · 仅司长" },
  ],
  protocols: [
    "任何异物不得带离其收容单元。",
    "接触后 72 小时内须接受内务审查随访。",
    "记录中出现「未来日期」字样，立即上报封存委员会。",
    "编号含 Y0 亚种的星外物，禁止密封于金属容器。",
  ],
};
