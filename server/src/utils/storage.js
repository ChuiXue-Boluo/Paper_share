const fs = require('fs');
const path = require('path');
const config = require('../config');

function sanitizeFilename(name) {
  return String(name || 'paper')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'paper';
}

function movePaperFile(tempPath, paperId, title) {
  const filename = `${paperId}_${sanitizeFilename(title)}.pdf`;
  const relativePath = path.join('papers', filename);
  const target = path.join(config.uploadDir, relativePath);
  fs.renameSync(tempPath, target);
  return relativePath.replace(/\\/g, '/');
}

function saveImageFile(file) {
  const ext = path.extname(file.originalname || '.png').toLowerCase();
  const filename = `${Date.now()}_${sanitizeFilename(path.basename(file.originalname, ext))}${ext}`;
  const relativePath = path.join('images', filename);
  fs.renameSync(file.path, path.join(config.uploadDir, relativePath));
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
}

function absoluteUploadPath(relativePath) {
  return path.join(config.uploadDir, relativePath);
}

module.exports = { absoluteUploadPath, movePaperFile, sanitizeFilename, saveImageFile };
