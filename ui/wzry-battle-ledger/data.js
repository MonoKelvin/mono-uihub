/* 战功簿 · 页面数据（本地假数据，不写 localStorage） */
(function () {
  'use strict';

  var CDN = 'https://game.gtimg.cn/images/yxzj/img201606/';
  function splash(id) { return CDN + 'skin/hero-info/' + id + '/' + id + '-bigskin-1.jpg'; }
  function icon(id) { return CDN + 'heroimg/' + id + '/' + id + '.jpg'; }

  var heroes = [
    { id: 528, name: '澜', lane: '打野', role: '刺客', games: 1111, winrate: 60.1, kda: 5.2, power: 18420, skin: '鲨之猎刃', note: '本命' },
    { id: 518, name: '马超', lane: '对抗路', role: '战士', games: 486, winrate: 55.8, kda: 4.1, power: 12680, skin: '冷晖之枪' },
    { id: 141, name: '貂蝉', lane: '中路', role: '法师', games: 372, winrate: 57.3, kda: 4.6, power: 11050, skin: '绝世舞姬' },
    { id: 111, name: '孙尚香', lane: '发育路', role: '射手', games: 258, winrate: 54.7, kda: 4.4, power: 9720, skin: '千金重弩' },
    { id: 171, name: '张飞', lane: '游走', role: '辅助', games: 214, winrate: 61.2, kda: 3.8, power: 8640, skin: '禁血狂兽' },
    { id: 513, name: '上官婉儿', lane: '中路', role: '法师', games: 168, winrate: 59.5, kda: 4.9, power: 7210, skin: '惊鸿之笔' },
    { id: 538, name: '云缨', lane: '打野', role: '战士', games: 142, winrate: 57.7, kda: 4.5, power: 6480, skin: '燎原之心' },
    { id: 154, name: '花木兰', lane: '对抗路', role: '战士', games: 96, winrate: 53.1, kda: 3.9, power: 5120, skin: '传说之刃' }
  ].map(function (h) {
    h.splash = splash(h.id);
    h.icon = icon(h.id);
    return h;
  });

  var radarAxes = ['输出', '生存', '团战', '发育', '支援'];

  var seasons = {
    S42: {
      name: 'S42',
      span: '2026.01 — 2026.04',
      rank: '最强王者',
      stars: 32,
      peak: 1856,
      peakHigh: 1902,
      winrate: 58.4,
      kda: 4.8,
      games: 392,
      mvp: 87,
      penta: 3,
      score: 11.3,
      streak: 14,
      radar: [86, 74, 92, 79, 63],
      delta: { stars: 6, winrate: 1.5, kda: 0.2, games: 34, mvp: 16, penta: 1, score: 0.4, streak: 5 },
      trend: [1702, 1738, 1725, 1780, 1772, 1806, 1798, 1834, 1820, 1852, 1844, 1856]
    },
    S41: {
      name: 'S41',
      span: '2025.09 — 2025.12',
      rank: '最强王者',
      stars: 26,
      peak: 1794,
      peakHigh: 1831,
      winrate: 56.9,
      kda: 4.6,
      games: 358,
      mvp: 71,
      penta: 2,
      score: 10.9,
      streak: 9,
      radar: [80, 71, 86, 75, 58],
      delta: { stars: 12, winrate: 2.7, kda: 0.3, games: 37, mvp: 13, penta: 1, score: 0.3, streak: 2 },
      trend: [1650, 1672, 1698, 1684, 1712, 1704, 1736, 1728, 1756, 1762, 1780, 1794]
    },
    S40: {
      name: 'S40',
      span: '2025.06 — 2025.09',
      rank: '至尊星耀',
      stars: 14,
      peak: 1712,
      peakHigh: 1764,
      winrate: 54.2,
      kda: 4.3,
      games: 321,
      mvp: 58,
      penta: 1,
      score: 10.6,
      streak: 7,
      radar: [74, 66, 79, 70, 54],
      delta: { stars: 9, winrate: 3.1, kda: 0.4, games: 21, mvp: 9, penta: 1, score: 0.2, streak: 1 },
      trend: [1588, 1604, 1596, 1622, 1614, 1640, 1632, 1658, 1646, 1674, 1690, 1712]
    }
  };

  var ITEMS = {
    '打野': ['暗影战斧', '名刀·司命', '破军', '碎星锤', '纯净苍穹', '贤者的庇护'],
    '中路': ['噬神之书', '痛苦面具', '冰霜法杖', '辉月', '虚无法杖', '博学者之怒'],
    '对抗路': ['暗影战斧', '反伤刺甲', '不祥征兆', '霸者重装', '魔女斗篷', '破军'],
    '发育路': ['无尽战刃', '泣血之刃', '逐日之弓', '破晓', '闪电匕首', '影刃'],
    '游走': ['救赎之翼', '极寒风暴', '不祥征兆', '魔女斗篷', '霸者重装', '星泉']
  };

  function makeRng(seed) {
    return function () {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
  }

  var rand = makeRng(20260417);
  var SEQ = [0, 0, 1, 2, 0, 6, 3, 0, 1, 5, 2, 0, 6, 4, 0, 1, 2, 0, 7, 0, 6, 3, 5, 0];
  var BASE = new Date(2026, 3, 17, 22, 30, 0);

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function timeLabel(d) {
    var a = new Date(BASE.getFullYear(), BASE.getMonth(), BASE.getDate());
    var b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var days = Math.round((a - b) / 86400000);
    var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (days === 0) return '今天 ' + hm;
    if (days === 1) return '昨天 ' + hm;
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hm;
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }

  var DMG = { '打野': [18, 32], '中路': [22, 38], '对抗路': [16, 28], '发育路': [24, 41], '游走': [8, 17] };
  var TANK = { '打野': [16, 28], '中路': [10, 19], '对抗路': [24, 38], '发育路': [10, 18], '游走': [26, 40] };

  var matches = SEQ.map(function (heroIndex, i) {
    var hero = heroes[heroIndex];
    var win = rand() * 100 < hero.winrate;
    var k = 2 + Math.floor(rand() * 13);
    var d = Math.floor(rand() * (win ? 7 : 9));
    var a = 3 + Math.floor(rand() * 18);
    var score = (win ? 9.2 : 5.8) + rand() * 4.4;
    var started = new Date(BASE.getTime() - i * (38 * 60 + 12) * 1000 - Math.floor(rand() * 780) * 1000);
    var mins = 12 + Math.floor(rand() * 16);
    var secs = Math.floor(rand() * 60);
    return {
      id: 'm' + i,
      result: win ? 'win' : 'loss',
      hero: hero.name,
      heroId: hero.id,
      icon: hero.icon,
      lane: hero.lane,
      kda: [k, d, a],
      score: Math.round(score * 10) / 10,
      mvp: score > 11.6,
      duration: mins + ':' + pad(secs),
      time: timeLabel(started),
      mode: i % 3 === 1 ? '巅峰赛' : '排位赛',
      detail: {
        participation: 48 + Math.floor(rand() * 34),
        damage: DMG[hero.lane][0] + Math.floor(rand() * (DMG[hero.lane][1] - DMG[hero.lane][0])),
        tank: TANK[hero.lane][0] + Math.floor(rand() * (TANK[hero.lane][1] - TANK[hero.lane][0])),
        gold: 21 + Math.floor(rand() * 12),
        items: shuffle(ITEMS[hero.lane]).slice(0, 6),
        spell: hero.lane === '打野' ? '惩戒' : '闪现'
      }
    };
  });

  var seals = [
    { key: 'penta', label: '五杀', chars: '殺', count: 3, hint: '单场五人全灭', fresh: true },
    { key: 'rampage', label: '超神', chars: '神', count: 12, hint: '连续击杀八次以上', fresh: true },
    { key: 'mvp', label: 'MVP', chars: '冠', count: 87, hint: '单场评分最高' },
    { key: 'streak', label: '十连胜', chars: '連', count: 2, hint: '排位连续十场获胜', fresh: true },
    { key: 'peak', label: '巅峰 1800', chars: '峰', count: 1, hint: '巅峰赛积分破一千八' },
    { key: 'lane', label: '国服中路', chars: '國', count: 1, hint: '中路英雄战力排名前列' }
  ];

  window.LEDGER_DATA = {
    player: {
      name: '云间客',
      server: '微信 128 区 · 凤凰于飞',
      mainHero: heroes[0]
    },
    radarAxes: radarAxes,
    seasons: seasons,
    heroes: heroes,
    matches: matches,
    seals: seals,
    itemsByLane: ITEMS,
    totalSeals: 48,
    collected: 24
  };
})();
