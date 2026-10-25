/* 格木 GEMU / 数据层（第四版 / 和纸编辑部）
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
    label: '全屋定制设计与制造',
    titleLead: '从一张户型图',
    titleAccent: '住得进去',
    titleTail: '的家',
    sub: '设计师上门量房出图，柜体自有工厂生产。从复尺到验收平均 45 天，把图纸变成住得进去的家。',
    primary: '预约量房',
    ghost: '看已落地的家',
    side: '格木定制家居',
    stats: [
      { value: '1,280', unit: '套', label: '累计交付' },
      { value: '45', unit: '天', label: '平均交付周期' },
      { value: '97.4', unit: '%', label: '一次验收通过率', accent: true },
      { value: '10', unit: '年', label: '质保服务' },
    ],
    feature: {
      no: 'NO.0312',
      name: '滨江壹号 3 栋',
      meta: ['上海', '三居', '128 ㎡', '交付 41 天'],
      price: '¥168,000',
      designer: '沈聿',
      img: 'photo-1600607687920-4e2a09cf159d',
      alt: '客厅深色电视墙与角落绿植',
    },
  },

  /* 慢速跑马灯：条目之间以内联菱形饰件分隔 */
  marquee: ['全屋定制设计', '自有工厂制造', '平均 45 天交付', 'ENF 级环保板材', '十年质保', '免费上门量房'],

  /* 案例：户型 / 风格两维可组合筛选，搜索与排序在此之上叠加 */
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

  typeFilters: [
    { id: 'all', label: '全部户型' },
    { id: '一居', label: '一居' },
    { id: '两居', label: '两居' },
    { id: '三居', label: '三居' },
    { id: '四居', label: '四居' },
    { id: '复式', label: '复式' },
    { id: '别墅', label: '别墅' },
  ],

  styleFilters: [
    { id: 'all', label: '不限风格' },
    { id: '原木', label: '原木' },
    { id: '极简', label: '极简' },
    { id: '黑白', label: '黑白' },
    { id: '混搭', label: '混搭' },
  ],

  sortOptions: [
    { id: 'none', label: '默认' },
    { id: 'area', label: '面积' },
    { id: 'days', label: '周期' },
    { id: 'price', label: '造价' },
  ],

  /* 定制清单：计价方式逐条标注 */
  services: [
    { icon: 'wardrobe', name: '全屋柜体', spec: '投影面积计价，含安装与基础五金', price: 1280, unit: '元/㎡ 起', days: '45 天' },
    { icon: 'grid', name: '厨房橱柜', spec: '台面水槽一体，五金可升级', price: 2380, unit: '元/延米 起', days: '30 天' },
    { icon: 'layers', name: '房门木作', spec: '门墙柜一体，隐形合页', price: 1860, unit: '元/樘 起', days: '25 天' },
    { icon: 'sofa', name: '软装配套', spec: '沙发床品，面料防污处理', price: 8600, unit: '元/套 起', days: '20 天' },
    { icon: 'tools', name: '智能五金', spec: '电动抽屉，人体工学配置', price: 1240, unit: '元/套 起', days: '15 天' },
    { icon: 'key', name: '售后保养', spec: '十年质保，年度上门维护', price: 0, unit: '质保期内免费', days: '10 年' },
  ],

  materials: [
    { name: '白橡多层实木', spec: '18 mm 开放漆哑光', note: '柜体与门板基材，FAS 级', swatch: '#C9A87C', img: 'photo-1558997519-83ea9252edf8', alt: '深色木饰面板细节' },
    { name: '陶瓷釉面', spec: '哑光釉 手工修坯', note: '台面与水槽一体成型', swatch: '#E9E4D8', img: 'photo-1610701596007-11502861dcfa', alt: '白瓷器皿陈列' },
    { name: '哑光黑金属', spec: '304 不锈钢 粉体喷涂', note: '五金与灯具骨架', swatch: '#2B2B2E', img: 'photo-1507473885765-e6ed057f782c', alt: '黑色台灯特写' },
    { name: '羊毛混纺面料', spec: '30% 羊毛 防污处理', note: '沙发与靠垫面料', swatch: '#3E5648', img: 'photo-1555041469-a586c61ea9bc', alt: '墨绿色绒面沙发' },
  ],

  steps: [
    { icon: 'phone', name: '预约量房', days: '第 1 天', note: '顾问对接需求与预算区间' },
    { icon: 'ruler', name: '上门复尺', days: '第 2 天', note: '现场复尺，出具原始户型图' },
    { icon: 'pencil', name: '方案出图', days: '第 3 至 9 天', note: '平面布置、效果图与报价单' },
    { icon: 'tools', name: '工厂生产', days: '第 10 至 42 天', note: '拆单排产，出厂逐项质检' },
    { icon: 'truck', name: '配送安装', days: '第 43 至 45 天', note: '进场安装，灯光五金调试' },
    { icon: 'key', name: '验收交付', days: '第 45 天', note: '逐项验收，建档进入质保' },
  ],

  designers: [
    { name: '陈屿', role: '主案设计师', field: '全屋定制', count: '142 套', img: 'photo-1544005313-94ddf0286df2', alt: '主案设计师陈屿' },
    { name: '沈聿', role: '主案设计师', field: '木作与灯光', count: '98 套', img: 'photo-1507003211169-0a1dd7228f2d', alt: '主案设计师沈聿' },
    { name: '罗青禾', role: '主案设计师', field: '收纳系统', count: '126 套', img: 'photo-1573496359142-b8d87734a5a2', alt: '主案设计师罗青禾' },
  ],

  voices: [
    { text: '转角做到 12 厘米，洗切炒的动线终于不用绕。', name: '何叙', city: '上海', spec: '两居 96 ㎡' },
    { text: '图纸给了 1:1 的报价单，落地没有增项。', name: '林一禾', city: '杭州', spec: '三居 128 ㎡' },
    { text: '工期卡在 45 天，交付那天半天就验收完了。', name: '邱实', city: '苏州', spec: '复式 210 ㎡' },
  ],

  stores: [
    { city: '上海', name: '静安设计室', addr: '杨浦区政民路 88 号 2 层', hours: '周一至周日 10:00 至 20:00' },
    { city: '杭州', name: '滨江设计室', addr: '滨江区江汉路 1786 号 1 层', hours: '周一至周日 10:00 至 20:00' },
  ],

  /* 预约表单可选值 */
  form: {
    cities: ['上海', '杭州', '苏州', '成都', '其他'],
    types: ['一居', '两居', '三居', '复式', '别墅'],
    styles: ['原木', '极简', '黑白', '混搭'],
  },
};
