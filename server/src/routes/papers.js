const express = require('express');
const multer = require('multer');
const config = require('../config');
const paperController = require('../controllers/paperController');
const noteController = require('../controllers/noteController');
const { asyncHandler, createHttpError } = require('../middleware/error');

const router = express.Router();
const paperUpload = multer({
  dest: `${config.uploadDir}/papers`,
  limits: { fileSize: config.maxPdfSize },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true);
    else cb(createHttpError(400, '仅支持 PDF 文件'));
  }
});
const imageUpload = multer({
  dest: `${config.uploadDir}/images`,
  limits: { fileSize: config.maxImageSize },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpeg|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(createHttpError(400, '仅支持 png/jpeg/gif/webp 图片'));
  }
});

router.get('/options/list', asyncHandler(paperController.listGlobalPaperOptions));
router.post('/', paperUpload.single('file'), asyncHandler(paperController.uploadPaper));
router.get('/:id', asyncHandler(paperController.getPaper));
router.put('/:id', asyncHandler(paperController.updatePaper));
router.get('/:id/download', asyncHandler(paperController.downloadPaper));
router.get('/:paperId/note', asyncHandler(noteController.getNote));
router.put('/:paperId/note', asyncHandler(noteController.updateNote));
router.post('/:paperId/note/image', imageUpload.single('file'), asyncHandler(noteController.uploadNoteImage));

module.exports = router;
