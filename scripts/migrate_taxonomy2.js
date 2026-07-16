// 分类微调 (2026-07-16 二轮)
// 1) 子类改名：游戏陪玩→AI游戏陪玩；内容/视频生成→AI UGC玩法；生成沙盒→智能体社会(并入)
// 2) 删除 Astrocade(#64) 及其关联事件
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const SUB_RENAME = {
  '游戏陪玩': 'AI游戏陪玩',
  '内容/视频生成': 'AI UGC玩法',
  '生成沙盒': '智能体社会',
};

let renamed = 0;
for (const g of data.games) {
  if (SUB_RENAME[g.gameplay_sub]) {
    const from = g.gameplay_sub;
    g.gameplay_sub = SUB_RENAME[from];
    renamed++;
    console.log(`#${g.id} ${g.product_name.replace(/\s*\(.*?\)/, '')} 子类: ${from} → ${g.gameplay_sub}`);
  }
}

// 删除 Astrocade #64 及事件
const delEvents = data.events.filter(e => e.game_id === 64).map(e => e.id);
const bG = data.games.length, bE = data.events.length;
data.games = data.games.filter(g => g.id !== 64);
data.events = data.events.filter(e => e.game_id !== 64);
console.log(`删除 #64 Astrocade + events: ${delEvents.join(', ')}`);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`子类改名 ${renamed} 处；games ${bG}→${data.games.length}，events ${bE}→${data.events.length}`);
