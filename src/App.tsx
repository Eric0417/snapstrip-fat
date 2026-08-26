import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LanguageProvider } from './i18n/LanguageContext';
import { AboutPage } from './pages/AboutPage';
import { CapturePage } from './pages/CapturePage';
import { EditorPage } from './pages/EditorPage';
import { HomePage } from './pages/HomePage';
import { LayoutPage } from './pages/LayoutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/layout" element={<LayoutPage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </LanguageProvider>
  );
}
