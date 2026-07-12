export const NOTE_TEMPLATE = '# 论文概述\n\n# 阅读笔记\n';

export function stripMarkdown(text: string): string {
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

export function extractOverview(markdown: string): string | null {
  const lines = markdown.split('\n');
  let inOverview = false;
  const collected: string[] = [];
  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (inOverview) break;
      if (line.trim() === '# 论文概述') inOverview = true;
      continue;
    }
    if (inOverview) collected.push(line);
  }
  const text = stripMarkdown(collected.join('\n'));
  if (!text) return null;
  return text.length > 150 ? `${text.slice(0, 150)}...` : text;
}
