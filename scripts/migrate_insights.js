const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const checkStmt = db.prepare('SELECT count(*) as count FROM insights');
  if (checkStmt.get().count === 0) {
    const insertInsight = db.prepare(`
      INSERT INTO insights (title, category, summary, content, date)
      VALUES (?, ?, ?, ?, ?)
    `);

    const initialInsights = [
      {
        title: "大盘趋势：AI+游戏进入“理性期/产品化期”",
        category: "宏观趋势",
        summary: "整体热度上升，但玩法形态总体进入“理性期/产品化期”，小范围创新多、破圈级新范式少；国内进展整体领先海外。",
        date: "2026-01",
        content: "2025年到2026年初，行业整体对于“AI+游戏”的关注度持续提升，是从“概念验证”发展到“产品化落地”的过渡年。决定产品形态的硬约束没有变：成本、延迟、上下文、一致性与可控性。因此，当前阶段的产品普遍采用模型替换、异步玩法、记忆工程、混合架构等方式来规避这些硬约束。以LLM目前的技术进展去做全新游戏可创新的空间很小，要卖座还是需要传统艺能（IP/剧本/策划/美术等）。"
      },
      {
        title: "赛道洞察：二代AI陪伴的机会在于“IP化×场景化×游戏化”",
        category: "AI陪伴赛道",
        summary: "护城河在于内容工业化与关系留存系统；商业化更可能收敛到乙游式内购，而不是纯对话的订阅或Token收费。",
        date: "2026-01",
        content: "AI陪伴型产品已从初代Chatbot类产品（如C.AI, Talkie等）转向具备IP化、场景化、游戏化特性的第二代产品。商业化路径更为明确：基本摒弃纯AI产品卖token的思路，采用角色爱+游戏化内购的思路。关键成功因素（KSF）在于产品工程层面knowhow及内容品质，如人设一致性、长期记忆、回答情商等，3D内容的体验观感及长期产能也是决胜因素。部分头部厂商已发生重大Pivot，将重心完全转向AI情感陪伴而非复杂的AI原生底层游戏。"
      },
      {
        title: "传统玩法融合：“AI剧组”与UGC二创的新范式",
        category: "玩法创新",
        summary: "低门槛生产+强分发+一键二创+日常激励，能系统性提升内容供给与活跃留存，是内容型游戏值得借鉴的范式。",
        date: "2025-10",
        content: "以《逆水寒》AI剧组模式为例，利用视频生动作、TTS等AI技术，允许玩家零门槛创作高质量、个性化游戏短视频。通过游戏内分享平台、一键二创、日常奖励等功能形成闭环的分发与留存机制，占手游总玩家相当可观的比例参与了内容创作，显著激活了社区生态。这为大体量内容向MMO或开放世界游戏提供了一个极其成功的AI落地参考。"
      },
      {
        title: "基座匹配度：模拟经营仍是AI最适配的类型",
        category: "玩法创新",
        summary: "低竞技压力、高叙事容错、长尾内容需求与可控节奏，使其在成本/延迟约束下依然能稳定获得体验增量。",
        date: "2026-01",
        content: "模拟经营具有天然的AI融合优势：①低竞技压力，②高叙事容错（NPC胡说八道也能被包装成性格或随机事件），③高长尾内容需求，需要大量任务、事件、对话，AI能补齐内容池，④节奏可控，可做异步或半实时，时延更容易被接受。目前主要AI融入点为NPC生成、对话行为、剧情走向、道具生成，未来还可探索AI融入养殖/烹饪/制造等系统。"
      },
      {
        title: "社交掩盖缺陷：AI派对游戏的“中小爆款”逻辑",
        category: "AI原生玩法",
        summary: "社交关系链可掩盖AI不稳定，但复玩天花板有限，长期看平台机会大于单品。",
        date: "2025-12",
        content: "AI-native的轻量社交游戏存在机会，本身就偏向恶搞无厘头。派对游戏天然是短单局、强社交、低学习成本，适合让AI来当“内容引擎、主持或表演者”。社交关系链本身能掩盖AI的不稳定性（不好笑也能靠朋友互相起哄把局撑住）。但这类产品留存深度及单个爆款的天花板有限，长期可复玩性不足，最终更可能跑出来的是“平台型/工具型”的赢家集合。"
      }
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertInsight.run(item.title, item.category, item.summary, item.content, item.date);
      }
    });
    insertMany(initialInsights);
    console.log('Seeded insights table.');
  } else {
    console.log('insights table already seeded.');
  }

} catch (e) {
  console.error('Migration failed:', e);
}
