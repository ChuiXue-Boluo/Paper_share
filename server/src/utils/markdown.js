const OVERVIEW_TITLE = '# 论文概述';
const NOTE_TEMPLATE = `${OVERVIEW_TITLE}\n\n# 阅读笔记\n`;

function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{2,}\s+/gm, '')
    .replace(/[*_`~>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function truncate(text, max = 150) {
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function extractOverview(markdownContent) {
  if (!markdownContent) return null;
  const lines = markdownContent.split('\n');
  let inOverview = false;
  const overviewLines = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (inOverview) break;
      if (line.trim() === OVERVIEW_TITLE) {
        inOverview = true;
      }
      continue;
    }
    if (inOverview) overviewLines.push(line);
  }

  const text = stripMarkdown(overviewLines.join('\n'));
  return text ? truncate(text) : null;
}

module.exports = { NOTE_TEMPLATE, extractOverview, stripMarkdown, truncate };
