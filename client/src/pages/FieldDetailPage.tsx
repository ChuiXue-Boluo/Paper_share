import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Alert, Box, Button, CircularProgress, Container, MenuItem, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFieldPapers } from '../api/papers';
import { fetchFields } from '../api/fields';
import PaperCard from '../components/papers/PaperCard';
import PaperEditDialog from '../components/papers/PaperEditDialog';
import PaperUploadDialog from '../components/papers/PaperUploadDialog';
import type { Field, Paper } from '../types';

export default function FieldDetailPage() {
  const { fieldId = '' } = useParams();
  const [field, setField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPapers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFieldPapers(fieldId, { search, sort });
      setField(data.field);
      setPapers(data.papers);
    } catch (err) {
      setError(err instanceof Error ? err.message : '论文列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPapers(), 250);
    return () => window.clearTimeout(timer);
  }, [fieldId, search, sort]);

  useEffect(() => {
    fetchFields().then(setAllFields).catch(() => setAllFields([]));
  }, []);

  return (
    <Container maxWidth="lg" className="py-8">
      <Button component={Link} to="/" startIcon={<ArrowBackIcon />} className="mb-4">返回</Button>
      <Box className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
        <Box className="flex-1">
          <Typography variant="h4" fontWeight={900}>{field?.name || '领域详情'}</Typography>
          <Typography color="text.secondary" className="mt-2">{field?.description || '暂无描述'}，共 {field?.paperCount || papers.length} 篇论文</Typography>
        </Box>
        <Button startIcon={<UploadFileIcon />} variant="contained" onClick={() => setUploadOpen(true)}>上传论文</Button>
      </Box>
      <Box className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 mb-5">
        <TextField size="small" placeholder="搜索论文题目、发表会议或具体方向" value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField size="small" select value={sort} onChange={(e) => setSort(e.target.value)}>
          <MenuItem value="latest">最新上传</MenuItem>
          <MenuItem value="oldest">最旧上传</MenuItem>
          <MenuItem value="title">标题字母序</MenuItem>
        </TextField>
      </Box>
      {error ? <Alert severity="error" className="mb-4">{error}</Alert> : null}
      {loading ? (
        <Box className="py-20 text-center"><CircularProgress /></Box>
      ) : (
        <Box className="flex flex-col gap-4">
          {papers.map((paper) => <PaperCard paper={paper} key={paper.id} onEdit={setEditingPaper} />)}
          {!papers.length ? <Alert severity="info">暂无论文，点击右上角上传第一篇 PDF。</Alert> : null}
        </Box>
      )}
      <PaperUploadDialog fieldId={fieldId} fields={allFields.length ? allFields : field ? [field] : []} open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => void loadPapers()} />
      <PaperEditDialog paper={editingPaper} fields={allFields.length ? allFields : field ? [field] : []} open={Boolean(editingPaper)} onClose={() => setEditingPaper(null)} onUpdated={() => { void loadPapers(); fetchFields().then(setAllFields).catch(() => setAllFields([])); }} />
    </Container>
  );
}
