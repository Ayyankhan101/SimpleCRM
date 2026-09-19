import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
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
  const { checkAuth, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth().then(() => navigate('/', { replace: true }))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-zinc-50">
      <div className="text-sm text-zinc-400">Signing in...</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Page not found</p>
      <a href="/" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
        Go to Dashboard
      </a>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-zinc-50">
        <div className="text-sm text-zinc-400">Loading...</div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[100dvh] bg-zinc-50">
        <div className="text-sm text-zinc-400">Loading...</div>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
