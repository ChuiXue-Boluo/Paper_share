import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import FieldDetailPage from './pages/FieldDetailPage';
import NoteEditorPage from './pages/NoteEditorPage';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#0f766e' },
    background: { default: '#f6f7fb' }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fields/:fieldId" element={<FieldDetailPage />} />
            <Route path="/papers/:paperId/notes" element={<NoteEditorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
