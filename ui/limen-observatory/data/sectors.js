/* 异物 · 异常观测室 — 编号体系
 * 代号格式：[扇区]-[亚种]-[序号]
 * 挂载到 window.LIMEN.sectors（map + decode）。
 */
window.LIMEN = window.LIMEN || {};
window.LIMEN.sectors = (function () {
  const map = {
    LJ: "临界交界", // 现实缝隙处拾得
    XT: "星外回填", // 天降物，非本地球源
    YH: "渊海",     // 自深水 / 地下涌出
    NB: "内禀",     // 室内本就存在，无外来记录
    WX: "无线",     // 借信号 / 声波捕获
    SK: "私库",     // 由私人收藏移交
  };
  function decode(id) {
    const parts = String(id).split("-");
    const sector = map[parts[0]] || "未知扇区";
    let sub = "", seq = "";
    for (let i = 1; i < parts.length; i++) {
      if (/^\d+$/.test(parts[i])) seq = parts[i];
      else sub = parts[i];
    }
    return `扇区 ${sector}${sub ? " · 亚种 " + sub : ""}${seq ? " · 登记 " + seq : ""}`;
  }
  return { map, decode };
})();
