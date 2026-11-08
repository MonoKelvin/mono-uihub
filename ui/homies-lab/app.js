/* ═══════════════════════════════════════════════════════════════
   HomiesLab — SS/24
   Native JS. GSAP is used only where CSS genuinely cannot do the
   job: two-way overlay timelines, pointer-driven depth, and scroll
   reveals.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── utils ─────────────────────────────────────────────────── */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var on = function (el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); };

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var calm = function () { return motion.matches; };
  var hasGsap = function () { return typeof window.gsap === 'function'; };

  var FREE_SHIPPING = 200;
  var SHIPPING_FEE  = 18;
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };

  /* ── catalogue ─────────────────────────────────────────────── */
  var CATALOGUE = {
    w1: { name: 'Ash Slip Dress', fabric: 'Whisper', price: 148, img: './assets/piece-01.webp',
          text: 'Cut on the bias from one length of Whisper, with a French seam at the side so nothing presses through the front.',
          sizes: ['XS', 'S', 'M', 'L', 'XL'], gone: ['XS'],
          colours: [['mist', 'Mist'], ['ash', 'Ash'], ['ink', 'Ink']] },
    w2: { name: 'Field Wool Coat', fabric: 'Western', price: 288, img: './assets/piece-06.webp',
          text: 'Twelve-ounce twill shell over a wool body. Unlined at the sleeve so it slides on over a knit.',
          sizes: ['S', 'M', 'L', 'XL'], gone: [],
          colours: [['sand', 'Sand'], ['clay', 'Clay'], ['ink', 'Ink']] },
    w3: { name: 'Mist Blouse', fabric: 'Chiffon', price: 142, img: './assets/piece-05.webp',
          text: 'Doubled chiffon through the body, single layer at the cuff. The placket hides every button.',
          sizes: ['XS', 'S', 'M', 'L'], gone: ['XS'],
          colours: [['mist', 'Mist'], ['bone', 'Bone'], ['sage', 'Sage']] },
    w4: { name: 'Salt Knit Crew', fabric: 'Whisper', price: 132, img: './assets/piece-02.webp',
          text: 'A fine twelve-gauge knit with a rolled collar. It keeps its shape because the yarn is never blended.',
          sizes: ['S', 'M', 'L', 'XL'], gone: [],
          colours: [['bone', 'Bone'], ['ash', 'Ash'], ['sky', 'Sky']] },
    w5: { name: 'Wide Twill Trouser', fabric: 'Western', price: 156, img: './assets/piece-04.webp',
          text: 'A high, clean waistband and a leg that breaks once at the shoe. Pressed crease, no pleats.',
          sizes: ['XS', 'S', 'M', 'L', 'XL'], gone: [],
          colours: [['ash', 'Ash'], ['ink', 'Ink'], ['sand', 'Sand']] },
    w6: { name: 'Cloud Dress', fabric: 'Chiffon', price: 176, img: './assets/piece-09.webp',
          text: 'Three layers of crepe chiffon over a slip, gathered at the shoulder so the volume falls away from the body.',
          sizes: ['XS', 'S', 'M', 'L'], gone: ['L'],
          colours: [['sage', 'Sage'], ['mist', 'Mist'], ['rust', 'Rust']] },
    w7: { name: 'Paper Shirt', fabric: 'Whisper', price: 118, img: './assets/piece-03.webp',
          text: 'Crisp enough to stand on its own, soft enough to sleep in. A curved hem you can wear out.',
          sizes: ['XS', 'S', 'M', 'L', 'XL'], gone: [],
          colours: [['bone', 'Bone'], ['sky', 'Sky'], ['ash', 'Ash']] },
    w8: { name: 'Dune Skirt', fabric: 'Chiffon', price: 126, img: './assets/piece-07.webp',
          text: 'Cut on a full circle and faced at the hem, so it moves a beat behind you and never clings.',
          sizes: ['XS', 'S', 'M', 'L'], gone: [],
          colours: [['sand', 'Sand'], ['mist', 'Mist'], ['clay', 'Clay']] },
    w9: { name: 'Chore Jacket', fabric: 'Western', price: 198, img: './assets/piece-08.webp',
          text: 'Three patch pockets, a boxy shoulder, and a wash that fades on the fold lines within a month.',
          sizes: ['S', 'M', 'L', 'XL'], gone: ['XL'],
          colours: [['ink', 'Ink'], ['sky', 'Sky'], ['sage', 'Sage']] }
  };

  /* ── overlay machinery: one timeline per layer, play / reverse ─ */
  var openLayers = [];
  var scrimTl = null;

  function buildScrim() {
    var scrim = $('[data-scrim]');
    if (!scrim) return null;
    if (!hasGsap() || calm()) return null;
    return window.gsap.timeline({ paused: true })
      .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: 'power2.out' });
  }

  function syncScrim() {
    var scrim = $('[data-scrim]');
    if (!scrim) return;
    if (openLayers.length) {
      scrim.hidden = false;
      if (scrimTl) scrimTl.play(); else scrim.style.opacity = '1';
    } else if (scrimTl) {
      scrimTl.reverse();
    } else {
      scrim.hidden = true;
    }
  }

  function makeOverlay(opts) {
    var layer = opts.layer;
    var panel = opts.panel;
    var api = { key: opts.key, layer: layer, isOpen: false, tl: null, lastFocus: null };

    if (layer) {
      layer.setAttribute('aria-hidden', 'true');
      if (hasGsap() && !calm()) {
        var tl = window.gsap.timeline({
          paused: true,
          onStart: function () { layer.hidden = false; layer.setAttribute('aria-hidden', 'false'); },
          onReverseComplete: function () {
            layer.hidden = true;
            layer.setAttribute('aria-hidden', 'true');
            if (opts.onClose) opts.onClose();
          }
        });
        tl.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0);
        if (panel && opts.from) {
          tl.fromTo(panel, opts.from, window.gsap.utils.extend({
            duration: 0.44, ease: 'power3.out'
          }, opts.to), 0);
        }
        api.tl = tl;
      }
    }

    api.open = function () {
      if (api.isOpen) return;
      api.isOpen = true;
      api.lastFocus = document.activeElement;
      openLayers.push(api);
      syncScrim();
      if (api.tl) { api.tl.play(); } else if (layer) {
        layer.hidden = false;
        layer.setAttribute('aria-hidden', 'false');
      }
      var target = panel ? $('[data-autofocus]', panel) || panel : null;
      if (target) {
        if (target === panel && panel.tabIndex < 0) panel.tabIndex = -1;
        window.requestAnimationFrame(function () { target.focus({ preventScroll: true }); });
      }
    };

    api.close = function () {
      if (!api.isOpen) return;
      api.isOpen = false;
      openLayers = openLayers.filter(function (l) { return l !== api; });
      syncScrim();
      if (api.tl) { api.tl.reverse(); } else {
        if (layer) { layer.hidden = true; layer.setAttribute('aria-hidden', 'true'); }
        if (opts.onClose) opts.onClose();
      }
      if (api.lastFocus && api.lastFocus.focus) api.lastFocus.focus({ preventScroll: true });
    };

    return api;
  }

  function trapFocus(ev) {
    if (!openLayers.length || ev.key !== 'Tab') return;
    var layer = openLayers[openLayers.length - 1].layer;
    if (!layer) return;
    var items = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', layer)
      .filter(function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  /* ── 1. hero word: fit the line to the available width ─────── */
  function initHeroFit() {
    var hero = $('.hero.canvas');
    var span = hero && $('[data-fit]', hero);
    var title = hero && $('.hero__title', hero);
    if (!hero || !span || !title) return;

    function fit() {
      if (window.matchMedia('(max-width: 820px)').matches) {
        hero.style.removeProperty('--hero-title-size');
        return;
      }
      var box = title.clientWidth;              /* the word's own measure */
      if (!box) return;
      span.style.fontSize = '100px';
      var measured = span.getBoundingClientRect().width;
      span.style.fontSize = '';
      if (!measured) return;
      var target = box * 0.98;
      var size = target / (measured / 100);     /* px of type that fills the measure */
      /* apply it, then verify against the real layout and correct once */
      hero.style.setProperty('--hero-title-size', size.toFixed(2) + 'px');
      var now = span.getBoundingClientRect().width;
      var current = parseFloat(window.getComputedStyle(span).fontSize) || size;
      if (now > 0 && current > 0) size = target / (now / current);
      /* never let the word grow taller than its band */
      size = Math.min(size, hero.clientHeight * 0.19);
      size = Math.max(36, Math.min(260, size));
      hero.style.setProperty('--hero-title-size', size.toFixed(2) + 'px');
    }

    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(hero);
    else on(window, 'resize', fit);
  }

  /* ── 2. hero depth: pointer-driven, quickTo for the continuous value ── */
  function initHeroDepth() {
    var hero = $('.hero.canvas');
    var figure = $('.hero__figure', hero || document);
    var title = $('.hero__title', hero || document);
    if (!hero || !figure || !title || !hasGsap() || calm()) return;

    var g = window.gsap;
    var figX = g.quickTo(figure, 'x', { duration: 0.9, ease: 'power3' });
    var figY = g.quickTo(figure, 'y', { duration: 0.9, ease: 'power3' });
    var ttlX = g.quickTo(title, 'x', { duration: 1.1, ease: 'power3' });

    on(hero, 'pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect();
      if (!r.width) return;
      var u = r.width / 100;                        /* one cqw in px */
      var dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      figX(dx * .8 * u);
      figY(dy * .5 * u);
      ttlX(dx * -.5 * u);
    });
    on(hero, 'pointerleave', function () { figX(0); figY(0); ttlX(0); });
  }

  /* ── 3. dropdowns: drawn panel, full keyboard support ───────── */
  function initDropdown(root, onChange) {
    var trigger = $('.dd__trigger', root);
    var panel = $('.dd__panel', root);
    if (!trigger || !panel) return;
    var valueEl = $('[data-dd-value]', root);
    var options = $$('.dd__opt', root);
    var isOpen = false;

    function setOpen(next) {
      isOpen = next;
      trigger.setAttribute('aria-expanded', String(next));
      root.classList.toggle('is-open', next);
      panel.hidden = !next;
      if (next) {
        var current = options.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0];
        (current || options[0]).focus();
      }
    }

    function choose(opt) {
      if (!opt || opt.getAttribute('aria-disabled') === 'true') return;
      options.forEach(function (o) { o.setAttribute('aria-selected', String(o === opt)); });
      if (valueEl) valueEl.textContent = opt.getAttribute('data-value');
      setOpen(false);
      trigger.focus();
      if (onChange) onChange(opt.getAttribute('data-value'));
    }

    on(trigger, 'click', function () { setOpen(!isOpen); });

    options.forEach(function (opt, i) {
      on(opt, 'click', function () { choose(opt); });
      on(opt, 'pointerenter', function () {
        options.forEach(function (o) { o.classList.remove('is-active'); });
        if (opt.getAttribute('aria-disabled') !== 'true') opt.classList.add('is-active');
      });
      on(opt, 'keydown', function (ev) {
        var k = ev.key;
        if (k === 'ArrowDown' || k === 'ArrowUp') {
          ev.preventDefault();
          var step = k === 'ArrowDown' ? 1 : -1;
          var n = options.length;
          for (var move = 1; move <= n; move++) {
            var candidate = options[(i + step * move + n * 2) % n];
            if (candidate && candidate.getAttribute('aria-disabled') !== 'true') { candidate.focus(); break; }
          }
        } else if (k === 'Home') { ev.preventDefault(); options[0].focus(); }
        else if (k === 'End') { ev.preventDefault(); options[options.length - 1].focus(); }
        else if (k === 'Escape') { ev.preventDefault(); setOpen(false); trigger.focus(); }
      });
    });

    on(root, 'keydown', function (ev) {
      if (ev.key === 'Escape' && isOpen) { ev.preventDefault(); setOpen(false); trigger.focus(); }
    });

    document.addEventListener('click', function (ev) {
      if (isOpen && !root.contains(ev.target)) setOpen(false);
    });

    return { close: function () { setOpen(false); } };
  }

  /* ── 4. the drop: filter, search, sort, pagination ──────────── */
  function initDrop() {
    var grid = $('[data-grid]');
    if (!grid) return;
    var pieces = $$('.piece', grid);
    var chips = $$('[data-filter]');
    var search = $('[data-search]');
    var countEl = $('[data-count]');
    var emptyEl = $('[data-grid-state]');
    var skeleton = $('[data-skeleton]');
    var moreBtn = $('[data-more]');
    var moreWrap = moreBtn && moreBtn.parentNode;
    var loading = false;

    var state = { filter: 'all', sort: 'new', q: '', shown: 6 };
    var PAGE = 3;

    function matches(el) {
      if (state.filter !== 'all' && el.getAttribute('data-fabric') !== state.filter) return false;
      if (state.q) {
        var hay = (el.textContent + ' ' + el.getAttribute('data-fabric')).toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    }

    function sortValue(el) {
      if (state.sort === 'low')  return parseFloat(el.getAttribute('data-price'));
      if (state.sort === 'high') return -parseFloat(el.getAttribute('data-price'));
      return -new Date(el.getAttribute('data-added')).getTime() / 1e11;
    }

    function render() {
      var list = pieces.filter(matches);
      list.sort(function (a, b) { return sortValue(a) - sortValue(b); });
      list.forEach(function (el) { grid.appendChild(el); });

      pieces.forEach(function (el) {
        var visible = list.indexOf(el) > -1 && list.indexOf(el) < state.shown;
        el.hidden = !visible;
      });

      if (countEl) countEl.textContent = list.length === 1 ? '1 piece' : list.length + ' pieces';
      if (emptyEl) emptyEl.hidden = list.length !== 0;
      grid.hidden = list.length === 0;
      if (moreWrap) moreWrap.hidden = list.length <= state.shown;
    }

    function setFilter(value) {
      state.filter = value;
      state.shown = 6;
      chips.forEach(function (c) {
        var on_ = c.getAttribute('data-filter') === value;
        c.classList.toggle('is-on', on_);
        c.setAttribute('aria-pressed', String(on_));
      });
      render();
    }

    chips.forEach(function (chip) {
      on(chip, 'click', function () { setFilter(chip.getAttribute('data-filter')); });
    });

    var debounce;
    on(search, 'input', function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () {
        state.q = search.value.trim().toLowerCase();
        state.shown = 6;
        render();
      }, 170);
    });

    var resetBtn = $('[data-grid-reset]');
    on(resetBtn, 'click', function () {
      if (search) search.value = '';
      state.q = '';
      setFilter('all');
      if (search) search.focus();
    });

    initDropdown($('.dd--sort'), function (value) {
      state.sort = value;
      render();
    });

    function loadMore() {
      if (loading) return;
      loading = true;
      if (skeleton) skeleton.hidden = false;
      moreBtn.disabled = true;
      window.setTimeout(function () {
        loading = false;
        state.shown += PAGE;
        if (skeleton) skeleton.hidden = true;
        moreBtn.disabled = false;
        render();
      }, 420);
    }
    on(moreBtn, 'click', loadMore);

    /* first paint: show the loading state once, then the real grid */
    grid.hidden = true;
    if (skeleton) skeleton.hidden = false;
    window.setTimeout(function () {
      if (skeleton) skeleton.hidden = true;
      grid.hidden = false;
      render();
    }, 520);

    return { setFilter: setFilter };
  }

  /* ── 5. piece dialog ───────────────────────────────────────── */
  function initPiece(overlay, addToBag) {
    var modal = $('[data-piece-modal]');
    if (!modal) return null;
    var img = $('[data-piece-img]');
    var nameEl = $('[data-piece-name]');
    var fabricEl = $('[data-piece-fabric]');
    var priceEl = $('[data-piece-price]');
    var textEl = $('[data-piece-text]');
    var sizesEl = $('[data-sizes]');
    var coloursEl = $('[data-colours]');
    var qtyOut = $('[data-qty-value]');
    var qtyMinus = $('[data-qty="-1"]');
    var qtyPlus = $('[data-qty="1"]');
    var addBtn = $('[data-add]');
    var hint = $('[data-add-hint]');
    var current = null;
    var qty = 1;

    function setQty(n) {
      qty = Math.max(1, Math.min(9, n));
      if (qtyOut) qtyOut.textContent = String(qty);
      if (qtyMinus) qtyMinus.disabled = qty <= 1;
      if (qtyPlus) qtyPlus.disabled = qty >= 9;
    }

    function radio(name, value, label, extra, checked, disabled) {
      var id = 'pc-' + current + '-' + name + '-' + value;
      return '<input type="radio" id="' + id + '" name="' + name + '" value="' + value + '"' +
        (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + ' />' +
        '<label for="' + id + '"' + (extra ? ' title="' + extra + '"' : '') + '>' +
        (name === 'colour' ? '<span class="sw sw--' + value + '"></span>' : value) + '</label>';
    }

    function open(id) {
      var data = CATALOGUE[id];
      if (!data) return;
      current = id;
      if (img) { img.src = data.img; img.alt = data.name; }
      if (nameEl) nameEl.textContent = data.name;
      if (fabricEl) fabricEl.textContent = data.fabric;
      if (priceEl) priceEl.textContent = money(data.price);
      if (textEl) textEl.textContent = data.text;
      if (sizesEl) {
        // default to the first size that is actually available
        var firstOpen = 0;
        for (var si = 0; si < data.sizes.length; si++) {
          if (data.gone.indexOf(data.sizes[si]) === -1) { firstOpen = si; break; }
        }
        sizesEl.innerHTML = data.sizes.map(function (s, i) {
          return radio('size', s, s, '', i === firstOpen, data.gone.indexOf(s) > -1);
        }).join('');
      }
      if (coloursEl) {
        coloursEl.innerHTML = data.colours.map(function (c, i) {
          return radio('colour', c[0], c[1], c[1], i === 0, false);
        }).join('');
      }
      setQty(1);
      if (hint) { hint.textContent = ''; hint.removeAttribute('data-tone'); }
      if (overlay) overlay.open();
    }

    $$('[data-piece]').forEach(function (btn) {
      on(btn, 'click', function () { open(btn.getAttribute('data-piece')); });
    });

    on($('[data-piece-close]'), 'click', function () { if (overlay) overlay.close(); });
    on(qtyMinus, 'click', function () { setQty(qty - 1); });
    on(qtyPlus, 'click', function () { setQty(qty + 1); });

    on(addBtn, 'click', function () {
      if (!current) return;
      var sizeInput = $('input[name="size"]:checked', sizesEl);
      var colourInput = $('input[name="colour"]:checked', coloursEl);
      if (!sizeInput || !colourInput) {
        if (hint) { hint.textContent = 'Pick a size and a colour first.'; hint.setAttribute('data-tone', 'bad'); }
        return;
      }
      var data = CATALOGUE[current];
      addToBag({
        id: current,
        name: data.name,
        price: data.price,
        img: data.img,
        size: sizeInput.value,
        colour: colourInput.value,
        qty: qty
      });
      if (hint) {
        hint.textContent = data.name + ', ' + sizeInput.value + ', ' + colourInput.value +
          ' × ' + qty + ' is in your order.';
        hint.removeAttribute('data-tone');
      }
      if (overlay) overlay.close();
    });

    return { open: open };
  }

  /* ── 6. the order drawer ───────────────────────────────────── */
  function initBag(overlay) {
    var drawer = $('[data-bag]');
    if (!drawer) return null;
    var listEl = $('[data-bag-list]');
    var emptyEl = $('[data-bag-empty]');
    var totalEl = $('[data-bag-total]');
    var checkout = $('[data-checkout]');
    var shipLabel = $('[data-ship-label]');
    var shipValue = $('[data-ship-value]');
    var shipBar = $('[data-ship-bar]');
    var shipFill = $('[data-ship-fill]');
    var items = [];
    var region = 'South Asia';

    function subtotal() {
      return items.reduce(function (n, it) { return n + it.price * it.qty; }, 0);
    }

    function render() {
      var total = subtotal();
      var free = total >= FREE_SHIPPING;

      if (listEl) {
        listEl.innerHTML = items.map(function (it, i) {
          return '<li class="bag-item">' +
            '<span class="bag-item__shot"><img src="' + it.img + '" alt="" /></span>' +
            '<span>' +
              '<span class="bag-item__name">' + it.name + '</span>' +
              '<span class="bag-item__meta">' + it.size + ' · ' + it.colour + ' · ×' + it.qty + '</span>' +
            '</span>' +
            '<span class="bag-item__right">' +
              '<span class="bag-item__price">' + money(it.price * it.qty) + '</span>' +
              '<button class="bag-item__remove" type="button" data-remove="' + i + '">Remove</button>' +
            '</span>' +
          '</li>';
        }).join('');
      }

      if (emptyEl) emptyEl.hidden = items.length > 0;
      if (totalEl) totalEl.textContent = money(free ? total : total + SHIPPING_FEE);

      if (shipLabel) {
        shipLabel.textContent = free
          ? 'Free shipping to ' + region
          : money(FREE_SHIPPING - total) + ' to free shipping';
      }
      if (shipValue) shipValue.textContent = free ? '$0' : money(SHIPPING_FEE);
      if (shipBar) {
        shipBar.setAttribute('aria-valuenow', String(Math.min(total, FREE_SHIPPING)));
        shipBar.setAttribute('aria-valuetext', money(total) + ' of ' + money(FREE_SHIPPING));
      }
      if (shipFill) shipFill.style.width = Math.min(100, total / FREE_SHIPPING * 100) + '%';

      if (checkout) checkout.disabled = items.length === 0;
      var units = items.reduce(function (a, it) { return a + it.qty; }, 0);
      $$('[data-bag-count]').forEach(function (el) {
        el.textContent = units === 0 ? '' : String(units);
        el.hidden = units === 0;
      });
    }

    function add(entry) {
      var same = items.filter(function (it) {
        return it.id === entry.id && it.size === entry.size && it.colour === entry.colour;
      })[0];
      if (same) same.qty = Math.min(9, same.qty + entry.qty);
      else items.push(entry);
      render();
      return entry;
    }

    on(listEl, 'click', function (ev) {
      var btn = ev.target.closest('[data-remove]');
      if (!btn) return;
      items.splice(parseInt(btn.getAttribute('data-remove'), 10), 1);
      render();
    });

    $$('[data-bag-open]').forEach(function (btn) { on(btn, 'click', function () { overlay.open(); }); });
    on($('[data-bag-close]'), 'click', function () { overlay.close(); });
    on($('[data-bag-browse]'), 'click', function () {
      overlay.close();
      var drop = $('#collection');
      if (drop) drop.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
    });

    on(checkout, 'click', function () {
      toast('Payment runs through the store service. Write to hello@homieslab.studio and the studio will take the order from there.');
    });

    return {
      add: add,
      setRegion: function (next) { region = next; render(); },
      render: render
    };
  }

  /* ── 7. lookbook viewer ────────────────────────────────────── */
  function initViewer(overlay) {
    var viewer = $('[data-viewer]');
    var track = $('[data-look-track]');
    if (!viewer || !track) return;
    var plates = $$('.plate', track);
    var img = $('[data-viewer-img]');
    var cap = $('[data-viewer-cap]');
    var idx = $('[data-viewer-index]');
    var tot = $('[data-viewer-total]');
    var index = 0;

    if (tot) tot.textContent = String(plates.length).padStart(2, '0');

    function show(n) {
      index = (n + plates.length) % plates.length;
      var plate = plates[index];
      var source = $('img', plate);
      var caption = $('figcaption', plate);
      if (img) { img.src = source.getAttribute('src'); img.alt = source.getAttribute('alt'); }
      if (cap) cap.textContent = caption ? caption.textContent : '';
      if (idx) idx.textContent = String(index + 1).padStart(2, '0');
    }

    on($('[data-look-open]'), 'click', function () { show(0); overlay.open(); });
    on($('[data-viewer-close]'), 'click', function () { overlay.close(); });
    on($('[data-viewer-prev]'), 'click', function () { show(index - 1); });
    on($('[data-viewer-next]'), 'click', function () { show(index + 1); });
    $$('[data-plate]').forEach(function (btn) {
      on(btn, 'click', function () { show(parseInt(btn.getAttribute('data-plate'), 10)); overlay.open(); });
    });

    /* the inline track: arrows step the scroll position, and report the index */
    var inlineIdx = $('[data-look-index]');
    var inlineTot = $('[data-look-total]');
    if (inlineTot) inlineTot.textContent = String(plates.length).padStart(2, '0');

    /* one plate of travel, measured from the real layout (column width + gap) */
    function advance() {
      if (plates.length > 1) return plates[1].getBoundingClientRect().left - plates[0].getBoundingClientRect().left;
      return plates[0] ? plates[0].getBoundingClientRect().width : 320;
    }

    function atEnd() {
      return track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    }

    function currentIndex() {
      var width = advance();
      var n = width > 0 ? Math.round(track.scrollLeft / width) : 0;
      if (atEnd()) n = plates.length - 1;
      return Math.max(0, Math.min(plates.length - 1, n));
    }

    var prevBtn = $('[data-look-prev]');
    var nextBtn = $('[data-look-next]');

    function sync() {
      if (inlineIdx) inlineIdx.textContent = String(currentIndex() + 1).padStart(2, '0');
      var max = track.scrollWidth - track.clientWidth;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = max <= 1 || atEnd();
    }

    function step(dir) {
      track.scrollBy({ left: dir * advance(), behavior: calm() ? 'auto' : 'smooth' });
    }
    on(prevBtn, 'click', function () { step(-1); });
    on(nextBtn, 'click', function () { step(1); });

    on(track, 'scroll', sync, { passive: true });
    on(window, 'resize', sync);
    sync();

    return { show: show };
  }

  /* ── 8. dispatch form ──────────────────────────────────────── */
  function initDispatch() {
    var form = $('[data-sub]');
    if (!form) return;
    var input = $('[data-sub-input]');
    var submit = $('[data-sub-submit]');
    var status = $('[data-sub-status]');
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function say(message, tone) {
      if (!status) return;
      status.textContent = message;
      if (tone) status.setAttribute('data-tone', tone);
      else status.removeAttribute('data-tone');
    }

    on(input, 'input', function () {
      if (input.getAttribute('aria-invalid') === 'true' && valid.test(input.value.trim())) {
        input.removeAttribute('aria-invalid');
        say('');
      }
    });

    on(form, 'submit', function (ev) {
      ev.preventDefault();
      var value = input.value.trim();
      if (!value) {
        input.setAttribute('aria-invalid', 'true');
        say('Add an address so we know where to send it.', 'bad');
        input.focus();
        return;
      }
      if (!valid.test(value)) {
        input.setAttribute('aria-invalid', 'true');
        say('That address is missing something.', 'bad');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      submit.disabled = true;
      say('Checking the address…');

      window.setTimeout(function () {
        submit.disabled = false;
        say('No list is connected to this page yet, so nothing was sent. Write to hello@homieslab.studio and the studio will add you by hand.');
      }, 620);
    });
  }

  /* ── 9. menu + smooth scrolling ────────────────────────────── */
  function initMenu(overlay) {
    var menu = $('[data-menu]');
    if (!menu) return;
    var trigger = $('[data-menu-open]');

    function open() {
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      overlay.open();
    }
    function close() {
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      overlay.close();
    }
    on(trigger, 'click', open);
    on($('[data-menu-close]'), 'click', close);
    $$('a[data-scroll]', menu).forEach(function (link) { on(link, 'click', close); });
    on($('[data-bag-open]', menu), 'click', close);
  }

  function goTo(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  }

  function initScroll() {
    $$('a[data-scroll]').forEach(function (link) {
      on(link, 'click', function (ev) {
        var id = link.getAttribute('href');
        if (!id || id.charAt(0) !== '#' || id === '#') return;
        ev.preventDefault();
        goTo(id);
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
    $$('[data-scroll-to]').forEach(function (btn) {
      on(btn, 'click', function () { goTo(btn.getAttribute('data-scroll-to')); });
    });
  }

  /* ── 10. scroll reveals ─────────────────────────────────────── */
  function initReveals() {
    if (!hasGsap() || calm() || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    $$('.head, .weave, .grid, .look__track, .dispatch__inner, .foot__grid').forEach(function (el) {
      window.gsap.from(el, {
        y: 26,
        opacity: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ── 11. toast ─────────────────────────────────────────────── */
  var toastTimer;
  function toast(message) {
    var el = $('[data-toast]');
    if (!el) return;
    window.clearTimeout(toastTimer);
    el.textContent = message;
    el.hidden = false;
    if (hasGsap() && !calm()) {
      window.gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' });
    }
    toastTimer = window.setTimeout(function () { el.hidden = true; }, 3600);
  }

  /* ── boot: idempotent ──────────────────────────────────────── */
  var booted = false;

  function start() {
    if (booted) return;
    booted = true;

    scrimTl = buildScrim();

    var bagDrawer = $('[data-bag]');
    var bagOverlay = makeOverlay({
      key: 'bag', layer: bagDrawer, panel: bagDrawer,
      from: { xPercent: 100 }, to: { xPercent: 0 }
    });
    var pieceOverlay = makeOverlay({
      key: 'piece', layer: $('[data-piece-modal]'), panel: $('.modal__panel'),
      from: { y: 24, opacity: 0, scale: 0.97 }, to: { y: 0, opacity: 1, scale: 1 }
    });
    var menuOverlay = makeOverlay({
      key: 'menu', layer: $('[data-menu]'),
      onClose: function () { var t = $('[data-menu-open]'); if (t) t.setAttribute('aria-expanded', 'false'); }
    });
    var viewerOverlay = makeOverlay({ key: 'viewer', layer: $('[data-viewer]') });

    initHeroFit();
    initHeroDepth();
    initDropdown($('[data-dd-name="region"]'), function (value) {
      $$('[data-region-readout]').forEach(function (el) { el.textContent = value; });
      if (bag) bag.setRegion(value);
      toast('Shipping set to ' + value + '.');
    });
    initDrop();

    var bag = initBag(bagOverlay);
    initPiece(pieceOverlay, function (entry) {
      var added = bag.add(entry);
      toast(added.name + ', ' + added.size + ', ' + added.colour + ' × ' + added.qty + ' added to your order.');
    });

    initViewer(viewerOverlay);
    initMenu(menuOverlay);
    initDispatch();
    initScroll();
    initReveals();

    var scrim = $('[data-scrim]');
    on(scrim, 'click', function () {
      while (openLayers.length) openLayers[openLayers.length - 1].close();
    });

    on(document, 'keydown', function (ev) {
      if (ev.key === 'Escape' && openLayers.length) {
        openLayers[openLayers.length - 1].close();
      } else {
        trapFocus(ev);
      }
    });

    bag.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.HomiesLab = { start: start, catalogue: CATALOGUE };
})();
