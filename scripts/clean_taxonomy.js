/*
 * 一次性数据清洗（只重构/归一现有值，不臆造新信息）：
 *  1. 删除 gameplay_theme 字段
 *  2. platform 归一到 {PC端, 移动端, 网页, 多平台, 未知}
 *  3. funding_round 归一到统一词表，修掉 B/C 轮及 A+/A 的口径矛盾
 *  4. 新增 ai_role（AI 介入度）：核心驱动 / 深度增强 / 外围辅助
 *
 * 运行：node scripts/clean_taxonomy.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// —— platform：按 id 覆盖（仅列出需要改的） ——
const PLATFORM_BY_ID = {
  1: 'PC端', 8: 'PC端', 36: 'PC端',
  9: 'PC端', 11: 'PC端', 17: 'PC端', 21: 'PC端', 26: 'PC端',
  43: 'PC端', 44: 'PC端', 47: 'PC端', 62: 'PC端',
  34: '多平台', // 妹居物语：描述明写「Steam和移动端」
};

// —— funding_round：按原值归一 ——
const FUNDING_MAP = {
  '天使/种子轮': '天使轮',
  'Pre-A轮': '天使轮',
  'A+轮': 'A轮',
  'C轮及以上': 'B轮及以上',
  '大厂内部孵化': '大厂孵化',
};

// —— ai_role：传统玩法+AI 中「外围辅助」的例外 id（大厅bot/赛季模式/雇佣型附加玩法） ——
const PERIPHERAL_IDS = new Set([5, 14, 63, 66]);
function aiRoleFor(g) {
  if (g.gameplay_main === '传统玩法+AI') {
    return PERIPHERAL_IDS.has(g.id) ? '外围辅助' : '深度增强';
  }
  // AI陪伴 / AI原生玩法 / 生成式AI驱动UGC → AI 即产品本体/玩法引擎
  return '核心驱动';
}

const changes = { platform: 0, funding: 0, theme: 0, aiRole: 0 };
for (const g of data.games) {
  if (PLATFORM_BY_ID[g.id] && g.platform !== PLATFORM_BY_ID[g.id]) {
    g.platform = PLATFORM_BY_ID[g.id];
    changes.platform++;
  }
  if (FUNDING_MAP[g.funding_round]) {
    g.funding_round = FUNDING_MAP[g.funding_round];
    changes.funding++;
  }
  if ('gameplay_theme' in g) {
    delete g.gameplay_theme;
    changes.theme++;
  }
  g.ai_role = aiRoleFor(g);
  changes.aiRole++;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('清洗完成:', JSON.stringify(changes));
