/* Local correspondence and game asset references. See DESIGN.md for provenance. */
(() => {
  const briefingText = '罗德岛龙门停靠简报\n档案编号：LM-1097\n\n停靠时间：10月15日 08:30\n集合地点：第三甲板 / 东侧舷梯\n\n1. 外勤干员于08:00前完成装备检查。\n2. 医疗部门复核转运药品与防护物资。\n3. RI-041源石样本由工程部专员封装转运。\n4. 离舰前向行动指挥组报备预计返回时间。\n\n联络人：阿米娅\n罗德岛行动指挥组';
  const dockingMap = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e9ece3"/><g stroke="#b9c2b0" fill="none"><path d="M40 80H600M40 160H600M40 240H600M40 320H600M120 40V360M240 40V360M360 40V360M480 40V360"/><path d="M90 160H410L520 200 410 240H90Z" fill="#465346" stroke="#465346"/><path d="M320 240V320H550" stroke="#867c3d" stroke-width="8"/></g><g font-family="sans-serif" font-size="16"><text x="170" y="205" fill="#e9ece3">RHODES ISLAND</text><text x="335" y="290" fill="#465346">DECK 03 / EAST</text><text x="40" y="45" fill="#465346">LUNGMEN DOCKING AREA</text></g><circle cx="550" cy="320" r="9" fill="#867c3d"/></svg>';
  const initialMessages = [
    { id: 'ri-1042', sender: '阿米娅', email: 'amiya@rhodes.is', role: '行动指挥', emblem: 'plant-2', subject: '龙门停靠计划与行动部署', preview: '博士，下一站是龙门。请查收本次停靠的行动安排。', date: '2026-10-14T10:42:00', unread: false, starred: true, folder: 'inbox', priority: true, featured: true, paragraphs: ['博士：', '罗德岛即将抵达龙门。在接下来的停靠期间，我们将进行物资补给与干员轮换，请您确认本次行动的部署安排。', '外勤小队已完成集结。医疗部门将同步转运药品，工程部负责 RI-041 源石样本的封装与交接，详细清单见附件。', '如果您有时间，出发前请来一趟舰桥。还有一些事情，我想当面和您说。'], signature: '阿米娅 / 罗德岛行动指挥', attachments: [{ name: '龙门停靠简报.txt', content: briefingText, type: 'text/plain' }, { name: '停靠区域示意.svg', content: dockingMap, type: 'image/svg+xml' }] },
    { id: 'ri-1039', sender: '凯尔希', email: 'kaltsit@rhodes.is', role: '医疗部门', emblem: 'medical-cross', subject: '关于本周干员健康检查的补充说明', preview: '本次体检涉及新增外勤干员，请提前安排时间。', date: '2026-10-14T09:18:00', unread: true, starred: false, folder: 'inbox', priority: false, paragraphs: ['博士：', '本周干员健康检查将于明日下午开始，新增外勤干员与近期接触过源石的人员优先安排。', '请通知各小队在检查前提交近期任务记录，并确保检查当天没有安排高强度训练。', '另外，您的复查时间仍是下午三点。请准时到场。'], signature: '凯尔希 / 医疗部门', attachments: [] },
    { id: 'ri-1037', sender: '可露希尔', email: 'closure@rhodes.is', role: '后勤保障', emblem: 'tool', subject: '舰内通讯系统维护通知', preview: '今晚的短暂维护，不会影响已经保存的邮件。', date: '2026-10-14T08:56:00', unread: true, starred: false, folder: 'inbox', paragraphs: ['博士，早上好！', '工程部计划今晚 23:30 对舰内通讯节点进行例行维护，预计持续二十分钟。已缓存的邮件与本地草稿仍然可以正常查看。', '如果有需要发送的紧急消息，请在维护前完成。', '顺便提醒一下：请不要再用咖啡杯压住服务器机柜上的散热口了。'], signature: '可露希尔 / 罗德岛工程部', attachments: [] },
    { id: 'ri-1034', sender: '能天使', email: 'exusiai@penguin.logistics', role: '后勤保障', emblem: 'package', subject: '企鹅物流：你的包裹已经到啦！', preview: '老板，这次的补给准时送达，记得来签收。', date: '2026-10-14T08:21:00', unread: false, starred: false, folder: 'inbox', paragraphs: ['老板！', '你订的补给已经送到龙门停靠点了。三箱咖啡、两箱办公用品，还有后勤部追加的那批防护手套，一件没少。', '我们会把货物留在东侧仓库，联络德克萨斯就能取货。', '对了，里面那盒苹果派是送你的。工作再忙也要记得吃点东西！'], signature: '能天使 / 企鹅物流', attachments: [] },
    { id: 'ri-1028', sender: 'PRTS', email: 'prts@rhodes.is', role: '行动指挥', emblem: 'cpu', subject: '作战记录归档完成', preview: '最近一次行动的记录已整理，可随时查阅。', date: '2026-10-13T20:04:00', unread: true, starred: false, folder: 'inbox', paragraphs: ['博士：', '行动指挥系统已完成最近一次外勤任务记录的整理。参与小队、物资消耗与医疗支援记录现已归档。', '行动复盘会议安排于本周五，请各负责人提前核对任务记录。', '如需修改归档内容，请向行动指挥组提交补充说明。'], signature: 'PRTS / 战术辅助系统', attachments: [] },
    { id: 'ri-1025', sender: '杜宾', email: 'dobermann@rhodes.is', role: '行动指挥', emblem: 'shield', subject: '预备行动组训练安排', preview: '新一周的训练计划，请各组长确认出勤名单。', date: '2026-10-13T16:35:00', unread: false, starred: true, folder: 'inbox', paragraphs: ['博士：', '预备行动组下周将进行地形适应与小队协同训练，训练场地为第四甲板模拟区域。', '训练从上午九点开始，各组长需提前十五分钟完成装备与出勤检查。', '如果您能抽空观摩，应该能看到孩子们这段时间的进步。'], signature: '杜宾 / 训练教官', attachments: [] },
    { id: 'ri-1021', sender: '调香师', email: 'perfumer@rhodes.is', role: '医疗部门', emblem: 'flower', subject: '疗养庭院的白花开了', preview: '工作之余，也来庭院里坐一会儿吧。', date: '2026-10-13T14:12:00', unread: true, starred: false, folder: 'inbox', paragraphs: ['博士：', '前些日子移栽的白花今天开了。庭院里的湿度和光照都很合适，大家午休时也喜欢过来坐坐。', '如果最近的工作让您有些疲惫，欢迎随时来这里。茶和靠窗的位置都为您留着。', '偶尔停下来，也是为了更好地前行。'], signature: '调香师 / 疗养庭院', attachments: [] },
    { id: 'ri-1018', sender: '后勤办公室', email: 'logistics@rhodes.is', role: '后勤保障', emblem: 'clipboard-list', subject: '十月物资申领汇总', preview: '各部门的物资需求已汇总，请在周五前补充。', date: '2026-10-13T11:06:00', unread: false, starred: false, folder: 'inbox', paragraphs: ['博士：', '本月物资申领记录已整理。当前优先补充医疗耗材、工程工具与防护装备。', '各部门如有新增需求，请在本周五下午五点前发送至后勤办公室，以便与龙门采购安排合并处理。'], signature: '罗德岛后勤办公室', attachments: [] },
    { id: 'draft-briefing', sender: '博士', email: 'doctor@rhodes.is', to: 'amiya@rhodes.is', role: '行动指挥', emblem: 'file-pencil', subject: '关于停靠期间的值班安排', preview: '阿米娅，值班名单我已经看过了……', date: '2026-10-14T10:05:00', unread: false, starred: false, folder: 'drafts', paragraphs: ['阿米娅：', '值班名单我已经看过了，医疗组的安排可以再留一些余量。'], attachments: [] },
  ];

  const contacts = [
    {name:'阿米娅',email:'amiya@rhodes.is',group:'行动指挥',mark:'command',title:'行动指挥负责人',status:'online'},
    {name:'凯尔希',email:'kaltsit@rhodes.is',group:'医疗部门',mark:'medical',title:'医疗部门负责人',status:'online'},
    {name:'能天使',email:'exusiai@penguin.logistics',group:'后勤保障',mark:'logistics',title:'外勤物流联络员',status:'offline'},
    {name:'杜宾',email:'dobermann@rhodes.is',group:'行动指挥',mark:'training',title:'预备行动组教官',status:'online'},
    {name:'调香师',email:'perfumer@rhodes.is',group:'医疗部门',mark:'medical',title:'疗养庭院负责人',status:'online'},
    {name:'可露希尔',email:'closure@rhodes.is',group:'后勤保障',mark:'engineering',title:'工程部门负责人',status:'offline'},
    {name:'PRTS',email:'prts@rhodes.is',group:'行动指挥',mark:'system',title:'战术辅助系统',status:'online'}
  ];
  const materials = [
    {id:'originium',name:'源石封装样本',english:'ORIGINIUM',quantity:12,unit:'枚',category:'能源物资',description:'具有锐利天然棱面的深色晶簇，橙金色矿脉包裹在黑色矿壳之中。运输时使用独立密封容器。',reference:'样本 RI-041',handling:'隔离封装 / 工程部交接'},
    {id:'case',name:'医疗转运箱',english:'MEDICAL CARGO',quantity:8,unit:'箱',category:'医疗物资',description:'配备隔热内衬与机械锁扣的标准转运箱，装载本次停靠交接所需的医疗耗材。',reference:'批次 MD-018',handling:'冷链转运 / 医疗部复核'},
    {id:'record',name:'行动档案模块',english:'FIELD RECORD',quantity:6,unit:'份',category:'行动资料',description:'行动指挥组整理的外勤安排与地形资料，用于小队出发前的交接。',reference:'档案 LM-1097',handling:'内部查阅 / 归档留存'}
  ];
  window.RhodesData = { initialMessages, contacts, materials };
})();

