import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/Layout'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Contacts = lazy(() => import('./pages/Contacts'))
const Deals = lazy(() => import('./pages/Deals'))
const Pipeline = lazy(() => import('./pages/Pipeline'))
const Activities = lazy(() => import('./pages/Activities'))
const ContactDetail = lazy(() => import('./pages/ContactDetail'))

function OAuthCallback() {
  const { checkAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth().then(() => navigate('/', { replace: true }))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-glassfin-neutral dark:bg-[#0a1a15]">
      <div className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">Signing in...</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold text-glassfin-secondary/20 dark:text-glassfin-neutral/20 mb-4">404</h1>
      <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mb-6">Page not found</p>
      <a href="/" className="text-sm font-medium text-glassfin-primary hover:underline">
        Go to Dashboard
      </a>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-glassfin-neutral dark:bg-[#0a1a15]">
        <div className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[100dvh] bg-glassfin-neutral dark:bg-[#0a1a15]">
          <div className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">Loading...</div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="deals" element={<Deals />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="activities" element={<Activities />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

export default App
