const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    gameplay_type TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const initialData = [
  {
    productName: '逗逗游戏伙伴',
    companyName: 'AutoGame',
    gameplayType: 'AI陪伴 (AI陪玩)',
    status: '已上线',
    description: '游戏外AI陪伴+攻略助手，支持二次元、大DAU等多款游戏，月流水数百万级别。商业模式以充值/月卡为主，活跃达百万级，长期留存验证用户黏性。',
  },
  {
    productName: 'EVE AI',
    companyName: '自然选择',
    gameplayType: 'AI陪伴 (3D AI男女友)',
    status: '研发中/测试',
    description: '3D AI男女友陪伴，具备拟人化体验、记忆系统和动作反馈，采用订阅制+内购。长期情感连接，海外已上线验证，月收入达100万美元。',
  },
  {
    productName: '逆水寒',
    companyName: '网易雷火',
    gameplayType: '传统玩法+AI NPC',
    status: '已上线',
    description: '内置“AI剧组”模式，利用视频生动作等AI技术降低UGC短视频创作门槛；提供高定制化的AI门客NPC大世界同游及放置事件。',
  },
  {
    productName: '麦琪的花园',
    companyName: 'AutoGame',
    gameplayType: '传统玩法+AI NPC',
    status: '研发中',
    description: '“星露谷”like模拟经营，玩家可与定制AI NPC对话、送礼并作为队友参与战斗。当前像素版本已开发完成。',
  },
  {
    productName: '三角洲行动 (CC)',
    companyName: '腾讯',
    gameplayType: '传统玩法+AI NPC',
    status: '已上线',
    description: '毒舌人设游戏内语音AI助手，主打陪聊与攻略，通过与玩家互怼产生“节目效果”，具备较高自传播度。',
  },
  {
    productName: '永劫无间手游',
    companyName: '网易',
    gameplayType: '传统玩法+AI队友',
    status: '已上线',
    description: '大模型结合行为树的AI队友，可执行陪玩基础功能并提供情绪价值，实装于PvP对局中。',
  },
  {
    productName: '无限谷',
    companyName: '路米尔',
    gameplayType: 'AI陪伴 (AI男友)',
    status: '测试中',
    description: '主打女性向的AI 男友/管家型陪伴，核心成员来自猫耳FM团队，获真格、IDG投资。测试次留超80%。',
  },
  {
    productName: '桌崽AI',
    companyName: '脸谱心智',
    gameplayType: 'AI陪伴 (游戏搭子)',
    status: '已上线',
    description: '二次元桌面虚拟人/桌宠陪玩，点评游戏画面内容、陪伴闲聊、提供教程等。',
  },
  {
    productName: 'Pick Me Pick Me',
    companyName: 'Optillusion',
    gameplayType: 'AI原生玩法 (派对游戏)',
    status: '已上线',
    description: 'AI双人竞技游戏，通过对话赢取AI好感度，属于派对类小爆款，社交关系链掩盖AI不稳定。',
  },
  {
    productName: '星布谷地',
    companyName: '米哈游',
    gameplayType: '传统玩法+AI NPC',
    status: '测试中',
    description: '生活模拟游戏，包含AI老板娘NPC，可与玩家自由对话或加入群聊，赋能社交。',
  },
  {
    productName: '喵呜岛',
    companyName: '喵吉托工作室',
    gameplayType: '传统玩法+AI NPC',
    status: '测试中',
    description: '多人联机模拟经营，玩家通过驯养AI Agent控制的宠物(猫咪)来经营小岛。',
  },
  {
    productName: '青椒模拟器',
    companyName: '独立开发',
    gameplayType: 'AI原生玩法 (对话模拟)',
    status: '已上线',
    description: '复刻真实的青椒(高校青年教师)日常，大模型生成事件的文字生存模拟器。DAU达9万。',
  },
  {
    productName: '遥远行星建造师',
    companyName: '阁道科技',
    gameplayType: '传统玩法+AI NPC',
    status: 'Demo测试',
    description: '太阁like跑商经营+飞船战斗+星球建造，融合数百个支持自由文字对话的AI NPC。',
  },
  {
    productName: '王者荣耀',
    companyName: '腾讯',
    gameplayType: '传统玩法+AI队友',
    status: '已上线',
    description: '“指挥官玩法”，1个玩家带4个听从指令的AI队友参与对局。',
  },
  {
    productName: '我的三国',
    companyName: '臭皮匠工作室',
    gameplayType: 'AI原生玩法 (跑团模拟)',
    status: '首曝/研发中',
    description: '三国背景的AI跑团模拟游戏，利用大模型充当KP/角色扮演。',
  },
  {
    productName: '觉醒AI RogueAI',
    companyName: 'Nerdook',
    gameplayType: 'AI原生玩法 (机制/卡牌)',
    status: '已上线',
    description: '扮演AI管理设施的模拟/策略游戏，利用生成式AI进行玩法判断与卡牌生成。',
  },
  {
    productName: 'AI創作呪文',
    companyName: 'MONO ENTERTAINMENT',
    gameplayType: 'AI原生玩法 (机制/卡牌)',
    status: '已上线',
    description: '用汉字组合“造法术”，AI评估技能的伤害与效果并进行战斗，有数千销量，好评较高。',
  },
  {
    productName: 'Death by AI',
    companyName: 'Little Umbrella',
    gameplayType: 'AI原生玩法 (派对游戏)',
    status: '已上线',
    description: '多人派对社交游戏，AI判断玩家提出的求生策略是否成功。累计2000万玩家。',
  },
  {
    productName: 'Character.AI',
    companyName: 'Google (收购)',
    gameplayType: '初代Chatbot (AI陪伴)',
    status: '已上线',
    description: '第一代AI陪伴产品代表，提供文本角色扮演对话。',
  },
  {
    productName: 'Talkie',
    companyName: 'MiniMax',
    gameplayType: '初代Chatbot (AI陪伴)',
    status: '已上线',
    description: '第一代AI陪伴产品，MAU达1100万，25年前十月收入超6000万美元。',
  }
];

const stmt = db.prepare(`
  INSERT INTO games (product_name, company_name, gameplay_type, status, description)
  VALUES (@productName, @companyName, @gameplayType, @status, @description)
`);

const checkStmt = db.prepare('SELECT count(*) as count FROM games');
const { count } = checkStmt.get();

if (count === 0) {
  const insertMany = db.transaction((games) => {
    for (const game of games) {
      stmt.run(game);
    }
  });
  insertMany(initialData);
  console.log(`Seeded database with ${initialData.length} entries.`);
} else {
  console.log('Database already seeded.');
}
