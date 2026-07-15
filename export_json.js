const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 以脚本所在目录为项目根，避免硬编码绝对路径
const projectRoot = __dirname;
const dbPath = path.join(projectRoot, 'data.db');
const db = new Database(dbPath);

const games = db.prepare('SELECT * FROM games ORDER BY id ASC').all();
const events = db.prepare('SELECT * FROM game_events ORDER BY event_date DESC, id DESC').all();

// insights 表可能不存在（旧库），做一次兜底，避免导出时把趋势洞察丢掉
let insights = [];
const hasInsights = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insights'")
  .get();
if (hasInsights) {
  insights = db.prepare('SELECT * FROM insights ORDER BY date DESC, id DESC').all();
}

const outPath = path.join(projectRoot, 'src', 'data.json');
fs.writeFileSync(outPath, JSON.stringify({ games, events, insights }, null, 2));
console.log(
  `Successfully exported to src/data.json (games: ${games.length}, events: ${events.length}, insights: ${insights.length})`
);
