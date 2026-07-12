const path = require('path');
require('dotenv').config();

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  port: Number(process.env.PORT || 3001),
  dbPath: path.resolve(rootDir, process.env.DB_PATH || './data/paper_share.sqlite'),
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || './uploads'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  maxPdfSize: 50 * 1024 * 1024,
  maxImageSize: 5 * 1024 * 1024
};
