const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS game_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );
`);

const events = [
  { productName: '逗逗游戏伙伴', type: '融资动态', date: '2025-12', content: '获得$20M融资，估值达到$2亿。' },
  { productName: '逗逗游戏伙伴', type: '产品动态', date: '2025-11', content: 'MAU达到490万，DAU达到160万。商业化预期在于转型类Taptap游戏发行平台。' },
  { productName: '无限谷', type: '融资动态', date: '2025-H2', content: '完成$10M天使+轮融资，真格、IDG投资，估值近$70M。' },
  { productName: '无限谷', type: '产品动态', date: '2025-12', content: '开启测试，测试次留超80%，首日使用时长超60分钟。' },
  { productName: 'EVE AI', type: '融资动态', date: '2026-01', content: '完成超3000万美元融资，投资方包括阿里、启明等。' },
  { productName: 'EVE AI', type: '产品动态', date: '2025-11', content: '海外已上线，付费用户10万，月收入$100万。' },
  { productName: 'Character.AI', type: '融资动态', date: '2024-08', content: '被谷歌以$25亿收购。' },
  { productName: 'Character.AI', type: '产品动态', date: '2025-12', content: 'MAU达到2000万，年收入达到$5000万。' }
];

const getGameId = db.prepare('SELECT id FROM games WHERE product_name = ?');
const insertEvent = db.prepare('INSERT INTO game_events (game_id, event_type, event_date, content) VALUES (?, ?, ?, ?)');

for (const evt of events) {
  const game = getGameId.get(evt.productName);
  if (game) {
    insertEvent.run(game.id, evt.type, evt.date, evt.content);
  }
}

console.log('Events seeded.');
