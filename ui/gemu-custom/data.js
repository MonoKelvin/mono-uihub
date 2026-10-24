/* 格木 GEMU · 数据层
   页面所有文案、数字与图片地址集中在此；app.js 只读取消费，不硬编码内容。 */

window.GEMU = {
  brand: {
    cn: '格木',
    en: 'GEMU',
    line: '全屋定制家居',
    hotline: '400-820-0412',
    since: '2014',
  },

  nav: [
    { id: 'works', text: '作品' },
    { id: 'services', text: '定制清单' },
    { id: 'materials', text: '材料' },
    { id: 'flow', text: '流程' },
    { id: 'voices', text: '评价' },
  ],

  hero: {
    eyebrow: '全屋定制设计与制造',
    title: ['从一张户型图', '到一间住得进去的家'],
    sub: '上门量房出图，柜体自产自销，平均交付 45 天',
    stats: [
      { value: '1,280', unit: '套', label: '累计交付' },
      { value: '45', unit: '天', label: '平均交付周期' },
      { value: '97.4', unit: '%', label: '一次验收通过率', accent: true },
    ],
    feature: {
      no: '0287',
      name: '滨江壹号 3 栋',
      meta: ['上海', '三居', '128 ㎡'],
      days: 41,
      price: '¥168,000',
      img: 'photo-1618221195710-dd6b41faaea6',
      alt: '暖木色客厅，皮革沙发与大面采光',
    },
  },

  /* 案例：户型 / 风格两维可组合筛选，搜索与排序在此之上叠加
     顺序即首屏推荐序：全景 → 双联 → 三联，交替出现 */
  cases: [
    { no: '0287', name: '云锦路 12 号', city: '上海', type: '两居', area: 96, days: 38, price: 128000, style: '极简', designer: '陈屿', img: 'photo-1583847268964-b28dc8f51f92', alt: '朝南客厅，木圆桌与白墙挂画' },
    { no: '0312', name: '滨江壹号 3 栋', city: '上海', type: '三居', area: 128, days: 41, price: 168000, style: '原木', designer: '沈聿', img: 'photo-1600607687920-4e2a09cf159d', alt: '客厅深色电视墙与角落绿植' },
    { no: '0341', name: '衡山坊 7 号', city: '上海', type: '三居', area: 142, days: 45, price: 186000, style: '黑白', designer: '陈屿', img: 'photo-1600566753086-00f18fb6b3ea', alt: '玻璃隔断客厅与黑色框架楼梯' },
    { no: '0358', name: '咏安 5 幢', city: '杭州', type: '两居', area: 89, days: 34, price: 112000, style: '极简', designer: '罗青禾', img: 'photo-1522708323590-d24dbb6b0267', alt: '白墙客厅与木质地板，窗边绿植' },
    { no: '0366', name: '麓湖 12 栋', city: '成都', type: '四居', area: 178, days: 52, price: 246000, style: '原木', designer: '沈聿', img: 'photo-1616486338812-3dadae4b4ace', alt: '圆形茶几客厅与整面画廊墙' },
    { no: '0379', name: '金鸡湖 8 号', city: '苏州', type: '两居', area: 105, days: 36, price: 139000, style: '混搭', designer: '罗青禾', img: 'photo-1615529182904-14819c35db37', alt: '藤编吊灯客厅与开放式动线' },
    { no: '0402', name: '山居 A 宅', city: '莫干山', type: '别墅', area: 260, days: 68, price: 398000, style: '原木', designer: '陈屿', img: 'photo-1600585154340-be6161a56a0c', alt: '暮色中的独栋住宅外观' },
    { no: '0415', name: '玫瑰园 2 栋', city: '南京', type: '三居', area: 118, days: 40, price: 154000, style: '极简', designer: '罗青禾', img: 'photo-1616486029423-aaa4789e8c9a', alt: '白墙卧室与成组挂画' },
    { no: '0428', name: '科技园 LOFT', city: '深圳', type: '复式', area: 210, days: 61, price: 302000, style: '黑白', designer: '沈聿', img: 'photo-1502005229762-cf1b2da7c5d6', alt: '挑高 LOFT 客厅与钢结构楼梯' },
    { no: '0433', name: '汉街 9 号', city: '武汉', type: '两居', area: 92, days: 33, price: 118000, style: '极简', designer: '陈屿', img: 'photo-1600489000022-c2086d79f9d4', alt: '深色橱柜与中岛开放式厨房' },
    { no: '0447', name: '静安书房', city: '上海', type: '一居', area: 58, days: 27, price: 76000, style: '混搭', designer: '罗青禾', img: 'photo-1594620302200-9a762244a156', alt: '整墙木色书柜与飘窗书桌' },
    { no: '0451', name: '环岛观邸', city: '厦门', type: '三居', area: 156, days: 47, price: 205000, style: '原木', designer: '陈屿', img: 'photo-1615874959474-d609969a20ed', alt: '暖光卧室与吊灯组合' },
  ],

  typeFilters: ['全部', '一居', '两居', '三居', '四居', '复式', '别墅'],
  styleFilters: ['全部', '原木', '极简', '黑白', '混搭'],

  /* 定制清单：按投影面积计价，规格与周期逐条可查 */
  services: [
    { name: '整体衣柜', spec: '投影到顶 2.7 m / 18 mm 板', price: 12800, days: 28 },
    { name: '定制榻榻米', spec: '升降五金可选 / 防潮基层', price: 9240, days: 21 },
    { name: '电视背景墙', spec: '木饰面 / 灯光预埋', price: 6800, days: 18 },
    { name: '玄关收纳', spec: '到顶柜 / 换鞋凳一体', price: 3460, days: 14 },
    { name: '儿童成长书柜', spec: '层板可调 / 圆角防撞', price: 4120, days: 20 },
    { name: '全屋木作', spec: '门墙柜一体 / 五金升级', price: 24600, days: 45 },
  ],

  materials: [
    { name: '白橡多层实木', spec: '18 mm 开放漆哑光', note: '柜体与门板基材', img: 'photo-1558997519-83ea9252edf8', alt: '深色木饰面板细节' },
    { name: '陶瓷釉面', spec: '哑光釉 手工修坯', note: '台面与水槽一体', img: 'photo-1610701596007-11502861dcfa', alt: '白瓷器皿陈列' },
    { name: '哑光黑金属', spec: '粉体喷涂 304 不锈钢', note: '五金与灯具骨架', img: 'photo-1507473885765-e6ed057f782c', alt: '黑色台灯特写' },
    { name: '羊毛混纺面料', spec: '30% 羊毛 防污处理', note: '沙发与靠垫面料', img: 'photo-1555041469-a586c61ea9bc', alt: '墨绿色绒面沙发' },
  ],

  steps: [
    { name: '沟通量房', note: '现场复尺确认需求', days: 1 },
    { name: '方案出图', note: '平面布置与效果图', days: 7 },
    { name: '选材打样', note: '封样确认色板', days: 5 },
    { name: '下单生产', note: '拆单排产与质检', days: 32 },
    { name: '送货安装', note: '进场安装调试', days: 3 },
    { name: '验收交付', note: '逐项验收建档', days: 2 },
  ],

  designers: [
    { name: '陈屿', field: '全屋定制', count: '142 套', avatar: 'https://i.pravatar.cc/160?u=chenyu' },
    { name: '沈聿', field: '木作与灯光', count: '98 套', avatar: 'https://i.pravatar.cc/160?u=shenyu' },
    { name: '罗青禾', field: '收纳系统', count: '126 套', avatar: 'https://i.pravatar.cc/160?u=luoqinghe' },
  ],

  voices: [
    { text: '转角做到 12 厘米，洗切炒的动线终于不用绕。', name: '何叙', meta: '上海 两居 96 ㎡' },
    { text: '图纸给了 1:1 的报价单，落地没有增项。', name: '林一禾', meta: '杭州 三居 128 ㎡' },
    { text: '工期卡在 45 天，交付那天半天就验收完了。', name: '邱实', meta: '苏州 复式 210 ㎡' },
  ],

  stores: [
    { city: '上海', addr: '杨浦区 政民路 88 号 2 层' },
    { city: '杭州', addr: '滨江区 江汉路 1786 号 1 层' },
  ],

  /* 预约表单可选值 */
  form: {
    cities: ['上海', '杭州', '苏州', '成都', '其他'],
    types: ['一居', '两居', '三居', '复式', '别墅'],
    styles: ['原木', '极简', '黑白', '混搭'],
  },
};
