import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Button, CircularProgress, Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { createField, fetchFields } from '../api/fields';
import FieldCard from '../components/fields/FieldCard';
import PaperUploadDialog from '../components/papers/PaperUploadDialog';
import type { Field } from '../types';

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFields() {
    setLoading(true);
    setError('');
    try {
      setFields(await fetchFields());
    } catch (err) {
      setError(err instanceof Error ? err.message : '领域加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function addQuickField() {
    const name = window.prompt('输入新研究领域名称');
    if (!name?.trim()) return;
    await createField({ name: name.trim(), description: '新创建的研究领域' });
    await loadFields();
  }

  useEffect(() => {
    void loadFields();
  }, []);

  const totalPapers = fields.reduce((sum, field) => sum + field.paperCount, 0);
  const normalizedQuery = normalizeSearchText(query);
  const filteredFields = normalizedQuery
    ? fields.filter((field) => fieldMatchesQuery(field, normalizedQuery))
    : fields;

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <Box className="flex-1">
          <Typography variant="h4" fontWeight={900}>研究领域</Typography>
          <Typography color="text.secondary" className="mt-1">共 {fields.length} 个领域 · {totalPapers} 篇论文</Typography>
        </Box>
        <Box className="flex gap-2">
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => void addQuickField()}>创建领域</Button>
          <Button variant="contained" onClick={() => setUploadOpen(true)}>上传论文</Button>
        </Box>
      </Box>
      <Box className="max-w-2xl mx-auto mb-6">
        <TextField
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索研究领域，例如 agent、safe、rag"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton aria-label="清空搜索" edge="end" onClick={() => setQuery('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        <Typography variant="body2" color="text.secondary" className="mt-2 text-center">
          {normalizedQuery ? `找到 ${filteredFields.length} 个匹配领域` : '按领域名称或描述模糊搜索'}
        </Typography>
      </Box>
      {error ? <Alert severity="error" className="mb-4">{error}</Alert> : null}
      {loading ? (
        <Box className="py-20 text-center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFields.map((field) => (
            <Grid item xs={12} sm={6} md={4} key={field.id}>
              <FieldCard field={field} />
            </Grid>
          ))}
          {!fields.length ? (
            <Grid item xs={12}>
              <Alert severity="info">暂无领域，可先创建领域或运行种子数据。</Alert>
            </Grid>
          ) : null}
          {fields.length > 0 && !filteredFields.length ? (
            <Grid item xs={12}>
              <Alert severity="info">没有匹配 “{query.trim()}” 的研究领域。</Alert>
            </Grid>
          ) : null}
        </Grid>
      )}
      <PaperUploadDialog fields={fields} open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => void loadFields()} />
    </Container>
  );
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, '');
}

function fieldMatchesQuery(field: Field, normalizedQuery: string) {
  const name = normalizeSearchText(field.name);
  const acronym = field.name.split(/\s+/).map((part) => part[0]).join('').toLowerCase();
  const descriptionTokens = field.description
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return name.includes(normalizedQuery)
    || acronym.includes(normalizedQuery)
    || descriptionTokens.some((token) => token.includes(normalizedQuery));
}
