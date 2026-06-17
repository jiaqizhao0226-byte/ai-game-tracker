import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data.db'));
    db.pragma('foreign_keys = ON');
    
    // Auto-migrate tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_size TEXT DEFAULT '未知',
        funding_round TEXT DEFAULT '未知',
        gameplay_type TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT,
        tags TEXT DEFAULT '',
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
  status: string;
  description: string;
  url: string | null;
  tags: string;
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
  date: string;
  created_at: string;
}
