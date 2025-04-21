import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { ChallengeList } from './components/challenges/ChallengeList'
import { CreateChallengeForm } from './components/challenges/CreateChallengeForm'
import { ChallengeTracker } from './components/challenges/ChallengeTracker'
import { AuthTabs } from './components/auth/AuthTabs'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout with navigation
function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-bold">28 Day Challenge</h1>

          {currentUser && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <Layout>
                <AuthTabs />
              </Layout>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChallengeList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/challenges/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateChallengeForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/challenges/:challengeId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChallengeTracker />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
