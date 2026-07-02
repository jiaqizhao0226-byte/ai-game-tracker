#!/usr/bin/env node
/**
 * Reclassify gameplay taxonomy based on user's new framework:
 * - AI陪伴 (no subcategory)
 * - 传统玩法+AI: AI NPC / AI 队友
 * - AI原生玩法: 对话模拟类 / 玩法机制类 / AI Agent
 * - 生成式AI驱动UGC (no subcategory)
 * - 可交互视频 (no subcategory)
 *
 * Removed: "Agent类/通用智能体" main category (merged into AI原生玩法/AI Agent)
 * Merged: "派对游戏" → 玩法机制类, "问答互动" → 对话模拟类
 * Renamed: "NPC" → "AI NPC", "队友" → "AI 队友", "玩法机制类" → "玩法机制类", "对话模拟" → "对话模拟类"
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// New classification map
const reclassification = {
  // ===== AI陪伴 (no subcategory) =====
  1: { main: 'AI陪伴', sub: '' },          // 逗逗游戏伙伴
  2: { main: 'AI陪伴', sub: '' },          // EVE AI
  7: { main: 'AI陪伴', sub: '' },          // 无限谷
  8: { main: 'AI陪伴', sub: '' },          // 桌崽AI
  19: { main: 'AI陪伴', sub: '' },         // Character.AI
  20: { main: 'AI陪伴', sub: '' },         // Talkie
  22: { main: 'AI陪伴', sub: '' },         // 星野
  27: { main: 'AI陪伴', sub: '' },         // LoveyDovey
  33: { main: 'AI陪伴', sub: '' },         // 星眠
  34: { main: 'AI陪伴', sub: '' },         // 妹居物语 (按用户图)
  35: { main: 'AI陪伴', sub: '' },         // 如意情探
  36: { main: 'AI陪伴', sub: '' },         // 星夜颂歌
  37: { main: 'AI陪伴', sub: '' },         // Tolan
  40: { main: 'AI陪伴', sub: '' },         // 月匣
  60: { main: 'AI陪伴', sub: '' },         // Pengu

  // ===== 传统玩法+AI NPC =====
  4: { main: '传统玩法+AI', sub: 'AI NPC' },   // 麦琪的花园
  5: { main: '传统玩法+AI', sub: 'AI NPC' },   // 三角洲行动 CC
  10: { main: '传统玩法+AI', sub: 'AI NPC' },  // 星布谷地
  11: { main: '传统玩法+AI', sub: 'AI NPC' },  // 喵呜岛
  13: { main: '传统玩法+AI', sub: 'AI NPC' },  // 遥远行星建造师
  39: { main: '传统玩法+AI', sub: 'AI NPC' },  // 量子跃迁
  66: { main: '传统玩法+AI', sub: 'AI NPC' },  // 帕姆问问

  // ===== 传统玩法+AI 队友 =====
  6: { main: '传统玩法+AI', sub: 'AI 队友' },   // 永劫无间
  14: { main: '传统玩法+AI', sub: 'AI 队友' },  // 王者荣耀
  38: { main: '传统玩法+AI', sub: 'AI 队友' },  // PUBG Ally
  63: { main: '传统玩法+AI', sub: 'AI 队友' },  // Fortnite AI维达
  65: { main: '传统玩法+AI', sub: 'AI 队友' },  // Ubisoft AI

  // ===== AI原生玩法 - 对话模拟类 =====
  21: { main: 'AI原生玩法', sub: '对话模拟类' }, // Whispers from the Star
  26: { main: 'AI原生玩法', sub: '对话模拟类' }, // 历史模拟器崇祯
  30: { main: 'AI原生玩法', sub: '对话模拟类' }, // Suck Up!
  31: { main: 'AI原生玩法', sub: '对话模拟类' }, // AI2U
  46: { main: 'AI原生玩法', sub: '对话模拟类' }, // 我的恋综超失控
  47: { main: 'AI原生玩法', sub: '对话模拟类' }, // 诡秘推理
  50: { main: 'AI原生玩法', sub: '对话模拟类' }, // 推演：七日谈
  58: { main: 'AI原生玩法', sub: '对话模拟类' }, // Public Eye

  // ===== AI原生玩法 - 玩法机制类 (含原派对游戏) =====
  9: { main: 'AI原生玩法', sub: '玩法机制类' },  // Pick Me Pick Me
  17: { main: 'AI原生玩法', sub: '玩法机制类' }, // AI創作呪文
  18: { main: 'AI原生玩法', sub: '玩法机制类' }, // Death by AI
  28: { main: 'AI原生玩法', sub: '玩法机制类' }, // 言灵计划
  29: { main: 'AI原生玩法', sub: '玩法机制类' }, // Aivilization
  43: { main: 'AI原生玩法', sub: '玩法机制类' }, // Deviation Game
  44: { main: 'AI原生玩法', sub: '玩法机制类' }, // 像素梦工厂
  51: { main: 'AI原生玩法', sub: '玩法机制类' }, // 萌爪派对
  57: { main: 'AI原生玩法', sub: '玩法机制类' }, // 星海自走牌
  61: { main: 'AI原生玩法', sub: '玩法机制类' }, // Iconic
  62: { main: 'AI原生玩法', sub: '玩法机制类' }, // 黑箱
  67: { main: 'AI原生玩法', sub: '玩法机制类' }, // 王国战争

  // ===== AI原生玩法 - AI Agent (新增子类) =====
  15: { main: 'AI原生玩法', sub: 'AI Agent' },  // 我的三国 (AI跑团)
  25: { main: 'AI原生玩法', sub: 'AI Agent' },  // 织之&镜土 TRPG
  32: { main: 'AI原生玩法', sub: 'AI Agent' },  // Altera Bots (从Agent类移入)
  49: { main: 'AI原生玩法', sub: 'AI Agent' },  // 神探夏洛克 (AI推理RPG)
  59: { main: 'AI原生玩法', sub: 'AI Agent' },  // Project Shanhai (AI Agent驱动)

  // ===== 生成式AI驱动UGC (保持) =====
  3: { main: '生成式AI驱动UGC', sub: '' },      // 逆水寒 AI剧组模式
  64: { main: '生成式AI驱动UGC', sub: '' },     // Astrocade

  // ===== 可交互视频 (保持) =====
  24: { main: '可交互视频', sub: '' },          // Sreal
};

let n = 0;
data.games = data.games.map(g => {
  if (reclassification[g.id]) {
    const old = `${g.gameplay_main} / ${g.gameplay_sub}`;
    g.gameplay_main = reclassification[g.id].main;
    g.gameplay_sub = reclassification[g.id].sub;
    console.log(`ID:${g.id} ${g.product_name}: ${old} -> ${g.gameplay_main} / ${g.gameplay_sub}`);
    n++;
  } else {
    console.log(`⚠️ ID:${g.id} ${g.product_name} (${g.gameplay_main} / ${g.gameplay_sub}) - 未在新分类中，跳过`);
  }
  return g;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\n=== Updated ${n}/${data.games.length} products ===`);

// Print new distribution
const mainCount = {};
const subCount = {};
data.games.forEach(g => {
  mainCount[g.gameplay_main] = (mainCount[g.gameplay_main] || 0) + 1;
  const key = `${g.gameplay_main} / ${g.gameplay_sub || '(无子类)'}`;
  subCount[key] = (subCount[key] || 0) + 1;
});
console.log('\n=== 玩法大类分布 ===');
Object.entries(mainCount).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
console.log('\n=== 玩法子类分布 ===');
Object.entries(subCount).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
