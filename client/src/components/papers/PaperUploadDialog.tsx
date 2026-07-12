import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Alert, Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { fetchGlobalPaperOptions, fetchPaperOptions, uploadPaper } from '../../api/papers';
import type { Field } from '../../types';

interface Props {
  fieldId?: string | number | null;
  fields: Field[];
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export default function PaperUploadDialog({ fieldId = null, fields, open, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [topic, setTopic] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([]);
  const [venueOptions, setVenueOptions] = useState<string[]>([]);
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const currentField = fieldId ? fields.find((field) => String(field.id) === String(fieldId)) : null;
    setSelectedFieldIds(currentField ? [currentField.id] : []);
    const optionsRequest = fieldId ? fetchPaperOptions(fieldId) : fetchGlobalPaperOptions();
    optionsRequest
      .then((options) => {
        setVenueOptions(options.venues);
        setTopicOptions(options.topics);
      })
      .catch(() => {
        setVenueOptions([]);
        setTopicOptions([]);
      });
  }, [fieldId, fields, open]);

  function inferTitleFromFileName(fileName: string) {
    return fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    if (nextFile && !title.trim()) {
      setTitle(inferTitleFromFileName(nextFile.name));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!title.trim()) return setError('标题不能为空');
    if (!uploaderName.trim()) return setError('上传者不能为空');
    if (!selectedFieldIds.length) return setError('请至少选择一个所属领域');
    if (!file) return setError('请选择 PDF 文件');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return setError('仅支持 PDF 文件');
    const fieldIds = selectedFieldIds.filter((id) => fields.some((field) => field.id === id));
    if (fieldIds.length !== selectedFieldIds.length) return setError('所属领域只能从已有领域中选择');
    setSubmitting(true);
    try {
      await uploadPaper(fieldId, { title, source, topic, uploaderName, fieldIds, file });
      setTitle('');
      setSource('');
      setTopic('');
      setUploaderName('');
      setSelectedFieldIds([]);
      setFile(null);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>上传论文</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="标题" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <TextField label="上传者" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} required fullWidth />
          <FormControl fullWidth required>
            <InputLabel id="upload-field-label">所属领域</InputLabel>
            <Select
              labelId="upload-field-label"
              multiple
              value={selectedFieldIds}
              input={<OutlinedInput label="所属领域" />}
              renderValue={(selected) => fields.filter((field) => selected.includes(field.id)).map((field) => field.name).join('、')}
              onChange={(event) => setSelectedFieldIds(event.target.value as number[])}
            >
              {fields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  <Checkbox checked={selectedFieldIds.includes(field.id)} />
                  <ListItemText primary={field.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
            {file ? file.name : '选择 PDF'}
            <input hidden type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button type="submit" variant="contained" disabled={submitting}>{submitting ? '上传中' : '上传'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
