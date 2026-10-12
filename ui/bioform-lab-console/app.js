/* UBR-07 观测总览 —— 原型交互（本地假数据，最简 JS） */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ============ 假数据 ============ */

const FLOW = [
  { ico: "microscope", name: "体表电位复测", sub: "UBX-1147 · 电极 A1/A2", state: "run", pct: 64 },
  { ico: "droplet", name: "黏液样本酶活分析", sub: "SMP-0912 · 需低温上机", state: "wait" },
  { ico: "dna-2", name: "线粒体基因组比对", sub: "SMP-0907 · 与未知库比对", state: "hold", note: "等待算力队列" },
  { ico: "temperature", name: "耐低温梯度试验", sub: "UBX-1147 · -20 至 -80°C", state: "done" },
];

const KNOW = {
  known: [
    { name: "夜行性，避强光", desc: "满照度下活动量下降 92%，红光波段反应最小。", conf: 96 },
    { name: "体表电位随情绪波动", desc: "受惊时 A 区电位升至 30mV 以上，回落需约 40 分钟。", conf: 91 },
    { name: "黏液具弱酸性", desc: "pH 5.2 至 5.8，接触氧化锌试纸显浅灰色。", conf: 88 },
    { name: "无脊椎，外骨骼缺失", desc: "触感与深海软体动物接近，抗压能力异常。", conf: 85 },
    { name: "低温休眠", desc: "低于 -10°C 进入休眠，复苏成功率 100%（n=11）。", conf: 83 },
    { name: "杂食偏肉", desc: "投喂观测记录 23 次，偏好活体淡水虾。", conf: 78 },
  ],
  unknown: [
    { name: "疑似生物发光前兆", desc: "两次夜间观测到 A2 电极附近出现 0.3s 亮斑，成因未明。", conf: 41 },
    { name: "代谢率异常偏高", desc: "同等进食量下代谢为同体型样本的 2.3 倍，能量去向未知。", conf: 37 },
    { name: "对电磁脉冲敏感", desc: "一次设备放电后连续 6 小时拒食，关联性待复现。", conf: 33 },
    { name: "声音响应缺失", desc: "20Hz 至 20kHz 声刺激均无反应，推测无听觉器官。", conf: 28 },
  ],
};

const SAMPLES = [
  { ico: "droplet", code: "SMP-0912", meta: "黏液 · 4.2mL", src: "A 区采集", state: "frozen", stText: "-80°C", fresh: true },
  { ico: "flask", code: "SMP-0911", meta: "脱皮组织 · 120mg", src: "喂食后清理", state: "frozen", stText: "-80°C", fresh: true },
  { ico: "test-pipe", code: "SMP-0910", meta: "池水混合样 · 50mL", src: "收容池东南角", state: "pending", stText: "待检", fresh: true },
  { ico: "test-pipe", code: "SMP-0907", meta: "血液 · 2.0mL", src: "例行体检", state: "frozen", stText: "-80°C" },
  { ico: "microscope", code: "SMP-0903", meta: "表皮刮片 · 2 片", src: "A 区采集", state: "consumed", stText: "已耗用" },
  { ico: "flask", code: "SMP-0899", meta: "摄食残渣 · 15g", src: "B 区投放点", state: "consumed", stText: "已耗用" },
];

const LOGS = [
  { time: "23:41", tag: "warn", tagText: "异常", msg: "UBX-1147 心率降至 37 次/分，低于基准区间", sub: "已通知值守研究员沈知微" },
  { time: "23:12", tag: "info", tagText: "系统", msg: "体表电位复测任务启动，电极 A1/A2 已接入", sub: "任务编号 T-20261012-03" },
  { time: "22:58", tag: "ok", tagText: "完成", msg: "耐低温梯度试验结束，全组样本体征正常", sub: "报告已归档 RPT-0442" },
  { time: "22:30", tag: "info", tagText: "系统", msg: "CRYO-B 舱液氮余量 64%，低于预警线维持正常", sub: "下次巡检 06:00" },
  { time: "21:47", tag: "err", tagText: "故障", msg: "3 号观测摄像头短时离线 4 分 12 秒", sub: "已自动重连，无影像缺失" },
  { time: "21:15", tag: "info", tagText: "系统", msg: "投喂完成，活体淡水虾 12 只", sub: "摄食用时 9 分钟" },
];

const AUDITS = [
  { time: "23:44", tag: "audit", tagText: "审计", msg: "沈知微 查看样本 SMP-0912 档案", sub: "终端 LAB-03 · 会话 7f2a" },
  { time: "23:02", tag: "audit", tagText: "审计", msg: "沈知微 导出运行日志（10 月 09 日至 12 日）", sub: "审批单 AP-1187 · 已通过" },
  { time: "20:36", tag: "audit", tagText: "审计", msg: "系统 将 SMP-0912 移入 CRYO-B 舱 B23 位", sub: "操作员卡号 E-0421" },
  { time: "18:12", tag: "audit", tagText: "审计", msg: "周衍 修改 UBX-1147 收容等级申请", sub: "二级维持不变 · 留痕 1 条" },
  { time: "16:40", tag: "audit", tagText: "审计", msg: "系统 同步生物档案库至异地容灾节点", sub: "校验和一致 · 耗时 3.2s" },
  { time: "14:05", tag: "audit", tagText: "审计", msg: "周衍 登录运维后台", sub: "双因素验证通过 · IP 10.4.22.7" },
];

/* ============ 渲染：检测流程 ============ */

function renderFlow() {
  const el = $("#flowSteps");
  el.innerHTML = FLOW.map(s => {
    const cls = { run: "st-run", done: "st-done", wait: "st-wait", hold: "st-hold" }[s.state];
    const text = { run: "运行中", done: "已完成", wait: "排队中", hold: s.note || "挂起" }[s.state];
    const bar = s.state === "run" ? `<div class="s-progress"><i style="width:${s.pct}%"></i></div>` : "";
    return `<li class="flow-step">
      <span class="step-ico"><i class="ti ti-${s.ico}"></i></span>
      <div class="s-main"><div class="s-name">${s.name}</div><div class="s-sub mono">${s.sub}</div>${bar}</div>
      <span class="s-state ${cls}">${text}</span>
    </li>`;
  }).join("");
  // 运行中的任务缓慢推进
  const run = FLOW.find(s => s.state === "run");
  if (run) {
    setInterval(() => {
      run.pct = Math.min(96, run.pct + 1);
      const bar = $(".s-progress i", el);
      if (bar) bar.style.width = run.pct + "%";
    }, 6000);
  }
}

/* ============ 渲染：特征数据库 ============ */

function renderKnow(tab) {
  const list = KNOW[tab];
  const el = $("#knowList");
  el.innerHTML = list.map(k => `
    <li class="know-item ${tab === "unknown" ? "pending" : ""}">
      <div class="know-top"><b>${k.name}</b><span class="know-conf">${k.conf}<i>%</i></span></div>
      <p class="know-desc">${k.desc}</p>
      <div class="conf-bar"><i style="width:${k.conf}%"></i></div>
    </li>
  `).join("");
}

/* ============ 渲染：样本库 ============ */

function renderSamples() {
  const el = $("#sampleList");
  el.innerHTML = SAMPLES.map(s => `
    <li class="sample-item" data-code="${s.code}">
      <span class="sample-ico ${s.fresh ? "fresh" : ""}"><i class="ti ti-${s.ico}"></i></span>
      <div class="sample-main">
        <div class="sample-code">${s.code}</div>
        <div class="sample-meta">${s.meta} · ${s.src}</div>
      </div>
      <div class="sample-right">
        <div class="sample-state ${s.state}">${s.stText}</div>
        <div class="sample-src mono">${s.fresh ? "今日" : "存量"}</div>
      </div>
    </li>
  `).join("");
  $$(".sample-item", el).forEach(li => {
    li.addEventListener("click", () => {
      toast(`样本 ${li.dataset.code}：原型内未接详情页`);
    });
  });
}

/* ============ 渲染：日志 / 审计 ============ */

function renderRecords(tab) {
  const data = tab === "log" ? LOGS : AUDITS;
  const el = $("#recordList");
  el.innerHTML = data.map(r => `
    <li class="record-item">
      <span class="record-time">${r.time}</span>
      <div class="record-main">
        <div class="record-msg"><span class="record-tag tag-${r.tag}">${r.tagText}</span>${r.msg}</div>
        <div class="record-sub">${r.sub}</div>
      </div>
    </li>
  `).join("");
}

/* ============ 渲染：冷冻仓位 ============ */

const CRYO_HAZARD = new Set(["B08"]);
const CRYO_USED = new Set(["B02", "B04", "B05", "B08", "B11", "B14", "B16", "B17", "B19"]);

function renderCryo() {
  const el = $("#cryoGrid");
  let html = "";
  for (let i = 1; i <= 20; i++) {
    const id = "B" + String(i).padStart(2, "0");
    const used = CRYO_USED.has(id);
    const hazard = CRYO_HAZARD.has(id);
    html += `<button class="slot ${used ? "used" : ""} ${hazard ? "hazard" : ""}" data-id="${id}"
      title="${id} 仓位 · ${used ? (hazard ? "存放中（待复核）" : "存放中") : "空闲"}"
      aria-label="${id} 仓位，${used ? "已存样本" : "空闲"}"></button>`;
  }
  el.innerHTML = html;
  $$(".slot", el).forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const used = CRYO_USED.has(id);
      toast(used
        ? `${id} 仓位已占用${CRYO_HAZARD.has(id) ? "，该样本待复核" : ""}`
        : `${id} 仓位空闲，可存入样本`);
    });
  });
}

/* ============ 交互：分段切换 / 数据源 / 顶栏 ============ */

function bindSeg(rootSel, cb) {
  $$(rootSel + " .seg").forEach(seg => {
    $$(".seg-btn", seg).forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".seg-btn", seg).forEach(b => { b.classList.remove("on"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("on");
        btn.setAttribute("aria-selected", "true");
        cb(btn.dataset.tab);
      });
    });
  });
}

bindSeg(".know", renderKnow);
bindSeg(".records", renderRecords);

$$(".ft").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".ft").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("on");
    btn.setAttribute("aria-pressed", "true");
    const replay = btn.dataset.feed === "replay";
    $("#replayTag").hidden = !replay;
    toast(replay ? "已切换到昨晚 23:12 的观测回放" : "已恢复实时画面");
  });
});

$("#searchInput").addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const q = e.target.value.trim();
  if (!q) return;
  toast(`原型内未接入检索：${q}`);
});

$("#noticeBtn").addEventListener("click", () => toast("2 条待处理：心率偏低提醒、摄像头故障报告"));
$("#flowAllBtn").addEventListener("click", () => toast("原型内未接任务列表页"));

/* 导航：原型内仅视觉态切换 */
$$(".nav-item").forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    $$(".nav-item").forEach(n => n.classList.remove("on"));
    item.classList.add("on");
    toast(`${item.textContent.trim()}：原型内未接子页面`);
  });
});

/* ============ Toast 与活体指标微动 ============ */

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  $("#toastMsg").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* 数值更新时闪一次墨绿，让"观测在持续"可被感知 */
function tickVal(el, html) {
  el.innerHTML = html;
  el.classList.remove("tick");
  void el.offsetWidth; // 重启动画
  el.classList.add("tick");
}

setInterval(() => {
  const v = (11.8 + Math.random() * 1.4).toFixed(1);
  tickVal($("#epVal"), `${v} <i>mV</i>`);
}, 3200);

setInterval(() => {
  const hr = 34 + Math.floor(Math.random() * 6);
  tickVal($("#hrVal"), `${hr} <i>次/分</i>`);
}, 5200);

setInterval(() => {
  const si = (86.4 + Math.random() * 1.6).toFixed(1);
  tickVal($("#siVal"), `${si} <i>%</i>`);
}, 7400);

/* 图版右上角的实时时钟 */
function fmtClock(d) {
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
setInterval(() => {
  const el = $("#liveClock");
  if (el) el.textContent = fmtClock(new Date());
}, 1000);

/* ============ 启动 ============ */

renderFlow();
renderKnow("known");
renderSamples();
renderRecords("log");
renderCryo();
