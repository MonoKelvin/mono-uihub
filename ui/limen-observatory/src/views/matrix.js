/* 异物 · 异常观测室 — 档案矩阵总览（独立页面 #/matrix）
 * 九宫格接触印样，点击任意印样深链至观测室并选中该异物。
 */
(function (App) {
  "use strict";

  const { $$, escapeHtml } = App.util;
  const S = App.state;

  function render(outlet) {
    const cells = S.OBJECTS.map((o) => {
      const arch = o.archived ? " is-archived" : "";
      const tag = o.id + (o.archived ? " · 封存" : "");
      return `<button class="matrix-cell${arch}" data-id="${o.id}" aria-label="${escapeHtml(o.name)} ${o.id}"><img class="matrix-thumb" src="${o.img}" alt="${escapeHtml(o.name)}" loading="lazy"><span class="cell-id">${escapeHtml(tag)}</span></button>`;
    }).join("");
    const redacted = `<div class="matrix-cell is-redacted" title="未辨识标本，已封存"><span class="redact-mark">?</span><span class="redact-label">未辨识</span></div>`;

    outlet.innerHTML = `
      <article class="page page-matrix">
        ${App.router.breadcrumb([{ label: "档案矩阵" }])}
        <header class="page-head">
          <h1 class="page-title">档案矩阵 · 总览</h1>
          <p class="page-sub">全部在册异物接触印样 · 点击任意印样跳转观测；右下为未辨识标本，已封存。</p>
        </header>
        <div class="matrix-grid">${cells}${redacted}</div>
      </article>`;

    outlet.querySelector(".matrix-grid").addEventListener("click", (e) => {
      const cell = e.target.closest(".matrix-cell:not(.is-redacted)");
      if (!cell || !cell.dataset.id) return;
      App.ui.sfx("select");
      App.router.navigate("/object/" + encodeURIComponent(cell.dataset.id));
    });
  }

  App.views = App.views || {};
  App.views.matrix = { render };
})(window.App);
