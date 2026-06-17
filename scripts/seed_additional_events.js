const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

const addGameStmt = db.prepare(`
  INSERT INTO games (product_name, company_name, gameplay_type, status, description)
  VALUES (@productName, @companyName, @gameplayType, @status, @description)
`);

const checkGameStmt = db.prepare('SELECT id FROM games WHERE product_name = ?');

const insertEvent = db.prepare('INSERT INTO game_events (game_id, event_type, event_date, content) VALUES (?, ?, ?, ?)');

const newGames = [
  {
    productName: 'Whisper from the star',
    companyName: 'Anuttacon',
    gameplayType: 'AI陪伴',
    status: '已上线/Pivot',
    description: '蔡浩宇Anuttacon的产品。目前已重大Pivot，不再做AI原生游戏，全面转向AI情感陪伴模型。有效玩家约3万人。'
  },
  {
    productName: '星野',
    companyName: 'MiniMax',
    gameplayType: '初代Chatbot (AI陪伴)',
    status: '已上线',
    description: '国内AI陪伴代表产品，已完成“虚拟恋人”属性的剥离，全面转向职场与学习场景。'
  },
  {
    productName: '超参数AI游戏',
    companyName: '超参数/阁道科技',
    gameplayType: '传统玩法+AI NPC',
    status: '研发中',
    description: '基于超参数AI底层支持，包含NPC行为驱动与剧情生成。'
  },
  {
    productName: 'Sreal互动视频',
    companyName: 'Sreal',
    gameplayType: '可交互视频',
    status: '早期',
    description: '天使轮公司，做可交互的游戏视频，对标Decart。底模基于Wan 2.2等。'
  },
  {
    productName: '织之&镜土 AI+TRPG',
    companyName: '织之',
    gameplayType: 'AI原生玩法',
    status: '早期',
    description: '依托于原创TRPG平台镜土，做grok like的可视频数字人。'
  }
];

// Ensure games exist
for (const game of newGames) {
  if (!checkGameStmt.get(game.productName)) {
    addGameStmt.run(game);
  }
}

const events = [
  { productName: '逗逗游戏伙伴', type: '产品动态', date: '2025-09', content: '注册用户达到1000万，MAU 380万，DAU 130万。月收入约62万，92%来自充值+月卡。' },
  { productName: '逗逗游戏伙伴', type: '产品动态', date: '2026-03', content: 'GDC前沿观察：最新MAU达到800万，DAU 270万，90%用户在中国。' },
  { productName: '麦琪的花园', type: '融资动态', date: '2026-03', content: 'GDC前沿观察：麦琪/Evomap 这轮融资5000万美金，出让12%股份，5Y和经纬已给TS。此前上轮不到1亿人民币估值融了20%。' },
  { productName: '麦琪的花园', type: '产品动态', date: '2026-03', content: '产品方向变为让agent从经验中学习，以及跨agent分享历史经验。原来的麦琪的花园单独交由原主策负责运营。' },
  { productName: 'Talkie', type: '产品动态', date: '2025-Q4', content: '公司层面计划在25年Q4完成港股IPO（已秘密递表）。目前ARR约1亿美金。' },
  { productName: 'Talkie', type: '产品动态', date: '2025-09', content: 'MAU 1100万，DAU 427万。作为公司核心收入支柱，贡献ARR的68%。' },
  { productName: '星野', type: '产品动态', date: '2025-09', content: 'MAU 1025万，DAU 683万。' },
  { productName: 'Whisper from the star', type: '产品动态', date: '2025-08', content: '项目重大Pivot：目标不再是做AI原生游戏，转向AI情感陪伴模型。WFTS有效玩家3万人，平均时长1.5-2h，高粘性群体以35-55岁男性为主。' },
  { productName: '超参数AI游戏', type: '融资动态', date: '2025-H2', content: '本轮融资金额3000万人民币，估值约3000万美金。' },
  { productName: 'Sreal互动视频', type: '融资动态', date: '2025', content: '完成天使轮融资。' }
];

for (const evt of events) {
  const game = checkGameStmt.get(evt.productName);
  if (game) {
    insertEvent.run(game.id, evt.type, evt.date, evt.content);
  }
}

console.log('Additional events seeded.');
