/* 异物 · 异常观测室 — 观测室主视图
 * 渲染集合列表 / 舞台 / 详情 / 记录 / 档案；处理选择、缩放、旋转、探测、笔记、导出、封存切换。
 * 通过 App.state / App.util / App.ui / App.settings 取用单一数据源与助手，自身不持有全局状态。
 * 「封存」不再作为独立模块：异物保留 archived 状态，仅以标记区分，切换为内联操作。
 */
(function (App) {
  "use strict";

  const { $, $$, pad2, escapeHtml, CELL_ZOOM, cellPos } = App.util;
  const LIMEN = window.LIMEN || {};
  const S = App.state;

  let gazeEl = null;

  /* ---------- 渲染：集合列表 ---------- */
  function cardHTML(o) {
    const sel = o.id === S.state.activeId ? " is-selected" : "";
    const arch = o.archived ? " archived" : "";
    const badge = o.id === S.state.activeId
      ? '<span class="thumb-selected"><i class="ti ti-check"></i></span>'
      : "";
    const archTag = o.archived ? '<span class="thumb-archived-tag">封存</span>' : "";
    return `<button class="object-card${sel}" data-id="${o.id}" aria-label="${o.name} ${o.id}">
      <span class="object-thumb">
        <img class="specimen-img" src="${o.img}" alt="${o.name}" loading="lazy">
        <span class="thumb-mark">${o.id}</span>${badge}${archTag}
      </span>
      <span class="object-card-meta">
        <span class="object-card-name">${o.name}</span>
        <span class="object-card-state${arch}"></span>
      </span>
    </button>`;
  }

  function renderCollection() {
    const list = S.allObjects();
    const wrap = $("collection-list");
    if (!list.length) {
      wrap.innerHTML = `<div class="empty-collection"><i class="ti ti-search-off"></i><p>没有匹配的异物</p></div>`;
    } else {
      wrap.innerHTML = list.map(cardHTML).join("");
    }
    $("collection-title").textContent = "观测对象";
    $("collection-count").textContent = pad2(list.length);
  }

  /* ---------- 渲染：舞台 ---------- */
  function renderStage() {
    const o = S.current();
    const stage = $("stage");
    const art = $("stage-art");
    const empty = $("stage-empty");
    if (!o) {
      art.innerHTML = "";
      empty.hidden = false;
      const g0 = $("object-glyph");
      if (g0) g0.className = "ti ti-help object-glyph";
      return;
    }
    empty.hidden = true;
    const g = (o.gallery && o.gallery[S.state.galleryIdx]) || o.img;
    art.innerHTML = `<div class="gaze"><img class="specimen-img stage-specimen" src="${g}" alt="${o.name}"></div>`;
    gazeEl = art.querySelector(".gaze");

    $("object-id").textContent = o.id;
    const glyph = $("object-glyph");
    if (glyph) glyph.className = "ti " + (o.icon || "ti-help") + " object-glyph";
    $("object-title").textContent = o.name;
    $("object-whisper").textContent = o.whisper;
    $("dimension-tag").textContent = o.dimension;
    $("view-status").textContent = o.archived ? "已封存" : "正在观测";
    $("safety-text").textContent = o.archived ? "封存完成，可随时恢复。" : "保持观察，不要接触。";
    renderStageGallery(o);
    applyZoom();
    applyRotation();
  }

  function applyZoom() {
    const z = S.ZOOMS[S.state.zoomIdx];
    $("stage-art").style.setProperty("--zoom", z / 100);
    $("reset-view").textContent = z + "%";
  }
  function applyRotation() {
    $("stage-art").style.setProperty("--rotation", S.state.rotIdx * 90 + "deg");
    $("camera-label").textContent = `视角 ${S.CAM[S.state.rotIdx]} / 04`;
  }

  /* ---------- 渲染：舞台多视图切换条 ---------- */
  function renderStageGallery(o) {
    const wrap = $("stage-gallery");
    const g = (o && o.gallery) || [];
    if (g.length < 2) { wrap.innerHTML = ""; wrap.hidden = true; return; }
    wrap.hidden = false;
    wrap.innerHTML = g.map((src, i) =>
      `<button class="gallery-thumb${i === S.state.galleryIdx ? " is-active" : ""}" data-idx="${i}" aria-label="视图 ${i + 1}"><img src="${src}" alt=""></button>`
    ).join("");
  }

  /* ---------- 渲染：详情 / 记录 / 档案 ---------- */
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
      <span class="record-author">${escapeHtml(r.author || S.OPERATOR)}</span>
    </div>`;
  }

  /* ---------- 读数条（装饰性多图标） ---------- */
  function genReadout(o) {
    const seed = [...(o.id || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
    const p = (n) => (seed * (n + 3)) % 97 / 10;
    return [
      { icon: "ti-temperature", label: "温度", value: (14 + p(1)).toFixed(1) + "°C" },
      { icon: "ti-droplet", label: "湿度", value: (38 + p(2)).toFixed(0) + "%" },
      { icon: "ti-radiation", label: "辐射", value: (0.1 + p(3) / 20).toFixed(2) + "μSv" },
      { icon: "ti-wave-sine", label: "频率", value: (12 + p(4)).toFixed(1) + "Hz" },
      { icon: "ti-rotate", label: "相位", value: "-" + p(5).toFixed(1) + "°" },
      { icon: "ti-ruler", label: "质量", value: (0.6 + p(6) / 10).toFixed(2) + "kg" },
    ];
  }
  function renderReadout(o) {
    $("readout-strip").innerHTML = genReadout(o)
      .map((d) => `<span class="readout-item"><i class="ti ${d.icon}"></i><span class="readout-label">${d.label}</span><span class="readout-value">${d.value}</span></span>`)
      .join("");
  }

  /* ---------- 渲染：表面采样画廊（细节矩阵图裁格） ---------- */
  function renderDetailGallery(o) {
    const wrap = $("detail-gallery");
    if (!o.detailCells || !o.detailCells.length) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = o.detailCells
      .map((cell, i) => {
        const [c, r] = cell;
        return `<button class="detail-cell" data-kind="details" data-col="${c}" data-row="${r}" data-label="${o.name}" style="background-image:url('${S.MEDIA.details}');background-size:${CELL_ZOOM};background-position:${cellPos(c)}% ${cellPos(r)}%"><span class="detail-cell-tag">采样 ${pad2(i + 1)}</span></button>`;
      })
      .join("");
  }

  /* ---------- 信号波形（确定性伪随机，刷新一致） ---------- */
  function renderSignal(o) {
    const seed = [...(o.id || "")].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const N = 56, W = 100, H = 44, mid = H / 2;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const env = Math.sin((i / N) * Math.PI);
      const y = mid - (Math.sin(i * 0.5 + seed * 0.13) * 0.55 + Math.sin(i * 0.17 + seed * 0.37) * 0.3 + (rnd() - 0.5) * 0.25) * (mid - 4) * (0.35 + 0.65 * env);
      pts.push([(i / N) * W, Math.max(2, Math.min(H - 2, y))]);
    }
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${W} ${H} L0 ${H} Z`;
    $("signal-graph").innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
      `<line class="sig-base" x1="0" y1="${mid}" x2="${W}" y2="${mid}"/>` +
      `<path class="sig-area" d="${area}"/>` +
      `<path class="sig-line" d="${line}"/></svg>`;
  }

  /* ---------- 分类图标（装饰图标表裁格，每异物唯一） ---------- */
  function renderClassificationIcon(o) {
    const el = $("classification-icon");
    if (!el) return;
    const total = S.ICON_GRID.cols * S.ICON_GRID.rows;
    const idx = Math.max(0, S.OBJECTS.indexOf(o)) % total;
    if (S.ICON_SHEET) {
      const col = idx % S.ICON_GRID.cols, row = Math.floor(idx / S.ICON_GRID.cols);
      el.classList.add("is-decor");
      el.style.backgroundImage = `url("${S.ICON_SHEET}")`;
      el.style.backgroundSize = S.ICON_ZOOM;
      el.style.backgroundPosition = `${(col * S.ICON_STEP_X).toFixed(3)}% ${(row * S.ICON_STEP_Y).toFixed(3)}%`;
      el.textContent = "";
    } else {
      el.classList.remove("is-decor");
      el.style.backgroundImage = "";
      el.innerHTML = `<i class="ti ${o.icon || "ti-help"}"></i>`;
    }
  }

  /* ---------- 收容信息 / 测量参数 / 观测日志 ---------- */
  function renderContainment(o) {
    const wrap = $("containment-list");
    if (!o || !o.containment) { wrap.innerHTML = ""; return; }
    const c = o.containment;
    const rows = [
      ["收容点", c.site],
      ["封存方式", c.seal],
      ["权限等级", c.access],
      ["备注", c.note],
    ].filter(([, v]) => v);
    wrap.innerHTML = rows.length
      ? rows.map(([k, v]) => `<div class="meta-row"><span class="meta-key">${escapeHtml(k)}</span><span class="meta-val">${escapeHtml(v)}</span></div>`).join("")
      : "";
  }
  function renderParameters(o) {
    const wrap = $("parameters-grid");
    if (!o || !o.parameters || !o.parameters.length) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = o.parameters
      .map((p) => `<div class="param"><span class="param-label">${escapeHtml(p.label)}</span><span class="param-value">${escapeHtml(p.value)}</span></div>`)
      .join("");
  }
  function renderLogs(o) {
    const wrap = $("logs-list");
    if (!o || !o.logs || !o.logs.length) { wrap.innerHTML = '<p class="records-empty">暂无观测日志</p>'; return; }
    wrap.innerHTML = o.logs
      .map((l) => `<div class="log-item"><header><span class="log-tag">${escapeHtml(l.ts || "")}</span><span class="log-author">${escapeHtml(l.author || "")}</span></header><p>${escapeHtml(l.text)}</p></div>`)
      .join("");
  }

  function renderDossier(o) {
    const wrap = $("dossier-panel");
    if (!wrap) return;
    if (!o || !o.dossier) {
      wrap.innerHTML = '<p class="records-empty"><i class="ti ti-file-unknown"></i>该异物暂无完整档案记录。</p>';
      return;
    }
    const body = o.dossier
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");

    // 存图：原始标本影像 + 补充视角（非 _ws 的方形 / 矩形版本），作为档案参考影像
    const base = (o.img || "").replace(/_ws\.png$/i, ".png").replace(/\.png$/i, "");
    const plates = base
      ? [
          { src: base + ".png", label: "原始标本影像" },
          { src: base + "_alt.png", label: "补充视角" },
        ]
      : [];
    const platesHTML = plates.length
      ? `<div class="dossier-plates">
           <h4 class="dossier-plates-title"><i class="ti ti-photo"></i>存图 · 参考影像</h4>
           <div class="plate-row">
             ${plates
               .map(
                 (p) =>
                   `<figure class="plate"><img src="${p.src}" alt="${escapeHtml(p.label)}" loading="lazy" onerror="this.closest('.plate').remove()"><figcaption>${escapeHtml(p.label)}</figcaption></figure>`
               )
               .join("")}
           </div>
         </div>`
      : "";

    wrap.innerHTML = body + platesHTML;
  }

  function renderInspector() {
    const o = S.current();
    if (!o) {
      ["classification-icon", "classification-name", "risk-badge", "trait-grid", "protocol-list",
       "object-note", "recent-records", "record-list", "record-count", "detail-gallery",
       "readout-strip", "signal-graph", "registry-code", "registry-origin", "containment-list",
       "parameters-grid", "logs-list", "dossier-panel"].forEach((id) => {
        const el = $(id); if (!el) return;
        if (id === "classification-icon") { el.className = "classification-icon"; el.style.backgroundImage = ""; el.innerHTML = ""; }
        else if (id === "risk-badge") { el.className = "risk-badge"; el.innerHTML = ""; }
        else el.innerHTML = "";
      });
      const gi = $("stage-gallery");
      if (gi) { gi.innerHTML = ""; gi.hidden = true; }
      updateArchiveButton();
      return;
    }
    renderClassificationIcon(o);
    $("classification-name").textContent = o.classification;
    $("classification-hint").textContent = (LIMEN.config && LIMEN.config.classificationHint) || "";
    const rb = $("risk-badge");
    const level = o.risk || "未知";
    const isSafe = level === "安全";
    const isCrit = level === "危险" || level === "绝密";
    rb.className = "risk-badge" + (isSafe ? " is-safe" : "") + (isCrit ? " is-critical" : "");
    rb.innerHTML = `<i class="ti ${isSafe ? "ti-shield-check" : isCrit ? "ti-alert-octagon" : "ti-alert-triangle"}"></i><span>${escapeHtml(level)}</span>`;
    $("trait-grid").innerHTML = o.traits
      .map((t) => `<div class="trait"><i class="ti ${t.icon}"></i><strong>${t.label}</strong><span>${escapeHtml(t.value)}</span></div>`)
      .join("");
    $("protocol-list").innerHTML = o.protocols
      .map((p) => `<div class="protocol"><i class="ti ${p.icon}"></i><span>${escapeHtml(p.text)}</span></div>`)
      .join("");
    $("object-note").textContent = o.note;
    renderDetailGallery(o);
    renderReadout(o);
    renderSignal(o);
    renderContainment(o);
    renderParameters(o);
    renderLogs(o);
    renderDossier(o);
    $("registry-code").textContent = S.SECTORS.decode(o.id);
    $("registry-origin").textContent = o.origin || "";

    const recent = [...o.records].sort((a, b) => b.ts - a.ts).slice(0, 2);
    $("recent-records").innerHTML = recent.length
      ? recent
          .map((r) => `<div class="recent-record"><span class="record-time">${fmtTime(r.ts)}</span><p>${escapeHtml(r.text)}</p></div>`)
          .join("")
      : '<p class="records-empty">暂无最近记录</p>';
    const sorted = [...o.records].sort((a, b) => a.ts - b.ts);
    $("record-list").innerHTML = sorted.length
      ? sorted.map(recordItemHTML).join("")
      : '<p class="records-empty"><i class="ti ti-note-off"></i>暂无观测记录</p>';
    $("record-count").textContent = String(o.records.length);

    updateArchiveButton();
  }

  function renderAll() {
    renderCollection();
    renderStage();
    renderInspector();
  }

  /* ---------- 选择 / 切换 ---------- */
  function selectObject(id) {
    S.state.activeId = id;
    S.state.galleryIdx = 0;
    renderAll();
  }

  /* 按方向在当前可见列表内切换异物（循环） */
  function stepObject(dir) {
    const list = S.allObjects();
    if (!list.length) return;
    const i = list.findIndex((o) => o.id === S.state.activeId);
    const idx = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
    selectObject(list[idx].id);
  }

  /* ---------- 视图 / 缩放 / 旋转 ---------- */
  function setView(v) {
    S.state.view = v;
    $("stage").dataset.view = v;
    $$(".segmented-control button[data-view]").forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function zoomIn() { S.state.zoomIdx = Math.min(S.ZOOMS.length - 1, S.state.zoomIdx + 1); applyZoom(); }
  function zoomOut() { S.state.zoomIdx = Math.max(0, S.state.zoomIdx - 1); applyZoom(); }
  function resetView() { S.state.zoomIdx = 0; S.state.rotIdx = 0; applyZoom(); applyRotation(); }
  function rotate() { S.state.rotIdx = (S.state.rotIdx + 1) % S.CAM.length; applyRotation(); }

  /* ---------- 媒体灯箱（放大裁格影像，宽屏 + 浅色装饰背景） ---------- */
  function openMedia(kind, c, r, title, caption) {
    const frame = $("media-frame");
    frame.style.backgroundImage = `url("${S.MEDIA.details}")`;
    frame.style.backgroundSize = CELL_ZOOM;
    frame.style.backgroundPosition = `${cellPos(c)}% ${cellPos(r)}%`;
    $("media-title").textContent = title;
    $("media-caption").textContent = caption;
    App.ui.openDialog("media-dialog");
  }

  /* ---------- 探测（扫描） ---------- */
  const SCAN_LINES = (LIMEN.config && LIMEN.config.scanLines) || [{ type: "observation", text: "扫描完成，未见新增异常。" }];
  function scan() {
    const o = S.current();
    const stage = $("stage");
    if (!o || !stage || stage.classList.contains("is-scanning")) return;
    stage.classList.add("is-scanning");
    const ui = (LIMEN.config && LIMEN.config.ui) || {};
    const idleText = ui.statusIdle || "观测室稳定";
    const statusEl = $("status-text");
    if (statusEl) statusEl.textContent = ui.statusBusy || "探测进行中";
    App.ui.announce(`正在探测 ${o.name} …`);
    const dur = S.state.settings.motion ? 0 : Math.round((S.state.settings.scanDuration || 2.6) * 1000);
    setTimeout(() => {
      stage.classList.remove("is-scanning");
      if (statusEl) statusEl.textContent = idleText;
      const pick = SCAN_LINES[Math.floor(Math.random() * SCAN_LINES.length)];
      o.records.push({ type: pick.type, text: pick.text, author: "探测程序", ts: Date.now() });
      renderInspector();
      App.ui.toast("探测完成 · 新增 1 条记录");
      App.ui.announce(`探测完成，已记录 1 条${pick.type === "anomaly" ? "异常" : "观察"}。`);
    }, dur);
  }

  /* ---------- 标签页 ---------- */
  function switchTab(which) {
    const map = {
      details: ["details-tab", "details-panel"],
      records: ["records-tab", "records-panel"],
      dossier: ["dossier-tab", "dossier-panel"],
    };
    Object.entries(map).forEach(([key, [tid, pid]]) => {
      const on = key === which;
      const t = $(tid), p = $(pid);
      if (t) { t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; }
      if (p) p.hidden = !on;
    });
  }

  /* ---------- 封存 / 恢复（内联，不再有独立模块 / 对话框） ---------- */
  function updateArchiveButton() {
    const o = S.current();
    const btn = $("archive-button");
    if (!btn) return;
    const icon = btn.querySelector("i");
    if (o && o.archived) {
      icon.className = "ti ti-rotate-clockwise";
      btn.setAttribute("aria-label", "恢复观察");
      btn.setAttribute("data-tooltip", "恢复");
      btn.onclick = restoreCurrent;
    } else {
      icon.className = "ti ti-archive";
      btn.setAttribute("aria-label", "封存当前异物");
      btn.setAttribute("data-tooltip", "封存");
      btn.onclick = archiveCurrent;
    }
  }
  function archiveCurrent() {
    const o = S.current();
    if (!o) return;
    o.archived = true;
    App.ui.sfx("archive");
    renderAll();
    App.ui.toast(`已封存 ${o.id}`);
  }
  function restoreCurrent() {
    const o = S.current();
    if (!o) return;
    App.ui.sfx("restore");
    o.archived = false;
    renderAll();
    App.ui.toast(`已恢复观察 ${o.id}`);
  }

  /* ---------- 笔记 ---------- */
  function submitNote(e) {
    e.preventDefault();
    const o = S.current();
    if (!o) return;
    const text = $("note-text").value.trim();
    if (!text) { $("note-error").textContent = "请描述你看见的异常。"; return; }
    o.records.push({ type: S.state.noteType, text, author: S.OPERATOR, ts: Date.now() });
    App.ui.closeDialog($("note-dialog"));
    e.target.reset();
    $("note-length").textContent = "0 / 280";
    $("note-error").textContent = "";
    renderInspector();
    App.ui.toast("观察已加入记录");
  }
  function setNoteType(type) {
    S.state.noteType = type;
    $$(".note-types button[data-note-type]").forEach((b) => {
      const on = b.dataset.noteType === type;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- 导出（本地文件，非云端） ---------- */
  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportObj(o) {
    const { art, img, detailCells, ...rest } = o;
    download(`${o.id}.json`, JSON.stringify(rest, null, 2));
    App.ui.toast(`已导出 ${o.id}`);
  }
  function exportAll() {
    const data = S.OBJECTS.map(({ art, img, detailCells, ...r }) => r);
    download("异物档案-全部.json", JSON.stringify(data, null, 2));
    App.ui.toast("已导出全部档案");
  }

  /* ---------- 目光跟随 ---------- */
  function bindGaze() {
    const stage = $("stage");
    if (!stage) return;
    stage.addEventListener("pointermove", (e) => {
      if (!S.state.settings.gaze || S.state.settings.motion || !gazeEl) return;
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gazeEl.style.transform = `translate(${(nx * 16).toFixed(1)}px, ${(ny * 16).toFixed(1)}px)`;
    });
    stage.addEventListener("pointerleave", () => { if (gazeEl) gazeEl.style.transform = "translate(0,0)"; });
  }

  /* ---------- 事件绑定（仅观测室视图内元素） ---------- */
  function bindEvents() {
    let lastTick = 0;
    $("search").addEventListener("input", (e) => {
      S.state.search = e.target.value;
      renderCollection();
      const t = Date.now();
      if (t - lastTick > 110) { App.ui.sfx("tick"); lastTick = t; }
    });
    $("collection-list").addEventListener("click", (e) => {
      const card = e.target.closest(".object-card");
      if (card) {
        const o = S.OBJECTS.find((x) => x.id === card.dataset.id);
        App.ui.sfx("select");
        selectObject(card.dataset.id);
        App.ui.specimenTone(o);
      }
    });
    $("copy-id-button").addEventListener("click", async () => {
      const o = S.current();
      if (!o) return;
      try { await navigator.clipboard.writeText(o.id); } catch (_) {}
      App.ui.toast(`已复制编号 ${o.id}`);
    });

    $("stage-gallery").addEventListener("click", (e) => {
      const t = e.target.closest(".gallery-thumb");
      if (!t) return;
      App.ui.sfx("click");
      S.state.galleryIdx = +t.dataset.idx;
      renderStage();
      renderStageGallery(S.current());
    });

    $$(".segmented-control button[data-view]").forEach((b) =>
      b.addEventListener("click", () => { App.ui.sfx("toggle"); setView(b.dataset.view); })
    );
    $("zoom-in").addEventListener("click", () => { App.ui.sfx("zoomIn"); zoomIn(); });
    $("zoom-out").addEventListener("click", () => { App.ui.sfx("zoomOut"); zoomOut(); });
    $("reset-view").addEventListener("click", () => { App.ui.sfx("click"); resetView(); });
    $("rotate-button").addEventListener("click", () => { App.ui.sfx("rotate"); rotate(); });
    $("scan-button").addEventListener("click", () => { App.ui.sfx("scan"); scan(); });

    $("details-tab").addEventListener("click", () => { App.ui.sfx("toggle"); switchTab("details"); });
    $("records-tab").addEventListener("click", () => { App.ui.sfx("toggle"); switchTab("records"); });
    $("dossier-tab").addEventListener("click", () => { App.ui.sfx("toggle"); switchTab("dossier"); });
    $("show-records-button").addEventListener("click", () => { App.ui.sfx("click"); switchTab("records"); });

    $("note-button").addEventListener("click", () => {
      $("note-text").value = "";
      setNoteType("observation");
      App.ui.openDialog("note-dialog");
    });
    $("note-form").addEventListener("submit", (e) => { submitNote(e); App.ui.sfx("export"); });
    $("note-text").addEventListener("input", (e) => {
      $("note-length").textContent = `${e.target.value.length} / 280`;
      if (e.target.value.trim()) $("note-error").textContent = "";
    });
    $$(".note-types button[data-note-type]").forEach((b) =>
      b.addEventListener("click", () => { App.ui.sfx("toggle"); setNoteType(b.dataset.noteType); })
    );

    $("export-button").addEventListener("click", () => {
      const o = S.current();
      if (o) { App.ui.sfx("export"); exportObj(o); }
    });

    $("detail-gallery").addEventListener("click", (e) => {
      const cell = e.target.closest(".detail-cell");
      if (!cell) return;
      App.ui.sfx("click");
      const o = S.current();
      openMedia("details", +cell.dataset.col, +cell.dataset.row, `${o ? o.name : ""} · 表面采样`, "材质微距扫描 · 局部放大影像");
    });

    /* 悬停音效（精选控件，避免全局过密） */
    $$(".rail-button, .window-actions .icon-button, .segmented-control button, .stage-toolbar .icon-button, .inspector-tabs button, .note-types button")
      .forEach((el) => el.addEventListener("pointerenter", () => App.ui.sfx("hover")));
  }

  /* ---------- 入口 ---------- */
  function mount() {
    bindGaze();
    bindEvents();
  }
  /* 路由进入观测室：确保显示主视图，必要时选中首个异物 */
  function show(params) {
    if (params && params.id) {
      const o = S.OBJECTS.find((x) => x.id === params.id);
      if (o) S.state.activeId = o.id;
    }
    if (!S.current()) {
      const first = S.allObjects()[0];
      S.state.activeId = first ? first.id : null;
    }
    setView(S.state.view);
    renderAll();
  }

  App.views = App.views || {};
  App.views.observatory = { mount, show, selectObject, stepObject, scan, switchTab, exportAll };
})(window.App);
