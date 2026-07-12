import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Typography } from '@mui/material';
import type { SaveStatus } from '../../types';
import { formatDate } from '../../utils/format';

export default function SaveStatusBar({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt?: string }) {
  const icon = status === 'error' ? <ErrorOutlineIcon color="error" fontSize="small" /> : status === 'saving' ? <SyncIcon color="primary" fontSize="small" /> : <CheckCircleOutlineIcon color="success" fontSize="small" />;
  const text = status === 'editing' ? '正在编辑' : status === 'saving' ? '保存中' : status === 'error' ? '保存失败' : '已自动保存';
  return (
    <Box className="flex items-center gap-2 border border-gray-200 bg-white rounded-md px-3 py-2">
      {icon}
      <Typography variant="body2" color="text.secondary">{text}{lastSavedAt ? ` · ${formatDate(lastSavedAt)}` : ''}</Typography>
    </Box>
  );
}
