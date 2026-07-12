import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e5e7eb' }}>
      <Toolbar className="gap-4">
        <Box component={Link} to="/" className="flex items-center gap-2">
          <ArticleOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>PaperShare</Typography>
        </Box>
        <Button component={Link} to="/" startIcon={<HomeOutlinedIcon />} color="inherit">首页</Button>
        <Box className="flex-1" />
        <Button variant="outlined" size="small">访客模式</Button>
      </Toolbar>
    </AppBar>
  );
}
