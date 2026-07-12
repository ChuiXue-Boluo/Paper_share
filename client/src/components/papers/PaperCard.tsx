import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { paperDownloadUrl } from '../../api/papers';
import type { Paper } from '../../types';

export default function PaperCard({ paper, onEdit }: { paper: Paper; onEdit: (paper: Paper) => void }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box className="flex flex-col md:flex-row md:items-start gap-4">
          <Box className="flex-1 min-w-0">
            <Typography variant="h6" fontWeight={800} className="break-words">
              {paper.source ? `${paper.source}-${paper.title}` : paper.title}
            </Typography>
            <Box className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-gray-600">
              {paper.topic ? <Typography variant="body2" color="text.secondary">具体方向：{paper.topic}</Typography> : null}
              <Typography variant="body2" color="text.secondary">上传者：{paper.uploaderName || '未填写'}</Typography>
            </Box>
          </Box>
          <Box className="flex gap-2 shrink-0">
            <Button onClick={() => onEdit(paper)} startIcon={<EditOutlinedIcon />} variant="outlined">编辑</Button>
            <Button component="a" href={paperDownloadUrl(paper.id)} startIcon={<DownloadOutlinedIcon />} variant="outlined">下载</Button>
            <Button component={Link} to={`/papers/${paper.id}/notes`} startIcon={<EditNoteOutlinedIcon />} variant="contained">记笔记</Button>
          </Box>
        </Box>
        <Box className="mt-4 rounded-md bg-gray-50 border border-gray-100 p-4">
          <Typography variant="subtitle2" fontWeight={800}>论文概述:</Typography>
          <Typography variant="body2" color={paper.overviewPreview ? 'text.primary' : 'text.secondary'} className="line-clamp-3 mt-1">
            {paper.overviewPreview || '暂无概述'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
