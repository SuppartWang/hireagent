import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ExportModal } from './components/export/ExportModal'
import { HomePage } from './pages/Home'
import { MarketplacePage } from './pages/Marketplace'
import { AgentDetailPage } from './pages/AgentDetail'
import { AgentUploadPage } from './pages/AgentUpload'
import { UserProfilePage } from './pages/UserProfile'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { TryAgentPage } from './pages/TryAgent'
import { PublicProfilePage } from './pages/PublicProfile'
import { AdminPage } from './pages/Admin'
import { NotFoundPage } from './pages/NotFound'
import { useUIStore } from './store/uiStore'

export default function App() {
  const { exportModal, closeExportModal } = useUIStore()

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/agents/:slug" element={<AgentDetailPage />} />
          <Route path="/upload" element={<AgentUploadPage />} />
          <Route path="/edit/:slug" element={<AgentUploadPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/try/:slug" element={<TryAgentPage />} />
          <Route path="/users/:username" element={<PublicProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {exportModal.open && exportModal.agentId && (
        <ExportModal
          agentId={exportModal.agentId}
          agentName={exportModal.agentName}
          onClose={closeExportModal}
        />
      )}
    </div>
  )
}
