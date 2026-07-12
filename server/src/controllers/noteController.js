const { getDb } = require('../db/init');
const { createHttpError } = require('../middleware/error');
const { NOTE_TEMPLATE } = require('../utils/markdown');
const { saveImageFile } = require('../utils/storage');

function mapNote(row) {
  return {
    id: row.id,
    paperId: row.paper_id,
    content: row.content,
    lastEditedAt: row.last_edited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function ensurePaper(paperId) {
  const paper = getDb().prepare('SELECT id FROM papers WHERE id = ?').get(paperId);
  if (!paper) throw createHttpError(404, '论文不存在');
}

function ensureNote(paperId) {
  const db = getDb();
  ensurePaper(paperId);
  let row = db.prepare('SELECT * FROM notes WHERE paper_id = ?').get(paperId);
  if (!row) {
    const info = db.prepare('INSERT INTO notes (paper_id, content) VALUES (?, ?)').run(paperId, NOTE_TEMPLATE);
    row = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
  }
  return row;
}

function getNote(req, res) {
  const row = ensureNote(req.params.paperId);
  res.json({ code: 0, data: mapNote(row), message: 'ok' });
}

function updateNote(req, res) {
  const content = typeof req.body.content === 'string' ? req.body.content : null;
  if (content === null) throw createHttpError(400, '笔记内容不能为空');
  const db = getDb();
  const current = ensureNote(req.params.paperId);
  if (current.content !== content) {
    db.prepare('INSERT INTO note_revisions (note_id, content) VALUES (?, ?)').run(current.id, current.content);
    db.prepare(`
      UPDATE notes
      SET content = ?, last_edited_at = datetime('now'), updated_at = datetime('now')
      WHERE paper_id = ?
    `).run(content, req.params.paperId);
  }
  const row = db.prepare('SELECT * FROM notes WHERE paper_id = ?').get(req.params.paperId);
  res.json({ code: 0, data: mapNote(row), message: '已保存' });
}

function uploadNoteImage(req, res) {
  ensurePaper(req.params.paperId);
  if (!req.file) throw createHttpError(400, '请上传图片');
  const url = saveImageFile(req.file);
  res.status(201).json({ code: 0, data: { url }, message: '上传成功' });
}

module.exports = { getNote, updateNote, uploadNoteImage };
