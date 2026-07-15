'use server'

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export async function addGame(formData: FormData) {
  const productName = formData.get('product_name') as string;
  const companyName = formData.get('company_name') as string;
  const companySize = formData.get('company_size') as string || '未知';
  const fundingRound = formData.get('funding_round') as string || '未知';
  const gameplayType = formData.get('gameplay_type') as string;
  const status = formData.get('status') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const tags = formData.get('tags') as string || '';

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO games (product_name, company_name, company_size, funding_round, gameplay_type, status, description, url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(productName, companyName, companySize, fundingRound, gameplayType, status, description, url || null, tags);

  revalidatePath('/');
}

export async function updateGame(id: number, formData: FormData) {
  const productName = formData.get('product_name') as string;
  const companyName = formData.get('company_name') as string;
  const companySize = formData.get('company_size') as string || '未知';
  const fundingRound = formData.get('funding_round') as string || '未知';
  const gameplayType = formData.get('gameplay_type') as string;
  const status = formData.get('status') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const tags = formData.get('tags') as string || '';

  const db = getDb();
  const stmt = db.prepare(`
    UPDATE games 
    SET product_name = ?, company_name = ?, company_size = ?, funding_round = ?, gameplay_type = ?, status = ?, description = ?, url = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(productName, companyName, companySize, fundingRound, gameplayType, status, description, url || null, tags, id);

  revalidatePath('/');
}

export async function deleteGame(id: number) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM games WHERE id = ?');
  stmt.run(id);

  revalidatePath('/');
}

export async function addGameEvent(gameId: number, formData: FormData) {
  const eventType = formData.get('event_type') as string;
  const eventDate = formData.get('event_date') as string;
  const content = formData.get('content') as string;

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO game_events (game_id, event_type, event_date, content)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(gameId, eventType, eventDate, content);

  revalidatePath('/');
}

export async function deleteGameEvent(id: number) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM game_events WHERE id = ?');
  stmt.run(id);

  revalidatePath('/');
}

export async function parseIntelligence(formData: FormData) {
  const text = formData.get('text') as string;
  const file = formData.get('file') as File | null;
  
  let extractedText = text || '';

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdfData = await pdf(buffer);
        extractedText += '\n' + pdfData.text;
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        extractedText += '\n' + result.value;
      } else {
        // fallback for text files
        extractedText += '\n' + buffer.toString('utf-8');
      }
    } catch (e) {
      console.error("File parsing error:", e);
      throw new Error("文件解析失败: " + String(e));
    }
  }

  // naive url fetching
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = extractedText.match(urlRegex);
  if (urls && urls.length > 0) {
    try {
      const response = await fetch(urls[0]);
      if (response.ok) {
        const html = await response.text();
        const stripped = html.replace(/<[^>]*>?/gm, '');
        extractedText += '\n' + stripped.substring(0, 10000); 
      }
    } catch (e) {
      console.error("Failed to fetch URL", e);
    }
  }

  if (!extractedText.trim()) {
    throw new Error("未提供有效内容 (支持文本、链接、PDF/Docx文件)");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("⚠️ 请在项目根目录创建 .env.local 文件并配置 OPENAI_API_KEY");
  }
  
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  const inputToAI = extractedText.substring(0, 15000);

  const prompt = `
请你作为一个游戏行业资深分析师，从以下文本中提取新产品情报信息，并以 JSON 格式输出。
如果有多个产品，请取最主要的那个产品。如果某些字段缺失，请尝试结合你的行业知识进行推断，或者填入默认值。

需要的 JSON 字段及说明：
- product_name (string): 产品名称（必填）
- company_name (string): 厂商/开发团队（必填）
- company_size (string): 大厂 / 中小团队 / 独立开发者 / 未知 （从中选一个）
- funding_round (string): 融资轮次，如 "未融资", "天使/种子轮", "A轮", "B轮及以上", "被收购", "已上市", "未知" 等
- gameplay_type (string): 玩法选型，从以下分类中选一个最符合的："AI陪伴", "传统玩法+AI NPC", "传统玩法+AI队友", "AI原生玩法 (对话模拟)", "AI原生玩法 (派对游戏)", "AI原生玩法 (机制/卡牌)", "初代Chatbot (AI陪伴)", "生成式AI驱动UGC", "其他"。如果都不符合就选"其他"
- status (string): 开发状态，如"已上线", "测试中", "研发中", "早期" 等
- description (string): 情报摘要/核心机制简述，50-150字，提取产品核心特色、核心数据等。
- url (string): 产品的官网链接或相关文章链接，如果没有则留空
- tags (array of string): 产品的相关补充标签（如"3D男女友", "GaaS化运营", "出海", "中国公司"等），尽量丰富且准确
- events (array of object): 附带的近期动态事件（如果有）。每个事件包含：
  - event_type (string): 必须是 "产品动态" 或 "融资动态"
  - event_date (string): 时间，如 "2026-Q1", "2025-10" 等
  - content (string): 动态详细内容

文本内容：
${inputToAI}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // Use gpt-4o-mini to be safer/cheaper
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const resultStr = response.choices[0].message.content || "{}";
    return JSON.parse(resultStr);
  } catch (e) {
    console.error("AI parse error:", e);
    throw new Error("AI 解析请求失败: " + String(e));
  }
}

export async function addGameWithEvents(formData: FormData) {
  const productName = formData.get('product_name') as string;
  const companyName = formData.get('company_name') as string;
  const companySize = formData.get('company_size') as string || '未知';
  const fundingRound = formData.get('funding_round') as string || '未知';
  const gameplayType = formData.get('gameplay_type') as string;
  const status = formData.get('status') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const tags = formData.get('tags') as string || '';
  const eventsJson = formData.get('events_json') as string;

  const db = getDb();
  
  const insertGame = db.prepare(`
    INSERT INTO games (product_name, company_name, company_size, funding_round, gameplay_type, status, description, url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertEvent = db.prepare(`
    INSERT INTO game_events (game_id, event_type, event_date, content)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const info = insertGame.run(productName, companyName, companySize, fundingRound, gameplayType, status, description, url || null, tags);
    const gameId = info.lastInsertRowid;
    
    if (eventsJson) {
      try {
        const events = JSON.parse(eventsJson);
        for (const evt of events) {
          insertEvent.run(gameId, evt.event_type, evt.event_date, evt.content);
        }
      } catch (e) {
        console.error("Failed to parse events JSON", e);
      }
    }
  });

  transaction();
  revalidatePath('/');
}
