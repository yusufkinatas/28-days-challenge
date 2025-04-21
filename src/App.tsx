import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from 'react-router-dom'
import { ChallengeList } from './components/challenges/ChallengeList'
import { CreateChallengeForm } from './components/challenges/CreateChallengeForm'
import { ChallengeTracker } from './components/challenges/ChallengeTracker'
import { EditChallengeForm } from './components/challenges/EditChallengeForm'
import { JoinChallenge } from './components/challenges/JoinChallenge'
import { UserProfileEditor } from './components/profile/UserProfileEditor'
import { AuthTabs } from './components/auth/AuthTabs'
import { AuthProvider, useAuth } from './context/AuthContext'
import { User, LogOut } from 'lucide-react'

// Layout with navigation
function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  // Function to get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname

    if (path === '/') return 'Dashboard'
    if (path === '/profile') return 'My Profile'
    if (path === '/challenges/new') return 'Create Challenge'
    if (path.startsWith('/challenges/')) return 'Challenge Details'
    if (path.startsWith('/join/')) return 'Join Challenge'

    return ''
  }

  const path = location.pathname
  const isChallengeDetailsPage = path.startsWith('/challenges/')
  const pageTitle = getPageTitle()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            28 Day Challenge
          </Link>

          {currentUser && (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {!isChallengeDetailsPage && currentUser && pageTitle && (
          <div className="mb-6 flex items-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-700">
              {pageTitle}
            </span>
          </div>
        )}
        {children}
      </main>
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfileEditor />
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

          <Route
            path="/challenges/:challengeId/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditChallengeForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/join/:challengeId"
            element={
              <ProtectedRoute>
                <Layout>
                  <JoinChallenge />
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
