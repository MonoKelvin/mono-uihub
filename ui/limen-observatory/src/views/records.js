/* 异物 · 异常观测室 — 全部观测记录（独立页面 #/records）
 * 汇聚所有异物的本次演示记录，按时间升序排列，可按类型筛选。
 */
(function (App) {
  "use strict";

  const { $, $$, escapeHtml, pad2 } = App.util;
  const S = App.state;
  const OPERATOR = S.OPERATOR;

  function fmtTime(ts) {
    if (typeof ts !== "number") return String(ts || "");
    if (Date.now() - ts < 30000) return "刚刚";
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  function recordItemHTML(r) {
    const anomaly = r.type === "anomaly";
    const cls = "record-item" + (anomaly ? " is-anomaly" : "");
    const icon = anomaly ? "ti-alert-triangle" : "ti-eye";
    const label = anomaly ? "异常" : "观察";
    return `<div class="${cls}">
      <header><span class="record-type"><i class="ti ${icon}"></i> ${label}</span><time>${fmtTime(r.ts)}</time></header>
      <p>${escapeHtml(r.text)}</p>
      <span class="record-author">${escapeHtml(r.author || OPERATOR)}</span>
    </div>`;
  }

  function render(outlet) {
    const items = [];
    S.OBJECTS.forEach((o) => o.records.forEach((r) => items.push({ o, r })));
    items.sort((a, b) => a.r.ts - b.r.ts);
    const counts = {
      all: items.length,
      observation: items.filter((i) => i.r.type === "observation").length,
      anomaly: items.filter((i) => i.r.type === "anomaly").length,
    };

    outlet.innerHTML = `
      <article class="page page-records">
        ${App.router.breadcrumb([{ label: "观测记录" }])}
        <header class="page-head">
          <h1 class="page-title">全部观测记录</h1>
          <p class="page-sub">所有异物的本次演示记录 · 共 ${counts.all} 条（观察 ${counts.observation} · 异常 ${counts.anomaly}）</p>
          <div class="page-filters" role="group" aria-label="记录筛选">
            <button class="chip is-active" data-filter="all">全部</button>
            <button class="chip" data-filter="observation">观察</button>
            <button class="chip" data-filter="anomaly">异常</button>
          </div>
        </header>
        <div class="records-stream" id="records-stream">
          ${items.map(({ o, r }) => `
            <article class="stream-item" data-type="${r.type}">
              <div class="stream-meta">
                <a class="stream-id" href="#/object/${encodeURIComponent(o.id)}">${escapeHtml(o.id)}</a>
                <span class="stream-name">${escapeHtml(o.name)}</span>
                <span class="stream-sector">${escapeHtml(S.SECTORS.decode(o.id))}</span>
              </div>
              ${recordItemHTML(r)}
            </article>`).join("")}
        </div>
      </article>`;

    outlet.querySelectorAll(".chip[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        outlet.querySelectorAll(".chip").forEach((x) => x.classList.toggle("is-active", x === b));
        const f = b.dataset.filter;
        $$("#records-stream .stream-item", outlet).forEach((el) =>
          (el.style.display = (f === "all" || el.dataset.type === f) ? "" : "none")
        );
        App.ui.sfx("toggle");
      })
    );
  }

  App.views = App.views || {};
  App.views.records = { render };
})(window.App);
