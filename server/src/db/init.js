const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

let db;

function ensureDirs() {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  fs.mkdirSync(path.join(config.uploadDir, 'papers'), { recursive: true });
  fs.mkdirSync(path.join(config.uploadDir, 'images'), { recursive: true });
}

function initDb() {
  ensureDirs();
  db = new Database(config.dbPath);
  db.pragma('foreign_keys = ON');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  ensureMigrations(db);
  return db;
}

function ensureMigrations(database) {
  const paperColumns = database.prepare('PRAGMA table_info(papers)').all().map((column) => column.name);
  if (!paperColumns.includes('topic')) {
    database.exec("ALTER TABLE papers ADD COLUMN topic TEXT DEFAULT ''");
  }
  if (!paperColumns.includes('uploader_name')) {
    database.exec("ALTER TABLE papers ADD COLUMN uploader_name TEXT DEFAULT ''");
  }
  database.exec(`
    CREATE TABLE IF NOT EXISTS paper_fields (
      paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
      field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (paper_id, field_id)
    );
    CREATE INDEX IF NOT EXISTS idx_paper_fields_field_id ON paper_fields(field_id);
    INSERT OR IGNORE INTO paper_fields (paper_id, field_id)
    SELECT id, field_id FROM papers;
  `);
}

function getDb() {
  if (!db) return initDb();
  return db;
}

module.exports = { initDb, getDb };
