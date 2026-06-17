const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);

try {
  const tableInfo = db.pragma('table_info(games)');
  const hasCompanySize = tableInfo.some(col => col.name === 'company_size');
  const hasFundingRound = tableInfo.some(col => col.name === 'funding_round');
  
  if (!hasCompanySize) {
    db.exec("ALTER TABLE games ADD COLUMN company_size TEXT DEFAULT '未知'");
    console.log('Added company_size column.');
  }
  if (!hasFundingRound) {
    db.exec("ALTER TABLE games ADD COLUMN funding_round TEXT DEFAULT '未知'");
    console.log('Added funding_round column.');
  }
} catch (e) {
  console.error('Migration failed:', e);
}
