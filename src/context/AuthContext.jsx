import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('authToken') !== null)

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser')
    return saved ? JSON.parse(saved) : null
  })

  function login(username, password) {
    if (username === 'testuser' && password === 'Test123') {
      localStorage.setItem('authToken', 'emp-insights-session-token')
      localStorage.setItem('authUser', JSON.stringify({ username, loggedInAt: Date.now() }))
      setUser({ username })
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
