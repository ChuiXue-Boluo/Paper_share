const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/init');
const { createHttpError } = require('../middleware/error');
const { NOTE_TEMPLATE, extractOverview } = require('../utils/markdown');
const { absoluteUploadPath, movePaperFile, sanitizeFilename } = require('../utils/storage');

function mapPaper(row) {
  if (!row) return null;
  const fields = row.fields || getPaperFields(row.id);
  return {
    id: row.id,
    title: row.title,
    authors: row.authors || '',
    year: row.year,
    source: row.source || '',
    topic: row.topic || '',
    abstract: row.abstract || '',
    fieldId: row.field_id,
    fieldName: row.field_name,
    fieldIds: fields.map((field) => field.id),
    fieldNames: fields.map((field) => field.name),
    fields,
    fileSize: row.file_size || 0,
    uploaderName: row.uploader_name || '',
    overviewPreview: row.overviewPreview ?? row.overview_preview ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getPaperFields(paperId) {
  return getDb().prepare(`
    SELECT f.id, f.name, f.description
    FROM paper_fields pf
    JOIN fields f ON f.id = pf.field_id
    WHERE pf.paper_id = ?
    ORDER BY f.name COLLATE NOCASE
  `).all(paperId);
}

function getPaperRow(id) {
  return getDb().prepare(`
    SELECT p.*, f.name AS field_name
    FROM papers p
    JOIN fields f ON f.id = p.field_id
    WHERE p.id = ?
  `).get(id);
}

function getPaper(req, res) {
  const row = getPaperRow(req.params.id);
  if (!row) throw createHttpError(404, '论文不存在');
  const note = getDb().prepare('SELECT content FROM notes WHERE paper_id = ?').get(row.id);
  row.overviewPreview = note ? extractOverview(note.content) : null;
  res.json({ code: 0, data: mapPaper(row), message: 'ok' });
}

function listPapers(req, res) {
  const db = getDb();
  const field = db.prepare(`
    SELECT f.*, COUNT(p.id) AS paper_count
    FROM fields f
    LEFT JOIN paper_fields pf ON pf.field_id = f.id
    LEFT JOIN papers p ON p.id = pf.paper_id
    WHERE f.id = ?
    GROUP BY f.id
  `).get(req.params.fieldId);
  if (!field) throw createHttpError(404, '领域不存在');

  const search = String(req.query.search || '').trim();
  const sort = req.query.sort === 'oldest' ? 'p.created_at ASC' : req.query.sort === 'title' ? 'p.title COLLATE NOCASE ASC' : 'p.created_at DESC';
  const args = [req.params.fieldId];
  let where = 'WHERE pf.field_id = ?';
  if (search) {
    where += ' AND (p.title LIKE ? OR p.source LIKE ? OR p.topic LIKE ?)';
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const rows = db.prepare(`
    SELECT p.*, f.name AS field_name, n.content AS note_content
    FROM paper_fields pf
    JOIN papers p ON p.id = pf.paper_id
    JOIN fields f ON f.id = p.field_id
    LEFT JOIN notes n ON n.paper_id = p.id
    ${where}
    ORDER BY ${sort}
  `).all(...args);
  const papers = rows.map((row) => mapPaper({ ...row, overviewPreview: extractOverview(row.note_content) }));
  res.json({
    code: 0,
    data: {
      field: {
        id: field.id,
        name: field.name,
        description: field.description || '',
        paperCount: field.paper_count || 0,
        createdAt: field.created_at
      },
      papers,
      total: papers.length
    },
    message: 'ok'
  });
}

function listPaperOptions(req, res) {
  const db = getDb();
  const field = db.prepare('SELECT id FROM fields WHERE id = ?').get(req.params.fieldId);
  if (!field) throw createHttpError(404, '领域不存在');
  const venues = db.prepare(`
    SELECT DISTINCT trim(source) AS value
    FROM papers p
    JOIN paper_fields pf ON pf.paper_id = p.id
    WHERE pf.field_id = ? AND trim(source) != ''
    ORDER BY lower(value)
  `).all(req.params.fieldId).map((row) => row.value);
  const topics = db.prepare(`
    SELECT DISTINCT trim(topic) AS value
    FROM papers p
    JOIN paper_fields pf ON pf.paper_id = p.id
    WHERE pf.field_id = ? AND trim(topic) != ''
    ORDER BY lower(value)
  `).all(req.params.fieldId).map((row) => row.value);
  res.json({ code: 0, data: { venues, topics }, message: 'ok' });
}

function listGlobalPaperOptions(_req, res) {
  const db = getDb();
  const venues = db.prepare(`
    SELECT DISTINCT trim(source) AS value
    FROM papers
    WHERE trim(source) != ''
    ORDER BY lower(value)
  `).all().map((row) => row.value);
  const topics = db.prepare(`
    SELECT DISTINCT trim(topic) AS value
    FROM papers
    WHERE trim(topic) != ''
    ORDER BY lower(value)
  `).all().map((row) => row.value);
  res.json({ code: 0, data: { venues, topics }, message: 'ok' });
}

function parseJsonArray(value) {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function resolveFieldIds(db, req) {
  const ids = new Set(parseJsonArray(req.body.fieldIds).map((id) => Number(id)).filter(Number.isFinite));
  if (req.params.fieldId) ids.add(Number(req.params.fieldId));

  const fieldNames = parseJsonArray(req.body.fieldNames)
    .map((name) => String(name || '').trim())
    .filter(Boolean);
  if (fieldNames.length) throw createHttpError(400, '所属领域只能从已有领域中选择');

  const existingIds = [...ids].filter((id) => db.prepare('SELECT id FROM fields WHERE id = ?').get(id));
  if (!existingIds.length) throw createHttpError(400, '请至少选择一个所属领域');
  return existingIds;
}

function ensureNoDuplicateTitleInFields(db, title, fieldIds, exceptPaperId = null) {
  const duplicate = db.prepare(`
    SELECT p.id, f.name
    FROM papers p
    JOIN paper_fields pf ON pf.paper_id = p.id
    JOIN fields f ON f.id = pf.field_id
    WHERE pf.field_id = ?
      AND lower(trim(p.title)) = lower(trim(?))
      AND (? IS NULL OR p.id != ?)
    LIMIT 1
  `);
  for (const fieldId of fieldIds) {
    const row = duplicate.get(fieldId, title, exceptPaperId, exceptPaperId);
    if (row) throw createHttpError(409, `领域 ${row.name} 已存在同名论文，不能重复上传`);
  }
}

function uploadPaper(req, res) {
  if (!req.file) throw createHttpError(400, '请上传 PDF 文件');
  const title = String(req.body.title || '').trim();
  const uploaderName = String(req.body.uploaderName || req.body.uploader_name || '').trim();
  if (!title) throw createHttpError(400, '标题不能为空');
  if (!uploaderName) throw createHttpError(400, '上传者不能为空');
  if (req.file.mimetype !== 'application/pdf' && path.extname(req.file.originalname).toLowerCase() !== '.pdf') {
    fs.unlinkSync(req.file.path);
    throw createHttpError(400, '仅支持 PDF 文件');
  }

  const db = getDb();
  let fieldIds;
  try {
    fieldIds = resolveFieldIds(db, req);
  } catch (error) {
    fs.unlinkSync(req.file.path);
    throw error;
  }
  try {
    ensureNoDuplicateTitleInFields(db, title, fieldIds);
  } catch (error) {
    fs.unlinkSync(req.file.path);
    throw error;
  }

  const insert = db.transaction(() => {
    const paperInfo = db.prepare(`
      INSERT INTO papers (title, authors, year, source, topic, abstract, field_id, file_path, file_size, uploader_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      String(req.body.authors || '').trim(),
      req.body.year ? Number(req.body.year) : null,
      String(req.body.source || '').trim(),
      String(req.body.topic || '').trim(),
      String(req.body.abstract || '').trim(),
      fieldIds[0],
      'pending',
      req.file.size,
      uploaderName
    );
    const relativePath = movePaperFile(req.file.path, paperInfo.lastInsertRowid, title);
    db.prepare('UPDATE papers SET file_path = ? WHERE id = ?').run(relativePath, paperInfo.lastInsertRowid);
    const insertField = db.prepare('INSERT OR IGNORE INTO paper_fields (paper_id, field_id) VALUES (?, ?)');
    for (const fieldId of fieldIds) insertField.run(paperInfo.lastInsertRowid, fieldId);
    db.prepare('INSERT INTO notes (paper_id, content) VALUES (?, ?)').run(paperInfo.lastInsertRowid, NOTE_TEMPLATE);
    return paperInfo.lastInsertRowid;
  });

  const row = getPaperRow(insert());
  res.status(201).json({ code: 0, data: mapPaper(row), message: '上传成功' });
}

function updatePaper(req, res) {
  const db = getDb();
  const current = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id);
  if (!current) throw createHttpError(404, '论文不存在');

  const title = req.body.title === undefined ? current.title : String(req.body.title || '').trim();
  if (!title) throw createHttpError(400, '标题不能为空');
  const fieldIds = req.body.fieldIds !== undefined || req.body.fieldNames !== undefined
    ? resolveFieldIds(db, req)
    : getPaperFields(current.id).map((field) => field.id);
  ensureNoDuplicateTitleInFields(db, title, fieldIds, current.id);

  db.transaction(() => {
    db.prepare(`
      UPDATE papers
      SET title = ?,
          field_id = ?,
          source = ?,
          topic = ?,
          uploader_name = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title,
      fieldIds[0],
      req.body.source === undefined ? current.source || '' : String(req.body.source || '').trim(),
      req.body.topic === undefined ? current.topic || '' : String(req.body.topic || '').trim(),
      req.body.uploaderName === undefined && req.body.uploader_name === undefined
        ? current.uploader_name || ''
        : String(req.body.uploaderName || req.body.uploader_name || '').trim(),
      current.id
    );
    if (req.body.fieldIds !== undefined || req.body.fieldNames !== undefined) {
      db.prepare('DELETE FROM paper_fields WHERE paper_id = ?').run(current.id);
      const insertField = db.prepare('INSERT OR IGNORE INTO paper_fields (paper_id, field_id) VALUES (?, ?)');
      for (const fieldId of fieldIds) insertField.run(current.id, fieldId);
    }
  })();

  res.json({ code: 0, data: mapPaper(getPaperRow(current.id)), message: '更新成功' });
}

function downloadPaper(req, res) {
  const row = getDb().prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id);
  if (!row) throw createHttpError(404, '论文不存在');
  const filePath = absoluteUploadPath(row.file_path);
  if (!fs.existsSync(filePath)) throw createHttpError(404, 'PDF 文件不存在');
  res.download(filePath, `${sanitizeFilename(row.title)}.pdf`);
}

module.exports = { downloadPaper, getPaper, listGlobalPaperOptions, listPaperOptions, listPapers, updatePaper, uploadPaper };
