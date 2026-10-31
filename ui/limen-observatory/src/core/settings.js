/* 异物 · 异常观测室 — 设置（UI 偏好，可持久化）
 * 同时服务于观测室舞台（目光跟随 / 网格）与观察员主页「设置」tab。
 * 控件按 id 查找，便于在 operator 页面内复用同一套 DOM。
 */
(function (App) {
  "use strict";

  const $ = App.util.$;
  const SKEY = App.state.SETTINGS_KEY;
  const settings = App.state.state.settings;

  function load() {
    try {
      const raw = localStorage.getItem(SKEY);
      if (raw) Object.assign(settings, JSON.parse(raw));
      else if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        settings.motion = true;
    } catch (_) {}
  }
  function save() {
    try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (_) {}
  }
  function applyMotion() {
    document.documentElement.classList.toggle("reduced-motion", !!settings.motion);
  }
  function applyGrid() {
    const ov = $("stage-grid-overlay");
    if (ov) ov.hidden = !settings.grid;
  }

  /* 绑定一组设置控件（root 容器内）。控件按 id 查找，缺失则跳过。 */
  function bind(root) {
    root = root || document;
    const gaze = root.querySelector("#gaze-setting");
    if (gaze) gaze.addEventListener("change", (e) => { settings.gaze = e.target.checked; save(); });

    const motion = root.querySelector("#motion-setting");
    if (motion) motion.addEventListener("change", (e) => { settings.motion = e.target.checked; applyMotion(); save(); });

    const sound = root.querySelector("#sound-setting");
    if (sound) sound.addEventListener("change", (e) => {
      settings.sound = e.target.checked;
      if (App.ui.Sound) App.ui.Sound.setEnabled(settings.sound);
      save();
    });

    const vol = root.querySelector("#volume-setting");
    if (vol) vol.addEventListener("input", (e) => {
      settings.volume = +e.target.value;
      const v = root.querySelector("#volume-value");
      if (v) v.textContent = Math.round(settings.volume * 100) + "%";
      if (App.ui.Sound) App.ui.Sound.setVolume(settings.volume);
      save();
    });

    const grid = root.querySelector("#grid-setting");
    if (grid) grid.addEventListener("change", (e) => { settings.grid = e.target.checked; applyGrid(); save(); });

    const dur = root.querySelector("#scan-duration");
    if (dur) dur.addEventListener("input", (e) => {
      settings.scanDuration = +e.target.value;
      const v = root.querySelector("#scan-duration-value");
      if (v) v.textContent = (+settings.scanDuration).toFixed(1) + "s";
      save();
    });
  }

  /* 用当前设置值回填控件（进入设置 tab 时调用） */
  function syncControls(root) {
    root = root || document;
    const set = (sel, val, text) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!val;
      else el.value = val;
      if (text) { const t = root.querySelector(text); if (t) t.textContent = text; }
    };
    set("#gaze-setting", settings.gaze);
    set("#motion-setting", settings.motion);
    set("#sound-setting", settings.sound);
    set("#volume-setting", settings.volume, Math.round(settings.volume * 100) + "%");
    set("#grid-setting", settings.grid);
    set("#scan-duration", settings.scanDuration, (+settings.scanDuration).toFixed(1) + "s");
  }

  App.settings = { load, save, applyMotion, applyGrid, bind, syncControls, state: settings };
})(window.App);
