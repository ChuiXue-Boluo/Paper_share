import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { fetchGlobalPaperOptions, updatePaper } from '../../api/papers';
import type { Field, Paper } from '../../types';

interface Props {
  paper: Paper | null;
  fields: Field[];
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PaperEditDialog({ paper, fields, open, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [topic, setTopic] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFieldNames, setSelectedFieldNames] = useState<string[]>([]);
  const [venueOptions, setVenueOptions] = useState<string[]>([]);
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!paper || !open) return;
    setTitle(paper.title);
    setSource(paper.source || '');
    setTopic(paper.topic || '');
    setUploaderName(paper.uploaderName || '');
    setSelectedFieldNames(paper.fieldNames?.length ? paper.fieldNames : paper.fieldName ? [paper.fieldName] : []);
    setError('');
    fetchGlobalPaperOptions()
      .then((options) => {
        setVenueOptions(options.venues);
        setTopicOptions(options.topics);
      })
      .catch(() => {
        setVenueOptions([]);
        setTopicOptions([]);
      });
  }, [open, paper]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!paper) return;
    setError('');
    if (!title.trim()) return setError('标题不能为空');
    if (!selectedFieldNames.length) return setError('请至少选择一个所属领域');
    const fieldIds = selectedFieldNames
      .map((name) => fields.find((field) => field.name.toLowerCase() === name.toLowerCase())?.id)
      .filter((id): id is number => Boolean(id));
    if (fieldIds.length !== selectedFieldNames.length) return setError('所属领域只能从已有领域中选择');
    setSubmitting(true);
    try {
      await updatePaper(paper.id, { title, source, topic, uploaderName, fieldIds });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>编辑论文信息</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="标题" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
          <TextField label="上传者" value={uploaderName} onChange={(event) => setUploaderName(event.target.value)} fullWidth />
          <Autocomplete
            multiple
            options={fields.map((field) => field.name)}
            value={selectedFieldNames}
            onChange={(_event, value) => setSelectedFieldNames([...new Set(value)])}
            renderInput={(params) => <TextField {...params} label="所属领域" placeholder="选择已有领域，可多选" required />}
          />
          <Autocomplete
            freeSolo
            options={venueOptions}
            value={source}
            onInputChange={(_event, value) => setSource(value)}
            renderInput={(params) => <TextField {...params} label="发表会议" placeholder="ACL 2026, ICLR 2026" />}
          />
          <Autocomplete
            freeSolo
            options={topicOptions}
            value={topic}
            onInputChange={(_event, value) => setTopic(value)}
            renderInput={(params) => <TextField {...params} label="具体方向" placeholder="credit assignment, planning" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button type="submit" variant="contained" disabled={submitting}>{submitting ? '保存中' : '保存'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
