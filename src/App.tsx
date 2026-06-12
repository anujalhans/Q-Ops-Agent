import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ExploreMorePage from './pages/ExploreMorePage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ToastList from './components/common/ToastList'
import { TransientAuthError, clearSession, getAuthCallbackType, getUsableSession, signInWithPassword, signOut } from './lib/auth'
import { fetchCurrentUser } from './lib/api'
import type { CurrentUser } from './lib/api'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  message: string
  type: ToastType
}

function App() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(localStorage.getItem('qops-agent-supabase-session')))
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const authCallbackType = getAuthCallbackType(window.location.hash)
  const hasAuthCallbackHash = window.location.hash.includes('access_token=') && ['invite', 'recovery'].includes(authCallbackType)

  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      if (hasAuthCallbackHash) {
        if (!cancelled) setAuthReady(true)
        return
      }

      try {
        const session = await getUsableSession()
        if (!session) {
          if (!cancelled) {
            setIsAuthenticated(false)
            setCurrentUser(null)
            setAuthReady(true)
          }
          return
        }

        const user = await fetchCurrentUser()
        if (cancelled) return
        if (user?.status === 'active') {
          setCurrentUser(user)
          setIsAuthenticated(true)
        } else {
          clearSession()
          setCurrentUser(null)
          setIsAuthenticated(false)
        }
        setAuthReady(true)
      } catch (error) {
        if (cancelled) return
        if (error instanceof TransientAuthError) {
          setIsAuthenticated(Boolean(localStorage.getItem('qops-agent-supabase-session')))
          addToast({ title: 'Session check delayed', message: error.message, type: 'info' })
        } else {
          clearSession()
          setCurrentUser(null)
          setIsAuthenticated(false)
        }
        setAuthReady(true)
      }
    }
    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4200)
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentUser(null)
    setIsAuthenticated(false)
    navigate('/')
  }

  const authRoutes = useMemo(
    () => ({
      login: {
        onSuccess: async (email: string, password: string) => {
          await signInWithPassword(email, password)
          const user = await fetchCurrentUser()
          if (!user?.id || user.status !== 'active') {
            clearSession()
            throw new Error('Your account is not active in Q-Ops Agent.')
          }
          setCurrentUser(user)
          setIsAuthenticated(true)
          navigate('/dashboard')
        },
      },
      dashboard: {
        onLogout: handleLogout,
        isAuthenticated,
        addToast,
      },
    }),
    [isAuthenticated],
  )

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Routes>
        <Route
          path="/"
          element={
            hasAuthCallbackHash ? (
              <Navigate to={{ pathname: '/auth/callback', hash: window.location.hash }} replace />
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onSuccess={authRoutes.login.onSuccess} addToast={addToast} authReady={authReady} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardPage onLogout={authRoutes.dashboard.onLogout} addToast={authRoutes.dashboard.addToast} currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/auth/callback"
          element={
            <AuthCallbackPage
              addToast={addToast}
              onAuthenticated={(user) => {
                setCurrentUser(user)
                setIsAuthenticated(true)
              }}
            />
          }
        />
        <Route path="/explore" element={<ExploreMorePage />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
      </Routes>
      <ToastList toasts={toasts} />
    </div>
  )
}

export default App
