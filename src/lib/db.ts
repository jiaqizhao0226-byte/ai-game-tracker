import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data.db'));
    db.pragma('foreign_keys = ON');
    
    // Auto-migrate tables —— 字段与 src/data.json 的实际结构保持一致
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_size TEXT DEFAULT '未知',
        funding_round TEXT DEFAULT '未知',
        gameplay_type TEXT DEFAULT '',
        gameplay_main TEXT DEFAULT '',
        gameplay_sub TEXT DEFAULT '',
        ai_role TEXT DEFAULT '',
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        product_intro TEXT DEFAULT '',
        url TEXT,
        image_url TEXT DEFAULT '',
        region TEXT DEFAULT '',
        platform TEXT DEFAULT '',
        launch_date TEXT DEFAULT '',
        team_background TEXT DEFAULT '',
        team_members TEXT DEFAULT '',
        funding_amount TEXT DEFAULT '',
        funding_detail TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        featured INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        event_date TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        content TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        date TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}

export interface GameRecord {
  id: number;
  product_name: string;
  company_name: string;
  company_size: string;
  funding_round: string;
  gameplay_type: string;
  gameplay_main: string;
  gameplay_sub: string;
  ai_role: string;
  status: string;
  description: string;
  product_intro: string;
  url: string | null;
  image_url: string;
  region: string;
  platform: string;
  launch_date: string;
  team_background: string;
  team_members: string;
  funding_amount: string;
  funding_detail: string;
  tags: string;
  featured: number;
  updated_at: string;
}

export interface GameEvent {
  id: number;
  game_id: number;
  event_type: string;
  event_date: string;
  content: string;
  created_at: string;
}

export interface InsightRecord {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string;
  date: string;
  created_at: string;
}
