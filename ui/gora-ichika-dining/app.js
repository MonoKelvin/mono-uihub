/* ============================================================
   強羅 一花 : 御献立と御注文
   i18n(ja/zh) / 献立 / 御注文 / 控え / 平滑スクロール
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  /* ---------------- text ---------------- */

  const T = {
    ja: {
      'doc.title': '強羅 一花 | 御献立と御注文',
      'doc.desc': '箱根強羅の宿、一花。九品の会席と山の湯。お日にちとお時間をお選びいただき、御注文を承ります。',
      'brand.place': '箱根強羅',
      'nav.menu': '献立', 'nav.order': '御注文', 'nav.info': '宿の案内',
      'hero.vlabel': '箱根強羅',
      'hero.t1': '旬は、', 'hero.t2': '待たない。',
      'hero.sub': '十月の会席、本日より承ります。',
      'hero.cta': '御注文へ',
      'hero.alt': '障子越しの夕暮れ、畳廊下',
      'fact.rooms': '客室', 'fact.roomsUnit': '室',
      'fact.courses': '会席', 'fact.coursesUnit': '品',
      'fact.bath': '山の湯', 'fact.bathText': '源泉かけ流し',
      'creed.l1': '山の湯に、秋が沈む。',
      'creed.l2': '器の上に、秋がのぼる。',
      'creed.note': '献立は、その日の山から。',
      'creed.sign': '箱根強羅　一花',
      'menu.title': '献立',
      'menu.note': '当日の入りで一品替わる場合がございます。',
      'menu.allergen': '苦手な食材',
      'tab.kaiseki': '会席', 'tab.breakfast': '朝食', 'tab.tea': '茶事',
      'season.kicker': '今月の一品',
      'season.title': '秋の八寸',
      'season.body': '栗、鱒、海老芋。',
      'season.meta': '盆は高野木工、椀は常滑。',
      'season.haiku': '秋深き　隣は何を　する人ぞ',
      'season.attr': '松尾芭蕉',
      'season.alt': '紅葉を添えた秋の八寸',
      'order.title': '御注文',
      'order.lead': 'お日にちとお時間をお選びください。',
      'grp.menu': '献立', 'grp.main': '主菜', 'grp.drinks': '御酒とお茶',
      'grp.when': 'お日にちとお時間', 'grp.room': '御人数とお席', 'grp.req': 'ご要望',
      'party.label': '尊客', 'party.hint': '会席は二名より承ります。',
      'req.note': 'ご苦手な食材、記念日、お迎えのご希望など。',
      'req.ph': '例　甲殻類を抜いて、椀物を差し替えでお願いします。',
      'sum.title': '御注文', 'sum.sub': '税・サービス料込', 'sum.total': '合計',
      'sum.cta': '控えを確認',
      'sum.hint1': 'お日にちとお時間をお選びください',
      'sum.hint2': 'お時間をお選びください',
      'sum.hint3': '御注文の控えをご確認いただけます',
      'sum.rate': '',
      'want.date': 'お日にちを先にお選びください。',
      'when.note': '水曜定休',
      'courses.note': '献立はご到着の前日に確定いたします。',
      'courses.sub': '苦手な食材により、{{n}}品を差し替えてご用意します。',
      'sheet.title': '御注文控え',
      'sheet.note': '当日、こちらの控えをフロントにご提示ください。',
      'sheet.submit': '御予約を申し込む',
      'sheet.print': '控えを印刷',
      'sheet.loading': '照会しております',
      'sheet.doneTitle': '御予約をお預かりしました',
      'sheet.doneBody': '前日までに宿よりご連絡いたします。',
      'sheet.again': '内容を変更する',
      'sheet.no': '御控番号',
      'slip.date': 'お日にち', 'slip.time': 'お時間', 'slip.party': '御人数',
      'slip.seat': 'お席', 'slip.main': '主菜', 'slip.al': '苦手な食材', 'slip.note': 'ご要望',
      'slip.included': '込み', 'slip.room': '一室', 'slip.n': '名',
      'info.title': '宿の案内',
      'info.lead': '箱根登山鉄道 強羅駅より、徒歩七分。',
      'info.addr': '住所', 'info.addrValue': '神奈川県足柄下郡箱根町強羅1320-4',
      'info.tel': '電話', 'info.dinner': '夕餉', 'info.breakfast': '朝餉',
      'info.bath': '山の湯', 'info.bathText': '源泉かけ流し、十五時より翌十時まで',
      'info.access': '道のり', 'info.accessText': '箱根登山鉄道 強羅駅より徒歩七分',
      'info.bandNote': '玄関までの飛石は、雨の日ほど光ります。',
      'info.note': '© 2026 強羅 一花　献立は仕入れにより替わります。',
      'info.alt': '苔の上をのびる飛石',
      'toast.base': '会席は御献立の基本にて、外せません。',
      'toast.closed': '水曜は定休日にて承れません。',
      'toast.fullDay': 'その日は満席にて承れません。',
      'toast.fullSlot': 'そのお時間は満席にて承れません。',
      'toast.kiri': '個室「桐」は四名までにて承ります。',
      'toast.kiriSwitch': '四名を超えるため、御食事処に切り替えました。',
      'toast.tea': '茶事は四名までにて承ります。',
      'toast.notReady': 'お日にちとお時間をお選びください。',
      wd: ['日', '月', '火', '水', '木', '金', '土']
    },
    zh: {
      'doc.title': '强罗 一花 | 菜单与订餐',
      'doc.desc': '箱根强罗的旅馆，一花。九道会席与山汤。请选择日期与时间，接受点单。',
      'brand.place': '箱根强罗',
      'nav.menu': '菜单', 'nav.order': '订餐', 'nav.info': '馆内指南',
      'hero.vlabel': '箱根强罗',
      'hero.t1': '时令，', 'hero.t2': '不等人。',
      'hero.sub': '十月的会席，即日起接受预订。',
      'hero.cta': '前往订餐',
      'hero.alt': '障子后的黄昏，榻榻米走廊',
      'fact.rooms': '客房', 'fact.roomsUnit': '间',
      'fact.courses': '会席', 'fact.coursesUnit': '道',
      'fact.bath': '山汤', 'fact.bathText': '源泉放流',
      'creed.l1': '秋沉入山汤。',
      'creed.l2': '秋升上器皿。',
      'creed.note': '菜单，取自当日的山。',
      'creed.sign': '箱根强罗　一花',
      'menu.title': '菜单',
      'menu.note': '当日食材到货，或有更换。',
      'menu.allergen': '忌口食材',
      'tab.kaiseki': '会席', 'tab.breakfast': '早餐', 'tab.tea': '茶事',
      'season.kicker': '本月一品',
      'season.title': '秋之八寸',
      'season.body': '栗、鳟、海老芋。',
      'season.meta': '木盆出自高野木工，汤碗出自常滑。',
      'season.haiku': '秋已深　不知邻人　作何事',
      'season.attr': '松尾芭蕉',
      'season.alt': '配以红叶的秋之八寸',
      'order.title': '订餐',
      'order.lead': '请选择日期与时间。',
      'grp.menu': '菜单', 'grp.main': '主菜', 'grp.drinks': '酒与茶',
      'grp.when': '日期与时间', 'grp.room': '人数与座席', 'grp.req': '其他要求',
      'party.label': '贵客', 'party.hint': '会席自两位起接受预订。',
      'req.note': '忌口食材、纪念日、接送需求等。',
      'req.ph': '例　请去掉甲壳类，把椀物换成其他。',
      'sum.title': '订餐', 'sum.sub': '含税与服务费', 'sum.total': '合计',
      'sum.cta': '核对凭单',
      'sum.hint1': '请选择日期与时间',
      'sum.hint2': '请选择时间',
      'sum.hint3': '可核对并打印点单凭单',
      'sum.rate': '按 1 元 ≈ 21 日元换算，实际以日元结算。',
      'want.date': '请先选择日期。',
      'when.note': '周三定休',
      'courses.note': '菜单将于抵达前一日确定。',
      'courses.sub': '按忌口食材，为您调整 {{n}} 道。',
      'sheet.title': '点单凭单',
      'sheet.note': '当日请将此凭单出示给前台。',
      'sheet.submit': '提交预订',
      'sheet.print': '打印凭单',
      'sheet.loading': '正在确认',
      'sheet.doneTitle': '已为您保留预订',
      'sheet.doneBody': '前一日由旅馆与您联系。',
      'sheet.again': '修改内容',
      'sheet.no': '单号',
      'slip.date': '日期', 'slip.time': '时间', 'slip.party': '人数',
      'slip.seat': '座席', 'slip.main': '主菜', 'slip.al': '忌口', 'slip.note': '要求',
      'slip.included': '已含', 'slip.room': '每间', 'slip.n': '位',
      'info.title': '馆内指南',
      'info.lead': '自箱根登山铁道强罗站，步行七分钟。',
      'info.addr': '地址', 'info.addrValue': '神奈川县足柄下郡箱根町强罗1320-4',
      'info.tel': '电话', 'info.dinner': '晚餐', 'info.breakfast': '早餐',
      'info.bath': '山汤', 'info.bathText': '源泉放流，十五时至次日十时',
      'info.access': '路程', 'info.accessText': '自箱根登山铁道强罗站步行七分钟',
      'info.bandNote': '通往玄关的飞石，雨天更见光泽。',
      'info.note': '© 2026 强罗 一花　菜单随食材到货调整。',
      'info.alt': '苔藓与飞石之庭',
      'toast.base': '会席是套餐的基本，无法取消。',
      'toast.closed': '周三定休，无法受理。',
      'toast.fullDay': '该日满席，请另选日期。',
      'toast.fullSlot': '该时段满席，请另选时间。',
      'toast.kiri': '包间「桐」限四位。',
      'toast.kiriSwitch': '超过四位，已改为用餐处。',
      'toast.tea': '茶事限四位。',
      'toast.notReady': '请先选择日期与时间。',
      wd: ['日', '一', '二', '三', '四', '五', '六']
    }
  };

  /* ---------------- data ---------------- */

  const AL = [
    { id: 'shell', ja: '甲殻類', zh: '甲壳类' },
    { id: 'soba', ja: 'そば', zh: '荞麦' },
    { id: 'milk', ja: '乳', zh: '乳' },
    { id: 'egg', ja: '卵', zh: '蛋' },
    { id: 'peanut', ja: '落花生', zh: '花生' },
    { id: 'soy', ja: '大豆', zh: '大豆' },
    { id: 'wheat', ja: '小麦', zh: '小麦' }
  ];

  const COURSES = {
    kaiseki: [
      { n: { ja: '先付', zh: '先付' }, d: { ja: '焼胡麻豆腐 いくら餡', zh: '烤芝麻豆腐 鲑鱼子芡' }, al: ['soy'] },
      { n: { ja: '八寸', zh: '八寸' }, d: { ja: '秋の八寸 三種', zh: '秋之八寸 三品' }, al: ['egg', 'soy'] },
      { n: { ja: '椀物', zh: '椀物' }, d: { ja: '松茸の土瓶蒸し', zh: '松茸土瓶蒸' }, al: ['shell', 'wheat'] },
      { n: { ja: '向付', zh: '造身' }, d: { ja: '近海 三種の刺身', zh: '近海生鱼 三品' }, al: [] },
      { n: { ja: '焼物', zh: '烤物' }, d: { ja: '鱒の幽庵焼き 山椒', zh: '幽庵烤鳟鱼 山椒' }, al: ['soy', 'wheat'] },
      { n: { ja: '炊合せ', zh: '炖物' }, d: { ja: '海老芋 白味噌仕立て', zh: '海老芋 白味噌' }, al: ['soy'] },
      { n: { ja: '強肴', zh: '主菜' }, d: { ja: '黒毛和牛の朴葉焼き', zh: '朴叶烤黑毛和牛' }, al: ['soy', 'wheat'] },
      { n: { ja: '御飯', zh: '主食' }, d: { ja: '土鍋炊き 新米 香の物', zh: '土锅新米 渍物' }, al: [] },
      { n: { ja: '水菓子', zh: '甜品' }, d: { ja: '柿と和三盆の氷菓', zh: '柿子与和三盆冰淇淋' }, al: ['milk', 'egg'] }
    ],
    breakfast: [
      { n: { ja: '焼物', zh: '烤物' }, d: { ja: '鯵の一夜干し', zh: '一夜干竹荚鱼' }, al: [] },
      { n: { ja: '小鉢', zh: '小钵' }, d: { ja: '温泉卵 と 湯葉', zh: '温泉蛋 与 汤叶' }, al: ['egg', 'soy'] },
      { n: { ja: '御飯', zh: '主食' }, d: { ja: '土鍋炊き 新米', zh: '土锅新米' }, al: [] },
      { n: { ja: '汁物', zh: '汤' }, d: { ja: '豆腐と季節野菜の味噌汁', zh: '豆腐时蔬味噌汤' }, al: ['soy', 'wheat'] },
      { n: { ja: '香の物', zh: '渍物' }, d: { ja: '胡瓜 茄子 山葵漬', zh: '黄瓜 茄子 山葵渍' }, al: [] }
    ],
    tea: [
      { n: { ja: '主菓子', zh: '主点心' }, d: { ja: '栗きんとん', zh: '栗金团' }, al: [] },
      { n: { ja: '薄茶', zh: '薄茶' }, d: { ja: '一花 自家挽き', zh: '一花 自制' }, al: [] },
      { n: { ja: '干菓子', zh: '干点心' }, d: { ja: '和三盆 四種', zh: '和三盆 四品' }, al: [] },
      { n: { ja: '拝見', zh: '赏器' }, d: { ja: '御道具の拝見', zh: '茶器鉴赏' }, al: [] }
    ]
  };

  const PLANS = [
    {
      id: 'kaiseki', fixed: true, price: 26400, ico: 'tools-kitchen-2',
      name: { ja: '会席「一花」九品', zh: '会席「一花」九道' },
      note: { ja: '基本の御献立', zh: '基本套餐' }
    },
    {
      id: 'breakfast', price: 4400, ico: 'sunrise',
      name: { ja: '朝食 五品', zh: '早餐 五道' },
      note: { ja: '翌朝 7:30 より', zh: '次日 7:30 起' }
    },
    {
      id: 'tea', price: 6600, ico: 'teapot',
      name: { ja: '茶事 四品', zh: '茶事 四道' },
      note: { ja: '14:00 より、定員四名', zh: '14:00 起，限四位' }
    }
  ];

  const MAINS = [
    { id: 'wagyu', add: 0, name: { ja: '黒毛和牛の朴葉焼き', zh: '朴叶烤黑毛和牛' }, note: { ja: '霜降り、味噌と山椒', zh: '霜降牛肉，味噌与山椒' } },
    { id: 'lobster', add: 4400, name: { ja: '伊勢海老の鬼殻焼き', zh: '伊势龙虾壳烤' }, note: { ja: '半身、殻味噌添え', zh: '半只，配壳味噌' } }
  ];

  const DRINKS = [
    { id: 'junmai', price: 2200, ico: 'bottle', name: { ja: '山廃 純米「一花」', zh: '山废纯米「一花」' }, note: { ja: '一合　冷や', zh: '一合　冷酒' } },
    { id: 'ginjo', price: 2750, ico: 'glass-full', name: { ja: '吟醸「喜久水」', zh: '吟酿「喜久水」' }, note: { ja: '一合　冷や', zh: '一合　冷酒' } },
    { id: 'matcha', price: 1320, ico: 'cup', name: { ja: '薄茶「一花」', zh: '薄茶「一花」' }, note: { ja: '一服', zh: '一碗' } },
    { id: 'soda', price: 880, ico: 'droplet', name: { ja: '強羅 炭酸水', zh: '强罗气泡水' }, note: { ja: '七〇〇ml', zh: '700ml' } }
  ];

  const SEATS = [
    { id: 'dining', add: 0, ico: 'tools-kitchen-2', name: { ja: '御食事処「一花」', zh: '用餐处「一花」' }, note: { ja: '九席、囲炉裏を囲んで', zh: '九席，围炉而坐' } },
    { id: 'kiri', add: 3300, max: 4, ico: 'door', name: { ja: '個室「桐」', zh: '包间「桐」' }, note: { ja: '四名まで', zh: '限四位' } },
    { id: 'room', add: 5500, ico: 'bed', name: { ja: '御部屋食', zh: '客房送餐' }, note: { ja: 'お部屋にお運びします', zh: '送至客房' } }
  ];

  const SLOT_TIMES = ['17:30', '18:00', '18:30', '19:00', '19:30'];

  /* ---------------- state ---------------- */

  const state = {
    lang: 'ja',
    tab: 'kaiseki',
    al: [],
    plans: ['kaiseki'],
    main: 'wagyu',
    drinks: {},
    days: [],
    date: null,
    time: null,
    party: 2,
    seat: 'dining',
    number: ''
  };

  const t = (k) => (T[state.lang] && T[state.lang][k]) || T.ja[k] || '';
  const L = (o) => (o && (o[state.lang] || o.ja)) || '';
  const JPY_CNY = 0.047; // 1 元 ≈ 21 日元
  const money = (n) => state.lang === 'zh'
    ? '¥' + (Math.round(n * JPY_CNY / 10) * 10).toLocaleString('en-US')
    : '¥' + n.toLocaleString('en-US');
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- calendar ---------------- */

  const MONTH_CHAR = ['松', '梅', '桜', '藤', '皐', '文', '葉', '月', '菊', '萩', '紅', '師'];

  function buildDays() {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const out = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const wd = d.getDay();
      const closed = wd === 3;
      const full = !closed && (i === 3 || i === 8);
      let slots = [];
      if (!closed && !full) {
        const n = d.getDate();
        slots = n % 4 === 0 ? ['18:00', '19:30'] : n % 3 === 0 ? ['18:30'] : ['19:30'];
      }
      out.push({
        d,
        wd,
        closed,
        full,
        slots,
        iso: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      });
    }
    state.days = out;
  }

  const dayOf = (iso) => state.days.filter((x) => x.iso === iso)[0] || null;

  function fmtDate(d) {
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const w = T[state.lang].wd[d.getDay()];
    return state.lang === 'ja' ? m + '月' + day + '日（' + w + '）' : m + '月' + day + '日（周' + w + '）';
  }

  function makeNumber() {
    const d = new Date();
    const m = MONTH_CHAR[d.getMonth()];
    const n = (d.getDate() % 9) + 1;
    return m + ' ' + KN[n] + KN[(d.getHours() % 9) + 1];
  }

  /* ---------------- render: menus ---------------- */

  function renderChips() {
    $('#chips').innerHTML = AL.map((a) =>
      '<button type="button" class="chip" data-al="' + a.id + '" aria-pressed="' +
      (state.al.indexOf(a.id) > -1 ? 'true' : 'false') + '">' + esc(L(a)) + '</button>'
    ).join('');
  }

  function renderCourses() {
    const list = COURSES[state.tab];
    $('#courses').innerHTML = list.map((c, i) => {
      const hit = c.al.length && c.al.some((a) => state.al.indexOf(a) > -1);
      return '<li class="course">' +
        '<span class="c-no">' + KN[i + 1] + '</span>' +
        '<span class="c-main">' +
        '<span class="c-name">' + esc(L(c.n)) + '　' + esc(L(c.d)) + '</span>' +
        '</span>' +
        '<span class="c-tags">' + c.al.map((a) => {
          const item = AL.filter((x) => x.id === a)[0];
          return '<span class="c-tag' + (hit && state.al.indexOf(a) > -1 ? ' is-hit' : '') + '">' + esc(L(item)) + '</span>';
        }).join('') + '</span>' +
        '</li>';
    }).join('');

    const hitCount = list.filter((c) => c.al.some((a) => state.al.indexOf(a) > -1)).length;
    $('#coursesFoot').textContent = hitCount
      ? t('courses.sub').replace('{{n}}', hitCount)
      : t('courses.note');
  }

  /* ---------------- render: order ---------------- */

  function renderPlans() {
    $('#planOpts').innerHTML = PLANS.map((p) => {
      const on = state.plans.indexOf(p.id) > -1;
      return '<button type="button" class="plan' + (on ? ' is-on' : '') + (p.fixed ? ' is-fixed' : '') +
        '" data-plan="' + p.id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<span class="plan-mark" aria-hidden="true"><i class="ti ti-check"></i></span>' +
        '<span class="plan-name">' + esc(L(p.name)) + '</span>' +
        '<span class="plan-note">' + esc(L(p.note)) + '</span>' +
        '<span class="plan-price"><span class="num">' + money(p.price) + '</span>' +
        '<span class="opt-u"> ' + (state.lang === 'ja' ? '一人' : '每位') + '</span></span>' +
        '</button>';
    }).join('');
  }

  function renderMains() {
    $('#mainOpts').innerHTML = MAINS.map((m) => {
      const checked = state.main === m.id;
      return '<label class="opt">' +
        '<input type="radio" name="main" value="' + m.id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="opt-dot" aria-hidden="true"></span>' +
        '<span class="opt-body"><span class="opt-name">' + esc(L(m.name)) + '</span>' +
        '<span class="opt-note">' + esc(L(m.note)) + '</span></span>' +
        (m.add
          ? '<span class="opt-price is-add">+' + money(m.add) + '<span class="opt-u"> ' + (state.lang === 'ja' ? '一人' : '每位') + '</span></span>'
          : '<span class="opt-price">' + t('slip.included') + '</span>') +
        '</label>';
    }).join('');
  }

  function renderDrinks() {
    $('#drinks').innerHTML = DRINKS.map((d) => {
      const qty = state.drinks[d.id] || 0;
      return '<div class="drink">' +
        '<i class="ti ti-' + (d.ico || 'cup') + ' d-ico" aria-hidden="true"></i>' +
        '<span class="d-main"><span class="d-name">' + esc(L(d.name)) + '</span>' +
        '<span class="d-note">' + esc(L(d.note)) + '</span></span>' +
        '<span class="d-price"><span class="num">' + money(d.price) + '</span></span>' +
        '<span class="stepper">' +
        '<button type="button" class="step" data-d="' + d.id + '" data-s="-1" aria-label="' +
        (state.lang === 'ja' ? '減らす' : '减少') + '"' + (qty <= 0 ? ' disabled' : '') + '><i class="ti ti-minus" aria-hidden="true"></i></button>' +
        '<output class="step-v num" aria-live="polite">' + qty + '</output>' +
        '<button type="button" class="step" data-d="' + d.id + '" data-s="1" aria-label="' +
        (state.lang === 'ja' ? '増やす' : '增加') + '"' + (qty >= 6 ? ' disabled' : '') + '><i class="ti ti-plus" aria-hidden="true"></i></button>' +
        '</span></div>';
    }).join('');
  }

  function renderSeats() {
    $('#seatOpts').innerHTML = SEATS.map((s) => {
      const checked = state.seat === s.id;
      return '<label class="opt">' +
        '<input type="radio" name="seat" value="' + s.id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="opt-dot" aria-hidden="true"></span>' +
        '<span class="opt-body"><span class="opt-name">' + esc(L(s.name)) + '</span>' +
        (s.max
          ? '<span class="opt-note cap" aria-hidden="true">' + new Array(s.max + 1).join('<i></i>') + '</span>' +
            '<span class="sr-only">' + (state.lang === 'ja' ? '定員 四名まで' : '限四位') + '</span>'
          : '<span class="opt-note">' + esc(L(s.note)) + '</span>') +
        '</span>' +
        (s.add
          ? '<span class="opt-price is-add">+' + money(s.add) + '<span class="opt-u"> ' + t('slip.room') + '</span></span>'
          : '<span class="opt-price">' + t('slip.included') + '</span>') +
        '</label>';
    }).join('');
  }

  function renderDays() {
    $('#days').innerHTML = state.days.map((x) => {
      const on = state.date === x.iso;
      const off = x.closed || x.full;
      return '<label class="day' + (x.closed ? ' is-off' : '') + (x.full ? ' is-full' : '') + '">' +
        '<input type="radio" name="day" value="' + x.iso + '"' + (on ? ' checked' : '') + (off ? ' disabled' : '') +
        ' aria-label="' + fmtDate(x.d) + (x.closed ? ' 休' : x.full ? ' 満' : '') + '">' +
        '<span class="day-in">' +
        '<span class="day-w">' + T[state.lang].wd[x.wd] + '</span>' +
        '<span class="day-d num">' + x.d.getDate() + '</span>' +
        '<i class="day-flag' + (x.closed ? ' is-closed' : x.full ? ' is-full' : '') + '" aria-hidden="true"></i>' +
        '</span></label>';
    }).join('');

    const pick = state.date ? fmtDate(dayOf(state.date).d) : '';
    $('#dayNote').innerHTML = (pick ? '<span class="dn-pick">' + pick + '</span>' : '') +
      '<span class="dn-rule">' + t('when.note') + '</span>';
  }

  function renderTimes() {
    const box = $('#times');
    const day = state.date ? dayOf(state.date) : null;
    if (!day) {
      box.innerHTML = '<p class="times-empty">' + t('want.date') + '</p>';
      return;
    }
    box.innerHTML = SLOT_TIMES.map((s) => {
      const full = day.slots.indexOf(s) > -1;
      const on = state.time === s;
      return '<label class="slot' + (full ? ' is-full' : '') + '">' +
        '<input type="radio" name="slot" value="' + s + '"' + (on ? ' checked' : '') + (full ? ' disabled' : '') + '>' +
        '<span class="slot-in num">' + s + '</span>' +
        '</label>';
    }).join('');
  }

  function calc() {
    const party = state.party;
    const items = [];
    let total = 0;

    PLANS.forEach((p) => {
      if (state.plans.indexOf(p.id) < 0) return;
      const amount = p.price * party;
      total += amount;
      items.push({ name: L(p.name), amount, unit: '×' + party, mute: false });
    });

    const main = MAINS.filter((m) => m.id === state.main)[0];
    if (main) {
      total += main.add * party;
      items.push({
        name: L(main.name),
        amount: main.add ? main.add * party : 0,
        unit: '×' + party,
        mute: !main.add
      });
    }

    DRINKS.forEach((d) => {
      const qty = state.drinks[d.id] || 0;
      if (!qty) return;
      const amount = d.price * qty;
      total += amount;
      items.push({ name: L(d.name), amount, unit: '×' + qty, mute: false });
    });

    const seat = SEATS.filter((s) => s.id === state.seat)[0];
    if (seat && seat.add) {
      total += seat.add;
      items.push({ name: L(seat.name), amount: seat.add, unit: t('slip.room'), mute: false });
    }

    return { items, total };
  }

  function renderSummary() {
    const { items, total } = calc();
    $('#sumLines').innerHTML = items.map((i) =>
      '<li class="sum-line' + (i.mute ? ' is-mute' : '') + '">' +
      '<span>' + esc(i.name) + '<em>' + esc(i.unit) + '</em></span>' +
      '<span class="sum-price">' + (i.mute ? t('slip.included') : '<span class="num">' + money(i.amount) + '</span>') + '</span>' +
      '</li>'
    ).join('');

    $('#sumTotal').textContent = money(total);
    $('#mbarTotal').textContent = money(total);

    const ready = Boolean(state.date && state.time);
    $('#openSheet').disabled = !ready;
    $('#mbarBtn').disabled = !ready;
    $('#sumHint').textContent = !state.date ? t('sum.hint1') : !state.time ? t('sum.hint2') : t('sum.hint3');
    $('#sumRate').textContent = t('sum.rate');
  }

  function renderSlip() {
    const day = state.date ? dayOf(state.date) : null;
    const seat = SEATS.filter((s) => s.id === state.seat)[0];
    const main = MAINS.filter((m) => m.id === state.main)[0];
    const al = state.al.map((id) => L(AL.filter((a) => a.id === id)[0])).join('　');
    const notes = ($('#notes') && $('#notes').value.trim()) || '';
    const { items, total } = calc();

    const rows = items.filter((i) => !i.mute).map((i) =>
      '<li><span>' + esc(i.name) + '　<span class="opt-u">' + esc(i.unit) + '</span></span>' +
      '<span class="v num">' + money(i.amount) + '</span></li>'
    );

    const meta = [
      ['slip.date', day ? fmtDate(day.d) : ''],
      ['slip.time', state.time || ''],
      ['slip.party', state.party + t('slip.n')],
      ['slip.seat', seat ? L(seat.name) : ''],
      ['slip.main', main ? L(main.name) : ''],
      ['slip.al', al],
      ['slip.note', notes]
    ].filter((r) => r[1]);

    $('#slip').innerHTML = rows.join('') +
      meta.map((r, i) =>
        '<li class="' + (i === 0 ? 'is-gap' : '') + '"><span class="opt-u">' + esc(t(r[0])) + '</span>' +
        '<span class="v">' + esc(r[1]) + '</span></li>'
      ).join('');

    $('#slipTotal').textContent = money(total);
    $('#slipRate').textContent = t('sum.rate');
    $('#sheetNum').textContent = state.number ? t('sheet.no') + '　' + state.number : '';
  }

  /* ---------------- i18n ---------------- */

  function applyI18n() {
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.textContent = val;
    });
    $$('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    $$('[data-i18n-alt]').forEach((el) => {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
    document.title = t('doc.title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('doc.desc'));
    document.documentElement.lang = state.lang === 'zh' ? 'zh-Hans' : 'ja';
    $$('.lang').forEach((b) => b.classList.toggle('is-on', b.dataset.lang === state.lang));
  }

  function renderAll() {
    applyI18n();
    renderChips();
    renderCourses();
    renderPlans();
    renderMains();
    renderDrinks();
    renderSeats();
    renderDays();
    renderTimes();
    renderSummary();
    renderSlip();
  }

  function guardBrush() {
    if (!document.fonts || !document.fonts.load) return;
    const root = document.documentElement;
    Promise.all([
      document.fonts.load('24px "Yuji Syuku"').catch(() => []),
      document.fonts.load('24px "Ma Shan Zheng"').catch(() => [])
    ]).then((res) => {
      const ok = res.some((list) => list && list.length > 0);
      root.classList.toggle('no-brush', !ok);
    });
  }

  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    renderAll();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  /* ---------------- toast ---------------- */

  let toastTimer = null;
  function toast(msg, kind) {
    const el = $('#toast');
    const ico = kind === 'warn' ? 'alert-circle' : kind === 'ok' ? 'circle-check' : 'info-circle';
    el.innerHTML = '<i class="ti ti-' + ico + '" aria-hidden="true"></i>' + esc(msg);
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ---------------- sheet ---------------- */

  let lastFocus = null;

  function openSheet() {
    if (!state.date || !state.time) {
      toast(t('toast.notReady'));
      return;
    }
    lastFocus = document.activeElement;
    renderSlip();
    $('#sheet').classList.add('is-open');
    $('#sheet').setAttribute('aria-hidden', 'false');
    $('#veil').classList.add('is-on');
    document.documentElement.classList.add('sheet-open');
    if (window.__lenis) window.__lenis.stop();
    setTimeout(() => { $('#sheetX').focus(); }, 120);
  }

  function closeSheet() {
    $('#sheet').classList.remove('is-open');
    $('#sheet').setAttribute('aria-hidden', 'true');
    $('#veil').classList.remove('is-on');
    document.documentElement.classList.remove('sheet-open');
    if (window.__lenis) window.__lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const f = $$('#sheet button, #sheet a, #sheet textarea, #sheet input').filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function submit() {
    const btn = $('#submitBtn');
    const label = btn.querySelector('span');
    const original = t('sheet.submit');
    btn.disabled = true;
    if (label) label.textContent = t('sheet.loading');
    setTimeout(() => {
      state.number = makeNumber();
      renderSlip();
      $('#sheetActs').classList.add('is-off');
      $('#done').classList.add('is-on');
      btn.disabled = false;
      if (label) label.textContent = original;
    }, 900);
  }

  /* ---------------- nav / scroll ---------------- */

  function closeNav() {
    document.documentElement.classList.remove('nav-open');
    const burger = $('#burger');
    burger.setAttribute('aria-expanded', 'false');
    const icon = burger.querySelector('i');
    if (icon) icon.className = 'ti ti-menu-2';
  }

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    $('#meterBar').style.width = (p * 100).toFixed(2) + '%';

    const hero = $('.hero');
    const solid = window.scrollY > (hero ? hero.offsetHeight - 90 : 400);
    $('#topbar').classList.toggle('is-solid', solid);

    const mb = $('#mbar');
    if (mb) mb.classList.toggle('is-on', solid);
  }

  /* ---------------- motion ---------------- */

  function motion() {
    const hasGsap = window.gsap && window.ScrollTrigger;
    if (!hasGsap) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    document.documentElement.classList.add('fx');

    // smooth scrolling
    if (window.Lenis && !REDUCE) {
      const lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1.02, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // anchor links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (document.documentElement.classList.contains('nav-open')) closeNav();
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: -66 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 66, behavior: REDUCE ? 'auto' : 'smooth' });
    }, true);

    // reveals
    gsap.utils.toArray([
      '.ch-head', '.menu-bar', '.courses', '.courses-foot',
      '.creed-foot', '.order-head', '.grp', '.info-head', '.info-list', '.info-band figcaption', '.site-foot'
    ].join(', ')).forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        clearProps: 'transform'
      });
    });

    gsap.utils.toArray('.creed-line .line-i').forEach((el) => {
      gsap.fromTo(el, { yPercent: 114 }, {
        yPercent: 0,
        duration: 1.3,
        ease: 'power4.out',
        scrollTrigger: { trigger: el.closest('.creed-line'), start: 'top 88%', once: true }
      });
    });

    // season pin (desktop only)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#season',
          start: 'top top',
          end: '+=92%',
          pin: '#seasonInner',
          anticipatePin: 1,
          scrub: 0.6
        }
      });
      tl.fromTo('.season-bg img', { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, 0);
      tl.fromTo('.season-copy .season-kicker, .season-copy .season-title, .season-copy .season-body, .season-copy .season-meta',
        { y: 52, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: 'none', duration: 1 }, 0.08);
      tl.fromTo('.haiku', { opacity: 0, y: 36 }, { opacity: 1, y: 0, ease: 'none', duration: 0.6 }, 0.34);
    });

    // keep triggers in sync once fonts land
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.ScrollTrigger.refresh());
    }
  }

  /* ---------------- bind ---------------- */

  function bind() {
    $('#tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      state.tab = btn.dataset.tab;
      $$('.tab').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      renderCourses();
    });

    $('#tabs').addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      const tabs = $$('.tab');
      const i = tabs.indexOf(document.activeElement);
      let next = i;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      tabs[next].click();
    });

    $('#chips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const id = chip.dataset.al;
      const i = state.al.indexOf(id);
      if (i > -1) state.al.splice(i, 1);
      else state.al.push(id);
      chip.setAttribute('aria-pressed', i > -1 ? 'false' : 'true');
      renderCourses();
      renderSummary();
      renderSlip();
    });

    $('#planOpts').addEventListener('click', (e) => {
      const btn = e.target.closest('.plan');
      if (!btn) return;
      const id = btn.dataset.plan;
      const plan = PLANS.filter((p) => p.id === id)[0];
      if (!plan) return;
      if (plan.fixed) { toast(t('toast.base')); return; }
      if (id === 'tea' && state.party > 4) { toast(t('toast.tea')); return; }
      const i = state.plans.indexOf(id);
      if (i > -1) state.plans.splice(i, 1);
      else state.plans.push(id);
      renderPlans();
      renderSummary();
      renderSlip();
    });

    $('#mainOpts').addEventListener('change', (e) => {
      if (e.target.name !== 'main') return;
      state.main = e.target.value;
      renderMains();
      renderSummary();
      renderSlip();
    });

    $('#drinks').addEventListener('click', (e) => {
      const btn = e.target.closest('.step');
      if (!btn || btn.disabled) return;
      const id = btn.dataset.d;
      const next = Math.min(6, Math.max(0, (state.drinks[id] || 0) + Number(btn.dataset.s)));
      state.drinks[id] = next;
      renderDrinks();
      renderSummary();
      renderSlip();
    });

    $('#seatOpts').addEventListener('change', (e) => {
      const seat = SEATS.filter((s) => s.id === e.target.value)[0];
      if (!seat) return;
      if (seat.max && state.party > seat.max) {
        toast(t('toast.kiri'));
        renderSeats();
        return;
      }
      state.seat = seat.id;
      renderSeats();
      renderSummary();
      renderSlip();
    });

    $('#days').addEventListener('click', (e) => {
      const label = e.target.closest('.day');
      if (!label) return;
      if (label.classList.contains('is-off')) { toast(t('toast.closed')); return; }
      if (label.classList.contains('is-full')) { toast(t('toast.fullDay')); return; }
    });

    $('#days').addEventListener('change', (e) => {
      state.date = e.target.value;
      state.time = null;
      renderDays();
      renderTimes();
      renderSummary();
      renderSlip();
    });

    $('#times').addEventListener('click', (e) => {
      const label = e.target.closest('.slot');
      if (!label) return;
      if (label.classList.contains('is-full')) toast(t('toast.fullSlot'));
    });

    $('#times').addEventListener('change', (e) => {
      state.time = e.target.value;
      renderTimes();
      renderSummary();
    });

    $('#partyMinus').addEventListener('click', () => setParty(state.party - 1));
    $('#partyPlus').addEventListener('click', () => setParty(state.party + 1));

    function setParty(n) {
      const next = Math.min(6, Math.max(2, n));
      if (next === state.party) return;
      state.party = next;
      $('#partyOut').textContent = String(next);
      $('#partyMinus').disabled = next <= 2;
      $('#partyPlus').disabled = next >= 6;

      if (next > 4 && state.plans.indexOf('tea') > -1) {
        state.plans.splice(state.plans.indexOf('tea'), 1);
        toast(t('toast.tea'));
      }
      const seat = SEATS.filter((s) => s.id === state.seat)[0];
      if (seat && seat.max && next > seat.max) {
        state.seat = 'dining';
        toast(t('toast.kiriSwitch'));
      }
      renderPlans();
      renderSeats();
      renderSummary();
      renderSlip();
    }

    $('#notes').addEventListener('input', (e) => {
      $('#noteCount').textContent = String(e.target.value.length);
    });

    $('#reqToggle').addEventListener('click', () => {
      const open = $('#reqToggle').getAttribute('aria-expanded') !== 'true';
      $('#reqToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
      $('#reqBody').classList.toggle('is-open', open);
      if (open) $('#notes').focus();
    });

    $('#openSheet').addEventListener('click', openSheet);
    $('#mbarBtn').addEventListener('click', openSheet);
    $('#sheetX').addEventListener('click', closeSheet);
    $('#veil').addEventListener('click', closeSheet);
    $('#submitBtn').addEventListener('click', submit);
    $('#printBtn').addEventListener('click', () => window.print());

    $('#againBtn').addEventListener('click', () => {
      state.number = '';
      $('#done').classList.remove('is-on');
      $('#sheetActs').classList.remove('is-off');
      renderSlip();
      renderSummary();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($('#sheet').classList.contains('is-open')) closeSheet();
        else if (document.documentElement.classList.contains('nav-open')) closeNav();
      }
      if ($('#sheet').classList.contains('is-open')) trapFocus(e);
    });

    const burger = $('#burger');
    burger.addEventListener('click', () => {
      const open = !document.documentElement.classList.contains('nav-open');
      document.documentElement.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      const icon = burger.querySelector('i');
      if (icon) icon.className = open ? 'ti ti-x' : 'ti ti-menu-2';
      if (open && window.__lenis) window.__lenis.stop();
      if (!open && window.__lenis) window.__lenis.start();
    });

    $$('.lang').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; onScroll(); });
    }, { passive: true });

    // nav spy
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          $$('.nav a').forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + id));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['menus', 'order', 'info'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }
  }

  /* ---------------- boot ---------------- */

  buildDays();
  renderAll();
  bind();
  onScroll();
  motion();
  guardBrush();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { onScroll(); });
  }
})();
