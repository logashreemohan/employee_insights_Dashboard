import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import List from './pages/List'
import Details from './pages/Details'
import Result from './pages/Result'
// global.css is imported via index.css in main.jsx

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* top navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Employee Insights
              </h1>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  Logged in as <strong className="text-gray-700">{user?.username || 'user'}</strong>
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* page content */}
      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/list" replace />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details/:id"
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
