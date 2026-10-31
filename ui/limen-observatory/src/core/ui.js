/* 异物 · 异常观测室 — UI 助手
 * toast / 无障碍播报 / 对话框开关 / 音效代理。无状态，仅聚合 DOM 操作与 Sound 引用。
 */
(function (App) {
  "use strict";

  const $ = App.util.$;
  const Sound = window.LimenSound || null;
  const sfx = (n) => { if (Sound) Sound.play(n); };
  const specimenTone = (o) => { if (Sound && o && o.sound) Sound.playSpecimen(o.id); };

  let toastTimer = null;
  function toast(msg) {
    const t = $("toast");
    if (!t) return;
    const span = t.querySelector("span");
    if (span) span.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2400);
  }
  function announce(msg) {
    const el = $("scan-announcement");
    if (el) el.textContent = msg;
  }
  function openDialog(id) {
    const d = $(id);
    if (d && !d.open) { d.showModal(); sfx("open"); }
  }
  function closeDialog(d) {
    if (d && d.open) { sfx("close"); d.close(); }
  }
  function anyDialogOpen() {
    return Array.from(document.querySelectorAll("dialog")).some((d) => d.open);
  }

  App.ui = { sfx, specimenTone, toast, announce, openDialog, closeDialog, anyDialogOpen, Sound };
})(window.App);
