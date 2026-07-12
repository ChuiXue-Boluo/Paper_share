import { Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container maxWidth="lg" className="py-5">
        <Typography variant="body2" color="text.secondary">PaperShare © 2026 实验室论文共享平台</Typography>
      </Container>
    </footer>
  );
}
