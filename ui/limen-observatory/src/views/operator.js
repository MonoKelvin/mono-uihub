/* 异物 · 异常观测室 — 观察员主页（独立页面 #/operator、#/operator/:tab）
 * 顶栏头像点击进入。原顶栏「操作说明 / 设置 / 组织档案」图标全部迁入此页，以 tab 组织。
 * tab：概览 overview · 操作说明 help · 设置 settings · 组织档案 org。深链支持面包屑。
 */
(function (App) {
  "use strict";

  const { $, escapeHtml } = App.util;
  const S = App.state;
  const LIMEN = window.LIMEN || {};
  const org = LIMEN.org || {};

  const TABS = ["overview", "help", "settings", "org"];
  const TAB_LABELS = { overview: "概览", help: "操作说明", settings: "设置", org: "组织档案" };
  const AVATAR = "assets/operator_avatar.webp";

  function stats() {
    const total = S.OBJECTS.length;
    const archived = S.OBJECTS.filter((o) => o.archived).length;
    const records = S.OBJECTS.reduce((n, o) => n + (o.records ? o.records.length : 0), 0);
    return { total, archived, records };
  }

  function overviewHTML() {
    const st = stats();
    return `
      <section class="op-block">
        <h2 class="op-block-title">欢迎回来，${escapeHtml(S.OPERATOR)}</h2>
        <p class="op-lead">第四观测室负责观测、记录，并尽量不去接触。我们相信：大多数灾难，始于一次伸手。</p>
        <div class="op-stats">
          <div class="op-stat"><span class="op-stat-num">${st.total}</span><span class="op-stat-label">在册异物</span></div>
          <div class="op-stat"><span class="op-stat-num">${st.archived}</span><span class="op-stat-label">已封存</span></div>
          <div class="op-stat"><span class="op-stat-num">${st.records}</span><span class="op-stat-label">本次记录</span></div>
        </div>
      </section>
      <section class="op-block">
        <h3 class="op-block-sub">快速入口</h3>
        <div class="op-links">
          <a class="op-link" href="#/observatory"><i class="ti ti-aperture"></i>观测室</a>
          <a class="op-link" href="#/records"><i class="ti ti-notebook"></i>全部记录</a>
          <a class="op-link" href="#/matrix"><i class="ti ti-grid-dots"></i>档案矩阵</a>
          <a class="op-link" href="#/story"><i class="ti ti-book-2"></i>档案文献</a>
        </div>
      </section>
      ${helpSnippet()}
    `;
  }

  function helpSnippet() {
    return `
      <section class="op-block">
        <h3 class="op-block-sub">编号规则</h3>
        <p class="op-note">代号格式 <code>[扇区]-[亚种]-[序号]</code>。扇区标记异物被收容的渠道：</p>
        <ul class="op-rules">
          <li><strong>LJ</strong> 临界交界 — 现实缝隙处拾得</li>
          <li><strong>XT</strong> 星外回填 — 天降物，非本地球源</li>
          <li><strong>YH</strong> 渊海 — 自深水 / 地下涌出</li>
          <li><strong>NB</strong> 内禀 — 室内本就存在，无外来记录</li>
          <li><strong>WX</strong> 无线 — 借信号 / 声波捕获</li>
          <li><strong>SK</strong> 私库 — 由私人收藏移交</li>
        </ul>
      </section>`;
  }

  function helpHTML() {
    return `
      <section class="op-block">
        <h2 class="op-block-title">先观察，再下结论。</h2>
        <p class="op-lead">「异物」是一些不可名状、无法归类的物体。本室负责观测、记录，并尽量不去接触。</p>
        <div class="op-grid">
          <div class="op-card"><i class="ti ti-cube"></i><strong>切换异物</strong><span>点击左侧的图形档案</span></div>
          <div class="op-card"><i class="ti ti-scan"></i><strong>探测异常</strong><span>发现新的观察记录</span></div>
          <div class="op-card"><i class="ti ti-contrast-2"></i><strong>改变视图</strong><span>材质、轮廓或反相</span></div>
          <div class="op-card"><i class="ti ti-archive"></i><strong>封存档案</strong><span>在详情面板恢复观察</span></div>
        </div>
      </section>
      ${helpSnippet()}
      <section class="op-block">
        <h3 class="op-block-sub">快捷键</h3>
        <div class="keyboard-help">
          <span><kbd>/</kbd> 搜索</span><span><kbd>↑</kbd><kbd>↓</kbd> 切换异物</span>
          <span><kbd>空格</kbd> 探测</span><span><kbd>Esc</kbd> 关闭弹层</span>
        </div>
      </section>`;
  }

  function settingsHTML() {
    return `
      <section class="op-block">
        <h2 class="op-block-title">观测设置</h2>
        <p class="op-lead">界面音效由 Web Audio 本地实时合成，无外部文件，可随时关闭。</p>
        <div class="setting-list">
          <label class="setting-row"><span><strong>目光跟随</strong><small>异物响应你的鼠标位置</small></span><input type="checkbox" id="gaze-setting" checked><span class="switch" aria-hidden="true"></span></label>
          <label class="setting-row"><span><strong>减少动态</strong><small>停止跟随与探测动画</small></span><input type="checkbox" id="motion-setting"><span class="switch" aria-hidden="true"></span></label>
          <label class="setting-row"><span><strong>音效反馈</strong><small>交互声与异物声学签名</small></span><input type="checkbox" id="sound-setting" checked><span class="switch" aria-hidden="true"></span></label>
          <label class="setting-block"><span><strong>音效音量</strong><small>声学签名与交互声整体音量</small></span><span class="setting-value" id="volume-value">70%</span></label>
          <input type="range" id="volume-setting" class="setting-range" min="0" max="1" step="0.05" value="0.7" aria-label="音效音量">
          <label class="setting-row"><span><strong>辅助网格</strong><small>舞台叠加测量网格</small></span><input type="checkbox" id="grid-setting"><span class="switch" aria-hidden="true"></span></label>
          <label class="setting-block"><span><strong>扫描时长</strong><small>探测动画持续秒数</small></span><span class="setting-value" id="scan-duration-value">2.6s</span></label>
          <input type="range" id="scan-duration" class="setting-range" min="0.5" max="6" step="0.1" value="2.6" aria-label="扫描时长">
        </div>
      </section>`;
  }

  function orgHTML() {
    if (!org.name) return '<section class="op-block"><p class="records-empty">暂无组织档案。</p></section>';
    const dept = (org.departments || []).map((d) =>
      `<li><strong>${escapeHtml(d.code || d.name || "")}</strong><span>${escapeHtml(d.duty || d.desc || "")}</span></li>`).join("");
    const staff = (org.personnel || []).map((p) =>
      `<li><span class="org-name">${escapeHtml(p.name || "")}</span><span class="org-role">${escapeHtml(p.role || "")}</span><span class="org-clear">${escapeHtml(p.clearance || "")}</span></li>`).join("");
    const clr = (org.clearance || []).map((c) =>
      `<li><span class="clr-level">${escapeHtml(c.level || "")}</span><span class="clr-desc">${escapeHtml(c.desc || "")}</span></li>`).join("");
    const proto = (org.protocols || []).map((p) =>
      `<li><i class="ti ti-file-text"></i><span>${escapeHtml(typeof p === "string" ? p : (p.text || ""))}</span></li>`).join("");
    const dir = (org.director && (org.director.name + " · " + org.director.title)) || "";
    return `
      <section class="op-block">
        <div class="org-head">
          <div class="org-seal"${S.SEAL_IMG ? ` style="background-image:url('${S.SEAL_IMG}')"` : ""}></div>
          <div class="org-title"><strong>${escapeHtml(org.name || "")}</strong><span>${escapeHtml(org.short || "")} · 成立 ${escapeHtml(org.founded || "")}</span></div>
        </div>
        <p class="org-motto">${escapeHtml(org.motto || "")}</p>
        <div class="org-section"><h3>主管</h3><p class="org-director">${escapeHtml(dir)}</p></div>
        <div class="org-section"><h3>部门</h3><ul class="org-dept">${dept}</ul></div>
        <div class="org-section"><h3>在册人员</h3><ul class="org-staff">${staff}</ul></div>
        <div class="org-section"><h3>许可等级</h3><ul class="org-clr">${clr}</ul></div>
        <div class="org-section"><h3>观测守则</h3><ul class="org-proto">${proto}</ul></div>
      </section>`;
  }

  function tabContent(tab) {
    switch (tab) {
      case "help": return helpHTML();
      case "settings": return settingsHTML();
      case "org": return orgHTML();
      default: return overviewHTML();
    }
  }

  function render(outlet, params) {
    const tab = TABS.includes(params && params.tab) ? params.tab : "overview";
    const crumbs = tab === "overview"
      ? [{ label: "观察员" }]
      : [{ label: "观察员", href: "/operator" }, { label: TAB_LABELS[tab] }];

    const tabsNav = TABS.map((t) =>
      `<button class="op-tab${t === tab ? " is-active" : ""}" data-tab="${t}" role="tab" aria-selected="${t === tab}">${TAB_LABELS[t]}</button>`
    ).join("");

    outlet.innerHTML = `
      <article class="page page-operator">
        ${App.router.breadcrumb(crumbs)}
        <div class="operator-shell">
          <aside class="operator-aside">
            <div class="operator-portrait"><img src="${AVATAR}" alt="${escapeHtml(S.OPERATOR)}"></div>
            <h1 class="operator-name">${escapeHtml(S.OPERATOR)}</h1>
            <p class="operator-role">第四观测室 · 现场观测</p>
            <nav class="operator-tabs" role="tablist" aria-label="观察员功能">${tabsNav}</nav>
          </aside>
          <div class="operator-content" id="operator-content" role="tabpanel">${tabContent(tab)}</div>
        </div>
      </article>`;

    outlet.querySelectorAll(".op-tab").forEach((b) =>
      b.addEventListener("click", () => {
        App.ui.sfx("toggle");
        App.router.navigate("/operator/" + b.dataset.tab);
      })
    );

    if (tab === "settings") {
      App.settings.syncControls(outlet);
      App.settings.bind(outlet);
    }
  }

  App.views = App.views || {};
  App.views.operator = { render };
})(window.App);
