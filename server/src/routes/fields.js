const express = require('express');
const multer = require('multer');
const config = require('../config');
const { asyncHandler, createHttpError } = require('../middleware/error');
const fieldController = require('../controllers/fieldController');
const paperController = require('../controllers/paperController');

const router = express.Router();
const upload = multer({
  dest: `${config.uploadDir}/papers`,
  limits: { fileSize: config.maxPdfSize },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true);
    else cb(createHttpError(400, '仅支持 PDF 文件'));
  }
});

router.get('/', asyncHandler(fieldController.listFields));
router.post('/', asyncHandler(fieldController.createField));
router.get('/:id', asyncHandler(fieldController.getField));
router.get('/:fieldId/paper-options', asyncHandler(paperController.listPaperOptions));
router.get('/:fieldId/papers', asyncHandler(paperController.listPapers));
router.post('/:fieldId/papers', upload.single('file'), asyncHandler(paperController.uploadPaper));

module.exports = router;
