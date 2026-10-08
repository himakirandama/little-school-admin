import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ivy_admin_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('ivy_admin_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('ivy_admin_user')
    }
  }, [user])

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || 'Invalid email or password' }
      }

      const loggedInUser = { email: data.email }
      setUser(loggedInUser)
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Unable to reach the server. Please try again.' }
    }
  }

  async function signup(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || 'Signup request failed.' }
      }

      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: 'Unable to reach the server. Please try again.' }
    }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

