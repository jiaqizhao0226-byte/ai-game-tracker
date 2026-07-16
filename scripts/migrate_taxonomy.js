// 分类体系重构迁移 (2026-07-16)
// 1) 重写 gameplay_main / gameplay_sub 为新 6 品类树
// 2) 新增 gameplay_facets(多值,逗号分隔,与 theme 同构)
// 3) 推理探案子类并入对话模拟,"推理探案"下沉为 gameplay_theme
// 4) 删除 ai_role 字段(连同深度/外围)
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// id: [main, sub, facets[], addTheme?]
const AGENT = 'AI Agent(智能体)';
const MAP = {
  1: ['AI陪伴', '游戏陪玩', []],
  2: ['AI陪伴', 'AI伴侣', []],
  3: ['AI生成UGC', '内容/视频生成', []],
  4: ['传统品类+AI', 'AI NPC', ['AI陪伴']],
  5: ['传统品类+AI', 'AI NPC', []],
  6: ['传统品类+AI', 'AI 队友', []],
  7: ['AI陪伴', 'AI伴侣', []],
  9: ['AI玩法机制', '派对竞猜', []],
  10: ['传统品类+AI', 'AI NPC', []],
  11: ['传统品类+AI', 'AI NPC', ['AI陪伴']],
  13: [AGENT, '智能体社会', []],
  14: ['传统品类+AI', 'AI 队友', []],
  15: ['AI叙事对话', '对话模拟', []],
  17: ['AI玩法机制', '机制生成', []],
  18: ['AI玩法机制', '派对竞猜', []],
  19: ['AI陪伴', 'AI伴侣', []],
  20: ['AI陪伴', 'AI伴侣', []],
  21: ['AI叙事对话', '对话模拟', ['AI陪伴']],
  22: ['AI陪伴', 'AI伴侣', []],
  26: ['AI叙事对话', '互动叙事', []],
  27: ['AI陪伴', 'AI伴侣', []],
  28: ['AI玩法机制', '机制生成', []],
  29: ['传统品类+AI', 'AI NPC', [AGENT]],
  30: ['AI叙事对话', '对话模拟', []],
  31: ['AI陪伴', 'AI伴侣', []],
  32: [AGENT, '智能体社会', []],
  33: ['AI陪伴', 'AI伴侣', []],
  34: ['AI陪伴', 'AI伴侣', []],
  35: ['AI陪伴', 'AI伴侣', []],
  36: ['AI陪伴', 'AI伴侣', []],
  37: ['AI陪伴', 'AI宠物', []],
  38: ['传统品类+AI', 'AI 队友', []],
  39: ['传统品类+AI', 'AI NPC', ['AI生成UGC']],
  40: ['AI陪伴', 'AI伴侣', []],
  43: ['AI玩法机制', '派对竞猜', []],
  44: ['AI玩法机制', '机制生成', []],
  46: ['AI叙事对话', '对话模拟', [AGENT]],
  47: ['AI叙事对话', '对话模拟', [], '推理探案'],
  49: ['AI叙事对话', '对话模拟', [], '推理探案'],
  50: ['AI叙事对话', '对话模拟', []],
  51: ['AI玩法机制', '派对竞猜', []],
  57: ['AI玩法机制', '卡牌构筑', []],
  58: ['AI叙事对话', '对话模拟', [], '推理探案'],
  59: [AGENT, '生成沙盒', []],
  60: ['AI陪伴', 'AI宠物', []],
  61: ['AI叙事对话', '对话模拟', []],
  62: ['AI玩法机制', '机制生成', []],
  63: ['传统品类+AI', 'AI 队友', []],
  64: ['AI生成UGC', '零代码造游戏', []],
  65: ['传统品类+AI', 'AI 队友', []],
  66: ['传统品类+AI', 'AI NPC', []],
  67: ['AI玩法机制', '机制生成', []],
  68: ['AI生成UGC', '内容/视频生成', []],
  69: ['传统品类+AI', 'AI 队友', []],
  70: ['AI玩法机制', '卡牌构筑', []],
  71: [AGENT, '智能体社会', []],
  72: ['AI陪伴', 'AI宠物', []],
  73: ['AI陪伴', 'AI宠物', []],
  74: ['传统品类+AI', '', []],
  75: ['AI陪伴', 'AI伴侣', []],
  76: ['AI叙事对话', '互动叙事', []],
  77: ['AI叙事对话', '互动叙事', []],
  78: ['AI叙事对话', '互动叙事', []],
  79: ['AI叙事对话', '互动叙事', []],
  80: ['传统品类+AI', 'AI NPC', []],
  81: ['AI叙事对话', '互动叙事', []],
  82: ['AI叙事对话', '对话模拟', [], '推理探案'],
  83: ['AI叙事对话', '互动叙事', ['AI陪伴']],
  84: ['AI玩法机制', '卡牌构筑', []],
  85: ['AI叙事对话', '对话模拟', []],
  86: ['传统品类+AI', 'AI NPC', []],
  87: ['AI陪伴', 'AI伴侣', []],
};

const missing = [];
let changed = 0;
for (const g of data.games) {
  const m = MAP[g.id];
  if (!m) { missing.push(g.id); continue; }
  const [main, sub, facets, addTheme] = m;
  g.gameplay_main = main;
  g.gameplay_sub = sub;
  g.gameplay_facets = facets.join(',');
  if (addTheme) {
    const existing = (g.gameplay_theme || '').split(/[,，]+/).map(s => s.trim()).filter(Boolean);
    if (!existing.includes(addTheme)) existing.push(addTheme);
    g.gameplay_theme = existing.join(',');
  }
  delete g.ai_role;
  changed++;
}

if (missing.length) { console.error('!! 未覆盖的 game id:', missing.join(',')); process.exit(1); }

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`迁移 ${changed} 款；ai_role 已删除；facets 已加`);
// 校验：无残留 ai_role
const raw = fs.readFileSync(dataPath, 'utf8');
console.log('残留 "ai_role" 出现次数（应仅剩 product_intro 里的中文描述，字段 0）：',
  (raw.match(/"ai_role"/g) || []).length);
