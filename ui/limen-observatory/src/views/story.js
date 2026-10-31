/* 异物 · 异常观测室 — 档案文献（独立页面 #/story）
 * 站点志 / 文献摘录 / 大事年表 / 现场手记 / 术语，数据来自 data/story.js。
 */
(function (App) {
  "use strict";

  const { escapeHtml } = App.util;
  const LIMEN = window.LIMEN || {};
  const story = LIMEN.story || {};

  function sec(title, inner) {
    return inner ? `<section class="story-section"><h2 class="story-section-title">${escapeHtml(title)}</h2>${inner}</section>` : "";
  }

  function render(outlet) {
    if (!story || (!story.stationIntro && !story.articles && !story.timeline)) {
      outlet.innerHTML = `<article class="page"><p class="records-empty">暂无档案文献。</p></article>`;
      return;
    }
    const articles = (story.articles || [])
      .map((a) => `<article class="story-article"><h3>${escapeHtml(a.title || "")}</h3><p>${escapeHtml(a.body || "")}</p></article>`)
      .join("");
    const timeline = (story.timeline || [])
      .map((t) => `<li><span class="story-year">${escapeHtml(t.year || "")}</span><span class="story-event"><strong>${escapeHtml(t.title || "")}</strong><span>${escapeHtml(t.text || "")}</span></span></li>`)
      .join("");
    const notes = (story.fieldNotes || [])
      .map((n) => `<div class="story-note"><p>${escapeHtml(n.text || "")}</p><footer><span class="note-code">${escapeHtml(n.code || "")}</span><span>${escapeHtml(n.author || "")}</span></footer></div>`)
      .join("");
    const glossary = (story.glossary || [])
      .map((g) => `<li><strong>${escapeHtml(g.term || "")}</strong><span>${escapeHtml(g.def || "")}</span></li>`)
      .join("");

    outlet.innerHTML = `
      <article class="page page-story">
        ${App.router.breadcrumb([{ label: "档案文献" }])}
        <header class="page-head">
          <h1 class="page-title">档案文献</h1>
          <p class="page-sub">${escapeHtml(story.stationIntro || "")}</p>
        </header>
        <div class="story-body">
          ${sec("文献摘录", articles ? `<div class="story-articles">${articles}</div>` : "")}
          ${sec("大事年表", timeline ? `<ul class="story-timeline">${timeline}</ul>` : "")}
          ${sec("现场手记", notes ? `<div class="story-notes">${notes}</div>` : "")}
          ${sec("术语", glossary ? `<ul class="story-glossary">${glossary}</ul>` : "")}
        </div>
      </article>`;
  }

  App.views = App.views || {};
  App.views.story = { render };
})(window.App);
