const { getDb } = require('../db/init');
const { createHttpError } = require('../middleware/error');

function mapField(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    paperCount: row.paper_count || row.paperCount || 0,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function listFields(_req, res) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT f.*, COUNT(p.id) AS paper_count
    FROM fields f
    LEFT JOIN paper_fields pf ON pf.field_id = f.id
    LEFT JOIN papers p ON p.id = pf.paper_id
    GROUP BY f.id
    ORDER BY paper_count DESC, f.created_at DESC
  `).all();
  res.json({ code: 0, data: rows.map(mapField), message: 'ok' });
}

function getField(req, res) {
  const db = getDb();
  const row = db.prepare(`
    SELECT f.*, COUNT(p.id) AS paper_count
    FROM fields f
    LEFT JOIN paper_fields pf ON pf.field_id = f.id
    LEFT JOIN papers p ON p.id = pf.paper_id
    WHERE f.id = ?
    GROUP BY f.id
  `).get(req.params.id);
  if (!row) throw createHttpError(404, '领域不存在');
  res.json({ code: 0, data: mapField(row), message: 'ok' });
}

function createField(req, res) {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) throw createHttpError(400, '领域名称不能为空');
  const db = getDb();
  const info = db.prepare('INSERT INTO fields (name, description) VALUES (?, ?)').run(name, description);
  const row = db.prepare('SELECT *, 0 AS paper_count FROM fields WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ code: 0, data: mapField(row), message: '创建成功' });
}

module.exports = { createField, getField, listFields, mapField };
