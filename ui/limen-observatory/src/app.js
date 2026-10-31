/* 异物 · 异常观测室 — 启动引导（bootstrap）
 * 仅负责装配：载入设置、初始化音效、注册路由、绑定外壳交互（导航轨 / 观察员头像 / 全局快捷键）。
 * 所有业务渲染逻辑分布在 src/views/*，数据来自 data/*，单一数据源在 src/core/state.js。
 */
(function (App) {
  "use strict";

  const { $ } = App.util;
  const { navigate, add, render, setFallback, setAfterRender } = App.router;

  /* ---------- 外壳文案（数据驱动） ---------- */
  function applyChrome() {
    const ui = (window.LIMEN && window.LIMEN.config && window.LIMEN.config.ui) || {};
    if (ui.title) {
      document.title = ui.title;
      const parts = String(ui.title).split(" · ");
      const strong = document.querySelector(".brand strong");
      const cap = document.querySelector(".brand-caption");
      if (strong) strong.textContent = parts[0] || "异物";
      if (cap) cap.textContent = parts.slice(1).join(" · ") || "异常观测室";
    }
    const sn = document.querySelector(".session-number");
    if (sn && ui.room) sn.textContent = ui.room;
    const st = $("status-text");
    if (st && ui.statusIdle) st.textContent = ui.statusIdle;
  }

  /* ---------- 音效（Web Audio 合成，见 sound.js） ---------- */
  function initSound() {
    const Sound = App.ui.Sound;
    if (!Sound) return;
    Sound.init();
    Sound.setEnabled(App.state.state.settings.sound);
    Sound.setVolume(App.state.state.settings.volume);
  }

  /* ---------- 导航轨：data-route 驱动哈希路由 ---------- */
  function bindNavRail() {
    document.querySelectorAll(".rail-button[data-route]").forEach((b) =>
      b.addEventListener("click", () => {
        App.ui.sfx("click");
        navigate(b.dataset.route);
      })
    );
    // 观察员头像 → 主页
    const op = $("operator-button");
    if (op) op.addEventListener("click", () => { App.ui.sfx("click"); navigate("/operator"); });
    // 导出全部档案
    const exp = $("export-all-button");
    if (exp) exp.addEventListener("click", () => { App.ui.sfx("export"); App.views.observatory.exportAll(); });
  }

  /* ---------- 导航高亮同步 ---------- */
  function syncNav(route) {
    document.querySelectorAll(".rail-button[data-route]").forEach((b) => {
      const on = b.dataset.route === "/" + route || (route === "object" && b.dataset.route === "/observatory");
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- 全局快捷键（仅观测室视图生效） ---------- */
  function bindGlobalKeys() {
    document.addEventListener("keydown", (e) => {
      const route = App.router.currentRoute();
      if (route !== "observatory" && route !== "object") return;
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        App.ui.sfx("tick");
        const s = $("search");
        if (s) s.focus();
        return;
      }
      if ((e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowLeft") && !typing) {
        if (App.ui.anyDialogOpen()) return;
        e.preventDefault();
        App.ui.sfx("select");
        App.views.observatory.stepObject(e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (e.key === " " && !typing) {
        if (App.ui.anyDialogOpen()) return;
        e.preventDefault();
        App.ui.sfx("scan");
        App.views.observatory.scan();
      }
    });
  }

  /* ---------- 会话计时（环境装饰） ---------- */
  function startClock() {
    let base = 3 * 3600 + 33 * 60;
    const tick = () => {
      base += 1;
      const h = Math.floor(base / 3600);
      const m = Math.floor((base % 3600) / 60);
      const s = base % 60;
      const el = $("session-clock");
      if (el) el.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 路由表 ---------- */
  function registerRoutes() {
    add("/observatory", () => { App.router.setOutlet("observatory"); App.views.observatory.show(); });
    add("/object/:id", (p) => { App.router.setOutlet("observatory"); App.views.observatory.show(p); });
    add("/records", () => { const o = App.router.setOutlet("page"); App.views.records.render(o); });
    add("/matrix", () => { const o = App.router.setOutlet("page"); App.views.matrix.render(o); });
    add("/story", () => { const o = App.router.setOutlet("page"); App.views.story.render(o); });
    add("/operator", () => { const o = App.router.setOutlet("page"); App.views.operator.render(o, {}); });
    add("/operator/:tab", (p) => { const o = App.router.setOutlet("page"); App.views.operator.render(o, p); });
    setFallback(() => navigate("/observatory"));
    setAfterRender((route) => syncNav(route));
  }

  /* ---------- 启动 ---------- */
  function init() {
    App.settings.load();
    applyChrome();
    initSound();
    App.settings.applyMotion();
    App.settings.applyGrid();
    bindNavRail();
    bindGlobalKeys();
    App.views.observatory.mount();
    registerRoutes();
    App.router.init();
    startClock();
    // 默认进入观测室（无 hash 时）
    if (!location.hash) location.replace("#/observatory");
    render();
    document.body.classList.add("is-boot");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.App);
