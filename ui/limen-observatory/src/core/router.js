/* 异物 · 异常观测室 — 哈希路由
 * 单页：外壳（顶栏 + 导航轨 + 状态栏）常驻，中央内容随 location.hash 切换。
 *   #/observatory        → 观测室主视图（#observatory-view）
 *   #/object/:id         → 观测室主视图并选中某异物（深链）
 *   #/records            → 全部观测记录（独立页面）
 *   #/matrix             → 档案矩阵总览（独立页面）
 *   #/story              → 档案文献（独立页面）
 *   #/operator           → 观察员主页（概览）
 *   #/operator/:tab      → 观察员主页子页（说明 / 设置 / 档案）
 * 独立页面渲染进 #page-outlet；有子页的提供面包屑。
 */
(function (App) {
  "use strict";

  const routes = [];
  let fallback = null;
  let afterRender = null;

  function compile(pattern) {
    const keys = [];
    const rx = new RegExp(
      "^" +
        pattern.replace(/:[^/]+/g, (m) => {
          keys.push(m.slice(1));
          return "([^/]+)";
        }) +
        "$"
    );
    return { rx, keys };
  }
  function add(pattern, handler) {
    const c = compile(pattern);
    routes.push({ pattern, handler, rx: c.rx, keys: c.keys });
  }
  function parse() {
    return (location.hash || "").replace(/^#/, "") || "/observatory";
  }
  function currentRoute() {
    const p = parse().split("/").filter(Boolean);
    return p[0] || "observatory";
  }
  function match(path) {
    for (const r of routes) {
      const m = path.match(r.rx);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { handler: r.handler, params };
      }
    }
    return null;
  }
  function navigate(path) {
    const target = "#" + path;
    if (location.hash === target) render();
    else location.hash = target;
  }
  /* 切换中央内容区：observatory 显示主视图并清空页面出口；page 隐藏主视图并返回出口节点 */
  function setOutlet(kind) {
    const obs = document.getElementById("observatory-view");
    const page = document.getElementById("page-outlet");
    if (!obs || !page) return page;
    if (kind === "observatory") {
      obs.hidden = false;
      page.hidden = true;
      page.innerHTML = "";
    } else {
      obs.hidden = true;
      page.hidden = false;
    }
    return page;
  }
  function render() {
    const path = parse();
    const m = match(path);
    if (!m) {
      if (fallback) fallback(path);
    } else {
      m.handler(m.params);
    }
    if (afterRender) afterRender(currentRoute(), path);
  }
  function init() {
    window.addEventListener("hashchange", render);
  }
  function setFallback(fn) { fallback = fn; }
  function setAfterRender(fn) { afterRender = fn; }

  /* 面包屑：items = [{label, href?}]，末项视为当前页 */
  function breadcrumb(items) {
    const sep = '<li class="crumb-sep" aria-hidden="true">/</li>';
    const inner = items
      .map((it, i) => {
        const last = i === items.length - 1;
        const body = it.href
          ? `<a href="#${it.href}">${App.util.escapeHtml(it.label)}</a>`
          : `<span>${App.util.escapeHtml(it.label)}</span>`;
        return `<li class="${last ? "is-current" : ""}">${body}</li>`;
      })
      .join(sep);
    return `<nav class="crumb" aria-label="面包屑"><ul>${inner}</ul></nav>`;
  }

  App.router = {
    add, navigate, render, init, parse, currentRoute,
    setOutlet, setFallback, setAfterRender, breadcrumb,
  };
})(window.App);
