import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ExportModal } from '@/components/export/ExportModal'
import { NotFoundPage } from '@/pages/NotFound'
import { useUIStore } from '@/store/uiStore'
import { Skeleton } from '@/components/ui/skeleton'

const HomePage = lazy(() => import('@/pages/Home').then(m => ({ default: m.HomePage })))
const MarketplacePage = lazy(() => import('@/pages/Marketplace').then(m => ({ default: m.MarketplacePage })))
const AgentDetailPage = lazy(() => import('@/pages/AgentDetail').then(m => ({ default: m.AgentDetailPage })))
const AgentUploadPage = lazy(() => import('@/pages/AgentUpload').then(m => ({ default: m.AgentUploadPage })))
const UserProfilePage = lazy(() => import('@/pages/UserProfile').then(m => ({ default: m.UserProfilePage })))
const LoginPage = lazy(() => import('@/pages/Login').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/Register').then(m => ({ default: m.RegisterPage })))
const TryAgentPage = lazy(() => import('@/pages/TryAgent').then(m => ({ default: m.TryAgentPage })))
const PublicProfilePage = lazy(() => import('@/pages/PublicProfile').then(m => ({ default: m.PublicProfilePage })))
const AdminPage = lazy(() => import('@/pages/Admin').then(m => ({ default: m.AdminPage })))

function GlobalSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-64" />
    </div>
  )
}

export default function App() {
  const { exportModal, closeExportModal } = useUIStore()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<GlobalSkeleton />}>
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
        </Suspense>
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
