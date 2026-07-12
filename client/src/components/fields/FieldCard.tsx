import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, Button, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { Field } from '../../types';

export default function FieldCard({ field }: { field: Field }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardActionArea component={Link} to={`/fields/${field.id}`} sx={{ height: '100%' }}>
        <CardContent className="h-full flex flex-col gap-4">
          <Box>
            <Typography variant="h6" fontWeight={800}>{field.name}</Typography>
            <Box className="flex items-center gap-1 mt-2 text-gray-600">
              <DescriptionOutlinedIcon fontSize="small" />
              <Typography variant="body2">{field.paperCount} 篇论文</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" className="line-clamp-3 min-h-[60px]">
            {field.description || '暂无领域描述'}
          </Typography>
          <Box className="mt-auto">
            <Button endIcon={<ArrowForwardIcon />} size="small">进入</Button>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
