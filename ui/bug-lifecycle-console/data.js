/* 虫况 · 本地演示数据（刷新即重置） */
window.BUG_DATA = {
  me: '韩霜',
  people: {
    '秦朗': 'qinlang', '宋雨桐': 'songyutong', '陆知行': 'luzhixing', '顾一帆': 'guyifan',
    '韩霜': 'hanshuang', '白鹭': 'bailu', '赵砚秋': 'zhaoyanqiu', '程一鸣': 'chengyiming'
  },
  devs: ['宋雨桐', '陆知行', '顾一帆', '韩霜'],
  pulse: { days: ['10-11', '10-12', '10-13', '10-14', '10-15', '10-16', '10-17'], in: [2, 3, 1, 4, 3, 4, 2], out: [1, 2, 2, 1, 3, 2, 1] },
  bugs: [
    { id: 1047, title: '支付回调重复入账，偶发双倍记账', sev: 'P0', status: 'fixing', module: '支付网关', ver: 'v3.2.1', reporter: '秦朗', assignee: '宋雨桐', updated: '10-17 09:52',
      desc: '商户侧偶发同一笔订单收到两次支付成功回调，第二次未命中幂等键导致重复入账。出现频率约千分之一，集中在高峰回调重试窗口内。',
      timeline: [
        { t: '10-17 09:52', actor: '宋雨桐', line: '定位到回调重放窗口与幂等键失效' },
        { t: '10-16 14:18', actor: '宋雨桐', line: '开始修复，补充回调幂等回归用例' },
        { t: '10-15 10:26', actor: '韩霜', line: '确认缺陷，定级 P0，影响支付主链路' },
        { t: '10-15 09:41', actor: '秦朗', line: '创建缺陷，附上回调日志片段' }] },
    { id: 1046, title: 'iOS 长按粘贴后输入光标跳到行首', sev: 'P2', status: 'verifying', module: '移动端', ver: 'v2.9.4', reporter: '白鹭', assignee: '顾一帆', updated: '10-17 10:07',
      desc: 'iOS 17 环境下，订单备注字段长按粘贴多行文本后，光标跳到行首而非粘贴末尾；仅在该字段复现。',
      timeline: [
        { t: '10-17 10:07', actor: '顾一帆', line: '提交待验证，自测通过' },
        { t: '10-16 10:31', actor: '顾一帆', line: '开始修复，调整光标定位逻辑' },
        { t: '10-15 10:26', actor: '韩霜', line: '确认并分派给顾一帆' },
        { t: '10-14 16:40', actor: '白鹭', line: '创建缺陷，附复现录屏' }] },
    { id: 1045, title: '夜间模式导出 PDF 表格文字不可读', sev: 'P1', status: 'confirmed', module: '报表导出', ver: 'v3.1.8', reporter: '赵砚秋', assignee: '韩霜', updated: '10-14 15:10',
      desc: '夜间模式下导出 PDF 的表格为浅灰底浅灰字，打印后几近不可读；日间模式正常。',
      timeline: [
        { t: '10-14 15:02', actor: '韩霜', line: '确认缺陷，归入报表导出问题组并认领' },
        { t: '10-13 11:24', actor: '赵砚秋', line: '创建缺陷，附上夜间导出效果图' }] },
    { id: 1044, title: 'Webhook 失败重试无退避，15 分钟打出 400 次', sev: 'P1', status: 'new', module: '消息推送', ver: 'v3.2.0', reporter: '秦朗', assignee: null, updated: '10-17 08:12',
      desc: 'webhook 投递失败后重试无退避策略，15 分钟内向下游打出 400 次请求，触发对方限流。建议引入指数退避并设置最大重试次数。',
      timeline: [{ t: '10-17 08:12', actor: '秦朗', line: '创建缺陷，附上重试日志统计' }] },
    { id: 1043, title: '沙箱环境签名校验未覆盖 30s 时间偏移', sev: 'P1', status: 'new', module: '开放平台', ver: 'v3.0.2', reporter: '程一鸣', assignee: null, updated: '10-16 17:48',
      desc: '开放平台沙箱环境的签名校验未覆盖时间戳偏移 30 秒以内的请求，正式环境校验正常，两端行为不一致。',
      timeline: [{ t: '10-16 17:48', actor: '程一鸣', line: '创建缺陷，附上复现 cURL' }] },
    { id: 1042, title: '企业微信扫码登录偶发 403', sev: 'P2', status: 'fixing', module: '权限中心', ver: 'v3.2.1', reporter: '白鹭', assignee: '陆知行', updated: '10-17 11:18',
      desc: '企业微信扫码登录偶发 403，间隔数秒重试两次即恢复；怀疑与证书轮换窗口的会话校验竞争有关。',
      timeline: [
        { t: '10-17 11:18', actor: '陆知行', line: '怀疑证书轮换竞态，排查中' },
        { t: '10-16 09:20', actor: '陆知行', line: '开始修复' },
        { t: '10-15 14:02', actor: '韩霜', line: '确认并分派给陆知行' },
        { t: '10-15 13:37', actor: '白鹭', line: '创建缺陷' }] },
    { id: 1041, title: '导出十万行明细时网关 504 且无提示', sev: 'P1', status: 'verifying', module: '报表导出', ver: 'v3.1.9', reporter: '韩霜', assignee: '顾一帆', updated: '10-17 09:12',
      desc: '导出十万行明细时网关返回 504，前端无任何失败提示，用户误以为导出成功。',
      timeline: [
        { t: '10-17 09:12', actor: '顾一帆', line: '改为异步分段导出，十万行 42 秒完成' },
        { t: '10-14 15:44', actor: '顾一帆', line: '开始修复' },
        { t: '10-12 11:30', actor: '韩霜', line: '确认并分派给顾一帆' },
        { t: '10-12 10:05', actor: '韩霜', line: '创建缺陷' }] },
    { id: 1040, title: '金额输入框接受三位小数，结算出现分差', sev: 'P1', status: 'confirmed', module: '结算中心', ver: 'v3.2.1', reporter: '秦朗', assignee: '宋雨桐', updated: '10-14 10:41',
      desc: '金额输入框接受三位小数，保存时四舍五入产生分差，与结算对账单不一致。',
      timeline: [
        { t: '10-14 10:41', actor: '韩霜', line: '确认并分派给宋雨桐' },
        { t: '10-14 09:56', actor: '秦朗', line: '创建缺陷' }] },
    { id: 1039, title: '发票抬头含全角括号时打印错位', sev: 'P3', status: 'closed', module: '结算中心', ver: 'v3.1.6', reporter: '白鹭', assignee: '韩霜', updated: '10-10 11:05',
      desc: '发票抬头包含全角括号时打印版式错位，标题字段未做全半角归一。',
      timeline: [
        { t: '10-10 11:05', actor: '顾一帆', line: '验证通过并关闭' },
        { t: '10-09 16:12', actor: '韩霜', line: '开始修复，调整打印模板转义' },
        { t: '10-09 09:40', actor: '韩霜', line: '确认并认领' },
        { t: '10-08 15:23', actor: '白鹭', line: '创建缺陷' }] },
    { id: 1038, title: 'Android 12 以下机型推送注册失败', sev: 'P2', status: 'fixing', module: '移动端', ver: 'v2.9.4', reporter: '赵砚秋', assignee: '顾一帆', updated: '10-16 14:05',
      desc: 'Android 12 以下机型推送通道注册失败，影响离线消息触达；厂商通道文档与实际行为不符。',
      timeline: [
        { t: '10-16 14:05', actor: '顾一帆', line: '开始修复' },
        { t: '10-16 09:47', actor: '韩霜', line: '确认并分派给顾一帆，附厂商文档' },
        { t: '10-16 08:31', actor: '赵砚秋', line: '创建缺陷' }] },
    { id: 1036, title: 'Firefox 图表 tooltip 定位偏移半格', sev: 'P3', status: 'rejected', module: '移动端', ver: 'v2.9.3', reporter: '程一鸣', assignee: null, updated: '10-06 10:02',
      desc: 'Firefox 下图表 tooltip 定位偏移半格。',
      timeline: [
        { t: '10-06 10:02', actor: '韩霜', line: '标记为拒绝：三台环境均无法复现' },
        { t: '10-05 18:20', actor: '程一鸣', line: '创建缺陷' }] },
    { id: 1035, title: '子账号切换企业后旧令牌仍可调用', sev: 'P0', status: 'closed', module: '权限中心', ver: 'v3.2.0', reporter: '韩霜', assignee: '陆知行', updated: '10-10 17:28',
      desc: '子账号切换企业后，旧企业的访问令牌未被吊销，仍可在 30 分钟内调用旧企业接口。',
      timeline: [
        { t: '10-10 17:28', actor: '韩霜', line: '验证通过并关闭，补充越权回归用例' },
        { t: '10-09 20:14', actor: '陆知行', line: '提交待验证，切换时吊销旧令牌' },
        { t: '10-09 10:02', actor: '陆知行', line: '开始修复' },
        { t: '10-09 09:15', actor: '韩霜', line: '创建并确认，定级 P0' }] },
    { id: 1034, title: '消息中心未读数在多端不同步', sev: 'P3', status: 'new', module: '消息推送', ver: 'v3.2.1', reporter: '白鹭', assignee: null, updated: '10-17 07:40',
      desc: '在 Web 端读完消息后，移动端未读角标约 5 分钟后才清零。',
      timeline: [{ t: '10-17 07:40', actor: '白鹭', line: '创建缺陷' }] }
  ]
};
