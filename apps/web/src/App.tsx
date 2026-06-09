import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './routes/index';
import { DocumentNewPage } from './routes/documents/document-new.page';
import { DocumentsPage } from './routes/documents/documents.page';
import { TemplatesPage } from './routes/templates.page';
import { ContactsPage } from './routes/contacts.page';
import { ProfilePage } from './routes/profile.page';
import { BackupPage } from './routes/backup.page';
import { SettingsPage } from './routes/settings.page';
import { ComingSoonPage } from './components/ComingSoonPage';
import { BatchPage } from './routes/batch.page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="documents/new/:templateId" element={<DocumentNewPage />} />
          <Route path="batch/:templateId" element={<BatchPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ComingSoonPage title="Halaman Tidak Ditemukan" description="Halaman yang Anda cari tidak ada." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
