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

  /* 表面采样裁格：matrix_details.png 为干净 3×3 等格接触印样图。
     background-size = 300%（图片放大 3 倍），第 k 格（0/1/2）居中定位 = k*50%，严丝合缝不偏不漏。 */
  const CELL_ZOOM = "300% 300%";
  const cellPos = (k) => (k * 50).toFixed(2);

  App.util = { $, $$, pad2, escapeHtml, CELL_ZOOM, cellPos };
})(window.App);
