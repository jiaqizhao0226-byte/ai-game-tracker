const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

try {
  // Check if url column exists
  const tableInfo = db.pragma('table_info(games)');
  const hasUrl = tableInfo.some(col => col.name === 'url');
  
  if (!hasUrl) {
    db.exec('ALTER TABLE games ADD COLUMN url TEXT');
    console.log('Added url column to games table.');
  } else {
    console.log('url column already exists.');
  }
} catch (e) {
  console.error('Migration failed:', e);
}
