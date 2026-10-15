// 翠野 · 定制奶茶付款 — 原生交互（本地假数据，刷新即还原）
(function () {
  "use strict";

  var DISCOUNT = 3;
  var DIAL_C = 880; // 2π·140，甜度量规周长
  var TOPPING_NAME = { pearl: "黑糖珍珠", jelly: "桂花冻", coconut: "鲜椰果", oat: "黄金燕麦" };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var product = $(".product");
  var cup = $(".cup");
  var dialFill = $(".dial-fill");
  var toppings = $$(".chip.tog");
  var qtyEl = $("#qty");
  var qty = 1;
  var lastTotal = 27;

  function anim(el, cls) { if (!el || reduce) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function flash(el) { anim(el, "flash"); }
  function bump() { anim(cup, "bump"); }
  function pop(el) { anim(el, "flash-sel"); }
  function yuan(n) { return "¥" + n; }

  function countTo(el, to) {
    if (reduce || to === lastTotal) { el.textContent = yuan(to); lastTotal = to; return; }
    var from = lastTotal, t0 = performance.now(), dur = 440;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = yuan(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    lastTotal = to;
  }

  // 甜度量规：level 0~1 → 弧长
  function setDial(level) { dialFill.style.strokeDashoffset = String(DIAL_C * (1 - level)); }

  // 单选组
  function bindRadio(group, onPick) {
    if (!group) return;
    var btns = $$('[role="radio"]', group);
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-checked") === "true") return;
        btns.forEach(function (b) { b.classList.remove("is-sel"); b.setAttribute("aria-checked", "false"); });
        btn.classList.add("is-sel"); btn.setAttribute("aria-checked", "true");
        pop(btn);
        if (onPick) onPick(btn);
      });
    });
  }

  bindRadio($('[aria-label="杯型"]'), function () { bump(); recompute(); });
  bindRadio($('[aria-label="甜度"]'), function (btn) { setDial(parseFloat(btn.getAttribute("data-level"))); });
  bindRadio($('[aria-label="温度与冰量"]'), function (btn) { product.classList.toggle("warm", /热|温/.test(btn.textContent)); });
  bindRadio($(".methods"));

  // 小料多选
  toppings.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var on = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!on));
      chip.classList.toggle("is-sel", !on);
      pop(chip); bump();
      recompute();
    });
  });

  // 数量
  $$(".step").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = Math.max(1, Math.min(20, qty + parseInt(b.getAttribute("data-step"), 10)));
      if (next === qty) return;
      qty = next; qtyEl.textContent = qty; flash(qtyEl); bump();
      recompute();
    });
  });

  function recompute(silent) {
    var sizeBtn = $('[data-size].is-sel');
    var sizePrice = parseInt(sizeBtn.getAttribute("data-price"), 10);
    var sizeName = sizeBtn.getAttribute("data-size") === "L" ? "大杯" : "中杯";

    var picked = toppings.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; });
    var addSum = picked.reduce(function (s, c) { return s + parseInt(c.getAttribute("data-add"), 10); }, 0);
    var subtotal = (sizePrice + addSum) * qty;
    var total = Math.max(0, subtotal - DISCOUNT);

    $("#billSize").textContent = "· " + sizeName;
    $("#billBase").textContent = yuan(sizePrice);
    $("#billQty").textContent = qty;

    $("#billAdd").innerHTML = picked.map(function (c) {
      return '<div class="bill-row"><span>加料 · ' + TOPPING_NAME[c.getAttribute("data-topping")] +
             '</span><span class="num">+' + yuan(parseInt(c.getAttribute("data-add"), 10)) + '</span></div>';
    }).join("");

    var sub = $("#billSub"); sub.textContent = yuan(subtotal); if (!silent) flash(sub);
    if (silent) { lastTotal = total; $("#payTotal").textContent = yuan(total); }
    else countTo($("#payTotal"), total);
  }

  // 杯身随光标轻微视差（仅桌面）
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    var stage = $(".dial-stage");
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      cup.style.transform = "translate3d(" + (dx * -12).toFixed(1) + "px," + (dy * -9).toFixed(1) + "px,0)";
    });
    stage.addEventListener("mouseleave", function () { cup.style.transform = ""; });
  }

  // Toast
  var toast = $("#toast"), toastTimer;
  function showToast(msg) {
    toast.innerHTML = '<i class="ti ti-cup"></i>' + msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  // 付款（克制处理态 + 轻提示，不伪造支付成功）
  var payBtn = $("#payBtn"), paying = false;
  payBtn.addEventListener("click", function () {
    if (paying) return;
    paying = true; payBtn.classList.add("is-busy");
    setTimeout(function () {
      payBtn.classList.remove("is-busy"); paying = false;
      showToast($(".method.is-sel").getAttribute("aria-label") + " · 付款功能开发中，暂未发起真实交易");
    }, 1100);
  });

  // 初始化
  recompute(true);
  var sweetSel = $('[aria-label="甜度"] .is-sel');
  var startLevel = sweetSel ? parseFloat(sweetSel.getAttribute("data-level")) : 0.3;
  if (reduce) setDial(startLevel);
  else setTimeout(function () { setDial(startLevel); }, 520); // 等量规描边后再充注
})();
