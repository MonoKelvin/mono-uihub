/* 格木 GEMU / 数据层（第七版 / 网格 + 动效）
   内容结构不变，重点是「哪里用图标、哪里留一句话」：
   能用图标表达的（面积、工期、城市、流程节点）一律图标 + 短词，
   不能让位给图形的（承诺、解释）保留一句人话。
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
    outline: 'ATELIER',
    latin: 'Living, since 2014',
    lines: [
      { text: '少一点家具' },
      { text: '多一点生活', accent: true },
      { text: '把家还给生活' },
    ],
    sub: '从一张户型图开始。柜体、动线与材质，按你真正的生活重新安排。',
    meta: [
      { icon: 'home', text: '1,280 套整屋交付' },
      { icon: 'clock', text: '平均 45 天' },
      { icon: 'pin', text: '上海 / 杭州' },
    ],
    img: 'photo-1600607687920-4e2a09cf159d',
    alt: '深色餐台与黑钢楼梯，混凝土墙面',
    cap: '滨江壹号 3 栋 / 128 ㎡ / 交付 41 天',
  },

  /* 作品：横向画廊，滚动驱动 */
  works: {
    label: '作品选辑',
    latin: 'Selected works',
    count: '05',
    lead: '五套已交付的整屋，按面积从小到大排列。',
    hint: '继续向下，作品横向推进',
    items: [
      { no: '01', name: '滨江壹号 3 栋', city: '上海', type: '三居', area: 128, days: 41, price: 168000, img: 'photo-1600607687644-c7171b42498f', alt: '灰白主卧与整墙落地窗' },
      { no: '02', name: '山居 A 宅', city: '莫干山', type: '别墅', area: 260, days: 68, price: 398000, img: 'photo-1600585154340-be6161a56a0c', alt: '暮色中的独栋住宅外观' },
      { no: '03', name: '衡山坊 7 号', city: '上海', type: '三居', area: 142, days: 45, price: 186000, img: 'photo-1600566752355-35792bedcfea', alt: '独立浴缸与深灰石材浴室' },
      { no: '04', name: '科技园 LOFT', city: '深圳', type: '复式', area: 210, days: 61, price: 302000, img: 'photo-1600607687939-ce8a6c25118c', alt: '挑高客厅与整面木饰面壁炉墙' },
      { no: '05', name: '静安书房', city: '上海', type: '一居', area: 58, days: 27, price: 76000, img: 'photo-1594620302200-9a762244a156', alt: '整墙木色书柜与飘窗书桌' },
    ],
  },

  /* 服务：整幅酒红色块，四行反色清单 */
  services: {
    label: '服务清单',
    latin: 'Savoir-faire',
    index: '01 / 04',
    lead: '四件事在签约前全部说清楚，之后不再增加项目。',
    items: [
      { no: '01', name: '整屋柜体', en: 'Wardrobe System', desc: '收纳动线先行，投影面积计价，签约后不再产生增项', icon: 'wardrobe', img: 'photo-1558997519-83ea9252edf8', alt: '深色木饰面板细节' },
      { no: '02', name: '厨房与房门', en: 'Kitchen and Doors', desc: '门墙柜一体收口，台面与水槽一体成型', icon: 'grid', img: 'photo-1600489000022-c2086d79f9d4', alt: '深色橱柜与中岛开放式厨房' },
      { no: '03', name: '材料封样', en: 'Material Sample', desc: '四种基材签约前实物对比，可替换可升级', icon: 'leaf', img: 'photo-1610701596007-11502861dcfa', alt: '白瓷器皿陈列' },
      { no: '04', name: '十年质保', en: 'Ten Year Warranty', desc: '年度上门维护，五金终身供给', icon: 'shield', img: 'photo-1507473885765-e6ed057f782c', alt: '黑色台灯特写' },
    ],
  },

  /* 流程：三列并置，横向连接线 */
  flow: {
    label: '流程',
    latin: 'Process',
    lead: '从量房到交付，三个节点，一共 45 天。',
    items: [
      { no: '01', name: '量房与复尺', icon: 'ruler', days: '第 1 至 2 天', note: '上门量房，出具原始户型图与预算区间' },
      { no: '02', name: '方案与报价', icon: 'blueprint', days: '第 3 至 9 天', note: '平面布置、效果图与 1:1 报价单，逐项可核对' },
      { no: '03', name: '生产与交付', icon: 'truck', days: '第 10 至 45 天', note: '工厂排产、进场安装、逐项验收后建档' },
    ],
    quote: { text: '转角做到 12 厘米，洗切炒的动线终于不用绕。', name: '何叙', meta: '上海 / 两居 96 ㎡' },
  },

  /* 预约：整幅墨黑，只留一个手机号 */
  book: {
    kicker: '预约',
    rsvp: 'R.S.V.P.',
    lead: '把户型图',
    accent: '交给我们',
    sub: '48 小时内，收到平面方案与预算区间。不满意不收费。',
    btn: '预约咨询',
    phoneLabel: '或直接致电',
    placeholder: '11 位手机号',
    invalid: '请填写有效的 11 位手机号',
    sending: '提交中',
    okTitle: '已收到你的预约',
    okSub: '顾问将携带同户型案例与你联系，请保持电话畅通。',
    again: '重新填写',
    stores: [
      { icon: 'pin', text: '静安设计室 / 上海' },
      { icon: 'pin', text: '滨江设计室 / 杭州' },
      { icon: 'clock', text: '周一至周日 10:00 至 20:00' },
    ],
  },

  footer: {
    word: 'GEMU',
  },
};
