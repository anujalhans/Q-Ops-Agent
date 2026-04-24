import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ExploreMorePage from './pages/ExploreMorePage'
import ToastList from './components/ToastList'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  message: string
  type: ToastType
}

const AUTH_KEY = 'qops-agent-auth'

function App() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, String(isAuthenticated))
  }, [isAuthenticated])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4200)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/')
  }

  const authRoutes = useMemo(
    () => ({
      login: {
        onSuccess: () => {
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
    <div className="min-h-screen bg-surface text-white">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onSuccess={authRoutes.login.onSuccess} addToast={addToast} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardPage onLogout={authRoutes.dashboard.onLogout} addToast={authRoutes.dashboard.addToast} />
            ) : (
              <Navigate to="/" replace />
            )
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
