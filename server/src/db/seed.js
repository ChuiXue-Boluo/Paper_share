const fs = require('fs');
const path = require('path');
const { initDb } = require('./init');
const config = require('../config');
const { NOTE_TEMPLATE } = require('../utils/markdown');
const { sanitizeFilename } = require('../utils/storage');

const db = initDb();

const fields = [
  { name: '深度学习', description: '涵盖 CNN、Transformer、扩散模型和表示学习等方向。' },
  { name: '计算机视觉', description: '关注图像分类、目标检测、分割、视觉生成与多模态理解。' },
  { name: '自然语言处理', description: '覆盖大语言模型、信息抽取、文本生成、评测与对齐。' },
  { name: '图神经网络', description: '聚焦图表示学习、知识图谱、推荐系统和分子建模。' }
];

const papers = [
  {
    field: '深度学习',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    source: 'NIPS',
    overview: '本文提出 Transformer 架构，完全基于注意力机制建模序列依赖，显著提升并行训练效率，并成为后续大语言模型的重要基础。'
  },
  {
    field: '自然语言处理',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: 'Devlin et al.',
    year: 2019,
    source: 'NAACL',
    overview: 'BERT 通过掩码语言模型和下一句预测进行双向预训练，在多项自然语言理解任务上取得强基线效果。'
  },
  {
    field: '计算机视觉',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He et al.',
    year: 2016,
    source: 'CVPR',
    overview: 'ResNet 使用残差连接缓解深层网络退化问题，使百层级卷积网络训练成为可能，并刷新 ImageNet 分类结果。'
  }
];

function writePdf(relativePath, title) {
  const target = path.join(config.uploadDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 18 Tf 30 80 Td (${title.slice(0, 24)}) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`;
  fs.writeFileSync(target, content);
}

const run = db.transaction(() => {
  for (const field of fields) {
    db.prepare('INSERT OR IGNORE INTO fields (name, description) VALUES (?, ?)').run(field.name, field.description);
  }

  for (const paper of papers) {
    const field = db.prepare('SELECT id FROM fields WHERE name = ?').get(paper.field);
    const existing = db.prepare('SELECT id FROM papers WHERE title = ?').get(paper.title);
    if (existing) continue;
    const info = db.prepare(`
      INSERT INTO papers (title, authors, year, source, field_id, file_path, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(paper.title, paper.authors, paper.year, paper.source, field.id, 'pending', 0);
    const relativePath = `papers/${info.lastInsertRowid}_${sanitizeFilename(paper.title)}.pdf`;
    writePdf(relativePath, paper.title);
    const size = fs.statSync(path.join(config.uploadDir, relativePath)).size;
    db.prepare('UPDATE papers SET file_path = ?, file_size = ? WHERE id = ?').run(relativePath, size, info.lastInsertRowid);
    db.prepare('INSERT INTO notes (paper_id, content) VALUES (?, ?)').run(
      info.lastInsertRowid,
      `# 论文概述\n\n${paper.overview}\n\n# 阅读笔记\n\n## 核心要点\n\n- 待读者继续补充。\n`
    );
  }
});

run();
console.log('Seed data ready.');
