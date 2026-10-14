/* ========================================================================
   Silverpoint · 选片与调色工作台 —— 原型交互（原生 JS + 本地假数据）
   ======================================================================== */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

  /* ---------------- 数据 ---------------- */
  const CAMERAS = [
    { body: "Sony α7 IV",     lens: "FE 35mm f/1.4 GM",  ext: "ARW", dim: "7008 × 4672", pre: "A7" },
    { body: "Fujifilm X-T5",  lens: "XF 56mm f/1.2 R",   ext: "RAF", dim: "7728 × 5152", pre: "DSCF" },
    { body: "Canon EOS R5",   lens: "RF 85mm f/1.2 L",   ext: "CR3", dim: "8192 × 5464", pre: "IMG_" },
    { body: "Leica Q3",       lens: "Summilux 28mm f/1.7", ext: "DNG", dim: "6060 × 4040", pre: "L10" },
    { body: "Nikon Z8",       lens: "Z 50mm f/1.8 S",    ext: "NEF", dim: "8256 × 5504", pre: "DSC_" },
  ];
  const SHUT = ["1/125s", "1/200s", "1/320s", "1/500s", "1/800s", "1/1000s", "1/60s"];
  const APER = ["f/1.4", "f/1.8", "f/2.0", "f/2.8", "f/4.0", "f/1.2"];
  const ISO  = [100, 160, 200, 320, 400, 500, 640, 800];
  const SIZE = ["42.1 MB", "48.6 MB", "51.3 MB", "38.7 MB", "57.0 MB", "44.9 MB"];

  const TAGS = [
    { id: "cover",   name: "封面候选", color: "#aeb49f" },
    { id: "select",  name: "客户初选", color: "#8ea0b0" },
    { id: "retouch", name: "需精修",   color: "#ab9bb0" },
    { id: "social",  name: "社交媒体", color: "#9fb0ab" },
    { id: "trash",   name: "废片",     color: "#b0938f" },
    { id: "sent",    name: "已交付",   color: "#9a9ea2" },
  ];
  const tagById = id => TAGS.find(t => t.id === id);

  const COLLECTIONS = [
    { icon: "ti-folder",       name: "明室家居 · 秋冬产品", count: 284, active: true },
    { icon: "ti-heart",        name: "周屿 & 林夏 · 婚礼跟拍", count: "1,206" },
    { icon: "ti-vinyl",        name: "山鬼乐队 · 专辑视觉", count: 312 },
    { icon: "ti-building-store", name: "城南旧书店 · 品牌形象", count: 97 },
    { icon: "ti-clock-hour-4", name: "最近导入", count: 48 },
  ];

  // 预置评分 / 旗标 / 标签分布（贴近真实选片状态）
  const SEED = [
    [5, "pick", ["cover", "select"]], [4, "pick", ["select"]], [0, null, []], [3, null, ["social"]],
    [5, "pick", ["cover", "retouch"]], [2, "reject", ["trash"]], [4, "pick", ["select"]], [0, null, []],
    [3, null, ["social"]], [5, "pick", ["cover", "select", "retouch"]], [1, "reject", ["trash"]], [4, "pick", []],
    [0, null, []], [3, "pick", ["select"]], [4, null, ["social"]], [5, "pick", ["cover"]],
    [2, null, []], [0, "reject", ["trash"]], [4, "pick", ["select", "retouch"]], [3, null, []],
    [5, "pick", ["cover", "select"]], [1, "reject", []], [4, "pick", ["social"]], [0, null, []],
    [3, "pick", ["select"]], [2, null, []], [4, "pick", ["retouch"]], [5, "pick", ["cover", "select"]],
  ];

  const photos = SEED.map((s, i) => {
    const cam = CAMERAS[i % CAMERAS.length];
    const n = String(4021 + i * 3);
    return {
      id: "p" + i,
      seed: "sp" + String(i + 1).padStart(2, "0"),
      fname: `${cam.pre}${n}.${cam.ext}`,
      rating: s[0],
      flag: s[1],
      tags: [...s[2]],
      exif: {
        camera: cam.body,
        lens: cam.lens,
        shutter: SHUT[i % SHUT.length],
        aperture: APER[i % APER.length],
        iso: ISO[i % ISO.length],
        dim: cam.dim,
        size: SIZE[i % SIZE.length],
        time: `2025-10-11 ${String(14 + Math.floor(i / 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      },
    };
  });
  TAGS.forEach(t => t.count = photos.filter(p => p.tags.includes(t.id)).length);

  const state = {
    view: "cull",
    selectedId: "p0",
    minStars: 0,
    flag: "all",
    tagFilter: null,
    sort: "capture",
    gridSize: "m",
    cmpSlot: "B",      // 胶片条点击时装入的槽
    cmpA: "p4", cmpB: "p9",
    cmpMode: "split",
    deliverIn: new Set(photos.filter(p => p.rating >= 4 && p.flag === "pick").map(p => p.id)),
  };

  const byId = id => photos.find(p => p.id === id);

  /* ---------------- 轻提示 ---------------- */
  let toastT;
  const toastEl = $("#toast");
  function toast(msg, ok = false, icon = "ti-info-circle") {
    toastEl.innerHTML = `<i class="ti ${ok ? "ti-check" : icon}"></i><span>${msg}</span>`;
    toastEl.classList.toggle("ok", ok);
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------------- 星级组件 ---------------- */
  function starMarkup(rating, cls = "") {
    let h = `<span class="stars ${cls}">`;
    for (let v = 1; v <= 5; v++)
      h += `<span class="star ${v <= rating ? "on" : ""}" data-val="${v}"><i class="ti ti-star-filled"></i></span>`;
    return h + "</span>";
  }

  /* ---------------- 筛选 + 排序 ---------------- */
  function visiblePhotos() {
    let list = photos.filter(p => {
      if (p.rating < state.minStars) return false;
      if (state.flag !== "all" && p.flag !== state.flag) return false;
      if (state.tagFilter && !p.tags.includes(state.tagFilter)) return false;
      return true;
    });
    const order = { pick: 0, null: 1, reject: 2 };
    if (state.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (state.sort === "flag") list = [...list].sort((a, b) => order[a.flag] - order[b.flag]);
    return list;
  }

  /* ---------------- 渲染：选片网格 ---------------- */
  const grid = $("#photo-grid");
  const emptyState = $("#empty-state");
  function renderGrid() {
    const list = visiblePhotos();
    $("#result-count").innerHTML = `<b>${list.length}</b> / ${photos.length} 张`;
    grid.className = "photo-grid size-" + state.gridSize;
    if (!list.length) { grid.innerHTML = ""; emptyState.hidden = false; return; }
    emptyState.hidden = true;
    grid.innerHTML = list.map((p, i) => {
      const dots = p.tags.map(t => `<span class="ctag-dot" style="background:${tagById(t).color}"></span>`).join("");
      const flagCls = p.flag ? p.flag : "";
      const flagIcon = p.flag === "pick" ? "ti-flag-filled" : p.flag === "reject" ? "ti-ban" : "";
      return `
      <figure class="cell ${p.id === state.selectedId ? "is-selected" : ""} ${p.rating ? "has-rating" : ""} ${p.flag ? "flagged" : ""} ${p.flag === "reject" ? "is-reject" : ""}"
              data-id="${p.id}" draggable="true" style="animation-delay:${(i % 12) * 22}ms">
        <img src="${img(p.seed, 420, 280)}" alt="${p.fname}" loading="lazy">
        <div class="cell-overlay">
          <div class="cell-top">
            ${p.flag ? `<span class="cell-flag ${flagCls}"><i class="ti ${flagIcon}"></i></span>` : "<span></span>"}
            <span class="cell-fname">${p.fname}</span>
          </div>
          <div class="cell-bottom">
            ${starMarkup(p.rating)}
            <span class="cell-tags">${dots}</span>
          </div>
        </div>
      </figure>`;
    }).join("");
  }

  /* ---------------- 渲染：胶片条 ---------------- */
  const filmstrip = $("#filmstrip");
  function renderFilmstrip() {
    filmstrip.innerHTML = photos.map(p => {
      const dots = [1, 2, 3, 4, 5].map(v => `<span class="fsstar ${v <= p.rating ? "on" : ""}"></span>`).join("");
      return `
      <div class="fs-thumb ${p.id === state.selectedId ? "is-selected" : ""} ${p.flag === "reject" ? "is-reject" : ""}"
           data-id="${p.id}" role="option" aria-selected="${p.id === state.selectedId}" title="${p.fname}">
        <img src="${img(p.seed, 120, 80)}" alt="${p.fname}" loading="lazy">
        ${p.flag ? `<span class="fs-flag ${p.flag}"></span>` : ""}
        <span class="fs-rate">${dots}</span>
      </div>`;
    }).join("");
    const sel = byId(state.selectedId);
    $("#fs-selname").textContent = sel ? `${sel.fname} · ${sel.exif.dim}` : "";
    const active = $(".fs-thumb.is-selected", filmstrip);
    if (active) active.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---------------- 渲染：标签（拖放目标） ---------------- */
  const tagList = $("#tags");
  function renderTags() {
    tagList.innerHTML = TAGS.map(t => `
      <li class="tag ${state.tagFilter === t.id ? "is-active" : ""}" data-tag="${t.id}">
        <span class="tag-dot" style="background:${t.color}"></span>
        <span class="tag-name">${t.name}</span>
        <span class="tag-count">${t.count}</span>
      </li>`).join("");
  }

  /* ---------------- 渲染：批次 ---------------- */
  $("#collections").innerHTML = COLLECTIONS.map((c, i) => `
    <li class="coll ${c.active ? "is-active" : ""}" data-coll="${i}">
      <i class="ti ${c.icon}"></i>
      <span class="coll-name">${c.name}</span>
      <span class="coll-count">${c.count}</span>
    </li>`).join("");

  /* ---------------- 渲染：右侧检查器（选片/对比） ---------------- */
  function renderInspector() {
    const p = byId(state.selectedId);
    if (!p) return;
    $("#insp-img").src = img(p.seed, 600, 400);
    $("#insp-img").alt = p.fname;
    $("#insp-pick").classList.toggle("on", p.flag === "pick");
    $("#insp-reject").classList.toggle("on", p.flag === "reject");
    $("#insp-stars").dataset.rating = p.rating;
    paintStars($("#insp-stars"), p.rating);

    const tl = $("#insp-tag-list");
    tl.innerHTML = p.tags.length
      ? p.tags.map(t => {
          const tg = tagById(t);
          return `<span class="chip"><span class="chip-dot" style="background:${tg.color}"></span>${tg.name}<span class="chip-x" data-rm="${t}"><i class="ti ti-x"></i></span></span>`;
        }).join("")
      : `<span class="insp-empty">未分配标签 · 可从网格拖照片到左侧标签</span>`;

    const e = p.exif;
    $("#insp-meta").innerHTML = `
      <dt>机身</dt><dd>${e.camera}</dd>
      <dt>镜头</dt><dd>${e.lens}</dd>
      <dt>光圈</dt><dd>${e.aperture}</dd>
      <dt>快门</dt><dd>${e.shutter}</dd>
      <dt>ISO</dt><dd>${e.iso}</dd>
      <dt>尺寸</dt><dd>${e.dim}</dd>
      <dt>容量</dt><dd>${e.size}</dd>
      <dt>拍摄</dt><dd>${e.time}</dd>`;
  }

  // 大星级（检查器）：直接画 span.star，支持 hover 预览
  function paintStars(container, rating, phantom = -1) {
    container.innerHTML = "";
    for (let v = 1; v <= 5; v++) {
      const s = document.createElement("span");
      s.className = "star" + (v <= rating ? " on" : (phantom >= v ? " on phantom" : ""));
      s.dataset.val = v;
      s.innerHTML = `<i class="ti ti-star-filled"></i>`;
      container.appendChild(s);
    }
    container.classList.toggle("preview", phantom > 0);
  }

  /* ---------------- 评分 / 旗标 操作 ---------------- */
  function setRating(id, val) {
    const p = byId(id);
    p.rating = (p.rating === val) ? val - 1 : val; // 点同一星可减一（点满星降回4）
    p.rating = clamp(p.rating, 0, 5);
    refreshStats(); renderGrid(); renderFilmstrip(); if (id === state.selectedId) renderInspector();
  }
  function setFlag(id, val) {
    const p = byId(id);
    p.flag = (p.flag === val) ? null : val;
    refreshStats(); renderGrid(); renderFilmstrip(); if (id === state.selectedId) renderInspector();
  }
  function refreshStats() {
    $("#stat-total").textContent = photos.length;
    $("#stat-picked").textContent = photos.filter(p => p.flag === "pick").length;
    $("#stat-fivestar").textContent = photos.filter(p => p.rating === 5).length;
  }

  function selectPhoto(id) {
    state.selectedId = id;
    renderGrid(); renderFilmstrip(); renderInspector();
    if (state.view === "develop") loadDevelop(id);
    if (state.view === "compare") loadCompareSlot(id);
  }

  /* ---------------- 事件：网格 ---------------- */
  grid.addEventListener("click", e => {
    const cell = e.target.closest(".cell"); if (!cell) return;
    const id = cell.dataset.id;
    const star = e.target.closest(".star");
    if (star) { selectPhoto(id); setRating(id, +star.dataset.val); return; }
    selectPhoto(id);
  });

  // 网格星级悬停预览
  grid.addEventListener("mouseover", e => {
    const star = e.target.closest(".star"); if (!star) return;
    const stars = star.parentElement;
    const v = +star.dataset.val;
    $$(".star", stars).forEach((s, i) => s.classList.toggle("phantom", i < v && !s.classList.contains("on")));
    $$(".star", stars).forEach((s, i) => { if (i < v) s.classList.add("on"); });
    stars.classList.add("preview");
  });
  grid.addEventListener("mouseout", e => {
    const stars = e.target.closest(".stars"); if (!stars) return;
    const cell = stars.closest(".cell"); const p = byId(cell.dataset.id);
    stars.classList.remove("preview");
    $$(".star", stars).forEach((s, i) => { s.classList.toggle("on", i < p.rating); s.classList.remove("phantom"); });
  });

  /* ---------------- 拖拽：照片 → 标签 ---------------- */
  let dragId = null;
  grid.addEventListener("dragstart", e => {
    const cell = e.target.closest(".cell"); if (!cell) return;
    dragId = cell.dataset.id;
    cell.classList.add("dragging");
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", dragId);
  });
  grid.addEventListener("dragend", e => {
    const cell = e.target.closest(".cell"); if (cell) cell.classList.remove("dragging");
    dragId = null;
  });
  tagList.addEventListener("dragover", e => {
    const li = e.target.closest(".tag"); if (!li) return;
    e.preventDefault(); e.dataTransfer.dropEffect = "copy";
    li.classList.add("drop-hot");
  });
  tagList.addEventListener("dragleave", e => {
    const li = e.target.closest(".tag"); if (li) li.classList.remove("drop-hot");
  });
  tagList.addEventListener("drop", e => {
    const li = e.target.closest(".tag"); if (!li || !dragId) return;
    e.preventDefault();
    const tagId = li.dataset.tag, p = byId(dragId), tg = tagById(tagId);
    li.classList.remove("drop-hot");
    if (p.tags.includes(tagId)) { toast(`「${p.fname}」已有标签「${tg.name}」`); return; }
    p.tags.push(tagId);
    tg.count = photos.filter(x => x.tags.includes(tagId)).length;
    renderTags(); renderGrid(); if (p.id === state.selectedId) renderInspector();
    const added = $(`.tag[data-tag="${tagId}"]`); if (added) { added.classList.add("just-added"); setTimeout(() => added.classList.remove("just-added"), 420); }
    toast(`已为「${p.fname}」添加标签「${tg.name}」`, true);
  });

  // 标签点击 = 筛选
  tagList.addEventListener("click", e => {
    const li = e.target.closest(".tag"); if (!li) return;
    state.tagFilter = state.tagFilter === li.dataset.tag ? null : li.dataset.tag;
    renderTags(); renderGrid();
  });

  // 检查器：移除标签
  $("#insp-tag-list").addEventListener("click", e => {
    const x = e.target.closest("[data-rm]"); if (!x) return;
    const p = byId(state.selectedId), tagId = x.dataset.rm, tg = tagById(tagId);
    p.tags = p.tags.filter(t => t !== tagId);
    tg.count = photos.filter(xx => xx.tags.includes(tagId)).length;
    renderTags(); renderGrid(); renderInspector();
  });

  /* ---------------- 检查器：旗标 + 大星级 ---------------- */
  $("#insp-pick").addEventListener("click", () => setFlag(state.selectedId, "pick"));
  $("#insp-reject").addEventListener("click", () => setFlag(state.selectedId, "reject"));
  const inspStars = $("#insp-stars");
  inspStars.addEventListener("click", e => { const s = e.target.closest(".star"); if (s) setRating(state.selectedId, +s.dataset.val); });
  inspStars.addEventListener("mousemove", e => {
    const s = e.target.closest(".star"); const p = byId(state.selectedId);
    paintStars(inspStars, p.rating, s ? +s.dataset.val : -1);
  });
  inspStars.addEventListener("mouseleave", () => paintStars(inspStars, byId(state.selectedId).rating));
  inspStars.addEventListener("keydown", e => {
    const p = byId(state.selectedId);
    if (e.key === "ArrowRight") { setRating(state.selectedId, clamp(p.rating + 1, 0, 5) || 1); e.preventDefault(); }
    if (e.key === "ArrowLeft")  { p.rating = clamp(p.rating - 1, 0, 5); refreshStats(); renderGrid(); renderFilmstrip(); renderInspector(); e.preventDefault(); }
  });

  /* ---------------- 筛选控件 ---------------- */
  const starFilter = $("#star-filter");
  function paintStarFilter() {
    $$("button", starFilter).forEach((b, i) => {
      const lit = i < state.minStars;
      b.classList.toggle("lit", lit);
      b.querySelector("i").className = "ti " + (lit ? "ti-star-filled" : "ti-star");
    });
  }
  starFilter.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const min = +b.dataset.min;
    state.minStars = state.minStars === min ? 0 : min;
    paintStarFilter(); renderGrid();
  });
  starFilter.addEventListener("mouseover", e => {
    const b = e.target.closest("button"); if (!b) return;
    const n = +b.dataset.min;
    $$("button", starFilter).forEach((bb, i) => bb.querySelector("i").className = "ti " + (i < n ? "ti-star-filled" : "ti-star"));
  });
  starFilter.addEventListener("mouseout", paintStarFilter);

  $("#flag-filter").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    state.flag = b.dataset.flag;
    $$("#flag-filter button").forEach(x => x.classList.toggle("is-active", x === b));
    renderGrid();
  });

  $("#clear-filter").addEventListener("click", () => {
    state.minStars = 0; state.flag = "all"; state.tagFilter = null;
    paintStarFilter();
    $$("#flag-filter button").forEach(x => x.classList.toggle("is-active", x.dataset.flag === "all"));
    renderTags(); renderGrid();
  });

  // 缩略图尺寸 + 排序
  $("#grid-size").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    state.gridSize = b.dataset.size;
    $$("#grid-size button").forEach(x => x.classList.toggle("is-active", x === b));
    renderGrid();
  });
  $("#sort-by").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    state.sort = b.dataset.sort;
    $$("#sort-by button").forEach(x => x.classList.toggle("is-active", x === b));
    renderGrid();
  });

  // 批次切换（原型：仅切换高亮）
  $("#collections").addEventListener("click", e => {
    const li = e.target.closest(".coll"); if (!li) return;
    $$("#collections .coll").forEach(x => x.classList.toggle("is-active", x === li));
    toast(`已进入批次「${li.querySelector(".coll-name").textContent}」`);
  });

  /* ---------------- 胶片条 ---------------- */
  filmstrip.addEventListener("click", e => {
    const t = e.target.closest(".fs-thumb"); if (!t) return;
    selectPhoto(t.dataset.id);
  });
  $("#fs-prev").addEventListener("click", () => stepSelection(-1));
  $("#fs-next").addEventListener("click", () => stepSelection(1));
  function stepSelection(d) {
    const i = photos.findIndex(p => p.id === state.selectedId);
    selectPhoto(photos[clamp(i + d, 0, photos.length - 1)].id);
  }

  /* ====================================================================
     对比视图
     ==================================================================== */
  const cmpStage = $("#compare-stage");
  function renderCompare() {
    const a = byId(state.cmpA), b = byId(state.cmpB);
    $("#cmp-a-img").src = img(a.seed, 900, 600); $("#cmp-a-img").alt = a.fname;
    $("#cmp-b-img").src = img(b.seed, 900, 600); $("#cmp-b-img").alt = b.fname;
    $("#cmp-a-name").textContent = a.fname; $("#cmp-b-name").textContent = b.fname;
    $("#cmp-a-stars").innerHTML = "★".repeat(a.rating) + "☆".repeat(5 - a.rating);
    $("#cmp-b-stars").innerHTML = "★".repeat(b.rating) + "☆".repeat(5 - b.rating);
    $("#cmp-ov-base").src = img(b.seed, 900, 600);
    $("#cmp-ov-topimg").src = img(a.seed, 900, 600);
    // 高亮当前接收槽
    $$(".cmp-cell", cmpStage).forEach(c => c.classList.toggle("is-target", c.dataset.slot === state.cmpSlot.toLowerCase()));
  }
  function loadCompareSlot(id) {
    if (state.cmpSlot === "A") { state.cmpA = id; state.cmpSlot = "B"; }
    else { state.cmpB = id; state.cmpSlot = "A"; }
    renderCompare();
  }
  // 点击某槽 → 设为下一个接收槽
  $$(".cmp-cell", cmpStage).forEach(c => c.addEventListener("click", () => {
    state.cmpSlot = c.dataset.slot.toUpperCase();
    $$(".cmp-cell", cmpStage).forEach(x => x.classList.toggle("is-target", x === c));
  }));
  // 模式切换
  $("#compare-mode").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    state.cmpMode = b.dataset.mode;
    cmpStage.dataset.mode = state.cmpMode;
    $$("#compare-mode button").forEach(x => x.classList.toggle("is-active", x === b));
  });
  // 叠加分割线拖动
  const divider = $("#cmp-divider"), ovTop = $("#cmp-ov-top"), ovWrap = $("#cmp-overlay");
  function setWipe(pct) {
    pct = clamp(pct, 2, 98);
    divider.style.left = pct + "%";
    ovTop.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.setAttribute("aria-valuenow", Math.round(pct));
  }
  function wipeFromEvent(clientX) {
    const r = ovWrap.getBoundingClientRect();
    setWipe(((clientX - r.left) / r.width) * 100);
  }
  let wiping = false;
  const startWipe = ev => { wiping = true; wipeFromEvent((ev.touches ? ev.touches[0] : ev).clientX); ev.preventDefault(); };
  divider.addEventListener("mousedown", startWipe);
  ovWrap.addEventListener("mousedown", startWipe);
  divider.addEventListener("touchstart", startWipe, { passive: false });
  window.addEventListener("mousemove", ev => { if (wiping) wipeFromEvent(ev.clientX); });
  window.addEventListener("touchmove", ev => { if (wiping) wipeFromEvent(ev.touches[0].clientX); }, { passive: false });
  window.addEventListener("mouseup", () => wiping = false);
  window.addEventListener("touchend", () => wiping = false);
  divider.addEventListener("keydown", e => {
    const cur = +divider.getAttribute("aria-valuenow");
    if (e.key === "ArrowLeft")  { setWipe(cur - 3); e.preventDefault(); }
    if (e.key === "ArrowRight") { setWipe(cur + 3); e.preventDefault(); }
  });

  /* ====================================================================
     调色视图：可拖拽滑块 + 版本历史回溯
     ==================================================================== */
  const SLIDERS = [
    { group: "光" },
    { id: "exposure", name: "曝光",   min: -100, max: 100 },
    { id: "contrast", name: "对比度", min: -100, max: 100 },
    { id: "highlights", name: "高光", min: -100, max: 100 },
    { id: "shadows", name: "阴影",   min: -100, max: 100 },
    { group: "色" },
    { id: "temp", name: "色温",       min: -100, max: 100 },
    { id: "tint", name: "色调",       min: -100, max: 100 },
    { id: "saturation", name: "饱和度", min: -100, max: 100 },
    { id: "vibrance", name: "自然饱和度", min: -100, max: 100 },
  ];
  const SLD_IDS = SLIDERS.filter(s => s.id).map(s => s.id);
  const zero = () => Object.fromEntries(SLD_IDS.map(k => [k, 0]));
  let dev = zero();

  // 版本历史（预置几个带快照的版本）
  const history = [
    { op: "导入原片", time: "14:02", vals: zero() },
    { op: "基础校色", time: "14:11", vals: { ...zero(), exposure: 18, contrast: 22, shadows: 30, temp: -8 } },
    { op: "肤色与白平衡", time: "14:26", vals: { ...zero(), exposure: 14, contrast: 18, highlights: -24, shadows: 34, temp: 12, tint: 6, vibrance: 20 } },
  ];
  let curVersion = history.length - 1;

  function buildSliders() {
    const wrap = $("#sliders");
    wrap.innerHTML = SLIDERS.map(s => {
      if (s.group) return `<div class="slider-group">${s.group}</div>`;
      return `
      <div class="sld" data-id="${s.id}" data-min="${s.min}" data-max="${s.max}">
        <div class="sld-top"><span class="sld-name">${s.name}</span><span class="sld-val">0</span></div>
        <div class="track"><div class="track-rail"></div><div class="track-mid"></div><div class="track-fill"></div><div class="thumb"></div></div>
      </div>`;
    }).join("");
    $$(".sld", wrap).forEach(bindSlider);
  }

  function paintSlider(sld) {
    const id = sld.dataset.id, min = +sld.dataset.min, max = +sld.dataset.max, v = dev[id];
    const pct = (v - min) / (max - min) * 100;
    const zeroPct = (0 - min) / (max - min) * 100;
    sld.querySelector(".thumb").style.left = pct + "%";
    const fill = sld.querySelector(".track-fill");
    const lo = Math.min(pct, zeroPct), hi = Math.max(pct, zeroPct);
    fill.style.left = lo + "%"; fill.style.width = (hi - lo) + "%";
    const val = sld.querySelector(".sld-val");
    val.textContent = (v > 0 ? "+" : "") + v;
    val.classList.toggle("mod", v !== 0);
    sld.classList.toggle("mod", v !== 0);
  }
  function paintAllSliders() { $$(".sld").forEach(paintSlider); applyDevFilter(); }

  function bindSlider(sld) {
    const track = sld.querySelector(".track"), thumb = sld.querySelector(".thumb");
    const min = +sld.dataset.min, max = +sld.dataset.max, id = sld.dataset.id;
    const fromX = clientX => {
      const r = track.getBoundingClientRect();
      const pct = clamp((clientX - r.left) / r.width, 0, 1);
      dev[id] = Math.round(min + pct * (max - min));
      paintSlider(sld); applyDevFilter();
    };
    let drag = false;
    const down = ev => { drag = true; thumb.classList.add("grab"); fromX((ev.touches ? ev.touches[0] : ev).clientX); ev.preventDefault(); };
    track.addEventListener("mousedown", down);
    track.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", ev => { if (drag) fromX(ev.clientX); });
    window.addEventListener("touchmove", ev => { if (drag) fromX(ev.touches[0].clientX); }, { passive: false });
    window.addEventListener("mouseup", () => { if (drag) { drag = false; thumb.classList.remove("grab"); } });
    window.addEventListener("touchend", () => { if (drag) { drag = false; thumb.classList.remove("grab"); } });
    // 双击复位单项
    track.addEventListener("dblclick", () => { dev[id] = 0; paintSlider(sld); applyDevFilter(); });
  }

  const devPreview = $("#dev-preview");
  function applyDevFilter() {
    const b = 1 + (dev.exposure + dev.highlights * 0.3 + dev.shadows * 0.3) / 170;
    const c = 1 + dev.contrast / 170;
    const s = 1 + (dev.saturation + dev.vibrance * 0.5) / 130;
    const sep = Math.max(0, dev.temp) / 320;
    const hue = (dev.temp < 0 ? dev.temp * 0.22 : 0) + dev.tint * 0.18;
    devPreview.style.filter = `brightness(${b.toFixed(3)}) contrast(${c.toFixed(3)}) saturate(${s.toFixed(3)}) sepia(${sep.toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg)`;
  }
  function loadDevelop(id) {
    const p = byId(id);
    devPreview.src = img(p.seed, 1200, 800); devPreview.alt = p.fname;
    $("#dev-film").textContent = `${p.fname} · ${p.exif.aperture} ${p.exif.shutter} ISO ${p.exif.iso}`;
    applyDevFilter();
  }
  function renderHistory() {
    $("#history-list").innerHTML = history.map((h, i) => `
      <li class="hitem ${i === curVersion ? "is-current" : ""}" data-i="${i}">
        <span class="h-node"></span>
        <span class="h-body"><div class="h-op">${h.op}</div><div class="h-time">${h.time}</div></span>
        <span class="h-restore">回溯</span>
      </li>`).join("");
  }
  $("#history-list").addEventListener("click", e => {
    const li = e.target.closest(".hitem"); if (!li) return;
    curVersion = +li.dataset.i;
    dev = { ...history[curVersion].vals };
    paintAllSliders(); renderHistory();
    toast(`已回溯到版本「${history[curVersion].op} · ${history[curVersion].time}」`, true, "ti-history");
  });
  $("#dev-reset").addEventListener("click", () => { dev = zero(); paintAllSliders(); toast("调色已复位"); });
  $("#dev-snapshot").addEventListener("click", () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    history.push({ op: "手动存点", time, vals: { ...dev } });
    curVersion = history.length - 1;
    renderHistory();
    toast("已存为新版本", true, "ti-bookmark");
  });
  const devBA = $("#dev-ba");
  function baOn() { devBA.classList.add("showing"); devBA.setAttribute("aria-pressed", "true"); devPreview.style.filter = "none"; }
  function baOff() { devBA.classList.remove("showing"); devBA.setAttribute("aria-pressed", "false"); applyDevFilter(); }
  devBA.addEventListener("mousedown", baOn);
  devBA.addEventListener("touchstart", e => { baOn(); e.preventDefault(); }, { passive: false });
  window.addEventListener("mouseup", baOff);
  window.addEventListener("touchend", baOff);

  /* ====================================================================
     导出队列：可排序 + 运行
     ==================================================================== */
  const QUEUE = [
    { seed: "sp01", name: "A7_4021.ARW", spec: "JPEG · 原始尺寸 sRGB", status: "done", prog: 100 },
    { seed: "sp05", name: "A7_4033.ARW", spec: "JPEG · 原始尺寸 sRGB", status: "done", prog: 100 },
    { seed: "sp10", name: "DSCF4048.RAF", spec: "TIFF 16bit · Adobe RGB", status: "wait", prog: 0 },
    { seed: "sp16", name: "IMG_4066.CR3", spec: "JPEG · 2048px sRGB", status: "wait", prog: 0 },
    { seed: "sp19", name: "DSC_4075.NEF", spec: "JPEG · 原始尺寸 P3", status: "wait", prog: 0 },
    { seed: "sp21", name: "A7_4081.ARW", spec: "JPEG · 1200px sRGB", status: "wait", prog: 0 },
    { seed: "sp28", name: "A7_4102.ARW", spec: "JPEG · 原始尺寸 sRGB", status: "wait", prog: 0 },
  ];
  const STATUS_TXT = { done: "已完成", wait: "待处理", run: "处理中" };
  const queueEl = $("#queue");
  function renderQueue() {
    queueEl.innerHTML = QUEUE.map((j, i) => `
      <li class="qitem" draggable="true" data-i="${i}">
        <span class="q-handle"><i class="ti ti-grip-vertical"></i></span>
        <span class="q-thumb"><img src="${img(j.seed, 120, 90)}" alt=""></span>
        <span class="q-info"><div class="q-name">${j.name}</div><div class="q-spec">${j.spec}</div></span>
        <span class="q-prog"><span class="q-bar"><span style="width:${j.prog}%"></span></span>
          <div class="q-status ${j.status === "done" ? "done" : ""}">${STATUS_TXT[j.status]}${j.status === "run" ? " " + j.prog + "%" : ""}</div></span>
        <button class="q-del" data-del="${i}" aria-label="移除"><i class="ti ti-x"></i></button>
      </li>`).join("");
    $("#export-badge").textContent = QUEUE.length;
  }
  // 拖拽排序
  let qDrag = null;
  queueEl.addEventListener("dragstart", e => {
    const li = e.target.closest(".qitem"); if (!li) return;
    qDrag = +li.dataset.i; li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  queueEl.addEventListener("dragend", e => { const li = e.target.closest(".qitem"); if (li) li.classList.remove("dragging"); $$(".qitem").forEach(x => x.classList.remove("drag-over")); qDrag = null; });
  queueEl.addEventListener("dragover", e => {
    e.preventDefault();
    const li = e.target.closest(".qitem"); if (!li) return;
    $$(".qitem").forEach(x => x.classList.toggle("drag-over", x === li));
  });
  queueEl.addEventListener("drop", e => {
    e.preventDefault();
    const li = e.target.closest(".qitem"); if (!li || qDrag === null) return;
    const to = +li.dataset.i;
    if (to === qDrag) return;
    const [moved] = QUEUE.splice(qDrag, 1);
    QUEUE.splice(to, 0, moved);
    renderQueue();
    toast(`已调整导出顺序：第 ${to + 1} 位`);
  });
  queueEl.addEventListener("click", e => {
    const del = e.target.closest("[data-del]"); if (!del) return;
    QUEUE.splice(+del.dataset.del, 1); renderQueue();
  });
  // 运行队列（逐个推进进度）
  let running = false;
  $("#btn-run-queue").addEventListener("click", () => {
    if (running) return;
    const pending = QUEUE.filter(j => j.status !== "done");
    if (!pending.length) { toast("队列已全部导出完成", true); return; }
    running = true; toast("开始导出队列…", false, "ti-player-play");
    let idx = 0;
    const next = () => {
      const job = pending[idx];
      if (!job) { running = false; toast("导出完成，共 " + pending.length + " 张", true); return; }
      job.status = "run";
      const timer = setInterval(() => {
        job.prog = Math.min(100, job.prog + 8 + Math.random() * 14);
        if (job.prog >= 100) { job.prog = 100; job.status = "done"; clearInterval(timer); idx++; renderQueue(); next(); }
        else renderQueue();
      }, 110);
    };
    next();
  });

  /* ====================================================================
     交付画廊
     ==================================================================== */
  const deliverGrid = $("#deliver-grid");
  function renderDeliver() {
    const pool = photos.filter(p => p.rating >= 3 || p.flag === "pick");
    deliverGrid.innerHTML = pool.map(p => `
      <figure class="dcell ${state.deliverIn.has(p.id) ? "in" : ""}" data-id="${p.id}">
        <img src="${img(p.seed, 400, 280)}" alt="${p.fname}" loading="lazy">
        <span class="dcheck"><i class="ti ti-check"></i></span>
      </figure>`).join("");
    $("#deliver-count").textContent = state.deliverIn.size;
  }
  deliverGrid.addEventListener("click", e => {
    const c = e.target.closest(".dcell"); if (!c) return;
    const id = c.dataset.id;
    state.deliverIn.has(id) ? state.deliverIn.delete(id) : state.deliverIn.add(id);
    renderDeliver();
  });
  $("#dlv-generate").addEventListener("click", () => {
    const st = $("#dlv-status");
    st.querySelector(".dlv-status-text").className = "dlv-status-text mono sent";
    st.querySelector(".dlv-status-text").innerHTML = `<i class="ti ti-circle-check"></i> 已生成 · ${state.deliverIn.size} 张，等待客户查看`;
    toast(`交付画廊已生成（${state.deliverIn.size} 张）`, true, "ti-link");
  });
  $("#dlv-copy").addEventListener("click", () => {
    const url = $("#dlv-url").value;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast("链接已复制：" + url, true, "ti-copy");
  });

  // 导出预设
  const PRESETS = [
    { icon: "ti-world", name: "网络交付 · sRGB 2048px" },
    { icon: "ti-printer", name: "印刷精修 · TIFF 16bit" },
    { icon: "ti-brand-instagram", name: "社交媒体 · 1200px" },
  ];
  $("#preset-list").innerHTML = PRESETS.map((p, i) => `
    <div class="preset ${i === 0 ? "is-active" : ""}" data-i="${i}"><i class="ti ${p.icon}"></i>${p.name}</div>`).join("");
  $("#preset-list").addEventListener("click", e => {
    const p = e.target.closest(".preset"); if (!p) return;
    $$(".preset").forEach(x => x.classList.toggle("is-active", x === p));
  });

  /* ====================================================================
     视图切换
     ==================================================================== */
  function switchView(name) {
    state.view = name;
    document.body.dataset.view = name;
    $$(".rail-btn[data-go]").forEach(b => b.classList.toggle("is-active", b.dataset.go === name));
    $$(".view").forEach(v => v.classList.toggle("is-active", v.dataset.view === name));
    $$(".pane").forEach(p => p.classList.toggle("is-active", p.dataset.view.split(" ").includes(name)));
    if (name === "compare") renderCompare();
    if (name === "develop") loadDevelop(state.selectedId);
    if (name === "export") renderQueue();
    if (name === "deliver") renderDeliver();
  }
  $$(".rail-btn[data-go]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.go)));
  $("#btn-topexport").addEventListener("click", () => switchView("export"));

  // 其余按钮
  $("#btn-import").addEventListener("click", () => toast("导入功能开发中", false, "ti-photo-up"));
  $("#btn-help").addEventListener("click", () => toast("快捷键：← → 切换照片 · 调色滑块双击复位", false, "ti-keyboard"));
  $("#btn-user").addEventListener("click", () => toast("陈屿 · 独立摄影师工作室"));

  /* ---------------- 全局键盘 ---------------- */
  document.addEventListener("keydown", e => {
    if (/input|select|textarea/i.test(e.target.tagName)) return;
    if (e.target.closest('[role="slider"]')) return;
    if (e.key === "ArrowLeft")  { stepSelection(-1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { stepSelection(1); e.preventDefault(); }
    else if (e.key >= "0" && e.key <= "5") { setRating(state.selectedId, +e.key); }
    else if (e.key === "p" || e.key === "P") setFlag(state.selectedId, "pick");
    else if (e.key === "x" || e.key === "X") setFlag(state.selectedId, "reject");
  });

  /* ---------------- 初始化 ---------------- */
  refreshStats();
  renderGrid();
  renderFilmstrip();
  renderTags();
  renderInspector();
  paintStarFilter();
  buildSliders();
  dev = { ...history[curVersion].vals };
  paintAllSliders();
  renderHistory();
  renderQueue();
  setWipe(50);
})();
