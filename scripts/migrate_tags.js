const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

try {
  const tableInfo = db.pragma('table_info(games)');
  const hasTags = tableInfo.some(col => col.name === 'tags');
  
  if (!hasTags) {
    db.exec("ALTER TABLE games ADD COLUMN tags TEXT DEFAULT ''");
    console.log('Added tags column.');
  } else {
    console.log('tags column already exists.');
  }
} catch (e) {
  console.error('Migration failed:', e);
}
