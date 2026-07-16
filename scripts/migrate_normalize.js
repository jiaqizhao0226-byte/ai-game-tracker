// 数据体检修复：枚举归一 + #69 归类 (2026-07-16)
// 幂等：可重复运行
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const FUNDING_MAP = {
  '未披露': '未知',
  '种子轮': '天使轮',
  '天使/种子轮': '天使轮',
  'Pre-A轮': 'A轮',
  'Pre-A+轮': 'A轮',
  'B轮+': 'B轮及以上',
  '大厂内部孵化': '大厂孵化',
};
const PLATFORM_MAP = {
  'Steam': 'PC端',
  '桌面端': 'PC端',
  'PC': 'PC端',
};

const log = [];
for (const g of data.games) {
  if (FUNDING_MAP[g.funding_round]) {
    log.push(`#${g.id} ${g.product_name} · funding_round: ${g.funding_round} → ${FUNDING_MAP[g.funding_round]}`);
    g.funding_round = FUNDING_MAP[g.funding_round];
  }
  if (PLATFORM_MAP[g.platform]) {
    log.push(`#${g.id} ${g.product_name} · platform: ${g.platform} → ${PLATFORM_MAP[g.platform]}`);
    g.platform = PLATFORM_MAP[g.platform];
  }
  // #69 无限R-放置赛车：玩法机制类 属于 AI原生玩法，修正 gameplay_main
  if (g.id === 69 && g.gameplay_main === '传统玩法+AI' && g.gameplay_sub === '玩法机制类') {
    log.push(`#69 ${g.product_name} · gameplay_main: 传统玩法+AI → AI原生玩法`);
    g.gameplay_main = 'AI原生玩法';
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`共修改 ${log.length} 处：`);
log.forEach(l => console.log('  ' + l));
