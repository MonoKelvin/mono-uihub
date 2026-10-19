/* Alder — behaviour.
   Plain DOM, no framework, no storage, no network beyond images.
   Rendering lives here too: entries are built from window.ALDER so the
   four layout variants stay in sync with the stylesheet. */
(function () {
  'use strict';

  var D = window.ALDER;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── toast ────────────────────────────────────────────────── */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2000);
  }

  /* ── entry markup, one builder for all four variants ──────── */
  function entryHTML(e) {
    var a = D.AUTHORS[e.who];
    var plate = e.img
      ? '<figure class="plate">' +
          '<img src="' + e.img + '" alt="" loading="lazy" decoding="async">' +
          (e.plate ? '<figcaption class="mono">' + e.plate + '</figcaption>' : '') +
        '</figure>'
      : '';
    var body = '<p class="body"></p>';

    /* the four variants differ by what the stylesheet does with the
       same two children. no wrapper element is needed. */
    var main = body + plate;

    return '<article class="entry" data-variant="' + e.variant + '" data-id="' + e.id + '">' +
      '<img class="avatar on-rail" src="' + D.avatar(e.who) + '" alt="' + a.name + '">' +
      '<div class="entry-head">' +
        '<span class="name">' + a.name + '</span>' +
        '<span class="handle mono">' + a.handle + '</span>' +
        '<time class="mono">' + e.time + '</time>' +
      '</div>' +
      main +
      '<div class="actions">' +
        '<button class="act" type="button" data-act="reply" aria-label="Replies"><i class="ti ti-message"></i><span class="mono">' + e.replies + '</span></button>' +
        '<button class="act" type="button" data-act="repost" aria-label="Reposts" aria-pressed="false"><i class="ti ti-repeat"></i><span class="mono">' + e.reposts + '</span></button>' +
        '<button class="act" type="button" data-act="save" aria-label="Saved" aria-pressed="false"><i class="ti ti-bookmark"></i></button>' +
        '<button class="act end" type="button" data-act="share" aria-label="Share"><i class="ti ti-share"></i></button>' +
      '</div>' +
      '<div class="thread" data-thread hidden>' +
        '<div class="comment">' +
          '<img class="avatar xs" src="' + D.avatar('nke') + '" alt="Nkechi Obi">' +
          '<p><b>Nkechi Obi</b><span class="mono c3">1h</span>The thumbnail part gets me. Mine took two seasons on a north wall.</p>' +
        '</div>' +
        '<form class="replybar" data-reply>' +
          '<input type="text" placeholder="Reply to ' + a.name.split(' ')[0] + '" aria-label="Write a reply">' +
          '<button type="submit">Send</button>' +
        '</form>' +
      '</div>' +
    '</article>';
  }

  /* set textContent so user content never becomes markup */
  function fillBody(node, text) {
    var p = $('.body', node);
    if (p) p.textContent = text;
  }

  /* Remote photography can fail. A bare grey block reads as a bug,
     so swap in a captioned placeholder that keeps the layout. */
  function wireImage(img) {
    img.addEventListener('error', function () {
      var fig = img.closest('.plate');
      if (!fig || fig.dataset.failed) return;
      fig.dataset.failed = '1';
      var cap = fig.querySelector('figcaption');
      fig.classList.add('is-missing');
      img.remove();
      if (!cap) {
        cap = document.createElement('figcaption');
        cap.className = 'mono';
        cap.textContent = 'plate unavailable';
        fig.appendChild(cap);
      }
    });
  }

  function wireImages(root) {
    $$('img', root).forEach(function (img) {
      if (!img.loading) return;
      wireImage(img);
    });
  }

  /* ── feed: initial page + infinite scroll ─────────────────── */
  var feedList = $('#feedList');
  var feedFoot = $('#feedFoot');
  var feedEnd  = $('#feedEnd');
  var cursor = 0;
  var loading = false;
  var PAGE = 4;

  function renderChunk(list) {
    var frag = document.createDocumentFragment();
    list.forEach(function (e) {
      var node = document.createElement('div');
      node.innerHTML = entryHTML(e);
      var el = node.firstElementChild;
      fillBody(el, e.text);
      bindEntry(el);
      wireImages(el);
      frag.appendChild(el);
    });
    return frag;
  }

  function loadMore(reset) {
    if (loading) return;
    var slice = D.FEED.slice(cursor, cursor + PAGE);
    if (!slice.length) {
      feedFoot.hidden = true;
      feedEnd.hidden = false;
      return;
    }
    loading = true;
    if (reduce) {
      feedList.insertBefore(renderChunk(slice), reset ? feedList.firstChild : null);
      cursor += slice.length;
      loading = false;
      feedFoot.hidden = true;
      if (cursor >= D.FEED.length) feedEnd.hidden = false;
      return;
    }
    feedFoot.hidden = false;
    setTimeout(function () {
      feedList.insertBefore(renderChunk(slice), reset ? feedList.firstChild : null);
      cursor += slice.length;
      loading = false;
      if (cursor >= D.FEED.length) { feedFoot.hidden = true; feedEnd.hidden = false; }
    }, 620);
  }

  loadMore();

  /* ── one entry's interactions ─────────────────────────────── */
  function bindEntry(entry) {
    $$('.act', entry).forEach(function (btn) {
      var act = btn.dataset.act;

      if (act === 'repost' || act === 'save') {
        btn.addEventListener('click', function () {
          var on = btn.getAttribute('aria-pressed') === 'true';
          btn.setAttribute('aria-pressed', String(!on));
          if (act === 'repost') {
            var n = $('.count', btn);
            n.textContent = String(Math.max(0, parseInt(n.textContent, 10) + (on ? -1 : 1)));
            toast(on ? 'Repost undone' : 'Reposted');
          } else {
            toast(on ? 'Removed from saved' : 'Saved for later');
          }
        });
      }

      if (act === 'reply') {
        btn.addEventListener('click', function () {
          var thread = $('[data-thread]', entry);
          thread.hidden = !thread.hidden;
          if (!thread.hidden) $('input', thread).focus();
        });
      }

      if (act === 'share') {
        btn.addEventListener('click', function () { toast('Link copied'); });
      }
    });

    $$('[data-reply]', entry).forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('input', form);
        var val = input.value.trim();
        if (!val) { input.focus(); return; }
        var comment = document.createElement('div');
        comment.className = 'comment';
        comment.innerHTML =
          '<img class="avatar xs" src="' + D.avatar('mira') + '" alt="Mira Halloran">' +
          '<p><b>Mira Halloran</b><span class="mono c3">now</span></p>';
        $('p', comment).appendChild(document.createTextNode(val));
        form.parentNode.insertBefore(comment, form);
        input.value = '';
        var replyBtn = $('[data-act="reply"]', entry);
        $('.count', replyBtn).textContent = String(
          parseInt($('.count', replyBtn).textContent, 10) + 1);
        toast('Reply posted');
      });
    });
  }

  /* sentinel: load the next page as the footer approaches */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) loadMore(false);
    }, { root: $('#screen'), rootMargin: '160px' }).observe(feedFoot);
  } else {
    window.addEventListener('scroll', function () { loadMore(false); }, { passive: true });
  }

  /* ── masthead counters count up once ──────────────────────── */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduce) { el.textContent = target.toLocaleString(); return; }
    var start = null;
    var dur = 900;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  $$('.rule-stats dd').forEach(function (el, i) {
    setTimeout(function () { countUp(el); }, 260 + i * 90);
  });

  /* ── scroll effects: topbar veil, progress, to-top ────────── */
  var screen = $('#screen');
  var topbar = $('#topbar');
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');
  var lastY = 0;

  function onScroll() {
    var y = screen.scrollTop;
    var max = screen.scrollHeight - screen.clientHeight;

    topbar.classList.toggle('lifted', y > 8);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    var show = y > 700 && (y - lastY) < 40;
    toTop.hidden = !show;

    lastY = y;
  }
  screen.addEventListener('scroll', onScroll, { passive: true });

  toTop.addEventListener('click', function () {
    screen.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ── dock: sliding indicator ───────────────────────────────── */
  var dock = $('#dock');
  var dockInk = $('#dockInk');
  var topbarMid = $('#topbarMid');

  var MID = { feed: 'feed', discover: 'circles', alerts: 'activity', profile: 'you' };

  function moveInk(btn) {
    if (!btn) return;
    dockInk.style.width = btn.offsetWidth + 'px';
    dockInk.style.transform = 'translateX(' + btn.offsetLeft - 5 + 'px)';
  }

  function showView(name) {
    $$('.view').forEach(function (v) {
      var on = v.dataset.view === name;
      v.hidden = !on;
      if (on) { v.style.animation = 'none'; void v.offsetWidth; v.style.animation = ''; }
    });
    var active = null;
    $$('.dock-item[data-tab]').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('is-on', on);
      if (on) active = t;
    });
    moveInk(active);
    topbarMid.textContent = MID[name];
    screen.scrollTop = 0;
    onScroll();
  }

  $$('.dock-item[data-tab]').forEach(function (t) {
    t.addEventListener('click', function () { showView(t.dataset.tab); });
  });

  window.addEventListener('resize', function () {
    moveInk($('.dock-item[data-tab].is-on'));
    placeSwitchInk();
  });

  /* ── discover: search + join ───────────────────────────────── */
  var searchForm = $('[data-search]');
  var searchInput = $('input', searchForm);
  var searchClear = $('.search-clear', searchForm);
  var emptyNote = $('[data-empty]');

  function applyFilter() {
    var q = searchInput.value.trim().toLowerCase();
    var shown = 0;
    $$('[data-filterable] li').forEach(function (li) {
      var key = (li.dataset.key || '').toLowerCase();
      var hit = !q || key.indexOf(q) > -1 || li.textContent.toLowerCase().indexOf(q) > -1;
      li.hidden = !hit;
      if (hit) shown++;
    });
    emptyNote.hidden = shown > 0;
    searchClear.hidden = !q;
  }
  searchInput.addEventListener('input', applyFilter);
  searchClear.addEventListener('click', function () {
    searchInput.value = '';
    applyFilter();
    searchInput.focus();
  });
  searchForm.addEventListener('submit', function (e) { e.preventDefault(); });

  $$('[data-join]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var joined = btn.classList.toggle('joined');
      btn.textContent = joined ? 'Joined' : 'Join';
      toast(joined ? 'Circle joined' : 'Left the circle');
    });
  });

  /* tapping a tag searches for it */
  $$('#tagList li').forEach(function (li) {
    li.addEventListener('click', function () {
      searchInput.value = '#' + li.dataset.key;
      applyFilter();
      searchInput.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── alerts ────────────────────────────────────────────────── */
  var alertList = $('#alertList');
  var alertSummary = $('#alertSummary');
  var pip = $('#pip');

  D.ALERTS.forEach(function (a) {
    var li = document.createElement('li');
    li.dataset.id = a.id;
    if (a.unread) li.className = 'unread';
    li.innerHTML =
      '<span class="tick" aria-hidden="true"></span>' +
      '<p><b>' + a.who + '</b> ' + a.body + '</p>' +
      '<time class="mono">' + a.t + '</time>';
    alertList.appendChild(li);
  });

  function syncAlerts() {
    var n = $$('li.unread', alertList).length;
    alertSummary.textContent = n === 0 ? 'Nothing unread' : n + ' unread';
    pip.hidden = n === 0;
  }

  $$('li', alertList).forEach(function (li) {
    li.addEventListener('click', function () {
      if (!li.classList.contains('unread')) return;
      li.classList.remove('unread');
      syncAlerts();
    });
  });

  $('#markRead').addEventListener('click', function () {
    var n = $$('li.unread', alertList).length;
    if (!n) { toast('Already read'); return; }
    $$('li.unread', alertList).forEach(function (li) { li.classList.remove('unread'); });
    syncAlerts();
    toast(n + ' marked read');
  });

  var bellIcon = $('#bellBtn i');
  $('#bellBtn').addEventListener('click', function () {
    bellIcon.classList.remove('ring');
    void bellIcon.offsetWidth;
    bellIcon.classList.add('ring');
    showView('alerts');
  });
  $('#searchBtn').addEventListener('click', function () {
    showView('discover');
    setTimeout(function () { searchInput.focus(); }, 80);
  });
  syncAlerts();

  /* ── profile ───────────────────────────────────────────────── */
  var P = D.PROFILE;
  $('#pAvatar').src = D.avatar(P.who);
  $('#pBio').textContent = P.bio;
  $('#pSince').textContent = 'Joined ' + P.joined;
  $('#composerAvatar').src = D.avatar(P.who);

  P.tabs.notes.forEach(function (n) {
    var fig = document.createElement('div');
    fig.innerHTML =
      '<figure class="plate wide">' +
        '<img src="' + D.image(n.i) + '" alt="" loading="lazy" decoding="async">' +
        '<figcaption class="mono">' + n.caption + '</figcaption>' +
      '</figure>' +
      '<blockquote class="aside"><p></p><cite class="mono">' + n.t + '</cite></blockquote>';
    $('p', fig).textContent = n.quote;
    wireImage($('img', fig));
    $('#paneNotes').appendChild(fig);
  });

  P.tabs.plates.forEach(function (i) {
    var fig = document.createElement('figure');
    fig.innerHTML = '<img src="' + D.image(i) +
      '" alt="" loading="lazy" decoding="async">';
    wireImage($('img', fig));
    $('#panePlates').appendChild(fig);
  });

  P.tabs.replies.forEach(function (r) {
    var li = document.createElement('li');
    li.innerHTML = '<p></p><cite class="mono">to ' + r.to + ', ' + r.t + '</cite>';
    $('p', li).textContent = r.text;
    $('#paneReplies').appendChild(li);
  });

  /* tab underline slides to the active item */
  var switchInk = $('#switchInk');
  function placeSwitchInk() {
    var on = $('.switch.is-on');
    if (!on) return;
    switchInk.style.width = on.offsetWidth + 'px';
    switchInk.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  }
  $$('.switch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.switch').forEach(function (b) {
        b.classList.toggle('is-on', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      placeSwitchInk();
      $$('[data-pane-body]').forEach(function (p) {
        p.hidden = p.dataset.paneBody !== btn.dataset.pane;
      });
    });
  });

  $('#editBtn').addEventListener('click', function () { toast('Editing is out of scope here'); });

  /* ── composer ──────────────────────────────────────────────── */
  var sheet = $('[data-sheet]');
  var scrim = $('[data-scrim]');
  var textEl = $('#noteText');
  var sendBtn = $('#sendBtn');
  var countEl = $('#count');
  var composerForm = $('#composerForm');
  var attached = $('#attached');
  var tools = {};
  $$('.tool').forEach(function (t) { tools[t.dataset.tool] = t; });

  function openSheet() {
    scrim.hidden = false;
    sheet.hidden = false;
    setTimeout(function () { textEl.focus(); }, 90);
  }
  function closeSheet() {
    scrim.hidden = true;
    sheet.hidden = true;
    textEl.value = '';
    countEl.textContent = '0';
    countEl.parentNode.classList.remove('over');
    sendBtn.disabled = true;
    attached.hidden = true;
    attached.textContent = '';
    Object.keys(tools).forEach(function (k) { tools[k].classList.remove('on'); });
  }

  $('#writeBtn').addEventListener('click', openSheet);
  $('[data-close]').addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);

  textEl.addEventListener('input', function () {
    var len = textEl.value.length;
    countEl.textContent = String(len);
    countEl.parentNode.classList.toggle('over', len > 280);
    sendBtn.disabled = textEl.value.trim().length === 0 || len > 280;
  });

  /* Ctrl/Cmd + Enter publishes */
  textEl.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !sendBtn.disabled) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  Object.keys(tools).forEach(function (k) {
    tools[k].addEventListener('click', function () {
      var on = tools[k].classList.toggle('on');
      if (k === 'plate') {
        attached.hidden = !on;
        attached.textContent = on ? 'plate attached' : '';
        toast(on ? 'Plate attached' : 'Plate removed');
      } else {
        toast(on ? 'Place attached' : 'Place removed');
      }
    });
  });

  composerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sendBtn.click();
  });

  sendBtn.addEventListener('click', function () {
    var val = textEl.value.trim();
    if (!val || val.length > 280) return;

    var hasPlate = tools.plate.classList.contains('on');
    var entry = {
      id: 'new-' + Date.now(),
      variant: hasPlate ? 'lead' : 'plain',
      who: 'mira', time: 'now',
      replies: 0, reposts: 0,
      text: val,
      img: hasPlate ? D.image(0) : null,
      plate: hasPlate ? 'attached<span class="sep"></span>just now' : null
    };

    var node = document.createElement('div');
    node.innerHTML = entryHTML(entry);
    var el = node.firstElementChild;
    fillBody(el, val);
    bindEntry(el);
    wireImages(el);
    /* the newest note takes the lead treatment; the old lead steps down */
    var prevLead = $('[data-variant="lead"]', feedList);
    if (prevLead) prevLead.dataset.variant = 'plain';
    feedList.insertBefore(el, feedList.firstChild);

    closeSheet();
    showView('feed');
    toast('Note published');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  /* ── boot ──────────────────────────────────────────────────── */
  showView('feed');
  placeSwitchInk();
  onScroll();
})();
