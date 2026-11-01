const courses = [
  {
    id: 'bias', category: '心理学', title: '为什么我们总是高估自己？', subtitle: '认知心理学', minutes: 12, art: 'mind', color: 'var(--brand)',
    description: '从一个常见的认知错觉出发，认识能力与自信之间的关系，练习更准确地评价自己。',
    lessons: [
      { title: '知道得少，反而更有把握？', minutes: 4, paragraphs: ['刚开始学习一件事时，我们常觉得：这也没有那么难。真正深入之后，却发现自己不懂的东西越来越多。', '这不只是谦虚。判断自己做得好不好，也需要与完成任务相近的知识和能力。缺少经验时，我们可能既会犯错，也不容易察觉错误。'], takeaway: '看不见自己的知识边界，不等于边界不存在。' },
      { title: '自信，不是能力的刻度', minutes: 3, paragraphs: ['心理学中的达克效应，描述的是能力不足的人可能高估自己表现的现象。但它不意味着“越自信的人越无知”，也不能用来给别人贴标签。', '评价能力时，与其问“我感觉怎么样”，不如看具体结果：做对了多少？能否解释原因？换一个问题，还能独立完成吗？'], takeaway: '把“我觉得会了”，换成“我能做出来”。' },
      { title: '给自己的判断找个参照', minutes: 3, paragraphs: ['学习之前，先预测自己能答对几题。做完之后，把预测和结果放在一起比较。这个小练习，可以帮助我们校准判断。', '也可以找一个愿意给出具体反馈的人。反馈最好落在行为上，例如“这一步推理缺少证据”，而不是笼统地说“你不行”。'], takeaway: '用结果和反馈，给自信一个可靠的支点。' }
    ],
    quiz: { question: '怎样更可靠地判断自己是否掌握了一项知识？', options: ['读完后觉得很熟悉', '独立解决一个新问题，再核对结果', '听别人说这很简单'], correct: 1, explanation: '熟悉感容易被误认为掌握。独立完成任务，并用结果与反馈校准判断，才是更可靠的证据。' },
    insight: '自信不等于掌握；用独立实践和具体反馈校准判断。'
  },
  {
    id: 'memory', category: '心理学', title: '让大脑记得更牢', subtitle: '学习方法', minutes: 10, art: 'memory', color: 'var(--lavender)',
    description: '不靠反复重读，用主动回忆与间隔练习，把短暂的熟悉感变成长久的记忆。',
    lessons: [
      { title: '熟悉，不等于记住', minutes: 3, paragraphs: ['第二遍看笔记时，每一句话都很熟悉。但合上笔记，你可能又说不出来。熟悉感来自识别，提取知识却需要另一种努力。', '下次读完一小段内容，先合上书，用自己的话说出它的意思。说不出来的部分，就是下一次该重点看的地方。'], takeaway: '合上书后能说出来，才更接近真正记住。' },
      { title: '给记忆留一点间隔', minutes: 3, paragraphs: ['把同样长的练习分散到几天，通常比一次集中练完更有利于长期记忆。间隔让提取变得有些困难，也给记忆再次巩固的机会。', '你可以在学习后的第二天、几天后和一周后回忆重点。没有适合所有人的固定间隔，根据遗忘情况调整即可。'], takeaway: '在快要忘记时，试着再想起来。' },
      { title: '先回忆，再核对', minutes: 2, paragraphs: ['复习时，先给自己一个问题，尝试回答，然后再看答案。不要把“看过答案”算作一次成功回忆。', '如果答错，把错误和正确解释一起看一遍；稍后再试。困难是反馈，不是失败的判决。'], takeaway: '主动回忆，加上及时反馈，是有效复习的搭档。' }
    ],
    quiz: { question: '下面哪种做法更有利于长期记忆？', options: ['一口气把笔记重读五遍', '只标记重点，不再练习', '分几天合上笔记回忆，再核对答案'], correct: 2, explanation: '间隔练习与主动回忆可以增强长期记忆。核对答案提供必要的反馈，避免把错误一直记下去。' },
    insight: '分散练习，先回忆再核对，比单纯重读更可靠。'
  },
  {
    id: 'color', category: '设计', title: '颜色为什么会“说话”？', subtitle: '视觉设计', minutes: 8, art: 'design', color: 'var(--peach)',
    description: '观察色彩怎样引导注意、表达状态，以及同一种颜色为什么会带来不同感受。',
    lessons: [
      { title: '颜色先带你看见重点', minutes: 2, paragraphs: ['一页灰色文字里，一个鲜明的色块会很容易吸引注意。颜色不仅营造氛围，也在帮助我们决定先看哪里。', '如果每个按钮都一样鲜艳，就没有真正的重点。先确定页面最重要的任务，再把最有辨识度的颜色留给它。'], takeaway: '颜色的分量，来自与周围的对比。' },
      { title: '颜色的含义，要看语境', minutes: 2, paragraphs: ['红色在错误提示中可能意味着警告，在节庆页面中却可能意味着喜悦。颜色没有脱离文化和语境的唯一解释。', '设计时，先看用户所在的场景与已形成的习惯。保持同一产品内的含义一致，比记住一套“色彩心理学公式”更有用。'], takeaway: '色彩含义由场景和使用习惯共同塑造。' },
      { title: '让信息不只靠颜色', minutes: 2, paragraphs: ['如果错误输入只显示一圈红色边框，有些人可能无法识别。屏幕环境和视觉差异，都会影响对颜色的感知。', '给状态加上文字、图标或形状。错误时明确说明原因；成功时给出可读的状态。颜色可以强化信息，但不应是唯一线索。'], takeaway: '用颜色强调，也用文字和形状解释。' }
    ],
    quiz: { question: '表单出错时，哪种反馈更容易被不同用户理解？', options: ['红色边框，加具体错误说明和图标', '只把边框改成红色', '让输入框闪一下'], correct: 0, explanation: '文字和图标提供了颜色之外的线索，也能具体说明如何修正问题。' },
    insight: '颜色负责强调，文字与形状保证信息被理解。'
  },
  {
    id: 'history', category: '人文', title: '一杯咖啡里的世界史', subtitle: '生活与历史', minutes: 11, art: 'history', color: 'var(--peach)',
    description: '从咖啡馆的诞生，看一种日常饮品如何连接贸易、城市生活与公共讨论。',
    lessons: [
      { title: '一颗豆子的远行', minutes: 3, paragraphs: ['咖啡植物原产于非洲，咖啡饮用文化在阿拉伯半岛逐渐发展。通过人员往来和贸易，咖啡又进入更多城市。', '一件日常物品的传播，往往不是孤立事件。它连着航线、种植方式、劳动与消费习惯，也留下复杂的历史。'], takeaway: '日常物品，也能成为观察世界联系的入口。' },
      { title: '咖啡馆，不只卖咖啡', minutes: 3, paragraphs: ['在近代欧洲的一些城市，咖啡馆成为人们交换消息、阅读报纸和讨论事务的地方。不同群体也会选择不同的聚会空间。', '这些场所让信息更容易流动，但并不意味着所有人都有平等的进入机会。认识历史，也要问：谁能参与，谁被排除？'], takeaway: '看一个公共空间，也要看谁能够进入。' },
      { title: '把历史放回生活里', minutes: 3, paragraphs: ['下次端起咖啡，你可以问：豆子从哪里来？哪些人在生产和运输中付出劳动？价格又由什么决定？', '历史不只在年代和人物列表里。顺着日常事物追问，我们更容易理解经济、文化与社会之间的联系。'], takeaway: '对身边的东西多问一个“为什么”。' }
    ],
    quiz: { question: '研究历史上的咖啡馆时，哪个问题能补充更完整的视角？', options: ['只看室内装饰是否漂亮', '谁能够进入并参与讨论？', '今天哪种咖啡最好喝？'], correct: 1, explanation: '参与者与被排除的群体，能帮助我们理解公共空间在当时社会中的角色与限制。' },
    insight: '研究日常物品的流动，也是在研究人与世界的联系。'
  },
  {
    id: 'space', category: '科学', title: '月亮，为什么总是同一张脸？', subtitle: '天文入门', minutes: 9, art: 'space', color: 'var(--lavender)',
    description: '用一段简单的空间想象，理解月球的自转、公转和潮汐锁定。',
    lessons: [
      { title: '月亮其实也在自转', minutes: 2, paragraphs: ['我们大多数时候看到月球的同一面，不是因为它没有自转。恰恰相反，它的自转与绕地球公转几乎同步。', '想象你始终面向圆心，沿着圆周走一圈。为了保持面向圆心，你的身体也转过了一圈。'], takeaway: '始终面向地球，需要月球也在转动。' },
      { title: '两种转动的节奏一致', minutes: 3, paragraphs: ['月球绕地球转一圈的时间，约等于它自转一圈的时间。这种同步自转，让它大体保持同一面朝向地球。', '地球引力造成的潮汐作用，在漫长时间里影响了月球的转动，使它逐步进入这种状态，这叫潮汐锁定。'], takeaway: '自转周期与公转周期接近相等，形成同步自转。' },
      { title: '背面，并不是永远黑暗', minutes: 2, paragraphs: ['月球背面是背向地球的一面，不是永远没有阳光的一面。随着月球绕地球运动，正面与背面都会轮流接受太阳照射。', '“我们看不到”和“太阳照不到”是两个不同问题。区分观察位置，可以避免许多直觉误会。'], takeaway: '月球背面也有白天和夜晚。' }
    ],
    quiz: { question: '为什么月球大体上总用同一面朝向地球？', options: ['月球从不自转', '月球背面没有阳光', '自转一圈与绕地球一圈的时间接近相等'], correct: 2, explanation: '月球处于同步自转状态，也叫潮汐锁定。月球背面同样会受到太阳照射。' },
    insight: '月球也在自转；同步自转让同一面朝向地球。'
  },
  {
    id: 'writing', category: '人文', title: '把一件事，讲清楚', subtitle: '日常表达', minutes: 7, art: 'writing', color: 'var(--mint)',
    description: '从读者真正需要的信息出发，把绕来绕去的表达变成清楚、具体的文字。',
    lessons: [
      { title: '先想读者要知道什么', minutes: 2, paragraphs: ['写通知前，不妨先问：对方需要做什么？什么时候做？为什么要做？这些答案比华丽的开头更重要。', '一段清楚的表达，不必包含你思考的全部过程。先交代关键结论，再补充必要的背景。'], takeaway: '从读者的任务出发，而不是从自己的思考过程出发。' },
      { title: '把抽象词换成具体行动', minutes: 2, paragraphs: ['“尽快完善相关事项”听起来正式，却让人不知道该做什么。“周三前补齐报名表中的联系方式”，就更清楚。', '检查动词、对象和时间。具体表达不一定更短，但通常更容易行动。'], takeaway: '让人看完就知道下一步。' },
      { title: '读一遍，再删一点', minutes: 1, paragraphs: ['写完后，站在接收者的位置读一遍。如果某句话既没提供新信息，也没帮助理解，可以尝试删掉。', '简洁不是把所有背景都去掉。保留会影响理解和决定的信息，删去重复与无意义的修饰。'], takeaway: '删掉重复，不删掉必要信息。' }
    ],
    quiz: { question: '哪一句通知更容易让人行动？', options: ['请积极落实相关工作', '周三下午前，把填写完整的报名表发给小林', '请尽快完善各项内容'], correct: 1, explanation: '这句话说明了行动对象、截止时间和接收人，让读者知道下一步要做什么。' },
    insight: '清楚的表达，要说明具体行动、对象和必要的时间。'
  }
];

const initialCards = [
  { id: 'active-recall', category: '学习方法', question: '主动回忆，为什么比重读更有效？', answer: '主动回忆会练习从记忆中提取知识。先自己回答，再核对答案，能发现真正没有掌握的部分。' },
  { id: 'spacing', category: '学习方法', question: '复习要挤在一天，还是分开进行？', answer: '把练习分散到几天，通常更有利于长期记忆。根据遗忘情况调整间隔，不必追求一套固定时间表。' },
  { id: 'contrast', category: '视觉设计', question: '页面上最鲜明的颜色，应该留给谁？', answer: '留给最重要的任务。重点来自对比；如果处处都鲜明，就没有真正的重点。' },
  { id: 'context', category: '视觉设计', question: '红色，一定意味着危险吗？', answer: '不一定。颜色的含义由文化、场景与习惯共同决定，同一个产品里保持含义一致尤其重要。' },
  { id: 'feedback', category: '学习方法', question: '怎么判断自己是真的会了？', answer: '尝试独立解决新问题，并核对结果。不要只用“看起来很熟悉”的感觉来判断。' }
];

const state = {
  page: 'home', category: '全部', query: '', pageScroll: {}, name: '小满', motto: '保持好奇，慢慢生长。', goal: 15,
  enrolled: new Set(['memory', 'color']), bookmarks: new Set(['space']), positions: { memory: 1, color: 0 }, completed: new Set(),
  cards: initialCards.map(card => ({ ...card })), reviewQueue: initialCards.map(card => card.id), flipped: false, reviewed: 0,
  course: null, step: 0, selected: null, checked: false, largeText: false, reminders: true, savedGoal: 15,
  sheetType: '', sheetReturnFocus: null
};

const app = document.getElementById('app');
const main = document.getElementById('main');
const layer = document.getElementById('layer');
const sheet = document.getElementById('sheet');
const reader = document.getElementById('reader');
const readerContent = document.getElementById('reader-content');
let toastTimer;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function icon(name) { return `<i class="ti ti-${name}" aria-hidden="true"></i>`; }
function bookmarkSVG(active) {
  return `<svg class="bookmark-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

function artwork(type, className = '') {
  const start = `<svg class="${className}" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  const ink = '#254536';
  const paths = {
    mind: `<ellipse cx="99" cy="162" rx="58" ry="6" fill="${ink}" opacity=".08"/><path d="M79 127v26l-14 6M119 127v26l15 6" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M63 129C45 118 39 99 44 86c-15-10-16-26-7-37 5-7 12-9 20-7-4-15 7-29 23-27 9-15 32-13 36 3 15-9 34 1 34 18 20 5 23 27 10 39 10 21-2 44-23 47-17 18-48 17-74 7Z" fill="#ddd5f5" stroke="${ink}" stroke-width="2"/><path d="M57 42c6 1 11 7 10 14M84 32c-7 4-8 14-3 19M123 31c-10 1-16 10-14 18M148 61c-11-4-20 2-21 12" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><circle cx="77" cy="78" r="17" fill="#f8faf4" stroke="${ink}" stroke-width="2"/><circle cx="117" cy="78" r="17" fill="#f8faf4" stroke="${ink}" stroke-width="2"/><path d="M94 77h6M58 76l-9-4M135 76l9-5" stroke="${ink}" stroke-width="2"/><ellipse cx="81" cy="79" rx="4" ry="6" fill="${ink}"/><ellipse cx="113" cy="79" rx="4" ry="6" fill="${ink}"/><path d="M92 100q5 7 11 0" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path d="m53 115 39 11v36l-39-12z" fill="${ink}"/><path d="m92 126 40-12v36l-40 12z" fill="#5d7c50"/><path d="m60 119 32 7 32-7M64 131l18 5M64 138l18 5M104 136l16-5M104 143l16-5" stroke="#e8ee9a" stroke-width="2" stroke-linecap="round"/><path d="m53 120-10-7M131 120l9-9" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`,
    memory: `<path d="m42 127 49 29 54-31-49-29z" fill="#b5c69b"/><path d="m42 127 49 29v12l-49-29z" fill="#254536"/><path d="m91 156 54-31v12l-54 31z" fill="#7e9a70"/><path d="M55 127V98l19-11v-24l19-11V27l23 13v87l-23 13-19-11-19 10Z" fill="#e8ee9a" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="m55 98 20 12v24M74 63l19 11v61M93 27v25l22 13M74 87l20 12M93 52v23l22 13M55 127l19-11 20 12 21-12" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M39 39q-15 14-11 32M135 61q23 18 18 40" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path d="m27 71-5-8m5 8 7-7M153 101l-7-5m7 5 5-8" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><circle cx="140" cy="32" r="8" fill="#f8faf4" stroke="${ink}" stroke-width="2"/>`,
    design: `<rect x="34" y="39" width="91" height="105" rx="9" fill="#ddd5f5" stroke="${ink}" stroke-width="2" transform="rotate(-11 34 39)"/><rect x="58" y="48" width="89" height="108" rx="9" fill="#f8faf4" stroke="${ink}" stroke-width="2" transform="rotate(8 58 48)"/><path d="M68 96c18-26 48-21 64 5-19 22-48 18-64-5Z" fill="#e8ee9a" stroke="${ink}" stroke-width="2"/><circle cx="101" cy="99" r="12" fill="${ink}"/><circle cx="104" cy="96" r="4" fill="#f8faf4"/><path d="m76 130 15 2m5 1 15 2m5 1 15 2" stroke="${ink}" stroke-width="6" stroke-linecap="round"/><path d="m145 33 6-8m3 20 11-2M29 155l-6 7" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
    history: `<ellipse cx="91" cy="151" rx="63" ry="9" fill="${ink}" opacity=".1"/><path d="M36 62h89v20c0 38-15 59-45 59S36 120 36 82V62Z" fill="#f8faf4" stroke="${ink}" stroke-width="2"/><path d="M126 74h12c27 0 26 36-6 36h-9" stroke="${ink}" stroke-width="7"/><ellipse cx="80" cy="63" rx="44" ry="12" fill="#ddd5f5" stroke="${ink}" stroke-width="2"/><ellipse cx="80" cy="62" rx="29" ry="6" fill="${ink}"/><path d="M68 44c-14-11 15-17 2-29M92 43c-13-12 14-19 1-31" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path d="M57 99h48M63 90v32m14-32v32m14-32v32M57 124h48" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
    space: `<circle cx="77" cy="78" r="48" fill="#f8faf4" stroke="${ink}" stroke-width="2"/><path d="M88 31a48 48 0 0 1 0 94c14-21 13-73 0-94Z" fill="#bcb0de"/><circle cx="56" cy="59" r="8" fill="#ddd5f5"/><circle cx="66" cy="96" r="12" fill="#ddd5f5"/><circle cx="91" cy="66" r="5" fill="#ddd5f5"/><path d="m104 111 44-24 9 16-44 25z" fill="#e8ee9a" stroke="${ink}" stroke-width="2"/><path d="m121 123 8 12M112 160l17-25 18 25M129 135v27" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="m141 30 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="${ink}"/><circle cx="24" cy="131" r="3" fill="${ink}"/>`,
    writing: `<path d="M41 29h72l26 25v104H41z" fill="#f8faf4" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M113 29v26h26" fill="#ddd5f5" stroke="${ink}" stroke-width="2"/><path d="M58 76h58M58 91h58M58 106h38M58 137h26" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path d="m100 124 32-77 14 6-32 77-14 10z" fill="#e8ee9a" stroke="${ink}" stroke-width="2"/><path d="m100 124 14 6-14 10z" fill="#f4d8bd" stroke="${ink}" stroke-width="2"/><path d="m104 132-4 8 8-5" fill="${ink}"/><path d="m133 47 3-8q3-7 9-4l3 1q6 3 3 9l-4 8" fill="#ddd5f5" stroke="${ink}" stroke-width="2"/>`
  };
  return start + (paths[type] || paths.mind) + '</svg>';
}

function avatarArt() {
  return `<svg viewBox="0 0 70 70" fill="none" aria-hidden="true"><path d="M15 59c0-13 9-21 20-21s20 8 20 21" fill="#254536"/><path d="M23 18c-4 10-4 27 12 29 15-2 17-16 12-29Z" fill="#e8ee9a" stroke="#254536" stroke-width="1.5"/><path d="M19 27C13 12 31 4 41 9c10 0 16 9 8 20l-2-10c-9 5-17 4-23 0Z" fill="#254536"/><path d="M28 30h1M41 30h1M31 38q5 4 9-1" stroke="#254536" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function courseStatus(course) {
  if (state.completed.has(course.id)) return '已学完';
  const position = state.positions[course.id] || 0;
  if (position === course.lessons.length) return '待完成练习';
  return position ? `已学 ${position} / ${course.lessons.length} 节` : '尚未开始';
}

function courseCTA(course) {
  if (state.completed.has(course.id)) return '再学一遍';
  return state.positions[course.id] > 0 ? '继续学习' : '开始学习';
}

function courseMeta(course, progress = false) {
  return `<span class="course-meta"><span>${progress ? courseStatus(course) : course.subtitle}</span><span aria-label="课程总时长 ${course.minutes} 分钟">${icon('clock')}${course.minutes} 分钟</span></span>`;
}

function courseRow(course) {
  return `<button class="course-row" data-course="${course.id}"><span class="course-thumb" style="background:${course.color}">${artwork(course.art)}</span><span class="course-info"><span class="course-title">${course.title}</span>${courseMeta(course, true)}</span><span class="row-arrow">${icon(state.completed.has(course.id) ? 'circle-check' : 'chevron-right')}</span></button>`;
}

function homeView() {
  const featured = courses[0];
  const enrolled = courses.filter(course => state.enrolled.has(course.id));
  const continuing = enrolled.filter(course => !state.completed.has(course.id));
  const visibleCourses = continuing.length ? continuing : enrolled;
  return `<div class="view">
    <div class="greeting-row"><span>下午好，${escapeHTML(state.name)}</span><span>11 月 1 日，星期日</span></div>
    <div class="hero-heading"><h1>今天，好奇心想去哪儿？</h1><svg class="curiosity-doodle" viewBox="0 0 60 65" fill="none" aria-hidden="true"><path d="M19 21C17 5 43 3 44 20c1 9-11 9-12 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="48" r="3" fill="currentColor"/><path d="m8 16-5-2m8 24-5 2M51 29l6 1M47 6l4-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 58q13 5 27-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
    <article class="featured-course"><span class="course-label">${icon('sparkles')}今日精选${state.completed.has(featured.id) ? `<span class="featured-complete">${icon('check')}已学完</span>` : ''}</span><h2>${featured.title}</h2><div class="featured-footer"><div class="featured-action">${courseMeta(featured)}<button class="primary-button" data-start="${featured.id}">${courseCTA(featured)}${icon('arrow-right')}</button></div>${artwork(featured.art, 'featured-art')}</div></article>
    <div class="section-heading"><h2>${continuing.length ? '接着上次的好奇' : '学过的好问题'}</h2><button class="text-button" data-action="my-courses">全部课程${icon('chevron-right')}</button></div>
    <div class="course-list">${visibleCourses.slice(0, 2).map(courseRow).join('')}</div>
    <button class="note-strip" data-nav="review">${icon('cards')}<span>${state.reviewQueue.length ? `还有 ${state.reviewQueue.length} 张知识卡片` : '今天的知识卡片复习完成'}<br><strong>温习一下，让知识留下来。</strong></span>${icon('chevron-right')}</button>
  </div>`;
}

function catalogCard(course) {
  const saved = state.bookmarks.has(course.id);
  return `<article class="catalog-card"><button class="catalog-cover" data-course="${course.id}" aria-label="查看${course.title}" style="background:${course.color}">${artwork(course.art)}</button><div class="catalog-card-body"><span class="course-label">${course.subtitle}</span><h3><button class="catalog-title" data-course="${course.id}">${course.title}</button></h3>${courseMeta(course, true)}<div class="catalog-card-actions"><button class="open-course" data-start="${course.id}">${courseCTA(course)}${icon('arrow-right')}</button><button class="bookmark-button" data-bookmark="${course.id}" aria-label="${saved ? '取消收藏' : '收藏'}${course.title}" aria-pressed="${saved}">${bookmarkSVG(saved)}</button></div></div></article>`;
}

function filteredCourses() {
  const query = state.query.trim().toLowerCase();
  return courses.filter(course => (state.category === '全部' || course.category === state.category) && (!query || `${course.title} ${course.category} ${course.subtitle} ${course.description}`.toLowerCase().includes(query)));
}

function catalogContent() {
  const result = filteredCourses();
  return `<p class="discover-heading">${state.query.trim() ? `找到 ${result.length} 门课程` : '从一个感兴趣的问题开始'}</p><div class="catalog">${result.length ? result.map(catalogCard).join('') : `<div class="empty-state">${icon('search')}<h3>还没有找到这个主题</h3><p>试试“记忆”“颜色”或“月亮”，<br>也可以浏览全部课程。</p><button class="secondary-button" data-action="clear-search">查看全部</button></div>`}</div>`;
}

function discoverView() {
  const categories = ['全部', '心理学', '设计', '人文', '科学'];
  return `<div class="view"><h1 class="page-title">世界很大，慢慢学。</h1><p class="page-intro">从心理学到宇宙，总有一个问题让你停下来。</p><label class="search-field">${icon('search')}<input type="search" id="course-search" placeholder="搜一个让你好奇的问题" value="${escapeHTML(state.query)}" aria-label="搜索课程" enterkeyhint="search" autocomplete="off"></label><div class="category-tabs" aria-label="课程分类">${categories.map(category => `<button class="category-chip ${state.category === category ? 'active' : ''}" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>`).join('')}</div><div id="catalog-content" aria-live="polite">${catalogContent()}</div></div>`;
}

function reviewView() {
  const card = state.cards.find(item => item.id === state.reviewQueue[0]);
  if (!card) {
    return `<div class="view"><h1 class="page-title">知识，慢慢留下来。</h1><div class="completion">${artwork('memory', 'completion-art')}<h1>今天的复习完成了</h1><p>${state.reviewed ? `你刚刚温习了 ${state.reviewed} 张知识卡片。` : '暂时没有需要复习的卡片。'}<br>去学点新东西，给好奇心添一页。</p><button class="primary-button" data-nav="discover" style="margin-top:24px">探索新课程${icon('arrow-right')}</button></div><button class="text-button" data-action="restart-review" style="width:100%;justify-content:center;margin-top:22px">再复习一轮</button></div>`;
  }
  return `<div class="view"><h1 class="page-title">知识，慢慢留下来。</h1><p class="page-intro">先试着想一想，再翻开答案。</p><div class="review-intro"><span>今日待复习 ${state.reviewQueue.length} 张</span><button class="text-button" data-action="all-cards">我的知识卡片${icon('chevron-right')}</button></div><div class="flashcard-wrap"><button class="flashcard" data-action="flip-card" aria-label="${state.flipped ? '查看问题' : '翻开答案'}" aria-pressed="${state.flipped}"><span class="flash-label">${card.category}${icon(state.flipped ? 'bulb' : 'cards')}</span><span class="flashcard-content">${state.flipped ? `<span class="flash-answer">${escapeHTML(card.answer)}</span>` : `<span class="flash-question">${escapeHTML(card.question)}</span>`}</span><span class="flash-hint">${icon('hand-click')}${state.flipped ? '点一下，回到问题' : '点一下，翻开答案'}</span></button></div><div class="review-actions"><button class="secondary-button" data-action="review-again" ${state.flipped ? '' : 'disabled'}>${icon('rotate-clockwise')}还不太熟</button><button class="primary-button" data-action="review-known" ${state.flipped ? '' : 'disabled'}>${icon('check')}记住了</button></div><p class="knowledge-note">不用急着答对。每一次回忆，都在加深记忆。</p></div>`;
}

function profileView() {
  return `<div class="view"><div class="profile-header"><div class="avatar">${avatarArt()}</div><div><h1>${escapeHTML(state.name)}</h1><p>${escapeHTML(state.motto)}</p></div><button class="icon-button" data-action="edit-profile" aria-label="编辑个人资料">${icon('pencil')}</button></div><section class="plan-card"><div class="plan-card-top"><span>我的学习节奏</span><button class="icon-button" data-action="goal" aria-label="调整每日学习目标">${icon('adjustments-horizontal')}</button></div><h2>每天，留 ${state.goal} 分钟</h2><p>不必一口气学完。<br>一点点，也会走很远。</p></section><section class="profile-group"><h2>我的积累</h2><button class="settings-row" data-action="my-courses">${icon('books')}<span>我的课程</span><span class="row-value">${state.enrolled.size} 门</span>${icon('chevron-right')}</button><button class="settings-row" data-action="saved-courses">${icon('bookmark')}<span>收藏的好问题</span><span class="row-value">${state.bookmarks.size} 门</span>${icon('chevron-right')}</button><button class="settings-row" data-action="all-cards">${icon('cards')}<span>我的知识卡片</span><span class="row-value">${state.cards.length} 张</span>${icon('chevron-right')}</button><button class="settings-row" data-action="records">${icon('calendar-check')}<span>学习足迹</span>${icon('chevron-right')}</button></section><section class="profile-group"><h2>按自己的方式</h2><button class="settings-row" data-action="reminders">${icon('bell')}<span>学习提醒</span><span class="row-value">${state.reminders ? '已开启' : '已关闭'}</span>${icon('chevron-right')}</button><button class="settings-row" data-action="help">${icon('help-circle')}<span>关于拾知</span>${icon('chevron-right')}</button></section></div>`;
}

function renderPage(keepScroll = false) {
  const scroll = main.scrollTop;
  main.innerHTML = ({ home: homeView, discover: discoverView, review: reviewView, profile: profileView })[state.page]();
  main.firstElementChild.classList.toggle('view-static', keepScroll);
  if (keepScroll) main.scrollTop = scroll;
  else main.scrollTop = 0;
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById('review-badge');
  badge.textContent = state.reviewQueue.length;
  badge.hidden = !state.reviewQueue.length;
}

function navigate(page) {
  if (!['home', 'discover', 'review', 'profile'].includes(page)) return;
  closeSheet(false);
  state.pageScroll[state.page] = main.scrollTop;
  const samePage = state.page === page;
  state.page = page;
  app.querySelectorAll('.nav-item').forEach(button => {
    const active = button.dataset.nav === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  renderPage();
  main.scrollTop = samePage ? 0 : state.pageScroll[page] || 0;
}

function notify(message) {
  clearTimeout(toastTimer);
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function setBackgroundInert(value) {
  app.querySelector('.app-header').inert = value;
  main.inert = value;
  app.querySelector('.bottom-nav').inert = value;
  reader.inert = value && reader.hidden;
}

function openSheet(title, body, footer = '', type = '', backAction = '') {
  if (layer.hidden) state.sheetReturnFocus = document.activeElement;
  state.sheetType = type;
  sheet.innerHTML = `<div class="sheet-heading"><div class="sheet-title-group">${backAction ? `<button class="icon-button" data-action="${backAction}" aria-label="返回课程列表">${icon('arrow-left')}</button>` : ''}<h2 id="sheet-title">${title}</h2></div><button class="icon-button" data-action="close-sheet" aria-label="关闭">${icon('x')}</button></div><div class="sheet-body">${body}</div>${footer ? `<div class="sheet-footer">${footer}</div>` : ''}`;
  layer.hidden = false;
  setBackgroundInert(true);
  sheet.focus({ preventScroll: true });
}

function closeSheet(restore = true) {
  if (layer.hidden) return;
  layer.hidden = true;
  state.sheetType = '';
  setBackgroundInert(!reader.hidden);
  if (restore && state.sheetReturnFocus?.isConnected) state.sheetReturnFocus.focus({ preventScroll: true });
}

function showCourse(id) {
  const course = courses.find(item => item.id === id);
  if (!course) return;
  const backAction = ['my-courses', 'saved-courses'].includes(state.sheetType) ? state.sheetType : '';
  const complete = state.completed.has(id);
  const position = state.positions[id] || 0;
  const syllabus = course.lessons.map((lesson, index) => {
    const learned = complete || index < position;
    return `<div class="syllabus-row ${learned ? 'syllabus-complete' : ''}"><span class="syllabus-number" aria-label="${learned ? '已学完' : '第 ' + (index + 1) + ' 节'}">${learned ? icon('check') : index + 1}</span><span class="syllabus-title">${lesson.title}</span><span>${lesson.minutes} 分钟</span></div>`;
  }).join('');
  openSheet('一个好问题', `<div class="sheet-course-art" style="background:${course.color}">${artwork(course.art)}</div><h3 class="detail-title">${course.title}</h3>${courseMeta(course, true)}<div class="detail-description">${course.description}</div><h3 class="detail-subtitle">这次会学到</h3>${syllabus}<div class="syllabus-row ${complete ? 'syllabus-complete' : ''}"><span class="syllabus-number">${icon(complete ? 'check' : 'pencil')}</span><span class="syllabus-title">一个问题，检验理解</span><span>2 分钟</span></div>`, `<button class="primary-button" data-start="${id}">${courseCTA(course)}${icon('arrow-right')}</button>`, 'course', backAction);
}

function openCourseCollection(saved = false) {
  const result = courses.filter(course => (saved ? state.bookmarks : state.enrolled).has(course.id));
  openSheet(saved ? '收藏的好问题' : '我的课程', result.length ? `<div class="course-list">${result.map(courseRow).join('')}</div>` : `<div class="empty-state">${icon('bookmark')}<h3>好问题，值得留一留</h3><p>探索课程时，点一下书签就能收藏。</p><button class="secondary-button" data-nav="discover">去探索</button></div>`, '', saved ? 'saved-courses' : 'my-courses');
}

function toggleBookmark(id, button) {
  if (state.bookmarks.has(id)) state.bookmarks.delete(id);
  else state.bookmarks.add(id);
  const saved = state.bookmarks.has(id);
  button.innerHTML = bookmarkSVG(saved);
  button.setAttribute('aria-pressed', saved);
  button.setAttribute('aria-label', saved ? '取消收藏课程' : '收藏课程');
  notify(saved ? '已收藏这个好问题' : '已取消收藏');
}

function startCourse(id) {
  const course = courses.find(item => item.id === id);
  if (!course) return;
  closeSheet(false);
  state.course = course;
  state.step = state.completed.has(id) ? 0 : (state.positions[id] || 0);
  state.selected = null;
  state.checked = false;
  state.enrolled.add(id);
  reader.hidden = false;
  reader.inert = false;
  setBackgroundInert(true);
  document.getElementById('reader-label').textContent = course.subtitle;
  renderReader();
}

function renderReader() {
  const course = state.course;
  const total = course.lessons.length + 1;
  const bookmark = document.getElementById('reader-bookmark');
  bookmark.innerHTML = bookmarkSVG(state.bookmarks.has(course.id));
  bookmark.setAttribute('aria-pressed', state.bookmarks.has(course.id));
  bookmark.setAttribute('aria-label', state.bookmarks.has(course.id) ? '取消收藏课程' : '收藏课程');
  document.getElementById('lesson-steps').innerHTML = Array.from({ length: total }, (_, index) => `<span class="step-mark ${index < state.step ? 'done' : index === state.step ? 'current' : ''}" aria-label="${index < state.step ? '已完成' : index === state.step ? '当前' : '待学习'}第 ${index + 1} 步"></span>`).join('');
  const footer = document.getElementById('reader-footer');
  if (state.step < course.lessons.length) {
    const lesson = course.lessons[state.step];
    readerContent.innerHTML = `<div class="view"><div class="lesson-kicker">${icon('book')}第 ${state.step + 1} 节 / 共 ${course.lessons.length} 节<span>预计 ${lesson.minutes} 分钟</span></div><h1>${lesson.title}</h1>${state.step === 0 ? `<div class="lesson-art" style="background:${course.color}">${artwork(course.art)}</div>` : ''}<div class="lesson-prose">${lesson.paragraphs.map(text => `<p>${text}</p>`).join('')}</div><aside class="lesson-takeaway"><h2>记住这一点</h2><p>${lesson.takeaway}</p></aside></div>`;
    footer.innerHTML = `${state.step ? `<button class="secondary-button icon-only" data-action="lesson-back" aria-label="上一节">${icon('arrow-left')}</button>` : ''}<button class="primary-button" data-action="lesson-next">${state.step === course.lessons.length - 1 ? '试着答一题' : '继续下一节'}${icon('arrow-right')}</button>`;
  } else if (state.step === course.lessons.length) {
    renderQuiz();
  } else {
    readerContent.innerHTML = `<div class="completion view">${artwork('memory', 'completion-art')}<div class="lesson-kicker">${icon('circle-check')}这次学习已完成</div><h1>又多懂了一点世界。</h1><p>学完了「${course.title}」<br>一个新想法，已经放进你的知识卡片。</p><div class="saved-insight"><span>${icon('cards')}带走这句话</span><p>${course.insight}</p></div></div>`;
    footer.innerHTML = `<button class="secondary-button" data-action="completion-review">去复习</button><button class="primary-button" data-action="completion-home">回到今天${icon('arrow-right')}</button>`;
  }
  readerContent.scrollTop = 0;
  readerContent.focus({ preventScroll: true });
}

function renderQuiz() {
  const quiz = state.course.quiz;
  const correct = state.selected === quiz.correct;
  readerContent.innerHTML = `<div class="view"><div class="lesson-kicker">${icon('bulb')}把知识用一下</div><h1>你会怎么选？</h1><p class="quiz-question">${quiz.question}</p><div class="quiz-options">${quiz.options.map((option, index) => `<button class="quiz-option ${state.selected === index ? 'selected' : ''} ${state.checked && index === quiz.correct ? 'correct' : ''} ${state.checked && state.selected === index && !correct ? 'incorrect' : ''}" data-answer="${index}" aria-pressed="${state.selected === index}" ${state.checked ? 'disabled' : ''}><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span>${state.checked && index === quiz.correct ? icon('check') : ''}</button>`).join('')}</div>${state.checked ? `<div class="quiz-feedback ${correct ? '' : 'wrong'}" role="status"><strong>${correct ? '答对了，你理解了。' : '差一点，看看这个解释。'}</strong>${quiz.explanation}</div>` : ''}</div>`;
  document.getElementById('reader-footer').innerHTML = `<button class="secondary-button icon-only" data-action="lesson-back" aria-label="回看上一节">${icon('arrow-left')}</button><button class="primary-button" data-action="${state.checked ? correct ? 'finish-course' : 'retry-quiz' : 'check-answer'}" ${state.selected === null ? 'disabled' : ''}>${state.checked ? correct ? '完成学习' : '再试一次' : '确认答案'}${icon(state.checked && correct ? 'check' : 'arrow-right')}</button>`;
}

function closeReader() {
  if (reader.hidden) return;
  if (state.step <= state.course.lessons.length) state.positions[state.course.id] = state.step;
  reader.hidden = true;
  setBackgroundInert(false);
  renderPage(true);
  const returnTarget = main.querySelector(`[data-start="${state.course.id}"], [data-course="${state.course.id}"]`);
  (returnTarget || main).focus({ preventScroll: true });
}

function finishCourse() {
  if (!state.checked || state.selected !== state.course.quiz.correct) return;
  const course = state.course;
  state.completed.add(course.id);
  state.positions[course.id] = 0;
  const cardId = `course-${course.id}`;
  if (!state.cards.some(card => card.id === cardId)) {
    state.cards.push({ id: cardId, category: course.subtitle, question: course.quiz.question, answer: course.insight });
    state.reviewQueue.push(cardId);
    state.flipped = false;
  }
  state.step = course.lessons.length + 1;
  updateBadge();
  renderReader();
}

function showAllCards() {
  openSheet('我的知识卡片', `<p>共 ${state.cards.length} 张，把值得记住的知识放在一起。</p><div class="record-list">${state.cards.map(card => `<div class="help-item"><h3>${escapeHTML(card.question)}</h3><p>${escapeHTML(card.answer)}</p></div>`).join('')}</div>`, `<button class="primary-button" data-action="start-all-review">复习这些卡片${icon('arrow-right')}</button>`, 'cards');
}

function goalSheet() {
  state.savedGoal = state.goal;
  openSheet('留一点时间给好奇心', '<p>选一个舒服的节奏，不必和别人一样。</p><div class="goal-options">' + [5, 15, 25].map(minutes => `<button class="goal-option" data-goal="${minutes}" aria-pressed="${state.savedGoal === minutes}">${icon(minutes === 5 ? 'seeding' : minutes === 15 ? 'plant-2' : 'trees')}<strong>每天 ${minutes} 分钟</strong><span>${minutes === 5 ? '轻轻开始' : minutes === 15 ? '刚刚好' : '深入一点'}</span></button>`).join('') + '</div>', `<button class="primary-button" data-action="save-goal">就按这个节奏${icon('check')}</button>`, 'goal');
}

function remindersSheet() {
  openSheet('学习提醒', `<p>给每天的学习留一个小小的约定。</p><div class="switch-row"><div><h3>每日学习提醒</h3><p>打开拾知时，显示待学习内容。</p></div><button class="switch" id="reminder-switch" role="switch" aria-label="每日学习提醒" aria-checked="${state.reminders}" data-action="toggle-reminders"><span></span></button></div><div class="note-strip">${icon('bell')}<span>当前提醒显示在 App 内。系统推送需要连接通知服务。</span></div>`, `<button class="primary-button" data-action="close-sheet">完成</button>`, 'reminders');
}

function showNotifications() {
  document.getElementById('notification-dot').hidden = true;
  openSheet('给你的学习提醒', state.reminders ? `<article class="notification"><h3>今天，从一个好问题开始</h3><p>为什么我们总是高估自己？12 分钟，认识一个常见的认知错觉。</p><time>今天 09:00</time><button class="text-button" data-start="bias">开始学习${icon('chevron-right')}</button></article>${state.reviewQueue.length ? `<article class="notification"><h3>让昨天的知识留下来</h3><p>你有 ${state.reviewQueue.length} 张卡片可以温习。先回忆，再翻开答案。</p><time>今天 08:30</time><button class="text-button" data-nav="review">去复习${icon('chevron-right')}</button></article>` : ''}` : `<div class="empty-state">${icon('bell-off')}<h3>学习提醒已关闭</h3><p>想为学习留个约定时，可以随时开启。</p><button class="secondary-button" data-action="reminders">设置提醒</button></div>`, '', 'notifications');
}

function showRecords() {
  const today = [...state.completed].map(id => ({ title: courses.find(course => course.id === id).title, detail: '完成课程，收获一张知识卡片', date: '今天' }));
  const records = [...today, { title: '熟悉，不等于记住', detail: '学习了「让大脑记得更牢」第 1 节', date: '昨天' }, { title: '认识了色彩的对比', detail: '加入课程「颜色为什么会“说话”？」', date: '10 月 30 日' }, { title: '温习了一次主动回忆', detail: '复习了学习方法知识卡片', date: '10 月 29 日' }];
  openSheet('每一步，都算数', `<div class="record-list">${records.map(record => `<div class="record-row">${icon('circle-check')}<div><h3>${record.title}</h3><p>${record.detail}</p></div><span class="record-date">${record.date}</span></div>`).join('')}</div>`, '', 'records');
}

const actions = {
  'close-sheet': () => closeSheet(),
  notifications: showNotifications,
  'my-courses': () => openCourseCollection(),
  'saved-courses': () => openCourseCollection(true),
  'all-cards': showAllCards,
  goal: goalSheet,
  reminders: remindersSheet,
  records: showRecords,
  'clear-search': () => { state.query = ''; state.category = '全部'; renderPage(); },
  'flip-card': () => { state.flipped = !state.flipped; renderPage(true); main.querySelector('.flashcard')?.focus({ preventScroll: true }); },
  'review-again': () => {
    if (!state.flipped || !state.reviewQueue.length) return;
    const id = state.reviewQueue.shift();
    state.reviewQueue.push(id);
    state.flipped = false;
    renderPage(true);
    main.querySelector('.flashcard')?.focus({ preventScroll: true });
    notify(state.reviewQueue.length > 1 ? '稍后再回忆一次' : '再想一想，不用着急');
  },
  'review-known': () => {
    if (!state.flipped || !state.reviewQueue.length) return;
    state.reviewQueue.shift();
    state.reviewed += 1;
    state.flipped = false;
    renderPage(true);
    main.querySelector('.flashcard, .primary-button')?.focus({ preventScroll: true });
  },
  'restart-review': () => { state.reviewQueue = state.cards.map(card => card.id); state.reviewed = 0; state.flipped = false; renderPage(); },
  'start-all-review': () => { state.reviewQueue = state.cards.map(card => card.id); state.reviewed = 0; state.flipped = false; navigate('review'); },
  'save-goal': () => { state.goal = state.savedGoal; closeSheet(false); renderPage(true); notify(`已调整为每天 ${state.goal} 分钟`); },
  'toggle-reminders': () => { state.reminders = !state.reminders; document.getElementById('reminder-switch').setAttribute('aria-checked', state.reminders); renderPage(true); },
  'edit-profile': () => openSheet('关于你', `<label class="form-label" for="profile-name">怎么称呼你</label><input class="form-input" id="profile-name" value="${escapeHTML(state.name)}" maxlength="12" autocomplete="off" enterkeyhint="next"><label class="form-label" for="profile-motto">给自己的一句话</label><input class="form-input" id="profile-motto" value="${escapeHTML(state.motto)}" maxlength="24" autocomplete="off" enterkeyhint="done"><p class="form-error" id="profile-error" role="alert" hidden></p>`, `<button class="primary-button" data-action="save-profile">保存${icon('check')}</button>`, 'profile'),
  'save-profile': () => {
    const name = document.getElementById('profile-name').value.trim();
    const motto = document.getElementById('profile-motto').value.trim();
    if (!name) {
      const error = document.getElementById('profile-error');
      error.textContent = '先写一个称呼吧。'; error.hidden = false;
      document.getElementById('profile-name').focus(); return;
    }
    state.name = name; state.motto = motto || '保持好奇，慢慢生长。';
    closeSheet(false); renderPage(true); notify('个人资料已更新');
  },
  help: () => openSheet('一点点，也会走很远', `<p class="settings-description">拾知把一个大主题拆成几个好问题。每天留一点时间，读一读、想一想，再用自己的话记住。</p><div class="help-item"><h3>一门课怎样学？</h3><p>读完三个小节，再回答一个理解问题。完成后，核心知识会加入你的知识卡片。</p></div><div class="help-item"><h3>复习时，先别看答案</h3><p>试着回忆，再翻开卡片。还不太熟的内容留到稍后，已经记住的内容结束本轮复习。</p></div><div class="help-item"><h3>从哪里开始？</h3><p>不必按顺序。去探索页搜一个感兴趣的问题，或者从今天的精选开始。</p></div>`, '', 'help'),
  'close-reader': closeReader,
  'reader-bookmark': () => toggleBookmark(state.course.id, document.getElementById('reader-bookmark')),
  'reading-size': () => {
    state.largeText = !state.largeText;
    reader.classList.toggle('large-text', state.largeText);
    const button = document.getElementById('reading-size');
    button.setAttribute('aria-pressed', state.largeText);
    button.setAttribute('aria-label', state.largeText ? '恢复阅读字号' : '放大阅读字号');
  },
  'lesson-next': () => {
    if (state.step >= state.course.lessons.length) return;
    state.step += 1; state.positions[state.course.id] = state.step;
    state.selected = null; state.checked = false; renderReader();
  },
  'lesson-back': () => { if (state.step <= 0) return; state.step -= 1; state.positions[state.course.id] = state.step; state.selected = null; state.checked = false; renderReader(); },
  'check-answer': () => {
    if (state.selected === null || state.checked) return;
    state.checked = true;
    renderQuiz();
    readerContent.scrollTop = readerContent.scrollHeight;
    document.getElementById('reader-footer').querySelector('.primary-button').focus({ preventScroll: true });
  },
  'retry-quiz': () => {
    state.selected = null; state.checked = false; renderQuiz();
    readerContent.scrollTop = 0;
    readerContent.querySelector('.quiz-option').focus({ preventScroll: true });
  },
  'finish-course': finishCourse,
  'completion-review': () => { closeReader(); navigate('review'); },
  'completion-home': () => { closeReader(); navigate('home'); }
};

app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.nav) navigate(button.dataset.nav);
  else if (button.dataset.start) startCourse(button.dataset.start);
  else if (button.dataset.course) showCourse(button.dataset.course);
  else if (button.dataset.bookmark) toggleBookmark(button.dataset.bookmark, button);
  else if (button.dataset.category) {
    state.category = button.dataset.category;
    app.querySelectorAll('.category-chip').forEach(chip => { const active = chip.dataset.category === state.category; chip.classList.toggle('active', active); chip.setAttribute('aria-pressed', active); });
    document.getElementById('catalog-content').innerHTML = catalogContent();
  } else if (button.dataset.goal) {
    state.savedGoal = Number(button.dataset.goal);
    sheet.querySelectorAll('[data-goal]').forEach(option => option.setAttribute('aria-pressed', Number(option.dataset.goal) === state.savedGoal));
  } else if (button.dataset.answer !== undefined) {
    if (state.checked) return;
    state.selected = Number(button.dataset.answer);
    readerContent.querySelectorAll('.quiz-option').forEach(option => {
      const selected = Number(option.dataset.answer) === state.selected;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', selected);
    });
    document.getElementById('reader-footer').querySelector('.primary-button').disabled = false;
  } else if (button.dataset.action) actions[button.dataset.action]?.();
});

app.addEventListener('input', event => {
  if (event.target.id !== 'course-search') return;
  state.query = event.target.value;
  document.getElementById('catalog-content').innerHTML = catalogContent();
});

app.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!layer.hidden) closeSheet();
    else if (!reader.hidden) closeReader();
    return;
  }
  const activeContainer = !layer.hidden ? sheet : !reader.hidden ? reader : null;
  if (event.key === 'Tab' && activeContainer) {
    const focusable = [...activeContainer.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')].filter(element => !element.hidden && !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet || document.activeElement === readerContent)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !activeContainer.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Enter' && state.sheetType === 'profile' && event.target.matches('input')) {
    event.preventDefault(); actions['save-profile']();
  }
});
const stage = document.querySelector('.stage');
const deviceFrame = document.querySelector('.device-frame');

function fitDevice() {
  const styles = getComputedStyle(stage);
  const width = stage.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const height = stage.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
  const deviceWidth = parseFloat(styles.getPropertyValue('--device-width'));
  const deviceHeight = parseFloat(styles.getPropertyValue('--device-height'));
  const scale = Math.max(0, Math.min(1, width / deviceWidth, height / deviceHeight));
  deviceFrame.style.setProperty('--device-scale', scale);
}

new ResizeObserver(fitDevice).observe(stage);
fitDevice();
renderPage();
