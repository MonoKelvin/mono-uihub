/* 异物 · 异常观测室 — MK 标记解析器
 * 自定义一套极简标记，用于撰写档案长文；解析为语义 HTML，样式见 styles.css 的 .mk-* 段落。
 *
 * ── 块级（行首）───────────────────────────────
 *   # 标题            分区（自动编号 + 生成目录）
 *   ## 小标题          小节
 *   > 文字            记录者按 / 引用
 *   - 文字            无序列表
 *   1. 文字           有序列表
 *   ---               分隔线
 *   :::warn 标题      警示框（warn / note / seal 三种），以单独一行 ::: 结束
 *
 * ── 行内 ──────────────────────────────────────
 *   <black>文字</black>   黑块覆盖，悬停/聚焦显示
 *   \black{文字}          同上（简写）
 *   \redact{文字}         涂黑（默认整段遮蔽）
 *   \tag{文字}            标签胶囊
 *   \unk{文字}            不详 / 无法辨认（缺省为「内容不详」）
 *   \mark{文字}           柔和高亮
 *   \em{文字}             斜体强调
 *   \icon{ti-eye}         Tabler 图标
 *   \fig{序号|图注}       内嵌标本小图（取自 specimen 瓦片）
 *   \audio{名称|时长}     录音条目（点击播放 playRecord）
 *
 * 约定：正文使用 String.raw 模板字符串存放，避免 \b 被 JS 当作退格转义。
 */
(function (App) {
  "use strict";

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const pad2 = (n) => String(n).padStart(2, "0");

  const pickTile = (i, tiles) => {
    const list = tiles && tiles.length ? tiles : [];
    if (!list.length) return "";
    const n = list.length;
    return list[((i % n) + n) % n];
  };

  /* 单遍扫描行内标记：标记之间的普通文本统一转义，标记内部内容单独转义。 */
  const INLINE_RE = new RegExp(
    [
      "<black>([\\s\\S]*?)</black>",
      "\\\\black\\{([^{}]*)\\}",
      "\\\\redact\\{([^{}]*)\\}",
      "\\\\tag\\{([^{}]*)\\}",
      "\\\\unk\\{([^{}]*)\\}",
      "\\\\mark\\{([^{}]*)\\}",
      "\\\\em\\{([^{}]*)\\}",
      "\\\\icon\\{([^{}]*)\\}",
      "\\\\fig\\{([^{}]*)\\}",
      "\\\\audio\\{([^{}]*)\\}",
    ].join("|"),
    "g"
  );

  function inline(src, ctx) {
    let out = "";
    let last = 0;
    let m;
    INLINE_RE.lastIndex = 0;
    while ((m = INLINE_RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      const g = m.slice(1);
      if (g[0] !== undefined) {
        out += `<span class="mk-black" tabindex="0" aria-label="遮蔽内容，悬停查看"><span class="mk-black-text">${esc(g[0])}</span></span>`;
      } else if (g[1] !== undefined) {
        out += `<span class="mk-black" tabindex="0" aria-label="遮蔽内容，悬停查看"><span class="mk-black-text">${esc(g[1])}</span></span>`;
      } else if (g[2] !== undefined) {
        out += `<span class="mk-redact" tabindex="0" data-len="${esc(g[2].length)}"><span class="mk-redact-text">${esc(g[2])}</span></span>`;
      } else if (g[3] !== undefined) {
        out += `<span class="mk-tag"><i class="ti ti-hash" aria-hidden="true"></i>${esc(g[3])}</span>`;
      } else if (g[4] !== undefined) {
        out += `<span class="mk-unk" title="原文此处无法辨认">${esc(g[4] || "内容不详")}</span>`;
      } else if (g[5] !== undefined) {
        out += `<em class="mk-mark">${esc(g[5])}</em>`;
      } else if (g[6] !== undefined) {
        out += `<em>${esc(g[6])}</em>`;
      } else if (g[7] !== undefined) {
        out += `<i class="ti ${esc(g[7])}" aria-hidden="true"></i>`;
      } else if (g[8] !== undefined) {
        const [rawIdx, cap] = g[8].split("|");
        const src2 = pickTile(parseInt(rawIdx, 10) || 0, ctx.specimens);
        if (src2) {
          out += `<span class="mk-fig"><img src="${src2}" alt="${esc(cap || "标本细节")}" loading="lazy"><span class="mk-fig-cap">${esc(cap || "")}</span></span>`;
        }
      } else if (g[9] !== undefined) {
        const [name, dur] = g[9].split("|");
        out += `<button type="button" class="mk-audio" data-record="${esc(name)}"><i class="ti ti-player-play" aria-hidden="true"></i><span class="mk-audio-name">${esc(name)}</span><em class="mk-audio-dur">${esc(dur || "录音")}</em></button>`;
      }
      last = INLINE_RE.lastIndex;
    }
    out += esc(src.slice(last));
    return out;
  }

  function parse(src, ctx) {
    ctx = ctx || {};
    ctx.specimens = ctx.specimens || [];

    const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
    const sections = [];
    let cur = { title: "", body: [] };
    let para = [];
    let list = null;
    let quote = null;
    let callout = null;

    const flushPara = () => {
      if (!para.length) return;
      cur.body.push(`<p>${inline(para.join(" "), ctx)}</p>`);
      para = [];
    };
    const flushList = () => {
      if (!list) return;
      const tag = list.type === "ol" ? "ol" : "ul";
      cur.body.push(`<${tag} class="mk-list ${list.type === "ol" ? "mk-list-ol" : ""}">${list.items
        .map((t) => `<li>${inline(t, ctx)}</li>`)
        .join("")}</${tag}>`);
      list = null;
    };
    const flushQuote = () => {
      if (!quote) return;
      cur.body.push(`<blockquote class="mk-quote">${quote.map((l) => `<p>${inline(l, ctx)}</p>`).join("")}</blockquote>`);
      quote = null;
    };
    const flushInlineBlocks = () => {
      flushPara();
      flushList();
      flushQuote();
    };
    const pushSection = () => {
      if (cur.title || cur.body.length) sections.push(cur);
      cur = { title: "", body: [] };
    };

    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");

      /* 警示框内部：原样累积，遇到单独一行 ::: 结束 */
      if (callout) {
        if (line.trim() === ":::") {
          cur.body.push(
            `<aside class="mk-callout mk-callout-${callout.type}"><p class="mk-callout-title"><i class="ti ${callout.icon}" aria-hidden="true"></i>${esc(
              callout.title
            )}</p>${callout.lines.map((l) => `<p>${inline(l, ctx)}</p>`).join("")}</aside>`
          );
          callout = null;
        } else if (line.trim()) {
          callout.lines.push(line.trim());
        }
        continue;
      }

      if (!line.trim()) {
        flushInlineBlocks();
        continue;
      }

      /* 警示框起始 */
      const co = line.match(/^:::(warn|note|seal)\s*(.*)$/);
      if (co) {
        flushInlineBlocks();
        const icons = { warn: "ti-alert-triangle", note: "ti-notes", seal: "ti-lock" };
        callout = { type: co[1], title: co[2] || "记录者按", lines: [], icon: icons[co[1]] };
        continue;
      }

      /* 分区 */
      const h1 = line.match(/^#\s+(.+)$/);
      if (h1) {
        flushInlineBlocks();
        pushSection();
        cur.title = h1[1].trim();
        continue;
      }

      /* 小节 */
      const h2 = line.match(/^##\s+(.+)$/);
      if (h2) {
        flushInlineBlocks();
        cur.body.push(`<h4 class="mk-h2">${inline(h2[1], ctx)}</h4>`);
        continue;
      }

      /* 分隔线 */
      if (/^---+$/.test(line.trim())) {
        flushInlineBlocks();
        cur.body.push('<hr class="mk-hr">');
        continue;
      }

      /* 引用 */
      const q = line.match(/^>\s?(.+)$/);
      if (q) {
        flushPara();
        flushList();
        (quote = quote || []).push(q[1]);
        continue;
      }

      /* 列表 */
      const ul = line.match(/^[-*]\s+(.+)$/);
      const ol = line.match(/^\d+[.)]\s+(.+)$/);
      if (ul || ol) {
        flushPara();
        flushQuote();
        const type = ol ? "ol" : "ul";
        if (!list || list.type !== type) {
          flushList();
          list = { type, items: [] };
        }
        list.items.push((ul ? ul[1] : ol[1]).trim());
        continue;
      }

      /* 普通段落 */
      flushList();
      flushQuote();
      para.push(line.trim());
    }
    flushInlineBlocks();
    pushSection();

    if (!sections.length) return "";

    /* 首段若出现在任何 # 之前，作为「卷首」单列 */
    if (!sections[0].title) sections[0].title = "卷首";

    const toc = sections
      .map(
        (s, i) =>
          `<li><a href="#mk-s${i}" data-mk="mk-s${i}"><span class="mk-toc-num">${pad2(i + 1)}</span><span class="mk-toc-label">${esc(
            s.title
          )}</span></a></li>`
      )
      .join("");

    const body = sections
      .map(
        (s, i) =>
          `<section class="mk-sec" id="mk-s${i}"><h3 class="mk-h"><span class="mk-h-num">${pad2(i + 1)}</span><span class="mk-h-text">${esc(
            s.title
          )}</span></h3>${s.body.join("")}</section>`
      )
      .join("");

    return `<div class="mk-doc"><nav class="mk-toc" aria-label="档案目录"><p class="mk-toc-title"><i class="ti ti-list-details" aria-hidden="true"></i>本档案目录<span class="mk-toc-count">${pad2(
      sections.length
    )} 节</span></p><ol>${toc}</ol></nav>${body}</div>`;
  }

  App.mk = { parse, inline };
})(window.App);
