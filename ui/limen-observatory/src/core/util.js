/* 异物 · 异常观测室 — 基础工具
 * 纯函数 / DOM 小助手，不持有状态，供各视图模块共享。
 */
(function (App) {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const pad2 = (n) => String(n).padStart(2, "0");

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* 注：九宫格已拆为独立瓦片（assets/detail_00..08 等），
     运行时不再需要 background-size / background-position 裁格计算。 */
  App.util = { $, $$, pad2, escapeHtml };
})(window.App);
