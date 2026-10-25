/* 格木 GEMU / 数据层（第五版 / 余白）
   内容极简：一件主张、五件作品、四项服务、三步流程、一行预约。
   页面所有文案、数字与图片地址集中在此，app.js 只读取消费，不硬编码内容。 */

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
    { id: 'services', text: '服务' },
    { id: 'flow', text: '流程' },
    { id: 'book', text: '预约' },
  ],

  hero: {
    kicker: '全屋定制 / 自 2014',
    lines: [
      { text: '少一点家具' },
      { text: '多一点生活', accent: true },
      { text: '把家还给生活' },
    ],
    sub: '从一张户型图开始。柜体、动线与材质，按你真正的生活重新安排。',
    meta: ['1,280 套整屋交付', '平均 45 天', '上海 / 杭州'],
    img: 'photo-1600607687920-4e2a09cf159d',
    alt: '客厅深色电视墙与角落绿植',
    cap: '滨江壹号 3 栋 / 128 ㎡ / 交付 41 天',
    side: '格木定制家居',
  },

  /* 作品：横向画廊，滚动驱动，不做筛选不做搜索 */
  works: {
    label: '作品选辑',
    hint: '向下滚动，横向浏览',
    items: [
      { no: '01', name: '滨江壹号 3 栋', city: '上海', type: '三居', area: 128, days: 41, price: 168000, img: 'photo-1600607687920-4e2a09cf159d', alt: '客厅深色电视墙与角落绿植' },
      { no: '02', name: '山居 A 宅', city: '莫干山', type: '别墅', area: 260, days: 68, price: 398000, img: 'photo-1600585154340-be6161a56a0c', alt: '暮色中的独栋住宅外观' },
      { no: '03', name: '衡山坊 7 号', city: '上海', type: '三居', area: 142, days: 45, price: 186000, img: 'photo-1600566753086-00f18fb6b3ea', alt: '玻璃隔断客厅与黑色框架楼梯' },
      { no: '04', name: '科技园 LOFT', city: '深圳', type: '复式', area: 210, days: 61, price: 302000, img: 'photo-1502005229762-cf1b2da7c5d6', alt: '挑高 LOFT 客厅与钢结构楼梯' },
      { no: '05', name: '静安书房', city: '上海', type: '一居', area: 58, days: 27, price: 76000, img: 'photo-1594620302200-9a762244a156', alt: '整墙木色书柜与飘窗书桌' },
    ],
  },

  /* 服务：四行清单，悬停整行反色，光标处浮出参考图 */
  services: {
    label: '服务清单',
    items: [
      { no: '01', name: '整屋柜体', en: 'Wardrobe System', desc: '收纳动线先行，投影面积计价，签约后不再产生增项', icon: 'wardrobe', img: 'photo-1558997519-83ea9252edf8', alt: '深色木饰面板细节' },
      { no: '02', name: '厨房与房门', en: 'Kitchen and Doors', desc: '门墙柜一体收口，台面与水槽一体成型', icon: 'grid', img: 'photo-1600489000022-c2086d79f9d4', alt: '深色橱柜与中岛开放式厨房' },
      { no: '03', name: '材料封样', en: 'Material Sample', desc: '四种基材签约前实物对比，可替换可升级', icon: 'leaf', img: 'photo-1610701596007-11502861dcfa', alt: '白瓷器皿陈列' },
      { no: '04', name: '十年质保', en: 'Ten Year Warranty', desc: '年度上门维护，五金终身供给', icon: 'key', img: 'photo-1507473885765-e6ed057f782c', alt: '黑色台灯特写' },
    ],
  },

  /* 流程：三步，错位缩进，垂直细线描绘 */
  flow: {
    label: '流程',
    items: [
      { no: '01', name: '量房与复尺', days: '第 1 至 2 天', note: '上门量房，出具原始户型图与预算区间' },
      { no: '02', name: '方案与报价', days: '第 3 至 9 天', note: '平面布置、效果图与 1:1 报价单，逐项可核对' },
      { no: '03', name: '生产与交付', days: '第 10 至 45 天', note: '工厂排产、进场安装、逐项验收后建档' },
    ],
    quote: { text: '转角做到 12 厘米，洗切炒的动线终于不用绕。', name: '何叙', meta: '上海 / 两居 96 ㎡' },
  },

  /* 预约：只留一个手机号字段 */
  book: {
    kicker: '预约',
    lead: '把户型图',
    accent: '交给我们',
    sub: '48 小时内，收到平面方案与预算区间。',
    btn: '预约咨询',
    phoneLabel: '或直接致电',
    placeholder: '11 位手机号',
    invalid: '请填写有效的 11 位手机号',
    sending: '提交中',
    okTitle: '已收到你的预约',
    okSub: '顾问将携带同户型案例与你联系，请保持电话畅通。',
    again: '重新填写',
    stores: '上海 静安设计室 / 杭州 滨江设计室 / 周一至周日 10:00 至 20:00',
  },
};
