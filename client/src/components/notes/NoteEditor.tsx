import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Alert, Box, Button, Tooltip } from '@mui/material';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useRef, useState } from 'react';
import { uploadNoteImage } from '../../api/notes';

interface Props {
  paperId: string | number;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export default function NoteEditor({ paperId, value, onBlur, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');

  async function handleImage(file?: File) {
    if (!file) return;
    setError('');
    try {
      const { url } = await uploadNoteImage(paperId, file);
      onChange(`${value}\n\n![${file.name}](${url})\n`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败');
    }
  }

  const imageCommand = {
    name: 'imageUpload',
    keyCommand: 'imageUpload',
    buttonProps: { 'aria-label': '插入图片' },
    icon: (
      <Tooltip title="插入图片">
        <ImageOutlinedIcon fontSize="small" />
      </Tooltip>
    ),
    execute: () => inputRef.current?.click()
  };

  return (
    <Box data-color-mode="light">
      {error ? <Alert severity="error" className="mb-3">{error}</Alert> : null}
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => void handleImage(event.target.files?.[0])} />
      <MDEditor
        value={value}
        onChange={(next) => onChange(next || '')}
        onBlur={onBlur}
        preview="live"
        height={560}
        commands={[commands.bold, commands.title1, commands.title2, commands.title3, imageCommand, commands.divider, commands.codeEdit, commands.codeLive]}
      />
      <Box className="mt-3 flex justify-end">
        <Button size="small" variant="outlined" onClick={onBlur}>立即保存</Button>
      </Box>
    </Box>
  );
}
