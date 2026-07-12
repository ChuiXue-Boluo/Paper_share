import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchNote, saveNote } from '../api/notes';
import { fetchPaper, paperDownloadUrl } from '../api/papers';
import NoteEditor from '../components/notes/NoteEditor';
import SaveStatusBar from '../components/notes/SaveStatusBar';
import { useAutoSave } from '../hooks/useAutoSave';
import type { Note, Paper } from '../types';

export default function NoteEditorPage() {
  const { paperId = '' } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [paperData, noteData] = await Promise.all([fetchPaper(paperId), fetchNote(paperId)]);
        setPaper(paperData);
        setNote(noteData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '笔记加载失败');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [paperId]);

  const save = useCallback((content: string) => saveNote(paperId, content), [paperId]);
  const autoSave = useAutoSave({ initialContent: note?.content || '', save });

  if (loading) {
    return <Box className="py-24 text-center"><CircularProgress /></Box>;
  }

  if (error || !paper || !note) {
    return <Container maxWidth="md" className="py-8"><Alert severity="error">{error || '笔记不存在'}</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Button component={Link} to={`/fields/${paper.fieldId}`} startIcon={<ArrowBackIcon />} className="mb-4">返回列表</Button>
      <Box className="flex flex-col md:flex-row md:items-start gap-4 mb-5">
        <Box className="flex-1 min-w-0">
          <Typography variant="h4" fontWeight={900} className="break-words">
            {paper.source ? `${paper.source}-${paper.title}` : paper.title}
          </Typography>
          <Typography color="text.secondary" className="mt-2">
            {[paper.fieldNames?.length ? paper.fieldNames.join('、') : paper.fieldName, paper.topic ? `具体方向：${paper.topic}` : '', `上传者：${paper.uploaderName || '未填写'}`].filter(Boolean).join(' | ')}
          </Typography>
        </Box>
        <Button component="a" href={paperDownloadUrl(paper.id)} startIcon={<DownloadOutlinedIcon />} variant="outlined">下载 PDF</Button>
      </Box>
      <NoteEditor paperId={paperId} value={autoSave.content} onChange={autoSave.setContent} onBlur={() => void autoSave.flush()} />
      <Box className="mt-4">
        <SaveStatusBar status={autoSave.status} lastSavedAt={autoSave.lastSavedAt || note.lastEditedAt} />
      </Box>
    </Container>
  );
}
