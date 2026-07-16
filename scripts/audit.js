// 数据质量体检：枚举越界 / 字段缺失 / product_intro 八段 / 废弃字段 / 引用完整性
const d = require('../src/data.json');

const ENUM = {
  status: ['已上线', '测试中', '研发中', '早期·原型', '未知'],
  company_size: ['大厂', '创业公司', '独立开发者', '未知'],
  funding_round: ['未融资', '天使轮', 'A轮', 'B轮及以上', '已上市', '被收购', '大厂孵化', '未知'],
  region: ['国内', '海外', '未知'],
  platform: ['PC端', '移动端', '网页', '多平台', '未知'],
  gameplay_main: ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI'],
};
// gameplay_sub 依赖 gameplay_main（'' 表示允许留空）
const SUB = {
  'AI陪伴': ['AI游戏陪玩', 'AI伴侣', 'AI宠物'],
  'AI叙事对话': ['对话模拟', '互动叙事'],
  'AI玩法机制': ['派对竞猜', '机制生成', '卡牌构筑'],
  'AI Agent(智能体)': ['智能体社会'],
  'AI生成UGC': ['AI UGC玩法', '零代码造游戏'],
  '传统品类+AI': ['AI NPC', 'AI 队友', ''],
};
const FACET_ENUM = ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI'];
const REQUIRED = ['product_name', 'company_name', 'status', 'region', 'gameplay_main', 'platform'];
const INTRO_REQUIRED = ['一句话定位', '策略启示']; // 必填小标题(核心玩法/数据表现标题措辞不一,单列告警)

const issues = [];
const add = (sev, id, name, field, msg) => issues.push({ sev, id, name, field, msg });

// ---- games ----
for (const g of d.games) {
  const tag = g.product_name || `id${g.id}`;
  // 必填缺失
  for (const f of REQUIRED) {
    if (g[f] == null || g[f] === '') add('缺失', g.id, tag, f, '必填为空');
  }
  // 枚举越界
  for (const f of Object.keys(ENUM)) {
    if (g[f] && !ENUM[f].includes(g[f])) add('枚举', g.id, tag, f, `非法值「${g[f]}」`);
  }
  // gameplay_sub 与 main 的搭配
  if (g.gameplay_main && SUB[g.gameplay_main]) {
    const allowed = SUB[g.gameplay_main];
    if (!allowed.includes(g.gameplay_sub ?? '')) {
      add('枚举', g.id, tag, 'gameplay_sub', `「${g.gameplay_sub}」不属于 ${g.gameplay_main}`);
    }
  }
  // gameplay_theme 是活跃维度(首页筛选用),校验取值是否在允许集合内
  const THEMES = ['二次元', '派对游戏', '推理探案', '模拟经营', 'AI男友', 'AI女友', '历史模拟'];
  if (g.gameplay_theme) {
    for (const t of String(g.gameplay_theme).split(/[,，]+/).map(s => s.trim()).filter(Boolean)) {
      if (!THEMES.includes(t)) add('主题', g.id, tag, 'gameplay_theme', `非法主题「${t}」`);
    }
  }
  // gameplay_facets 次品类多标签,词表=主品类;不应含自身主品类
  if (g.gameplay_facets) {
    for (const f of String(g.gameplay_facets).split(/[,，]+/).map(s => s.trim()).filter(Boolean)) {
      if (!FACET_ENUM.includes(f)) add('次品类', g.id, tag, 'gameplay_facets', `非法值「${f}」`);
      else if (f === g.gameplay_main) add('次品类', g.id, tag, 'gameplay_facets', `与主品类重复「${f}」`);
    }
  }
  // product_intro 八段必填标题
  const intro = g.product_intro || '';
  if (!intro.trim()) {
    add('缺失', g.id, tag, 'product_intro', '正文为空');
  } else {
    for (const h of INTRO_REQUIRED) {
      if (!intro.includes(`**${h}**`)) add('骨架', g.id, tag, 'product_intro', `缺小标题 **${h}**`);
    }
  }
  // url 格式
  if (g.url && !/^https?:\/\//.test(g.url)) add('链接', g.id, tag, 'url', `非法 URL「${g.url}」`);
}

// ---- events 引用完整性 ----
const gameIds = new Set(d.games.map(g => g.id));
for (const e of d.events) {
  if (!gameIds.has(e.game_id)) add('引用', e.id, `event#${e.id}`, 'game_id', `指向不存在的 game ${e.game_id}`);
  if (e.url && !/^https?:\/\//.test(e.url)) add('链接', e.id, `event#${e.id}`, 'url', `非法 URL「${e.url}」`);
}

// ---- 汇总输出 ----
const bySev = {};
for (const i of issues) (bySev[i.sev] ??= []).push(i);
console.log(`\n共 ${issues.length} 处问题\n${'='.repeat(60)}`);
for (const sev of ['缺失', '枚举', '主题', '次品类', '骨架', '引用', '链接']) {
  const list = bySev[sev] || [];
  if (!list.length) continue;
  console.log(`\n【${sev}】${list.length} 处`);
  for (const i of list) console.log(`  #${i.id} ${i.name} · ${i.field}: ${i.msg}`);
}

// 输出待人工核对的外链清单(games + events)
const links = [
  ...d.games.filter(g => g.url).map(g => ({ id: g.id, name: g.product_name, url: g.url })),
  ...d.events.filter(e => e.url).map(e => ({ id: 'e' + e.id, name: 'event', url: e.url })),
];
require('fs').writeFileSync(__dirname + '/../scripts/_links.json', JSON.stringify(links, null, 1));
console.log(`\n外链共 ${links.length} 条,已写入 scripts/_links.json 供连通性检测`);
