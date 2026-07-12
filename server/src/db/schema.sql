CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  authors TEXT DEFAULT '',
  year INTEGER,
  source TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  abstract TEXT DEFAULT '',
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  uploader_name TEXT DEFAULT '',
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_papers_field_id ON papers(field_id);
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers(title);
CREATE UNIQUE INDEX IF NOT EXISTS idx_papers_field_title_unique ON papers(field_id, lower(trim(title)));

CREATE TABLE IF NOT EXISTS paper_fields (
  paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (paper_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_paper_fields_field_id ON paper_fields(field_id);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id INTEGER NOT NULL UNIQUE REFERENCES papers(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '# 论文概述

# 阅读笔记
',
  last_edited_by INTEGER REFERENCES users(id),
  last_edited_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS note_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_revisions_note_id ON note_revisions(note_id);
